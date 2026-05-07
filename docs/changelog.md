# Bastet — Dev Changelog

---

## May 6, 2026

### Photo Gallery Privacy Cover — Implemented

New two-layer privacy protection implemented to address advocate feedback about disguise layers being "deeper than the icon."

**Component files:**
- `hooks/usePhotoGalleryCover.ts` — monitors `AppState`; sets `showCover = true` on any `background/inactive → active` transition
- `components/PhotoGalleryCover.tsx` — fake iOS Photos UI (header, 3-column grid of solid color tiles, bottom tab bar with Library/For You/Albums/Search); long-press anywhere (600ms) dismisses back to real app
- `app/_layout.tsx` — root layout wrapped in `GestureHandlerRootView` (required for React Native Gesture Handler v2); renders `PhotoGalleryCover` at root level covering all routes

**Key design decisions:**
- Replaced `picsum.photos` network images with instant solid-color tiles (no network dependency, no loggable requests)
- Removed hint text entirely (production-ready)
- Placed cover in root layout instead of tabs layout — covers `/shelters` and `/settings` routes, not just tabs
- Added `runOnJS(true)` in gesture handler so dismiss callback can call React state from gesture thread
- Uses long-press (600ms) instead of three-finger tap for broader accessibility

**Two-layer protection:**
1. Existing Privacy Cover: blank white screen in app switcher
2. New Gallery Cover: fake Photos app when opened, requires gesture to unlock

**Aligns with advocate feedback:** Tiha's "weather overlay" concept and Dr. Lewis-Kendrick's independent confirmation of disguise layer need.

### Onboarding — Screen 3 Added

`app/onboarding.tsx` — added mandatory third step explaining the photo gallery cover:

- Progress dots updated from 2 to 3
- Step type widened from `0 | 1` to `0 | 1 | 2`
- `GalleryCoverScreen` component: explains fake gallery concept, shows visual finger → hold bar demo of long-press gesture
- No skip button on step 3 (mandatory, same as Quick Exit step)

### BastBot — Browse Shelters Fallback

`app/(tabs)/bastbot.tsx` — when location is unavailable (permission denied or GPS error), bot message now includes Browse All Shelters button alongside existing hotline text, navigating to `/shelters` sorted alphabetically without coordinates.

### Bug Fix — Android Text Node Crash

`app/(tabs)/bastbot.tsx` — Android crash: "Text strings must be rendered within a `<Text>` component"

**Problem:** The pattern `{privacyCover && <PrivacyCover />} {/* comment */}` had raw whitespace text node between expression and JSX comment, which Android's renderer rejects.

**Additional issue:** `<PrivacyCover />` was missing required `visible` prop, so privacy cover never displayed on BastBot.

**Fix:** Changed to `<PrivacyCover visible={privacyCover} />` matching pattern in `index.tsx` and `explore.tsx`.

### Test Suite — Comprehensive Coverage

New test infrastructure and three test suites added:

**Setup:**
- `package.json` — added `jest`, `ts-jest`, `jest-expo`, `@testing-library/react-native`, `@types/jest`
- Added scripts: `test`, `test:watch`, `test:coverage`
- `__mocks__/react-native.js` — minimal stubs for `Linking`, `AppState`, `Platform`

**Test suites:**

1. **`__tests__/validateShelters.test.ts`** (30 tests)
   - Field validation (name, county, phone, coordinates)
   - Coordinate range validation (SC bounding box)
   - Phone/website format validation
   - `callForAddress` safety rules (requires phone + note, rejects address)
   - Runtime filtering (verified shelters only)
   - UI helpers (distance formatting, phone link generation)

2. **`__tests__/faqMatcher.test.ts`** (21 tests)
   - Query matching and scoring
   - Threshold validation (>=0.6 for matches)
   - Case/punctuation handling
   - Category filtering
   - FAQ data integrity (all links use `https://`)

3. **`__tests__/quickExit.test.ts`** (9 tests)
   - Synchronous cover application
   - 120ms delay before navigation
   - Optional cleanup callback ordering
   - Graceful failure when `Linking` rejects
   - Exit URL is non-app-specific

**All tests passing.**

### Tab Bar Color Fix

`app/(tabs)/_layout.tsx` — fixed TypeScript error where `Colors[colorScheme ?? 'light'].tint` was failing. Extracted theme object first to avoid dynamic property access issues.

---

## April 28, 2026

### Android Internal Testing — Live

**Google Play Console setup:**
- AAB successfully uploaded to Internal Testing track
- Adaptive icon confirmed fixed
- Map directions confirmed working
- Phone number display fixed on all shelter cards (build v3)
- Sole Android tester using internal testing link via `bertram@bertrammoore.com`

**Known Android issues resolved:**
- EAS `appVersionSource: remote` overrides local `versionCode` — fixed by removing it or using production profile with `autoIncrement: true`
- EAS labels AAB downloads as `.apk` in filename — confirmed AAB via build details page, not filename
- Manually renaming `.apk` → `.aab` corrupts file
- Play Console Internal Testing requires AAB (not APK) for new app submissions
- Tester email must match Google account on test device
- Developer account cannot be added as tester for same app

### iOS App Store Review — Ongoing

**Rejection history:**
1. Guideline 4.3(a) spam flag — appealed and resolved
2. Guideline 4.2.2 minimum functionality — demo video + updated location purpose string submitted
3. App Review Board requested documentation of government/law enforcement partnerships

**Response drafted (not yet submitted):**
- No government/law enforcement partnerships exist
- Cited MCFG incorporation, advocate relationships, shelter portal, SCCADVASA as data source
- Production build initiated

**Current status:** Waiting for decision on appeal

### Shelter Portal Updates

- Live at `bastet-ws-surt.vercel.app`
- County-filtered active list implemented
- "Is this correct?" mailto links on every card
- Submission form routing to `info@marbleceilings.com`

### Tier 1 Beta Status

**Confirmed testers (5):**
- Dr. Bertrina Scott
- Tiha Allen
- Chloe
- Yaunna Stewart
- Leaeryn Moore

**Status:** All waiting for iOS TestFlight approval

### Tier 2 Beta Preparation

- External TestFlight group created
- Target: 15–25 trusted network contacts
- Pending: Beta App Review approval after Tier 1 feedback incorporated

---

## April 17, 2026

### BastBot — Full Implementation

New AI-powered support assistant added as third tab.

**Component:** `app/(tabs)/bastbot.tsx`

**Features:**
- 26 pre-written FAQs covering Quick Exit, privacy, shelter search, safety planning, abuser tracking concerns
- Intelligent FAQ matching via `faqMatcher.ts` — fuzzy matching, scoring threshold >=0.6, category filtering
- Shelter search integration — triggers location request and navigation to `/shelters` with coordinates
- Location services handling — permission requests, GPS timeout, error states
- Browse All Shelters fallback when location unavailable
- Privacy cover integration matching other tabs
- Chat persistence via `AsyncStorage` — clears on Quick Exit
- Scrollable conversation with auto-scroll to latest message
- Input field with send button, disabled during location loading

**Files added:**
- `app/(tabs)/bastbot.tsx` — main chat interface
- `src/data/faqs.ts` — 26 FAQs with categories (privacy, shelters, safety, technical, general)
- `src/utils/faqMatcher.ts` — query matching logic with Levenshtein-based scoring

**Design tokens used:**
- Eggplant (`#614051`) for user messages
- Stone (`#F2EFE9`) for bot messages
- Full Typography and Spacing from theme

**Safety considerations:**
- All FAQ content reviewed for tone, accuracy, and safety
- No AI model involved — purely pattern matching against pre-written content
- Abuser tracking question added as FAQ after surfacing in all three advocate conversations
- AI disclosure one-liner prepared: "Bastet doesn't use AI in the product. No user data touches any model."

### Safari View Controller — iOS Compliance

Fixed iOS Guideline 4.2.2 minimum functionality rejection.

**Problem:** External links opened in external browser, breaking in-app experience on iOS.

**Fix:** Implemented `SafariViewController` pattern across BastBot and Support tab:
- `expo-web-browser` installed and configured
- All external links now open in in-app Safari view
- Applies to: FAQ links (RAINN, NNEDV, TechSafety.org), Support resources, Settings privacy statement
- User stays in Bastet context, back button returns to app

**Files changed:**
- `app/(tabs)/bastbot.tsx` — FAQ links use `WebBrowser.openBrowserAsync`
- `app/(tabs)/explore.tsx` — all resource links use `WebBrowser.openBrowserAsync`
- `app/settings.tsx` — privacy statement link uses `WebBrowser.openBrowserAsync`

### Bug Fixes

1. **Shelter search routing in BastBot**
   - Fixed: coordinates now properly passed to `/shelters` route
   - User location request triggers correctly
   - Navigation confirmed working

2. **Import path corrections**
   - Fixed: `@/utils/faqMatcher` import in `bastbot.tsx`
   - All relative imports now use path aliases

3. **FAQ category conflicts**
   - Resolved: duplicate "How do I use this app?" entries
   - Category assignments reviewed and deduplicated

### iOS Production Build

- `eas build --platform ios --profile production` initiated
- Build in queue for App Store submission
- App Review Board response drafted addressing partnership documentation request

### Shelter Data Updates

- 22 verified shelters in `shelters.sc.json`
- 5 using `callForAddress` model
- My Sister's House converted to `callForAddress` after advocate verification
- All entries have `lastVerified` dates

### SAAM Events

- April 17 event attended: "What Were You Wearing?" Exhibit & Reception
- April 18 event planned: North Charleston Library proclamation with law enforcement, forensic nurses, solicitors
- Registration completed via MUSC REDCap

### Advocate Conversations — Running Tally

**3 conversations, 3 green lights, 0 blockers to Tier 2:**
1. Tiha Allen — March 12
2. Dr. Zakevia Lewis-Kendrick — March 16  
3. Lisa Kennedy — March 23

**Key themes confirmed by multiple advocates:**
- Quick Exit → weather/gallery overlay (confirmed by Tiha + Lewis-Kendrick)
- Quick Exit destination customization (confirmed by Tiha + Lewis-Kendrick)
- QR codes as distribution (confirmed by Tiha + Lewis-Kendrick)
- Abuser tracking concern (surfaced independently in all 3 conversations)
- Data accuracy is highest risk (validated in all 3 conversations)

### MCFG Nonprofit Status

**Articles of Incorporation:**
- Filed via LegalZoom (certified March 24, 2026)
- Known issue: Section 6 has option (b) checked instead of 501(c)(3)-required option (a) for dissolution clause
- Bylaws contain correct language
- Proactive disclosure note drafted for Form 1023 Part XI

**Board composition:**
- Three-person board confirmed
- Treasurer seat intentionally vacant pending finance professional recruitment
- Dr. Bertrina Scott — Board Chair
- Yaunna Stewart — Board Secretary
- Bertram Moore — Executive Director

**Form 1023:**
- Fully drafted
- Next steps: hold first board meeting virtually, open bank account, then file on pay.gov
- Expense ledger created (`MCFG_Expense_Ledger.xlsx`) with Ledger and Summary tabs
- No donations accepted until after 501(c)(3) approval and bank account established

### Documents Created/Updated

- `Bastet_Advocate_Feedback_Combined.docx` — comprehensive feedback from all 3 Tier 1 conversations
- `order_of_operations.html` — MCFG setup checklist and governance roadmap
- `MCFG_Expense_Ledger.xlsx` — nonprofit expense tracking
- `Bastet_PRD_v2.pdf` — updated product requirements
- Board email drafted summarizing beta status

### Technical Decisions Logged

**Location handling pattern:**
- BastBot triggers location request via same `useLocation` hook as home screen
- Permission flow matches existing UX
- GPS timeout handled gracefully with fallback to Browse All Shelters

**Chat UX:**
- Messages persist in AsyncStorage for session continuity
- Quick Exit clears chat history
- Auto-scroll to latest message after each interaction
- Input disabled during location loading to prevent multiple simultaneous requests

**Code patterns:**
- All external links use `expo-web-browser` for iOS compliance
- FAQ matching uses pre-computed scoring, not runtime fuzzy search
- Chat state managed via `useState`, not external state management
- Location coordinates passed via URL params to `/shelters` route

### Testing Status

**iOS:**
- Simulator testing complete
- Physical device testing pending TestFlight approval
- Safari View Controller confirmed working in demo video for App Review

**Android:**
- Internal Testing track live
- One active tester
- All core features verified working

### Pending MCFG To-Do Items

Tracked in `order_of_operations.html`:
- Board meeting cadence and governance (Phase 3)
- D&O insurance research (Phase 2–3)
- Set up GitHub Pages to host `order_of_operations.html` online (flagged for next session)
- Consultant/contributor compensation structure (percentage-of-revenue flagged as problematic for 501(c)(3)s — added to Phase 7 checklist)

### On the Horizon

- Tier 2 beta expansion after Tier 1 advocate feedback incorporated
- Public launch target: May–June
- Treasurer recruitment within 12–18 months
- Lightweight admin system for shelter portal (planned post-MVP scale)
- Neurodivergent UX advisory track (post-beta)

### Key Learnings

**Apple App Store review:**
- DV/safety apps require proactive framing as life-safety navigation tools, not directories
- Demo video of native features necessary to counter 4.2.2 minimum functionality flag
- In-app Safari view (not external browser) required for iOS compliance
- App Review Board may request government/law enforcement partnership documentation

**EAS Android builds:**
- `appVersionSource: remote` overrides local `versionCode`
- Reliable fix: remove it or use production profile with `autoIncrement: true`
- EAS labels AAB downloads as `.apk` — confirm file type via build details page, not filename
- Manually renaming `.apk` → `.aab` corrupts the file

**Play Console Internal Testing:**
- Requires AAB (not APK) for new app submissions
- Tester email must match Google account on test device
- Developer account cannot be added as tester for same app

**Advocate conversations:**
- Abuser tracking concern surfaces independently in every conversation — now permanent briefing item
- `callForAddress` model essential for shelters operating hotel/alternative housing placement
- Advocate conversations are active data quality mechanism, not just feedback collection

**501(c)(3) considerations:**
- Percentage-of-revenue consultant arrangements problematic for 501(c)(3)s due to private benefit rules
- Three financial projections across 3 years established for Form 1023
- Year 2 projections flagged as potentially optimistic

---

## March 23, 2026

### Advocate Feedback — Conversation 3 (Lisa Kennedy)

Third Tier 1 advocate conversation completed. Overall signal: Green.

**Advocate:** Lisa Kennedy, Palmetto Hope Network
**Connected via:** Dr. Zakevia Lewis-Kendrick → Butch Kennedy → Lisa Kennedy

**Key learnings:**
- My Sister's House fully clarified — confirmed as placement agency, not placement space. Sold their property, now places women in hotels throughout tri-county. callForAddress entry is correct.
- callForAddressNote updated with sharper copy: "My Sister's House coordinates shelter placement throughout the tri-county area. They will help find and arrange where you go. Call to get connected."
- Abuser tracking question surfaced independently for the third time — carrier-level activity logs, device surveillance. Answer confirmed and held up. Now a permanent briefing item.
- Data accuracy validated again — SCCADVASA database confirmed as right source.
- Overall reception: enthusiastic. Called it wonderful. Said she wasn't sure why this doesn't already exist.

**Running tally: 3 conversations, 3 green lights, 0 blockers to Tier 2.**

### Apple Appeal — Resubmitted

- Initial rejection: Guideline 4.3(a) spam — automated flag from Expo template similarity
- Appeal submitted with full explanation: original concept, Expo template origin, advocate relationships, shelter portal as evidence of functioning original project
- Added to reviewer notes: 5 Tier 1 beta testers are licensed DV advocates and social workers in SC who have reviewed and endorsed the app
- Resubmitted for review with appeal messaging in reviewer notes
- Awaiting Apple response — 2–5 business days

### Code Updates

- `app/(tabs)/index.tsx` — shelter capacity disclaimer added to shelter card: "Availability varies. Call ahead to confirm space before traveling."
- `data/shelters.sc.json` — My Sister's House callForAddressNote updated with sharper copy

### Documents Updated

- `Bastet_Advocate_Feedback_Combined.docx` — Lisa Kennedy added as Conversation 3, Tiha updated to Tiha Allen throughout, combined synthesis expanded to four-column table
- Board update email drafted with advocate feedback doc and overview deck attached
- Blog post drafted and published to WordPress

### Pending

| Item | Status |
|------|--------|
| Apple appeal response | Waiting — 2–5 business days |
| TestFlight invites | Pending Apple approval |
| Android device | Ordering Tuesday 3/25 |
| Google Play verification | Pending device + DL verification |
| My Sister's House call | Outstanding — Leaeryn leading |
| Tiha Allen focus group call | Wednesday March 25 |
| Butch & Lisa Kennedy shelter verification | In progress |
| April 17 event | Registered |
| April 18 event | Calendared |

---

## March 22, 2026

### Android Emulator Test — API 29 (Android 10)

Full test run completed on Android emulator. Results:

| Test | Result | Notes |
|------|--------|-------|
| App launch — no crashes | ✓ Passed | |
| Validator log — 22/22 | ✓ Passed | 5 call-for-address shelters confirmed |
| Quick Exit | ✓ Passed | Clears from recent apps |
| Privacy cover | ✓ Passed | Activates on background |
| Location permission | ✓ Passed | |
| GPS timeout — shelter list fallback | ✗ Failed | Browse All Shelters CTA did not appear |
| UI layout — Android | ✓ Passed | No breakage |

### GPS Timeout Fallback — Fixed

- **Problem:** When GPS times out, error notice banner showed correctly but no Browse All Shelters CTA appeared. User was stranded.
- **Fix:** Added `status === "error"` handler in `app/(tabs)/index.tsx` — renders Browse All Shelters CTA identical to the permission denied fallback.
- **File:** `app/(tabs)/index.tsx`

### Google Play Developer Account

- Account created
- DL submitted for Google verification
- Pending activation

### Beta Prep

- Leaeryn given questions for My Sister's House contact call
- Beta invite email drafted for all 5 testers: Dr. Bertrina Scott PhD, Tiha Allen, Chloe, Yaunna Stewart, Leaeryn Moore
- Action items tracker built as interactive HTML file

---

## March 21, 2026

### shelters_4.tsx — Resolved

- Investigated `app/shelters_4.tsx` which appeared in the 3/11 commit
- Confirmed: identical to `app/shelters.tsx` — both files already had in-app calling implemented
- In-app calling via `tel:` link is live in the current TestFlight build
- `shelters_4.tsx` deleted — confirmed duplicate, no code loss

### In-App Calling — Confirmed Live (v0.4.1)

- `tel:` link implementation via `Linking.openURL` already present in `shelters.tsx`
- callForAddress entries show tappable call button as primary CTA
- User-initiated only — opens native dialer, user confirms call
- `tel:` links do not work on simulator — physical device test still pending

---

## March 19, 2026

### Shelter Portal — Live

- Deployed to Vercel: https://bastet-ws-surt.vercel.app/
- Features: active shelter list with county filter, "Is this correct?" mailto link on every card, new shelter submission and update form
- All 22 shelters listed with county, phone, callForAddress badge
- Renamed to `index.html` for Vercel root serving

### Neurodivergent UX Feedback — Logged

- Received unsolicited feedback from contact with experience teaching neurodivergent individuals
- Core insight: cognitive load under duress is not uniform — neurodivergent users in crisis may have different design needs
- Contact confirmed for post-beta focus group / advisory role
- Logged as future feature: Neurodivergent UX Review — pressure-test low-cognitive-load design before public launch

### In-App Calling — Scoped as v0.4.1

- callForAddress pattern covers 5 of 22 shelters including closest shelter to Moncks Corner
- Copy-paste of phone numbers on a monitored device is not safe
- Scoped user-initiated calling via `tel:` link as next development task
- Confirmed already built in `shelters.tsx` — see March 21 entry

### Roadmap Updated

- v0.4.1 calling task added as active next task
- Neurodivergent advisory added as Track 3 in beta tracks
- Neurodivergent UX Review added to future features backlog

---

## March 18, 2026

### Apple Developer Account — Activated

- Apple Developer Program approved
- Apple Developer account active and verified

### App Store Connect — Configured

- App record created: Bastet RL (bundle ID: com.marbleceilings.bastet)
- SKU: bastet-mc-2026
- Age rating questionnaire completed — 18+
- App privacy section completed — Data Not Collected
- Content rights declared
- Screenshots uploaded
- Promotional text, description, and keywords written
- Release set to manual

### EAS Build — Submitted to TestFlight

- `eas submit --platform ios` run successfully
- Build submitted for Apple review
- Awaiting TestFlight approval

### Shelter Data — Updated

- My Sister's House schema fixed:
  - Flat `latitude`/`longitude` fields (was nested `coordinates` object)
  - `address: "Charleston, SC"` placeholder added (validator requires field)
  - `phone` corrected — removed erroneous national hotline number
  - `lastVerified` updated to 2026-03-16
  - Source attributed to Dr. Zakevia Lewis-Kendrick
- Palmetto Hope Network (Hanahan, SC) added as 22nd shelter — callForAddress, verified by Dr. Lewis-Kendrick
- Shelter count: 21 → 22
- Validator: 22/22 passed, 5 call-for-address shelters

### Shelter Portal — Built

- `bastet-shelter-portal.html` built and deployed to Vercel
- Active shelter list with county dropdown filter
- "Is this correct?" mailto link on every shelter card — pre-populates email with shelter name, city, county
- New shelter submission form and update request form
- Submissions routed to info@marbleceilings.com via mailto

---

## March 16, 2026

### Advocate Feedback — Conversation 2 (Dr. Zakevia Lewis-Kendrick)

Second Tier 1 advocate conversation completed. Overall signal: Green.

**Advocate:** Dr. Zakevia Lewis-Kendrick, Tri-County S.P.E.A.K.S. / Western Governors University BSW curriculum
**Connected via:** Kimberly Balaguer (March 9, 2026)

**Key learnings:**
- My Sister's House data accuracy hit mid-demo — no longer operates physical shelter. Entry updated to callForAddress before TestFlight.
- New verified shelter lead: Butch & Lisa Kennedy (Georgetown area) — pending verification
- Discreet 911 call feature raised — meaningful idea, outside current scope, legal review required
- Quick Exit weather overlay independently confirmed (second source)
- Quick Exit customizable destination independently confirmed (second source) — elevated to near-term post-beta
- April SAAM events shared — April 17, 18, 24, 29. Registered for April 17, calendared April 18.
- Scope discipline held — 911 feature acknowledged and declined appropriately

**What changed:**
- My Sister's House entry updated to callForAddress
- Palmetto Hope Network (Hanahan) added — verified entry, see March 18
- Quick Exit customizable destination moved to near-term post-beta backlog
- Discreet 911 call formally logged with legal review flag

---

## March 12, 2026

### Advocate Feedback — Conversation 1 (Tiha Allen)

First Tier 1 advocate conversation completed. Overall signal: Green.

**Advocate:** Tiha Allen, DV Advocate / Case Manager

**Key learnings:**
- Disguise layer concern: in-app language like "Find Help Now" is identifiable, not just the icon
- Quick Exit weather display transformation idea surfaced by second participant
- QR codes confirmed as distribution channel — brandless only constraint added
- Shelter capacity flagged as unresolved risk — stronger copy needed before public launch
- Data/impact tension: rehearsed answer needed for institutional pitches
- AI disclosure question anticipated — one-liner prepared
- Survivor focus group offered through case managers — most valuable research available
- Sorority distribution channel identified — 200 members, mandatory DV programming

**What changed:**
- Quick Exit → weather display logged for technical spike post-beta
- QR codes confirmed with brandless constraint
- Shelter capacity disclaimer copy flagged for pre-launch update

### Technical — EAS & TestFlight Setup

- `app.json` updated: bundle identifier `com.marbleceilings.bastet`, package name, scheme `bastet`, `supportsTablet: false`, `userInterfaceStyle: light`
- Dark splash screen variant removed — dark mode not yet built
- EAS CLI installed, npm global permissions resolved
- EAS project ID mismatch resolved via `eas init`
- App icon 1024px delivered and placed by designer
- EAS iOS build completed

### Documents Produced

- Advocate feedback package (questions, template, decision framework)
- Code reviewer brief — filed as `Bastet_Code_Review_Brief.pdf`
- Session learnings doc — `Bastet_Session_Learnings_Mar12.docx`
- Milestone roadmap updated — `Bastet_Milestone_Roadmap_Mar12.docx`
- Blog post drafted and filed

---

## March 11, 2026

### Pre-Beta Review Prep

- PRD v2.0 reviewed and filed as `Bastet_PRD_v2.pdf` — original MVP PRD superseded
- README replaced — Expo boilerplate removed, full product README written and pushed to GitHub
- Code reviewer brief produced — `Bastet_Code_Review_Brief.pdf`
- Git commit pushed: 5 files, 409 insertions, 23 deletions

**Note:** `app/shelters_4.tsx` appeared as a new file in this commit — investigated March 21, confirmed duplicate of `shelters.tsx`, deleted.

### Rideshare Feature — Logged to Backlog

- Transportation identified as documented barrier to escape
- Two models under consideration:
  - Model A: No login, sponsor-funded credit via auto-populated discount code
  - Model B: Existing account, trip history suppressed, discount code applied
- Persona 2 (Planning to Leave) use case
- Next step: BD conversation with Lyft/Uber social impact teams before any product work

---

## March 8, 2026 — Session 3

### TestFlight Readiness Review

Reviewed full checklist for TestFlight submission. Items already complete vs still needed:

**Complete:**
- Privacy statement live at bastet.app/privacy
- WCAG AA audit
- Edge case testing (simulator)
- Both platforms tested

**Still needed before submission:**
- App record created in App Store Connect
- Bundle ID registered and matching app.json
- Apple Developer account active ($99/year)
- app.json version, bundle ID, app name confirmed
- App icon assets at required sizes — waiting on designer
- Splash screen configured
- EAS build run via `eas build --platform ios`
- Age rating questionnaire completed (18+ noted)

**Not needed yet:** Screenshots and full App Store description — those are for public listing, not TestFlight.

---

### PRD Revision — v2.0

Full PRD revision completed section by section using PM feedback as the guide. PDF filed as `Bastet_PRD_v2.pdf`. Original MVP PRD superseded.

**What changed from v1:**

| Section | Change |
|---------|--------|
| North Star | Added — was missing entirely from v1 |
| Problem Statement | Tightened to one sharp statement + supporting context |
| Design Principles | Expanded from 5 implied principles to 5 named and defined |
| Target Users | Single group → 3 distinct personas with what Bastet must do for each |
| MVP Definition | Implied → explicitly stated with in-scope and out-of-scope lists |
| Success Metrics | Vague → measurable proxy metrics, privacy rationale documented |
| Data Strategy | Loose references → verification standard, schema fields, update cadence, portal, liability, Phase 2 plan |
| Distribution | Vague endorsement mention → full trust-routing strategy with channels |
| Privacy Model | Strengthened — usage data decision documented and justified |
| Risks & Mitigations | Thin table → 6 risk categories including legal liability and data ownership |
| Future Considerations | Flat list → phased, dependency-ordered with non-negotiables locked |

**Key decisions made during revision:**
- Shelter portal added to data strategy — gated by org email, manual review, standalone page initially
- Decoy mode formally removed from PRD — replaced by pixel app icon as disguise layer
- Thumbs up/down feedback formally removed — replaced by Report an Issue flag
- Onboarding added to MVP (PRD v1 said no onboarding — we built one)
- Usage data decision documented: intentional choice not to collect, not a technical limitation

---

### Portfolio Case Study

Case study produced using Marble Ceilings portfolio template. Filed as `Bastet_Case_Study.docx`. Covers Project Title, Objective, Synopsis, Process (all 4 milestones + pre-beta), and Results. Project Photos section placeholder left for app screenshots and final icon assets.

---

### Pending Before Next Session

| Item | Status |
|------|--------|
| Advocate callbacks | ⏳ Waiting — 3 in pipeline |
| PM feedback notes | ⏳ Waiting |
| App icon exports from designer | ⏳ Waiting — 1024px, 512px, 180px, 32px |
| Apple Developer account / EAS setup | ⏳ Confirm before TestFlight submission |
| API 29 (Android 10) emulator test | ~ ~20 min run, pending |
| Blog post | ⏳ Deferred — flagged for next session |

---

### Context for Next Session

Drop these files at the start of the new chat for full continuity:
- `changelog.md` — this file
- `Bastet_PRD_v2.pdf` — revised PRD
- Relevant code files for whatever is being worked on

---

## March 6, 2026 — Session 2

### Logo Review — Final Direction

Reviewed four logo variations from designer (pixel version, vector on white, vector on dark, shield seal).
Selected direction:

- Pixel/16-bit version → app icon only (disguise layer on home screen)
- "Bastet" wordmark in Playfair Display → inside the app, no logo in header
- Logo does not appear inside the app at all — text-only header preserves discretion

Rationale: The detailed Egyptian mark inside the app risks breaking the disguise. The serif wordmark reads as a game title. Clean separation of purpose — icon does the disguise job, wordmark holds the in-app identity.
Next step: Designer to export pixel version at App Store icon sizes — 1024px, 512px, 180px, 32px.

### Beta Test Plan — v1.0

First formal beta test plan produced. PDF artifact filed as `Bastet_Beta_Test_Plan.pdf`.
8 sections:

- Overview and beta goals (Tier 1 + Tier 2)
- Tester profiles — Tier 1 (5–8 advocates/familiar contacts), Tier 2 (15–25 trusted network)
- Current Tier 1 pipeline — 3 advocates (callbacks pending), 2 familiar contacts (ready to invite)
- Distribution — TestFlight (iOS, email invite only for Tier 1), Google Play Internal Testing (Android)
- Feedback collection — Tier 1 structured conversation with 5 core questions, Tier 2 Google Form
- What to watch for — safety-critical, data trust, UX clarity, technical
- Timeline — pre-beta through App Store submission
- Post-beta backlog — sorting/filtering, icons, dark mode, anonymous feedback, national scaling

Key decisions:

- Tier 1 runs before Tier 2 — advocate feedback shapes whether anything changes first
- Tier 1 invite by email only — no public TestFlight link, consistent with discretion principle
- Feedback collected via real conversation for Tier 1, short Google Form for Tier 2

### UI/UX Feedback — Resolved

Received feedback from UI/UX specialist. All items addressed or formally triaged.

| Feedback | Decision |
|----------|----------|
| Sticky Quick Exit header on scrollable screens | ✓ Implemented |
| Icons for distance/city/pet friendly on shelter cards | ~ Backlogged — not a blocker |
| Contrast accessibility check | ✓ Already resolved in M4 WCAG AA audit |
| Sorting/filtering on Shelters screen | ~ Post-beta — pending Tier 1 advocate feedback |

### Sticky Header — Shelters & Support Screens

**Problem:** Quick Exit button scrolled out of view on both scrollable screens.
**Fix:** Pulled header and page title outside ScrollView/FlatList on both screens. Header is now fixed at the top regardless of scroll position.

Files changed:
- `app/shelters.tsx` — header + pageTitle wrapped in stickyTop View above FlatList
- `app/(tabs)/explore.tsx` — header + titleBlock wrapped in stickyTop View above ScrollView
- Removed dead `IconSymbol` import from `explore.tsx`

### Bug Fix — Permission Denied Shows No Shelter Path (iOS)

**Problem:** Location permission denied → notice banner shown but no path to shelter list.
**Fix:** Added `status === "denied"` intercept before `!showCard` check. Renders Browse All Shelters CTA routing to `/shelters` with empty lat/lon params.
**File:** `app/(tabs)/index.tsx`
**Tested:** ✓ Passed on iOS simulator

### Edge Case Testing — iOS Simulator

| Test | Result | Notes |
|------|--------|-------|
| Permission denied | ✓ Fixed + passed | Bug fixed this session |
| Location services off | ✓ Passed | |
| GPS timeout | ⏭ Deferred | Needs physical device |
| Last known location stale | ⏭ Deferred | Needs physical device |
| Quick Exit — every screen | ✓ Passed | Home, Support, Shelters, Settings, Onboarding |
| Quick Exit — mid-action | ✓ Passed | No ghost state on reopen |
| Quick Exit — rapid taps | ✓ Passed | No duplicate browser tabs |
| No internet | ⏭ Deferred | Needs physical device |
| Validator log — 21/21 | ✓ Passed | No data regressions |
| Onboarding replay from Settings | ✓ Passed | |

### Privacy Statement — Live

Privacy policy written and hosted at https://sites.google.com/view/bastet-privacy/. URL confirmed loading. App Store Connect ready. `settings.tsx` already pointing to live URL — no code change required.

---

## February 28, 2026

### SafeAreaView — API 30 Testing

Tested on Android API 30 (Android 11) emulator. All screens pass. SafeAreaView backlog item closed.

### Settings Screen

New screen accessible from Support tab via "Settings" text link at the bottom.

| Section | Item | Behavior |
|---------|------|----------|
| Privacy & Safety | Replay Privacy Introduction | Calls `useOnboarding.reset()`, navigates to /About |
| Privacy & Safety | Privacy Statement | Opens bastet.app/privacy |
| About | App Version | Static display, 0.4.0 (M4), no chevron |

Footer copy: "Bastet collects no personal data. No account. No history. No trace."

Files added/changed:
- `app/settings.tsx` — new screen, Quick Exit and SafeAreaView included
- `app/(tabs)/explore.tsx` — Settings text link added below sources footer

---

## February 24–27, 2026

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

**Files added/changed:**
- `app/onboarding.tsx` — 2-screen component, fade transition (180ms/220ms)
- `src/utils/useOnboarding.ts` — AsyncStorage hook, `shouldShow`, `complete()`, `reset()`
- `app/(tabs)/index.tsx` — onboarding gate, all hooks moved above conditional returns

### Android — Heart Icon Fix

Replaced `IconSymbol` (SF Symbols, iOS only) with `MaterialIcons` from `@expo/vector-icons` on Android Support tab.

### WCAG AA Accessibility Audit — Complete

All screens pass WCAG AA contrast requirements. All interactive elements meet 44pt minimum touch target.

---

## Milestone 4 — Pre-Beta Polish (v0.4.0) (2/28/26)

- Onboarding flow ✓
- Android heart icon fix ✓
- Accessibility audit — WCAG AA ✓
- SafeAreaView API 30 testing ✓
- Settings screen ✓

M4 complete.

---

## Milestone 3 — UX Design System & Screen Implementation (v0.7) (2/22/26)

### Screen Implementation
- Applied full M3 design system to all screens — zero hardcoded colors, fonts, or spacing remain
- `index.tsx` — hero section with Playfair Display headline, eggplant CTA button, call-for-address gold card, shelter meta row, resources button
- `explore.tsx` — full Support tab built: collapsible hotlines section, six resource rows, all wired to real URLs
- `shelters.tsx` — eggplant directions button, pet-friendly tag, per-card report issue widget
- `_layout.tsx` — useFonts(FONT_MAP) wired correctly inside component, font load gate added

### Font System
- `@expo-google-fonts/playfair-display` and `@expo-google-fonts/dm-sans` installed
- Font load gate prevents flash of unstyled text on app launch

### Platform Fixes
- `SafeAreaView` import swapped from `react-native` to `react-native-safe-area-context` on all screens
- `Platform.OS` android check on header paddingTop — prevents Quick Exit crowding into status bar

### Data Validation — Confirmed
- `[ShelterValidation] 21/21 passed. 3 are call-for-address shelters.` confirmed on Android emulator startup

---

## Milestone 2 — Data & Logic Hardening (v0.4) (2/21/26)

### Schema Overhaul
- Replaced broken nested array structure with clean flat JSON array
- Standardized all phone numbers to `(xxx) xxx-xxxx` format
- Fixed Chesterfield address typo, Sumter zip code, Marion coordinates

### New Fields
- `hotline` — separate from `phone`, surfaces 24/7 crisis lines distinctly
- `hasPetOptions` — boolean flag for pet-friendly shelters

### callForAddress Pattern
- `callForAddress: true` for shelters that withhold physical address for resident safety
- App never shows a directions button for these shelters

### Shelter Data: 5 → 21 Verified Entries
- 18 shelters fully verified with address, coordinates, phone, and `lastVerified` date
- 3 shelters marked `callForAddress: true`: Family Justice Center (Georgetown), Meg's House (Greenwood), The Safe Home (Clinton)

### Validator Updates — Schema v2.1
- `callForAddress: true` requires phone/hotline + note — enforced
- `verified: true` requires `lastVerified` date — enforced
- Placeholder addresses hard-rejected
- Runtime validation log on startup

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
