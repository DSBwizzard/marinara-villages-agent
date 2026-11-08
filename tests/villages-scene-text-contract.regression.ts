import assert from "node:assert/strict";
import { parseSceneTextReply } from "../packages/villages/src/server/domain/rules/scene-text-contract.js";
import { materializeGmReply } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";

const parse = (text: string) => parseSceneTextReply(text, "stop");
const source = 'INPUT speech\n[narration] The sign says "Tea: [fresh]".\nA second line.\n[mara] "Please, sit."';
const raw: any = parse(source);
assert.equal(raw.input, "speech");
assert.equal(raw.segments[0].text, 'The sign says "Tea: [fresh]".\nA second line.');
assert.equal(raw.segments[1].speakerId, "mara");
assert.equal(raw.segments[1].text, '"Please, sit."');
assert.doesNotThrow(() =>
  parseVenueReply({ ...materializeGmReply(raw, "Hello."), heardPlayerBy: [] }, ["mara", "player"]),
);
assert.deepEqual(parse("```text\n" + source + "\n```"), raw);
assert.deepEqual(parse(source + "\nCHANGES\n{}"), raw);

const privateReply: any = parse(
  'INPUT [{"kind":"speech","text":"A secret.","delivery":"whisper","targetId":"mara"}]\n[mara whisper:player] Between us.',
);
assert.equal(privateReply.segments[0].delivery, "whisper");
assert.equal(privateReply.segments[0].targetId, "player");
const call: any = parse('INPUT [{"kind":"speech","text":"Hello!","delivery":"call"}]\n[mara call] Down here!');
assert.equal(call.input[0].delivery, "shout");
assert.equal(call.segments[0].delivery, "shout");
const targeted: any = parse("INPUT speech\n[mara call:bryn] Bryn, come here.\n[bryn to:mara] On my way.");
assert.equal(targeted.segments[0].targetId, "bryn");
assert.equal(targeted.segments[0].delivery, "shout");
assert.equal(targeted.segments[1].targetId, "mara");

const changed: any = parse(
  'INPUT action\n[narration] The white walls become blue.\nCHANGES\n{"action":{"happened":true,"segment":0,"edits":[{"before":"white","after":"blue"}]},"sounds":[{"segment":0,"sourceId":"mara","text":"A brush scrapes."}]}',
);
assert.equal(changed.action.edits[0].after, "blue");
assert.deepEqual(changed.segments[0].sound, { sourceId: "mara", text: "A brush scrapes." });
assert.equal(Object.hasOwn(changed, "sounds"), false);
assert.deepEqual(
  parse('INPUT []\nCHANGES\n{"halt":{"reason":"world","source":"player","quote":"world ends","appointments":[]}}')
    .segments,
  [],
);

for (const text of [
  "[mara] Hello.",
  "INPUT guessed\n[mara] Hello.",
  "INPUT speech\nHello.",
  "INPUT speech\n[narration whisper:player] Hidden.",
  "INPUT speech\n[narration] A public moment.\n[mara whisper] This must never become public continuation text.",
  "INPUT speech\n[narration] A public moment.\n[mara whisper:player A broken private header.",
  "INPUT speech\n[mara]\nCHANGES\n{}",
  "INPUT speech\n[mara] Hi.\nCHANGES\n{",
  "INPUT speech\n[mara] Hi.\nCHANGES\n[]",
  'INPUT speech\n[mara] Hi.\nCHANGES\n{"segments":[]}',
  'INPUT speech\n[mara] Hi.\nCHANGES\n{"input":"thought"}',
  'INPUT speech\n[mara] Hi.\nCHANGES\n{"heardPlayerBy":["mara"]}',
  'INPUT speech\n[mara] Hi.\nCHANGES\n{"unknown":true}',
  'INPUT speech\n[mara] Hi.\nCHANGES\n{"sounds":[{"segment":0,"sourceId":"mara","text":"Noise"}]}',
  'INPUT speech\n[narration] Noise.\nCHANGES\n{"sounds":[{"segment":0,"sourceId":"mara","text":"Noise"},{"segment":0,"sourceId":"mara","text":"Noise"}]}',
  'INPUT [{"kind":"thought","kind":"speech","text":"Secret."}]\n[mara] Hi.',
  'INPUT [{"kind":"speech","text":"Secret.","delivery":"whisper","delivery":"ordinary","targetId":"mara"}]\n[mara] Hi.',
  'INPUT speech\n[narration] A change.\nCHANGES\n{"action":{},"action":{"happened":true}}',
  'INPUT speech\n[narration] A change.\nCHANGES\n{"action":{"happened":true,"happened":false}}',
  'INPUT speech\n[narration] A change.\nCHANGES\n{"action":' + "[".repeat(70) + "0" + "]".repeat(70) + "}",
  "INPUT speech\n[narration] " + "x".repeat(131073),
])
  assert.throws(() => parse(text), /Scene reply/);
assert.throws(() => parseSceneTextReply(source, "length"), /completion boundaries/);
assert.throws(() => materializeGmReply(parse('INPUT [{"kind":"speech","text":"Invented"}]\n[mara] Hi.'), "Exact."));
assert.throws(() =>
  parseVenueReply({ ...materializeGmReply(parse("INPUT speech\n[unknown] Hi."), "Hello."), heardPlayerBy: [] }, [
    "mara",
    "player",
  ]),
);
console.log(
  "Scene text grammar preserves prose, delivery and effect references; invalid or forged metadata is rejected.",
);
