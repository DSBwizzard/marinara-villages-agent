import type { CapabilityDocumentStore, CapabilityRuntimeLogger } from "@marinara-engine/shared";
import { randomUUID } from "node:crypto";
import { ZonedDate } from "../../shared/helpers/zoned-date.js";
import { returnCatchupHasCommittedEffects } from "../domain/rules/return-catchup-recovery.js";
import { VILLAGES_PACKAGE_ID } from "../adapters/engine/runtime-host.js";
import { retainLateProviderResponse } from "../adapters/models/provider-deadline.js";
import type { withUsagePurpose } from "../adapters/models/usage-ledger.js";
import type { measurePipeline } from "../adapters/observability/pipeline-metrics.js";
import type { runtimeDebug } from "../adapters/observability/runtime-debug.js";
import type { BackgroundContext } from "../adapters/operations/background-context-service.js";
import {
  backgroundResponseClaim,
  validateBackgroundJobRecord,
  backgroundResponseStore,
  nativeBackgroundJob,
} from "../adapters/storage/background-responses.js";
import {
  assertVillageClockWrite,
  clockAdministration,
  isVillageClockError,
  villageNow,
  withVillageClockWork,
} from "../adapters/time/clock-gate.js";
import type { BackgroundCompletion } from "../domain/models/background-completion-model.js";
import type {
  BackgroundInput,
  BackgroundKind,
  BackgroundStatus,
  BackgroundSummary,
  Handler,
  Job,
  Ticket,
} from "../domain/models/background-model.js";
import type { VillageState } from "../domain/models/world.js";
import { backgroundRevision } from "../domain/rules/background-revision.js";
import { asRecord } from "../domain/rules/coerce.js";
import { connectionFailureKind } from "../domain/rules/connection-failure.js";
import { badRequest, conflict } from "../domain/rules/errors.js";
import { reserveEventAttempt } from "../domain/rules/event-attempts.js";
import { agendaRequestCount, remainingRequests } from "../domain/rules/generation-budgets.js";
import { localDateKey } from "../domain/rules/resident-planning.js";
import { responseDiagnostics } from "../domain/rules/response-diagnostics.js";
import { VILLAGE_WEEKDAYS } from "../domain/rules/village-clock.js";
import { type WorkFailure, WorkFailureError } from "../domain/rules/work-failure.js";
import { backgroundRecoveryState, isBackgroundRecoveryRecord } from "../domain/rules/work-recovery.js";
import type { mutateVillageState, readVillageState } from "../features/world/village-store.js";
const KIND = "background-work";
const slotId = (work: Pick<BackgroundInput, "kind" | "subjectId">) =>
  "villages-background-" + backgroundRevision([work.kind, work.subjectId]);
const jobId = (work: BackgroundInput) => backgroundRevision([work.seed, work.kind, work.subjectId, work.revision]);
const activityDispatched = (job: Job) =>
  job.requests > 0 || job.attemptHistory?.some((attempt) => attempt.requests > 0) === true;
export function retireBackgroundResident(state: VillageState, characterId: string): void {
  for (const kind of ["agenda", "translation", "wish"] as const)
    delete state.backgroundReceipts[slotId({ kind, subjectId: characterId })];
}
export interface BackgroundWorkPorts {
  readVillageAuthority?: typeof import("../features/world/village-store.js").readVillageAuthority;
  mutateVillageAuthority?: (
    update: (state: VillageState) => void,
    options?: import("../domain/models/world-repository.js").VillageMemoryWrite,
  ) => Promise<void>;
  villagesDocuments(): CapabilityDocumentStore;
  villagesLogger(): CapabilityRuntimeLogger;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  withUsagePurpose: typeof withUsagePurpose;
  measurePipeline: typeof measurePipeline;
  runtimeDebug: typeof runtimeDebug;
  backgroundCalls: BackgroundContext["backgroundCalls"];
  handlers: Iterable<readonly [BackgroundKind, Handler]>;
  activityChanged?: () => void;
}
/** An application owns its handler registry, admission, recovery and provider queues. */
export function createBackgroundWork(ports: BackgroundWorkPorts) {
  const {
    villagesDocuments,
    villagesLogger,
    readVillageState,
    mutateVillageState,
    withUsagePurpose,
    measurePipeline,
    runtimeDebug,
    backgroundCalls,
  } = ports;
  const handlers = new Map<BackgroundKind, Handler>();
  class Paused extends Error {}
  class Obsolete extends Error {}
  function registerBackgroundHandler(kind: BackgroundKind, handler: Handler): void {
    handlers.set(kind, handler);
  }
  registerBackgroundHandler("translation", {
    generate: async () => {
      throw new Error("Schedule translation is retired.");
    },
    valid: () => false,
    apply: () => {},
  });
  for (const [kind, handler] of ports.handlers) registerBackgroundHandler(kind, handler);
  registerBackgroundHandler("story", {
    generate: async () => {
      throw new Obsolete("The former feed generator is retired.");
    },
    valid: () => false,
    apply: () => {},
  });
  let owner = randomUUID();
  let stopped = false;
  let recoveryReady: Promise<void> = Promise.resolve();
  let recoveryError = false;
  let presenceNow = () => performance.now();
  const reserving = new Map<string, Promise<void>>();
  const running = new Map<string, Promise<void>>();
  const relaunch = new Set<string>();
  const sessions = new Map<string, number>();
  const pendingPresence = new Map<string, symbol>();
  const pausedConnections = new Set<string>();
  const controllers = new Map<string, AbortController>();
  const superseded = new Set<string>();
  const tickets: Ticket[] = [];
  let dispatching = false;
  let catchupAdmission: Promise<unknown> = Promise.resolve();
  function withCatchupAdmission<T>(work: () => Promise<T>): Promise<T> {
    const result = catchupAdmission.then(work, work);
    catchupAdmission = result.catch(() => {});
    return result;
  }
  async function cancelReturnCatchup(batchId: string): Promise<void> {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(batchId)) throw badRequest("Choose a Village catch-up.");
    await withCatchupAdmission(async () => {
      const before = await (ports.readVillageAuthority ?? readVillageState)();
      const pendingSocial = before.socialOutbox?.some((entry) => !entry.processed && entry.catchupBatchId === batchId);
      const mutate = pendingSocial ? mutateVillageState : (ports.mutateVillageAuthority ?? mutateVillageState);
      await mutate((state) => {
        const batch = state.returnCatchup?.batch;
        if (!batch || batch.id !== batchId) throw conflict("Village catch-up changed. Refresh its status.");
        if (["completed", "cancelled"].includes(batch.status)) return;
        if (state.narrative?.claims)
          state.narrative.claims = state.narrative.claims.filter((row) => row.batchId !== batchId);
        const pending =
          state.socialOutbox?.filter((entry) => !entry.processed && entry.catchupBatchId === batchId) ?? [];
        if (returnCatchupHasCommittedEffects(state, batchId))
          throw conflict("Finish recovering the saved encounter before continuing.");
        if (pending.length) {
          const ids = new Set(pending.map((entry) => entry.id));
          state.socialOutbox = state.socialOutbox?.filter((entry) => !ids.has(entry.id));
        }
        for (const record of batch.records ?? []) {
          if (record.status === "settled" || record.status === "rejected") continue;
          record.status = "rejected";
          record.error = "Skipped when continuing to the village.";
        }
        batch.status = "cancelled";
        delete state.returnCatchup!.capture;
      });
    });
    ports.activityChanged?.();
  }
  async function readJob(id: string, documents = villagesDocuments()): Promise<Job | null> {
    const record = await documents.getById(VILLAGES_PACKAGE_ID, id);
    if (!record) return null;
    if (record.id !== id || record.packageId !== VILLAGES_PACKAGE_ID)
      throw new Error("Background job record identity changed.");
    validateBackgroundJobRecord(record);
    const job = await backgroundResponseStore(documents).decode(record.data);
    if (!job || !Array.isArray(job.steps) || typeof job.id !== "string" || !handlers.has(job.kind))
      throw new Error("The saved background job could not be read. Restore it from a backup.");
    return job;
  }
  function countResponse(job: Job, response: Awaited<ReturnType<BackgroundCompletion>>) {
    const tokens =
      response.usage?.totalTokens ??
      (response.usage?.promptTokens !== undefined && response.usage?.completionTokens !== undefined
        ? response.usage.promptTokens + response.usage.completionTokens
        : undefined);
    if (tokens !== undefined) job.tokens = (job.tokens ?? 0) + tokens;
    else job.usageComplete = false;
  }
  async function adoptLateResponses(id: string, original: Job, documents = villagesDocuments()): Promise<Job> {
    if (running.has(id)) return original;
    const responses = backgroundResponseStore(documents);
    let job = original;
    for (const [index, step] of original.steps.entries()) {
      if (step.status === "completed") continue;
      const saved = await responses.pending(original, index);
      if (!saved) continue;
      job = await changeJob(
        id,
        (current) => {
          if (
            !current ||
            current.id !== original.id ||
            current.attempt !== original.attempt ||
            current.steps[index]?.fingerprint !== step.fingerprint
          )
            throw new Obsolete("The saved response belongs to another background attempt.");
          if (current.steps[index].status !== "completed") {
            current.steps[index] = {
              ...current.steps[index],
              status: "completed",
              lateResponse: true,
              response: saved.response,
              responseRef: saved.ref,
              ...(current.steps[index].timing
                ? { timing: { ...current.steps[index].timing!, outcome: "complete" } }
                : {}),
            };
            countResponse(current, saved.response);
            current.failedStep = null;
          }
          return current;
        },
        documents,
      );
    }
    return job;
  }
  async function retainFoundingJob(job: Job, documents = villagesDocuments()): Promise<void> {
    const historyId = "villages-background-history-" + job.id + "-" + job.attempt;
    if (!(await documents.getById(VILLAGES_PACKAGE_ID, historyId)))
      await documents.create({
        id: historyId,
        packageId: VILLAGES_PACKAGE_ID,
        kind: "background-history",
        name: "Retained founding request",
        description: "Legacy request and billing evidence",
        data: nativeBackgroundJob(job),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  }
  async function retireLegacyFounding(job: Job): Promise<void> {
    const documents = villagesDocuments();
    const state = await (ports.readVillageAuthority ?? readVillageState)(),
      task = state.foundingPreparation?.tasks?.[job.subjectId]?.routine;
    if (state.seed !== job.seed || task?.status !== "completed" || task.receipt !== task.revision) return;
    await retainFoundingJob(job, documents);
    await changeJob(
      slotId(job),
      (current) => {
        if (!current || current.id !== job.id || current.attempt !== job.attempt || running.has(slotId(job)))
          throw conflict("Legacy founding job changed during recovery.");
        return {
          ...current,
          status: "obsolete",
          error: "Replaced by independent founding tasks.",
          steps: [],
          settings: {},
          input: null,
          result: undefined,
          hasResult: false,
        };
      },
      documents,
    );
  }
  async function backgroundStatus(
    kind: BackgroundKind,
    subjectId: string,
    expectedInputId?: string,
  ): Promise<BackgroundStatus | null> {
    const job = await readJob(slotId({ kind, subjectId }));
    if (expectedInputId !== undefined && asRecord(job?.input).id !== expectedInputId) return null;
    return job?.status ?? null;
  }
  async function changeJob(
    id: string,
    change: (job: Job | null) => Job,
    documents = villagesDocuments(),
  ): Promise<Job> {
    const responses = backgroundResponseStore(documents);
    for (let attempt = 0; attempt < 8; attempt++) {
      const record = await documents.getById(VILLAGES_PACKAGE_ID, id);
      if (record) {
        if (record.id !== id || record.packageId !== VILLAGES_PACKAGE_ID)
          throw new Error("Background job record identity changed.");
        validateBackgroundJobRecord(record);
      }
      await assertVillageClockWrite();
      const next = change(record ? await responses.decode(record.data) : null);
      const data = nativeBackgroundJob(next);
      if (record && JSON.stringify(data) === JSON.stringify(record.data)) return next;
      const stamp = new Date().toISOString();
      if (record) {
        const updated = await documents.update({
          id,
          packageId: VILLAGES_PACKAGE_ID,
          expectedRevision: record.revision,
          name: next.label,
          description: "Villages background generation checkpoint",
          data,
          updatedAt: stamp,
        });
        if (updated) return next;
      } else {
        try {
          await documents.create({
            id,
            packageId: VILLAGES_PACKAGE_ID,
            kind: KIND,
            name: next.label,
            description: "Villages background generation checkpoint",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
          return next;
        } catch (error) {
          if (!(await documents.getById(VILLAGES_PACKAGE_ID, id))) throw error;
        }
      }
    }
    throw new Error("Background work kept changing while it was saved.");
  }
  async function persistConnectionPause(
    connectionId: string,
    paused: boolean,
    assertActive = () => {},
    documents = villagesDocuments(),
  ): Promise<void> {
    const id = "villages-background-connection-" + backgroundRevision(connectionId);
    for (let attempt = 0; attempt < 8; attempt++) {
      const current = await documents.getById(VILLAGES_PACKAGE_ID, id);
      if (!paused) {
        if (!current || (await documents.remove(VILLAGES_PACKAGE_ID, id, current.revision))) return;
      } else if (current) {
        assertActive();
        return;
      } else {
        const stamp = new Date().toISOString();
        try {
          assertActive();
          const created = await documents.create({
            id,
            packageId: VILLAGES_PACKAGE_ID,
            kind: "background-connection",
            name: "Paused background connection",
            description: "Connection configuration rejected; explicit successful retry required",
            data: { version: 2, connectionId, kind: "configuration" },
            createdAt: stamp,
            updatedAt: stamp,
          });
          try {
            assertActive();
          } catch (error) {
            await documents.remove(VILLAGES_PACKAGE_ID, id, created.revision);
            throw error;
          }
          return;
        } catch (error) {
          assertActive();
          if (!(await documents.getById(VILLAGES_PACKAGE_ID, id))) throw error;
        }
      }
    }
    throw new Error("Connection recovery could not be saved.");
  }
  async function clearConnectionPause(connectionId: string, documents = villagesDocuments()): Promise<void> {
    await persistConnectionPause(connectionId, false, undefined, documents);
    const records = await documents.list(VILLAGES_PACKAGE_ID, KIND);
    for (const record of records) {
      const other = record.data as Job;
      if (other.connectionId === connectionId && other.connectionPaused)
        await changeJob(record.id, (current) => ({ ...current!, connectionPaused: false }), documents);
    }
    pausedConnections.delete(connectionId);
  }
  function fresh(work: BackgroundInput, previous?: Job | null): Job {
    return {
      ...structuredClone(work),
      id: jobId(work),
      status: work.legacyError ? "failed" : "queued",
      owner,
      attempt: (previous?.attempt ?? 0) + 1,
      connectionPaused: false,
      completedCount: 0,
      usageComplete: true,
      steps: [],
      settings: {},
      hasResult: false,
      requests: 0,
      tokens: null,
      error: work.legacyError ?? "",
      failedStep: null,
      retryActions: work.retryActionId ? [work.retryActionId] : [],
      retrying: !!work.retryActionId,
      connectionId: "",
      highWaterDate: work.automaticDate ?? (previous?.seed === work.seed ? previous.highWaterDate : ""),
    };
  }
  function hasVillagePresence(): boolean {
    const now = presenceNow();
    for (const [id, expiry] of sessions) if (expiry <= now) sessions.delete(id);
    return sessions.size > 0;
  }
  let resumingPresence: Promise<unknown> | null = null;
  async function villageBackgroundPresence<T = void>(
    sessionId: string,
    visible: boolean,
    options: {
      beforeResume?: () => Promise<T>;
      afterResume?: () => Promise<void>;
      onVisible?: () => Promise<void>;
      onHidden?: () => Promise<void>;
    } = {},
  ): Promise<T | undefined> {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(sessionId)) throw badRequest("Invalid browser session.");
    if (!visible) {
      hasVillagePresence(); // Expired leases cannot establish a late departure boundary.
      const wasVisible = sessions.delete(sessionId);
      pendingPresence.delete(sessionId);
      if (wasVisible && !hasVillagePresence()) await options.onHidden?.();
      if (wasVisible && !hasVillagePresence()) ports.activityChanged?.();
      return;
    }
    if (hasVillagePresence()) {
      // Live sessions already passed resume catch-up. The deadline scheduler
      // advances ongoing mechanics; a heartbeat only renews spending permission.
      pendingPresence.delete(sessionId);
      sessions.set(sessionId, presenceNow() + 90_000);
      await options.onVisible?.();
      await recoverBackgroundWork();
      await options.afterResume?.();
      return;
    }
    const token = Symbol();
    pendingPresence.set(sessionId, token);
    if (!resumingPresence) {
      const task: Promise<unknown> = Promise.resolve()
        .then(() => options.beforeResume?.())
        .finally(() => {
          if (resumingPresence === task) resumingPresence = null;
        });
      resumingPresence = task;
    }
    const advanced = (await resumingPresence) as T | undefined;
    // A hidden message can overtake a slow catch-up. Never restore that stale permission.
    if (pendingPresence.get(sessionId) !== token) return advanced;
    pendingPresence.delete(sessionId);
    sessions.set(sessionId, presenceNow() + 90_000);
    await options.onVisible?.();
    await recoverBackgroundWork();
    recoveryError = false;
    await options.afterResume?.();
    ports.activityChanged?.();
    return advanced;
  }
  function pump(): void {
    if (dispatching || stopped) return;
    const ticket = tickets.shift();
    if (!ticket) return;
    dispatching = true;
    void ticket.start().finally(() => {
      dispatching = false;
      // FIFO admission lets other jobs run between an agenda's weekdays.
      queueMicrotask(pump);
    });
  }
  function requestTurn<T>(start: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      tickets.push({
        start: async () => {
          try {
            await recoveryReady;
            if (recoveryError)
              throw new Paused("Background recovery could not be read. Open Villages or retry after storage recovers.");
            resolve(await start());
          } catch (error) {
            reject(error);
          }
        },
        reject,
      });
      pump();
    });
  }
  function catchupBatchId(job: Job): string | undefined {
    const input = asRecord(job.input);
    if (job.kind === "social-recovery") {
      const id = asRecord(input.entry).catchupBatchId;
      return typeof id === "string" && id ? id : undefined;
    }
    if (!["resident-planning", "world-development"].includes(job.kind)) return undefined;
    if (asRecord(input.context).catchup !== true) return undefined;
    if (typeof input.catchupBatchId !== "string" || !input.catchupBatchId)
      throw new Obsolete("Catch-up work has no batch identity.");
    return input.catchupBatchId;
  }
  function readForJob(job: Job): Promise<VillageState> {
    const options = {
      memories: !!catchupBatchId(job),
      wishes:
        job.kind === "resident-planning" || !!catchupBatchId(job)
          ? (true as const)
          : ["wish", "agenda"].includes(job.kind)
            ? [job.subjectId]
            : undefined,
    };
    if (handlers.get(job.kind)?.authority === "raw" && ports.readVillageAuthority)
      return ports.readVillageAuthority(options);
    return readVillageState(options);
  }
  function mutateForJob(job: Job, update: (state: VillageState) => void): Promise<unknown> {
    return handlers.get(job.kind)?.authority === "raw" && ports.mutateVillageAuthority
      ? ports.mutateVillageAuthority(update, { wishes: catchupBatchId(job) ? true : undefined })
      : mutateVillageState(update, {
          wishes: job.kind === "resident-planning" ? true : job.kind === "wish" ? [job.subjectId] : undefined,
        });
  }
  function checkCurrent(job: Job, state: VillageState): void {
    if (state.backgroundReceipts[slotId(job)] === job.id) return;
    if (job.kind === "world-development" && state.backgroundPace === "off")
      throw new Paused("Pace is Off. The admitted world source is preserved.");
    const batchId = catchupBatchId(job),
      batch = state.returnCatchup?.batch;
    const holding = batch && !["completed", "cancelled"].includes(batch.status);
    if (
      batchId &&
      (!holding ||
        batch.id !== batchId ||
        (batch.status !== "running" && !(job.kind === "social-recovery" && batch.status === "recovering")))
    )
      throw new Obsolete("This catch-up opportunity is no longer active.");
    if (holding && !batchId && (!job.finite || job.kind === "resident-planning"))
      throw new Paused("Waiting for Village catch-up.");
    if (
      superseded.has(job.id) ||
      state.seed !== job.seed ||
      !handlers.get(job.kind)!.valid(state, job.input, {
        activityAttemptId: job.id,
        ...(activityDispatched(job) && job.automaticDate ? { activityDate: job.automaticDate } : {}),
      })
    )
      throw new Obsolete("This work is no longer needed.");
  }
  function launch(id: string, documents = villagesDocuments()): void {
    if (stopped || running.has(id)) return;
    const logger = villagesLogger();
    const task = runJob(id, documents)
      .catch((error) => {
        logger.warn("[villages] background work could not be saved: %s", String(error));
      })
      .finally(() => {
        ports.activityChanged?.();
        if (running.get(id) === task) running.delete(id);
        if (relaunch.delete(id)) launch(id, documents);
      });
    running.set(id, task);
  }
  function queueBackgroundJob(work: BackgroundInput, documents = villagesDocuments()): Promise<void> {
    const id = slotId(work);
    const existing = reserving.get(id);
    if (existing) return existing.then(() => queueBackgroundJob(work, documents));
    // Reserve before the first read or write: all callers share one admission.
    const task = (async () => {
      if (stopped) {
        if (work.kind === "personal-mail")
          throw new Error("Letter processing is unavailable. Try again when Villages is running.");
        return;
      }
      const previous = await readJob(id, documents);
      if (
        previous &&
        previous.id !== jobId(work) &&
        asRecord(work.input).foundingContract === 1 &&
        asRecord(previous.input).foundingContract !== 1
      ) {
        await retainFoundingJob(previous, documents);
      }
      await changeJob(
        id,
        (previous) => {
          if (previous?.id === jobId(work)) {
            if (work.finite && !previous.finite) previous.finite = true;
            return previous;
          }
          if (work.expectedAttempt !== undefined && work.expectedAttempt !== (previous?.attempt ?? 0))
            throw conflict("Background work changed. Refresh before requesting more resident activity.");
          if (["resident-planning", "world-development"].includes(work.kind) && running.has(id) && previous)
            return previous;
          if (
            ["personal-mail", "social-recovery"].includes(work.kind) &&
            previous?.seed === work.seed &&
            ["queued", "running"].includes(previous.status)
          )
            return previous;
          if (
            ["story", "resident-planning", "world-development"].includes(work.kind) &&
            work.automaticDate &&
            previous?.seed === work.seed &&
            ["failed", "interrupted"].includes(previous.status)
          )
            return previous;
          if (
            work.automaticDate &&
            !["story", "resident-planning", "world-development"].includes(work.kind) &&
            previous?.seed === work.seed &&
            previous?.highWaterDate &&
            work.automaticDate <= previous.highWaterDate
          )
            return previous;
          if (running.has(id) && previous) {
            superseded.add(previous.id);
            previous.replacement = structuredClone(work);
            return previous;
          }
          return fresh(work, previous);
        },
        documents,
      );
      launch(id, documents);
    })().finally(() => reserving.delete(id));
    reserving.set(id, task);
    return task;
  }
  async function runJob(id: string, documents: CapabilityDocumentStore): Promise<void> {
    return withVillageClockWork(() =>
      measurePipeline("background work", { jobId: id }, () => runMeasuredJob(id, documents)),
    );
  }
  async function runMeasuredJob(id: string, documents: CapabilityDocumentStore): Promise<void> {
    const responses = backgroundResponseStore(documents);
    const updateJob = (update: Parameters<typeof changeJob>[1]) => changeJob(id, update, documents);
    let job = await readJob(id, documents);
    if (
      job &&
      (job.kind === "translation" ||
        (job.kind === "agenda" &&
          typeof asRecord(asRecord(job.input).context).name === "string" &&
          !asRecord(asRecord(job.input).context).card))
    ) {
      await updateJob((current) => ({
        ...current!,
        status: "obsolete",
        error: "Legacy schedule translation and detailed Agenda generation are retired.",
        replacement: undefined,
      }));
      return;
    }
    if (job?.kind === "story") {
      await retireStory(id, documents);
      return;
    }
    if (!job || stopped || ["failed", "interrupted", "completed", "obsolete"].includes(job.status)) return;
    const runOwner = owner;
    const recorded = await readForJob(job);
    if (recorded.backgroundReceipts[id] === job.id) {
      await updateJob((current) => ({
        ...current!,
        status: "completed",
        steps: [],
        optionalAttempts: {},
        settings: {},
        input: null,
        result: undefined,
        hasResult: false,
        error: "",
        failure: undefined,
        failedAt: undefined,
        partialResult: false,
      }));
      return;
    }
    if (
      job.owner !== runOwner &&
      (job.steps.some((step) => step.status === "running") ||
        Object.values(job.optionalAttempts ?? {}).some((attempt) => attempt.status === "dispatching"))
    ) {
      await updateJob((current) => ({
        ...current!,
        status: "interrupted",
        error: "Generation was interrupted. This request may already have incurred costs.",
        failure: {
          cause: "unknown_request",
          stage: "recovery",
          message: "Generation was interrupted. This request may already have incurred costs.",
        },
        owner: runOwner,
      }));
      return;
    }
    const controller = new AbortController();
    const runJobId = job.id;
    const runAttempt = job.attempt;
    controllers.set(id, controller);
    let cursor = 0;
    let lastIndex = -1;
    let invoked = false;
    let stage = "generation";
    let dispatched = false;
    const complete: BackgroundCompletion = async (model, messages, maxTokens, options) => {
      // Provider and token-limit changes do not invalidate already purchased responses.
      const fingerprint = backgroundRevision(messages);
      const sequential = cursor++;
      const named = options.checkpointId ? job!.steps.findIndex((step) => step.key === options.checkpointId) : -1;
      const legacy = options.checkpointId
        ? job!.steps.findIndex((step) => !step.key && step.fingerprint === fingerprint)
        : -1;
      const index = options.checkpointId ? (named >= 0 ? named : legacy >= 0 ? legacy : job!.steps.length) : sequential;
      lastIndex = index;
      const saved = job!.steps[index];
      if (saved?.status === "completed") {
        if (saved.fingerprint !== fingerprint)
          throw new Obsolete("The generation inputs changed; saved responses cannot be mixed.");
        runtimeDebug("background completion replay", { jobId: id, step: index, fingerprint });
        return saved.response!;
      }
      const queuedAt = Date.now(),
        queuedClock = performance.now();
      return requestTurn(async () => {
        const admittedAt = Date.now(),
          queueMs = Math.max(0, Math.round(performance.now() - queuedClock));
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        if ((!job!.finite || catchupBatchId(job!)) && !hasVillagePresence())
          throw new Paused("Waiting until Villages is visible.");
        if (pausedConnections.has(model.connectionId) && !job!.retrying) {
          job = await updateJob((current) => ({
            ...current!,
            connectionId: model.connectionId,
            connectionPaused: true,
          }));
          throw new Paused("This connection is paused. Retry an affected job to resume it.");
        }
        checkCurrent(job!, await readForJob(job!));
        if (
          ["resident-planning", "world-development"].includes(job!.kind) &&
          job!.automaticDate &&
          (!job!.retrying || catchupBatchId(job!))
        ) {
          if (!job!.retrying && job!.requests >= 2)
            throw new Error("Automatic resident activity may make at most two principal requests.");
          await mutateForJob(job!, (state) => {
            if (state.seed !== job!.seed) throw new Obsolete("Village identity changed.");
            const actual = new ZonedDate(
              villageNow().toISOString(),
              state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            );
            const reserved = state.eventAttempts?.attempts.some((row) => row.id === job!.id);
            if (!reserved && !activityDispatched(job!)) handlers.get(job!.kind)!.reserve?.(state, job!.input, job!.id);
            if (!reserved && !activityDispatched(job!) && localDateKey(actual) !== job!.automaticDate)
              throw new Obsolete("Automatic resident opportunity belongs to an earlier day.");
            // A later month's admission can prune the original ledger row. The
            // same saved job's purchased request remains proof, not a new review.
            if (reserved || !activityDispatched(job!))
              reserveEventAttempt(
                state,
                job!.id,
                job!.automaticDate!,
                villageNow().getTime(),
                catchupBatchId(job!),
                job!.kind === "world-development" ? "world" : "resident",
              );
          });
          ports.activityChanged?.();
        }
        job = await updateJob((current) => {
          if (current?.id !== job!.id || superseded.has(current.id)) throw new Obsolete("This job was replaced.");
          if (current.steps[index]?.status === "running") throw new Paused("This request is already reserved.");
          current.status = "running";
          current.owner = runOwner;
          current.connectionId = model.connectionId;
          current.steps[index] = { key: options.checkpointId, fingerprint, status: "running" };
          current.steps[index].responseClaim = backgroundResponseClaim(current, index);
          if (!catchupBatchId(job!)) current.requests++;
          return current;
        });
        if (!catchupBatchId(job!)) {
          invoked = true;
          dispatched = true;
        }
        const timing = {
          queuedAt: new Date(queuedAt).toISOString(),
          admittedAt: new Date(admittedAt).toISOString(),
          queueMs,
          requestedOutputTokens: maxTokens,
          ...(options.reasoningEffort ? { reasoningRequested: options.reasoningEffort } : {}),
          outcome: "pending" as const,
          firstResponseMs: null,
        };
        job = await updateJob((current) => {
          if (current?.id !== runJobId || current.attempt !== runAttempt || current.owner !== runOwner)
            throw new Obsolete("Request timing ownership changed.");
          current.steps[index]!.timing = timing;
          return current;
        });
        const assertActive = () => {
          if (stopped || owner !== runOwner || controller.signal.aborted)
            throw new Paused("Background generation stopped.");
          if (superseded.has(runJobId)) throw new Obsolete("This job was replaced.");
        };
        assertActive();
        const hostClock = performance.now();
        const hostTiming = { ...timing, hostStartedAt: new Date().toISOString() };
        let response: Awaited<ReturnType<BackgroundCompletion>>;
        try {
          const startRequest = () =>
            withUsagePurpose(options.usagePurpose ?? "background", () =>
              model.chatComplete(messages, {
                ...(typeof options.temperature === "number" ? { temperature: options.temperature } : {}),
                ...(options.reasoningEffort ? { reasoningEffort: options.reasoningEffort } : {}),
                ...(options.verbosity ? { verbosity: options.verbosity } : {}),
                ...(options.responseFormat ? { responseFormat: options.responseFormat } : {}),
                maxTokens,
                debugMode: false,
                signal: options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal,
              }),
            );
          const request = catchupBatchId(job!)
            ? (
                await withCatchupAdmission(async () => {
                  checkCurrent(job!, await readForJob(job!));
                  assertActive();
                  if (!hasVillagePresence()) throw new Paused("Waiting until Villages is visible.");
                  job = await updateJob((current) => {
                    if (current?.id !== runJobId || current.attempt !== runAttempt || current.owner !== runOwner)
                      throw new Obsolete("Request admission ownership changed.");
                    current.requests++;
                    return current;
                  });
                  if (
                    !hasVillagePresence() ||
                    stopped ||
                    owner !== runOwner ||
                    controller.signal.aborted ||
                    superseded.has(runJobId)
                  ) {
                    job = await updateJob((current) => {
                      if (current?.id !== runJobId || current.attempt !== runAttempt || current.owner !== runOwner)
                        throw new Obsolete("Request admission ownership changed.");
                      current.requests = Math.max(0, current.requests - 1);
                      if (current.steps[index]?.status === "running") current.steps.splice(index, 1);
                      return current;
                    });
                    assertActive();
                    throw new Paused("Waiting until Villages is visible.");
                  }
                  assertActive();
                  invoked = true;
                  dispatched = true;
                  return { pending: startRequest() };
                })
              ).pending
            : startRequest();
          response = await request;
        } catch (error) {
          if (error instanceof Paused || error instanceof Obsolete) throw error;
          const lateResponses = backgroundResponseStore(documents);
          const physicalJob = job!;
          retainLateProviderResponse(error, (value) =>
            lateResponses
              .publish(physicalJob, index, value as Awaited<ReturnType<BackgroundCompletion>>)
              .then(() => {}),
          );
          assertActive();
          const connectionIssue = connectionFailureKind(error, !!options.responseFormat);
          const pause = connectionIssue === "configuration";
          await updateJob((current) => {
            if (current?.id !== runJobId || current.attempt !== runAttempt || current.owner !== runOwner)
              throw new Obsolete("Request outcome ownership changed.");
            assertActive();
            current.connectionPaused = pause;
            current.usageComplete = false;
            current.steps[index]!.timing = {
              ...hostTiming,
              hostFinishedAt: new Date().toISOString(),
              hostMs: Math.max(0, Math.round(performance.now() - hostClock)),
              outcome: "unknown",
            };
            return current;
          });
          if (pause) {
            await persistConnectionPause(model.connectionId, true, assertActive, documents);
            assertActive();
            pausedConnections.add(model.connectionId);
          }
          throw new WorkFailureError({
            cause: "provider_exception",
            stage: "dispatch",
            connectionIssue,
            message:
              options.responseFormat &&
              /response[_ ]?format|json[_ ]?(?:object|mode|schema)/iu.test(String(error)) &&
              /unsupported|not support|invalid|unknown|not allowed|unrecognized/iu.test(String(error))
                ? "The selected connection rejected JSON mode. Choose a connection supporting JSON responses, then explicitly retry. No fallback request was made."
                : (error instanceof Error ? error.message : String(error)).slice(0, 300),
            requestedOutputTokens: maxTokens,
          });
        }
        stage = "response-storage";
        const savedResponse = await responses.publish(job!, index, response);
        if (owner !== runOwner || stopped) throw new Paused("Background generation stopped.");
        job = await updateJob((current) => {
          if (current?.id !== job!.id || current.owner !== runOwner) throw new Obsolete("This job was replaced.");
          current.steps[index] = {
            key: options.checkpointId,
            fingerprint,
            status: "completed",
            response: savedResponse.response,
            responseRef: savedResponse.ref,
            responseClaim: current.steps[index].responseClaim,
            timing: {
              ...hostTiming,
              hostFinishedAt: new Date().toISOString(),
              hostMs: Math.max(0, Math.round(performance.now() - hostClock)),
              outcome: "complete",
            },
            ...(options.responseFormat ? { responseDiagnostics: responseDiagnostics(model, response, maxTokens) } : {}),
          };
          countResponse(current, response);
          return current;
        });
        dispatched = false;
        stage = "generation";
        if (job!.retrying) {
          try {
            await clearConnectionPause(model.connectionId, documents);
          } catch {
            throw new Paused("The response is saved, but connection recovery could not be saved.");
          }
        }
        return response;
      });
    };
    complete.signal = controller.signal;
    complete.optionalCompletion = async <T>(
      fingerprint: string,
      work: (signal: AbortSignal) => Promise<T>,
    ): Promise<T | undefined> => {
      const assertOwner = () => {
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        if (superseded.has(job!.id)) throw new Obsolete("This job was replaced.");
        controller.signal.throwIfAborted();
      };
      assertOwner();
      const prior = job!.optionalAttempts?.[fingerprint];
      if (prior) return prior.status === "complete" ? (structuredClone(prior.result) as T) : undefined;
      // A purchased System checkpoint must replay with exactly the same pending batch.
      if (job!.steps.length) return undefined;
      return requestTurn(async () => {
        assertOwner();
        if ((!job!.finite || catchupBatchId(job!)) && !hasVillagePresence())
          throw new Paused("Waiting until Villages is visible.");
        const expectedOwner = job!.owner;
        checkCurrent(job!, await readForJob(job!));
        const allowance = Math.max(
          0,
          10_000 - Object.values(job!.optionalAttempts ?? {}).reduce((sum, attempt) => sum + attempt.elapsedMs, 0),
        );
        if (!allowance) return undefined;
        job = await updateJob((current) => {
          assertOwner();
          if (
            !current ||
            current.id !== runJobId ||
            current.attempt !== runAttempt ||
            current.owner !== expectedOwner ||
            (current.owner !== runOwner && current.status === "running")
          )
            throw new Obsolete("This job was replaced.");
          current.optionalAttempts ??= {};
          if (current.optionalAttempts[fingerprint]) throw new Paused("Optional request already reserved.");
          current.optionalAttempts[fingerprint] = { status: "dispatching", elapsedMs: allowance };
          current.owner = runOwner;
          current.status = "running";
          current.requests++;
          current.usageComplete = false;
          return current;
        });
        const started = performance.now();
        const timeout = new AbortController();
        const signal = AbortSignal.any([controller.signal, timeout.signal]);
        let onAbort: () => void = () => {};
        const timer = setTimeout(() => timeout.abort(), allowance);
        let result: T | undefined;
        let status: "complete" | "unknown" = "unknown";
        try {
          result = await Promise.race([
            work(signal),
            new Promise<never>((_resolve, reject) => {
              onAbort = () => reject(signal.reason);
              signal.addEventListener("abort", onAbort, { once: true });
              if (signal.aborted) onAbort();
            }),
          ]);
          assertOwner();
          status = "complete";
        } catch {
          assertOwner();
        } finally {
          clearTimeout(timer);
          signal.removeEventListener("abort", onAbort);
        }
        assertOwner();
        checkCurrent(job!, await readForJob(job!));
        // Persistence/ownership errors propagate: they never authorize a System request.
        job = await updateJob((current) => {
          assertOwner();
          if (
            !current ||
            current.id !== runJobId ||
            current.attempt !== runAttempt ||
            current.owner !== runOwner ||
            current.optionalAttempts?.[fingerprint]?.status !== "dispatching"
          )
            throw new Obsolete("Optional request ownership changed.");
          current.optionalAttempts[fingerprint] = {
            status,
            elapsedMs: Math.min(allowance, Math.ceil(performance.now() - started)),
            ...(status === "complete" ? { result: structuredClone(result) } : {}),
          };
          return current;
        });
        return result;
      });
    };
    complete.metadata = {
      id: job.id,
      kind: job.kind,
      attempt: job.attempt,
      cause: job.finite
        ? "Player-requested generation"
        : job.kind === "translation"
          ? "Deprecated translation: no new requests"
          : "Automatic: village time or resident agenda update",
    };
    complete.setting = async <T>(key: string, create: () => T | Promise<T>): Promise<T> => {
      const assertOwner = () => {
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        if (superseded.has(runJobId)) throw new Obsolete("This job was replaced.");
        controller.signal.throwIfAborted();
      };
      assertOwner();
      const expectedOwner = job!.owner;
      const value = key in (job!.settings ?? {}) ? job!.settings[key] : await create();
      assertOwner();
      job = await updateJob((current) => {
        assertOwner();
        if (
          !current ||
          current.id !== runJobId ||
          current.attempt !== runAttempt ||
          current.owner !== expectedOwner ||
          (current.owner !== runOwner && current.status === "running")
        )
          throw new Obsolete("This job was replaced.");
        current.settings ??= {};
        if (!(key in current.settings)) current.settings[key] = value;
        return current;
      });
      return job.settings[key] as T;
    };
    try {
      checkCurrent(job, await readForJob(job));
      if (!job.hasResult) {
        const result = await backgroundCalls.run(complete, () => handlers.get(job!.kind)!.generate(job!.input));
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        stage = "storage";
        job = await updateJob((current) => ({ ...current!, result, hasResult: true }));
      }
      if (job.retrying && pausedConnections.has(job.connectionId))
        await clearConnectionPause(job.connectionId, documents);
      stage = "application";
      let partialFailure: WorkFailure | undefined;
      await mutateForJob(job!, (state) => {
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        if (state.backgroundReceipts[id] === job!.id) return;
        checkCurrent(job!, state);
        partialFailure =
          handlers.get(job!.kind)!.apply(state, job!.input, job!.result, { retrying: job!.retrying }) || undefined;
        if (!partialFailure) state.backgroundReceipts[id] = job!.id;
      });
      if (partialFailure) {
        job = await updateJob((current) => ({
          ...current!,
          partialResult: true,
          failedStep: lastIndex >= 0 ? lastIndex : null,
        }));
        throw new WorkFailureError(partialFailure);
      }
      stage = "acknowledgement";
      const appliedInput = job.input;
      const appliedFinite = job.finite;
      const wasRetry = job.retrying;
      job = await updateJob((current) => ({
        ...current!,
        completedCount: current!.steps.length,
        status: "completed",
        error: "",
        failure: undefined,
        failedAt: undefined,
        partialResult: false,
        steps: [],
        optionalAttempts: {},
        settings: {},
        input: null,
        result: undefined,
        hasResult: false,
        retrying: false,
      }));
      if (wasRetry) await recoverBackgroundWork().catch(() => {});
      await handlers
        .get(job.kind)!
        .afterApply?.(appliedInput, appliedFinite)
        .catch((error) => villagesLogger().warn("[villages] could not queue follow-up work: %s", String(error)));
    } catch (error) {
      if (owner !== runOwner || stopped) return;
      if (isVillageClockError(error)) {
        await clockAdministration(() =>
          updateJob((current) => {
            if (!current) throw new Obsolete("This job was removed.");
            if (
              current.id !== runJobId ||
              current.attempt !== runAttempt ||
              (current.owner !== job!.owner && current.owner !== runOwner) ||
              (current.owner !== runOwner && current.status === "running")
            )
              return current;
            return {
              ...current,
              status: "interrupted",
              error:
                "The computer clock changed. Resolve the village clock notice before explicitly retrying this work.",
              failure: undefined,
              failedAt: undefined,
            };
          }),
        );
        return;
      }
      const obsolete = error instanceof Obsolete,
        paused = error instanceof Paused;
      const message = (error instanceof Error ? error.message : String(error)).slice(0, 300);
      const failedInput = job.input;
      job = await updateJob((current) => {
        if (
          !current ||
          current.id !== runJobId ||
          current.attempt !== runAttempt ||
          (current.owner !== job!.owner && current.owner !== runOwner) ||
          (current.owner !== runOwner && current.status === "running")
        )
          throw new Obsolete("This job was replaced.");
        // Catch-up marks a step before entering the admission gate. If visibility
        // was lost there, no provider call began and this is an ordinary pause.
        if (
          paused &&
          !dispatched &&
          catchupBatchId(current) &&
          lastIndex >= 0 &&
          current.steps[lastIndex]?.status === "running"
        )
          current.steps.splice(lastIndex, 1);
        return {
          ...current!,
          status: obsolete
            ? "obsolete"
            : paused
              ? current!.steps.some((step) => step.status === "running") ||
                Object.values(current!.optionalAttempts ?? {}).some((attempt) => attempt.status === "dispatching")
                ? "interrupted"
                : "paused"
              : "failed",
          error: message,
          failedAt: obsolete || paused ? current!.failedAt : (current!.failedAt ?? new Date().toISOString()),
          failure:
            error instanceof WorkFailureError
              ? error.failure
              : obsolete || paused
                ? current!.failure
                : { cause: dispatched ? "unknown_request" : "storage_application", stage, message },
          failedStep: current!.partialResult
            ? current!.failedStep
            : current!.hasResult
              ? null
              : paused ||
                  obsolete ||
                  (!invoked && !current!.steps[lastIndex]?.lateResponse) ||
                  ["storage", "response-storage"].includes(stage)
                ? current!.failedStep
                : Math.max(0, lastIndex),
          ...(obsolete
            ? { steps: [], optionalAttempts: {}, settings: {}, input: null, result: undefined, hasResult: false }
            : {}),
        };
      });
      await handlers
        .get(job.kind)
        ?.afterFailure?.(failedInput)
        .catch((followup) =>
          villagesLogger().warn("[villages] could not save failed work status: %s", String(followup)),
        );
    } finally {
      controllers.delete(id);
    }
    if (job.replacement && !stopped && owner === runOwner) {
      const replacement = job.replacement;
      await updateJob(() => fresh(replacement, job));
      superseded.delete(job.id);
      relaunch.add(id);
    }
  }
  function recoverSavedResult(job: Job): { result: unknown } | undefined {
    if (job.hasResult || !["failed", "interrupted", "paused"].includes(job.status)) return undefined;
    try {
      const result = handlers.get(job.kind)?.recoverSavedResult?.(job.input, job.steps);
      return result === undefined ? undefined : { result };
    } catch {
      // Keep private contents out of diagnostics; invalid replies use deliberate replacement.
      return undefined;
    }
  }
  async function retryBackgroundJob(id: string, expectedAttempt: number, actionId: string): Promise<void> {
    const documents = villagesDocuments();
    if (stopped) throw new Error("Background work is stopped.");
    if (recoveryError) {
      await recoverBackgroundWork(documents);
      recoveryError = false;
    }
    if (!/^villages-background-[a-f0-9]{64}$/.test(id) || !/^[a-zA-Z0-9-]{1,100}$/.test(actionId))
      throw badRequest("Invalid background retry.");
    // A newer validator may understand a previously rejected, purchased reply.
    // Recovery is pure and deliberate; an invalid reply still uses the normal retry path.
    const foundPrior = await readJob(id, documents);
    if (foundPrior?.kind === "story") {
      await retireStory(id, documents);
      throw conflict("The former feed generator is retired. This work cannot be retried.");
    }
    const savedPrior =
      foundPrior && !running.has(id) ? await adoptLateResponses(id, foundPrior, documents) : foundPrior;
    let recovered: { result: unknown } | undefined;
    if (
      savedPrior &&
      !savedPrior.hasResult &&
      !running.has(id) &&
      savedPrior.attempt === expectedAttempt &&
      !savedPrior.retryActions.includes(actionId) &&
      ["failed", "interrupted", "paused"].includes(savedPrior.status)
    ) {
      recovered = recoverSavedResult(savedPrior);
    }
    // Apply a saved partial response before discarding its bad rows. A lost effect
    // acknowledgement must not cause valid, purchased answers to be regenerated.
    await changeJob(
      id,
      (job) => {
        if (!job) throw new Error("That background job no longer exists.");
        if (job.retryActions.includes(actionId)) return job;
        if (job.attempt !== expectedAttempt || !["failed", "interrupted", "paused"].includes(job.status))
          throw conflict("That job changed. Refresh its status before retrying.");
        if (running.has(id)) throw conflict("That job is still finishing.");
        job.attemptHistory = [
          ...(job.attemptHistory ?? []),
          {
            attempt: job.attempt,
            requests: job.requests,
            tokens: job.usageComplete ? job.tokens : null,
            failure: job.failure,
            steps: job.steps.map(({ key, status, timing, responseDiagnostics }) => ({
              key,
              status,
              timing,
              responseDiagnostics,
            })),
          },
        ].slice(-8);
        if (recovered && job.id === savedPrior?.id) {
          job.result = recovered.result;
          job.hasResult = true;
        } else if (job.failedStep !== null) job.steps.splice(job.failedStep);
        else if (job.steps.at(-1)?.status === "running") job.steps.pop();
        job.failedStep = null;
        if (job.partialResult) {
          job.hasResult = false;
          job.result = undefined;
          job.partialResult = false;
        }
        job.failure = undefined;
        job.failedAt = undefined;
        job.attempt++;
        job.owner = owner;
        job.status = "queued";
        job.error = "";
        job.retrying = true;
        job.finite = true;
        job.retryActions = [...job.retryActions, actionId].slice(-32);
        return job;
      },
      documents,
    );
    launch(id, documents);
  }
  async function retireStory(id: string, documents = villagesDocuments()): Promise<void> {
    await changeJob(
      id,
      (job) => {
        if (!job || job.kind !== "story" || job.status === "obsolete") return job;
        return { ...job, status: "obsolete", error: "The former feed generator is retired.", replacement: undefined };
      },
      documents,
    );
  }
  async function recoverBackgroundWork(documents = villagesDocuments()): Promise<void> {
    if (stopped) return;
    const responses = backgroundResponseStore(documents);
    const recoveryOwner = owner;
    const connections = await documents.list(VILLAGES_PACKAGE_ID, "background-connection");
    if (stopped || owner !== recoveryOwner) return;
    for (const record of connections)
      if (typeof (record.data as any)?.connectionId === "string")
        pausedConnections.add((record.data as any).connectionId);
    const records = await documents.list(VILLAGES_PACKAGE_ID, KIND);
    for (const record of records) {
      if (stopped || owner !== recoveryOwner) return;
      validateBackgroundJobRecord(record);
      const original = await responses.decode(record.data);
      const interruptedDispatch =
        original.owner !== owner &&
        (original.steps.some((step) => step.status === "running") ||
          Object.values(original.optionalAttempts ?? {}).some((attempt) => attempt.status === "dispatching"));
      const job = await adoptLateResponses(record.id, original, documents);
      if (job.kind === "story") {
        await retireStory(record.id, documents);
        continue;
      }
      if (job.kind === "translation" && !["completed", "obsolete"].includes(job.status)) {
        await changeJob(
          record.id,
          (current) => ({
            ...current!,
            status: "obsolete",
            error: "Schedule translation is retired.",
            replacement: undefined,
          }),
          documents,
        );
        continue;
      }
      if (job.connectionPaused) pausedConnections.add(job.connectionId);
      if (interruptedDispatch && !["completed", "obsolete"].includes(job.status)) {
        await changeJob(
          record.id,
          (current) => ({
            ...current!,
            status: "interrupted",
            owner,
            error: "Generation was interrupted. This request may already have incurred costs.",
            failure: {
              cause: "unknown_request",
              stage: "recovery",
              message: "Generation was interrupted. This request may already have incurred costs.",
            },
          }),
          documents,
        );
      } else if (
        (asRecord(job.input).foundingContract === 1 ||
          (job.kind === "agenda" &&
            (await (ports.readVillageAuthority ?? readVillageState)()).foundingPreparation?.status !== "ready" &&
            !!(await (ports.readVillageAuthority ?? readVillageState)()).foundingPreparation)) &&
        !job.hasResult &&
        ["queued", "paused", "running"].includes(job.status)
      ) {
        await changeJob(
          record.id,
          (current) => ({
            ...current!,
            status: "interrupted",
            owner,
            error: "Preparation interrupted. Retry deliberately.",
          }),
          documents,
        );
      } else if (["queued", "paused", "running"].includes(job.status)) launch(record.id, documents);
    }
  }
  async function backgroundWorkSummaries(): Promise<BackgroundSummary[]> {
    const documents = villagesDocuments();
    const records = await documents.list(VILLAGES_PACKAGE_ID, KIND);
    const state = await (ports.readVillageAuthority ?? readVillageState)();
    const summaries: BackgroundSummary[] = [];
    const discardedReceipts: string[] = [];
    let removed = 0;
    for (const record of records) {
      // Unknown evidence is retained without making every other summary unavailable.
      if (!isBackgroundRecoveryRecord(record.data)) continue;
      try {
        validateBackgroundJobRecord(record);
      } catch {
        continue;
      }
      const job = record.data;
      const retired =
        job?.kind !== "resident-planning" &&
        job?.kind !== "world-development" &&
        job?.kind !== "story" &&
        job?.kind !== "starting-ties" &&
        job?.kind !== "personal-mail" &&
        job?.kind !== "social-recovery" &&
        !state.villagers.some((resident) => resident.characterId === job?.subjectId);
      if (
        !job ||
        retired ||
        job.seed !== state.seed ||
        (["completed", "obsolete"].includes(job.status) && Date.parse(record.updatedAt) < Date.now() - 30 * 86_400_000)
      ) {
        const recovery = backgroundRecoveryState(job);
        // Explicit Reset ends the prior world's ownership; a removed subject alone does not.
        const disposable = job.seed !== state.seed || ["completed", "failed", "abandoned"].includes(recovery);
        if (disposable && removed++ < 8 && !running.has(record.id))
          if (await documents.remove(VILLAGES_PACKAGE_ID, record.id, record.revision)) {
            const subjectGone =
              job?.kind !== "resident-planning" &&
              job?.kind !== "world-development" &&
              job?.kind !== "story" &&
              job?.kind !== "personal-mail" &&
              job?.kind !== "social-recovery" &&
              !state.villagers.some((resident) => resident.characterId === job?.subjectId);
            if (subjectGone || job?.seed !== state.seed) discardedReceipts.push(record.id);
          }
        continue;
      }
      if (job.kind === "story") continue; // Hide retired work after the existing retention/reset cleanup.
      summaries.push({
        id: record.id,
        kind: job.kind,
        subjectId: job.subjectId,
        label: job.label,
        status: job.status,
        attempt: job.attempt,
        completedSteps:
          job.completedCount ||
          job.steps.filter((step, index) => step.status === "completed" && index !== job.failedStep).length,
        requests: job.requests,
        tokens: job.usageComplete ? job.tokens : null,
        error: job.error,
        connectionPaused: job.connectionPaused || pausedConnections.has(job.connectionId),
        failure: job.failure,
        updatedAt: record.updatedAt,
        failedAt: job.failedAt,
      });
    }
    if (discardedReceipts.length)
      await (ports.mutateVillageAuthority ?? mutateVillageState)((current) => {
        for (const id of discardedReceipts)
          if (current.backgroundReceipts[id] === state.backgroundReceipts[id]) delete current.backgroundReceipts[id];
      });
    return summaries;
  }
  function startBackgroundWork(options: { now?: () => number } = {}): () => void {
    presenceNow = options.now ?? (() => performance.now());
    owner = randomUUID();
    const activation = owner;
    const logger = villagesLogger();
    stopped = false;
    sessions.clear();
    pendingPresence.clear();
    pausedConnections.clear();
    superseded.clear();
    recoveryError = false;
    recoveryReady = recoverBackgroundWork().catch((error) => {
      if (owner !== activation || stopped) return;
      recoveryError = true;
      logger.warn("[villages] could not recover background work: %s", String(error));
    });
    return () => {
      if (activation !== owner) return;
      stopped = true;
      sessions.clear();
      pendingPresence.clear();
      for (const controller of controllers.values()) controller.abort();
      for (const ticket of tickets.splice(0)) ticket.reject(new Paused("Background generation stopped."));
    };
  }
  async function settleBackgroundWork(): Promise<void> {
    while (reserving.size || running.size) await Promise.all([...reserving.values(), ...running.values()]);
  }
  async function previewBackgroundJobs(_defaultBatchSize?: number) {
    const documents = villagesDocuments(),
      responses = backgroundResponseStore(documents);
    const records = await documents.list(VILLAGES_PACKAGE_ID, KIND);
    const previews = [];
    for (const record of records) {
      const job = record.data as Job;
      validateBackgroundJobRecord(record);
      const recovered =
        !job.hasResult &&
        ["failed", "interrupted", "paused"].includes(job.status) &&
        handlers.get(job.kind)?.recoverSavedResult
          ? recoverSavedResult(await responses.decode(job))
          : undefined;
      const completedSteps =
        job.completedCount ||
        job.steps.filter((step, i) => step.status === "completed" && (i !== job.failedStep || recovered)).length;
      const context = asRecord(asRecord(job.input).context);
      const blocks = Array.isArray(context.blocks) ? context.blocks.length : 0;
      const planned =
        job.kind === "agenda" ? agendaRequestCount(VILLAGE_WEEKDAYS) : job.kind === "translation" ? 0 : null;
      previews.push({
        id: record.id,
        seed: job.seed,
        kind: job.kind,
        subjectId: job.subjectId,
        status: job.status,
        label: job.label,
        input: job.input,
        settings: job.settings ?? {},
        completedSteps,
        remainingRequests:
          ["completed", "obsolete"].includes(job.status) || job.hasResult || recovered
            ? 0
            : planned === null
              ? null
              : remainingRequests(planned, completedSteps),
        cause: job.finite
          ? "Player-requested generation"
          : job.kind === "translation"
            ? "Deprecated translation: no new requests"
            : "Automatic: village time or resident agenda update",
        remainingBlocks: job.kind === "translation" ? blocks : null,
      });
    }
    return previews;
  }
  return {
    cancelReturnCatchup,
    registerBackgroundHandler,
    retireLegacyFounding,
    backgroundJobSnapshot: (kind: BackgroundKind, subjectId: string) => readJob(slotId({ kind, subjectId })),
    backgroundLegacyFounding: async (subjectId: string, seed: string, revision: string) => {
      const documents = villagesDocuments(),
        responses = backgroundResponseStore(documents);
      const current = await readJob(slotId({ kind: "agenda", subjectId }), documents);
      if (
        current?.seed === seed &&
        current.status !== "obsolete" &&
        current.revision === revision &&
        asRecord(current.input).foundingContract !== 1
      )
        return current;
      const rows = await documents.list(VILLAGES_PACKAGE_ID, "background-history");
      const saved =
        rows
          .map((row) => row.data as Job)
          .sort((a, b) => b.attempt - a.attempt)
          .find(
            (job) =>
              job.seed === seed &&
              job.kind === "agenda" &&
              job.subjectId === subjectId &&
              job.revision === revision &&
              asRecord(job.input).foundingContract !== 1,
          ) ?? null;
      if (saved) validateBackgroundJobRecord(rows.find((row) => row.data === saved)!);
      return saved ? responses.decode(saved) : null;
    },
    backgroundStatus,
    hasVillagePresence,
    villageBackgroundPresence,
    queueBackgroundJob,
    retryBackgroundJob,
    recoverBackgroundWork,
    backgroundWorkSummaries,
    startBackgroundWork,
    settleBackgroundWork,
    previewBackgroundJobs,
  };
}
export type BackgroundWorkService = ReturnType<typeof createBackgroundWork>;
