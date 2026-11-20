import type { VenueScene } from "../models/scene-model.js";
import { memoryHash } from "./memory-integrity.js";
import { contactPosition } from "./venue-contact.js";
import { z } from "zod";
import { isTrespassReason, type TrespassReason } from "../../../shared/helpers/venue-access.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { actorTrespassReason, contactNeighbors, physicallyUsableZone, sceneAccessContext } from "./venue-contact.js";
import { continuityActor } from "./continuity-actors.js";
import { evaluateZoneAccess } from "./venue-access.js";
import { sceneAccessState, sceneLayoutVenue } from "./scene-layout.js";
import { conflict } from "./errors.js";

/** Legacy explicit crossing requests retain their original scope when recovered. */
export function prepareMovementParty(
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  zoneId: string,
  selected: string[],
  escort = scene.accompanying,
) {
  const zone = venue.zones?.find((row) => row.id === zoneId),
    from = scene.zoneId ?? "",
    at = sceneAccessContext(scene, undefined, state.timeZone).at!;
  const captured = sceneLayoutVenue(venue, scene),
    capturedZone = captured.zones?.find((row) => row.id === zoneId);
  const accompanying = [
    ...(escort ?? []).filter((row) => !selected.includes(row.characterId)),
    ...selected.map((characterId) => ({ characterId, zoneId })),
  ];
  const projected = { ...scene, accompanying };
  const moves = selected.map((actorId) => {
    const agreement = scene.movementAgreements?.find(
      (row) => row.actorId === actorId && row.from === from && row.zoneId === zoneId,
    );
    if (
      !zone ||
      !capturedZone ||
      !agreement ||
      actorId === "player" ||
      contactPosition(scene, actorId) !== from ||
      continuityActor(state, actorId)?.incarnation !== agreement.incarnation ||
      !contactNeighbors(venue, from, scene).includes(zoneId) ||
      !contactNeighbors(venue, from).includes(zoneId) ||
      !physicallyUsableZone(state, venue, zone, at) ||
      !physicallyUsableZone(sceneAccessState(state, scene), captured, capturedZone, at)
    )
      throw conflict("That companion's agreement or position changed. Ask them again.");
    const decision = evaluateZoneAccess(venue, zone, actorId, {
      ...sceneAccessContext(projected, at),
      accepting: true,
      environment: state.narrative,
    });
    const capturedDecision = evaluateZoneAccess(captured, capturedZone, actorId, {
      ...sceneAccessContext(projected, at),
      accepting: true,
      environment: sceneAccessState(state, scene).narrative,
    });
    if (decision.allowed && capturedDecision.allowed) {
      if (decision.permissionId !== capturedDecision.permissionId)
        throw conflict("That companion's invitation changed. Ask them again.");
      return { actorId, permissionId: decision.permissionId };
    }
    const reason = agreement.trespass && actorTrespassReason(state, venue, zone, projected, actorId, from, at);
    if (
      !reason ||
      actorTrespassReason(sceneAccessState(state, scene), captured, capturedZone, projected, actorId, from, at) !==
        reason
    )
      throw conflict("That companion cannot make this crossing.");
    return { actorId, trespass: { actorId, zoneId, reason } };
  });
  return { accompanying, moves };
}

export type ActorTrespass = {
  actorId: string;
  zoneId: string;
  reason: import("../../../shared/helpers/venue-access.js").TrespassReason;
};
export type MovementAgreement = {
  actorId: string;
  incarnation: string;
  from: string;
  zoneId: string;
  trespass?: true;
  following?: true;
};
export type TrespassReaction = { id: string; key: string; zoneId: string; intruders: string[]; witnesses: string[] };
const id = z.string().min(1).max(160),
  ids = z.array(id).max(32);
const fields = z.object({
  actorTrespasses: z
    .array(z.object({ actorId: id, zoneId: id, reason: z.custom<TrespassReason>(isTrespassReason) }).strict())
    .max(32)
    .optional(),
  movementAgreements: z
    .array(
      z
        .object({
          actorId: id,
          incarnation: id,
          from: id,
          zoneId: id,
          trespass: z.literal(true).optional(),
          following: z.literal(true).optional(),
        })
        .strict(),
    )
    .max(64)
    .optional(),
  trespassEncounterKeys: z.array(z.string().regex(/^[a-f0-9]{64}$/)).optional(),
  trespassReaction: z
    .object({
      id: z.string().regex(/^trespass-[a-f0-9]{64}$/),
      key: z.string().regex(/^[a-f0-9]{64}$/),
      zoneId: id,
      intruders: ids.min(1),
      witnesses: ids.min(1),
    })
    .strict()
    .optional(),
});
export function readSceneTrespassFields(raw: Record<string, unknown>) {
  return fields.parse(raw);
}
export function readMovementCompanions(value: unknown, limit = 4): string[] {
  return value === undefined
    ? []
    : z
        .array(id)
        .max(limit)
        .refine((rows) => new Set(rows).size === rows.length)
        .parse(value)
        .sort();
}

/** Intrusion is private GM context; it does not establish detection or consent. */
export function trespassEncounter(scene: VenueScene): Omit<TrespassReaction, "id"> | undefined {
  if (scene.status !== "active" || !scene.zoneId) return;
  const intruders = [
    ...(scene.trespass?.zoneId === scene.zoneId ? ["player"] : []),
    ...(scene.actorTrespasses ?? [])
      .filter((row) => row.zoneId === scene.zoneId && contactPosition(scene, row.actorId) === row.zoneId)
      .map((row) => row.actorId),
  ].sort();
  if (!intruders.length) return;
  const party =
    scene.navigationReceipts?.findLast(
      (row) => row.destinationZoneId === scene.zoneId && row.originZoneId !== row.destinationZoneId,
    )?.companions ?? [];
  const witnesses = (scene.sceneAttendance?.occupants ?? [])
    .filter(
      (row) =>
        contactPosition(scene, row.characterId) === scene.zoneId &&
        !intruders.includes(row.characterId) &&
        !party.includes(row.characterId),
    )
    .map((row) => row.characterId)
    .sort();
  if (!witnesses.length) return;
  const key = memoryHash([scene.zoneId, intruders, witnesses]);
  return { key, zoneId: scene.zoneId, intruders, witnesses };
}

/** Queuing is free. Only the deliberate reaction endpoint may purchase a turn. */
export function queueTrespassReaction(scene: VenueScene, enabled: boolean) {
  const encounter = enabled ? trespassEncounter(scene) : undefined;
  if (scene.trespassReaction?.key !== encounter?.key) delete scene.trespassReaction;
  if (!encounter || !encounterPairs(encounter).some((key) => !scene.trespassEncounterKeys?.includes(key))) return;
  scene.trespassReaction = { ...encounter, id: "trespass-" + encounter.key };
}

/** A normal reply can already address the encounter, so it must not cause another automatic reply. */
export function settleTrespassReaction(scene: VenueScene) {
  const encounter = trespassEncounter(scene);
  const seen = [
    ...(scene.trespassReaction ? encounterPairs(scene.trespassReaction) : []),
    ...(encounter ? encounterPairs(encounter) : []),
  ];
  if (seen.length) scene.trespassEncounterKeys = [...new Set([...(scene.trespassEncounterKeys ?? []), ...seen])];
  delete scene.trespassReaction;
}

function encounterPairs(encounter: Omit<TrespassReaction, "id">) {
  return encounter.intruders.flatMap((intruder) =>
    encounter.witnesses.map((witness) => memoryHash([encounter.zoneId, intruder, witness])),
  );
}
