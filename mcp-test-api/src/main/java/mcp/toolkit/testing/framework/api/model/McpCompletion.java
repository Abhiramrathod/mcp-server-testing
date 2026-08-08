package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * Result of an MCP {@code completion/complete} request.
 *
 * @param values  suggested completions
 * @param total   total number of completion options, when known (may be {@code null})
 * @param hasMore whether there are additional completions beyond those listed
 */
public record McpCompletion(List<String> values, Integer total, boolean hasMore) {

    /**
     * Returns {@code true} if this completion carries at least one suggestion.
     *
     * @return whether {@link #values()} is non-empty
     */
    public boolean hasSuggestions() {
        return values != null && !values.isEmpty();
    }
}
