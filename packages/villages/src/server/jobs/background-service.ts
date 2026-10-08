import { backgroundRevision } from "../domain/rules/background-revision.js";
import { VILLAGES_PACKAGE_ID } from "../adapters/engine/runtime-host.js";
import type { CapabilityDocumentStore, CapabilityRuntimeLogger } from "@marinara-engine/shared";
import type { withUsagePurpose } from "../adapters/models/usage-ledger.js";
import type { measurePipeline } from "../adapters/observability/pipeline-metrics.js";
import type { runtimeDebug } from "../adapters/observability/runtime-debug.js";
import type { BackgroundContext } from "../adapters/operations/background-context-service.js";
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
import { asRecord } from "../domain/rules/coerce.js";
import { badRequest, conflict } from "../domain/rules/errors.js";
import { agendaRequestCount, remainingRequests } from "../domain/rules/generation-budgets.js";
import { responseDiagnostics } from "../domain/rules/response-diagnostics.js";
import { VILLAGE_WEEKDAYS } from "../domain/rules/village-clock.js";
import { type WorkFailure, WorkFailureError } from "../domain/rules/work-failure.js";
import type { mutateVillageState, readVillageState } from "../features/world/village-store.js";
import { randomUUID } from "node:crypto";
const KIND = "background-work";
const slotId = (work: Pick<BackgroundInput, "kind" | "subjectId">) =>
  "villages-background-" + backgroundRevision([work.kind, work.subjectId]);
const jobId = (work: BackgroundInput) => backgroundRevision([work.seed, work.kind, work.subjectId, work.revision]);
export function retireBackgroundResident(state: VillageState, characterId: string): void {
  for (const kind of ["agenda", "translation", "wish", "adaptation"] as const)
    delete state.backgroundReceipts[slotId({ kind, subjectId: characterId })];
  delete state.wishRefillIntents[characterId];
}
export interface BackgroundWorkPorts {
  villagesDocuments(): CapabilityDocumentStore;
  villagesLogger(): CapabilityRuntimeLogger;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  withUsagePurpose: typeof withUsagePurpose;
  measurePipeline: typeof measurePipeline;
  runtimeDebug: typeof runtimeDebug;
  backgroundCalls: BackgroundContext["backgroundCalls"];
  handlers: Iterable<readonly [BackgroundKind, Handler]>;
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
  async function readJob(id: string): Promise<Job | null> {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, id);
    if (!record) return null;
    const job = structuredClone(record.data) as Job;
    if (!job || !Array.isArray(job.steps) || typeof job.id !== "string" || !handlers.has(job.kind))
      throw new Error("The saved background job could not be read. Restore it from a backup.");
    return job;
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
  async function changeJob(id: string, change: (job: Job | null) => Job): Promise<Job> {
    const documents = villagesDocuments();
    for (let attempt = 0; attempt < 8; attempt++) {
      const record = await documents.getById(VILLAGES_PACKAGE_ID, id);
      const next = change(record ? (structuredClone(record.data) as Job) : null);
      if (record && JSON.stringify(next) === JSON.stringify(record.data)) return structuredClone(next);
      const stamp = new Date().toISOString();
      if (record) {
        const updated = await documents.update({
          id,
          packageId: VILLAGES_PACKAGE_ID,
          expectedRevision: record.revision,
          name: next.label,
          description: "Villages background generation checkpoint",
          data: next,
          updatedAt: stamp,
        });
        if (updated) return structuredClone(next);
      } else {
        try {
          await documents.create({
            id,
            packageId: VILLAGES_PACKAGE_ID,
            kind: KIND,
            name: next.label,
            description: "Villages background generation checkpoint",
            data: next,
            createdAt: stamp,
            updatedAt: stamp,
          });
          return structuredClone(next);
        } catch (error) {
          if (!(await documents.getById(VILLAGES_PACKAGE_ID, id))) throw error;
        }
      }
    }
    throw new Error("Background work kept changing while it was saved.");
  }
  async function persistConnectionPause(connectionId: string, paused: boolean): Promise<void> {
    const documents = villagesDocuments();
    const id = "villages-background-connection-" + backgroundRevision(connectionId);
    for (let attempt = 0; attempt < 8; attempt++) {
      const current = await documents.getById(VILLAGES_PACKAGE_ID, id);
      if (!paused) {
        if (!current || (await documents.remove(VILLAGES_PACKAGE_ID, id, current.revision))) return;
      } else if (current) return;
      else {
        const stamp = new Date().toISOString();
        try {
          await documents.create({
            id,
            packageId: VILLAGES_PACKAGE_ID,
            kind: "background-connection",
            name: "Paused background connection",
            description: "A deliberate successful retry is required",
            data: { connectionId },
            createdAt: stamp,
            updatedAt: stamp,
          });
          return;
        } catch (error) {
          if (!(await documents.getById(VILLAGES_PACKAGE_ID, id))) throw error;
        }
      }
    }
    throw new Error("Connection recovery could not be saved.");
  }
  async function clearConnectionPause(connectionId: string): Promise<void> {
    await persistConnectionPause(connectionId, false);
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, KIND);
    for (const record of records) {
      const other = record.data as Job;
      if (other.connectionId === connectionId && other.connectionPaused)
        await changeJob(record.id, (current) => ({ ...current!, connectionPaused: false }));
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
      retryActions: [],
      retrying: false,
      connectionId: "",
      highWaterDate: work.automaticDate ?? (previous?.seed === work.seed ? previous.highWaterDate : ""),
    };
  }
  function hasVillagePresence(): boolean {
    const now = presenceNow();
    for (const [id, expiry] of sessions) if (expiry <= now) sessions.delete(id);
    return sessions.size > 0;
  }
  async function villageBackgroundPresence<T = void>(
    sessionId: string,
    visible: boolean,
    options: { beforeResume?: () => Promise<T> } = {},
  ): Promise<T | undefined> {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(sessionId)) throw badRequest("Invalid browser session.");
    if (!visible) {
      sessions.delete(sessionId);
      pendingPresence.delete(sessionId);
      return;
    }
    const token = Symbol();
    pendingPresence.set(sessionId, token);
    const advanced = await options.beforeResume?.();
    // A hidden message can overtake a slow catch-up. Never restore that stale permission.
    if (pendingPresence.get(sessionId) !== token) return advanced;
    pendingPresence.delete(sessionId);
    sessions.set(sessionId, presenceNow() + 90_000);
    await recoverBackgroundWork();
    recoveryError = false;
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
  function checkCurrent(job: Job, state: VillageState): void {
    if (state.backgroundReceipts[slotId(job)] === job.id) return;
    if (superseded.has(job.id) || state.seed !== job.seed || !handlers.get(job.kind)!.valid(state, job.input))
      throw new Obsolete("This work is no longer needed.");
  }
  function launch(id: string): void {
    if (stopped || running.has(id)) return;
    const logger = villagesLogger();
    const task = runJob(id)
      .catch((error) => {
        logger.warn("[villages] background work could not be saved: %s", String(error));
      })
      .finally(() => {
        if (running.get(id) === task) running.delete(id);
        if (relaunch.delete(id)) launch(id);
      });
    running.set(id, task);
  }
  function queueBackgroundJob(work: BackgroundInput): Promise<void> {
    const id = slotId(work);
    const existing = reserving.get(id);
    if (existing) return existing.then(() => queueBackgroundJob(work));
    // Reserve before the first read or write: all callers share one admission.
    const task = (async () => {
      if (stopped) return;
      await changeJob(id, (previous) => {
        if (previous?.id === jobId(work)) {
          if (work.finite && !previous.finite) previous.finite = true;
          return previous;
        }
        if (work.expectedAttempt !== undefined && work.expectedAttempt !== (previous?.attempt ?? 0))
          throw conflict("Background work changed. Refresh before requesting another event.");
        if (work.kind === "story" && running.has(id) && previous) return previous;
        if (
          work.automaticDate &&
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
      });
      launch(id);
    })().finally(() => reserving.delete(id));
    reserving.set(id, task);
    return task;
  }
  async function runJob(id: string): Promise<void> {
    return measurePipeline("background work", { jobId: id }, () => runMeasuredJob(id));
  }
  async function runMeasuredJob(id: string): Promise<void> {
    let job = await readJob(id);
    if (
      job &&
      (job.kind === "translation" ||
        (job.kind === "agenda" &&
          typeof asRecord(asRecord(job.input).context).name === "string" &&
          !asRecord(asRecord(job.input).context).card))
    ) {
      await changeJob(id, (current) => ({
        ...current!,
        status: "obsolete",
        error: "Legacy schedule translation and detailed Agenda generation are retired.",
        replacement: undefined,
      }));
      return;
    }
    if (!job || stopped || ["failed", "interrupted", "completed", "obsolete"].includes(job.status)) return;
    const runOwner = owner;
    const recorded = await readVillageState();
    if (recorded.backgroundReceipts[id] === job.id) {
      await changeJob(id, (current) => ({
        ...current!,
        status: "completed",
        steps: [],
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
    if (job.owner !== runOwner && job.steps.some((step) => step.status === "running")) {
      await changeJob(id, (current) => ({
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
      return requestTurn(async () => {
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        if (!job!.finite && !hasVillagePresence()) throw new Paused("Waiting until Villages is visible.");
        if (pausedConnections.has(model.connectionId) && !job!.retrying) {
          job = await changeJob(id, (current) => ({
            ...current!,
            connectionId: model.connectionId,
            connectionPaused: true,
          }));
          throw new Paused("This connection is paused. Retry an affected job to resume it.");
        }
        checkCurrent(job!, await readVillageState());
        job = await changeJob(id, (current) => {
          if (current?.id !== job!.id || superseded.has(current.id)) throw new Obsolete("This job was replaced.");
          if (current.steps[index]?.status === "running") throw new Paused("This request is already reserved.");
          current.status = "running";
          current.owner = runOwner;
          current.connectionId = model.connectionId;
          current.steps[index] = { key: options.checkpointId, fingerprint, status: "running" };
          current.requests++;
          return current;
        });
        invoked = true;
        dispatched = true;
        let response: Awaited<ReturnType<BackgroundCompletion>>;
        try {
          response = await withUsagePurpose(
            options.usagePurpose ?? (job.kind === "wish-check" ? "checks" : "background"),
            () =>
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
        } catch (error) {
          if (owner !== runOwner || stopped) throw new Paused("Background generation stopped.");
          pausedConnections.add(model.connectionId);
          await persistConnectionPause(model.connectionId, true);
          await changeJob(id, (current) => ({ ...current!, connectionPaused: true, usageComplete: false }));
          throw new WorkFailureError({
            cause: "provider_exception",
            stage: "dispatch",
            message:
              options.responseFormat &&
              /response[_ ]?format|json[_ ]?(?:object|mode|schema)/iu.test(String(error)) &&
              /unsupported|not support|invalid|unknown|not allowed|unrecognized/iu.test(String(error))
                ? "The selected connection rejected JSON mode. Choose a connection supporting JSON responses, then explicitly retry. No fallback request was made."
                : (error instanceof Error ? error.message : String(error)).slice(0, 300),
            requestedOutputTokens: maxTokens,
          });
        }
        if (owner !== runOwner || stopped) throw new Paused("Background generation stopped.");
        stage = "response-storage";
        job = await changeJob(id, (current) => {
          if (current?.id !== job!.id || current.owner !== runOwner) throw new Obsolete("This job was replaced.");
          current.steps[index] = {
            key: options.checkpointId,
            fingerprint,
            status: "completed",
            response,
            ...(options.responseFormat ? { responseDiagnostics: responseDiagnostics(model, response, maxTokens) } : {}),
          };
          const tokens =
            response.usage?.totalTokens ??
            (response.usage?.promptTokens !== undefined && response.usage?.completionTokens !== undefined
              ? response.usage.promptTokens + response.usage.completionTokens
              : undefined);
          if (tokens !== undefined) current.tokens = (current.tokens ?? 0) + tokens;
          else current.usageComplete = false;
          return current;
        });
        dispatched = false;
        stage = "generation";
        if (job!.retrying) {
          try {
            await clearConnectionPause(model.connectionId);
          } catch {
            throw new Paused("The response is saved, but connection recovery could not be saved.");
          }
        }
        return response;
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
      const value = key in (job!.settings ?? {}) ? job!.settings[key] : await create();
      job = await changeJob(id, (current) => {
        current!.settings ??= {};
        if (!(key in current!.settings)) current!.settings[key] = value;
        return current!;
      });
      return job.settings[key] as T;
    };
    try {
      checkCurrent(job, await readVillageState());
      if (!job.hasResult) {
        const result = await backgroundCalls.run(complete, () => handlers.get(job!.kind)!.generate(job!.input));
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        stage = "storage";
        job = await changeJob(id, (current) => ({ ...current!, result, hasResult: true }));
      }
      if (job.retrying && pausedConnections.has(job.connectionId)) await clearConnectionPause(job.connectionId);
      stage = "application";
      let partialFailure: WorkFailure | undefined;
      await mutateVillageState((state) => {
        if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
        if (state.backgroundReceipts[id] === job!.id) return;
        checkCurrent(job!, state);
        partialFailure =
          handlers.get(job!.kind)!.apply(state, job!.input, job!.result, { retrying: job!.retrying }) || undefined;
        if (!partialFailure) state.backgroundReceipts[id] = job!.id;
      });
      if (partialFailure) {
        job = await changeJob(id, (current) => ({
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
      job = await changeJob(id, (current) => ({
        ...current!,
        completedCount: current!.steps.length,
        status: "completed",
        error: "",
        failure: undefined,
        failedAt: undefined,
        partialResult: false,
        steps: [],
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
      const obsolete = error instanceof Obsolete,
        paused = error instanceof Paused;
      const message = (error instanceof Error ? error.message : String(error)).slice(0, 300);
      const failedInput = job.input;
      job = await changeJob(id, (current) => ({
        ...current!,
        status: obsolete
          ? "obsolete"
          : paused
            ? current!.steps.some((step) => step.status === "running")
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
            : paused || obsolete || !invoked || ["storage", "response-storage"].includes(stage)
              ? current!.failedStep
              : Math.max(0, lastIndex),
        ...(obsolete ? { steps: [], settings: {}, input: null, result: undefined, hasResult: false } : {}),
      }));
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
      await changeJob(id, () => fresh(replacement, job));
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
    if (stopped) throw new Error("Background work is stopped.");
    if (recoveryError) {
      await recoverBackgroundWork();
      recoveryError = false;
    }
    if (!/^villages-background-[a-f0-9]{64}$/.test(id) || !/^[a-zA-Z0-9-]{1,100}$/.test(actionId))
      throw badRequest("Invalid background retry.");
    // A newer validator may understand a previously rejected, purchased reply.
    // Recovery is pure and deliberate; an invalid reply still uses the normal retry path.
    const savedPrior = await readJob(id);
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
    const prior = await readJob(id);
    if (
      prior?.kind === "wish-check" &&
      prior.hasResult &&
      !running.has(id) &&
      prior.attempt === expectedAttempt &&
      !prior.retryActions.includes(actionId) &&
      ["failed", "interrupted", "paused"].includes(prior.status)
    ) {
      let remaining: WorkFailure | undefined;
      await mutateVillageState((state) => {
        if (state.backgroundReceipts[id] === prior.id) return;
        if (state.seed !== prior.seed) throw conflict("This Wish check belongs to another village.");
        remaining = handlers.get(prior.kind)!.apply(state, prior.input, prior.result, { retrying: true }) || undefined;
        if (!remaining) state.backgroundReceipts[id] = prior.id;
      });
      if (remaining)
        await changeJob(id, (current) => {
          if (current?.id !== prior.id || current.attempt !== expectedAttempt)
            throw conflict("That job changed during saved-response recovery.");
          return {
            ...current,
            partialResult: true,
            failedStep: current.steps.length ? current.steps.length - 1 : null,
          };
        });
    }
    await changeJob(id, (job) => {
      if (!job) throw new Error("That background job no longer exists.");
      if (job.retryActions.includes(actionId)) return job;
      if (job.attempt !== expectedAttempt || !["failed", "interrupted", "paused"].includes(job.status))
        throw conflict("That job changed. Refresh its status before retrying.");
      if (running.has(id)) throw conflict("That job is still finishing.");
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
    });
    launch(id);
  }
  async function recoverBackgroundWork(): Promise<void> {
    if (stopped) return;
    const recoveryOwner = owner;
    const connections = await villagesDocuments().list(VILLAGES_PACKAGE_ID, "background-connection");
    if (stopped || owner !== recoveryOwner) return;
    for (const record of connections)
      if (typeof (record.data as any)?.connectionId === "string")
        pausedConnections.add((record.data as any).connectionId);
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, KIND);
    for (const record of records) {
      if (stopped || owner !== recoveryOwner) return;
      const job = record.data as Job;
      if (job.kind === "translation" && !["completed", "obsolete"].includes(job.status)) {
        await changeJob(record.id, (current) => ({
          ...current!,
          status: "obsolete",
          error: "Schedule translation is retired.",
          replacement: undefined,
        }));
        continue;
      }
      // Recovery applies only already prepared responses. It never enters generate
      // or permits a replacement model request for failures or uncertain outcomes.
      if (
        job.kind === "wish-check" &&
        job.hasResult &&
        !running.has(record.id) &&
        ["failed", "paused", "interrupted"].includes(job.status)
      ) {
        try {
          let remaining: WorkFailure | undefined;
          await mutateVillageState((state) => {
            if (state.backgroundReceipts[record.id] === job.id) return;
            checkCurrent(job, state);
            remaining =
              handlers.get(job.kind)!.apply(state, job.input, job.result, { retrying: job.retrying }) || undefined;
            if (!remaining) state.backgroundReceipts[record.id] = job.id;
          });
          await changeJob(record.id, (current) => {
            if (current?.id !== job.id || current.attempt !== job.attempt || running.has(record.id))
              throw conflict("That job changed during local recovery.");
            if (remaining)
              return {
                ...current,
                partialResult: true,
                failure: remaining,
                failedStep: current.steps.length ? current.steps.length - 1 : null,
              };
            return {
              ...current,
              status: "completed",
              error: "",
              failure: undefined,
              failedAt: undefined,
              completedCount: current.steps.length,
              steps: [],
              settings: {},
              input: null,
              result: undefined,
              hasResult: false,
              partialResult: false,
              retrying: false,
            };
          });
          if (!remaining) {
            await handlers.get(job.kind)?.afterApply?.(job.input, job.finite);
            continue;
          }
        } catch (error) {
          villagesLogger().warn("[villages] local Wish recovery remains unfinished: %s", String(error));
        }
      }
      const input = asRecord(job.input);
      if (
        !running.has(record.id) &&
        !["completed", "obsolete"].includes(job.status) &&
        ((job.kind === "wish-check" && (Array.isArray(input.items) || asRecord(input.proposal).wishId)) ||
          (job.kind === "wish" && input.characterId && input.id && input.revision))
      ) {
        const state = await readVillageState();
        if (job.seed !== state.seed || !handlers.get(job.kind)!.valid(state, job.input)) {
          const retiredInput = job.input;
          await changeJob(record.id, (current) => ({
            ...current!,
            status: "obsolete",
            error: "This Wish work no longer applies.",
            failure: undefined,
            steps: [],
            settings: {},
            input: null,
            result: undefined,
            hasResult: false,
            replacement: undefined,
          }));
          await handlers
            .get(job.kind)
            ?.afterFailure?.(retiredInput)
            .catch((error) =>
              villagesLogger().warn("[villages] could not settle retired Wish check: %s", String(error)),
            );
          continue;
        }
      }
      if (job.connectionPaused) pausedConnections.add(job.connectionId);
      if (
        job.owner !== owner &&
        job.steps?.some((step) => step.status === "running") &&
        !["completed", "obsolete"].includes(job.status)
      ) {
        await changeJob(record.id, (current) => ({
          ...current!,
          status: "interrupted",
          owner,
          error: "Generation was interrupted. This request may already have incurred costs.",
          failure: {
            cause: "unknown_request",
            stage: "recovery",
            message: "Generation was interrupted. This request may already have incurred costs.",
          },
        }));
      } else if (["queued", "paused", "running"].includes(job.status)) launch(record.id);
    }
  }
  async function backgroundWorkSummaries(): Promise<BackgroundSummary[]> {
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, KIND);
    const state = await readVillageState();
    const summaries: BackgroundSummary[] = [];
    const discardedReceipts: string[] = [];
    let removed = 0;
    for (const record of records) {
      const job = record.data as Job;
      const retired =
        job?.kind === "wish-check"
          ? job.seed !== state.seed ||
            !state.villagers.some((resident) => asWishCheckActors(job).includes(resident.characterId))
          : job?.kind === "mail"
            ? !state.venueMail.some((mail) => mail.id === job.subjectId)
            : job?.kind !== "story" && !state.villagers.some((resident) => resident.characterId === job?.subjectId);
      if (
        !job ||
        retired ||
        job.seed !== state.seed ||
        (["completed", "obsolete"].includes(job.status) && Date.parse(record.updatedAt) < Date.now() - 30 * 86_400_000)
      ) {
        if (removed++ < 8 && !running.has(record.id))
          if (await villagesDocuments().remove(VILLAGES_PACKAGE_ID, record.id, record.revision)) {
            const subjectGone =
              job?.kind === "wish-check"
                ? !state.villagers.some((resident) => asWishCheckActors(job).includes(resident.characterId))
                : job?.kind === "mail"
                  ? !state.venueMail.some((mail) => mail.id === job.subjectId && mail.status === "awaiting-villagers")
                  : job?.kind !== "story" &&
                    !state.villagers.some((resident) => resident.characterId === job?.subjectId);
            if (subjectGone || job?.seed !== state.seed) discardedReceipts.push(record.id);
          }
        continue;
      }
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
      await mutateVillageState((current) => {
        for (const id of discardedReceipts)
          if (current.backgroundReceipts[id] === state.backgroundReceipts[id]) delete current.backgroundReceipts[id];
      });
    return summaries;
  }
  function asWishCheckActors(job: Job): string[] {
    return job.residentIds ?? [job.residentId ?? ""];
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
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, KIND);
    return records.flatMap((record) => {
      const job = record.data as Job;
      if (!job || !Array.isArray(job.steps)) return [];
      const recovered = recoverSavedResult(job);
      const completedSteps =
        job.completedCount ||
        job.steps.filter((step, i) => step.status === "completed" && (i !== job.failedStep || recovered)).length;
      const context = asRecord(asRecord(job.input).context);
      const blocks = Array.isArray(context.blocks) ? context.blocks.length : 0;
      const planned =
        job.kind === "agenda" ? agendaRequestCount(VILLAGE_WEEKDAYS) : job.kind === "translation" ? 0 : null;
      return [
        {
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
        },
      ];
    });
  }
  return {
    registerBackgroundHandler,
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
