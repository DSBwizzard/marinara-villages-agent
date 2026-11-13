import type { VillageState } from "../../domain/models/world.js";
import { ReturnOpportunityUnavailable, returnCatchupSubject } from "../../domain/rules/return-catchup-authority.js";
import {
  appendReturnRelationshipRefresh,
  discoverReturnBatch,
  recordReturnVisibility,
} from "../../domain/rules/return-catchup-state.js";
import { conflict } from "../../domain/rules/errors.js";
import { backgroundSlotId } from "../../domain/rules/background-revision.js";
import { activityDate } from "../../domain/rules/event-attempts.js";
import { departureContinuityAvailable } from "../../domain/rules/return-catchup-capture.js";

type Ports = {
  readAuthority?: () => Promise<VillageState>;
  mutateAuthority?: (update: (state: VillageState) => void) => Promise<void>;
  readSnapshot: typeof import("../world/village-store.js").readVillageSnapshot;
  mutate: typeof import("../world/village-store.js").mutateVillageState;
  queue: (
    batchId: string,
    opportunity: import("../../domain/models/world.js").ResidentPlanningOpportunity,
    capture: import("../../domain/models/world.js").ReturnCatchupCapture,
  ) => Promise<void>;
  job: typeof import("../../jobs/background-work.js").backgroundJobSnapshot;
  retryJob: typeof import("../../jobs/background-work.js").retryBackgroundJob;
  cancel: typeof import("../../jobs/background-work.js").cancelReturnCatchup;
  hasPresence: () => boolean;
  now: () => Date;
  activityChanged?: () => void;
};

/** One durable batch uses the existing background worker and its atomic acceptance. */
export function createReturnCatchup(ports: Ports) {
  const mutate = ports.mutateAuthority ?? ports.mutate;
  const readAuthority = ports.readAuthority ?? (() => ports.readSnapshot({ memories: true }));
  let tail: Promise<unknown> = Promise.resolve();
  let advancing = false;
  function serial<T>(work: () => Promise<T>): Promise<T> {
    const result = tail.then(work, work);
    tail = result.catch(() => {});
    return result;
  }
  async function prepare(now: Date, id: string): Promise<void> {
    await mutate((state) => discoverReturnBatch(state, now, id));
  }
  async function recordVisible(now: Date, visible = true): Promise<void> {
    await mutate((state) => {
      if (ports.hasPresence() === visible) recordReturnVisibility(state, now);
    });
  }
  async function update(batchId: string, change: (state: VillageState) => void): Promise<void> {
    await mutate((state) => {
      if (state.returnCatchup?.batch?.id !== batchId) throw conflict("Village catch-up changed. Refresh its status.");
      if (["completed", "cancelled"].includes(state.returnCatchup.batch.status)) return;
      change(state);
    });
    ports.activityChanged?.();
  }
  function advance(): Promise<void> {
    if (advancing) return Promise.resolve();
    advancing = true;
    return serial(async () => {
      for (let iteration = 0; iteration < 16; iteration++) {
        let state = await readAuthority();
        const tracking = state.returnCatchup,
          batch = tracking?.batch,
          capture = tracking?.capture;
        if (!batch || !capture || !["queued", "running", "failed"].includes(batch.status)) return;
        if (batch.status === "failed") {
          const record = batch.records?.find((row) => !["settled", "rejected"].includes(row.status));
          const opportunity = batch.opportunities?.find((row) => row.id === record?.opportunityId);
          if (
            !ports.hasPresence() ||
            !record ||
            !opportunity ||
            record.automaticRetryUsed ||
            (await ports.job(
              opportunity.kind === "world" ? "world-development" : "resident-planning",
              returnCatchupSubject(batch.id, opportunity.id),
            ))
          )
            return;
          await update(batch.id, (world) => {
            const row = world.returnCatchup!.batch!.records!.find((item) => item.opportunityId === opportunity.id)!;
            row.automaticRetryUsed = true;
            row.status = "queued";
            row.error = undefined;
            world.returnCatchup!.batch!.status = "running";
          });
          continue;
        }
        if (batch.status === "queued") {
          await update(batch.id, (world) => {
            world.returnCatchup!.batch!.status = "running";
          });
          continue;
        }
        const independent = batch.opportunities?.some((row) => row.kind === "world");
        const relationship = batch.opportunities?.find((row) => row.kind === "relationship");
        if (!independent && ports.readAuthority) state = await ports.readSnapshot({ memories: true });
        const record = batch.records?.find((row) => !["settled", "rejected", "held"].includes(row.status));
        if (!record || record.opportunityId === relationship?.id) {
          const held = batch.records?.find((row) => row.status === "held");
          if (held) {
            await update(batch.id, (world) => {
              world.returnCatchup!.batch!.status = "failed";
            });
            return;
          }
        }
        if (!record) {
          let appended = false;
          await update(batch.id, (world) => {
            appended = false;
            const active = world.returnCatchup!.batch!;
            if (active.records?.some((row) => row.status !== "settled" && row.status !== "rejected")) return;
            appended = appendReturnRelationshipRefresh(world, active);
            if (appended) return;
            if (
              !active.opportunities?.some((row) => row.kind === "world" || row.kind === "relationship") &&
              (!world.returnCatchup?.capture || !departureContinuityAvailable(world.returnCatchup.capture, world))
            ) {
              world.returnCatchup!.batch!.reason = "Resident continuity changed before the absence could be verified.";
              world.returnCatchup!.batch!.status = "failed";
              return;
            }
            world.returnCatchup!.batch!.status = "completed";
            if (!ports.hasPresence()) delete world.returnCatchup!.capture;
          });
          if (appended) continue;
          if (ports.hasPresence()) await recordVisible(ports.now());
          return;
        }
        const opportunity = batch.opportunities?.find((row) => row.id === record.opportunityId);
        if (!opportunity) throw conflict("The saved catch-up opportunity is missing.");
        if (!ports.hasPresence()) return;
        const subject = returnCatchupSubject(batch.id, opportunity.id);
        const job = await ports.job(opportunity.kind === "world" ? "world-development" : "resident-planning", subject);
        if (
          activityDate(state, ports.now()) !== batch.budgetDate &&
          !state.eventAttempts?.attempts.some((row) => row.id === job?.id && row.batchId === batch.id) &&
          !job?.requests &&
          !job?.attemptHistory?.some((attempt) => attempt.requests > 0) &&
          !job?.steps?.length
        ) {
          await update(batch.id, (world) => {
            const row = world.returnCatchup!.batch!.records!.find((item) => item.opportunityId === opportunity.id)!;
            row.status = "rejected";
            row.error = "The catch-up allowance date ended before this opportunity started.";
          });
          continue;
        }
        if (record.status === "queued" && job) {
          if (["queued", "running", "paused"].includes(job.status)) return;
          if (job.status === "failed" || job.status === "interrupted") {
            if (independent) {
              await update(batch.id, (world) => {
                const row = world.returnCatchup!.batch!.records!.find((item) => item.opportunityId === opportunity.id)!;
                row.status = "held";
                row.heldStage = "queued";
                row.error = job.error;
              });
              continue;
            }
            await update(batch.id, (world) => {
              world.returnCatchup!.batch!.status = "failed";
              world.returnCatchup!.batch!.records!.find((row) => row.opportunityId === opportunity.id)!.error =
                job.error;
            });
            return;
          }
          if (job.status === "completed") throw conflict("The saved catch-up result needs recovery.");
          await update(batch.id, (world) => {
            const row = world.returnCatchup!.batch!.records!.find((item) => item.opportunityId === opportunity.id)!;
            row.status = "rejected";
            row.error = job.error || "The opportunity is no longer valid.";
          });
          continue;
        }
        if (record.status === "pending")
          await update(batch.id, (world) => {
            world.returnCatchup!.batch!.records!.find((row) => row.opportunityId === opportunity.id)!.status = "queued";
          });
        try {
          await ports.queue(batch.id, opportunity, capture);
          return;
        } catch (error) {
          if (independent && opportunity.kind !== "world" && !(error instanceof ReturnOpportunityUnavailable)) {
            await update(batch.id, (world) => {
              const row = world.returnCatchup!.batch!.records!.find((item) => item.opportunityId === opportunity.id)!;
              row.status = "held";
              row.heldStage = "queued";
              row.error = String(error).slice(0, 300);
            });
            continue;
          }
          await update(batch.id, (world) => {
            const row = world.returnCatchup!.batch!.records!.find((item) => item.opportunityId === opportunity.id)!;
            row.error = (error instanceof Error ? error.message : String(error)).slice(0, 300);
            if (error instanceof ReturnOpportunityUnavailable) row.status = "rejected";
            else world.returnCatchup!.batch!.status = "failed";
          });
        }
      }
      throw new Error("Village catch-up did not settle within its bounded work limit.");
    })
      .catch(async (error: unknown) => {
        const state = await readAuthority();
        const batch = state.returnCatchup?.batch;
        if (!batch || !["queued", "running"].includes(batch.status)) throw error;
        await update(batch.id, (world) => {
          const active = world.returnCatchup!.batch!;
          const record = active.records?.find((row) => !["settled", "rejected"].includes(row.status));
          active.status = "failed";
          if (record) record.error = (error instanceof Error ? error.message : String(error)).slice(0, 300);
        });
      })
      .finally(() => {
        advancing = false;
      });
  }
  async function retry(batchId: string, actionId: string): Promise<void> {
    if (advancing) throw conflict("Catch-up is updating. Try again in a moment.");
    advancing = true;
    try {
      const state = await readAuthority();
      const batch = state.returnCatchup?.batch;
      if (!batch || batch.id !== batchId) throw conflict("Village catch-up changed. Refresh its status.");
      const record = batch.records?.find((row) => !["settled", "rejected"].includes(row.status));
      if (!record) throw conflict("There is no unfinished catch-up work.");
      if (batch.status !== "failed") throw conflict("Catch-up does not need a retry.");
      const opportunity = batch.opportunities?.find((row) => row.id === record.opportunityId);
      const kind = opportunity?.kind === "world" ? "world-development" : "resident-planning";
      const subjectId = returnCatchupSubject(batch.id, record.opportunityId);
      const job = await ports.job(kind, subjectId);
      await update(batch.id, (world) => {
        world.returnCatchup!.batch!.status = "running";
        if (record.status === "held")
          world.returnCatchup!.batch!.records!.find((row) => row.opportunityId === record.opportunityId)!.status =
            "queued";
      });
      try {
        if (job && ["failed", "interrupted", "paused"].includes(job.status))
          await ports.retryJob(backgroundSlotId({ kind, subjectId }), job.attempt, actionId, job.instanceId);
        // With no saved job, the next poll will admit the original opportunity.
      } catch (error) {
        await update(batch.id, (world) => {
          world.returnCatchup!.batch!.status = "failed";
        });
        throw error;
      }
    } finally {
      advancing = false;
    }
  }
  async function continueToVillage(batchId: string): Promise<void> {
    await ports.cancel(batchId);
    if (ports.hasPresence()) await recordVisible(ports.now());
    ports.activityChanged?.();
  }
  return { prepare, recordVisible, advance, retry, continueToVillage };
}
