package mcp.toolkit.testing.examples;

import com.fasterxml.jackson.databind.JsonNode;
import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpClientConfig;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import mcp.toolkit.testing.framework.api.model.McpToolResult;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating the stateless MCP era ({@code 2026-07-28} and
 * later) over Streamable HTTP: no {@code initialize} handshake, no session id,
 * version negotiation via {@code server/discover}, and per-request metadata.
 */
class StatelessClientTest extends RealMcpServerTestBase {

    @Override
    protected McpClient.Builder newClientBuilder() {
        return McpClient.connectTo(baseUrl())
                .streamableHttp()
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(10))
                        .protocolVersion("2026-07-28")
                        .build());
    }

    @Test
    void testStatelessEra() {
        assertTrue(client.isInitialized());
        assertTrue(client.isStateless());
        assertEquals("2026-07-28", client.protocolVersion());
    }

    @Test
    void testDiscoverNegotiatesProtocolVersions() {
        JsonNode discover = client.discover();

        assertNotNull(discover);
        JsonNode versions = discover.path("protocolVersions");
        assertTrue(versions.isArray());
        assertEquals(5, versions.size());
        assertEquals("2026-07-28", versions.get(versions.size() - 1).asText());
        assertEquals("dummy-mcp-server", discover.path("serverInfo").path("name").asText());
    }

    @Test
    void testServerInfo() {
        McpServerInfo info = client.serverInfo();

        assertNotNull(info);
        assertEquals("dummy-mcp-server", info.name());
        assertEquals("1.0.0", info.version());
        assertEquals("2026-07-28", info.protocolVersion());
        assertEquals(3, info.supportedCapabilities().size());
    }

    @Test
    void testListAndCallTools() {
        assertEquals(2, client.tools().listTools().size());

        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "multiply", "a", 4, "b", 7))
                .assertSuccess();
        assertEquals("28.0", result.firstText());
    }

    @Test
    void testReadResource() {
        client.resources()
                .readResource("file:///data/config.json")
                .assertNotEmpty()
                .assertTextContains("version");
    }

    @Test
    void testGetPrompt() {
        client.prompts()
                .getPrompt("code-review", Map.of("code", "public void test() {}"))
                .assertNotEmpty()
                .assertUserTextContains("review");
    }

    @Test
    void testPerRequestLogLevel() {
        JsonNode result = client.call("tools/list", null, "debug");
        assertTrue(result.has("tools"));
    }
}
