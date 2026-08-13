import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'h2', id: 'requirements', md: 'Requirements' },
  {
    t: 'list',
    items: [
      '**Java 17** or newer (Tested on Temurin 17 and 21).',
      '**JUnit 5** for running the tests (Jupiter).',
      'Maven 3.6+ or Gradle 7+ to resolve dependencies.',
    ],
  },
  { t: 'h2', id: 'maven-central', md: 'Install from Maven Central' },
  { t: 'p', md: 'Add a single `test` scope dependency. All other modules (`mcp-test-client`, `mcp-test-core`, `mcp-test-transport`, `mcp-test-interfaces`) are pulled in transitively.' },
  {
    t: 'tabs',
    tabs: [
      { label: 'Maven', lang: 'xml', code: `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>1.5.0</version>
  <scope>test</scope>
</dependency>` },
      { label: 'Gradle', lang: 'gradle', code: `testImplementation 'io.github.abhiramrathod:mcp-test-api:1.5.0'` },
    ],
  },
  {
    t: 'callout', kind: 'tip',
    md: 'Only `mcp-test-api` is part of your compile/test classpath. The client, transport, and core artifacts are transitive — your imports come from `mcp.toolkit.testing.framework.api`.',
  },
  { t: 'h2', id: 'jitpack', md: 'Install from JitPack' },
  { t: 'p', md: 'JitPack builds directly from GitHub tags — useful for unpublished or SNAPSHOT versions.' },
  {
    t: 'tabs',
    tabs: [
      { label: 'Maven', lang: 'xml', code: `<repositories>
  <repository>
    <id>jitpack.io</id>
    <url>https://jitpack.io</url>
  </repository>
</repositories>

<dependency>
  <groupId>com.github.Abhiramrathod</groupId>
  <artifactId>mcp-testing</artifactId>
  <version>1.5.0</version>
  <scope>test</scope>
</dependency>` },
      { label: 'Gradle', lang: 'gradle', code: `repositories { maven { url 'https://jitpack.io' } }

testImplementation 'com.github.Abhiramrathod:mcp-testing:1.5.0'` },
    ],
  },
  { t: 'h2', id: 'build-from-source', md: 'Build from source' },
  {
    t: 'code', lang: 'bash',
    code: `git clone https://github.com/Abhiramrathod/mcp-testing.git
cd mcp-testing
mvn clean install -DskipTests   # installs all 6 modules to your local .m2`,
  },
  {
    t: 'p',
    md: 'After `mvn install`, the artifacts are in your local repository and the Maven Central dependency coordinates work as-is (Maven resolves local artifacts first).',
  },
  { t: 'h2', id: 'versioning', md: 'Versioning & compatibility' },
  {
    t: 'table',
    headers: ['Protocol Version', 'Transport', 'Initialize handshake', 'Stateless'],
    rows: [
      ['2024-11-05', 'SSE', 'Yes', 'No'],
      ['2025-03-26', 'Streamable HTTP', 'Yes', 'No'],
      ['2026-07-28+', 'Streamable HTTP', 'No — uses server/discover', 'Yes'],
    ],
  },
  {
    t: 'p',
    md: 'Set `protocolVersion` via `McpClientConfig.builder().protocolVersion("...")`. The default is `2024-11-05` (legacy, backward compatible). Use `2026-07-28` for the stateless protocol — no `initialize` handshake; version negotiation happens through `server/discover`.',
  },
  {
    t: 'callout', kind: 'warning',
    md: 'The protocol version must be **compatible with your server**. SSE servers typically accept `2024-11-05`; stateless servers expect `2026-07-28` or later.',
  },
  { t: 'h2', id: 'next', md: 'Next steps' },
  {
    t: 'list',
    items: [
      'Try the **Quick Start** example test.',
      'Read **Architecture** to understand the 6 modules.',
      'Explore **API Reference** for the full public surface.',
    ],
  },
]

export default function InstallationPage() {
  return <DocLayout page={{
    meta: {
      path: '/installation',
      title: 'Installation',
      description: 'Add mcp-test to your project — Maven Central, JitPack, or from source.',
      section: 'Getting Started',
      keywords: ['install', 'maven', 'gradle', 'jitpack', 'dependency'],
      editPath: 'docs-site/src/pages/Installation.tsx',
    },
    blocks,
  }} />
}
