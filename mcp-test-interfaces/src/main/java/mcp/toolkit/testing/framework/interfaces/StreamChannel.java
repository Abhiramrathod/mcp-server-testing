package mcp.toolkit.testing.framework.interfaces;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

/**
 * Channel that opens asynchronous streaming connections, expected to carry
 * Server-Sent Events.
 */
public interface StreamChannel {

    /**
     * Returns a supplier that opens an asynchronous streaming connection
     * expected to carry Server-Sent Events.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @return the stream supplier
     */
    Supplier<CompletableFuture<McpResponse>> openStream(URI uri, Map<String, String> headers);
}
