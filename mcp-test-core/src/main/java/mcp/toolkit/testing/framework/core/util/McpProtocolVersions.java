package mcp.toolkit.testing.framework.core.util;

/**
 * Known MCP protocol revisions and the protocol era they belong to.
 *
 * <p>MCP moved from a session-based, bidirectional protocol (revisions
 * {@code 2024-11-05} through {@code 2025-11-25}) to a stateless,
 * request/response protocol starting with revision {@code 2026-07-28}:
 *
 * <ul>
 *   <li><b>Legacy (session)</b> — requires the {@code initialize} handshake and
 *       {@code notifications/initialized}, tracks a server-minted
 *       {@code Mcp-Session-Id}, and supports {@code ping},
 *       {@code logging/setLevel}, and server-initiated requests.</li>
 *   <li><b>Stateless</b> — no handshake and no session. Every request carries its
 *       protocol version, client capabilities, and client info in {@code _meta},
 *       version negotiation happens via {@code server/discover}, and change
 *       notifications flow over a {@code subscriptions/listen} stream.</li>
 * </ul>
 */
public final class McpProtocolVersions {

    public static final String V2024_11_05 = "2024-11-05";
    public static final String V2025_03_26 = "2025-03-26";
    public static final String V2025_06_18 = "2025-06-18";
    public static final String V2025_11_25 = "2025-11-25";
    public static final String V2026_07_28 = "2026-07-28";

    /** The newest MCP protocol revision supported by this framework. */
    public static final String LATEST = V2026_07_28;

    /** The newest protocol revision that still uses the legacy session model. */
    public static final String LEGACY_LATEST = V2025_11_25;

    /**
     * The protocol era a revision belongs to.
     */
    public enum Era {
        /** Session-based revisions ({@code 2024-11-05} through {@code 2025-11-25}). */
        LEGACY_SESSION,
        /** Stateless revisions ({@code 2026-07-28} and later). */
        STATELESS
    }

    private McpProtocolVersions() {}

    /**
     * Returns the era of the given protocol version.
     *
     * @param protocolVersion protocol version string; may be {@code null}
     * @return the era, never {@code null}
     */
    public static Era eraOf(String protocolVersion) {
        return isStateless(protocolVersion) ? Era.STATELESS : Era.LEGACY_SESSION;
    }

    /**
     * Returns whether the given protocol version belongs to the stateless era
     * ({@code 2026-07-28} and later). Values that do not look like a dated
     * protocol revision (e.g. {@code null} or garbage) are treated as legacy.
     *
     * @param protocolVersion protocol version string; may be {@code null}
     * @return {@code true} for stateless revisions
     */
    public static boolean isStateless(String protocolVersion) {
        if (protocolVersion == null) {
            return false;
        }
        if (!protocolVersion.matches("\\d{4}-\\d{2}-\\d{2}(-.*)?")) {
            return false;
        }
        return protocolVersion.compareTo(V2026_07_28) >= 0;
    }

    /**
     * Returns whether the given protocol version belongs to the legacy session
     * era (any revision before {@code 2026-07-28}).
     *
     * @param protocolVersion protocol version string; may be {@code null}
     * @return {@code true} for legacy revisions
     */
    public static boolean isLegacy(String protocolVersion) {
        return !isStateless(protocolVersion);
    }

    /**
     * Returns the newest protocol version advertised by default for the given
     * era, falling back to the legacy default when the era is unknown.
     *
     * @param protocolVersion protocol version string; may be {@code null}
     * @return the latest version belonging to the same era
     */
    public static String latestFor(String protocolVersion) {
        return isStateless(protocolVersion) ? LATEST : LEGACY_LATEST;
    }
}
