package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpMethod;
import mcp.toolkit.testing.framework.api.model.McpExchangeSummary;
import mcp.toolkit.testing.examples.server.DummyMcpServer;
import org.junit.jupiter.api.*;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating exchange tracking and performance assertions.
 */
class ExchangeTrackingTest {

    private static DummyMcpServer server;
    private static McpClient sharedClient;

    @BeforeAll
    static void startServer() throws Exception {
        server = new DummyMcpServer(8084);
        server.start();
        Thread.sleep(500);
        
        sharedClient = McpClient.connectTo("http://localhost:8084")
                .initializeOnBuild()
                .build();
    }

    @AfterAll
    static void stopServer() {
        if (sharedClient != null) {
            sharedClient.close();
        }
        if (server != null) {
            server.stop();
        }
    }

    @BeforeEach
    void setUp() {
        sharedClient.exchanges().clear();
    }

    @Test
    void testExchangeHistory() {
        sharedClient.tools().listTools();
        sharedClient.resources().listResources();
        sharedClient.prompts().listPrompts();
        
        List<McpExchangeSummary> exchanges = sharedClient.exchanges().allExchanges();
        
        assertTrue(exchanges.size() >= 3);
        exchanges.forEach(ex -> assertTrue(ex.isSuccess()));
    }

    @Test
    void testLastExchangeSuccess() {
        sharedClient.tools().listTools();
        
        sharedClient.exchanges().assertLastSucceeded();
        
        McpExchangeSummary last = sharedClient.exchanges().lastExchange();
        assertTrue(last.isSuccess());
        assertEquals(McpMethod.TOOLS_LIST.value(), last.method());
        assertNotNull(last.latency());
    }

    @Test
    void testAverageLatency() {
        for (int i = 0; i < 5; i++) {
            sharedClient.tools().listTools();
        }
        
        long avgLatency = sharedClient.exchanges().averageLatency(McpMethod.TOOLS_LIST);
        assertTrue(avgLatency >= 0, "Average latency should be non-negative");
        
        sharedClient.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_LIST, 5000);
    }

    @Test
    void testLatencyPercentiles() {
        for (int i = 0; i < 10; i++) {
            sharedClient.tools().callTool("calculator", Map.of("operation", "add", "a", i, "b", 1));
        }
        
        long p50 = sharedClient.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 50);
        long p95 = sharedClient.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 95);
        long p99 = sharedClient.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 99);
        
        assertTrue(p50 > 0);
        assertTrue(p95 >= p50);
        assertTrue(p99 >= p95);
        
        sharedClient.exchanges().assertLatencyPercentileBelow(McpMethod.TOOLS_CALL, 99, 5000);
    }

    @Test
    void testExchangesByMethod() {
        sharedClient.tools().listTools();
        sharedClient.tools().listTools();
        sharedClient.resources().listResources();
        
        List<McpExchangeSummary> toolExchanges = 
                sharedClient.exchanges().exchangesForMethod(McpMethod.TOOLS_LIST);
        
        assertEquals(2, toolExchanges.size());
        toolExchanges.forEach(ex -> assertEquals(McpMethod.TOOLS_LIST.value(), ex.method()));
    }

    @Test
    void testSuccessRate() {
        sharedClient.tools().listTools();
        sharedClient.resources().listResources();
        sharedClient.prompts().listPrompts();
        
        List<McpExchangeSummary> all = sharedClient.exchanges().allExchanges();
        long successCount = all.stream().filter(McpExchangeSummary::isSuccess).count();
        
        assertTrue(successCount >= 3);
        assertEquals(all.size(), successCount);
    }
}
