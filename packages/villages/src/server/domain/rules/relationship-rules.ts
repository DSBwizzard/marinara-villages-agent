import type {
  RelationshipEdge,
  RelationshipReceipt,
  RelationshipReview,
  RelationshipState,
} from "../models/relationship-types.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { asRecord } from "./coerce.js";
import {
  localRelationshipDate,
  RELATIONSHIP_POLICY,
  relationshipScore,
  relationshipThreshold,
} from "./relationship-policy.js";
import { canInviteToZone, resolveVenueZone, venueZones, zoneClosed } from "./venue-zones.js";

export const relationshipKey = (fromId: string, toId: string): string => JSON.stringify([fromId, toId]);
export const permissionKey = (controllerId: string, visitorId: string, venueId: string, zoneId: string): string =>
  JSON.stringify([controllerId, visitorId, venueId, zoneId]);
export function defaultRelationshipState(seed: string): RelationshipState {
  return {
    version: 1,
    noticeSequence: 0,
    seed,
    edges: {},
    grants: {},
    receipts: {},
    applied: {},
    disclosures: {},
    knowledge: {},
    reviewedActorIds: [],
    startingTies: [],
    startingActorIds: [],
    spoilers: false,
    socialPlans: [],
    socialEncounters: [],
  };
}
export function neutralRelationship(fromId: string, toId: string): RelationshipEdge {
  return {
    fromId,
    toId,
    warmth: 0,
    trust: 0,
    familiarity: 0,
    lastContactAt: "",
    decayAnchorAt: "",
    knowledgeBlockedUntilContact: false,
    decayThrough: 0,
    decayAmount: 0,
    playerContactAt: "",
    updatedAt: "",
    friend: false,
    close: false,
    ordinaryGains: {},
  };
}
export function relationshipFor(state: RelationshipState | undefined, fromId: string, toId: string): RelationshipEdge {
  return state?.edges[relationshipKey(fromId, toId)] ?? neutralRelationship(fromId, toId);
}
export function coerceRelationshipState(seed: string, value: unknown): RelationshipState {
  const raw = asRecord(structuredClone(value)),
    result = defaultRelationshipState(seed);
  if (raw.seed !== seed) return result;
  for (const row of Object.values(asRecord(raw.edges))) {
    const edge = asRecord(row);
    if (
      typeof edge.fromId !== "string" ||
      !edge.fromId ||
      edge.fromId === "player" ||
      typeof edge.toId !== "string" ||
      !edge.toId ||
      edge.fromId === edge.toId
    )
      continue;
    const base = neutralRelationship(edge.fromId, edge.toId);
    result.edges[relationshipKey(edge.fromId, edge.toId)] = {
      ...base,
      warmth: relationshipScore(edge.warmth),
      trust: relationshipScore(edge.trust),
      familiarity: typeof edge.familiarity === "number" ? Math.max(0, Math.trunc(edge.familiarity)) : 0,
      lastContactAt: typeof edge.lastContactAt === "string" ? edge.lastContactAt : "",
      decayAnchorAt: typeof edge.decayAnchorAt === "string" ? edge.decayAnchorAt : "",
      knowledgeBlockedUntilContact: edge.knowledgeBlockedUntilContact === true,
      decayThrough: typeof edge.decayThrough === "number" ? Math.max(0, Math.trunc(edge.decayThrough)) : 0,
      decayAmount: relationshipScore(edge.decayAmount),
      playerContactAt: typeof edge.playerContactAt === "string" ? edge.playerContactAt : "",
      updatedAt: typeof edge.updatedAt === "string" ? edge.updatedAt : "",
      friend: edge.friend === true,
      close: edge.close === true,
      ordinaryGains: asRecord(edge.ordinaryGains) as Record<string, number>,
    };
  }
  // Package-owned documents are not a model output boundary. Their writer validates each receipt.
  result.grants = asRecord(raw.grants) as RelationshipState["grants"];
  result.receipts = asRecord(raw.receipts) as RelationshipState["receipts"];
  result.noticeSequence = Object.values(result.receipts).reduce(
    (sequence, receipt) => Math.max(sequence, receipt.noticeSequence ?? 0),
    Math.max(0, Number(raw.noticeSequence) || 0),
  );
  result.applied = asRecord(raw.applied) as RelationshipState["applied"];
  result.disclosures = asRecord(raw.disclosures) as RelationshipState["disclosures"];
  result.knowledge = asRecord(raw.knowledge) as RelationshipState["knowledge"];
  result.reviewedActorIds = Array.isArray(raw.reviewedActorIds)
    ? raw.reviewedActorIds.filter((id): id is string => typeof id === "string")
    : [];
  result.startingTies = Array.isArray(raw.startingTies) ? (raw.startingTies as RelationshipState["startingTies"]) : [];
  result.startingActorIds = Array.isArray(raw.startingActorIds) ? (raw.startingActorIds as string[]) : [];
  result.spoilers = raw.spoilers === true;
  result.socialPlans = Array.isArray(raw.socialPlans) ? (raw.socialPlans as RelationshipState["socialPlans"]) : [];
  result.socialEncounters = Array.isArray(raw.socialEncounters)
    ? (raw.socialEncounters as RelationshipState["socialEncounters"])
    : [];
  return result;
}
export function reconcileRelationships(
  state: RelationshipState,
  village: Pick<VillageState, "villagers" | "venues" | "projects">,
  now = Date.now(),
): void {
  for (const edge of Object.values(state.edges)) {
    const last = Date.parse(edge.lastContactAt || edge.decayAnchorAt);
    if (Number.isFinite(last)) {
      const days = Math.max(
        0,
        Math.floor((now - last) / RELATIONSHIP_POLICY.dayMs) - RELATIONSHIP_POLICY.decayGraceDays,
      );
      const loss = Math.max(0, days - edge.decayThrough);
      if (loss) {
        const amount = Math.sign(edge.warmth) * Math.min(Math.abs(edge.warmth), loss);
        edge.warmth -= amount;
        edge.decayAmount += amount;
        edge.decayThrough = days;
      }
    }
    edge.friend = relationshipThreshold(edge.warmth, edge.trust, edge.friend, "friend");
    edge.close = relationshipThreshold(edge.warmth, edge.trust, edge.close, "close");
  }
  const residents = new Set(village.villagers.map((person) => person.characterId));
  for (const grant of Object.values(state.grants)) {
    const venue = village.venues.find((place) => place.id === grant.venueId);
    const zone = venue && resolveVenueZone(venue, grant.zoneId);
    if (
      !venue ||
      !zone ||
      !residents.has(grant.controllerId) ||
      (grant.visitorId !== "player" && !residents.has(grant.visitorId)) ||
      !canInviteToZone(venue, zone, grant.controllerId)
    ) {
      grant.revoked = true;
      grant.active = false;
      continue;
    }
    const edge = relationshipFor(state, grant.controllerId, grant.visitorId);
    const level = zone.kind === "shared-residence" ? "friend" : zone.kind === "private-residence" ? "close" : "staff";
    grant.active = !grant.revoked && relationshipThreshold(edge.warmth, edge.trust, grant.active, level);
  }
  for (const venue of village.venues)
    for (const zone of venueZones(venue)) {
      if (venue.access || zone.kind !== "shared-residence") continue;
      for (const edge of Object.values(state.edges)) {
        if (
          !residents.has(edge.fromId) ||
          (edge.toId !== "player" && !residents.has(edge.toId)) ||
          !canInviteToZone(venue, zone, edge.fromId)
        )
          continue;
        const key = permissionKey(edge.fromId, edge.toId, venue.id, zone.id);
        const previous = state.grants[key];
        if (!previous && edge.friend)
          state.grants[key] = {
            id: key,
            controllerId: edge.fromId,
            visitorId: edge.toId,
            venueId: venue.id,
            zoneId: zone.id,
            active: true,
            automatic: true,
            revoked: false,
            at: new Date(now).toISOString(),
          };
      }
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
export function applyRelationshipReview(
  state: RelationshipState,
  review: RelationshipReview,
  village: VillageState,
  sourceId: string,
  at: string,
): RelationshipReceipt[] {
  // Pending reviews may settle out of order. Reconcile through their event date,
  // then through the present once the new contact clock has been recorded.
  reconcileRelationships(state, village, Date.parse(at));
  const residents = new Set(village.villagers.map((person) => person.characterId));
  const dateKey = localRelationshipDate(at);
  const contactPairs = new Set<string>();
  for (const change of review.changes) {
    if (state.applied[change.id]) continue;
    if (
      !residents.has(change.fromId) ||
      (change.toId !== "player" && !residents.has(change.toId)) ||
      change.fromId === change.toId
    )
      continue;
    const key = relationshipKey(change.fromId, change.toId);
    const edge = (state.edges[key] ??= neutralRelationship(change.fromId, change.toId));
    const contactEvidenceKeys = change.lineIds.map((id) =>
      JSON.stringify(["contact-evidence", change.fromId, change.toId, id]),
    );
    const freshContact = change.contact && contactEvidenceKeys.some((id) => !state.applied[id]);
    if (change.contact) for (const id of contactEvidenceKeys) state.applied[id] = true;
    if (freshContact && (!edge.lastContactAt || Date.parse(at) > Date.parse(edge.lastContactAt))) {
      // A saved review can arrive after absence was already reconciled. Restore
      // only the decay after this actual contact; retain the earlier elapsed loss.
      const elapsedBeforeContact = Math.max(
        0,
        Math.floor(
          (Date.parse(at) - Date.parse(edge.lastContactAt || edge.decayAnchorAt)) / RELATIONSHIP_POLICY.dayMs,
        ) - RELATIONSHIP_POLICY.decayGraceDays,
      );
      const origin = edge.warmth + edge.decayAmount;
      const beforeContact = Number.isFinite(elapsedBeforeContact)
        ? Math.sign(origin) * Math.min(Math.abs(origin), elapsedBeforeContact)
        : 0;
      edge.warmth = relationshipScore(origin - beforeContact);
      edge.lastContactAt = at;
      edge.decayThrough = 0;
      edge.decayAmount = 0;
    }
    const evidenceKeys = change.lineIds.map((id) =>
      JSON.stringify(["evidence", change.fromId, change.toId, change.dimension, id]),
    );
    let amount = evidenceKeys.some((id) => state.applied[id]) ? 0 : change.amount;
    if (!change.contactOnly) for (const id of evidenceKeys) state.applied[id] = true;
    if (change.ordinary && change.dimension === "warmth" && amount > 0) {
      const used = edge.ordinaryGains[dateKey] ?? 0;
      amount = Math.min(amount, Math.max(0, RELATIONSHIP_POLICY.ordinaryDailyWarmth - used));
      edge.ordinaryGains[dateKey] = used + amount;
      // Old daily caps cannot be needed by a pending review because its date is retained in the receipt.
    }
    const before = edge[change.dimension];
    edge[change.dimension] = relationshipScore(before + amount);
    if (amount && !edge.lastContactAt && !edge.decayAnchorAt) edge.decayAnchorAt = at;
    if (freshContact && !contactPairs.has(key) && !state.applied[`${sourceId}:contact:${key}`]) {
      edge.familiarity += 1;
      if (change.toId === "player" && (!edge.playerContactAt || Date.parse(at) > Date.parse(edge.playerContactAt))) {
        edge.playerContactAt = at;
        edge.knowledgeBlockedUntilContact = false;
      }
      contactPairs.add(key);
      state.applied[`${sourceId}:contact:${key}`] = true;
    }
    if (!edge.updatedAt || Date.parse(at) > Date.parse(edge.updatedAt)) edge.updatedAt = at;
    state.receipts[change.id] = {
      id: change.id,
      fromId: change.fromId,
      toId: change.toId,
      dimension: change.dimension,
      before,
      after: edge[change.dimension],
      reason: change.reason,
      at,
      sourceId,
      lineIds: change.lineIds,
    };
    state.applied[change.id] = true;
    if (change.disclosed)
      state.disclosures[change.id] = {
        id: change.id,
        fromId: change.fromId,
        toId: change.toId,
        text: change.reason,
        kind: "explanation",
        lineIds: change.lineIds,
        at,
        sourceId,
      };
  }
  for (const disclosure of review.disclosures) {
    if (state.applied[disclosure.id] || !residents.has(disclosure.fromId)) continue;
    state.disclosures[disclosure.id] = { ...disclosure, at, sourceId };
    state.applied[disclosure.id] = true;
  }
  for (const permission of review.permissions) {
    if (state.applied[permission.id]) continue;
    const venue = village.venues.find((place) => place.id === permission.venueId);
    const zone = venue && resolveVenueZone(venue, permission.zoneId);
    if (venue?.access) continue;
    if (
      !venue ||
      !zone ||
      !residents.has(permission.controllerId) ||
      (permission.visitorId !== "player" && !residents.has(permission.visitorId)) ||
      !canInviteToZone(venue, zone, permission.controllerId)
    )
      continue;
    const key = permissionKey(permission.controllerId, permission.visitorId, venue.id, zone.id);
    // Replaying an older invitation must not undo a later boundary.
    const previous = state.grants[key];
    if (
      previous &&
      (Date.parse(previous.at) > Date.parse(at) ||
        (previous.at === at && (previous.revoked || permission.action === "grant")))
    ) {
      state.applied[permission.id] = true;
      continue;
    }
    state.grants[key] = {
      id: permission.id,
      controllerId: permission.controllerId,
      visitorId: permission.visitorId,
      venueId: venue.id,
      zoneId: zone.id,
      active: false,
      revoked: permission.action === "revoke",
      automatic: false,
      at,
    };
    state.applied[permission.id] = true;
  }
  reconcileRelationships(state, village, Date.now());
  return Object.values(state.receipts).filter(
    (receipt) => receipt.sourceId === sourceId && receipt.before !== receipt.after,
  );
}
