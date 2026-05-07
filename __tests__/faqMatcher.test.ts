import { matchQuery, getFAQsByCategory, getSuggestedQuestions } from "../src/utils/faqMatcher";
import { FAQ_CATEGORIES, FAQ_DATA } from "../src/data/faqData";

// ─── matchQuery ───────────────────────────────────────────────────────────────

describe("matchQuery", () => {
  it("returns empty array for empty or very short queries", () => {
    expect(matchQuery("")).toEqual([]);
    expect(matchQuery("  ")).toEqual([]);
    expect(matchQuery("a")).toEqual([]);
  });

  it("returns at most maxResults items", () => {
    const results = matchQuery("abuse help shelter", 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("defaults to 3 results", () => {
    const results = matchQuery("what is domestic violence");
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it("matches 'what is domestic violence' with high confidence", () => {
    const results = matchQuery("what is domestic violence");
    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    expect(["exact", "high"]).toContain(top.matchType);
    expect(top.item.question.toLowerCase()).toContain("domestic violence");
  });

  it("matches 'warning signs of abuse' correctly", () => {
    const results = matchQuery("warning signs of abuse");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.question.toLowerCase()).toMatch(/warning|sign|abuse/);
  });

  it("returns results sorted by score descending", () => {
    const results = matchQuery("safety plan leave abuser");
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("does not return results below the scoring threshold", () => {
    const results = matchQuery("zzz completely unrelated gibberish");
    expect(results).toEqual([]);
  });

  it("assigns correct matchType based on score thresholds", () => {
    const results = matchQuery("what is domestic violence");
    for (const r of results) {
      if (r.score >= 0.8) expect(r.matchType).toBe("exact");
      else if (r.score >= 0.5) expect(r.matchType).toBe("high");
      else if (r.score >= 0.25) expect(r.matchType).toBe("medium");
      else expect(r.matchType).toBe("low");
    }
  });

  it("is case-insensitive", () => {
    const lower = matchQuery("domestic violence");
    const upper = matchQuery("DOMESTIC VIOLENCE");
    expect(lower.length).toBeGreaterThan(0);
    expect(lower[0].item.id).toBe(upper[0].item.id);
  });

  it("ignores punctuation", () => {
    const clean = matchQuery("what is domestic violence");
    const punctuated = matchQuery("what is domestic violence?!");
    expect(clean.length).toBeGreaterThan(0);
    expect(clean[0].item.id).toBe(punctuated[0].item.id);
  });

  it("handles long queries without throwing", () => {
    const longQuery = "a".repeat(500);
    expect(() => matchQuery(longQuery)).not.toThrow();
  });
});

// ─── getFAQsByCategory ────────────────────────────────────────────────────────

describe("getFAQsByCategory", () => {
  it("returns only items belonging to the requested category", () => {
    for (const cat of FAQ_CATEGORIES) {
      const items = getFAQsByCategory(cat);
      expect(items.every((item) => item.category === cat)).toBe(true);
    }
  });

  it("returns a non-empty array for each defined category", () => {
    for (const cat of FAQ_CATEGORIES) {
      expect(getFAQsByCategory(cat).length).toBeGreaterThan(0);
    }
  });

  it("returns empty array for unknown category", () => {
    expect(getFAQsByCategory("Nonexistent Category")).toEqual([]);
  });
});

// ─── getSuggestedQuestions ────────────────────────────────────────────────────

describe("getSuggestedQuestions", () => {
  it("returns the requested number of suggestions", () => {
    expect(getSuggestedQuestions(3)).toHaveLength(3);
    expect(getSuggestedQuestions(2)).toHaveLength(2);
    expect(getSuggestedQuestions(1)).toHaveLength(1);
  });

  it("returns valid FAQItem objects", () => {
    const suggestions = getSuggestedQuestions(3);
    for (const item of suggestions) {
      expect(typeof item.id).toBe("number");
      expect(typeof item.question).toBe("string");
      expect(typeof item.answer).toBe("string");
      expect(Array.isArray(item.keywords)).toBe(true);
      expect(Array.isArray(item.phrases)).toBe(true);
    }
  });

  it("returns items that exist in FAQ_DATA", () => {
    const suggestions = getSuggestedQuestions(3);
    const ids = FAQ_DATA.map((f) => f.id);
    for (const item of suggestions) {
      expect(ids).toContain(item.id);
    }
  });
});

// ─── FAQ_DATA integrity ───────────────────────────────────────────────────────

describe("FAQ_DATA integrity", () => {
  it("has no duplicate IDs", () => {
    const ids = FAQ_DATA.map((f) => f.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every item has a non-empty question and answer", () => {
    for (const item of FAQ_DATA) {
      expect(item.question.trim()).not.toBe("");
      expect(item.answer.trim()).not.toBe("");
    }
  });

  it("every item's category is a known category", () => {
    const known = new Set<string>(FAQ_CATEGORIES);
    for (const item of FAQ_DATA) {
      expect(known.has(item.category)).toBe(true);
    }
  });

  it("every item has at least one keyword and one phrase", () => {
    for (const item of FAQ_DATA) {
      expect(item.keywords.length).toBeGreaterThan(0);
      expect(item.phrases.length).toBeGreaterThan(0);
    }
  });

  it("any links use https:// URLs", () => {
    for (const item of FAQ_DATA) {
      if (item.links) {
        for (const link of item.links) {
          expect(link.url).toMatch(/^https:\/\//);
          expect(link.text.trim()).not.toBe("");
        }
      }
    }
  });
});
