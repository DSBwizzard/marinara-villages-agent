import assert from "node:assert/strict";
import { parseSceneTextReply } from "../packages/villages/src/server/domain/rules/scene-text-contract.js";
import { materializeGmReply } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";

const parse = (text: string) => parseSceneTextReply(text, "stop", ["mara", "bryn"]);
const source = 'INPUT speech\n[narration] The sign says "Tea: [fresh]".\nA second line.\n[mara] "Please, sit."';
const raw: any = parse(source);
{
  const local: any = parse(
    'INPUT speech\n[mara whisper:player] A long lead-in. [remember]I prefer tart apples.[/remember] She waits.\nMEMORY {"text":"Mara prefers tart apples.","learners":["player"],"disclosure":{"kind":"preference","about":"self"}}\n[bryn aside] Tea?',
  );
  assert.equal(local.segments.length, 2);
  assert.equal(local.segments[0].text, "A long lead-in. I prefer tart apples. She waits.");
  assert.equal(local.segments[0].delivery, "whisper");
  assert.equal(local.segments[1].presentation, "aside");
  assert.deepEqual(local.memoryChanges[0].support, [{ lineId: 0, excerpt: "I prefer tart apples." }]);
  const short: any = parse('INPUT speech\n[mara] I like tea.\nMEMORY {"text":"Mara likes tea.","learners":["player"]}');
  assert.deepEqual(short.memoryChanges[0].support, [{ lineId: 0, excerpt: "I like tea." }]);
  for (const control of [
    '  MEMORY {"text":"Tea.","learners":["player"]}',
    'MEMORY: {"text":"Tea.","learners":["player"]}',
  ])
    assert.equal((parse("INPUT speech\n[mara] Tea.\n" + control) as any).segments[0].text, "Tea.");
  for (const control of [
    'Memory: {"text":"PRIVATE"}',
    'She pauses. MEMORY {"text":"PRIVATE"}',
    "[Remember]PRIVATE[/Remember]",
    "[remember ]PRIVATE[/remember ]",
  ])
    assert.throws(() => parse("INPUT speech\n[mara] Tea. " + control), /Memory/);
  for (const passage of ["", "[remember]nested[/remember]", "é".repeat(161)])
    assert.throws(
      () =>
        parse(`INPUT speech\n[mara] [remember]${passage}[/remember]\nMEMORY {"text":"A fact.","learners":["player"]}`),
      /Memory/,
    );
  assert.doesNotThrow(() =>
    parse(
      `INPUT speech\n[mara] [remember]${"é".repeat(160)}[/remember]\nMEMORY {"text":"A fact.","learners":["player"]}`,
    ),
  );
  for (const text of [
    'INPUT speech\n[mara] [remember]Unclosed.\nMEMORY {"text":"A fact."}',
    'INPUT speech\n[mara] [remember]Crossing.\n[bryn] End.[/remember]\nMEMORY {"text":"A fact."}',
    'INPUT speech\nMEMORY {"text":"No source."}',
    'INPUT speech\n[mara] Fine.\nMEMORY {"text":"One."}\nMEMORY {"text":"Two."}',
    'INPUT speech\n[mara] Public. [remember][bryn whisper:player] SECRET[/remember]\nMEMORY {"text":"A fact."}',
  ])
    assert.throws(() => parse(text), /Memory|paragraph headers/);
  const unused: any = parse("INPUT speech\n[mara] [remember]She looks at the ceiling.[/remember] Tea?");
  assert.equal(unused.segments[0].text, "She looks at the ceiling. Tea?");
  assert.equal(unused.memoryChanges, undefined, "A source hint alone neither invents a Memory nor discards dialogue");
  for (const key of ["support", "lineId", "speakerId", "source"])
    assert.throws(() => parse(`INPUT speech\n[mara] Fine.\nMEMORY {"text":"A fact.","${key}":0}`), /Memory/);
}
const opening: any = parse('INPUT speech\nThe kettle rattles.\nIts label says "[fresh]".\n[mara] Tea?');
assert.deepEqual(opening.segments[0], { kind: "narration", text: 'The kettle rattles.\nIts label says "[fresh]".' });
assert.equal(opening.segments[1].speakerId, "mara");
for (const spacing of [undefined, 2]) {
  const array = JSON.stringify(
    [{ kind: "speech", text: 'A [bracket] and a "quote".', delivery: "whisper", targetId: "mara" }],
    null,
    spacing,
  );
  const reply: any = parse("INPUT " + array + "\nThe kettle rattles.\n[mara whisper:player] Only you.");
  assert.equal(reply.input[0].text, 'A [bracket] and a "quote".');
  assert.equal(reply.segments[0].kind, "narration");
  assert.equal(reply.segments[1].delivery, "whisper");
}
assert.equal(raw.input, "speech");
assert.equal(raw.segments[0].text, 'The sign says "Tea: [fresh]".\nA second line.');
assert.equal(raw.segments[1].speakerId, "mara");
assert.equal(raw.segments[1].text, '"Please, sit."');
assert.doesNotThrow(() =>
  parseVenueReply({ ...materializeGmReply(raw, "Hello."), heardPlayerBy: [] }, ["mara", "player"]),
);
assert.deepEqual(parse("```text\n" + source + "\n```"), raw);
assert.deepEqual(parse(source.replaceAll("[narration]", " [ narration ]").replaceAll("[mara]", "\t[ mara\t]")), raw);
assert.deepEqual(parse(source + "\nCHANGES\n{}"), raw);
assert.deepEqual(parse(source + "\nCHANGES {}"), raw);
assert.deepEqual(parse(source + "\nCHANGES:{}"), raw);
assert.deepEqual(parse(source + "\n\n{}"), raw);
for (const footer of ['{"memoryChanges":[]}']) {
  const reply: any = parse(source + "\n\n" + footer);
  assert.deepEqual(reply.memoryChanges, []);
  assert.deepEqual(reply.segments, raw.segments, "An unlabeled complete footer is never dialogue");
}
const literal: any = parse(
  'INPUT [{"kind":"speech","text":"A [mara] label."}]\n[mara] Fine.\n\n{"action":{"recent":"A [bryn] label."}}',
);
assert.equal(literal.input[0].text, "A [mara] label.");
assert.equal(literal.action.recent.text, "A [bryn] label.");
assert.equal(literal.segments.length, 1);
const quoted: any = parse("INPUT speech\n[mara] Example: '{\"memoryChanges\":[]}'");
assert.equal(quoted.memoryChanges, undefined);
assert.equal(quoted.segments.length, 1);
const codeExample: any = parse('INPUT speech\n[mara] Example:\n```json\n{"memoryChanges":[]}\n```\nCHANGES {}');
assert.equal(codeExample.memoryChanges, undefined);
assert(codeExample.segments[0].text.includes('{"memoryChanges":[]}'));
const inline: any = parse("INPUT speech\nA pause. [mara] Hello. [narration] She smiles. [bryn aside] Tea?");
for (const delivery of ["", " to:bryn", " whisper:player", " call:bryn"]) {
  const bubbles: any = parse(`INPUT speech\n[mara${delivery}] Hello. [aside] Tea?\n[aside] No sugar.`);
  assert.equal(bubbles.segments.length, 3);
  for (const bubble of bubbles.segments.slice(1)) {
    assert.deepEqual(
      { ...bubble, text: "Hello.", presentation: undefined },
      { ...bubbles.segments[0], presentation: undefined },
      "A bubble inherits the exact speaker, delivery and recipient without widening hearing",
    );
    assert.equal(bubble.presentation, "aside");
  }
}
for (const body of [
  "[aside] No speaker.",
  "[narration] She pauses. [aside] No speaker.",
  "[mara] [aside] Empty source.",
  "[mara] Hello. [aside] [bryn] Empty bubble.",
  "[mara] Hello. [Aside] Wrong control.",
  "[mara] Hello. [aside whisper:player] Ambiguous control.",
  "[mara] Hello. </｜｜DSML｜｜ parameter>",
  "[mara] Hello. <|DSML|parameter>",
  "[mara] [narration] Empty speech before action.",
])
  assert.throws(() => parse("INPUT speech\n" + body), /aside|paragraph|controls/);
const memoryBubbles: any = parse(
  'INPUT speech\n[mara whisper:player] Tea.\nMEMORY {"text":"Tea.","learners":["player"]}\n[aside] No sugar.\nMEMORY {"text":"No sugar.","learners":["player"]}\n[aside] None.',
);
assert.deepEqual(
  memoryBubbles.memoryChanges.map((m: any) => m.support[0].lineId),
  [0, 1],
);
assert.equal(memoryBubbles.segments.length, 3);
for (const bubble of memoryBubbles.segments.slice(1)) {
  assert.equal(bubble.speakerId, "mara");
  assert.equal(bubble.delivery, "whisper");
  assert.equal(bubble.targetId, "player");
  assert.equal(bubble.presentation, "aside");
}
assert.deepEqual(parse("INPUT speech\nA pause. [ mara ] Hello. [ narration ] She smiles. [ bryn aside ] Tea?"), inline);
assert.deepEqual(
  inline.segments.map((s: any) => [s.kind, s.speakerId, s.presentation, s.text]),
  [
    ["narration", undefined, undefined, "A pause."],
    ["dialogue", "mara", undefined, "Hello."],
    ["narration", undefined, undefined, "She smiles."],
    ["dialogue", "bryn", "aside", "Tea?"],
  ],
);
assert.equal((parse("INPUT speech\n[mara] The label says [fresh] and \\[bryn].").segments as any[]).length, 1);
const introduction: any = parse(
  'INPUT speech\n[narration] A visitor enters. [new:visitor aside] Hello.\nCHANGES {"npcIntroductions":[{"ref":"new:visitor","name":"Visitor","characterization":"Friendly","segment":0}]}',
);
assert.equal(introduction.segments[1].speakerId, "new:visitor");
assert.deepEqual(
  parse("INPUT speech\n[mara whisper:player]Private."),
  parse("INPUT speech\n[mara whisper:player] Private."),
);

const privateReply: any = parse(
  'INPUT [{"kind":"speech","text":"A secret.","delivery":"whisper","targetId":"mara"}]\n[mara whisper:player] Between us.',
);
assert.equal(privateReply.segments[0].delivery, "whisper");
assert.equal(privateReply.segments[0].targetId, "player");
assert.deepEqual(
  parse(
    'INPUT [{"kind":"speech","text":"A secret.","delivery":"whisper","targetId":"mara"}]\n\t[ mara whisper:player ] Between us.',
  ),
  privateReply,
);
for (const header of [
  "[ mara whisper:player ]",
  "[ mara\nwhisper:player ]",
  "[ mara whisper :player ]",
  "[\n mara whisper:player ]",
  "[ \r\n\tmara whisper:player ]",
])
  assert.throws(() => parse("INPUT speech\n[mara] Public. " + header + " PRIVATE"), /paragraph headers/);
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
assert.deepEqual(changed.action.consent, []);
assert.deepEqual(changed.segments[0].sound, { sourceId: "mara", text: "A brush scrapes." });
assert.equal(Object.hasOwn(changed, "sounds"), false);
for (const metadata of [
  'action:{"happened":true,"segment":0,"actorIds":["player"],"recent":"A cup by the shelf."}',
  '"action":{"happened":true,"segment":0,"actorIds":["player"],"recent":"A cup by the shelf."}',
  '{"action":{"happened":true,"segment":0,"actorIds":["player"],"recent":"A cup by the shelf."}}',
]) {
  const reply: any = parse("INPUT action\n[narration] You put a cup by the shelf.\nCHANGES\n" + metadata);
  assert.deepEqual(reply.action.consent, []);
  assert.deepEqual(reply.action.recent, { text: "A cup by the shelf." });
}
const exact = 'A quote: "action:", commas, braces {}, and memoryChanges: [] stay literal. 😺';
const members: any = parse(
  "INPUT action\n[narration] You move the cup.\nCHANGES\n" +
    'action:{"segment":0,"recent":' +
    JSON.stringify(exact) +
    '},\n"memoryChanges":[], relationshipChanges:{"changes":[]}',
);
assert.equal(members.action.recent.text, exact);
assert.deepEqual(members.memoryChanges, []);
assert.deepEqual(members.relationshipChanges, { changes: [] });
for (const consent of [null, "", {}, false]) {
  const reply: any = parse("INPUT action\n[narration] A change.\nCHANGES\n" + JSON.stringify({ action: { consent } }));
  assert.deepEqual(reply.action.consent, consent, "Malformed supplied consent is never replaced by an empty list");
}
const emptyRecent: any = parse('INPUT action\n[narration] Cleared.\nCHANGES\naction:{"recent":""}');
assert.deepEqual(
  emptyRecent.action.recent,
  { text: "" },
  "A complete empty paragraph keeps its existing clear meaning",
);
for (const metadata of [
  'action:{"happened":true}, "action":{}',
  'action:{"segment":0,"segment":1}',
  "action:{happened:true}",
  'action:{"recent":"unfinished',
  'action:{"happened":true',
  "action:{},",
  "action:{} trailing explanation",
  "action:{}; memoryChanges:[]",
  "action:{},unknown:[]",
  "segments:[],action:{}",
  "__proto__:{}",
  "",
])
  assert.throws(() => parse("INPUT action\n[narration] A change.\nCHANGES\n" + metadata), /change fields/);
assert.deepEqual(
  parse('INPUT []\nCHANGES\n{"halt":{"reason":"world","source":"player","quote":"world ends","appointments":[]}}')
    .segments,
  [],
);

for (const text of [
  '{"input":"speech","segments":[{"kind":"dialogue","speakerId":"mara","text":"Old writer JSON."}]}',
  "[mara] Hello.",
  "INPUT guessed\n[mara] Hello.",
  "INPUT [],\n[mara] Hello.",
  'INPUT [{"kind":"speech","text":"unfinished"}\n[mara] Hello.',
  "INPUT [] trailing input text\n[mara] Hello.",
  "INPUT speech\n[narration whisper:player] Hidden.",
  "INPUT speech\nThe kettle rattles. [mara whisper:player] PRIVATE\n[bryn] Hello.",
  "INPUT speech\nThe kettle rattles. [mara\nwhisper:player] PRIVATE\n[bryn] Hello.",
  "INPUT speech\nThe kettle rattles.\nA pause. [mara whisper] PRIVATE\n[bryn] Hello.",
  "INPUT speech\nThe kettle rattles. [unknown aside] Hello.",
  "INPUT speech\nThe kettle rattles. [new:undeclared] Hello.",
  "INPUT speech\nThe kettle rattles. [/mara] Hello.",
  "INPUT speech\n[mara] Hello. [mara whisper:player] PRIVATE",
  "INPUT speech\n[narration] A public moment.\n[mara whisper] This must never become public continuation text.",
  "INPUT speech\n[narration] A public moment.\n[mara whisper:player A broken private header.",
  "INPUT speech\n[mara]\nCHANGES\n{}",
  "INPUT speech\n[mara] Hi.\nCHANGES\n{",
  "INPUT speech\n[mara] Hi.\nCHANGES {",
  "INPUT speech\n[mara] Hi.\nCHANGES not metadata",
  'INPUT speech\n[mara] Hi.\n{"action":',
  'INPUT speech\n[mara] Hi.\n{"unknown":true}',
  'INPUT speech\n[mara] Here is an example:\n{"memoryChanges":[]}',
  'INPUT speech\n[mara] Here is an example:\n\n{"memoryChanges":[]}',
  'INPUT speech\n[mara] Here is code:\n```json\n\n{"memoryChanges":[]}\n```',
  "INPUT speech\n[mara] Hi.\n\nmemoryChanges:[]",
  'INPUT speech\n[mara] Hi.\n{"action":{}}\n[mara] Trailing prose.',
  "INPUT speech\n[mara] Hi. CHANGES {}",
  'INPUT speech\n[mara] Hi. CHANGES action:{"happened":true}',
  'INPUT speech\n[mara] Hi. CHANGES "memoryChanges":[]',
  'INPUT speech\n[mara] Hi. CHANGES\n{"action":{"happened":true}}',
  "INPUT speech\n[mara] Hi.\nCHANGES {}\n[mara] Discarded prose.",
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
  assert.throws(() => parse(text), /Scene reply/, text.slice(0, 160));
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
