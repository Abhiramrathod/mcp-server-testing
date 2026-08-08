package mcp.toolkit.testing.framework.api.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

/**
 * Typed view of the server information returned during the MCP initialize handshake.
 *
 * <p>Obtain via {@link mcp.toolkit.testing.framework.api.McpClient#serverInfo()}.
 *
 * @param name                 server name reported during initialization
 * @param version              server version reported during initialization
 * @param protocolVersion      MCP protocol version negotiated during initialization
 * @param supportedCapabilities set of capability names advertised by the server
 * @param raw                  raw JSON initialize result as returned by the server
 */
public record McpServerInfo(String name, String version, String protocolVersion,
                            Set<String> supportedCapabilities, JsonNode raw) {

    public McpServerInfo {
        supportedCapabilities = Collections.unmodifiableSet(
                supportedCapabilities == null ? new HashSet<>() : new HashSet<>(supportedCapabilities));
    }

    /**
     * Returns {@code true} if the server advertises the given capability.
     *
     * @param capability capability name, e.g. {@code "tools"}
     * @return whether the capability is present in {@link #supportedCapabilities()}
     */
    public boolean supportsCapability(String capability) {
        return supportedCapabilities.contains(capability);
    }

    /**
     * Returns {@code true} if the server advertises the {@code "tools"} capability.
     *
     * @return whether tools are supported
     */
    public boolean supportsTools() { return supportsCapability("tools"); }

    /**
     * Returns {@code true} if the server advertises the {@code "resources"} capability.
     *
     * @return whether resources are supported
     */
    public boolean supportsResources() { return supportsCapability("resources"); }

    /**
     * Returns {@code true} if the server advertises the {@code "prompts"} capability.
     *
     * @return whether prompts are supported
     */
    public boolean supportsPrompts() { return supportsCapability("prompts"); }
}
