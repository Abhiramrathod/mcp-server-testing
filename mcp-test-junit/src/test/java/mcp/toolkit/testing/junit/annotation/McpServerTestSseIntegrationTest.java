package mcp.toolkit.testing.junit.annotation;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import mcp.toolkit.testing.framework.api.model.McpTool;
import mcp.toolkit.testing.framework.api.model.McpToolResult;
import mcp.toolkit.testing.junit.server.McpResponses;
import mcp.toolkit.testing.junit.server.McpTestServer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end test of the embedded server and the injected client via the
 * composed {@link McpServerTest} annotation (SSE transport).
 */
@McpServerTest(transport = Transport.SSE)
class McpServerTestSseIntegrationTest {

    @BeforeAll
    static void configure(McpTestServer server) {
        server.addTool("echo", "Echoes the message", args ->
                McpResponses.toolText(args.path("message").asText("")));
        server.addResource("file:///data/config.json", "Configuration", "application/json",
                params -> McpResponses.resourceText(
                        "file:///data/config.json", "application/json", "{\"version\": 1}"));
        server.addPrompt("greet", "Greets a user", args ->
                McpResponses.promptUser("Greets a user", "Hello " + args.path("arguments").path("name").asText()));
    }

    @Test
    void injectsServerAndClient(McpTestServer server, McpClient client) {
        assertTrue(server.isRunning());
        assertTrue(client.isInitialized());
    }

    @Test
    void exposesServerInfo(McpClient client) {
        McpServerInfo info = client.serverInfo();
        assertEquals("mcp-test-server", info.name());
        assertEquals("1.0.0", info.version());
        assertTrue(info.supportsTools());
        assertTrue(info.supportsResources());
        assertTrue(info.supportsPrompts());
    }

    @Test
    void listsAndCallsTools(McpClient client) {
        List<McpTool> tools = client.tools().listTools();
        assertEquals(1, tools.size());
        assertEquals("echo", tools.get(0).name());

        McpToolResult result = client.tools()
                .callTool("echo", Map.of("message", "hello"))
                .assertSuccess();
        assertEquals("hello", result.firstText());
    }

    @Test
    void readsResources(McpClient client) {
        var content = client.resources().readResource("file:///data/config.json")
                .assertNotEmpty();
        assertTrue(content.firstText().contains("version"));
    }

    @Test
    void getsPrompts(McpClient client) {
        var result = client.prompts().getPrompt("greet", Map.of("name", "Ada"))
                .assertNotEmpty();
        assertTrue(result.firstUserText().contains("Ada"));
    }

    @Test
    void tracksExchanges(McpClient client) {
        client.ping();
        client.exchanges().assertLastSucceeded();
        assertFalse(client.exchanges().allExchanges().isEmpty());
    }
}
