package mcp.toolkit.testing.framework.interfaces;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.function.Consumer;

/**
 * Transport abstraction for sending and receiving MCP JSON-RPC messages.
 *
 * <p>Custom transports may be plugged in by implementing this interface. New extension
 * points are declared as {@code default} methods so existing implementations keep
 * compiling; override them when you want the corresponding behaviour.
 */
public interface McpTransport extends AutoCloseable {

    /**
     * Establishes the connection to the MCP server (e.g. opens an SSE stream or
     * prepares the HTTP client). Must be invoked before any message is exchanged.
     */
    void connect();

    /**
     * Sends a JSON-RPC request and blocks until its response arrives.
     *
     * @param payload   serialized JSON-RPC request
     * @param requestId id of the request, used to match the response
     * @return the parsed JSON-RPC response
     */
    JsonNode sendRequest(String payload, long requestId);

    /**
     * Sends a JSON-RPC notification without expecting a response.
     *
     * @param payload serialized JSON-RPC notification
     */
    void sendNotification(String payload);

    /**
     * Closes the transport and releases all resources.
     */
    @Override
    void close();

    /**
     * Registers a listener that receives server-initiated JSON-RPC messages (requests
     * and notifications) that do not belong to an outstanding client request, e.g.
     * {@code roots/list}, {@code sampling/createMessage}, {@code notifications/message}
     * or {@code notifications/progress}.
     *
     * @param listener consumer of server messages; may be {@code null} to clear
     */
    default void setServerMessageListener(Consumer<JsonNode> listener) {
        // no-op by default
    }

    /**
     * Registers a callback invoked when an HTTP session is terminated by the server and a
     * fresh {@code initialize} handshake is required. Transports without session
     * management never invoke it.
     *
     * @param handler re-initialization handler; may be {@code null} to clear
     */
    default void setSessionExpiredHandler(Runnable handler) {
        // no-op by default
    }

    /**
     * Drops any cached session state so that the next {@link #sendRequest(String, long)}
     * performs a session-less handshake. Transports without session management do nothing.
     */
    default void clearSession() {
        // no-op by default
    }
}
