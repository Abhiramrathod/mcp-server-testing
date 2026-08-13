import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'What is planned for the next release. The latest published version is **1.0.38**; this release is in development and unreleased.' },
  { t: 'h2', id: 'features', md: 'Features' },
  {
    t: 'list',
    items: [
      '**Real-server integration testing** — `RealMcpServerTestBase` boots the bundled `DummyMcpServer` per test class and gives every test a fresh, initialized `McpClient` (or point it at your own server with `-Dmcp.test.server.url`).',
      '**Stateless protocol support** (`2026-07-28`) — `server/discover` for version negotiation, results carry `resultType`/`ttlMs`/`cacheScope`, change notifications flow over `subscriptions/listen`, no `initialize` handshake.',
      '**Bundled `DummyMcpServer`** — SSE transport (`GET /sse` + `POST /message`) serving calculator/greet tools, file resources, and translate/code-review prompts.',
      '**Docs site revamp** — new integration-testing guide, single-dependency Maven/Gradle install, updated module and architecture pages.',
    ],
  },
  { t: 'h2', id: 'breaking', md: 'Breaking' },
  {
    t: 'list',
    items: [
      '**Removed `mcp-test-junit`** — JUnit testkit mode, `@McpServerTest`, `@Transport`, `McpServerExtension`, and `McpTestServer` are gone. Test against the bundled reference server (or your own) with `mcp-test-api` only.',
      '**Removed `ExampleServerFixtures`** — replaced by `RealMcpServerTestBase`.',
    ],
  },
  { t: 'h2', id: 'fix', md: 'Fixes' },
  {
    t: 'list',
    items: [
      'SSE handler no longer pins a fixed thread pool — keep-alive writes detect client disconnects so handler threads are reused, fixing "Timed out waiting for SSE stream" under load.',
    ],
  },
  { t: 'h2', id: 'docs', md: 'Docs' },
  {
    t: 'list',
    items: [
      'Installation: one dependency (`mcp-test-api`), no JUnit testkit mode.',
      'New `/integration-testing` guide with HLD diagram and lifecycle.',
      'Architecture and flow diagrams updated for the removed JUnit layer.',
    ],
  },
  {
    t: 'callout', kind: 'note',
    md: 'Compare against the current published version on GitHub: [v1.0.38...master diff](https://github.com/Abhiramrathod/mcp-testing/compare/v1.0.38...master).',
  },
]

export default function UpcomingReleasePage() {
  return <DocLayout page={{
    meta: {
      path: '/upcoming-release',
      title: 'Upcoming Release',
      description: 'What ships in the next release: stateless protocol, integration-testing overhaul, breaking removals.',
      section: 'Meta',
      keywords: ['release', 'next', 'stateless', 'breaking'],
      editPath: 'docs-site/src/pages/UpcomingRelease.tsx',
    },
    blocks,
  }} />
}
