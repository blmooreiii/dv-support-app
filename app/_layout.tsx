import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { PrivacyCover, usePrivacyCover } from "@/components/PrivacyCover";

export default function RootLayout() {
  const { privacyCover } = usePrivacyCover();

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
      <PrivacyCover visible={privacyCover} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
