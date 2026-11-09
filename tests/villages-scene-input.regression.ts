import assert from "node:assert/strict";
import { materializeGmReply } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { playerSourceSpan } from "../packages/villages/src/server/domain/rules/player-speech-capture.js";

const reply = (input: unknown[], text: string, extra = {}) =>
  materializeGmReply(
    { input, segments: [{ kind: "dialogue", speakerId: "resident", text: "input:0" }], ...extra },
    text,
  );
for (const [text, selected] of [
  ["*I wave.* “Hello.” I think about leaving.", [{ text: "Hello." }]],
  ["I imagine saying “yes”; I do not say it.", []],
  ["No, I will not go.", [{ text: "No, I will not go." }]],
  ["I think “hello” but say “hello”.", [{ text: "hello", occurrence: 2 }]],
  ["💬 “café 👩‍🚀” *I smile.*", [{ text: "café 👩‍🚀" }]],
] as const) {
  const result = reply([...selected], text);
  const timeline = (result.intent as any).timeline;
  assert.equal(timeline.map((span: any) => span.text).join(""), text);
  assert.deepEqual(
    timeline.filter((span: any) => span.kind === "speech").map((span: any) => span.text),
    selected.map((span) => span.text),
  );
  for (const span of timeline) assert.equal(text.slice(span.start, span.end), span.text);
  assert.equal(
    (result.segments as any[]).at(-1).text,
    "input:0",
    "Narrative leaf text is never mistaken for a citation",
  );
}
assert.throws(() => reply([{ text: "hello" }], "I think “hello” but say “hello”."), /ambiguous/u);
assert.equal(playerSourceSpan({ text: "hello", occurrence: 2 }, "hello hello").start, 6);
for (const [text, fragment] of [
  ["💬", "\udcac"],
  ["e\u0301", "e"],
  ["👩‍🚀", "👩"],
])
  assert.throws(() => playerSourceSpan({ text: fragment }, text), /invalid player source/u);
assert.throws(() => reply([{ text: "now", kind: "thought" }], "now"), /invalid source spans/u);
assert.throws(() => reply([{ text: "now", delivery: "invalid" }], "now"), /invalid source spans/u);
assert.throws(
  () =>
    reply(
      [
        { text: "hello", occurrence: 2 },
        { text: "hello", occurrence: 1 },
      ],
      "hello hello",
    ),
  /invalid source spans/u,
);
const request = reply(
  [{ kind: "action", text: "*I point outside.*" }, { text: "Join me." }],
  "Quiet thought. *I point outside.* Join me.",
  {
    immediateResidentMoves: [{ characterIds: ["resident"], zoneId: "exterior", source: "input:1" }],
    memoryChanges: [{ learners: { resident: { support: [{ lineId: "input:1" }] } } }],
  },
);
assert.equal(
  (request.immediateResidentMoves as any[])[0].source,
  3,
  "Movement source points to the canonical input timeline, including non-audible gaps",
);
assert.equal(
  (request.memoryChanges as any[])[0].learners.resident.support[0].lineId,
  0,
  "Only exact audible input becomes a citable player line",
);
assert.throws(
  () => reply([{ kind: "action", text: "I wait." }], "I wait.", { access: [{ evidence: ["input:0"] }] }),
  /non-audible/u,
);
console.log(
  "Sparse player capture preserves exact full source, explicit speech, occurrence, Unicode and movement references without making gaps audible.",
);
