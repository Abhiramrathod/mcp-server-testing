package mcp.toolkit.testing.framework.core.constants;

import java.time.Duration;

/**
 * Shared constants used by the MCP testing framework.
 */
public final class McpTestClientConstants {

    public static final class Defaults {
        public static final Duration TIMEOUT = Duration.ofSeconds(10);
        public static final String PROTOCOL_VERSION = "2024-11-05";
        private Defaults() {}
    }

    public static final class Endpoints {
        public static final String SSE = "/sse";
        public static final String MESSAGE = "/mcp/message";
        private Endpoints() {}
    }

    public static final class SseEvents {
        public static final String ENDPOINT = "endpoint";
        public static final String MESSAGE = "message";
        private SseEvents() {}
    }

    public static final class Headers {
        public static final String MCP_PROTOCOL_VERSION = "MCP-Protocol-Version";
        private Headers() {}
    }

    public static final class Methods {
        public static final String INITIALIZE = "initialize";
        public static final String RESOURCES_LIST = "resources/list";
        public static final String RESOURCES_READ = "resources/read";
        public static final String PROMPTS_LIST = "prompts/list";
        public static final String PROMPTS_GET = "prompts/get";
        public static final String TOOLS_CALL = "tools/call";
        public static final String TOOLS_LIST = "tools/list";
        private Methods() {}
    }

    public static final class Notifications {
        public static final String INITIALIZED = "notifications/initialized";
        private Notifications() {}
    }

    private McpTestClientConstants() {}
}
