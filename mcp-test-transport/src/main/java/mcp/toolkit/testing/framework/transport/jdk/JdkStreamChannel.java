package mcp.toolkit.testing.framework.transport.jdk;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.interfaces.McpTransportClient;
import mcp.toolkit.testing.framework.interfaces.channel.StreamChannel;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

/**
 * {@link StreamChannel} variant for asynchronous streaming connections, backed
 * by a {@link McpTransportClient}.
 */
public final class JdkStreamChannel implements StreamChannel {

    private final McpTransportClient client;

    public JdkStreamChannel(McpTransportClient client) {
        this.client = McpValidation.requireNonNull(client, "client");
    }

    @Override
    public Supplier<CompletableFuture<McpResponse>> openStream(URI uri, Map<String, String> headers) {
        McpValidation.requireNonNull(uri, "uri");
        McpValidation.requireNonNull(headers, "headers");
        return () -> client.openStream(uri, headers);
    }
}
