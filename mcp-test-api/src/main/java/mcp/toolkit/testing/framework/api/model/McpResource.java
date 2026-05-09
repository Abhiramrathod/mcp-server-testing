package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Describes a single MCP resource returned by the server.
 */
public record McpResource(String uri, String name, String description, String mimeType, JsonNode raw) {}
