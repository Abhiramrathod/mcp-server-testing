package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpTool;
import mcp.toolkit.testing.framework.api.model.McpToolResult;
import mcp.toolkit.testing.examples.server.DummyMcpServer;
import org.junit.jupiter.api.*;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating tool discovery and invocation.
 */
class ToolsClientTest {

    private static DummyMcpServer server;
    private static McpClient client;

    @BeforeAll
    static void startServer() throws Exception {
        server = new DummyMcpServer(8081);
        server.start();
        Thread.sleep(500);
        
        client = McpClient.connectTo("http://localhost:8081")
                .initializeOnBuild()
                .build();
    }

    @AfterAll
    static void stopServer() {
        if (client != null) {
            client.close();
        }
        if (server != null) {
            server.stop();
        }
    }

    @Test
    void testListTools() {
        List<McpTool> tools = client.tools().listTools();
        
        assertNotNull(tools);
        assertEquals(2, tools.size());
        
        McpTool calculator = tools.get(0);
        assertEquals("calculator", calculator.name());
        assertEquals("Performs basic arithmetic operations", calculator.description());
        
        McpTool greet = tools.get(1);
        assertEquals("greet", greet.name());
        assertEquals("Generates a greeting message", greet.description());
    }

    @Test
    void testCallCalculatorAdd() {
        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "add", "a", 5, "b", 3))
                .assertSuccess();
        
        assertFalse(result.isError());
        assertEquals("8.0", result.firstText());
    }

    @Test
    void testCallCalculatorMultiply() {
        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "multiply", "a", 4, "b", 7))
                .assertSuccess();
        
        assertEquals("28.0", result.firstText());
    }

    @Test
    void testCallGreetTool() {
        client.tools()
                .callTool("greet", Map.of("name", "Alice"))
                .assertSuccess()
                .assertTextContains("Alice");
    }

    @Test
    void testCallGreetDefault() {
        McpToolResult result = client.tools()
                .callTool("greet", Map.of())
                .assertSuccess();
        
        assertEquals("Hello, World!", result.firstText());
    }

    @Test
    void testToolInputSchema() {
        List<McpTool> tools = client.tools().listTools();
        McpTool calculator = tools.get(0);
        
        assertNotNull(calculator.inputSchema());
        assertEquals("object", calculator.inputSchema().path("type").asText());
        assertTrue(calculator.inputSchema().has("properties"));
    }
}
