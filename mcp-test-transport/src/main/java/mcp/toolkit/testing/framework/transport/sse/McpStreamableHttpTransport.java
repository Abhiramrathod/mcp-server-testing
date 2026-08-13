package mcp.toolkit.testing.framework.transport.sse;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.exception.McpSessionExpiredException;
import mcp.toolkit.testing.framework.core.util.McpProtocolVersions;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import mcp.toolkit.testing.framework.interfaces.channel.TransportChannel;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * {@link McpTransport} implementation using the Streamable HTTP transport
 * (protocol version 2025-03-26 and later).
 *
 * <p>Each JSON-RPC message is sent as its own POST to a single MCP endpoint. The
 * server may answer with either a single JSON object or an SSE stream scoped to
 * that request. The implementation:
 *
 * <ul>
 *   <li>accepts both {@code application/json} and {@code text/event-stream} responses,</li>
 *   <li>manages the session id assigned during initialization, re-initializing
 *       transparently when the server terminates the session (HTTP 404),</li>
 *   <li>surfaces server-initiated requests and notifications to registered
 *       listeners, and</li>
 *   <li>optionally opens a stream connection to receive server messages.</li>
 * </ul>
 */
public final class McpStreamableHttpTransport implements McpTransport {

    private final URI endpointUri;
    private final String protocolVersion;
    private final Duration timeout;
    private final McpJsonCodec jsonCodec;
    private final Map<String, String> headers;
    private final boolean stateless;
    private final ConcurrentHashMap<Long, Thread> responseConsumers = new ConcurrentHashMap<>();

    private final TransportChannel channel;
    private volatile boolean connected;
    private volatile boolean closed;
    private volatile String sessionId;
    private volatile Consumer<JsonNode> serverMessageListener;
    private volatile Runnable sessionExpiredHandler;
    private final AtomicBoolean serverStreamStarted = new AtomicBoolean(false);

    private static final Predicate<String> IS_SSE_RESPONSE = value ->
            value.toLowerCase().contains(McpTestClientConstants.Headers.CONTENT_TYPE_SSE);

    public McpStreamableHttpTransport(URI endpointUri, String protocolVersion,
                                      Duration timeout, McpJsonCodec jsonCodec) {
        this(endpointUri, protocolVersion, timeout, jsonCodec, Collections.emptyMap(), null);
    }

    public McpStreamableHttpTransport(URI endpointUri, String protocolVersion,
                                      Duration timeout, McpJsonCodec jsonCodec,
                                      Map<String, String> headers) {
        this(endpointUri, protocolVersion, timeout, jsonCodec, headers, null);
    }

    public McpStreamableHttpTransport(URI endpointUri, String protocolVersion,
                                      Duration timeout, McpJsonCodec jsonCodec,
                                      Map<String, String> headers, TransportChannel channel) {
        this.endpointUri = McpValidation.requireNonNull(endpointUri, "endpointUri");
        this.protocolVersion = McpValidation.requireNonNull(protocolVersion, "protocolVersion");
        this.timeout = timeout == null ? McpTestClientConstants.Defaults.TIMEOUT : timeout;
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
        this.headers = headers == null ? Collections.emptyMap() : Map.copyOf(headers);
        this.stateless = McpProtocolVersions.isStateless(protocolVersion);
        this.channel = McpValidation.requireNonNull(channel, "channel");
    }

    /** Marks the transport connected. */
    @Override
    public void connect() {
        if (connected) return;
        if (closed) throw new IllegalStateException("McpStreamableHttpTransport is closed");
        connected = true;
    }

    /** Sends a POST request and waits for either a JSON or SSE response. */
    @Override
    public JsonNode sendRequest(String payload, long requestId) {
        requireConnected();
        McpResponse response = channel.exchange(endpointUri, buildPostHeaders(payload))
                .apply(McpValidation.requireNonNull(payload, "payload"));

        int status = response.statusCode();
        captureSessionId(response);

        if (status == 404) {
            if (stateless) {
                throw new IllegalStateException(
                        "Streamable HTTP request failed with status 404 for request id " + requestId);
            }
            handleSessionExpired();
            throw new McpSessionExpiredException(
                    "Server terminated the session for request id " + requestId
                            + " (HTTP 404). A new initialize handshake is required.");
        }
        if (status == 202) {
            throw new IllegalStateException(
                    "Server returned HTTP 202 Accepted for request id " + requestId
                            + "; a JSON-RPC response was expected. 202 is only valid for notifications.");
        }
        if (status >= 400) {
            throw new IllegalStateException(
                    "Streamable HTTP request failed with status " + status + ": " + response.bodyAsText());
        }

        String contentType = response.header(McpTestClientConstants.Headers.CONTENT_TYPE);
        if (contentType == null) {
            contentType = McpTestClientConstants.Headers.CONTENT_TYPE_JSON;
        }
        if (IS_SSE_RESPONSE.test(contentType)) {
            return awaitSseResponse(response.bodyLines(), requestId);
        }
        return awaitJsonResponse(response.bodyLines(), requestId);
    }

    /** Sends a POST notification without waiting for a response. */
    @Override
    public void sendNotification(String payload) {
        requireConnected();
        Function<String, McpResponse> notifier =
                channel.exchangeAsText(endpointUri, buildPostHeaders(payload));
        McpResponse response = notifier.apply(McpValidation.requireNonNull(payload, "payload"));
        captureSessionId(response);
        if (response.statusCode() >= 400) {
            throw new IllegalStateException(
                    "Streamable HTTP notification failed with status " + response.statusCode()
                            + ": " + response.bodyAsText());
        }
    }

    /** Stores the listener invoked for server-initiated messages. */
    @Override
    public void setServerMessageListener(Consumer<JsonNode> listener) {
        this.serverMessageListener = listener;
    }

    /** Stores the handler invoked when the server terminates the session. */
    @Override
    public void setSessionExpiredHandler(Runnable handler) {
        this.sessionExpiredHandler = handler;
    }

    /** Clears the cached session id. */
    @Override
    public void clearSession() {
        this.sessionId = null;
    }

    /**
     * Opens a stream connection to the MCP endpoint so the server can push
     * requests and notifications to this client (Streamable HTTP, versions
     * 2025-03-26 through 2025-11-25). Servers that do not support a stream
     * connection are handled gracefully.
     */
    public void startServerStream() {
        if (stateless) return;
        if (closed || !serverStreamStarted.compareAndSet(false, true)) return;
        Map<String, String> streamHeaders = new LinkedHashMap<>();
        streamHeaders.put(McpTestClientConstants.Headers.ACCEPT, McpTestClientConstants.Headers.CONTENT_TYPE_SSE);
        streamHeaders.put(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion);
        if (sessionId != null) {
            streamHeaders.put(McpTestClientConstants.Headers.MCP_SESSION_ID, sessionId);
        }
        streamHeaders.putAll(headers);
        try {
            Supplier<CompletableFuture<McpResponse>> streamOpener =
                    channel.openStream(endpointUri, streamHeaders);
            streamOpener.get()
                    .thenAcceptAsync(response -> {
                        if (response.statusCode() >= 400) {
                            // e.g. 405 Method Not Allowed: the server does not offer a stream connection
                            return;
                        }
                        try {
                            SseEventDecoder.decode(response.bodyLines(), (event, data) -> {
                                JsonNode message = jsonCodec.parseJson(data);
                                if (message != null) {
                                    dispatchToListener(message);
                                }
                            });
                        } catch (Exception ignored) {
                            // stream closed; nothing to recover
                        }
                    })
                    .exceptionally(ex -> null);
        } catch (RuntimeException ignored) {
            // best-effort
        }
    }

    /** Sends a best-effort request to terminate the session and releases resources. */
    @Override
    public void close() {
        if (closed) return;
        closed = true;
        connected = false;
        if (channel != null && !stateless && sessionId != null) {
            Map<String, String> deleteHeaders = new LinkedHashMap<>();
            deleteHeaders.put(McpTestClientConstants.Headers.MCP_SESSION_ID, sessionId);
            deleteHeaders.put(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion);
            deleteHeaders.putAll(headers);
            try {
                channel.closeSession(endpointUri, deleteHeaders).run();
            } catch (Exception ignored) {
                // best-effort session termination
            }
        }
        interruptResponseConsumers();
    }

    /**
     * Returns whether the transport is connected and not closed.
     *
     * @return {@code true} if connected
     */
    public boolean isConnected() { return connected && !closed; }

    private Map<String, String> buildPostHeaders(String payload) {
        Map<String, String> requestHeaders = new LinkedHashMap<>();
        requestHeaders.put(McpTestClientConstants.Headers.CONTENT_TYPE, McpTestClientConstants.Headers.CONTENT_TYPE_JSON);
        requestHeaders.put(McpTestClientConstants.Headers.ACCEPT,
                McpTestClientConstants.Headers.CONTENT_TYPE_JSON + ", " + McpTestClientConstants.Headers.CONTENT_TYPE_SSE);
        requestHeaders.put(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion);
        if (stateless) {
            applyStatelessHeaders(requestHeaders, payload);
        } else if (sessionId != null) {
            requestHeaders.put(McpTestClientConstants.Headers.MCP_SESSION_ID, sessionId);
        }
        requestHeaders.putAll(headers);
        return requestHeaders;
    }

    private void applyStatelessHeaders(Map<String, String> requestHeaders, String payload) {
        JsonNode node = jsonCodec.parseJson(payload);
        if (node == null) return;
        String method = node.path("method").asText();
        if (!method.isBlank()) {
            requestHeaders.put(McpTestClientConstants.Headers.MCP_METHOD, method);
        }
        String name = node.path("params").path("name").asText();
        if (!name.isBlank()) {
            requestHeaders.put(McpTestClientConstants.Headers.MCP_NAME, name);
        }
    }

    private void captureSessionId(McpResponse response) {
        if (stateless) return;
        String value = response.header(McpTestClientConstants.Headers.MCP_SESSION_ID);
        if (value != null && !value.isBlank()) {
            this.sessionId = value;
        }
    }

    private void handleSessionExpired() {
        this.sessionId = null;
        Runnable handler = sessionExpiredHandler;
        if (handler != null) {
            handler.run();
        }
    }

    private JsonNode awaitSseResponse(Stream<String> lines, long requestId) {
        CompletableFuture<JsonNode> responseFuture = new CompletableFuture<>();
        Thread consumer = new Thread(() -> consumeSse(lines, requestId, responseFuture), "mcp-sse-response-" + requestId);
        consumer.setDaemon(true);
        responseConsumers.put(requestId, consumer);
        consumer.start();
        try {
            return responseFuture.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException ex) {
            responseFuture.cancel(true);
            consumer.interrupt();
            throw new IllegalStateException(
                    "Timed out waiting for Streamable HTTP response for request id " + requestId, ex);
        } catch (ExecutionException ex) {
            Throwable cause = ex.getCause() == null ? ex : ex.getCause();
            if (cause instanceof IllegalStateException) {
                throw (IllegalStateException) cause;
            }
            throw new IllegalStateException(
                    "Error receiving Streamable HTTP response for request id " + requestId, cause);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted waiting for Streamable HTTP response", ex);
        } finally {
            responseConsumers.remove(requestId);
        }
    }

    private void consumeSse(Stream<String> lines, long requestId, CompletableFuture<JsonNode> responseFuture) {
        try {
            SseEventDecoder.decode(lines, (event, data) -> {
                JsonNode message = jsonCodec.parseJson(data);
                if (message == null) {
                    return;
                }
                if (message.has("id") && message.get("id").asLong(-1) == requestId && !responseFuture.isDone()) {
                    responseFuture.complete(message);
                    return;
                }
                dispatchToListener(message);
            });
        } catch (Exception ignored) {
            // stream terminated abnormally; handled below
        } finally {
            if (!responseFuture.isDone()) {
                responseFuture.completeExceptionally(
                        new IllegalStateException("SSE response stream closed before a response for request id "
                                + requestId + " arrived"));
            }
        }
    }

    private JsonNode awaitJsonResponse(Stream<String> lines, long requestId) {
        String body = bodyOf(lines);
        if (body == null || body.isBlank()) {
            throw new IllegalStateException("Empty response from Streamable HTTP endpoint");
        }
        JsonNode parsed = jsonCodec.parseJsonOrThrow(body);
        if (parsed.isArray()) {
            for (JsonNode node : parsed) {
                if (node.has("id") && node.get("id").asLong(-1) == requestId) {
                    return node;
                }
            }
            throw new IllegalStateException("No response with id " + requestId + " found in batched response");
        }
        return parsed;
    }

    private String bodyOf(Stream<String> lines) {
        try (Stream<String> stream = lines) {
            return stream.collect(Collectors.joining("\n"));
        }
    }

    private void dispatchToListener(JsonNode message) {
        Consumer<JsonNode> listener = serverMessageListener;
        if (listener != null) {
            listener.accept(message);
        }
    }

    private void interruptResponseConsumers() {
        List<Thread> threads = List.copyOf(responseConsumers.values());
        responseConsumers.clear();
        threads.forEach(Thread::interrupt);
    }

    private void requireConnected() {
        if (!connected || closed) throw new IllegalStateException("McpStreamableHttpTransport is not connected");
    }
}
