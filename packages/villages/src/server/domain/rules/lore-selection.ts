import type { LoreInspection } from "../../../shared/contracts/lore.js";
import { coerceLoreTokenBudget } from "./lore-policy.js";

export type LoreEntry = {
  id: string;
  bookId: string;
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

function keyMatches(key: string, text: string, entry: LoreEntry): boolean {
  if (typeof key !== "string" || !key.length || key.length > 160) return false;
  const needle = entry.caseSensitive ? key : key.toLowerCase();
  const haystack = entry.caseSensitive ? text : text.toLowerCase();
  let at = haystack.indexOf(needle);
  while (at >= 0) {
    if (
      !entry.matchWholeWords ||
      (!/[\p{L}\p{N}\p{M}_]$/u.test(haystack.slice(0, at)) &&
        !/^[\p{L}\p{N}\p{M}_]/u.test(haystack.slice(at + needle.length)))
    )
      return true;
    at = haystack.indexOf(needle, at + 1);
  }
  return false;
}

/** No host I/O, authored regex execution, recursive activation, or model requests. */
export function selectVillageLore(entries: readonly LoreEntry[], query: LoreQuery, budgetValue: number) {
  const budget = coerceLoreTokenBudget(budgetValue);
  const scopes = [query.current ?? "", ...(query.recent ?? []), query.setting];
  const diagnostics: LoreInspection["entries"] = [];
  const candidates: { entry: LoreEntry; rank: number; trace: LoreInspection["entries"][number] }[] = [];
  for (const entry of entries) {
    const trace: LoreInspection["entries"][number] = {
      id: entry.id,
      bookId: entry.bookId,
      name: entry.name,
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
    if (entry.selective && secondary.length && !entry.constant) {
      const found = secondary.map((key) => scopes.some((text) => keyMatches(key, text, entry)));
      switch (entry.selectiveLogic ?? "and_any") {
        case "and_any":
          secondaryMatches = found.some(Boolean);
          break;
        case "and_all":
          secondaryMatches = found.every(Boolean);
          break;
        case "not_any":
          secondaryMatches = !found.some(Boolean);
          break;
        case "not_all":
          secondaryMatches = !found.every(Boolean);
          break;
        default:
          trace.status = "unsupported";
          continue;
      }
    }
    if (!entry.constant && (!hasPrimary || !secondaryMatches)) {
      if (hasPrimary && !secondaryMatches) trace.status = "conditions";
      continue;
    }
    const rank = primary(query.current ?? "")
      ? 0
      : (query.recent ?? []).some(primary)
        ? 1
        : primary(query.setting)
          ? 2
          : 3;
    trace.match = (["current", "recent", "setting", "constant"] as const)[rank]!;
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
  let tokens = 0;
  for (const { entry, trace } of candidates) {
    const content = entry.content.trim();
    const cost = Math.ceil((entry.name.length + content.length) / 4) + 4;
    if (selected.length >= 24) trace.status = "entry-limit";
    else if (!budget || tokens + cost > budget) trace.status = "budget";
    else {
      trace.status = "included";
      selected.push(`${entry.name}: ${content}`);
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
    inspection: {
      purpose: "Lore lookup",
      stage: "selection" as const,
      budget,
      entries: ordered.slice(0, 100),
      omittedDiagnostics: Math.max(0, ordered.length - 100),
    } satisfies LoreInspection,
  };
}
