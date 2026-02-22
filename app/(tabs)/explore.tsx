import React, { useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { quickExit } from "@/src/utils/quickExit";
import { PrivacyCover, usePrivacyCover } from "@/components/PrivacyCover";
import { Colors, Spacing, Radius } from "@/constants/theme";

const C = Colors.light;

const open = async (url: string) => {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) return Alert.alert("Unable to open", "No browser available.");
    await Linking.openURL(url);
  } catch {
    Alert.alert("Unable to open", "Please try again.");
  }
};

// ─── Hotlines ─────────────────────────────────────────────────────────────────

const HOTLINES = [
  {
    name: "National DV Hotline",
    number: "1-800-799-7233",
    note: "Call or chat 24/7 — confidential",
    textOption: "Text START to 88788",
  },
  {
    name: "Crisis Text Line",
    number: null,
    note: "Text HOME to 741741",
    textOption: null,
  },
  {
    name: "RAINN Sexual Assault",
    number: "1-800-656-4673",
    note: "24/7 support for sexual violence",
    textOption: null,
  },
  {
    name: "Emergency Services",
    number: "911",
    note: "If you are in immediate danger",
    textOption: null,
  },
];

// ─── Resource sections ────────────────────────────────────────────────────────

type ResourceItem = {
  icon: string;
  title: string;
  subtitle: string;
  action: () => void;
  iconBg: string;
};

const RESOURCES: ResourceItem[] = [
  {
    icon: "🗺",
    title: "Safety Planning",
    subtitle: "Practical steps to prepare when you're ready",
    iconBg: "#F0F7FF",
    action: () => open("https://www.thehotline.org/plan-for-safety/"),
  },
  {
    icon: "🔒",
    title: "Tech Safety & Privacy",
    subtitle: "Secure your phone, browser, and location",
    iconBg: "#F3FEF0",
    action: () => open("https://www.techsafety.org/resources-survivors"),
  },
  {
    icon: "⚖️",
    title: "Legal Help",
    subtitle: "Protection orders, rights, and local legal aid",
    iconBg: "#FFFBF0",
    action: () => open("https://www.womenslaw.org/"),
  },
  {
    icon: "📍",
    title: "Find Local Programs",
    subtitle: "Search services in your area",
    iconBg: C.primaryLight,
    action: () => open("https://www.thehotline.org/get-help/domestic-violence-local-resources/"),
  },
  {
    icon: "🏠",
    title: "Housing & Shelter Resources",
    subtitle: "Emergency housing and transitional support",
    iconBg: "#FEF4F3",
    action: () => open("https://nnedv.org/resources-library/"),
  },
  {
    icon: "💬",
    title: "Online Chat Support",
    subtitle: "Chat privately with a trained advocate",
    iconBg: "#F5F0FF",
    action: () => open("https://www.thehotline.org/get-help/"),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HotlineCard({ hotline }: { hotline: typeof HOTLINES[0] }) {
  return (
    <View style={styles.hotlineCard}>
      <View style={styles.hotlineLeft}>
        <Text style={styles.hotlineName}>{hotline.name}</Text>
        <Text style={styles.hotlineNote}>{hotline.note}</Text>
        {hotline.textOption && (
          <Text style={styles.hotlineTextOpt}>{hotline.textOption}</Text>
        )}
      </View>
      {hotline.number && (
        <TouchableOpacity
          onPress={() => Linking.openURL(`tel:${hotline.number!.replace(/\D/g, "")}`)}
          style={styles.hotlineCallBtn}
          accessibilityLabel={`Call ${hotline.name}`}
        >
          <Text style={styles.hotlineCallText}>{hotline.number}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ResourceRow({ item }: { item: ResourceItem }) {
  return (
    <TouchableOpacity onPress={item.action} style={styles.resourceRow} accessibilityLabel={item.title}>
      <View style={[styles.resourceIcon, { backgroundColor: item.iconBg }]}>
        <Text style={{ fontSize: 18 }}>{item.icon}</Text>
      </View>
      <View style={styles.resourceText}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceSub}>{item.subtitle}</Text>
      </View>
      <Text style={styles.resourceChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SupportScreen() {
  const { privacyCover, setPrivacyCover } = usePrivacyCover();
  const [hotlinesExpanded, setHotlinesExpanded] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>Bastet</Text>
          <TouchableOpacity
            onPress={() => quickExit(setPrivacyCover)}
            accessibilityLabel="Quick Exit"
            style={styles.quickExit}
          >
            <View style={styles.quickExitDot} />
            <Text style={styles.quickExitText}>Quick Exit</Text>
          </TouchableOpacity>
        </View>

        {/* Page title */}
        <View style={styles.titleBlock}>
          <Text style={styles.headline}>Support</Text>
          <Text style={styles.subhead}>
            Browse when it's safe. Exit anytime.
          </Text>
        </View>

        {/* ── Hotlines section ── */}
        <TouchableOpacity
          onPress={() => setHotlinesExpanded((v) => !v)}
          style={styles.sectionHeader}
          accessibilityLabel={hotlinesExpanded ? "Collapse hotlines" : "Expand hotlines"}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIcon, { backgroundColor: "#FEF3F2" }]}>
              <Text style={{ fontSize: 16 }}>📞</Text>
            </View>
            <Text style={styles.sectionTitle}>Hotlines — 24/7</Text>
          </View>
          <Text style={styles.sectionChevron}>{hotlinesExpanded ? "∧" : "∨"}</Text>
        </TouchableOpacity>

        {hotlinesExpanded && (
          <View style={styles.hotlineList}>
            {HOTLINES.map((h) => (
              <HotlineCard key={h.name} hotline={h} />
            ))}
          </View>
        )}

        {/* ── Resources section ── */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>More Resources</Text>

        <View style={styles.resourceList}>
          {RESOURCES.map((r) => (
            <ResourceRow key={r.title} item={r} />
          ))}
        </View>

        {/* Sources footer */}
        <Text style={styles.sources}>
          TheHotline.org · WomensLaw.org · TechSafety.org · NNEDV.org
        </Text>

      </ScrollView>

      <PrivacyCover visible={privacyCover} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  scroll: { paddingBottom: 100 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  appName: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 20, color: C.textPrimary, letterSpacing: -0.3 },
  quickExit: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: C.exitRed },
  quickExitDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: C.exitRed },
  quickExitText: { fontFamily: "DMSans_600SemiBold", fontSize: 13, color: C.exitRed },

  titleBlock: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xl },
  headline: { fontFamily: "PlayfairDisplay_400Regular", fontSize: 28, color: C.textPrimary, letterSpacing: -0.4, marginBottom: 4 },
  subhead: { fontFamily: "DMSans_300Light", fontSize: 14, color: C.textMuted, lineHeight: 20 },

  // Section headers
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: Spacing.xxl, marginBottom: Spacing.md, padding: Spacing.md, backgroundColor: C.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: C.cardBorder },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontFamily: "DMSans_600SemiBold", fontSize: 15, color: C.textPrimary },
  sectionChevron: { fontFamily: "DMSans_500Medium", fontSize: 14, color: C.textMuted },
  sectionDivider: { height: 1, backgroundColor: C.cardBorder, marginHorizontal: Spacing.xxl, marginVertical: Spacing.xl },
  sectionLabel: { fontFamily: "DMSans_600SemiBold", fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: C.textMuted, marginHorizontal: Spacing.xxl, marginBottom: Spacing.md },

  // Hotline cards
  hotlineList: { paddingHorizontal: Spacing.xxl, gap: Spacing.sm, marginBottom: Spacing.sm },
  hotlineCard: { backgroundColor: C.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: C.cardBorder, padding: Spacing.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: Spacing.md },
  hotlineLeft: { flex: 1 },
  hotlineName: { fontFamily: "DMSans_600SemiBold", fontSize: 15, color: C.textPrimary, marginBottom: 2 },
  hotlineNote: { fontFamily: "DMSans_300Light", fontSize: 13, color: C.textSecondary, lineHeight: 18 },
  hotlineTextOpt: { fontFamily: "DMSans_400Regular", fontSize: 12, color: C.primary, marginTop: 3 },
  hotlineCallBtn: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: Radius.sm, backgroundColor: C.primary, alignItems: "center", flexShrink: 0 },
  hotlineCallText: { fontFamily: "DMSans_600SemiBold", fontSize: 13, color: "#fff", letterSpacing: -0.1 },

  // Resource rows
  resourceList: { paddingHorizontal: Spacing.xxl, gap: Spacing.sm },
  resourceRow: { backgroundColor: C.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: C.cardBorder, padding: Spacing.md, paddingHorizontal: Spacing.lg, flexDirection: "row", alignItems: "center", gap: Spacing.md },
  resourceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  resourceText: { flex: 1 },
  resourceTitle: { fontFamily: "DMSans_500Medium", fontSize: 15, color: C.textPrimary, marginBottom: 2 },
  resourceSub: { fontFamily: "DMSans_300Light", fontSize: 12, color: C.textMuted, lineHeight: 17 },
  resourceChevron: { fontFamily: "DMSans_400Regular", fontSize: 20, color: C.textMuted },

  sources: { textAlign: "center", fontFamily: "DMSans_300Light", fontSize: 11, color: C.textMuted, marginTop: Spacing.xl, marginHorizontal: Spacing.xxl, lineHeight: 18 },
});
