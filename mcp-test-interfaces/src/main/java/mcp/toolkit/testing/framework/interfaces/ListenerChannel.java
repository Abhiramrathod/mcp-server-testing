package mcp.toolkit.testing.framework.interfaces;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.function.Consumer;

/**
 * Channel that registers callbacks and clears session state on an MCP transport.
 *
 * <p>Each method returns a {@link java.util.function} callable so callers
 * register callbacks through {@link Consumer#accept(Object)} or clear session
 * state through {@link Runnable#run()} without ever touching the concrete
 * transport behind the channel.
 */
public interface ListenerChannel {

    /**
     * Returns a consumer that registers a listener for server-initiated
     * JSON-RPC messages (requests and notifications).
     *
     * @return the listener registration consumer; accepts {@code null} to clear
     */
    Consumer<Consumer<JsonNode>> serverMessageListener();

    /**
     * Returns a consumer that registers a callback invoked when an HTTP session
     * is terminated by the server and a fresh {@code initialize} handshake is
     * required.
     *
     * @return the handler registration consumer; accepts {@code null} to clear
     */
    Consumer<Runnable> sessionExpiredHandler();

    /**
     * Returns a runnable that drops any cached session state so the next request
     * performs a session-less handshake.
     *
     * @return the session clear runnable
     */
    Runnable clearSession();
}
