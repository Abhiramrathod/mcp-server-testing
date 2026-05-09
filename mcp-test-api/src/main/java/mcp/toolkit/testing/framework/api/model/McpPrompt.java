package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * Describes a single MCP prompt returned by the server.
 */
public record McpPrompt(String name, String description, List<PromptArgument> arguments, JsonNode raw) {

    public McpPrompt {
        arguments = arguments == null ? List.of() : List.copyOf(arguments);
    }

    /**
     * Describes a single argument accepted by a prompt template.
     */
    public record PromptArgument(String name, String description, boolean required) {}
}
