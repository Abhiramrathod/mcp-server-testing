package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Describes a single MCP tool returned by the server.
 *
 * @param name        name of the tool
 * @param description optional description of the tool
 * @param inputSchema JSON Schema describing the tool's accepted arguments
 */
public record McpTool(String name, String description, JsonNode inputSchema) {}
