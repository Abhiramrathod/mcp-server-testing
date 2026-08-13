package mcp.toolkit.testing.framework.client.util;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class McpTestClientUtilsTest {

    @Test
    void normalizesBaseUriWithTrailingSlash() {
        assertEquals(java.net.URI.create("http://localhost:8080/"),
                McpTestClientUtils.normalizeBaseUri("http://localhost:8080"));
        assertEquals(java.net.URI.create("http://localhost:8080/"),
                McpTestClientUtils.normalizeBaseUri("http://localhost:8080/"));
    }

    @Test
    void rejectsBlankBaseUrl() {
        assertThrows(IllegalArgumentException.class, () -> McpTestClientUtils.normalizeBaseUri("  "));
    }

    @Test
    void normalizesEndpointPaths() {
        assertEquals("/sse", McpTestClientUtils.normalizePath("sse"));
        assertEquals("/mcp", McpTestClientUtils.normalizePath("/mcp"));
    }

    @Test
    void resolvesSseEndpointUnderBase() {
        McpTestClientUtils.ResolvedEndpoints endpoints =
                McpTestClientUtils.resolveEndpoints("http://localhost:8080", "/sse");
        assertEquals("http://localhost:8080/sse", endpoints.sseEndpointUri().toString());
    }

    @Test
    void buildInitializeParamsAdvertisesClientCapabilities() {
        McpJsonCodec codec = new McpJsonCodec(new ObjectMapper());
        ObjectNode params = McpTestClientUtils.buildInitializeParams(codec, "2024-11-05");

        assertEquals("2024-11-05", params.path("protocolVersion").asText());
        assertEquals("mcp-test-client", params.path("clientInfo").path("name").asText());
        assertEquals(true, params.path("capabilities").path("roots").path("listChanged").asBoolean());
    }

    @Test
    void resolveProtocolVersionFallsBackToDefault() {
        assertEquals("2024-11-05", McpTestClientUtils.resolveProtocolVersion(null));
        assertEquals("2025-03-26", McpTestClientUtils.resolveProtocolVersion("2025-03-26"));
    }
}
