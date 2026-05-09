package mcp.toolkit.testing.framework;

public final class BaseMcpComponentTestSetup {

    private BaseMcpComponentTestSetup() {}

    public static McpTestClient initializeMcpTestClient(String baseUrl) {
        McpTestClient client = new McpTestClient(baseUrl);
        client.initialize();
        return client;
    }

    public static McpTestClient initializeMcpTestClient(String baseUrl, String sseEndpointPath) {
        McpTestClient client = new McpTestClient(baseUrl, sseEndpointPath);
        client.initialize();
        return client;
    }
}
