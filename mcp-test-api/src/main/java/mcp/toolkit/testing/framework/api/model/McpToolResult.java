package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * Result returned after invoking an MCP tool.
 */
public record McpToolResult(List<ContentItem> content, boolean isError, JsonNode raw) {

    public McpToolResult {
        content = content == null ? List.of() : List.copyOf(content);
    }

    /**
     * Asserts that the tool did not report an error.
     *
     * @return this result, for chaining
     * @throws AssertionError if {@link #isError()} is {@code true}
     */
    public McpToolResult assertSuccess() {
        if (isError) {
            throw new AssertionError("Expected tool result to succeed but isError=true. Content: " + content);
        }
        return this;
    }

    /**
     * Asserts that the tool reported an error.
     *
     * @return this result, for chaining
     * @throws AssertionError if {@link #isError()} is {@code false}
     */
    public McpToolResult assertError() {
        if (!isError) {
            throw new AssertionError("Expected tool result to be an error but isError=false.");
        }
        return this;
    }

    /**
     * Asserts that {@link #firstText()} contains the given substring.
     *
     * @param expected substring expected in the first text content item
     * @return this result, for chaining
     * @throws AssertionError if the text does not contain the substring
     */
    public McpToolResult assertTextContains(String expected) {
        String text = firstText();
        if (!text.contains(expected)) {
            throw new AssertionError(
                    "Expected tool result text to contain '" + expected + "' but was: '" + text + "'");
        }
        return this;
    }

    /**
     * Convenience method returning the text of the first text content item,
     * or an empty string if none is present.
     */
    public String firstText() {
        return content.stream()
                .filter(c -> "text".equals(c.type()))
                .map(ContentItem::text)
                .findFirst()
                .orElse("");
    }

    /**
     * A single content item within a tool result.
     */
    public record ContentItem(String type, String text, JsonNode raw) {}
}
