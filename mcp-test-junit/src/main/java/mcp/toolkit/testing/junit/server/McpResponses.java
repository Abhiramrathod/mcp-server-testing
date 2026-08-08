package mcp.toolkit.testing.junit.server;

import java.util.List;
import java.util.Map;

/**
 * Static helpers that build MCP response payloads in the shapes the framework's
 * domain clients parse. Handlers registered on {@link McpTestServer} may return
 * these maps (or plain serializable values) directly.
 */
public final class McpResponses {

    private McpResponses() {}

    /**
     * Tool result containing a single text content item.
     *
     * @param text the text to return
     * @return a {@code tools/call} result payload
     */
    public static Map<String, Object> toolText(String text) {
        return Map.of(
                "content", List.of(Map.of("type", "text", "text", text)),
                "isError", false
        );
    }

    /**
     * Tool result with a structured content array.
     *
     * @param content content items; each must be a serializable map
     * @return a {@code tools/call} result payload
     */
    public static Map<String, Object> toolResult(List<?> content) {
        return Map.of("content", content, "isError", false);
    }

    /**
     * Tool result signalling an execution error.
     *
     * @param text error description
     * @return a {@code tools/call} result payload with {@code isError=true}
     */
    public static Map<String, Object> toolError(String text) {
        return Map.of(
                "content", List.of(Map.of("type", "text", "text", text)),
                "isError", true
        );
    }

    /**
     * Resource read payload with a single text content item.
     *
     * @param uri      resource URI
     * @param mimeType MIME type, e.g. {@code "text/plain"}
     * @param text     resource text
     * @return a {@code resources/read} result payload
     */
    public static Map<String, Object> resourceText(String uri, String mimeType, String text) {
        return Map.of("contents", List.of(Map.of(
                "uri", uri,
                "mimeType", mimeType,
                "text", text
        )));
    }

    /**
     * Prompt result with a single user message.
     *
     * @param description prompt description
     * @param text        the user message text
     * @return a {@code prompts/get} result payload
     */
    public static Map<String, Object> promptUser(String description, String text) {
        return Map.of(
                "description", description,
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", Map.of("type", "text", "text", text)
                ))
        );
    }

    /**
     * Prompt result with an arbitrary message list.
     *
     * @param description prompt description
     * @param messages    messages; each must be a serializable map with
     *                    {@code role} and {@code content} fields
     * @return a {@code prompts/get} result payload
     */
    public static Map<String, Object> promptResult(String description, List<?> messages) {
        return Map.of("description", description, "messages", messages);
    }

    /**
     * Completion payload for {@code completion/complete}.
     *
     * @param values suggested values
     * @return a {@code completion/complete} result payload
     */
    public static Map<String, Object> completion(List<String> values) {
        return Map.of("completion", Map.of(
                "values", values,
                "total", values.size(),
                "hasMore", false
        ));
    }

    /**
     * Completion payload for {@code completion/complete} with explicit paging.
     *
     * @param values suggested values
     * @param total  total number of suggestions
     * @param hasMore whether more suggestions are available
     * @return a {@code completion/complete} result payload
     */
    public static Map<String, Object> completion(List<String> values, int total, boolean hasMore) {
        return Map.of("completion", Map.of(
                "values", values,
                "total", total,
                "hasMore", hasMore
        ));
    }
}
