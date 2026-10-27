import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageSnapshot, VillageState } from "../../domain/models/world.js";
import { rememberDomainFact } from "../../domain/rules/domain-memories.js";
import { badRequest, notFound } from "../../domain/rules/errors.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH } from "../../domain/rules/prompt-preset.js";
import { queueVillageVenueRequest } from "../../domain/rules/venue-request-state.js";
import { readVenueRequestCore, type VenueRequestCore } from "../../domain/rules/venue-requests.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import type { draftNewVenueProject } from "../projects/project-lifecycle.js";

export interface VenueRequestPorts {
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  draftNewVenueProject: typeof draftNewVenueProject;
}

/** Request review owns its saved-world and Project planning connections. Construction is inert. */
export function createVenueRequests({
  mutateVillageState,
  buildVillageSnapshot,
  draftNewVenueProject,
}: VenueRequestPorts) {
  async function recordVillageVenueRequest(
    core: VenueRequestCore,
    requesterCharacterId: string,
    sourceKey: string,
  ): Promise<void> {
    await mutateVillageState((state) =>
      queueVillageVenueRequest(state, core, requesterCharacterId, "chat", sourceKey, villageNow().toISOString()),
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
      applyVillageVenueDecision(state, requestId, approved, edits, description, villageNow());
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
      throw badRequest("Changing the requested name or Classes is not available yet.");
    }
    if (approved) {
      draftNewVenueProject(
        state,
        { ...core, classes: core.classes, description, requestQuote: decision.requestQuote },
        decision.requesterCharacterId,
        `request:${requestId}`,
      );
    }
    decision.status = approved ? "approved" : "denied";
    const moment = deriveVillageMoment({
      foundedAt: state.foundedAt,
      seed: state.seed,
      timeZone: state.timeZone || undefined,
      now,
    });
    const who = decision.requesterName || "A villager";
    const text = approved
      ? `The player accepted ${who}'s request to plan ${core.name}. Construction has not begun.`
      : `The player declined ${who}'s request for ${decision.venueDraft.name}.`;
    rememberDomainFact(state, {
      id: "venue-decision:" + requestId,
      at: moment.instant,
      recordedAt: moment.instant,
      text,
      subjects: decision.requesterCharacterId ? [decision.requesterCharacterId] : [],
      knowers: ["player", ...(decision.requesterCharacterId ? [decision.requesterCharacterId] : [])],
    });
  }
  return {
    recordVillageVenueRequest,
    decideVillageVenueRequest,
    applyVillageVenueDecision,
  };
}
export type VenueRequests = ReturnType<typeof createVenueRequests>;
