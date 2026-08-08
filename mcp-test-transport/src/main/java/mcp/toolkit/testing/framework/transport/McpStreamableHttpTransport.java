package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.exception.McpSessionExpiredException;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * {@link McpTransport} implementation using the Streamable HTTP transport
 * (protocol version 2025-03-26 and later).
 *
 * <p>Each JSON-RPC message is sent as its own HTTP POST to a single MCP endpoint. The
 * server may answer with either a single {@code application/json} object or an SSE
 * stream scoped to that request. The implementation:
 *
 * <ul>
 *   <li>accepts both {@code application/json} and {@code text/event-stream} responses,</li>
 *   <li>manages the {@code Mcp-Session-Id} header assigned during initialization,
 *       re-initializing transparently when the server terminates the session (HTTP 404),</li>
 *   <li>surfaces server-initiated requests and notifications
 *       (e.g. {@code roots/list}, {@code sampling/createMessage},
 *       {@code notifications/message}, {@code notifications/progress}) to registered
 *       listeners, and</li>
 *   <li>optionally opens a {@code GET} SSE stream to receive server messages.</li>
 * </ul>
 */
public class McpStreamableHttpTransport implements McpTransport {

    private final URI endpointUri;
    private final String protocolVersion;
    private final Duration timeout;
    private final McpJsonCodec jsonCodec;
    private final Map<String, String> headers;
    private final ConcurrentHashMap<Long, Thread> responseConsumers = new ConcurrentHashMap<>();

    private volatile HttpClient httpClient;
    private volatile boolean connected;
    private volatile boolean closed;
    private volatile String sessionId;
    private volatile Consumer<JsonNode> serverMessageListener;
    private volatile Runnable sessionExpiredHandler;
    private final AtomicBoolean serverStreamStarted = new AtomicBoolean(false);

    /**
     * Creates a Streamable HTTP transport with no extra HTTP headers.
     *
     * @param endpointUri     MCP endpoint URI (default {@code /mcp})
     * @param protocolVersion MCP protocol version to advertise
     * @param timeout         timeout for connection and RPC calls
     * @param jsonCodec       codec used to parse JSON messages
     */
    public McpStreamableHttpTransport(URI endpointUri, String protocolVersion,
                                      Duration timeout, McpJsonCodec jsonCodec) {
        this(endpointUri, protocolVersion, timeout, jsonCodec, Collections.emptyMap());
    }

    /**
     * Creates a Streamable HTTP transport with custom HTTP headers.
     *
     * @param endpointUri     MCP endpoint URI (default {@code /mcp})
     * @param protocolVersion MCP protocol version to advertise
     * @param timeout         timeout for connection and RPC calls
     * @param jsonCodec       codec used to parse JSON messages
     * @param headers         extra HTTP headers sent on every request
     */
    public McpStreamableHttpTransport(URI endpointUri, String protocolVersion,
                                      Duration timeout, McpJsonCodec jsonCodec,
                                      Map<String, String> headers) {
        this.endpointUri = McpValidation.requireNonNull(endpointUri, "endpointUri");
        this.protocolVersion = McpValidation.requireNonNull(protocolVersion, "protocolVersion");
        this.timeout = timeout == null ? McpTestClientConstants.Defaults.TIMEOUT : timeout;
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
        this.headers = headers == null ? Collections.emptyMap() : Map.copyOf(headers);
    }

    /** Creates the HTTP client and marks the transport connected. */
    @Override
    public void connect() {
        if (connected) return;
        if (closed) throw new IllegalStateException("McpStreamableHttpTransport is closed");
        httpClient = HttpClient.newBuilder().connectTimeout(timeout).build();
        connected = true;
    }

    /** Sends a POST request and waits for either a JSON or SSE response. */
    @Override
    public JsonNode sendRequest(String payload, long requestId) {
        requireConnected();
        HttpRequest request = buildPost(payload);
        HttpResponse<Stream<String>> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofLines());
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to send Streamable HTTP request to " + endpointUri, ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted during Streamable HTTP request", ex);
        }

        int status = response.statusCode();
        HttpHeaders responseHeaders = response.headers();
        captureSessionId(responseHeaders);

        if (status == 404) {
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
                    "Streamable HTTP request failed with status " + status + ": " + bodyOf(response.body()));
        }

        String contentType = responseHeaders.firstValue(McpTestClientConstants.Headers.CONTENT_TYPE)
                .orElse(McpTestClientConstants.Headers.CONTENT_TYPE_JSON);
        if (contentType.toLowerCase().contains(McpTestClientConstants.Headers.CONTENT_TYPE_SSE)) {
            return awaitSseResponse(response.body(), requestId);
        }
        return awaitJsonResponse(response.body(), requestId);
    }

    /** Sends a POST notification without waiting for a response. */
    @Override
    public void sendNotification(String payload) {
        requireConnected();
        HttpRequest request = buildPost(payload);
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            captureSessionId(response.headers());
            if (response.statusCode() >= 400) {
                throw new IllegalStateException(
                        "Streamable HTTP notification failed with status " + response.statusCode()
                                + ": " + response.body());
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted during Streamable HTTP notification", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to send Streamable HTTP notification to " + endpointUri, ex);
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

    /** Clears the cached {@code Mcp-Session-Id}. */
    @Override
    public void clearSession() {
        this.sessionId = null;
    }

    /**
     * Opens a {@code GET} SSE stream to the MCP endpoint so the server can push
     * requests and notifications to this client (Streamable HTTP, versions 2025-03-26
     * through 2025-11-25). Servers that do not support a {@code GET} stream
     * (HTTP 405) are handled gracefully.
     */
    public void startServerStream() {
        if (closed || !serverStreamStarted.compareAndSet(false, true)) return;
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(endpointUri)
                .header(McpTestClientConstants.Headers.ACCEPT, McpTestClientConstants.Headers.CONTENT_TYPE_SSE)
                .header(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion)
                .GET();
        if (sessionId != null) {
            builder.header(McpTestClientConstants.Headers.MCP_SESSION_ID, sessionId);
        }
        applyHeaders(builder);
        try {
            httpClient.sendAsync(builder.build(), HttpResponse.BodyHandlers.ofLines())
                    .thenAcceptAsync(response -> {
                        if (response.statusCode() >= 400) {
                            // e.g. 405 Method Not Allowed: the server does not offer a GET stream
                            return;
                        }
                        try {
                            SseEventDecoder.decode(response.body(), (event, data) -> {
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

    /** Sends a best-effort DELETE to terminate the session and releases resources. */
    @Override
    public void close() {
        if (closed) return;
        closed = true;
        connected = false;
        if (httpClient != null && sessionId != null) {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(endpointUri)
                    .header(McpTestClientConstants.Headers.MCP_SESSION_ID, sessionId)
                    .header(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion)
                    .DELETE();
            applyHeaders(builder);
            try {
                httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
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

    private HttpRequest buildPost(String payload) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(endpointUri)
                .header(McpTestClientConstants.Headers.CONTENT_TYPE, McpTestClientConstants.Headers.CONTENT_TYPE_JSON)
                .header(McpTestClientConstants.Headers.ACCEPT,
                        McpTestClientConstants.Headers.CONTENT_TYPE_JSON + ", " + McpTestClientConstants.Headers.CONTENT_TYPE_SSE)
                .header(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .timeout(timeout);
        if (sessionId != null) {
            builder.header(McpTestClientConstants.Headers.MCP_SESSION_ID, sessionId);
        }
        applyHeaders(builder);
        return builder.build();
    }

    private void captureSessionId(HttpHeaders responseHeaders) {
        String value = responseHeaders.firstValue(McpTestClientConstants.Headers.MCP_SESSION_ID).orElse(null);
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

    private void applyHeaders(HttpRequest.Builder builder) {
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            builder.header(entry.getKey(), entry.getValue());
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
