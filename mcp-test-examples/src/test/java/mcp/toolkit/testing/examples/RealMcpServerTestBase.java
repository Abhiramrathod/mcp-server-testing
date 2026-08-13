package mcp.toolkit.testing.examples;

import mcp.toolkit.testing.examples.server.DummyMcpServer;
import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpClientConfig;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;

import java.time.Duration;

/**
 * Base class for example tests that exercise the framework against a real,
 * running MCP server.
 *
 * <p>By default a {@link DummyMcpServer} is started on an ephemeral port for the
 * whole class and a fresh, initialized {@link McpClient} is created for every
 * test method. Point the system property {@code mcp.test.server.url} at an
 * external server (e.g. {@code -Dmcp.test.server.url=http://localhost:8080}) to
 * run the same tests against that server instead.
 */
public abstract class RealMcpServerTestBase {

    private static final String EXTERNAL_URL_PROPERTY = "mcp.test.server.url";

    private static DummyMcpServer server;
    private static String serverBaseUrl;

    /** Fresh, initialized client scoped to the current test method. */
    protected McpClient client;

    @BeforeAll
    static void startServer() throws Exception {
        String external = System.getProperty(EXTERNAL_URL_PROPERTY);
        if (external != null && !external.isBlank()) {
            serverBaseUrl = external;
            System.out.println("Using external MCP server at " + serverBaseUrl);
            return;
        }
        server = new DummyMcpServer(0);
        server.start();
        serverBaseUrl = server.baseUrl();
    }

    @AfterAll
    static void stopServer() {
        if (server != null) {
            server.stop();
            server = null;
        }
    }

    @BeforeEach
    void connectClient() {
        client = McpClient.connectTo(serverBaseUrl)
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(10))
                        .protocolVersion("2024-11-05")
                        .build())
                .initializeOnBuild()
                .build();
    }

    @AfterEach
    void disconnectClient() {
        if (client != null) {
            client.close();
            client = null;
        }
    }
}
