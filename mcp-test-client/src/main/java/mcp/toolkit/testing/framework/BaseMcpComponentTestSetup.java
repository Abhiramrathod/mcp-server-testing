package mcp.toolkit.testing.framework;

import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;

public final class BaseMcpComponentTestSetup {

    private BaseMcpComponentTestSetup() {}

    public static McpTestClient initializeMcpTestClient(String baseUrl) {
        McpTestClient client = new McpTestClient(baseUrl);
        client.initialize();
        return client;
    }

    public static McpTestClient initializeMcpTestClient(String baseUrl, String endpointPath) {
        McpTestClient client = new McpTestClient(baseUrl, endpointPath, false);
        client.initialize();
        return client;
    }

    public static McpTestClient initializeStreamableHttpMcpTestClient(String baseUrl) {
        McpTestClient client = new McpTestClient(baseUrl, McpTestClientConstants.Endpoints.MCP, true);
        client.initialize();
        return client;
    }

    public static McpTestClient initializeStreamableHttpMcpTestClient(String baseUrl, String endpointPath) {
        McpTestClient client = new McpTestClient(baseUrl, endpointPath, true);
        client.initialize();
        return client;
    }
}
