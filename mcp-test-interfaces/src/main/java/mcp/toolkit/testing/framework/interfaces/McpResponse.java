package mcp.toolkit.testing.framework.interfaces;

import java.util.stream.Stream;

/**
 * A neutral transport response exposing the status code, headers and body
 * without leaking the underlying protocol types.
 */
public interface McpResponse {

    /**
     * @return the status code of the response
     */
    int statusCode();

    /**
     * @param name header name
     * @return the first value for the given header, or {@code null} if absent
     */
    String header(String name);

    /**
     * @return the response body as a line stream; single-use, and mutually
     *         exclusive with {@link #bodyAsText()}
     */
    Stream<String> bodyLines();

    /**
     * @return the response body as a single string
     */
    String bodyAsText();
}
