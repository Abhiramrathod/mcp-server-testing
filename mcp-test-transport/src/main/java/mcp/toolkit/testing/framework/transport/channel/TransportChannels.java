package mcp.toolkit.testing.framework.transport.channel;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpTransportClient;
import mcp.toolkit.testing.framework.interfaces.channel.TransportChannel;
import mcp.toolkit.testing.framework.transport.jdk.JdkRequestChannel;
import mcp.toolkit.testing.framework.transport.jdk.JdkSessionChannel;
import mcp.toolkit.testing.framework.transport.jdk.JdkStreamChannel;

/**
 * Selects and assembles the concrete channel implementations that back a
 * {@link TransportChannel}.
 *
 * <p>The selection is hidden here: callers receive a {@link TransportChannel}
 * and cannot tell which channel variants were picked for request/response,
 * streaming and session exchanges.
 */
public final class TransportChannels {

    private TransportChannels() {}

    /**
     * Builds a {@link TransportChannel} around the given low-level client,
     * wiring the specialised channel variants for each kind of exchange.
     *
     * @param client low-level client performing the raw calls
     * @return the assembled channel facade
     */
    public static TransportChannel around(McpTransportClient client) {
        McpValidation.requireNonNull(client, "client");
        return new DefaultTransportChannel(
                new JdkRequestChannel(client),
                new JdkStreamChannel(client),
                new JdkSessionChannel(client));
    }
}
