package mcp.toolkit.testing.framework.client.tools;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import java.util.Map;

public final class McpToolDirectory {

    private final McpInitializationGuard initGuard;
    private final McpRpcClient rpcClient;
    private final McpJsonCodec jsonCodec;

    /**
     * Creates a tool directory backed by the given RPC client and codec.
     *
     * @param initGuard  initialization guard
     * @param rpcClient  low-level JSON-RPC client
     * @param jsonCodec  JSON codec for payload construction
     */
    public McpToolDirectory(McpInitializationGuard initGuard, McpRpcClient rpcClient, McpJsonCodec jsonCodec) {
        this.initGuard = McpValidation.requireNonNull(initGuard, "initGuard");
        this.rpcClient = McpValidation.requireNonNull(rpcClient, "rpcClient");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
    }

    /**
     * Lists the first page of available tools.
     *
     * @return the raw {@code tools/list} result
     */
    public JsonNode listTools() { return listTools(Map.of()); }

    /**
     * Lists tools using the given request parameters.
     *
     * @param params request parameters, e.g. a pagination cursor; may be {@code null}
     * @return the raw {@code tools/list} result
     */
    public JsonNode listTools(Object params) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.TOOLS_LIST, () -> jsonCodec.toJsonNode(params)));
    }

    /**
     * Lists tools using the given pagination cursor.
     *
     * @param cursor opaque cursor from a previous {@code nextCursor}; may be {@code null}
     * @return the raw {@code tools/list} result
     */
    public JsonNode listTools(String cursor) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.TOOLS_LIST,
                () -> jsonCodec.buildParams(p -> {
                    if (cursor != null) {
                        p.put(McpTestClientConstants.Params.CURSOR, cursor);
                    }
                })));
    }

    /**
     * Returns all tool definitions by following {@code nextCursor} until the
     * last page.
     *
     * @return a JSON array of all tool definitions
     */
    public JsonNode allToolDefinitions() {
        ArrayNode tools = jsonCodec.newArrayNode();
        String cursor = null;
        do {
            JsonNode result = listTools(cursor);
            JsonNode page = result.path("tools");
            if (page.isArray()) {
                page.forEach(tools::add);
            }
            cursor = result.path(McpTestClientConstants.Params.NEXT_CURSOR).asText(null);
        } while (cursor != null && !cursor.isBlank());
        return tools;
    }

    /**
     * Returns the definition of the tool with the given name.
     *
     * @param name tool name
     * @return the tool definition
     * @throws AssertionError if no tool with that name exists
     */
    public JsonNode toolDefinition(String name) {
        McpValidation.requireNonNull(name, "name");
        for (JsonNode tool : allToolDefinitions()) {
            if (name.equals(tool.path("name").asText())) return tool;
        }
        throw new AssertionError("No MCP tool found with name: " + name);
    }

    /**
     * Invokes the tool with the given name and arguments.
     *
     * @param name tool name
     * @param args arguments for the tool invocation; may be {@code null}
     * @return the raw {@code tools/call} result
     */
    public JsonNode callTool(String name, Object args) {
        McpValidation.requireNonNull(name, "name");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.TOOLS_CALL, () -> jsonCodec.buildParams(p -> {
                    p.put("name", name);
                    p.set("arguments", jsonCodec.toArgumentsNode(args));
                })));
    }
}
