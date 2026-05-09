package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

/**
 * Typed view of the server information returned during the MCP initialize handshake.
 *
 * <p>Obtain via {@link mcp.toolkit.testing.framework.api.McpClient#serverInfo()}.
 */
public record McpServerInfo(String name, String version, String protocolVersion,
                            Set<String> supportedCapabilities, JsonNode raw) {

    public McpServerInfo {
        supportedCapabilities = Collections.unmodifiableSet(
                supportedCapabilities == null ? new HashSet<>() : new HashSet<>(supportedCapabilities));
    }

    public boolean supportsCapability(String capability) {
        return supportedCapabilities.contains(capability);
    }

    public boolean supportsTools() { return supportsCapability("tools"); }

    public boolean supportsResources() { return supportsCapability("resources"); }

    public boolean supportsPrompts() { return supportsCapability("prompts"); }
}
