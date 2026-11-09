import type {
  ContinuityCollection,
  ContinuityHolder,
  ContinuityTarget,
  ContinuityView,
} from "../models/continuity-model.js";
import type { EpisodeCollection } from "../models/episode-model.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { continuityHolderKey, continuityProtectionUnits, continuityViews } from "./continuity.js";
import { memoryRequire } from "./memory-integrity.js";
import { memoryTerms } from "./memory-protection.js";

function rank<T>(rows: T[], query: string, prose: (row: T) => string) {
  const terms = new Set(memoryTerms(query)),
    frequencies = new Map<string, number>();
  const documents = rows.map((row, index) => {
    const tokens = memoryTerms(prose(row)),
      counts = new Map<string, number>();
    for (const term of tokens) counts.set(term, (counts.get(term) ?? 0) + 1);
    for (const term of counts.keys()) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
    return { row, index, counts, length: tokens.length, score: 0 };
  });
  const average = documents.reduce((sum, row) => sum + row.length, 0) / Math.max(1, rows.length);
  for (const row of documents)
    for (const term of terms) {
      const frequency = row.counts.get(term) ?? 0,
        count = frequencies.get(term) ?? 0;
      if (frequency)
        row.score +=
          (Math.log(1 + (rows.length - count + 0.5) / (count + 0.5)) * frequency * 2.2) /
          (frequency + 1.2 * (0.25 + (0.75 * row.length) / Math.max(1, average)));
    }
  return documents.sort((a, b) => b.score - a.score || b.index - a.index);
}
function targets(views: ContinuityView[]): ContinuityTarget[] {
  const result = new Map<string, ContinuityTarget>();
  for (const view of views) {
    const target = result.get(view.id) ?? { id: view.id, recordRevision: view.recordRevision, heads: {} };
    target.heads[continuityHolderKey(view.holder)] = view.headRevision;
    result.set(view.id, target);
  }
  return [...result.values()];
}
const roomEntry = (view: ContinuityView) => ({
  id: view.id,
  text: view.version.text,
  ...(view.version.room?.visibility === "concealed" ? { concealed: true, knownBy: view.roomKnownBy ?? [] } : {}),
  ...(view.version.room?.expiresAt ? { expiresAt: view.version.room.expiresAt } : {}),
});

/** Every current entry stays stored; only complete selected entries become legal mutation targets. */
export function selectRoomContinuity(
  collection: ContinuityCollection,
  episodes: EpisodeCollection,
  holder: Extract<ContinuityHolder, { kind: "room" }>,
  at: string,
  request: { query: string; bytes: number; requiredIds: string[]; wholeRoom: boolean },
) {
  memoryRequire(Number.isSafeInteger(request.bytes) && request.bytes > 0, "invalid room context budget");
  const all = continuityViews(
    collection,
    holder,
    at,
    continuityProtectionUnits(collection, holder, episodeSourceGraph(episodes.records)),
  ).sort((a, b) => a.version.room!.order - b.version.room!.order);
  const required = new Set(
    request.wholeRoom ? all.map((row) => row.id) : [...request.requiredIds, ...(all[0] ? [all[0].id] : [])],
  );
  memoryRequire(
    [...required].every((id) => all.some((row) => row.id === id)),
    "required room entry is unavailable",
  );
  const selected = all.filter((row) => required.has(row.id));
  const packet = () => ({
    partial: selected.length < all.length,
    total: all.length,
    entries: selected.toSorted((a, b) => a.version.room!.order - b.version.room!.order).map(roomEntry),
  });
  const size = () => Buffer.byteLength(JSON.stringify(packet()));
  memoryRequire(size() <= request.bytes, "required room context does not fit before generation");
  const ranked = rank(all, request.query, (row) => row.version.text);
  for (const { row } of [
    ...ranked.filter((row) => row.score > 0),
    ...all
      .slice(-4)
      .toReversed()
      .map((row) => ({ row })),
  ]) {
    if (selected.includes(row)) continue;
    selected.push(row);
    if (size() > request.bytes) selected.pop();
  }
  return { packet: packet(), supplied: targets(selected), bytes: size() };
}

function actorEntry(view: ContinuityView) {
  const version = view.version;
  return {
    id: view.id,
    for: view.holder.kind === "actor" ? view.holder.id : "",
    text: version.text,
    class: version.class,
    ...(view.current ? { current: true } : {}),
    ...(version.about.length ? { about: version.about } : {}),
    ...(version.parentId ? { parent: version.parentId, facet: version.facet } : {}),
    ...(version.closed ? { closed: version.closed.reason } : {}),
    ...(view.offer ? { offer: view.offer } : {}),
  };
}

/** Local standing, fair initiative and recall share a bounded envelope and the same private projection. */
export function selectActorContinuity(
  collection: ContinuityCollection,
  episodes: EpisodeCollection,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
  at: string,
  request: { query: string; bytes: number; requiredIds: string[] },
) {
  memoryRequire(Number.isSafeInteger(request.bytes) && request.bytes > 0, "invalid actor context budget");
  const graph = episodeSourceGraph(episodes.records);
  const all = holders.flatMap((holder) =>
    continuityViews(collection, holder, at, continuityProtectionUnits(collection, holder, graph)),
  );
  const active = new Set(holders.map((holder) => holder.id));
  const required = all.filter(
    (row) =>
      request.requiredIds.includes(row.id) ||
      (row.current &&
        row.version.facet === "boundary" &&
        (!row.version.about.length || row.version.about.some((id) => active.has(id)))),
  );
  memoryRequire(
    request.requiredIds.every((id) => all.some((row) => row.id === id)),
    "required continuity entry is unavailable",
  );
  for (const row of [...required])
    if (row.version.parentId) {
      const parent = all.find(
        (other) =>
          other.id === row.version.parentId && continuityHolderKey(other.holder) === continuityHolderKey(row.holder),
      );
      memoryRequire(parent, "required continuity parent is unavailable");
      if (!required.includes(parent)) required.push(parent);
    }
  const selected = [...required];
  const packet = () => ({ partial: selected.length < all.length, entries: selected.map(actorEntry) });
  const size = () => Buffer.byteLength(JSON.stringify(packet()));
  memoryRequire(size() <= request.bytes, "required actor continuity does not fit before generation");
  const take = (row: ContinuityView, budget = request.bytes) => {
    if (selected.includes(row)) return;
    const group = [row];
    if (row.version.parentId) {
      const parent = all.find(
        (other) =>
          other.id === row.version.parentId && continuityHolderKey(other.holder) === continuityHolderKey(row.holder),
      );
      if (!parent) return;
      if (!selected.includes(parent)) group.unshift(parent);
    }
    selected.push(...group);
    if (size() > budget) selected.splice(-group.length);
  };
  for (const holder of holders.filter((holder) => holder.id !== "player")) {
    const current = all.filter((row) => continuityHolderKey(row.holder) === continuityHolderKey(holder) && row.current);
    if (current.length)
      take(current[episodes.revision % current.length], Math.max(size(), Math.floor(request.bytes / 2)));
  }
  for (const { row, score } of rank(all, request.query, (row) => [row.version.text, ...row.version.about].join(" ")))
    if (score > 0) take(row);
  return { packet: packet(), supplied: targets(selected), bytes: size(), eligible: all.length };
}
