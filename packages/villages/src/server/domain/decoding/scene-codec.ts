import { readNarrationSubmission } from "./narration-submission.js";
import { isSceneTurnOutcome, type SceneTurnOutcome } from "../../../shared/contracts/scene-turn-outcome.js";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import type { VenueOperation } from "../models/operation-model.js";
import type { ActiveVenue, VenueLine, VenueScene } from "../models/scene-model.js";
import { asRecord, asString, asTrimmedString } from "../rules/coerce.js";
import { conflict } from "../rules/errors.js";

import { sceneContinuityFields, type SceneContinuity } from "../rules/scene-continuity.js";
import { readSceneLayout } from "../rules/scene-layout.js";
import { sceneRevision } from "../rules/scene-revision.js";
import { reuseSceneLine } from "../rules/scene-transcript.js";
import { reuseSceneSubmission } from "../rules/scene-submissions.js";
import type { DoorwayContact } from "../rules/venue-contact.js";
import { coerceVillageState } from "./village-codec.js";
import { emptyContinuity } from "../rules/continuity.js";
import { emptyEpisodes } from "../rules/episodes.js";
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
  if (raw.liveSceneVersion !== undefined && raw.liveSceneVersion !== 1)
    throw conflict("Unsupported live Scene format. Its saved data is preserved.");
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
  const lines: VenueLine[] = Array.isArray(raw.lines)
    ? raw.lines
        .map((value) => {
          const canonical = reuseSceneLine(value, participantIds);
          if (canonical) return canonical;
          const row = asRecord(value);
          return {
            id: asTrimmedString(row.id),
            speakerId: asString(row.speakerId),
            name: asString(row.name),
            role: row.role === "user" ? ("user" as const) : ("assistant" as const),
            content: asString(row.content),
            at: asString(row.at),
            zoneId: asTrimmedString(row.zoneId) || undefined,
            ...(row.viaDoorway === true ? { viaDoorway: true } : {}),
            ...(Array.isArray(row.physicalIdsAfter)
              ? {
                  physicalIdsAfter: [
                    ...new Set(
                      row.physicalIdsAfter.filter(
                        (id): id is string => typeof id === "string" && participantIds.has(id),
                      ),
                    ),
                  ],
                }
              : {}),
            ...(row.contactHidden === true ? { contactHidden: true } : {}),
            ...(row.presenceChange === true ? { presenceChange: true as const } : {}),
            ...(row.attentionEvidence === true ? { attentionEvidence: true } : {}),
            ...(asRecord(row.speechSource).version === 3 && Array.isArray(asRecord(row.speechSource).spans)
              ? { speechSource: structuredClone(row.speechSource) as VenueLine["speechSource"] }
              : {}),
            ...(typeof asRecord(row.soundOnly).text === "string" && Array.isArray(asRecord(row.soundOnly).characterIds)
              ? {
                  soundOnly: {
                    text: asTrimmedString(asRecord(row.soundOnly).text).slice(0, 300),
                    characterIds: (asRecord(row.soundOnly).characterIds as unknown[]).filter(
                      (id): id is string => typeof id === "string",
                    ),
                    player: asRecord(row.soundOnly).player === true,
                  },
                }
              : {}),
            ...(row.contactReport === true ? { contactReport: true } : {}),
            heardBy: Array.isArray(row.heardBy) ? row.heardBy.filter((id): id is string => typeof id === "string") : [],
            ...(row.kind === "narration" || row.kind === "dialogue" || row.kind === "side" || row.kind === "whisper"
              ? { kind: row.kind as VenueLine["kind"] }
              : {}),
            ...(Array.isArray(row.staging) ? { staging: readStagingCues(row.staging, [...participantIds]) } : {}),
            ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {}),
            ...(row.delivery === "ordinary" || row.delivery === "whisper" || row.delivery === "shout"
              ? { delivery: row.delivery as VenueLine["delivery"] }
              : {}),
            ...(row.presentation === "main" || row.presentation === "aside"
              ? { presentation: row.presentation as VenueLine["presentation"] }
              : {}),
            ...(typeof row.asideFor === "string" ? { asideFor: row.asideFor } : {}),
          };
        })
        .filter((line) => line.id && line.content)
    : [];
  return {
    version: 5,
    changeSequence: Math.max(0, Math.floor(Number(raw.changeSequence) || 0)),
    ...(raw.semanticVersion === 2 ? { semanticVersion: 2 as const } : {}),
    ...(raw.villageSeed ? { villageSeed: asString(raw.villageSeed) } : {}),
    sceneRevision: sceneRevision(raw),
    operation: raw.operation as VenueOperation | undefined,
    rejectedSubmissions: Array.isArray(raw.rejectedSubmissions)
      ? raw.rejectedSubmissions
          .map(asRecord)
          .filter(
            (row) =>
              typeof row.id === "string" &&
              row.id.length > 0 &&
              typeof row.inputHash === "string" &&
              /^[a-f0-9]{64}$/u.test(row.inputHash) &&
              Number.isSafeInteger(row.sceneRevision) &&
              Number(row.sceneRevision) >= 0 &&
              isSceneTurnOutcome(row.turnOutcome),
          )
          .map((row) => ({
            id: String(row.id),
            inputHash: String(row.inputHash),
            sceneRevision: Number(row.sceneRevision),
            turnOutcome: row.turnOutcome as SceneTurnOutcome,
          }))
      : [],
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
    entryOffers: Array.isArray(raw.entryOffers) ? (raw.entryOffers as VenueScene["entryOffers"]) : [],
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
    ...(raw.liveSceneVersion === 1 ? { liveSceneVersion: 1 as const } : {}),
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
    memoryMode: "live",
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
