import { z } from "zod";
import type { NpcIdentity } from "../models/places.js";
import type { VenueScene, VenueReplyLine } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { badGateway } from "./errors.js";
import { readNpc, findNpc } from "./places.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

export type NpcAdmission = { localKey: string; npc: NpcIdentity; segment: number; zoneId: string; source: string };
export const npcAdmissionFields = {
  localKey: z.string().regex(/^new:[a-z0-9-]{1,60}$/),
  existingId: z.string().min(1).max(160).optional(),
  name: z.string().min(1).max(100).optional(),
  label: z.string().max(100).optional(),
  characterization: z.string().min(1).max(1000).optional(),
};
export type NpcAdmissionRequest = {
  localKey: string;
  existingId?: string;
  name?: string;
  label?: string;
  characterization?: string;
};

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
        request.name === undefined &&
        request.label === undefined &&
        request.characterization === undefined,
      "existing NPC admission needs its exact fitted identity",
    );
    npc = structuredClone(captured);
  } else {
    memoryRequire(
      request.name?.trim() && request.characterization?.trim(),
      "a new supporting person needs their complete identity",
    );
    const id = "npc:" + memoryHash([state.seed, scene.id, operationId, request.localKey]);
    memoryRequire(
      !state.worldPlaces.npcs[id],
      "the supporting identity is already retained; replay its accepted Episode",
    );
    npc = readNpc({
      id,
      revision: 1,
      name: request.name,
      label: request.label || request.name,
      characterization: request.characterization,
      facts: [],
      associations: [],
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
  if (!npc.associations.some((row) => row.placeId === scene.placeId)) {
    npc.associations = [...npc.associations.slice(-11), { placeId: scene.placeId, role: "Encountered here" }];
    if (request.existingId) npc.revision++;
  }
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
    "heardPlayerBy",
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

export function fenceIntroductionWitnesses(
  lines: VenueReplyLine[],
  heardPlayerBy: string[],
  admissions: readonly NpcAdmission[],
  localIds: readonly string[] = [],
  emitBoundaries = true,
) {
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
    if (emitBoundaries) {
      const boundary = lines[admission.segment];
      const previous =
        lines.slice(0, admission.segment + 1).findLast((line) => line.physicalIdsAfter)?.physicalIdsAfter ?? localIds;
      const future = new Set(admissions.filter((row) => row.segment > admission.segment).map((row) => row.npc.id));
      boundary.physicalIdsAfter = [
        ...new Set([
          ...previous,
          ...admissions.filter((row) => row.segment === admission.segment).map((row) => row.npc.id),
        ]),
      ].filter((actor) => !future.has(actor));
    }
    const playerIndex = heardPlayerBy.indexOf(id);
    if (playerIndex >= 0) heardPlayerBy.splice(playerIndex, 1);
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
