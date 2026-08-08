package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpTool;
import mcp.toolkit.testing.framework.api.model.McpToolResult;
import mcp.toolkit.testing.junit.annotation.McpServerTest;
import mcp.toolkit.testing.junit.server.McpTestServer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating tool discovery and invocation using the embedded
 * {@code @McpServerTest} testkit.
 */
@McpServerTest
class ToolsClientTest {

    @BeforeAll
    static void configure(McpTestServer server) {
        ExampleServerFixtures.configure(server);
    }

    @Test
    void testListTools(McpClient client) {
        List<McpTool> tools = client.tools().listTools();

        assertNotNull(tools);
        assertEquals(2, tools.size());

        McpTool calculator = findTool(tools, "calculator");
        assertEquals("calculator", calculator.name());
        assertEquals("Performs basic arithmetic operations", calculator.description());

        McpTool greet = findTool(tools, "greet");
        assertEquals("greet", greet.name());
        assertEquals("Generates a greeting message", greet.description());
    }

    @Test
    void testCallCalculatorAdd(McpClient client) {
        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "add", "a", 5, "b", 3))
                .assertSuccess();

        assertFalse(result.isError());
        assertEquals("8.0", result.firstText());
    }

    @Test
    void testCallCalculatorMultiply(McpClient client) {
        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "multiply", "a", 4, "b", 7))
                .assertSuccess();

        assertEquals("28.0", result.firstText());
    }

    @Test
    void testCallGreetTool(McpClient client) {
        client.tools()
                .callTool("greet", Map.of("name", "Alice"))
                .assertSuccess()
                .assertTextContains("Alice");
    }

    @Test
    void testCallGreetDefault(McpClient client) {
        McpToolResult result = client.tools()
                .callTool("greet", Map.of())
                .assertSuccess();

        assertEquals("Hello, World!", result.firstText());
    }

    @Test
    void testToolInputSchema(McpClient client) {
        List<McpTool> tools = client.tools().listTools();
        McpTool calculator = findTool(tools, "calculator");

        assertNotNull(calculator.inputSchema());
        assertEquals("object", calculator.inputSchema().path("type").asText());
        assertTrue(calculator.inputSchema().has("properties"));
    }

    private static McpTool findTool(List<McpTool> tools, String name) {
        return tools.stream()
                .filter(t -> t.name().equals(name))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Tool not found: " + name));
    }
}
