import { z } from "zod";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { NpcIdentity } from "../models/places.js";
import type { VenueLine, VenueScene, VenueReplyLine } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { badGateway } from "./errors.js";
import { findLocation, findNpc, readNpc } from "./places.js";
import { assertDistinctNpcName } from "./npc-cast.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

export type NpcAdmission = { localKey: string; npc: NpcIdentity; segment: number; zoneId: string; source: string };
export const npcAdmissionFields = {
  localKey: z.string().regex(/^new:[a-z0-9-]{1,60}$/),
  existingId: z.string().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  label: z.string().trim().min(1).max(100).optional(),
  appearance: z.string().trim().min(1).max(1000).optional(),
  characterization: z.string().trim().min(1).max(1000).optional(),
};
export type NpcAdmissionRequest = z.infer<z.ZodObject<typeof npcAdmissionFields>>;
export const DEFAULT_NPC_LABEL = "Stranger";
export function revealsNpcName(
  line: Pick<VenueLine, "kind" | "heardBy" | "contactHidden" | "content">,
  name: string,
  firstAtAdmission: boolean,
  speakerLabel?: unknown,
  allowSpokenName = true,
): boolean {
  if (
    (line.kind !== "dialogue" && line.kind !== "whisper" && line.kind !== "side") ||
    line.contactHidden ||
    !line.heardBy.includes("player")
  )
    return false;
  if (speakerLabel === name) return true;
  if (!allowSpokenName) return false;
  const namePattern = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const introduction = "(?:[Ii](?:['’]m| am)|[Mm]y name is|[Yy]ou can call me|[Cc]all me)\\s+";
  const text = line.content.trim();
  return (
    new RegExp(`(?:^|[.!?]\\s+)${introduction}${namePattern}(?=[.!?](?:\\s|$)|[,–—]|$)`, "u").test(text) ||
    (firstAtAdmission && new RegExp(`^${namePattern}(?:[.!](?:\\s|$)|$)`, "u").test(text))
  );
}

export function witnessedNpcName(source: ContinuityEvidence, actorId: string, name: string): boolean {
  if (!name.trim() || name !== name.trim() || name.length > 100 || /[\r\n]/.test(name)) return false;
  const pattern = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    source.kind === "speech" &&
    source.actorId === actorId &&
    source.perceptions.some(
      (row) =>
        row.actorId === "player" &&
        row.channel === "words" &&
        new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, "u").test(row.text),
    )
  );
}

/** Metadata is provisional until its current observed introduction passes native acceptance. */
export function prepareNpcAdmission(
  state: VillageState,
  scene: VenueScene,
  request: NpcAdmissionRequest,
  operationId: string,
  segment: number,
  zoneId: string,
  source: string,
  captured?: NpcIdentity,
): NpcAdmission {
  memoryRequire(
    scene.sceneAttendance?.layout?.some((zone) => zone.id === zoneId) && source.trim(),
    "NPC admission needs its captured Zone and exact introduction",
  );
  let npc: NpcIdentity;
  if (request.existingId) {
    const current = findNpc(state, request.existingId);
    memoryRequire(
      current &&
        captured &&
        captured.id === current.id &&
        memoryHash(captured) === memoryHash(current) &&
        !["name", "label", "characterization", "appearance", "playerIntroduction"].some((key) =>
          Object.hasOwn(request, key),
        ),
      "existing NPC admission needs its exact fitted identity",
    );
    npc = structuredClone(captured);
  } else {
    memoryRequire(request.name, "a new NPC needs a name");
    assertDistinctNpcName(state, request.name);
    if (request.label) assertDistinctNpcName(state, request.label);
    const id = "npc:" + memoryHash([state.seed, scene.id, operationId, request.localKey]);
    memoryRequire(!state.worldPlaces.npcs[id], "replay the accepted NPC introduction");
    npc = readNpc({
      id,
      revision: 1,
      name: request.name,
      label: request.label ?? DEFAULT_NPC_LABEL,
      appearance: request.appearance,
      characterization: request.characterization ?? "",
      mapId: findLocation(state, scene.placeId)?.presentation.mapId,
      listed: false,
      facts: [],
      associations: [{ placeId: scene.placeId, role: "Encountered here" }],
      availability: "",
      disabled: false,
      source: "scene:" + scene.id + ":" + operationId + ":" + request.localKey,
      updatedAt: scene.sceneAttendance!.capturedAt,
    });
  }
  memoryRequire(
    !scene.participants.some((person) => person.characterId === npc.id) &&
      !scene.sceneAttendance?.occupants.some((person) => person.characterId === npc.id),
    "use movement for a person already captured in the Scene",
  );
  return { localKey: request.localKey, npc, segment, zoneId, source };
}

/** Translate structured character references on a clone; exact purchased text and citations stay untouched. */
export function bindNpcReferences(
  raw: Record<string, unknown>,
  admissions: readonly NpcAdmission[],
): Record<string, unknown> {
  const refs = new Map(admissions.map((row) => [row.localKey, row.npc.id])),
    bound = structuredClone(raw);
  const actorFields = new Set([
    "sourceId",
    "by",
    "who",
    "owner",
    "visitor",
    "person",
    "proposer",
    "existingId",
    "speakerId",
    "targetId",
    "characterId",
    "actorId",
    "ownerId",
    "visitorId",
    "controllerId",
    "attributedTo",
  ]);
  const actorLists = new Set([
    "heardBy",
    "by",
    "to",
    "for",
    "about",
    "knownBy",
    "actors",
    "controllers",
    "characterIds",
    "managerIds",
    "memberIds",
    "inviterIds",
    "controllerIds",
    "subjects",
    "participants",
    "targetIds",
  ]);
  const bind = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(bind);
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, field] of Object.entries(value)) {
      const row = value as Record<string, unknown>;
      if (actorFields.has(key) && typeof field === "string") row[key] = refs.get(field) ?? field;
      else if (actorLists.has(key) && Array.isArray(field)) row[key] = field.map((id) => refs.get(String(id)) ?? id);
      else if (key === "learners" && field && typeof field === "object" && !Array.isArray(field)) {
        const learners: Record<string, unknown> = {};
        for (const [id, learning] of Object.entries(field)) {
          const bound = refs.get(id) ?? id;
          if (Object.hasOwn(learners, bound)) throw badGateway("Duplicate supporting character learner.");
          learners[bound] = learning;
          bind(learning);
        }
        row[key] = learners;
      } else bind(field);
    }
  };
  bind(bound);
  return bound;
}

export function fenceIntroductionWitnesses(lines: VenueReplyLine[], admissions: readonly NpcAdmission[]) {
  if (
    new Set(
      lines
        .filter(
          (line) =>
            line.kind !== "narration" &&
            line.speakerId &&
            line.speakerId !== "player" &&
            !("role" in line && line.role === "user"),
        )
        .map((line) => line.speakerId),
    ).size > 4
  )
    throw badGateway("A reply may contain at most four responding people.");
  for (const admission of [...admissions].sort((a, b) => a.segment - b.segment)) {
    const id = admission.npc.id;
    for (let index = 0; index < admission.segment; index++) {
      const line = lines[index];
      if (line.speakerId === id) throw badGateway("A person spoke before their introduction.");
      line.heardBy = line.heardBy.filter((actor) => actor !== id);
      if (line.soundOnly) line.soundOnly.characterIds = line.soundOnly.characterIds.filter((actor) => actor !== id);
      if (line.physicalIdsAfter) line.physicalIdsAfter = line.physicalIdsAfter.filter((actor) => actor !== id);
      if (line.staging)
        line.staging = line.staging
          .filter((cue) => cue.characterId !== id)
          .map((cue) => ({
            ...cue,
            ...(cue.look?.target === "villager" && cue.look.characterId === id ? { look: undefined } : {}),
          }));
    }
  }
}

export function admitNpcParticipants(scene: VenueScene, admissions: readonly Pick<NpcAdmission, "npc" | "zoneId">[]) {
  for (const { npc, zoneId } of admissions) {
    if (scene.continuity?.facts.worldPlaces) {
      const context = scene.continuity,
        places = context.facts.worldPlaces!;
      scene.continuity = {
        ...context,
        facts: {
          ...context.facts,
          worldPlaces: {
            ...places,
            npcs: { ...places.npcs, [npc.id]: structuredClone(npc) },
          },
        },
      };
    }
    if (!scene.participants.some((person) => person.characterId === npc.id))
      scene.participants.push({ characterId: npc.id, name: npc.label || npc.name, doing: "Joining this Scene" });
    if (!scene.activeIds.includes(npc.id)) scene.activeIds.push(npc.id);
    if (scene.sceneAttendance && !scene.sceneAttendance.occupants.some((person) => person.characterId === npc.id))
      scene.sceneAttendance.occupants.push({
        characterId: npc.id,
        name: npc.label || npc.name,
        doing: "Joining this Scene",
        zoneId,
      });
  }
}
