# Release Notes — 2026-08-16

## Contributors

- **Abhiram** — [abhiramrathod2003@gmail.com](mailto:abhiramrathod2003@gmail.com).

## Highlights

- **Optional HTTP proxy support** for both transports, so tests can run behind corporate proxy-enforcing networks.
- **Cleaner SSE event decoding** for keep-alive comments.
- **Netty upgraded to `4.1.137.Final`** (OWASP dependency-check clean).

## New Features

### HTTP proxy support for transport connections
Both the Netty and JDK transports can now route traffic through an HTTP proxy:

- **Opt-in by design** — set `McpClientConfig.builder().proxy(...)`; omit it (or pass
  `null`) and both transports connect directly, preserving the existing behavior.
- **`Proxy.Type.HTTP` only** — `SOCKS` and `NO_PROXY` throw `IllegalArgumentException`.
- **Netty transport** tunnels through the proxy with `HttpProxyHandler` (CONNECT),
  wired first in the pipeline before SSL and the HTTP codec.
- **JDK transport** uses `ProxySelector.of(...)`; `http://` targets use absolute-form
  requests while `https://` targets use CONNECT. A `null` proxy falls back to the
  JVM default `ProxySelector` (system-property driven).


### Heartbeat mechanism for SSE clients
Improved connection management:

- `SseEventDecoder` no longer carries dead branches for `:` comments, `id:` and
  `retry:` lines — keep-alive comments now fall through harmlessly.
- Netty bumped to `4.1.137.Final`, documenting the OWASP fixes it bundles
  (CVE-2025-46903 through CVE-2026-59901/59902/59903).
