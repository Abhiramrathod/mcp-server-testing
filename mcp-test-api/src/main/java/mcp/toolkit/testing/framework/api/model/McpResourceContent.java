package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * Content returned after reading an MCP resource.
 */
public record McpResourceContent(String uri, List<ContentItem> contents, JsonNode raw) {

    public McpResourceContent {
        contents = contents == null ? List.of() : List.copyOf(contents);
    }

    /**
     * Asserts that the resource content is not empty.
     *
     * @return this result, for chaining
     * @throws AssertionError if no content items are present
     */
    public McpResourceContent assertNotEmpty() {
        if (contents.isEmpty()) {
            throw new AssertionError("Expected resource content for '" + uri + "' to be non-empty.");
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
    public McpResourceContent assertTextContains(String expected) {
        String text = firstText();
        if (!text.contains(expected)) {
            throw new AssertionError(
                    "Expected resource content for '" + uri + "' to contain '" + expected
                            + "' but was: '" + text + "'");
        }
        return this;
    }

    /**
     * Convenience method returning the text of the first text content item,
     * or an empty string if none is present.
     */
    public String firstText() {
        return contents.stream()
                .filter(c -> "text".equals(c.mimeType()) || c.text() != null)
                .map(ContentItem::text)
                .findFirst()
                .orElse("");
    }

    /**
     * A single content item within a resource read response.
     */
    public record ContentItem(String uri, String mimeType, String text, JsonNode raw) {}
}
