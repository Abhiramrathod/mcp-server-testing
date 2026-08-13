import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'Test MCP **resources**: list the resources a server exposes, then read them and assert on their content types and data.' },
  { t: 'h2', id: 'access', md: 'Accessing resources' },
  { t: 'p', md: 'Resources live under `client.resources()`, which returns a `ResourcesClient`.' },
  { t: 'h2', id: 'listing', md: 'Listing resources' },
  {
    t: 'code', lang: 'java',
    code: `List<McpResource> resources = client.resources().listResources();

assertEquals(2, resources.size());
assertTrue(resources.stream()
        .anyMatch(r -> r.uri().equals("file:///logs/app.log")));`,
  },
  { t: 'h2', id: 'reading', md: 'Reading a resource' },
  { t: 'p', md: 'Read by URI. The result exposes the raw content plus helpers for text content:' },
  {
    t: 'code', lang: 'java',
    code: `McpResourceResult result = client.resources()
        .readResource("file:///logs/app.log");

assertTrue(result.isSuccess());
assertEquals("text/plain", result.contentType());
assertTrue(result.text().contains("ERROR"));`,
  },
  { t: 'h2', id: 'assertions', md: 'Assertions' },
  {
    t: 'table',
    headers: ['Method', 'What it asserts'],
    rows: [
      ['.assertSuccess()', 'Read returned isSuccess() == true'],
      ['.assertContentType("text/plain")', 'Content-Type header matches'],
      ['.assertTextContains("…")', 'Text content contains the substring'],
      ['.assertNotNullResult()', 'A content part was returned'],
    ],
  },
  {
    t: 'code', lang: 'java',
    code: `client.resources().readResource("file:///docs/README.md")
        .assertSuccess()
        .assertTextContains("# mcp-test");`,
  },
  { t: 'h2', id: 'templates', md: 'Resource templates' },
  {
    t: 'callout', kind: 'note',
    md: 'Some servers advertise `resourceTemplates` (URI patterns like `file:///{name}`). List them with `listResourceTemplates()` and expand one to a concrete URI before reading.',
  },
  {
    t: 'code', lang: 'java',
    code: `List<McpResourceTemplate> templates =
        client.resources().listResourceTemplates();

String uriTemplate = templates.get(0).uriTemplate(); // e.g. file:///{name}
McpResourceResult result = client.resources()
        .readResource("file:///config.json")
        .assertSuccess();`,
  },
]

export default function ResourcesTestingPage() {
  return <DocLayout page={{
    meta: {
      path: '/resources-testing',
      title: 'Resources Testing',
      description: 'List, read, and assert on MCP resources and resource templates.',
      section: 'Guides',
      keywords: ['resources', 'readResource', 'templates', 'content type'],
      editPath: 'docs-site/src/pages/ResourcesTesting.tsx',
    },
    blocks,
  }} />
}
