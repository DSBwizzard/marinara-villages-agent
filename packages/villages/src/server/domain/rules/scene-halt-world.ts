import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { structuralShape as shape } from "./project-structure.js";
import { sceneContinuityView } from "./scene-continuity.js";
import { provisionalSceneNarrative, type SceneNarrativeSource } from "./scene-narrative-effects.js";
import { wishFingerprint } from "./social-wishes.js";
import { assertResidencePrivateDestination } from "./venue-layout.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "./venue-model.js";
import { applyVenueSceneChange, type VenueSceneChange } from "./venue-scene-state.js";
import { canInviteToZone, canRevokeZonePermission, resolveVenueZone, zoneClosed } from "./venue-zones.js";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Only requested persistent consequences are checked. Historical cast/knowledge remain captured. */
export function sceneHaltWorldConflict(scene: VenueScene, current: VillageState, value: unknown): boolean {
  if (scene.villageSeed && scene.villageSeed !== current.seed) return true;
  const reply = asRecord(value);
  let captured = sceneContinuityView(current, scene, false);
  if (reply.narrativeSource) {
    try {
      const source = reply.narrativeSource as SceneNarrativeSource;
      captured = provisionalSceneNarrative(captured, current, source);
      current = provisionalSceneNarrative(current, current, source);
    } catch {
      return true;
    }
  }
  const liveVenue = current.venues.find((row) => row.id === scene.placeId);
  const oldVenue = captured.venues.find((row) => row.id === scene.placeId);
  const created = new Set<string>();
  for (const value of Array.isArray(reply.wishChanges) ? reply.wishChanges : []) {
    const row = asRecord(value);
    const local = JSON.stringify([row.actorId, row.wishId]);
    if (row.intent === "create" && String(row.wishId).startsWith("new:")) {
      const old = captured.villagers.find((r) => r.characterId === row.actorId);
      const live = current.villagers.find((r) => r.characterId === row.actorId);
      if (
        !old ||
        !live ||
        old.cardSnapshot.capturedAt !== live.cardSnapshot.capturedAt ||
        !same(old.wishes, live.wishes)
      )
        return true;
      created.add(local);
      continue;
    }
    if (created.has(local)) continue;
    // Talking about an old Wish is allowed. New fulfillment/progress cannot revive it.
    if (!["progress", "fulfilled", "clarify", "approach", "attention", "withdrawn"].includes(String(row.intent)))
      continue;
    const find = (state: VillageState) =>
      state.villagers
        .find((person) => person.characterId === row.actorId)
        ?.wishes.find((wish) => wish.id === row.wishId);
    const old = find(captured),
      live = find(current);
    if (!old || !live || wishFingerprint(old) !== wishFingerprint(live)) return true;
  }
  if (reply.placeUpdate) {
    const change = reply.placeUpdate as VenueSceneChange;
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
    if (live.state.revision !== old.state.revision || live.description !== old.description) return true;
    try {
      const copy = {
        ...current,
        venues: structuredClone(current.venues),
        narrative: structuredClone(current.narrative),
      };
      applyVenueSceneChange(
        copy,
        scene.placeId,
        change,
        scene.id,
        scene.liveSceneVersion === 1 ? (scene.continuity?.capturedAt ?? scene.startedAt) : scene.startedAt,
        scene.spaceClass,
        scene.area,
        scene.privateOwnerId,
        zoneId,
        reply.physicalContext as import("../../../shared/contracts/place-continuity.js").PlaceEvidence,
        captured.narrative?.conditions,
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
        destination.constructionStatus === "worksite" ||
        venueResidentIds(destination).length > 0 ||
        (prior && ["moving", "pending"].includes(prior.status)) ||
        venueAssignedCount(destination) + reserved >= venueCapacity(destination)
      )
        return true;
      try {
        assertResidencePrivateDestination(current, destination, person.characterId, "");
      } catch {
        return true;
      }
    } else {
      if (!prior || prior.status !== "pending" || prior.requestedBy === "villager" || !prior.proposedVenueId)
        return true;
      const destination = current.venues.find((row) => row.id === prior.proposedVenueId);
      if (
        residence.approved === true &&
        (!destination || venueResidentIds(destination).some((id) => id !== person.characterId))
      )
        return true;
    }
  }
  return false;
}
