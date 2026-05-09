package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpClientConfig;
import mcp.toolkit.testing.framework.api.McpMethod;
import mcp.toolkit.testing.framework.api.model.*;
import mcp.toolkit.testing.examples.server.DummyMcpServer;
import org.junit.jupiter.api.*;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive integration test demonstrating full framework capabilities.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ComprehensiveIntegrationTest {

    private static DummyMcpServer server;
    private static McpClient client;

    @BeforeAll
    static void setUpAll() throws Exception {
        server = new DummyMcpServer(8085);
        server.start();
        Thread.sleep(500);
        
        client = McpClient.connectTo("http://localhost:8085")
                .sseEndpoint("/sse")
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(30))
                        .protocolVersion("2024-11-05")
                        .build())
                .initializeOnBuild()
                .build();
    }

    @AfterAll
    static void tearDownAll() {
        if (client != null) {
            System.out.println("\n=== Test Session Summary ===");
            List<McpExchangeSummary> all = client.exchanges().allExchanges();
            System.out.println("Total exchanges: " + all.size());
            
            long successful = all.stream().filter(McpExchangeSummary::isSuccess).count();
            System.out.println("Successful: " + successful);
            System.out.println("Failed: " + (all.size() - successful));
            
            client.close();
        }
        if (server != null) {
            server.stop();
        }
    }

    @Test
    @Order(1)
    void testServerCapabilities() {
        McpServerInfo info = client.serverInfo();
        
        assertEquals("dummy-mcp-server", info.name());
        assertEquals("1.0.0", info.version());
        assertEquals("2024-11-05", info.protocolVersion());
        
        assertTrue(info.supportsTools());
        assertTrue(info.supportsResources());
        assertTrue(info.supportsPrompts());
    }

    @Test
    @Order(2)
    void testToolsWorkflow() {
        List<McpTool> tools = client.tools().listTools();
        assertEquals(2, tools.size());
        
        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "add", "a", 10, "b", 5))
                .assertSuccess();
        
        assertEquals("15.0", result.firstText());
    }

    @Test
    @Order(3)
    void testResourcesWorkflow() {
        List<McpResource> resources = client.resources().listResources();
        assertEquals(2, resources.size());
        
        McpResourceContent content = client.resources()
                .readResource("file:///data/config.json")
                .assertNotEmpty();
        
        assertTrue(content.firstText().contains("version"));
    }

    @Test
    @Order(4)
    void testPromptsWorkflow() {
        List<McpPrompt> prompts = client.prompts().listPrompts();
        assertEquals(2, prompts.size());
        
        McpPromptResult result = client.prompts()
                .getPrompt("translate", Map.of("language", "German", "text", "Hello"))
                .assertNotEmpty();
        
        assertTrue(result.firstUserText().contains("German"));
    }

    @Test
    @Order(5)
    void testPerformanceMetrics() {
        for (int i = 0; i < 3; i++) {
            client.tools().listTools();
        }
        
        long avgLatency = client.exchanges().averageLatency(McpMethod.TOOLS_LIST);
        assertTrue(avgLatency >= 0, "Average latency should be non-negative");
        
        client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_LIST, 5000);
        client.exchanges().assertLastSucceeded();
    }

    @Test
    @Order(6)
    void testRawJsonAccess() {
        List<McpTool> tools = client.tools().listTools();
        McpTool tool = tools.get(0);
        
        assertNotNull(tool.inputSchema());
        assertTrue(tool.inputSchema().has("type"));
        assertEquals("object", tool.inputSchema().path("type").asText());
    }
}
