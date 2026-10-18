import { retainLateProviderResponse } from "../adapters/models/provider-deadline.js";
import { semanticBlocker } from "../domain/rules/semantic-continuity.js";
import type { VenueScene } from "../domain/models/scene-model.js";
import { withVillageClockWork } from "../adapters/time/clock-gate.js";
import { asRecord } from "../domain/rules/coerce.js";
import { createDocumentMutator } from "../adapters/storage/document-store.js";
import {
  boundedRejectedText,
  rejectedSyntaxError,
  retainRejectedResponses,
  type RejectedResponse,
  type RejectedResponseContext,
} from "../domain/rules/rejected-response.js";
import { VILLAGES_PACKAGE_ID } from "../adapters/engine/runtime-host.js";
import type { CapabilityDocumentStore, CapabilityRuntimeLogger } from "@marinara-engine/shared";
import type { runtimeDebug } from "../adapters/observability/runtime-debug.js";
import { operationSummary } from "../adapters/operations/operation-context.js";
import type { Context, VenueOperationContext } from "../adapters/operations/operation-context-service.js";
import type { VenueOperation } from "../domain/models/operation-model.js";
import { safeFailureMessage, VillagesRequestError } from "../domain/rules/errors.js";
import { coerceInterpretationSettings, type InterpretationSettings } from "../domain/rules/interpretation-policy.js";
import { sceneRevision } from "../domain/rules/scene-revision.js";
import { coerceWorkFailure } from "../domain/rules/work-failure.js";
import type { readInterpretationSettings } from "../features/settings/interpretation-settings.js";
import { createHash, randomUUID } from "node:crypto";
import { spinoffLocksScene } from "../domain/models/spinoff-model.js";
export interface VenueCoordinatorPorts {
  operations: VenueOperationContext;
  villagesDocuments(): CapabilityDocumentStore;
  villagesLogger(): CapabilityRuntimeLogger;
  runtimeDebug: typeof runtimeDebug;
  readInterpretationSettings: typeof readInterpretationSettings;
}
/** Each application owns its live Scene operations and shutdown admission. */
export function createVenueCoordinator(ports: VenueCoordinatorPorts) {
  const attentionStages = (operation: VenueOperation) => [
    "attention-plan",
    `attention-routing:${operation.id}`,
    `attention-routing:${operation.id}-system`,
    ...(operation.input.interactionScopeVersion === 5
      ? ["acoustic-layout", `acoustic-routing:${operation.id}`, `acoustic-routing:${operation.id}-system`]
      : []),
    ...(operation.input.interactionScopeVersion === 6 ? ["scene-layout"] : []),
  ];
  const attentionAttempt = (operation: VenueOperation, key: string) =>
    attentionStages(operation).some((stage) => key.startsWith(stage + ":"));
  const { villagesDocuments, villagesLogger, runtimeDebug, readInterpretationSettings } = ports;
  const { context, assertVenueOwnership, venueRefusal } = ports.operations;
  const live = new Map<
    string,
    { id: string; input: string; task: Promise<unknown>; drained: Promise<void>; controller: AbortController }
  >();
  const prefix = "villages-venue-visit-";
  let accepting = true;

  function hasVenueOperation(id: string): boolean {
    return live.has(id);
  }

  function venueInterpretationSettings(): InterpretationSettings {
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
  async function coordinatedOptionalCompletion<T>(
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
  async function venueCheckpoint<T>(stage: string, work: () => Promise<T>): Promise<T> {
    const current = context.getStore();
    if (!current) return work();
    assertVenueOwnership();
    const started = performance.now();
    const record = (reused: boolean) => {
      const timing = current.operation.timing;
      if (timing)
        timing.stages = [...timing.stages, { stage, elapsedMs: Math.round(performance.now() - started), reused }].slice(
          -32,
        );
    };
    if (Object.hasOwn(current.operation.checkpoints, stage)) {
      record(true);
      return structuredClone(current.operation.checkpoints[stage]) as T;
    }
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
    record(false);
    current.operation.checkpoints[stage] = structuredClone(result);
    await persist(current);
    return result;
  }

  /** Journal each provider attempt before dispatch. */
  async function coordinatedCompletion<T>(
    fingerprint: string,
    work: (signal?: AbortSignal) => Promise<T>,
    legacyFingerprint?: string,
    reservation?: { inputTokens: number; outputTokens: number },
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
    const signature = JSON.stringify([
      current.sessionId,
      current.operation.id,
      current.operation.sceneRevision,
      current.operation.input,
      key,
    ]);
    const lateId = "villages-generation-response-" + createHash("sha256").update(signature).digest("hex");
    // A policy upgrade may replay a completed late response too. A newer exact attempt always wins.
    for (const savedKey of current.operation.attempts[key] || !legacyKey ? [key] : [key, legacyKey]) {
      const savedSignature = JSON.stringify([
        current.sessionId,
        current.operation.id,
        current.operation.sceneRevision,
        current.operation.input,
        savedKey,
      ]);
      const savedId = "villages-generation-response-" + createHash("sha256").update(savedSignature).digest("hex");
      const late = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, savedId);
      const lateData = asRecord(late?.data);
      if (lateData.signature === savedSignature && lateData.status === "complete") {
        current.operation.attempts[savedKey] = { status: "complete", result: structuredClone(lateData.result) };
        current.usedAttemptKeys.set(`${current.scope}:${index}`, savedKey);
        await persist(current);
        return structuredClone(lateData.result) as T;
      }
    }
    if (!current.allowPaid) {
      current.blocked.add(current.scope);
      throw venueRefusal(
        "OPERATION_INTERRUPTED",
        "The previous request may have been billed. Review your draft and explicitly retry to authorize another request.",
      );
    }
    const budget = asRecord(current.operation.input.semanticBudget);
    if (current.operation.input.semanticBudget !== undefined || current.operation.snapshot?.semanticVersion === 2) {
      const keys = ["requests", "inputTokens", "outputTokens"] as const;
      if (
        budget.version !== 1 ||
        !keys.every(
          (key) => typeof budget[key] === "number" && Number.isSafeInteger(budget[key]) && Number(budget[key]) > 0,
        )
      )
        throw venueRefusal("SEMANTIC_BUDGET", "The saved model allowance is missing or invalid.");
      const budgetKey = "semantic-budget:" + current.operation.attemptId;
      const saved = asRecord(current.operation.checkpoints[budgetKey]);
      if (
        current.operation.checkpoints[budgetKey] !== undefined &&
        !keys.every(
          (key) => typeof saved[key] === "number" && Number.isSafeInteger(saved[key]) && Number(saved[key]) >= 0,
        )
      )
        throw venueRefusal("SEMANTIC_BUDGET", "The saved model reservation is invalid.");
      if (
        !reservation ||
        ![reservation.inputTokens, reservation.outputTokens].every((value) => Number.isFinite(value) && value >= 0)
      )
        throw venueRefusal("SEMANTIC_BUDGET", "This request lacks its reserved token allowance.");
      const next = {
        requests: Number(saved.requests ?? 0) + 1,
        inputTokens: Number(saved.inputTokens ?? 0) + Math.ceil(reservation.inputTokens),
        outputTokens: Number(saved.outputTokens ?? 0) + Math.ceil(reservation.outputTokens),
      };
      if (
        next.requests > Number(budget.requests) ||
        next.inputTokens > Number(budget.inputTokens) ||
        next.outputTokens > Number(budget.outputTokens)
      )
        throw venueRefusal(
          "SEMANTIC_BUDGET",
          "This attempt reached its model allowance. Saved results remain recoverable.",
        );
      current.operation.checkpoints[budgetKey] = next;
    }
    current.operation.attempts[key] = { status: "dispatching" };
    await persist(current);
    const started = performance.now();
    let result: T;
    try {
      result = await work(current.controller.signal);
    } catch (error) {
      retainLateProviderResponse(error, (value) =>
        ports.operations.outsideVenueOperation(() =>
          createDocumentMutator(villagesDocuments)(
            lateId,
            {
              kind: "generation-response",
              name: "Saved late response",
              description: "Private provider response; no effects applied",
              coerce: (raw) => asRecord(raw),
              label: () => "Saved late response",
            },
            (saved) => {
              if (saved.status === "complete") return false;
              Object.assign(saved, {
                signature,
                status: "complete",
                result: structuredClone(value),
                attemptId: current.operation.attemptId,
              });
            },
          ),
        ),
      );
      throw error;
    }
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

  async function rejectLateReceipt(current: Context, key: string) {
    const signature = JSON.stringify([
      current.sessionId,
      current.operation.id,
      current.operation.sceneRevision,
      current.operation.input,
      key,
    ]);
    const id = "villages-generation-response-" + createHash("sha256").update(signature).digest("hex");
    if (!(await villagesDocuments().getById(VILLAGES_PACKAGE_ID, id))) return;
    await createDocumentMutator(villagesDocuments)(
      id,
      {
        kind: "generation-response",
        name: "Saved late response",
        description: "Private rejected provider evidence",
        coerce: (raw) => asRecord(raw),
        label: () => "Saved late response",
      },
      (saved) => {
        if (saved.signature !== signature || saved.status === "rejected") return false;
        saved.status = "rejected";
      },
    );
  }

  async function retainRejectedCompletion(
    current: Context,
    stage: string,
    result: { content?: unknown; finishReason?: unknown } | undefined,
    detail?: RejectedResponseContext,
  ) {
    if (detail && typeof result?.content === "string") {
      try {
        const entry: RejectedResponse = {
          model: String(detail.model ?? "unknown").slice(0, 160),
          connectionId: String(detail.connectionId ?? "unknown").slice(0, 160),
          reason: String(detail.reason ?? "unknown").slice(0, 80),
          sceneId: current.sessionId,
          operationId: current.operation.id,
          attemptId: current.operation.attemptId,
          stage,
          capturedAt: new Date().toISOString(),
          finishReason: String(result.finishReason ?? "unknown").slice(0, 80),
          responseLength: result.content.length,
          content: boundedRejectedText(result.content),
          truncated: result.content.length > 24_000,
          syntaxError: rejectedSyntaxError(result.content),
        };
        await createDocumentMutator(villagesDocuments)(
          "villages-rejected-responses",
          {
            kind: "private-diagnostics",
            name: "Rejected model responses",
            description: "Latest five rejected Scene replies; server-only diagnostic evidence.",
            coerce: (raw) => ({
              entries: Array.isArray((raw as { entries?: unknown } | null)?.entries)
                ? (raw as { entries: RejectedResponse[] }).entries
                : [],
            }),
            label: () => "Rejected model responses",
          },
          (state) => {
            state.entries = retainRejectedResponses(state.entries, entry);
          },
        );
      } catch {
        try {
          villagesLogger().warn("[villages] Could not retain private rejected-response diagnostics");
        } catch {
          /* Diagnostics cannot replace rejection. */
        }
      }
    }
  }

  /** A returned but invalid result has a known outcome; explicit retry may replace it. */
  async function rejectVenueCompletion(
    detail?: RejectedResponseContext,
    options?: { preserveWriting?: boolean; stages?: string[] },
  ): Promise<void> {
    const current = context.getStore();
    if (!current) return;
    assertVenueOwnership();
    // Core rejection permits a deliberate replacement. Capture-only failures never call this.
    if (options?.stages?.length && !options.stages.includes(current.scope)) {
      for (const stage of options.stages) {
        delete current.operation.checkpoints[stage];
        for (const [key, attempt] of Object.entries(current.operation.attempts))
          if (key.startsWith(stage + ":") && attempt.status === "complete") {
            await retainRejectedCompletion(
              current,
              stage,
              attempt.result as { content?: unknown; finishReason?: unknown },
              detail,
            );
            attempt.status = "rejected";
            await rejectLateReceipt(current, key);
          }
      }
      await persist(current);
      return;
    }
    const writingStages = Object.keys(current.operation.checkpoints).filter(
      (stage) =>
        options?.stages?.includes(stage) || (!options?.preserveWriting && stage.startsWith("writing-completion:")),
    );
    for (const stage of writingStages) {
      delete current.operation.checkpoints[stage];
      for (const [key, attempt] of Object.entries(current.operation.attempts))
        if (key.startsWith(stage + ":") && attempt.status === "complete") {
          await retainRejectedCompletion(
            current,
            stage,
            attempt.result as { content?: unknown; finishReason?: unknown },
            detail,
          );
          attempt.status = "rejected";
          await rejectLateReceipt(current, key);
        }
    }
    if (writingStages.length) await persist(current);
    const index = (current.counts.get(current.scope) ?? 0) - 1;
    const key = current.usedAttemptKeys.get(`${current.scope}:${index}`);
    if (key && current.operation.attempts[key]?.status === "complete") {
      const result = current.operation.attempts[key]?.result as
        { content?: unknown; finishReason?: unknown } | undefined;
      current.operation.attempts[key] = { status: "rejected" };
      await rejectLateReceipt(current, key);
      await persist(current);
      await retainRejectedCompletion(current, current.scope, result, detail);
    }
  }

  async function coordinateVenue<T>(
    sessionId: string,
    id: string,
    kind: string,
    input: Record<string, unknown>,
    expected: number | undefined,
    retryOfAttemptId: string | undefined,
    work: () => Promise<T>,
    options: {
      replay?: boolean;
      recovery?: boolean;
      replaceOfOperationId?: string;
      abandonOfOperationId?: string;
    } = {},
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
      const runStarted = performance.now();
      const runStartedAt = new Date().toISOString();
      const capturedInterpretationSettings = await readInterpretationSettings();
      let operation!: VenueOperation;
      let authorizedRetry = false;
      await update(sessionId, (data) => {
        controller.signal.throwIfAborted();
        if (spinoffLocksScene(data.spinoff as import("../domain/models/spinoff-model.js").VillageSpinoff | undefined))
          throw venueRefusal("SCENE_BUSY", "Finish or discard your spinoff before continuing in Villages.");
        const prior = data.operation as VenueOperation | undefined;
        if (prior?.id === id && JSON.stringify(prior.input) !== fingerprint)
          throw venueRefusal("SUBMISSION_MISMATCH", "That submission ID belongs to a different line.");
        let abandoned: VenueOperation | undefined;
        if (options.abandonOfOperationId) {
          if (
            kind !== "close" ||
            id !== "close" ||
            options.recovery ||
            expected === undefined ||
            !prior ||
            prior.status !== "interrupted" ||
            prior.id !== options.abandonOfOperationId ||
            prior.attemptId !== retryOfAttemptId ||
            semanticBlocker({ submissions: (data.submissions ?? []) as VenueScene["submissions"] }) ||
            (data.submissions as { id: string }[] | undefined)?.some((turn) => turn.id === prior.id)
          )
            throw venueRefusal(
              "OPERATION_INTERRUPTED",
              "The failed request changed. Review the Scene before ending it.",
            );
          abandoned = structuredClone(prior);
          acknowledgeUnknownAttempts(data, prior);
        }
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
            Object.keys(prior.checkpoints).some((stage) => !attentionStages(prior).includes(stage)) ||
            Object.entries(prior.attempts).some(
              ([stage, attempt]) => attempt.status === "complete" && !attentionAttempt(prior, stage),
            ) ||
            sceneRevision(data) !== prior.sceneRevision
          )
            throw venueRefusal(
              "OPERATION_INTERRUPTED",
              "Recover the saved request before sending an edited message. Your edits are preserved.",
            );
          acknowledgeUnknownAttempts(data, prior);
        }
        if (prior && prior.status !== "complete" && prior.id !== id && !options.replaceOfOperationId && !abandoned)
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
        if (
          options.recovery &&
          prior?.id === id &&
          prior.status !== "complete" &&
          prior.sceneRevision !== sceneRevision(data) &&
          !(data.submissions as { id: string }[] | undefined)?.some((turn) => turn.id === id) &&
          !(data.navigationReceipts as { id: string }[] | undefined)?.some((receipt) => receipt.id === id)
        )
          throw venueRefusal("SCENE_STALE", "The Scene changed after generation. Saved results are preserved.");
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
          const reuseAttention =
            prior?.id === id &&
            prior.status === "complete" &&
            prior.sceneRevision === sceneRevision(data) &&
            Object.entries(prior.attempts).some(
              ([stage, attempt]) => stage.startsWith("turn-reply:") && attempt.status === "rejected",
            );
          operation = {
            id,
            interpretationSettings: reuseAttention ? prior.interpretationSettings : capturedInterpretationSettings,
            kind,
            input,
            token: randomUUID(),
            attemptId: randomUUID(),
            status: "running",
            stage: "admission",
            startedAt: new Date().toISOString(),
            sceneRevision: sceneRevision(data),
            snapshot,
            checkpoints: abandoned
              ? { "abandoned-request": abandoned }
              : reuseAttention
                ? Object.fromEntries(
                    Object.entries(prior.checkpoints).filter(([stage]) => attentionStages(prior).includes(stage)),
                  )
                : {},
            attempts: {},
            error: "",
          };
        }
        operation.timing = { attemptId: operation.attemptId, startedAt: runStartedAt, stages: [] };
        data.operation = operation;
        if (!options.replay && data.status !== "closed") data.lastActivityAt = new Date().toISOString();
      });
      const current: Context = {
        sessionId,
        operation,
        controller,
        allowPaid:
          !operation.checkpoints["abandoned-request"] &&
          !options.abandonOfOperationId &&
          !options.recovery &&
          (!options.replay || authorizedRetry),
        scope: kind,
        explicitRetry: authorizedRetry,
        counts: new Map(),
        usedAttemptKeys: new Map(),
        blocked: new Set(),
      };
      return withVillageClockWork(() =>
        context.run(current, async () => {
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
            operation.timing!.completedAt = new Date().toISOString();
            operation.timing!.elapsedMs = Math.round(performance.now() - runStarted);
            await update(sessionId, (data) => {
              assertVenueOwnership(data);
              const turn = (data.submissions as { id: string; timing?: VenueOperation["timing"] }[] | undefined)?.find(
                (turn) => turn.id === id,
              );
              if (turn && !turn.timing) turn.timing = structuredClone(operation.timing);
            });
            villagesLogger().info(
              "[villages] operation %s serverElapsedMs=%d stages=%s",
              id,
              operation.timing!.elapsedMs!,
              JSON.stringify(operation.timing!.stages),
            );
            if (operation.status === "complete") {
              operation.snapshot = null;
              operation.checkpoints = operation.checkpoints["abandoned-request"]
                ? { "abandoned-request": operation.checkpoints["abandoned-request"] }
                : {};
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
                Object.values(operation.attempts).some((attempt) => attempt.status === "complete") ||
                operation.checkpoints["turn-reply"] ||
                ((attentionStages(operation).some((stage) => Object.hasOwn(operation.checkpoints, stage)) ||
                  Object.entries(operation.attempts).some(
                    ([stage, attempt]) => attentionAttempt(operation, stage) && attempt.status === "complete",
                  ) ||
                  (attentionStages(operation).includes(operation.stage) &&
                    Object.keys(operation.optionalAttempts ?? {}).length > 0)) &&
                  !Object.entries(operation.attempts).some(
                    ([stage, attempt]) => stage.startsWith("turn-reply:") && attempt.status === "rejected",
                  )) ||
                operation.checkpoints["contact-response"] ||
                operation.checkpoints["contact-relay-response"] ||
                operation.checkpoints["action-reply"] ||
                operation.checkpoints["greeting-reply"] ||
                operation.checkpoints["move-invitation"] ||
                (operation.kind === "close" &&
                  (Object.keys(operation.attempts).length > 0 || !!operation.checkpoints["abandoned-request"])) ||
                (data.submissions as { id: string }[] | undefined)?.some((entry) => entry.id === operation.id) ||
                (data.navigationReceipts as { id: string }[] | undefined)?.some((entry) => entry.id === operation.id)
                  ? "interrupted"
                  : "complete";
              operation.error = safeFailureMessage(error);
              operation.failure = coerceWorkFailure((error as { failure?: unknown })?.failure);
              data.operation = operation;
            }).catch(() => {});
            throw error;
          }
        }),
      );
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

  async function cancelVenueOperation(id: string) {
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
  async function readVenueOperation(id: string, operationId?: string) {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, prefix + id);
    if (!record) throw new VillagesRequestError(404, "That Scene is no longer available.");
    const data = record.data as Record<string, unknown>;
    const operation = data.operation as VenueOperation | undefined;
    if (operationId && operation?.id !== operationId) {
      const saved =
        (data.submissions as { id: string }[] | undefined)?.some((item) => item.id === operationId) ||
        (data.navigationReceipts as { id: string }[] | undefined)?.some((item) => item.id === operationId);
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
  async function recoverVenueOperations(recover: (id: string, operation: VenueOperation) => Promise<unknown>) {
    accepting = true;
    const records = await villagesDocuments().list(VILLAGES_PACKAGE_ID, "venue-visit");
    for (const record of records) {
      const data = record.data as Record<string, unknown>;
      const operation = data.operation as VenueOperation | undefined;
      if (!operation || operation.status === "complete" || live.has(String(data.id))) continue;
      // Expired, uncommitted generation is archived evidence, not work to resume at startup.
      if (
        data.status === "closed" &&
        data.endReason === "inactivity" &&
        ["turn", "greet"].includes(operation.kind) &&
        !(data.submissions as { id: string }[] | undefined)?.some((turn) => turn.id === operation.id) &&
        !(data.navigationReceipts as { id: string }[] | undefined)?.some((receipt) => receipt.id === operation.id) &&
        !Object.hasOwn(operation.checkpoints, "turn-reply") &&
        !Object.hasOwn(operation.checkpoints, "greeting-reply")
      )
        continue;
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
  async function stopVenueCoordinator() {
    accepting = false;
    const tasks = [...live.values()];
    for (const task of tasks)
      task.controller.abort(venueRefusal("OPERATION_INTERRUPTED", "Villages stopped before this scene completed."));
    await Promise.allSettled(tasks.map((task) => task.drained));
  }

  return {
    hasVenueOperation,
    venueInterpretationSettings,
    coordinatedOptionalCompletion,
    venueCheckpoint,
    coordinatedCompletion,
    rejectVenueCompletion,
    coordinateVenue,
    cancelVenueOperation,
    readVenueOperation,
    recoverVenueOperations,
    stopVenueCoordinator,
  };
}
export type VenueCoordinatorService = ReturnType<typeof createVenueCoordinator>;
