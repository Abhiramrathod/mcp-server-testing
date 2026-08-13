package mcp.toolkit.testing.framework.interfaces;

/**
 * Channel that manages the connection lifecycle of an MCP transport.
 *
 * <p>Each method returns a {@link Runnable} so callers invoke the lifecycle
 * through {@link Runnable#run()} without ever touching the concrete transport
 * behind the channel.
 */
public interface ConnectionChannel {

    /**
     * Returns a runnable that establishes the connection to the MCP server.
     *
     * @return the connection runnable
     */
    Runnable connect();

    /**
     * Returns a runnable that closes the connection and releases resources.
     *
     * @return the close runnable
     */
    Runnable close();
}
