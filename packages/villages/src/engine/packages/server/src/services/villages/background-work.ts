import { agendaRequestCount, translationRequestCount, remainingRequests } from "./generation-budgets.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { asRecord } from "./coerce.js";
import { runtimeDebug } from "./runtime-debug.js";
// Package-owned work ledger. Only this module dispatches coordinated background requests.
import { createHash, randomUUID } from "node:crypto";
import { backgroundCalls, type BackgroundCompletion } from "./background-context.js";
import { villagesDocuments, villagesLogger, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { conflict, badRequest } from "./errors.js";
import type { VillageState } from "./types.js";

export type BackgroundKind = "story" | "agenda" | "translation" | "wish" | "wish-check" | "mail" | "adaptation";
export type BackgroundStatus = "queued" | "running" | "paused" | "failed" | "interrupted" | "completed" | "obsolete";
export type BackgroundSummary = {
  id: string;
  kind: BackgroundKind;
  subjectId: string;
  label: string;
  status: BackgroundStatus;
  attempt: number;
  completedSteps: number;
  requests: number;
  tokens: number | null;
  error: string;
  connectionPaused: boolean;
};
type Step = {
  key?: string;
  fingerprint: string;
  status: "running" | "completed";
  response?: Awaited<ReturnType<BackgroundCompletion>>;
};
export type BackgroundInput = {
  residentIds?: string[];
  residentId?: string;
  kind: BackgroundKind;
  subjectId: string;
  seed: string;
  revision: string;
  finite: boolean;
  label: string;
  input: unknown;
  legacyError?: string;
  automaticDate?: string;
  expectedAttempt?: number;
};
type Job = BackgroundInput & {
  id: string;
  status: BackgroundStatus;
  owner: string;
  attempt: number;
  steps: Step[];
  settings: Record<string, unknown>;
  result?: unknown;
  hasResult: boolean;
  requests: number;
  tokens: number | null;
  error: string;
  failedStep: number | null;
  retryActions: string[];
  retrying: boolean;
  connectionId: string;
  highWaterDate: string;
  replacement?: BackgroundInput;
  connectionPaused: boolean;
  completedCount: number;
  usageComplete: boolean;
};
type Handler = {
  generate(input: any): Promise<unknown>;
  valid(state: VillageState, input: any): boolean;
  apply(state: VillageState, input: any, result: any, context: { retrying: boolean }): void;
  afterApply?(input: any, finite: boolean): Promise<void>;
  afterFailure?(input: any): Promise<void>;
};
const KIND = "background-work";
const handlers = new Map<BackgroundKind, Handler>();
export const backgroundRevision = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const slotId = (work: Pick<BackgroundInput, "kind" | "subjectId">) =>
  "villages-background-" + backgroundRevision([work.kind, work.subjectId]);
const jobId = (work: BackgroundInput) => backgroundRevision([work.seed, work.kind, work.subjectId, work.revision]);
class Paused extends Error {}
class Obsolete extends Error {}
export function registerBackgroundHandler(kind: BackgroundKind, handler: Handler): void {
  handlers.set(kind, handler);
}
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
type Ticket = { start(): Promise<void>; reject(error: Error): void };
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
/** Read a subject's compact status without scanning unrelated work or wish history. */
export async function backgroundStatus(kind: BackgroundKind, subjectId: string): Promise<BackgroundStatus | null> {
  return (await readJob(slotId({ kind, subjectId })))?.status ?? null;
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
/** Connection health outlives replacement jobs, so daily discovery cannot test a failed provider after restart. */
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
/** Retire a resident's compact receipts and replenishment intent in the removal transaction. */
export function retireBackgroundResident(state: VillageState, characterId: string): void {
  for (const kind of ["agenda", "translation", "wish", "adaptation"] as const)
    delete state.backgroundReceipts[slotId({ kind, subjectId: characterId })];
  delete state.wishRefillIntents[characterId];
}
export function hasVillagePresence(): boolean {
  const now = presenceNow();
  for (const [id, expiry] of sessions) if (expiry <= now) sessions.delete(id);
  return sessions.size > 0;
}
export async function villageBackgroundPresence<T = void>(
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
export function queueBackgroundJob(work: BackgroundInput): Promise<void> {
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
  let job = await readJob(id);
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
    }));
    return;
  }
  if (job.owner !== runOwner && job.steps.some((step) => step.status === "running")) {
    await changeJob(id, (current) => ({
      ...current!,
      status: "interrupted",
      error: "Generation was interrupted. This request may already have incurred costs.",
      owner: runOwner,
    }));
    return;
  }
  const controller = new AbortController();
  controllers.set(id, controller);
  let cursor = 0;
  let lastIndex = -1;
  let invoked = false;
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
      let response: Awaited<ReturnType<BackgroundCompletion>>;
      try {
        response = await model.chatComplete(messages, {
          ...(typeof options.temperature === "number" ? { temperature: options.temperature } : {}),
          ...(options.reasoningEffort ? { reasoningEffort: options.reasoningEffort } : {}),
          ...(options.verbosity ? { verbosity: options.verbosity } : {}),
          maxTokens,
          debugMode: false,
          signal: options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal,
        });
      } catch (error) {
        if (owner !== runOwner || stopped) throw new Paused("Background generation stopped.");
        pausedConnections.add(model.connectionId);
        await persistConnectionPause(model.connectionId, true);
        await changeJob(id, (current) => ({ ...current!, connectionPaused: true, usageComplete: false }));
        throw error;
      }
      if (owner !== runOwner || stopped) throw new Paused("Background generation stopped.");
      job = await changeJob(id, (current) => {
        if (current?.id !== job!.id || current.owner !== runOwner) throw new Obsolete("This job was replaced.");
        current.steps[index] = { key: options.checkpointId, fingerprint, status: "completed", response };
        const tokens =
          response.usage?.totalTokens ??
          (response.usage?.promptTokens !== undefined && response.usage?.completionTokens !== undefined
            ? response.usage.promptTokens + response.usage.completionTokens
            : undefined);
        if (tokens !== undefined) current.tokens = (current.tokens ?? 0) + tokens;
        else current.usageComplete = false;
        return current;
      });
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
    cause: job.finite
      ? "Player-requested generation"
      : job.kind === "translation"
        ? "Automatic: schedule or village context changed"
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
      job = await changeJob(id, (current) => ({ ...current!, result, hasResult: true }));
    }
    if (job.retrying && pausedConnections.has(job.connectionId)) await clearConnectionPause(job.connectionId);
    await mutateVillageState((state) => {
      if (stopped || owner !== runOwner) throw new Paused("Background generation stopped.");
      if (state.backgroundReceipts[id] === job!.id) return;
      checkCurrent(job!, state);
      handlers.get(job!.kind)!.apply(state, job!.input, job!.result, { retrying: job!.retrying });
      state.backgroundReceipts[id] = job!.id;
    });
    const appliedInput = job.input;
    const appliedFinite = job.finite;
    const wasRetry = job.retrying;
    job = await changeJob(id, (current) => ({
      ...current!,
      completedCount: current!.steps.length,
      status: "completed",
      error: "",
      steps: [],
      settings: {},
      input: null,
      result: undefined,
      hasResult: false,
      retrying: false,
    }));
    if (wasRetry) queueMicrotask(() => void recoverBackgroundWork().catch(() => {}));
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
      failedStep: current!.hasResult
        ? null
        : paused || obsolete || !invoked
          ? current!.failedStep
          : Math.max(0, lastIndex),
      ...(obsolete ? { steps: [], settings: {}, input: null, result: undefined, hasResult: false } : {}),
    }));
    await handlers
      .get(job.kind)
      ?.afterFailure?.(failedInput)
      .catch((followup) => villagesLogger().warn("[villages] could not save failed work status: %s", String(followup)));
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
export async function retryBackgroundJob(id: string, expectedAttempt: number, actionId: string): Promise<void> {
  if (stopped) throw new Error("Background work is stopped.");
  if (recoveryError) {
    await recoverBackgroundWork();
    recoveryError = false;
  }
  if (!/^villages-background-[a-f0-9]{64}$/.test(id) || !/^[a-zA-Z0-9-]{1,100}$/.test(actionId))
    throw badRequest("Invalid background retry.");
  await changeJob(id, (job) => {
    if (!job) throw new Error("That background job no longer exists.");
    if (job.retryActions.includes(actionId)) return job;
    if (job.attempt !== expectedAttempt || !["failed", "interrupted", "paused"].includes(job.status))
      throw conflict("That job changed. Refresh its status before retrying.");
    if (running.has(id)) throw conflict("That job is still finishing.");
    if (job.failedStep !== null) job.steps.splice(job.failedStep);
    else if (job.steps.at(-1)?.status === "running") job.steps.pop();
    job.failedStep = null;
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
export async function recoverBackgroundWork(): Promise<void> {
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
      }));
    } else if (["queued", "paused", "running"].includes(job.status)) launch(record.id);
  }
}
export async function backgroundWorkSummaries(): Promise<BackgroundSummary[]> {
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
                : job?.kind !== "story" && !state.villagers.some((resident) => resident.characterId === job?.subjectId);
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
export function startBackgroundWork(options: { now?: () => number } = {}): () => void {
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
/** Tests await jobs without altering production request latency. */
export async function settleBackgroundWork(): Promise<void> {
  while (reserving.size || running.size) await Promise.all([...reserving.values(), ...running.values()]);
}

/** Compact raw ledger inspection: no reconciliation, pruning, resume, or village read. */
export async function previewBackgroundJobs(defaultBatchSize?: number) {
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, KIND);
  return records.flatMap((record) => {
    const job = record.data as Job;
    if (!job || !Array.isArray(job.steps)) return [];
    const completedSteps =
      job.completedCount || job.steps.filter((step, i) => step.status === "completed" && i !== job.failedStep).length;
    const context = asRecord(asRecord(job.input).context);
    const blocks = Array.isArray(context.blocks) ? context.blocks.length : 0;
    const batch = Number(job.settings?.translationBatchSize) || defaultBatchSize;
    const planned =
      job.kind === "agenda"
        ? agendaRequestCount(VILLAGE_WEEKDAYS)
        : job.kind === "translation" && batch
          ? translationRequestCount(blocks, batch)
          : null;
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
          ["completed", "obsolete"].includes(job.status) || job.hasResult
            ? 0
            : planned === null
              ? null
              : remainingRequests(planned, completedSteps),
        cause: job.finite
          ? "Player-requested generation"
          : job.kind === "translation"
            ? "Automatic: schedule or village context changed"
            : "Automatic: village time or resident agenda update",
        remainingBlocks: job.kind === "translation" ? blocks : null,
      },
    ];
  });
}
