import type { OpeningView } from "../../../shared/contracts/opening.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord, asStringArray, asTrimmedString } from "./coerce.js";
import { conflict } from "./errors.js";
export type OpeningRecord = OpeningView;
export function initialOpening(residentIds: string[], communityVenueId: string, id: string): OpeningRecord {
  return { id, version: 3, stage: "gathering", communityVenueId, gatheringSceneId: "", residentIds: [...residentIds] };
}
export function readOpening(value: unknown): OpeningRecord | undefined {
  if (value == null) return undefined;
  const row = asRecord(value);
  if (row.version !== 3 || !["gathering", "complete", "ended"].includes(String(row.stage)))
    throw conflict("Unsupported opening record. Restore a fresh-format Village.");
  return {
    id: asTrimmedString(row.id),
    version: 3,
    stage: row.stage as OpeningRecord["stage"],
    communityVenueId: asTrimmedString(row.communityVenueId),
    gatheringSceneId: asTrimmedString(row.gatheringSceneId),
    residentIds: asStringArray(row.residentIds),
  };
}
export function openingView(state: VillageState): OpeningView | undefined {
  return state.opening ? structuredClone(state.opening) : undefined;
}
export function openingSceneDirection(state: VillageState, scene: VenueScene): string {
  if (state.opening?.stage !== "gathering" || scene.id !== state.opening.gatheringSceneId || scene.status !== "opening")
    return "";
  return "OPENING SCENE: Begin with a small everyday task already underway in this shared place, suited to the setting, the residents and their established relationships. Develop a few meaningful beats through natural action and conversation, then pause at a natural moment for the player to respond. Let personalities and relationships shape the interaction without requiring everyone to speak or introduce themselves. Do not invent the player's words, actions, feelings or commitments. Respect each person's knowledge, privacy, authored history and identity. Do not require or stage a Project pitch, invent a major crisis, or force a welcome. The player may continue or leave freely.";
}
