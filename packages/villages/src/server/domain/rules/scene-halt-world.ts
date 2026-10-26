import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { sceneContinuityView } from "./scene-continuity.js";
import { shape } from "./project-structure.js";
import { canInviteToZone, canRevokeZonePermission, resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { applyVenueSceneChange, type VenueSceneChange } from "./venue-scene-state.js";
import { venueResidentIds, venueAssignedCount, venueCapacity, hasVenueClass } from "./venue-model.js";
import { assertResidencePrivateDestination } from "./venue-layout.js";
import { wishFingerprint } from "./wish-interpretation-rules.js";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Only requested persistent consequences are checked. Historical cast/knowledge remain captured. */
export function sceneHaltWorldConflict(scene: VenueScene, current: VillageState, value: unknown): boolean {
  if (scene.villageSeed && scene.villageSeed !== current.seed) return true;
  const reply = asRecord(value);
  const captured = sceneContinuityView(current, scene, false);
  const liveVenue = current.venues.find((row) => row.id === scene.placeId);
  const oldVenue = captured.venues.find((row) => row.id === scene.placeId);
  for (const value of Array.isArray(reply.wishChanges) ? reply.wishChanges : []) {
    const row = asRecord(value);
    // Talking about an old Wish is allowed. New fulfillment/progress cannot revive it.
    if (row.intent !== "progress" && row.intent !== "check") continue;
    const find = (state: VillageState) =>
      state.villagers
        .find((person) => person.characterId === row.actorId)
        ?.agenda?.wishes.find((wish) => wish.id === row.wishId);
    const old = find(captured),
      live = find(current);
    if (
      !old ||
      !live ||
      wishFingerprint(old) !== wishFingerprint(live) ||
      (old.conditionRevision ?? 0) !== (live.conditionRevision ?? 0)
    )
      return true;
  }
  if (reply.sceneChange) {
    const change = reply.sceneChange as VenueSceneChange;
    const zoneId = String(asRecord(reply.physicalContext).zoneId ?? scene.zoneId ?? "exterior");
    const live = liveVenue && resolveVenueZone(liveVenue, zoneId);
    const old = oldVenue && resolveVenueZone(oldVenue, zoneId);
    if (
      !liveVenue ||
      !oldVenue ||
      !live ||
      !old ||
      liveVenue.constructionStatus === "worksite" ||
      oldVenue.constructionStatus === "worksite" ||
      current.projects.some(
        (row) => row.venueId === scene.placeId && row.kind === "new-venue" && row.status === "cancelled",
      ) ||
      !same(shape(live), shape(old))
    )
      return true;
    const controllers = (venue: VillageVenue, zone: typeof live) => ({
      owner: zone.ownerId,
      controllers: [...(zone.controllerIds ?? [])].sort(),
      managers: [...(zone.access?.managerIds ?? venue.access?.managerIds ?? [])].sort(),
      residents: zone.venueClass === "residence" ? [...venueResidentIds(venue)].sort() : [],
      workers: zone.kind === "staff" ? [...(venue.workerIds ?? [])].sort() : [],
    });
    if (!same(controllers(liveVenue, live), controllers(oldVenue, old))) return true;
    // Compare only affected values, not the entire room or Village revision.
    if (
      (change.conditionBefore !== undefined && !same(live.state.condition, old.state.condition)) ||
      (change.featureId &&
        !same(
          live.state.features.find((row) => row.id === change.featureId),
          old.state.features.find((row) => row.id === change.featureId),
        )) ||
      (change.publicFactBefore && !live.state.publicFacts.includes(change.publicFactBefore)) ||
      (change.resolveTraceId &&
        !same(
          live.state.traces.find((row) => row.id === change.resolveTraceId),
          old.state.traces.find((row) => row.id === change.resolveTraceId),
        ))
    )
      return true;
    try {
      const copy = { ...current, venues: structuredClone(current.venues) };
      applyVenueSceneChange(
        copy,
        scene.placeId,
        change,
        "halt-preflight",
        scene.startedAt,
        scene.spaceClass,
        scene.area,
        scene.privateOwnerId,
        zoneId,
        false,
      );
    } catch {
      return true;
    }
  }
  for (const value of Array.isArray(reply.projectSpeech) ? reply.projectSpeech : []) {
    const row = asRecord(value);
    const project = current.projects.find((project) => project.id === row.projectId);
    if (
      !project?.lifecycle ||
      !["planning", "working", "paused"].includes(project.status) ||
      project.lifecycle.revision !== row.revision
    )
      return true;
  }
  const batch = asRecord(reply.roomInterpretation);
  for (const [i, value] of (Array.isArray(batch.results) ? batch.results : []).entries()) {
    const result = asRecord(value);
    if (["none", "refuse", "dismiss", "unresolved"].includes(String(result.outcome))) continue;
    const facts = asRecord(asRecord(Array.isArray(batch.checks) ? batch.checks[i] : null).facts);
    const venue = current.venues.find((row) => row.id === facts.venueId);
    const zone = venue && resolveVenueZone(venue, String(facts.zoneId));
    if (!venue || !zone || zoneClosed(current, venue, zone) || !canInviteToZone(venue, zone, String(facts.actorId)))
      return true;
    const command = asRecord(facts.accessCommand);
    if (command.expectedRevision !== undefined && command.expectedRevision !== venue.access?.revision) return true;
  }
  const relationship = asRecord(reply.relationshipChanges);
  for (const value of Array.isArray(relationship.permissions) ? relationship.permissions : []) {
    const row = asRecord(value);
    const venue = current.venues.find((venue) => venue.id === row.venueId);
    const zone = venue && resolveVenueZone(venue, String(row.zoneId));
    if (
      !venue ||
      !zone ||
      (row.action === "revoke"
        ? !canRevokeZonePermission(venue, zone, String(row.controllerId))
        : zoneClosed(current, venue, zone) || !canInviteToZone(venue, zone, String(row.controllerId)))
    )
      return true;
    const old = captured.venues.find((v) => v.id === venue.id);
    if (old?.access?.revision !== venue.access?.revision) return true;
  }
  const residence = asRecord(reply.residenceSignal);
  if (residence.kind) {
    const person = current.villagers.find((row) => row.characterId === residence.characterId);
    const prior = current.residences.find((row) => row.characterId === residence.characterId);
    if (!person) return true;
    if (residence.kind === "request") {
      const destination = current.venues.find((row) => row.id === residence.venueId);
      const reserved = current.residences.filter(
        (row) =>
          row.characterId !== residence.characterId &&
          row.proposedVenueId === residence.venueId &&
          row.status === "moving",
      ).length;
      if (
        !destination ||
        !hasVenueClass(destination, "residence") ||
        venueResidentIds(destination).includes(person.characterId) ||
        (prior && ["moving", "pending"].includes(prior.status)) ||
        venueAssignedCount(destination) + reserved >= venueCapacity(destination)
      )
        return true;
      try {
        assertResidencePrivateDestination(current, destination, person.characterId, "");
      } catch {
        return true;
      }
    } else if (!prior || prior.status !== "pending" || prior.requestedBy === "villager" || !prior.proposedVenueId)
      return true;
  }
  const edit = asRecord(reply.editApprovalSignal);
  if (edit.proposalId) {
    const proposal = liveVenue?.editProposals?.find((row) => row.id === edit.proposalId);
    if (!proposal || proposal.declined || !proposal.requiredIds.includes(String(edit.residentId))) return true;
    const zone = proposal.zoneId && liveVenue && resolveVenueZone(liveVenue, proposal.zoneId);
    if (zone && zone.state.updatedAt !== proposal.baseUpdatedAt) return true;
  }
  const renovation = asRecord(reply.renovationSignal);
  if (renovation.characterId) {
    const venue = current.venues.find((row) => row.id === renovation.venueId);
    if (
      !venue ||
      ![...venueResidentIds(venue), ...(venue.workerIds ?? [])].includes(String(renovation.characterId)) ||
      current.venueMail.some(
        (row) => row.venueId === venue.id && ["pending-player", "awaiting-villagers"].includes(row.status),
      )
    )
      return true;
  }
  for (const value of Array.isArray(reply.developmentChanges) ? reply.developmentChanges : []) {
    const row = asRecord(value);
    const id = String(row.characterId ?? row.actorId ?? "");
    if (!id || !same(current.development?.residents[id], captured.development?.residents[id])) return true;
  }
  return false;
}
