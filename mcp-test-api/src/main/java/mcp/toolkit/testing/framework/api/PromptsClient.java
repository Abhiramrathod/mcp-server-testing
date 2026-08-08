package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.api.model.McpCompletion;
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
     * Returns all prompts registered on the server, following pagination
     * ({@code nextCursor}) transparently.
     *
     * @return list of prompt definitions
     */
    public List<McpPrompt> listPrompts() {
        List<McpPrompt> prompts = new ArrayList<>();
        for (JsonNode node : promptDirectory.allPrompts()) {
            prompts.add(toMcpPrompt(node));
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

    /**
     * Requests completions for a prompt argument ({@code completion/complete}).
     *
     * @param promptName   the prompt name
     * @param argumentName the argument name
     * @param value        the partial value being completed
     * @return typed completion result
     */
    public McpCompletion completePromptArgument(String promptName, String argumentName, String value) {
        return completePromptArgument(promptName, argumentName, value, null);
    }

    /**
     * Requests completions for a prompt argument ({@code completion/complete})
     * with optional context arguments.
     *
     * @param promptName       the prompt name
     * @param argumentName     the argument name
     * @param value            the partial value being completed
     * @param contextArguments values of other arguments used for context; may be {@code null}
     * @return typed completion result
     */
    public McpCompletion completePromptArgument(String promptName, String argumentName, String value,
                                                Object contextArguments) {
        JsonNode raw = promptDirectory.completePromptArgument(promptName, argumentName, value, contextArguments);
        return toMcpCompletion(raw);
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

    private static McpCompletion toMcpCompletion(JsonNode raw) {
        JsonNode completion = raw.path("completion");
        List<String> values = new ArrayList<>();
        JsonNode valuesArray = completion.path("values");
        if (valuesArray.isArray()) {
            for (JsonNode value : valuesArray) {
                values.add(value.asText());
            }
        }
        Integer total = completion.path("total").isMissingNode() || completion.path("total").isNull()
                ? null : completion.path("total").asInt();
        boolean hasMore = completion.path("hasMore").asBoolean(false);
        return new McpCompletion(List.copyOf(values), total, hasMore);
    }
}
