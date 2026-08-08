package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Describes a single MCP resource returned by the server.
 *
 * @param uri         URI of the resource
 * @param name        human-readable name of the resource
 * @param description optional description of the resource
 * @param mimeType    MIME type of the resource content, when known (may be {@code null})
 * @param raw         raw JSON definition as returned by the server
 */
public record McpResource(String uri, String name, String description, String mimeType, JsonNode raw) {}
