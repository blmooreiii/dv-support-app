import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  FlatList,
  Linking,
  Platform,

  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import sheltersData from "../data/shelters.sc.json";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { canGetDirections, getCallForAddressNote } from "@/src/utils/validateShelters";
import { quickExit } from "@/src/utils/quickExit";
import { PrivacyCover, usePrivacyCover } from "@/components/PrivacyCover";
import { Colors, Spacing, Radius } from "@/constants/theme";

const C = Colors.light;

type Shelter = {
  id: string;
  name: string;
  city: string;
  state: "SC";
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hotline?: string;
  verified: boolean;
  source: string;
  callForAddress?: boolean;
  callForAddressNote?: string;
  hasPetOptions?: boolean;
};

type ShelterWithDist = Shelter & { distanceMiles?: number };

export default function SheltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lon?: string }>();
  const { privacyCover, setPrivacyCover } = usePrivacyCover();
  const [reported, setReported] = useState<Record<string, boolean>>({});

  const shelters: Shelter[] = useMemo(() => {
    if (!Array.isArray(sheltersData)) return [];
    return (sheltersData as any[]).flat();
  }, []);

  const toRad = (v: number) => (v * Math.PI) / 180;

  const calcDistance = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ) => {
    const [lat1, lon1, lat2, lon2] = [Number(a.latitude), Number(a.longitude), Number(b.latitude), Number(b.longitude)];
    if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return NaN;
    const R = 3958.8;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
  };

  const userCoords = useMemo(() => {
    const lat = Number(params.lat), lon = Number(params.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { latitude: lat, longitude: lon };
  }, [params.lat, params.lon]);

  const list: ShelterWithDist[] = useMemo(() => {
    const base = shelters.filter((s) =>
      Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude)) && !!s.name
    );
    if (!userCoords) return base.sort((a, b) => a.name.localeCompare(b.name));
    return base
      .map((s) => ({ ...s, distanceMiles: calcDistance(userCoords, s) }))
      .sort((a, b) => {
        if (!Number.isFinite(a.distanceMiles)) return 1;
        if (!Number.isFinite(b.distanceMiles)) return -1;
        return (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0);
      });
  }, [shelters, userCoords]);

  const openMaps = async (s: Shelter) => {
    const url = Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${s.latitude},${s.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
      else Alert.alert("Error", "Could not open Maps app.");
    } catch {
      Alert.alert("Error", "Could not open Maps app.");
    }
  };

  const renderItem = ({ item }: { item: ShelterWithDist }) => {
    const callOnly = !canGetDirections(item);
    const phone = item.phone ?? item.hotline;
    const hasReported = reported[item.id] ?? false;

    return (
      <View style={styles.card}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Location + distance */}
        <View style={styles.cardMeta}>
          <Text style={styles.metaCity}>{item.city}, {item.state}</Text>
          {Number.isFinite(item.distanceMiles) && (
            <Text style={styles.metaDist}>
              {callOnly ? "~" : ""}{(item.distanceMiles as number).toFixed(1)} mi
            </Text>
          )}
        </View>

        {/* Pet friendly tag */}
        {item.hasPetOptions && (
          <View style={styles.petTag}>
            <Text style={styles.petTagText}>🐾 Pet friendly</Text>
          </View>
        )}

        {/* Action — directions or call card */}
        <View style={styles.actionRow}>
          {callOnly ? (
            <View style={styles.callCard}>
              <View style={styles.callIconRow}>
                <View style={styles.callIconBox}><Text style={{ fontSize: 15 }}>📞</Text></View>
                <Text style={styles.callTitle}>Call for location</Text>
              </View>
              <Text style={styles.callNote}>{getCallForAddressNote(item)}</Text>
              {phone && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${phone.replace(/\D/g, "")}`)}
                  style={styles.callBtn}
                  accessibilityLabel={`Call ${phone}`}
                >
                  <Text style={styles.callBtnText}>{phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => openMaps(item)}
              style={styles.directionsBtn}
              accessibilityLabel={`Get directions to ${item.name}`}
            >
              <Text style={styles.directionsBtnText}>Directions</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Report issue */}
        <TouchableOpacity
          onPress={() => setReported(prev => ({ ...prev, [item.id]: true }))}
          style={styles.reportRow}
          accessibilityLabel="Report an issue with this listing"
        >
          <Text style={hasReported ? styles.reportedText : styles.reportLink}>
            {hasReported ? "✓ Issue reported — thank you" : "Report an issue with this listing"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => quickExit(setPrivacyCover)}
          accessibilityLabel="Quick Exit"
          style={styles.quickExit}
        >
          <View style={styles.quickExitDot} />
          <Text style={styles.quickExitText}>Quick Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pageTitle}>
        <Text style={styles.headline}>Other Shelters</Text>
        <Text style={styles.subhead}>Browse options and choose what feels safest.</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <PrivacyCover visible={privacyCover} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xxl, paddingTop: Platform.OS === 'android' ? Spacing.xxl : Spacing.lg, paddingBottom: Spacing.md },
  backBtn: { paddingVertical: 6 },
  backText: { fontFamily: "DMSans_600SemiBold", fontSize: 15, color: C.primary },
  quickExit: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: C.exitRed },
  quickExitDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: C.exitRed },
  quickExitText: { fontFamily: "DMSans_600SemiBold", fontSize: 13, color: C.exitRed },

  pageTitle: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.md },
  headline: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 26, color: C.textPrimary, letterSpacing: -0.4, marginBottom: 4 },
  subhead: { fontFamily: "DMSans_300Light", fontSize: 14, color: C.textMuted, lineHeight: 20 },

  list: { paddingHorizontal: Spacing.xxl, paddingBottom: 100 },

  // Card
  card: { backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.cardBorder, marginBottom: Spacing.md, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: Spacing.md, padding: Spacing.lg, paddingBottom: Spacing.sm },
  cardName: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 16, color: C.textPrimary, lineHeight: 22, flex: 1 },
  verifiedBadge: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: Radius.pill, borderWidth: 1, borderColor: C.verified, backgroundColor: C.verifiedBg, flexShrink: 0 },
  verifiedText: { fontFamily: "DMSans_600SemiBold", fontSize: 11, color: C.verified },

  cardMeta: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  metaCity: { fontFamily: "DMSans_400Regular", fontSize: 13, color: C.textSecondary },
  metaDist: { fontFamily: "DMSans_500Medium", fontSize: 13, color: C.textMuted },

  petTag: { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, alignSelf: "flex-start", paddingVertical: 3, paddingHorizontal: 10, borderRadius: Radius.pill, backgroundColor: C.primaryLight },
  petTagText: { fontFamily: "DMSans_500Medium", fontSize: 11, color: C.primary },

  actionRow: { padding: Spacing.md, paddingHorizontal: Spacing.lg, borderTopWidth: 1, borderTopColor: C.stone },

  // Directions button
  directionsBtn: { paddingVertical: 12, borderRadius: Radius.sm, backgroundColor: C.primary, alignItems: "center" },
  directionsBtnText: { fontFamily: "DMSans_600SemiBold", fontSize: 14, color: "#fff" },

  // Call card
  callCard: { backgroundColor: C.callBg, borderRadius: Radius.md, borderWidth: 1, borderColor: C.callBorder, padding: Spacing.md },
  callIconRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.sm },
  callIconBox: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.callBorder, alignItems: "center", justifyContent: "center" },
  callTitle: { fontFamily: "DMSans_600SemiBold", fontSize: 14, color: C.callText },
  callNote: { fontFamily: "DMSans_300Light", fontSize: 12, color: C.callText, lineHeight: 18, marginBottom: Spacing.sm },
  callBtn: { padding: Spacing.sm + 2, borderRadius: Radius.sm, backgroundColor: C.callText, alignItems: "center" },
  callBtnText: { fontFamily: "DMSans_600SemiBold", fontSize: 13, color: "#fff" },

  // Report
  reportRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: C.stone, alignItems: "flex-start" },
  reportLink: { fontFamily: "DMSans_300Light", fontSize: 11, color: C.textMuted, textDecorationLine: "underline" },
  reportedText: { fontFamily: "DMSans_400Regular", fontSize: 11, color: C.primary },
});
