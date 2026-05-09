package mcp.toolkit.testing.framework.core.util;

import mcp.toolkit.testing.framework.client.lifecycle.McpInitializationGuard;
import mcp.toolkit.testing.framework.client.prompts.McpPromptDirectory;
import mcp.toolkit.testing.framework.client.resources.McpResourceDirectory;
import mcp.toolkit.testing.framework.client.rpc.McpRpcClient;
import mcp.toolkit.testing.framework.client.tools.McpToolDirectory;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import mcp.toolkit.testing.framework.transport.McpSseTransport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.net.URI;
import java.util.concurrent.atomic.AtomicLong;

public final class McpTestClientUtils {

    private McpTestClientUtils() {}

    public static String resolveProtocolVersion(String protocolVersion) {
        return protocolVersion == null ? McpTestClientConstants.Defaults.PROTOCOL_VERSION : protocolVersion;
    }

    public static ResolvedEndpoints resolveEndpoints(String baseUrl, String sseEndpointPath) {
        URI base = normalizeBaseUri(baseUrl);
        return new ResolvedEndpoints(base, base.resolve(normalizePath(sseEndpointPath)));
    }

    public static URI normalizeBaseUri(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) throw new IllegalArgumentException("baseUrl must not be blank");
        String trimmed = baseUrl.trim();
        return URI.create(trimmed.endsWith("/") ? trimmed : trimmed + "/");
    }

    public static String normalizePath(String path) {
        if (path == null || path.isBlank()) return "/";
        String trimmed = path.trim();
        return trimmed.startsWith("/") ? trimmed : "/" + trimmed;
    }

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

    public static ClientComponents buildComponents(ObjectMapper objectMapper, String protocolVersion,
                                                   String baseUrl, String sseEndpointPath,
                                                   McpInitializationGuard initGuard) {
        ResolvedEndpoints endpoints = resolveEndpoints(baseUrl, sseEndpointPath);
        McpJsonCodec jsonCodec = new McpJsonCodec(objectMapper);
        AtomicLong idSequence = new AtomicLong(1);
        McpTransport transport = new McpSseTransport(
                endpoints.sseEndpointUri(), endpoints.baseUri(),
                protocolVersion, McpTestClientConstants.Defaults.TIMEOUT, jsonCodec);
        McpRpcClient rpcClient = new McpRpcClient(transport, idSequence, jsonCodec);
        return new ClientComponents(transport, jsonCodec, rpcClient,
                new McpToolDirectory(initGuard, rpcClient, jsonCodec),
                new McpResourceDirectory(initGuard, rpcClient, jsonCodec),
                new McpPromptDirectory(initGuard, rpcClient, jsonCodec));
    }

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

        public URI baseUri() { return baseUri; }
        public URI sseEndpointUri() { return sseEndpointUri; }
    }
}
