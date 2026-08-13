package mcp.toolkit.testing.framework.interfaces;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Common contract for the low-level client used by MCP transports to exchange
 * JSON-RPC messages with the server.
 *
 * <p>Implementations wrap a concrete transport stack (e.g. the JDK HTTP client)
 * and are responsible only for the raw call: building a request from a URI,
 * headers and an optional payload, sending it synchronously or asynchronously,
 * and surfacing transport failures as {@link IllegalStateException}. MCP-level
 * concerns such as session management, status-code handling and SSE event
 * matching remain in the transports.
 *
 * <p>I/O failures and thread interruptions are reported as
 * {@link IllegalStateException}; successful responses are returned unwrapped so
 * the caller can inspect the status code and headers.
 */
public interface McpTransportClient extends AutoCloseable {

    /**
     * Sends a synchronous request carrying a payload and returns the response
     * body as a line stream.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @param payload request body
     * @return the response
     */
    McpResponse send(URI uri, Map<String, String> headers, String payload);

    /**
     * Sends a synchronous request carrying a payload and returns the response
     * body as a single string.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @param payload request body
     * @return the response
     */
    McpResponse sendAsText(URI uri, Map<String, String> headers, String payload);

    /**
     * Opens an asynchronous stream connection expected to carry Server-Sent Events.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @return a future resolving to the streaming response
     */
    CompletableFuture<McpResponse> openStream(URI uri, Map<String, String> headers);

    /**
     * Sends a synchronous request to close a server-side session.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @return the response
     */
    McpResponse closeSession(URI uri, Map<String, String> headers);

    /**
     * Releases any resources held by the client. Default implementation is a no-op.
     */
    @Override
    default void close() {
    }
}
