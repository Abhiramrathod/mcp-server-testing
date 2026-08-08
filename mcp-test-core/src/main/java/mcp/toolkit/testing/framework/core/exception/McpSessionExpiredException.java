package mcp.toolkit.testing.framework.core.exception;

/**
 * Signals that the server terminated an HTTP session (typically reported with an
 * HTTP {@code 404 Not Found} and an {@code Mcp-Session-Id} header) and that a fresh
 * {@code initialize} handshake is required before further requests can be issued.
 *
 * <p>Per the Streamable HTTP transport specification, clients that receive a {@code 404}
 * on a request that carried an {@code Mcp-Session-Id} MUST start a new session by sending
 * a new {@code initialize} request without a session ID attached. The framework performs
 * this re-initialization transparently when possible; this exception is used internally
 * to trigger that flow.
 */
public class McpSessionExpiredException extends IllegalStateException {

    /**
     * Creates an exception with the given message.
     *
     * @param message detail message
     */
    public McpSessionExpiredException(String message) {
        super(message);
    }

    /**
     * Creates an exception with the given message and cause.
     *
     * @param message detail message
     * @param cause   underlying cause
     */
    public McpSessionExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
