package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Describes a single MCP resource template returned by the server.
 *
 * @param uriTemplate URI template, e.g. {@code "file:///data/{path}"}
 * @param name        human-readable name of the template
 * @param description optional description of the template
 * @param mimeType    MIME type of the template content, when known (may be {@code null})
 * @param raw         raw JSON definition as returned by the server
 */
public record McpResourceTemplate(String uriTemplate, String name, String description, String mimeType,
                                  JsonNode raw) {}
