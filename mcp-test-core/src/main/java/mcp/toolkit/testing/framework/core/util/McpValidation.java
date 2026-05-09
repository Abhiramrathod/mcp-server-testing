package mcp.toolkit.testing.framework.core.util;

import java.util.Objects;

/**
 * Validation helpers for common argument checks.
 */
public final class McpValidation {

    private McpValidation() {}

    public static <T> T requireNonNull(T value, String name) {
        return Objects.requireNonNull(value, "Required argument '" + name + "' must not be null.");
    }

    public static String requireNotBlank(String value, String name) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Required argument '" + name + "' must not be blank.");
        }
        return value;
    }
}
