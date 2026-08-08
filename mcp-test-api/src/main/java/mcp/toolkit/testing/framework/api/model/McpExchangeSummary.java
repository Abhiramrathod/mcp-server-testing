package mcp.toolkit.testing.framework.api.model;

import java.time.Duration;

/**
 * A user-facing summary of a single JSON-RPC request/response exchange.
 *
 * <p>Hides the internal {@code RpcExchange} type from library consumers.
 *
 * @param id           unique identifier of the exchange
 * @param method       JSON-RPC method that was invoked
 * @param status       outcome of the exchange
 * @param latency      round-trip duration, when recorded (may be {@code null})
 * @param errorDetail  human-readable error description, when the exchange failed (may be {@code null})
 */
public record McpExchangeSummary(long id, String method, Status status, Duration latency, String errorDetail) {

    public enum Status {
        SUCCESS, ERROR, TIMEOUT, FAILED
    }

    /**
     * Returns {@code true} if the exchange completed successfully.
     *
     * @return whether {@link #status()} is {@link Status#SUCCESS}
     */
    public boolean isSuccess() { return status == Status.SUCCESS; }
}
