import { copySocialWishes, immutableSocialWishes } from "../../domain/rules/social-wishes.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { RepairGate } from "../../adapters/storage/repair-gate.js";
import type { VillageState } from "../../domain/models/world.js";
import { mergeNarrativeAfter } from "../../domain/rules/narrative-development.js";
import { conflict } from "../../domain/rules/errors.js";
import { sameReturnResident } from "../../domain/rules/return-catchup-authority.js";
import { departureMemoriesAvailable } from "../../domain/rules/return-catchup-capture.js";
import { planRoutineDays } from "../../domain/rules/resident-agenda.js";
import { socialContextState } from "../../domain/rules/social-context.js";
import { asRecord } from "../../domain/rules/coerce.js";
import {
  captureResidentActivity,
  cloneVillageContext,
  sameRelationshipContext,
} from "../../domain/rules/world-context-copy.js";
import { immutableRelationshipState } from "../../domain/rules/relationship-rules.js";
import {
  returnCaptureRevision,
  type RelationshipIdentity,
  type WishIdentity,
} from "../../domain/rules/return-capture-revision.js";

type Ports = {
  socialIdentity: import("../../adapters/storage/captured-admission-store.js").CapturedAdmissionStore["socialIdentity"];
  relationshipIdentity: RelationshipIdentity;
  wishIdentity: WishIdentity;
  gate: Pick<RepairGate, "simulate" | "commit">;
  readSnapshot: typeof import("../world/village-store.js").readVillageSnapshot;
  mutate: typeof import("../world/village-store.js").mutateVillageState;
  processSocialOutbox: typeof import("../residents/relationship-social.js").processSocialOutbox;
};

/** Settle one saved encounter and advance its historical baseline together. */
export function createReturnCatchupSettlement(ports: Ports) {
  async function settle(batchId: string, opportunityId: string, retry = false): Promise<"settled" | "recovering"> {
    const sourceId = opportunityId + ":social";
    const staged = await ports.gate.simulate(async () => {
      let before = await ports.readSnapshot({ memories: true, wishes: true });
      const tracking = before.returnCatchup,
        batch = tracking?.batch,
        capture = tracking?.capture;
      const record = batch?.records?.find((row) => row.opportunityId === opportunityId);
      const opportunity = batch?.opportunities?.find((row) => row.id === opportunityId);
      if (
        !batch ||
        batch.id !== batchId ||
        !["running", "recovering"].includes(batch.status) ||
        !capture ||
        !record ||
        !opportunity ||
        record.status !== "settling"
      )
        throw conflict("The saved catch-up encounter changed. Refresh its status.");
      const source = before.socialOutbox?.find((row) => row.id === sourceId);
      if (!source || source.catchupBatchId !== batchId) throw conflict("The saved catch-up encounter is missing.");
      if (
        source.at !== opportunity.startsAt ||
        JSON.stringify(source.opportunity) !== JSON.stringify(opportunity) ||
        JSON.stringify(source.proposal) !== JSON.stringify(asRecord(record.outcome).social)
      )
        throw conflict("The saved catch-up source does not match its opportunity.");
      if (
        !departureMemoriesAvailable(capture, before) ||
        !before.relationshipContext ||
        !capture.world.relationshipContext ||
        !sameRelationshipContext(before.relationshipContext, capture.world.relationshipContext) ||
        JSON.stringify(before.opening) !== JSON.stringify(capture.world.opening)
      )
        throw conflict("Village knowledge changed before the encounter could settle.");
      const historical: VillageState = { ...before, ...capture.world };
      const at = new ZonedDate(
        opportunity.startsAt,
        capture.world.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      const projected = cloneVillageContext(historical);
      planRoutineDays(projected, at);
      const admitted = captureResidentActivity(projected, true);
      const { admitted: _admitted, relationshipHead: _head, relationshipSnapshot: _snapshot, ...facts } = source;
      const expected = {
        ...facts,
        admitted,
        relationshipSnapshot: socialContextState(
          projected.relationshipContext,
          opportunity.actorIds,
          opportunity.facts.join(" "),
        ),
      };
      if (ports.socialIdentity(source, before) !== ports.socialIdentity(expected, before))
        throw conflict("The saved catch-up source does not match its captured authority.");
      if (
        opportunity.actorIds.some((id) => {
          const old = capture.world.villagers.find((row) => row.characterId === id);
          const live = before.villagers.find((row) => row.characterId === id);
          return !old || !live || !sameReturnResident(old, live, at, historical, ports.wishIdentity);
        }) ||
        JSON.stringify(capture.world.venues.find((row) => row.id === opportunity.venueId)) !==
          JSON.stringify(before.venues.find((row) => row.id === opportunity.venueId))
      )
        throw conflict("The resident or Venue changed before the encounter could settle.");
      if (source.error) {
        if (!retry) throw conflict("The saved encounter needs explicit recovery.");
        if (source.reinterpretRequired) throw conflict("The encounter needs an explicit interpretation retry.");
        await ports.mutate((state) => {
          const pending = state.socialOutbox?.find((row) => row.id === sourceId);
          if (pending) pending.error = undefined;
        });
        before = await ports.readSnapshot({ memories: true, wishes: true });
      }
      await ports.processSocialOutbox(before, sourceId);
      const after = await ports.readSnapshot({ memories: true, wishes: true });
      const pending = after.socialOutbox?.find((row) => row.id === sourceId);
      if (pending)
        return {
          status: "recovering" as const,
          error: pending.error || "The saved encounter needs recovery.",
          reinterpretRequired: !!pending.reinterpretRequired,
          captureRevision: returnCaptureRevision(capture, ports.relationshipIdentity, ports.wishIdentity),
          sourceRevision: ports.socialIdentity(source, before),
        };
      await ports.mutate(
        (state) => {
          const active = state.returnCatchup,
            next = active?.batch?.records?.find((row) => row.opportunityId === opportunityId);
          if (!active?.capture || active.batch?.id !== batchId || !next) throw conflict("The catch-up batch changed.");
          active.capture.memoryRevision = state.memories.revision;
          active.capture.world.relationshipContext = state.relationshipContext
            ? immutableRelationshipState(state.seed, state.relationshipContext)
            : undefined;
          for (const id of opportunity.actorIds) {
            const saved = active.capture.world.villagers.find((row) => row.characterId === id);
            const live = state.villagers.find((row) => row.characterId === id);
            if (!saved || !live) throw conflict("A catch-up resident changed.");
            saved.wishes = copySocialWishes(immutableSocialWishes(live.wishes));
          }
          const savedVenue = active.capture.world.venues.findIndex((row) => row.id === opportunity.venueId);
          const liveVenue = state.venues.find((row) => row.id === opportunity.venueId);
          if (savedVenue < 0 || !liveVenue) throw conflict("The catch-up Venue changed.");
          active.capture.world.venues[savedVenue] = structuredClone(liveVenue);
          if (active.capture.world.narrative)
            for (const receipt of state.narrative?.receipts ?? []) {
              if (
                receipt.sourceId !== "offscreen:" + sourceId ||
                receipt.source !== "action" ||
                active.capture.world.narrative.receipts.some((row) => row.id === receipt.id)
              )
                continue;
              mergeNarrativeAfter(active.capture.world.narrative, receipt.after);
              active.capture.world.narrative.receipts.push(structuredClone(receipt));
              active.capture.world.narrative.revision++;
            }
          if (state.narrative)
            state.narrative.receipts = state.narrative.receipts.filter(
              (row) => row.sourceId !== "offscreen:" + sourceId,
            );
          next.status = "settled";
          next.error = undefined;
          active.batch.status = "running";
        },
        { wishes: opportunity.actorIds },
      );
      return { status: "settled" as const };
    });
    if (staged.value.status === "recovering") {
      const failure = staged.value;
      // Discard staged partial effects; only retain diagnostic metadata against
      // the unchanged source and historical baseline.
      await ports.mutate((state) => {
        const active = state.returnCatchup,
          record = active?.batch?.records?.find((row) => row.opportunityId === opportunityId);
        const source = state.socialOutbox?.find((row) => row.id === sourceId);
        if (
          !active?.capture ||
          active.batch?.id !== batchId ||
          !record ||
          !source ||
          returnCaptureRevision(active.capture, ports.relationshipIdentity, ports.wishIdentity) !==
            failure.captureRevision ||
          ports.socialIdentity(source, state) !== failure.sourceRevision ||
          !departureMemoriesAvailable(active.capture, state) ||
          !sameRelationshipContext(state.relationshipContext, active.capture.world.relationshipContext)
        )
          throw conflict("Village authority changed while recording catch-up recovery.");
        source.error = failure.error;
        source.reinterpretRequired = failure.reinterpretRequired || undefined;
        record.error = failure.error;
        active.batch.status = "recovering";
      });
      return "recovering";
    }
    await ports.gate.commit("return-" + batchId + "-" + opportunityId, staged.transaction);
    return "settled";
  }
  return { settle };
}
