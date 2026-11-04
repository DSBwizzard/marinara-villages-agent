import { createHash } from "node:crypto";
import { z } from "zod";
import type { NpcIdentity } from "../../../shared/contracts/places.js";
import type { VenueScene, VenueReplyLine } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { badGateway } from "./errors.js";
import { capturePlaceContext, findNpc, readNpc } from "./places.js";

export type NpcAdmission = { npc: NpcIdentity; segment: number; zoneId: string; source: string };
const introduction = z
  .object({
    ref: z.string().regex(/^new:[a-z0-9-]{1,60}$/),
    existingId: z.string().max(200).optional(),
    name: z.string().min(1).max(100),
    label: z.string().max(100).default(""),
    characterization: z.string().min(1).max(1000),
    segment: z.number().int().nonnegative(),
  })
  .strict();

export const NPC_INTRODUCTION_WRITING = `Supporting characters may be introduced when grounded in this setting, including an otherwise empty Scene. Prefer a suitable known person, while respecting availability; an association alone does not place them here. For at most four observed arrivals/introductions return npcIntroductions:[{ref:"new:local-key",existingId?:"known NPC id",name,label,characterization,segment:zero-based narration index}]. Use that ref as speakerId in subsequent segments. The cited narration must visibly establish the person in the CURRENT Zone before their dialogue. Do not impersonate an absent Villager or reveal an unseen person. Background crowds remain narration. New arrivals cannot witness earlier speech, including the player's input. A supporting character may speak, act, refuse and remember, but receives no resident Agenda, Wishes or construction leadership. Never invent the player's past, consent, or relationship. Genuine pre-established history must be grounded in supplied authored context.`;

/** Temporary writer references never become identities until the existing System exchange approves them. */
export function prepareNpcIntroductions(
  raw: Record<string, unknown>,
  state: VillageState,
  scene: VenueScene,
  requestKey: string,
) {
  if (raw.npcIntroductions === undefined) return { scene, admissions: [] as NpcAdmission[] };
  const proposals = z.array(introduction).max(4).safeParse(raw.npcIntroductions);
  if (!proposals.success || !Array.isArray(raw.segments))
    throw badGateway("Invalid supporting character introduction.");
  const admissions: NpcAdmission[] = [],
    refs = new Map<string, string>();
  for (const proposal of proposals.data) {
    const source = raw.segments[proposal.segment] as Record<string, unknown> | undefined;
    if (
      !source ||
      source.kind !== "narration" ||
      typeof source.text !== "string" ||
      !source.text.trim() ||
      refs.has(proposal.ref)
    )
      throw badGateway("A supporting character needs an exact observed introduction.");
    const previous = proposal.existingId ? findNpc(state, proposal.existingId) : undefined;
    if (proposal.existingId && !previous) throw badGateway("Unknown or unavailable supporting character.");
    const id =
      previous?.id ?? "npc:" + createHash("sha256").update(`${scene.id}:${requestKey}:${proposal.ref}`).digest("hex");
    if (
      scene.activeIds.includes(id) ||
      scene.sceneAttendance?.occupants.some((person) => person.characterId === id) ||
      scene.participants.some((person) => person.characterId === id) ||
      admissions.some((row) => row.npc.id === id)
    )
      throw badGateway("This person is already captured in the Scene. Use movement to change Zones.");
    const npc =
      previous ??
      readNpc({
        id,
        revision: 1,
        name: proposal.name,
        label: proposal.label || proposal.name,
        characterization: proposal.characterization,
        facts: [],
        associations: [],
        availability: "",
        disabled: false,
        source: `scene:${scene.id}:${requestKey}:${proposal.segment}`,
        updatedAt: scene.continuity?.capturedAt ?? scene.startedAt,
      });
    refs.set(proposal.ref, id);
    admissions.push({ npc, segment: proposal.segment, zoneId: scene.zoneId ?? "exterior", source: source.text.trim() });
  }
  const actorFields = new Set([
    "sourceId",
    "speakerId",
    "targetId",
    "characterId",
    "actorId",
    "ownerId",
    "visitorId",
    "controllerId",
  ]);
  const actorLists = new Set([
    "heardBy",
    "heardPlayerBy",
    "characterIds",
    "managerIds",
    "memberIds",
    "inviterIds",
    "controllerIds",
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
      else bind(field);
    }
  };
  bind(raw);
  const context = capturePlaceContext(state, scene.placeId, scene.activeIds);
  for (const admission of admissions) context.npcs[admission.npc.id] = admission.npc;
  const ids = admissions.map((row) => row.npc.id);
  const projected: VenueScene = {
    ...scene,
    pendingNpcAdmissions: admissions,
    activeIds: [...scene.activeIds, ...ids],
    participants: [
      ...scene.participants,
      ...admissions.map(({ npc }) => ({
        characterId: npc.id,
        name: npc.label || npc.name,
        doing: "Joining this Scene",
      })),
    ],
    sceneAttendance: {
      capturedAt: scene.sceneAttendance?.capturedAt ?? scene.startedAt,
      ...scene.sceneAttendance,
      occupants: [
        ...(scene.sceneAttendance?.occupants ?? []),
        ...admissions.map(({ npc, zoneId }) => ({
          characterId: npc.id,
          name: npc.label || npc.name,
          doing: "Joining this Scene",
          zoneId,
        })),
      ],
    },
    ...(scene.continuity
      ? { continuity: { ...scene.continuity, facts: { ...scene.continuity.facts, worldPlaces: context } } }
      : {}),
    ...(scene.contactGeneration
      ? {
          contactGeneration: {
            ...scene.contactGeneration,
            localIds: [...scene.contactGeneration.localIds, ...ids],
            actorIds: [...(scene.contactGeneration.actorIds ?? scene.activeIds), ...ids],
          },
        }
      : {}),
  };
  return { scene: projected, admissions };
}

export function validateNpcAdmissions(value: unknown, proposals: readonly NpcAdmission[]): NpcAdmission[] {
  if (!proposals.length) return [];
  if (
    !Array.isArray(value) ||
    value.length !== proposals.length ||
    proposals.some(
      (proposal) =>
        !value.some(
          (row) => row && row.id === proposal.npc.id && row.segment === proposal.segment && row.approved === true,
        ),
    )
  )
    throw badGateway("System could not validate the supporting character's identity, presence or availability.");
  return [...proposals];
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
      if (line.gazeAt === id) delete line.gazeAt;
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

export function admitNpcParticipants(scene: VenueScene, admissions: readonly NpcAdmission[]) {
  for (const { npc, zoneId } of admissions) {
    if (scene.continuity?.facts.worldPlaces) scene.continuity.facts.worldPlaces.npcs[npc.id] = structuredClone(npc);
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
