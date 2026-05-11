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

import React, { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Manages privacy cover visibility based on AppState changes.
 * Import this hook into any screen that needs privacy protection.
 *
 * Call suppressNextBackground() before opening an external link (Maps, phone)
 * to skip the cover for that one background/foreground cycle. The cover still
 * appears when the user returns from dormant or the app switcher.
 */
export function usePrivacyCover() {
  const [privacyCover, setPrivacyCover] = useState(false);
  // Set to true before intentionally leaving the app (Maps, phone call) so
  // that one background → active cycle doesn't trigger the cover.
  const suppressRef = useRef(false);

  const suppressNextBackground = () => {
    suppressRef.current = true;
  };

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "inactive" || state === "background") {
        if (suppressRef.current) return;
        setPrivacyCover(true);
      }
      if (state === "active") {
        // Clear the suppress flag once the app is foregrounded again.
        suppressRef.current = false;
        setTimeout(() => setPrivacyCover(false), 150);
      }
    });

    return () => sub.remove();
  }, []);

  return { privacyCover, setPrivacyCover, suppressNextBackground };
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
