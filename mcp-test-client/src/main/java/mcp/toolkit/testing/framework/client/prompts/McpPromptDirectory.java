package mcp.toolkit.testing.framework.client.prompts;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;

public final class McpPromptDirectory {

    private final McpInitializationGuard initGuard;
    private final McpRpcClient rpcClient;
    private final McpJsonCodec jsonCodec;

    public McpPromptDirectory(McpInitializationGuard initGuard, McpRpcClient rpcClient, McpJsonCodec jsonCodec) {
        this.initGuard = McpValidation.requireNonNull(initGuard, "initGuard");
        this.rpcClient = McpValidation.requireNonNull(rpcClient, "rpcClient");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
    }

    public JsonNode listPrompts() { return listPrompts(Map.of()); }

    public JsonNode listPrompts(Object params) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.PROMPTS_LIST, () -> jsonCodec.toJsonNode(params)));
    }

    public JsonNode getPrompt(String name) { return getPrompt(name, null); }

    public JsonNode getPrompt(String name, Object args) {
        McpValidation.requireNonNull(name, "name");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.PROMPTS_GET, () -> jsonCodec.buildParams(p -> {
                    p.put("name", name);
                    p.set("arguments", jsonCodec.toArgumentsNode(args));
                })));
    }
}
