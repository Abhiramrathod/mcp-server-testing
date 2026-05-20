# MCP Testing Framework - Multimodule Architecture

A fully abstracted Java testing framework for MCP (Model Context Protocol) servers.

## Module Structure

```
mcpTesting (parent)
├── mcp-test-interfaces    → Core interfaces (McpTransport)
├── mcp-test-core          → Core utilities (JSON codec, validation, constants)
├── mcp-test-transport     → Transport layer (SSE implementation)
├── mcp-test-client        → Internal client implementation (RPC, directories, McpTestClient)
├── mcp-test-api           → Public API (McpClient, typed models, assertions)
└── mcp-test-examples      → Example tests and usage demonstrations
```

### Dependency Graph

```
mcp-test-api
  └── mcp-test-client
        └── mcp-test-transport
              ├── mcp-test-interfaces
              └── mcp-test-core
```

## For Library Users

### Installation from JitPack (No Authentication Required)

**1. Add JitPack repository to your `pom.xml`:**

```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>
```

**2. Add the dependency:**

```xml
<dependency>
    <groupId>com.github.Abhiramrathod</groupId>
    <artifactId>mcp-test-api</artifactId>
    <version>v1.0.1</version> <!-- Use git tag version -->
</dependency>
```

**Note:** JitPack builds from Git tags. Make sure to use tags like `v1.0.1`, `v1.0.2`, etc.

Check available versions at: https://jitpack.io/#Abhiramrathod/mcp-testing

All other modules (`mcp-test-interfaces`, `mcp-test-core`, `mcp-test-transport`, `mcp-test-client`) are transitive dependencies — you never import them directly.

---

### Alternative: Installation from GitHub Packages (Requires Authentication)

**1. Add GitHub Packages repository to your `pom.xml`:**

```xml
<repositories>
    <repository>
        <id>github</id>
        <url>https://maven.pkg.github.com/Abhiramrathod/mcp-testing</url>
    </repository>
</repositories>
```

**2. Add the dependency:**

```xml
<dependency>
    <groupId>org.abhi-ai</groupId>
    <artifactId>mcp-test-api</artifactId>
    <version>1.0.1</version>
</dependency>
```

**3. Configure authentication in `~/.m2/settings.xml`:**

```xml
<settings>
    <servers>
        <server>
            <id>github</id>
            <username>YOUR_GITHUB_USERNAME</username>
            <password>YOUR_GITHUB_TOKEN</password>
        </server>
    </servers>
</settings>
```

Generate a GitHub Personal Access Token with `read:packages` scope at: https://github.com/settings/tokens

## Usage

```java
import mcp.toolkit.testing.framework.api.*;
import mcp.toolkit.testing.framework.api.model.*;

// Build client
McpClient client = McpClient.connectTo("http://localhost:8080")
        .config(McpClientConfig.builder()
                .timeout(Duration.ofSeconds(30))
                .build())
        .initializeOnBuild()
        .build();

// Server info
McpServerInfo info = client.serverInfo();
System.out.println(info.name() + " supports tools: " + info.supportsTools());

// Tools
List<McpTool> tools = client.tools().listTools();
McpToolResult result = client.tools().callTool("my-tool", Map.of("key", "value"))
        .assertSuccess()
        .assertTextContains("expected");

// Resources
McpResourceContent content = client.resources().readResource("file://data.txt")
        .assertNotEmpty()
        .assertTextContains("hello");

// Prompts
McpPromptResult prompt = client.prompts().getPrompt("translate", Map.of("lang", "en"))
        .assertNotEmpty()
        .assertUserTextContains("translate");

// Exchange assertions
client.exchanges().assertLastSucceeded();
client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);
long p99 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 99);
client.exchanges().assertLatencyPercentileBelow(McpMethod.TOOLS_CALL, 99, 1000);

client.close();
```

## Examples

See the `mcp-test-examples` module for comprehensive usage examples with a dummy MCP server:
- `DummyMcpServer` - Simple HTTP-based MCP server for testing
- `BasicClientTest` - Client setup and initialization
- `ToolsClientTest` - Tool discovery and invocation
- `ResourcesClientTest` - Resource listing and reading
- `PromptsClientTest` - Prompt retrieval and inspection
- `ExchangeTrackingTest` - Performance monitoring and assertions
- `ComprehensiveIntegrationTest` - Full integration testing

Run examples:
```bash
# Run all example tests
cd mcp-test-examples
mvn test

# Run dummy server standalone
mvn exec:java -Dexec.mainClass="mcp.toolkit.testing.examples.server.DummyMcpServer"
```

## What's Hidden

Users **never** import or reference:
- `McpTestClient` (internal implementation)
- `McpRpcClient`, `RpcExchange`, `RpcExchangeTracker` (internal RPC layer)
- `McpToolDirectory`, `McpResourceDirectory`, `McpPromptDirectory` (internal facades)
- `McpTransport`, `McpSseTransport` (transport internals)
- `McpJsonCodec`, `McpTestClientConstants`, `McpValidation` (core utilities)

Everything is accessed through:
- `McpClient` — entry point
- `ToolsClient`, `ResourcesClient`, `PromptsClient` — typed domain clients
- `McpExchangeAssertions` — fluent exchange inspection
- Model classes — `McpTool`, `McpToolResult`, `McpResource`, `McpResourceContent`, `McpPrompt`, `McpPromptResult`, `McpServerInfo`, `McpExchangeSummary`
- `McpClientConfig` — configuration
- `McpMethod` — enum for method names

## Build

```bash
# Compile all modules
mvn clean compile

# Run tests
mvn clean verify

# Package all modules
mvn clean package

# Install to local Maven repo
mvn clean install
```

## CI/CD & Publishing

This project uses GitHub Actions for continuous integration and deployment:

- **Automatic versioning**: Semantic versioning with auto-incrementing patch versions (1.0.0 → 1.0.1 → 1.0.2...)
- **Automatic publishing**: Every push to `master`/`main` publishes to GitHub Packages
- **Git tagging**: Each version is automatically tagged (e.g., `v1.0.1`)

View published packages: https://github.com/Abhiramrathod/mcp-testing/packages

See [VERSIONING.md](VERSIONING.md) for version management details.

## Module Details

### mcp-test-interfaces
- **Purpose**: Core interfaces for extensibility
- **Exports**: `McpTransport` (interface)
- **Dependencies**: Jackson only

### mcp-test-core
- **Purpose**: Shared utilities used by all other modules
- **Exports**: `McpJsonCodec`, `McpValidation`, `McpTestClientConstants`
- **Dependencies**: Jackson only

### mcp-test-transport
- **Purpose**: Transport abstraction and SSE implementation
- **Exports**: `McpSseTransport`
- **Dependencies**: `mcp-test-interfaces`, `mcp-test-core`

### mcp-test-client
- **Purpose**: Internal client implementation
- **Exports**: `McpTestClient`, `McpRpcClient`, `RpcExchange`, `RpcExchangeTracker`, `McpToolDirectory`, `McpResourceDirectory`, `McpPromptDirectory`, `McpInitializationGuard`, `McpTestClientUtils`, `BaseMcpComponentTestSetup`
- **Dependencies**: `mcp-test-transport` (transitively includes `mcp-test-core`)
- **Note**: This module is internal — users should not depend on it directly

### mcp-test-api
- **Purpose**: Public-facing API layer
- **Exports**: `McpClient`, `McpClientConfig`, `McpMethod`, `ToolsClient`, `ResourcesClient`, `PromptsClient`, `McpExchangeAssertions`, all model classes
- **Dependencies**: `mcp-test-client` (transitively includes all other modules)
- **Note**: This is the ONLY module users should add as a dependency

### mcp-test-examples
- **Purpose**: Example tests and usage demonstrations
- **Exports**: Example test classes and quick start guide
- **Dependencies**: `mcp-test-api`, JUnit 5
- **Note**: Reference module showing best practices - not for production use

## Design Principles

1. **Separation of concerns** — interfaces in separate module for extensibility
2. **Complete abstraction** — users never see internal implementation details
2. **Typed domain models** — no raw `JsonNode` in public API (`.raw()` available for advanced use)
3. **Fluent assertions** — chainable methods on result objects
4. **Enum-based constants** — `McpMethod` instead of raw strings
5. **Builder pattern** — `McpClient.connectTo(...).config(...).build()`
6. **Lazy initialization** — connection happens on first use unless explicitly initialized
7. **Thread-safe** — all exchange tracking and RPC operations are thread-safe
8. **Zero leakage** — no Jackson, no internal types in public API signatures

## Migration from Old API

```java
// Old (exposed internals)
McpTestClient client = BaseMcpComponentTestSetup.initializeMcpTestClient("http://localhost:8080");
JsonNode raw = client.tools().callTool("my-tool", args);
if (raw.path("isError").asBoolean()) throw new AssertionError(...);

// New (clean abstraction)
McpClient client = McpClient.connectTo("http://localhost:8080")
        .initializeOnBuild()
        .build();
McpToolResult result = client.tools().callTool("my-tool", args)
        .assertSuccess();
```

---

**Users only ever add `mcp-test-api` as a dependency. Everything else is internal.**
