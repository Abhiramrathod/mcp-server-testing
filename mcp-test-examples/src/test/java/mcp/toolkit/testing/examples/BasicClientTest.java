package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import mcp.toolkit.testing.junit.annotation.McpServerTest;
import mcp.toolkit.testing.junit.server.McpTestServer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Basic example demonstrating MCP client initialization and server info retrieval
 * using the embedded {@code @McpServerTest} testkit.
 */
@McpServerTest
class BasicClientTest {

    @BeforeAll
    static void configure(McpTestServer server) {
        ExampleServerFixtures.configure(server);
    }

    @Test
    void testClientInitialization(McpClient client) {
        assertTrue(client.isInitialized(), "Client should be initialized");
    }

    @Test
    void testServerInfo(McpClient client) {
        McpServerInfo info = client.serverInfo();

        assertNotNull(info, "Server info should not be null");
        assertEquals("mcp-test-server", info.name());
        assertEquals("1.0.0", info.version());
        assertEquals("2024-11-05", info.protocolVersion());

        System.out.println("Server: " + info.name() + " v" + info.version());
        System.out.println("Protocol: " + info.protocolVersion());
        System.out.println("Capabilities: " + info.supportedCapabilities());
    }

    @Test
    void testServerCapabilities(McpClient client) {
        McpServerInfo info = client.serverInfo();

        assertTrue(info.supportsTools(), "Server should support tools");
        assertTrue(info.supportsResources(), "Server should support resources");
        assertTrue(info.supportsPrompts(), "Server should support prompts");

        assertEquals(3, info.supportedCapabilities().size());
    }
}
