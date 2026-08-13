package mcp.toolkit.testing.framework.interfaces;

/**
 * A single channel facade covering every operation a client performs through an
 * {@link McpTransport}.
 *
 * <p>The gateway is the combination of three specialised channel types:
 * {@link MessageChannel} for exchanging JSON-RPC messages,
 * {@link ConnectionChannel} for the connection lifecycle and
 * {@link ListenerChannel} for callbacks and session state. Each method returns
 * a {@link java.util.function} callable so clients execute operations through
 * {@link java.util.function.BiFunction#apply(Object, Object)},
 * {@link java.util.function.Consumer#accept(Object)} and
 * {@link Runnable#run()} without ever touching the concrete transport behind
 * the gateway.
 *
 * <p>The concrete {@link McpTransport} backing the gateway is selected
 * internally; callers only ever see this interface and cannot tell which
 * transport implementation was picked.
 */
public interface TransportGateway extends MessageChannel, ConnectionChannel, ListenerChannel {

    /**
     * Wraps the given transport behind the functional-interface gateway.
     *
     * @param transport transport to wrap
     * @return the assembled gateway
     * @throws NullPointerException if {@code transport} is {@code null}
     */
    static TransportGateway of(McpTransport transport) {
        return new DefaultTransportGateway(transport);
    }
}
