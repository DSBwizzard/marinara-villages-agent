import type { VillageState, VillageSnapshot } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { boundText, HOME_BUILDING_ORDER, MAX_VENUE_DESCRIPTION_LENGTH } from "../../domain/rules/prompt-preset.js";
import { readVenueRequestCore, type VenueRequestCore } from "../../domain/rules/venue-requests.js";
import { queueVillageVenueRequest } from "../../domain/rules/venue-request-state.js";
import { randomVillageSeed, deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { residenceCharacterId, residenceVenueId } from "../../domain/rules/world-input.js";
import type { draftNewVenueProject, draftRenovationProject } from "../projects/project-lifecycle.js";
import type { queueVenueCounteroffer } from "./venue-mailbox.js";

export interface VenueRequestPorts {
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  draftNewVenueProject: typeof draftNewVenueProject;
  draftRenovationProject: typeof draftRenovationProject;
  queueVenueCounteroffer: typeof queueVenueCounteroffer;
}

/** Request review owns its saved-world, Project planning and counteroffer connections. Construction is inert. */
export function createVenueRequests({
  mutateVillageState,
  buildVillageSnapshot,
  draftNewVenueProject,
  draftRenovationProject,
  queueVenueCounteroffer,
}: VenueRequestPorts) {
  async function recordVillageVenueRequest(
    core: VenueRequestCore,
    requesterCharacterId: string,
    sourceKey: string,
  ): Promise<void> {
    await mutateVillageState((state) =>
      queueVillageVenueRequest(state, core, requesterCharacterId, "chat", sourceKey, new Date().toISOString()),
    );
  }

  async function decideVillageVenueRequest(
    requestId: string,
    approved: boolean,
    value: unknown,
  ): Promise<VillageSnapshot> {
    const edits = approved ? readVenueRequestCore(value) : null;
    const description = approved
      ? boundText((value as Record<string, unknown>)?.description, MAX_VENUE_DESCRIPTION_LENGTH)
      : "";
    if (approved && !edits) throw badRequest("A venue request needs a name and Class.");
    if (approved && !description) throw badRequest("Approve a description before creating this venue.");
    await mutateVillageState((state) => {
      applyVillageVenueDecision(state, requestId, approved, edits, description, new Date());
    });
    return buildVillageSnapshot();
  }

  async function requestVillageHomeUpgrade(
    characterValue: unknown,
    venueValue: unknown,
    sourceKey = "",
  ): Promise<VillageSnapshot> {
    const characterId = residenceCharacterId(characterValue);
    const venueId = residenceVenueId(venueValue);
    await mutateVillageState((state) => {
      if (sourceKey && state.processedOpportunityIds.includes(sourceKey)) return;
      const venue = state.venues.find((entry) => entry.id === venueId);
      if (!venue || venue.occupancy.residentCharacterId !== characterId || !venue.occupancy.homeKind)
        throw badRequest("Only the resident can request an upgrade to their home.");
      const index = HOME_BUILDING_ORDER.indexOf(venue.occupancy.homeKind);
      const next = HOME_BUILDING_ORDER[index + 1];
      if (!next) throw badRequest("This home is already at the highest tier.");
      if (
        state.pendingDecisions.some(
          (decision) =>
            decision.kind === "venue-upgrade" && decision.venueId === venueId && decision.status === "pending",
        )
      )
        return;
      const resident = state.villagers.find((entry) => entry.characterId === characterId)!;
      state.pendingDecisions.push({
        id: randomVillageSeed(),
        kind: "venue-upgrade",
        title: `Upgrade ${venue.name || resident.cardSnapshot.name + "'s home"}`,
        detail: `${resident.cardSnapshot.name} requests ${state.homeBuildingNames[next]}.`,
        proposedAt: new Date().toISOString(),
        sourceOpportunityId: "",
        status: "pending",
        requesterCharacterId: characterId,
        requesterName: resident.cardSnapshot.name,
        venueId,
        proposedHomeKind: next,
        source: "chat",
      });
      if (sourceKey) state.processedOpportunityIds = [...state.processedOpportunityIds, sourceKey].slice(-256);
    });
    return buildVillageSnapshot();
  }

  async function decideVillageHomeUpgrade(requestId: string, approved: boolean): Promise<VillageSnapshot> {
    await mutateVillageState((state) => {
      const decision = state.pendingDecisions.find(
        (entry) => entry.id === requestId && entry.kind === "venue-upgrade" && entry.status === "pending",
      );
      if (!decision) throw notFound("That home upgrade request is no longer pending.");
      if (approved) {
        const venue = state.venues.find((entry) => entry.id === decision.venueId);
        if (
          !venue ||
          venue.occupancy.residentCharacterId !== decision.requesterCharacterId ||
          !venue.occupancy.homeKind
        )
          throw conflict("The requester no longer lives in that home.");
        const next = HOME_BUILDING_ORDER[HOME_BUILDING_ORDER.indexOf(venue.occupancy.homeKind) + 1];
        if (!next || next !== decision.proposedHomeKind)
          throw conflict("The home's tier has changed since this request.");
        const project = draftRenovationProject(state, venue.id, {
          title: `Renovate ${venue.name}`,
          detail: `${decision.requesterName || "The resident"} wants ${state.homeBuildingNames[next]}.`,
          homeKind: next,
        });
        const flow = project.lifecycle!;
        if (decision.requesterCharacterId && flow.affectedIds.includes(decision.requesterCharacterId))
          flow.approvals.push({
            residentId: decision.requesterCharacterId,
            source: "conversation",
            evidenceId: decision.id,
            at: decision.proposedAt,
          });
        if (flow.affectedIds.every((id) => flow.approvals.some((entry) => entry.residentId === id)))
          flow.phase = "builder";
      }
      decision.status = approved ? "approved" : "denied";
    });
    return buildVillageSnapshot();
  }

  function applyVillageVenueDecision(
    state: VillageState,
    requestId: string,
    approved: boolean,
    edits: VenueRequestCore | null,
    description: string,
    now: Date,
  ): void {
    const decision = state.pendingDecisions.find((entry) => entry.id === requestId && entry.kind === "venue");
    if (!decision || decision.status === "approved" || decision.status === "denied" || !decision.venueDraft)
      throw notFound("That venue request is no longer pending.");
    const core = edits ?? decision.venueDraft;
    if (
      approved &&
      edits &&
      (edits.name !== decision.venueDraft.name ||
        JSON.stringify(edits.classes) !== JSON.stringify(decision.venueDraft.classes))
    ) {
      queueVenueCounteroffer(state, requestId, edits, description, now);
      return;
    }
    if (approved) {
      draftNewVenueProject(
        state,
        { ...core, classes: core.classes.slice(0, 1), description, requestQuote: decision.requestQuote },
        decision.requesterCharacterId,
        `request:${requestId}`,
      );
    }
    decision.status = approved ? "approved" : "denied";
    const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now });
    const who = decision.requesterName || "A villager";
    const text = approved
      ? `The player accepted ${who}'s request to plan ${core.name}. Construction has not begun.`
      : `The player declined ${who}'s request for ${decision.venueDraft.name}.`;
    state.chronicle = [
      {
        id: randomVillageSeed(),
        dayIndex: moment.dayIndex,
        clock: moment.dayPhase,
        occurredAt: moment.instant,
        timePrecision: "exact",
        scope: "village",
        actors: decision.requesterCharacterId ? [{ id: decision.requesterCharacterId, name: who }] : [],
        kind: "chat",
        text,
      },
      ...state.chronicle,
    ];
  }
  return {
    recordVillageVenueRequest,
    decideVillageVenueRequest,
    requestVillageHomeUpgrade,
    decideVillageHomeUpgrade,
    applyVillageVenueDecision,
  };
}
export type VenueRequests = ReturnType<typeof createVenueRequests>;
