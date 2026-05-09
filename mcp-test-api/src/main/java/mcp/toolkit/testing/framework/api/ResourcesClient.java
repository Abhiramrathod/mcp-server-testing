package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.api.model.McpResource;
import mcp.toolkit.testing.framework.api.model.McpResourceContent;
import mcp.toolkit.testing.framework.client.resources.McpResourceDirectory;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/**
 * High-level client for MCP resource listing and reading.
 *
 * <p>Returns typed domain objects instead of raw JSON, so callers do not need
 * to know the underlying JSON-RPC structure.
 */
public final class ResourcesClient {

    private final McpResourceDirectory resourceDirectory;

    ResourcesClient(McpResourceDirectory resourceDirectory) {
        this.resourceDirectory = resourceDirectory;
    }

    /**
     * Returns all resources registered on the server.
     *
     * @return list of resource descriptors
     */
    public List<McpResource> listResources() {
        JsonNode result = resourceDirectory.listResources();
        JsonNode resourcesArray = result.path("resources");
        List<McpResource> resources = new ArrayList<>();
        if (resourcesArray.isArray()) {
            for (JsonNode node : resourcesArray) {
                resources.add(toMcpResource(node));
            }
        }
        return List.copyOf(resources);
    }

    /**
     * Reads the content of a resource by URI.
     *
     * @param uri resource URI
     * @return resource content
     */
    public McpResourceContent readResource(String uri) {
        JsonNode raw = resourceDirectory.readResource(uri);
        return toMcpResourceContent(uri, raw);
    }

    private static McpResource toMcpResource(JsonNode node) {
        return new McpResource(
                node.path("uri").asText(),
                node.path("name").asText(null),
                node.path("description").asText(null),
                node.path("mimeType").asText(null),
                node
        );
    }

    private static McpResourceContent toMcpResourceContent(String uri, JsonNode raw) {
        JsonNode contentsArray = raw.path("contents");
        List<McpResourceContent.ContentItem> items = new ArrayList<>();
        if (contentsArray.isArray()) {
            for (JsonNode item : contentsArray) {
                items.add(new McpResourceContent.ContentItem(
                        item.path("uri").asText(null),
                        item.path("mimeType").asText(null),
                        item.path("text").asText(null),
                        item
                ));
            }
        }
        return new McpResourceContent(uri, items, raw);
    }
}
