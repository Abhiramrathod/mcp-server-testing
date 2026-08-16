package mcp.toolkit.testing.framework.transport.netty;

import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpVersion;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CompletableFuture;

/**
 * Per-request state assembled from the HTTP objects emitted by the Netty codec
 * for a single exchange, while the owning channel lives in the connection pool.
 *
 * <p>Two modes are supported:
 *
 * <ul>
 *   <li><b>stream</b> ({@code streamBody}) — the response future completes as
 *       soon as the status and headers arrive, and the body is streamed live,
 *       line by line, into a {@link LineStream}.</li>
 *   <li><b>buffered</b> — the future completes once the last content chunk
 *       arrives, with the full body available as text.</li>
 * </ul>
 *
 * <p>This mirrors the JDK {@code BodyHandlers.ofLines()} / {@code ofString()}
 * semantics the framework previously relied on.
 */
final class PendingExchange {

    private final CompletableFuture<NettyHttpResponse> future;
    private final boolean streamBody;
    private final LineStream lineStream;
    private final StringBuilder pending = new StringBuilder();
    private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();

    private int statusCode = -1;
    private Map<String, String> headers;
    private boolean keepAlive = true;
    private boolean futureDone;
    private boolean streamFinished;

    PendingExchange(CompletableFuture<NettyHttpResponse> future, boolean streamBody) {
        this.future = future;
        this.streamBody = streamBody;
        this.lineStream = streamBody ? new LineStream() : null;
    }

    /**
     * Records the response status and headers. For streaming exchanges the
     * response future is completed here, matching headers-first semantics.
     *
     * @param version HTTP protocol version of the response
     * @param status  HTTP status code
     * @param headers response headers
     */
    void onHeaders(HttpVersion version, int status, HttpHeaders headers) {
        this.statusCode = status;
        this.headers = firstValueHeaders(headers);
        this.keepAlive = allowsKeepAlive(version, headers);
        if (streamBody) {
            completeFuture(new NettyHttpResponse(statusCode, this.headers, null, lineStream));
        }
    }

    /**
     * Consumes a body chunk.
     *
     * @param bytes body bytes
     * @param last  whether this is the final chunk of the response
     * @return {@code true} once the exchange is fully received and the owning
     *         channel may be returned to the pool
     */
    boolean onContent(byte[] bytes, boolean last) {
        if (streamBody) {
            appendStreamBytes(bytes);
            if (last) {
                finishStream();
                return true;
            }
            return false;
        }
        buffer.write(bytes, 0, bytes.length);
        if (last) {
            completeFuture(new NettyHttpResponse(statusCode, headers,
                    buffer.toString(StandardCharsets.UTF_8), null));
            return true;
        }
        return false;
    }

    /** Handles the owning channel closing before the exchange completed. */
    void onInactive() {
        if (streamBody) {
            if (statusCode < 0) {
                completeFutureExceptionally(
                        new IllegalStateException("Connection closed before a response was received"));
            } else {
                finishStream();
            }
        } else if (!futureDone) {
            completeFutureExceptionally(
                    new IllegalStateException("Connection closed before a response was received"));
        }
    }

    /** Handles a transport failure for this exchange. */
    void onException(Throwable cause) {
        if (streamBody) {
            if (statusCode < 0) {
                completeFutureExceptionally(cause);
            } else {
                finishStream();
            }
        } else if (!futureDone) {
            completeFutureExceptionally(cause);
        }
    }

    /**
     * Returns whether the connection may be kept alive and reused after this
     * exchange, i.e. the server did not request {@code Connection: close}.
     *
     * @return {@code true} to reuse the channel
     */
    boolean keepAlive() {
        return keepAlive;
    }

    /**
     * Returns whether the response future was cancelled before a response
     * arrived (e.g. a caller-side timeout).
     *
     * @return {@code true} if cancelled
     */
    boolean isCancelled() {
        return future.isCancelled();
    }

    private void appendStreamBytes(byte[] bytes) {
        pending.append(new String(bytes, StandardCharsets.UTF_8));
        int idx;
        while ((idx = pending.indexOf("\n")) >= 0) {
            String line = pending.substring(0, idx);
            pending.delete(0, idx + 1);
            if (line.endsWith("\r")) {
                line = line.substring(0, line.length() - 1);
            }
            lineStream.emit(line);
        }
    }

    private void finishStream() {
        if (streamFinished) {
            return;
        }
        streamFinished = true;
        if (pending.length() > 0) {
            lineStream.emit(pending.toString());
            pending.setLength(0);
        }
        lineStream.finish();
    }

    private void completeFuture(NettyHttpResponse response) {
        if (futureDone) {
            return;
        }
        futureDone = true;
        future.complete(response);
    }

    private void completeFutureExceptionally(Throwable cause) {
        if (futureDone) {
            return;
        }
        futureDone = true;
        future.completeExceptionally(cause);
    }

    private static boolean allowsKeepAlive(HttpVersion version, HttpHeaders headers) {
        String connection = headers.get(HttpHeaderNames.CONNECTION);
        if (HttpVersion.HTTP_1_0.equals(version)) {
            return "keep-alive".equalsIgnoreCase(connection);
        }
        return connection == null || !connection.toLowerCase(Locale.ROOT).contains("close");
    }

    private static Map<String, String> firstValueHeaders(HttpHeaders headers) {
        Map<String, String> result = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (Map.Entry<String, String> entry : headers) {
            result.putIfAbsent(entry.getKey(), entry.getValue());
        }
        return result;
    }
}
