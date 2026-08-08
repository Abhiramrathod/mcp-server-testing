package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * Describes a single MCP prompt returned by the server.
 *
 * @param name        name of the prompt
 * @param description optional description of the prompt
 * @param arguments   arguments accepted by the prompt template
 * @param raw         raw JSON definition as returned by the server
 */
public record McpPrompt(String name, String description, List<PromptArgument> arguments, JsonNode raw) {

    public McpPrompt {
        arguments = arguments == null ? List.of() : List.copyOf(arguments);
    }

    /**
     * Describes a single argument accepted by a prompt template.
     *
     * @param name        name of the argument
     * @param description optional description of the argument
     * @param required    whether the argument must be provided
     */
    public record PromptArgument(String name, String description, boolean required) {}
}
