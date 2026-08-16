package mcp.toolkit.testing.examples;

import com.fasterxml.jackson.databind.JsonNode;
import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpClientConfig;
import mcp.toolkit.testing.framework.api.model.McpToolResult;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Example tests exercising the framework under concurrency against a real
 * {@link mcp.toolkit.testing.examples.server.DummyMcpServer}, through every transport and protocol era.
 *
 * <p>These tests verify that the pooled Netty transport keeps responses
 * correlated with their requests under parallel load (a response can never be
 * wired to the wrong call), that server-side sessions stay isolated across
 * concurrent clients, and that stateless calls need no session at all.
 */
class ConcurrencyClientTest extends RealMcpServerTestBase {

    private static final int THREADS = 8;
    private static final int CALLS_PER_THREAD = 20;
    private static final Duration DEADLINE = Duration.ofSeconds(60);

    @Test
    void concurrentToolCallsOnSingleSharedClientReturnCorrectResults() throws Exception {
        McpClient shared = newStreamableClient("2025-11-25");
        try {
            runConcurrently(THREADS, thread -> {
                for (int i = 0; i < CALLS_PER_THREAD; i++) {
                    double a = thread + 1;
                    double b = i + 1;
                    String expected = String.valueOf(a + b);
                    String actual = shared.tools()
                            .callTool("calculator", Map.of("operation", "add", "a", a, "b", b))
                            .assertSuccess()
                            .firstText();
                    assertEquals(expected, actual,
                            "thread " + thread + " iteration " + i + " got a cross-wired response");
                }
            });

            assertEquals(THREADS * CALLS_PER_THREAD, shared.exchanges().countForMethod("tools/call"));
            shared.exchanges().assertAllSucceeded("tools/call");

            // Sequential calls after the burst keep working over reused pooled connections.
            for (int i = 0; i < 5; i++) {
                assertEquals(String.valueOf(i + 1.0 + 1.0),
                        shared.tools()
                                .callTool("calculator", Map.of("operation", "add", "a", i + 1, "b", 1))
                                .assertSuccess()
                                .firstText());
            }
        } finally {
            shared.close();
        }
    }

    @Test
    void concurrentClientsKeepSessionsIsolated() throws Exception {
        int clientCount = 8;
        List<McpClient> clients = new ArrayList<>();
        try {
            for (int c = 0; c < clientCount; c++) {
                clients.add(newStreamableClient("2025-11-25"));
            }

            runConcurrently(clientCount, index -> {
                McpClient client = clients.get(index);
                for (int i = 0; i < 3; i++) {
                    double a = index + 1;
                    double b = 10 + i;
                    assertEquals(String.valueOf(a + b),
                            client.tools()
                                    .callTool("calculator", Map.of("operation", "add", "a", a, "b", b))
                                    .assertSuccess()
                                    .firstText());
                }
            });

            // Each session must still be valid and only see its own exchanges.
            for (McpClient client : clients) {
                assertEquals(3, client.exchanges().countForMethod("tools/call"));
                client.exchanges().assertAllSucceeded("tools/call");
                client.ping();
            }
        } finally {
            clients.forEach(McpClient::close);
        }
    }

    @Test
    void statelessConcurrentCallsNeedNoSessionAndCarryServerMeta() throws Exception {
        McpClient stateless = newStreamableClient("2026-07-28");
        try {
            assertTrue(stateless.isStateless());

            runConcurrently(THREADS, thread -> {
                for (int i = 0; i < CALLS_PER_THREAD; i++) {
                    double a = thread + 1;
                    double b = i + 2;
                    McpToolResult result = stateless.tools()
                            .callTool("calculator", Map.of("operation", "multiply", "a", a, "b", b))
                            .assertSuccess();
                    assertEquals(String.valueOf(a * b), result.firstText());
                    JsonNode serverInfo = result.raw().path("_meta")
                            .path(McpTestClientConstants.Meta.SERVER_INFO);
                    assertEquals("dummy-mcp-server", serverInfo.path("name").asText(),
                            "stateless results must carry _meta.serverInfo; raw=" + result.raw().toPrettyString());
                }
            });

            assertEquals(THREADS * CALLS_PER_THREAD, stateless.exchanges().countForMethod("tools/call"));
            stateless.exchanges().assertAllSucceeded("tools/call");
        } finally {
            stateless.close();
        }
    }

    @Test
    void concurrentSseClientsStreamIndependently() throws Exception {
        int clientCount = 4;
        List<McpClient> clients = new ArrayList<>();
        try {
            for (int c = 0; c < clientCount; c++) {
                clients.add(newSseClient());
            }

            runConcurrently(clientCount, index -> {
                McpClient client = clients.get(index);
                for (int i = 0; i < 3; i++) {
                    assertEquals("Hello, World!",
                            client.tools()
                                    .callTool("greet", Map.of("name", "World"))
                                    .assertSuccess()
                                    .firstText());
                }
            });

            for (McpClient client : clients) {
                assertEquals(3, client.exchanges().countForMethod("tools/call"));
                client.exchanges().assertAllSucceeded("tools/call");
            }
        } finally {
            clients.forEach(McpClient::close);
        }
    }

    private McpClient newStreamableClient(String protocolVersion) {
        return McpClient.connectTo(baseUrl())
                .streamableHttp()
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(10))
                        .protocolVersion(protocolVersion)
                        .build())
                .initializeOnBuild()
                .build();
    }

    private McpClient newSseClient() {
        return McpClient.connectTo(baseUrl())
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(10))
                        .protocolVersion("2024-11-05")
                        .build())
                .initializeOnBuild()
                .build();
    }

    private static void runConcurrently(int workers, IntThrowingRunnable task) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(workers, r -> {
            Thread thread = new Thread(r, "concurrency-test");
            thread.setDaemon(true);
            return thread;
        });
        List<Future<?>> futures = new ArrayList<>();
        try {
            for (int w = 0; w < workers; w++) {
                int worker = w;
                futures.add(pool.submit(() -> {
                    try {
                        task.run(worker);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }));
            }
            long deadline = System.nanoTime() + DEADLINE.toNanos();
            for (Future<?> future : futures) {
                future.get(deadline - System.nanoTime(), TimeUnit.NANOSECONDS);
            }
        } finally {
            pool.shutdownNow();
        }
    }

    @FunctionalInterface
    private interface IntThrowingRunnable {
        void run(int worker) throws Exception;
    }
}
