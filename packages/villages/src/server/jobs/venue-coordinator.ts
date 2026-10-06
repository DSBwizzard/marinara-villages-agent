import { VILLAGES_PACKAGE_ID, villagesDocuments, villagesLogger } from "../adapters/engine/runtime-host.js";
import { runtimeDebug } from "../adapters/observability/runtime-debug.js";
import {
  assertVenueOwnership,
  context,
  type Context,
  operationSummary,
  sceneRevision,
  venueRefusal,
} from "../adapters/operations/operation-context.js";
import type { VenueOperation } from "../domain/models/operation-model.js";
import { safeFailureMessage, VillagesRequestError } from "../domain/rules/errors.js";
import { coerceInterpretationSettings, type InterpretationSettings } from "../domain/rules/interpretation-policy.js";
import { coerceWorkFailure } from "../domain/rules/work-failure.js";
import { readInterpretationSettings } from "../features/settings/interpretation-settings.js";
import { randomUUID } from "node:crypto";

export {
  VenueOperation,
  venueRefusal,
  sceneRevision,
  operationSummary,
  outsideVenueOperation,
  venueSavedCheckpoint,
  venueOperationSignal,
  venueOperationId,
  venueRequestMetrics,
  assertVenueOwnership,
  venueOperationSnapshot,
  venueOperationInput,
  venueDebugContext,
} from "../adapters/operations/operation-context.js";

const live = new Map<
  string,
  { id: string; input: string; task: Promise<unknown>; drained: Promise<void>; controller: AbortController }
>();
const prefix = "villages-venue-visit-";
let accepting = true;

export function hasVenueOperation(id: string): boolean {
  return live.has(id);
}

export function venueInterpretationSettings(): InterpretationSettings {
  return coerceInterpretationSettings(context.getStore()?.operation.interpretationSettings);
}

/** Record uncertain billing before an explicit retry or replacement. */
function acknowledgeUnknownAttempts(data: Record<string, unknown>, operation: VenueOperation) {
  const uncertain = Object.entries(operation.attempts).filter(([, attempt]) => attempt.status === "dispatching");
  const receipts = (data.generationReceipts ?? []) as { attemptId: string }[];
  if (uncertain.length && !receipts.some((receipt) => receipt.attemptId === operation.attemptId))
    data.generationReceipts = [
      ...receipts,
      {
        operationId: operation.id,
        attemptId: operation.attemptId,
        stages: uncertain.map(([stage]) => stage),
        outcome: "unknown",
        acknowledgedAt: new Date().toISOString(),
      },
    ];
  for (const [, attempt] of uncertain) attempt.status = "interrupted";
}

/** Optional calls cannot leave a required checkpoint blocked or repeat a possibly billed request. */
export async function coordinatedOptionalCompletion<T>(
  fingerprint: string,
  work: (signal: AbortSignal) => Promise<T>,
): Promise<T | undefined> {
  const current = context.getStore();
  if (!current) return undefined;
  assertVenueOwnership();
  const prior = current.operation.optionalAttempts?.[fingerprint];
  if (prior) return prior.status === "complete" ? (structuredClone(prior.result) as T) : undefined;
  if (!current.allowPaid) return undefined;
  current.decisionRemainingMs ??= Math.max(
    0,
    10_000 -
      Object.values(current.operation.optionalAttempts ?? {}).reduce((sum, attempt) => sum + attempt.elapsedMs, 0),
  );
  if (current.decisionRemainingMs <= 0) return undefined;
  const allowance = current.decisionRemainingMs;
  const receipt = {
    status: "dispatching" as "dispatching" | "complete" | "unknown",
    elapsedMs: allowance,
    result: undefined as T | undefined,
  };
  (current.operation.optionalAttempts ??= {})[fingerprint] = receipt;
  await persist(current);
  const started = performance.now();
  const timeout = new AbortController();
  const signal = AbortSignal.any([current.controller.signal, timeout.signal]);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  try {
    const expired = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(signal.reason);
      signal.addEventListener("abort", onAbort, { once: true });
      timer = setTimeout(() => {
        timeout.abort();
        reject(new Error("Optional Decisions allowance expired"));
      }, allowance);
    });
    const result = await Promise.race([work(signal), expired]);
    assertVenueOwnership();
    receipt.status = "complete";
    receipt.result = structuredClone(result);
    return result;
  } catch {
    current.controller.signal.throwIfAborted();
    receipt.status = "unknown";
    return undefined;
  } finally {
    if (onAbort) signal.removeEventListener("abort", onAbort);
    clearTimeout(timer);
    receipt.elapsedMs = Math.min(allowance, Math.ceil(performance.now() - started));
    current.decisionRemainingMs = Math.max(0, allowance - receipt.elapsedMs);
    await persist(current);
  }
}

/** Keep admitted interaction rules stable across package upgrades and retries. */

async function update(id: string, mutate: (data: Record<string, unknown>) => void) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const store = villagesDocuments();
    const record = await store.getById(VILLAGES_PACKAGE_ID, prefix + id);
    if (!record) throw new VillagesRequestError(404, "That Scene is no longer available.");
    const data = structuredClone(record.data) as Record<string, unknown>;
    mutate(data);
    const saved = await store.update({
      id: record.id,
      packageId: VILLAGES_PACKAGE_ID,
      expectedRevision: record.revision,
      name: record.name,
      description: record.description,
      data,
      updatedAt: new Date().toISOString(),
    });
    if (saved) return data;
  }
  throw venueRefusal("SCENE_BUSY", "The Scene is changing. Refresh and try again.");
}
async function persist(current: Context) {
  assertVenueOwnership();
  await update(current.sessionId, (data) => {
    assertVenueOwnership(data);
    data.operation = structuredClone(current.operation);
  });
}

/** A completed stage is replayable without paying for it again. */
export async function venueCheckpoint<T>(stage: string, work: () => Promise<T>): Promise<T> {
  const current = context.getStore();
  if (!current) return work();
  assertVenueOwnership();
  if (Object.hasOwn(current.operation.checkpoints, stage))
    return structuredClone(current.operation.checkpoints[stage]) as T;
  current.operation.stage = stage;
  await persist(current);
  const result = await context.run({ ...current, scope: stage }, work);
  assertVenueOwnership();
  if (
    current.blocked.has(stage) ||
    Object.entries(current.operation.attempts).some(
      ([key, attempt]) => key.startsWith(stage + ":") && attempt.status === "dispatching",
    )
  )
    throw venueRefusal(
      "OPERATION_INTERRUPTED",
      "The previous request may have been billed. Explicitly retry the saved request to recover the unfinished stage.",
    );
  current.operation.checkpoints[stage] = structuredClone(result);
  await persist(current);
  return result;
}

/** Journal each provider attempt before dispatch. */
export async function coordinatedCompletion<T>(
  fingerprint: string,
  work: (signal?: AbortSignal) => Promise<T>,
  legacyFingerprint?: string,
): Promise<T> {
  const current = context.getStore();
  if (!current) return work();
  assertVenueOwnership();
  const index = current.counts.get(current.scope) ?? 0;
  current.counts.set(current.scope, index + 1);
  const key = `${current.scope}:${index}:${fingerprint}`;
  const legacyKey = legacyFingerprint ? `${current.scope}:${index}:${legacyFingerprint}` : undefined;
  const legacy = legacyFingerprint
    ? current.operation.attempts[`${current.scope}:${index}:${legacyFingerprint}`]
    : undefined;
  // Only exact completed legacy inputs can be replayed; never override a newer rejected or unknown attempt.
  const prior = current.operation.attempts[key] ?? (legacy?.status === "complete" ? legacy : undefined);
  current.usedAttemptKeys.set(
    `${current.scope}:${index}`,
    current.operation.attempts[key] || !legacyKey || legacy?.status !== "complete" ? key : legacyKey,
  );
  if (prior?.status === "complete") {
    runtimeDebug("completion replay", { key });
    return structuredClone(prior.result) as T;
  }
  if (!current.allowPaid) {
    current.blocked.add(current.scope);
    throw venueRefusal(
      "OPERATION_INTERRUPTED",
      "The previous request may have been billed. Review your draft and explicitly retry to authorize another request.",
    );
  }
  current.operation.attempts[key] = { status: "dispatching" };
  await persist(current);
  const started = performance.now();
  const result = await work(current.controller.signal);
  assertVenueOwnership();
  current.operation.attempts[key] = {
    status: "complete",
    elapsedMs: Math.round(performance.now() - started),
    result: structuredClone(result),
  };
  await persist(current);
  villagesLogger().info(
    "[villages] operation %s stage=%s attempt=%d durationMs=%d usage=%s",
    current.operation.id,
    current.scope,
    index + 1,
    Math.round(performance.now() - started),
    JSON.stringify((result as { usage?: unknown })?.usage ?? {}),
  );
  return result;
}

/** A returned but invalid result has a known outcome; explicit retry may replace it. */
export async function rejectVenueCompletion(): Promise<void> {
  const current = context.getStore();
  if (!current) return;
  assertVenueOwnership();
  const index = (current.counts.get(current.scope) ?? 0) - 1;
  const key = current.usedAttemptKeys.get(`${current.scope}:${index}`);
  if (key && current.operation.attempts[key]?.status === "complete") {
    current.operation.attempts[key] = { status: "rejected" };
    await persist(current);
  }
}

export async function coordinateVenue<T>(
  sessionId: string,
  id: string,
  kind: string,
  input: Record<string, unknown>,
  expected: number | undefined,
  retryOfAttemptId: string | undefined,
  work: () => Promise<T>,
  options: { replay?: boolean; recovery?: boolean; replaceOfOperationId?: string } = {},
): Promise<T> {
  const nested = context.getStore();
  if (nested?.sessionId === sessionId) {
    assertVenueOwnership();
    return work();
  }
  if (!accepting) throw venueRefusal("OPERATION_INTERRUPTED", "Villages is shutting down. Refresh after restart.");
  const fingerprint = JSON.stringify(input);
  const running = live.get(sessionId);
  if (running) {
    if (running.id === id) {
      if (running.input !== fingerprint)
        throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different line.");
      return running.task as Promise<T>;
    }
    throw venueRefusal(
      "SCENE_BUSY",
      "This Scene is responding. Your draft is preserved; read the reply before sending again.",
    );
  }
  const controller = new AbortController();
  const deadline = setTimeout(
    () =>
      controller.abort(
        venueRefusal(
          "OPERATION_INTERRUPTED",
          "The scene request timed out. It may have been billed; explicitly retry after reviewing the scene.",
        ),
      ),
    300_000,
  );
  const task = Promise.resolve().then(async () => {
    const capturedInterpretationSettings = await readInterpretationSettings();
    let operation!: VenueOperation;
    let authorizedRetry = false;
    await update(sessionId, (data) => {
      controller.signal.throwIfAborted();
      const prior = data.operation as VenueOperation | undefined;
      if (prior?.id === id && JSON.stringify(prior.input) !== fingerprint)
        throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different line.");
      if (options.replaceOfOperationId) {
        const committed = (data.submissions as { id: string }[] | undefined)?.some((entry) => entry.id === prior?.id);
        if (
          !prior ||
          prior.id !== options.replaceOfOperationId ||
          prior.id === id ||
          prior.attemptId !== retryOfAttemptId ||
          prior.status === "running"
        )
          throw venueRefusal(
            "OPERATION_INTERRUPTED",
            "The failed request changed. Review the updated Scene before resending.",
          );
        if (
          kind !== "turn" ||
          input.mode !== "chat" ||
          prior.kind !== "turn" ||
          prior.input.mode !== "chat" ||
          (!prior.error && prior.status === "complete") ||
          committed ||
          Object.keys(prior.checkpoints).length ||
          sceneRevision(data) !== prior.sceneRevision
        )
          throw venueRefusal(
            "OPERATION_INTERRUPTED",
            "Recover the saved request before sending an edited message. Your edits are preserved.",
          );
        acknowledgeUnknownAttempts(data, prior);
      }
      if (prior && prior.status !== "complete" && prior.id !== id && !options.replaceOfOperationId)
        throw venueRefusal(
          "OPERATION_INTERRUPTED",
          "Recover or explicitly retry the interrupted scene before starting another operation.",
        );
      if (
        !options.replay &&
        !options.recovery &&
        data.status !== "closed" &&
        Date.now() - Date.parse(String(data.lastActivityAt || data.startedAt)) >= 30 * 60_000
      )
        throw new VillagesRequestError(410, "Interrupted: Inactivity. This Scene ended while you were away.");
      if (!options.replay && expected !== undefined && expected !== sceneRevision(data))
        throw venueRefusal(
          "SCENE_STALE",
          "The scene changed in another tab. Your draft is preserved; review the updated scene before sending again.",
        );
      if (prior?.id === id && prior.status !== "complete") {
        authorizedRetry = retryOfAttemptId === prior.attemptId;
        if (!options.recovery && !options.replay && retryOfAttemptId !== prior.attemptId)
          throw venueRefusal(
            "OPERATION_INTERRUPTED",
            "The previous request may have been billed. Review your draft and explicitly retry to authorize another request.",
          );
        if (authorizedRetry) acknowledgeUnknownAttempts(data, prior);
        operation = {
          ...prior,
          token: randomUUID(),
          attemptId: options.recovery ? prior.attemptId : randomUUID(),
          status: "running",
          error: "",
        };
      } else {
        const { operation: _old, ...snapshot } = data;
        operation = {
          id,
          interpretationSettings: capturedInterpretationSettings,
          kind,
          input,
          token: randomUUID(),
          attemptId: randomUUID(),
          status: "running",
          stage: "admission",
          startedAt: new Date().toISOString(),
          sceneRevision: sceneRevision(data),
          snapshot,
          checkpoints: {},
          attempts: {},
          error: "",
        };
      }
      data.operation = operation;
      if (!options.replay && data.status !== "closed") data.lastActivityAt = new Date().toISOString();
    });
    const current: Context = {
      sessionId,
      operation,
      controller,
      allowPaid: !options.recovery && (!options.replay || authorizedRetry),
      scope: kind,
      counts: new Map(),
      usedAttemptKeys: new Map(),
      blocked: new Set(),
    };
    return context.run(current, async () => {
      try {
        const result = await work();
        assertVenueOwnership();
        if (current.blocked.size)
          throw venueRefusal(
            "OPERATION_INTERRUPTED",
            "The saved request still needs explicit authorization for unfinished provider work.",
          );
        operation.status = Object.values(operation.attempts).some((attempt) => attempt.status === "dispatching")
          ? "interrupted"
          : "complete";
        operation.stage = operation.status;
        if (operation.status === "complete") {
          operation.snapshot = null;
          operation.checkpoints = {};
          operation.attempts = {};
        } else operation.error = "The previous request may have been billed. No automatic retry was made.";
        await persist(current).catch((error) => {
          if (error?.statusCode !== 404) throw error;
        });
        if (result && typeof result === "object") {
          const payload = result as Record<string, unknown>;
          const session = (payload.session ?? payload) as Record<string, unknown>;
          if ((session.operation as VenueOperation | undefined)?.id === operation.id) session.operation = operation;
        }
        return result;
      } catch (error) {
        try {
          villagesLogger().warn(
            "[villages] scene=%s stage=%s failed: %s",
            sessionId,
            operation.stage,
            safeFailureMessage(error),
          );
        } catch {
          /* Diagnostics cannot replace the request failure. */
        }
        // Revoked owners cannot overwrite a successor or resurrect a discarded visit.
        await update(sessionId, (data) => {
          if ((data.operation as VenueOperation | undefined)?.token !== operation.token) return;
          operation.status =
            Object.values(operation.attempts).some((attempt) => attempt.status === "dispatching") ||
            operation.checkpoints["turn-reply"] ||
            operation.checkpoints["contact-response"] ||
            operation.checkpoints["contact-relay-response"] ||
            operation.checkpoints["action-reply"] ||
            operation.checkpoints["greeting-reply"] ||
            operation.checkpoints["move-invitation"] ||
            ((operation.kind === "memory" || operation.kind === "close") &&
              Object.keys(operation.attempts).length > 0) ||
            (data.submissions as { id: string }[] | undefined)?.some((entry) => entry.id === operation.id)
              ? "interrupted"
              : "complete";
          operation.error = safeFailureMessage(error);
          operation.failure = coerceWorkFailure((error as { failure?: unknown })?.failure);
          data.operation = operation;
        }).catch(() => {});
        throw error;
      }
    });
  });
  let onAbort: () => void = () => {};
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener("abort", onAbort, { once: true });
  });
  const settled = Promise.race([task, aborted]);
  let drain!: () => void;
  const drained = new Promise<void>((resolve) => {
    drain = resolve;
  });
  live.set(sessionId, { id, input: fingerprint, task: settled, drained, controller });
  try {
    return await settled;
  } finally {
    clearTimeout(deadline);
    controller.signal.removeEventListener("abort", onAbort);
    if (controller.signal.aborted)
      await update(sessionId, (data) => {
        const operation = data.operation as VenueOperation | undefined;
        if (operation?.status === "running" && live.get(sessionId)?.task === settled) {
          operation.token = randomUUID();
          operation.status = "interrupted";
          operation.error = "The previous request may have been billed. No automatic retry was made.";
        }
      }).catch(() => {});
    if (live.get(sessionId)?.task === settled) live.delete(sessionId);
    drain();
  }
}

export async function cancelVenueOperation(id: string) {
  live.get(id)?.controller.abort(venueRefusal("OPERATION_INTERRUPTED", "The scene operation was cancelled."));
  live.delete(id);
  await update(id, (data) => {
    const operation = data.operation as VenueOperation | undefined;
    if (operation && operation.status !== "complete") {
      const uncertain = Object.entries(operation.attempts).filter(([, attempt]) => attempt.status === "dispatching");
      const receipts = (data.generationReceipts ?? []) as { attemptId: string }[];
      if (uncertain.length && !receipts.some((receipt) => receipt.attemptId === operation.attemptId))
        data.generationReceipts = [
          ...receipts,
          {
            operationId: operation.id,
            attemptId: operation.attemptId,
            stages: uncertain.map(([key]) => key),
            outcome: "unknown",
            acknowledgedAt: new Date().toISOString(),
          },
        ];
      operation.token = randomUUID();
      operation.status = "complete";
      operation.snapshot = null;
      operation.checkpoints = {};
      operation.attempts = {};
    }
  });
}
export async function readVenueOperation(id: string, operationId?: string) {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, prefix + id);
  if (!record) throw new VillagesRequestError(404, "That Scene is no longer available.");
  const data = record.data as Record<string, unknown>;
  const operation = data.operation as VenueOperation | undefined;
  if (operationId && operation?.id !== operationId) {
    const saved = (data.submissions as { id: string }[] | undefined)?.some((item) => item.id === operationId);
    return saved ? { id: operationId, status: "complete", input: null } : null;
  }
  return operation
    ? {
        ...operationSummary(operation),
        id: operation.id,
        status: operation.status,
        kind: operation.kind,
        error: operation.error,
        input: operation.input,
        attemptId: operation.attemptId,
      }
    : null;
}
export async function recoverVenueOperations(recover: (id: string, operation: VenueOperation) => Promise<unknown>) {
  accepting = true;
  const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, "venue-visit");
  for (const record of records) {
    const data = record.data as Record<string, unknown>;
    const operation = data.operation as VenueOperation | undefined;
    if (!operation || operation.status === "complete" || live.has(String(data.id))) continue;
    await update(String(data.id), (saved) => {
      const op = saved.operation as VenueOperation;
      op.status = "interrupted";
      op.error = "The generation was interrupted. Its outcome may be unknown. No automatic retry was made.";
    });
    await recover(String(data.id), operation).catch((error) =>
      villagesLogger().warn("[villages] operation recovery deferred %s: %s", operation.id, String(error)),
    );
  }
}
export async function stopVenueCoordinator() {
  accepting = false;
  const tasks = [...live.values()];
  for (const task of tasks)
    task.controller.abort(venueRefusal("OPERATION_INTERRUPTED", "Villages stopped before this scene completed."));
  await Promise.allSettled(tasks.map((task) => task.drained));
}
