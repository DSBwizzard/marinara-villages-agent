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
    "```JSON\r\n" + json + "\r\n```",
    "```json\n" + json,
    json + "\n```",
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
  const segments = [{ kind: "narration", text: 'Leave this punctuation alone: },},{ and "},},{".' }, scene.segments[0]];
  const extraBrace = JSON.stringify({ segments }).replace('},{"id"', '},},{"id"');
  const strayTail = JSON.stringify({ segments, keep: scene.keep }).replace('],"keep"', ']}],"keep"');
  assert.equal(completeSceneObject(strayTail, "stop", undefined, true), null);
  assert.deepEqual(completeSceneObject(strayTail, "stop", undefined, true, true, true), { segments, keep: scene.keep });
  assert.equal(completeSceneObject(strayTail, "length", undefined, true, true, true), null);
  assert.equal(
    completeSceneObject(strayTail.slice(0, -1) + ',"k\\u0065ep":[]}', "stop", undefined, true, true, true),
    null,
  );
  assert.equal(
    completeSceneObject(strayTail.slice(0, -1) + ',"commands":[]}', "stop", undefined, true, true, true),
    null,
  );
  assert.equal(completeSceneObject(extraBrace, "stop", undefined, true), null);
  assert.deepEqual(completeSceneObject(extraBrace, "stop", undefined, true, true), { segments });
  const earlyClose = JSON.stringify({ segments }).replace('},{"id"', '}]},{"id"');
  assert.equal(completeSceneObject(earlyClose, "stop", undefined, true, true), null);
  assert.deepEqual(completeSceneObject(earlyClose, "stop", undefined, true, 2), { segments });
  assert.equal(completeSceneObject(earlyClose, "length", undefined, true, 2), null);
  assert.equal(completeSceneObject(earlyClose.slice(0, -1) + ',"keep":[]}', "stop", undefined, true, 2), null);
  assert.equal(completeSceneObject(extraBrace, "length", undefined, true, true), null);
  assert.equal(completeSceneObject(extraBrace.slice(0, -1) + ',"keep":[]}', "stop", undefined, true, true), null);
  assert.equal(
    completeSceneObject(extraBrace.slice(0, -2) + ',{"kind":"keep"}]}', "stop", undefined, true, true),
    null,
  );
  const core = { segments: [{ kind: "narration", text: 'A {gate} bears "hello", [friend], and a backslash: \\.' }] };
  const coreJson = JSON.stringify(core);
  const joined = '{"kind":"dialogue","speakerId":"a","text":"I said hello.","kind":"narration","text":"She waves."}';
  const splitSegments = [
    { kind: "dialogue", speakerId: "a", text: "I said hello." },
    { kind: "narration", text: "She waves." },
  ];
  const joinedReply = '{"segments":[' + joined + '],"keep":' + JSON.stringify(scene.keep) + "}";
  const readJoined = (input: string, finish = "stop") => completeSceneObject(input, finish, undefined, true, 5, 2);
  assert.deepEqual(readJoined(joinedReply), { segments: splitSegments, keep: scene.keep });
  assert.equal(completeSceneObject(joinedReply, "stop", undefined, true, 4, 2), null);
  assert.equal(readJoined(joinedReply, "length"), null);
  for (const invalid of [
    '{"segments":[' + joined + "," + joined + "]}",
    coreJson.slice(0, -1) + ',"keep":[' + joined + "]}",
    '{"segments":[{"kind":"narration","text":"A line","staging":' + joined + "}]}",
    joinedReply.replace('"text":"I said hello.",', '"text":"I said hello.","requires":["note"],'),
    joinedReply.replace('"text":"She waves."}', '"text":"She waves.","id":"wave"}'),
    joinedReply.replace('"id":"note"', '"id":"note","id":"other"'),
    joinedReply.replace('"source":["answer"]', '"source":[{"segment":2}]'),
    joinedReply.replace('"source":["answer"]', '"source":["segment-1"]'),
    '{"segments":[' + joined + ',{"kind":"keep","for":["a"],"source":[{"segment":2}]}]}',
    joinedReply.replace('"source":["answer"]', '"source":[{"input":"Hi","ground":{"at":{"after":2}}}]'),
    joinedReply.slice(0, -1) + ',"commands":[]}',
  ])
    assert.equal(readJoined(invalid), null, invalid);
  const keep = [{ text: "A {gate} bears a sign.", source: ["answer"] }];
  const split = coreJson + "\n,keep:" + JSON.stringify(keep) + "}";
  assert.deepEqual(completeSceneObject(split, "stop"), { ...core, keep });
  const quoted = split.replace(",keep:", ',"keep":');
  assert.deepEqual(completeSceneObject(quoted, "stop"), { ...core, keep });
  const followingField = split.replace(",keep:", "keep:");
  const separateObject = coreJson + "\n" + JSON.stringify({ keep });
  const commaSeparated = coreJson + "," + JSON.stringify({ keep });
  const correction = "\nCorrection: Replace the earlier draft with this final reply.\n";
  const final = { segments: [{ ...scene.segments[0], text: "The corrected line." }] };
  const finalJson = JSON.stringify(final);
  const readReplacement = (input: string, finish = "stop") =>
    completeSceneObject(input, finish, undefined, true, 4, 2, true);
  assert.deepEqual(readReplacement(commaSeparated + "]}\n" + correction + finalJson), final);
  assert.deepEqual(readReplacement(coreJson + correction + finalJson), final);
  assert.equal(completeSceneObject(coreJson + correction + finalJson, "stop", undefined, true, 4, 2), null);
  assert.equal(completeSceneObject(coreJson + correction + finalJson, "stop", undefined, undefined, 4, 2, true), null);
  assert.equal(readReplacement(coreJson + correction + finalJson, "length"), null);
  for (const invalid of [
    coreJson + "\n" + finalJson,
    coreJson + correction + finalJson + correction + finalJson,
    coreJson + correction + finalJson.slice(0, -1),
    coreJson + correction + finalJson + "\nThis is the final reply.",
    coreJson + correction + finalJson.slice(0, -1) + ',"segments":[]}',
    coreJson + correction + finalJson.slice(0, -1) + ',"commands":[]}',
    JSON.stringify({ ...core, commands: [] }) + correction + finalJson,
    coreJson + "\nkeep:[]]}" + correction + finalJson,
  ])
    assert.equal(readReplacement(invalid), null, invalid);
  const quotedCorrection = JSON.stringify({ segments: [{ kind: "narration", text: correction + finalJson }] });
  assert.deepEqual(readReplacement(quotedCorrection), JSON.parse(quotedCorrection));
  const unknownActor = { segments: [{ ...final.segments[0], speakerId: "stranger" }] };
  assert.throws(() => readNarrationReply(readReplacement(coreJson + correction + JSON.stringify(unknownActor)), ["a"]));
  assert.equal(completeSceneObject(commaSeparated, "stop", undefined, true, 2, true), null);
  assert.deepEqual(completeSceneObject(commaSeparated, "stop", undefined, true, 2, 2), { ...core, keep });
  assert.equal(completeSceneObject(commaSeparated, "length", undefined, true, 2, 2), null);
  assert.equal(
    completeSceneObject(commaSeparated.slice(0, -1) + ',"commands":[]}', "stop", undefined, true, 2, 2),
    null,
  );
  for (const candidate of [followingField, separateObject]) {
    assert.deepEqual(completeSceneObject(candidate, "stop"), { ...core, keep });
    assert.equal(completeSceneObject(candidate, "length"), null);
    assert.equal(completeSceneObject(candidate.slice(0, -1) + ',"commands":[]}', "stop"), null);
    assert.equal(completeSceneObject(candidate.slice(0, -1), "stop"), null);
  }
  assert.equal(completeSceneObject(coreJson + '\n{"keep":[],"keep":[]}', "stop"), null);
  const bare = coreJson + "\n\nkeep:" + JSON.stringify(keep);
  assert.equal(completeSceneObject(bare, "stop"), null);
  assert.deepEqual(completeSceneObject(bare, "stop", undefined, true), { ...core, keep });
  for (const text of [
    bare.slice(0, -1),
    bare + " prose",
    bare + "]",
    bare + "\nkeep:[]",
    bare + ',"commands":[]',
    bare + ',"keeps":[]',
  ])
    assert.equal(completeSceneObject(text, "stop", undefined, true), null);
  assert.equal(completeSceneObject(bare, "length", undefined, true), null);
  for (const key of ["keeps", "effects"]) {
    const response = coreJson + "\n\n" + JSON.stringify({ [key]: keep });
    assert.equal(completeSceneObject(response, "stop"), null);
    assert.deepEqual(completeSceneObject(response, "stop", undefined, true), { ...core, [key]: keep });
    assert.equal(completeSceneObject(response, "length", undefined, true), null);
  }
  const shortId = '{"segments":[{"id":"d1,"kind":"dialogue","speakerId":"a","text":"Hello."}]}';
  assert.equal(completeSceneObject(shortId, "stop"), null);
  assert.equal(readNarrationReply(completeSceneObject(shortId, "stop", undefined, true), ["a"]).segments[0].id, "d1");
  assert.equal(completeSceneObject(shortId, "length", undefined, true), null);
  assert.equal(
    completeSceneObject(shortId.replace('"speakerId"', '"id":"d2","speakerId"'), "stop", undefined, true),
    null,
  );
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
