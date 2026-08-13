package mcp.toolkit.testing.framework.codegen;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Build-time generator that reads {@code mcp-models.json} from the processor classpath and
 * writes the framework's MCP model records/enums into the API module's generated sources.
 */
public final class McpModelProcessor extends AbstractProcessor {

    public static final String SCHEMA_RESOURCE = "mcp-models.json";

    @Override
    public SourceVersion getSupportedSourceVersion() {
        return SourceVersion.latestSupported();
    }

    @Override
    public Set<String> getSupportedAnnotationTypes() {
        return Set.of(McpModels.class.getName());
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        if (!roundEnv.processingOver() && !annotations.isEmpty()) {
            generateModels();
        }
        return false;
    }

    private void generateModels() {
        try (InputStream in = McpModelProcessor.class.getClassLoader().getResourceAsStream(SCHEMA_RESOURCE)) {
            if (in == null) {
                throw new IllegalStateException("Resource '" + SCHEMA_RESOURCE + "' not found on processor classpath.");
            }
            JsonNode root = new ObjectMapper().readTree(in);
            String packageName = root.path("packageName").asText();
            for (JsonNode model : root.path("models")) {
                generateModel(packageName, model);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate MCP models from '" + SCHEMA_RESOURCE + "'.", e);
        }
    }

    private void generateModel(String packageName, JsonNode model) throws IOException {
        String name = model.path("name").asText();
        JavaFileObject source = processingEnv.getFiler().createSourceFile(packageName + "." + name);
        try (Writer out = source.openWriter()) {
            out.write(renderModel(packageName, model));
        }
    }

    private String renderModel(String packageName, JsonNode model) {
        String name = model.path("name").asText();
        StringBuilder sb = new StringBuilder();
        sb.append("package ").append(packageName).append(";\n\n");
        for (JsonNode imp : model.path("imports")) {
            sb.append("import ").append(imp.asText()).append(";\n");
        }
        if (model.has("imports")) {
            sb.append('\n');
        }
        sb.append(javadoc(model.path("doc"), 0));
        sb.append("public record ").append(name).append(components(model.path("components"))).append(" {\n");

        if (model.has("compactConstructor")) {
            sb.append("\n    public ").append(name).append(" {\n");
            for (JsonNode line : model.path("compactConstructor")) {
                sb.append("        ").append(line.asText()).append('\n');
            }
            sb.append("    }\n");
        }

        for (JsonNode method : model.path("methods")) {
            sb.append('\n').append(renderMethod(method)).append('\n');
        }

        for (JsonNode nested : model.path("nested")) {
            sb.append('\n').append(renderNested(nested)).append('\n');
        }

        sb.append("}\n");
        return sb.toString();
    }

    private String renderMethod(JsonNode method) {
        StringBuilder sb = new StringBuilder();
        sb.append("    /**\n");
        for (String line : docLines(method.path("doc"))) {
            sb.append("     * ").append(line).append('\n');
        }
        for (JsonNode param : method.path("params")) {
            sb.append("     * @param ").append(param.path("name").asText())
              .append(' ').append(param.path("doc").asText()).append('\n');
        }
        if (method.hasNonNull("returns")) {
            sb.append("     * @return ").append(method.path("returns").asText()).append('\n');
        }
        if (method.hasNonNull("throwsDoc")) {
            sb.append("     * ").append(method.path("throwsDoc").asText()).append('\n');
        }
        sb.append("     */\n");
        sb.append("    public ").append(method.path("returnType").asText())
          .append(' ').append(method.path("name").asText()).append('(')
          .append(params(method.path("params"))).append(") {\n");
        for (JsonNode line : method.path("body")) {
            sb.append("        ").append(line.asText()).append('\n');
        }
        sb.append("    }");
        return sb.toString();
    }

    private String renderNested(JsonNode nested) {
        StringBuilder sb = new StringBuilder();
        sb.append(javadoc(nested.path("doc"), 4));
        String name = nested.path("name").asText();
        if ("enum".equals(nested.path("kind").asText())) {
            List<String> values = new ArrayList<>();
            for (JsonNode value : nested.path("values")) {
                values.add(value.asText());
            }
            sb.append("    public enum ").append(name).append(" { ")
              .append(String.join(", ", values)).append(" }");
        } else {
            sb.append("    public record ").append(name)
              .append(components(nested.path("components"))).append(" {}");
        }
        return sb.toString();
    }

    private String javadoc(JsonNode lines, int indent) {
        String pad = " ".repeat(indent);
        StringBuilder sb = new StringBuilder(pad).append("/**\n");
        for (String line : docLines(lines)) {
            sb.append(pad).append(" * ").append(line).append('\n');
        }
        sb.append(pad).append(" */\n");
        return sb.toString();
    }

    private List<String> docLines(JsonNode doc) {
        List<String> lines = new ArrayList<>();
        if (doc.isTextual()) {
            lines.add(doc.asText());
        } else {
            for (JsonNode line : doc) {
                lines.add(line.asText());
            }
        }
        return lines;
    }

    private String components(JsonNode components) {
        List<String> parts = new ArrayList<>();
        for (JsonNode component : components) {
            parts.add(component.path("type").asText() + " " + component.path("name").asText());
        }
        return "(" + String.join(", ", parts) + ")";
    }

    private String params(JsonNode params) {
        List<String> parts = new ArrayList<>();
        for (JsonNode param : params) {
            parts.add(param.path("type").asText() + " " + param.path("name").asText());
        }
        return String.join(", ", parts);
    }
}
