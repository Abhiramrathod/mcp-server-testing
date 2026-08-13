import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'Release history for `mcp-test`. Latest published version is **1.0.38**. See [releases](https://github.com/Abhiramrathod/mcp-testing/releases) on GitHub for the authoritative log.' },
  { t: 'h2', id: 'v1.0.38', md: 'v1.0.38' },
  {
    t: 'list',
    items: [
      'Client now sends `Accept: application/json, text/event-stream` on POST /mcp; `Accept: text/event-stream` on GET /sse and GET /mcp.',
      'SSE keep-alive fix: handler threads no longer pinned; client-disconnect detection reuses threads.',
      'Docs: single-dependency installation, integration-testing guide.',
    ],
  },
  { t: 'h2', id: 'v1.0.37', md: 'v1.0.37' },
  {
    t: 'list',
    items: [
      'Streamable HTTP transport: session establishment + termination handling (`setSessionExpiredHandler`).',
      'Added `McpExchangeAssertions` static assertions.',
    ],
  },
  { t: 'h2', id: 'v1.0.36', md: 'v1.0.36' },
  {
    t: 'list',
    items: [
      'Exchange tracker: latency percentiles, per-method summaries.',
      'Validation: missing tool / prompt arguments fail fast client-side.',
    ],
  },
  { t: 'h2', id: 'v1.0.35', md: 'v1.0.35' },
  {
    t: 'list',
    items: [
      'Typed results (`McpToolResult`, `McpResourceResult`, `McpPromptResult`) with fluent assertions.',
    ],
  },
  { t: 'h2', id: 'v1.0.34', md: 'v1.0.34' },
  {
    t: 'list',
    items: [
      'Initial SSE transport, McpClient builder, tools/resources/prompts clients.',
    ],
  },
  {
    t: 'callout', kind: 'note',
    md: 'Versions before 1.0.34 are not listed. Release notes from 1.0.35+ are summarized; check GitHub for exact commit-level detail.',
  },
]

export default function ChangelogPage() {
  return <DocLayout page={{
    meta: {
      path: '/changelog',
      title: 'Changelog',
      description: 'What changed in each release of mcp-test.',
      section: 'Meta',
      keywords: ['changelog', 'releases', 'versions'],
      editPath: 'docs-site/src/pages/Changelog.tsx',
    },
    blocks,
  }} />
}
