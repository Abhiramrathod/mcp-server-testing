# MCP Testing Framework

[![Maven Central](https://img.shields.io/maven-central/v/io.github.abhiramrathod/mcp-test-api.svg)](https://central.sonatype.com/artifact/io.github.abhiramrathod/mcp-test-api)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)

📚 [Documentation](https://abhiramrathod.github.io/mcp-testing/) | 📦 [Maven Central](https://central.sonatype.com/artifact/io.github.abhiramrathod/mcp-test-api) | 🐛 [Issues](https://github.com/Abhiramrathod/mcp-testing/issues) | 💬 [Discussions](https://github.com/Abhiramrathod/mcp-testing/discussions)

A **production-grade** Java testing framework for Model Context Protocol (MCP) servers with type-safe APIs, fluent assertions, and comprehensive monitoring.

## ✨ Features

- 🎯 **Type-Safe API** - Strongly typed domain models, no raw JSON
- 🔗 **Fluent Assertions** - Chainable methods for readable tests
- 🏗️ **Modular Architecture** - Clean separation with 6 specialized modules
- 📊 **Performance Monitoring** - Built-in latency tracking and percentiles
- 🔒 **Complete Abstraction** - Internal details never leak to your code
- 🔧 **Extensible** - Custom transport implementations supported

## 🚀 Quick Start

### Installation

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>io.github.abhiramrathod</groupId>
    <artifactId>mcp-test-api</artifactId>
    <version>1.0.13</version>
    <scope>test</scope>
</dependency>
```

Or Gradle:

```gradle
testImplementation 'io.github.abhiramrathod:mcp-test-api:1.0.13'
```

> **Note:** Only add `mcp-test-api` - all other modules are included transitively.

### Your First Test

```java
import mcp.toolkit.testing.framework.api.*;
import mcp.toolkit.testing.framework.api.model.*;

public class MyMcpTest {
    @Test
    public void testMcpServer() {
        // Connect to MCP server
        McpClient client = McpClient.connectTo("http://localhost:8080")
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(30))
                        .build())
                .initializeOnBuild()
                .build();

        // Test tool invocation
        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "add", "a", 5, "b", 3))
                .assertSuccess()
                .assertTextContains("8");

        // Verify performance
        client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);
        
        client.close();
    }
}
```

## 📖 Documentation

**Full Documentation**: [https://abhiramrathod.github.io/mcp-testing/](https://abhiramrathod.github.io/mcp-testing/)

## ⚙️ Configuration

MCP client configuration is available via `McpClientConfig`. Key options:

- `timeout` (Duration) — request timeout applied to connections and RPC calls. Default: 10 seconds (`McpClientConfig.DEFAULT_TIMEOUT`).
- `protocolVersion` (String) — MCP protocol version advertised during initialize handshake. Default: `2024-11-05` (`McpClientConfig.DEFAULT_PROTOCOL_VERSION`).
- SSE path — the default Server-Sent Events endpoint path is `/sse` (`McpClientConfig.DEFAULT_SSE_PATH`).

Create a config with the fluent builder:

```java
McpClientConfig config = McpClientConfig.builder()
        .timeout(Duration.ofSeconds(30))
        .protocolVersion("2024-11-05")
        .build();
```

Pass it to the client with `.config(config)` when building the `McpClient`.

## 🧰 Build, tests and Javadocs

Build the multi-module project with Maven (from repo root):

```bash
mvn -T 1C clean install
```

Run tests for examples module (example tests use JUnit 5):

```bash
mvn -pl mcp-test-examples test
```

Generate Javadocs (the build is configured to attach javadocs during release builds):

```bash
mvn javadoc:jar
```

Publishing notes:
- The project previously included a `distributionManagement` entry for GitHub Packages in `pom.xml`; builds on CI may be configured to publish artifacts to GitHub Packages or other registries (JitPack is also a common distribution option). See CI workflow for publishing configuration.


## 🎯 Core Capabilities

### Tools Testing
```java
List<McpTool> tools = client.tools().listTools();
McpToolResult result = client.tools().callTool("my-tool", args).assertSuccess();
```

### Resources Testing
```java
List<McpResource> resources = client.resources().listResources();
McpResourceContent content = client.resources().readResource("file://data.txt");
```

### Prompts Testing
```java
List<McpPrompt> prompts = client.prompts().listPrompts();
McpPromptResult prompt = client.prompts().getPrompt("translate", args);
```

### Performance Monitoring
```java
client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);
long p99 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 99);
```

## 🏗️ Architecture

```
mcp-test-api (Public)
  └── mcp-test-client (Internal)
        └── mcp-test-transport (SSE)
              ├── mcp-test-interfaces
              └── mcp-test-core
```

**Design Principle:** Users only import `mcp-test-api`. All internal modules are abstracted away.

## 📦 Modules

| Module | Purpose | Visibility |
|--------|---------|-----------|
| `mcp-test-api` | Public-facing API | **Import this** |
| `mcp-test-client` | Internal RPC implementation | Internal |
| `mcp-test-transport` | SSE transport layer | Internal |
| `mcp-test-interfaces` | Core interfaces | Internal |
| `mcp-test-core` | Shared utilities | Internal |
| `mcp-test-examples` | Usage examples | Reference |

## 💡 Examples

Check out complete examples in the [`mcp-test-examples`](mcp-test-examples/src/test/java/mcp/toolkit/testing/examples) module:

- [BasicClientTest](mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/BasicClientTest.java) - Client initialization
- [ToolsClientTest](mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ToolsClientTest.java) - Tool testing
- [ResourcesClientTest](mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ResourcesClientTest.java) - Resource testing
- [PromptsClientTest](mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/PromptsClientTest.java) - Prompt testing
- [ExchangeTrackingTest](mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ExchangeTrackingTest.java) - Performance monitoring
- [ComprehensiveIntegrationTest](mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ComprehensiveIntegrationTest.java) - Full integration

## 🔧 Requirements

- Java 17 or higher
- Maven 3.6+ or Gradle 7+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Licensed under the [Apache License 2.0](LICENSE).

---

**Built with ❤️ for the developer community**
