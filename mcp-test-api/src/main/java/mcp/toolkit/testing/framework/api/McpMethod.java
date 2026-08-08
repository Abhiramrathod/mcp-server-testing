package mcp.toolkit.testing.framework.api;

/**
 * Enumeration of standard MCP JSON-RPC method names.
 *
 * <p>Use these constants instead of raw strings when querying exchange history:
 * <pre>{@code
 * client.exchanges().assertAllSucceeded(McpMethod.TOOLS_CALL);
 * client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);
 * long p99 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 99);
 * }</pre>
 */
public enum McpMethod {

    INITIALIZE("initialize"),
    PING("ping"),
    TOOLS_LIST("tools/list"),
    TOOLS_CALL("tools/call"),
    RESOURCES_LIST("resources/list"),
    RESOURCES_READ("resources/read"),
    RESOURCES_TEMPLATES_LIST("resources/templates/list"),
    PROMPTS_LIST("prompts/list"),
    PROMPTS_GET("prompts/get"),
    COMPLETION_COMPLETE("completion/complete"),
    LOGGING_SET_LEVEL("logging/setLevel");

    private final String value;

    McpMethod(String value) {
        this.value = value;
    }

    /** Returns the raw JSON-RPC method string, e.g. {@code "tools/call"}. */
    public String value() {
        return value;
    }

    /**
     * Returns the raw JSON-RPC method string, e.g. {@code "tools/call"}.
     *
     * @return the underlying method string
     */
    @Override
    public String toString() {
        return value;
    }
}
