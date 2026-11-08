import type { MemoryRecord } from "../models/memories.js";
import type { VenueLine, VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { rememberDomainFact } from "./domain-memories.js";
import { sceneEvidencePerception } from "./scene-evidence-perception.js";
import { estimatedMemoryTokens } from "./memory-protection.js";

export type EncounterQuotation = {
  sceneId: string;
  lineId: string;
  at: string;
  place: string;
  speakerId: string;
  text: string;
  heardBy: string[];
};

export const encounterMemoryId = (sceneId: string) => "encounter:" + sceneId;
/** An administrative handle only: no inferred acquaintance, names or relationship change. */
export function rememberSceneEncounter(state: VillageState, scene: VenueScene) {
  const knowers = scene.participants
    .filter((person) => scene.lines.some((line) => sharedEncounterSpeech(line, person.characterId)))
    .map((person) => person.characterId);
  if (!knowers.length) return;
  rememberDomainFact(state, {
    id: encounterMemoryId(scene.id),
    sceneId: scene.id,
    at: scene.startedAt,
    recordedAt: scene.endedAt || scene.startedAt,
    text: "A conversation took place at " + scene.placeName + ".",
    knowers: ["player", ...knowers],
    subjects: [],
  });
}

/** Recognition needs actual shared speech, not co-presence or an inferred relationship. */
export function sharedEncounterSpeech(line: VenueLine, id: string) {
  return (
    !line.contactReport &&
    !line.presenceChange &&
    ["dialogue", "side", "whisper"].includes(line.kind ?? "") &&
    sceneEvidencePerception(line).playerPerception === "full" &&
    (line.speakerId === id || line.heardBy.includes(id))
  );
}

/** Never replay raw evidence behind Forget/Correct, even when it has no matching search terms. */
export function encounterKnowerProtected(
  records: ReadonlyMap<string, MemoryRecord>,
  sceneId: string,
  id: string,
  at: string,
) {
  const anchor = [...records.values()].find(
    (row) => row.origin.kind === "domain" && row.origin.id === encounterMemoryId(sceneId),
  );
  if (!anchor?.knowers[id] || anchor.knowers[id].forgotten || anchor.knowers[id].repair) return true;
  return [...records.values()].some((row) => {
    const root = records.get(row.rootId);
    const knower = root?.knowers[id];
    if (!knower || (!knower.forgotten && !knower.repair && !row.corrects)) return false;
    const sources = [row.origin, ...Object.values(row.knowers).flatMap((state) => state.support.map((e) => e.source))];
    // Unlinked administrative knowledge cannot safely be matched to a quotation by word overlap.
    const protectedAt = [knower.forgotten?.at, knower.repair?.at, row.corrects ? row.recordedAt : undefined]
      .filter((value): value is string => !!value)
      .sort()
      .at(-1)!;
    return (
      at <= protectedAt ||
      sources.some((source) => source.sceneId === sceneId) ||
      sources.every((source) => !source.sceneId)
    );
  });
}

/** Shared allowance for the entire cast; the caller reserves it inside the existing Memory budget. */
export function fitEncounterQuotations(rows: EncounterQuotation[], budget = 600) {
  const selected: EncounterQuotation[] = [];
  for (const row of rows) {
    if (!row.heardBy.length) continue;
    const candidate = row;
    if (estimatedMemoryTokens(JSON.stringify({ encounters: [...selected, candidate] })) <= budget)
      selected.push(candidate);
  }
  return selected;
}
