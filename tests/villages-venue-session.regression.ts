import assert from "node:assert/strict";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
const reply = readNarrationReply(
  {
    segments: [
      { kind: "dialogue", speakerId: "bob", text: "Yes." },
      { kind: "narration", text: "Bob returns to the workbench." },
      { kind: "dialogue", speakerId: "bob", text: "I had more to say about that, once I found the right words." },
    ],
  },
  ["bob"],
);
assert.deepEqual(
  reply.segments.map((line) => line.kind),
  ["dialogue", "narration", "dialogue"],
  "short speech, longer speech and mixed prose remain valid without a style quota",
);
assert.equal(reply.segments[2].text, "I had more to say about that, once I found the right words.");
