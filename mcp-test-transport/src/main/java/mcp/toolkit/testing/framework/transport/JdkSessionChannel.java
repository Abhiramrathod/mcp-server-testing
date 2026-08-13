package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpTransportClient;
import mcp.toolkit.testing.framework.interfaces.SessionChannel;

import java.net.URI;
import java.util.Map;

/**
 * {@link SessionChannel} variant for terminating server-side sessions, backed
 * by a {@link McpTransportClient}.
 */
final class JdkSessionChannel implements SessionChannel {

    private final McpTransportClient client;

    JdkSessionChannel(McpTransportClient client) {
        this.client = McpValidation.requireNonNull(client, "client");
    }

    @Override
    public Runnable closeSession(URI uri, Map<String, String> headers) {
        McpValidation.requireNonNull(uri, "uri");
        McpValidation.requireNonNull(headers, "headers");
        return () -> client.closeSession(uri, headers);
    }
}
