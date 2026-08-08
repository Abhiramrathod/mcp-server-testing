package mcp.toolkit.testing.framework.transport;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SseEventDecoderTest {

    @Test
    void decodesSingleMessageEvent() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("event: message", "data: {\"id\":1}", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals(1, events.size());
        assertEquals("message", events.get(0)[0]);
        assertEquals("{\"id\":1}", events.get(0)[1]);
    }

    @Test
    void defaultsEventToMessage() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("data: hello", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals(1, events.size());
        assertEquals(SseEventDecoder.DEFAULT_EVENT, events.get(0)[0]);
        assertEquals("hello", events.get(0)[1]);
    }

    @Test
    void joinsMultilineDataWithNewline() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("data: line1", "data: line2", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals(1, events.size());
        assertEquals("line1\nline2", events.get(0)[1]);
    }

    @Test
    void stripsSingleLeadingSpaceFromData() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("data: value", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals("value", events.get(0)[1]);
    }

    @Test
    void ignoresCommentsAndUnknownFields() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of(": keep-alive", "retry: 1000", "id: 42", "data: x", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals(1, events.size());
        assertEquals("x", events.get(0)[1]);
    }

    @Test
    void dispatchesMultipleEventsSeparatedByBlankLines() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("event: endpoint", "data: /message", "", "data: second", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals(2, events.size());
        assertEquals("endpoint", events.get(0)[0]);
        assertEquals("/message", events.get(0)[1]);
        assertEquals("message", events.get(1)[0]);
        assertEquals("second", events.get(1)[1]);
    }

    @Test
    void resetsEventTypeAfterDispatch() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("event: custom", "data: first", "", "data: second", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals("custom", events.get(0)[0]);
        assertEquals("message", events.get(1)[0]);
    }

    @Test
    void dispatchesTrailingUnterminatedEvent() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("data: trailing"),
                (event, data) -> events.add(new String[]{event, data}));

        assertEquals(1, events.size());
        assertEquals("trailing", events.get(0)[1]);
    }

    @Test
    void ignoresBlankDataLines() {
        List<String[]> events = new ArrayList<>();
        SseEventDecoder.decode(
                Stream.of("data:", ""),
                (event, data) -> events.add(new String[]{event, data}));

        assertTrue(events.isEmpty());
    }
}
