/**
 * quickExit.ts
 *
 * Safety-critical shared utility. Single source of truth for Quick Exit behavior.
 * Do NOT duplicate this logic in individual screens.
 *
 * Behavior:
 *   1. Immediately shows a privacy cover (caller's responsibility via setPrivacyCover)
 *   2. Navigates away from the app to a neutral, high-traffic destination
 *
 * Milestone 1 (v0.3) requirement: Quick Exit must behave identically across
 * foreground, background, app-switcher, and reopen states on both iOS and Android.
 */

import { Linking } from "react-native";

const SAFE_EXIT_URL = "https://www.weather.com";

/**
 * @param setPrivacyCover - State setter from the calling screen. Called immediately
 *                          to blank the screen before the browser opens.
 * @param onBeforeExit    - Optional cleanup callback (e.g. reset screen state).
 *                          Called synchronously before the exit URL opens.
 */
export async function quickExit(
  setPrivacyCover: (value: boolean) => void,
  onBeforeExit?: () => void
): Promise<void> {
  // 1. Blank the screen immediately — do this first, always.
  setPrivacyCover(true);

  // 2. Optional caller-provided cleanup (reset form state, selected shelter, etc.)
  if (onBeforeExit) {
    onBeforeExit();
  }

  // 3. Small delay so the privacy cover renders before the OS switches apps.
  //    120ms is the minimum reliable paint window across iOS and Android.
  setTimeout(async () => {
    try {
      const canOpen = await Linking.canOpenURL(SAFE_EXIT_URL);
      if (canOpen) {
        await Linking.openURL(SAFE_EXIT_URL);
      }
    } catch {
      // Silent fail — the privacy cover is already showing.
      // The user is protected even if the URL fails to open.
    }
  }, 120);
}
