package mcp.toolkit.testing.framework.core.codec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class McpJsonCodecTest {

    private final McpJsonCodec codec = new McpJsonCodec(new ObjectMapper());

    @Test
    void buildParamsWritesIntoFreshObjectNode() {
        ObjectNode params = codec.buildParams(p -> {
            p.put("name", "greet");
            p.set("arguments", codec.toArgumentsNode(java.util.Map.of("who", "world")));
        });

        assertEquals("greet", params.path("name").asText());
        assertEquals("world", params.path("arguments").path("who").asText());
    }

    @Test
    void parseJsonReturnsNullForMalformedInput() {
        assertNull(codec.parseJson("{not json"));
    }

    @Test
    void parseJsonOrThrowRejectsMalformedInput() {
        assertThrows(IllegalStateException.class, () -> codec.parseJsonOrThrow("{not json"));
    }

    @Test
    void toJsonRoundTripsThroughParseJson() {
        ObjectNode node = codec.buildParams(p -> p.put("a", 1));
        String json = codec.toJson(node);

        JsonNode parsed = codec.parseJsonOrThrow(json);
        assertEquals(1, parsed.path("a").asInt());
    }

    @Test
    void newArrayNodeCreatesEmptyArray() {
        assertTrue(codec.newArrayNode().isEmpty());
    }

    @Test
    void toArgumentsNodeHandlesNullAsEmptyObject() {
        JsonNode node = codec.toArgumentsNode(null);
        assertTrue(node.isObject());
        assertTrue(node.isEmpty());
    }
}
