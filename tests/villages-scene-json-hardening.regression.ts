// Test cases: scene-json-hardening/syntax, scene-json-hardening/ambiguity
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { completeSceneObject } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import {
  readContinuityProposal,
  readNarrationReply,
} from "../packages/villages/src/server/domain/rules/narration-contract.js";

const scene = {
  segments: [{ id: "answer", kind: "dialogue", speakerId: "a", text: 'A {gate}: "hello", [friend].' }],
  keep: [{ id: "note", for: ["a"], text: "An observation.", source: ["answer"] }],
  commands: [],
};
const json = JSON.stringify(scene);

await runCase("scene-json-hardening/syntax", () => {
  const main = readNarrationReply(
    { segments: [{ ...scene.segments[0], presentation: "main", delivery: "whisper", targetId: "player" }] },
    ["a"],
  ).segments[0];
  assert.equal("presentation" in main && main.presentation, undefined);
  assert.equal("delivery" in main && main.delivery, "whisper");
  for (const input of [
    json,
    "```json\n" + json + "\n```",
    json.slice(0, -1) + ",}",
    json.replace('"answer"]}],', '"answer"]},],'),
  ]) {
    const parsed = completeSceneObject(input, "stop");
    assert.deepEqual(parsed, scene);
    assert.equal(readNarrationReply(parsed, ["a"]).segments[0].text, scene.segments[0].text);
  }
  const multiline = JSON.stringify({ ...scene, segments: [{ ...scene.segments[0], text: "one\ntwo\r\nthree\tfour" }] });
  assert.deepEqual(completeSceneObject(multiline, "stop"), JSON.parse(multiline));
  assert.equal(
    completeSceneObject(multiline.replace(/\\n/gu, "\n").replace(/\\r/gu, "\r").replace(/\\t/gu, "\t"), "stop"),
    null,
  );
  for (const input of [
    json + json,
    "Here is the reply:\n" + json + "\nDone.",
    '{"segments":[],"\\q":{',
    '{"segments":[],"segments":[{"text":"cut',
    '{"segments":[],"keep":["cut',
    '{"segments":[,],"keep":[]}',
    '{"segments":[],"keep":[,]}',
    '{"segments":[],"commands":{,}}',
    "[" + json + "]",
    '{"a":1,"a":2,}',
    '{"a":1,"\\u0061":2,}',
    '{"segments":[{"text":"cut',
    '{"segments":[1,,]}',
    '{"segments":["unescaped "quote""]}',
    "No usable reply",
  ])
    assert.equal(completeSceneObject(input, "stop"), null, input);
  assert.throws(() => readNarrationReply(completeSceneObject('{"segments":[1,}', "stop"), ["a"]));
  const stranger = completeSceneObject(
    '{"segments":[{"kind":"dialogue","speakerId":"stranger","text":"x"},],}',
    "stop",
  );
  assert(stranger);
  assert.throws(() => readNarrationReply(stranger, ["a"]), /actor's words/);
});

await runCase("scene-json-hardening/ambiguity", () => {
  const core = { segments: [{ kind: "narration", text: 'A {gate} bears "hello", [friend], and a backslash: \\.' }] };
  const coreJson = JSON.stringify(core);
  const keep = [{ text: "A {gate} bears a sign.", source: ["answer"] }];
  const split = coreJson + "\n,keep:" + JSON.stringify(keep) + "}";
  assert.deepEqual(completeSceneObject(split, "stop"), { ...core, keep });
  const quoted = split.replace(",keep:", ',"keep":');
  assert.deepEqual(completeSceneObject(quoted, "stop"), { ...core, keep });
  const followingField = split.replace(",keep:", "keep:");
  const separateObject = coreJson + "\n" + JSON.stringify({ keep });
  for (const candidate of [followingField, separateObject]) {
    assert.deepEqual(completeSceneObject(candidate, "stop"), { ...core, keep });
    assert.equal(completeSceneObject(candidate, "length"), null);
    assert.equal(completeSceneObject(candidate.slice(0, -1) + ',"commands":[]}', "stop"), null);
    assert.equal(completeSceneObject(candidate.slice(0, -1), "stop"), null);
  }
  assert.equal(completeSceneObject(coreJson + '\n{"keep":[],"keep":[]}', "stop"), null);
  assert.equal(completeSceneObject(quoted, "length"), null);
  assert.equal(completeSceneObject(quoted.slice(0, -1) + ',"commands":[]}', "stop"), null);
  assert.equal(completeSceneObject(coreJson + ',"keep":[{"text":"first","text":"second"}]}', "stop"), null);
  assert.equal(completeSceneObject(split, "length"), null);
  assert.equal(completeSceneObject(split.slice(0, -1), "stop"), null);
  assert.equal(completeSceneObject(coreJson + ',keep:[{"text":"first","text":"second"}]}', "stop"), null);
  assert.equal(completeSceneObject(split.slice(0, -1) + ',"commands":[]}', "stop"), null);
  assert.equal(completeSceneObject(" ".repeat(149), "stop"), null);
  for (const effects of [
    { commands: [{ type: "scene.end", source: ["exit"] }], keep: [] },
    { commands: [] },
    { commands: { malformed: "must remain supplied and fail validation" } },
    { keep: { malformed: "must fail as an invalid response shape" } },
    { invitation: [], additionalSpeech: [] },
  ])
    for (const boundary of [",", "],"]) {
      const appended = coreJson + boundary + JSON.stringify(effects).slice(1);
      assert.equal(completeSceneObject(appended, "stop"), null);
      assert.equal(completeSceneObject("```json\n" + appended + "\n```", "end_turn"), null);
      for (const finish of ["length", "unknown", undefined]) assert.equal(completeSceneObject(appended, finish), null);
      assert.equal(completeSceneObject(appended.slice(0, -1), "stop"), null);
      assert.equal(completeSceneObject(appended + " prose", "stop"), null);
      assert.equal(completeSceneObject(appended + "{}", "stop"), null);
    }
  const malformed = { id: "note", independent: true, text: "Malformed independent proposal", source: [] };
  const extracted = completeSceneObject(JSON.stringify({ ...core, keep: [malformed] }), "stop");
  const reply = readNarrationReply(extracted, ["a"]);
  assert.equal(reply.segments[0].text, core.segments[0].text);
  assert.deepEqual(
    reply.keep,
    [malformed],
    "Optional failures reach effect validation without discarding the proposal",
  );
  assert.throws(() => readContinuityProposal(reply.keep[0]));
  assert.throws(() =>
    readNarrationReply(completeSceneObject(JSON.stringify({ ...core, keep: { malformed: true } }), "stop"), ["a"]),
  );
  assert.throws(() => readNarrationReply({ ...core, heardPlayerBy: ["a"] }, ["a"]));
  const partial = coreJson.slice(0, -1);
  for (const invalid of [
    partial + ',"keep":[],"keep":[]}',
    partial + ',"keep":[],"\\u006beep":[]}',
    partial + ',"commands":[{"type":"move","type":"depart"}]}',
    partial + ',"commands":[],"commands":[]}',
    partial + ',"segments":[]}',
    partial + ',"keep":[],"segments":[]}',
    partial + ',"keep":[,]}',
    partial + ',"keep":[]',
    coreJson + ',{"keep":[]}',
    coreJson + '} ,"keep":[]}',
    coreJson + "{}",
    coreJson + "\nWait, let me correct that.<｜end▁of▁thinking｜>" + JSON.stringify(scene),
  ])
    assert.equal(completeSceneObject(invalid, "stop"), null, invalid);
});
