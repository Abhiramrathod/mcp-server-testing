package mcp.toolkit.testing.junit.annotation;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpCompletion;
import mcp.toolkit.testing.framework.api.model.McpResourceTemplate;
import mcp.toolkit.testing.junit.server.McpResponses;
import mcp.toolkit.testing.junit.server.McpTestServer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * End-to-end test exercising the embedded server and injected client over
 * Streamable HTTP, including resource templates and completions.
 */
@McpServerTest(
        transport = Transport.STREAMABLE_HTTP,
        protocolVersion = "2025-03-26",
        name = "streamable-server",
        version = "2.0.0")
class McpServerTestStreamableIntegrationTest {

    @BeforeAll
    static void configure(McpTestServer server) {
        server.addResourceTemplate("file:///{path}", "File", "text/plain",
                params -> McpResponses.resourceText(
                        params.path("uri").asText(), "text/plain", "content of " + params.path("uri").asText()));
        server.addResourceCompletion("file:///{path}", "path", params -> List.of("a.txt", "b.txt"));
        server.addPrompt("translate", "Translates text", List.of(
                new McpTestServer.PromptArgument("language", "Target language", true)),
                params -> McpResponses.promptUser("Translates text",
                        "Translate to " + params.path("arguments").path("language").asText()));
        server.addPromptCompletion("translate", "language", params -> List.of("English", "Spanish", "French"));
    }

    @Test
    void exposesStreamableServerInfo(McpClient client) {
        var info = client.serverInfo();
        assertEquals("streamable-server", info.name());
        assertEquals("2.0.0", info.version());
        assertEquals("2025-03-26", info.protocolVersion());
        assertTrue(info.supportsResources());
        assertTrue(info.supportsPrompts());
    }

    @Test
    void listsAndReadsTemplatedResources(McpClient client) {
        List<McpResourceTemplate> templates = client.resources().listResourceTemplates();
        assertEquals(1, templates.size());
        assertEquals("file:///{path}", templates.get(0).uriTemplate());

        var content = client.resources().readResource("file:///docs/readme.txt")
                .assertNotEmpty();
        assertTrue(content.firstText().contains("file:///docs/readme.txt"));
    }

    @Test
    void completesResourceTemplateArgument(McpClient client) {
        McpCompletion completion = client.resources()
                .completeResourceTemplateArgument("file:///{path}", "path", "a");
        assertTrue(completion.hasSuggestions());
        assertEquals("a.txt", completion.values().get(0));
    }

    @Test
    void completesPromptArgument(McpClient client) {
        McpCompletion completion = client.prompts()
                .completePromptArgument("translate", "language", "E");
        assertTrue(completion.hasSuggestions());
        assertEquals("English", completion.values().get(0));
    }
}
