// constants/theme.ts
// Bastet DV Support App — Design System
// Milestone 3 (v0.7) — Locked design tokens
//
// Single source of truth for all colors, typography, spacing, and radii.
// Every screen and component pulls from here. Never hardcode these values.
//
// Font installation:
//   npx expo install @expo-google-fonts/playfair-display @expo-google-fonts/dm-sans

// ─── Colors ──────────────────────────────────────────────────────────────────

export const Colors = {
  light: {
    // Brand
    primary:        '#614051', // Eggplant — CTAs, active states, trust signals
    primaryLight:   '#F0EBF0', // Eggplant tint — icon backgrounds, tab highlights
    primaryMid:     '#D4B8C8', // Eggplant mid — borders, dividers

    // Backgrounds
    background:     '#FAFAF8', // Warm white — screen base
    surface:        '#FFFFFF', // Pure white — cards
    stone:          '#F2EFE9', // Stone — secondary button backgrounds, hover states

    // Text
    textPrimary:    '#1A1A1A', // Near-black — headlines, primary text
    textSecondary:  '#5A5A5A', // Mid-gray — supporting text
    textMuted:      '#9A9A9A', // Light gray — metadata, placeholders, labels

    // Semantic
    exitRed:        '#B03A2E', // Quick Exit — used ONLY for the exit button
    verified:       '#2E6DA4', // Verified badge text + border
    verifiedBg:     '#E8F0F7', // Verified badge background

    // Call-for-address
    callBg:         '#FDF7EE', // Warm cream — call card background
    callBorder:     '#CBB88A', // Warm gold — call card border
    callText:       '#5C4A1E', // Dark warm brown — call card text
    callIconBg:     '#CBB88A', // Call icon background

    // UI
    cardBorder:     '#E5E0D8', // Card borders throughout
    tabBar:         'rgba(250,250,248,0.96)', // Tab bar background (with blur)
    tabBarBorder:   '#E5E0D8',

    // Tint (used by expo-router tab bar)
    tint:           '#614051',
    tabIconDefault: '#9A9A9A',
    tabIconSelected:'#614051',
  },

  // Dark mode — stubbed for future use, mirrors light for now
  dark: {
    primary:        '#C49AB0',
    primaryLight:   '#2A1F24',
    primaryMid:     '#4A3040',
    background:     '#111010',
    surface:        '#1C1A1B',
    stone:          '#252222',
    textPrimary:    '#F5F2F0',
    textSecondary:  '#B0ACAA',
    textMuted:      '#6A6664',
    exitRed:        '#E05A4E',
    verified:       '#6AABDC',
    verifiedBg:     '#1A2E3D',
    callBg:         '#1F1A10',
    callBorder:     '#8A7850',
    callText:       '#D4B87A',
    callIconBg:     '#8A7850',
    cardBorder:     '#302A2D',
    tabBar:         'rgba(17,16,16,0.96)',
    tabBarBorder:   '#302A2D',
    tint:           '#C49AB0',
    tabIconDefault: '#6A6664',
    tabIconSelected:'#C49AB0',
  },
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const Typography = {
  // Font families
  serif:      'PlayfairDisplay_400Regular',   // Headlines, emotional moments
  serifMed:   'PlayfairDisplay_500Medium',    // Subheadings
  sans:       'DMSans_400Regular',            // Body copy
  sansMed:    'DMSans_500Medium',             // Labels, buttons
  sansSemi:   'DMSans_600SemiBold',           // Emphasis, CTAs
  sansLight:  'DMSans_300Light',              // Supporting text, captions

  // Scale
  h1: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontFamily: 'PlayfairDisplay_500Medium',  fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },

  body:    { fontFamily: 'DMSans_400Regular',   fontSize: 15, lineHeight: 22 },
  bodyLg:  { fontFamily: 'DMSans_400Regular',   fontSize: 17, lineHeight: 24 },
  bodySm:  { fontFamily: 'DMSans_300Light',     fontSize: 13, lineHeight: 19 },

  label:   { fontFamily: 'DMSans_500Medium',    fontSize: 11, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  button:  { fontFamily: 'DMSans_600SemiBold',  fontSize: 15, lineHeight: 20, letterSpacing: -0.2 },
  buttonSm:{ fontFamily: 'DMSans_600SemiBold',  fontSize: 13, lineHeight: 18, letterSpacing: -0.1 },
  caption: { fontFamily: 'DMSans_300Light',     fontSize: 11, lineHeight: 15 },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  '3xl': 32,
  '4xl': 40,

  // Screen padding — consistent horizontal inset
  screenPad: 24,

  // Tab bar height
  tabBarHeight: 82,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const Radius = {
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  pill: 999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cta: {
    shadowColor: '#614051',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Component Tokens ────────────────────────────────────────────────────────
// Pre-composed styles for common components.
// Use these instead of repeating raw values in screens.

export const ComponentTokens = {

  // Quick Exit button — appears on every screen, always identical
  quickExit: {
    container: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      borderWidth: 1.5,
      borderColor: '#B03A2E',
    },
    text: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 13,
      color: '#B03A2E',
      letterSpacing: 0.1,
    },
  },

  // Primary CTA button (Find Help Now)
  ctaPrimary: {
    container: {
      marginHorizontal: Spacing.xxl,
      padding: Spacing.xl,
      backgroundColor: '#614051',
      borderRadius: Radius.lg,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    label: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 18,
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
    sub: {
      fontFamily: 'DMSans_300Light',
      fontSize: 13,
      color: 'rgba(255,255,255,0.72)',
      marginTop: 3,
    },
  },

  // Shelter card
  shelterCard: {
    container: {
      marginHorizontal: Spacing.xxl,
      backgroundColor: '#FFFFFF',
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: '#E5E0D8',
    },
    header: {
      padding: Spacing.lg,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: '#F2EFE9',
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      gap: Spacing.md,
    },
    foundLabel: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 11,
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
      color: '#614051',
      marginBottom: 4,
    },
    name: {
      fontFamily: 'PlayfairDisplay_400Regular',
      fontSize: 17,
      color: '#1A1A1A',
      lineHeight: 22,
    },
  },

  // Verified badge
  verifiedBadge: {
    container: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: Radius.pill,
      borderWidth: 1,
      borderColor: '#2E6DA4',
      backgroundColor: '#E8F0F7',
    },
    text: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 11,
      color: '#2E6DA4',
    },
  },

  // Call-for-address card
  callCard: {
    container: {
      borderRadius: Radius.md,
      backgroundColor: '#FDF7EE',
      borderWidth: 1,
      borderColor: '#CBB88A',
      padding: Spacing.lg,
    },
    title: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 15,
      color: '#5C4A1E',
    },
    note: {
      fontFamily: 'DMSans_300Light',
      fontSize: 13,
      color: '#5C4A1E',
      lineHeight: 19,
      marginTop: 4,
      marginBottom: Spacing.md,
    },
    button: {
      padding: Spacing.md,
      borderRadius: Radius.sm,
      backgroundColor: '#5C4A1E',
      alignItems: 'center' as const,
    },
    buttonText: {
      fontFamily: 'DMSans_600SemiBold',
      fontSize: 14,
      color: '#FFFFFF',
    },
  },

  // Resource list item (Support tab)
  resourceItem: {
    container: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E0D8',
      borderRadius: Radius.md,
      padding: Spacing.md,
      paddingHorizontal: Spacing.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: Spacing.md,
      marginBottom: Spacing.sm,
    },
    title: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: '#1A1A1A',
      marginBottom: 2,
    },
    subtitle: {
      fontFamily: 'DMSans_300Light',
      fontSize: 12,
      color: '#9A9A9A',
    },
  },

} as const;

// ─── Font Loading Helper ──────────────────────────────────────────────────────
// Use this in your root _layout.tsx to preload fonts before rendering.
//
// Usage in app/_layout.tsx:
//
//   import { useFonts } from 'expo-font';
//   import { FONT_MAP } from '@/constants/theme';
//
//   const [fontsLoaded] = useFonts(FONT_MAP);
//   if (!fontsLoaded) return null;

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
} from '@expo-google-fonts/playfair-display';

import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';

export const FONT_MAP = {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} as const;
