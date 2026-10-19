// Test cases: scene-json-hardening/syntax, scene-json-hardening/ambiguity
import assert from "node:assert/strict";
import {
  completeSceneObject,
  normalizeRecoverableSceneReply,
} from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { extractSceneReply } from "../packages/villages/src/server/domain/rules/scene-reply-json.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import {
  retainRejectedResponses,
  type RejectedResponse,
} from "../packages/villages/src/server/domain/rules/rejected-response.js";
const scene = {
  heardPlayerBy: ["a"],
  segments: [{ kind: "dialogue", speakerId: "a", text: 'A {gate}: "hello", [friend].', heardBy: ["a"] }],
  wishChanges: [],
  memoryChanges: [],
  relationshipChanges: { changes: [], permissions: [], disclosures: [] },
};
const json = JSON.stringify(scene);
for (const input of [
  json,
  "Here is the reply:\n" + json + "\nDone.",
  "\u0060\u0060\u0060json\n" + json + "\n\u0060\u0060\u0060",
  json.slice(0, -1) + ",}",
  json.replace('"heardPlayerBy":["a"]', '"heardPlayerBy":["a",]'),
]) {
  assert.deepEqual(extractSceneReply(input), scene);
  assert.equal(parseVenueReply(extractSceneReply(input), ["a"]).lines[0]?.content, scene.segments[0]!.text);
}
const multiline = JSON.stringify({ ...scene, segments: [{ ...scene.segments[0], text: "one\ntwo\r\nthree\tfour" }] });
assert.deepEqual(
  extractSceneReply(multiline.replace(/\\n/gu, "\n").replace(/\\r/gu, "\r").replace(/\\t/gu, "\t")),
  JSON.parse(multiline),
);
for (const input of [
  json + json,
  '{"heardPlayerBy":[],"segments":[],"\\q":{',
  '{"heardPlayerBy":[],"segments":[],"segments":[{"text":"cut',
  '{"heardPlayerBy":[],"segments":[],"heardPlayerBy":["cut',
  '{"heardPlayerBy":[,],"segments":[]}',
  '{"heardPlayerBy":[],"segments":[,]}',
  '{"heardPlayerBy":[],"segments":[],"metadata":{,}}',
  "[" + json + "]",
  '{"a":1,"a":2,}',
  '{"a":1,"\\u0061":2,}',
  '{"heardPlayerBy":[],"segments":[{"text":"cut',
  '{"heardPlayerBy":[],"segments":[1,,]}',
  '{"heardPlayerBy":[],"segments":["unescaped "quote""]}',
  '{"heardPlayerBy":[],"segments":[1,}',
  "No usable reply",
])
  assert.equal(extractSceneReply(input), null, input);
// Repaired syntax is not permission to admit invalid Scene structure.
assert.throws(() =>
  parseVenueReply(
    extractSceneReply(
      '{"heardPlayerBy":[],"segments":[{"kind":"dialogue","speakerId":"stranger","text":"x","heardBy":[]},],}',
    ),
    ["a"],
  ),
);
let entries: RejectedResponse[] = [];
for (let i = 0; i < 12; i++) entries = retainRejectedResponses(entries, { operationId: String(i) } as RejectedResponse);
assert.deepEqual(
  entries.map((x) => x.operationId),
  ["7", "8", "9", "10", "11"],
);
console.log(
  "scene-json-hardening: syntax-only recovery, value fidelity, ambiguity refusals and global diagnostic bounds passed",
);

// Finished v3 core + appended effects: remove one extra brace, retain every value.
const core = {
  playerSpeechCapture: { status: "silent", utterances: [] },
  segments: [{ text: 'A {gate} bears "hello", [friend], and a backslash: \\.' }],
};
const coreJson = JSON.stringify(core);
for (const effects of [
  { memoryChanges: [{ text: "Only if Mara agrees; not a promise.", evidence: [0], nested: { note: '} , "quoted"' } }] },
  {
    relationshipChanges: { changes: [], disclosures: [{ source: 0, text: "No." }], permissions: [] },
    memoryChanges: [],
  },
  { wishChanges: [], projectSpeech: [], interpretationRouting: [] },
  { residentActions: [] },
  { residentActions: [{ id: "invite", source: { speakerId: "host", quote: "Come in." } }] },
  { residentActions: { malformed: "must remain supplied and fail action validation" } },
  { memoryChanges: { malformed: "must remain a failed domain, not discarded" } },
]) {
  const appended = coreJson + "," + JSON.stringify(effects).slice(1);
  const expected = { ...core, ...effects };
  assert.deepEqual(completeSceneObject(appended, "stop"), expected);
  assert.deepEqual(completeSceneObject("```json\n" + appended + "\n```", "end_turn"), expected);
  for (const finish of ["length", "unknown", undefined]) assert.equal(completeSceneObject(appended, finish), null);
  assert.equal(completeSceneObject(appended.slice(0, -1), "stop"), null, "no missing closer is invented");
  assert.equal(completeSceneObject(appended + " prose", "stop"), null);
  assert.equal(completeSceneObject(appended + "{}", "stop"), null);
}
const malformedEffect = completeSceneObject(coreJson + ',"memoryChanges":{"bad":true}}', "stop")!;
const isolated = normalizeRecoverableSceneReply(malformedEffect);
assert.deepEqual(
  isolated.raw.segments,
  core.segments.map((line) => ({ ...line, kind: "narration" })),
);
assert.deepEqual((isolated.failures.memories!.proposal as any).memoryChanges, { bad: true });
for (const key of [
  "sceneChange",
  "contactMoves",
  "departures",
  "sceneEnded",
  "invitation",
  "additionalSpeech",
  "unknown",
]) {
  assert.equal(
    completeSceneObject(coreJson + "," + JSON.stringify({ [key]: [] }).slice(1), "stop"),
    null,
    "critical and unknown suffix members are never folded into a core",
  );
}
for (const invalid of [
  coreJson + ',"memoryChanges":[],"memoryChanges":[]}',
  coreJson + ',"memoryChanges":[],"\\u006demoryChanges":[]}',
  coreJson + ',"relationshipChanges":{"changes":[],"changes":[]}}',
  coreJson + ',"residentActions":[],"residentActions":[]}',
  coreJson + ',"residentActions":[],"unknown":[]}',
  coreJson + ',"segments":[]}',
  coreJson + ',"playerSpeechCapture":{}}',
  coreJson + ',{"memoryChanges":[]}',
  coreJson + '},"memoryChanges":[]}',
  coreJson + ',"memoryChanges":[,]}',
  coreJson + ',"memoryChanges":[]',
  coreJson + "{}",
  coreJson.slice(0, -1) + ',"unknown":true},"memoryChanges":[]}',
  '{"playerSpeechCapture":{},"playerSpeechCapture":{},"segments":[]},"memoryChanges":[]}',
  '{"playerSpeechCapture":{"status":"silent","status":"captured"},"segments":[]},"memoryChanges":[]}',
])
  assert.equal(completeSceneObject(invalid, "stop"), null, invalid);
