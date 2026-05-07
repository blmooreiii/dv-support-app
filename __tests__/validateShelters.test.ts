import {
  isValidShelter,
  validateSheltersRuntime,
  canGetDirections,
  getCallForAddressNote,
} from "../src/utils/validateShelters";

// Minimal valid shelter fixture
const BASE: Record<string, unknown> = {
  id: "shelter-001",
  name: "Safe Haven",
  city: "Columbia",
  state: "SC",
  address: "123 Main St",
  latitude: 34.0,
  longitude: -81.0,
  phone: "803-555-0100",
  hotline: null,
  website: "https://example.org",
  contactPreference: "phone",
  callForAddress: false,
  verified: true,
  lastVerified: "2026-01-15",
  source: "SCCADVASA",
};

function shelter(overrides: Record<string, unknown> = {}) {
  return { ...BASE, ...overrides };
}

// ─── isValidShelter ───────────────────────────────────────────────────────────

describe("isValidShelter", () => {
  it("accepts a fully valid shelter", () => {
    expect(isValidShelter(shelter())).toBe(true);
  });

  it("rejects null and non-objects", () => {
    expect(isValidShelter(null)).toBe(false);
    expect(isValidShelter("string")).toBe(false);
    expect(isValidShelter(42)).toBe(false);
    expect(isValidShelter(undefined)).toBe(false);
  });

  it("rejects missing required string fields", () => {
    for (const field of ["id", "name", "city", "state", "address", "source"]) {
      expect(isValidShelter(shelter({ [field]: "" }))).toBe(false);
      expect(isValidShelter(shelter({ [field]: null }))).toBe(false);
    }
  });

  it("rejects placeholder address", () => {
    expect(isValidShelter(shelter({ address: "NEEDS VERIFICATION" }))).toBe(false);
  });

  it("rejects out-of-range coordinates", () => {
    expect(isValidShelter(shelter({ latitude: 91 }))).toBe(false);
    expect(isValidShelter(shelter({ latitude: -91 }))).toBe(false);
    expect(isValidShelter(shelter({ longitude: 181 }))).toBe(false);
    expect(isValidShelter(shelter({ longitude: -181 }))).toBe(false);
  });

  it("rejects non-finite coordinates", () => {
    expect(isValidShelter(shelter({ latitude: NaN }))).toBe(false);
    expect(isValidShelter(shelter({ latitude: Infinity }))).toBe(false);
  });

  it("rejects invalid phone formats", () => {
    expect(isValidShelter(shelter({ phone: "123" }))).toBe(false);
    expect(isValidShelter(shelter({ phone: "not-a-number" }))).toBe(false);
  });

  it("accepts null phone (optional)", () => {
    expect(isValidShelter(shelter({ phone: null, contactPreference: "hotline", hotline: "800-555-0199" }))).toBe(true);
  });

  it("rejects invalid website (no protocol)", () => {
    expect(isValidShelter(shelter({ website: "example.org" }))).toBe(false);
    expect(isValidShelter(shelter({ website: "ftp://bad-protocol.org" }))).toBe(false);
  });

  it("accepts null website", () => {
    expect(isValidShelter(shelter({ website: null }))).toBe(true);
  });

  it("rejects invalid contactPreference values", () => {
    expect(isValidShelter(shelter({ contactPreference: "email" }))).toBe(false);
    expect(isValidShelter(shelter({ contactPreference: 42 }))).toBe(false);
  });

  it("accepts all valid contactPreference values", () => {
    for (const v of [null, "phone", "website", "hotline"]) {
      expect(isValidShelter(shelter({ contactPreference: v }))).toBe(true);
    }
  });

  it("rejects lastVerified with wrong format", () => {
    expect(isValidShelter(shelter({ lastVerified: "01/15/2026" }))).toBe(false);
    expect(isValidShelter(shelter({ lastVerified: "2026-1-5" }))).toBe(false);
  });

  it("accepts null lastVerified for unverified shelters", () => {
    expect(isValidShelter(shelter({ verified: false, lastVerified: null }))).toBe(true);
  });

  it("rejects verified=true without lastVerified", () => {
    expect(isValidShelter(shelter({ verified: true, lastVerified: null }))).toBe(false);
  });

  // SECURITY: callForAddress shelters must not be shown without phone/note
  describe("callForAddress safety rules", () => {
    it("rejects callForAddress=true with no phone or hotline", () => {
      expect(
        isValidShelter(
          shelter({ callForAddress: true, phone: null, hotline: null, callForAddressNote: "Call us" })
        )
      ).toBe(false);
    });

    it("rejects callForAddress=true without a callForAddressNote", () => {
      expect(
        isValidShelter(
          shelter({ callForAddress: true, phone: "803-555-0100", callForAddressNote: "" })
        )
      ).toBe(false);
    });

    it("accepts callForAddress=true with phone and note", () => {
      expect(
        isValidShelter(
          shelter({
            callForAddress: true,
            phone: "803-555-0100",
            callForAddressNote: "Call for confidential address",
          })
        )
      ).toBe(true);
    });

    it("accepts callForAddress=true with hotline (no phone)", () => {
      expect(
        isValidShelter(
          shelter({
            callForAddress: true,
            phone: null,
            hotline: "800-555-0199",
            callForAddressNote: "Call for address",
          })
        )
      ).toBe(true);
    });
  });
});

// ─── validateSheltersRuntime ──────────────────────────────────────────────────

describe("validateSheltersRuntime", () => {
  it("returns empty array for non-array input", () => {
    expect(validateSheltersRuntime(null)).toEqual([]);
    expect(validateSheltersRuntime({})).toEqual([]);
    expect(validateSheltersRuntime("bad")).toEqual([]);
  });

  it("filters out invalid entries, keeps valid ones", () => {
    const input = [shelter(), { id: "", name: "Bad" }, shelter({ id: "shelter-002", name: "Second" })];
    const result = validateSheltersRuntime(input);
    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual(["shelter-001", "shelter-002"]);
  });

  it("flattens nested arrays (handles shelters.sc.json format)", () => {
    const nested = [[shelter()], [shelter({ id: "shelter-002", name: "Second" })]];
    const result = validateSheltersRuntime(nested);
    expect(result).toHaveLength(2);
  });

  it("returns empty array when all entries are invalid", () => {
    expect(validateSheltersRuntime([{ id: "", name: "" }])).toEqual([]);
  });

  it("does not throw on malformed input", () => {
    expect(() => validateSheltersRuntime([null, undefined, 42, "bad"])).not.toThrow();
  });
});

// ─── canGetDirections ─────────────────────────────────────────────────────────

describe("canGetDirections", () => {
  it("returns true for a normal shelter", () => {
    const s = shelter() as any;
    expect(canGetDirections(s)).toBe(true);
  });

  it("returns false for callForAddress shelters", () => {
    const s = shelter({ callForAddress: true }) as any;
    expect(canGetDirections(s)).toBe(false);
  });

  it("treats callForAddress=false the same as absent", () => {
    const s = shelter({ callForAddress: false }) as any;
    expect(canGetDirections(s)).toBe(true);
  });
});

// ─── getCallForAddressNote ────────────────────────────────────────────────────

describe("getCallForAddressNote", () => {
  it("returns null for a normal shelter", () => {
    const s = shelter() as any;
    expect(getCallForAddressNote(s)).toBeNull();
  });

  it("returns the custom note for callForAddress shelters", () => {
    const s = shelter({ callForAddress: true, callForAddressNote: "Call us first" }) as any;
    expect(getCallForAddressNote(s)).toBe("Call us first");
  });

  it("returns the default note when callForAddressNote is absent", () => {
    const s = shelter({ callForAddress: true, callForAddressNote: undefined }) as any;
    const note = getCallForAddressNote(s);
    expect(note).toBeTruthy();
    expect(typeof note).toBe("string");
  });
});
