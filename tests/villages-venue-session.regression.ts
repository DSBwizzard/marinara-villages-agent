import assert from "node:assert/strict";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
assert.deepEqual(
  parseVenueReply(
    {
      heardPlayerBy: ["bob"],
      segments: [
        { kind: "dialogue", speakerId: "bob", text: "Yes.", heardBy: ["bob"] },
        { kind: "narration", text: "Bob returns to the workbench.", heardBy: ["bob"] },
        {
          kind: "dialogue",
          speakerId: "bob",
          text: "I had more to say about that, once I found the right words.",
          heardBy: ["bob"],
        },
      ],
    },
    ["bob"],
  ).lines.map((line) => line.kind),
  ["dialogue", "narration", "dialogue"],
  "short speech, longer speech, and mixed scene prose remain valid without a style quota",
);
console.log("Current Scene reply parsing accepts mixed narration and dialogue without a style quota.");
