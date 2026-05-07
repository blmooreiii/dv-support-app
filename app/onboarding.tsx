// app/onboarding.tsx
// Bastet — Onboarding Flow
//
// Screen 1: Privacy Promise  — skippable
// Screen 2: Quick Exit       — mandatory, cannot skip
//
// Props:
//   onDone: () => void  — called when user completes or skips through

import React, { useState, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

const C = Colors.light;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const transitionTo = (nextStep: 0 | 1 | 2) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(nextStep), 180);
  };

  const handleSkip = () => {
    // Screen 1 skip — jump to mandatory Quick Exit screen
    transitionTo(1);
  };

  const handleNext = () => {
    if (step === 0) transitionTo(1);
    else if (step === 1) transitionTo(2);
    else onDone();
  };

  const screenContent = step === 0
    ? <PrivacyScreen />
    : step === 1
    ? <QuickExitScreen />
    : <GalleryCoverScreen />;

  const primaryLabel = step === 2 ? 'Got it, take me in' : step === 1 ? 'I understand' : 'Got it';
  const a11yLabel = step === 2
    ? 'Got it, continue to app'
    : step === 1
    ? 'I understand, continue'
    : 'Got it, continue';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>

        {/* ── Progress dots ── */}
        <View
          style={styles.dotsRow}
          accessible={true}
          accessibilityLabel={`Step ${step + 1} of 3`}
        >
          <View style={[styles.dot, step === 0 && styles.dotActive]} />
          <View style={[styles.dot, step === 1 && styles.dotActive]} />
          <View style={[styles.dot, step === 2 && styles.dotActive]} />
        </View>

        {/* ── Content ── */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {screenContent}
        </Animated.View>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleNext}
            accessibilityLabel={a11yLabel}
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
          </TouchableOpacity>
          {step === 0 && (
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleSkip}
              accessibilityLabel="Skip privacy information"
              accessibilityRole="button"
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1 — Privacy Promise
// ─────────────────────────────────────────────────────────────────────────────

function PrivacyScreen() {
  return (
    <View style={styles.screenInner}>
      <View style={styles.iconWrap}>
        <View style={styles.iconCircle}>
          {/* Lock icon — two border-drawn shapes, no library needed */}
          <View style={styles.lockShackle} />
          <View style={styles.lockBody} />
        </View>
      </View>

      <Text style={styles.headline}>Your privacy{'\n'}comes first.</Text>

      <View style={styles.divider} />

      <Text style={styles.body}>
        Bastet uses your location once to find nearby shelters. It's never stored, never shared, and never tied to your name.
      </Text>

      <View style={styles.pillsRow}>
        <View style={styles.pill}><Text style={styles.pillText}>No account</Text></View>
        <View style={styles.pill}><Text style={styles.pillText}>No history</Text></View>
        <View style={styles.pill}><Text style={styles.pillText}>No trace</Text></View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2 — Quick Exit (mandatory)
// ─────────────────────────────────────────────────────────────────────────────

function QuickExitScreen() {
  return (
    <View style={styles.screenInner}>
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, styles.iconCircleRed]}>
          <View style={styles.exitX1} />
          <View style={styles.exitX2} />
        </View>
      </View>

      <Text style={styles.headline}>The Quick Exit{'\n'}button is always there.</Text>

      <View style={styles.divider} />

      <Text style={styles.body}>
        If you ever need to leave the app fast — tap it. Bastet closes immediately and clears from your recent apps.
      </Text>

      <View style={styles.exitDemoBox}>
        <View style={styles.exitDemoBtn}>
          <View style={styles.exitDemoDot} />
          <Text style={styles.exitDemoBtnText}>Quick Exit</Text>
        </View>
        <Text style={styles.exitDemoCaption}>It's at the top of the app screen.{'\n'}You don't have to look for it.</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 3 — Gallery Cover (mandatory)
// ─────────────────────────────────────────────────────────────────────────────

function GalleryCoverScreen() {
  return (
    <View style={styles.screenInner}>
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, styles.iconCircleGray]}>
          <View style={styles.galleryGrid}>
            {[0,1,2,3].map(i => (
              <View key={i} style={styles.galleryTile} />
            ))}
          </View>
        </View>
      </View>

      <Text style={styles.headline}>If someone picks up{'\n'}your phone…</Text>

      <View style={styles.divider} />

      <Text style={styles.body}>
        Opening Bastet shows a photo gallery instead of the app. Only you know how to get back in.
      </Text>

      <View style={styles.exitDemoBox}>
        <View style={styles.gestureDemoRow}>
          <View style={styles.gestureFinger} />
          <Text style={styles.gestureArrow}>→</Text>
          <View style={styles.gestureHoldBar} />
        </View>
        <Text style={styles.exitDemoCaption}>
          Hold anywhere on the gallery screen.{'\n'}The app opens after about half a second.
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPad,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    justifyContent: 'space-between',
  },

  // ── Progress dots ──
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primaryMid,
    opacity: 0.4,
  },
  dotActive: {
    width: 20,
    borderRadius: 3,
    backgroundColor: C.primary,
    opacity: 1,
  },

  // ── Content area ──
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  screenInner: {
    paddingBottom: Spacing.xl,
  },

  // ── Icon ──
  iconWrap: {
    marginBottom: Spacing['3xl'],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleRed: {
    backgroundColor: '#FDECEA',
  },

  // Lock icon shapes
  lockShackle: {
    width: 18,
    height: 14,
    borderWidth: 2.5,
    borderColor: C.primary,
    borderBottomWidth: 0,
    borderRadius: 9,
    marginBottom: -1,
  },
  lockBody: {
    width: 26,
    height: 20,
    borderRadius: 5,
    backgroundColor: C.primary,
  },

  // Exit icon — X mark, two rotated bars, universally understood as close/exit
  exitX1: {
    position: 'absolute',
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#B03A2E',
    transform: [{ rotate: '45deg' }],
  },
  exitX2: {
    position: 'absolute',
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#B03A2E',
    transform: [{ rotate: '-45deg' }],
  },

  // ── Typography ──
  headline: {
    fontFamily: Typography.serif,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: C.textPrimary,
    marginBottom: Spacing.xl,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: C.callBorder,
    borderRadius: 1,
    marginBottom: Spacing.xl,
  },
  body: {
    fontFamily: Typography.sans,
    fontSize: 16,
    lineHeight: 25,
    color: C.textSecondary,
    marginBottom: Spacing['3xl'],
  },

  // ── Privacy pills ──
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  pillText: {
    fontFamily: Typography.sansMed,
    fontSize: 13,
    color: C.primary,
    letterSpacing: 0.2,
  },

  // ── Quick Exit demo box ──
  exitDemoBox: {
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  exitDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: '#B03A2E',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(176,58,46,0.05)',
  },
  exitDemoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B03A2E',
  },
  exitDemoBtnText: {
    fontFamily: Typography.sansSemi,
    fontSize: 13,
    color: '#B03A2E',
  },
  exitDemoCaption: {
    fontFamily: Typography.sansLight,
    fontSize: 13,
    lineHeight: 19,
    color: C.textMuted,
  },

  // ── Gallery cover icon ──
  iconCircleGray: {
    backgroundColor: '#F0F0F0',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 36,
    height: 36,
    gap: 3,
  },
  galleryTile: {
    width: 15,
    height: 15,
    borderRadius: 2,
    backgroundColor: '#C8B8A2',
  },

  // ── Gesture demo ──
  gestureDemoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  gestureFinger: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primary,
    opacity: 0.7,
  },
  gestureArrow: {
    fontFamily: Typography.sans,
    fontSize: 16,
    color: C.textMuted,
  },
  gestureHoldBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
    opacity: 0.25,
  },

  // ── Actions ──
  actions: {
    gap: Spacing.md,
    paddingTop: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...{
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 16,
      elevation: 8,
    }
  },
  primaryBtnText: {
    fontFamily: Typography.sansSemi,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipBtnText: {
    fontFamily: Typography.sans,
    fontSize: 15,
    color: C.textMuted,
  },
});
