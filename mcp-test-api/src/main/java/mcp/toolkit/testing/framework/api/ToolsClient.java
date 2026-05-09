package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.api.model.McpTool;
import mcp.toolkit.testing.framework.api.model.McpToolResult;
import mcp.toolkit.testing.framework.client.tools.McpToolDirectory;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * High-level client for MCP tool discovery and invocation.
 *
 * <p>Returns typed domain objects instead of raw JSON, so callers do not need
 * to know the underlying JSON-RPC structure.
 */
public final class ToolsClient {

    private final McpToolDirectory toolDirectory;

    ToolsClient(McpToolDirectory toolDirectory) {
        this.toolDirectory = toolDirectory;
    }

    /**
     * Returns all tools registered on the server.
     *
     * @return list of tool definitions
     */
    public List<McpTool> listTools() {
        JsonNode toolsArray = toolDirectory.allToolDefinitions();
        List<McpTool> result = new ArrayList<>();
        for (JsonNode node : toolsArray) {
            result.add(toMcpTool(node));
        }
        return List.copyOf(result);
    }

    /**
     * Returns the definition of a single tool by name.
     *
     * @param name tool name
     * @return tool definition
     * @throws AssertionError if no tool with that name exists
     */
    public McpTool getTool(String name) {
        return toMcpTool(toolDirectory.toolDefinition(name));
    }

    /**
     * Returns {@code true} if a tool with the given name is registered on the server.
     *
     * @param name tool name
     * @return whether the tool exists
     */
    public boolean hasTool(String name) {
        try {
            toolDirectory.toolDefinition(name);
            return true;
        } catch (AssertionError e) {
            return false;
        }
    }

    /**
     * Invokes a tool by name with no arguments.
     *
     * @param name tool name
     * @return typed tool result
     */
    public McpToolResult callTool(String name) {
        return callTool(name, Map.of());
    }

    /**
     * Invokes a tool by name with the given arguments.
     *
     * @param name tool name
     * @param args tool arguments
     * @return typed tool result
     */
    public McpToolResult callTool(String name, Object args) {
        JsonNode raw = toolDirectory.callTool(name, args);
        return toMcpToolResult(raw);
    }

    private static McpTool toMcpTool(JsonNode node) {
        return new McpTool(
                node.path("name").asText(),
                node.path("description").asText(null),
                node.path("inputSchema").isMissingNode() ? null : node.path("inputSchema")
        );
    }

    private static McpToolResult toMcpToolResult(JsonNode raw) {
        boolean isError = raw.path("isError").asBoolean(false);
        List<McpToolResult.ContentItem> items = new ArrayList<>();
        JsonNode contentArray = raw.path("content");
        if (contentArray.isArray()) {
            for (JsonNode item : contentArray) {
                items.add(new McpToolResult.ContentItem(
                        item.path("type").asText(null),
                        item.path("text").asText(null),
                        item
                ));
            }
        }
        return new McpToolResult(items, isError, raw);
    }
}
