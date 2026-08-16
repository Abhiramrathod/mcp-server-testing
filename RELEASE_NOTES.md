# Release Notes — 0.0.1-SNAPSHOT

> Published: 2026-08-13

## New Features

### Support for the latest Model Context Protocol
The framework now supports the newest Model Context Protocol specification
(protocol version 2025-03-26 and later) through the new Streamable HTTP
transport:

- **Single-endpoint messaging** — each JSON-RPC message is sent as its own
  POST to one MCP endpoint.
- **Both response styles handled automatically** — the server may answer with a
  single JSON object or an SSE stream scoped to the request; both are supported
  transparently.
- **Automatic session management** — the session ID assigned by the server
  during initialization is honored, and the framework transparently
  re-initializes the session if the server terminates it (e.g. HTTP 404), so
  long-running tests keep working without manual reconnects.
- **Server-initiated messages** — requests and notifications from the server
  (e.g. `roots/list`, `sampling/createMessage`, `notifications/message`,
  `notifications/progress`) are delivered to listeners registered by your test.
- **Optional streaming connection** — a stream can be opened to receive
  server messages in real time.
- **Legacy protocol still fully supported** — the HTTP+SSE transport for
  protocol version 2024-11-05 remains available, so servers implementing either
  version of the protocol can be tested.

### Unified transport layer
- **One API for every server** — test code interacts with an MCP server through
  a single gateway interface, and the framework selects the right transport
  automatically based on the server's protocol.
- **Complete operation coverage** — connection lifecycle (connect/close),
  JSON-RPC requests and notifications, server-message listeners, and
  session-expiry handling are all exposed through one consistent interface.
- **Functional call style** — operations are exposed as functional interfaces
  (`apply`, `accept`, `run`), letting you wire up test behavior directly without
  touching transport internals.
