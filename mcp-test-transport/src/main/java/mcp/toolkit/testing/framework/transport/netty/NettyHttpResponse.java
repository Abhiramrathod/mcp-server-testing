package mcp.toolkit.testing.framework.transport.netty;

import mcp.toolkit.testing.framework.interfaces.McpResponse;

import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Stream;

/**
 * {@link McpResponse} backed by a Netty exchange.
 *
 * <p>The body is exposed either as buffered text ({@code textBody}) or as a live
 * line stream ({@code lineStream}), never both. As with the JDK-backed response,
 * {@link #bodyLines()} and {@link #bodyAsText()} are single-use and mutually
 * exclusive for streaming bodies.
 */
final class NettyHttpResponse implements McpResponse {

    private final int statusCode;
    private final Map<String, String> headers;
    private final String textBody;
    private final LineStream lineStream;

    NettyHttpResponse(int statusCode, Map<String, String> headers, String textBody, LineStream lineStream) {
        this.statusCode = statusCode;
        TreeMap<String, String> caseInsensitive = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        if (headers != null) {
            caseInsensitive.putAll(headers);
        }
        this.headers = Collections.unmodifiableMap(caseInsensitive);
        this.textBody = textBody;
        this.lineStream = lineStream;
    }

    @Override
    public int statusCode() {
        return statusCode;
    }

    @Override
    public String header(String name) {
        return headers.get(name);
    }

    @Override
    public Stream<String> bodyLines() {
        if (lineStream != null) {
            return lineStream.stream();
        }
        return textBody == null ? Stream.empty() : Stream.of(textBody.split("\n", -1));
    }

    @Override
    public String bodyAsText() {
        if (textBody != null) {
            return textBody;
        }
        if (lineStream != null) {
            return lineStream.join();
        }
        return "";
    }
}
