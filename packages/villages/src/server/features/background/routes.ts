import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { fail } from "../../adapters/http/route-support.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { badRequest } from "../../domain/rules/errors.js";
import { returnCatchupHasCommittedEffects } from "../../domain/rules/return-catchup-recovery.js";
import {
  backgroundJobSnapshot,
  backgroundWorkSummaries,
  retryBackgroundJob,
  villageBackgroundPresence,
} from "../../jobs/background-work.js";
import { returnCatchupSubject } from "../../domain/rules/return-catchup-authority.js";
import { buildVillageSnapshot } from "../world/snapshot.js";
import { reconcileVillage } from "../world/village.js";
import {
  advanceReturnCatchup,
  continueReturnCatchup,
  prepareReturnCatchup,
  recordReturnVisibility,
  retryReturnCatchup,
} from "./return-catchup.js";
import { readVillageSnapshot } from "../world/village-store.js";

export function registerBackgroundRoutes(engine: FastifyInstance) {
  const app = engine;
  async function returnView() {
    const state = await readVillageSnapshot({ memories: true });
    const batch = state.returnCatchup?.batch;
    if (!batch) return null;
    const current = batch.records?.find((row) => !["settled", "rejected"].includes(row.status));
    const source = state.socialOutbox?.find((row) => row.id === current?.opportunityId + ":social");
    return {
      id: batch.id,
      status: batch.status,
      from: batch.from,
      until: batch.until,
      completed: batch.records?.filter((row) => ["settled", "rejected"].includes(row.status)).length ?? 0,
      total: batch.records?.length ?? 0,
      settlementRequired: returnCatchupHasCommittedEffects(state, batch.id),
      issue:
        batch.status === "failed"
          ? current
            ? "generation"
            : "authority"
          : batch.status === "recovering"
            ? source?.reinterpretRequired
              ? "interpretation"
              : "settlement"
            : null,
    };
  }
  app.post<{ Body: { sessionId?: unknown; visible?: unknown } }>("/background/presence", async (request, reply) => {
    try {
      if (typeof request.body?.sessionId !== "string" || typeof request.body.visible !== "boolean")
        throw badRequest("Choose a browser session and visibility.");
      // Catch up before admitting recurring work. An old paused story must not spend on a missed day.
      const snapshot = await villageBackgroundPresence(request.body.sessionId, request.body.visible, {
        beforeResume: async () => {
          await prepareReturnCatchup(villageNow(), randomUUID());
          return reconcileVillage();
        },
        onVisible: () => recordReturnVisibility(villageNow()),
        onHidden: () => recordReturnVisibility(villageNow(), false),
      });
      return {
        status: "ready",
        snapshot: snapshot ? { ...snapshot, backgroundWork: await backgroundWorkSummaries() } : null,
      };
    } catch (error) {
      return fail(reply, error, "updating village presence");
    }
  });
  app.get("/background/catchup", async (_request, reply) => {
    try {
      const view = await returnView();
      await advanceReturnCatchup();
      return { batch: view };
    } catch (error) {
      return fail(reply, error, "checking Village catch-up");
    }
  });
  app.get("/debug/return-catchup", async (_request, reply) => {
    try {
      const tracking = (await readVillageSnapshot()).returnCatchup;
      const batch = tracking?.batch;
      if (!batch) return { batch: null, history: [] };
      const withJobs = async (period: typeof batch) => ({
        ...period,
        jobs: await Promise.all(
          (period.opportunities ?? []).map(async (opportunity) => ({
            opportunityId: opportunity.id,
            activity: await backgroundJobSnapshot(
              opportunity.kind === "world" ? "world-development" : "resident-planning",
              returnCatchupSubject(period.id, opportunity.id),
            ),
            interpretation: await backgroundJobSnapshot("social-recovery", opportunity.id + ":social"),
          })),
        ),
      });
      const current = await withJobs(batch);
      const history = await Promise.all((tracking.history ?? []).map(withJobs));
      return { ...current, history };
    } catch (error) {
      return fail(reply, error, "inspecting Village catch-up");
    }
  });
  app.post<{ Body: { batchId?: unknown; actionId?: unknown } }>("/background/catchup/retry", async (request, reply) => {
    try {
      if (typeof request.body?.batchId !== "string" || typeof request.body.actionId !== "string")
        throw badRequest("Choose catch-up work to retry.");
      const view = await returnView();
      await retryReturnCatchup(request.body.batchId, request.body.actionId);
      return { batch: view };
    } catch (error) {
      return fail(reply, error, "retrying Village catch-up");
    }
  });
  app.post<{ Body: { batchId?: unknown } }>("/background/catchup/continue", async (request, reply) => {
    try {
      if (typeof request.body?.batchId !== "string") throw badRequest("Choose a Village catch-up.");
      await continueReturnCatchup(request.body.batchId);
      return { batch: await returnView() };
    } catch (error) {
      return fail(reply, error, "continuing to the Village");
    }
  });
  app.post<{ Body: { id?: unknown; expectedAttempt?: unknown; actionId?: unknown; expectedInstanceId?: unknown } }>(
    "/background/retry",
    async (request, reply) => {
      try {
        if (
          typeof request.body?.id !== "string" ||
          typeof request.body.actionId !== "string" ||
          typeof request.body.expectedInstanceId !== "string" ||
          !Number.isInteger(request.body.expectedAttempt)
        )
          throw badRequest("Choose a background job to retry.");
        const job = (await backgroundWorkSummaries()).find((row) => row.id === request.body!.id);
        if (job?.kind === "personal-mail") throw badRequest("Retry letter processing from the Mailbox.");
        await retryBackgroundJob(
          request.body.id,
          request.body.expectedAttempt as number,
          request.body.actionId,
          request.body.expectedInstanceId,
        );
        return await buildVillageSnapshot();
      } catch (error) {
        return fail(reply, error, "retrying village background work");
      }
    },
  );
}
