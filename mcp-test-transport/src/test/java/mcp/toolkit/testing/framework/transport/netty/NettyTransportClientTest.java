package mcp.toolkit.testing.framework.transport.netty;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import mcp.toolkit.testing.framework.interfaces.McpResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end tests for {@link NettyTransportClient} against a real local HTTP
 * server, covering the exact {@code McpResponse} semantics the transports rely on.
 */
class NettyTransportClientTest {

    private static final Duration TIMEOUT = Duration.ofSeconds(5);

    private HttpServer server;
    private NettyTransportClient client;
    private URI base;

    @BeforeEach
    void setUp() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        ThreadFactory daemonFactory = r -> {
            Thread thread = new Thread(r);
            thread.setDaemon(true);
            return thread;
        };
        server.setExecutor(Executors.newCachedThreadPool(daemonFactory));
        server.start();
        base = URI.create("http://localhost:" + server.getAddress().getPort());
        client = new NettyTransportClient(TIMEOUT);
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
        client.close();
    }

    @Test
    void sendStreamsResponseBodyLinesAndExposesCaseInsensitiveHeaders() {
        server.createContext("/echo", this::jsonHandler);

        McpResponse response = client.send(
                base.resolve("/echo"), Map.of("Content-Type", "application/json"), "{}");

        assertEquals(200, response.statusCode());
        assertEquals("application/json", response.header("content-type"));
        assertEquals("v1", response.header("X-CUSTOM"));
        assertEquals(List.of("{\"result\":\"ok\"}"), response.bodyLines().collect(Collectors.toList()));
    }

    @Test
    void sendReturnsAsSoonAsHeadersArrive() {
        server.createContext("/slow-body", exchange -> {
            exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
            exchange.sendResponseHeaders(200, 0);
            writeAndFlush(exchange, "data: one\n\n");
            sleepQuietly(2000);
            writeAndFlush(exchange, "data: two\n\n");
            exchange.getResponseBody().close();
        });

        long start = System.currentTimeMillis();
        McpResponse response = client.send(base.resolve("/slow-body"), Map.of(), "{}");
        long elapsed = System.currentTimeMillis() - start;

        assertTrue(elapsed < 1000, "send() should return once headers arrive, took " + elapsed + "ms");
        assertEquals(List.of("data: one", "", "data: two", ""),
                response.bodyLines().collect(Collectors.toList()));
    }

    @Test
    void sendAsTextBuffersTheFullBody() {
        server.createContext("/echo-text", this::jsonHandler);

        McpResponse response = client.sendAsText(base.resolve("/echo-text"), Map.of(), "{}");

        assertEquals(200, response.statusCode());
        assertEquals("{\"result\":\"ok\"}", response.bodyAsText());
    }

    @Test
    void openStreamResolvesWithHeadersAndStreamsSseLinesLive() throws Exception {
        server.createContext("/sse", this::sseHandler);

        CompletableFuture<McpResponse> future =
                client.openStream(base.resolve("/sse"), Map.of("Accept", "text/event-stream"));
        McpResponse response = future.get(5, TimeUnit.SECONDS);

        assertEquals(200, response.statusCode());
        List<String> lines = response.bodyLines().collect(Collectors.toList());
        assertTrue(lines.contains("event: message"));
        assertTrue(lines.contains("data: {\"id\":1}"));
        assertTrue(lines.contains("event: message"));
        assertTrue(lines.contains("data: {\"id\":2}"));
    }

    @Test
    void closeSessionSendsDeleteRequest() {
        server.createContext("/session", exchange -> {
            if ("DELETE".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
            exchange.getResponseBody().close();
        });

        McpResponse response = client.closeSession(base.resolve("/session"), Map.of());

        assertEquals(204, response.statusCode());
    }

    @Test
    void propagatesNonSuccessStatusWithBody() {
        server.createContext("/missing", exchange -> {
            byte[] body = "not found".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(404, body.length);
            exchange.getResponseBody().write(body);
            exchange.getResponseBody().close();
        });

        McpResponse response = client.sendAsText(base.resolve("/missing"), Map.of(), "{}");

        assertEquals(404, response.statusCode());
        assertEquals("not found", response.bodyAsText());
    }

    @Test
    void surfacesConnectionFailureAsIllegalStateException() throws Exception {
        int unusedPort;
        try (ServerSocket socket = new ServerSocket(0)) {
            unusedPort = socket.getLocalPort();
        }

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> client.sendAsText(URI.create("http://localhost:" + unusedPort), Map.of(), "{}"));

        assertTrue(ex.getMessage().contains("Failed to send POST request"));
    }

    @Test
    void timesOutWhenServerDoesNotRespond() {
        server.createContext("/hang", exchange -> {
            sleepQuietly(3000);
            exchange.getResponseBody().close();
        });
        NettyTransportClient slowClient = new NettyTransportClient(Duration.ofMillis(300));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> slowClient.sendAsText(base.resolve("/hang"), Map.of(), "{}"));

        assertTrue(ex.getMessage().contains("timed out"));
    }

    private void jsonHandler(HttpExchange exchange) throws IOException {
        byte[] body = "{\"result\":\"ok\"}".getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("X-Custom", "v1");
        exchange.sendResponseHeaders(200, body.length);
        exchange.getResponseBody().write(body);
        exchange.getResponseBody().close();
    }

    private void sseHandler(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
        exchange.sendResponseHeaders(200, 0);
        writeAndFlush(exchange, "event: message\ndata: {\"id\":1}\n\n");
        writeAndFlush(exchange, "event: message\ndata: {\"id\":2}\n\n");
        exchange.getResponseBody().close();
    }

    private static void writeAndFlush(HttpExchange exchange, String text) throws IOException {
        OutputStream os = exchange.getResponseBody();
        os.write(text.getBytes(StandardCharsets.UTF_8));
        os.flush();
    }

    private static void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
