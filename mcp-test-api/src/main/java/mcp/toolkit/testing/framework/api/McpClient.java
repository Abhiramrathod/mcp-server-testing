package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.McpTestClient;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpProtocolVersions;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * Public entry point for testing MCP servers.
 *
 * <p>Create an instance via the fluent {@link Builder}:
 * <pre>{@code
 * McpClient client = McpClient.connectTo("http://localhost:8080")
 *         .config(McpClientConfig.builder().timeout(Duration.ofSeconds(30)).build())
 *         .initializeOnBuild()
 *         .build();
 *
 * // Server info
 * McpServerInfo info = client.serverInfo();
 * System.out.println(info.name() + " " + info.version());
 *
 * // Tools
 * List<McpTool> tools = client.tools().listTools();
 * McpToolResult result = client.tools().callTool("my-tool", Map.of("key", "value"))
 *         .assertSuccess();
 *
 * // Resources
 * McpResourceContent content = client.resources().readResource("file://data.txt")
 *         .assertNotEmpty();
 *
 * // Prompts
 * McpPromptResult prompt = client.prompts().getPrompt("my-prompt", Map.of("lang", "en"))
 *         .assertNotEmpty();
 *
 * // Exchange assertions
 * client.exchanges().assertLastSucceeded();
 * client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);
 * long p99 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 99);
 *
 * client.close();
 * }</pre>
 *
 * <p>The client initializes lazily on first use. Call {@link #initialize()}
 * explicitly if you need the handshake to happen at a specific point.
 */
public final class McpClient implements AutoCloseable {

    private final McpTestClient delegate;
    private final ToolsClient toolsClient;
    private final ResourcesClient resourcesClient;
    private final PromptsClient promptsClient;
    private final McpExchangeAssertions exchangeAssertions;

    private McpClient(McpTestClient delegate) {
        this.delegate = delegate;
        this.toolsClient = new ToolsClient(delegate.tools());
        this.resourcesClient = new ResourcesClient(delegate.resources());
        this.promptsClient = new PromptsClient(delegate.prompts());
        this.exchangeAssertions = new McpExchangeAssertions(delegate.exchangeTracker());
    }

    // ── Factory ──────────────────────────────────────────────────────────

    /**
     * Starts building a client connected to the given server URL.
     *
     * @param serverUrl base URL of the MCP server, e.g. {@code "http://localhost:8080"}
     * @return a builder for further configuration
     */
    public static Builder connectTo(String serverUrl) {
        return new Builder(serverUrl);
    }

    // ── Lifecycle ────────────────────────────────────────────────────────

    /**
     * Performs the MCP initialize handshake explicitly.
     *
     * <p>This is optional — the client initializes automatically on first use.
     * Call this when you want initialization to happen at a known point,
     * for example in a {@code @BeforeAll} setup method.
     *
     * @return this client, for chaining
     */
    public McpClient initialize() {
        delegate.initialize();
        return this;
    }

    /**
     * Returns {@code true} if the MCP handshake has completed.
     *
     * @return whether the client is initialized
     */
    public boolean isInitialized() {
        return delegate.isInitialized();
    }

    /**
     * Returns the MCP protocol version advertised by this client.
     *
     * @return the protocol version, e.g. {@code "2026-07-28"}
     */
    public String protocolVersion() {
        return delegate.protocolVersion();
    }

    /**
     * Returns {@code true} when the client speaks the stateless protocol
     * (2026-07-28 and later), {@code false} for the legacy session-based
     * protocol (2024-11-05 through 2025-11-25).
     *
     * @return whether the stateless era is in use
     */
    public boolean isStateless() {
        return McpProtocolVersions.isStateless(protocolVersion());
    }

    /**
     * Sends a {@code server/discover} request to learn the server's supported
     * protocol versions, capabilities and identity (stateless era, 2026-07-28+).
     * On legacy servers this returns the {@code initialize} result instead.
     *
     * <p>Triggers initialization if not already done.
     *
     * @return the raw discover (or initialize) result
     */
    public JsonNode discover() {
        return delegate.discover();
    }

    /**
     * Opens a {@code subscriptions/listen} stream (stateless era) to receive
     * opted-in server-to-client change notifications, delivered to the listener
     * registered via {@link #onServerMessage(Consumer)}. This is a no-op for
     * legacy-era clients, which use the HTTP GET SSE stream instead.
     *
     * @param subscriptionTypes subscription type identifiers, e.g.
     *                          {@code "toolsListChanged"}; an empty list subscribes
     *                          to all supported types
     */
    public void startSubscriptions(List<String> subscriptionTypes) {
        delegate.startSubscriptions(subscriptionTypes);
    }

    /**
     * Returns typed information about the connected MCP server.
     *
     * <p>Triggers initialization if not already done.
     *
     * @return server info including name, version, and capabilities
     */
    public McpServerInfo serverInfo() {
        if (!delegate.isInitialized()) {
            delegate.initialize();
        }
        return parseServerInfo(delegate.getInitializeResult());
    }

    /**
     * Sends an MCP {@code ping} request, verifying that the server is reachable and
     * the session is alive.
     *
     * <p>Legacy-era only: {@code ping} was removed from the stateless protocol
     * (2026-07-28+), where requests are answered directly.
     *
     * <p>Triggers initialization if not already done.
     */
    public void ping() {
        if (!delegate.isInitialized()) {
            delegate.initialize();
        }
        delegate.ping();
    }

    /**
     * Sends a low-level JSON-RPC request and returns the response result.
     *
     * <p>Triggers initialization if not already done.
     *
     * @param method JSON-RPC method, e.g. {@code "tools/call"}
     * @param params request parameters; may be {@code null}
     * @return the response result
     */
    public JsonNode call(String method, Object params) {
        return delegate.call(method, params);
    }

    /**
     * Sends a low-level JSON-RPC request with a per-request log level (stateless
     * era, 2026-07-28+); the level is ignored by legacy servers.
     *
     * @param method JSON-RPC method, e.g. {@code "tools/call"}
     * @param params request parameters; may be {@code null}
     * @param logLevel RFC 5424 level such as {@code "debug"} or {@code "info"}
     * @return the response result
     */
    public JsonNode call(String method, Object params, String logLevel) {
        return delegate.call(method, params, logLevel);
    }

    /**
     * Sends a request and resolves stateless-era Multi Round-Trip Requests
     * (MRTR) by retrying until the server returns a complete result. On each
     * {@code input_required} interim result the {@code inputResponsesProvider}
     * receives the server's {@code inputRequests} array and must return the
     * value to send under {@code inputResponses}.
     *
     * <p>Triggers initialization if not already done.
     *
     * @param method                 JSON-RPC method
     * @param params                 request parameters; may be {@code null}
     * @param inputResponsesProvider supplies {@code inputResponses} for the
     *                               {@code inputRequests} array from the server
     * @param maxRoundTrips          maximum number of request/input round trips
     * @return the final, complete result
     * @throws IllegalStateException if the server never returns a complete result
     */
    public JsonNode callWithInputResponses(String method, Object params,
                                           Function<JsonNode, JsonNode> inputResponsesProvider,
                                           int maxRoundTrips) {
        return delegate.callWithInputResponses(method, params, inputResponsesProvider, maxRoundTrips);
    }

    /**
     * Returns whether the given result is an MRTR interim result
     * ({@code resultType == "input_required"}).
     *
     * @param result a request result; may be {@code null}
     * @return {@code true} if the result requests additional input
     */
    public static boolean isInputRequired(JsonNode result) {
        return McpTestClient.isInputRequired(result);
    }

    /**
     * Controls server log verbosity via {@code logging/setLevel}.
     *
     * <p>Levels follow RFC 5424 syslog severities. Legacy-era only: the stateless
     * protocol (2026-07-28+) carries the level per request instead, via
     * {@link #call(String, Object, String)}. Triggers initialization if not already done.
     *
     * @param level level such as {@code "debug"}, {@code "info"} or {@code "warning"}
     */
    public void setLogLevel(String level) {
        if (!delegate.isInitialized()) {
            delegate.initialize();
        }
        delegate.setLogLevel(level);
    }

    /**
     * Sends {@code notifications/cancelled} for a previously issued request
     * (MCP cancellation support).
     *
     * @param requestId id of the request to cancel
     * @param reason    optional reason; may be {@code null}
     */
    public void cancelRequest(long requestId, String reason) {
        delegate.cancelRequest(requestId, reason);
    }

    /**
     * Registers a listener for server-initiated JSON-RPC messages (requests and
     * notifications), e.g. {@code roots/list}, {@code sampling/createMessage},
     * {@code notifications/message} and {@code notifications/progress}.
     *
     * <p>Triggers initialization if not already done.
     *
     * @param listener consumer of server messages; may be {@code null} to clear
     */
    public void onServerMessage(Consumer<JsonNode> listener) {
        if (!delegate.isInitialized()) {
            delegate.initialize();
        }
        delegate.onServerMessage(listener);
    }

    /**
     * Registers a callback invoked when an HTTP session is terminated by the server and a
     * fresh {@code initialize} handshake is required.
     *
     * @param handler re-initialization handler; may be {@code null} to clear
     */
    public void setSessionExpiredHandler(Runnable handler) {
        delegate.setSessionExpiredHandler(handler);
    }

    /**
     * Closes the connection and releases all resources.
     */
    @Override
    public void close() {
        delegate.close();
    }

    // ── Domain clients ───────────────────────────────────────────────────

    /**
     * Returns the typed client for tool discovery and invocation.
     *
     * @return tools client
     */
    public ToolsClient tools() {
        return toolsClient;
    }

    /**
     * Returns the typed client for resource listing and reading.
     *
     * @return resources client
     */
    public ResourcesClient resources() {
        return resourcesClient;
    }

    /**
     * Returns the typed client for prompt listing and retrieval.
     *
     * @return prompts client
     */
    public PromptsClient prompts() {
        return promptsClient;
    }

    /**
     * Returns the exchange assertions helper for inspecting and asserting
     * on the history of JSON-RPC calls made by this client.
     *
     * @return exchange assertions
     */
    public McpExchangeAssertions exchanges() {
        return exchangeAssertions;
    }

    // ── Internal ─────────────────────────────────────────────────────────

    private static McpServerInfo parseServerInfo(JsonNode result) {
        if (result == null || result.isNull()) {
            return new McpServerInfo(null, null, null, Set.of(), result);
        }
        JsonNode serverInfo = result.path("serverInfo");
        String name = serverInfo.path("name").asText(null);
        String version = serverInfo.path("version").asText(null);
        if (name == null) {
            // Stateless (2026-07-28+) servers identify themselves via _meta.
            JsonNode metaServerInfo = result.path("_meta")
                    .path(McpTestClientConstants.Meta.SERVER_INFO);
            if (metaServerInfo.isObject()) {
                name = metaServerInfo.path("name").asText(null);
                version = metaServerInfo.path("version").asText(null);
            }
        }
        String protocolVersion = result.path("protocolVersion").asText(null);
        if (protocolVersion == null) {
            // Stateless server/discover returns a protocolVersions array.
            JsonNode versions = result.path("protocolVersions");
            if (versions.isArray() && !versions.isEmpty()) {
                protocolVersion = versions.get(versions.size() - 1).asText(null);
            }
        }

        Set<String> capabilities = new HashSet<>();
        JsonNode caps = result.path("capabilities");
        if (caps.isObject()) {
            Iterator<String> fields = caps.fieldNames();
            while (fields.hasNext()) {
                capabilities.add(fields.next());
            }
        }
        return new McpServerInfo(name, version, protocolVersion, capabilities, result);
    }

    // ── Builder ──────────────────────────────────────────────────────────

    /**
     * Fluent builder for {@link McpClient}.
     */
    public static final class Builder {

        private final String serverUrl;
        private String endpointPath = McpClientConfig.DEFAULT_SSE_PATH;
        private McpClientConfig config = McpClientConfig.defaults();
        private boolean initializeOnBuild = false;
        private boolean useStreamableHttp = false;

        private Builder(String serverUrl) {
            this.serverUrl = serverUrl;
        }

        /**
         * Overrides the SSE endpoint path (default: {@code /sse}).
         *
         * @param path SSE endpoint path relative to the server URL
         * @return this builder
         */
        public Builder sseEndpoint(String path) {
            this.endpointPath = path;
            return this;
        }

        /**
         * Explicitly selects the SSE (Server-Sent Events) transport with the
         * default endpoint path ({@code /sse}). This is the default transport,
         * so this call is optional.
         *
         * @return this builder
         */
        public Builder sse() {
            this.useStreamableHttp = false;
            this.endpointPath = McpClientConfig.DEFAULT_SSE_PATH;
            return this;
        }

        /**
         * Configures the client to use Streamable HTTP transport with the
         * default endpoint path ({@code /mcp}).
         *
         * @return this builder
         */
        public Builder streamableHttp() {
            this.useStreamableHttp = true;
            this.endpointPath = McpClientConfig.DEFAULT_MCP_PATH;
            return this;
        }

        /**
         * Configures the client to use Streamable HTTP transport with the
         * given endpoint path.
         *
         * @param path Streamable HTTP endpoint path relative to the server URL
         * @return this builder
         */
        public Builder streamableHttp(String path) {
            this.useStreamableHttp = true;
            this.endpointPath = path;
            return this;
        }

        /**
         * Applies the given configuration (timeout, protocol version).
         *
         * @param config client configuration
         * @return this builder
         */
        public Builder config(McpClientConfig config) {
            if (config == null) throw new IllegalArgumentException("config must not be null");
            this.config = config;
            return this;
        }

        /**
         * Causes {@link #build()} to immediately perform the MCP initialize
         * handshake before returning the client.
         *
         * @return this builder
         */
        public Builder initializeOnBuild() {
            this.initializeOnBuild = true;
            return this;
        }

        /**
         * Builds and returns the configured {@link McpClient}.
         *
         * @return ready-to-use MCP client
         */
        public McpClient build() {
            McpTestClient delegate = new McpTestClient(serverUrl, endpointPath, useStreamableHttp,
                    config.objectMapper(), config.protocolVersion(), config.timeout(), config.headers());
            McpClient client = new McpClient(delegate);
            if (initializeOnBuild) {
                client.initialize();
            }
            return client;
        }
    }
}
