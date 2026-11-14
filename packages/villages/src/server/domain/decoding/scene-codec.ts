import { readNarrationSubmission } from "./narration-submission.js";
import { playerAppointment } from "./agenda-codec.js";
import type { VenueOperation } from "../models/operation-model.js";
import type { ActiveVenue, VenueScene } from "../models/scene-model.js";
import { asRecord, asString, asTrimmedString } from "../rules/coerce.js";
import { conflict } from "../rules/errors.js";

import { sceneContinuityFields, type SceneContinuity } from "../rules/scene-continuity.js";
import { readSceneLayout } from "../rules/scene-layout.js";
import { sceneRevision } from "../rules/scene-revision.js";
import { readSceneLines } from "../rules/scene-transcript.js";
import { reuseSceneSubmission } from "../rules/scene-submissions.js";
import type { DoorwayContact } from "../rules/venue-contact.js";
import { coerceVillageState } from "./village-codec.js";
import { emptyContinuity } from "../rules/continuity.js";
import { emptyEpisodes } from "../rules/episodes.js";
import { emptyStartingHistory } from "../rules/starting-history.js";
import { emptyMailbox } from "./mailbox-codec.js";
import { immutableMemoryValue } from "../rules/memory-integrity.js";

export function coerceActive(value: unknown): ActiveVenue {
  const raw = asRecord(value);
  return {
    sessionId: asTrimmedString(raw.sessionId),
    placeId: asTrimmedString(raw.placeId),
    ...(raw.playbackSceneId ? { playbackSceneId: asTrimmedString(raw.playbackSceneId) } : {}),
  };
}
function readSceneContinuity(value: unknown): SceneContinuity | undefined {
  if (value === undefined) return undefined;
  const raw = asRecord(value),
    facts = asRecord(raw.facts);
  if (
    raw.version !== 4 ||
    typeof raw.seed !== "string" ||
    facts.seed !== raw.seed ||
    typeof raw.capturedAt !== "string" ||
    !Number.isFinite(Date.parse(raw.capturedAt)) ||
    ["villagers", "venues", "residences", "projects"].some((key) => !Array.isArray(facts[key]))
  )
    throw conflict("This saved Scene has an unsupported or invalid captured context. Its history is preserved.");
  const decoded = coerceVillageState({
    ...facts,
    version: 18,
    setupAt: raw.setupAt,
    continuity: emptyContinuity(),
    episodes: emptyEpisodes(),
    mailbox: emptyMailbox(),
    startingHistory: emptyStartingHistory(),
  });
  const keepCapturedLighting = (venue: import("../models/world.js").VillageVenue, value: unknown) => {
    const zones = asRecord(value).zones;
    if (!Array.isArray(zones)) return;
    for (const zone of venue.zones ?? []) {
      const original = zones.map(asRecord).find((row) => row.id === zone.id);
      if (!original) continue;
      zone.dayNight = original.dayNight === true;
      if (zone.observed && !original.observed) zone.observed.dayNight = zone.dayNight;
    }
  };
  for (const venue of decoded.venues)
    keepCapturedLighting(
      venue,
      (facts.venues as unknown[]).find((row) => asRecord(row).id === venue.id),
    );
  for (const [id, place] of Object.entries(decoded.worldPlaces?.places ?? {}))
    keepCapturedLighting(place.location, asRecord(asRecord(asRecord(facts.worldPlaces).places)[id]).location);
  const captured = Object.fromEntries(
    Object.entries(facts).flatMap<[string, unknown]>(([key]) =>
      key === "worldPlaces"
        ? [[key, decoded.worldPlaces]]
        : sceneContinuityFields.includes(key as (typeof sceneContinuityFields)[number])
          ? [[key, decoded[key as (typeof sceneContinuityFields)[number]]]]
          : [],
    ),
  ) as SceneContinuity["facts"];
  return immutableMemoryValue({
    version: 4,
    seed: raw.seed,
    setupAt: asString(raw.setupAt),
    capturedAt: raw.capturedAt,
    facts: captured,
  });
}

export function coerceSession(value: unknown): VenueScene {
  const raw = asRecord(value);
  if (
    Object.hasOwn(raw, "storageFormat") ||
    Object.hasOwn(raw, "transcript") ||
    Object.hasOwn(raw, "submissionHistory")
  )
    throw conflict("Stored Scene history requires explicit hydration.");
  if (raw.version !== 5) throw conflict("Unsupported Scene format. Start a fresh Village.");
  const participants = Array.isArray(raw.participants)
    ? raw.participants
        .map((value) => {
          const row = asRecord(value);
          return {
            characterId: asTrimmedString(row.characterId),
            name: asTrimmedString(row.name),
            doing: asTrimmedString(row.doing),
          };
        })
        .filter((person) => person.characterId && person.name)
    : [];
  const participantIds = new Set(participants.map((person) => person.characterId));
  const lines = readSceneLines(raw.lines, participantIds);
  return {
    version: 5,
    changeSequence: Math.max(0, Math.floor(Number(raw.changeSequence) || 0)),
    ...(raw.villageSeed ? { villageSeed: asString(raw.villageSeed) } : {}),
    sceneRevision: sceneRevision(raw),
    operation: raw.operation as VenueOperation | undefined,
    ...(raw.abandonedOperations
      ? { abandonedOperations: structuredClone(raw.abandonedOperations) as VenueOperation[] }
      : {}),
    navigationReceipts: Array.isArray(raw.navigationReceipts)
      ? raw.navigationReceipts
          .map(asRecord)
          .filter(
            (row) =>
              typeof row.id === "string" &&
              typeof row.originZoneId === "string" &&
              typeof row.destinationZoneId === "string" &&
              typeof row.at === "string",
          )
          .map((row) => ({
            id: String(row.id),
            originZoneId: String(row.originZoneId),
            destinationZoneId: String(row.destinationZoneId),
            at: String(row.at),
          }))
      : [],
    generationReceipts: Array.isArray(raw.generationReceipts)
      ? (raw.generationReceipts as VenueScene["generationReceipts"])
      : [],
    openingGatheringId: asTrimmedString(raw.openingGatheringId) || undefined,
    ...(raw.activity !== undefined ? { activity: playerAppointment.parse(raw.activity) } : {}),
    id: asTrimmedString(raw.id),
    placeId: asTrimmedString(raw.placeId),
    placeName: asTrimmedString(raw.placeName),
    zoneId: asTrimmedString(raw.zoneId) || undefined,
    enteredFromZoneId: asTrimmedString(raw.enteredFromZoneId) || undefined,
    pendingRoomQuestions: Array.isArray(raw.pendingRoomQuestions)
      ? raw.pendingRoomQuestions.filter((value): value is string => typeof value === "string").slice(0, 8)
      : [],
    pendingProjectQuestions: Array.isArray(raw.pendingProjectQuestions)
      ? raw.pendingProjectQuestions.filter((value): value is string => typeof value === "string").slice(0, 8)
      : [],
    pendingAccessClaim: asTrimmedString(raw.pendingAccessClaim) || undefined,
    accessPreviousZones: Object.fromEntries(
      Object.entries(asRecord(raw.accessPreviousZones)).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    ),
    doorwayContacts: Array.isArray(raw.doorwayContacts) ? (raw.doorwayContacts as DoorwayContact[]) : [],
    accompanying: Array.isArray(raw.accompanying)
      ? raw.accompanying.flatMap((value) => {
          const row = asRecord(value);
          return row.characterId && row.zoneId
            ? [{ characterId: asTrimmedString(row.characterId), zoneId: asTrimmedString(row.zoneId) }]
            : [];
        })
      : [],
    ...(raw.departureDestinations
      ? {
          departureDestinations: Object.fromEntries(
            Object.entries(asRecord(raw.departureDestinations)).flatMap(([actor, value]) => {
              const row = asRecord(value);
              return actor &&
                typeof row.venueId === "string" &&
                row.venueId &&
                typeof row.zoneId === "string" &&
                row.zoneId
                ? [[actor, { venueId: row.venueId, zoneId: row.zoneId }]]
                : [];
            }),
          ),
        }
      : {}),
    departedIds: Array.isArray(raw.departedIds)
      ? raw.departedIds.filter((id): id is string => typeof id === "string")
      : [],
    spaceClass:
      raw.spaceClass === "residence" ||
      raw.spaceClass === "workplace" ||
      raw.spaceClass === "community" ||
      raw.spaceClass === "other"
        ? raw.spaceClass
        : undefined,
    area:
      raw.area === "outside" || raw.area === "shared" || raw.area === "private" || raw.area === "public"
        ? raw.area
        : raw.spaceClass === "residence"
          ? "shared"
          : "public",
    privateOwnerId: asTrimmedString(raw.privateOwnerId),
    privateAccessOwnerId: asTrimmedString(raw.privateAccessOwnerId),
    startedAt: asString(raw.startedAt),
    ...(raw.continuity !== undefined ? { continuity: readSceneContinuity(raw.continuity) } : {}),
    endedAt: asString(raw.endedAt),
    lastActivityAt: asString(raw.lastActivityAt) || asString(raw.startedAt),
    endReason:
      raw.endReason === "player" ||
      raw.endReason === "scene" ||
      raw.endReason === "inactivity" ||
      raw.endReason === "debug"
        ? raw.endReason
        : "",
    status: raw.status === "opening" || raw.status === "closing" || raw.status === "closed" ? raw.status : "active",
    participants,
    ...(raw.sceneAttendance && typeof raw.sceneAttendance === "object"
      ? {
          sceneAttendance: {
            ...(asRecord(raw.sceneAttendance).layout === undefined
              ? {}
              : { layout: readSceneLayout(asRecord(raw.sceneAttendance).layout) }),
            capturedAt: asString(asRecord(raw.sceneAttendance).capturedAt) || asString(raw.startedAt),
            occupants: (Array.isArray(asRecord(raw.sceneAttendance).occupants)
              ? (asRecord(raw.sceneAttendance).occupants as unknown[])
              : []
            ).flatMap((value) => {
              const row = asRecord(value);
              return row.characterId && row.zoneId
                ? [
                    {
                      characterId: asTrimmedString(row.characterId),
                      name: asTrimmedString(row.name),
                      doing: asString(row.doing),
                      zoneId: asTrimmedString(row.zoneId),
                    },
                  ]
                : [];
            }),
          },
        }
      : {}),
    activeIds: Array.isArray(raw.activeIds) ? raw.activeIds.filter((id): id is string => typeof id === "string") : [],
    lines,
    submissions: Array.isArray(raw.submissions)
      ? raw.submissions.map((value) => reuseSceneSubmission(value, participantIds) ?? readNarrationSubmission(value))
      : [],
    recap: asString(raw.recap).slice(0, 600),
  };
}
