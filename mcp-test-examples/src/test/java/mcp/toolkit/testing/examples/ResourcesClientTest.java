package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpResource;
import mcp.toolkit.testing.framework.api.model.McpResourceContent;
import mcp.toolkit.testing.examples.server.DummyMcpServer;
import org.junit.jupiter.api.*;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating resource listing and reading.
 */
class ResourcesClientTest {

    private static DummyMcpServer server;
    private static McpClient client;

    @BeforeAll
    static void startServer() throws Exception {
        server = new DummyMcpServer(8082);
        server.start();
        Thread.sleep(500);
        
        client = McpClient.connectTo("http://localhost:8082")
                .initializeOnBuild()
                .build();
    }

    @AfterAll
    static void stopServer() {
        if (client != null) {
            client.close();
        }
        if (server != null) {
            server.stop();
        }
    }

    @Test
    void testListResources() {
        List<McpResource> resources = client.resources().listResources();
        
        assertNotNull(resources);
        assertEquals(2, resources.size());
        
        McpResource config = resources.get(0);
        assertEquals("file:///data/config.json", config.uri());
        assertEquals("Configuration", config.name());
        assertEquals("application/json", config.mimeType());
        
        McpResource readme = resources.get(1);
        assertEquals("file:///data/readme.txt", readme.uri());
        assertEquals("README", readme.name());
        assertEquals("text/plain", readme.mimeType());
    }

    @Test
    void testReadConfigResource() {
        McpResourceContent content = client.resources()
                .readResource("file:///data/config.json")
                .assertNotEmpty();
        
        assertEquals("file:///data/config.json", content.uri());
        assertFalse(content.contents().isEmpty());
        
        String text = content.firstText();
        assertTrue(text.contains("version"));
        assertTrue(text.contains("1.0"));
    }

    @Test
    void testReadReadmeResource() {
        client.resources()
                .readResource("file:///data/readme.txt")
                .assertNotEmpty()
                .assertTextContains("Welcome");
    }

    @Test
    void testResourceContentItems() {
        McpResourceContent content = client.resources()
                .readResource("file:///data/config.json")
                .assertNotEmpty();
        
        assertEquals(1, content.contents().size());
        
        McpResourceContent.ContentItem item = content.contents().get(0);
        assertEquals("file:///data/config.json", item.uri());
        assertEquals("application/json", item.mimeType());
        assertNotNull(item.text());
    }
}
