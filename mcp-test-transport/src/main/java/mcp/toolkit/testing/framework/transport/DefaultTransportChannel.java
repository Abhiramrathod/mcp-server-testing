package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.interfaces.RequestChannel;
import mcp.toolkit.testing.framework.interfaces.SessionChannel;
import mcp.toolkit.testing.framework.interfaces.StreamChannel;
import mcp.toolkit.testing.framework.interfaces.TransportChannel;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;
import java.util.function.Supplier;

/**
 * {@link TransportChannel} facade that combines the specialised channel types
 * into a single view.
 *
 * <p>Each call is delegated to the matching channel variant, so callers using
 * this facade cannot tell which channel type was picked for a given exchange.
 */
final class DefaultTransportChannel implements TransportChannel {

    private final RequestChannel requestChannel;
    private final StreamChannel streamChannel;
    private final SessionChannel sessionChannel;

    DefaultTransportChannel(RequestChannel requestChannel, StreamChannel streamChannel,
                            SessionChannel sessionChannel) {
        this.requestChannel = McpValidation.requireNonNull(requestChannel, "requestChannel");
        this.streamChannel = McpValidation.requireNonNull(streamChannel, "streamChannel");
        this.sessionChannel = McpValidation.requireNonNull(sessionChannel, "sessionChannel");
    }

    @Override
    public Function<String, McpResponse> exchange(URI uri, Map<String, String> headers) {
        return requestChannel.exchange(uri, headers);
    }

    @Override
    public Function<String, McpResponse> exchangeAsText(URI uri, Map<String, String> headers) {
        return requestChannel.exchangeAsText(uri, headers);
    }

    @Override
    public Supplier<CompletableFuture<McpResponse>> openStream(URI uri, Map<String, String> headers) {
        return streamChannel.openStream(uri, headers);
    }

    @Override
    public Runnable closeSession(URI uri, Map<String, String> headers) {
        return sessionChannel.closeSession(uri, headers);
    }
}
