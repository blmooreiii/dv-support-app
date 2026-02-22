// src/utils/validateShelters.ts
// Milestone 2 (v0.4) — Data Trust Layer
// Schema version: 2.1

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContactPreference = "phone" | "website" | "hotline" | null;

export type Shelter = {
  // Identity
  id: string;
  name: string;

  // Location
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;

  // Contact
  phone: string | null;
  hotline?: string | null;
  website: string | null;
  contactPreference: ContactPreference;

  // Confidential address shelters
  // Some DV shelters intentionally withhold their physical address
  // for the safety of current residents. When callForAddress is true:
  //   - coordinates are city-center (for distance sorting only)
  //   - the app must NOT show a street address or directions button
  //   - the app must show callForAddressNote and prompt user to call
  callForAddress?: boolean;
  callForAddressNote?: string;

  // Optional attributes
  hasPetOptions?: boolean;

  // Trust
  verified: boolean;
  lastVerified: string | null; // ISO date string e.g. "2026-02-21"
  source: string;
};

// ─── Field Validators ────────────────────────────────────────────────────────

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
const isValidLon = (lon: number) => lon >= -180 && lon <= 180;

const isValidPhone = (v: unknown): boolean => {
  if (v === null || v === undefined) return true;
  if (typeof v !== "string") return false;
  return /\d{7,}/.test(v.replace(/\D/g, ""));
};

const isValidWebsite = (v: unknown): boolean => {
  if (v === null || v === undefined) return true;
  if (typeof v !== "string") return false;
  return v.startsWith("http://") || v.startsWith("https://");
};

const isValidLastVerified = (v: unknown): boolean => {
  if (v === null || v === undefined) return true;
  if (typeof v !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
};

const isValidContactPreference = (v: unknown): v is ContactPreference =>
  v === null || v === "phone" || v === "website" || v === "hotline";

// ─── Entry Validator ─────────────────────────────────────────────────────────

export function isValidShelter(s: any): s is Shelter {
  if (!s || typeof s !== "object") return false;

  if (!isNonEmptyString(s.id)) return false;
  if (!isNonEmptyString(s.name)) return false;
  if (!isNonEmptyString(s.city)) return false;
  if (!isNonEmptyString(s.state)) return false;
  if (!isNonEmptyString(s.source)) return false;
  if (!isNonEmptyString(s.address)) return false;
  if (s.address === "NEEDS VERIFICATION") return false;

  if (!isFiniteNumber(s.latitude) || !isValidLat(s.latitude)) return false;
  if (!isFiniteNumber(s.longitude) || !isValidLon(s.longitude)) return false;

  // callForAddress shelters must have a phone/hotline and a note
  if (s.callForAddress === true) {
    if (s.phone === null && s.hotline === null) return false;
    if (!isNonEmptyString(s.callForAddressNote)) return false;
  }

  if (!isValidPhone(s.phone)) return false;
  if (!isValidPhone(s.hotline)) return false;
  if (!isValidWebsite(s.website)) return false;
  if (!isValidContactPreference(s.contactPreference)) return false;
  if (typeof s.verified !== "boolean") return false;
  if (!isValidLastVerified(s.lastVerified)) return false;
  if (s.verified === true && !s.lastVerified) return false;

  return true;
}

// ─── Runtime Validator ───────────────────────────────────────────────────────

export function validateSheltersRuntime(input: unknown): Shelter[] {
  try {
    const arr = Array.isArray(input) ? (input as any[]).flat() : [];
    const valid = arr.filter(isValidShelter);

    if (__DEV__) {
      const invalidCount = arr.length - valid.length;
      if (invalidCount > 0) {
        console.warn(`[ShelterValidation] Filtered ${invalidCount} invalid entries.`);
        arr.forEach((s: any) => {
          if (!isValidShelter(s)) {
            const label = s?.name ?? s?.id ?? "unknown";
            console.warn(`[ShelterValidation] Rejected "${label}": ${diagnoseShelter(s)}`);
          }
        });
      }

      const idSet = new Set<string>();
      const duplicateIds: string[] = [];
      for (const s of valid) {
        if (idSet.has(s.id)) duplicateIds.push(s.id);
        else idSet.add(s.id);
      }
      if (duplicateIds.length > 0) {
        console.warn(`[ShelterValidation] Duplicate IDs: ${duplicateIds.join(", ")}`);
      }

      const callForAddressCount = valid.filter((s) => s.callForAddress).length;
      console.log(
        `[ShelterValidation] ${valid.length}/${arr.length} passed. ` +
        `${callForAddressCount} are call-for-address shelters.`
      );
    }

    return valid;
  } catch {
    return [];
  }
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns true if the shelter has a routable address for Maps.
 * Never show a directions button for callForAddress shelters.
 */
export function canGetDirections(shelter: Shelter): boolean {
  return shelter.callForAddress !== true;
}

/**
 * Returns the note to display for callForAddress shelters, or null.
 */
export function getCallForAddressNote(shelter: Shelter): string | null {
  if (!shelter.callForAddress) return null;
  return (
    shelter.callForAddressNote ??
    "Address is kept confidential for resident safety. Call to arrange access."
  );
}

// ─── Dev Diagnostic ──────────────────────────────────────────────────────────

function diagnoseShelter(s: any): string {
  if (!s || typeof s !== "object") return "not an object";
  if (!isNonEmptyString(s.id)) return "missing id";
  if (!isNonEmptyString(s.name)) return "missing name";
  if (!isNonEmptyString(s.city)) return "missing city";
  if (!isNonEmptyString(s.state)) return "missing state";
  if (!isNonEmptyString(s.address)) return "missing address";
  if (s.address === "NEEDS VERIFICATION") return "address is placeholder";
  if (!isFiniteNumber(s.latitude) || !isValidLat(s.latitude)) return "invalid latitude";
  if (!isFiniteNumber(s.longitude) || !isValidLon(s.longitude)) return "invalid longitude";
  if (s.callForAddress === true && !isNonEmptyString(s.callForAddressNote)) return "callForAddress requires callForAddressNote";
  if (s.callForAddress === true && s.phone === null && s.hotline === null) return "callForAddress requires phone or hotline";
  if (!isValidPhone(s.phone)) return "invalid phone";
  if (!isValidPhone(s.hotline)) return "invalid hotline";
  if (!isValidWebsite(s.website)) return "invalid website";
  if (!isValidContactPreference(s.contactPreference)) return "invalid contactPreference";
  if (typeof s.verified !== "boolean") return "verified must be boolean";
  if (!isValidLastVerified(s.lastVerified)) return "lastVerified must be null or YYYY-MM-DD";
  if (s.verified === true && !s.lastVerified) return "verified=true requires lastVerified";
  return "unknown reason";
}
