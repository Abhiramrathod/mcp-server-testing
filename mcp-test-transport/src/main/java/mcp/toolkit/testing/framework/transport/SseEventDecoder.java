package mcp.toolkit.testing.framework.transport;

import java.util.stream.Stream;

/**
 * Minimal Server-Sent Events decoder per <a href="https://html.spec.whatwg.org/multipage/server-sent-events.html">the
 * HTML standard</a>.
 *
 * <p>Handles {@code event:}, {@code data:} (single-line and multi-line, joined with
 * {@code \n}), {@code id:}, comment lines (a line starting with {@code :}), and blank-line
 * event delimiters. When no {@code event:} field is present the event type defaults to
 * {@code "message"}, matching the standard. Incomplete events at end-of-stream are
 * dispatched if they carry data.
 */
final class SseEventDecoder {

    static final String DEFAULT_EVENT = "message";

    private SseEventDecoder() {}

    /**
     * Decodes an SSE line stream, invoking {@code onEvent} for every completed event.
     *
     * @param lines    the SSE line stream
     * @param onEvent  callback {@code (eventType, data)}; data may be an empty string
     *                 but is never {@code null}
     */
    static void decode(Stream<String> lines, java.util.function.BiConsumer<String, String> onEvent) {
        final String[] eventType = {DEFAULT_EVENT};
        final StringBuilder data = new StringBuilder();
        lines.forEach(line -> {
            if (line == null) {
                return;
            }
            if (line.isEmpty()) {
                dispatch(eventType, data, onEvent);
            } else if (line.startsWith(":")) {
                // comment; ignore
            } else if (line.startsWith("event:")) {
                String value = line.substring(6).trim();
                eventType[0] = value.isEmpty() ? DEFAULT_EVENT : value;
            } else if (line.startsWith("data:")) {
                String value = line.substring(5);
                if (value.startsWith(" ")) {
                    value = value.substring(1);
                }
                if (data.length() > 0) {
                    data.append('\n');
                }
                data.append(value);
            } else if (line.startsWith("id:")) {
                // ids are not needed by this client (streams are not resumable)
            } else if (line.startsWith("retry:")) {
                // retry hints are only relevant to EventSource; ignored
            }
            // any other line is ignored per the standard
        });
        // flush any trailing unterminated event
        if (!data.isEmpty()) {
            dispatch(eventType, data, onEvent);
        }
    }

    private static void dispatch(String[] eventType, StringBuilder data,
                                 java.util.function.BiConsumer<String, String> onEvent) {
        String event = eventType[0] == null ? DEFAULT_EVENT : eventType[0];
        String payload = data.toString();
        eventType[0] = DEFAULT_EVENT;
        data.setLength(0);
        if (!payload.isEmpty()) {
            onEvent.accept(event, payload);
        }
    }
}
