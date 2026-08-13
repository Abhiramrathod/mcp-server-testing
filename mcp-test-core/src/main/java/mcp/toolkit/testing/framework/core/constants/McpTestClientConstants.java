package mcp.toolkit.testing.framework.core.constants;

import java.time.Duration;

/**
 * Shared constants used by the MCP testing framework.
 */
public final class McpTestClientConstants {

    public static final class Defaults {
        public static final Duration TIMEOUT = Duration.ofSeconds(10);
        /** Default protocol version used for backward compatibility (legacy session era). */
        public static final String PROTOCOL_VERSION = mcp.toolkit.testing.framework.core.util.McpProtocolVersions.V2024_11_05;
        /** Newest protocol version supported by the framework (stateless era). */
        public static final String LATEST_PROTOCOL_VERSION = mcp.toolkit.testing.framework.core.util.McpProtocolVersions.LATEST;
        public static final int MAX_TRACKED_EXCHANGES = 10_000;
        private Defaults() {}
    }

    public static final class Endpoints {
        public static final String SSE = "/sse";
        public static final String MESSAGE = "/mcp/message";
        public static final String MCP = "/mcp";
        private Endpoints() {}
    }

    public static final class SseEvents {
        public static final String ENDPOINT = "endpoint";
        public static final String MESSAGE = "message";
        private SseEvents() {}
    }

    public static final class Headers {
        public static final String MCP_PROTOCOL_VERSION = "MCP-Protocol-Version";
        public static final String MCP_SESSION_ID = "Mcp-Session-Id";
        public static final String MCP_METHOD = "Mcp-Method";
        public static final String MCP_NAME = "Mcp-Name";
        public static final String ACCEPT = "Accept";
        public static final String CONTENT_TYPE = "Content-Type";
        public static final String CONTENT_TYPE_JSON = "application/json";
        public static final String CONTENT_TYPE_SSE = "text/event-stream";
        private Headers() {}
    }

    public static final class Methods {
        public static final String INITIALIZE = "initialize";
        public static final String PING = "ping";
        public static final String RESOURCES_LIST = "resources/list";
        public static final String RESOURCES_READ = "resources/read";
        public static final String RESOURCES_TEMPLATES_LIST = "resources/templates/list";
        public static final String PROMPTS_LIST = "prompts/list";
        public static final String PROMPTS_GET = "prompts/get";
        public static final String TOOLS_CALL = "tools/call";
        public static final String TOOLS_LIST = "tools/list";
        public static final String COMPLETION_COMPLETE = "completion/complete";
        public static final String LOGGING_SET_LEVEL = "logging/setLevel";
        public static final String SERVER_DISCOVER = "server/discover";
        public static final String SUBSCRIPTIONS_LISTEN = "subscriptions/listen";
        public static final String TASKS_GET = "tasks/get";
        public static final String TASKS_UPDATE = "tasks/update";
        public static final String TASKS_CANCEL = "tasks/cancel";
        private Methods() {}
    }

    public static final class Notifications {
        public static final String INITIALIZED = "notifications/initialized";
        public static final String CANCELLED = "notifications/cancelled";
        public static final String PROGRESS = "notifications/progress";
        public static final String MESSAGE = "notifications/message";
        public static final String ROOTS_LIST_CHANGED = "notifications/roots/list_changed";
        public static final String TOOLS_LIST_CHANGED = "notifications/tools/list_changed";
        public static final String RESOURCES_LIST_CHANGED = "notifications/resources/list_changed";
        public static final String RESOURCES_UPDATED = "notifications/resources/updated";
        public static final String PROMPTS_LIST_CHANGED = "notifications/prompts/list_changed";
        public static final String TASKS_STATUS = "notifications/tasks/status";
        private Notifications() {}
    }

    public static final class ServerMethods {
        public static final String ROOTS_LIST = "roots/list";
        public static final String SAMPLING_CREATE_MESSAGE = "sampling/createMessage";
        private ServerMethods() {}
    }

    public static final class Params {
        public static final String CURSOR = "cursor";
        public static final String NEXT_CURSOR = "nextCursor";
        public static final String META = "_meta";
        public static final String PROGRESS_TOKEN = "progressToken";
        private Params() {}
    }

    public static final class CompletionRefs {
        public static final String TYPE_PROMPT = "ref/prompt";
        public static final String TYPE_RESOURCE = "ref/resource";
        private CompletionRefs() {}
    }

    public static final class LogLevels {
        /** RFC 5424 syslog severity levels used by MCP {@code logging/setLevel}. */
        public static final String DEBUG = "debug";
        public static final String INFO = "info";
        public static final String NOTICE = "notice";
        public static final String WARNING = "warning";
        public static final String ERROR = "error";
        public static final String CRITICAL = "critical";
        public static final String ALERT = "alert";
        public static final String EMERGENCY = "emergency";
        private LogLevels() {}
    }

    public static final class Meta {
        /** Protocol version carried per-request by stateless (2026-07-28+) clients. */
        public static final String PROTOCOL_VERSION = "io.modelcontextprotocol/protocolVersion";
        /** Client capabilities carried per-request by stateless (2026-07-28+) clients. */
        public static final String CLIENT_CAPABILITIES = "io.modelcontextprotocol/clientCapabilities";
        /** Client identity carried per-request by stateless (2026-07-28+) clients. */
        public static final String CLIENT_INFO = "io.modelcontextprotocol/clientInfo";
        /** Server identity carried in every result by stateless (2026-07-28+) servers. */
        public static final String SERVER_INFO = "io.modelcontextprotocol/serverInfo";
        /** Per-request log level for stateless (2026-07-28+) requests. */
        public static final String LOG_LEVEL = "io.modelcontextprotocol/logLevel";
        /** Subscription type opt-ins for {@code subscriptions/listen}. */
        public static final String SUBSCRIPTION_TYPES = "io.modelcontextprotocol/subscriptionTypes";
        /** Subscription id used to tag opted-in change notifications. */
        public static final String SUBSCRIPTION_ID = "io.modelcontextprotocol/subscriptionId";
        /** Related task id used by the tasks extension. */
        public static final String RELATED_TASK = "io.modelcontextprotocol/related-task";
        private Meta() {}
    }

    public static final class ResultTypes {
        public static final String COMPLETE = "complete";
        public static final String INPUT_REQUIRED = "input_required";
        private ResultTypes() {}
    }

    public static final class SubscriptionTypes {
        public static final String TOOLS_LIST_CHANGED = "toolsListChanged";
        public static final String PROMPTS_LIST_CHANGED = "promptsListChanged";
        public static final String RESOURCES_LIST_CHANGED = "resourcesListChanged";
        public static final String RESOURCE_SUBSCRIPTIONS = "resourceSubscriptions";
        private SubscriptionTypes() {}
    }

    public static final class Tasks {
        public static final String TASK = "task";
        public static final String TTL = "ttl";
        public static final String TASK_ID = "taskId";
        public static final String STATUS = "status";
        public static final String STATUS_MESSAGE = "statusMessage";
        public static final String POLL_INTERVAL = "pollInterval";
        public static final String TTL_MS = "ttlMs";
        public static final String CACHE_SCOPE = "cacheScope";
        public static final String RESULT_TYPE = "resultType";
        public static final String INPUT_REQUESTS = "inputRequests";
        public static final String INPUT_RESPONSES = "inputResponses";
        public static final String REQUEST_STATE = "requestState";
        private Tasks() {}
    }

    private McpTestClientConstants() {}
}
