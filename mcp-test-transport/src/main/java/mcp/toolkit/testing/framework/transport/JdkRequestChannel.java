package mcp.toolkit.testing.framework.transport;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import mcp.toolkit.testing.framework.interfaces.McpResponse;
import mcp.toolkit.testing.framework.interfaces.McpTransportClient;
import mcp.toolkit.testing.framework.interfaces.RequestChannel;

import java.net.URI;
import java.util.Map;
import java.util.function.Function;

/**
 * {@link RequestChannel} variant for synchronous request/response exchanges,
 * backed by a {@link McpTransportClient}.
 *
 * <p>The raw client calls are captured inside lambdas so callers only ever
 * invoke {@link Function#apply(Object)} and never see the exchange directly.
 */
final class JdkRequestChannel implements RequestChannel {

    private final McpTransportClient client;

    JdkRequestChannel(McpTransportClient client) {
        this.client = McpValidation.requireNonNull(client, "client");
    }

    @Override
    public Function<String, McpResponse> exchange(URI uri, Map<String, String> headers) {
        McpValidation.requireNonNull(uri, "uri");
        McpValidation.requireNonNull(headers, "headers");
        return payload -> client.send(uri, headers, McpValidation.requireNonNull(payload, "payload"));
    }

    @Override
    public Function<String, McpResponse> exchangeAsText(URI uri, Map<String, String> headers) {
        McpValidation.requireNonNull(uri, "uri");
        McpValidation.requireNonNull(headers, "headers");
        return payload -> client.sendAsText(uri, headers, McpValidation.requireNonNull(payload, "payload"));
    }
}
