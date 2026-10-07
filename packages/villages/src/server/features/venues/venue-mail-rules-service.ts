import type {
  VillageResidence,
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueMail,
} from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { assertCanAddVillageVenue } from "../../domain/rules/venue-capacity.js";
import { assertResidencePrivateDestination } from "../../domain/rules/venue-layout.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "../../domain/rules/venue-model.js";
import type { VenueRequestCore } from "../../domain/rules/venue-requests.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { hashString, randomVillageSeed } from "../../domain/rules/village-clock.js";
import { backgroundRevision } from "../../jobs/background-work.js";
import type { draftNewVenueProject, draftRenovationProject } from "../projects/project-lifecycle.js";

export interface VenueMailRulesPorts {
  draftNewVenueProject: typeof draftNewVenueProject;
  draftRenovationProject: typeof draftRenovationProject;
}
/** Supplied-state rules retain standard allocation at their original call sites. */
export function createVenueMailRules({ draftNewVenueProject, draftRenovationProject }: VenueMailRulesPorts) {
  function proposedCapacity(venue: VillageVenue, mail: VillageVenueMail): number {
    const base = mail.proposedCapacity ?? venue.residenceCapacity ?? 1;
    const improvements = [...(venue.improvements ?? [null, null])];
    if (mail.improvementSlot !== undefined) improvements[mail.improvementSlot] = mail.improvement ?? null;
    return base + improvements.reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0);
  }

  function validateMail(state: VillageState, mail: VillageVenueMail): VillageVenue | null {
    if (mail.kind === "counteroffer") {
      const request = state.pendingDecisions.find(
        (entry) => entry.id === mail.counterofferRequestId && entry.kind === "venue" && entry.status === "countered",
      );
      if (!request || !mail.counterofferDraft) throw conflict("The original Venue request is no longer available.");
      assertCanAddVillageVenue(state, mail.counterofferDraft.classes);
      if (state.venues.some((entry) => entry.name.toLowerCase() === mail.counterofferDraft!.name.toLowerCase()))
        throw conflict("A Venue with that name already exists.");
      return null;
    }
    const venue = state.venues.find((entry) => entry.id === mail.venueId);
    if (!venue) throw notFound("That Venue no longer exists.");
    if (venue.constructionStatus === "worksite") throw conflict("The build project governs this unfinished site.");
    if (mail.kind === "player-move") {
      if (!hasVenueClass(venue, "residence")) throw conflict("The destination is no longer a Residence.");
      if (venue.occupancy.playerHome) throw conflict("You already live here.");
      const reserved = state.residences.filter(
        (move) => move.proposedVenueId === venue.id && move.status === "moving",
      ).length;
      if (venueAssignedCount(venue) + reserved >= venueCapacity(venue))
        throw conflict("This Residence has no available resident slot.");
      assertResidencePrivateDestination(state, venue, "player", mail.proposedPrivateZoneId);
      return venue;
    }
    if (mail.kind === "villager-move") {
      const residence = state.residences.find(
        (entry) =>
          entry.characterId === mail.movingCharacterId &&
          entry.proposedVenueId === mail.venueId &&
          entry.status === "pending",
      );
      if (!residence) throw conflict("That villager's move is no longer pending.");
      if (!hasVenueClass(venue, "residence") || venueAssignedCount(venue) >= venueCapacity(venue))
        throw conflict("The destination no longer has an available bed.");
      assertResidencePrivateDestination(state, venue, residence.characterId, residence.proposedPrivateZoneId);
      const reserved = state.residences.filter(
        (move) =>
          move.characterId !== residence.characterId && move.proposedVenueId === venue.id && move.status === "moving",
      ).length;
      if (venueAssignedCount(venue) + reserved >= venueCapacity(venue))
        throw conflict("The destination no longer has an available resident slot.");
      return venue;
    }
    const classes = mail.proposedClasses ?? venue.classes ?? ["other"];
    if (proposedCapacity(venue, mail) > 4) throw badRequest("A Residence cannot exceed four people, including you.");
    if (!classes.includes("residence") && venueAssignedCount(venue) > 0)
      throw conflict("Move every resident before removing Residence.");
    if (!classes.includes("workplace") && (venue.workerIds?.length ?? 0) > 0)
      throw conflict("Unassign every worker before removing Workplace.");
    if (classes.includes("residence") && venueAssignedCount(venue) > proposedCapacity(venue, mail))
      throw conflict("The change would displace a resident.");
    if (
      mail.improvement &&
      mail.improvement.spaceId &&
      !classes.includes(mail.improvement.spaceId as VillageVenueClass)
    )
      throw badRequest("The improvement must belong to one of this Venue's spaces.");
    return venue;
  }

  function applyMail(state: VillageState, mail: VillageVenueMail, at: string): void {
    const venue = validateMail(state, mail);
    if (mail.kind === "counteroffer") {
      const draft = mail.counterofferDraft!;
      const request = state.pendingDecisions.find((entry) => entry.id === mail.counterofferRequestId)!;
      draftNewVenueProject(
        state,
        { ...draft, classes: draft.classes.slice(0, 1), requestQuote: request.requestQuote },
        request.requesterCharacterId,
        `request:${request.id}`,
      );
      request.status = "approved";
    } else if (mail.kind === "villager-move") {
      const residence = state.residences.find(
        (entry) => entry.characterId === mail.movingCharacterId && entry.proposedVenueId === mail.venueId,
      )!;
      residence.status = "moving";
      residence.villagerDecision = "approved";
      residence.approvedAt = at;
      residence.completesAt = new Date(Date.parse(at) + 24 * 60 * 60_000).toISOString();
    } else if (mail.kind === "player-move") {
      for (const current of state.venues) {
        if (!current.occupancy.playerHome && current.id !== venue!.id) continue;
        current.zones ??= venueZones(current);
        current.layoutVersion = 1;
        const personal = current.zones.find((zone) => zone.kind === "private-residence" && zone.ownerId === "player");
        if (personal) {
          current.archivedZones = [
            ...(current.archivedZones ?? []),
            { zone: structuredClone(personal), archivedAt: at },
          ].slice(-64);
          personal.ownerId = undefined;
          personal.seen = false;
          personal.image = null;
          personal.preparation = undefined;
          personal.adaptationPending = false;
          personal.description = personal.purpose || "Vacant residential Private Space.";
          personal.state.publicFacts = [];
          personal.state.traces = [];
          current.playerInvitations = current.playerInvitations?.filter((invite) => invite.zoneId !== personal.id);
          current.editProposals = current.editProposals?.filter((proposal) => proposal.zoneId !== personal.id);
        }
        current.occupancy.playerHome = false;
      }
      venue!.occupancy.playerHome = true;
      if (mail.proposedPrivateZoneId) {
        const personal = venue!.zones!.find((zone) => zone.id === mail.proposedPrivateZoneId)!;
        personal.ownerId = "player";
        personal.seen = true;
        personal.preparation = undefined;
      }
    } else {
      const project = draftRenovationProject(state, mail.venueId, {
        title: mail.title,
        detail: mail.detail,
        ...(mail.proposedClasses ? { classes: mail.proposedClasses } : {}),
        ...(mail.proposedCapacity !== undefined ? { capacity: mail.proposedCapacity } : {}),
        ...(mail.improvementSlot !== undefined
          ? { slot: mail.improvementSlot, improvement: mail.improvement ?? null }
          : {}),
      });
      const flow = project.lifecycle!;
      flow.approvals = flow.affectedIds
        .filter(
          (id) =>
            id === mail.requesterCharacterId || mail.decisions.some((row) => row.characterId === id && row.accepted),
        )
        .map((residentId) => ({ residentId, source: "mailbox" as const, evidenceId: mail.id, at }));
      if (flow.affectedIds.every((id) => flow.approvals.some((entry) => entry.residentId === id)))
        flow.phase = "builder";
    }
    mail.status = "approved";
    mail.resolvedAt = at;
  }

  function addMail(state: VillageState, mail: VillageVenueMail): void {
    if (
      state.venueMail.some(
        (entry) =>
          entry.venueId === mail.venueId &&
          (entry.status === "pending-player" || entry.status === "awaiting-villagers"),
      )
    )
      throw conflict("Another Venue decision is awaiting replies here.");
    validateMail(state, mail);
    if (mail.affectedIds.length === 0) applyMail(state, mail, mail.createdAt);
    state.venueMail = [...state.venueMail, mail].slice(-256);
  }

  function dueAt(id: string, at: Date): string {
    return new Date(at.getTime() + (1 + (hashString(id) % 24)) * 60 * 60_000).toISOString();
  }

  function queueSharedMoveConsent(state: VillageState, residence: VillageResidence, now: Date): void {
    const venue = state.venues.find((entry) => entry.id === residence.proposedVenueId);
    if (!venue) throw notFound("That Residence no longer exists.");
    const affectedIds = venueResidentIds(venue).filter((id) => id !== residence.characterId);
    if (!affectedIds.length) throw badRequest("No other resident's consent is needed.");
    const id = randomVillageSeed();
    addMail(state, {
      id,
      venueId: venue.id,
      kind: "villager-move",
      title: `Share ${venue.name}`,
      detail: `${state.villagers.find((entry) => entry.characterId === residence.characterId)?.cardSnapshot.name ?? "A villager"} asks to live here.`,
      status: "awaiting-villagers",
      createdAt: now.toISOString(),
      dueAt: dueAt(id, now),
      resolvedAt: "",
      requesterCharacterId: residence.characterId,
      movingCharacterId: residence.characterId,
      affectedIds,
      decisions: [],
      error: "",
    });
  }

  function queueVenueCounteroffer(
    state: VillageState,
    requestId: string,
    core: VenueRequestCore,
    description: string,
    at: Date,
  ): void {
    const request = state.pendingDecisions.find(
      (entry) => entry.id === requestId && entry.kind === "venue" && entry.status === "pending",
    );
    if (!request || !request.requesterCharacterId) throw notFound("That Venue request is no longer pending.");
    const id = randomVillageSeed();
    const mail: VillageVenueMail = {
      id,
      venueId: requestId,
      kind: "counteroffer",
      title: `Counteroffer: ${core.name}`,
      detail: `Original: ${request.venueDraft?.name} — ${request.venueDraft?.classes.join(" / ")}. Counteroffer: ${core.name} — ${core.classes.join(" / ")}.`,
      status: "awaiting-villagers",
      createdAt: at.toISOString(),
      dueAt: dueAt(id, at),
      resolvedAt: "",
      requesterCharacterId: request.requesterCharacterId,
      affectedIds: [request.requesterCharacterId],
      decisions: [],
      error: "",
      counterofferRequestId: requestId,
      counterofferDraft: { ...core, description },
    };
    request.status = "countered";
    validateMail(state, mail);
    state.venueMail = [...state.venueMail, mail].slice(-256);
  }

  function mailRevision(mail: VillageVenueMail): string {
    return backgroundRevision([
      mail.kind,
      mail.title,
      mail.detail,
      mail.affectedIds,
      mail.projectId,
      mail.proposedCapacity,
      mail.proposedClasses,
      mail.venueId,
      mail.counterofferDraft,
      mail.counterofferRequestId,
      mail.movingCharacterId,
      mail.improvement,
      mail.improvementSlot,
    ]);
  }
  return { addMail, applyMail, dueAt, mailRevision, queueSharedMoveConsent, queueVenueCounteroffer };
}
export type VenueMailRules = ReturnType<typeof createVenueMailRules>;
