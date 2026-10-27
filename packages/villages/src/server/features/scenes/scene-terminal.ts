import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import type { DocumentSlot } from "../../adapters/storage/document-store.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { SceneTerminal } from "../../domain/models/scene-terminal-model.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { isSceneTurnOutcome } from "../../../shared/contracts/scene-turn-outcome.js";

export const SCENE_TERMINAL_KIND = "scene-terminal";
export const SCENE_TERMINAL_PREFIX = "villages-scene-terminal-";
function slot(id: string): DocumentSlot<SceneTerminal> {
  return {
    kind: SCENE_TERMINAL_KIND,
    name: "Completed Scene receipt",
    description: "Request outcomes and saved notices without a transcript.",
    label: () => "Completed Scene receipt",
    coerce(value) {
      const raw = asRecord(value);
      if (!value)
        return {
          version: 1,
          sceneId: id,
          villageSeed: "",
          sourceRevision: 0,
          sceneRevision: 0,
          endedAt: "",
          endReason: "",
          submissions: [],
          navigationReceipts: [],
          rejectedSubmissions: [],
          generationReceipts: [],
          recordEvents: [],
        };
      if (
        raw.version !== 1 ||
        raw.sceneId !== id ||
        typeof raw.villageSeed !== "string" ||
        !raw.villageSeed ||
        !Number.isSafeInteger(raw.sourceRevision) ||
        Number(raw.sourceRevision) < 1 ||
        !Number.isSafeInteger(raw.sceneRevision) ||
        Number(raw.sceneRevision) < 0 ||
        typeof raw.endedAt !== "string" ||
        !["player", "scene", "inactivity", "debug", ""].includes(String(raw.endReason)) ||
        !Array.isArray(raw.submissions) ||
        !Array.isArray(raw.navigationReceipts) ||
        !Array.isArray(raw.rejectedSubmissions) ||
        !Array.isArray(raw.generationReceipts) ||
        !Array.isArray(raw.recordEvents)
      )
        throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      if (
        raw.submissions.some((value) => {
          const row = asRecord(value);
          return (
            typeof row.id !== "string" ||
            !row.id ||
            typeof row.inputHash !== "string" ||
            !/^[a-f0-9]{64}$/u.test(row.inputHash)
          );
        })
      )
        throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      if (
        raw.rejectedSubmissions.some((value) => {
          const row = asRecord(value);
          return (
            typeof row.id !== "string" ||
            !row.id ||
            typeof row.inputHash !== "string" ||
            !/^[a-f0-9]{64}$/u.test(row.inputHash) ||
            !Number.isSafeInteger(row.sceneRevision) ||
            !isSceneTurnOutcome(row.turnOutcome)
          );
        })
      )
        throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      if (
        raw.navigationReceipts.some((value) => {
          const row = asRecord(value);
          return ["id", "originZoneId", "destinationZoneId", "at"].some((key) => typeof row[key] !== "string");
        })
      )
        throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      if (
        raw.generationReceipts.some((value) => {
          const row = asRecord(value);
          return (
            typeof row.operationId !== "string" ||
            typeof row.attemptId !== "string" ||
            row.outcome !== "unknown" ||
            typeof row.acknowledgedAt !== "string" ||
            !Array.isArray(row.stages) ||
            row.stages.some((stage) => typeof stage !== "string")
          );
        })
      )
        throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      if (
        raw.recordEvents.some((value) => {
          const row = asRecord(value);
          return (
            typeof row.id !== "string" ||
            typeof row.text !== "string" ||
            !["memory", "wish", "venue", "request", "project", "relationship-up", "relationship-down"].includes(
              String(row.kind),
            )
          );
        })
      )
        throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      if (raw.operation !== undefined) {
        const operation = asRecord(raw.operation);
        if (
          operation.status !== "complete" ||
          typeof operation.id !== "string" ||
          typeof operation.kind !== "string" ||
          typeof operation.attemptId !== "string" ||
          (operation.turnOutcome !== undefined && !isSceneTurnOutcome(operation.turnOutcome))
        )
          throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      }
      if (
        raw.optionalAttempts !== undefined &&
        Object.values(asRecord(raw.optionalAttempts)).some((value) => {
          const attempt = asRecord(value);
          return (
            !["complete", "unknown"].includes(String(attempt.status)) ||
            typeof attempt.elapsedMs !== "number" ||
            !Number.isFinite(attempt.elapsedMs)
          );
        })
      )
        throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      if (raw.abandonedRequest !== undefined) {
        const abandoned = asRecord(raw.abandonedRequest);
        if (["id", "kind", "attemptId"].some((key) => typeof abandoned[key] !== "string" || !abandoned[key]))
          throw new Error("Saved Scene receipt is invalid; Scene cleanup is deferred.");
      }
      return structuredClone(raw) as SceneTerminal;
    },
  };
}

export function terminalForScene(scene: VenueScene, sourceRevision: number): SceneTerminal {
  if (!scene.villageSeed || scene.status !== "closed" || !Number.isSafeInteger(sourceRevision) || sourceRevision < 1)
    throw new Error("Scene is not ready for a terminal receipt.");
  const abandoned = asRecord(scene.operation?.checkpoints?.["abandoned-request"]);
  if (
    scene.operation?.checkpoints?.["abandoned-request"] &&
    ["id", "kind", "attemptId"].some((key) => typeof abandoned[key] !== "string" || !abandoned[key])
  )
    throw new Error("Abandoned Scene request identity is invalid; Scene cleanup is deferred.");
  const optionalAttempts = Object.fromEntries(
    Object.entries(scene.operation?.optionalAttempts ?? {}).map(([id, attempt]) => [
      id,
      { status: attempt.status, elapsedMs: attempt.elapsedMs },
    ]),
  );
  if (Object.values(optionalAttempts).some((attempt) => attempt.status === "dispatching"))
    throw new Error("Optional Scene work is still in progress.");
  return {
    version: 1,
    sceneId: scene.id,
    villageSeed: scene.villageSeed,
    sourceRevision,
    sceneRevision: scene.sceneRevision,
    endedAt: scene.endedAt,
    endReason: scene.endReason,
    submissions: scene.submissions.map((turn) => ({
      id: turn.id,
      inputHash: createHash("sha256")
        .update(JSON.stringify([turn.requestMode ?? turn.mode, turn.message, turn.targetId, turn.contact ?? null]))
        .digest("hex"),
    })),
    navigationReceipts: structuredClone(scene.navigationReceipts ?? []),
    rejectedSubmissions: structuredClone(scene.rejectedSubmissions ?? []),
    generationReceipts: structuredClone(scene.generationReceipts ?? []),
    recordEvents: scene.submissions.flatMap((turn) => turn.recordEvents ?? []),
    ...(Object.keys(optionalAttempts).length
      ? { optionalAttempts: optionalAttempts as NonNullable<SceneTerminal["optionalAttempts"]> }
      : {}),
    ...(scene.operation?.checkpoints?.["abandoned-request"]
      ? {
          abandonedRequest: {
            id: abandoned.id as string,
            kind: abandoned.kind as string,
            attemptId: abandoned.attemptId as string,
          },
        }
      : {}),
    ...(scene.operation?.status === "complete"
      ? {
          operation: {
            id: scene.operation.id,
            kind: scene.operation.kind,
            attemptId: scene.operation.attemptId,
            status: "complete" as const,
            ...(scene.operation.turnOutcome ? { turnOutcome: scene.operation.turnOutcome } : {}),
          },
        }
      : {}),
  };
}

export function createSceneTerminalStore(ports: {
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById">;
  mutateDocument: typeof import("../../adapters/storage/document-store.js").mutateDocument;
}) {
  async function read(id: string): Promise<SceneTerminal | null> {
    const saved = await ports.villagesDocuments().getById(VILLAGES_PACKAGE_ID, SCENE_TERMINAL_PREFIX + id);
    return saved ? slot(id).coerce(saved.data) : null;
  }
  async function save(scene: VenueScene, sourceRevision: number): Promise<void> {
    const receipt = terminalForScene(scene, sourceRevision);
    await ports.mutateDocument(SCENE_TERMINAL_PREFIX + scene.id, slot(scene.id), (current) => {
      if (current.villageSeed && current.villageSeed !== receipt.villageSeed)
        throw new Error("Village changed while saving the Scene receipt.");
      if (current.sourceRevision > sourceRevision) throw new Error("Scene receipt source changed.");
      delete current.operation;
      delete current.optionalAttempts;
      delete current.abandonedRequest;
      Object.assign(current, receipt);
    });
  }
  return { read, save };
}
