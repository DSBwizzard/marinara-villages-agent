import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { isTrespassReason } from "../../../shared/helpers/venue-access.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { sceneAccessState, sceneLayoutVenue } from "./scene-layout.js";
import { type AccessContext, evaluateZoneAccess } from "./venue-access.js";
import { resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";
import { conflict } from "./errors.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { ordinaryUseRestricted } from "./narrative-environment.js";

export type ContactDelivery = "voice" | "loud";
export type ContactIntent = {
  /** Legacy knock values are retained for saved request identity. */
  kind: "knock" | "call";
  targetId: string;
  boundaryZoneId: string;
  quote: string;
  delivery?: ContactDelivery;
};
export type DoorwayContact = {
  characterId: string;
  playerZoneId: string;
  characterZoneId: string;
  delivery?: ContactDelivery;
};
export type ContactMove = {
  characterId: string;
  zoneId: string;
  quote: string;
  path: string[];
  /** Movement completes in this narration segment. */
  segment: number;
};

/** Hearing connections only; entry remains governed by existing Zone permissions. */
export function contactNeighbors(venue: VillageVenue, zoneId: string, scene?: VenueScene): string[] {
  return contactNeighborIds(venueZones(sceneLayoutVenue(venue, scene)), zoneId);
}
export function contactPosition(
  scene: Pick<VenueScene, "departedIds" | "accompanying" | "sceneAttendance">,
  characterId: string,
): string {
  if (scene.departedIds?.includes(characterId)) return "";
  return (
    scene.accompanying?.find((entry) => entry.characterId === characterId)?.zoneId ??
    scene.sceneAttendance?.occupants.find((entry) => entry.characterId === characterId)?.zoneId ??
    ""
  );
}

/** Project a native permission's present escort only for deliberate entry checks. */
export function sceneMoveAccompanying(
  scene: VenueScene,
  venue: VillageVenue,
  zone: VillageVenueZone,
  state: VillageState,
) {
  const context = sceneAccessContext(scene, undefined, state.timeZone);
  for (const grant of venue.access?.permissions ?? []) {
    const escort = grant.accompaniedBy ?? (zone.access?.accompanied ? grant.issuerId : null);
    if (
      !escort ||
      contactPosition(scene, escort) !== scene.zoneId ||
      !contactPath(state, venue, scene.zoneId ?? "", zone.id, escort, scene, context.at)
    )
      continue;
    const decision = evaluateZoneAccess(venue, zone, "player", {
      ...context,
      positions: { ...context.positions, [escort]: zone.id },
      accepting: true,
      unavailable: zoneClosed(state, venue, zone),
      environment: state.narrative,
    });
    if (decision.allowed && decision.permissionId === grant.id && decision.accompaniedBy === escort)
      return [
        ...(scene.accompanying ?? []).filter((entry) => entry.characterId !== escort),
        { characterId: escort, zoneId: zone.id },
      ];
  }
  return scene.accompanying;
}
export function sceneAccessContext(
  scene: Pick<
    VenueScene,
    "id" | "startedAt" | "sceneAttendance" | "accompanying" | "departedIds" | "zoneId" | "continuity"
  >,
  at?: Date,
  timeZone?: string,
): AccessContext {
  return {
    sceneId: scene.id,
    at:
      at ??
      new ZonedDate(
        scene.sceneAttendance?.capturedAt ?? scene.startedAt,
        scene.continuity?.facts.timeZone || timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      ),
    positions: {
      ...Object.fromEntries((scene.sceneAttendance?.occupants ?? []).map((row) => [row.characterId, row.zoneId])),
      ...Object.fromEntries((scene.accompanying ?? []).map((row) => [row.characterId, row.zoneId])),
      ...Object.fromEntries((scene.departedIds ?? []).map((actor) => [actor, ""])),
      player: scene.zoneId ?? "exterior",
    },
  };
}
export function contactCanEnter(
  state: VillageState,
  venue: VillageVenue,
  zoneId: string,
  characterId: string,
  scene?: VenueScene,
  at?: Date,
  accepting = characterId === "player",
): boolean {
  if (scene) state = sceneAccessState(state, scene);
  venue = sceneLayoutVenue(venue, scene);
  const zone = venueZones(venue).find((entry) => entry.id === zoneId);
  if (zone?.closed) return false;
  return (
    !!zone &&
    evaluateZoneAccess(venue, zone, characterId, {
      ...(scene ? sceneAccessContext(scene, at, state.timeZone) : { at }),
      accepting,
      unavailable: zoneClosed(state, venue, zone),
      environment: state.narrative,
    }).allowed
  );
}
export function physicallyUsableZone(state: VillageState, venue: VillageVenue, zone: VillageVenueZone, at: Date) {
  return (
    !zone.closed &&
    !zoneClosed(state, venue, zone) &&
    !ordinaryUseRestricted(state.narrative, at.toISOString(), venue.id, zone.id)
  );
}

export function sceneTrespassReason(
  state: VillageState,
  venue: VillageVenue,
  zone: VillageVenueZone,
  scene: VenueScene,
  at: Date,
) {
  return actorTrespassReason(state, venue, zone, scene, "player", scene.zoneId ?? "", at);
}

export function actorTrespassReason(
  state: VillageState,
  venue: VillageVenue,
  zone: VillageVenueZone,
  scene: VenueScene,
  actorId: string,
  from: string,
  at: Date,
) {
  if (
    !venue.access ||
    !zone.access ||
    !contactNeighbors(venue, from, scene).includes(zone.id) ||
    !physicallyUsableZone(state, venue, zone, at)
  )
    return;
  const { reason } = evaluateZoneAccess(venue, zone, actorId, {
    ...sceneAccessContext(scene, at, state.timeZone),
    accepting: true,
    environment: state.narrative,
  });
  return isTrespassReason(reason) ? reason : undefined;
}
/** The layout supplies crossings. Entry restrictions are evaluated separately. */
export function physicalVenuePath(
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  to: string,
  at: Date,
  permittedApproach = false,
): string[] | undefined {
  const start = scene.zoneId;
  if (!start) return;
  const paths = [[start]];
  const seen = new Set([start]);
  for (const path of paths) {
    const last = path.at(-1)!;
    if (last === to) return path;
    for (const next of contactNeighbors(venue, last, scene)) {
      if (seen.has(next)) continue;
      const zone = resolveVenueZone(venue, next);
      if (!zone || !physicallyUsableZone(state, venue, zone, at)) continue;
      if (permittedApproach && next !== to && !contactCanEnter(state, venue, next, "player", scene, at)) continue;
      seen.add(next);
      paths.push([...path, next]);
    }
  }
}
/** Every entered Zone needs access, including intermediate Zones on the way to Entrance. */
export function contactPath(
  state: VillageState,
  venue: VillageVenue,
  from: string,
  to: string,
  actor: string,
  scene?: VenueScene,
  at?: Date,
  acceptDestination = false,
): string[] | null {
  if (!from || !to) return null;
  const queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!,
      last = path.at(-1)!;
    if (last === to) return path;
    for (const next of contactNeighbors(venue, last, scene)) {
      const accepting = actor === "player" || (acceptDestination && next === to);
      if (seen.has(next) || !contactCanEnter(state, venue, next, actor, scene, at, accepting)) continue;
      seen.add(next);
      queue.push([...path, next]);
    }
  }
  return null;
}

/** Recheck a captured move against current authority before displaying or claiming it. */
export function liveSceneMovePermission(
  state: VillageState,
  venue: VillageVenue,
  zoneId: string,
  scene: VenueScene,
  accompanying: VenueScene["accompanying"],
  at: Date | undefined,
  permissionId: string | undefined,
  escort = accompanying,
): string | undefined {
  const target = resolveVenueZone(venue, zoneId);
  if (!target) throw conflict("That Zone is no longer available.");
  const liveScene = {
    ...scene,
    continuity: undefined,
    sceneAttendance: scene.sceneAttendance ? { ...scene.sceneAttendance, layout: undefined } : undefined,
    accompanying,
  };
  if (!contactPath(state, venue, scene.zoneId, target.id, "player", liveScene, at))
    throw conflict("That route is no longer permitted.");
  for (const companion of escort ?? []) {
    const origin = contactPosition(scene, companion.characterId);
    if (
      origin !== companion.zoneId &&
      !contactPath(state, venue, origin, companion.zoneId, companion.characterId, liveScene, at)
    )
      throw conflict("Your escort can no longer take that route.");
  }
  const decision = evaluateZoneAccess(venue, target, "player", {
    ...sceneAccessContext({ ...scene, accompanying }, at),
    accepting: true,
    unavailable: zoneClosed(state, venue, target),
    environment: state.narrative,
  });
  if (!decision.allowed) throw conflict(decision.explanation);
  if (permissionId && decision.permissionId !== permissionId)
    throw conflict("That invitation changed. Refresh the Scene before moving.");
  return decision.permissionId;
}
