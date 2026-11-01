import assert from "node:assert/strict";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import {
  venueReplyIntegrity,
  venueSceneHistory,
} from "../packages/villages/src/server/domain/rules/venue-turn-integrity.js";
const sampleHistory = [
  { role: "user" as const, name: "", speakerId: "", content: "Discarded prior player turn", heardBy: ["bob"] },
  {
    role: "assistant" as const,
    name: "Bob",
    speakerId: "bob",
    kind: "dialogue" as const,
    content: "Discarded reply.",
    heardBy: ["bob"],
  },
  { role: "user" as const, name: "", speakerId: "", content: "Older player turn", heardBy: ["bob"] },
  {
    role: "assistant" as const,
    name: "Narration",
    speakerId: "__venue_scene__",
    kind: "narration" as const,
    content: "Old scene.",
    heardBy: ["bob"],
  },
  { role: "user" as const, name: "", speakerId: "", content: "Where are you from?", heardBy: ["bob"] },
  {
    role: "assistant" as const,
    name: "Bob",
    speakerId: "bob",
    kind: "dialogue" as const,
    content: "Mecca. What about you?",
    heardBy: ["bob"],
  },
  {
    role: "assistant" as const,
    name: "Narration",
    speakerId: "__venue_scene__",
    kind: "narration" as const,
    content: "Bob looks at the fire.",
    heardBy: ["bob"],
  },
  {
    role: "user" as const,
    name: "",
    speakerId: "",
    content: "I actually don't remember anything. Funny, huh?",
    heardBy: ["bob"],
  },
];
const history = venueSceneHistory(sampleHistory, "Legitimate Businessperson");
assert.match(history, /PLAYER Legitimate Businessperson: I actually don't remember anything/u);
assert.match(history, /RESIDENT Bob \(bob\): Mecca\. What about you\?/u);
assert.match(history, /SCENE: Bob looks at the fire\./u);
assert.match(history, /SCENE: Old scene\./u);
assert.ok(
  history.indexOf("SCENE: Old scene.") < history.indexOf("PLAYER Legitimate Businessperson: Where are you from?") &&
    history.indexOf("Mecca. What about you?") < history.indexOf("SCENE: Bob looks at the fire."),
  "narration and dialogue keep their chronological positions",
);
assert.doesNotMatch(history, /Discarded prior player turn|Discarded reply/u);
const longHistory = Array.from({ length: 30 }, (_, index) => ({
  ...sampleHistory[5]!,
  content: `Reply ${index}: ${"x".repeat(500)}`,
}));
assert.ok(venueSceneHistory(longHistory, "Visitor").length <= 3_500);
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
assert.equal(
  venueReplyIntegrity(sampleHistory.at(-1)!.content, sampleHistory.slice(0, -1), [
    { kind: "dialogue", content: "I actually don't remember anything. Funny, huh?" },
  ]),
  "player-echo",
);
assert.equal(
  venueReplyIntegrity(sampleHistory.at(-1)!.content, sampleHistory.slice(0, -1), [
    { kind: "dialogue", content: "Yeah — what about you? We've both done our bit." },
  ]),
  "repeated-question",
);
assert.equal(
  venueReplyIntegrity(sampleHistory.at(-1)!.content, sampleHistory.slice(0, -1), [
    { kind: "dialogue", content: "That sounds disorienting. I can listen." },
  ]),
  null,
);
assert.equal(venueReplyIntegrity("Are you all right?", [], [{ kind: "dialogue", content: "Yes, I'm here." }]), null);
assert.equal(venueReplyIntegrity("I wait.", [], [{ kind: "narration", content: "Bob closes the door." }]), null);
assert.equal(
  venueReplyIntegrity(
    "I wait.",
    [],
    [
      { kind: "dialogue", content: "Give me a moment." },
      { kind: "dialogue", content: "I'll be here too." },
    ],
  ),
  null,
);

console.log("Scene history, reply parsing and retained legacy integrity rules passed without generation.");
