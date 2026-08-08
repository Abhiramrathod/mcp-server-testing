package mcp.toolkit.testing.framework.client.rpc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RpcExchangeTrackerTest {

    private RpcExchange exchange(long id, String method) {
        return RpcExchange.builder()
                .id(id)
                .method(method)
                .sentAt(Instant.now())
                .status(RpcExchange.Status.SUCCESS)
                .build();
    }

    @Test
    void recordsExchangesInOrder() {
        RpcExchangeTracker tracker = new RpcExchangeTracker();
        tracker.record(exchange(1, "initialize"));
        tracker.record(exchange(2, "tools/list"));

        assertEquals(2, tracker.size());
        assertEquals(1, tracker.all().get(0).id());
        assertEquals("tools/list", tracker.last().orElseThrow().method());
    }

    @Test
    void boundsTrackerSizeEvictingOldest() {
        RpcExchangeTracker tracker = new RpcExchangeTracker(2);
        tracker.record(exchange(1, "initialize"));
        tracker.record(exchange(2, "tools/list"));
        tracker.record(exchange(3, "tools/call"));

        assertEquals(2, tracker.size());
        assertEquals(2, tracker.all().get(0).id());
        assertEquals(3, tracker.last().orElseThrow().id());
    }

    @Test
    void filtersByMethod() {
        RpcExchangeTracker tracker = new RpcExchangeTracker();
        tracker.record(exchange(1, "initialize"));
        tracker.record(exchange(2, "tools/list"));
        tracker.record(exchange(3, "tools/list"));

        List<RpcExchange> matches = tracker.forMethod("tools/list");
        assertEquals(2, matches.size());
    }

    @Test
    void rejectsNonPositiveMaxSize() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class,
                () -> new RpcExchangeTracker(0));
    }

    @Test
    void exportsExchangesAsJson() {
        RpcExchangeTracker tracker = new RpcExchangeTracker();
        ObjectNode params = new ObjectMapper().createObjectNode();
        params.put("name", "greet");
        tracker.record(RpcExchange.builder()
                .id(7).method("tools/call").params(params).sentAt(Instant.now())
                .receivedAt(Instant.now()).status(RpcExchange.Status.SUCCESS)
                .build());

        JsonNode exported = tracker.export(new ObjectMapper());
        assertTrue(exported.isArray());
        assertEquals(1, exported.size());
        assertEquals(7, exported.get(0).path("id").asLong());
        assertEquals("tools/call", exported.get(0).path("method").asText());
        assertEquals("SUCCESS", exported.get(0).path("status").asText());
        assertEquals("greet", exported.get(0).path("params").path("name").asText());
    }
}
