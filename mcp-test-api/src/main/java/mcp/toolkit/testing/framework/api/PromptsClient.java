package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.api.model.McpPrompt;
import mcp.toolkit.testing.framework.api.model.McpPromptResult;
import mcp.toolkit.testing.framework.client.prompts.McpPromptDirectory;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * High-level client for MCP prompt listing and retrieval.
 *
 * <p>Returns typed domain objects instead of raw JSON, so callers do not need
 * to know the underlying JSON-RPC structure.
 */
public final class PromptsClient {

    private final McpPromptDirectory promptDirectory;

    PromptsClient(McpPromptDirectory promptDirectory) {
        this.promptDirectory = promptDirectory;
    }

    /**
     * Returns all prompts registered on the server.
     *
     * @return list of prompt definitions
     */
    public List<McpPrompt> listPrompts() {
        JsonNode result = promptDirectory.listPrompts();
        JsonNode promptsArray = result.path("prompts");
        List<McpPrompt> prompts = new ArrayList<>();
        if (promptsArray.isArray()) {
            for (JsonNode node : promptsArray) {
                prompts.add(toMcpPrompt(node));
            }
        }
        return List.copyOf(prompts);
    }

    /**
     * Retrieves a rendered prompt by name with no arguments.
     *
     * @param name prompt name
     * @return rendered prompt result
     */
    public McpPromptResult getPrompt(String name) {
        return getPrompt(name, Map.of());
    }

    /**
     * Retrieves a rendered prompt by name with the given arguments.
     *
     * @param name prompt name
     * @param args prompt arguments
     * @return rendered prompt result
     */
    public McpPromptResult getPrompt(String name, Object args) {
        JsonNode raw = promptDirectory.getPrompt(name, args);
        return toMcpPromptResult(raw);
    }

    private static McpPrompt toMcpPrompt(JsonNode node) {
        List<McpPrompt.PromptArgument> args = new ArrayList<>();
        JsonNode argsArray = node.path("arguments");
        if (argsArray.isArray()) {
            for (JsonNode arg : argsArray) {
                args.add(new McpPrompt.PromptArgument(
                        arg.path("name").asText(),
                        arg.path("description").asText(null),
                        arg.path("required").asBoolean(false)
                ));
            }
        }
        return new McpPrompt(
                node.path("name").asText(),
                node.path("description").asText(null),
                args,
                node
        );
    }

    private static McpPromptResult toMcpPromptResult(JsonNode raw) {
        List<McpPromptResult.PromptMessage> messages = new ArrayList<>();
        JsonNode messagesArray = raw.path("messages");
        if (messagesArray.isArray()) {
            for (JsonNode msg : messagesArray) {
                String text = msg.path("text").asText(null);
                if (text == null) {
                    text = msg.path("content").path("text").asText(null);
                }
                messages.add(new McpPromptResult.PromptMessage(
                        msg.path("role").asText(null),
                        text,
                        msg
                ));
            }
        }
        return new McpPromptResult(
                raw.path("description").asText(null),
                messages,
                raw
        );
    }
}
