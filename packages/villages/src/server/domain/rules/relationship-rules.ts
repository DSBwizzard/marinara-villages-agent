import type {
  RelationshipEdge,
  RelationshipReceipt,
  RelationshipReview,
  RelationshipState,
  RelationshipUpdate,
} from "../models/relationship-types.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import type { VenueScene } from "../models/scene-model.js";
import { asRecord } from "./coerce.js";
import { canInviteToZone, canRevokeZonePermission, resolveVenueZone, zoneClosed } from "./venue-zones.js";

export class SocialRevisionConflict extends Error {}
export const relationshipKey = (fromId: string, toId: string): string => JSON.stringify([fromId, toId]);

/** Captured relationships plus only this Scene's accepted relationship receipts. */
export function sceneRelationshipView(
  current: RelationshipState | undefined,
  scene: Pick<VenueScene, "id" | "continuity">,
) {
  if (!scene.continuity) return current;
  const view = structuredClone(scene.continuity.facts.relationshipContext);
  if (!view || !current) return view;
  for (const receipt of Object.values(current.receipts)) {
    if (receipt.sceneId !== scene.id || view.receipts[receipt.id]) continue;
    const key = relationshipKey(receipt.fromId, receipt.toId);
    view.edges[key] = structuredClone(receipt.sceneAfter);
    view.receipts[receipt.id] = structuredClone(receipt);
  }
  return view;
}
export const permissionKey = (controllerId: string, visitorId: string, venueId: string, zoneId: string): string =>
  JSON.stringify([controllerId, visitorId, venueId, zoneId]);
export function defaultRelationshipState(seed: string): RelationshipState {
  return {
    version: 2,
    noticeSequence: 0,
    seed,
    edges: {},
    intentions: {},
    intentionRevisions: {},
    intentionReceipts: {},
    grants: {},
    receipts: {},
    applied: {},
    disclosureReceipts: {},
    sharedRecords: {},
    reviewedActorIds: [],
    startingTies: [],
    startingActorIds: [],
    initializationConflicts: [],
    mailThreads: {},
    mailDeliveries: {},
    invitations: {},
    socialPlans: [],
    socialEncounters: [],
  };
}
export function neutralRelationship(fromId: string, toId: string): RelationshipEdge {
  return {
    fromId,
    toId,
    revision: 0,
    connection: "",
    stance: "",
    expectations: [],
    concerns: [],
    experiences: [],
    records: {},
    updatedAt: "",
  };
}
export function relationshipFor(state: RelationshipState | undefined, fromId: string, toId: string): RelationshipEdge {
  return state?.edges[relationshipKey(fromId, toId)] ?? neutralRelationship(fromId, toId);
}
export function coerceRelationshipState(seed: string, value: unknown): RelationshipState {
  const raw = asRecord(structuredClone(value));
  if (!Object.keys(raw).length || raw.seed !== seed) return defaultRelationshipState(seed);
  if (raw.version !== 2)
    throw new Error(
      "This Village uses an unsupported relationship contract. Create an independent new Village; its saved data has not been changed.",
    );
  // Package-owned documents have already passed the source and schema validator.
  return { ...defaultRelationshipState(seed), ...raw, seed, version: 2 } as RelationshipState;
}
/** Absence and elapsed time are not social events. Only explicit permissions affect access. */
export function reconcileRelationships(
  state: RelationshipState,
  village: Pick<VillageState, "villagers" | "venues" | "projects"> & Partial<Pick<VillageState, "clock">>,
  _now = Date.now(),
): void {
  const residents = new Set(village.villagers.map((person) => person.characterId));
  for (const grant of Object.values(state.grants)) {
    const venue = village.venues.find((place) => place.id === grant.venueId);
    const zone = venue && resolveVenueZone(venue, grant.zoneId);
    grant.active =
      !grant.revoked &&
      !!venue &&
      !!zone &&
      residents.has(grant.controllerId) &&
      (grant.visitorId === "player" || residents.has(grant.visitorId)) &&
      canInviteToZone(venue, zone, grant.controllerId);
  }
}
export function relationshipZoneController(
  state: RelationshipState | undefined,
  village: Pick<VillageState, "projects">,
  venue: VillageVenue,
  zone: VillageVenueZone,
  visitorId: string,
): string | null {
  if (venue.access || !state || zoneClosed(village, venue, zone)) return null;
  return (
    Object.values(state.grants).find(
      (grant) =>
        grant.visitorId === visitorId &&
        grant.venueId === venue.id &&
        grant.zoneId === zone.id &&
        grant.active &&
        !grant.revoked &&
        canInviteToZone(venue, zone, grant.controllerId),
    )?.controllerId ?? null
  );
}
function project(base: RelationshipEdge, update: RelationshipUpdate, receiptId: string, at: string): RelationshipEdge {
  const after = structuredClone(base);
  Object.assign(after, {
    connection: update.connection,
    stance: update.stance,
    expectations: update.expectations,
    concerns: update.concerns,
    revision: base.revision + 1,
    updatedAt: at,
  });
  for (const record of update.records) after.records[record.id] = structuredClone(record);
  after.experiences = [...new Set([...after.experiences, receiptId])];
  return after;
}
/** One atomic social-document write records both exact projections of the same witnessed event. */
export function applyRelationshipReview(
  state: RelationshipState,
  review: RelationshipReview,
  village: VillageState,
  sourceId: string,
  at: string,
  now = Date.now(),
  sceneState: RelationshipState | undefined = state,
): RelationshipReceipt[] {
  const residents = new Set(village.villagers.map((person) => person.characterId));
  // Preflight every live revision before changing anything, including disclosures and permissions.
  for (const entry of review.intentions ?? []) {
    const id = sourceId + ":intentions:" + entry.actorId;
    if (state.applied[id]) continue;
    if (!residents.has(entry.actorId) || entry.items.length > 3 || entry.sceneItems.length > 3)
      throw new Error("Invalid social intentions.");
    if ((state.intentionRevisions[entry.actorId] ?? 0) !== entry.expectedRevision)
      throw new SocialRevisionConflict("Social intentions changed during interpretation.");
  }
  for (const permission of review.permissions) {
    if (state.applied[permission.id]) continue;
    const venue = village.venues.find((place) => place.id === permission.venueId),
      zone = venue && resolveVenueZone(venue, permission.zoneId);
    if (
      !venue ||
      !zone ||
      !(permission.action === "revoke"
        ? canRevokeZonePermission(venue, zone, permission.controllerId)
        : canInviteToZone(venue, zone, permission.controllerId))
    )
      throw new Error("Standing permission authority changed.");
  }
  const pairs = new Set<string>();
  const sharedUpdates = new Map<string, string>();
  for (const change of review.changes) {
    if (state.applied[change.id]) continue;
    const key = relationshipKey(change.fromId, change.toId);
    if (
      !residents.has(change.fromId) ||
      change.fromId === change.toId ||
      (change.toId !== "player" && !residents.has(change.toId)) ||
      pairs.has(key)
    )
      throw new Error("Invalid or repeated social perspective.");
    pairs.add(key);
    if (relationshipFor(state, change.fromId, change.toId).revision !== change.expectedRevision)
      throw new SocialRevisionConflict(
        "The live relationship changed during interpretation. Reinterpret against current relationships before exposing this exchange.",
      );
    for (const record of change.liveAfter.records) {
      if (record.kind !== "agreement" && record.kind !== "commitment") continue;
      const fingerprint = JSON.stringify({
        ...record,
        participants: [...record.participants].sort(),
        evidenceIds: [...record.evidenceIds].sort(),
      });
      if (sharedUpdates.has(record.id) && sharedUpdates.get(record.id) !== fingerprint)
        throw new Error("Conflicting interpretations of the same shared social terms.");
      sharedUpdates.set(record.id, fingerprint);
      const current = state.sharedRecords[record.id];
      if ((current?.revision ?? 0) !== record.revision - 1)
        throw new SocialRevisionConflict("Shared social terms changed during interpretation.");
    }
  }
  for (const change of review.changes) {
    if (state.applied[change.id]) continue;
    const before = structuredClone(relationshipFor(state, change.fromId, change.toId));
    const sceneBefore = structuredClone(relationshipFor(sceneState, change.fromId, change.toId));
    const liveAfter = project(before, change.liveAfter, change.id, at);
    const sceneAfter = project(sceneBefore, change.sceneAfter, change.id, at);
    state.edges[relationshipKey(change.fromId, change.toId)] = liveAfter;
    for (const record of change.liveAfter.records)
      if (record.kind === "agreement" || record.kind === "commitment")
        state.sharedRecords[record.id] = structuredClone(record);
    state.receipts[change.id] = {
      id: change.id,
      fromId: change.fromId,
      toId: change.toId,
      beforeRevision: before.revision,
      sceneAfter,
      liveAfter,
      reason: change.reason,
      at,
      sourceId,
      lineIds: change.lineIds,
      evidence: change.evidence,
    };
    state.applied[change.id] = true;
  }
  for (const entry of review.intentions ?? []) {
    if (!residents.has(entry.actorId) || entry.items.length > 3) throw new Error("Invalid social intentions.");
    const receipt = sourceId + ":intentions:" + entry.actorId;
    if (state.applied[receipt]) continue;
    state.intentions[entry.actorId] = structuredClone(entry.items);
    state.intentionRevisions[entry.actorId] = entry.expectedRevision + 1;
    state.intentionReceipts[receipt] = {
      sourceId,
      actorId: entry.actorId,
      at,
      sceneAfter: structuredClone(entry.sceneItems),
      liveAfter: structuredClone(entry.items),
      sceneRevision: (sceneState?.intentionRevisions[entry.actorId] ?? 0) + 1,
      liveRevision: entry.expectedRevision + 1,
      evidence: entry.evidence,
    };
    state.applied[receipt] = true;
  }
  for (const disclosure of review.disclosures) {
    if (state.applied[disclosure.id]) continue;
    // Disclosure prose is published in native Memories only after source acknowledgment.
    state.applied[disclosure.id] = true;
  }
  // Conversational disclosures are written only through screened memoryChanges.
  for (const permission of review.permissions) {
    if (state.applied[permission.id]) continue;
    const venue = village.venues.find((place) => place.id === permission.venueId);
    const zone = venue && resolveVenueZone(venue, permission.zoneId);
    if (
      !venue ||
      !zone ||
      !(permission.action === "revoke"
        ? canRevokeZonePermission(venue, zone, permission.controllerId)
        : canInviteToZone(venue, zone, permission.controllerId))
    )
      throw new Error("Standing permission authority changed.");
    if (venue.access) continue; // Modern standing access settles in the owning Venue authority transaction.
    const key = permissionKey(permission.controllerId, permission.visitorId, venue.id, zone.id);
    const previous = state.grants[key];
    if (!previous || Date.parse(previous.at) <= Date.parse(at))
      state.grants[key] = {
        ...permission,
        active: permission.action === "grant",
        revoked: permission.action === "revoke",
        at,
      };
    state.applied[permission.id] = true;
  }
  reconcileRelationships(state, village, now);
  return review.changes.flatMap((change) => (state.receipts[change.id] ? [state.receipts[change.id]!] : []));
}
