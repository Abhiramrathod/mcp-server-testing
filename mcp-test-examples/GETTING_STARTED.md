# Getting Started with MCP Testing Framework

This guide will help you start testing MCP servers using the framework.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- A running MCP server (or use the examples with a mock server)

## Step 1: Add Dependency

Add only the `mcp-test-api` dependency to your project:

```xml
<dependency>
    <groupId>org.abhi-ai</groupId>
    <artifactId>mcp-test-api</artifactId>
    <version>1.0-SNAPSHOT</version>
    <scope>test</scope>
</dependency>
```

## Step 2: Create Your First Test

```java
import mcp.toolkit.testing.framework.api.McpClient;
import mcp.toolkit.testing.framework.api.model.McpServerInfo;
import org.junit.jupiter.api.Test;

class MyFirstMcpTest {
    
    @Test
    void testServerConnection() {
        try (McpClient client = McpClient.connectTo("http://localhost:8080")
                .initializeOnBuild()
                .build()) {
            
            McpServerInfo info = client.serverInfo();
            System.out.println("Connected to: " + info.name());
        }
    }
}
```

## Step 3: Test Tools

```java
@Test
void testToolInvocation() {
    try (McpClient client = McpClient.connectTo("http://localhost:8080")
            .initializeOnBuild()
            .build()) {
        
        // List available tools
        List<McpTool> tools = client.tools().listTools();
        
        // Call a tool
        McpToolResult result = client.tools()
                .callTool("calculator", Map.of("operation", "add", "a", 5, "b", 3))
                .assertSuccess()
                .assertTextContains("8");
    }
}
```

## Step 4: Test Resources

```java
@Test
void testResourceReading() {
    try (McpClient client = McpClient.connectTo("http://localhost:8080")
            .initializeOnBuild()
            .build()) {
        
        // List resources
        List<McpResource> resources = client.resources().listResources();
        
        // Read a resource
        McpResourceContent content = client.resources()
                .readResource("file:///data/config.json")
                .assertNotEmpty()
                .assertTextContains("version");
    }
}
```

## Step 5: Test Prompts

```java
@Test
void testPromptRetrieval() {
    try (McpClient client = McpClient.connectTo("http://localhost:8080")
            .initializeOnBuild()
            .build()) {
        
        // List prompts
        List<McpPrompt> prompts = client.prompts().listPrompts();
        
        // Get a prompt
        McpPromptResult result = client.prompts()
                .getPrompt("translate", Map.of("language", "Spanish"))
                .assertNotEmpty()
                .assertUserTextContains("translate");
    }
}
```

## Step 6: Monitor Performance

```java
@Test
void testPerformance() {
    try (McpClient client = McpClient.connectTo("http://localhost:8080")
            .initializeOnBuild()
            .build()) {
        
        // Make multiple calls
        for (int i = 0; i < 10; i++) {
            client.tools().listTools();
        }
        
        // Assert performance
        client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_LIST, 1000);
        
        // Check percentiles
        long p95 = client.exchanges().latencyPercentile(McpMethod.TOOLS_LIST, 95);
        System.out.println("P95 latency: " + p95 + "ms");
    }
}
```

## Configuration Options

### Custom Timeout

```java
McpClient client = McpClient.connectTo("http://localhost:8080")
        .config(McpClientConfig.builder()
                .timeout(Duration.ofSeconds(60))
                .build())
        .build();
```

### Custom SSE Endpoint

```java
McpClient client = McpClient.connectTo("http://localhost:8080")
        .sseEndpoint("/custom-sse")
        .build();
```

### Custom Protocol Version

```java
McpClient client = McpClient.connectTo("http://localhost:8080")
        .config(McpClientConfig.builder()
                .protocolVersion("2024-11-05")
                .build())
        .build();
```

## Best Practices

1. **Use try-with-resources** - Ensures client is properly closed
2. **Initialize once per test class** - Use `@BeforeAll` for shared client
3. **Use fluent assertions** - Chain assertions for cleaner code
4. **Test error cases** - Verify error handling works
5. **Monitor performance** - Use exchange tracking for SLAs
6. **Access raw JSON sparingly** - Use typed models when possible

## Common Patterns

### Shared Client Setup

```java
class MyMcpTests {
    private static McpClient client;
    
    @BeforeAll
    static void setUp() {
        client = McpClient.connectTo("http://localhost:8080")
                .initializeOnBuild()
                .build();
    }
    
    @AfterAll
    static void tearDown() {
        client.close();
    }
    
    @Test
    void test1() { /* use client */ }
    
    @Test
    void test2() { /* use client */ }
}
```

### Error Handling

```java
@Test
void testErrorHandling() {
    McpToolResult result = client.tools().callTool("risky-tool", args);
    
    if (result.isError()) {
        System.err.println("Tool failed: " + result.firstText());
    } else {
        result.assertSuccess();
    }
}
```

### Conditional Testing

```java
@Test
void testConditionally() {
    McpServerInfo info = client.serverInfo();
    
    if (info.supportsTools()) {
        // Test tools
        client.tools().listTools();
    }
    
    if (info.supportsResources()) {
        // Test resources
        client.resources().listResources();
    }
}
```

## Next Steps

- Explore the example tests in this module
- Read the main README for architecture details
- Check the API documentation for all available methods
- Customize tests for your specific MCP server

## Troubleshooting

### Connection Refused
- Ensure your MCP server is running
- Verify the URL and port are correct
- Check firewall settings

### Timeout Errors
- Increase timeout in configuration
- Check server response times
- Verify network connectivity

### Initialization Failures
- Check server logs for errors
- Verify protocol version compatibility
- Ensure SSE endpoint is correct

## Support

For issues or questions:
- Check the examples in this module
- Review the main README
- Examine the API source code
