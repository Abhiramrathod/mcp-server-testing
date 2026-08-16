package mcp.toolkit.testing.examples.server;

import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpProtocolVersions;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Dummy MCP server for testing the framework.
 *
 * <p>Exposes every transport the framework supports on one base URL:
 *
 * <ul>
 *   <li><b>Legacy SSE</b> ({@code 2024-11-05} – {@code 2025-11-25}): {@code GET /sse}
 *       opens the event stream, {@code POST /message} receives JSON-RPC.</li>
 *   <li><b>Streamable HTTP</b> ({@code 2025-03-26}+): a single {@code POST /mcp}
 *       endpoint answered with {@code application/json} and a server-minted
 *       {@code Mcp-Session-Id} issued during {@code initialize}.</li>
 *   <li><b>Stateless</b> ({@code 2026-07-28}+): {@code POST /mcp} without any
 *       session, answered directly per request; {@code server/discover} negotiates
 *       protocol versions and results carry {@code _meta.serverInfo}.</li>
 * </ul>
 */
public class DummyMcpServer {

    private final HttpServer server;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, SseStream> sseClients = new ConcurrentHashMap<>();
    private final Set<String> sessions = ConcurrentHashMap.newKeySet();
    private final AtomicLong sessionCounter = new AtomicLong();

    private static final ScheduledExecutorService HEARTBEATS = newHeartbeatExecutor();

    /**
     * Creates a server bound to the given port.
     *
     * @param port port to bind to; {@code 0} selects an ephemeral port
     * @throws IOException if the server cannot bind to the port
     */
    public DummyMcpServer(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newCachedThreadPool());
        
        server.createContext("/sse", this::handleSse);
        server.createContext("/message", this::handleMessage);
        server.createContext("/mcp", this::handleMcp);
    }

    /** Starts the server so it begins accepting connections. */
    public void start() {
        server.start();
        System.out.println("Dummy MCP Server started on port " + port());
    }

    /** Stops the server and releases its resources. */
    public void stop() {
        server.stop(0);
    }

    /** Returns the bound port ({@code 0} selects an ephemeral port). */
    public int port() {
        return server.getAddress().getPort();
    }

    /** Returns the base URL clients connect to, e.g. {@code http://localhost:8080}. */
    public String baseUrl() {
        return "http://localhost:" + port();
    }

    private void handleSse(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
        exchange.getResponseHeaders().set("Cache-Control", "no-cache");
        exchange.getResponseHeaders().set("Connection", "keep-alive");
        exchange.sendResponseHeaders(200, 0);

        try (OutputStream os = exchange.getResponseBody()) {
            SseStream stream = new SseStream(os);
            String clientId = "client-" + System.currentTimeMillis();
            sseClients.put(clientId, stream);

            sendSseEvent(stream, "endpoint", "/message");

            // Heartbeats are scheduled instead of a Thread.sleep loop: a failed
            // write detects a disconnected client and releases the handler thread.
            CountDownLatch disconnected = new CountDownLatch(1);
            ScheduledFuture<?> heartbeat = HEARTBEATS.scheduleWithFixedDelay(() -> {
                try {
                    stream.write(": keep-alive\n\n".getBytes(StandardCharsets.UTF_8));
                } catch (IOException e) {
                    disconnected.countDown();
                }
            }, 1, 1, TimeUnit.SECONDS);

            try {
                disconnected.await();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                heartbeat.cancel(false);
                sseClients.remove(clientId);
            }
        }
    }

    private void handleMessage(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        JsonNode request = mapper.readTree(body);
        
        String method = request.path("method").asText();
        JsonNode params = request.path("params");
        long id = request.path("id").asLong(-1);

        JsonNode response = handleRpcMethod(method, params, id);

        for (SseStream stream : sseClients.values()) {
            sendSseEvent(stream, "message", mapper.writeValueAsString(response));
        }

        exchange.sendResponseHeaders(202, -1);
    }

    private void handleMcp(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        JsonNode request = mapper.readTree(body);
        String method = request.path("method").asText();
        if (!request.has("id")) {
            // Notification: acknowledge without a JSON-RPC response.
            exchange.sendResponseHeaders(202, -1);
            return;
        }
        long id = request.path("id").asLong(-1);
        JsonNode params = request.path("params");

        String sessionId = exchange.getRequestHeaders().getFirst(McpTestClientConstants.Headers.MCP_SESSION_ID);
        String protocolHeader = exchange.getRequestHeaders().getFirst(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION);
        boolean stateless = McpProtocolVersions.isStateless(protocolHeader)
                || exchange.getRequestHeaders().containsKey(McpTestClientConstants.Headers.MCP_METHOD);

        if ("server/discover".equals(method)) {
            sendJson(exchange, 200, jsonRpcResponse(id, handleDiscover()));
            return;
        }
        if ("initialize".equals(method)) {
            String newSessionId = "dummy-session-" + sessionCounter.incrementAndGet();
            sessions.add(newSessionId);
            exchange.getResponseHeaders().set(McpTestClientConstants.Headers.MCP_SESSION_ID, newSessionId);
            sendJson(exchange, 200, jsonRpcResponse(id, handleInitialize(params.path("protocolVersion").asText())));
            return;
        }
        if (!stateless && (sessionId == null || !sessions.contains(sessionId))) {
            // Unknown or expired session: signal the client to re-initialize.
            exchange.sendResponseHeaders(404, -1);
            return;
        }

        sendJson(exchange, 200, handleRpcMethod(method, params, id, stateless));
    }

    private void sendJson(HttpExchange exchange, int status, JsonNode body) throws IOException {
        byte[] bytes = mapper.writeValueAsBytes(body);
        exchange.getResponseHeaders().set("Content-Type", McpTestClientConstants.Headers.CONTENT_TYPE_JSON);
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.getResponseBody().close();
    }

    private JsonNode jsonRpcResponse(long id, JsonNode result) {
        ObjectNode response = mapper.createObjectNode();
        response.put("jsonrpc", "2.0");
        response.put("id", id);
        response.set("result", result);
        return response;
    }

    private JsonNode handleRpcMethod(String method, JsonNode params, long id) {
        return handleRpcMethod(method, params, id, false);
    }

    private JsonNode handleRpcMethod(String method, JsonNode params, long id, boolean stateless) {
        ObjectNode response = mapper.createObjectNode();
        response.put("jsonrpc", "2.0");
        response.put("id", id);

        try {
            JsonNode result = switch (method) {
                case "initialize" -> handleInitialize(params.path("protocolVersion").asText());
                case "ping" -> mapper.createObjectNode();
                case "tools/list" -> handleToolsList();
                case "tools/call" -> handleToolsCall(params);
                case "resources/list" -> handleResourcesList();
                case "resources/read" -> handleResourcesRead(params);
                case "prompts/list" -> handlePromptsList();
                case "prompts/get" -> handlePromptsGet(params);
                default -> throw new IllegalArgumentException("Unknown method: " + method);
            };
            if (stateless) {
                addServerInfoMeta(result);
            }
            response.set("result", result);
        } catch (Exception e) {
            ObjectNode error = mapper.createObjectNode();
            error.put("code", -32603);
            error.put("message", e.getMessage());
            response.set("error", error);
        }

        return response;
    }

    private JsonNode handleDiscover() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode versions = result.putArray("protocolVersions");
        versions.add(McpProtocolVersions.V2024_11_05);
        versions.add(McpProtocolVersions.V2025_03_26);
        versions.add(McpProtocolVersions.V2025_06_18);
        versions.add(McpProtocolVersions.V2025_11_25);
        versions.add(McpProtocolVersions.V2026_07_28);
        result.put("protocolVersion", McpProtocolVersions.LATEST);

        ObjectNode serverInfo = result.putObject("serverInfo");
        serverInfo.put("name", "dummy-mcp-server");
        serverInfo.put("version", "1.0.0");

        ObjectNode capabilities = result.putObject("capabilities");
        capabilities.putObject("tools");
        capabilities.putObject("resources");
        capabilities.putObject("prompts");

        addServerInfoMeta(result);
        return result;
    }

    private void addServerInfoMeta(JsonNode result) {
        if (!(result instanceof ObjectNode resultNode)) {
            return;
        }
        ObjectNode meta = resultNode.path("_meta").isObject()
                ? (ObjectNode) resultNode.get("_meta")
                : resultNode.putObject("_meta");
        ObjectNode serverInfo = meta.putObject(McpTestClientConstants.Meta.SERVER_INFO);
        serverInfo.put("name", "dummy-mcp-server");
        serverInfo.put("version", "1.0.0");
    }

    private JsonNode handleInitialize(String requestedProtocolVersion) {
        ObjectNode result = mapper.createObjectNode();
        result.put("protocolVersion", negotiateProtocolVersion(requestedProtocolVersion));
        
        ObjectNode serverInfo = result.putObject("serverInfo");
        serverInfo.put("name", "dummy-mcp-server");
        serverInfo.put("version", "1.0.0");
        
        ObjectNode capabilities = result.putObject("capabilities");
        capabilities.putObject("tools");
        capabilities.putObject("resources");
        capabilities.putObject("prompts");
        
        return result;
    }

    private String negotiateProtocolVersion(String requestedProtocolVersion) {
        return requestedProtocolVersion == null || requestedProtocolVersion.isBlank()
                ? McpProtocolVersions.V2024_11_05
                : requestedProtocolVersion;
    }

    private JsonNode handleToolsList() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode tools = result.putArray("tools");
        
        ObjectNode calc = tools.addObject();
        calc.put("name", "calculator");
        calc.put("description", "Performs basic arithmetic operations");
        ObjectNode calcSchema = calc.putObject("inputSchema");
        calcSchema.put("type", "object");
        ObjectNode calcProps = calcSchema.putObject("properties");
        calcProps.putObject("operation").put("type", "string");
        calcProps.putObject("a").put("type", "number");
        calcProps.putObject("b").put("type", "number");
        
        ObjectNode greet = tools.addObject();
        greet.put("name", "greet");
        greet.put("description", "Generates a greeting message");
        ObjectNode greetSchema = greet.putObject("inputSchema");
        greetSchema.put("type", "object");
        greetSchema.putObject("properties").putObject("name").put("type", "string");
        
        return result;
    }

    private JsonNode handleToolsCall(JsonNode params) {
        String toolName = params.path("name").asText();
        JsonNode args = params.path("arguments");
        
        ObjectNode result = mapper.createObjectNode();
        ArrayNode content = result.putArray("content");
        
        String text = switch (toolName) {
            case "calculator" -> {
                String op = args.path("operation").asText();
                double a = args.path("a").asDouble();
                double b = args.path("b").asDouble();
                yield switch (op) {
                    case "add" -> String.valueOf(a + b);
                    case "subtract" -> String.valueOf(a - b);
                    case "multiply" -> String.valueOf(a * b);
                    case "divide" -> String.valueOf(a / b);
                    default -> throw new IllegalArgumentException("Invalid operation: " + op);
                };
            }
            case "greet" -> "Hello, " + args.path("name").asText("World") + "!";
            default -> throw new IllegalArgumentException("Unknown tool: " + toolName);
        };
        
        ObjectNode item = content.addObject();
        item.put("type", "text");
        item.put("text", text);
        
        return result;
    }

    private JsonNode handleResourcesList() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode resources = result.putArray("resources");
        
        ObjectNode config = resources.addObject();
        config.put("uri", "file:///data/config.json");
        config.put("name", "Configuration");
        config.put("description", "Server configuration file");
        config.put("mimeType", "application/json");
        
        ObjectNode readme = resources.addObject();
        readme.put("uri", "file:///data/readme.txt");
        readme.put("name", "README");
        readme.put("description", "Welcome documentation");
        readme.put("mimeType", "text/plain");
        
        return result;
    }

    private JsonNode handleResourcesRead(JsonNode params) {
        String uri = params.path("uri").asText();
        
        ObjectNode result = mapper.createObjectNode();
        ArrayNode contents = result.putArray("contents");
        
        String text = switch (uri) {
            case "file:///data/config.json" -> "{\"version\": \"1.0\", \"enabled\": true}";
            case "file:///data/readme.txt" -> "Welcome to the dummy MCP server!";
            default -> throw new IllegalArgumentException("Resource not found: " + uri);
        };
        
        ObjectNode item = contents.addObject();
        item.put("uri", uri);
        item.put("mimeType", uri.endsWith(".json") ? "application/json" : "text/plain");
        item.put("text", text);
        
        return result;
    }

    private JsonNode handlePromptsList() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode prompts = result.putArray("prompts");
        
        ObjectNode translate = prompts.addObject();
        translate.put("name", "translate");
        translate.put("description", "Translates text to another language");
        ArrayNode translateArgs = translate.putArray("arguments");
        ObjectNode langArg = translateArgs.addObject();
        langArg.put("name", "language");
        langArg.put("description", "Target language");
        langArg.put("required", true);
        ObjectNode textArg = translateArgs.addObject();
        textArg.put("name", "text");
        textArg.put("description", "Text to translate");
        textArg.put("required", true);
        
        ObjectNode codeReview = prompts.addObject();
        codeReview.put("name", "code-review");
        codeReview.put("description", "Reviews code for issues");
        ArrayNode reviewArgs = codeReview.putArray("arguments");
        ObjectNode codeArg = reviewArgs.addObject();
        codeArg.put("name", "code");
        codeArg.put("description", "Code to review");
        codeArg.put("required", true);
        
        return result;
    }

    private JsonNode handlePromptsGet(JsonNode params) {
        String promptName = params.path("name").asText();
        JsonNode args = params.path("arguments");
        
        ObjectNode result = mapper.createObjectNode();
        result.put("description", "Generated prompt for " + promptName);
        ArrayNode messages = result.putArray("messages");
        
        switch (promptName) {
            case "translate" -> {
                String lang = args.path("language").asText();
                String text = args.path("text").asText();
                ObjectNode msg = messages.addObject();
                msg.put("role", "user");
                msg.put("text", "Please translate the following text to " + lang + ": " + text);
            }
            case "code-review" -> {
                String code = args.path("code").asText();
                ObjectNode msg = messages.addObject();
                msg.put("role", "user");
                msg.put("text", "Please review this code: " + code);
            }
            default -> throw new IllegalArgumentException("Unknown prompt: " + promptName);
        }
        
        return result;
    }

    private void sendSseEvent(SseStream stream, String event, String data) {
        try {
            String message = "event: " + event + "\ndata: " + data + "\n\n";
            stream.write(message.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            // Client disconnected, ignore
        }
    }

    /**
     * Bundles an SSE connection's {@link OutputStream} with a dedicated lock so
     * concurrent broadcast writes and heartbeats are serialized per stream.
     */
    private static final class SseStream {

        private final OutputStream os;
        private final Object lock = new Object();

        SseStream(OutputStream os) {
            this.os = os;
        }

        void write(byte[] bytes) throws IOException {
            synchronized (lock) {
                os.write(bytes);
                os.flush();
            }
        }
    }

    private static ScheduledExecutorService newHeartbeatExecutor() {
        return Executors.newSingleThreadScheduledExecutor(r -> {
            Thread thread = new Thread(r, "dummy-mcp-server-heartbeat");
            thread.setDaemon(true);
            return thread;
        });
    }

    /**
     * Entry point; starts a dummy MCP server on port {@code 8080}.
     *
     * @param args command-line arguments (ignored)
     * @throws IOException if the server cannot bind to port {@code 8080}
     */
    public static void main(String[] args) throws IOException {
        DummyMcpServer server = new DummyMcpServer(8080);
        server.start();
        
        Runtime.getRuntime().addShutdownHook(new Thread(server::stop));
        
        System.out.println("Press Ctrl+C to stop");
    }
}
