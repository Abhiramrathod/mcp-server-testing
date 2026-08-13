import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'Every JSON-RPC round-trip is recorded by the client’s exchange tracker. Use `client.exchanges()` to inspect counts, latencies, and percentiles — and to enforce performance budgets in your tests.' },
  { t: 'h2', id: 'recording', md: 'What gets recorded' },
  {
    t: 'list',
    items: [
      'Every request/response pair, keyed by method and request id.',
      'Duration in nanoseconds (exposed as milliseconds).',
      'Outcome — SUCCESS, ERROR, or TIMEOUT.',
      'Server error code and message when applicable.',
    ],
  },
  { t: 'h2', id: 'inspecting', md: 'Inspecting exchanges' },
  {
    t: 'code', lang: 'java',
    code: `McpExchangeSummary summary = client.exchanges().summary();
assertTrue(summary.count() >= 1);

summary.byMethod("tools/call").forEach(ex ->
        System.out.printf("duration=%dms status=%s%n",
                ex.durationMillis(), ex.status()));`,
  },
  { t: 'h2', id: 'latency-budgets', md: 'Enforcing latency budgets' },
  { t: 'p', md: 'Use the summary’s latency aggregates to keep your server honest under test:' },
  {
    t: 'code', lang: 'java',
    code: `import static mcp.toolkit.testing.api.assertions.McpExchangeAssertions.*;

// The framework's built-in assertions
assertTotalExchanges(client, 3);
assertRequestSucceeded(client, "tools/call");
assertLastExchangeDurationLessThan(client, Duration.ofMillis(500));

// Or check aggregates directly
McpExchangeSummary s = client.exchanges().summary();
assertTrue(s.avgDurationMillis("tools/call") < 300);
assertTrue(s.maxDurationMillis() < 1000);`,
  },
  { t: 'h2', id: 'percentiles', md: 'Percentiles' },
  {
    t: 'code', lang: 'java',
    code: `double p95 = client.exchanges().summary()
        .percentileDurationMillis(95.0);

assertTrue(p95 < 800, "p95 call latency exceeded budget");`,
  },
  { t: 'h2', id: 'timeouts', md: 'Timeout behavior' },
  {
    t: 'callout', kind: 'note',
    md: 'When a request exceeds the configured timeout, the client fails the exchange with a **TIMEOUT** status (visible in the summary) rather than hanging. Configure per-client via `McpClientConfig.timeout()` — the default is 10 seconds.',
  },
  { t: 'h2', id: 'tips', md: 'Performance testing tips' },
  {
    t: 'list',
    items: [
      'Use a **fresh client per test** so exchange counts start at zero.',
      'Budget on **percentiles**, not averages — a single slow call skews the mean.',
      'Watch for **TIMEOUT** exchanges — they indicate a hung server, not a slow one.',
      'For load tests, run multiple test classes in parallel against the same server. The bundled `DummyMcpServer` uses a bounded thread pool, so it will surface real concurrency issues.',
    ],
  },
]

export default function PerformancePage() {
  return <DocLayout page={{
    meta: {
      path: '/performance',
      title: 'Performance & Exchange Tracking',
      description: 'Latency budgets, exchange summaries, percentiles, and timeout behavior.',
      section: 'Guides',
      keywords: ['performance', 'latency', 'exchanges', 'timeout', 'percentiles'],
      editPath: 'docs-site/src/pages/Performance.tsx',
    },
    blocks,
  }} />
}
