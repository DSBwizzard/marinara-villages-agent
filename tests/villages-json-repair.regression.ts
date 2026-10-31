import { readPrivateDiagnostics } from "../packages/villages/src/server/adapters/observability/private-diagnostics.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import assert from "node:assert/strict";
import {
  readModelJsonObject,
  MODEL_JSON_MAX_CHARACTERS,
} from "../packages/villages/src/server/domain/rules/json-reply.js";
import { extractSceneReply } from "../packages/villages/src/server/domain/rules/scene-reply-json.js";
import { completeSceneObject } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { extractFoundingVenueReply } from "../packages/villages/src/server/domain/rules/founding-venue-reply.js";
import { retainJsonRepair } from "../packages/villages/src/server/adapters/observability/json-repair-diagnostics.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
const valid = {
  rooms: [{ venueId: "venue", id: "private:base", description: "Shelves", items: ["Box"], facts: ["Dry"] }],
};
const malformed = JSON.stringify(valid).replace('["Dry"]', '["Dry"');
const read = (content: string, finishReason = "stop") => readModelJsonObject({ content, finishReason });
assert.deepEqual(read(JSON.stringify(valid)), { value: valid, repaired: false, edits: 0 });
assert.deepEqual(
  read(malformed),
  { value: valid, repaired: true, edits: 1 },
  "Missing facts closer is repaired without changing any room data",
);
assert.deepEqual(read("```json\n" + malformed + "\n```").value, valid);
assert.deepEqual(read('{"permission":false "actor":"a"}').value, { permission: false, actor: "a" });
assert.deepEqual(read('{"items":["one",],"ready":false,}').value, { items: ["one"], ready: false });
for (const text of [
  '{"items":[,]}',
  '{"items":["one",,"two"]}',
  '{"permission":undefined}',
  '{"permission":false,"permission":true}',
  '{"permission":false,"\\u0070ermission":true}',
  '{"rooms":[{"id":"one"}]} {"other":',
  '{"rooms":[]} [',
  '{"rooms":[]}, "action": null',
  '[{"rooms":[]}]',
  '{"items":["one"',
  '{"items":["one"]',
  '{"items":["unterminated}',
  '{"rooms":[]} {"rooms":[{}]}',
  '{"a":1e}',
  '{"a":NaN}',
  '{"a":' + "[".repeat(65) + "0" + "]".repeat(65) + "}",
  '{"a":"' + "x".repeat(MODEL_JSON_MAX_CHARACTERS) + '"}',
  "{" + Array.from({ length: 10 }, (_, i) => '"k' + i + '":[1,]').join(",") + "}",
])
  assert.equal(read(text).value, null, text.slice(0, 100));
for (const reason of ["length", "max_tokens", "content_filter", "tool_calls", "unknown"])
  assert.equal(read(malformed, reason).value, null, reason);
for (const suffix of [' {"other":', " [", ', "action": null']) {
  assert.equal(extractSceneReply('{"segments":[],"heardPlayerBy":[]}' + suffix, "stop"), null);
  assert.equal(completeSceneObject('{"segments":[],"heardPlayerBy":[]}' + suffix, "stop"), null);
}
assert.equal(extractFoundingVenueReply('{"venues":[],"venues":[{"id":"v"}]}'), null);
assert.equal(extractFoundingVenueReply('[ {"id":"v"}'), null);
assert.deepEqual(extractFoundingVenueReply('[{"id":"v"}]'), { venues: [{ id: "v" }] });
assert.deepEqual(extractFoundingVenueReply(JSON.stringify('{"venues":[{"id":"v"}]}')), { venues: [{ id: "v" }] });
const deep = '{"venues":[],"a":' + "[".repeat(65) + "0" + "]".repeat(65) + "}";
assert.equal(extractFoundingVenueReply(deep), null);
assert.equal(extractSceneReply(deep, "stop"), null);
assert.equal(completeSceneObject(deep, "stop"), null);
const records = new Map<string, any>();
let failWrites = false;
const documents = {
  async getById(_p: string, id: string) {
    return structuredClone(records.get(id) ?? null);
  },
  async list() {
    return [];
  },
  async create(input: any) {
    if (failWrites) throw Error("disk failure");
    const r = { ...input, revision: 1 };
    records.set(input.id, r);
    return r;
  },
  async update(input: any) {
    if (failWrites) throw Error("disk failure");
    const r = { ...records.get(input.id), ...input, revision: input.expectedRevision + 1 };
    records.set(input.id, r);
    return r;
  },
};
const release = configureVillagesRuntime({
  persistence: { documents: villageFixtureDocuments(documents) },
  logger: { info() {}, warn() {}, debug() {}, error() {}, debugOverride() {} },
} as any);
try {
  const response = { content: '{"value":"Bearer secret-token" "ready":false}', finishReason: "stop" };
  const original = structuredClone(response);
  for (let i = 0; i < 107; i++) await retainJsonRepair({ model: "synthetic", connectionId: "fixture" }, response, 3000);
  const record = records.get("villages-private-diagnostics");
  assert.equal(record.kind, "private-diagnostics");
  assert.equal(readPrivateDiagnostics(record.data).entries.length, 100);
  assert.ok(readPrivateDiagnostics(record.data).entries.every((entry: any) => entry.source === "json-repair"));
  assert.equal(readPrivateDiagnostics(record.data).entries[0].status, "candidate");
  assert.doesNotMatch(JSON.stringify(record), /secret-token/);
  assert.deepEqual(response, original, "Provider evidence is immutable");
  failWrites = true;
  await retainJsonRepair({ model: "synthetic", connectionId: "fixture" }, response, 3000);
  assert.deepEqual(response, original);
} finally {
  release();
}
console.log(
  "Bounded JSON repair: value preservation, ambiguity/truncation/duplicate rejection, specialized boundaries and private diagnostics passed",
);
