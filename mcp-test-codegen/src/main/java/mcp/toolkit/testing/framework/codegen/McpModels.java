package mcp.toolkit.testing.framework.codegen;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marker annotation whose sole purpose is to trigger {@link McpModelProcessor} during
 * compilation. Place it on a {@code package-info.java} in the package where the MCP model
 * classes should be generated; the processor then writes every model declared in
 * {@code mcp-models.json} into that package.
 */
@Retention(RetentionPolicy.SOURCE)
@Target(ElementType.PACKAGE)
public @interface McpModels {
}
