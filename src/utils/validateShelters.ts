// utils/validateShelters.ts

export type Shelter = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;

  // optional fields you may already have
  phone?: string;
  website?: string;
  address1?: string;
  address2?: string;
  state?: string;
  zip?: string;
};

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
const isValidLon = (lon: number) => lon >= -180 && lon <= 180;

export function isValidShelter(s: any): s is Shelter {
  if (!s || typeof s !== "object") return false;

  if (!isNonEmptyString(s.id)) return false;
  if (!isNonEmptyString(s.name)) return false;
  if (!isNonEmptyString(s.city)) return false;

  if (!isFiniteNumber(s.latitude) || !isValidLat(s.latitude)) return false;
  if (!isFiniteNumber(s.longitude) || !isValidLon(s.longitude)) return false;

  return true;
}

/**
 * Validates at runtime, filters invalid entries safely.
 * - Never throws
 * - Logs only in dev
 * - Returns [] on malformed input
 */
export function validateSheltersRuntime(input: unknown): Shelter[] {
  try {
    const arr = Array.isArray(input) ? input : [];
    const valid = arr.filter(isValidShelter);

    if (__DEV__) {
      const invalidCount = arr.length - valid.length;
      if (invalidCount > 0) {
        // Dev-only; do not log in production
        console.warn(`[ShelterValidation] Filtered ${invalidCount} invalid shelter entries.`);
      }
    }

    return valid;
  } catch {
    // Absolute "never crash" guarantee
    return [];
  }
}
