// app/settings.tsx
// Bastet — Settings Screen
//
// Accessible from Support tab via text link at the bottom.
// Contents: Replay onboarding, App version, Privacy statement.
// Intentionally minimal — no account settings, no notifications, no analytics.

import React from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import { quickExit } from '@/src/utils/quickExit';
import { PrivacyCover, usePrivacyCover } from '@/components/PrivacyCover';
import { useOnboarding } from '@/src/utils/useOnboarding';

const C = Colors.light;
const APP_VERSION = '0.4.0 (M4)';

// ─── Row components ───────────────────────────────────────────────────────────

function SettingsRow({
  label,
  sublabel,
  onPress,
  showChevron = true,
  destructive = false,
}: {
  label: string;
  sublabel?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}) {
  const isInteractive = !!onPress;
  const Wrapper = isInteractive ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      style={styles.row}
      accessibilityLabel={label}
      accessibilityRole={isInteractive ? 'button' : undefined}
    >
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={styles.rowSublabel}>{sublabel}</Text>
        ) : null}
      </View>
      {showChevron && isInteractive ? (
        <Text style={styles.rowChevron}>›</Text>
      ) : null}
    </Wrapper>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const { privacyCover, setPrivacyCover } = usePrivacyCover();
  const { reset } = useOnboarding();

  const handleReplayOnboarding = async () => {
    await reset();
    router.replace('/');
  };

  const handlePrivacyStatement = () => {
    Linking.openURL('https://sites.google.com/view/bastet-privacy/').catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => quickExit(setPrivacyCover)}
          style={styles.quickExit}
          accessibilityLabel="Quick Exit"
          accessibilityRole="button"
        >
          <View style={styles.quickExitDot} />
          <Text style={styles.quickExitText}>Quick Exit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.headline}>Settings</Text>
        </View>

        {/* ── Onboarding ── */}
        <SectionHeader title="Privacy & Safety" />
        <View style={styles.section}>
          <SettingsRow
            label="Replay Privacy Introduction"
            sublabel="Review the privacy promise and Quick Exit tutorial"
            onPress={handleReplayOnboarding}
          />
        </View>

        {/* ── About ── */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingsRow
            label="Privacy Statement"
            sublabel="How Bastet handles your information"
            onPress={handlePrivacyStatement}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            label="App Version"
            sublabel={APP_VERSION}
            showChevron={false}
          />
        </View>

        {/* ── Footer note ── */}
        <Text style={styles.footer}>
          Bastet collects no personal data.{'\n'}
          No account. No history. No trace.
        </Text>

      </ScrollView>

      <PrivacyCover visible={privacyCover} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    paddingBottom: 80,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Platform.OS === 'android' ? Spacing.xxl : Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    fontFamily: Typography.sansMed,
    fontSize: 15,
    color: C.primary,
  },
  quickExit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: C.exitRed,
    minHeight: 44,
  },
  quickExitDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: C.exitRed,
  },
  quickExitText: {
    fontFamily: Typography.sansSemi,
    fontSize: 13,
    color: C.exitRed,
  },

  // ── Title ──
  titleBlock: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  headline: {
    fontFamily: Typography.serif,
    fontSize: 28,
    color: C.textPrimary,
    letterSpacing: -0.4,
  },

  // ── Sections ──
  sectionHeader: {
    fontFamily: Typography.sansSemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.textMuted,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
  },
  section: {
    marginHorizontal: Spacing.xxl,
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: 'hidden',
  },

  // ── Rows ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: Typography.sansMed,
    fontSize: 15,
    color: C.textPrimary,
    marginBottom: 2,
  },
  rowLabelDestructive: {
    color: C.exitRed,
  },
  rowSublabel: {
    fontFamily: Typography.sansLight,
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 17,
  },
  rowChevron: {
    fontFamily: Typography.sans,
    fontSize: 20,
    color: C.textMuted,
    marginLeft: Spacing.sm,
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.stone,
    marginHorizontal: Spacing.lg,
  },

  // ── Footer ──
  footer: {
    fontFamily: Typography.sansLight,
    fontSize: 12,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: Spacing['3xl'],
    marginHorizontal: Spacing.xxl,
  },
});
