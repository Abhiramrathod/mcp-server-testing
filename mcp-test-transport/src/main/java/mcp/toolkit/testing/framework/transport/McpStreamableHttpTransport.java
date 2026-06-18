package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.core.codec.McpJsonCodec;
import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpTransport;
import com.fasterxml.jackson.databind.JsonNode;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * {@link McpTransport} implementation using Streamable HTTP.
 *
 * <p>Each JSON-RPC request is sent as an HTTP POST to a single endpoint
 * and the response is received synchronously in the HTTP response body.
 */
public class McpStreamableHttpTransport implements McpTransport {

    private final URI endpointUri;
    private final String protocolVersion;
    private final Duration timeout;
    private final McpJsonCodec jsonCodec;

    private volatile HttpClient httpClient;
    private volatile boolean connected;
    private volatile boolean closed;

    public McpStreamableHttpTransport(URI endpointUri, String protocolVersion,
                                      Duration timeout, McpJsonCodec jsonCodec) {
        this.endpointUri = McpValidation.requireNonNull(endpointUri, "endpointUri");
        this.protocolVersion = McpValidation.requireNonNull(protocolVersion, "protocolVersion");
        this.timeout = timeout == null ? McpTestClientConstants.Defaults.TIMEOUT : timeout;
        this.jsonCodec = McpValidation.requireNonNull(jsonCodec, "jsonCodec");
    }

    @Override
    public void connect() {
        if (connected) return;
        if (closed) throw new IllegalStateException("McpStreamableHttpTransport is closed");
        httpClient = HttpClient.newBuilder().connectTimeout(timeout).build();
        connected = true;
    }

    @Override
    public JsonNode sendRequest(String payload, long requestId) {
        requireConnected();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(endpointUri)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .timeout(timeout)
                .build();
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 202) {
                return null;
            }
            if (response.statusCode() >= 400) {
                throw new IllegalStateException(
                        "Streamable HTTP request failed with status " + response.statusCode() + ": " + response.body());
            }
            String body = response.body();
            if (body == null || body.isBlank()) {
                throw new IllegalStateException("Empty response from Streamable HTTP endpoint");
            }
            return jsonCodec.parseJson(body);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted during Streamable HTTP request", ex);
        } catch (Exception ex) {
            if (ex instanceof IllegalStateException) throw (IllegalStateException) ex;
            throw new IllegalStateException("Failed to send Streamable HTTP request to " + endpointUri, ex);
        }
    }

    @Override
    public void sendNotification(String payload) {
        requireConnected();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(endpointUri)
                .header("Content-Type", "application/json")
                .header(McpTestClientConstants.Headers.MCP_PROTOCOL_VERSION, protocolVersion)
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .timeout(timeout)
                .build();
        try {
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        } catch (Exception ignored) {
        }
    }

    @Override
    public void close() {
        if (closed) return;
        closed = true;
        connected = false;
    }

    public boolean isConnected() { return connected && !closed; }

    private void requireConnected() {
        if (!connected || closed) throw new IllegalStateException("McpStreamableHttpTransport is not connected");
    }
}
