package mcp.toolkit.testing.framework.client.rpc;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.exception.McpSessionExpiredException;
import mcp.toolkit.testing.framework.core.util.McpValidation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import mcp.toolkit.testing.framework.interfaces.McpTransport;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

public final class McpRpcClient {

    private final McpTransport transport;
    private final AtomicLong idSequence;
    private final McpJsonCodec jsonCodec;
    private final RpcExchangeTracker exchangeTracker;

    private volatile Runnable sessionReinitializer;

    /**
     * Creates an RPC client that sends JSON-RPC requests over the given transport.
     *
     * @param transport  transport used for sending and receiving messages
     * @param idSequence source of JSON-RPC request ids
     * @param jsonCodec  JSON codec for payload construction and parsing
     */
    public McpRpcClient(McpTransport transport, AtomicLong idSequence, McpJsonCodec jsonCodec) {
        this.transport = McpValidation.requireNonNull(transport, "transport");
        this.idSequence = McpValidation.requireNonNull(idSequence, "idSequence");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
        this.exchangeTracker = new RpcExchangeTracker();
    }

    /**
     * Returns the tracker recording the history of exchanges made by this client.
     *
     * @return exchange tracker
     */
    public RpcExchangeTracker exchangeTracker() { return exchangeTracker; }

    /**
     * Registers a callback that re-establishes the MCP session (a fresh
     * {@code initialize} handshake) after the server terminates the current one.
     *
     * @param sessionReinitializer session re-initialization handler; may be {@code null} to disable
     */
    public void setSessionReinitializer(Runnable sessionReinitializer) {
        this.sessionReinitializer = sessionReinitializer;
    }

    /**
     * Sends a JSON-RPC request, records the exchange, and returns the response
     * result. Fails with {@link AssertionError} if the response contains a
     * JSON-RPC error or is missing a result.
     *
     * @param method         JSON-RPC method
     * @param paramsSupplier params builder; may be {@code null}
     * @return the response result
     */
    public JsonNode callAndRequireResult(String method, Supplier<JsonNode> paramsSupplier) {
        return callAndRequireResult(method, paramsSupplier, 1);
    }

    private JsonNode callAndRequireResult(String method, Supplier<JsonNode> paramsSupplier, int retriesLeft) {
        long id = idSequence.getAndIncrement();
        JsonNode params = paramsSupplier == null ? null : paramsSupplier.get();
        ObjectNode request = buildRequest(method, id, params);
        String json = jsonCodec.toJson(request);

        RpcExchange.Builder exchange = RpcExchange.builder()
                .id(id).method(method).params(params).request(request).sentAt(Instant.now());

        JsonNode response;
        try {
            response = transport.sendRequest(json, id);
        } catch (McpSessionExpiredException ex) {
            transport.clearSession();
            Runnable reinitializer = sessionReinitializer;
            if (reinitializer != null && retriesLeft > 0) {
                reinitializer.run();
                return callAndRequireResult(method, paramsSupplier, retriesLeft - 1);
            }
            exchange.receivedAt(Instant.now())
                    .status(RpcExchange.Status.FAILED)
                    .errorDetail(ex.getMessage());
            exchangeTracker.record(exchange.build());
            throw ex;
        } catch (Exception ex) {
            exchange.receivedAt(Instant.now())
                    .status(isTimeout(ex) ? RpcExchange.Status.TIMEOUT : RpcExchange.Status.FAILED)
                    .errorDetail(ex.getMessage());
            exchangeTracker.record(exchange.build());
            throw ex;
        }

        exchange.receivedAt(Instant.now()).response(response);
        if (hasJsonRpcError(response)) {
            exchange.status(RpcExchange.Status.ERROR).errorDetail(response.get("error").toString());
        } else {
            exchange.status(RpcExchange.Status.SUCCESS);
        }
        exchangeTracker.record(exchange.build());
        return requireResult(method, response);
    }

    /**
     * Sends a JSON-RPC request and requests server progress notifications for it by
     * attaching a {@code _meta.progressToken} to the params (MCP progress support).
     *
     * <p>Progress reports arrive as {@code notifications/progress} server messages and
     * are surfaced through the transport's server message listener.
     *
     * @param method        JSON-RPC method
     * @param paramsSupplier params builder; may be {@code null}
     * @param progressToken token echoed back in progress notifications; must be a positive long
     * @return the response result
     */
    public JsonNode callAndRequireResult(String method, Supplier<JsonNode> paramsSupplier, long progressToken) {
        if (progressToken <= 0) {
            throw new IllegalArgumentException("progressToken must be a positive long");
        }
        return callAndRequireResult(method, () -> {
            JsonNode params = paramsSupplier == null ? null : paramsSupplier.get();
            ObjectNode node = params instanceof ObjectNode o ? o.deepCopy() : jsonCodec.buildParams(p -> {});
            node.withObject(McpTestClientConstants.Params.META)
                    .put(McpTestClientConstants.Params.PROGRESS_TOKEN, progressToken);
            return node;
        });
    }

    /**
     * Sends the {@code notifications/cancelled} notification for a previously issued request
     * (MCP cancellation support).
     *
     * @param requestId the id of the request being cancelled
     * @param reason    optional human-readable reason; may be {@code null}
     */
    public void cancel(long requestId, String reason) {
        sendNotification(McpTestClientConstants.Notifications.CANCELLED, () -> jsonCodec.buildParams(p -> {
            p.put("requestId", requestId);
            if (reason != null) {
                p.put("reason", reason);
            }
        }));
    }

    /**
     * Sends a JSON-RPC notification without expecting a response.
     *
     * @param method         JSON-RPC method
     * @param paramsSupplier params builder; may be {@code null}
     */
    public void sendNotification(String method, Supplier<JsonNode> paramsSupplier) {
        JsonNode params = paramsSupplier == null ? null : paramsSupplier.get();
        transport.sendNotification(jsonCodec.toJson(buildRequest(method, null, params)));
    }

    private ObjectNode buildRequest(String method, Long id, JsonNode params) {
        ObjectNode request = jsonCodec.buildParams(node -> {
            node.put("jsonrpc", "2.0");
            if (id != null) node.put("id", id);
            node.put("method", method);
        });
        if (params != null) request.set("params", params);
        return request;
    }

    private JsonNode requireResult(String method, JsonNode response) {
        if (response == null || response.isNull()) throw new AssertionError("No MCP response for " + method);
        JsonNode error = response.get("error");
        if (error != null && !error.isNull()) throw new AssertionError("MCP error for " + method + ": " + error);
        JsonNode result = response.get("result");
        if (result == null || result.isNull()) throw new AssertionError("Missing result for " + method + ": " + response);
        return result;
    }

    private static boolean hasJsonRpcError(JsonNode r) {
        if (r == null) return false;
        JsonNode e = r.get("error");
        return e != null && !e.isNull();
    }

    private static boolean isTimeout(Exception ex) {
        String msg = ex.getMessage();
        return msg != null && msg.toLowerCase().contains("timed out");
    }
}
