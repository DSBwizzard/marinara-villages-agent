import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { conflict } from "./errors.js";
import { continuityHolderKey, continuityProtectionFingerprint } from "./continuity.js";
import { currentRoomViews } from "./continuity-retrieval.js";
import { activeNarrativeConditions } from "./narrative-environment.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { initializePreparedRoomContinuity, retainNativeFact } from "./native-continuity.js";
import { renderResidentAdmission } from "./resident-admission.js";
import { venueZones, zoneControllerIds } from "./venue-zones.js";
import { findLocation } from "./places.js";

export function isPrivateInterior(zone: Pick<VillageVenueZone, "kind">): boolean {
  return ["private-residence", "staff", "restricted"].includes(zone.kind);
}

export function retryPrivateInterior(zone: VillageVenueZone) {
  if (zone.preparation?.status !== "failed") return;
  const { attempt, mode, basis } = zone.preparation;
  zone.preparation = { status: "pending", attempt, mode, basis };
}

/** Finishing changes constraints; preparation reconciles the saved interior once. */
export function prepareRenovatedPrivateInterior(zone: VillageVenueZone, previous?: VillageVenueZone): void {
  if (!isPrivateInterior(zone)) return;
  if (
    previous &&
    zone.ownerId !== previous.ownerId &&
    (zone.kind === "private-residence" || previous.kind === "private-residence")
  )
    throw conflict("Resident moves assign Private Spaces; Renovations cannot transfer occupied rooms.");
  if (zone.ownerId === "player") return;
  if (!previous) {
    zone.roomSpecification ??= zone.description;
    zone.description = "";
    zone.preparation = { status: "pending" };
    return;
  }
  if (zone.roomSpecification !== previous.roomSpecification) {
    const fresh = previous.preparation && previous.preparation.status !== "ready" && !previous.preparation.mode;
    zone.preparation = { status: "pending", ...(!fresh ? { mode: "renovation" as const } : {}) };
  }
}

export type PrivateRoomEdit = { replace?: string; text: string | null };

/** Capture only this interior's observable enduring facts and actual occupants. */
export function capturePrivateInterior(state: VillageState, venue: VillageVenue, zone: VillageVenueZone, at: string) {
  const room = { kind: "room" as const, placeId: venue.id, zoneId: zone.id };
  const key = continuityHolderKey(room);
  const renovating = zone.preparation?.mode === "renovation";
  const protection = continuityProtectionFingerprint(state.continuity, [room]);
  const locked = new Set(
    activeNarrativeConditions(state.narrative, at)
      .filter((row) => row.venueId === venue.id && row.zoneId === zone.id)
      .flatMap((row) => row.repairEntries ?? []),
  );
  const entries = currentRoomViews(state.continuity, state.episodes, room, at).filter(
    ({ version }) => version.room?.visibility === "observable" && !version.room.expiresAt,
  );
  const owners = zone.kind === "private-residence" ? [zone.ownerId] : zoneControllerIds(venue, zone);
  const occupants = state.villagers.filter((person) => owners.includes(person.characterId));
  const characters = occupants.map(({ cardSnapshot: card, admission }) => ({
    admissionContext: renderResidentAdmission(card.name, admission),
    name: card.name,
    personality: card.personality.slice(0, 400),
    summary: card.summary.slice(0, 200),
    backstory: card.backstory.slice(0, 300),
  }));
  const layout = venueZones(venue).map((area) => [area.id, area.kind, area.venueClass]);
  const packet = {
    venueId: venue.id,
    id: zone.id,
    name: zone.name,
    purpose: zone.purpose,
    form: venue.form,
    layout: layout.map(([, kind]) => kind),
    roomSpecification: zone.roomSpecification,
    ...(renovating
      ? {
          existingInterior: entries.map(({ id, version }) => ({
            id,
            text: version.text,
            ...(locked.has(id) ? { locked: true } : {}),
          })),
        }
      : {}),
    characters,
  };
  const canInitialize = !state.continuity.records.some((record) => record.heads[key]);
  const basis = memoryHash([
    state.seed,
    state.setupAt,
    state.setting,
    state.worldName,
    state.worldRules,
    state.selectedLorebookIds,
    state.loreTokenBudget,
    venue.constructionStatus,
    layout,
    zone.kind,
    zone.venueClass,
    zone.ownerId,
    owners,
    occupants.map(({ characterId, incarnation, admission }) => [characterId, incarnation, admission]),
    packet,
    protection,
    !renovating && canInitialize,
    entries.map(({ id, version, headRevision }) => [id, version.id, headRevision]),
  ]);
  return {
    room,
    key,
    packet,
    basis,
    entries,
    locked,
    protection,
    renovating,
    canInitialize,
    loreAnchors: occupants.flatMap((person) => [person.admission?.homeworld, person.admission?.startingSituation]),
  };
}

export function publishPrivateInterior(
  state: VillageState,
  scope: ReturnType<typeof capturePrivateInterior>,
  claimId: string,
  reply: { description: string; edits: PrivateRoomEdit[] },
  at: string,
) {
  if (!scope.renovating) {
    initializePreparedRoomContinuity(
      state,
      scope.room.placeId,
      scope.room.zoneId,
      reply.description,
      claimId,
      scope.basis,
      at,
    );
    return;
  }
  const preparation = findLocation(state, scope.room.placeId)?.zones?.find(
    (zone) => zone.id === scope.room.zoneId,
  )?.preparation;
  memoryRequire(
    preparation?.status === "pending" &&
      preparation.mode === "renovation" &&
      preparation.claimId === claimId &&
      preparation.basis === scope.basis,
    "private Room renovation lost its claim",
  );
  const candidate = { ...state };
  const roots = state.continuity.records.filter((record) => record.protection[scope.key]).map((record) => record.id);
  const provenance = scope.entries.map(({ version }) => version.id);
  for (const [index, edit] of reply.edits.entries()) {
    const entry = edit.replace ? scope.entries.find(({ id }) => id === edit.replace) : undefined;
    memoryRequire(
      !edit.replace || (entry && !scope.locked.has(entry.id)),
      "private preparation targeted an unavailable Room entry",
    );
    const target = entry
      ? { id: entry.id, recordRevision: entry.recordRevision, heads: { [scope.key]: entry.headRevision } }
      : undefined;
    retainNativeFact(
      candidate,
      {
        id: "private-room-edit:" + memoryHash([scope.basis, index]).slice(0, 32),
        kind: "room",
        targetId: JSON.stringify([scope.room.placeId, scope.room.zoneId]),
        revision: 1,
        text: edit.text ?? "Private renovation removed a Room detail.",
        witnesses: [],
      },
      at,
      {
        room: scope.room,
        provenance,
        roomChange: { target, ...(edit.text === null ? { retire: true } : {}) },
        ...(roots.length ? { screening: { roots, fingerprint: scope.protection, disposition: "clear" } } : {}),
      },
    );
  }
  state.continuity = candidate.continuity;
  state.episodes = candidate.episodes;
}
