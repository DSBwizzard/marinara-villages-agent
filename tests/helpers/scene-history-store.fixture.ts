import assert from "node:assert/strict";
import {
  createRepairGate,
  createRepairAdmission,
  configureRepairGate,
} from "../../packages/villages/src/server/adapters/storage/repair-gate.js";
import { createDocumentMutator } from "../../packages/villages/src/server/adapters/storage/document-store.js";
import { createSceneRepository } from "../../packages/villages/src/server/adapters/storage/scene-repository.js";
export function sceneHistoryFixture() {
  const rows = new Map<string, any>();
  let readBytes = 0,
    writtenBytes = 0,
    fault: "before" | "after" | undefined;
  const documents: any = {
    getById: async (_pkg: string, id: string) => {
      const row = rows.get(id) ?? null;
      readBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    list: async (_pkg: string, kind: string) => structuredClone([...rows.values()].filter((row) => row.kind === kind)),
    create: async (input: any) => {
      assert(!rows.has(input.id));
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(row.id, row);
      writtenBytes += Buffer.byteLength(JSON.stringify(row));
      return structuredClone(row);
    },
    update: async (input: any) => {
      const old = rows.get(input.id);
      if (!old || old.revision !== input.expectedRevision) return null;
      const failing = input.kind === "venue-visit" || old.kind === "venue-visit" ? fault : undefined;
      fault = failing ? undefined : fault;
      if (failing === "before") throw Error("Synthetic uncommitted Scene write");
      const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
      rows.set(row.id, row);
      writtenBytes += Buffer.byteLength(JSON.stringify(row));
      if (failing === "after") throw Error("Synthetic uncertain Scene acknowledgement");
      return structuredClone(row);
    },
    remove: async (_pkg: string, id: string, revision: number) =>
      rows.get(id)?.revision === revision && rows.delete(id),
  };
  const admission = createRepairAdmission(),
    gate = createRepairGate(documents, admission),
    release = configureRepairGate(gate);
  const mutateDocument = createDocumentMutator(() => gate.documents);
  const repository = createSceneRepository({ villagesDocuments: () => gate.documents, mutateDocument });
  return {
    rows,
    documents,
    gate,
    admission,
    repository,
    mutateDocument,
    release,
    fail: (value: "before" | "after") => {
      fault = value;
    },
    reset: () => {
      readBytes = writtenBytes = 0;
    },
    metrics: () => ({ readBytes, writtenBytes }),
  };
}
