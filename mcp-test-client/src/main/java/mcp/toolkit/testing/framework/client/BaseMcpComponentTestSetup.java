package mcp.toolkit.testing.framework.client;

import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;

public final class BaseMcpComponentTestSetup {

    private BaseMcpComponentTestSetup() {}

    /**
     * Creates an SSE client for the given server URL and performs the
     * {@code initialize} handshake.
     *
     * @param baseUrl base URL of the MCP server
     * @return an initialized MCP test client
     */
    public static McpTestClient initializeMcpTestClient(String baseUrl) {
        McpTestClient client = new McpTestClient(baseUrl);
        client.initialize();
        return client;
    }

    /**
     * Creates an SSE client with a custom endpoint path and performs the
     * {@code initialize} handshake.
     *
     * @param baseUrl      base URL of the MCP server
     * @param endpointPath SSE endpoint path relative to the server URL
     * @return an initialized MCP test client
     */
    public static McpTestClient initializeMcpTestClient(String baseUrl, String endpointPath) {
        McpTestClient client = new McpTestClient(baseUrl, endpointPath, false);
        client.initialize();
        return client;
    }

    /**
     * Creates a Streamable HTTP client for the given server URL using the
     * default endpoint path and performs the {@code initialize} handshake.
     *
     * @param baseUrl base URL of the MCP server
     * @return an initialized MCP test client
     */
    public static McpTestClient initializeStreamableHttpMcpTestClient(String baseUrl) {
        McpTestClient client = new McpTestClient(baseUrl, McpTestClientConstants.Endpoints.MCP, true);
        client.initialize();
        return client;
    }

    /**
     * Creates a Streamable HTTP client with a custom endpoint path and performs
     * the {@code initialize} handshake.
     *
     * @param baseUrl      base URL of the MCP server
     * @param endpointPath endpoint path relative to the server URL
     * @return an initialized MCP test client
     */
    public static McpTestClient initializeStreamableHttpMcpTestClient(String baseUrl, String endpointPath) {
        McpTestClient client = new McpTestClient(baseUrl, endpointPath, true);
        client.initialize();
        return client;
    }
}
