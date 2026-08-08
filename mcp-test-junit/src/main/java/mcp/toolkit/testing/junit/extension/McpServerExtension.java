package mcp.toolkit.testing.junit.extension;

import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.McpClientConfig;
import mcp.toolkit.testing.junit.annotation.McpServerTest;
import mcp.toolkit.testing.junit.annotation.Transport;
import mcp.toolkit.testing.junit.server.McpTestServer;
import org.junit.jupiter.api.extension.AfterAllCallback;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.ParameterContext;
import org.junit.jupiter.api.extension.ParameterResolver;
import org.junit.platform.commons.support.AnnotationSupport;

import java.lang.reflect.Parameter;
import java.time.Duration;
import java.util.Optional;

/**
 * JUnit 5 extension that starts an embedded {@link McpTestServer} for a test
 * class and provides a fresh, ready-to-use {@link McpClient} to every test.
 *
 * <p>Apply it with the composed {@link McpServerTest} annotation:
 * <pre>{@code
 * @McpServerTest(transport = Transport.STREAMABLE_HTTP)
 * class MyMcpTest {
 *
 *     @BeforeAll
 *     static void configure(McpTestServer server) {
 *         server.addTool("echo", "Echoes input", args ->
 *                 McpResponses.toolText(args.path("message").asText()));
 *     }
 *
 *     @Test
 *     void echoWorks(McpClient client) {
 *         McpToolResult result = client.tools()
 *                 .callTool("echo", Map.of("message", "hello"))
 *                 .assertSuccess();
 *         assertEquals("hello", result.firstText());
 *     }
 * }
 * }</pre>
 *
 * <p>Lifecycle managed by this extension:
 * <ul>
 *   <li>{@code beforeAll} — starts the embedded server (configured by
 *       {@link McpServerTest}), if the annotation is present;</li>
 *   <li>{@code beforeEach} — builds and initializes a fresh client;</li>
 *   <li>{@code afterEach} — closes that client;</li>
 *   <li>{@code afterAll} — stops the embedded server.</li>
 * </ul>
 *
 * <p>Supported injectable parameters: {@link McpTestServer} (the shared embedded
 * server) and {@link McpClient} (a client scoped to the current test).
 */
public class McpServerExtension implements
        BeforeAllCallback, AfterAllCallback, BeforeEachCallback, AfterEachCallback, ParameterResolver {

    private static final ExtensionContext.Namespace NAMESPACE =
            ExtensionContext.Namespace.create(McpServerExtension.class);
    private static final String SERVER_KEY = "server";
    private static final String CLIENT_KEY = "client";

    /**
     * Reads the {@link McpServerTest} annotation from the test class and, when
     * present, builds and starts the embedded {@link McpTestServer}, storing it
     * for the whole class.
     *
     * @param context extension context for the test class
     */
    @Override
    public void beforeAll(ExtensionContext context) throws Exception {
        Optional<McpServerTest> annotation = context.getElement()
                .flatMap(el -> AnnotationSupport.findAnnotation(el, McpServerTest.class));
        if (annotation.isEmpty()) {
            return;
        }
        McpTestServer server = toServer(annotation.get());
        server.start();
        context.getStore(NAMESPACE).put(SERVER_KEY, server);
    }

    /**
     * Stores a freshly built and initialized {@link McpClient} for the current
     * test method, configured from the class annotation. Does nothing when no
     * server was started for the class.
     *
     * @param context extension context for the test method
     */
    @Override
    public void beforeEach(ExtensionContext context) {
        ExtensionContext.Store store = context.getStore(NAMESPACE);
        McpTestServer server = store.get(SERVER_KEY, McpTestServer.class);
        if (server == null) {
            return;
        }
        McpServerTest annotation = classAnnotation(context);
        McpClient client = buildClient(server, annotation);
        store.put(CLIENT_KEY, client);
    }

    /**
     * Closes and removes the {@link McpClient} created for the test method.
     *
     * @param context extension context for the test method
     */
    @Override
    public void afterEach(ExtensionContext context) {
        ExtensionContext.Store store = context.getStore(NAMESPACE);
        McpClient client = store.remove(CLIENT_KEY, McpClient.class);
        if (client != null) {
            client.close();
        }
    }

    /**
     * Stops and removes the embedded {@link McpTestServer} started for the class.
     *
     * @param context extension context for the test class
     */
    @Override
    public void afterAll(ExtensionContext context) {
        ExtensionContext.Store store = context.getStore(NAMESPACE);
        McpTestServer server = store.remove(SERVER_KEY, McpTestServer.class);
        if (server != null) {
            server.stop();
        }
    }

    /**
     * Returns {@code true} for {@link McpTestServer} and {@link McpClient}
     * parameters, enabling injection of the shared server and the method-scoped
     * client into test methods.
     *
     * @param parameterContext parameter being resolved
     * @param extensionContext extension context
     * @return whether this extension can provide the parameter
     */
    @Override
    public boolean supportsParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
        Parameter parameter = parameterContext.getParameter();
        return parameter.getType() == McpTestServer.class
                || parameter.getType() == McpClient.class;
    }

    /**
     * Returns the class-scoped {@link McpTestServer} or the method-scoped
     * {@link McpClient} from the extension store.
     *
     * @param parameterContext parameter being resolved
     * @param extensionContext extension context
     * @return the stored server or client, or {@code null} if unavailable
     */
    @Override
    public Object resolveParameter(ParameterContext parameterContext, ExtensionContext extensionContext) {
        ExtensionContext.Store store = extensionContext.getStore(NAMESPACE);
        Parameter parameter = parameterContext.getParameter();
        if (parameter.getType() == McpTestServer.class) {
            return store.get(SERVER_KEY, McpTestServer.class);
        }
        if (parameter.getType() == McpClient.class) {
            return store.get(CLIENT_KEY, McpClient.class);
        }
        return null;
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private static McpTestServer toServer(McpServerTest annotation) {
        return McpTestServer.builder()
                .name(annotation.name())
                .version(annotation.version())
                .protocolVersion(annotation.protocolVersion())
                .port(annotation.port())
                .transport(annotation.transport())
                .build();
    }

    private static McpServerTest classAnnotation(ExtensionContext context) {
        return context.getTestClass()
                .flatMap(clazz -> AnnotationSupport.findAnnotation(clazz, McpServerTest.class))
                .orElse(null);
    }

    private static McpClient buildClient(McpTestServer server, McpServerTest annotation) {
        Transport transport = annotation != null
                ? annotation.transport()
                : Transport.SSE;
        long timeoutMillis = annotation != null
                ? annotation.clientTimeoutMillis()
                : 10_000;

        McpClient.Builder builder = McpClient.connectTo(server.baseUrl())
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofMillis(timeoutMillis))
                        .protocolVersion(annotation != null ? annotation.protocolVersion() : "2024-11-05")
                        .build());
        if (transport == Transport.STREAMABLE_HTTP) {
            builder.streamableHttp();
        } else {
            builder.sse();
        }
        return builder.initializeOnBuild().build();
    }
}
