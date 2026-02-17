import type { Mood } from "./types.js";

// ============================================================
// Pattern sets by language
// ============================================================

const DECISION_PATTERNS_EN = [
  /(?:decided|decision|agreed|let'?s do|the plan is|approach:)/i,
];

const DECISION_PATTERNS_DE = [
  /(?:entschieden|beschlossen|machen wir|wir machen|der plan ist|ansatz:)/i,
];

const CLOSE_PATTERNS_EN = [
  /(?:^|\s)(?:is |it's |that's |all )?(?:done|fixed|solved|closed)(?:\s|[.!]|$)/i,
  /(?:^|\s)(?:it |that )works(?:\s|[.!]|$)/i,
  /✅/,
];

const CLOSE_PATTERNS_DE = [
  /(?:^|\s)(?:ist |schon )?(?:erledigt|gefixt|gelöst|fertig)(?:\s|[.!]|$)/i,
  /(?:^|\s)(?:es |das )funktioniert(?:\s|[.!]|$)/i,
];

const WAIT_PATTERNS_EN = [
  /(?:waiting for|blocked by|need.*first)/i,
];

const WAIT_PATTERNS_DE = [
  /(?:warte auf|blockiert durch|brauche.*erst)/i,
];

const TOPIC_PATTERNS_EN = [
  /(?:back to|now about|regarding)\s+(\w[\w\s-]{2,30})/i,
];

const TOPIC_PATTERNS_DE = [
  /(?:zurück zu|jetzt zu|bzgl\.?|wegen)\s+(\w[\w\s-]{2,30})/i,
];

const MOOD_PATTERNS: Record<Exclude<Mood, "neutral">, RegExp> = {
  frustrated: /(?:fuck|shit|mist|nervig|genervt|damn|wtf|argh|schon wieder|zum kotzen|sucks)/i,
  excited: /(?:geil|nice|awesome|krass|boom|läuft|yes!|🎯|🚀|perfekt|brilliant|mega|sick)/i,
  tense: /(?:vorsicht|careful|risky|heikel|kritisch|dringend|urgent|achtung|gefährlich)/i,
  productive: /(?:erledigt|done|fixed|works|fertig|deployed|✅|gebaut|shipped|läuft)/i,
  exploratory: /(?:was wäre wenn|what if|könnte man|idea|idee|maybe|vielleicht|experiment)/i,
};

// ============================================================
// Public API
// ============================================================

export type PatternLanguage = "en" | "de" | "both";

export type PatternSet = {
  decision: RegExp[];
  close: RegExp[];
  wait: RegExp[];
  topic: RegExp[];
};

/**
 * Get pattern set for the configured language.
 * "both" merges EN + DE patterns.
 */
export function getPatterns(language: PatternLanguage): PatternSet {
  switch (language) {
    case "en":
      return {
        decision: DECISION_PATTERNS_EN,
        close: CLOSE_PATTERNS_EN,
        wait: WAIT_PATTERNS_EN,
        topic: TOPIC_PATTERNS_EN,
      };
    case "de":
      return {
        decision: DECISION_PATTERNS_DE,
        close: CLOSE_PATTERNS_DE,
        wait: WAIT_PATTERNS_DE,
        topic: TOPIC_PATTERNS_DE,
      };
    case "both":
      return {
        decision: [...DECISION_PATTERNS_EN, ...DECISION_PATTERNS_DE],
        close: [...CLOSE_PATTERNS_EN, ...CLOSE_PATTERNS_DE],
        wait: [...WAIT_PATTERNS_EN, ...WAIT_PATTERNS_DE],
        topic: [...TOPIC_PATTERNS_EN, ...TOPIC_PATTERNS_DE],
      };
  }
}

/**
 * Detect mood from text. Scans for all mood patterns; last match position wins.
 * Returns "neutral" if no mood pattern matches.
 */
export function detectMood(text: string): Mood {
  if (!text) return "neutral";

  let lastMood: Mood = "neutral";
  let lastPos = -1;

  for (const [mood, pattern] of Object.entries(MOOD_PATTERNS) as [Exclude<Mood, "neutral">, RegExp][]) {
    // Use global flag for position scanning
    const globalPattern = new RegExp(pattern.source, "gi");
    let match: RegExpExecArray | null;
    while ((match = globalPattern.exec(text)) !== null) {
      if (match.index > lastPos) {
        lastPos = match.index;
        lastMood = mood;
      }
    }
  }

  return lastMood;
}

/** High-impact keywords for decision impact inference */
export const HIGH_IMPACT_KEYWORDS = [
  "architecture", "architektur", "security", "sicherheit",
  "migration", "delete", "löschen", "production", "produktion",
  "deploy", "breaking", "major", "critical", "kritisch",
  "strategy", "strategie", "budget", "contract", "vertrag",
];

/** Export mood patterns for testing */
export { MOOD_PATTERNS };
