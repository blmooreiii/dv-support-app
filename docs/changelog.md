# DV Support App — Dev Changelog

## v1.5 — Safety & Trust Pass (Feb 2026)
- Added verified badge to shelter cards
- Implemented quick exit + privacy overlay
- Reduced visual noise on home screen
- Prioritized speed over feature depth
- Deferred phone numbers to Phase 2 to avoid cognitive overload

## v1.0 — MVP
- Location-based shelter discovery
- Nearest shelter surfaced first
- One-tap directions
- Offline hotline fallback

## Phase 2 – Not Implemented Yet
- Shelter phone numbers (call / text toggle)
- Website CTA first, phone later
- Android testing

## Support/Safety Polish (2/8/26)
- Fixed broken Tech Safety & Privacy link to the official TechSafety.org Survivor Toolkit
- Hardened Quick Exit behavior with clearer intent and accessibility label
- Improved Support card readability (subtitle color + line height)
- Updated Sources styling to black for authority and trust
 -Added inline documentation for safety-related behavior

 ## Milestone 1 — Safety Baseline Lock (v0.3) (2/13/26)
Objective - Establish cross-platform privacy and deterministic error handling before UI expansion or feature growth.

✅ Acceptance Criteria — PASSED
🔐 Privacy Layer (iOS)

App switcher preview obscures sensitive content
No visual flash of shelter content on foreground restore
Rapid background/foreground switching stable (10-cycle test)
No console warnings or unhandled promise rejections

🔐 Privacy Layer (Android)
Recents thumbnail secured (FLAG_SECURE enabled)
Screenshots blocked
No shelter content visible in system preview
Quick Exit resets state before external redirect

📍 Location Handling (Both Platforms)
Permission denied → deterministic “Location access is off” UI
Location services disabled → explicit error state
No infinite spinner states
No silent failures
Invalid coordinate handling prevents NaN distance
No crash when shelter list empty

🗺️ Emergency Routing
Maps deep link launches successfully
No crash if maps unavailable
Quick Exit resets state before redirect

🧠 Engineering Discipline
AppState listener cleaned up properly
No duplicate listeners
No debug console logs
No sensitive data persisted locally
No AsyncStorage storing location

🔒 Milestone Definition of Done
Cross-platform parity verified (iOS + Android)
Recents preview protected
Screenshots blocked on Android
All error states deterministic
Manual validation cycles completed
No runtime crashes observed
Version Tag

v0.3 — Safety Baseline Locked

## Milestone 2 — v0.4 (Data & Logic Hardening) (2/15/26)
- Implemented runtime shelter schema validation; invalid entries filtered safely (no production logging)
- Added controlled empty state messaging when shelter listings are unavailable/corrupted
- Added deterministic distance guard to prevent fallback-distance selection and “999999 miles” edge cases
- Centralized user-facing notice logic to prevent overlapping/stacked error states
- Verified behavior for location services OFF and permission DENIED (both pass)

