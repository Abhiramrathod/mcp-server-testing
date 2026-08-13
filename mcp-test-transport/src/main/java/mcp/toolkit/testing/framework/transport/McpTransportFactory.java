package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import mcp.toolkit.testing.framework.interfaces.TransportChannel;

import java.net.URI;
import java.time.Duration;
import java.util.Collections;
import java.util.Map;

/**
 * Creates the framework's MCP transports.
 *
 * <p>The concrete transport implementations and the channel/client stack behind
 * them are internal to this package; this factory is the intended entry point
 * for obtaining a {@link McpTransport}.
 */
public final class McpTransportFactory {

    private McpTransportFactory() {}

    /**
     * Creates a Streamable HTTP transport.
     *
     * @param endpointUri     MCP endpoint URI
     * @param protocolVersion MCP protocol version to advertise
     * @param timeout         timeout for connection and RPC calls
     * @param jsonCodec       codec used to parse JSON messages
     * @return the transport
     */
    public static McpTransport streamable(URI endpointUri, String protocolVersion,
                                          Duration timeout, McpJsonCodec jsonCodec) {
        return streamable(endpointUri, protocolVersion, timeout, jsonCodec, Collections.emptyMap());
    }

    /**
     * Creates a Streamable HTTP transport with custom headers.
     *
     * @param endpointUri     MCP endpoint URI
     * @param protocolVersion MCP protocol version to advertise
     * @param timeout         timeout for connection and RPC calls
     * @param jsonCodec       codec used to parse JSON messages
     * @param headers         extra headers sent on every request
     * @return the transport
     */
    public static McpTransport streamable(URI endpointUri, String protocolVersion,
                                          Duration timeout, McpJsonCodec jsonCodec,
                                          Map<String, String> headers) {
        return new McpStreamableHttpTransport(endpointUri, protocolVersion, timeout, jsonCodec, headers,
                channelFor(timeout));
    }

    /**
     * Creates a legacy HTTP+SSE transport.
     *
     * @param sseEndpointUri  URI of the {@code /sse} endpoint
     * @param baseUri         base URI used to resolve the message endpoint
     * @param protocolVersion MCP protocol version to advertise
     * @param timeout         timeout for connection and RPC calls
     * @param jsonCodec       codec used to parse JSON messages
     * @return the transport
     */
    public static McpTransport sse(URI sseEndpointUri, URI baseUri, String protocolVersion,
                                   Duration timeout, McpJsonCodec jsonCodec) {
        return sse(sseEndpointUri, baseUri, protocolVersion, timeout, jsonCodec, Collections.emptyMap());
    }

    /**
     * Creates a legacy HTTP+SSE transport with custom headers.
     *
     * @param sseEndpointUri  URI of the {@code /sse} endpoint
     * @param baseUri         base URI used to resolve the message endpoint
     * @param protocolVersion MCP protocol version to advertise
     * @param timeout         timeout for connection and RPC calls
     * @param jsonCodec       codec used to parse JSON messages
     * @param headers         extra headers sent on every request
     * @return the transport
     */
    public static McpTransport sse(URI sseEndpointUri, URI baseUri, String protocolVersion,
                                   Duration timeout, McpJsonCodec jsonCodec,
                                   Map<String, String> headers) {
        return new McpSseTransport(sseEndpointUri, baseUri, protocolVersion, timeout, jsonCodec, headers,
                channelFor(timeout));
    }

    private static TransportChannel channelFor(Duration timeout) {
        return TransportChannels.around(new JdkTransportClient(timeout));
    }
}
