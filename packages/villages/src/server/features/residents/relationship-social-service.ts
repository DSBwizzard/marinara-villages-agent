import { z } from "zod";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { SocialEncounter } from "../../domain/models/relationship-types.js";
import type { SocialOutboxEntry } from "../../domain/models/social-outbox-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { conflict } from "../../domain/rules/errors.js";
import { bindLiveProposals } from "../../domain/rules/live-exchange.js";
import { parseRelationshipProposals } from "../../domain/rules/relationship-review.js";
import {
  applyRelationshipReview,
  reconcileRelationships,
  SocialRevisionConflict,
} from "../../domain/rules/relationship-rules.js";
import { sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { departureMemoriesAvailable } from "../../domain/rules/return-catchup-capture.js";
import { socialContextState } from "../../domain/rules/social-context.js";
import { readEncounter } from "../../domain/rules/social-encounter.js";
import { projectSocialActivities, reconcileSocialPlans, socialPlanValid } from "../../domain/rules/social-rules.js";
import { applyWishSource } from "../../domain/rules/social-wishes.js";
import { settleStandingAccess } from "../../domain/rules/venue-access.js";
import { WorkFailureError } from "../../domain/rules/work-failure.js";
import type { mutateVillageState } from "../world/village-store.js";
import type { mutateRelationships } from "./relationship-store.js";
class EncounterInterpretationError extends Error {}
export type RelationshipSocialPorts = {
  readVillageSnapshot?: typeof import("../world/village-store.js").readVillageSnapshot;
  queueBackgroundJob?: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  interpretSocialSource?: typeof import("../founding/village-bootstrap.js").interpretSocialSource;
  processLiveMemories?: typeof import("./live-memory.js").processLiveMemories;
  mutateVillageState: typeof mutateVillageState;
  mutateRelationships: typeof mutateRelationships;
  afterCatchup?: () => Promise<void>;
};
/** A saved social outbox settles relationships before its Village acknowledgement. */
export function createRelationshipSocial(ports: RelationshipSocialPorts) {
  const { mutateVillageState, mutateRelationships, processLiveMemories } = ports;

  async function processSocialOutbox(village: VillageState, sourceId?: string): Promise<boolean> {
    const pending = (village.socialOutbox ?? [])
      .filter((entry) => !entry.processed && !entry.error && (sourceId ? entry.id === sourceId : !entry.catchupBatchId))
      .slice(0, 8);
    if (!pending.length) return false;
    for (const entry of pending) {
      if (entry.seed !== village.seed) continue;
      try {
        const settled = await mutateRelationships(village.seed, (state) => {
          const current = { ...village, relationshipContext: state };
          reconcileRelationships(state, current);
          reconcileSocialPlans(current);
          projectSocialActivities(current);
          if (state.applied[entry.id]) {
            if (entry.reinterpreted) {
              const accepted = state.socialEncounters.find((row) => row.id === entry.id),
                raw = asRecord(entry.proposal.encounter);
              if (accepted) {
                accepted.memoryChanges = structuredClone(raw.memoryChanges);
                accepted.wishChanges = structuredClone(raw.wishChanges) as unknown[];
                accepted.memoryContexts = structuredClone(raw.memoryContexts) as SocialEncounter["memoryContexts"];
                accepted.semanticProvenance = {
                  version: 2,
                  sourceHash: String(raw.semanticSourceHash),
                  interpretedAt: entry.at,
                };
              }
            }
            return;
          }
          if (entry.requiredPlanId && entry.requiredPlan?.id !== entry.requiredPlanId)
            throw new Error("The encounter has no admitted meeting plan.");
          if (
            entry.admitted &&
            entry.opportunity.actorIds.some((id) => {
              const original = entry.admitted!.villagers.find((row) => row.characterId === id),
                live = village.villagers.find((row) => row.characterId === id);
              return !live || !original || live.cardSnapshot.capturedAt !== original.cardSnapshot.capturedAt;
            })
          )
            throw new Error("An encounter participant changed. The original source is retained.");
          const plan = entry.candidates.find((candidate) => candidate.id === entry.proposal.planId);
          if (
            plan &&
            !state.applied[`social-plan-date:${plan.dateKey}`] &&
            current.backgroundPace !== "off" &&
            socialPlanValid(current, plan)
          ) {
            state.socialPlans.push(plan);
            state.applied[`social-plan-date:${plan.dateKey}`] = true;
          }
          let encounter: SocialEncounter | null = null;
          if (entry.proposal.encounter) {
            try {
              encounter = readEncounter(entry.proposal.encounter, entry, current);
            } catch (error) {
              throw new EncounterInterpretationError(
                error instanceof Error ? error.message : "Invalid encounter interpretation.",
              );
            }
            if (!encounter)
              throw new Error("The saved encounter could not be admitted. Its original source is retained.");
          }
          if (encounter) {
            applyRelationshipReview(
              state,
              encounter.review,
              current,
              encounter.id,
              encounter.at,
              villageNow().getTime(),
            );
            state.socialEncounters = [...state.socialEncounters, encounter].slice(-64);
            const minute =
              new ZonedDate(
                encounter.at,
                entry.admitted?.timeZone || village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              ).getHours() *
                60 +
              new ZonedDate(
                encounter.at,
                entry.admitted?.timeZone || village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              ).getMinutes();
            for (const plan of state.socialPlans)
              if (
                plan.status === "planned" &&
                plan.kind === "meeting" &&
                plan.venueId === encounter.venueId &&
                plan.zoneId === encounter.zoneId &&
                plan.startMinute <= minute &&
                plan.endMinute > minute &&
                plan.actorIds.every((id) => encounter!.actorIds.includes(id))
              )
                plan.status = "completed";
          }
          state.socialPlans = state.socialPlans.slice(-64);
          state.applied[entry.id] = true;
        });
        const accepted = settled.socialEncounters.find((row) => row.id === entry.id);
        if (accepted?.semanticProvenance?.version === 2) {
          if (!processLiveMemories) throw new Error("Offscreen memory application is unavailable.");
          const lines = accepted.lines.map((line) => ({
            ...line,
            name: line.speakerId,
            at: accepted.at,
            contactHidden: true,
          }));
          const privateScene = coerceSession({
            id: "offscreen:" + entry.id,
            processingVersion: 1,
            villageSeed: entry.seed,
            placeId: accepted.venueId,
            zoneId: accepted.zoneId,
            startedAt: accepted.at,
            status: "closed",
            activeIds: accepted.actorIds,
            participants: accepted.actorIds.map((id) => ({ characterId: id, name: id, doing: "" })),
            lines,
            submissions: [
              {
                id: entry.id,
                mode: "chat",
                message: "",
                targetId: "",
                at: accepted.at,
                semanticProvenance: accepted.semanticProvenance,
                liveProposals: bindLiveProposals(
                  { memoryChanges: accepted.memoryChanges, memoryContexts: accepted.memoryContexts },
                  "",
                  lines.map((line) => line.id),
                  lines,
                ),
              },
            ],
          });
          const memory = await processLiveMemories(privateScene, entry.id);
          if (memory.status === "failed" || memory.status === "pending")
            throw new EncounterInterpretationError(memory.reason || "Offscreen memory application needs recovery.");
        }
        await mutateVillageState((state) => {
          if (state.seed !== entry.seed) return;
          // Only an encounter accepted by the relationship transaction can settle access.
          // Its captured evidence survives retries after the original encounter window ends.
          const encounter = state.relationshipContext?.socialEncounters.find((row) => row.id === entry.id);
          if (encounter) {
            const captured = entry.admitted?.villagers;
            if (encounter.wishChanges?.length && !captured) throw new Error("Wish encounter authority is missing.");
            if (captured) {
              try {
                applyWishSource(state, {
                  id: "offscreen:" + entry.id,
                  kind: "encounter",
                  at: encounter.at,
                  recordedAt: villageNow().toISOString(),
                  lines: encounter.lines.map((l) => ({ ...l, playerHeard: false, contactHidden: true })),
                  currentLineIds: encounter.lines.map((l) => l.id),
                  changes: encounter.wishChanges ?? [],
                  residents: captured,
                  learn: false,
                });
              } catch (error) {
                throw new EncounterInterpretationError(
                  error instanceof Error ? error.message : "Wish interpretation is invalid.",
                );
              }
            }
            const fresh = parseRelationshipProposals(
              { changes: [], disclosures: [], permissions: encounter.review.permissions },
              encounter.id,
              encounter.lines,
              state,
              undefined,
              encounter.semanticProvenance?.version === 2,
            );
            if (fresh.rejections.length)
              throw new Error("Encounter permission authority changed; source retained for recovery.");
            for (const permission of fresh.review.permissions) {
              const venue = state.venues.find((venue) => venue.id === permission.venueId);
              if (venue?.access) {
                settleStandingAccess(venue, permission, encounter.at, [
                  "player",
                  ...state.villagers.map((resident) => resident.characterId),
                ]);
                if (
                  !venue.access.receipts[permission.id] ||
                  venue.access.receipts[permission.id]?.outcome === "rejected"
                )
                  throw new Error("Encounter standing permission needs recovery.");
              }
            }
          }
          const saved = state.socialOutbox?.find((row) => row.id === entry.id);
          if (saved) {
            saved.processed = true;
          }
          state.socialOutbox = state.socialOutbox?.filter((row) => !row.processed);
        });
      } catch (error) {
        await mutateVillageState((state) => {
          const saved = state.socialOutbox?.find((row) => row.id === entry.id);
          if (saved) {
            saved.error = error instanceof Error ? error.message : "Encounter settlement needs recovery.";
            saved.reinterpretRequired =
              error instanceof SocialRevisionConflict ||
              error instanceof EncounterInterpretationError ||
              (error instanceof WorkFailureError && error.failure.stage === "metadata");
          }
        });
      }
    }
    return true;
  }

  async function recover(id: string, value: unknown) {
    const input = z
      .object({ requestId: z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/), reinterpret: z.boolean() })
      .parse(value);
    if (!ports.readVillageSnapshot) throw new Error("Encounter recovery unavailable.");
    const village = await ports.readVillageSnapshot({ memories: true }),
      entry = village.socialOutbox?.find((row) => row.id === id);
    if (!entry) return;
    if (entry.catchupBatchId) throw conflict("Recover this encounter from Village catch-up.");
    if (input.reinterpret) {
      if (!ports.queueBackgroundJob) throw new Error("Encounter interpretation unavailable.");
      await ports.queueBackgroundJob({
        kind: "social-recovery",
        subjectId: id,
        seed: village.seed,
        revision: input.requestId,
        finite: true,
        label: "Encounter meaning",
        input: {
          entry: structuredClone(entry),
          social: socialContextState(village.relationshipContext, entry.opportunity.actorIds, ""),
          seed: village.seed,
          admittedAt: villageNow().toISOString(),
          memory: sceneMemoryContext(village, entry.opportunity.actorIds, (entry.opportunity.facts ?? []).join(" ")),
        },
      });
    } else {
      await mutateVillageState((state) => {
        const saved = state.socialOutbox?.find((row) => row.id === id);
        if (saved) saved.error = undefined;
      });
      await processSocialOutbox(await ports.readVillageSnapshot());
    }
  }
  async function recoverCatchup(batchId: string, opportunityId: string, requestId: string) {
    if (!ports.readVillageSnapshot || !ports.queueBackgroundJob) throw new Error("Encounter recovery unavailable.");
    const village = await ports.readVillageSnapshot({ memories: true });
    const tracking = village.returnCatchup;
    const entry = village.socialOutbox?.find((row) => row.id === opportunityId + ":social");
    const record = tracking?.batch?.records?.find((row) => row.opportunityId === opportunityId);
    if (
      tracking?.batch?.id !== batchId ||
      tracking.batch.status !== "recovering" ||
      !tracking.capture ||
      record?.status !== "settling" ||
      !entry ||
      entry.catchupBatchId !== batchId ||
      !entry.reinterpretRequired ||
      !departureMemoriesAvailable(tracking.capture, village) ||
      JSON.stringify(village.relationshipContext) !== JSON.stringify(tracking.capture.world.relationshipContext)
    )
      throw conflict("The saved encounter changed before interpretation could be retried.");
    const historical = { ...village, ...tracking.capture.world };
    await ports.queueBackgroundJob({
      kind: "social-recovery",
      subjectId: entry.id,
      seed: village.seed,
      revision: requestId,
      finite: true,
      label: "Encounter meaning",
      input: {
        entry: structuredClone(entry),
        social: structuredClone(entry.relationshipSnapshot),
        seed: village.seed,
        admittedAt: entry.at,
        memory: sceneMemoryContext(historical, entry.opportunity.actorIds, entry.opportunity.facts.join(" ")),
      },
    });
  }
  const handler: Handler = {
    async generate(input: {
      entry: SocialOutboxEntry;
      social: VillageState["relationshipContext"];
      seed: string;
      admittedAt: string;
      memory: ReturnType<typeof sceneMemoryContext>;
    }) {
      if (!ports.interpretSocialSource) throw new Error("Encounter interpretation unavailable.");
      const raw = input.entry.proposal.encounter as Record<string, unknown>;
      return ports.interpretSocialSource(
        raw.lines,
        {
          state: input.social,
          candidates: [],
          relationships: [],
          residents: input.entry.catchupBatchId
            ? input.entry.admitted.villagers.filter((resident) =>
                input.entry.opportunity.actorIds.includes(resident.characterId),
              )
            : input.entry.admitted.villagers,
          at: input.admittedAt,
          memory: input.memory,
        },
        false,
      );
    },
    valid: (state, input) =>
      state.seed === input.seed &&
      (!input.entry.catchupBatchId ||
        (state.returnCatchup?.batch?.id === input.entry.catchupBatchId &&
          state.returnCatchup.batch.status === "recovering" &&
          !!state.returnCatchup.capture &&
          departureMemoriesAvailable(state.returnCatchup.capture, state) &&
          JSON.stringify(state.relationshipContext) ===
            JSON.stringify(state.returnCatchup.capture.world.relationshipContext) &&
          JSON.stringify(state.socialOutbox?.find((row) => row.id === input.entry.id)) ===
            JSON.stringify(input.entry))) &&
      !!state.socialOutbox?.some((row) => row.id === input.entry.id) &&
      input.entry.opportunity.actorIds.every((id: string) =>
        state.villagers.some(
          (person) =>
            person.characterId === id &&
            person.cardSnapshot.capturedAt ===
              input.entry.admitted?.villagers.find((row: { characterId: string }) => row.characterId === id)
                ?.cardSnapshot.capturedAt,
        ),
      ),
    apply: (state, input, result) => {
      const entry = state.socialOutbox!.find((row) => row.id === input.entry.id)!;
      entry.proposal.encounter = { ...(entry.proposal.encounter as object), ...result };
      entry.relationshipSnapshot = input.social;
      entry.reinterpreted = true;
      entry.error = undefined;
      entry.reinterpretRequired = undefined;
      if (entry.catchupBatchId) {
        const batch = state.returnCatchup!.batch!;
        const record = batch.records?.find((row) => row.opportunityId + ":social" === entry.id);
        if (!record || record.status !== "settling") throw conflict("The saved catch-up encounter changed.");
        record.outcome = { ...asRecord(record.outcome), social: structuredClone(entry.proposal) };
        record.error = undefined;
        batch.status = "running";
      }
    },
    afterApply: async (input) => {
      if (input.entry.catchupBatchId) await ports.afterCatchup?.();
      else if (ports.readVillageSnapshot) await processSocialOutbox(await ports.readVillageSnapshot());
    },
    afterFailure: async (input) => {
      if (input.entry.catchupBatchId) await ports.afterCatchup?.();
    },
  };
  return { processSocialOutbox, recover, recoverCatchup, handler };
}
export type RelationshipSocialService = ReturnType<typeof createRelationshipSocial>;
