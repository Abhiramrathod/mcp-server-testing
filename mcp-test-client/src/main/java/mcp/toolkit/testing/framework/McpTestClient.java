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

    public McpTestClient(String baseUrl) {
        this(baseUrl, McpTestClientConstants.Endpoints.SSE);
    }

    public McpTestClient(String baseUrl, String sseEndpointPath) {
        this(new ObjectMapper(), McpTestClientConstants.Defaults.PROTOCOL_VERSION, baseUrl, sseEndpointPath);
    }

    private McpTestClient(ObjectMapper objectMapper, String protocolVersion,
                          String baseUrl, String sseEndpointPath) {
        this.objectMapper = McpValidation.requireNonNull(objectMapper, "objectMapper");
        this.protocolVersion = McpTestClientUtils.resolveProtocolVersion(protocolVersion);
        this.initGuard = new McpInitializationGuard(this::ensureInitialized);
        ClientComponents components = buildComponents(
                this.objectMapper, this.protocolVersion, baseUrl, sseEndpointPath, this.initGuard);
        this.transport = components.transport();
        this.jsonCodec = components.jsonCodec();
        this.rpcClient = components.rpcClient();
        this.toolDirectory = components.toolDirectory();
        this.resourceDirectory = components.resourceDirectory();
        this.promptDirectory = components.promptDirectory();
    }

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

    public boolean isInitialized() { return initialized; }

    public JsonNode getInitializeResult() { return initializeResult; }

    @Override
    public void close() { transport.close(); }

    public McpToolDirectory tools() { return toolDirectory; }

    public McpResourceDirectory resources() { return resourceDirectory; }

    public McpPromptDirectory prompts() { return promptDirectory; }

    public RpcExchangeTracker exchangeTracker() { return rpcClient.exchangeTracker(); }

    public JsonNode call(String method, Object params) {
        McpValidation.requireNonNull(method, "method");
        return initGuard.withInitialized(() -> rpcClient.callAndRequireResult(method, () -> jsonCodec.toJsonNode(params)));
    }

    private void ensureInitialized() {
        if (!initialized) initialize();
    }
}
