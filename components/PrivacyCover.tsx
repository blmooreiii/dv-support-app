/**
 * PrivacyCover.tsx
 *
 * Shared full-screen overlay rendered when the app enters background or
 * inactive state. Prevents app content from appearing in the iOS/Android
 * app switcher.
 *
 * Milestone 1 (v0.3) requirement: Must display consistently across ALL screens.
 * This is the single source of truth — do not recreate inline per screen.
 *
 * Usage:
 *   import { PrivacyCover } from "@/components/PrivacyCover";
 *   import { usePrivacyCover } from "@/components/PrivacyCover";
 *
 *   export default function MyScreen() {
 *     const { privacyCover, setPrivacyCover } = usePrivacyCover();
 *     return (
 *       <SafeAreaView style={{ flex: 1 }}>
 *         ...your screen content...
 *         <PrivacyCover visible={privacyCover} />
 *       </SafeAreaView>
 *     );
 *   }
 */

import React, { useEffect, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Manages privacy cover visibility based on AppState changes.
 * Import this hook into any screen that needs privacy protection.
 */
export function usePrivacyCover() {
  const [privacyCover, setPrivacyCover] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "inactive" || state === "background") {
        setPrivacyCover(true);
      }
      if (state === "active") {
        // Small delay ensures the cover doesn't flash on fast foreground returns
        setTimeout(() => setPrivacyCover(false), 150);
      }
    });

    return () => sub.remove();
  }, []);

  return { privacyCover, setPrivacyCover };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PrivacyCoverProps {
  visible: boolean;
  /**
   * Override the message shown on the cover.
   * Default is intentionally vague — do not change to anything app-specific.
   */
  message?: string;
}

export function PrivacyCover({
  visible,
  message = "One moment…",
}: PrivacyCoverProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    // Must cover the entire screen including safe areas
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    // Both are needed: zIndex for iOS stacking, elevation for Android
    zIndex: 9999,
    elevation: 9999,
  },
  message: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
});
