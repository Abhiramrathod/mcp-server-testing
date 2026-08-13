package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpMethod;
import mcp.toolkit.testing.framework.api.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive example demonstrating the full framework capability surface
 * against a real, running MCP server.
 */
class ComprehensiveIntegrationTest extends RealMcpServerTestBase {

    @Test
    void testServerCapabilities() {
        McpServerInfo info = client.serverInfo();

        assertEquals("dummy-mcp-server", info.name());
        assertEquals("1.0.0", info.version());
        assertEquals("2024-11-05", info.protocolVersion());

        assertTrue(info.supportsTools());
        assertTrue(info.supportsResources());
        assertTrue(info.supportsPrompts());
    }

    @Test
    void testToolsWorkflow() {
        List<McpTool> tools = client.tools().listTools();
        assertEquals(2, tools.size());

        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "add", "a", 10, "b", 5))
                .assertSuccess();

        assertEquals("15.0", result.firstText());
    }

    @Test
    void testResourcesWorkflow() {
        List<McpResource> resources = client.resources().listResources();
        assertEquals(2, resources.size());

        McpResourceContent content = client.resources()
                .readResource("file:///data/config.json")
                .assertNotEmpty();

        assertTrue(content.firstText().contains("version"));
    }

    @Test
    void testPromptsWorkflow() {
        List<McpPrompt> prompts = client.prompts().listPrompts();
        assertEquals(2, prompts.size());

        McpPromptResult result = client.prompts()
                .getPrompt("translate", Map.of("language", "German", "text", "Hello"))
                .assertNotEmpty();

        assertTrue(result.firstUserText().contains("German"));
    }

    @Test
    void testPingAndExchangeMetrics() {
        for (int i = 0; i < 3; i++) {
            client.tools().listTools();
        }

        long avgLatency = client.exchanges().averageLatency(McpMethod.TOOLS_LIST);
        assertTrue(avgLatency >= 0, "Average latency should be non-negative");

        client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_LIST, 5000);
        client.exchanges().assertLastSucceeded();

        client.ping();
        client.exchanges().assertLastSucceeded();
    }

    @Test
    void testRawJsonAccess() {
        List<McpTool> tools = client.tools().listTools();
        McpTool tool = tools.get(0);

        assertNotNull(tool.inputSchema());
        assertTrue(tool.inputSchema().has("type"));
        assertEquals("object", tool.inputSchema().path("type").asText());
    }

    @Test
    void testExchangeExport() {
        client.tools().listTools();

        JsonNode exported = client.exchanges().export();
        assertTrue(exported.toString().contains("tools/list"));
    }
}
