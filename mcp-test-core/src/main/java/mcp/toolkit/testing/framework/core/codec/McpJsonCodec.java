package mcp.toolkit.testing.framework.core.codec;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.function.Consumer;

/**
 * JSON helper for MCP payload construction and parsing.
 */
public final class McpJsonCodec {

    private final ObjectMapper objectMapper;

    public McpJsonCodec(ObjectMapper objectMapper) {
        this.objectMapper = McpValidation.requireNonNull(objectMapper, "objectMapper");
    }

    public ObjectNode buildParams(Consumer<ObjectNode> paramsWriter) {
        McpValidation.requireNonNull(paramsWriter, "paramsWriter");
        ObjectNode params = objectMapper.createObjectNode();
        paramsWriter.accept(params);
        return params;
    }

    public JsonNode toJsonNode(Object value) {
        return value == null ? null : objectMapper.valueToTree(value);
    }

    public JsonNode toArgumentsNode(Object value) {
        return value == null ? objectMapper.createObjectNode() : objectMapper.valueToTree(value);
    }

    public JsonNode parseJson(String data) {
        try {
            return objectMapper.readTree(data);
        } catch (IOException ex) {
            return null;
        }
    }

    public String toJson(JsonNode payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to serialize MCP payload", ex);
        }
    }
}
