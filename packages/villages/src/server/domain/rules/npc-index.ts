import type { NpcIdentity, PlaceRegistry } from "../models/places.js";
import { isImmutableMemoryValue } from "./memory-integrity.js";
import { recallTerms } from "./text-recall.js";

export const npcNameKey = (name: string) =>
  name
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export const npcNameKeys = (name: string) => {
  const full = npcNameKey(name),
    first = full.split(" ")[0];
  return first.length >= 3 &&
    !/^(the|a|an|mr|mrs|ms|mx|dr|doctor|professor|sir|lady|lord|captain|chief|officer)$/u.test(first)
    ? [full, first]
    : [full];
};
type NpcIndex = {
  names: Map<string, Set<string>>;
  maps: Map<string, Set<string>>;
  places: Map<string, Set<string>>;
  terms: Map<string, Set<string>>;
};
const indexes = new WeakMap<object, NpcIndex>();
const add = (index: Map<string, Set<string>>, key: string, id: string) => {
  if (!key) return;
  const ids = index.get(key) ?? new Set<string>();
  ids.add(id);
  index.set(key, ids);
};

/** Cache only immutable saved dictionaries; mutable CAS candidates must see every provisional edit. */
export function npcIndex(registry: PlaceRegistry): NpcIndex {
  const saved = indexes.get(registry.npcs);
  if (saved) return saved;
  const index: NpcIndex = { names: new Map(), maps: new Map(), places: new Map(), terms: new Map() };
  for (const npc of Object.values(registry.npcs)) {
    for (const key of npcNameKeys(npc.name)) add(index.names, key, npc.id);
    if (npc.disabled) continue;
    add(index.maps, npc.mapId ?? "", npc.id);
    for (const row of npc.associations) add(index.places, row.placeId, npc.id);
    for (const term of new Set(recallTerms(`${npc.name} ${npc.label} ${npc.appearance ?? ""} ${npc.characterization}`)))
      add(index.terms, term, npc.id);
  }
  if (isImmutableMemoryValue(registry.npcs)) indexes.set(registry.npcs, index);
  return index;
}

export function namedNpcIds(registry: PlaceRegistry, query: string, index = npcIndex(registry)): Set<string> {
  const words = npcNameKey(query).split(" "),
    ids = new Set<string>();
  for (let start = 0; start < words.length; start++)
    for (let length = 1; length <= Math.min(8, words.length - start); length++)
      for (const id of index.names.get(words.slice(start, start + length).join(" ")) ?? []) ids.add(id);
  return ids;
}

export function selectNpcCandidates(
  registry: PlaceRegistry,
  scope: { mapId?: string; placeId?: string; query?: string; authorityIds?: readonly string[] },
  excluded: readonly string[] = [],
  limit = 4,
): NpcIdentity[] {
  const index = npcIndex(registry),
    local = new Set(index.places.get(scope.placeId ?? "") ?? []),
    authority = new Set(scope.authorityIds ?? []),
    named = namedNpcIds(registry, scope.query ?? "", index),
    candidates = new Set([...local, ...authority, ...(index.maps.get(scope.mapId ?? "") ?? [])]);
  const scores = new Map<string, number>();
  for (const term of new Set(recallTerms(scope.query ?? "")))
    for (const id of index.terms.get(term) ?? []) scores.set(id, (scores.get(id) ?? 0) + 1);
  return [...candidates]
    .flatMap((id) => {
      const npc = registry.npcs[id];
      return npc && !npc.disabled && !excluded.includes(id) ? [npc] : [];
    })
    .sort(
      (a, b) =>
        Number(named.has(b.id)) - Number(named.has(a.id)) ||
        Number(authority.has(b.id)) - Number(authority.has(a.id)) ||
        (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) ||
        Number(local.has(b.id)) - Number(local.has(a.id)) ||
        b.updatedAt.localeCompare(a.updatedAt) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}
