import type { VillageState } from "../models/world.js";
import type { KnownPursuit, PursuitStatus } from "../../../shared/contracts/pursuits.js";
import { projectMemories } from "./memory-views.js";
/** Read only saved disclosures; never resolve a private target, status or consent. */
export function knownDevelopment(state: VillageState, characterId: string): KnownPursuit[] {
  const grouped = new Map<string, KnownPursuit>();
  for (const row of projectMemories(state.memories, ["player"])
    .filter((row) => row.domainRef?.kind === "pursuit" && row.domainRef.characterId === characterId)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id))) {
    const fields = row.knowers.player!.disclosed,
      prior = grouped.get(row.domainRef!.id);
    grouped.set(row.domainRef!.id, {
      id: row.domainRef!.id,
      at: row.occurredAt,
      text: row.text,
      ...(prior?.title ? { title: prior.title } : {}),
      ...(typeof fields?.title === "string" ? { title: fields.title } : {}),
      ...(prior?.status ? { status: prior.status } : {}),
      ...(["considering", "stalled", "arranged", "completed", "ended"].includes(String(fields?.status))
        ? { status: fields!.status as PursuitStatus }
        : {}),
      agreements: [
        ...(prior?.agreements ?? []),
        ...(typeof fields?.agreementActorId === "string" &&
        typeof fields?.agreementName === "string" &&
        ["agree", "refuse", "conditional"].includes(String(fields?.decision))
          ? [
              {
                characterId: fields.agreementActorId,
                name: fields.agreementName,
                decision: fields.decision as import("../../../shared/contracts/pursuits.js").PursuitDecision,
                at: row.occurredAt,
              },
            ]
          : []),
      ],
      facts: [...(prior?.facts ?? []), { at: row.occurredAt, text: row.text, sceneId: "", lineIds: [] }],
    });
  }
  return [...grouped.values()];
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
  'The root developmentChanges array is required, including when context.development is empty. Return developmentChanges:[] or [{pursuitId,characterId,expectedRevision,kind:"disclose|consent|wait|end",actorId,decision?:"agree|refuse|conditional",citations:[{segment,quote}]}]. Cite exact current speech by actorId, heard by the mover; player consent requires actual captured player speech. Independently inspect each context.development pursuit; use its id as pursuitId. Record disclose when the mover tells the player about this exact intention, even if its status and consent are unchanged. Use memoryChanges with a pursuit domainRef and saved disclosed fields for player learning; disclose records a mechanical speech receipt and does not require a new plan. For example, the mover telling the player that they wanted the listed home but its household refused requires a disclose row, even though the move remains stalled. wait/end require the mover explaining their own changed intention. Agreement must be unconditional for this exact move and supplied home/room; unsupported conditions remain conditional. Refusals can change a plan. Player suggestions alone never decide the resident’s intention. Do not invent an intention or arrange/complete a move here. No change means []. ';
