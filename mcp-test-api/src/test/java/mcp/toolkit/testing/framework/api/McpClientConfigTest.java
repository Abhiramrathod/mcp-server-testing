package mcp.toolkit.testing.framework.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.net.Proxy;
import java.time.Duration;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class McpClientConfigTest {

    @Test
    void defaultsAreSensible() {
        McpClientConfig config = McpClientConfig.defaults();
        assertEquals(McpClientConfig.DEFAULT_TIMEOUT, config.timeout());
        assertEquals(McpClientConfig.DEFAULT_PROTOCOL_VERSION, config.protocolVersion());
        assertTrue(config.headers().isEmpty());
    }

    @Test
    void builderCustomizesValues() {
        ObjectMapper custom = new ObjectMapper();
        McpClientConfig config = McpClientConfig.builder()
                .timeout(Duration.ofSeconds(30))
                .protocolVersion("2025-03-26")
                .objectMapper(custom)
                .header("Authorization", "Bearer token")
                .build();

        assertEquals(Duration.ofSeconds(30), config.timeout());
        assertEquals("2025-03-26", config.protocolVersion());
        assertEquals(custom, config.objectMapper());
        assertEquals("Bearer token", config.headers().get("Authorization"));
    }

    @Test
    void headersAreCopiedImmutable() {
        McpClientConfig config = McpClientConfig.builder()
                .headers(Map.of("X-Test", "1"))
                .build();
        assertThrows(UnsupportedOperationException.class, () -> config.headers().put("X", "2"));
    }

    @Test
    void rejectsInvalidValues() {
        assertThrows(IllegalArgumentException.class, () -> McpClientConfig.builder().timeout(null));
        assertThrows(IllegalArgumentException.class, () -> McpClientConfig.builder().timeout(Duration.ZERO));
        assertThrows(IllegalArgumentException.class, () -> McpClientConfig.builder().protocolVersion(""));
        assertThrows(IllegalArgumentException.class, () -> McpClientConfig.builder().objectMapper(null));
        assertThrows(IllegalArgumentException.class, () -> McpClientConfig.builder().header("", "v"));
    }

    @Test
    void proxyIsOptionalByDefault() {
        assertNull(McpClientConfig.defaults().proxy());
        assertNull(McpClientConfig.builder().build().proxy());
    }

    @Test
    void builderAcceptsHttpProxy() {
        Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress("proxy.corp", 8080));
        assertEquals(proxy, McpClientConfig.builder().proxy(proxy).build().proxy());
        assertNull(McpClientConfig.builder().proxy(proxy).proxy(null).build().proxy());
    }

    @Test
    void rejectsNonHttpProxies() {
        assertThrows(IllegalArgumentException.class,
                () -> McpClientConfig.builder().proxy(
                        new Proxy(Proxy.Type.SOCKS, new InetSocketAddress("socks.corp", 1080))));
        assertThrows(IllegalArgumentException.class,
                () -> McpClientConfig.builder().proxy(Proxy.NO_PROXY));
    }
}
