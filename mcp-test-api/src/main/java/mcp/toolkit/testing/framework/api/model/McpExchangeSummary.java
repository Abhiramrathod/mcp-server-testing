package mcp.toolkit.testing.framework.api.model;

import java.time.Duration;

/**
 * A user-facing summary of a single JSON-RPC request/response exchange.
 *
 * <p>Hides the internal {@code RpcExchange} type from library consumers.
 */
public record McpExchangeSummary(long id, String method, Status status, Duration latency, String errorDetail) {

    public enum Status {
        SUCCESS, ERROR, TIMEOUT, FAILED
    }

    public boolean isSuccess() { return status == Status.SUCCESS; }
}
