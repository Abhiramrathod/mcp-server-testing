package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import mcp.toolkit.testing.framework.interfaces.TransportChannel;
import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.time.Duration;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Stream;

/**
 * {@link McpTransport} implementation using the legacy HTTP+SSE transport
 * (protocol version 2024-11-05).
 */
final class McpSseTransport implements McpTransport {

    private final URI sseEndpointUri;
    private final URI baseUri;
    private final String protocolVersion;
    private final Duration timeout;
    private final McpJsonCodec jsonCodec;
    private final Map<String, String> headers;

    private final ConcurrentHashMap<Long, CompletableFuture<JsonNode>> pendingRequests = new ConcurrentHashMap<>();
    private final Object connectLock = new Object();
    private final CountDownLatch endpointLatch = new CountDownLatch(1);

    private volatile URI messageEndpointUri;
    private volatile boolean connected;
    private volatile boolean closed;
    private volatile Consumer<JsonNode> serverMessageListener;

    private final TransportChannel channel;
    private CompletableFuture<McpResponse> sseConnectionFuture;

    McpSseTransport(URI sseEndpointUri, URI baseUri, String protocolVersion,
                    Duration timeout, McpJsonCodec jsonCodec) {
        this(sseEndpointUri, baseUri, protocolVersion, timeout, jsonCodec, Collections.emptyMap(), null);
    }

    McpSseTransport(URI sseEndpointUri, URI baseUri, String protocolVersion,
                    Duration timeout, McpJsonCodec jsonCodec, Map<String, String> headers) {
        this(sseEndpointUri, baseUri, protocolVersion, timeout, jsonCodec, headers, null);
    }

    McpSseTransport(URI sseEndpointUri, URI baseUri, String protocolVersion,
                    Duration timeout, McpJsonCodec jsonCodec, Map<String, String> headers,
                    TransportChannel channel) {
        this.sseEndpointUri = McpValidation.requireNonNull(sseEndpointUri, "sseEndpointUri");
        this.baseUri = McpValidation.requireNonNull(baseUri, "baseUri");
        this.messageEndpointUri = this.baseUri.resolve(McpTestClientConstants.Endpoints.MESSAGE);
        this.protocolVersion = McpValidation.requireNonNull(protocolVersion, "protocolVersion");
        this.timeout = timeout == null ? McpTestClientConstants.Defaults.TIMEOUT : timeout;
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
        this.headers = headers == null ? Collections.emptyMap() : Map.copyOf(headers);
        this.channel = McpValidation.requireNonNull(channel, "channel");
    }

    /**
     * Opens the SSE stream and waits for the server's {@code endpoint} event
     * before marking the transport connected.
     */
    @Override
    public void connect() {
        if (connected) return;
        synchronized (connectLock) {
            if (connected) return;
            if (closed) throw new IllegalStateException("McpSseTransport is closed");

            Map<String, String> sseHeaders = new LinkedHashMap<>();
            sseHeaders.put(McpTestClientConstants.Headers.ACCEPT, McpTestClientConstants.Headers.CONTENT_TYPE_SSE);
            sseHeaders.putAll(headers);
            sseConnectionFuture = channel.openStream(sseEndpointUri, sseHeaders).get();

            CountDownLatch connectLatch = new CountDownLatch(1);
            final Exception[] connectError = {null};

            sseConnectionFuture.thenAcceptAsync(response -> {
                if (response.statusCode() >= 400) {
                    connectError[0] = new IllegalStateException("SSE connection failed with status " + response.statusCode());
                    connectLatch.countDown();
                    failAllPending(connectError[0]);
                    return;
                }
                connectLatch.countDown();
                processSseStream(response.bodyLines());
            }).exceptionally(ex -> {
                connectError[0] = ex instanceof Exception ? (Exception) ex : new IllegalStateException("SSE stream error", ex);
                connectLatch.countDown();
                failAllPending(connectError[0]);
                return null;
            });

            try {
                if (!connectLatch.await(timeout.toMillis(), TimeUnit.MILLISECONDS)) {
                    throw new IllegalStateException("Timed out waiting for SSE stream from " + sseEndpointUri);
                }
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for SSE stream", ex);
            }
            if (connectError[0] != null) {
                throw new IllegalStateException("Failed to establish SSE stream to " + sseEndpointUri, connectError[0]);
            }
            // The server's endpoint event carries the message POST path. Wait for
            // it so requests are never sent to the default /mcp/message path.
            try {
                if (!endpointLatch.await(timeout.toMillis(), TimeUnit.MILLISECONDS)) {
                    throw new IllegalStateException("Timed out waiting for SSE endpoint event from " + sseEndpointUri);
                }
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while waiting for SSE endpoint event", ex);
            }
            connected = true;
        }
    }

    /** POSTs the request and waits for the SSE response matched by {@code requestId}. */
    @Override
    public JsonNode sendRequest(String payload, long requestId) {
        requireConnected();
        CompletableFuture<JsonNode> responseFuture = new CompletableFuture<>();
        pendingRequests.put(requestId, responseFuture);
        try {
            postMessage(payload);
            return responseFuture.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException ex) {
            pendingRequests.remove(requestId);
            throw new IllegalStateException("Timed out waiting for SSE response for request id " + requestId, ex);
        } catch (ExecutionException ex) {
            pendingRequests.remove(requestId);
            throw new IllegalStateException("Error receiving SSE response for request id " + requestId, ex.getCause());
        } catch (InterruptedException ex) {
            pendingRequests.remove(requestId);
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted waiting for response", ex);
        }
    }

    /** POSTs the notification without waiting for a response. */
    @Override
    public void sendNotification(String payload) {
        requireConnected();
        postMessage(payload);
    }

    /** Stores the listener invoked for server-initiated SSE messages. */
    @Override
    public void setServerMessageListener(Consumer<JsonNode> listener) {
        this.serverMessageListener = listener;
    }

    /**
     * Returns whether the transport is connected and not closed.
     *
     * @return {@code true} if connected
     */
    public boolean isConnected() { return connected && !closed; }

    /** Closes the SSE stream and fails all pending requests. */
    @Override
    public void close() {
        if (closed) return;
        closed = true;
        connected = false;
        failAllPending(new IllegalStateException("Transport closed"));
        if (sseConnectionFuture != null) sseConnectionFuture.cancel(true);
    }

    private void postMessage(String payload) {
        Map<String, String> requestHeaders = new LinkedHashMap<>();
        requestHeaders.put(McpTestClientConstants.Headers.CONTENT_TYPE, McpTestClientConstants.Headers.CONTENT_TYPE_JSON);
        requestHeaders.put(McpTestClientConstants.Headers.ACCEPT, McpTestClientConstants.Headers.CONTENT_TYPE_SSE);
        requestHeaders.put(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion);
        requestHeaders.putAll(headers);
        Function<String, McpResponse> poster =
                channel.exchangeAsText(messageEndpointUri, requestHeaders);
        McpResponse response = poster.apply(McpValidation.requireNonNull(payload, "payload"));
        if (response.statusCode() >= 400) {
            throw new IllegalStateException("MCP POST failed with status " + response.statusCode() + ": " + response.bodyAsText());
        }
    }

    private void processSseStream(Stream<String> lines) {
        try {
            SseEventDecoder.decode(lines, this::handleEvent);
        } catch (Exception ignored) {
            // stream failures are handled below
        } finally {
            endpointLatch.countDown();
            if (!closed) {
                connected = false;
                failAllPending(new IllegalStateException("SSE connection closed unexpectedly"));
            }
        }
    }

    private void handleEvent(String eventType, String data) {
        if (data == null || data.isBlank()) return;
        switch (eventType) {
            case McpTestClientConstants.SseEvents.ENDPOINT -> {
                messageEndpointUri = baseUri.resolve(data.trim());
                endpointLatch.countDown();
            }
            case McpTestClientConstants.SseEvents.MESSAGE -> dispatchMessage(jsonCodec.parseJsonOrThrow(data));
            default -> {
                // non-standard event type with JSON payload; forward as a server message
                JsonNode parsed = jsonCodec.parseJson(data);
                if (parsed != null) {
                    dispatchToListener(parsed);
                }
            }
        }
    }

    private void dispatchMessage(JsonNode message) {
        if (message == null) return;
        if (message.has("id")) {
            long id = message.get("id").asLong(-1);
            if (id >= 0) {
                CompletableFuture<JsonNode> future = pendingRequests.remove(id);
                if (future != null) {
                    future.complete(message);
                    return;
                }
            }
            // a server-initiated request with an unknown id
            dispatchToListener(message);
            return;
        }
        dispatchToListener(message);
    }

    private void dispatchToListener(JsonNode message) {
        Consumer<JsonNode> listener = serverMessageListener;
        if (listener != null) {
            listener.accept(message);
        }
    }

    private void failAllPending(Exception cause) {
        pendingRequests.forEach((id, future) -> future.completeExceptionally(cause));
        pendingRequests.clear();
    }

    private void requireConnected() {
        if (!connected || closed) throw new IllegalStateException("McpSseTransport is not connected");
    }
}
