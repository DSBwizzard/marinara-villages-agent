import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { claimSavedResponse } from "../packages/villages/src/server/features/generation/saved-response.js";
import { createModelCompletions } from "../packages/villages/src/server/features/generation/completion-service.js";
import { createFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";

const rows = new Map<string, any>();
let writes = 0,
  readBytes = 0,
  writeBytes = 0;
let failSelectedWrite: "before" | "after" | undefined;
const documents = {
  getById: async (_package: string, id: string) => {
    const value = rows.get(id);
    readBytes += Buffer.byteLength(JSON.stringify(value ?? null));
    return structuredClone(value ?? null);
  },
  create: async (row: any) => {
    if (rows.has(row.id)) throw new Error("Already exists");
    rows.set(row.id, structuredClone({ ...row, revision: 1 }));
    writes++;
    writeBytes += Buffer.byteLength(JSON.stringify(row));
    return structuredClone(rows.get(row.id));
  },
  update: async (row: any) => {
    if (rows.get(row.id)?.revision !== row.expectedRevision) return null;
    const fault = row.data.selected ? failSelectedWrite : undefined;
    if (fault) failSelectedWrite = undefined;
    if (fault === "before") throw new Error("Synthetic storage failure before publication");
    rows.set(row.id, structuredClone({ ...rows.get(row.id), ...row, revision: row.expectedRevision + 1 }));
    writes++;
    writeBytes += Buffer.byteLength(JSON.stringify(row));
    if (fault === "after") throw new Error("Synthetic acknowledgment lost after publication");
    return structuredClone(rows.get(row.id));
  },
};
const mutate = createDocumentMutator(() => documents as any);
const request = (key: string, retry = true) => ({ key, retry, valid: (r: any) => r.content.startsWith("valid:") });
const result = (content: string, usage?: any) => ({ content, finishReason: "stop", ...(usage ? { usage } : {}) });
const receipt = (key: string): any =>
  rows.get("villages-generation-response-" + createHash("sha256").update(key).digest("hex"))?.data;
const claim = (key: string, retry = true) =>
  claimSavedResponse(mutate, request(key, retry), ["exact inputs"], () => assert.fail("diagnostic failure"));

// Real document CAS: simultaneous claims and completions must choose the same durable response.
const [a, b] = await Promise.all([claim("race"), claim("race")]);
const chosen = await Promise.all([a.retain(result("valid:A"), true), b.retain(result("valid:B"), true)]);
assert.deepEqual(chosen[0], chosen[1]);
assert.deepEqual((await claim("race", false)).cached, chosen[0]);
assert.equal(receipt("race").pending.length, 0);
assert.equal(receipt("race").settled, 2);

// A late response becomes selected only when returned. A newer live attempt cannot change that decision.
const old = await claim("late-race"),
  newer = await claim("late-race");
await old.retain(result("valid:old", { totalTokens: 23 }), false);
assert.equal(receipt("late-race").selected, undefined);
assert.equal((await claim("late-race", false)).cached?.content, "valid:old");
assert.equal((await newer.retain(result("valid:new", { totalTokens: 31 }), true)).content, "valid:old");
assert.equal((await claim("late-race", false)).cached?.content, "valid:old");
assert.equal(receipt("late-race").usage.totalTokens.known, 54);
assert.equal(receipt("late-race").usage.promptTokens.unknown, 2);
const afterSettling = writes;
await newer.retain(result("valid:duplicate late callback"), false);
assert.equal(writes, afterSettling, "An already settled token cannot create new evidence or change selection");
assert.ok(!JSON.stringify(receipt("late-race")).includes("valid:new"), "Unselected bodies are safely retired");

const firstLate = await claim("unadopted"),
  current = await claim("unadopted");
await firstLate.retain(result("valid:unreturned"), false);
assert.equal((await current.retain(result("valid:current"), true)).content, "valid:current");
assert.equal((await claim("unadopted", false)).cached?.content, "valid:current");

for (const missing of ["deleted", "reset"] as const) {
  const key = "lost-claim-" + missing;
  const lost = await claim(key);
  const id = "villages-generation-response-" + createHash("sha256").update(key).digest("hex");
  const record = rows.get(id),
    original = structuredClone(record.data);
  if (missing === "deleted") rows.delete(id);
  else Object.assign(record.data, { dispatched: 0, settled: 0, rejected: 0, pending: [] });
  const beforeLostClaim = writes;
  await assert.rejects(lost.retain(result("valid:must not apply without replay"), true), /already settled/);
  assert.equal(
    writes,
    beforeLostClaim,
    "Missing dispatch authority cannot return a completion or recreate the receipt",
  );
  record.data = original;
  rows.set(id, record);
  await assert.rejects(claim(key, false), /Retry explicitly/);
}

// Never compact unresolved purchased work merely because another attempt succeeded.
const uncertain = [];
for (let i = 0; i < 150; i++) uncertain.push(await claim("uncertain"));
await uncertain[149].retain(result("valid:chosen"), true);
assert.equal(receipt("uncertain").pending.length, 149);
for (let i = 0; i < 149; i++) await uncertain[i].retain(result("valid:unused:" + i), false);
assert.equal(receipt("uncertain").pending.length, 0);
assert.equal(receipt("uncertain").settled, 150);
assert.ok(
  JSON.stringify(receipt("uncertain")).length < 1500,
  "Settled attempts do not accumulate replay bodies or token lists",
);

// Rejected output is ordinary diagnostics, separate from replay protection and uncertain attempts.
for (let i = 0; i < 120; i++) {
  const attempt = await claim("rejected");
  await attempt.retain(result("invalid:" + i + ":" + "x".repeat(30_000), { completionTokens: 10 }), true);
}
await assert.rejects(claim("rejected", false), /Retry explicitly/);
assert.equal(receipt("rejected").rejected, 120);
assert.equal(receipt("rejected").usage.completionTokens.known, 1200);
assert.equal(receipt("rejected").usage.totalTokens.unknown, 120);
assert.ok(JSON.stringify(receipt("rejected")).length < 1500);
const diagnostics = rows.get("villages-rejected-generation-responses").data.entries;
assert.equal(diagnostics.length, 100);
assert.match(diagnostics[0].content, /^invalid:20:/);
assert.ok(diagnostics.every((entry: any) => entry.content.length <= 24_000));
readBytes = writeBytes = 0;
await (await claim("rejected")).retain(result("valid:recovered"), true);
assert.ok(
  readBytes < 4000 && writeBytes < 4000,
  "Ordinary successful retry does not read or rewrite rejected diagnostic history",
);
assert.equal((await claim("rejected", false)).cached?.content, "valid:recovered");

// A projected completion keeps exact accepted content, finish reason and usage across caller rollback/restart.
let calls = 0;
const service = () =>
  createModelCompletions({
    mutateDocument: mutate,
    readRuntimeDebug: async () => {},
    runtimeDebug() {},
    backgroundCalls: { getStore: () => undefined },
    coordinatedCompletion: async (_key: string, work: any) => work(),
    withUsagePurpose: async (_purpose: string, work: any) => work(),
    inferredPurpose: () => "background",
    villagesLogger: () => ({ debug() {}, warn() {} }),
    bindCallback: (callback: any) => callback,
  } as any);
const evidence = "Exact evidence “café 🌼” with private knowers and correction.";
const model = {
  model: "synthetic",
  connectionId: "synthetic",
  chatComplete: async () => {
    calls++;
    return result(JSON.stringify({ accepted: evidence, unused: "surplus".repeat(50_000) }), { totalTokens: 77 });
  },
} as any;
const options = {
  temperature: null,
  savedRequest: {
    key: "projected",
    retry: false,
    valid: (r: any) => typeof JSON.parse(r.content).accepted === "string",
    replayContent: (r: any) => JSON.stringify({ accepted: JSON.parse(r.content).accepted }),
  },
};
const first = await service().completeWithRoom(model, [{ role: "system", content: "same" }], 1024, options);
const replayed = await service().completeWithRoom(model, [{ role: "system", content: "same" }], 1024, options);
assert.deepEqual(first, replayed);
assert.equal(JSON.parse(replayed.content!).accepted, evidence);
assert.equal(replayed.usage?.totalTokens, 77);
assert.equal(calls, 1, "Restoring pre-effect caller state never repurchases the selected completion");
assert.ok(JSON.stringify(receipt("projected")).length < 1700);
const oldReceipt = structuredClone(receipt("projected"));
await assert.rejects(
  service().completeWithRoom(model, [{ role: "system", content: "changed" }], 1024, options),
  /inputs changed/,
);
assert.deepEqual(receipt("projected"), oldReceipt);

for (const target of ["selected", "candidate"] as const) {
  if (target === "candidate") await (await claim("corrupt-candidate")).retain(result("valid:original"), false);
  const key = target === "selected" ? "projected" : "corrupt-candidate";
  const stored = receipt(key),
    original = structuredClone(stored);
  stored[target].result.content = "valid:altered";
  const beforeCorruptRead = writes;
  await assert.rejects(
    target === "selected"
      ? service().completeWithRoom(model, [{ role: "system", content: "same" }], 1024, options)
      : claim(key, false),
    /unreadable/,
  );
  assert.equal(calls, 1);
  assert.equal(writes, beforeCorruptRead, "Corrupt replay is held without effects, purchase or mutation");
  Object.assign(stored, original);
}

for (const fault of ["before", "after"] as const) {
  const faultOptions = { temperature: null, savedRequest: { key: "publication-" + fault, retry: false } };
  failSelectedWrite = fault;
  await assert.rejects(service().completeWithRoom(model, [], 1024, faultOptions), /Synthetic/);
  const callsAtFailure = calls;
  if (fault === "after") {
    assert.ok((await service().completeWithRoom(model, [], 1024, faultOptions)).content);
  } else {
    await assert.rejects(service().completeWithRoom(model, [], 1024, faultOptions), /Retry explicitly/);
    assert.equal(receipt(faultOptions.savedRequest.key).pending.length, 1);
  }
  assert.equal(calls, callsAtFailure, "Publication failure never silently purchases a replacement");
}

// The founding application and reusable-result classifier use the same parser and frozen Zone limits.
let answer: any = {
  venues: [
    { id: "hall", addition: "  a flower box  " },
    { id: "hall", addition: "ignored" },
    { id: "extra", addition: "ignored" },
  ],
};
let classified = false,
  projected: any;
const foundingKeys: string[] = [];
const founding = createFoundingDrafts({
  findVillagerCard: async () => null,
  readLinkedPersona: async () => null,
  readVillageLore: async () => [],
  villagesConnectionIdFor: async () => "synthetic",
  villagesLanguageModels: () => ({
    resolveForRequest: async () => ({
      fitContext: (messages: any, options: any) => ({ messages, maxTokens: options.maxTokens }),
    }),
  }),
  completeWithRoom: async (_model: any, messages: any, _tokens: any, options: any) => {
    foundingKeys.push(options.savedRequest.key);
    assert.equal(JSON.parse(messages[1].content).venues[0].spaceDescription, village.venues[0].zones[0].description);
    const completion = result(JSON.stringify(answer));
    classified = options.savedRequest.valid(completion);
    if (classified) {
      projected = JSON.parse(options.savedRequest.replayContent(completion));
      return result(JSON.stringify(projected));
    }
    return completion;
  },
} as any);
const village = {
  ...defaultVillageState(),
  seed: "synthetic",
  villagers: [],
  venues: [
    {
      id: "hall",
      name: "Hall",
      classes: ["community"],
      occupancy: {},
      zones: [{ id: "common", kind: "public", description: "Hall interior." }],
    },
  ],
} as any;
assert.deepEqual(await founding.seedFoundingVenueDetails(village), { hall: { addition: "a flower box" } });
assert.deepEqual(projected, { venues: [{ id: "hall", addition: "a flower box" }] });
const originalFoundingKey = foundingKeys.at(-1);
village.venues[0].zones[0].description = "A revised interior.";
await founding.seedFoundingVenueDetails(village);
assert.notEqual(
  foundingKeys.at(-1),
  originalFoundingKey,
  "The frozen acceptance source belongs to the request fingerprint",
);
answer = { venues: [{ id: "hall", addition: "x".repeat(4001) }] };
await assert.rejects(founding.seedFoundingVenueDetails(village), /Shorten/);
assert.equal(classified, false);
answer = { venues: [{ id: "hall", addition: "x".repeat(3990) }] };
await assert.rejects(founding.seedFoundingVenueDetails(village), /complete initial Zone/);
assert.equal(classified, false);
answer = { venues: [{ id: "hall", addition: null }] };
assert.deepEqual(await founding.seedFoundingVenueDetails(village), { hall: { addition: "" } });
assert.equal(classified, true, "Existing accepted empty/non-string additions remain empty");
village.venues[0].id = "__proto__";
answer = { venues: [{ id: "__proto__", addition: "Exact special Venue details" }] };
const special = await founding.seedFoundingVenueDetails(village);
assert.equal(Object.hasOwn(special, "__proto__"), true);
assert.equal(special["__proto__"].addition, "Exact special Venue details");
assert.deepEqual(projected, { venues: [{ id: "__proto__", addition: "Exact special Venue details" }] });

console.log(
  "Saved responses: deterministic CAS selection, late races, uncertainty, compact settled evidence, 100 diagnostics, exact projection and provider-free replay passed.",
);
