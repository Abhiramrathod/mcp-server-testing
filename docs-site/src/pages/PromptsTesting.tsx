import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'Test MCP **prompts**: list the prompts a server offers, inspect their argument schemas, and retrieve a rendered prompt with arguments applied.' },
  { t: 'h2', id: 'access', md: 'Accessing prompts' },
  { t: 'p', md: 'Prompts live under `client.prompts()`, which returns a `PromptsClient`.' },
  { t: 'h2', id: 'listing', md: 'Listing prompts' },
  {
    t: 'code', lang: 'java',
    code: `List<McpPrompt> prompts = client.prompts().listPrompts();

assertEquals(2, prompts.size());
assertTrue(prompts.stream()
        .anyMatch(p -> p.name().equals("translate")));`,
  },
  { t: 'h2', id: 'getting', md: 'Getting a prompt with arguments' },
  {
    t: 'code', lang: 'java',
    code: `McpPromptResult result = client.prompts().getPrompt("translate",
        Map.of("text", "hello world", "target", "es"));

assertTrue(result.isSuccess());
assertTrue(result.text().contains("hola mundo"));
assertEquals(1, result.messages().size());
assertEquals("assistant", result.messages().get(0).role());`,
  },
  { t: 'h2', id: 'assertions', md: 'Assertions' },
  {
    t: 'table',
    headers: ['Method', 'What it asserts'],
    rows: [
      ['.assertSuccess()', 'Retrieval returned isSuccess() == true'],
      ['.assertTextContains("…")', 'Rendered text contains the substring'],
      ['.assertMessageCount(1)', 'Exactly 1 message was rendered'],
      ['.assertRole("user")', 'First message has the given role'],
    ],
  },
  {
    t: 'code', lang: 'java',
    code: `client.prompts().getPrompt("code-review", Map.of("code", "x=1"))
        .assertSuccess()
        .assertTextContains("review")
        .assertMessageCount(1);`,
  },
  { t: 'h2', id: 'missing-arg', md: 'Missing required arguments' },
  {
    t: 'callout', kind: 'warning',
    md: 'The client validates arguments against the prompt’s `inputSchema` before sending — a missing required argument fails fast with a validation error instead of hitting the server.',
  },
]

export default function PromptsTestingPage() {
  return <DocLayout page={{
    meta: {
      path: '/prompts-testing',
      title: 'Prompts Testing',
      description: 'List prompts, apply arguments, and assert on rendered messages.',
      section: 'Guides',
      keywords: ['prompts', 'getPrompt', 'arguments', 'messages'],
      editPath: 'docs-site/src/pages/PromptsTesting.tsx',
    },
    blocks,
  }} />
}
