package mcp.toolkit.testing.framework.api;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Configuration for an {@link McpClient}.
 *
 * <p>Build via {@link #defaults()} or the fluent {@link Builder}:
 * <pre>{@code
 * McpClientConfig config = McpClientConfig.builder()
 *         .timeout(Duration.ofSeconds(30))
 *         .protocolVersion("2024-11-05")
 *         .header("Authorization", "Bearer token")
 *         .build();
 *
 * McpClient client = McpClient.connectTo("http://localhost:8080")
 *         .config(config)
 *         .build();
 * }</pre>
 */
public final class McpClientConfig {

    /** Default request timeout. */
    public static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(10);

    /** Default MCP protocol version. */
    public static final String DEFAULT_PROTOCOL_VERSION = "2024-11-05";

    /** Default SSE endpoint path. */
    public static final String DEFAULT_SSE_PATH = "/sse";

    /** Default Streamable HTTP endpoint path. */
    public static final String DEFAULT_MCP_PATH = "/mcp";

    private final Duration timeout;
    private final String protocolVersion;
    private final ObjectMapper objectMapper;
    private final Map<String, String> headers;

    private McpClientConfig(Builder builder) {
        this.timeout = builder.timeout;
        this.protocolVersion = builder.protocolVersion;
        this.objectMapper = builder.objectMapper;
        this.headers = Map.copyOf(builder.headers);
    }

    /** Request timeout applied to connection and individual RPC calls. */
    public Duration timeout() { return timeout; }

    /** MCP protocol version advertised during the initialize handshake. */
    public String protocolVersion() { return protocolVersion; }

    /**
     * Jackson {@link ObjectMapper} used for JSON serialization and parsing.
     *
     * @return the configured mapper, never {@code null}
     */
    public ObjectMapper objectMapper() { return objectMapper; }

    /**
     * Additional HTTP headers applied to every transport request, e.g. an
     * {@code Authorization} header.
     *
     * @return an immutable copy of the configured headers
     */
    public Map<String, String> headers() { return headers; }

    /** Returns a config with all default values. */
    public static McpClientConfig defaults() {
        return builder().build();
    }

    /** Returns a new builder pre-populated with default values. */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Returns a string representation of this configuration.
     *
     * @return a summary including timeout, protocol version, and configured header keys
     */
    @Override
    public String toString() {
        return "McpClientConfig{timeout=" + timeout + ", protocolVersion='" + protocolVersion
                + "', headers=" + headers.keySet() + "}";
    }

    /** Fluent builder for {@link McpClientConfig}. */
    public static final class Builder {

        private Duration timeout = DEFAULT_TIMEOUT;
        private String protocolVersion = DEFAULT_PROTOCOL_VERSION;
        private ObjectMapper objectMapper = new ObjectMapper();
        private final Map<String, String> headers = new LinkedHashMap<>();

        private Builder() {}

        /**
         * Sets the request timeout (default: 10 seconds).
         *
         * @param timeout request timeout
         * @return this builder
         */
        public Builder timeout(Duration timeout) {
            if (timeout == null || timeout.isNegative() || timeout.isZero()) {
                throw new IllegalArgumentException("timeout must be positive");
            }
            this.timeout = timeout;
            return this;
        }

        /**
         * Sets the MCP protocol version (default: {@code "2024-11-05"}).
         *
         * @param protocolVersion protocol version string
         * @return this builder
         */
        public Builder protocolVersion(String protocolVersion) {
            if (protocolVersion == null || protocolVersion.isBlank()) {
                throw new IllegalArgumentException("protocolVersion must not be blank");
            }
            this.protocolVersion = protocolVersion;
            return this;
        }

        /**
         * Sets a custom Jackson {@link ObjectMapper} (default: a plain
         * {@code new ObjectMapper()}).
         *
         * @param objectMapper mapper used for all JSON work; must not be null
         * @return this builder
         */
        public Builder objectMapper(ObjectMapper objectMapper) {
            if (objectMapper == null) {
                throw new IllegalArgumentException("objectMapper must not be null");
            }
            this.objectMapper = objectMapper;
            return this;
        }

        /**
         * Adds a custom HTTP header applied to every transport request, e.g.
         * {@code "Authorization"}.
         *
         * @param name  header name
         * @param value header value
         * @return this builder
         */
        public Builder header(String name, String value) {
            if (name == null || name.isBlank() || value == null) {
                throw new IllegalArgumentException("header name and value must not be blank");
            }
            this.headers.put(name, value);
            return this;
        }

        /**
         * Replaces all custom HTTP headers.
         *
         * @param headers map of header names to values; a copy is stored
         * @return this builder
         */
        public Builder headers(Map<String, String> headers) {
            if (headers == null) {
                throw new IllegalArgumentException("headers must not be null");
            }
            this.headers.clear();
            this.headers.putAll(headers);
            return this;
        }

        /** Builds the {@link McpClientConfig}. */
        public McpClientConfig build() {
            return new McpClientConfig(this);
        }
    }
}
