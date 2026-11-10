import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import type { VenueLine, VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";

import { sceneAccessState, sceneLayoutVenue } from "./scene-layout.js";
import { type AccessContext, evaluateZoneAccess } from "./venue-access.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";

export type ContactDelivery = "voice" | "loud";
export type ContactIntent = {
  physicalTargetId?: string;
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
export type ContactRelay = { speakerId: string; targetId: string; quote: string; path: string[]; targetZoneId: string };
const normalize = (value: string) =>
  value.normalize("NFKC").replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim().toLowerCase();

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
): boolean {
  if (scene) state = sceneAccessState(state, scene);
  venue = sceneLayoutVenue(venue, scene);
  const zone = venueZones(venue).find((entry) => entry.id === zoneId);
  if (zone?.closed) return false;
  return (
    !!zone &&
    evaluateZoneAccess(venue, zone, characterId, {
      ...(scene ? sceneAccessContext(scene, at, state.timeZone) : { at }),
      accepting: characterId === "player",
      unavailable: zoneClosed(state, venue, zone),
      environment: state.narrative,
    }).allowed
  );
}
/** Entrance egress follows physical doorways even when an intermediate Zone denies entry. */
export function contactPath(
  state: VillageState,
  venue: VillageVenue,
  from: string,
  to: string,
  actor: string,
  scene?: VenueScene,
  at?: Date,
): string[] | null {
  if (!from || !to) return null;
  const queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!,
      last = path.at(-1)!;
    if (last === to) return path;
    for (const next of contactNeighbors(venue, last, scene)) {
      if (seen.has(next) || (to !== "exterior" && !contactCanEnter(state, venue, next, actor, scene, at))) continue;
      seen.add(next);
      queue.push([...path, next]);
    }
  }
  return null;
}
export function contactSpeech(
  lines: Pick<VenueLine, "speakerId" | "content" | "kind">[],
  actor: string,
  quote: string,
): boolean {
  return (
    normalize(quote).length >= 2 &&
    lines.some(
      (line) =>
        line.kind !== "narration" && line.speakerId === actor && normalize(line.content).includes(normalize(quote)),
    )
  );
}
export function readContactMoves(
  value: unknown,
  lines: Pick<VenueLine, "speakerId" | "content" | "kind">[],
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  allowed: string[],
  allowLocalNoop: boolean | "redundant" = false,
  semantic = false,
): ContactMove[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((value) => {
    const row = asRecord(value),
      actor = asTrimmedString(row.characterId),
      destination = asTrimmedString(row.zoneId),
      quote = asTrimmedString(row.quote);
    const segment = row.segment;
    const narration = Number.isSafeInteger(segment) ? lines[Number(segment)] : undefined;
    const name =
      scene.participants.find((person) => person.characterId === actor)?.name ??
      scene.sceneAttendance?.occupants.find((person) => person.characterId === actor)?.name ??
      "";
    const path = contactPath(state, venue, contactPosition(scene, actor), destination, actor, scene);
    const zones = venueZones(sceneLayoutVenue(venue, scene));
    const words = (value: string) =>
      normalize(value)
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
    const narratedWords = " " + words(narration?.content ?? "") + " ";
    const localNoop =
      allowLocalNoop &&
      path?.length === 1 &&
      destination === (scene.zoneId ?? "exterior") &&
      zones.some((zone) => zone.id === destination) &&
      (semantic ||
        !zones.some(
          (zone) =>
            zone.id !== destination &&
            [zone.name].some((label) => !!words(label) && narratedWords.includes(" " + words(label) + " ")),
        ));
    const citedMove =
      Number(segment) >= 0 &&
      narration?.kind === "narration" &&
      normalize(quote).length >= 8 &&
      normalize(narration.content).includes(normalize(quote)) &&
      (semantic || localNoop || (!!name && normalize(quote).includes(normalize(name))));
    const movementText = normalize(localNoop ? (narration?.content ?? "") : quote);
    // A validated current-Zone annotation is discarded by v3, never applied as movement.
    // Speech/thought intent elsewhere in its narration cannot make that no-op consequential.
    const qualifyMovement = !localNoop || allowLocalNoop !== "redundant";
    if (
      !allowed.includes(actor) ||
      seen.has(actor) ||
      !citedMove ||
      (!semantic && qualifyMovement && /\b(?:would|could|will|plans?|intends?)\b/iu.test(movementText)) ||
      (!semantic && qualifyMovement && /\b(?:maybe|perhaps|might|unless|if|won't|can't|not)\b/iu.test(movementText)) ||
      !path ||
      (path.length < 2 && !localNoop) ||
      !lines.some((line) => line.kind === "narration")
    )
      return [];
    seen.add(actor);
    return [
      {
        characterId: actor,
        zoneId: destination,
        quote,
        path,
        segment: Number(segment),
      },
    ];
  });
}
