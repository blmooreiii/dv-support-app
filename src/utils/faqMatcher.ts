// src/utils/faqMatcher.ts
// BastBot Natural Language Matching Engine
// Scores user queries against FAQ keywords and phrases to find best matches

import { FAQ_DATA, FAQItem } from "@/src/data/faqData";

type MatchResult = {
  item: FAQItem;
  score: number;
  matchType: "exact" | "high" | "medium" | "low";
};

/**
 * Normalize text for comparison:
 * - Lowercase
 * - Remove punctuation
 * - Trim whitespace
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?.!,;:'"]/g, "")
    .trim();
}

/**
 * Calculate keyword overlap score
 * Returns percentage of query words that appear in the FAQ's keyword list
 */
function keywordScore(query: string, item: FAQItem): number {
  const queryWords = normalize(query).split(/\s+/);
  const keywords = item.keywords.map(normalize);

  let matches = 0;
  for (const word of queryWords) {
    if (word.length < 3) continue; // Skip very short words (a, is, in, etc.)
    if (keywords.some((k) => k.includes(word) || word.includes(k))) {
      matches++;
    }
  }

  return queryWords.length > 0 ? matches / queryWords.length : 0;
}

/**
 * Calculate phrase similarity score
 * Checks if the query is very similar to any of the FAQ's known phrases
 */
function phraseScore(query: string, item: FAQItem): number {
  const normQuery = normalize(query);
  const phrases = item.phrases.map(normalize);

  let bestScore = 0;

  for (const phrase of phrases) {
    // Exact match
    if (normQuery === phrase) {
      return 1.0;
    }

    // Contains phrase
    if (normQuery.includes(phrase) || phrase.includes(normQuery)) {
      const overlap = Math.min(normQuery.length, phrase.length) / Math.max(normQuery.length, phrase.length);
      bestScore = Math.max(bestScore, overlap * 0.9);
    }

    // Word overlap
    const queryWords = normQuery.split(/\s+/);
    const phraseWords = phrase.split(/\s+/);
    const commonWords = queryWords.filter((w) => phraseWords.includes(w)).length;
    const totalWords = Math.max(queryWords.length, phraseWords.length);
    const wordOverlap = commonWords / totalWords;

    bestScore = Math.max(bestScore, wordOverlap * 0.7);
  }

  return bestScore;
}

/**
 * Match user query against all FAQs
 * Returns top matches sorted by score
 */
export function matchQuery(query: string, maxResults: number = 3): MatchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const results: MatchResult[] = [];

  for (const item of FAQ_DATA) {
    const kScore = keywordScore(query, item);
    const pScore = phraseScore(query, item);

    // Weighted average (phrases are more reliable than keywords)
    const finalScore = pScore * 0.7 + kScore * 0.3;

    let matchType: MatchResult["matchType"] = "low";
    if (finalScore >= 0.8) matchType = "exact";
    else if (finalScore >= 0.5) matchType = "high";
    else if (finalScore >= 0.25) matchType = "medium";

    results.push({
      item,
      score: finalScore,
      matchType,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Filter: only return matches above threshold
  const threshold = 0.2;
  const filtered = results.filter((r) => r.score >= threshold);

  return filtered.slice(0, maxResults);
}

/**
 * Get FAQs by category
 */
export function getFAQsByCategory(category: string): FAQItem[] {
  return FAQ_DATA.filter((item) => item.category === category);
}

/**
 * Get random helpful questions to show as suggestions
 */
export function getSuggestedQuestions(count: number = 3): FAQItem[] {
  const highPriority = [25, 19, 21, 7, 11]; // "Where can I go", "How does Bastet work", "Quick Exit", "Shelter full", "Safety plan"
  const selected: FAQItem[] = [];

  for (const id of highPriority) {
    const item = FAQ_DATA.find((f) => f.id === id);
    if (item) selected.push(item);
    if (selected.length >= count) break;
  }

  return selected;
}
