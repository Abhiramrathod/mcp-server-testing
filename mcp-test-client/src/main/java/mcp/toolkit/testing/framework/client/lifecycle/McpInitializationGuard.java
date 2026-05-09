package mcp.toolkit.testing.framework.client.lifecycle;

import mcp.toolkit.testing.framework.core.util.McpValidation;
import java.util.function.Supplier;

public final class McpInitializationGuard {

    private final Runnable ensureInitialized;

    public McpInitializationGuard(Runnable ensureInitialized) {
        this.ensureInitialized = McpValidation.requireNonNull(ensureInitialized, "ensureInitialized");
    }

    public <T> T withInitialized(Supplier<T> action) {
        ensureInitialized.run();
        return action.get();
    }

    public void withInitialized(Runnable action) {
        ensureInitialized.run();
        action.run();
    }
}
