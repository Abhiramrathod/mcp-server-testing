package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.api.model.McpCompletion;
import mcp.toolkit.testing.framework.api.model.McpResource;
import mcp.toolkit.testing.framework.api.model.McpResourceContent;
import mcp.toolkit.testing.framework.api.model.McpResourceTemplate;
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
     * Returns all resources registered on the server, following pagination
     * ({@code nextCursor}) transparently.
     *
     * @return list of resource descriptors
     */
    public List<McpResource> listResources() {
        List<McpResource> resources = new ArrayList<>();
        for (JsonNode node : resourceDirectory.allResources()) {
            resources.add(toMcpResource(node));
        }
        return List.copyOf(resources);
    }

    /**
     * Returns all resource templates registered on the server.
     *
     * @return list of resource template descriptors
     */
    public List<McpResourceTemplate> listResourceTemplates() {
        List<McpResourceTemplate> templates = new ArrayList<>();
        for (JsonNode node : resourceDirectory.allResourceTemplates()) {
            templates.add(toMcpResourceTemplate(node));
        }
        return List.copyOf(templates);
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

    /**
     * Requests completions for a resource template argument ({@code completion/complete}).
     *
     * @param uriTemplate  the template URI, e.g. {@code "file:///{path}"}
     * @param argumentName the argument name
     * @param value        the partial value being completed
     * @return typed completion result
     */
    public McpCompletion completeResourceTemplateArgument(String uriTemplate, String argumentName, String value) {
        return completeResourceTemplateArgument(uriTemplate, argumentName, value, null);
    }

    /**
     * Requests completions for a resource template argument ({@code completion/complete})
     * with optional context arguments.
     *
     * @param uriTemplate      the template URI, e.g. {@code "file:///{path}"}
     * @param argumentName     the argument name
     * @param value            the partial value being completed
     * @param contextArguments values of other arguments used for context; may be {@code null}
     * @return typed completion result
     */
    public McpCompletion completeResourceTemplateArgument(String uriTemplate, String argumentName, String value,
                                                          Object contextArguments) {
        JsonNode raw = resourceDirectory.completeResourceTemplateArgument(
                uriTemplate, argumentName, value, contextArguments);
        return toMcpCompletion(raw);
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

    private static McpResourceTemplate toMcpResourceTemplate(JsonNode node) {
        return new McpResourceTemplate(
                node.path("uriTemplate").asText(),
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

    private static McpCompletion toMcpCompletion(JsonNode raw) {
        JsonNode completion = raw.path("completion");
        List<String> values = new ArrayList<>();
        JsonNode valuesArray = completion.path("values");
        if (valuesArray.isArray()) {
            for (JsonNode value : valuesArray) {
                values.add(value.asText());
            }
        }
        Integer total = completion.path("total").isMissingNode() || completion.path("total").isNull()
                ? null : completion.path("total").asInt();
        boolean hasMore = completion.path("hasMore").asBoolean(false);
        return new McpCompletion(List.copyOf(values), total, hasMore);
    }
}
