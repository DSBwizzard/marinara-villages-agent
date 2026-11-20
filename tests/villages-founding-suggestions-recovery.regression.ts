import assert from "node:assert/strict";
import Fastify from "fastify";
import { configureFoundingSuggestions } from "../packages/villages/src/server/features/founding/founding-suggestions.js";
import { configureFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts.js";
import { createFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts-service.js";
import { registerFoundingRoutes } from "../packages/villages/src/server/features/founding/routes.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import {
  createFoundingSuggestions,
  type FoundingSuggestionsPorts,
} from "../packages/villages/src/server/features/founding/founding-suggestions-service.js";
import { requestFoundingSuggestions } from "../packages/villages/src/client/features/founding/suggestion-request.js";
import { createFoundingDraftSetting } from "../packages/villages/src/client/features/founding/setup-controller.js";
import { emptyFoundingWorkspace } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state.js";
import { FOUNDING_DRAFT_UNAVAILABLE } from "../packages/villages/src/shared/contracts/founding.js";

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
{
  const brief = "Home is a converted freighter named Wayfarer.";
  const worldBrief = "The Relay Belt has settlements on former cargo routes.";
  const lorebookReference = "The Wayfarer runs supply deliveries between Relay Belt stations.";
  const setting = {
    name: "Wayfarer",
    startingLocationName: "The Main Deck",
    description: "A converted freighter with a shared galley.",
    worldName: "",
    rules: "",
  };
  let completions = 0;
  let lookups = 0;
  let finishReason = "stop";
  let connectionLimit: number | null = 8192;
  let requestedTokens: number | undefined;
  let dispatchedTokens: number | undefined;
  let prompt: { role: string; content: string }[] = [];
  const writer = createFoundingDrafts({
    readVillageLore: async (
      ids: string[],
      context: string,
      _signal: AbortSignal | undefined,
      budget: number,
      options: { current: string },
    ) => {
      lookups++;
      assert.equal(context, worldBrief);
      assert.equal(options.current, brief);
      assert.equal(budget, 900);
      if (ids.includes("missing")) throw new Error("Selected lorebooks are unavailable.");
      assert.deepEqual(ids, ["relay-belt"]);
      return [lorebookReference];
    },
    villagesConnectionIdFor: async (role: string) => {
      assert.equal(role, "system");
      return "test-system";
    },
    villagesLanguageModels: () => ({
      resolveForRequest: async ({ connectionId }: { connectionId: string }) => {
        assert.equal(connectionId, "test-system");
        return {
          maxOutputTokens: connectionLimit,
          fitContext(messages: unknown[], { maxTokens }: { maxTokens: number }) {
            requestedTokens ??= maxTokens;
            return { messages, maxTokens: Math.min(maxTokens, 6144) };
          },
        };
      },
    }),
    completeWithRoom: async (_model: unknown, messages: typeof prompt, maxTokens: number, options: any) => {
      prompt = messages;
      dispatchedTokens = maxTokens;
      assert.equal(options.reasoningEffort, undefined);
      completions++;
      return {
        content: JSON.stringify({ ...setting, rules: "Model-authored rule that must be ignored." }),
        finishReason,
      };
    },
  } as any);
  const draftInput = { ...input, mode: "draft-setting", brief };
  await assert.rejects(writer.suggestStartingVenues({ ...draftInput, brief: " " }), /Tell Mari/);
  assert.equal(completions, 0);
  assert.deepEqual(await writer.suggestStartingVenues(draftInput), { venues: [], setting });
  assert.match(prompt[0]!.content, /World rules are player-authored constraints: never generate, add or rewrite them/u);
  assert.equal(requestedTokens, 8192, "Use the selected System connection's output limit when fitting the prompt");
  assert.equal(dispatchedTokens, 6144, "Dispatch with the output room Engine found in context");
  assert.deepEqual(prompt.slice(1), [{ role: "user", content: brief }]);
  assert.equal(lookups, 0, "Old or skipped lore selection never reads books");
  assert.equal(completions, 1);
  finishReason = "length";
  await assert.rejects(writer.suggestStartingVenues(draftInput), /I ran out of room/);
  assert.equal(completions, 2, "A truncated result never starts another request on its own");
  finishReason = "stop";
  const withLore = { ...draftInput, worldBrief, selectedLorebookIds: ["relay-belt"], loreTokenBudget: 900 };
  await assert.rejects(writer.suggestStartingVenues({ ...withLore, loreTokenBudget: -1 }), /token budget/);
  assert.equal(lookups, 0);
  await assert.rejects(writer.suggestStartingVenues({ ...withLore, selectedLorebookIds: ["missing"] }), /unavailable/);
  assert.equal(completions, 2, "Unavailable lore does not dispatch a paid completion");
  assert.deepEqual(await writer.suggestStartingVenues(withLore), { venues: [], setting });
  assert.match(prompt[0]!.content, /follow the player's description whenever they differ/u);
  assert.match(prompt[0]!.content, /choose one locally meaningful district, deck, or equivalent/u);
  assert.deepEqual(
    prompt.slice(1).map((row) => JSON.parse(row.content)),
    [{ lorebookReferences: [lorebookReference] }, { world: worldBrief, village: brief }],
  );
  assert.equal(completions, 3);
  const authoredSetting = {
    villageName: "The Tide Roads",
    worldName: "Relay Belt",
    worldRules: "The gates only open at noon.",
  };
  connectionLimit = null;
  requestedTokens = undefined;
  const authoredDraft = await writer.suggestStartingVenues({ ...draftInput, ...authoredSetting });
  assert.equal(requestedTokens, 4096, "Use the bounded fallback when the connection supplies no output limit");
  assert.equal(authoredDraft.setting?.name, authoredSetting.villageName);
  assert.equal(authoredDraft.setting?.worldName, authoredSetting.worldName);
  assert.equal(authoredDraft.setting?.rules, authoredSetting.worldRules);
  const spacedRules = "  Only the player edits these rules.  ";
  assert.equal(
    (await writer.suggestStartingVenues({ ...draftInput, worldRules: spacedRules })).setting?.rules,
    spacedRules,
    "A draft returns player rules verbatim, ignoring any rules supplied by the model",
  );
  await writer.suggestStartingVenues({ ...draftInput, ...authoredSetting });
  assert.deepEqual(JSON.parse(prompt.at(-1)!.content), { world: "", ...authoredSetting, village: brief });
  const sparseBrief = "Besmoa has a Wendy’s.";
  await writer.suggestStartingVenues({ ...draftInput, villageName: "Besmoa", brief: sparseBrief });
  assert.deepEqual(JSON.parse(prompt.at(-1)!.content), { world: "", villageName: "Besmoa", village: sparseBrief });
  assert.match(prompt[0]!.content, /"description" \(a short in-world paragraph about that place/u);
  assert.match(prompt[0]!.content, /Describe the place itself, never a map, its coverage/u);
  assert.match(
    prompt[0]!.content,
    /With sparse input, add a few plausible local details consistent with the supplied facts/u,
  );
  assert.doesNotMatch(prompt[0]!.content, /the area the map will cover|first map covers|first map area/u);
}
{
  const app = Fastify();
  const releaseSuggestions = configureFoundingSuggestions(createFoundingSuggestions(ports));
  const releaseDrafts = configureFoundingDrafts({
    suggestStartingVenues: async () => {
      calls++;
      return { venues: [] };
    },
  } as any);
  registerFoundingRoutes(app);
  const before = JSON.stringify([...records]);
  try {
    const response = await app.inject({
      method: "POST",
      url: "/setup/venues/suggest",
      payload: { sourceKey: input.sourceKey },
    });
    assert.equal(response.statusCode, 400, response.body);
    assert.equal(calls, 0, "A missing durable action ID cannot dispatch either suggestion path");
    assert.equal(JSON.stringify([...records]), before, "A refused request creates no saved claim");
    const missing = await app.inject({ method: "GET", url: "/setup/venues/suggestions/missing-attempt" });
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.json().code, FOUNDING_DRAFT_UNAVAILABLE);
    assert.equal(calls, 0, "An unavailable result never dispatches generation");
    assert.equal(JSON.stringify([...records]), before, "Checking an absent attempt does not alter storage");
  } finally {
    await app.close();
    releaseDrafts();
    releaseSuggestions();
  }
}
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
await assert.rejects(restarted.readFoundingSuggestions(input.actionId), {
  statusCode: 404,
  code: FOUNDING_DRAFT_UNAVAILABLE,
});
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
    /Reconnecting/,
  );
  assert.equal(workspace.suggestionRequest?.id, "synthetic-request-id");
  // Reload restores the saved ID. Automatic recovery only GETs that attempt.
  workspace = persisted.workspace;
  clientPorts.setupWorkspace = workspace;
  const restoredOptions: any = {};
  assert.deepEqual(await requestFoundingSuggestions(clientPorts, restoredOptions, {}), { venues: [] });
  assert.deepEqual(restoredOptions, { quickStart: true, venueId: "home" });
  assert.equal(workspace.suggestionRequest, undefined);
  assert.equal(requests.filter((line) => line.startsWith("POST")).length, 1);
  assert.ok(requests[1].startsWith("GET /api/villages/setup/venues/suggestions/"));
  // New whole-setup requests persist their mode and refuse newer authored drafts after reload.
  clientPorts.setupWorkspace = emptyFoundingWorkspace();
  clientPorts.setupDraftData = { venues: [{ id: "authored", name: "Original" }] };
  const beforeReplacement = requests.filter((line) => line.startsWith("POST")).length;
  await assert.rejects(
    requestFoundingSuggestions(clientPorts, { quickStart: true, separateHomes: true }, { mode: "quick-start" }),
    /Reconnecting/,
  );
  assert.equal(persisted.workspace.suggestionRequest.separateHomes, true);
  assert.equal(persisted.workspace.suggestionRequest.sourceVenues, JSON.stringify(clientPorts.setupDraftData.venues));
  workspace = persisted.workspace;
  clientPorts.setupWorkspace = workspace;
  clientPorts.setupDraftData = { venues: [{ id: "authored", name: "Newer edit" }] };
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, { mode: "quick-start" }), /choices changed/);
  assert.equal(workspace.suggestionRequest, undefined);
  assert.equal(
    requests.filter((line) => line.startsWith("POST")).length,
    beforeReplacement + 1,
    "A stale recovered result never dispatches again",
  );
  // A result can disappear during observation after the initial POST was admitted.
  clientPorts.setupWorkspace = emptyFoundingWorkspace();
  let latePosts = 0,
    lateReads = 0;
  globalThis.fetch = async (_url, init) => {
    if (init?.method === "POST") {
      latePosts++;
      const pending = workspace.suggestionRequest!;
      return Response.json({
        id: pending.id,
        sourceKey: pending.sourceKey,
        status: "running",
        result: null,
        error: "",
      });
    }
    lateReads++;
    return Response.json(
      { error: "Saved draft result is unavailable", code: FOUNDING_DRAFT_UNAVAILABLE },
      { status: 404 },
    );
  };
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, {}), /unavailable/);
  assert.equal(latePosts, 1);
  assert.equal(lateReads, 1);
  assert.equal(workspace.suggestionRequest?.failure, "Saved draft result is unavailable");
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
    { name: "AbortError" },
  );
  assert.equal(workspace.suggestionRequest?.id, "waiting");
  assert.equal(requests.length, beforeCancelled + 1);
  assert(requests.at(-1)!.startsWith("GET"), "hidden-view cancellation never resubmits generation");
  // A failed status read is not a failed generation and cannot enable Retry.
  clientPorts.setupWorkspace = workspace;
  globalThis.fetch = async () => Response.json({ error: "Status temporarily unavailable" }, { status: 503 });
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, {}), /Reconnecting/);
  assert.equal(workspace.suggestionRequest?.failure, undefined);
  globalThis.fetch = async () => Response.json({ error: "Status access denied" }, { status: 403 });
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, {}), /Reconnecting/);
  assert.equal(workspace.suggestionRequest?.failure, undefined, "A GET refusal cannot authorize a new attempt");
  globalThis.fetch = async () => Response.json({ error: "Saved attempt not found" }, { status: 404 });
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, {}), /Reconnecting/);
  assert.equal(workspace.suggestionRequest?.id, "waiting");
  assert.equal(workspace.suggestionRequest?.failure, undefined, "Missing status is not proof generation failed");
  globalThis.fetch = async () =>
    Response.json({ id: "waiting", sourceKey: "setting-1", status: "complete", result: null, error: "" });
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, {}), /Reconnecting/);
  assert.equal(workspace.suggestionRequest?.failure, undefined, "An unreadable result cannot authorize Retry");
  // Only a terminal receipt enables an explicit fresh attempt.
  globalThis.fetch = async () =>
    Response.json({ id: "waiting", sourceKey: "setting-1", status: "failed", result: null, error: "Invalid draft" });
  await assert.rejects(requestFoundingSuggestions(clientPorts, {}, {}), /Invalid draft/);
  assert.equal(workspace.suggestionRequest?.failure, "Invalid draft");
  workspace = {
    ...workspace,
    suggestionRequest: {
      id: "waiting",
      sourceKey: "setting-1",
      quickStart: false,
      sourceInputs: "original inputs",
      sourceVenues: "original venues",
    },
  };
  clientPorts.setupWorkspace = workspace;
  let unavailableReads = 0;
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method ?? "GET", "GET");
    unavailableReads++;
    return Response.json(
      { error: "Saved draft result is unavailable", code: FOUNDING_DRAFT_UNAVAILABLE },
      { status: 404 },
    );
  };
  await assert.rejects(
    requestFoundingSuggestions(clientPorts, {}, {}),
    (error: Error) => /unavailable/.test(error.message) && !/Reconnecting/.test(error.message),
  );
  assert.equal(unavailableReads, 1);
  assert.deepEqual(
    workspace.suggestionRequest,
    {
      id: "waiting",
      sourceKey: "setting-1",
      quickStart: false,
      sourceInputs: "original inputs",
      sourceVenues: "original venues",
      failure: "Saved draft result is unavailable",
    },
    "A known unavailable result stops observation without discarding the admitted identity or source",
  );
  clientPorts.setupWorkspace = workspace;
  clientPorts.persistSetupDraft = async (data: any) => {
    persisted = structuredClone(data);
  };
  let retried = 0;
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method, "POST");
    retried++;
    assert.equal(persisted.workspace.suggestionRequest.failure, undefined);
    const input = JSON.parse(String(init?.body));
    assert.notEqual(input.actionId, "waiting");
    return Response.json({
      id: input.actionId,
      sourceKey: input.sourceKey,
      status: "complete",
      result: { venues: [] },
      error: "",
    });
  };
  await requestFoundingSuggestions(clientPorts, {}, {});
  assert.equal(retried, 1);
  assert.equal(workspace.suggestionRequest, undefined);

  const originalSetting = {
    mode: "draft-setting",
    brief: "Old village",
    worldBrief: "Old world",
    selectedLorebookIds: ["original-book"],
    loreTokenBudget: 700,
  };
  workspace = {
    ...emptyFoundingWorkspace(),
    settingBrief: "Edited village",
    settingWorldBrief: "Edited world",
    suggestionRequest: {
      id: "lore-draft-1",
      sourceKey: "founding-setting",
      quickStart: false,
      draftSetting: true,
      sourceInputs: JSON.stringify(originalSetting),
    },
  };
  let settingPosts = 0;
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method ?? "GET", "GET", "A generic missing route cannot re-admit a setting request");
    return Response.json({ error: "Route unavailable" }, { status: 404 });
  };
  await assert.rejects(
    requestFoundingSuggestions(
      { ...clientPorts, setupWorkspace: workspace, setupBeginningSourceKey: "founding-setting" },
      { draftSetting: true, checkSetting: true },
      originalSetting,
    ),
    /Reconnecting/,
  );
  assert.equal(workspace.suggestionRequest?.failure, undefined);
  globalThis.fetch = async (_url, init) => {
    if (init?.method !== "POST")
      return Response.json({ error: "Saved attempt not found", code: FOUNDING_DRAFT_UNAVAILABLE }, { status: 404 });
    settingPosts++;
    assert.deepEqual(JSON.parse(String(init.body)), {
      ...originalSetting,
      actionId: "lore-draft-1",
      sourceKey: "founding-setting",
    });
    const setting = {
      name: "Old village",
      startingLocationName: "Old quay",
      description: "An old quay.",
      worldName: "Old world",
      rules: "",
    };
    return Response.json({
      id: "lore-draft-1",
      sourceKey: "founding-setting",
      status: "complete",
      result: { setting, venues: [] },
      error: "",
    });
  };
  const noop = () => undefined;
  let name = "My village";
  let location = "My quay";
  let worldName = "  My world  ";
  let rules = "  The tide stops at midnight.  ";
  const settingPorts: Parameters<typeof createFoundingDraftSetting>[0] = {
    ...clientPorts,
    setupWorkspace: workspace,
    setupDraftData: { name, startingLocationName: location, setting: "", worldName, context: { rules } },
    setupLorebookDraft: ["new-book"],
    setupLoreTokenBudgetDraft: 1800,
    setupSuggestionsClaim: { current: false },
    setSetupSuggestionsBusy: noop,
    setSetupName: (update) => {
      name = typeof update === "function" ? update(name) : update;
    },
    setSetupLocationName: (update) => {
      location = typeof update === "function" ? update(location) : update;
    },
    setSetupSetting: noop,
    setSetupWorldName: (update) => {
      worldName = typeof update === "function" ? update(worldName) : update;
    },
  };
  const resume = createFoundingDraftSetting(settingPorts);
  await resume("recover");
  assert.equal(settingPosts, 0, "Automatic recovery only reads the saved attempt");
  await resume("request");
  assert.equal(settingPosts, 1, "Explicit resume keeps the original lore selection and request ID");
  assert.equal(name, "My village", "An older request cannot replace existing text without confirmation");
  assert.equal(workspace.suggestionRequest, undefined);

  workspace = { ...emptyFoundingWorkspace(), settingBrief: "A new village" };
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method, "POST");
    settingPosts++;
    assert.equal(persisted.workspace.suggestionRequest.settingReplacement.name, "My village");
    assert.equal(persisted.workspace.suggestionRequest.settingReplacement.startingLocationName, "My quay");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.settingReplacement, undefined);
    assert.equal(body.villageName, name);
    assert.equal(body.worldName, worldName.trim());
    assert.equal(body.worldRules, rules.trim());
    throw new TypeError("Synthetic lost connection after admission");
  };
  const draft = createFoundingDraftSetting({ ...settingPorts, setupWorkspace: workspace });
  await draft("request");
  assert.equal(settingPosts, 1, "A populated setting needs confirmation");
  await draft("replace");
  assert.equal(settingPosts, 2);
  assert.equal(name, "My village", "A lost response leaves the setting alone");
  location = "";
  const pending = persisted.workspace.suggestionRequest;
  workspace = persisted.workspace;
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method ?? "GET", "GET");
    return Response.json({
      id: pending.id,
      sourceKey: pending.sourceKey,
      status: "complete",
      result: {
        venues: [],
        setting: { name: "New village", startingLocationName: "New quay", description: "", worldName: "", rules: "" },
      },
      error: "",
    });
  };
  await createFoundingDraftSetting({ ...settingPorts, setupWorkspace: workspace })("recover");
  assert.equal(name, "My village", "A recovered map draft preserves the chosen Village name");
  assert.equal(location, "", "Recovery preserves a field cleared after confirmation");
  assert.equal(worldName, "  My world  ", "A draft cannot rewrite a supplied world name");
  assert.equal(rules, "  The tide stops at midnight.  ", "A draft cannot rewrite supplied standing rules");
  assert.equal(workspace.suggestionRequest, undefined);
  for (const playerRules of ["", "   ", "  Player-authored rule.  "]) {
    rules = playerRules;
    workspace = { ...emptyFoundingWorkspace(), settingBrief: "A new village" };
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      return Response.json({
        id: body.actionId,
        sourceKey: body.sourceKey,
        status: "complete",
        result: {
          venues: [],
          setting: {
            name,
            startingLocationName: "New quay",
            description: "A quay.",
            worldName,
            rules: "Legacy generated rule.",
          },
        },
        error: "",
      });
    };
    await createFoundingDraftSetting({
      ...settingPorts,
      setupWorkspace: workspace,
      setupDraftData: { ...settingPorts.setupDraftData, context: { rules } },
    })("replace");
    assert.equal(rules, playerRules, "Even a legacy draft result cannot fill or alter player-only World rules");
  }
  lost = false;
} finally {
  globalThis.fetch = originalFetch;
  globalThis.window = originalWindow;
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: originalCrypto });
}
console.log(
  "Venue suggestions: prompt admission, replay suppression, saved results/errors, overlapping owners, interruption, dropped POST/reload GET recovery, and fail-closed local persistence.",
);
