package mcp.toolkit.testing.framework.client.rpc;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.exception.McpSessionExpiredException;
import mcp.toolkit.testing.framework.core.util.McpProtocolVersions;
import mcp.toolkit.testing.framework.core.util.McpValidation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import mcp.toolkit.testing.framework.interfaces.McpTransport;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;
import java.util.function.Supplier;

public final class McpRpcClient {

    private static final String CLIENT_NAME = "mcp-test-client";
    private static final String CLIENT_VERSION = "1.0.0";

    private final McpTransport transport;
    private final AtomicLong idSequence;
    private final McpJsonCodec jsonCodec;
    private final String protocolVersion;
    private final RpcExchangeTracker exchangeTracker;

    private volatile Runnable sessionReinitializer;

    /**
     * Creates an RPC client that sends JSON-RPC requests over the given transport.
     *
     * @param transport       transport used for sending and receiving messages
     * @param idSequence      source of JSON-RPC request ids
     * @param jsonCodec       JSON codec for payload construction and parsing
     * @param protocolVersion MCP protocol version advertised by this client
     */
    public McpRpcClient(McpTransport transport, AtomicLong idSequence, McpJsonCodec jsonCodec,
                        String protocolVersion) {
        this.transport = McpValidation.requireNonNull(transport, "transport");
        this.idSequence = McpValidation.requireNonNull(idSequence, "idSequence");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
        this.protocolVersion = McpValidation.requireNonNull(protocolVersion, "protocolVersion");
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
            jsonCodec.metaObject(node).put(McpTestClientConstants.Params.PROGRESS_TOKEN, progressToken);
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
        if (McpProtocolVersions.isStateless(protocolVersion)) {
            ObjectNode requestParams = params instanceof ObjectNode o
                    ? o.deepCopy()
                    : jsonCodec.buildParams(p -> {});
            attachStatelessMeta(requestParams);
            request.set("params", requestParams);
        } else if (params != null) {
            request.set("params", params);
        }
        return request;
    }

    private void attachStatelessMeta(ObjectNode params) {
        ObjectNode meta = jsonCodec.metaObject(params);
        meta.put(McpTestClientConstants.Meta.PROTOCOL_VERSION, protocolVersion);
        meta.set(McpTestClientConstants.Meta.CLIENT_CAPABILITIES, jsonCodec.buildParams(p -> {}));
        ObjectNode clientInfo = meta.putObject(McpTestClientConstants.Meta.CLIENT_INFO);
        clientInfo.put("name", CLIENT_NAME);
        clientInfo.put("version", CLIENT_VERSION);
    }

    /**
     * Sends a request, automatically resolving Multi Round-Trip Request (MRTR)
     * {@code input_required} interim results (stateless, 2026-07-28+) by retrying
     * the original request with the input provided by the caller.
     *
     * <p>On each {@code input_required} result the {@code inputResponsesProvider}
     * is invoked with the server's {@code inputRequests} array and must return
     * the value to send under {@code inputResponses}. The interim result's
     * {@code requestState} is echoed on every retry.
     *
     * @param method                 JSON-RPC method
     * @param paramsSupplier         params builder; may be {@code null}
     * @param inputResponsesProvider supplies {@code inputResponses} for the
     *                               {@code inputRequests} array from the server
     * @param maxRoundTrips          maximum number of request/input round trips
     * @return the final, complete result
     * @throws IllegalArgumentException if {@code maxRoundTrips} is not positive
     * @throws IllegalStateException    if the server never returns a complete result
     */
    public JsonNode callWithInputResponses(String method, Supplier<JsonNode> paramsSupplier,
                                           Function<JsonNode, JsonNode> inputResponsesProvider,
                                           int maxRoundTrips) {
        if (maxRoundTrips <= 0) {
            throw new IllegalArgumentException("maxRoundTrips must be positive");
        }
        Supplier<JsonNode> current = paramsSupplier;
        for (int roundTrip = 0; roundTrip < maxRoundTrips; roundTrip++) {
            JsonNode result = callAndRequireResult(method, current);
            if (!isInputRequired(result)) {
                return result;
            }
            JsonNode requestState = result.path(McpTestClientConstants.Tasks.REQUEST_STATE);
            JsonNode inputRequests = result.path(McpTestClientConstants.Tasks.INPUT_REQUESTS);
            JsonNode responses = inputResponsesProvider.apply(inputRequests);
            JsonNode stateCopy = requestState.isMissingNode() || requestState.isNull() ? null : requestState;
            JsonNode responsesCopy = responses == null ? null : responses.deepCopy();
            current = () -> {
                JsonNode params = paramsSupplier == null ? null : paramsSupplier.get();
                ObjectNode node = params instanceof ObjectNode o ? o.deepCopy() : jsonCodec.buildParams(p -> {});
                if (stateCopy != null) node.set(McpTestClientConstants.Tasks.REQUEST_STATE, stateCopy);
                if (responsesCopy != null) node.set(McpTestClientConstants.Tasks.INPUT_RESPONSES, responsesCopy);
                return node;
            };
        }
        throw new IllegalStateException("Exceeded maxRoundTrips=" + maxRoundTrips
                + " waiting for a complete result from " + method);
    }

    /**
     * Returns whether the given result is an MRTR interim result
     * ({@code resultType == "input_required"}).
     *
     * @param result a request result; may be {@code null}
     * @return {@code true} if the result requests additional input
     */
    public static boolean isInputRequired(JsonNode result) {
        return result != null
                && McpTestClientConstants.ResultTypes.INPUT_REQUIRED.equals(
                        result.path(McpTestClientConstants.Tasks.RESULT_TYPE).asText());
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
