package mcp.toolkit.testing.framework.interfaces;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.function.BiFunction;
import java.util.function.Consumer;

/**
 * Channel that exchanges JSON-RPC messages with the MCP server.
 *
 * <p>Each method returns a {@link java.util.function} callable so callers invoke
 * messages through {@link BiFunction#apply(Object, Object)} or
 * {@link Consumer#accept(Object)} without ever touching the concrete transport
 * behind the channel.
 */
public interface MessageChannel {

    /**
     * Returns a payload-and-id to response function for a request that blocks
     * until its response arrives.
     *
     * @return the request function, invoked with the serialized JSON-RPC request
     *         and its id
     */
    BiFunction<String, Long, JsonNode> sendRequest();

    /**
     * Returns a consumer that sends a JSON-RPC notification without expecting a
     * response.
     *
     * @return the notification consumer
     */
    Consumer<String> sendNotification();
}
