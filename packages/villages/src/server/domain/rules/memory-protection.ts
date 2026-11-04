import type { MemoryCollection, MemoryDomainRef, MemoryScreening, MemorySource } from "../models/memories.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

const stop = new Set(
  "a an and are as at be been but by can could did do does for from had has have he her him his how i if in is it its me my of on or our she so some that the their them then there they this to us was we were what when where which who will with would you your about again remember happened tell said today now please yesterday".split(
    " ",
  ),
);
export const memoryTerms = (text: string): string[] =>
  (
    text
      .normalize("NFKC")
      .toLocaleLowerCase("en-US")
      .match(/[\p{L}\p{N}]+/gu) ?? []
  ).filter((term) => !stop.has(term));
export const estimatedMemoryTokens = (text: string) => Math.ceil(Buffer.byteLength(text, "utf8") / 4);
export type MemoryProtectionSelector = {
  knowers: string[];
  query: string;
  targetIds?: string[];
  sourceRefs?: { source: MemorySource; lineId: string }[];
  domainRefs?: MemoryDomainRef[];
};
export type MemoryProtectionContext = ReturnType<typeof memoryProtectionContext>;
/** Administrative System write constraints, never Narration/character knowledge.
 * Lexical relevance is a bounded aid to ordinary System judgment, not semantic contradiction detection.
 */
export function memoryProtectionContext(
  collection: MemoryCollection,
  selector: MemoryProtectionSelector,
  budget = 1800,
) {
  const query = new Set(memoryTerms(selector.query));
  const targets = new Set(selector.targetIds ?? []),
    sources = new Set((selector.sourceRefs ?? []).map((e) => JSON.stringify([e.source.kind, e.source.id, e.lineId])));
  const domains = new Set((selector.domainRefs ?? []).map(memoryHash));
  const byRoot = new Map<string, MemoryCollection["records"]>();
  for (const row of collection.records) {
    const rows = byRoot.get(row.rootId) ?? [];
    rows.push(row);
    byRoot.set(row.rootId, rows);
  }
  const linkedRoots = new Set(collection.records.filter((row) => targets.has(row.id)).map((row) => row.rootId));
  const roots = collection.records
    .filter((root) => root.id === root.rootId)
    .flatMap((root) => {
      const knowers = Object.fromEntries(
        Object.entries(root.knowers)
          .filter(([id, state]) => selector.knowers.includes(id) && (state.forgotten || state.repair))
          .map(([id, state]) => [
            id,
            {
              ...(state.forgotten ? { forgotten: true } : {}),
              ...(state.repair ? { repair: state.repair.text } : {}),
            },
          ]),
      );
      if (!Object.keys(knowers).length) return [];
      const related = byRoot.get(root.id)!;
      const relevant =
        linkedRoots.has(root.id) ||
        targets.has(root.id) ||
        related.some(
          (row) =>
            (row.domainRef && domains.has(memoryHash(row.domainRef))) ||
            Object.entries(row.knowers).some(
              ([id, state]) =>
                selector.knowers.includes(id) &&
                state.support.some((e) => sources.has(JSON.stringify([e.source.kind, e.source.id, e.lineId]))),
            ),
        ) ||
        memoryTerms(
          [
            root.text,
            ...related.map((row) => row.text),
            ...Object.values(root.knowers).flatMap((state) => [
              state.repair?.text ?? "",
              ...state.support.map((e) => e.excerpt),
            ]),
          ].join(" "),
        ).some((term) => query.has(term));
      return relevant ? [{ rootId: root.id, revision: root.revision, text: root.text, knowers }] : [];
    })
    .sort((a, b) => a.rootId.localeCompare(b.rootId));
  const fingerprint = memoryHash({ selector, roots });
  const payload = JSON.stringify({
    rule: "Administrative constraints only. Do not teach these facts. Screen each proposal clear/conflict/uncertain with all related protected roots and this fingerprint. Never restore forgotten or contradict repaired knowledge for these knowers.",
    fingerprint,
    roots,
  });
  const complete = estimatedMemoryTokens(payload) <= budget;
  const available = complete ? payload : JSON.stringify({ fingerprint, incomplete: true });
  return {
    selector: structuredClone(selector),
    fingerprint,
    roots,
    complete,
    payload: available,
    tokens: estimatedMemoryTokens(available),
    budget,
  };
}
export function checkMemoryScreening(
  collection: MemoryCollection,
  supplied: MemoryProtectionContext,
  screening: MemoryScreening,
  affected: MemoryProtectionSelector,
) {
  const current = memoryProtectionContext(collection, supplied.selector, supplied.budget);
  memoryRequire(current.fingerprint === supplied.fingerprint, "protection changed");
  const required = memoryProtectionContext(collection, affected, supplied.budget);
  memoryRequire(!required.roots.length || required.complete, "affected protection does not fit");
  memoryRequire(!required.roots.length || supplied.complete, "protection does not fit");
  memoryRequire(
    screening &&
      Object.keys(screening).every((key) => ["disposition", "protectedRoots", "fingerprint"].includes(key)) &&
      screening.disposition === "clear" &&
      screening.fingerprint === current.fingerprint &&
      Array.isArray(screening.protectedRoots) &&
      new Set(screening.protectedRoots).size === screening.protectedRoots.length,
    "inadequate screening",
  );
  memoryRequire(
    screening.protectedRoots.length === required.roots.length &&
      required.roots.every(
        (root) =>
          screening.protectedRoots.includes(root.rootId) && current.roots.some((shown) => shown.rootId === root.rootId),
      ),
    "unscreened protected root",
  );
}
