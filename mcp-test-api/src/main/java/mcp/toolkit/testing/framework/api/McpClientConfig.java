package mcp.toolkit.testing.framework.api;

import java.time.Duration;

/**
 * Configuration for an {@link McpClient}.
 *
 * <p>Build via {@link #defaults()} or the fluent {@link Builder}:
 * <pre>{@code
 * McpClientConfig config = McpClientConfig.builder()
 *         .timeout(Duration.ofSeconds(30))
 *         .protocolVersion("2024-11-05")
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

    private final Duration timeout;
    private final String protocolVersion;

    private McpClientConfig(Builder builder) {
        this.timeout = builder.timeout;
        this.protocolVersion = builder.protocolVersion;
    }

    /** Request timeout applied to connection and individual RPC calls. */
    public Duration timeout() { return timeout; }

    /** MCP protocol version advertised during the initialize handshake. */
    public String protocolVersion() { return protocolVersion; }

    /** Returns a config with all default values. */
    public static McpClientConfig defaults() {
        return builder().build();
    }

    /** Returns a new builder pre-populated with default values. */
    public static Builder builder() {
        return new Builder();
    }

    @Override
    public String toString() {
        return "McpClientConfig{timeout=" + timeout + ", protocolVersion='" + protocolVersion + "'}";
    }

    /** Fluent builder for {@link McpClientConfig}. */
    public static final class Builder {

        private Duration timeout = DEFAULT_TIMEOUT;
        private String protocolVersion = DEFAULT_PROTOCOL_VERSION;

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

        /** Builds the {@link McpClientConfig}. */
        public McpClientConfig build() {
            return new McpClientConfig(this);
        }
    }
}
