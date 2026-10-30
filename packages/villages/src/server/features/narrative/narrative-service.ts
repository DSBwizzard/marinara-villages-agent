import type { VillageState, ResidentPlanningOpportunity, ReturnCatchupCapture } from "../../domain/models/world.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { NarrativeAdmission } from "../../domain/models/narrative-model.js";
import {
  admitNarrative,
  applyNarrativeDevelopment,
  assertNarrativeAdmission,
  ensureNarrative,
  readNarrativeDevelopment,
  mergeNarrativeAfter,
} from "../../domain/rules/narrative-development.js";
import { activityDate, eventAttemptAvailable } from "../../domain/rules/event-attempts.js";
import { arrangementActivityAt, preferredActivityLane } from "../../domain/rules/activity-arbitration.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import { cloneVillageContext } from "../../domain/rules/world-context-copy.js";
import { returnCaptureRevision, type RelationshipIdentity } from "../../domain/rules/return-capture-revision.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { fitVenueWritingMessages } from "../../domain/rules/venue-writing.js";
import { ReturnOpportunityUnavailable, returnCatchupSubject } from "../../domain/rules/return-catchup-authority.js";
import { conflict } from "../../domain/rules/errors.js";
import { completionFailure, WorkFailureError } from "../../domain/rules/work-failure.js";
import { WORLD_DEVELOPMENT_INSTRUCTION, WORLD_DEVELOPMENT_REVIEW } from "../../domain/rules/narrative-prompts.js";

type Ports = {
  relationshipIdentity: RelationshipIdentity;
  read: () => Promise<VillageState>;
  mutate: (update: (state: VillageState) => void) => Promise<void>;
  socialSnapshot: () => Promise<VillageState>;
  resident: (now: Date, dueOnly?: boolean) => Promise<boolean | void>;
  queue: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  job: typeof import("../../jobs/background-work.js").backgroundJobSnapshot;
  models: typeof import("../../adapters/models/language-models.js").villagesLanguageModels;
  connection: typeof import("../settings/connections.js").villagesConnectionIdFor;
  complete: typeof import("../generation/model-requests.js").completeWithRoom;
  now: () => Date;
  afterCatchup: () => Promise<void>;
};

/** Raw environmental authority shares the existing worker, allowance and provider queue. */
export function createNarrative(ports: Ports) {
  let reconciling: Promise<void> | null = null;
  async function ask(system: string, context: unknown, allowance: number) {
    const model = await ports.models().resolveForRequest({ connectionId: await ports.connection("system") });
    const fitted = fitVenueWritingMessages(
      model,
      [{ text: system }],
      JSON.stringify(context),
      Math.min(model.maxOutputTokens ?? allowance, allowance),
      "System",
    );
    const completion = await ports.complete(model, fitted.messages, fitted.maxTokens ?? allowance, {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
      temperature: 0.8,
    });
    const result = extractModelJsonObject(completion);
    const failure = completionFailure(completion, "world-development", fitted.maxTokens ?? allowance);
    if (failure) throw new WorkFailureError(failure);
    if (!result) throw new Error("World development returned no usable JSON. Its response is retained.");
    return result;
  }
  async function queueWorld(
    state: VillageState,
    grant: NarrativeAdmission,
    date: string,
    batchId?: string,
    opportunity?: ResidentPlanningOpportunity,
    capture?: ReturnCatchupCapture,
  ): Promise<boolean> {
    const subjectId = batchId && opportunity ? returnCatchupSubject(batchId, opportunity.id) : "village";
    const prior = await ports.job("world-development", subjectId);
    if (prior?.seed === state.seed && ["queued", "running", "failed", "interrupted", "paused"].includes(prior.status))
      return false;
    await ports.queue({
      kind: "world-development",
      subjectId,
      seed: state.seed,
      revision: grant.id,
      finite: false,
      label: "World development",
      automaticDate: date,
      input: {
        version: 1,
        grant,
        dateKey: date,
        ...(batchId
          ? {
              catchupBatchId: batchId,
              context: { catchup: true },
              opportunity,
              captureRevision: returnCaptureRevision(capture, ports.relationshipIdentity),
              returnUntil: state.returnCatchup?.batch?.until,
            }
          : {}),
      },
    });
    return true;
  }
  async function reconcileAt(now: Date): Promise<void> {
    let state = await ports.read();
    if (
      !state.setupAt ||
      state.clock?.recovery ||
      (state.foundingPreparation && state.foundingPreparation.status !== "ready")
    )
      return;
    if (!state.narrative) {
      await ports.mutate((world) => {
        ensureNarrative(world, now.toISOString());
      });
      state = await ports.read();
    }
    if (!eventAttemptAvailable(state, activityDate(state, now), now.getTime())) return;
    let social: VillageState | null = null;
    try {
      social = await ports.socialSnapshot();
    } catch {
      /* Unrelated social failure cannot disable the world lane. */
    }
    const arrangement = social ? arrangementActivityAt(social, now) : null;
    if (arrangement && arrangement > now.getTime()) return;
    if (arrangement) {
      try {
        if (await ports.resident(now, true)) return;
      } catch {
        /* World remains independent. */
      }
    }
    if (preferredActivityLane(state) === "resident") {
      try {
        if (await ports.resident(now)) return;
      } catch {
        /* World remains independent. */
      }
    }
    state = await ports.read();
    const sourceId =
      "world:" + backgroundRevision([state.seed, state.eventAttempts?.lastAttemptAt ?? "", now.toISOString()]);
    const grant = admitNarrative(state, now.toISOString(), sourceId);
    if (grant && (await queueWorld(state, grant, activityDate(state, now)))) return;
    if (preferredActivityLane(state) !== "resident") {
      try {
        await ports.resident(now);
      } catch {
        /* Resident recovery retains its saved jobs. */
      }
    }
  }
  function reconcile(now: Date): Promise<void> {
    return (reconciling ??= reconcileAt(now).finally(() => {
      reconciling = null;
    }));
  }
  async function queueReturnOpportunity(
    batchId: string,
    opportunity: ResidentPlanningOpportunity,
    capture: ReturnCatchupCapture,
  ): Promise<void> {
    const live = await ports.read();
    const batch = live.returnCatchup?.batch;
    if (
      batch?.id !== batchId ||
      batch.status !== "running" ||
      !batch.opportunities?.some((row) => JSON.stringify(row) === JSON.stringify(opportunity)) ||
      !live.returnCatchup?.capture ||
      returnCaptureRevision(live.returnCatchup.capture, ports.relationshipIdentity) !==
        returnCaptureRevision(capture, ports.relationshipIdentity)
    )
      throw new ReturnOpportunityUnavailable("The historical world opportunity changed.");
    const historical = cloneVillageContext({ ...live, ...capture.world });
    const grant = admitNarrative(historical, opportunity.startsAt, "world:" + batchId + ":" + opportunity.id, "world", {
      venueId: opportunity.venueId,
      zoneId: opportunity.zoneId!,
    });
    if (!grant)
      throw new ReturnOpportunityUnavailable("No adopted environmental target exists in the captured interval.");
    grant.reviewBasis = live.eventAttempts?.lastAttemptAt ?? "";
    try {
      assertNarrativeAdmission(live, grant);
    } catch {
      throw new ReturnOpportunityUnavailable("The historical environmental target changed.");
    }
    await queueWorld(live, grant, batch.budgetDate ?? activityDate(live, ports.now()), batchId, opportunity, capture);
  }
  const handler: Handler = {
    authority: "raw",
    async generate(input) {
      const proposed = await ask(WORLD_DEVELOPMENT_INSTRUCTION, input.grant, 1800);
      if (proposed.quiet === true && Object.keys(proposed).length === 1) return { quiet: true };
      if (proposed.quiet !== false || !proposed.proposal)
        throw new Error("Invalid world proposal. Its response is retained.");
      const result = await ask(
        WORLD_DEVELOPMENT_REVIEW,
        { admission: input.grant, savedProposal: proposed.proposal },
        3000,
      );
      if (result.consistent !== true)
        throw new Error(String(result.reason || "The world proposal was not supported.").slice(0, 300));
      return { quiet: false, development: readNarrativeDevelopment(result.development, input.grant) };
    },
    valid(state, input) {
      if (input.version !== 1 || state.backgroundPace === "off") return false;
      if (state.narrative?.receipts.some((row) => row.id === input.grant.id && row.rejected)) return false;
      const grant = input.grant as NarrativeAdmission;
      const claimed = state.narrative?.claims?.some((row) => row.id === grant.id);
      try {
        assertNarrativeAdmission(state, grant);
      } catch (error) {
        if (claimed) throw error;
        return false;
      }
      if (
        input.catchupBatchId &&
        (state.returnCatchup?.batch?.id !== input.catchupBatchId ||
          state.returnCatchup.batch.until !== input.returnUntil ||
          returnCaptureRevision(state.returnCatchup.capture, ports.relationshipIdentity) !== input.captureRevision)
      )
        return false;
      const claim = state.narrative?.claims?.find((row) => row.id === grant.id);
      return !!claim || grant.reviewBasis === (state.eventAttempts?.lastAttemptAt ?? "");
    },
    reserve(state, input, attemptId) {
      const grant = input.grant as NarrativeAdmission;
      assertNarrativeAdmission(state, grant);
      const narrative = state.narrative!;
      if (narrative.claims?.some((row) => row.id === grant.id)) return;
      if (
        grant.reviewBasis !== (state.eventAttempts?.lastAttemptAt ?? "") ||
        narrative.claims?.some((row) =>
          grant.targets.some((target) => target.venueId === row.venueId && target.zoneId === row.zoneId),
        )
      )
        throw conflict("This autonomous opportunity was already claimed.");
      narrative.claims ??= [];
      const target = grant.targets[0]!;
      narrative.claims.push({
        id: grant.id,
        attemptId,
        venueId: target.venueId,
        zoneId: target.zoneId,
        fingerprint: backgroundRevision(grant),
        ...(input.catchupBatchId ? { batchId: input.catchupBatchId } : {}),
      });
    },
    apply(state, input, result) {
      const receipt = !result.quiet ? applyNarrativeDevelopment(state, input.grant, result.development) : null;
      if (state.narrative?.claims)
        state.narrative.claims = state.narrative.claims.filter((row) => row.id !== input.grant.id);
      if (input.catchupBatchId) {
        const tracking = state.returnCatchup!;
        const record = tracking.batch?.records?.find((row) => row.opportunityId === input.opportunity.id);
        if (!record || !tracking.capture || tracking.batch?.id !== input.catchupBatchId)
          throw conflict("World catch-up changed.");
        record.status = "settled";
        record.outcome = structuredClone(result);
        if (receipt && tracking.capture.world.narrative) {
          mergeNarrativeAfter(tracking.capture.world.narrative, receipt.after);
          tracking.capture.world.narrative.receipts.push(structuredClone(receipt));
          tracking.capture.world.narrative.revision++;
        }
        tracking.capture.world.eventAttempts = structuredClone(state.eventAttempts);
        for (const target of (input.grant as NarrativeAdmission).targets) {
          const before = tracking.capture.world.venues
            .find((row) => row.id === target.venueId)
            ?.zones?.find((row) => row.id === target.zoneId);
          const after = state.venues
            .find((row) => row.id === target.venueId)
            ?.zones?.find((row) => row.id === target.zoneId);
          if (before && after) {
            before.description = after.description;
            before.state = structuredClone(after.state);
          }
        }
      }
    },
    afterApply: async (input) => {
      if (input.catchupBatchId) await ports.afterCatchup();
    },
    afterFailure: async (input) => {
      if (input.catchupBatchId) await ports.afterCatchup();
    },
  };
  return { reconcile, queueReturnOpportunity, handler };
}
