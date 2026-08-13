package mcp.toolkit.testing.framework.core.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class McpProtocolVersionsTest {

    @Test
    void classifiesLegacyRevisionsAsSessionEra() {
        for (String version : new String[]{
                McpProtocolVersions.V2024_11_05,
                McpProtocolVersions.V2025_03_26,
                McpProtocolVersions.V2025_06_18,
                McpProtocolVersions.V2025_11_25}) {
            assertFalse(McpProtocolVersions.isStateless(version), version);
            assertTrue(McpProtocolVersions.isLegacy(version), version);
            assertEquals(McpProtocolVersions.Era.LEGACY_SESSION, McpProtocolVersions.eraOf(version), version);
        }
    }

    @Test
    void classifiesStatelessRevisionsAsStatelessEra() {
        for (String version : new String[]{
                McpProtocolVersions.V2026_07_28,
                McpProtocolVersions.LATEST,
                "2099-01-01"}) {
            assertTrue(McpProtocolVersions.isStateless(version), version);
            assertFalse(McpProtocolVersions.isLegacy(version), version);
            assertEquals(McpProtocolVersions.Era.STATELESS, McpProtocolVersions.eraOf(version), version);
        }
    }

    @Test
    void treatsNullOrUnknownAsLegacy() {
        assertTrue(McpProtocolVersions.isLegacy(null));
        assertFalse(McpProtocolVersions.isStateless(null));
        assertEquals(McpProtocolVersions.Era.LEGACY_SESSION, McpProtocolVersions.eraOf("bogus"));
    }

    @Test
    void latestForRespectsEra() {
        assertEquals(McpProtocolVersions.LEGACY_LATEST,
                McpProtocolVersions.latestFor(McpProtocolVersions.V2024_11_05));
        assertEquals(McpProtocolVersions.LATEST,
                McpProtocolVersions.latestFor(McpProtocolVersions.V2026_07_28));
        assertEquals(McpProtocolVersions.LEGACY_LATEST, McpProtocolVersions.latestFor(null));
    }
}
