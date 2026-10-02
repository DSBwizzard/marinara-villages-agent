import assert from "node:assert/strict";
import { buildVenueTextContract } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-response-contract.js";
import { extractSceneReply } from "../packages/villages/src/engine/packages/server/src/services/villages/scene-reply-json.js";
import { parseVenueReply } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";

// Use the production contract, extractor and parser: interleaved speech/actions
// must survive quoting without any paid repair or reinterpretation of the prose.
for (const opening of [false, true]) {
  const contract = buildVenueTextContract("reserved", ["outgoing", "reserved"], opening);
  const examples = contract.split("\n").filter((line) => line.startsWith("{"));
  assert.equal(examples.length, 2);
  for (const example of examples) {
    const raw = extractSceneReply(example);
    assert.ok(raw);
    const reply = parseVenueReply(raw, ["outgoing", "reserved"]);
    assert.deepEqual(reply.heardPlayerBy, opening ? [] : ["outgoing", "reserved"]);
    assert.ok(reply.lines.every((line) => line.heardBy.includes("reserved")));
    assert.ok(reply.lines.filter((line) => line.kind !== "narration").every((line) => line.speakerId === "reserved"));
  }
  const split = parseVenueReply(extractSceneReply(examples[1]!), ["outgoing", "reserved"]);
  assert.deepEqual(
    split.lines.map((line) => line.kind),
    ["dialogue", "narration", "dialogue"],
  );
  assert.equal(split.lines[2]!.content, 'next spoken words, including a quoted phrase: "quoted words"');
}
assert.equal(
  buildVenueTextContract()
    .split("\n")
    .filter((line) => line.startsWith("{")).length,
  0,
);

// The prompt improvement must not conceal the observed malformed boundary.
assert.equal(
  extractSceneReply(
    '{"heardPlayerBy":["reserved"],"segments":[{"kind":"dialogue","speakerId":"reserved","text":"Hello." She turns toward you. "Again.","heardBy":["reserved"]}]}',
  ),
  null,
);
const witnessed = parseVenueReply(
  {
    heardPlayerBy: ["reserved"],
    segments: [
      { kind: "dialogue", speakerId: "reserved", text: "An answer.", heardBy: ["reserved"] },
      { kind: "whisper", speakerId: "reserved", targetId: "outgoing", text: "A private aside.", heardBy: ["reserved"] },
    ],
  },
  ["outgoing", "reserved", "bystander"],
);
assert.deepEqual(witnessed.lines[1]!.heardBy, ["reserved", "outgoing"]);
assert.equal(witnessed.lines[1]!.kind, "whisper");
assert.equal(witnessed.lines[1]!.targetId, "outgoing");
assert.throws(() =>
  parseVenueReply(
    { heardPlayerBy: [], segments: [{ kind: "dialogue", speakerId: "player", text: "I agree.", heardBy: [] }] },
    ["reserved"],
  ),
);
console.log(
  "Scene text: valid syntax examples, speech/action order, quoted speech, private witnesses and unrepaired malformed JSON passed.",
);
