import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { fail } from "../../adapters/http/route-support.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { badRequest } from "../../domain/rules/errors.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { agendaDateKey } from "../../domain/rules/agenda-week.js";
import { backgroundSlotId } from "../../domain/rules/background-revision.js";
import { AGENDA_WEEK_DAYS, agendaCoverage, shiftAgendaDate } from "../../domain/rules/weekly-agenda.js";
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
import type { AgendaCatchupView } from "../../../shared/contracts/village.js";

export function registerBackgroundRoutes(engine: FastifyInstance) {
  const app = engine;
  async function agendaView(): Promise<AgendaCatchupView | null> {
    const { residents, ready, prepared, start } = agendaCoverage(await readVillageSnapshot(), villageNow());
    if (prepared.length === residents.length) return null;
    const jobs = await backgroundWorkSummaries();
    const retryable = ["failed", "interrupted", "paused"];
    const failed = residents.flatMap((resident) => {
      if (prepared.includes(resident)) return [];
      const initial = resident.agenda?.personalizationPending || resident.agenda?.personalizationFailure;
      const job = jobs.find(
        (candidate) =>
          retryable.includes(candidate.status) &&
          (candidate.id === backgroundSlotId({ kind: "weekly-agenda", subjectId: resident.incarnation }) ||
            (initial && candidate.kind === "agenda" && candidate.subjectId === resident.characterId)),
      );
      return job ? [{ resident, job }] : [];
    })[0];
    const legacy = !failed ? await backgroundJobSnapshot("weekly-agenda", "village") : null;
    const input = asRecord(legacy?.input);
    const startKey = agendaDateKey(start);
    const endKey = agendaDateKey(shiftAgendaDate(start, AGENDA_WEEK_DAYS - 1));
    const batchFailure =
      legacy &&
      retryable.includes(legacy.status) &&
      typeof input.start === "string" &&
      typeof input.end === "string" &&
      input.start <= endKey &&
      startKey <= input.end
        ? jobs.find((job) => job.id === backgroundSlotId({ kind: "weekly-agenda", subjectId: "village" }))
        : undefined;
    const job = failed?.job ?? batchFailure;
    const reason = job?.failure;
    return {
      expired: ready.length !== residents.length,
      completed: prepared.length,
      total: residents.length,
      ...(job
        ? {
            failure: {
              name: failed?.resident.cardSnapshot.name ?? "",
              message:
                reason?.cause === "empty_output"
                  ? "The planner returned an empty reply."
                  : reason?.cause === "output_limit"
                    ? "The planner’s reply was cut short."
                    : reason?.message.startsWith("Not enough variety") ||
                        reason?.message.startsWith("The model returned too few")
                      ? reason.message
                      : reason?.cause === "insufficient_budget"
                        ? "The System connection needs more room for the character card and its Agenda."
                        : "The Agenda couldn’t be prepared.",
              id: job.id,
              expectedAttempt: job.attempt,
              expectedInstanceId: job.instanceId,
            },
          }
        : {}),
    };
  }
  async function returnView() {
    const state = await readVillageSnapshot({ memories: true });
    const batch = state.returnCatchup?.batch;
    if (!batch) return null;
    const current = batch.records?.find((row) => !["settled", "rejected"].includes(row.status));
    const opportunity = batch.opportunities?.find((row) => row.id === current?.opportunityId);
    const job =
      batch.status === "failed" && opportunity
        ? await backgroundJobSnapshot(
            opportunity.kind === "world" ? "world-development" : "resident-planning",
            returnCatchupSubject(batch.id, opportunity.id),
          )
        : null;
    return {
      id: batch.id,
      status: batch.status,
      from: batch.from,
      until: batch.until,
      completed: batch.records?.filter((row) => ["settled", "rejected"].includes(row.status)).length ?? 0,
      total: batch.records?.length ?? 0,
      issue: batch.status === "failed" ? (current ? (job ? "generation" : "preparation") : "authority") : null,
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
          return reconcileVillage({ returning: true });
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
      return { batch: view, agenda: await agendaView() };
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
      await reconcileVillage();
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
