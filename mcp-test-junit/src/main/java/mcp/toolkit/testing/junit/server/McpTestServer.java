package mcp.toolkit.testing.junit.server;

import mcp.toolkit.testing.junit.annotation.Transport;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.BiConsumer;

/**
 * Embedded in-process MCP server used to exercise the framework's client against
 * a controllable server without external dependencies.
 *
 * <p>The server is configured via {@link #builder()} and started with
 * {@link #start()}. Tools, resources, resource templates, prompts and completions
 * are registered before or after startup; handlers are looked up at request time.
 *
 * <p>Typical use inside a JUnit 5 test:
 * <pre>{@code
 * McpTestServer server = McpTestServer.builder()
 *         .transport(Transport.STREAMABLE_HTTP)
 *         .build();
 * server.start();
 * server.addTool("calculator", "Adds two numbers", args -> {
 *     double a = args.path("a").asDouble();
 *     double b = args.path("b").asDouble();
 *     return McpResponses.toolText(String.valueOf(a + b));
 * });
 * try (McpClient client = McpClient.connectTo(server.baseUrl()).streamableHttp().build()) {
 *     ...
 * }
 * server.stop();
 * }</pre>
 */
public final class McpTestServer implements AutoCloseable {

    private final String name;
    private final String version;
    private final String protocolVersion;
    private final int port;
    private final Transport transport;
    private final ObjectMapper mapper = new ObjectMapper();

    private final ConcurrentHashMap<String, ToolRegistration> tools = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ResourceRegistration> resources = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ResourceTemplateRegistration> resourceTemplates = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, PromptRegistration> prompts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, CompletionRegistration> completions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, MethodHandler> customMethods = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Boolean> activeSessions = new ConcurrentHashMap<>();

    private final CopyOnWriteArrayList<OutputStream> sseStreams = new CopyOnWriteArrayList<>();

    private volatile HttpServer server;
    private volatile ExecutorService executor;
    private volatile boolean running;

    private McpTestServer(Builder builder) {
        this.name = builder.name;
        this.version = builder.version;
        this.protocolVersion = builder.protocolVersion;
        this.port = builder.port;
        this.transport = builder.transport;
    }

    // ── Builder ──────────────────────────────────────────────────────────

    /**
     * Returns a new server builder.
     *
     * @return builder
     */
    public static Builder builder() {
        return new Builder();
    }

    /** Fluent builder for {@link McpTestServer}. */
    public static final class Builder {

        private String name = "mcp-test-server";
        private String version = "1.0.0";
        private String protocolVersion = "2024-11-05";
        private int port = 0;
        private Transport transport = Transport.SSE;

        private Builder() {}

        /**
         * Sets the advertised server name returned during the initialize handshake.
         *
         * @param name server name
         * @return this builder
         */
        public Builder name(String name) {
            this.name = name;
            return this;
        }

        /**
         * Sets the advertised server version returned during the initialize handshake.
         *
         * @param version server version
         * @return this builder
         */
        public Builder version(String version) {
            this.version = version;
            return this;
        }

        /**
         * Sets the MCP protocol version advertised during the initialize handshake.
         *
         * @param protocolVersion protocol version string
         * @return this builder
         */
        public Builder protocolVersion(String protocolVersion) {
            this.protocolVersion = protocolVersion;
            return this;
        }

        /** Port to bind; {@code 0} selects an ephemeral port. */
        public Builder port(int port) {
            this.port = port;
            return this;
        }

        /**
         * Selects the transport the embedded server speaks.
         *
         * @param transport transport
         * @return this builder
         */
        public Builder transport(Transport transport) {
            this.transport = transport;
            return this;
        }

        /**
         * Builds and returns the configured {@link McpTestServer}.
         *
         * @return server
         */
        public McpTestServer build() {
            return new McpTestServer(this);
        }
    }

    // ── Registration ─────────────────────────────────────────────────────

    /**
     * Registers a tool.
     *
     * @param name        tool name
     * @param description tool description
     * @param inputSchema JSON Schema for the tool arguments
     * @param handler     invoked with the {@code arguments} object
     */
    public void addTool(String name, String description, JsonNode inputSchema, ToolHandler handler) {
        tools.put(name, new ToolRegistration(name, description, inputSchema, handler));
    }

    /**
     * Registers a tool with an open {@code {type: "object"}} schema.
     *
     * @param name        tool name
     * @param description tool description
     * @param handler     invoked with the {@code arguments} object
     */
    public void addTool(String name, String description, ToolHandler handler) {
        ObjectNode schema = mapper.createObjectNode();
        schema.put("type", "object");
        schema.putObject("properties");
        addTool(name, description, schema, handler);
    }

    /**
     * Registers a resource served at the given URI.
     *
     * @param uri       resource URI
     * @param name      resource name
     * @param mimeType  resource MIME type
     * @param handler   invoked with the {@code resources/read} params
     */
    public void addResource(String uri, String name, String mimeType, ResourceHandler handler) {
        addResource(uri, name, null, mimeType, handler);
    }

    /**
     * Registers a resource served at the given URI with a description.
     *
     * @param uri         resource URI
     * @param name        resource name
     * @param description resource description, may be {@code null}
     * @param mimeType    resource MIME type
     * @param handler     invoked with the {@code resources/read} params
     */
    public void addResource(String uri, String name, String description, String mimeType, ResourceHandler handler) {
        resources.put(uri, new ResourceRegistration(uri, name, description, mimeType, handler));
    }

    /**
     * Registers a resource template (e.g. {@code "file:///{path}"}).
     *
     * @param uriTemplate template URI with {@code {placeholder}} segments
     * @param name        template name
     * @param mimeType    MIME type of matched resources
     * @param handler     invoked with the {@code resources/read} params
     */
    public void addResourceTemplate(String uriTemplate, String name, String mimeType, ResourceHandler handler) {
        addResourceTemplate(uriTemplate, name, null, mimeType, handler);
    }

    /**
     * Registers a resource template with a description.
     *
     * @param uriTemplate template URI with {@code {placeholder}} segments
     * @param name        template name
     * @param description template description, may be {@code null}
     * @param mimeType    MIME type of matched resources
     * @param handler     invoked with the {@code resources/read} params
     */
    public void addResourceTemplate(String uriTemplate, String name, String description,
                                    String mimeType, ResourceHandler handler) {
        resourceTemplates.put(uriTemplate,
                new ResourceTemplateRegistration(uriTemplate, name, description, mimeType, handler));
    }

    /**
     * Registers a prompt with no declared arguments.
     *
     * @param name        prompt name
     * @param description prompt description
     * @param handler     invoked with the {@code prompts/get} params
     */
    public void addPrompt(String name, String description, PromptHandler handler) {
        addPrompt(name, description, List.of(), handler);
    }

    /**
     * Registers a prompt with declared arguments.
     *
     * @param name        prompt name
     * @param description prompt description
     * @param arguments   declared prompt arguments
     * @param handler     invoked with the {@code prompts/get} params
     */
    public void addPrompt(String name, String description, List<PromptArgument> arguments, PromptHandler handler) {
        prompts.put(name, new PromptRegistration(name, description, arguments, handler));
    }

    /**
     * Registers a completion provider for a prompt argument.
     *
     * @param promptName  prompt name
     * @param argumentName argument name
     * @param handler     returns suggested values; invoked with the
     *                    {@code completion/complete} params
     */
    public void addPromptCompletion(String promptName, String argumentName, CompletionHandler handler) {
        completions.put(completionKey(CompletionRefs.PROMPT, promptName, argumentName),
                new CompletionRegistration(CompletionRefs.PROMPT, promptName, argumentName, handler));
    }

    /**
     * Registers a completion provider for a resource template argument.
     *
     * @param uriTemplate  template URI
     * @param argumentName argument name
     * @param handler      returns suggested values; invoked with the
     *                     {@code completion/complete} params
     */
    public void addResourceCompletion(String uriTemplate, String argumentName, CompletionHandler handler) {
        completions.put(completionKey(CompletionRefs.RESOURCE, uriTemplate, argumentName),
                new CompletionRegistration(CompletionRefs.RESOURCE, uriTemplate, argumentName, handler));
    }

    /**
     * Registers a handler for an arbitrary MCP method not covered by the built-in
     * dispatch (for example {@code custom/echo}).
     *
     * @param method  JSON-RPC method name
     * @param handler invoked with the {@code params} object
     */
    public void onMethod(String method, MethodHandler handler) {
        customMethods.put(method, handler);
    }

    // ── Lifecycle ────────────────────────────────────────────────────────

    /** Starts the embedded HTTP server. */
    public void start() throws IOException {
        if (running) return;
        InetSocketAddress address = new InetSocketAddress(port);
        server = HttpServer.create(address, 0);
        executor = Executors.newCachedThreadPool(r -> {
            Thread t = new Thread(r, "mcp-test-server-" + r.hashCode());
            t.setDaemon(true);
            return t;
        });
        server.setExecutor(executor);

        if (transport == Transport.STREAMABLE_HTTP) {
            server.createContext("/mcp", this::handleStreamableHttp);
        } else {
            server.createContext("/sse", this::handleSse);
            server.createContext("/mcp/message", this::handleSseMessage);
        }

        server.start();
        running = true;
    }

    /** Stops the embedded HTTP server and closes all open SSE connections. */
    public void stop() {
        if (!running) return;
        running = false;
        if (server != null) {
            server.stop(0);
        }
        for (OutputStream stream : sseStreams) {
            try {
                stream.close();
            } catch (IOException ignored) {
                // already closed
            }
        }
        sseStreams.clear();
        activeSessions.clear();
        if (executor != null) {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                executor.shutdownNow();
            }
        }
        server = null;
        executor = null;
    }

    /** Returns {@code true} while the server is running. */
    public boolean isRunning() { return running; }

    /** Returns the port the server is bound to (valid after {@link #start()}). */
    public int port() {
        if (server == null) throw new IllegalStateException("Server has not been started");
        return server.getAddress().getPort();
    }

    /** Returns the base URL of the running server, e.g. {@code "http://localhost:8080"}. */
    public String baseUrl() {
        return "http://localhost:" + port();
    }

    /** Closes the embedded server, delegating to {@link #stop()}. */
    @Override
    public void close() {
        stop();
    }

    // ── Transport handlers ───────────────────────────────────────────────

    private void handleSse(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
        exchange.getResponseHeaders().set("Cache-Control", "no-cache");
        exchange.getResponseHeaders().set("Connection", "keep-alive");
        exchange.sendResponseHeaders(200, 0);
        OutputStream os = exchange.getResponseBody();
        sseStreams.add(os);
        try {
            sendSse(os, "endpoint", "/mcp/message");
            while (running) {
                Thread.sleep(500);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception ignored) {
            // client disconnected
        } finally {
            sseStreams.remove(os);
            try {
                os.close();
            } catch (IOException ignored) {
                // already closed
            }
        }
    }

    private void handleSseMessage(HttpExchange exchange) throws IOException {
        if (!"POST".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }
        String body = readBody(exchange.getRequestBody());
        JsonNode request = mapper.readTree(body);
        JsonNode response = dispatch(request);
        exchange.sendResponseHeaders(202, -1);
        if (response != null) {
            pushToSseClients(mapper.writeValueAsString(response));
        }
    }

    private void handleStreamableHttp(HttpExchange exchange) throws IOException {
        switch (exchange.getRequestMethod()) {
            case "POST" -> handleStreamablePost(exchange);
            case "GET" -> handleStreamableGet(exchange);
            case "DELETE" -> handleStreamableDelete(exchange);
            default -> exchange.sendResponseHeaders(405, -1);
        }
    }

    private void handleStreamablePost(HttpExchange exchange) throws IOException {
        String body = readBody(exchange.getRequestBody());
        JsonNode request = mapper.readTree(body);
        boolean isNotification = !request.has("id");
        JsonNode response = dispatch(request);

        String method = request.path("method").asText();
        if ("initialize".equals(method)) {
            String sessionId = "mcp-session-" + UUID.randomUUID();
            activeSessions.put(sessionId, Boolean.TRUE);
            exchange.getResponseHeaders().set("Mcp-Session-Id", sessionId);
        }

        if (isNotification) {
            exchange.sendResponseHeaders(202, -1);
            return;
        }
        byte[] bytes = mapper.writeValueAsBytes(response);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    private void handleStreamableGet(HttpExchange exchange) throws IOException {
        String accept = exchange.getRequestHeaders().getFirst("Accept");
        if (accept == null || !accept.toLowerCase().contains("text/event-stream")) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }
        exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
        exchange.getResponseHeaders().set("Cache-Control", "no-cache");
        exchange.getResponseHeaders().set("Connection", "keep-alive");
        exchange.sendResponseHeaders(200, 0);
        OutputStream os = exchange.getResponseBody();
        sseStreams.add(os);
        try {
            while (running) {
                Thread.sleep(500);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception ignored) {
            // client disconnected
        } finally {
            sseStreams.remove(os);
            try {
                os.close();
            } catch (IOException ignored) {
                // already closed
            }
        }
    }

    private void handleStreamableDelete(HttpExchange exchange) throws IOException {
        String sessionId = exchange.getRequestHeaders().getFirst("Mcp-Session-Id");
        if (sessionId != null) {
            activeSessions.remove(sessionId);
        }
        exchange.sendResponseHeaders(200, -1);
    }

    // ── JSON-RPC dispatch ────────────────────────────────────────────────

    private JsonNode dispatch(JsonNode request) {
        String method = request.path("method").asText();
        JsonNode params = request.path("params");
        boolean isNotification = !request.has("id");
        long id = request.has("id") ? request.get("id").asLong(-1) : -1;

        Object result;
        try {
            result = handleMethod(method, params);
        } catch (Exception e) {
            if (isNotification) return null;
            return errorNode(id, -32603, "Internal error: " + e.getMessage());
        }

        if (isNotification) return null;
        if (result instanceof JsonNode json && isRpcResponse(json)) {
            return json;
        }
        ObjectNode response = mapper.createObjectNode();
        response.put("jsonrpc", "2.0");
        response.put("id", id);
        response.set("result", mapper.valueToTree(result));
        return response;
    }

    private boolean isRpcResponse(JsonNode node) {
        return node.has("jsonrpc") && (node.has("result") || node.has("error"));
    }

    private Object handleMethod(String method, JsonNode params) throws Exception {
        return switch (method) {
            case "initialize" -> initializeResult();
            case "ping" -> mapper.createObjectNode();
            case "tools/list" -> toolsList();
            case "tools/call" -> toolsCall(params);
            case "resources/list" -> resourcesList();
            case "resources/templates/list" -> resourceTemplatesList();
            case "resources/read" -> resourcesRead(params);
            case "prompts/list" -> promptsList();
            case "prompts/get" -> promptsGet(params);
            case "completion/complete" -> completionComplete(params);
            case "logging/setLevel" -> mapper.createObjectNode();
            case "notifications/initialized", "notifications/cancelled" -> null;
            default -> {
                MethodHandler custom = customMethods.get(method);
                if (custom != null) {
                    yield custom.handle(params);
                }
                throw new IllegalArgumentException("Method not found: " + method);
            }
        };
    }

    private JsonNode initializeResult() {
        ObjectNode result = mapper.createObjectNode();
        result.put("protocolVersion", protocolVersion);
        ObjectNode caps = result.putObject("capabilities");
        if (!tools.isEmpty()) caps.putObject("tools");
        if (!resources.isEmpty() || !resourceTemplates.isEmpty()) caps.putObject("resources");
        if (!prompts.isEmpty()) caps.putObject("prompts");
        ObjectNode info = result.putObject("serverInfo");
        info.put("name", name);
        info.put("version", version);
        return result;
    }

    private JsonNode toolsList() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode arr = result.putArray("tools");
        for (ToolRegistration tool : tools.values()) {
            ObjectNode node = arr.addObject();
            node.put("name", tool.name());
            node.put("description", tool.description());
            node.set("inputSchema", tool.inputSchema());
        }
        return result;
    }

    private JsonNode toolsCall(JsonNode params) throws Exception {
        String name = params.path("name").asText();
        ToolRegistration tool = tools.get(name);
        if (tool == null) {
            throw new IllegalArgumentException("Unknown tool: " + name);
        }
        JsonNode args = params.path("arguments");
        Object handled = tool.handler().call(args == null ? mapper.createObjectNode() : args);
        if (handled instanceof JsonNode json) return json;
        return mapper.valueToTree(handled);
    }

    private JsonNode resourcesList() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode arr = result.putArray("resources");
        for (ResourceRegistration resource : resources.values()) {
            ObjectNode node = arr.addObject();
            node.put("uri", resource.uri());
            node.put("name", resource.name());
            if (resource.description() != null) node.put("description", resource.description());
            if (resource.mimeType() != null) node.put("mimeType", resource.mimeType());
        }
        return result;
    }

    private JsonNode resourceTemplatesList() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode arr = result.putArray("resourceTemplates");
        for (ResourceTemplateRegistration template : resourceTemplates.values()) {
            ObjectNode node = arr.addObject();
            node.put("uriTemplate", template.uriTemplate());
            node.put("name", template.name());
            if (template.description() != null) node.put("description", template.description());
            if (template.mimeType() != null) node.put("mimeType", template.mimeType());
        }
        return result;
    }

    private JsonNode resourcesRead(JsonNode params) throws Exception {
        String uri = params.path("uri").asText();
        ResourceRegistration resource = resources.get(uri);
        if (resource == null) {
            ResourceTemplateRegistration template = matchTemplate(uri);
            if (template != null) {
                return asJson(template.handler().read(params));
            }
            throw new IllegalArgumentException("Unknown resource: " + uri);
        }
        return asJson(resource.handler().read(params));
    }

    private ResourceTemplateRegistration matchTemplate(String uri) {
        for (ResourceTemplateRegistration template : resourceTemplates.values()) {
            String regex = template.uriTemplate()
                    .replace(".", "\\.")
                    .replaceAll("\\{[^}]+\\}", ".*");
            if (uri.matches(regex)) {
                return template;
            }
        }
        return null;
    }

    private JsonNode promptsList() {
        ObjectNode result = mapper.createObjectNode();
        ArrayNode arr = result.putArray("prompts");
        for (PromptRegistration prompt : prompts.values()) {
            ObjectNode node = arr.addObject();
            node.put("name", prompt.name());
            node.put("description", prompt.description());
            ArrayNode args = node.putArray("arguments");
            for (PromptArgument arg : prompt.arguments()) {
                ObjectNode argNode = args.addObject();
                argNode.put("name", arg.name());
                if (arg.description() != null) argNode.put("description", arg.description());
                argNode.put("required", arg.required());
            }
        }
        return result;
    }

    private JsonNode promptsGet(JsonNode params) throws Exception {
        String name = params.path("name").asText();
        PromptRegistration prompt = prompts.get(name);
        if (prompt == null) {
            throw new IllegalArgumentException("Unknown prompt: " + name);
        }
        return asJson(prompt.handler().get(params));
    }

    private JsonNode completionComplete(JsonNode params) throws Exception {
        String refType = params.path("ref").path("type").asText();
        String refName = params.path("ref").path("name").asText();
        if (refName.isBlank()) {
            refName = params.path("ref").path("uri").asText();
        }
        String argumentName = params.path("argument").path("name").asText();
        CompletionRegistration completion = completions.get(completionKey(refType, refName, argumentName));
        ObjectNode result = mapper.createObjectNode();
        if (completion == null) {
            result.putObject("completion").putArray("values");
            return result;
        }
        List<String> values = completion.handler().suggest(params);
        ObjectNode completionNode = result.putObject("completion");
        ArrayNode arr = completionNode.putArray("values");
        for (String value : values) arr.add(value);
        completionNode.put("total", values.size());
        completionNode.put("hasMore", false);
        return result;
    }

    private JsonNode errorNode(long id, int code, String message) {
        ObjectNode response = mapper.createObjectNode();
        response.put("jsonrpc", "2.0");
        response.put("id", id);
        ObjectNode error = response.putObject("error");
        error.put("code", code);
        error.put("message", message);
        return response;
    }

    private JsonNode asJson(Object value) {
        if (value instanceof JsonNode json) return json;
        return mapper.valueToTree(value);
    }

    private void pushToSseClients(String json) {
        for (OutputStream stream : sseStreams) {
            try {
                sendSse(stream, "message", json);
            } catch (IOException e) {
                sseStreams.remove(stream);
                try {
                    stream.close();
                } catch (IOException ignored) {
                    // already closed
                }
            }
        }
    }

    private void sendSse(OutputStream os, String event, String data) throws IOException {
        String message = "event: " + event + "\ndata: " + data + "\n\n";
        os.write(message.getBytes(StandardCharsets.UTF_8));
        os.flush();
    }

    private static String readBody(InputStream in) throws IOException {
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }

    private static String completionKey(String refType, String refName, String argumentName) {
        return refType + "|" + refName + "|" + argumentName;
    }

    // ── Handler types ────────────────────────────────────────────────────

    /** Handles a {@code tools/call} request; return a serializable value. */
    @FunctionalInterface
    public interface ToolHandler {
        /**
         * Handles a {@code tools/call} request.
         *
         * @param arguments the {@code arguments} object passed in the request
         * @return a serializable value forming the result
         * @throws Exception if handling fails
         */
        Object call(JsonNode arguments) throws Exception;
    }

    /** Handles a {@code resources/read} request; return a serializable value. */
    @FunctionalInterface
    public interface ResourceHandler {
        /**
         * Handles a {@code resources/read} request.
         *
         * @param params the request params (including the resource {@code uri})
         * @return a serializable value forming the result
         * @throws Exception if handling fails
         */
        Object read(JsonNode params) throws Exception;
    }

    /** Handles a {@code prompts/get} request; return a serializable value. */
    @FunctionalInterface
    public interface PromptHandler {
        /**
         * Handles a {@code prompts/get} request.
         *
         * @param params the request params (including {@code name} and {@code arguments})
         * @return a serializable value forming the result
         * @throws Exception if handling fails
         */
        Object get(JsonNode params) throws Exception;
    }

    /** Suggests values for a {@code completion/complete} request. */
    @FunctionalInterface
    public interface CompletionHandler {
        /**
         * Suggests values for a {@code completion/complete} request.
         *
         * @param params the request params (including the reference and argument)
         * @return the suggested values
         * @throws Exception if handling fails
         */
        List<String> suggest(JsonNode params) throws Exception;
    }

    /** Handles an arbitrary JSON-RPC method; return a serializable value. */
    @FunctionalInterface
    public interface MethodHandler {
        /**
         * Handles an arbitrary JSON-RPC method.
         *
         * @param params the request params
         * @return a serializable value forming the result
         * @throws Exception if handling fails
         */
        Object handle(JsonNode params) throws Exception;
    }

    // ── Registration records ─────────────────────────────────────────────

    private record ToolRegistration(String name, String description, JsonNode inputSchema, ToolHandler handler) {}
    private record ResourceRegistration(String uri, String name, String description,
                                        String mimeType, ResourceHandler handler) {}
    private record ResourceTemplateRegistration(String uriTemplate, String name, String description,
                                                String mimeType, ResourceHandler handler) {}
    private record PromptRegistration(String name, String description,
                                      List<PromptArgument> arguments, PromptHandler handler) {}
    private record CompletionRegistration(String refType, String refName, String argumentName,
                                          CompletionHandler handler) {}

    /**
     * Declared argument of a prompt template.
     *
     * @param name        argument name
     * @param description argument description, may be {@code null}
     * @param required    whether clients must provide the argument
     */
    public record PromptArgument(String name, String description, boolean required) {}

    private static final class CompletionRefs {
        static final String PROMPT = "ref/prompt";
        static final String RESOURCE = "ref/resource";
        private CompletionRefs() {}
    }
}
