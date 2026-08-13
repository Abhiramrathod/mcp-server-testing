package mcp.toolkit.testing.framework.interfaces;

import java.net.URI;
import java.util.Map;
import java.util.function.Function;

/**
 * Channel that performs synchronous request/response exchanges.
 *
 * <p>Each method returns a payload-to-response function so callers invoke the
 * exchange through {@link Function#apply(Object)} without ever touching the
 * underlying protocol types.
 */
public interface RequestChannel {

    /**
     * Returns a payload-to-response function for a synchronous request/response
     * exchange. The response body is exposed as a line stream.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @return the exchange function
     */
    Function<String, McpResponse> exchange(URI uri, Map<String, String> headers);

    /**
     * Returns a payload-to-response function for a synchronous exchange whose
     * response body is exposed as a single string.
     *
     * @param uri     target endpoint
     * @param headers request headers
     * @return the exchange function
     */
    Function<String, McpResponse> exchangeAsText(URI uri, Map<String, String> headers);
}
