package mcp.toolkit.testing.examples.server;

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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

/**
 * Dummy MCP server for testing the framework.
 */
public class DummyMcpServer {

    private final HttpServer server;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, OutputStream> sseClients = new ConcurrentHashMap<>();

    public DummyMcpServer(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(4));
        
        server.createContext("/sse", this::handleSse);
        server.createContext("/message", this::handleMessage);
    }

    public void start() {
        server.start();
        System.out.println("Dummy MCP Server started on port " + server.getAddress().getPort());
    }

    public void stop() {
        server.stop(0);
    }

    private void handleSse(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "text/event-stream");
        exchange.getResponseHeaders().set("Cache-Control", "no-cache");
        exchange.getResponseHeaders().set("Connection", "keep-alive");
        exchange.sendResponseHeaders(200, 0);

        OutputStream os = exchange.getResponseBody();
        String clientId = "client-" + System.currentTimeMillis();
        sseClients.put(clientId, os);

        sendSseEvent(os, "endpoint", "/message");
        
        try {
            while (!Thread.currentThread().isInterrupted() && !exchange.getHttpContext().getServer().getAddress().toString().isEmpty()) {
                Thread.sleep(1000);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            // Client disconnected
        } finally {
            sseClients.remove(clientId);
            try {
                os.close();
            } catch (IOException ignored) {}
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

        for (OutputStream os : sseClients.values()) {
            sendSseEvent(os, "message", mapper.writeValueAsString(response));
        }

        exchange.sendResponseHeaders(202, -1);
    }

    private JsonNode handleRpcMethod(String method, JsonNode params, long id) {
        ObjectNode response = mapper.createObjectNode();
        response.put("jsonrpc", "2.0");
        response.put("id", id);

        try {
            JsonNode result = switch (method) {
                case "initialize" -> handleInitialize();
                case "tools/list" -> handleToolsList();
                case "tools/call" -> handleToolsCall(params);
                case "resources/list" -> handleResourcesList();
                case "resources/read" -> handleResourcesRead(params);
                case "prompts/list" -> handlePromptsList();
                case "prompts/get" -> handlePromptsGet(params);
                default -> throw new IllegalArgumentException("Unknown method: " + method);
            };
            response.set("result", result);
        } catch (Exception e) {
            ObjectNode error = mapper.createObjectNode();
            error.put("code", -32603);
            error.put("message", e.getMessage());
            response.set("error", error);
        }

        return response;
    }

    private JsonNode handleInitialize() {
        ObjectNode result = mapper.createObjectNode();
        result.put("protocolVersion", "2024-11-05");
        
        ObjectNode serverInfo = result.putObject("serverInfo");
        serverInfo.put("name", "dummy-mcp-server");
        serverInfo.put("version", "1.0.0");
        
        ObjectNode capabilities = result.putObject("capabilities");
        capabilities.putObject("tools");
        capabilities.putObject("resources");
        capabilities.putObject("prompts");
        
        return result;
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

    private void sendSseEvent(OutputStream os, String event, String data) {
        try {
            String message = "event: " + event + "\ndata: " + data + "\n\n";
            os.write(message.getBytes(StandardCharsets.UTF_8));
            os.flush();
        } catch (IOException e) {
            // Client disconnected, ignore
        }
    }

    public static void main(String[] args) throws IOException {
        DummyMcpServer server = new DummyMcpServer(8080);
        server.start();
        
        Runtime.getRuntime().addShutdownHook(new Thread(server::stop));
        
        System.out.println("Press Ctrl+C to stop");
    }
}
