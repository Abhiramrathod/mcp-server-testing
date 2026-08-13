package mcp.toolkit.testing.framework.core.exception;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Signals that a stateless (2026-07-28+) MCP server answered a request with a
 * Multi Round-Trip Request (MRTR) interim result ({@code resultType:
 * "input_required"}).
 *
 * <p>The server needs additional information from the client before it can
 * complete the request. The requestor should obtain the requested input and
 * retry the original request, echoing the interim result's {@code requestState}
 * and providing the input under {@code inputResponses}.
 */
public final class McpInputRequiredException extends RuntimeException {

    private final JsonNode inputRequests;
    private final JsonNode result;

    /**
     * Creates an exception for an {@code input_required} result.
     *
     * @param result        the full interim result payload
     * @param inputRequests the {@code inputRequests} array carried by the result
     */
    public McpInputRequiredException(JsonNode result, JsonNode inputRequests) {
        super("Server requires additional input (resultType=input_required). "
                + "Retry the request with inputResponses and the returned requestState.");
        this.result = result;
        this.inputRequests = inputRequests == null || inputRequests.isNull()
                ? null
                : inputRequests.deepCopy();
    }

    /**
     * Returns the {@code inputRequests} array carried by the interim result, or
     * {@code null} if the server did not include one.
     *
     * @return input requests, or {@code null}
     */
    public JsonNode inputRequests() {
        return inputRequests;
    }

    /**
     * Returns the full interim {@code input_required} result payload.
     *
     * @return the raw result
     */
    public JsonNode result() {
        return result;
    }
}
