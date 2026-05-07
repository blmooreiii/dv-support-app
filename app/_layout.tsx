import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { PhotoGalleryCover } from "@/components/PhotoGalleryCover";
import { usePhotoGalleryCover } from "@/hooks/usePhotoGalleryCover";

export default function RootLayout() {
  const { showCover, dismissCover } = usePhotoGalleryCover();

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
      {showCover && <PhotoGalleryCover onDismiss={dismissCover} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
