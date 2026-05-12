import { Linking } from "react-native";

const SAFE_EXIT_URL = "https://www.weather.com";

export async function quickExit(onBeforeExit?: () => void): Promise<void> {
  if (onBeforeExit) onBeforeExit();
  try {
    const canOpen = await Linking.canOpenURL(SAFE_EXIT_URL);
    if (canOpen) await Linking.openURL(SAFE_EXIT_URL);
  } catch {
    // silent fail
  }
}
