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

    public long id() { return id; }
    public String method() { return method; }
    public JsonNode params() { return params; }
    public JsonNode request() { return request; }
    public JsonNode response() { return response; }
    public Instant sentAt() { return sentAt; }
    public Instant receivedAt() { return receivedAt; }
    public Duration latency() { return latency; }
    public Status status() { return status; }
    public String errorDetail() { return errorDetail; }

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
