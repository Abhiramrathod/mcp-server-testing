package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpClientConfig;
import mcp.toolkit.testing.framework.api.model.McpPromptResult;
import mcp.toolkit.testing.framework.api.model.McpResourceContent;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import mcp.toolkit.testing.framework.api.model.McpToolResult;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating the Streamable HTTP transport (a single
 * {@code POST /mcp} endpoint) with a session-based legacy protocol revision
 * ({@code 2025-11-25}).
 */
class StreamableHttpClientTest extends RealMcpServerTestBase {

    @Override
    protected McpClient.Builder newClientBuilder() {
        return McpClient.connectTo(baseUrl())
                .streamableHttp()
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(10))
                        .protocolVersion("2025-11-25")
                        .build());
    }

    @Test
    void testClientInitialization() {
        assertTrue(client.isInitialized());
        assertFalse(client.isStateless(), "2025-11-25 belongs to the session-based era");
        assertEquals("2025-11-25", client.protocolVersion());
    }

    @Test
    void testServerInfo() {
        McpServerInfo info = client.serverInfo();

        assertNotNull(info);
        assertEquals("dummy-mcp-server", info.name());
        assertEquals("1.0.0", info.version());
        assertEquals("2025-11-25", info.protocolVersion());
        assertTrue(info.supportsTools());
        assertTrue(info.supportsResources());
        assertTrue(info.supportsPrompts());
    }

    @Test
    void testPing() {
        client.ping();
    }

    @Test
    void testListAndCallTools() {
        assertEquals(2, client.tools().listTools().size());

        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "add", "a", 5, "b", 3))
                .assertSuccess();
        assertEquals("8.0", result.firstText());
    }

    @Test
    void testReadResource() {
        McpResourceContent content = client.resources()
                .readResource("file:///data/readme.txt")
                .assertNotEmpty();
        assertEquals("file:///data/readme.txt", content.uri());
    }

    @Test
    void testGetPrompt() {
        McpPromptResult result = client.prompts()
                .getPrompt("translate", Map.of("language", "French", "text", "hi"))
                .assertNotEmpty();
        assertTrue(result.firstUserText().contains("French"));
    }
}
