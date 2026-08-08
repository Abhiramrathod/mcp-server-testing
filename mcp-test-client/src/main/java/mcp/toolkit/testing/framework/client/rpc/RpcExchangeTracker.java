package mcp.toolkit.testing.framework.client.rpc;

import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * Thread-safe, bounded history of JSON-RPC exchanges.
 *
 * <p>When the number of recorded exchanges exceeds the configured maximum
 * (default {@link McpTestClientConstants.Defaults#MAX_TRACKED_EXCHANGES}), the
 * oldest entries are evicted so the tracker never grows unbounded in long-running
 * test suites.
 */
public final class RpcExchangeTracker {

    private final int maxExchanges;
    private final CopyOnWriteArrayList<RpcExchange> exchanges = new CopyOnWriteArrayList<>();

    /**
     * Creates a tracker with the default maximum number of retained exchanges.
     */
    public RpcExchangeTracker() {
        this(McpTestClientConstants.Defaults.MAX_TRACKED_EXCHANGES);
    }

    /**
     * Creates a tracker with a custom maximum number of retained exchanges.
     *
     * @param maxExchanges maximum number of exchanges to retain before evicting
     *                     the oldest entries
     * @throws IllegalArgumentException if {@code maxExchanges} is not positive
     */
    public RpcExchangeTracker(int maxExchanges) {
        if (maxExchanges <= 0) {
            throw new IllegalArgumentException("maxExchanges must be positive");
        }
        this.maxExchanges = maxExchanges;
    }

    void record(RpcExchange exchange) {
        if (exchange == null) return;
        synchronized (exchanges) {
            exchanges.add(exchange);
            int overflow = exchanges.size() - maxExchanges;
            if (overflow > 0) {
                exchanges.subList(0, overflow).clear();
            }
        }
    }

    /**
     * Returns all recorded exchanges, oldest first.
     *
     * @return unmodifiable list of exchanges
     */
    public List<RpcExchange> all() {
        return Collections.unmodifiableList(exchanges);
    }

    /**
     * Returns the most recent exchange, or empty if none recorded.
     *
     * @return optional last exchange
     */
    public Optional<RpcExchange> last() {
        return exchanges.isEmpty() ? Optional.empty() : Optional.of(exchanges.get(exchanges.size() - 1));
    }

    /**
     * Returns all exchanges for the given JSON-RPC method.
     *
     * @param method JSON-RPC method name, e.g. {@code "tools/call"}
     * @return filtered list of exchanges
     */
    public List<RpcExchange> forMethod(String method) {
        return exchanges.stream().filter(e -> method.equals(e.method())).collect(Collectors.toUnmodifiableList());
    }

    /**
     * Returns the exchange with the given request id, if recorded.
     *
     * @param requestId JSON-RPC request id
     * @return optional matching exchange
     */
    public Optional<RpcExchange> byId(long requestId) {
        return exchanges.stream().filter(e -> e.id() == requestId).findFirst();
    }

    /**
     * Returns all exchanges with the given status.
     *
     * @param status exchange status
     * @return filtered list of exchanges
     */
    public List<RpcExchange> withStatus(RpcExchange.Status status) {
        return exchanges.stream().filter(e -> e.status() == status).collect(Collectors.toUnmodifiableList());
    }

    /**
     * Returns the total number of recorded exchanges.
     *
     * @return exchange count
     */
    public int size() { return exchanges.size(); }

    /**
     * Clears all recorded exchanges.
     */
    public void clear() { exchanges.clear(); }

    /**
     * Serializes the recorded exchanges to a JSON array, suitable for reporting or
     * persisting test telemetry.
     *
     * @param objectMapper mapper used for serialization
     * @return a JSON array of exchange objects
     */
    public JsonNode export(ObjectMapper objectMapper) {
        ArrayNode array = objectMapper.createArrayNode();
        for (RpcExchange exchange : exchanges) {
            ObjectNode node = array.addObject();
            node.put("id", exchange.id());
            node.put("method", exchange.method());
            node.put("status", exchange.status().name());
            if (exchange.latency() != null) {
                node.put("latencyMs", exchange.latency().toMillis());
            }
            if (exchange.errorDetail() != null) {
                node.put("errorDetail", exchange.errorDetail());
            }
            if (exchange.sentAt() != null) {
                node.put("sentAt", exchange.sentAt().toString());
            }
            if (exchange.receivedAt() != null) {
                node.put("receivedAt", exchange.receivedAt().toString());
            }
            if (exchange.params() != null) {
                node.set("params", exchange.params());
            }
        }
        return array;
    }
}
