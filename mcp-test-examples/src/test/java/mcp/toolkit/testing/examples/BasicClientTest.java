package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpClientConfig;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import mcp.toolkit.testing.examples.server.DummyMcpServer;
import org.junit.jupiter.api.*;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Basic example demonstrating MCP client initialization and server info retrieval.
 */
class BasicClientTest {

    private static DummyMcpServer server;
    private McpClient client;

    @BeforeAll
    static void startServer() throws Exception {
        server = new DummyMcpServer(8080);
        server.start();
        Thread.sleep(500); // Wait for server to start
    }

    @AfterAll
    static void stopServer() {
        if (server != null) {
            server.stop();
        }
    }

    @BeforeEach
    void setUp() {
        client = McpClient.connectTo("http://localhost:8080")
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(30))
                        .build())
                .build();
    }

    @AfterEach
    void tearDown() {
        if (client != null) {
            client.close();
        }
    }

    @Test
    void testClientInitialization() {
        client.initialize();
        
        assertTrue(client.isInitialized(), "Client should be initialized");
    }

    @Test
    void testServerInfo() {
        McpServerInfo info = client.serverInfo();
        
        assertNotNull(info, "Server info should not be null");
        assertEquals("dummy-mcp-server", info.name());
        assertEquals("1.0.0", info.version());
        assertEquals("2024-11-05", info.protocolVersion());
        
        System.out.println("Server: " + info.name() + " v" + info.version());
        System.out.println("Protocol: " + info.protocolVersion());
        System.out.println("Capabilities: " + info.supportedCapabilities());
    }

    @Test
    void testServerCapabilities() {
        McpServerInfo info = client.serverInfo();
        
        assertTrue(info.supportsTools(), "Server should support tools");
        assertTrue(info.supportsResources(), "Server should support resources");
        assertTrue(info.supportsPrompts(), "Server should support prompts");
        
        assertEquals(3, info.supportedCapabilities().size());
    }
}
