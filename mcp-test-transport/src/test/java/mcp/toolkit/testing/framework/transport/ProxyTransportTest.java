package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.transport.jdk.JdkTransportClient;
import mcp.toolkit.testing.framework.transport.netty.NettyTransportClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifies optional HTTP proxy support in both {@link NettyTransportClient} and
 * {@link JdkTransportClient} by routing real traffic through a minimal CONNECT
 * proxy that tunnels to a local HTTP target.
 *
 * <p>The Netty client tunnels via CONNECT; the JDK client reaches an {@code http}
 * target through the proxy using absolute-form requests (CONNECT is only used
 * for {@code https} targets). The test proxy accepts both request shapes.
 */
class ProxyTransportTest {

    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private final ExecutorService executor = Executors.newCachedThreadPool(r -> {
        Thread thread = new Thread(r);
        thread.setDaemon(true);
        return thread;
    });

    private ConnectProxy proxy;
    private TargetServer target;
    private AutoCloseable client;

    @AfterEach
    void tearDown() throws Exception {
        if (client != null) {
            client.close();
        }
        if (proxy != null) {
            proxy.close();
        }
        if (target != null) {
            target.close();
        }
        executor.shutdownNow();
    }

    @Test
    void nettyClientRoutesThroughHttpProxy() throws Exception {
        startServers();
        client = new NettyTransportClient(TIMEOUT, proxyAddress());

        McpResponse response = ((NettyTransportClient) client).send(
                targetUri("/echo"), Map.of("Content-Type", "application/json"), "{}");

        assertEquals(200, response.statusCode());
        assertEquals(List.of("{\"result\":\"ok\"}"), response.bodyLines().collect(Collectors.toList()));
        assertTrue(proxy.connectionCount() >= 1, "expected the proxy to be used");
    }

    @Test
    void jdkClientRoutesThroughHttpProxy() throws Exception {
        startServers();
        client = new JdkTransportClient(TIMEOUT, proxyAddress());

        McpResponse response = ((JdkTransportClient) client).send(
                targetUri("/echo"), Map.of("Content-Type", "application/json"), "{}");

        assertEquals(200, response.statusCode());
        assertEquals(List.of("{\"result\":\"ok\"}"), response.bodyLines().collect(Collectors.toList()));
        assertTrue(proxy.connectionCount() >= 1, "expected the proxy to be used");
    }

    @Test
    void withoutProxyBothClientsConnectDirectly() throws Exception {
        startServers();

        try (NettyTransportClient netty = new NettyTransportClient(TIMEOUT)) {
            assertEquals(200, netty.send(targetUri("/echo"), Map.of(), "{}").statusCode());
        }
        try (JdkTransportClient jdk = new JdkTransportClient(TIMEOUT)) {
            assertEquals(200, jdk.send(targetUri("/echo"), Map.of(), "{}").statusCode());
        }
        assertEquals(0, proxy.connectionCount(), "no proxy traffic expected");
    }

    @Test
    void rejectsNonHttpProxies() {
        Proxy socks = new Proxy(Proxy.Type.SOCKS, new InetSocketAddress("socks.corp", 1080));
        assertThrows(IllegalArgumentException.class, () -> new NettyTransportClient(TIMEOUT, socks));
        assertThrows(IllegalArgumentException.class, () -> new JdkTransportClient(TIMEOUT, socks));
        assertThrows(IllegalArgumentException.class, () -> new NettyTransportClient(TIMEOUT, Proxy.NO_PROXY));
        assertThrows(IllegalArgumentException.class, () -> new JdkTransportClient(TIMEOUT, Proxy.NO_PROXY));
    }

    private void startServers() throws IOException {
        target = new TargetServer();
        proxy = new ConnectProxy();
    }

    private Proxy proxyAddress() {
        return new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", proxy.port()));
    }

    private URI targetUri(String path) {
        return URI.create("http://127.0.0.1:" + target.port() + path);
    }

    /**
     * Minimal HTTP/1.1 CONNECT proxy. Accepts raw client sockets, establishes a
     * tunnel to the requested host and pumps bytes in both directions.
     */
    private final class ConnectProxy implements AutoCloseable {

        private final ServerSocket listener;
        private final AtomicInteger connections = new AtomicInteger();
        private final ConcurrentLinkedQueue<Socket> sockets = new ConcurrentLinkedQueue<>();
        private volatile boolean running = true;

        ConnectProxy() throws IOException {
            listener = new ServerSocket(0, 50);
            executor.submit(this::acceptLoop);
        }

        int port() {
            return listener.getLocalPort();
        }

        int connectionCount() {
            return connections.get();
        }

        private void acceptLoop() {
            while (running) {
                try {
                    Socket socket = listener.accept();
                    sockets.add(socket);
                    connections.incrementAndGet();
                    executor.submit(() -> tunnel(socket));
                } catch (IOException e) {
                    if (running) {
                        throw new IllegalStateException("proxy accept failed", e);
                    }
                }
            }
        }

        private void tunnel(Socket client) {
            try {
                InputStream in = client.getInputStream();
                OutputStream out = client.getOutputStream();
                String requestLine = readLine(in);
                if (requestLine == null) {
                    client.close();
                    return;
                }
                String[] parts = requestLine.split(" ");
                if (parts.length < 2) {
                    client.close();
                    return;
                }
                String method = parts[0];
                String targetHost;
                int targetPort;
                if ("CONNECT".equals(method)) {
                    int colon = parts[1].lastIndexOf(':');
                    targetHost = parts[1].substring(0, colon);
                    targetPort = Integer.parseInt(parts[1].substring(colon + 1));
                } else {
                    URI uri = URI.create(parts[1]);
                    targetHost = uri.getHost();
                    targetPort = uri.getPort();
                }

                Socket remote = new Socket();
                sockets.add(remote);
                remote.connect(new InetSocketAddress(targetHost, targetPort), 5000);
                OutputStream remoteOut = remote.getOutputStream();

                if ("CONNECT".equals(method)) {
                    String header;
                    while ((header = readLine(in)) != null && !header.isEmpty()) {
                        // drain CONNECT request headers
                    }
                    out.write("HTTP/1.1 200 Connection Established\r\n\r\n"
                            .getBytes(StandardCharsets.US_ASCII));
                    out.flush();
                } else {
                    remoteOut.write((requestLine + "\r\n").getBytes(StandardCharsets.US_ASCII));
                    String header;
                    while ((header = readLine(in)) != null && !header.isEmpty()) {
                        remoteOut.write((header + "\r\n").getBytes(StandardCharsets.US_ASCII));
                    }
                    remoteOut.write("\r\n".getBytes(StandardCharsets.US_ASCII));
                    remoteOut.flush();
                }

                CompletableFuture.runAsync(() -> pump(client, remoteOut), executor);
                CompletableFuture.runAsync(() -> pump(remote, out), executor);
            } catch (IOException e) {
                // best-effort test proxy
            }
        }

        @Override
        public void close() throws IOException {
            running = false;
            listener.close();
            sockets.forEach(socket -> {
                try {
                    socket.close();
                } catch (IOException ignored) {
                    // closing
                }
            });
        }
    }

    /**
     * Raw HTTP target that answers any request with a fixed JSON body.
     */
    private final class TargetServer implements AutoCloseable {

        private final ServerSocket listener;
        private volatile boolean running = true;

        TargetServer() throws IOException {
            listener = new ServerSocket(0, 50);
            executor.submit(this::acceptLoop);
        }

        int port() {
            return listener.getLocalPort();
        }

        private void acceptLoop() {
            while (running) {
                try (Socket socket = listener.accept()) {
                    respond(socket);
                } catch (IOException e) {
                    if (running) {
                        throw new IllegalStateException("target accept failed", e);
                    }
                }
            }
        }

        private void respond(Socket socket) throws IOException {
            InputStream in = socket.getInputStream();
            int[] tail = new int[4];
            int index = 0;
            int b;
            while ((b = in.read()) != -1) {
                tail[index % 4] = b;
                index++;
                if (index >= 4 && tail[(index - 1) % 4] == '\n' && tail[(index - 2) % 4] == '\r'
                        && tail[(index - 3) % 4] == '\n' && tail[(index - 4) % 4] == '\r') {
                    break;
                }
            }
            byte[] body = "{\"result\":\"ok\"}".getBytes(StandardCharsets.UTF_8);
            String response = "HTTP/1.1 200 OK\r\n"
                    + "Content-Type: application/json\r\n"
                    + "Content-Length: " + body.length + "\r\n"
                    + "\r\n"
                    + "{\"result\":\"ok\"}";
            socket.getOutputStream().write(response.getBytes(StandardCharsets.UTF_8));
            socket.getOutputStream().flush();
            socket.close();
        }

        @Override
        public void close() throws IOException {
            running = false;
            listener.close();
        }
    }

    private static String readLine(InputStream in) throws IOException {
        ByteArrayOutputStream line = new ByteArrayOutputStream();
        int b;
        while ((b = in.read()) != -1 && b != '\n') {
            line.write(b);
        }
        if (b == -1 && line.size() == 0) {
            return null;
        }
        String value = line.toString(StandardCharsets.US_ASCII);
        return value.endsWith("\r") ? value.substring(0, value.length() - 1) : value;
    }

    private static void pump(Socket from, OutputStream to) {
        try {
            InputStream in = from.getInputStream();
            byte[] buffer = new byte[8192];
            int n;
            while ((n = in.read(buffer)) != -1) {
                to.write(buffer, 0, n);
                to.flush();
            }
        } catch (IOException ignored) {
            // tunnel closed
        }
    }
}
