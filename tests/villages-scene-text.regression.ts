import assert from "node:assert/strict";
import { buildVenueTextContract } from "../packages/villages/src/server/domain/rules/venue-response-contract.js";
import { extractSceneReply } from "../packages/villages/src/server/domain/rules/scene-reply-json.js";

import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";

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
  const spoken = parseVenueReply(extractSceneReply(examples[0]!), ["outgoing", "reserved"]);
  assert.deepEqual(
    spoken.lines.map((line) => line.kind),
    ["dialogue"],
  );
  assert.equal(spoken.lines[0]!.content, 'spoken words containing a quoted phrase: "quoted words"');
  const narrated = parseVenueReply(extractSceneReply(examples[1]!), ["outgoing", "reserved"]);
  assert.deepEqual(
    narrated.lines.map((line) => line.kind),
    ["narration"],
  );
}
// The illustrations impose no alternation. Mixed exchanges still preserve their
// actual order and quoted speech through the production extractor and parser.
const mixed = parseVenueReply(
  extractSceneReply(
    JSON.stringify({
      heardPlayerBy: ["reserved"],
      segments: [
        { kind: "narration", text: "She moves the chair.", heardBy: ["reserved"] },
        { kind: "dialogue", speakerId: "reserved", text: 'I called it "mine".', heardBy: ["reserved"] },
        { kind: "dialogue", speakerId: "reserved", text: "Want a seat?", heardBy: ["reserved"] },
      ],
    }),
  ),
  ["reserved"],
);
assert.deepEqual(
  mixed.lines.map((line) => line.kind),
  ["narration", "dialogue", "dialogue"],
);
assert.equal(mixed.lines[1]!.content, 'I called it "mine".');
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
const toPlayer = parseVenueReply(
  {
    heardPlayerBy: ["reserved", "player"],
    segments: [
      { kind: "dialogue", speakerId: "reserved", text: "An answer.", heardBy: ["reserved"] },
      { kind: "whisper", speakerId: "reserved", targetId: "player", text: "Just between us.", heardBy: ["player"] },
    ],
  },
  ["reserved", "bystander"],
);
assert.equal(toPlayer.lines[1]!.kind, "whisper", "player-directed whispers stay as whispers");
assert.equal(toPlayer.lines[1]!.targetId, "player");
assert.equal(toPlayer.lines[1]!.gazeAt, "player");
assert.equal(toPlayer.lines[1]!.anchorIndex, 0);
assert.deepEqual(toPlayer.lines[1]!.heardBy, ["reserved"], "the player target never enters resident witness IDs");
assert.deepEqual(toPlayer.heardPlayerBy, ["reserved"]);
const unknownTarget = parseVenueReply(
  {
    heardPlayerBy: [],
    segments: [{ kind: "whisper", speakerId: "reserved", targetId: "unknown", text: "An answer.", heardBy: [] }],
  },
  ["reserved"],
);
assert.equal(unknownTarget.lines[0]!.kind, "dialogue", "invalid targets retain the existing safe downgrade");
assert.throws(() =>
  parseVenueReply(
    { heardPlayerBy: [], segments: [{ kind: "dialogue", speakerId: "player", text: "I agree.", heardBy: [] }] },
    ["reserved"],
  ),
);
console.log(
  "Scene text: valid syntax examples, speech/action order, quoted speech, private witnesses and unrepaired malformed JSON passed.",
);
