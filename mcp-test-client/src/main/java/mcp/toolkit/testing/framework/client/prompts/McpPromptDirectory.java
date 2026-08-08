package mcp.toolkit.testing.framework.client.prompts;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Map;

public final class McpPromptDirectory {

    private final McpInitializationGuard initGuard;
    private final McpRpcClient rpcClient;
    private final McpJsonCodec jsonCodec;

    /**
     * Creates a prompt directory backed by the given RPC client and codec.
     *
     * @param initGuard  initialization guard
     * @param rpcClient  low-level JSON-RPC client
     * @param jsonCodec  JSON codec for payload construction
     */
    public McpPromptDirectory(McpInitializationGuard initGuard, McpRpcClient rpcClient, McpJsonCodec jsonCodec) {
        this.initGuard = McpValidation.requireNonNull(initGuard, "initGuard");
        this.rpcClient = McpValidation.requireNonNull(rpcClient, "rpcClient");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
    }

    /**
     * Lists the first page of available prompts.
     *
     * @return the raw {@code prompts/list} result
     */
    public JsonNode listPrompts() { return listPrompts(Map.of()); }

    /**
     * Lists prompts using the given request parameters.
     *
     * @param params request parameters, e.g. a pagination cursor; may be {@code null}
     * @return the raw {@code prompts/list} result
     */
    public JsonNode listPrompts(Object params) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.PROMPTS_LIST, () -> jsonCodec.toJsonNode(params)));
    }

    /**
     * Lists prompts using the given pagination cursor.
     *
     * @param cursor opaque cursor from a previous {@code nextCursor}; may be {@code null}
     * @return the raw {@code prompts/list} result
     */
    public JsonNode listPrompts(String cursor) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.PROMPTS_LIST,
                () -> jsonCodec.buildParams(p -> {
                    if (cursor != null) {
                        p.put(McpTestClientConstants.Params.CURSOR, cursor);
                    }
                })));
    }

    /**
     * Returns all prompts by following {@code nextCursor} until the last page.
     *
     * @return a JSON array of all prompt definitions
     */
    public ArrayNode allPrompts() {
        ArrayNode prompts = jsonCodec.newArrayNode();
        String cursor = null;
        do {
            JsonNode result = listPrompts(cursor);
            JsonNode page = result.path("prompts");
            if (page.isArray()) {
                page.forEach(prompts::add);
            }
            cursor = result.path(McpTestClientConstants.Params.NEXT_CURSOR).asText(null);
        } while (cursor != null && !cursor.isBlank());
        return prompts;
    }

    /**
     * Retrieves the prompt with the given name without arguments.
     *
     * @param name prompt name
     * @return the raw {@code prompts/get} result
     */
    public JsonNode getPrompt(String name) { return getPrompt(name, null); }

    /**
     * Retrieves the prompt with the given name and arguments.
     *
     * @param name prompt name
     * @param args arguments for the prompt; may be {@code null}
     * @return the raw {@code prompts/get} result
     */
    public JsonNode getPrompt(String name, Object args) {
        McpValidation.requireNonNull(name, "name");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.PROMPTS_GET, () -> jsonCodec.buildParams(p -> {
                    p.put("name", name);
                    p.set("arguments", jsonCodec.toArgumentsNode(args));
                })));
    }

    /**
     * Requests completions for a prompt argument ({@code completion/complete}).
     *
     * @param promptName the prompt name
     * @param argumentName the argument name
     * @param value the partial value being completed
     * @param contextArguments optional values of other arguments used for context; may be {@code null}
     * @return the raw {@code completion/complete} result
     */
    public JsonNode completePromptArgument(String promptName, String argumentName, String value,
                                           Object contextArguments) {
        McpValidation.requireNonNull(promptName, "promptName");
        McpValidation.requireNonNull(argumentName, "argumentName");
        McpValidation.requireNonNull(value, "value");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.COMPLETION_COMPLETE,
                () -> jsonCodec.buildParams(p -> {
                    ObjectNode ref = p.putObject("ref");
                    ref.put("type", McpTestClientConstants.CompletionRefs.TYPE_PROMPT);
                    ref.put("name", promptName);
                    ObjectNode argument = p.putObject("argument");
                    argument.put("name", argumentName);
                    argument.put("value", value);
                    if (contextArguments != null) {
                        p.putObject("context").set("arguments", jsonCodec.toArgumentsNode(contextArguments));
                    }
                })));
    }
}
