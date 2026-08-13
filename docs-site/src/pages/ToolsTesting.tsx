import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'Test MCP **tools**: list what the server exposes, inspect their input schemas, call them, and assert on typed results — all against a real server.' },
  { t: 'h2', id: 'access', md: 'Accessing tools' },
  { t: 'p', md: 'Tools live under `client.tools()`, which returns a `ToolsClient`. Every method returns a fluent object so you can chain assertions.' },
  { t: 'h2', id: 'listing', md: 'Listing tools' },
  {
    t: 'code', lang: 'java',
    code: `List<McpTool> tools = client.tools().listTools();

assertEquals(1, tools.size());
assertEquals("calculator", tools.get(0).name());
assertTrue(tools.get(0).description().contains("arithmetic"));
assertEquals("object", tools.get(0).inputSchema().path("type").asText());`,
  },
  { t: 'h2', id: 'calling', md: 'Calling a tool' },
  { t: 'p', md: 'Pass arguments as a `Map<String, Object>` (values may be numbers, booleans, strings, or nested structures). Results are returned as a typed `McpToolResult`:' },
  {
    t: 'code', lang: 'java',
    code: `McpToolResult result = client.tools().callTool("calculator",
        Map.of("operation", "add", "a", 5, "b", 3));

assertTrue(result.isSuccess());
assertEquals("8.0", result.firstText());

// structured results
assertEquals(8.0, result.firstContentValue("result"));`,
  },
  { t: 'h2', id: 'assertions', md: 'Assertions' },
  {
    t: 'table',
    headers: ['Method', 'What it asserts'],
    rows: [
      ['.assertSuccess()', 'Call returned isSuccess() == true'],
      ['.assertError()', 'Call returned an error'],
      ['.assertTextContains("…")', 'Some text content contains the substring'],
      ['.assertTextEquals("…")', 'Some text content equals exactly'],
      ['.assertContentCount(2)', 'Exactly 2 content parts'],
    ],
  },
  {
    t: 'code', lang: 'java',
    code: `client.tools().callTool("greet", Map.of("name", "Ada"))
        .assertSuccess()
        .assertTextContains("Hello, Ada");`,
  },
  { t: 'h2', id: 'missing-tool', md: 'Calling an unknown tool' },
  {
    t: 'callout', kind: 'warning',
    md: 'Calling a tool the server does not expose fails fast with a validation error (the client checks the known tool names before sending). For a server-side error, assert with `.assertError()` and inspect `.errorMessage()` / `.errorCode()`.',
  },
  {
    t: 'code', lang: 'java',
    code: `McpToolResult result = client.tools()
        .callTool("does-not-exist", Map.of());
assertFalse(result.isSuccess());
assertNotNull(result.errorMessage());`,
  },
]

export default function ToolsTestingPage() {
  return <DocLayout page={{
    meta: {
      path: '/tools-testing',
      title: 'Tools Testing',
      description: 'List, inspect, and call MCP tools; assert on typed results.',
      section: 'Guides',
      keywords: ['tools', 'callTool', 'assertions', 'schemas'],
      editPath: 'docs-site/src/pages/ToolsTesting.tsx',
    },
    blocks,
  }} />
}
