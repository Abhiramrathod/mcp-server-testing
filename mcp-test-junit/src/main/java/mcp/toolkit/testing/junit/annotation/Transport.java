package mcp.toolkit.testing.junit.annotation;

/**
 * Transport used by the embedded test server and the injected client.
 */
public enum Transport {

    /** Legacy HTTP + Server-Sent Events transport (protocol version 2024-11-05). */
    SSE,

    /** Streamable HTTP transport (protocol version 2025-03-26 and later). */
    STREAMABLE_HTTP
}
