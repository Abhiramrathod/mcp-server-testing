package mcp.toolkit.testing.framework.interfaces;

import java.net.URI;
import java.util.Map;

/**
 * Channel that terminates server-side sessions.
 */
public interface SessionChannel {

    /**
     * Returns a runnable that closes a server-side session.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @return the session closer
     */
    Runnable closeSession(URI uri, Map<String, String> headers);
}
