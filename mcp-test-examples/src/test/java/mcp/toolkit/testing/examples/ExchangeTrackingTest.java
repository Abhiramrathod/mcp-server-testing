package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpMethod;
import mcp.toolkit.testing.framework.api.model.McpExchangeSummary;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating exchange tracking and performance assertions
 * against a real, running MCP server. A fresh client is created per test, so
 * exchanges are naturally isolated between tests.
 */
class ExchangeTrackingTest extends RealMcpServerTestBase {

    @Test
    void testExchangeHistory() {
        client.tools().listTools();
        client.resources().listResources();
        client.prompts().listPrompts();

        List<McpExchangeSummary> exchanges = client.exchanges().allExchanges();

        assertTrue(exchanges.size() >= 3);
        exchanges.forEach(ex -> assertTrue(ex.isSuccess()));
    }

    @Test
    void testLastExchangeSuccess() {
        client.tools().listTools();

        client.exchanges().assertLastSucceeded();

        McpExchangeSummary last = client.exchanges().lastExchange();
        assertTrue(last.isSuccess());
        assertEquals(McpMethod.TOOLS_LIST.value(), last.method());
        assertNotNull(last.latency());
    }

    @Test
    void testAverageLatency() {
        for (int i = 0; i < 5; i++) {
            client.tools().listTools();
        }

        long avgLatency = client.exchanges().averageLatency(McpMethod.TOOLS_LIST);
        assertTrue(avgLatency >= 0, "Average latency should be non-negative");

        client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_LIST, 5000);
    }

    @Test
    void testLatencyPercentiles() {
        for (int i = 0; i < 10; i++) {
            client.tools().callTool("calculator", Map.of("operation", "add", "a", i, "b", 1));
        }

        long p50 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 50);
        long p95 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 95);
        long p99 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 99);

        assertTrue(p50 > 0);
        assertTrue(p95 >= p50);
        assertTrue(p99 >= p95);

        client.exchanges().assertLatencyPercentileBelow(McpMethod.TOOLS_CALL, 99, 5000);
    }

    @Test
    void testExchangesByMethod() {
        client.tools().listTools();
        client.tools().listTools();
        client.resources().listResources();

        List<McpExchangeSummary> toolExchanges =
                client.exchanges().exchangesForMethod(McpMethod.TOOLS_LIST);

        assertEquals(2, toolExchanges.size());
        toolExchanges.forEach(ex -> assertEquals(McpMethod.TOOLS_LIST.value(), ex.method()));
    }

    @Test
    void testSuccessRate() {
        client.tools().listTools();
        client.resources().listResources();
        client.prompts().listPrompts();

        List<McpExchangeSummary> all = client.exchanges().allExchanges();
        long successCount = all.stream().filter(McpExchangeSummary::isSuccess).count();

        assertTrue(successCount >= 3);
        assertEquals(all.size(), successCount);
    }
}
