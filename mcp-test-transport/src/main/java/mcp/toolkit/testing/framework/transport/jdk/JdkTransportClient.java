package mcp.toolkit.testing.framework.transport.jdk;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.interfaces.McpTransportClient;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * {@link McpTransportClient} backed by the JDK {@link HttpClient}.
 *
 * <p>Applies the configured timeout to POST and DELETE requests; the stream
 * connection is intentionally left without a request timeout because it is
 * expected to stay open for the lifetime of the session.
 */
public final class JdkTransportClient implements McpTransportClient {

    private final HttpClient client;
    private final Duration timeout;

    /**
     * Creates a client whose underlying {@link HttpClient} uses {@code timeout}
     * for both the connection timeout and per-request timeouts, connecting
     * directly to the target host.
     *
     * @param timeout connection and request timeout
     */
    public JdkTransportClient(Duration timeout) {
        this(timeout, null);
    }

    /**
     * Creates a client whose underlying {@link HttpClient} uses {@code timeout}
     * for both the connection timeout and per-request timeouts, optionally
     * routing traffic through an HTTP proxy.
     *
     * <p>When {@code proxy} is {@code null} the client uses the JVM's default
     * proxy selector (i.e. the {@code http.proxyHost}/{@code https.proxyHost}
     * system properties), preserving the standard {@link HttpClient} behaviour.
     *
     * @param timeout connection and request timeout
     * @param proxy   HTTP proxy to route through, or {@code null} for default
     *                behaviour
     */
    public JdkTransportClient(Duration timeout, Proxy proxy) {
        this.timeout = McpValidation.requireNonNull(timeout, "timeout");
        validateProxy(proxy);
        HttpClient.Builder builder = HttpClient.newBuilder().connectTimeout(timeout);
        if (proxy != null) {
            builder.proxy(ProxySelector.of((InetSocketAddress) proxy.address()));
        }
        this.client = builder.build();
    }

    @Override
    public McpResponse send(URI uri, Map<String, String> headers, String payload) {
        HttpResponse<Stream<String>> response = send(
                request(uri, headers, "POST", payload, timeout),
                HttpResponse.BodyHandlers.ofLines(), "Failed to send POST request to " + uri);
        return JdkTransportResponse.ofLines(response);
    }

    @Override
    public McpResponse sendAsText(URI uri, Map<String, String> headers, String payload) {
        HttpResponse<String> response = send(
                request(uri, headers, "POST", payload, timeout),
                HttpResponse.BodyHandlers.ofString(), "Failed to send POST request to " + uri);
        return JdkTransportResponse.ofText(response);
    }

    @Override
    public CompletableFuture<McpResponse> openStream(URI uri, Map<String, String> headers) {
        return client.sendAsync(request(uri, headers, "GET", null, null), HttpResponse.BodyHandlers.ofLines())
                .thenApply(JdkTransportResponse::ofLines);
    }

    @Override
    public McpResponse closeSession(URI uri, Map<String, String> headers) {
        HttpResponse<String> response = send(
                request(uri, headers, "DELETE", null, timeout),
                HttpResponse.BodyHandlers.ofString(), "Failed to send DELETE request to " + uri);
        return JdkTransportResponse.ofText(response);
    }

    @Override
    public void close() {
        // The JDK HttpClient holds no resources that must be released explicitly.
    }

    private static void validateProxy(Proxy proxy) {
        if (proxy != null && proxy.type() != Proxy.Type.HTTP) {
            throw new IllegalArgumentException(
                    "Only HTTP proxies are supported, got: " + proxy.type());
        }
    }

    private HttpRequest request(URI uri, Map<String, String> headers, String method,
                                String payload, Duration requestTimeout) {
        HttpRequest.Builder builder = HttpRequest.newBuilder().uri(uri);
        if (requestTimeout != null) {
            builder.timeout(requestTimeout);
        }
        if (headers != null) {
            headers.forEach(builder::header);
        }
        switch (method) {
            case "POST" -> builder.POST(HttpRequest.BodyPublishers.ofString(payload));
            case "DELETE" -> builder.DELETE();
            default -> builder.GET();
        }
        return builder.build();
    }

    private <T> HttpResponse<T> send(HttpRequest request, HttpResponse.BodyHandler<T> handler, String errorMessage) {
        try {
            return client.send(request, handler);
        } catch (IOException ex) {
            throw new IllegalStateException(errorMessage, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted during " + errorMessage, ex);
        }
    }

    /**
         * Adapts a JDK HTTP response to the neutral {@link McpResponse} contract so
         * the underlying protocol types never leak out of this package.
         */
        private record JdkTransportResponse(int statusCode, HttpHeaders headers, String textBody,
                                            Stream<String> lineBody) implements McpResponse {

        static McpResponse ofLines(HttpResponse<Stream<String>> response) {
                return new JdkTransportResponse(response.statusCode(), response.headers(),
                        null, response.body());
            }

            static McpResponse ofText(HttpResponse<String> response) {
                return new JdkTransportResponse(response.statusCode(), response.headers(),
                        response.body(), null);
            }

            @Override
            public String header(String name) {
                return headers.firstValue(name).orElse(null);
            }

            @Override
            public Stream<String> bodyLines() {
                if (lineBody != null) {
                    return lineBody;
                }
                return textBody == null ? Stream.empty() : Stream.of(textBody.split("\n", -1));
            }

            @Override
            public String bodyAsText() {
                if (textBody != null) {
                    return textBody;
                }
                if (lineBody != null) {
                    try (Stream<String> lines = lineBody) {
                        return lines.collect(Collectors.joining("\n"));
                    }
                }
                return "";
            }
        }
}
