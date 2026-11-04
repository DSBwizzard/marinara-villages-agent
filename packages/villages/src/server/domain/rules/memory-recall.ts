import type { MemoryCandidate, MemoryCollection, MemorySceneSnapshot } from "../models/memories.js";
import { memoryRequire } from "./memory-integrity.js";
import { estimatedMemoryTokens, memoryTerms, type MemoryProtectionContext } from "./memory-protection.js";
import { projectMemories, sceneMemoryCollection } from "./memory-views.js";

export type MemoryRecallRequest = {
  query: string;
  names?: Record<string, string>;
  /** The fresh local System lookup includes the accepted Narration reply. */
  narration?: string;
  audience: string[];
  purpose: "narration" | "system" | "development";
  budget?: number;
  /** Development retains its existing additional count cap. */
  countCap?: number;
  protection?: MemoryProtectionContext;
  snapshot?: MemorySceneSnapshot;
};
/** Full-collection local BM25. All temporary maps live only for this lookup. */
export function recallMemories(collection: MemoryCollection, request: MemoryRecallRequest) {
  const ceiling = request.purpose === "narration" ? 1000 : request.purpose === "system" ? 1800 : 1800;
  const budget = request.budget ?? ceiling;
  memoryRequire(Number.isSafeInteger(budget) && budget > 0 && budget <= ceiling, "invalid recall budget");
  memoryRequire(!request.protection || request.purpose === "system", "administrative protection is System-only");
  if (request.snapshot)
    memoryRequire(
      request.audience.every((id) => request.snapshot!.audience.includes(id)),
      "outside captured audience",
    );
  const view = request.snapshot ? sceneMemoryCollection(collection, request.snapshot) : collection;
  const administrative = request.protection ? JSON.parse(request.protection.payload) : undefined;
  const emptyPayload = { ...(administrative ? { administrative } : {}), memories: [] };
  const allowance = budget - estimatedMemoryTokens(JSON.stringify(emptyPayload));
  const candidates = projectMemories(view, request.audience).flatMap((candidate) => {
    if (estimatedMemoryTokens(JSON.stringify(candidate)) <= allowance) return [candidate];
    return Object.keys(candidate.knowers).map((id) => ({ ...candidate, knowers: { [id]: candidate.knowers[id] } }));
  });
  const query = request.query + " " + (request.purpose === "system" ? (request.narration ?? "") : "");
  const terms = new Set(memoryTerms(query));
  const documents = new Map<string, number>();
  const rows = candidates.map((candidate, index) => {
    const counts = new Map<string, number>();
    const text = [
      candidate.text,
      ...candidate.subjects,
      ...candidate.subjects.map((id) => request.names?.[id] ?? ""),
      ...Object.values(candidate.knowers).flatMap((state) => state.support.map((e) => e.excerpt)),
    ].join(" ");
    const tokens = memoryTerms(text);
    for (const term of tokens) counts.set(term, (counts.get(term) ?? 0) + 1);
    for (const term of counts.keys()) documents.set(term, (documents.get(term) ?? 0) + 1);
    return { candidate, counts, length: tokens.length, index, score: 0, explicit: false };
  });
  const average = rows.reduce((sum, row) => sum + row.length, 0) / Math.max(1, rows.length);
  for (const row of rows) {
    for (const term of terms) {
      const tf = row.counts.get(term) ?? 0;
      if (!tf) continue;
      const df = documents.get(term) ?? 0;
      row.score +=
        (Math.log(1 + (rows.length - df + 0.5) / (df + 0.5)) * tf * 2.2) /
        (tf + 1.2 * (0.25 + (0.75 * row.length) / Math.max(1, average)));
    }
    row.explicit = [row.candidate.id, row.candidate.rootId, row.candidate.domainRef?.id].some(
      (id) => id && query.split(/\s+/u).includes(id),
    );
    if (row.explicit) row.score += 1000;
    // Open status alone has no relevance score and cannot cause nagging.
    if (row.score > 0 && row.candidate.kind === "open-matter") row.score += 0.1;
  }
  const ranked = rows
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id) || a.index - b.index);
  const selected: MemoryCandidate[] = [];
  const selectedRows = new Set<number>();
  const encode = () =>
    JSON.stringify({
      ...(administrative ? { administrative } : {}),
      memories: request.purpose === "system" ? selected : promptMemoryCandidates(selected),
    });
  memoryRequire(estimatedMemoryTokens(encode()) <= budget, "required protection exceeds recall budget");
  const take = (row: (typeof ranked)[number]) => {
    if (selectedRows.has(row.index) || (request.countCap !== undefined && selected.length >= request.countCap)) return;
    selected.push(row.candidate);
    if (estimatedMemoryTokens(encode()) > budget) {
      selected.pop();
      return;
    }
    selectedRows.add(row.index);
  };
  // Reserve the best relevant opportunity for each participant before filling by rank.
  for (const id of request.audience) {
    const row = ranked.find((item) => item.candidate.knowers[id]);
    if (row) take(row);
  }
  for (const row of ranked) take(row);
  // One hop only, with projection rechecking every linked item's actual audience.
  const initial = [...selected];
  for (const candidate of initial)
    for (const row of rows) {
      const a = row.candidate;
      if (
        [candidate.corrects, candidate.resolves].includes(a.id) ||
        a.corrects === candidate.id ||
        a.resolves === candidate.id
      ) {
        const shared = Object.keys(candidate.knowers).filter((id) => a.knowers[id]);
        if (!shared.length) continue;
        const limited = {
          ...row,
          candidate: { ...a, knowers: Object.fromEntries(shared.map((id) => [id, a.knowers[id]])) },
        };
        take(limited);
      }
    }
  const serialized = encode();
  const seenRoots = new Set<string>();
  const distinct = ranked.filter((row) => {
    if (seenRoots.has(row.candidate.rootId)) return false;
    seenRoots.add(row.candidate.rootId);
    return true;
  });
  const ambiguous =
    !distinct.length || (!distinct[0].explicit && !!distinct[1] && distinct[0].score <= distinct[1].score * 1.1);
  // Ambiguous/cue-free references supply no guessed mutation target.
  const targetIds = ambiguous
    ? []
    : selected.filter((row) => row.rootId === distinct[0].candidate.rootId).flatMap((row) => [row.id, row.rootId]);
  return {
    candidates: selected,
    targetIds: [...new Set(targetIds)],
    ambiguous,
    serialized,
    tokens: estimatedMemoryTokens(serialized),
    eligibleCount: candidates.length,
  };
}

/** Effective repaired text may guide future Scenes without inventing a witnessed event
 * or presenting administrative edit identities and source pointers as character knowledge. */
export function promptMemoryCandidates(rows: readonly MemoryCandidate[]) {
  return rows.map((row) => ({
    ...row,
    knowers: Object.fromEntries(
      Object.entries(row.knowers).map(([id, state]) => {
        const { repair, sourceRefs: _sources, ...known } = state;
        return [id, { ...known, ...(repair ? { basis: "player-repaired" } : {}) }];
      }),
    ),
  }));
}
