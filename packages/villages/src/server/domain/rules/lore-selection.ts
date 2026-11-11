import type { LoreInspection, LoreTrigger } from "../../../shared/contracts/lore.js";
import { coerceLoreTokenBudget } from "./lore-policy.js";

export type LoreEntry = {
  id: string;
  bookId: string;
  bookName?: string;
  name: string;
  content: string;
  enabled: boolean;
  folderEnabled: boolean;
  constant?: boolean;
  keys?: string[];
  secondaryKeys?: string[];
  selective?: boolean;
  selectiveLogic?: string;
  matchWholeWords?: boolean;
  caseSensitive?: boolean;
  useRegex?: boolean;
  order?: number;
};
export type LoreQuery = { current?: string; recent?: readonly string[]; setting: string };
const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function keyPosition(key: string, text: string, entry: LoreEntry): number {
  if (typeof key !== "string" || !key.length || key.length > 160) return -1;
  const needle = entry.caseSensitive ? key : key.toLowerCase();
  const haystack = entry.caseSensitive ? text : text.toLowerCase();
  let at = haystack.indexOf(needle);
  while (at >= 0) {
    if (
      !entry.matchWholeWords ||
      (!/[\p{L}\p{N}\p{M}_]$/u.test(haystack.slice(0, at)) &&
        !/^[\p{L}\p{N}\p{M}_]/u.test(haystack.slice(at + needle.length)))
    )
      return at;
    at = haystack.indexOf(needle, at + 1);
  }
  return -1;
}
const keyMatches = (key: string, text: string, entry: LoreEntry) => keyPosition(key, text, entry) >= 0;

function matchContext(key: string, text: string, source: string, entry: LoreEntry) {
  const at = keyPosition(key, text, entry);
  if (at < 0) return undefined;
  let start = 0,
    end = 0,
    folded = 0;
  const length = (entry.caseSensitive ? key : key.toLowerCase()).length;
  for (const character of text) {
    if (folded <= at) start = end;
    if (folded >= at + length) break;
    folded += (entry.caseSensitive ? character : character.toLowerCase()).length;
    end += character.length;
  }
  const from = Math.max(0, start - 100),
    to = Math.min(text.length, end + 140);
  const prefix = from ? "…" : "";
  return {
    text: prefix + text.slice(from, to) + (to < text.length ? "…" : ""),
    start: start - from + prefix.length,
    end: end - from + prefix.length,
    source,
  };
}

/** No host I/O, authored regex execution, recursive activation, or model requests. */
export function selectVillageLore(entries: readonly LoreEntry[], query: LoreQuery, budgetValue: number) {
  const budget = coerceLoreTokenBudget(budgetValue);
  const recent = query.recent ?? [];
  const scopes = [query.current ?? "", ...recent, query.setting];
  const sources = [
    "Current request",
    ...recent.map((_, index) => `Recent dialogue ${index + 1} of ${recent.length}`),
    "Setting / generation context",
  ];
  const contextFor = (key: string, entry: LoreEntry, indices = scopes.map((_, index) => index)) => {
    for (const index of indices) {
      const context = matchContext(key, scopes[index]!, sources[index]!, entry);
      if (context) return context;
    }
    return undefined;
  };
  const diagnostics: LoreInspection["entries"] = [];
  const candidates: { entry: LoreEntry; rank: number; trace: LoreInspection["entries"][number] }[] = [];
  for (const entry of entries) {
    const trace: LoreInspection["entries"][number] = {
      id: entry.id,
      bookId: entry.bookId,
      name: entry.name,
      ...(entry.bookName ? { bookName: entry.bookName } : {}),
      match: "none",
      status: "no-match",
    };
    diagnostics.push(trace);
    if (!entry.enabled || !entry.content.trim()) {
      trace.status = "disabled";
      continue;
    }
    if (!entry.folderEnabled) {
      trace.status = "folder-disabled";
      continue;
    }
    // Constant entries remain eligible even when their optional regex keys are unsupported.
    if (entry.useRegex && !entry.constant) {
      trace.status = "unsupported";
      continue;
    }
    const primary = (text: string) => !entry.useRegex && (entry.keys ?? []).some((key) => keyMatches(key, text, entry));
    const hasPrimary = scopes.some(primary);
    const secondary = entry.secondaryKeys ?? [];
    let secondaryMatches = true;
    let condition: LoreTrigger["secondary"];
    let secondaryMatchesContext: LoreTrigger["secondaryMatches"];
    if (entry.selective && secondary.length && !entry.constant) {
      const found = secondary.map((key) => scopes.some((text) => keyMatches(key, text, entry)));
      let logic: NonNullable<typeof condition>["logic"];
      switch (entry.selectiveLogic ?? "and_any") {
        // Engine's native names use the same conditions as compatible imported entries.
        case "and":
        case "or":
        case "and_any":
          logic = "and_any";
          secondaryMatches = found.some(Boolean);
          break;
        case "and_all":
          logic = "and_all";
          secondaryMatches = found.every(Boolean);
          break;
        case "not":
        case "not_any":
          logic = "not_any";
          secondaryMatches = !found.some(Boolean);
          break;
        case "not_all":
          logic = "not_all";
          secondaryMatches = !found.every(Boolean);
          break;
        default:
          trace.status = "unsupported";
          continue;
      }
      condition = { logic, matched: found.filter(Boolean).length, total: found.length };
      secondaryMatchesContext = secondary
        .flatMap((key, index) => {
          if (!found[index]) return [];
          const context = contextFor(key, entry);
          return context ? [{ key, text: context.text, source: context.source }] : [];
        })
        .slice(0, 3);
    }
    if (!entry.constant && (!hasPrimary || !secondaryMatches)) {
      if (hasPrimary && !secondaryMatches) trace.status = "conditions";
      continue;
    }
    const rank = primary(query.current ?? "") ? 0 : recent.some(primary) ? 1 : primary(query.setting) ? 2 : 3;
    trace.match = (["current", "recent", "setting", "constant"] as const)[rank]!;
    const key = entry.useRegex
      ? undefined
      : (entry.keys ?? []).find((key) =>
          (rank === 0 ? [query.current ?? ""] : rank === 1 ? recent : [query.setting]).some((text) =>
            keyMatches(key, text, entry),
          ),
        );
    trace.trigger = {
      constant: entry.constant === true,
      match: trace.match,
      ...(key ? { key } : {}),
      caseSensitive: entry.caseSensitive === true,
      matchWholeWords: entry.matchWholeWords === true,
      ...(key
        ? {
            context: contextFor(
              key,
              entry,
              rank === 0 ? [0] : rank === 1 ? recent.map((_, index) => index + 1) : [scopes.length - 1],
            ),
          }
        : {}),
      ...(condition ? { secondary: condition } : {}),
      ...(secondaryMatchesContext?.length ? { secondaryMatches: secondaryMatchesContext } : {}),
    };
    candidates.push({ entry, rank, trace });
  }
  candidates.sort(
    (a, b) =>
      a.rank - b.rank ||
      (Number.isFinite(b.entry.order) ? b.entry.order! : 0) - (Number.isFinite(a.entry.order) ? a.entry.order! : 0) ||
      compare(a.entry.bookId, b.entry.bookId) ||
      compare(a.entry.id, b.entry.id),
  );
  const selected: string[] = [];
  const recentRequirements: number[][][] = [];
  let tokens = 0;
  for (const { entry, trace } of candidates) {
    const content = entry.content.trim();
    const cost = Math.ceil((entry.name.length + content.length) / 4) + 4;
    if (selected.length >= 24) trace.status = "entry-limit";
    else if (!budget || tokens + cost > budget) trace.status = "budget";
    else {
      trace.status = "included";
      selected.push(`${entry.name}: ${content}`);
      const requirements: number[][] = [];
      if (!entry.constant && recent.length) {
        const requireMatch = (matches: (text: string) => boolean) => {
          if (matches(query.current ?? "") || matches(query.setting)) return;
          requirements.push(recent.flatMap((text, index) => (matches(text) ? [index] : [])));
        };
        requireMatch((text) => (entry.keys ?? []).some((key) => keyMatches(key, text, entry)));
        const secondary = entry.secondaryKeys ?? [];
        if (trace.trigger?.secondary?.logic === "and_any")
          requireMatch((text) => secondary.some((key) => keyMatches(key, text, entry)));
        if (trace.trigger?.secondary?.logic === "and_all")
          for (const key of secondary) requireMatch((text) => keyMatches(key, text, entry));
      }
      recentRequirements.push(requirements);
      tokens += cost;
    }
  }
  // Keep debug records bounded independently of library size; prioritize selected/omitted matches.
  const ordered = [
    ...candidates.filter(({ trace }) => trace.status === "included").map(({ trace }) => trace),
    ...candidates.filter(({ trace }) => trace.status !== "included").map(({ trace }) => trace),
    ...diagnostics.filter((trace) => trace.match === "none"),
  ];
  return {
    selected,
    recentRequirements,
    inspection: {
      purpose: "Lore lookup",
      stage: "selection" as const,
      budget,
      entries: ordered.slice(0, 100),
      omittedDiagnostics: Math.max(0, ordered.length - 100),
    } satisfies LoreInspection,
  };
}
