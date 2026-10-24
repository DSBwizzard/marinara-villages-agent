import type { VillageState } from "../models/world.js";
export function knownDevelopment(state: VillageState, characterId: string) {
  return (state.development?.residents[characterId]?.pursuits ?? []).flatMap((p) =>
    p.known ? [{ id: p.id, ...p.known }] : [],
  );
}
export function developmentSceneContext(state: VillageState, actorIds: string[]) {
  return actorIds.flatMap((characterId) => {
    const resident = state.development?.residents[characterId];
    return (resident?.pursuits ?? [])
      .filter((p) => !["ended", "completed"].includes(p.status))
      .map((p) => ({ characterId, expectedRevision: resident!.revision, ...p }));
  });
}

export const DEVELOPMENT_SCENE_INSTRUCTION =
  'The root developmentChanges array is required, including when context.development is empty. Return developmentChanges:[] or [{pursuitId,characterId,expectedRevision,kind:"disclose|consent|wait|end",actorId,decision?:"agree|refuse|conditional",citations:[{segment,quote}]}]. Cite exact current speech by actorId, heard by the mover; player consent requires actual captured player speech. Disclosure requires the mover actually telling the player about this intention. wait/end require the mover explaining their own changed intention. Agreement must be unconditional for this exact move and supplied home/room; unsupported conditions remain conditional. Refusals can change a plan. Player suggestions alone never decide the resident’s intention. Do not invent an intention or arrange/complete a move here. No change means []. ';
