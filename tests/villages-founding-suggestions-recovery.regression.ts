import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import {
  createFoundingSuggestions,
  type FoundingSuggestionsPorts,
} from "../packages/villages/src/server/features/founding/founding-suggestions-service.js";
import { requestFoundingSuggestions } from "../packages/villages/src/client/features/founding/suggestion-request.js";
import { emptyFoundingWorkspace } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state.js";

const tick = () => new Promise<void>((done) => setImmediate(done));
const records = new Map<string, any>();
const documents = {
  async getById(_package: string, id: string) {
    return structuredClone(records.get(id) ?? null);
  },
  async create(value: any) {
    if (records.has(value.id)) throw new Error("Conflict");
    records.set(value.id, { ...structuredClone(value), revision: 1 });
    return records.get(value.id);
  },
  async update(value: any) {
    const prior = records.get(value.id);
    if (!prior || prior.revision !== value.expectedRevision) return null;
    const next = { ...prior, ...structuredClone(value), revision: prior.revision + 1 };
    records.set(value.id, next);
    return next;
  },
} as unknown as CapabilityDocumentStore;
let finish!: () => void;
let barrier = new Promise<void>((done) => {
  finish = done;
});
let calls = 0;
let fail = false;
const ports: FoundingSuggestionsPorts = {
  villagesDocuments: () => documents,
  mutateDocument: createDocumentMutator(() => documents),
  villagesLogger: () => ({
    debug() {},
    info() {},
    warn() {},
    error(error) {
      throw error;
    },
  }),
  async suggestStartingVenues() {
    assert.equal(records.get("villages-founding-suggestions").data.request.status, "running");
    calls++;
    await barrier;
    if (fail) throw new Error("Invalid synthetic reply");
    return { venues: [] };
  },
};
const service = createFoundingSuggestions(ports);
const input = { actionId: "suggestion-attempt-1", sourceKey: "setting-1" };
// Receipt returns while the provider is still blocked, with one durable claim.
assert.equal((await service.requestFoundingSuggestions(input)).status, "running");
assert.equal(calls, 1);
assert.equal((await service.requestFoundingSuggestions(input)).id, input.actionId);
await assert.rejects(service.requestFoundingSuggestions({ ...input, actionId: "other-attempt" }), /still running/);
const overlapping = createFoundingSuggestions(ports);
assert.equal((await overlapping.readFoundingSuggestions(input.actionId)).status, "running");
await assert.rejects(
  overlapping.requestFoundingSuggestions({ ...input, actionId: "overlap-attempt" }),
  /still running/,
);
finish();
await tick();
assert.equal((await service.readFoundingSuggestions(input.actionId)).status, "complete");
service.stop();
overlapping.stop();
const restarted = createFoundingSuggestions(ports);
assert.deepEqual((await restarted.readFoundingSuggestions(input.actionId)).result, { venues: [] });
assert.equal((await restarted.requestFoundingSuggestions(input)).status, "complete");
assert.equal(calls, 1, "reads and replays never generate");
// A failed reply is retained; checking or replaying it never retries a model call.
fail = true;
await restarted.requestFoundingSuggestions({ ...input, actionId: "failed-attempt" });
await tick();
assert.equal((await restarted.readFoundingSuggestions("failed-attempt")).status, "failed");
await assert.rejects(restarted.requestFoundingSuggestions(input), /already used/);
assert.equal(calls, 2);
// A process restart cannot silently restart an unfinished/billed attempt.
barrier = new Promise<void>((done) => {
  finish = done;
});
await restarted.requestFoundingSuggestions({ ...input, actionId: "interrupted-attempt" });
restarted.stop();
finish();
await tick();
const afterStop = createFoundingSuggestions(ports);
assert.equal((await afterStop.readFoundingSuggestions("interrupted-attempt")).status, "interrupted");
assert.equal(
  (await afterStop.requestFoundingSuggestions({ ...input, actionId: "interrupted-attempt" })).status,
  "interrupted",
);
assert.equal(calls, 3);
afterStop.stop();

// Competing admission reads may both see the old result; the CAS callback must still fence dispatch.
fail = false;
barrier = new Promise<void>((done) => {
  finish = done;
});
const contenderA = createFoundingSuggestions(ports),
  contenderB = createFoundingSuggestions(ports);
const contested = await Promise.allSettled([
  contenderA.requestFoundingSuggestions({ ...input, actionId: "contender-one" }),
  contenderB.requestFoundingSuggestions({ ...input, actionId: "contender-two" }),
]);
assert.equal(contested.filter((entry) => entry.status === "fulfilled").length, 1);
assert.equal(calls, 4, "a competing CAS cannot dispatch a second model call");
finish();
await tick();
contenderA.stop();
contenderB.stop();

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalCrypto = globalThis.crypto;
let workspace = emptyFoundingWorkspace();
let persisted: any;
const requests: string[] = [];
const clientPorts: any = {
  setupBeginningSourceKey: "setting-1",
  setupWorkspace: workspace,
  setupDraftData: {},
  setSetupWorkspace(update: any) {
    workspace = typeof update === "function" ? update(workspace) : update;
  },
  async persistSetupDraft(data: any) {
    persisted = structuredClone(data);
  },
};
try {
  globalThis.window = {
    localStorage: {
      getItem() {
        return null;
      },
    },
    setTimeout(done: () => void) {
      done();
    },
  } as any;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: { randomUUID: () => "synthetic-request-id" },
  });
  let lost = true;
  globalThis.fetch = async (url, init) => {
    requests.push(`${init?.method ?? "GET"} ${url}`);
    if (init?.method === "POST") {
      assert.equal(persisted.workspace.suggestionRequest.id, "synthetic-request-id", "ID persists before dispatch");
      if (lost) throw new TypeError("Synthetic lost connection after admission");
    }
    const pending = workspace.suggestionRequest!;
    return Response.json({
      id: pending.id,
      sourceKey: pending.sourceKey,
      status: "complete",
      result: { venues: [] },
      error: "",
    });
  };
  await assert.rejects(
    requestFoundingSuggestions(clientPorts, { quickStart: true, venueId: "home" }, {}),
    /Check Quick Start/,
  );
  assert.equal(workspace.suggestionRequest?.id, "synthetic-request-id");
  // Reload restores the saved ID. Tapping a different mode's control only GETs that attempt.
  workspace = persisted.workspace;
  clientPorts.setupWorkspace = workspace;
  const restoredOptions: any = {};
  assert.deepEqual(await requestFoundingSuggestions(clientPorts, restoredOptions, {}), { venues: [] });
  assert.deepEqual(restoredOptions, { quickStart: true, venueId: "home" });
  assert.equal(workspace.suggestionRequest, undefined);
  assert.equal(requests.filter((line) => line.startsWith("POST")).length, 1);
  assert.ok(requests[1].startsWith("GET /api/villages/setup/venues/suggestions/"));
  // Storage failure must not authorize dispatch.
  clientPorts.setupWorkspace = emptyFoundingWorkspace();
  clientPorts.persistSetupDraft = async () => {
    throw new Error("Storage unavailable");
  };
  const before = requests.length;
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, {}), /Storage unavailable/);
  assert.equal(requests.length, before);
  assert.equal(workspace.suggestionRequest, undefined);
  // Leaving a visible founding view cancels GET observation and retains its admitted identity.
  const observation = new AbortController();
  workspace = {
    ...emptyFoundingWorkspace(),
    suggestionRequest: { id: "waiting", sourceKey: "setting-1", quickStart: false },
  };
  globalThis.window.setTimeout = ((done: () => void) => {
    observation.abort();
    done();
  }) as any;
  const beforeCancelled = requests.length;
  globalThis.fetch = async (url, init) => {
    requests.push(`${init?.method ?? "GET"} ${url}`);
    return Response.json({ id: "waiting", sourceKey: "setting-1", status: "running", result: null, error: "" });
  };
  await assert.rejects(
    requestFoundingSuggestions({ ...clientPorts, setupWorkspace: workspace, signal: observation.signal }, {}, {}),
    /Check suggestions/,
  );
  assert.equal(workspace.suggestionRequest?.id, "waiting");
  assert.equal(requests.length, beforeCancelled + 1);
  assert(requests.at(-1)!.startsWith("GET"), "hidden-view cancellation never resubmits generation");
  lost = false;
} finally {
  globalThis.fetch = originalFetch;
  globalThis.window = originalWindow;
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: originalCrypto });
}
console.log(
  "Venue suggestions: prompt admission, replay suppression, saved results/errors, overlapping owners, interruption, dropped POST/reload GET recovery, and fail-closed local persistence.",
);
