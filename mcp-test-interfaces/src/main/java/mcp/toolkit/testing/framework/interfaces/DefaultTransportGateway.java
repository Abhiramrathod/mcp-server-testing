package mcp.toolkit.testing.framework.interfaces;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Consumer;

/**
 * {@link TransportGateway} backed by an {@link McpTransport}.
 *
 * <p>The raw transport calls are captured inside lambdas and exposed through
 * functional interfaces, so callers only ever invoke {@code apply}/{@code accept}/
 * {@code run} and never see the concrete transport directly.
 */
final class DefaultTransportGateway implements TransportGateway {

    private final McpTransport transport;

    DefaultTransportGateway(McpTransport transport) {
        this.transport = Objects.requireNonNull(transport, "transport");
    }

    @Override
    public BiFunction<String, Long, JsonNode> sendRequest() {
        return (payload, requestId) -> transport.sendRequest(
                Objects.requireNonNull(payload, "payload"), requestId);
    }

    @Override
    public Consumer<String> sendNotification() {
        return payload -> transport.sendNotification(Objects.requireNonNull(payload, "payload"));
    }

    @Override
    public Runnable connect() {
        return transport::connect;
    }

    @Override
    public Runnable close() {
        return transport::close;
    }

    @Override
    public Consumer<Consumer<JsonNode>> serverMessageListener() {
        return transport::setServerMessageListener;
    }

    @Override
    public Consumer<Runnable> sessionExpiredHandler() {
        return transport::setSessionExpiredHandler;
    }

    @Override
    public Runnable clearSession() {
        return transport::clearSession;
    }
}
