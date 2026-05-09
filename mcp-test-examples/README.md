# MCP Test Examples

This module demonstrates how to use the MCP Testing Framework with a dummy MCP server.

## Overview

Includes:
- **DummyMcpServer** - A simple HTTP-based MCP server for testing
- **Test suites** - Comprehensive examples using the dummy server

## Running Tests

```bash
# Run all tests (starts dummy server automatically)
mvn test

# Run specific test
mvn test -Dtest=BasicClientTest
```

## Dummy MCP Server

The `DummyMcpServer` implements:
- **Tools**: `calculator` (add/subtract/multiply/divide), `greet`
- **Resources**: `file:///data/config.json`, `file:///data/readme.txt`
- **Prompts**: `translate`, `code-review`
- **Transport**: SSE at `/sse` endpoint

### Running Standalone

```bash
mvn exec:java -Dexec.mainClass="mcp.toolkit.testing.examples.server.DummyMcpServer"
```

Server starts on `http://localhost:8080`

## Test Classes

### BasicClientTest
Demonstrates basic client setup with dummy server.

**Tests:**
- Client initialization
- Server info retrieval (name, version, protocol)
- Capability checking (tools, resources, prompts)

### ToolsClientTest
Shows tool discovery and invocation.

**Tests:**
- Listing 2 tools (calculator, greet)
- Calculator operations (add, multiply)
- Greeting with custom/default names
- Input schema inspection

### ResourcesClientTest
Demonstrates resource operations.

**Tests:**
- Listing 2 resources (config.json, readme.txt)
- Reading JSON configuration
- Reading text file
- Content item inspection

### PromptsClientTest
Shows prompt operations.

**Tests:**
- Listing 2 prompts (translate, code-review)
- Getting translate prompt with arguments
- Getting code-review prompt
- Argument validation

### ExchangeTrackingTest
Demonstrates performance monitoring.

**Tests:**
- Exchange history tracking
- Success assertions
- Average latency calculation
- Percentile metrics (P50, P95, P99)
- Method-specific filtering

### ComprehensiveIntegrationTest
Full integration test with ordered execution.

**Tests:**
- Complete workflow testing
- All capabilities verification
- Performance benchmarking
- Raw JSON access

## Running the Tests

### Prerequisites

None! Tests automatically start/stop the dummy server.

### Execute Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=BasicClientTest
```

## Customizing Tests

Each test uses a different port (8080-8085) to avoid conflicts. Modify `DummyMcpServer` to:
- Add new tools/resources/prompts
- Change response data
- Simulate errors
- Test edge cases

## Key Patterns

### Fluent Assertions
```java
client.tools().callTool("calculator", args)
    .assertSuccess()
    .assertTextContains("42");
```

### Resource Management
```java
try (McpClient client = McpClient.connectTo(url).build()) {
    // Use client
} // Automatically closed
```

### Performance Testing
```java
// Make multiple calls
for (int i = 0; i < 100; i++) {
    client.tools().callTool("benchmark", args);
}

// Assert performance
client.exchanges().assertLatencyPercentileBelow(McpMethod.TOOLS_CALL, 95, 1000);
```

### Error Handling
```java
McpToolResult result = client.tools().callTool("risky-operation", args);
if (result.isError()) {
    System.err.println("Operation failed: " + result.firstText());
} else {
    result.assertSuccess().assertTextContains("expected");
}
```

## Best Practices

1. **Use `@BeforeAll/@AfterAll` for server** - Start/stop once per test class
2. **Use different ports** - Avoid conflicts between test classes
3. **Always close clients** - Use `@AfterEach` or try-with-resources
4. **Use fluent assertions** - Chain assertions for cleaner tests
5. **Track performance** - Use exchange assertions for SLAs

## Dependencies

This module only depends on:
- `mcp-test-api` - The public API
- `junit-jupiter` - For test execution

No internal modules are directly referenced.
