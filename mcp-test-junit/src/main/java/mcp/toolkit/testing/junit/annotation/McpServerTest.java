package mcp.toolkit.testing.junit.annotation;

import mcp.toolkit.testing.junit.extension.McpServerExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * JUnit 5 annotation that starts an embedded MCP server for a test class and
 * makes a ready-to-use {@link mcp.toolkit.testing.framework.api.McpClient}
 * available to every test.
 *
 * <p>Usage:
 * <pre>{@code
 * @McpServerTest(transport = Transport.STREAMABLE_HTTP)
 * class MyMcpTest {
 *
 *     @BeforeAll
 *     static void configure(McpTestServer server) {
 *         server.addTool(...);
 *     }
 *
 *     @Test
 *     void discoversTools(McpClient client) {
 *         List<McpTool> tools = client.tools().listTools();
 *         ...
 *     }
 * }
 * }</pre>
 *
 * <p>The embedded server lifecycle (start before all tests, stop after all
 * tests) and a fresh {@code McpClient} per test method (closed after each test)
 * are managed by {@link McpServerExtension}.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@ExtendWith(McpServerExtension.class)
public @interface McpServerTest {

    /**
     * Advertised server name, returned during the initialize handshake.
     *
     * @return server name
     */
    String name() default "mcp-test-server";

    /**
     * Advertised server version, returned during the initialize handshake.
     *
     * @return server version
     */
    String version() default "1.0.0";

    /**
     * MCP protocol version to advertise during the initialize handshake.
     *
     * @return protocol version string
     */
    String protocolVersion() default "2024-11-05";

    /**
     * Port the embedded server binds to; {@code 0} (the default) selects an
     * ephemeral port.
     *
     * @return server port
     */
    int port() default 0;

    /**
     * Transport the embedded server and the injected client use.
     *
     * @return transport
     */
    Transport transport() default Transport.SSE;

    /**
     * Timeout (milliseconds) applied to the injected client's connection and
     * individual RPC calls.
     *
     * @return timeout in milliseconds
     */
    long clientTimeoutMillis() default 10_000;
}
