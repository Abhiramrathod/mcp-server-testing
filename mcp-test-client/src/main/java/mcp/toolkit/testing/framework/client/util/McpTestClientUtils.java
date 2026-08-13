package mcp.toolkit.testing.framework.client.util;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.prompts.McpPromptDirectory;
import mcp.toolkit.testing.framework.client.resources.McpResourceDirectory;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.client.tools.McpToolDirectory;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import mcp.toolkit.testing.framework.transport.McpTransportFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.net.URI;
import java.time.Duration;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

public final class McpTestClientUtils {

    private McpTestClientUtils() {}

    /**
     * Resolves the protocol version, falling back to the framework default when
     * the given value is {@code null}.
     *
     * @param protocolVersion MCP protocol version; may be {@code null}
     * @return the effective protocol version
     */
    public static String resolveProtocolVersion(String protocolVersion) {
        return protocolVersion == null ? McpTestClientConstants.Defaults.PROTOCOL_VERSION : protocolVersion;
    }

    /**
     * Resolves the base URI and the SSE endpoint URI for the given server URL
     * and endpoint path.
     *
     * @param baseUrl          base URL of the MCP server
     * @param sseEndpointPath  endpoint path relative to the server URL
     * @return resolved endpoints
     */
    public static ResolvedEndpoints resolveEndpoints(String baseUrl, String sseEndpointPath) {
        URI base = normalizeBaseUri(baseUrl);
        return new ResolvedEndpoints(base, base.resolve(normalizePath(sseEndpointPath)));
    }

    /**
     * Normalizes a base URL so it always ends with a trailing slash.
     *
     * @param baseUrl base URL of the MCP server
     * @return normalized base URI
     * @throws IllegalArgumentException if the URL is blank or malformed
     */
    public static URI normalizeBaseUri(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) throw new IllegalArgumentException("baseUrl must not be blank");
        String trimmed = baseUrl.trim();
        return URI.create(trimmed.endsWith("/") ? trimmed : trimmed + "/");
    }

    /**
     * Normalizes a path so it always starts with a leading slash.
     *
     * @param path endpoint path; may be {@code null} or blank
     * @return normalized path, or {@code "/"} when the input is blank
     */
    public static String normalizePath(String path) {
        if (path == null || path.isBlank()) return "/";
        String trimmed = path.trim();
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    }

    /**
     * Builds the params object for the {@code initialize} request, including
     * protocol version, capabilities and client info.
     *
     * @param jsonCodec        codec used to build the params node
     * @param protocolVersion  MCP protocol version
     * @return the initialized params node
     */
    public static ObjectNode buildInitializeParams(McpJsonCodec jsonCodec, String protocolVersion) {
        return jsonCodec.buildParams(params -> {
            params.put("protocolVersion", protocolVersion);
            ObjectNode caps = params.putObject("capabilities");
            caps.putObject("roots").put("listChanged", true);
            caps.putObject("sampling");
            ObjectNode clientInfo = params.putObject("clientInfo");
            clientInfo.put("name", "mcp-test-client");
            clientInfo.put("version", "1.0.0");
        });
    }

    /**
     * Builds the components of a client using default timeouts and no extra
     * headers. This is a convenience overload of
     * {@link #buildComponents(ObjectMapper, String, String, String, McpInitializationGuard, boolean, Duration, Map)}.
     *
     * @param objectMapper     JSON mapper used for serialization and parsing
     * @param protocolVersion  MCP protocol version
     * @param baseUrl          base URL of the MCP server
     * @param sseEndpointPath  endpoint path relative to the server URL
     * @param initGuard        initialization guard
     * @return the assembled client components
     */
    public static ClientComponents buildComponents(ObjectMapper objectMapper, String protocolVersion,
                                                   String baseUrl, String sseEndpointPath,
                                                   McpInitializationGuard initGuard) {
        return buildComponents(objectMapper, protocolVersion, baseUrl, sseEndpointPath, initGuard, false);
    }

    /**
     * Builds the components of a client with the given transport choice, using
     * default timeouts and no extra headers. This is a convenience overload of
     * {@link #buildComponents(ObjectMapper, String, String, String, McpInitializationGuard, boolean, Duration, Map)}.
     *
     * @param objectMapper       JSON mapper used for serialization and parsing
     * @param protocolVersion    MCP protocol version
     * @param baseUrl            base URL of the MCP server
     * @param endpointPath       endpoint path relative to the server URL
     * @param initGuard          initialization guard
     * @param useStreamableHttp  {@code true} to use Streamable HTTP, {@code false} for SSE
     * @return the assembled client components
     */
    public static ClientComponents buildComponents(ObjectMapper objectMapper, String protocolVersion,
                                                   String baseUrl, String endpointPath,
                                                   McpInitializationGuard initGuard,
                                                   boolean useStreamableHttp) {
        return buildComponents(objectMapper, protocolVersion, baseUrl, endpointPath,
                initGuard, useStreamableHttp, McpTestClientConstants.Defaults.TIMEOUT, Collections.emptyMap());
    }

    /**
     * Builds all components of a client: transport, codec, RPC client and the
     * tool, resource and prompt directories.
     *
     * @param objectMapper       JSON mapper used for serialization and parsing
     * @param protocolVersion    MCP protocol version
     * @param baseUrl            base URL of the MCP server
     * @param endpointPath       endpoint path relative to the server URL
     * @param initGuard          initialization guard
     * @param useStreamableHttp  {@code true} to use Streamable HTTP, {@code false} for SSE
     * @param timeout            connection and request timeout
     * @param headers            additional HTTP headers for every request
     * @return the assembled client components
     */
    public static ClientComponents buildComponents(ObjectMapper objectMapper, String protocolVersion,
                                                   String baseUrl, String endpointPath,
                                                   McpInitializationGuard initGuard,
                                                   boolean useStreamableHttp,
                                                   Duration timeout,
                                                   Map<String, String> headers) {
        ResolvedEndpoints endpoints = resolveEndpoints(baseUrl, endpointPath);
        McpJsonCodec jsonCodec = new McpJsonCodec(objectMapper);
        AtomicLong idSequence = new AtomicLong(1);
        McpTransport transport;
        if (useStreamableHttp) {
            transport = McpTransportFactory.streamable(
                    endpoints.sseEndpointUri(), protocolVersion,
                    timeout, jsonCodec, headers);
        } else {
            transport = McpTransportFactory.sse(
                    endpoints.sseEndpointUri(), endpoints.baseUri(),
                    protocolVersion, timeout, jsonCodec, headers);
        }
        McpRpcClient rpcClient = new McpRpcClient(transport, idSequence, jsonCodec, protocolVersion);
        return new ClientComponents(transport, jsonCodec, rpcClient,
                new McpToolDirectory(initGuard, rpcClient, jsonCodec),
                new McpResourceDirectory(initGuard, rpcClient, jsonCodec),
                new McpPromptDirectory(initGuard, rpcClient, jsonCodec));
    }

    /**
     * The assembled components of an MCP test client.
     *
     * @param transport          transport used for sending and receiving JSON-RPC messages
     * @param jsonCodec          JSON codec for payload construction and parsing
     * @param rpcClient          low-level JSON-RPC client
     * @param toolDirectory      directory for tool discovery and invocation
     * @param resourceDirectory  directory for resource listing and reading
     * @param promptDirectory    directory for prompt listing and retrieval
     */
    public record ClientComponents(
            McpTransport transport,
            McpJsonCodec jsonCodec,
            McpRpcClient rpcClient,
            McpToolDirectory toolDirectory,
            McpResourceDirectory resourceDirectory,
            McpPromptDirectory promptDirectory) {}

    public static final class ResolvedEndpoints {
        private final URI baseUri;
        private final URI sseEndpointUri;

        private ResolvedEndpoints(URI baseUri, URI sseEndpointUri) {
            this.baseUri = baseUri;
            this.sseEndpointUri = sseEndpointUri;
        }

        /**
         * Returns the normalized base URI of the server.
         *
         * @return base URI
         */
        public URI baseUri() { return baseUri; }

        /**
         * Returns the resolved SSE endpoint URI.
         *
         * @return SSE endpoint URI
         */
        public URI sseEndpointUri() { return sseEndpointUri; }
    }
}
