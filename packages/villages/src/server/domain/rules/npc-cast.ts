import type { VillageState } from "../models/world.js";
import { badRequest } from "./errors.js";
import { cardCharacters } from "./visitors.js";
import { findLocation } from "./places.js";
import { namedNpcIds, npcIndex, npcNameKeys, npcNameKey, selectNpcCandidates } from "./npc-index.js";
import { readPlayerIdentity } from "./village-projections.js";

export function assertDistinctNpcName(state: VillageState, name: string, exceptId?: string) {
  const key = npcNameKey(name);
  const others = [
    ...cardCharacters(state).map((person) => ({ id: person.characterId, name: person.cardSnapshot.name })),
    { id: "player", name: readPlayerIdentity(state).name },
  ];
  const index = npcIndex(state.worldPlaces);
  if (
    !key ||
    others.some((person) => person.id !== exceptId && npcNameKey(person.name) === key) ||
    [...(index.names.get(key) ?? [])].some(
      (id) => id !== exceptId && npcNameKey(state.worldPlaces.npcs[id].name) === key,
    )
  )
    throw badRequest("That name already identifies someone in this Village. Use the established person.");
}

/** Identity references are GM context, never attendance or access to someone's private Memories. */
export function worldCharacterReferences(
  state: VillageState,
  scope: { mapId?: string; placeId?: string; query?: string } = {},
) {
  const location = scope.placeId && findLocation(state, scope.placeId),
    linked = new Set([
      ...(location?.residentIds ?? []),
      ...(location?.workerIds ?? []),
      ...(location?.access?.managerIds ?? []),
      ...(location?.zones ?? []).flatMap((zone) => [
        ...(zone.access?.managerIds ?? []),
        ...(zone.access?.memberIds ?? []),
        ...(zone.access?.inviterIds ?? []),
      ]),
    ]),
    named = namedNpcIds(state.worldPlaces, scope.query ?? ""),
    query = " " + npcNameKey(scope.query ?? "") + " ";
  const required = new Set([...linked, ...named]);
  const npcs = [
    ...required,
    ...selectNpcCandidates(state.worldPlaces, scope, [...required], 4).map((npc) => npc.id),
  ].flatMap((id) =>
    state.worldPlaces.npcs[id] && !state.worldPlaces.npcs[id].disabled ? [state.worldPlaces.npcs[id]] : [],
  );
  return [
    ...cardCharacters(state)
      .filter(
        (person) =>
          (!scope.placeId && state.villagers.some((resident) => resident.characterId === person.characterId)) ||
          linked.has(person.characterId) ||
          npcNameKeys(person.cardSnapshot.name).some((name) => name && query.includes(" " + name + " ")),
      )
      .map((person) => ({
        id: person.characterId,
        name: person.cardSnapshot.name,
        kind: "resident",
      })),
    ...npcs.map((npc) => ({ id: npc.id, name: npc.name, kind: "npc" })),
  ];
}
