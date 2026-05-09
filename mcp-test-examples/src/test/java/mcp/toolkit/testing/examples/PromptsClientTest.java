package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpPrompt;
import mcp.toolkit.testing.framework.api.model.McpPromptResult;
import mcp.toolkit.testing.examples.server.DummyMcpServer;
import org.junit.jupiter.api.*;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Example tests demonstrating prompt listing and retrieval.
 */
class PromptsClientTest {

    private static DummyMcpServer server;
    private static McpClient client;

    @BeforeAll
    static void startServer() throws Exception {
        server = new DummyMcpServer(8083);
        server.start();
        Thread.sleep(500);
        
        client = McpClient.connectTo("http://localhost:8083")
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
    void testListPrompts() {
        List<McpPrompt> prompts = client.prompts().listPrompts();
        
        assertNotNull(prompts);
        assertEquals(2, prompts.size());
        
        McpPrompt translate = prompts.get(0);
        assertEquals("translate", translate.name());
        assertEquals("Translates text to another language", translate.description());
        assertEquals(2, translate.arguments().size());
        
        McpPrompt codeReview = prompts.get(1);
        assertEquals("code-review", codeReview.name());
        assertEquals("Reviews code for issues", codeReview.description());
    }

    @Test
    void testGetTranslatePrompt() {
        McpPromptResult result = client.prompts()
                .getPrompt("translate", Map.of("language", "Spanish", "text", "Hello"))
                .assertNotEmpty();
        
        assertFalse(result.messages().isEmpty());
        assertEquals(1, result.messages().size());
        
        McpPromptResult.PromptMessage msg = result.messages().get(0);
        assertEquals("user", msg.role());
        assertTrue(msg.text().contains("Spanish"));
        assertTrue(msg.text().contains("Hello"));
    }

    @Test
    void testGetCodeReviewPrompt() {
        client.prompts()
                .getPrompt("code-review", Map.of("code", "public void test() {}"))
                .assertNotEmpty()
                .assertUserTextContains("review");
    }

    @Test
    void testPromptUserMessage() {
        McpPromptResult result = client.prompts()
                .getPrompt("translate", Map.of("language", "French", "text", "Goodbye"))
                .assertNotEmpty();
        
        String userText = result.firstUserText();
        assertFalse(userText.isEmpty());
        assertTrue(userText.contains("French"));
        assertTrue(userText.contains("Goodbye"));
    }

    @Test
    void testPromptArguments() {
        List<McpPrompt> prompts = client.prompts().listPrompts();
        McpPrompt translate = prompts.get(0);
        
        assertEquals(2, translate.arguments().size());
        
        McpPrompt.PromptArgument langArg = translate.arguments().get(0);
        assertEquals("language", langArg.name());
        assertTrue(langArg.required());
        
        McpPrompt.PromptArgument textArg = translate.arguments().get(1);
        assertEquals("text", textArg.name());
        assertTrue(textArg.required());
    }
}
