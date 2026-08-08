package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * The rendered result of retrieving an MCP prompt by name.
 *
 * @param description optional description of the prompt result
 * @param messages    list of messages in the rendered prompt
 * @param raw         raw JSON result as returned by the server
 */
public record McpPromptResult(String description, List<PromptMessage> messages, JsonNode raw) {

    public McpPromptResult {
        messages = messages == null ? List.of() : List.copyOf(messages);
    }

    /**
     * Asserts that the prompt result contains at least one message.
     *
     * @return this result, for chaining
     * @throws AssertionError if no messages are present
     */
    public McpPromptResult assertNotEmpty() {
        if (messages.isEmpty()) {
            throw new AssertionError("Expected prompt result to contain messages but it was empty.");
        }
        return this;
    }

    /**
     * Asserts that {@link #firstUserText()} contains the given substring.
     *
     * @param expected substring expected in the first user message
     * @return this result, for chaining
     * @throws AssertionError if the text does not contain the substring
     */
    public McpPromptResult assertUserTextContains(String expected) {
        String text = firstUserText();
        if (!text.contains(expected)) {
            throw new AssertionError(
                    "Expected prompt user text to contain '" + expected + "' but was: '" + text + "'");
        }
        return this;
    }

    /**
     * Convenience method returning the text of the first user message,
     * or an empty string if none is present.
     */
    public String firstUserText() {
        return messages.stream()
                .filter(m -> "user".equals(m.role()))
                .map(PromptMessage::text)
                .findFirst()
                .orElse("");
    }

    /**
     * A single message within a prompt result.
     *
     * @param role  role of the message, e.g. {@code "user"} or {@code "assistant"}
     * @param text  text content of the message
     * @param raw   raw JSON message as returned by the server
     */
    public record PromptMessage(String role, String text, JsonNode raw) {}
}
