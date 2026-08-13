package mcp.toolkit.testing.framework.interfaces;

import java.util.function.Function;
import java.util.function.Supplier;

/**
 * A single channel facade covering every kind of low-level exchange a transport
 * needs.
 *
 * <p>The channel is the combination of three specialised channel types:
 * {@link RequestChannel} for synchronous request/response exchanges,
 * {@link StreamChannel} for opening streaming connections and
 * {@link SessionChannel} for closing server-side sessions. Each method returns a
 * {@link java.util.function} callable so transports execute calls through
 * {@link Function#apply(Object)}, {@link Supplier#get()} and {@link Runnable#run()}
 * without ever touching the underlying protocol types.
 *
 * <p>The concrete channel implementations backing this facade are selected
 * internally; callers only ever see this interface and cannot tell which
 * channel type was picked for a given exchange.
 */
public interface TransportChannel extends RequestChannel, StreamChannel, SessionChannel {
}
