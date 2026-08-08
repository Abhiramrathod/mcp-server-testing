package mcp.toolkit.testing.framework.core.util;

import java.util.Objects;

/**
 * Validation helpers for common argument checks.
 */
public final class McpValidation {

    private McpValidation() {}

    /**
     * Returns the given value if it is non-null, otherwise throws.
     *
     * @param value value to check
     * @param name  name of the argument, used in the error message
     * @param <T>   value type
     * @return the value if non-null
     * @throws NullPointerException if the value is {@code null}
     */
    public static <T> T requireNonNull(T value, String name) {
        return Objects.requireNonNull(value, "Required argument '" + name + "' must not be null.");
    }

    /**
     * Returns the given string if it is non-null and non-blank, otherwise throws.
     *
     * @param value value to check
     * @param name  name of the argument, used in the error message
     * @return the value if non-null and non-blank
     * @throws IllegalArgumentException if the value is {@code null} or blank
     */
    public static String requireNotBlank(String value, String name) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Required argument '" + name + "' must not be blank.");
        }
        return value;
    }
}
