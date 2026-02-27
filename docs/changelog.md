# DV Support App — Dev Changelog


## February 24–27, 2026

---

### Onboarding Flow — M4 Feature Complete

**Scope:** 2 screens, minimal and intentional. First launch only, replay from Settings.

**Screen 1 — Privacy Promise** *(skippable)*
- Lock icon, "Your privacy comes first." headline
- Body copy: one-time location use, no storage, no account
- Pills: No account · No history · No trace

**Screen 2 — Quick Exit** *(mandatory)*
- "The Quick Exit button is always there." headline
- Explains immediate close + clears from recent apps
- Live Quick Exit button demo
- Caption: "It's at the top of the app screen. You don't have to look for it."

**Files added/changed:**
- `app/onboarding.tsx` — 2-screen component, fade transition (180ms/220ms)
- `src/utils/useOnboarding.ts` — AsyncStorage hook, `shouldShow`, `complete()`, `reset()`
- `app/(tabs)/index.tsx` — onboarding gate, all hooks moved above conditional returns

**Bugs fixed during build:**
- Rules of Hooks violation — early returns before hooks caused React error. All hooks moved to top of `HomeScreen`.
- Exit icon rendering — border-drawn arrow rendered as `>` shape. Replaced with X mark (two rotated bars, `position: absolute`).
- Caption orphan — "it." on its own line. Split into two even lines with `{'\n'}`.

---

### Android — Heart Icon Fix

**Problem:** `IconSymbol` uses SF Symbols (iOS only). Heart icon missing on Android Support tab.

**Fix:** Replaced `IconSymbol` with `MaterialIcons` from `@expo/vector-icons` (ships with Expo, no install needed).

| Tab | Before | After |
|-----|--------|-------|
| Home | `house.fill` (SF Symbol) | `home` (MaterialIcons) |
| Support | `heart.fill` (SF Symbol) | `favorite` (MaterialIcons) |

**File:** `app/(tabs)/_layout.tsx`

Android backlog fully closed. All 3 items resolved.

---

### Accessibility Audit — WCAG AA

Full audit across all 4 screens. 5 issues identified and resolved.

| Severity | Issue | Fix |
|----------|-------|-----|
| Critical | Touch targets too small | `minHeight: 44` on `backBtn`, `quickExit`, `reportRow` |
| Critical | Missing `accessibilityRole` | `accessibilityRole="button"` on all 15 `TouchableOpacity` elements |
| Moderate | `textMuted` contrast fails WCAG AA | `#9A9A9A` → `#767676` (2.85:1 → 4.54:1). One token change, fixes all screens. |
| Moderate | `NoticeBanner` not announced to screen readers | `accessibilityLiveRegion="polite"` added |
| Minor | Onboarding progress dots unlabeled | Wrapped in accessible `View` with label `"Step N of 2"` |

**Files changed:** `constants/theme.ts`, `app/(tabs)/index.tsx`, `app/(tabs)/explore.tsx`, `app/shelters.tsx`, `app/onboarding.tsx`

---

### Product Brief — v0.1

First formal product brief produced. 10 sections covering problem statement, positioning, target user, design principles, discretion design, distribution strategy, feature scope, SWOT, research basis, and open questions.

**Key decisions locked:**
- Internal positioning statement finalized
- 4 principles locked: Trust Is the Product · Privacy Is Table Stakes · Discretion Over Visibility · Navigation Tool Only
- Icon designed to resemble a casual game — in development with designer
- Distribution is trust-routing only — no marketing, no ASO
- Chat, accounts, and push notifications permanently out of scope

**Research gap flagged:** No primary interviews with survivors, shelter workers, or advocates yet. Highest-priority gap before M4 launch decisions.

---

### SafeAreaView — API Level Testing Plan

Physical Android device unavailable. Testing via lower API emulators.

| API Level | Android Version | Status |
|-----------|----------------|--------|
| API 36 (Baklava) | Android 16 | ✓ Tested — no issues |
| API 30 (R) | Android 11 | ⟳ Emulator created, testing in progress |
| API 29 (Q) | Android 10 | ~ Planned |

---

### M4 Backlog Status

| Item | Status |
|------|--------|
| Onboarding flow | ✓ Closed |
| Android heart icon | ✓ Closed |
| Accessibility audit | ✓ Closed |
| SafeAreaView API testing | ⟳ In progress |
| Dark mode implementation | ~ Waiting on UI/UX feedback |
| Settings screen | ~ Unblocked — `reset()` hook ready, UI not built |

---

## Session — Android Polish & UI Exploration (2/23/26)

### Bug Fixes — Android Platform
- **CTA arrow drift** — Replaced text `→` character with border-drawn chevron (10px, 2px border, rotate 45°). No font rendering involved, centers identically on iOS and Android. ✓ Closed
- **Hero copy stale on Android** — Emulator was serving cached bundle. Resolved with `npx expo start --reset-cache`. New copy confirmed on both platforms. ✓ Closed
- **SafeAreaView deprecation** — Swapped import to `react-native-safe-area-context` on all screens, added `edges` prop. Warning eliminated. ✓ Closed
- **Shelters data import path** — Path incorrectly changed to `../../data/` — reverted to `../data/` which is correct for `app/shelters.tsx` structure. ✓ Closed
- **Heart icon missing (Android)** — SF Symbol has no Android fallback. Needs MaterialIcons equivalent in `_layout.tsx`. Deferred to M4.
- **SafeAreaView top padding** — `edges` prop and `Platform.OS` check applied but inconsistent on some API levels. Test on physical device in M4.

### Feedback Widget — Pattern Redesign
- Removed thumbs up/down widget from all shelter cards — pattern carried Yelp/Rotten Tomatoes energy, wrong register for someone in crisis
- Evaluated 5 alternatives: Yes/No text, single confirm tap, outcome reframe, flag only, post-action check-in
- **Chose Option 4 — Flag only**: subtle `"Report an issue with this listing"` link in muted underlined text
- One-way state — tapping flips to `"✓ Issue reported — thank you"` in eggplant, cannot un-report
- Removed `setThumb` helper, `thumbs` state, and all dead styles from `shelters.tsx`

### Hero Copy Update
- Previous: *"You're not alone. Find verified nearby support, fast. No account needed."*
- Updated: *"We believe you. Let us help you get the support you need. No judgement."*
- "No judgement." on its own line, italicized using `DMSans_300LightItalic`

### UI Explorations
- Four alternative design directions explored using identical color palette — delivered as HTML review file for UI/UX contact
  - **A — Editorial**: Cormorant Garamond headlines, left-border accents, gold as rule line
  - **B — Warm & Organic**: Eggplant hero, cards emerge from dark into warm white
  - **C — Minimal & Utility**: DM Sans throughout, eggplant as only accent, zero decoration
  - **D — Dark & Private**: Dark mode first, eggplant glows, designed for 2am use
- Dark mode preview built — pixel-exact token swap of current build. 10 tokens change, eggplant and gold unchanged. Token diff table delivered.
- Decision: staying with current direction. Exploration complete, no changes to production.

### Backlog Status
- ✓ Android arrow drift — closed
- ✓ Shelters import path — closed
- ✓ SafeAreaView deprecation warning — closed
- ~ Heart icon (Android) — open, M4
- ~ SafeAreaView top padding — open, M4

## Milestone 3 — UX Design System & Screen Implementation (v0.7) (2/22/26)

### Screen Implementation
- Applied full M3 design system to all screens — zero hardcoded colors, fonts, or spacing remain
- `index.tsx` — hero section with Playfair Display headline, eggplant CTA button, call-for-address gold card, shelter meta row, resources button
- `explore.tsx` — full Support tab built: collapsible hotlines section (National DV Hotline, Crisis Text Line, RAINN, 911), six resource rows (Safety Planning, Tech Safety, Legal Help, Local Programs, Housing, Online Chat), all wired to real URLs
- `shelters.tsx` — eggplant directions button, pet-friendly tag, per-card thumbs up/down feedback widget (local state only, no identity, no network call)
- `_layout.tsx` — useFonts(FONT_MAP) wired correctly inside component, font load gate added, duplicate code removed

### Design Polish
- CTA arrow circle opacity bumped 18% → 26% — now visible against eggplant without competing with label
- Directions buttons swapped to eggplant across index.tsx and shelters.tsx — consistent with primary color system
- Arrow circle centering fixed via flex:1 on text view
- Key emoji added to Resources & Hotlines button — replaces shield

### Font System
- `@expo-google-fonts/playfair-display` and `@expo-google-fonts/dm-sans` installed
- Playfair Display rendering confirmed on iOS simulator
- Font load gate prevents flash of unstyled text on app launch

### Platform Fixes
- Swapped `SafeAreaView` import from `react-native` to `react-native-safe-area-context` on all screens — eliminates deprecation warning
- Added `edges={['top', 'left', 'right']}` prop on all SafeAreaView instances
- Added `Platform.OS` android check on header paddingTop across all screens — prevents Quick Exit crowding into status bar

### Data Validation — Confirmed
- `[ShelterValidation] 21/21 passed. 3 are call-for-address shelters.` confirmed on Android emulator startup
- No data regressions introduced this session

### Backlog (Non-blocking, carry to M4)
- CTA arrow drift on Android emulator — iOS renders correctly
- Heart icon missing on Android Support tab — SF Symbol has no Android fallback, needs MaterialIcons
- SafeAreaView top padding inconsistency on some Android API levels — test on physical device

---

## Milestone 2 — Data & Logic Hardening (v0.4) (2/21/26)

### Schema Overhaul
- Replaced broken nested array structure with clean flat JSON array
- Removed all invalid commented fields — JSON is now spec-compliant
- Standardized all phone numbers to `(xxx) xxx-xxxx` format
- Fixed Chesterfield address typo (`Chesterfi339` → `339 N Page St`)
- Fixed Sumter zip code (`294150` → `29150`)
- Fixed Marion, SC coordinates (was inheriting Dillon's lat/lon)

### New Fields
- `hotline` — separate from `phone`, surfaces 24/7 crisis lines distinctly
- `hasPetOptions` — boolean flag for pet-friendly shelters

### callForAddress Pattern
- `callForAddress: true` for shelters that intentionally withhold physical address to protect residents
- Requires `callForAddressNote` and at least one phone/hotline — enforced by validator
- Coordinates set to city-center for distance sorting only
- App never shows a directions button for these shelters

### Shelter Data: 5 → 21 Verified Entries
- 18 shelters fully verified with address, coordinates, phone, and `lastVerified` date
- 3 shelters marked `callForAddress: true`: Family Justice Center (Georgetown), Meg's House (Greenwood), The Safe Home (Clinton)

### Validator Updates — Schema v2.1
- Added `hotline`, `hasPetOptions`, `callForAddress`, `callForAddressNote` to Shelter type
- `callForAddress: true` requires phone/hotline + note — enforced
- `verified: true` requires `lastVerified` date — enforced
- Placeholder addresses hard-rejected
- `canGetDirections()` and `getCallForAddressNote()` UI helpers added
- Runtime validation log on startup

### Earlier v0.4 Items (2/15/26)
- Runtime shelter schema validation — invalid entries filtered safely
- Controlled empty state when shelter listings unavailable or corrupted
- Deterministic distance guard prevents fallback-distance selection and 999999 miles edge cases
- Centralized notice logic prevents overlapping error states
- Location services OFF and permission DENIED both pass

---

## Milestone 1 — Safety Baseline Lock (v0.3) (2/13/26)

### Privacy Layer — iOS
- App switcher preview obscures sensitive content
- No visual flash of shelter content on foreground restore
- Rapid background/foreground switching stable (10-cycle test)

### Privacy Layer — Android
- Recents thumbnail secured (FLAG_SECURE enabled)
- Screenshots blocked
- Quick Exit resets state before external redirect

### Location Handling
- Permission denied → deterministic "Location access is off" UI
- Location services disabled → explicit error state
- No infinite spinner states, no silent failures
- Invalid coordinate handling prevents NaN distance
- No crash when shelter list empty

### Emergency Routing
- Maps deep link launches successfully
- No crash if maps unavailable
- Quick Exit resets state before redirect

### Engineering
- AppState listener cleaned up — no duplicate listeners
- No debug console logs
- No sensitive data persisted locally
- No AsyncStorage storing location

---

## Safety & Trust Pass (v1.5) (2/8/26)
- Fixed broken Tech Safety & Privacy link → TechSafety.org Survivor Toolkit
- Hardened Quick Exit behavior with clearer intent and accessibility label
- Improved Support card readability (subtitle color + line height)
- Updated Sources styling for authority and trust
- Added inline documentation for safety-related behavior

---

## v1.0 — MVP
- Location-based shelter discovery
- Nearest shelter surfaced first
- One-tap directions
- Offline hotline fallback

---

## Strategic Note — National Scaling
National expansion will require an API layer sourcing from the National Domestic Violence Hotline (thehotline.org) or 211.org rather than manual JSON maintenance. The `verified`, `lastVerified`, `callForAddress`, and `source` fields in the current schema map cleanly to a backend model. Post-beta work — v2.0+.