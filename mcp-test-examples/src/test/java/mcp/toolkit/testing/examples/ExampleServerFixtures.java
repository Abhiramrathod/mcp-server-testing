package mcp.toolkit.testing.examples;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import mcp.toolkit.testing.junit.server.McpResponses;
import mcp.toolkit.testing.junit.server.McpTestServer;

import java.util.List;

/**
 * Registers the same fixture surface the legacy {@code DummyMcpServer} exposed
 * (calculator/greet tools, two file resources, translate/code-review prompts) on
 * the embedded {@link McpTestServer} used by the example tests.
 */
final class ExampleServerFixtures {

    private ExampleServerFixtures() {}

    static void configure(McpTestServer server) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode calcSchema = mapper.createObjectNode();
        calcSchema.put("type", "object");
        ObjectNode calcProps = calcSchema.putObject("properties");
        calcProps.putObject("operation").put("type", "string");
        calcProps.putObject("a").put("type", "number");
        calcProps.putObject("b").put("type", "number");

        server.addTool("calculator", "Performs basic arithmetic operations", calcSchema, args -> {
            String op = args.path("operation").asText();
            double a = args.path("a").asDouble();
            double b = args.path("b").asDouble();
            return switch (op) {
                case "add" -> McpResponses.toolText(String.valueOf(a + b));
                case "subtract" -> McpResponses.toolText(String.valueOf(a - b));
                case "multiply" -> McpResponses.toolText(String.valueOf(a * b));
                case "divide" -> McpResponses.toolText(String.valueOf(a / b));
                default -> McpResponses.toolError("Invalid operation: " + op);
            };
        });

        ObjectNode greetSchema = mapper.createObjectNode();
        greetSchema.put("type", "object");
        greetSchema.putObject("properties").putObject("name").put("type", "string");
        server.addTool("greet", "Generates a greeting message", greetSchema, args -> {
            String name = args.path("name").asText("World");
            return McpResponses.toolText("Hello, " + name + "!");
        });

        server.addResource("file:///data/config.json", "Configuration", "Server configuration file",
                "application/json",
                params -> McpResponses.resourceText("file:///data/config.json",
                        "application/json", "{\"version\": \"1.0\", \"enabled\": true}"));
        server.addResource("file:///data/readme.txt", "README", "Welcome documentation",
                "text/plain",
                params -> McpResponses.resourceText("file:///data/readme.txt",
                        "text/plain", "Welcome to the dummy MCP server!"));

        server.addPrompt("translate", "Translates text to another language", List.of(
                new McpTestServer.PromptArgument("language", "Target language", true),
                new McpTestServer.PromptArgument("text", "Text to translate", true)),
                params -> {
                    String lang = params.path("arguments").path("language").asText();
                    String text = params.path("arguments").path("text").asText();
                    return McpResponses.promptUser("Generated prompt for translate",
                            "Please translate the following text to " + lang + ": " + text);
                });

        server.addPrompt("code-review", "Reviews code for issues", List.of(
                new McpTestServer.PromptArgument("code", "Code to review", true)),
                params -> {
                    String code = params.path("arguments").path("code").asText();
                    return McpResponses.promptUser("Generated prompt for code-review",
                            "Please review this code: " + code);
                });
    }
}
