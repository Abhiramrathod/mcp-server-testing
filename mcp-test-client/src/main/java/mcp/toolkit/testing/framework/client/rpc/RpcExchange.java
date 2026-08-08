package mcp.toolkit.testing.framework.client.rpc;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;
import java.time.Instant;

public final class RpcExchange {

    public enum Status { SUCCESS, ERROR, TIMEOUT, FAILED }

    private final long id;
    private final String method;
    private final JsonNode params;
    private final JsonNode request;
    private final JsonNode response;
    private final Instant sentAt;
    private final Instant receivedAt;
    private final Duration latency;
    private final Status status;
    private final String errorDetail;

    private RpcExchange(Builder builder) {
        this.id = builder.id;
        this.method = builder.method;
        this.params = builder.params;
        this.request = builder.request;
        this.response = builder.response;
        this.sentAt = builder.sentAt;
        this.receivedAt = builder.receivedAt;
        this.latency = (sentAt != null && receivedAt != null) ? Duration.between(sentAt, receivedAt) : null;
        this.status = builder.status;
        this.errorDetail = builder.errorDetail;
    }

    /**
     * Returns the JSON-RPC request id.
     *
     * @return request id
     */
    public long id() { return id; }

    /**
     * Returns the JSON-RPC method name.
     *
     * @return method name
     */
    public String method() { return method; }

    /**
     * Returns the request parameters, or {@code null} if none were sent.
     *
     * @return request params, or {@code null}
     */
    public JsonNode params() { return params; }

    /**
     * Returns the full JSON-RPC request payload.
     *
     * @return request payload
     */
    public JsonNode request() { return request; }

    /**
     * Returns the full JSON-RPC response payload, or {@code null} if none was
     * received.
     *
     * @return response payload, or {@code null}
     */
    public JsonNode response() { return response; }

    /**
     * Returns the timestamp when the request was sent, or {@code null} if unknown.
     *
     * @return sent timestamp, or {@code null}
     */
    public Instant sentAt() { return sentAt; }

    /**
     * Returns the timestamp when the response was received, or {@code null} if
     * unknown.
     *
     * @return received timestamp, or {@code null}
     */
    public Instant receivedAt() { return receivedAt; }

    /**
     * Returns the round-trip latency, computed from the sent and received
     * timestamps, or {@code null} if either is missing.
     *
     * @return latency, or {@code null}
     */
    public Duration latency() { return latency; }

    /**
     * Returns the outcome status of this exchange.
     *
     * @return exchange status
     */
    public Status status() { return status; }

    /**
     * Returns a human-readable description of any error, or {@code null} if the
     * exchange succeeded.
     *
     * @return error detail, or {@code null}
     */
    public String errorDetail() { return errorDetail; }

    /**
     * Returns a compact, human-readable description of this exchange.
     *
     * @return string representation
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("RpcExchange{id=").append(id)
                .append(", method='").append(method).append('\'')
                .append(", status=").append(status);
        if (latency != null) sb.append(", latency=").append(latency.toMillis()).append("ms");
        if (errorDetail != null) sb.append(", error='").append(errorDetail).append('\'');
        return sb.append('}').toString();
    }

    static Builder builder() { return new Builder(); }

    static final class Builder {
        private long id;
        private String method;
        private JsonNode params;
        private JsonNode request;
        private JsonNode response;
        private Instant sentAt;
        private Instant receivedAt;
        private Status status;
        private String errorDetail;

        Builder id(long id) { this.id = id; return this; }
        Builder method(String method) { this.method = method; return this; }
        Builder params(JsonNode params) { this.params = params; return this; }
        Builder request(JsonNode request) { this.request = request; return this; }
        Builder response(JsonNode response) { this.response = response; return this; }
        Builder sentAt(Instant sentAt) { this.sentAt = sentAt; return this; }
        Builder receivedAt(Instant receivedAt) { this.receivedAt = receivedAt; return this; }
        Builder status(Status status) { this.status = status; return this; }
        Builder errorDetail(String errorDetail) { this.errorDetail = errorDetail; return this; }
        RpcExchange build() { return new RpcExchange(this); }
    }
}
