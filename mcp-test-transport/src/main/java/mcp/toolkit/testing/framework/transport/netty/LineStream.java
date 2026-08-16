package mcp.toolkit.testing.framework.transport.netty;

import java.util.Spliterator;
import java.util.Spliterators;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

/**
 * Thread-safe, live line source that bridges Netty's event-loop threads to the
 * blocking line stream consumed by MCP transports.
 *
 * <p>Chunks arriving on the event loop are split into lines and handed to this
 * source; the consuming thread reads them back from a {@link Stream}. The stream
 * ends when {@link #finish()} is invoked or the reading thread is interrupted.
 */
final class LineStream {

    private static final Object END = new Object();

    private final BlockingQueue<Object> queue = new LinkedBlockingQueue<>();

    /** Publishes a complete line to consumers. */
    void emit(String line) {
        queue.add(line);
    }

    /** Signals the end of the stream; the next read returns no more lines. */
    void finish() {
        queue.add(END);
    }

    /**
     * Returns a single-use stream over the published lines. Blocking until a
     * line or the end-of-stream marker is available.
     *
     * @return the live line stream
     */
    Stream<String> stream() {
        Spliterator<String> spliterator = new Spliterators.AbstractSpliterator<String>(
                Long.MAX_VALUE, Spliterator.ORDERED | Spliterator.NONNULL) {
            @Override
            public boolean tryAdvance(Consumer<? super String> action) {
                Object item;
                try {
                    item = queue.take();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
                if (item == END) {
                    return false;
                }
                action.accept((String) item);
                return true;
            }
        };
        return StreamSupport.stream(spliterator, false);
    }

    /** Drains the stream and joins the lines with {@code "\n"}. */
    String join() {
        try (Stream<String> stream = stream()) {
            return stream.collect(Collectors.joining("\n"));
        }
    }
}
