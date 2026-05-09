package mcp.toolkit.testing.framework.client.rpc;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
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

    public McpRpcClient(McpTransport transport, AtomicLong idSequence, McpJsonCodec jsonCodec) {
        this.transport = McpValidation.requireNonNull(transport, "transport");
        this.idSequence = McpValidation.requireNonNull(idSequence, "idSequence");
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
        this.exchangeTracker = new RpcExchangeTracker();
    }

    public RpcExchangeTracker exchangeTracker() { return exchangeTracker; }

    public JsonNode callAndRequireResult(String method, Supplier<JsonNode> paramsSupplier) {
        long id = idSequence.getAndIncrement();
        JsonNode params = paramsSupplier == null ? null : paramsSupplier.get();
        ObjectNode request = buildRequest(method, id, params);
        String json = jsonCodec.toJson(request);

        RpcExchange.Builder exchange = RpcExchange.builder()
                .id(id).method(method).params(params).request(request).sentAt(Instant.now());

        JsonNode response;
        try {
            response = transport.sendRequest(json, id);
            exchange.receivedAt(Instant.now()).response(response);
        } catch (Exception ex) {
            exchange.receivedAt(Instant.now())
                    .status(isTimeout(ex) ? RpcExchange.Status.TIMEOUT : RpcExchange.Status.FAILED)
                    .errorDetail(ex.getMessage());
            exchangeTracker.record(exchange.build());
            throw ex;
        }

        if (hasJsonRpcError(response)) {
            exchange.status(RpcExchange.Status.ERROR).errorDetail(response.get("error").toString());
        } else {
            exchange.status(RpcExchange.Status.SUCCESS);
        }
        exchangeTracker.record(exchange.build());
        return requireResult(method, response);
    }

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
