package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpResource;
import mcp.toolkit.testing.framework.api.model.McpResourceContent;
import mcp.toolkit.testing.junit.annotation.McpServerTest;
import mcp.toolkit.testing.junit.server.McpTestServer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating resource listing and reading using the embedded
 * {@code @McpServerTest} testkit.
 */
@McpServerTest
class ResourcesClientTest {

    @BeforeAll
    static void configure(McpTestServer server) {
        ExampleServerFixtures.configure(server);
    }

    @Test
    void testListResources(McpClient client) {
        List<McpResource> resources = client.resources().listResources();

        assertNotNull(resources);
        assertEquals(2, resources.size());

        McpResource config = findResource(resources, "file:///data/config.json");
        assertEquals("file:///data/config.json", config.uri());
        assertEquals("Configuration", config.name());
        assertEquals("application/json", config.mimeType());

        McpResource readme = findResource(resources, "file:///data/readme.txt");
        assertEquals("file:///data/readme.txt", readme.uri());
        assertEquals("README", readme.name());
        assertEquals("text/plain", readme.mimeType());
    }

    @Test
    void testReadConfigResource(McpClient client) {
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
    void testReadReadmeResource(McpClient client) {
        client.resources()
                .readResource("file:///data/readme.txt")
                .assertNotEmpty()
                .assertTextContains("Welcome");
    }

    @Test
    void testResourceContentItems(McpClient client) {
        McpResourceContent content = client.resources()
                .readResource("file:///data/config.json")
                .assertNotEmpty();

        assertEquals(1, content.contents().size());

        McpResourceContent.ContentItem item = content.contents().get(0);
        assertEquals("file:///data/config.json", item.uri());
        assertEquals("application/json", item.mimeType());
        assertNotNull(item.text());
    }

    private static McpResource findResource(List<McpResource> resources, String uri) {
        return resources.stream()
                .filter(r -> r.uri().equals(uri))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Resource not found: " + uri));
    }
}
