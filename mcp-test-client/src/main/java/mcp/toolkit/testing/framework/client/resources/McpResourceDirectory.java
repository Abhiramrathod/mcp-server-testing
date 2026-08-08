package mcp.toolkit.testing.framework.client.resources;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Map;

public final class McpResourceDirectory {

    private final McpInitializationGuard initGuard;
    private final McpRpcClient rpcClient;
    private final McpJsonCodec jsonCodec;

    /**
     * Creates a resource directory backed by the given RPC client and codec.
     *
     * @param initGuard  initialization guard
     * @param rpcClient  low-level JSON-RPC client
     * @param jsonCodec  JSON codec for payload construction
     */
    public McpResourceDirectory(McpInitializationGuard initGuard, McpRpcClient rpcClient, McpJsonCodec jsonCodec) {
        this.initGuard = McpValidation.requireNonNull(initGuard, "initGuard");
        this.rpcClient = McpValidation.requireNonNull(rpcClient, "rpcClient");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
    }

    /**
     * Lists the first page of available resources.
     *
     * @return the raw {@code resources/list} result
     */
    public JsonNode listResources() { return listResources(Map.of()); }

    /**
     * Lists resources using the given request parameters.
     *
     * @param params request parameters, e.g. a pagination cursor; may be {@code null}
     * @return the raw {@code resources/list} result
     */
    public JsonNode listResources(Object params) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.RESOURCES_LIST, () -> jsonCodec.toJsonNode(params)));
    }

    /**
     * Lists resources using the given pagination cursor.
     *
     * @param cursor opaque cursor from a previous {@code nextCursor}; may be {@code null}
     * @return the raw {@code resources/list} result
     */
    public JsonNode listResources(String cursor) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.RESOURCES_LIST,
                () -> jsonCodec.buildParams(p -> {
                    if (cursor != null) {
                        p.put(McpTestClientConstants.Params.CURSOR, cursor);
                    }
                })));
    }

    /**
     * Returns all resources by following {@code nextCursor} until the last page.
     *
     * @return a JSON array of all resource definitions
     */
    public ArrayNode allResources() {
        ArrayNode resources = jsonCodec.newArrayNode();
        String cursor = null;
        do {
            JsonNode result = listResources(cursor);
            JsonNode page = result.path("resources");
            if (page.isArray()) {
                page.forEach(resources::add);
            }
            cursor = result.path(McpTestClientConstants.Params.NEXT_CURSOR).asText(null);
        } while (cursor != null && !cursor.isBlank());
        return resources;
    }

    /**
     * Reads the resource at the given URI.
     *
     * @param uri resource URI, e.g. {@code "file:///data.txt"}
     * @return the raw {@code resources/read} result
     */
    public JsonNode readResource(String uri) {
        McpValidation.requireNonNull(uri, "uri");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.RESOURCES_READ,
                () -> jsonCodec.buildParams(p -> p.put("uri", uri))));
    }

    /**
     * Lists the available resource templates.
     *
     * @return the raw {@code resources/templates/list} result
     */
    public JsonNode listResourceTemplates() {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.RESOURCES_TEMPLATES_LIST,
                () -> jsonCodec.buildParams(p -> {})));
    }

    /**
     * Returns all resource templates by following {@code nextCursor} until the last page.
     *
     * @return a JSON array of all resource template definitions
     */
    public ArrayNode allResourceTemplates() {
        ArrayNode templates = jsonCodec.newArrayNode();
        String cursor = null;
        do {
            JsonNode result = listResourceTemplates(cursor);
            JsonNode page = result.path("resourceTemplates");
            if (page.isArray()) {
                page.forEach(templates::add);
            }
            cursor = result.path(McpTestClientConstants.Params.NEXT_CURSOR).asText(null);
        } while (cursor != null && !cursor.isBlank());
        return templates;
    }

    /**
     * Lists resource templates using the given pagination cursor.
     *
     * @param cursor opaque cursor from a previous {@code nextCursor}; may be {@code null}
     * @return the raw {@code resources/templates/list} result
     */
    public JsonNode listResourceTemplates(String cursor) {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.RESOURCES_TEMPLATES_LIST,
                () -> jsonCodec.buildParams(p -> {
                    if (cursor != null) {
                        p.put(McpTestClientConstants.Params.CURSOR, cursor);
                    }
                })));
    }

    /**
     * Requests completions for a resource template argument ({@code completion/complete}).
     *
     * @param uriTemplate the template URI, e.g. {@code "file:///{path}"}
     * @param argumentName the argument name
     * @param value the partial value being completed
     * @param contextArguments optional values of other arguments used for context; may be {@code null}
     * @return the raw {@code completion/complete} result
     */
    public JsonNode completeResourceTemplateArgument(String uriTemplate, String argumentName, String value,
                                                     Object contextArguments) {
        McpValidation.requireNonNull(uriTemplate, "uriTemplate");
        McpValidation.requireNonNull(argumentName, "argumentName");
        McpValidation.requireNonNull(value, "value");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.COMPLETION_COMPLETE,
                () -> jsonCodec.buildParams(p -> {
                    ObjectNode ref = p.putObject("ref");
                    ref.put("type", McpTestClientConstants.CompletionRefs.TYPE_RESOURCE);
                    ref.put("uri", uriTemplate);
                    ObjectNode argument = p.putObject("argument");
                    argument.put("name", argumentName);
                    argument.put("value", value);
                    if (contextArguments != null) {
                        p.putObject("context").set("arguments", jsonCodec.toArgumentsNode(contextArguments));
                    }
                })));
    }
}
