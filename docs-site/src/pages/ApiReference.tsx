import DocLayout from '../layouts/DocLayout'
import { Blocks } from '../components/Blocks'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'The full public surface of `mcp-test-api`. Everything here is importable from the single `io.github.abhiramrathod:mcp-test-api` artifact.' },
  { t: 'h2', id: 'mcpclient', md: 'McpClient' },
  {
    t: 'table',
    headers: ['Method', 'Returns', 'Description'],
    rows: [
      ['connectTo(String baseUrl)', 'McpClient.Builder', 'Entry point. URL includes scheme + port; paths appended automatically.'],
      ['tools()', 'ToolsClient', 'Tool listing, invocation, assertions.'],
      ['resources()', 'ResourcesClient', 'Resource listing, templates, reading.'],
      ['prompts()', 'PromptsClient', 'Prompt listing and retrieval.'],
      ['serverInfo()', 'McpServerInfo', 'Server name, version, capabilities after initialize.'],
      ['isStateless()', 'boolean', 'True when using the stateless protocol (2026-07-28+).'],
      ['discover()', 'JsonNode', 'server/discover result (stateless only).'],
      ['initialize()', 'void', 'Force the MCP handshake now.'],
      ['exchanges()', 'ExchangeHistory', 'All recorded JSON-RPC exchanges.'],
      ['onServerMessage(Consumer<JsonNode>)', 'void', 'Register a handler for server-initiated messages.'],
      ['setSessionExpiredHandler(Runnable)', 'void', 'Callback when the server terminates the session.'],
      ['close()', 'void', 'Close transport, fail pending requests. Auto-invoked by try-with-resources.'],
    ],
  },
  { t: 'h2', id: 'builder', md: 'McpClient.Builder' },
  {
    t: 'table',
    headers: ['Method', 'Description'],
    rows: [
      ['.config(McpClientConfig)', 'Timeout, protocol version, headers, etc.'],
      ['.sse()', 'Use the SSE transport (GET /sse + POST /message). Default.'],
      ['.sse(String messagePath)', 'SSE with a custom POST /message path.'],
      ['.streamableHttp()', 'Use Streamable HTTP (POST /mcp).'],
      ['.transport(McpTransport)', 'Plug in a custom transport (SPI).'],
      ['.initializeOnBuild()', 'Run the handshake during build(); throws on failure.'],
      ['.build()', 'Create the client (lazy handshake unless initializeOnBuild).'],
    ],
  },
  { t: 'h2', id: 'clients', md: 'Sub-clients' },
  { t: 'h3', id: 'toolsclient', md: 'ToolsClient' },
  { t: 'p', md: '`listTools() : List<McpTool>` · `callTool(String name, Map<String,Object> args) : McpToolResult`' },
  { t: 'h3', id: 'resourcesclient', md: 'ResourcesClient' },
  { t: 'p', md: '`listResources() : List<McpResource>` · `listResourceTemplates() : List<McpResourceTemplate>` · `readResource(String uri) : McpResourceResult`' },
  { t: 'h3', id: 'promptsclient', md: 'PromptsClient' },
  { t: 'p', md: '`listPrompts() : List<McpPrompt>` · `getPrompt(String name, Map<String,Object> args) : McpPromptResult`' },
  { t: 'h2', id: 'models', md: 'Domain models' },
  {
    t: 'table',
    headers: ['Type', 'Notable accessors'],
    rows: [
      ['McpTool', 'name(), description(), inputSchema()'],
      ['McpResource', 'uri(), name(), mimeType(), description()'],
      ['McpResourceTemplate', 'uriTemplate(), name(), mimeType()'],
      ['McpPrompt', 'name(), description(), arguments()'],
      ['McpServerInfo', 'name(), version(), capabilities(), supportsTools()/supportsResources()/supportsPrompts()'],
      ['McpToolResult / McpResourceResult / McpPromptResult', 'isSuccess(), errorMessage(), errorCode(), text()'],
    ],
  },
  { t: 'h2', id: 'assertions', md: 'Assertions' },
  { t: 'h3', id: 'fluent', md: 'Fluent (chainable)' },
  { t: 'p', md: '`.assertSuccess()` · `.assertError()` · `.assertTextContains(s)` · `.assertTextEquals(s)` · `.assertContentCount(n)` · `.assertContentType(s)` · `.assertNotNullResult()`' },
  { t: 'h3', id: 'static', md: 'McpExchangeAssertions (static)' },
  { t: 'p', md: '`assertTotalExchanges(client, n)` · `assertRequestSucceeded(client, method)` · `assertRequestFailed(client, method)` · `assertLastExchangeDurationLessThan(client, d)` · `assertNoTimedOutRequests(client)`' },
  { t: 'h2', id: 'config', md: 'McpClientConfig' },
  {
    t: 'table',
    headers: ['Field', 'Default', 'Description'],
    rows: [
      ['timeout', '10s', 'Request timeout; timeout → TIMEOUT exchange.'],
      ['protocolVersion', '2024-11-05', 'MCP protocol version to negotiate.'],
      ['baseUrl', 'required', 'Server base URL.'],
      ['headers', 'empty', 'Extra HTTP headers per request.'],
    ],
  },
  { t: 'h2', id: 'methods', md: 'McpMethod constants' },
  { t: 'p', md: '`McpMethod.INITIALIZE` · `TOOLS_LIST` · `TOOLS_CALL` · `RESOURCES_LIST` · `RESOURCES_READ` · `PROMPTS_LIST` · `PROMPTS_GET` · `NOTIFICATIONS_INITIALIZED` · `SERVER_DISCOVER` · `SUBSCRIPTIONS_LISTEN` (stateless era)' },
]

export default function ApiReferencePage() {
  const javadocsHref = `${window.location.origin}${window.location.pathname.replace(/\/+$/, '')}/javadoc/apidocs/index.html`
  return <DocLayout page={{
    meta: {
      path: '/api-reference',
      title: 'API Reference',
      description: 'The complete public API: McpClient, builder, sub-clients, models, assertions, config.',
      section: 'Reference',
      keywords: ['api', 'reference', 'mcpclient', 'assertions'],
      editPath: 'docs-site/src/pages/ApiReference.tsx',
    },
    blocks,
    custom: (
      <div className="space-y-6">
        <Blocks blocks={blocks} />
        <div className="rounded-lg p-5" style={{ border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Javadocs</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
            Generated API documentation for every public class in the framework, built from the same sources on every docs deploy.
          </p>
          <a href={javadocsHref} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-semibold no-underline transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
          >
            Open generated Javadocs →
          </a>
        </div>
      </div>
    ),
  }} />
}
