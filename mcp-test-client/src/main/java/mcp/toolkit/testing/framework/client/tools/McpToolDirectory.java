package mcp.toolkit.testing.framework.client.tools;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;

public final class McpToolDirectory {

    private final McpInitializationGuard initGuard;
    private final McpRpcClient rpcClient;
    private final McpJsonCodec jsonCodec;

    public McpToolDirectory(McpInitializationGuard initGuard, McpRpcClient rpcClient, McpJsonCodec jsonCodec) {
        this.initGuard = McpValidation.requireNonNull(initGuard, "initGuard");
        this.rpcClient = McpValidation.requireNonNull(rpcClient, "rpcClient");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
    }

    public JsonNode listTools() { return listTools(Map.of()); }

    public JsonNode listTools(Object params) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.TOOLS_LIST, () -> jsonCodec.toJsonNode(params)));
    }

    public JsonNode allToolDefinitions() {
        JsonNode tools = listTools().path("tools");
        if (!tools.isArray()) throw new AssertionError("Expected tools/list to return an array.");
        return tools;
    }

    public JsonNode toolDefinition(String name) {
        McpValidation.requireNonNull(name, "name");
        for (JsonNode tool : allToolDefinitions()) {
            if (name.equals(tool.path("name").asText())) return tool;
        }
        throw new AssertionError("No MCP tool found with name: " + name);
    }

    public JsonNode callTool(String name, Object args) {
        McpValidation.requireNonNull(name, "name");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.TOOLS_CALL, () -> jsonCodec.buildParams(p -> {
                    p.put("name", name);
                    p.set("arguments", jsonCodec.toArgumentsNode(args));
                })));
    }
}
