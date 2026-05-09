package mcp.toolkit.testing.framework.interfaces;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Transport abstraction for sending and receiving MCP JSON-RPC messages.
 */
public interface McpTransport extends AutoCloseable {

    void connect();

    JsonNode sendRequest(String payload, long requestId);

    void sendNotification(String payload);

    @Override
    void close();
}
