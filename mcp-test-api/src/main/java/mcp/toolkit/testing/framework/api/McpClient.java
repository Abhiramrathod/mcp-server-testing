package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.McpTestClient;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

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
        String protocolVersion = result.path("protocolVersion").asText(null);

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
        private String sseEndpointPath = McpClientConfig.DEFAULT_SSE_PATH;
        private McpClientConfig config = McpClientConfig.defaults();
        private boolean initializeOnBuild = false;

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
            this.sseEndpointPath = path;
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
            McpTestClient delegate = new McpTestClient(serverUrl, sseEndpointPath);
            McpClient client = new McpClient(delegate);
            if (initializeOnBuild) {
                client.initialize();
            }
            return client;
        }
    }
}
