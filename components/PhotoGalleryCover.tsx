import React, { useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 6) / 3;

// Realistic-looking thumbnail palette — muted tones that read as photos
const TILE_COLORS = [
  "#C8B8A2", "#A8B4C0", "#B4C4A8", "#C4A8B4",
  "#D4C4A8", "#A8C4C4", "#C4B4A8", "#B8C4B0",
  "#C0A8A8", "#A8B8D4", "#B8D4A8", "#D4A8B8",
  "#BCC4B0", "#A8C0B8", "#C8C0A8", "#B0A8C4",
  "#C4C8B4", "#A8B4A8", "#D0B8A8", "#B4A8C0",
  "#C0C8B8", "#A8C8C0", "#C8B0A8", "#B8C0D0",
];

interface PhotoGalleryCoverProps {
  onDismiss: () => void;
}

export function PhotoGalleryCover({ onDismiss }: PhotoGalleryCoverProps) {
  // Three-finger single tap dismisses the cover.
  // Using runOnJS so the state update fires on the JS thread.
  const unlockGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(600)
        .runOnJS(true)
        .onEnd(() => onDismiss()),
    [onDismiss]
  );

  return (
    <GestureDetector gesture={unlockGesture}>
      <View style={styles.container}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recents</Text>
          <View style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select</Text>
          </View>
        </View>

        {/* ── Photo grid ── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          // Disable scroll interaction so a casual swipe doesn't feel "wrong"
          // compared to a real photo app. Three-finger tap still works.
          scrollEnabled={true}
        >
          {TILE_COLORS.map((color, i) => (
            <View key={i} style={[styles.photoWrapper]}>
              <View style={[styles.photo, { backgroundColor: color }]} />
            </View>
          ))}
        </ScrollView>

        {/* ── Bottom tab bar ── */}
        <View style={styles.bottomBar}>
          <View style={styles.tabItem}>
            <MaterialIcons name="photo-library" size={24} color="#007AFF" />
            <Text style={styles.tabLabel}>Library</Text>
          </View>
          <View style={styles.tabItem}>
            <MaterialIcons name="explore" size={24} color="#8E8E93" />
            <Text style={styles.tabLabelInactive}>For You</Text>
          </View>
          <View style={styles.tabItem}>
            <MaterialIcons name="photo-album" size={24} color="#8E8E93" />
            <Text style={styles.tabLabelInactive}>Albums</Text>
          </View>
          <View style={styles.tabItem}>
            <MaterialIcons name="search" size={24} color="#8E8E93" />
            <Text style={styles.tabLabelInactive}>Search</Text>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 9999,
    elevation: 9999,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 0.5,
    borderBottomColor: "#C6C6C8",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.4,
  },
  selectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectButtonText: {
    fontSize: 17,
    color: "#007AFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  gridContainer: {
    padding: 2,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  photoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    padding: 1,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  bottomBar: {
    height: 82,
    backgroundColor: "#F9F9F9",
    borderTopWidth: 0.5,
    borderTopColor: "#C6C6C8",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: "#007AFF",
  },
  tabLabelInactive: {
    fontSize: 10,
    color: "#8E8E93",
  },
});
