package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Describes a single MCP tool returned by the server.
 */
public record McpTool(String name, String description, JsonNode inputSchema) {}
