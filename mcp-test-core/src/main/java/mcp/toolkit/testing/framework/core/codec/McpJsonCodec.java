package mcp.toolkit.testing.framework.core.codec;

import mcp.toolkit.testing.framework.core.constants.McpTestClientConstants;
import mcp.toolkit.testing.framework.core.util.McpValidation;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.function.Consumer;

/**
 * JSON helper for MCP payload construction and parsing.
 */
public final class McpJsonCodec {

    private final ObjectMapper objectMapper;

    /**
     * Creates a codec backed by the given mapper.
     *
     * @param objectMapper JSON mapper used for all serialization and parsing
     */
    public McpJsonCodec(ObjectMapper objectMapper) {
        this.objectMapper = McpValidation.requireNonNull(objectMapper, "objectMapper");
    }

    /**
     * Creates an empty object node and hands it to the given writer for
     * population.
     *
     * @param paramsWriter consumer that populates the params node
     * @return the populated object node
     */
    public ObjectNode buildParams(Consumer<ObjectNode> paramsWriter) {
        McpValidation.requireNonNull(paramsWriter, "paramsWriter");
        ObjectNode params = objectMapper.createObjectNode();
        paramsWriter.accept(params);
        return params;
    }

    /**
     * Returns the {@code _meta} child of the given params node, creating it when
     * absent. Field-name based, so it is safe for any {@code _meta} content
     * regardless of JSON Pointer-sensitive characters.
     *
     * @param node params object node
     * @return the {@code _meta} object, never {@code null}
     */
    public ObjectNode metaObject(ObjectNode node) {
        JsonNode existing = node.get(McpTestClientConstants.Params.META);
        return existing instanceof ObjectNode meta ? meta : node.putObject(McpTestClientConstants.Params.META);
    }

    /**
     * Creates an empty array node.
     *
     * @return a new array node
     */
    public ArrayNode newArrayNode() {
        return objectMapper.createArrayNode();
    }

    /**
     * Converts the given value to a JSON tree, or {@code null} when the value is
     * {@code null}.
     *
     * @param value value to convert; may be {@code null}
     * @return the converted JSON node, or {@code null}
     */
    public JsonNode toJsonNode(Object value) {
        return value == null ? null : objectMapper.valueToTree(value);
    }

    /**
     * Converts the given value to a JSON tree for use as tool or prompt
     * arguments, defaulting to an empty object when the value is {@code null}.
     *
     * @param value value to convert; may be {@code null}
     * @return the converted JSON node, never {@code null}
     */
    public JsonNode toArgumentsNode(Object value) {
        return value == null ? objectMapper.createObjectNode() : objectMapper.valueToTree(value);
    }

    /**
     * Parses the given JSON text, returning {@code null} when it is malformed.
     *
     * @param data JSON text
     * @return the parsed node, or {@code null} if parsing failed
     */
    public JsonNode parseJson(String data) {
        try {
            return objectMapper.readTree(data);
        } catch (IOException ex) {
            return null;
        }
    }

    /**
     * Parses the given JSON text and throws {@link IllegalStateException} when it is
     * malformed. Prefer this over {@link #parseJson(String)} when a parse failure must
     * not be silently swallowed.
     *
     * @param data JSON text
     * @return the parsed node
     * @throws IllegalStateException if the input is not valid JSON
     */
    public JsonNode parseJsonOrThrow(String data) {
        try {
            return objectMapper.readTree(data);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to parse MCP JSON payload", ex);
        }
    }

    /**
     * Serializes the given JSON node to its JSON text representation.
     *
     * @param payload node to serialize
     * @return JSON text
     * @throws IllegalStateException if serialization fails
     */
    public String toJson(JsonNode payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to serialize MCP payload", ex);
        }
    }
}
