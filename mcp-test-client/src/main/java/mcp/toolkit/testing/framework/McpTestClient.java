package mcp.toolkit.testing.framework;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.prompts.McpPromptDirectory;
import mcp.toolkit.testing.framework.client.resources.McpResourceDirectory;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.client.rpc.RpcExchangeTracker;
import mcp.toolkit.testing.framework.client.tools.McpToolDirectory;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.core.util.McpTestClientUtils;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;
import java.util.function.Consumer;

import static mcp.toolkit.testing.framework.core.util.McpTestClientUtils.buildInitializeParams;
import static mcp.toolkit.testing.framework.core.util.McpTestClientUtils.ClientComponents;
import static mcp.toolkit.testing.framework.core.util.McpTestClientUtils.buildComponents;

public class McpTestClient implements AutoCloseable {

    private final ObjectMapper objectMapper;
    private final String protocolVersion;
    private final McpInitializationGuard initGuard;
    private final McpTransport transport;
    private final McpJsonCodec jsonCodec;
    private final McpRpcClient rpcClient;
    private final McpToolDirectory toolDirectory;
    private final McpResourceDirectory resourceDirectory;
    private final McpPromptDirectory promptDirectory;
    private final Object initLock = new Object();

    private volatile boolean initialized;
    private volatile JsonNode initializeResult;

    /**
     * Creates a client connected to the given server URL using the default
     * SSE transport.
     *
     * @param baseUrl base URL of the MCP server, e.g. {@code "http://localhost:8080"}
     */
    public McpTestClient(String baseUrl) {
        this(baseUrl, McpTestClientConstants.Endpoints.SSE, false);
    }

    /**
     * Creates a client connected to the given server URL using the SSE transport
     * with a custom endpoint path.
     *
     * @param baseUrl          base URL of the MCP server
     * @param sseEndpointPath  SSE endpoint path relative to the server URL
     */
    public McpTestClient(String baseUrl, String sseEndpointPath) {
        this(baseUrl, sseEndpointPath, false);
    }

    /**
     * Creates a client connected to the given server URL, choosing between the
     * SSE and Streamable HTTP transports.
     *
     * @param baseUrl           base URL of the MCP server
     * @param endpointPath      endpoint path relative to the server URL
     * @param useStreamableHttp {@code true} to use Streamable HTTP, {@code false} for SSE
     */
    public McpTestClient(String baseUrl, String endpointPath, boolean useStreamableHttp) {
        this(baseUrl, endpointPath, useStreamableHttp,
                new ObjectMapper(), McpTestClientConstants.Defaults.PROTOCOL_VERSION,
                McpTestClientConstants.Defaults.TIMEOUT, Collections.emptyMap());
    }

    /**
     * Creates a fully configured client with explicit transport, codec and
     * connection settings.
     *
     * @param baseUrl           base URL of the MCP server
     * @param endpointPath      endpoint path relative to the server URL
     * @param useStreamableHttp {@code true} to use Streamable HTTP, {@code false} for SSE
     * @param objectMapper      JSON mapper used for serialization and parsing
     * @param protocolVersion   MCP protocol version; may be {@code null} to use the default
     * @param timeout           connection and request timeout
     * @param headers           additional HTTP headers for every request
     */
    public McpTestClient(String baseUrl, String endpointPath, boolean useStreamableHttp,
                         ObjectMapper objectMapper, String protocolVersion,
                         Duration timeout, Map<String, String> headers) {
        this.objectMapper = McpValidation.requireNonNull(objectMapper, "objectMapper");
        this.protocolVersion = McpTestClientUtils.resolveProtocolVersion(protocolVersion);
        this.initGuard = new McpInitializationGuard(this::ensureInitialized);
        ClientComponents components = buildComponents(
                this.objectMapper, this.protocolVersion, baseUrl, endpointPath,
                this.initGuard, useStreamableHttp, timeout, headers);
        this.transport = components.transport();
        this.jsonCodec = components.jsonCodec();
        this.rpcClient = components.rpcClient();
        this.toolDirectory = components.toolDirectory();
        this.resourceDirectory = components.resourceDirectory();
        this.promptDirectory = components.promptDirectory();
        this.rpcClient.setSessionReinitializer(() -> {
            transport.clearSession();
            initialized = false;
            initialize();
        });
    }

    /**
     * Performs the MCP {@code initialize} handshake explicitly.
     *
     * <p>This is optional — the client initializes lazily on first use. Call this
     * when you want initialization to happen at a known point.
     */
    public void initialize() {
        if (initialized) return;
        synchronized (initLock) {
            if (initialized) return;
            transport.connect();
            JsonNode result = rpcClient.callAndRequireResult(
                    McpTestClientConstants.Methods.INITIALIZE,
                    () -> buildInitializeParams(jsonCodec, protocolVersion));
            initialized = true;
            initializeResult = result;
            rpcClient.sendNotification(McpTestClientConstants.Notifications.INITIALIZED, objectMapper::createObjectNode);
        }
    }

    /**
     * Returns {@code true} if the MCP handshake has completed.
     *
     * @return whether the client is initialized
     */
    public boolean isInitialized() { return initialized; }

    /**
     * Returns the raw result of the {@code initialize} handshake, or {@code null}
     * before initialization has completed.
     *
     * @return the raw initialize result, or {@code null} if not yet initialized
     */
    public JsonNode getInitializeResult() { return initializeResult; }

    /**
     * Closes the transport and releases all resources.
     */
    @Override
    public void close() { transport.close(); }

    /**
     * Returns the client for tool discovery and invocation.
     *
     * @return tool directory
     */
    public McpToolDirectory tools() { return toolDirectory; }

    /**
     * Returns the client for resource listing and reading.
     *
     * @return resource directory
     */
    public McpResourceDirectory resources() { return resourceDirectory; }

    /**
     * Returns the client for prompt listing and retrieval.
     *
     * @return prompt directory
     */
    public McpPromptDirectory prompts() { return promptDirectory; }

    /**
     * Returns the tracker holding the history of JSON-RPC exchanges made by
     * this client.
     *
     * @return exchange tracker
     */
    public RpcExchangeTracker exchangeTracker() { return rpcClient.exchangeTracker(); }

    /**
     * Sends a low-level JSON-RPC request and returns the response result.
     *
     * @param method JSON-RPC method, e.g. {@code "tools/call"}
     * @param params request parameters; may be {@code null}
     * @return the response result
     */
    public JsonNode call(String method, Object params) {
        McpValidation.requireNonNull(method, "method");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(method, () -> jsonCodec.toJsonNode(params)));
    }

    /**
     * Sends an MCP {@code ping} request, verifying that the server is reachable and
     * the session is alive.
     *
     * @return the ping result (usually {@code {}})
     */
    public JsonNode ping() {
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.PING, () -> jsonCodec.buildParams(p -> {})));
    }

    /**
     * Sends {@code logging/setLevel} to control server log verbosity.
     *
     * @param level one of {@link McpTestClientConstants.LogLevels}
     */
    public void setLogLevel(String level) {
        McpValidation.requireNonNull(level, "level");
        initGuard.withInitialized(() -> rpcClient.callAndRequireResult(
                McpTestClientConstants.Methods.LOGGING_SET_LEVEL,
                () -> jsonCodec.buildParams(p -> p.put("level", level))));
    }

    /**
     * Sends {@code notifications/cancelled} for a previously issued request.
     *
     * @param requestId id of the request to cancel
     * @param reason    optional reason; may be {@code null}
     */
    public void cancelRequest(long requestId, String reason) {
        rpcClient.cancel(requestId, reason);
    }

    /**
     * Registers a listener for server-initiated JSON-RPC messages (requests and
     * notifications), e.g. {@code roots/list}, {@code sampling/createMessage},
     * {@code notifications/message} and {@code notifications/progress}.
     *
     * @param listener consumer of server messages; may be {@code null} to clear
     */
    public void onServerMessage(Consumer<JsonNode> listener) {
        transport.setServerMessageListener(listener);
    }

    /**
     * Registers a callback invoked when an HTTP session is terminated by the server and a
     * fresh {@code initialize} handshake is required.
     *
     * @param handler re-initialization handler; may be {@code null} to clear
     */
    public void setSessionExpiredHandler(Runnable handler) {
        transport.setSessionExpiredHandler(handler);
    }

    private void ensureInitialized() {
        if (!initialized) initialize();
    }
}
