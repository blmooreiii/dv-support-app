# DV Support App — Dev Changelog

March 6, 2026 — Session 2
Logo Review — Final Direction
Reviewed four logo variations from designer (pixel version, vector on white, vector on dark, shield seal).
Selected direction:

Pixel/16-bit version → app icon only (disguise layer on home screen)
"Bastet" wordmark in Playfair Display → inside the app, no logo in header
Logo does not appear inside the app at all — text-only header preserves discretion

Rationale: The detailed Egyptian mark inside the app risks breaking the disguise. The serif wordmark reads as a game title. Clean separation of purpose — icon does the disguise job, wordmark holds the in-app identity.
Next step: Designer to export pixel version at App Store icon sizes — 1024px, 512px, 180px, 32px.

Beta Test Plan — v1.0
First formal beta test plan produced. PDF artifact filed as Bastet_Beta_Test_Plan.pdf.
8 sections:

Overview and beta goals (Tier 1 + Tier 2)
Tester profiles — Tier 1 (5–8 advocates/familiar contacts), Tier 2 (15–25 trusted network)
Current Tier 1 pipeline — 3 advocates (callbacks pending), 2 familiar contacts (ready to invite)
Distribution — TestFlight (iOS, email invite only for Tier 1), Google Play Internal Testing (Android)
Feedback collection — Tier 1 structured conversation with 5 core questions, Tier 2 Google Form
What to watch for — safety-critical, data trust, UX clarity, technical
Timeline — pre-beta through App Store submission
Post-beta backlog — sorting/filtering, icons, dark mode, anonymous feedback, national scaling

Key decisions:

Tier 1 runs before Tier 2 — advocate feedback shapes whether anything changes first
Tier 1 invite by email only — no public TestFlight link, consistent with discretion principle
Feedback collected via real conversation for Tier 1, short Google Form for Tier 2


Backlog Updates
ItemStatusNotesLogo direction✓ ClosedPixel version for app icon, wordmark inside appBeta test plan✓ ClosedPDF filedApp icon exports⏳ WaitingDesigner delivering 1024px, 512px, 180px, 32pxAdvocate callbacks⏳ Waiting3 in pipelinePM feedback⏳ WaitingNotes expected
March 6, 2026
UI/UX Feedback — Resolved
Received feedback from UI/UX specialist. All items addressed or formally triaged.
FeedbackDecisionSticky Quick Exit header on scrollable screens✓ Implemented — see belowIcons for distance/city/pet friendly on shelter cards~ Backlogged — not a blockerContrast accessibility check✓ Already resolved in M4 WCAG AA auditSorting/filtering on Shelters screen~ Post-beta — pending Tier 1 advocate feedback
Sticky Header — Shelters & Support Screens
Problem: Quick Exit button scrolled out of view on both scrollable screens. User could be mid-scroll with no one-tap exit available.
Fix: Pulled header and page title outside ScrollView/FlatList on both screens. Header is now fixed at the top regardless of scroll position. Added borderBottomWidth: 1 with C.cardBorder as a visual separator as content scrolls beneath.
Files changed:
app/shelters.tsx — header + pageTitle wrapped in stickyTop View above FlatList
app/(tabs)/explore.tsx — header + titleBlock wrapped in stickyTop View above ScrollView
Also cleaned up in explore.tsx:
Removed dead IconSymbol import — leftover from pre-M4 MaterialIcons swap, never used
Bug Fix — Permission Denied shows no shelter path (iOS)
Problem: When location permission is denied on iOS, the app showed the notice banner and Resources & Hotlines button but no path to the shelter list. User was effectively stuck.
Root cause: status === "denied" fell through to !showCard which rendered the "Find Help Now" CTA — not useful when permission is already denied.
Fix: Added a status === "denied" intercept before the !showCard check. Renders a "Browse All Shelters" CTA instead, routing to /shelters with empty lat/lon params. Shelters screen already handles missing coords gracefully — sorts alphabetically.
File changed: app/(tabs)/index.tsx
Tested: ✓ Passed on iOS simulator
Edge Case Testing — iOS Simulator
Full test run completed on iOS simulator. Results:
TestResultNotesPermission denied✓ Fixed + passedBug fixed this sessionLocation services off✓ PassedGPS timeout⏭ DeferredNeeds physical deviceLast known location stale⏭ DeferredNeeds physical deviceQuick Exit — every screen✓ PassedHome, Support, Shelters, Settings, OnboardingQuick Exit — mid-action✓ PassedNo ghost state on reopenQuick Exit — rapid taps✓ PassedNo duplicate browser tabsNo internet⏭ DeferredNeeds physical deviceValidator log — 21/21✓ PassedNo data regressionsLow battery mode⏭ DeferredNeeds physical deviceOnboarding replay from Settings✓ PassedApp backgrounded mid-onboarding⏭ DeferredNeeds physical deviceLarge text accessibility⏭ DeferredNeeds physical device
Deferred items to be surfaced naturally by Tier 1 beta testers on physical devices.
Privacy Statement — Live
Privacy policy written and hosted at https://sites.google.com/view/bastet-privacy/. URL confirmed loading. App Store Connect ready.
settings.tsx already pointing to live URL — no code change required.
Age threshold note: Current children's section references "under 13." Should be updated to explicitly state app is intended for adults 18+ before App Store submission.
Backlog Updates
ItemStatusNotesSticky header — Shelters✓ ClosedSticky header — Support✓ ClosedPermission denied — no shelter path✓ ClosedDead IconSymbol import (explore.tsx)✓ ClosedPrivacy statement URL✓ ClosedLive at Google Sites URLIcons for distance/city on shelter cards~ BackloggedPost-beta, non-blockingSorting/filtering on Shelters screen~ BackloggedPost-beta, after advocate feedbackAPI 29 (Android 10) emulator test~ OpenStill pendingDark mode~ OpenUI/UX feedback pending — will ship without if no responseApp icon~ OpenDesigner working from creative brief v1.1App Store prep~ OpenScreenshots, description, privacy URL
Pre-Beta Status
ItemStatusM4 complete✓Privacy statement live✓Edge case testing (simulator)✓Sticky headers✓Permission denied fix✓Advocate outreach⏳ Waiting on callbacksPM feedback⏳ Waiting on notesApp icon assets⏳ Waiting on designerAPI 29 emulator test~ Pending


## February 28, 2026

SafeAreaView — API 30 Testing
Tested on Android API 30 (Android 11) emulator. All screens pass.
ScreenResultHome — header and Quick Exit✓ Fully visible, no clippingSupport tab✓ Clean, tab color change on active workingQuick Exit✓ Closes app, opens Chrome on Android as expectedOnboarding✓ Progress dots and content not clipped
SafeAreaView backlog item closed. No fixes required.

Settings Screen
New screen accessible from Support tab via "Settings" text link at the bottom.
Contents:
SectionItemBehaviorPrivacy & SafetyReplay Privacy IntroductionCalls useOnboarding.reset(), navigates to /AboutPrivacy StatementOpens bastet.app/privacy — placeholder, URL pendingAboutApp VersionStatic display, 0.4.0 (M4), no chevron
Footer copy: "Bastet collects no personal data. No account. No history. No trace."
Files added/changed:

app/settings.tsx — new screen, Quick Exit and SafeAreaView included
app/(tabs)/explore.tsx — Settings text link added below sources footer, useRouter wired in

Accessibility: All rows minHeight: 56, back button minHeight: 44, Quick Exit minHeight: 44, all interactive elements have accessibilityRole="button".

Backlog Updates
ItemStatusNotesSafeAreaView API 30✓ ClosedPasses on API 30 emulatorSettings screen✓ ClosedReplay onboarding, privacy statement, app versionPrivacy statement URL~ OpenNeeded before App Store submission. Placeholder currently points to bastet.app/privacyData feedback mechanism~ BackloggedHow to get anonymous shelter accuracy signal without violating privacy principle. Needs advocate input before deciding.Dark mode~ OpenWaiting on UI/UX specialist feedbackApp icon~ OpenIn progress with designer. Creative brief v1.1 filed.App Store prep~ OpenScreenshots, description, privacy policy URL

M4 Status — Complete
ItemStatusOnboarding flow✓ ClosedAndroid heart icon✓ ClosedAccessibility audit — WCAG AA✓ ClosedSafeAreaView API 30 testing✓ ClosedSettings screen✓ Closed
M4 is complete. Pre-beta work begins next milestone.


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