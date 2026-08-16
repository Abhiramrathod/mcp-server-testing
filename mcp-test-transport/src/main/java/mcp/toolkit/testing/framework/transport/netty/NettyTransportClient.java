package mcp.toolkit.testing.framework.transport.netty;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.DefaultFullHttpRequest;
import io.netty.handler.codec.http.HttpClientCodec;
import io.netty.handler.codec.http.HttpContentDecompressor;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.handler.proxy.HttpProxyHandler;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.interfaces.McpTransportClient;

import javax.net.ssl.TrustManagerFactory;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicReference;

/**
 * {@link McpTransportClient} backed by Netty (HTTP/1.1 over TCP or TLS) with
 * keep-alive connection reuse.
 *
 * <p>Connections are pooled per {@code host:port} and reused for sequential
 * exchanges; when every pooled connection is busy a new one is opened. This
 * avoids the per-request TCP handshake that dominated the initial Netty
 * implementation, while the shared, daemon-threaded event loop group keeps the
 * thread count low even under concurrency.
 *
 * <p>The public {@link McpTransportClient} contract is unchanged: synchronous
 * exchanges surface I/O failures and timeouts as {@link IllegalStateException},
 * streams resolve with headers first and feed the body line by line, and
 * HTTP-level concerns stay with the transports.
 *
 * <p>This implementation is HTTP/1.1 only. Like the JDK client it replaced, it
 * does not follow redirects or negotiate HTTP/2; MCP servers implement HTTP/1.1.
 */
public final class NettyTransportClient implements McpTransportClient {

    private static final int DEFAULT_PORT_HTTP = 80;
    private static final int DEFAULT_PORT_HTTPS = 443;
    private static final int MAX_IDLE_CONNECTIONS = 8;
    private static final String HANDLER_NAME = "mcp";

    private static final EventLoopGroup EVENT_LOOP_GROUP = newEventLoopGroup();
    private static final SslContext SSL_CONTEXT = newSslContext();

    private final Duration timeout;
    private final InetSocketAddress proxyAddress;
    private final ConcurrentHashMap<String, LinkedBlockingDeque<Channel>> idleChannels = new ConcurrentHashMap<>();

    /**
     * Creates a client that applies {@code timeout} to connection attempts and
     * to synchronous exchanges, connecting directly to the target host.
     *
     * @param timeout connection and request timeout
     */
    public NettyTransportClient(Duration timeout) {
        this(timeout, null);
    }

    /**
     * Creates a client that applies {@code timeout} to connection attempts and
     * to synchronous exchanges, optionally routing traffic through an HTTP
     * proxy (CONNECT tunneling).
     *
     * @param timeout connection and request timeout
     * @param proxy   HTTP proxy to tunnel through, or {@code null} for a direct
     *                connection
     */
    public NettyTransportClient(Duration timeout, Proxy proxy) {
        this.timeout = McpValidation.requireNonNull(timeout, "timeout");
        this.proxyAddress = resolveProxyAddress(proxy);
    }

    @Override
    public McpResponse send(URI uri, Map<String, String> headers, String payload) {
        return execute(uri, headers, "POST", payload, true);
    }

    @Override
    public McpResponse sendAsText(URI uri, Map<String, String> headers, String payload) {
        return execute(uri, headers, "POST", payload, false);
    }

    @Override
    public CompletableFuture<McpResponse> openStream(URI uri, Map<String, String> headers) {
        McpValidation.requireNonNull(uri, "uri");
        McpValidation.requireNonNull(headers, "headers");
        return executeAsync(uri, headers, "GET", null, true);
    }

    @Override
    public McpResponse closeSession(URI uri, Map<String, String> headers) {
        return execute(uri, headers, "DELETE", null, false);
    }

    @Override
    public void close() {
        idleChannels.values().forEach(deque -> {
            Channel channel;
            while ((channel = deque.poll()) != null) {
                channel.close();
            }
        });
        idleChannels.clear();
    }

    private McpResponse execute(URI uri, Map<String, String> headers, String method,
                                String payload, boolean streamBody) {
        CompletableFuture<McpResponse> future = executeAsync(uri, headers, method, payload, streamBody);
        try {
            return future.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException ex) {
            future.cancel(true);
            throw new IllegalStateException("Failed to send " + method + " request to " + uri
                    + ": timed out after " + timeout.toMillis() + "ms", ex);
        } catch (ExecutionException ex) {
            Throwable cause = ex.getCause() == null ? ex : ex.getCause();
            throw new IllegalStateException("Failed to send " + method + " request to " + uri, cause);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while sending " + method + " request to " + uri, ex);
        }
    }

    private CompletableFuture<McpResponse> executeAsync(URI uri, Map<String, String> headers,
                                                        String method, String payload,
                                                        boolean streamBody) {
        McpValidation.requireNonNull(uri, "uri");
        McpValidation.requireNonNull(headers, "headers");

        String scheme = uri.getScheme() == null ? "http" : uri.getScheme().toLowerCase();
        boolean secure = "https".equals(scheme);
        if (!secure && !"http".equals(scheme)) {
            throw new IllegalArgumentException("Unsupported URI scheme: " + scheme);
        }
        String host = uri.getHost();
        if (host == null) {
            throw new IllegalArgumentException("URI must specify a host: " + uri);
        }
        int port = uri.getPort() > 0 ? uri.getPort() : (secure ? DEFAULT_PORT_HTTPS : DEFAULT_PORT_HTTP);
        String poolKey = scheme + "://" + host + ":" + port;

        CompletableFuture<NettyHttpResponse> rawFuture = new CompletableFuture<>();
        PendingExchange exchange = new PendingExchange(rawFuture, streamBody);
        AtomicReference<Channel> channelRef = new AtomicReference<>();

        CompletableFuture<McpResponse> result = new CompletableFuture<>();
        result.whenComplete((r, t) -> {
            if (result.isCancelled()) {
                Channel channel = channelRef.get();
                if (channel != null) {
                    channel.close();
                }
                rawFuture.cancel(false);
            }
        });
        rawFuture.whenComplete((r, t) -> {
            if (t == null) {
                result.complete(r);
            } else {
                result.completeExceptionally(t);
            }
        });

        Channel channel = acquire(exchange, poolKey, channelRef);
        if (channel != null) {
            writeRequest(channel, exchange, uri, headers, method, payload);
        } else {
            connectNew(exchange, poolKey, channelRef, uri, headers, method, payload, secure, host, port);
        }
        return result;
    }

    private Channel acquire(PendingExchange exchange, String poolKey, AtomicReference<Channel> channelRef) {
        LinkedBlockingDeque<Channel> deque = idleChannels.get(poolKey);
        if (deque == null) {
            return null;
        }
        Channel channel;
        while ((channel = deque.poll()) != null) {
            if (!channel.isActive()) {
                channel.close();
                continue;
            }
            PooledHttpHandler handler = (PooledHttpHandler) channel.pipeline().get(HANDLER_NAME);
            if (handler != null && handler.acquire(exchange)) {
                channelRef.set(channel);
                return channel;
            }
        }
        return null;
    }

    private void connectNew(PendingExchange exchange, String poolKey, AtomicReference<Channel> channelRef,
                            URI uri, Map<String, String> headers, String method, String payload,
                            boolean secure, String host, int port) {
        Bootstrap bootstrap = new Bootstrap()
                .group(EVENT_LOOP_GROUP)
                .channel(NioSocketChannel.class)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS,
                        (int) Math.min(timeout.toMillis(), Integer.MAX_VALUE))
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) {
                        if (proxyAddress != null) {
                            ch.pipeline().addLast("proxy", new HttpProxyHandler(proxyAddress));
                        }
                        if (secure) {
                            ch.pipeline().addLast("ssl", SSL_CONTEXT.newHandler(ch.alloc(), host, port));
                        }
                        ch.pipeline().addLast("http", new HttpClientCodec());
                        ch.pipeline().addLast("decompressor", new HttpContentDecompressor());
                        ch.pipeline().addLast(HANDLER_NAME, new PooledHttpHandler(NettyTransportClient.this, poolKey));
                    }
                });

        ChannelFuture connectFuture = bootstrap.connect(host, port);
        connectFuture.addListener(f -> {
            if (f.isSuccess()) {
                if (exchange.isCancelled()) {
                    connectFuture.channel().close();
                    return;
                }
                Channel channel = connectFuture.channel();
                PooledHttpHandler handler = (PooledHttpHandler) channel.pipeline().get(HANDLER_NAME);
                channelRef.set(channel);
                if (!handler.acquire(exchange)) {
                    exchange.onException(new IllegalStateException("Channel was unexpectedly busy"));
                    channel.close();
                    return;
                }
                writeRequest(channel, exchange, uri, headers, method, payload);
            } else {
                Throwable cause = f.cause() == null
                        ? new IllegalStateException("Connection failed to " + uri)
                        : f.cause();
                exchange.onException(cause);
            }
        });
    }

    private static void writeRequest(Channel channel, PendingExchange exchange, URI uri,
                                     Map<String, String> headers, String method, String payload) {
        HttpRequest request = buildRequest(uri, headers, method, payload);
        channel.writeAndFlush(request).addListener(f -> {
            if (!f.isSuccess()) {
                Throwable cause = f.cause() == null
                        ? new IllegalStateException("Failed to write request to " + uri)
                        : f.cause();
                exchange.onException(cause);
                channel.close();
            }
        });
    }

    void release(String poolKey, Channel channel) {
        LinkedBlockingDeque<Channel> deque =
                idleChannels.computeIfAbsent(poolKey, k -> new LinkedBlockingDeque<>());
        if (deque.size() < MAX_IDLE_CONNECTIONS) {
            deque.offerLast(channel);
        } else {
            channel.close();
        }
    }

    void evict(String poolKey, Channel channel) {
        LinkedBlockingDeque<Channel> deque = idleChannels.get(poolKey);
        if (deque != null) {
            deque.remove(channel);
        }
    }

    private static HttpRequest buildRequest(URI uri, Map<String, String> headers,
                                            String method, String payload) {
        String rawPath = uri.getRawPath();
        String path = (rawPath == null || rawPath.isEmpty()) ? "/" : rawPath;
        if (uri.getRawQuery() != null) {
            path += "?" + uri.getRawQuery();
        }

        HttpMethod httpMethod = switch (method) {
            case "POST" -> HttpMethod.POST;
            case "DELETE" -> HttpMethod.DELETE;
            default -> HttpMethod.GET;
        };

        HttpRequest request;
        if (payload != null) {
            ByteBuf content = Unpooled.copiedBuffer(payload, StandardCharsets.UTF_8);
            request = new DefaultFullHttpRequest(HttpVersion.HTTP_1_1, httpMethod, path, content);
            request.headers().set(HttpHeaderNames.CONTENT_LENGTH, content.readableBytes());
        } else {
            request = new DefaultFullHttpRequest(
                    HttpVersion.HTTP_1_1, httpMethod, path, Unpooled.EMPTY_BUFFER);
        }

        if (headers != null) {
            headers.forEach(request.headers()::set);
        }
        request.headers().set(HttpHeaderNames.HOST, hostHeader(uri));
        return request;
    }

    private static String hostHeader(URI uri) {
        String host = uri.getHost();
        int port = uri.getPort();
        boolean secure = "https".equalsIgnoreCase(uri.getScheme());
        if (port > 0 && port != (secure ? DEFAULT_PORT_HTTPS : DEFAULT_PORT_HTTP)) {
            return host + ":" + port;
        }
        return host;
    }

    private static EventLoopGroup newEventLoopGroup() {
        ThreadFactory threadFactory = r -> {
            Thread thread = new Thread(r, "mcp-netty-client");
            thread.setDaemon(true);
            return thread;
        };
        return new NioEventLoopGroup(0, threadFactory);
    }

    private static InetSocketAddress resolveProxyAddress(Proxy proxy) {
        if (proxy == null) {
            return null;
        }
        if (proxy.type() != Proxy.Type.HTTP) {
            throw new IllegalArgumentException(
                    "Only HTTP proxies are supported, got: " + proxy.type());
        }
        return (InetSocketAddress) proxy.address();
    }

    private static SslContext newSslContext() {
        try {
            TrustManagerFactory factory =
                    TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            factory.init((KeyStore) null);
            return SslContextBuilder.forClient().trustManager(factory).build();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to initialize the default SSL context", ex);
        }
    }
}
