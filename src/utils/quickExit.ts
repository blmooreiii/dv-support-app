import { Linking } from "react-native";

const SAFE_EXIT_URL = "https://www.weather.com";

export async function quickExit(
  setPrivacyCover: (value: boolean) => void,
  onBeforeExit?: () => void
): Promise<void> {
  setPrivacyCover(true);
  if (onBeforeExit) onBeforeExit();
  setTimeout(async () => {
    try {
      const canOpen = await Linking.canOpenURL(SAFE_EXIT_URL);
      if (canOpen) await Linking.openURL(SAFE_EXIT_URL);
    } catch {
      // silent fail — privacy cover is already showing
    }
  }, 120);
}
