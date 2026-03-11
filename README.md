# Bastet

A privacy-first mobile app that helps domestic violence survivors locate verified shelters and emergency resources — leaving no trace on their device.

Built by [Marble Ceilings](mailto:info@marbleceilings.com) · React Native / Expo · iOS + Android

---

## What It Does

Bastet helps someone experiencing domestic violence find a nearby verified shelter or access emergency hotlines within seconds — with no account, no stored identity, and no history left behind.

The app is designed to work under real conditions: a shared device, limited time, unstable internet, and high stress. Every decision in the product is evaluated against that standard.

---

## Core Features

- **Find Help Now** — location-based shelter locator, nearest verified shelter surfaced first, one-tap directions handoff to device maps
- **Resources & Hotlines** — national and SC-specific crisis lines, safety planning, legal aid, tech safety — all accessible offline
- **Quick Exit** — closes the app and clears it from recent apps in under 120ms, opens weather.com as neutral cover
- **Privacy Cover** — blanks the screen when the app is backgrounded; no content flash in the app switcher
- **Disguise Layer** — app icon is a pixel/16-bit mark designed to read as an indie game on a home screen
- **Offline Fallback** — hotlines and resources always available without location or internet
- **callForAddress Pattern** — confidential shelters prompt a call; physical address and directions are never shown
- **21 Verified SC Shelters** — manually verified dataset, schema-validated on every launch

---

## Design Principles

In order of priority — a lower principle does not override a higher one.

1. **Trust Is the Product** — every interaction either builds or erodes user trust
2. **Privacy Is Table Stakes** — no account, no stored identity, no behavioral tracking
3. **Discretion Over Visibility** — the app should never look like what it is on a shared screen
4. **Navigation Tool Only** — Bastet finds resources; it does not intervene or promise outcomes
5. **Graceful Degradation** — remains useful without internet, without location, without the happy path

---

## Privacy Model

Bastet does not collect:
- User accounts or identifying information
- Location data (calculated on-device, used once, discarded)
- Session logs or usage history
- Behavioral analytics or engagement data
- Advertising IDs or device fingerprints
- Any third-party analytics SDK data

Bastet stores one thing locally: a single boolean indicating whether onboarding has been completed. Nothing else persists between sessions.

Privacy policy: [bastet.app/privacy](https://sites.google.com/view/bastet-privacy/)

---

## Stack

| Layer | Detail |
|-------|--------|
| Framework | React Native / Expo |
| Routing | Expo Router (file-based) |
| Platforms | iOS + Android |
| Fonts | Playfair Display · DM Sans |
| Local storage | AsyncStorage — one boolean only |
| Shelter data | Bundled JSON · 21 SC entries · Schema v2.1 |
| Distribution | TestFlight (iOS) · Google Play Internal Testing (Android) |

---

## Project Structure

```
app/
  (tabs)/
    index.tsx         # Home screen — Find Help Now + Resources entry
    explore.tsx       # Support screen — hotlines, resources
  shelters.tsx        # Full shelter list
  settings.tsx        # Privacy statement, onboarding replay, app version
  onboarding.tsx      # First-launch privacy promise + Quick Exit tutorial
```

---

## Shelter Data

Shelter data is stored as a flat JSON array and ships with the app. No network request is required to display shelters.

A shelter entry is considered verified when:
- Physical address, coordinates, and phone number are confirmed against the organization's own published contact information or direct outreach
- A `lastVerified` date is recorded in ISO format
- The entry passes schema v2.1 validation on launch

Shelters that cannot be independently confirmed do not appear in the app.

To report an inaccuracy or submit a new listing, use the shelter portal (organizational email required — all submissions reviewed manually before any change goes live).

---

## Safety-Critical Behavior

### Quick Exit
The Quick Exit button is present on every screen via a sticky header that never scrolls away. It closes the app, clears it from recent apps, and opens weather.com — all in under 120ms. This behavior is tested across all screens, all interaction states, and rapid-tap scenarios before every release.

### Schema Validator
Runs on every app launch. All 21 shelter entries must pass schema v2.1 validation before any data reaches the UI. Invalid entries are filtered silently rather than surfaced to the user.

### callForAddress
Some shelters intentionally withhold their physical address to protect residents. These entries display a call prompt and a plain-language explanation. The app never shows a directions button for these shelters.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# iOS simulator
npx expo run:ios

# Android emulator
npx expo run:android
```

Requires Node.js and Expo CLI. For TestFlight and Play Store builds, EAS Build is used (`eas build --platform ios|android`).

---

## Status

Currently in pre-beta. Tier 1 beta (DV advocates) in progress. Tier 2 (trusted network) to follow.

Phase 1 covers South Carolina only. National expansion via API layer is planned for Phase 2.

---

## About

Bastet is a [Marble Ceilings](mailto:info@marbleceilings.com) project. It is not affiliated with any shelter organization or government agency. It is a navigation tool — it helps people find resources, and does not guarantee shelter availability or outcomes.

The app is intended for adults 18 and older.
