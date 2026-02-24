import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,

  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import sheltersData from "../../data/shelters.sc.json";
import { useRouter } from "expo-router";
import {
  Shelter,
  validateSheltersRuntime,
  canGetDirections,
  getCallForAddressNote,
} from "@/src/utils/validateShelters";
import { quickExit } from "@/src/utils/quickExit";
import { PrivacyCover, usePrivacyCover } from "@/components/PrivacyCover";
import { Colors, Spacing, Radius, Shadows } from "@/constants/theme";

const C = Colors.light;
const FALLBACK_DISTANCE = 999999;
const GPS_TIMEOUT_MS = 9000;

type UiNotice =
  | { kind: "none" }
  | { kind: "info"; message: string }
  | { kind: "warning"; message: string };

function resolveNotice(params: {
  errorMsg?: string;
  locationDenied: boolean;
  servicesOff: boolean;
  sheltersCount: number;
  allDistancesFallback: boolean;
}): UiNotice {
  if (params.errorMsg) return { kind: "warning", message: params.errorMsg };
  if (params.servicesOff)
    return { kind: "warning", message: "Location Services are off. You can still use Resources & Hotlines." };
  if (params.locationDenied)
    return { kind: "info", message: "Location access is off. You can still browse Resources & Hotlines, or enable location to sort shelters by nearest." };
  if (params.sheltersCount === 0 || params.allDistancesFallback)
    return { kind: "warning", message: "Support listings temporarily unavailable. Please use Resources & Hotlines." };
  return { kind: "none" };
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms)),
  ]);
}

function QuickExitButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel="Quick Exit" style={styles.quickExit}>
      <View style={styles.quickExitDot} />
      <Text style={styles.quickExitText}>Quick Exit</Text>
    </TouchableOpacity>
  );
}

function NoticeBanner({ notice, onRetry, onOpenSettings }: {
  notice: UiNotice;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}) {
  if (notice.kind === "none") return null;
  const warn = notice.kind === "warning";
  return (
    <View style={[styles.notice, warn ? styles.noticeWarn : styles.noticeInfo]}>
      <View style={[styles.noticeDot, warn ? styles.noticeDotWarn : styles.noticeDotInfo]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.noticeText, warn ? styles.noticeTextWarn : styles.noticeTextInfo]}>
          {notice.message}
        </Text>
        {onOpenSettings && (
          <TouchableOpacity onPress={onOpenSettings} style={styles.noticeAction}>
            <Text style={styles.noticeActionText}>Open Settings</Text>
          </TouchableOpacity>
        )}
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.noticeAction}>
            <Text style={styles.noticeActionText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function ShelterCard({ shelter, onDirections, onOtherShelters, onReset }: {
  shelter: Shelter & { distanceMiles: number };
  onDirections: () => void;
  onOtherShelters: () => void;
  onReset: () => void;
}) {
  const callOnly = !canGetDirections(shelter);
  const phone = shelter.phone ?? (shelter as any).hotline;
  return (
    <View style={styles.shelterCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardFoundLabel}>Closest to you</Text>
          <Text style={styles.cardName}>{shelter.name}</Text>
        </View>
        {shelter.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Distance</Text>
          <Text style={styles.metaValue}>{callOnly ? "~" : ""}{shelter.distanceMiles.toFixed(1)} mi</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>City</Text>
          <Text style={styles.metaValue}>{shelter.city}</Text>
        </View>
        {(shelter as any).hasPetOptions !== undefined && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Pet Friendly</Text>
            <Text style={styles.metaValue}>{(shelter as any).hasPetOptions ? "Yes" : "—"}</Text>
          </View>
        )}
      </View>

      {callOnly && (
        <View style={styles.callWrap}>
          <View style={styles.callCard}>
            <View style={styles.callIconRow}>
              <View style={styles.callIconBox}><Text style={{ fontSize: 16 }}>📞</Text></View>
              <Text style={styles.callTitle}>Call for location</Text>
            </View>
            <Text style={styles.callNote}>{getCallForAddressNote(shelter)}</Text>
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
        </View>
      )}

      <View style={styles.cardActions}>
        {!callOnly && (
          <TouchableOpacity onPress={onDirections} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Start Directions</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onOtherShelters}
          style={[styles.btnSecondary, callOnly && { flex: 1 }]}
        >
          <Text style={styles.btnSecondaryText}>Other Shelters</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onReset} style={styles.resetRow}>
        <Text style={styles.resetText}>Start Over</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { privacyCover, setPrivacyCover } = usePrivacyCover();

  const shelters: Shelter[] = useMemo(() => {
    const flattened = (sheltersData as any)?.flat?.() ?? [];
    return validateSheltersRuntime(flattened);
  }, []);

  const [status, setStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedShelter, setSelectedShelter] = useState<(Shelter & { distanceMiles: number }) | null>(null);
  const [servicesOff, setServicesOff] = useState(false);

  const toRad = (v: number) => (v * Math.PI) / 180;

  const distanceMiles = (
    a: { latitude: number; longitude: number } | null,
    b: { latitude: number; longitude: number } | null
  ) => {
    if (!a || !b) return FALLBACK_DISTANCE;
    if (![a.latitude, a.longitude, b.latitude, b.longitude].every(Number.isFinite)) return FALLBACK_DISTANCE;
    const R = 3958.8;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
    const miles = 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
    return Number.isFinite(miles) ? miles : FALLBACK_DISTANCE;
  };

  const isValid = (d: number) => Number.isFinite(d) && d >= 0 && d < FALLBACK_DISTANCE;

  const allDistancesFallback = useMemo(() => {
    if (!coords || shelters.length === 0) return !coords ? false : true;
    return shelters.every((s) => !isValid(distanceMiles(coords, s)));
  }, [coords, shelters]);

  const findClosest = (user: { latitude: number; longitude: number }, list: Shelter[]) => {
    let closest: (Shelter & { distanceMiles: number }) | null = null;
    for (const s of list) {
      const d = distanceMiles(user, s);
      if (!isValid(d)) continue;
      if (!closest || d < closest.distanceMiles) closest = { ...s, distanceMiles: d };
    }
    return closest;
  };

  const requestLocation = async () => {
    try {
      setStatus("requesting"); setErrorMsg(""); setServicesOff(false);
      const existing = await Location.getForegroundPermissionsAsync();
      let perm = existing.status;
      if (perm !== "granted") perm = (await Location.requestForegroundPermissionsAsync()).status;
      if (perm !== "granted") { setStatus("denied"); return; }
      if (!(await Location.hasServicesEnabledAsync())) { setServicesOff(true); setStatus("error"); return; }

      let lat: number | null = null, lon: number | null = null;
      try {
        const cur = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), GPS_TIMEOUT_MS);
        lat = Number(cur.coords.latitude); lon = Number(cur.coords.longitude);
      } catch (e: any) {
        const last = await Location.getLastKnownPositionAsync();
        if (last?.coords) { lat = Number(last.coords.latitude); lon = Number(last.coords.longitude); }
        else {
          setStatus("error");
          setErrorMsg(e?.message === "TIMEOUT" ? "Location is taking too long. Try moving near a window, then retry." : "Unable to get your location. Please try again.");
          return;
        }
      }

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) { setStatus("error"); setErrorMsg("Invalid location data received."); return; }
      const user = { latitude: lat!, longitude: lon! };
      setCoords(user);
      if (shelters.length === 0) { setStatus("error"); return; }
      const closest = findClosest(user, shelters);
      if (!closest) { setStatus("error"); return; }
      setSelectedShelter(closest);
      setStatus("granted");
    } catch (e: any) {
      setStatus("error"); setErrorMsg(e?.message ?? "Error accessing location.");
    }
  };

  const resetHome = () => {
    setStatus("idle"); setCoords(null); setErrorMsg("");
    setServicesOff(false); setSelectedShelter(null);
  };

  const openMaps = async (dest: { latitude: number; longitude: number }) => {
    const url = Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${dest.latitude},${dest.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) await Linking.openURL(url);
    else Alert.alert("Error", "Could not open Maps app.");
  };

  const notice = resolveNotice({
    errorMsg: status === "error" ? errorMsg : undefined,
    locationDenied: status === "denied",
    servicesOff,
    sheltersCount: shelters.length,
    allDistancesFallback: Boolean(coords) && allDistancesFallback,
  });

  const showCard = status === "granted" && selectedShelter && isValid(selectedShelter.distanceMiles);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.appName}>Bastet</Text>
          <QuickExitButton onPress={() => quickExit(setPrivacyCover, resetHome)} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>You are safe here</Text>
          <Text style={styles.heroHeadline}>We believe you.</Text>
          <Text style={styles.heroSub}>
            Let us help you get the support you need. No judgement.
          </Text>
        </View>

        <NoticeBanner
          notice={notice}
          onRetry={status === "error" ? requestLocation : undefined}
          onOpenSettings={status === "denied" ? () => Linking.openSettings() : undefined}
        />

        {status === "requesting" ? (
          <View style={styles.spinner}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.spinnerText}>Finding nearest shelter…</Text>
          </View>
        ) : !showCard ? (
          <TouchableOpacity onPress={requestLocation} style={styles.ctaBtn} accessibilityLabel="Find help near me">
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaLabel}>Find Help Now</Text>
              <Text style={styles.ctaSub}>Uses your location once, not stored</Text>
            </View>
            <View style={styles.ctaArrow}>
              <View style={styles.ctaArrowIcon} />
            </View>
          </TouchableOpacity>
        ) : null}

        {showCard && selectedShelter && (
          <ShelterCard
            shelter={selectedShelter}
            onDirections={() => openMaps(selectedShelter)}
            onOtherShelters={() => router.push({ pathname: "/shelters", params: { lat: coords?.latitude?.toString() ?? "", lon: coords?.longitude?.toString() ?? "" } })}
            onReset={resetHome}
          />
        )}

        {!showCard && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/explore")}
          style={[styles.resourcesBtn, showCard && { marginTop: Spacing.lg }]}
          accessibilityLabel="Resources and hotlines"
        >
          <View style={styles.resourcesLeft}>
            <View style={styles.resourcesIcon}>
              <Text style={{ fontSize: 18 }}>🔑</Text>
            </View>
            <View>
              <Text style={styles.resourcesLabel}>Resources & Hotlines</Text>
              <Text style={styles.resourcesSub}>Hotlines, safety planning, legal help</Text>
            </View>
          </View>
          <Text style={{ color: C.textMuted, fontSize: 20 }}>›</Text>
        </TouchableOpacity>

      </ScrollView>
      <PrivacyCover visible={privacyCover} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  scroll: { paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xxl, paddingTop: Platform.OS === 'android' ? Spacing.xxl : Spacing.lg, paddingBottom: Spacing.md },
  appName: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 20, color: C.textPrimary, letterSpacing: -0.3 },
  quickExit: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: C.exitRed },
  quickExitDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: C.exitRed },
  quickExitText: { fontFamily: "DMSans_600SemiBold", fontSize: 13, color: C.exitRed },
  hero: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.sm, paddingBottom: Spacing.xl },
  heroEyebrow: { fontFamily: "DMSans_500Medium", fontSize: 12, color: C.primary, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: Spacing.sm },
  heroHeadline: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 32, color: C.textPrimary, lineHeight: 38, letterSpacing: -0.5, marginBottom: Spacing.sm },
  heroSub: { fontFamily: "DMSans_300Light", fontSize: 16, color: C.textSecondary, lineHeight: 24 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, marginHorizontal: Spacing.xxl, marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  noticeWarn: { backgroundColor: "#FEF4F3", borderColor: "#F0BFBB" },
  noticeInfo: { backgroundColor: "#EEF4FB", borderColor: "#C3D9EE" },
  noticeDot: { width: 7, height: 7, borderRadius: 99, marginTop: 5, flexShrink: 0 },
  noticeDotWarn: { backgroundColor: C.exitRed },
  noticeDotInfo: { backgroundColor: C.verified },
  noticeText: { fontFamily: "DMSans_400Regular", fontSize: 13, lineHeight: 19 },
  noticeTextWarn: { color: "#8B2019" },
  noticeTextInfo: { color: "#1A4A7A" },
  noticeAction: { marginTop: Spacing.sm, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.sm, backgroundColor: C.stone, alignSelf: "flex-start" },
  noticeActionText: { fontFamily: "DMSans_600SemiBold", fontSize: 13, color: C.textPrimary },
  ctaBtn: { marginHorizontal: Spacing.xxl, padding: Spacing.xl, backgroundColor: C.primary, borderRadius: Radius.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },  ctaLabel: { fontFamily: "DMSans_600SemiBold", fontSize: 18, color: "#fff", letterSpacing: -0.2 },
  ctaSub: { fontFamily: "DMSans_300Light", fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 3 },
  ctaArrow: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.26)", alignItems: "center", justifyContent: "center" },
  ctaArrowIcon: { width: 10, height: 10, borderTopWidth: 2, borderRightWidth: 2, borderColor: "#fff", transform: [{ rotate: "45deg" }, { translateX: -2 }] },
  spinner: { alignItems: "center", paddingVertical: 40 },
  spinnerText: { fontFamily: "DMSans_400Regular", fontSize: 15, color: C.textSecondary, marginTop: Spacing.md },
  shelterCard: { marginHorizontal: Spacing.xxl, backgroundColor: C.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: C.cardBorder, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: C.stone, gap: Spacing.md },
  cardFoundLabel: { fontFamily: "DMSans_600SemiBold", fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: C.primary, marginBottom: 4 },
  cardName: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 18, color: C.textPrimary, lineHeight: 24 },
  verifiedBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.pill, borderWidth: 1, borderColor: C.verified, backgroundColor: C.verifiedBg, flexShrink: 0 },
  verifiedText: { fontFamily: "DMSans_600SemiBold", fontSize: 11, color: C.verified },
  cardMeta: { flexDirection: "row", gap: Spacing.xl, padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: C.stone },
  metaItem: { gap: 2 },
  metaLabel: { fontFamily: "DMSans_500Medium", fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.4 },
  metaValue: { fontFamily: "DMSans_500Medium", fontSize: 14, color: C.textPrimary },
  callWrap: { padding: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: C.stone },
  callCard: { backgroundColor: C.callBg, borderRadius: Radius.md, borderWidth: 1, borderColor: C.callBorder, padding: Spacing.lg },
  callIconRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.sm },
  callIconBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: C.callBorder, alignItems: "center", justifyContent: "center" },
  callTitle: { fontFamily: "DMSans_600SemiBold", fontSize: 15, color: C.callText },
  callNote: { fontFamily: "DMSans_300Light", fontSize: 13, color: C.callText, lineHeight: 19, marginBottom: Spacing.md },
  callBtn: { padding: Spacing.md, borderRadius: Radius.sm, backgroundColor: C.callText, alignItems: "center" },
  callBtnText: { fontFamily: "DMSans_600SemiBold", fontSize: 14, color: "#fff" },
  cardActions: { flexDirection: "row", gap: Spacing.sm, padding: Spacing.md, paddingHorizontal: Spacing.lg },
  btnPrimary: { flex: 1, paddingVertical: 13, borderRadius: Radius.sm, backgroundColor: C.primary, alignItems: "center" },
  btnPrimaryText: { fontFamily: "DMSans_600SemiBold", fontSize: 14, color: "#fff" },
  btnSecondary: { flex: 1, paddingVertical: 13, borderRadius: Radius.sm, backgroundColor: C.stone, alignItems: "center" },
  btnSecondaryText: { fontFamily: "DMSans_500Medium", fontSize: 14, color: C.textSecondary },
  resetRow: { alignItems: "flex-end", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  resetText: { fontFamily: "DMSans_500Medium", fontSize: 12, color: C.textMuted },
  divider: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginHorizontal: Spacing.xxl, marginVertical: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.cardBorder },
  dividerText: { fontFamily: "DMSans_500Medium", fontSize: 12, color: C.textMuted, letterSpacing: 0.4 },
  resourcesBtn: { marginHorizontal: Spacing.xxl, padding: Spacing.lg, backgroundColor: C.surface, borderWidth: 1, borderColor: C.cardBorder, borderRadius: Radius.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  resourcesLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  resourcesIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" },
  resourcesLabel: { fontFamily: "DMSans_500Medium", fontSize: 15, color: C.textPrimary, marginBottom: 2 },
  resourcesSub: { fontFamily: "DMSans_300Light", fontSize: 12, color: C.textMuted },
});
