import assert from "node:assert/strict";
import { lineStagingCues } from "../packages/villages/src/shared/helpers/scene-staging.js";
import { completeSceneObject } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";

import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";

// Speech/action order and quoted speech survive the current complete-object parser.
const mixed = parseVenueReply(
  completeSceneObject(
    JSON.stringify({
      heardPlayerBy: ["reserved"],
      segments: [
        { kind: "narration", text: "She moves the chair.", heardBy: ["reserved"] },
        { kind: "dialogue", speakerId: "reserved", text: 'I called it "mine".', heardBy: ["reserved"] },
        { kind: "dialogue", speakerId: "reserved", text: "Want a seat?", heardBy: ["reserved"] },
      ],
    }),
    "stop",
  ),
  ["reserved"],
);
assert.deepEqual(
  mixed.lines.map((line) => line.kind),
  ["narration", "dialogue", "dialogue"],
);
assert.equal(mixed.lines[1]!.content, 'I called it "mine".');
// Malformed quotation boundaries remain rejected.
assert.equal(
  completeSceneObject(
    '{"heardPlayerBy":["reserved"],"segments":[{"kind":"dialogue","speakerId":"reserved","text":"Hello." She turns toward you. "Again.","heardBy":["reserved"]}]}',
    "stop",
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
assert.deepEqual(lineStagingCues(toPlayer.lines[1]!), [{ characterId: "reserved", look: { target: "player" } }]);
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
console.log("Scene text: speech/action order, quoted speech, private witnesses and unrepaired malformed JSON passed.");

assert.throws(
  () =>
    parseVenueReply({ heardPlayerBy: [], lines: [{ speakerId: "reserved", text: "Retired response" }] }, ["reserved"]),
  /segments must be an array/,
);
