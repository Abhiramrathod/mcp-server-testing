package mcp.toolkit.testing.framework.client.lifecycle;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import java.util.function.Supplier;

public final class McpInitializationGuard {

    private final Runnable ensureInitialized;

    /**
     * Creates a guard that runs the given initialization routine before any
     * guarded action.
     *
     * @param ensureInitialized routine that ensures the client is initialized
     */
    public McpInitializationGuard(Runnable ensureInitialized) {
        this.ensureInitialized = McpValidation.requireNonNull(ensureInitialized, "ensureInitialized");
    }

    /**
     * Ensures initialization, then runs the given action and returns its result.
     *
     * @param action action producing a value
     * @param <T>    result type
     * @return the action's result
     */
    public <T> T withInitialized(Supplier<T> action) {
        ensureInitialized.run();
        return action.get();
    }

    /**
     * Ensures initialization, then runs the given action.
     *
     * @param action action to run
     */
    public void withInitialized(Runnable action) {
        ensureInitialized.run();
        action.run();
    }
}
