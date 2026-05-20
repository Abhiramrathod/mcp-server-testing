package mcp.toolkit.testing.framework.api;

import mcp.toolkit.testing.framework.api.model.McpExchangeSummary;
import mcp.toolkit.testing.framework.client.rpc.RpcExchange;
import mcp.toolkit.testing.framework.client.rpc.RpcExchangeTracker;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Fluent helper for inspecting and asserting on MCP exchange history.
 *
 * <p>Wraps the internal {@link RpcExchangeTracker} and exposes only
 * user-facing {@link McpExchangeSummary} objects, so callers never need
 * to import internal framework types.
 *
 * <p>Example:
 * <pre>{@code
 *   McpExchangeAssertions exchanges = client.exchanges();
 *
 *   exchanges.assertLastSucceeded();
 *   exchanges.assertLastMethod("tools/call");
 *   exchanges.assertLatencyBelow("tools/call", 500);
 * }</pre>
 */
public final class McpExchangeAssertions {

    private final RpcExchangeTracker tracker;

    McpExchangeAssertions(RpcExchangeTracker tracker) {
        this.tracker = tracker;
    }

    // ── Query ────────────────────────────────────────────────────────────

    /**
     * Returns a summary of the most recent exchange, or empty if none recorded.
     *
     * @return optional last exchange summary
     */
    public Optional<McpExchangeSummary> last() {
        return tracker.last().map(this::toSummary);
    }

    /**
     * Returns summaries of all recorded exchanges.
     *
     * @return list of exchange summaries
     */
    public List<McpExchangeSummary> all() {
        return tracker.all().stream()
                .map(this::toSummary)
                .toList();
    }

    /**
     * Returns summaries of all exchanges for the given MCP method.
     *
     * @param method MCP method name, e.g. {@code "tools/call"}
     * @return filtered list of exchange summaries
     */
    public List<McpExchangeSummary> forMethod(String method) {
        return tracker.forMethod(method).stream()
                .map(this::toSummary)
                .toList();
    }

    /**
     * Returns summaries of all exchanges for the given MCP method.
     *
     * @param method MCP method enum
     * @return filtered list of exchange summaries
     */
    public List<McpExchangeSummary> forMethod(McpMethod method) {
        return forMethod(method.value());
    }

    /**
     * Returns the total number of recorded exchanges.
     *
     * @return exchange count
     */
    public int count() {
        return tracker.size();
    }

    /**
     * Returns the number of exchanges for the given MCP method.
     *
     * @param method MCP method name
     * @return count of matching exchanges
     */
    public int countForMethod(String method) {
        return tracker.forMethod(method).size();
    }

    /**
     * Returns the number of exchanges for the given MCP method.
     *
     * @param method MCP method enum
     * @return count of matching exchanges
     */
    public int countForMethod(McpMethod method) {
        return countForMethod(method.value());
    }

    /**
     * Returns the average latency for all completed exchanges of the specified method,
     * in milliseconds.
     *
     * @param method MCP method enum
     * @return average latency in milliseconds
     * @throws AssertionError if no completed exchanges exist for the method
     */
    public long averageLatency(McpMethod method) {
        return averageLatency(method.value());
    }

    /**
     * Returns the average latency for all completed exchanges of the specified method,
     * in milliseconds.
     *
     * @param method MCP method name
     * @return average latency in milliseconds
     * @throws AssertionError if no completed exchanges exist for the method
     */
    public long averageLatency(String method) {
        List<McpExchangeSummary> exchanges = forMethod(method).stream()
                .filter(e -> e.latency() != null)
                .collect(Collectors.toList());
        if (exchanges.isEmpty()) {
            throw new AssertionError("No completed exchanges found for method '" + method + "'");
        }
        return (long) exchanges.stream()
                .mapToLong(e -> e.latency().toMillis())
                .average()
                .orElse(0);
    }

    /**
     * Returns the most recent exchange summary.
     *
     * @return last exchange summary
     * @throws AssertionError if no exchanges recorded
     */
    public McpExchangeSummary lastExchange() {
        return last().orElseThrow(() -> new AssertionError("No exchanges recorded."));
    }

    /**
     * Returns summaries of all recorded exchanges.
     *
     * @return list of exchange summaries
     */
    public List<McpExchangeSummary> allExchanges() {
        return all();
    }

    /**
     * Returns summaries of all exchanges for the given MCP method.
     *
     * @param method MCP method enum
     * @return filtered list of exchange summaries
     */
    public List<McpExchangeSummary> exchangesForMethod(McpMethod method) {
        return forMethod(method);
    }

    /**
     * Returns the latency at the given percentile for all completed exchanges
     * of the specified method, in milliseconds.
     *
     * <p>Example: {@code latencyPercentile(McpMethod.TOOLS_CALL, 95)} returns the p95 latency.
     *
     * @param method     MCP method enum
     * @param percentile percentile between 0 and 100 (inclusive)
     * @return latency in milliseconds at the given percentile
     * @throws AssertionError if no completed exchanges exist for the method
     */
    public long latencyPercentile(McpMethod method, int percentile) {
        return latencyPercentile(method.value(), percentile);
    }

    /**
     * Returns the latency at the given percentile for all completed exchanges
     * of the specified method, in milliseconds.
     *
     * @param method     MCP method name
     * @param percentile percentile between 0 and 100 (inclusive)
     * @return latency in milliseconds at the given percentile
     * @throws AssertionError if no completed exchanges exist for the method
     */
    public long latencyPercentile(String method, int percentile) {
        if (percentile < 0 || percentile > 100) {
            throw new IllegalArgumentException("percentile must be between 0 and 100");
        }
        List<Long> sorted = forMethod(method).stream()
                .filter(e -> e.latency() != null)
                .map(e -> e.latency().toMillis())
                .sorted()
                .collect(Collectors.toList());
        if (sorted.isEmpty()) {
            throw new AssertionError("No completed exchanges found for method '" + method + "'");
        }
        int index = (int) Math.ceil(percentile / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, index));
    }

    /**
     * Clears all recorded exchanges.
     */
    public void clear() {
        tracker.clear();
    }

    // ── Assertions ───────────────────────────────────────────────────────

    /**
     * Asserts that the most recent exchange completed successfully.
     *
     * @throws AssertionError if no exchanges recorded or last was not successful
     */
    public void assertLastSucceeded() {
        McpExchangeSummary summary = last().orElseThrow(
                () -> new AssertionError("No exchanges recorded."));
        if (!summary.isSuccess()) {
            throw new AssertionError(
                    "Expected last exchange to succeed but got " + summary.status()
                            + (summary.errorDetail() != null ? ": " + summary.errorDetail() : ""));
        }
    }

    /**
     * Asserts that the most recent exchange targeted the given method.
     *
     * @param expectedMethod expected MCP method name
     * @throws AssertionError if the method does not match
     */
    public void assertLastMethod(String expectedMethod) {
        McpExchangeSummary summary = last().orElseThrow(
                () -> new AssertionError("No exchanges recorded."));
        if (!expectedMethod.equals(summary.method())) {
            throw new AssertionError(
                    "Expected last exchange method '" + expectedMethod
                            + "' but was '" + summary.method() + "'");
        }
    }

    /**
     * Asserts that all exchanges for the given method completed successfully.
     *
     * @param method MCP method enum
     * @throws AssertionError if any exchange for that method failed
     */
    public void assertAllSucceeded(McpMethod method) {
        assertAllSucceeded(method.value());
    }

    /**
     * Asserts that all exchanges for the given method completed successfully.
     *
     * @param method MCP method name
     * @throws AssertionError if any exchange for that method failed
     */
    public void assertAllSucceeded(String method) {
        List<McpExchangeSummary> failed = forMethod(method).stream()
                .filter(e -> !e.isSuccess())
                .collect(Collectors.toList());
        if (!failed.isEmpty()) {
            throw new AssertionError(
                    "Expected all '" + method + "' exchanges to succeed, but "
                            + failed.size() + " failed: " + failed);
        }
    }

    /**
     * Asserts that the average latency for the given method is below the threshold.
     *
     * @param method          MCP method enum
     * @param thresholdMillis maximum allowed average latency in milliseconds
     * @throws AssertionError if the average latency exceeds the threshold
     */
    public void assertAverageLatencyBelow(McpMethod method, long thresholdMillis) {
        assertAverageLatencyBelow(method.value(), thresholdMillis);
    }

    /**
     * Asserts that the latency at the given percentile is below the threshold.
     *
     * @param method          MCP method enum
     * @param percentile      percentile between 0 and 100
     * @param thresholdMillis maximum allowed latency in milliseconds
     * @throws AssertionError if the percentile latency exceeds the threshold
     */
    public void assertLatencyPercentileBelow(McpMethod method, int percentile, long thresholdMillis) {
        long value = latencyPercentile(method, percentile);
        if (value > thresholdMillis) {
            throw new AssertionError(
                    "P" + percentile + " latency for '" + method.value() + "' was " + value
                            + "ms, expected below " + thresholdMillis + "ms");
        }
    }

    /**
     * Asserts that the average latency for the given method is below the threshold.
     *
     * @param method           MCP method name
     * @param thresholdMillis  maximum allowed average latency in milliseconds
     * @throws AssertionError if the average latency exceeds the threshold
     */
    public void assertAverageLatencyBelow(String method, long thresholdMillis) {
        List<McpExchangeSummary> exchanges = forMethod(method).stream()
                .filter(e -> e.latency() != null)
                .collect(Collectors.toList());
        if (exchanges.isEmpty()) {
            throw new AssertionError("No completed exchanges found for method '" + method + "'");
        }
        double avg = exchanges.stream()
                .mapToLong(e -> e.latency().toMillis())
                .average()
                .orElse(0);
        if (avg > thresholdMillis) {
            throw new AssertionError(
                    "Average latency for '" + method + "' was " + (long) avg
                            + "ms, expected below " + thresholdMillis + "ms");
        }
    }

    // ── Internal ─────────────────────────────────────────────────────────

    private McpExchangeSummary toSummary(RpcExchange exchange) {
        return new McpExchangeSummary(
                exchange.id(),
                exchange.method(),
                mapStatus(exchange.status()),
                exchange.latency(),
                exchange.errorDetail()
        );
    }

    private static McpExchangeSummary.Status mapStatus(RpcExchange.Status status) {
        return switch (status) {
            case SUCCESS -> McpExchangeSummary.Status.SUCCESS;
            case ERROR   -> McpExchangeSummary.Status.ERROR;
            case TIMEOUT -> McpExchangeSummary.Status.TIMEOUT;
            case FAILED  -> McpExchangeSummary.Status.FAILED;
        };
    }
}
