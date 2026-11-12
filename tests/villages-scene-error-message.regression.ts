import assert from "node:assert/strict";
import { sceneErrorMessage } from "../packages/villages/src/client/features/scenes/scene-error-message.js";
import { sceneErrorReport } from "../packages/villages/src/client/features/scenes/scene-error-report.js";

const cases = [
  ["Invalid request details", "The request contains invalid details."],
  ["History temporarily unavailable", "The game couldn’t load the Scene history."],
  [
    "The reply used an invalid narrated sound. Your draft is preserved.",
    "The AI described a sound the game couldn’t place in the Scene.",
  ],
  [
    "The Scene response was not complete JSON. Your input and purchased response are retained.",
    "The AI returned a reply the game couldn’t read.",
  ],
  ["No language model connection selected", "The game has no usable AI connection."],
  ["The saved narration needs recovery.", "The game couldn’t finish saving an action."],
  ["The Villages package runtime is not configured.", "The server hasn’t started Villages correctly."],
  ["The model request failed.", "The AI service couldn’t complete the request."],
  ["Invalid or missing X-Admin-Secret header", "The server refused admin access."],
  ["The response has insufficient output budget.", "The response length limit leaves too little room for this check."],
  ["The response was truncated.", "The AI stopped before it finished the reply."],
  [
    "The complete character cards and required context do not fit the Narration connection. Increase its context limit or choose a connection with a larger context window. No reply was requested.",
    "The conversation exceeds the AI’s reading limit.",
  ],
  ["The model request outcome is unknown.", "The game couldn’t confirm whether the reply finished."],
  ["The model returned no answer.", "The AI returned an empty reply."],
  ["The saved update could not be applied to storage.", "The game couldn’t save the update."],
  ["Insufficient credits", "The AI account has run out of credits or reached its usage limit."],
  ["Rate limit exceeded (429)", "The AI service received too many requests."],
  [
    "Saved Scene evidence fingerprint changed; recover saved data before replay.",
    "The conversation changed before the game could check it.",
  ],
  ["Unsupported Scene format. Start a fresh Village.", "This version of the game requires a fresh Village."],
  ["TypeError: Cannot read properties of undefined", "The game hit an internal error."],
  ["This evidence was not witnessed.", "The AI based an update on something a resident didn’t see or hear."],
  [
    "Could not reach the server (POST /api/villages/rooms/greet). Check your connection and reload to see whether the action completed before trying again.",
    "The game couldn’t reach the server.",
  ],
  [
    "The server returned an invalid or empty JSON response (HTTP 200; POST /api/villages/rooms/turn). Reload to check the current state before trying again.",
    "The game couldn’t read the server’s reply.",
  ],
  [
    "The selected connection rejected JSON mode. Choose a connection supporting JSON responses, then explicitly retry. No fallback request was made.",
    "The AI service doesn’t support the reply format the game needs.",
  ],
  ["The Scene changed. Reopen it before continuing.", "The Scene changed during the request."],
  ["This zone needs its controller's invitation.", "This zone needs its controller's invitation."],
] as const;
for (const [original, expected] of cases) {
  const message = sceneErrorMessage(original);
  assert.equal(message, expected, original);
  assert.doesNotMatch(
    message,
    /retry|reload|refresh|recover|transcript|diagnostic|draft|preserved|metadata|JSON|fingerprint|Scene ID|\/api\//iu,
  );
  assert.ok(message.length < 110, original);
}
assert.equal(
  sceneErrorMessage("Reconnecting to check your saved reply…\n\nFailed to fetch\n\nRequest: turn-123"),
  "The game couldn’t confirm whether the reply finished.",
);

const items = [
  {
    id: "operation",
    title: "Message failed",
    message: "The reply used an invalid narrated sound. Your draft is preserved.",
    diagnosticId: "operation:turn:attempt",
    fields: [
      { label: "Scene ID", value: "scene" },
      { label: "Attempt", value: "attempt" },
    ],
  },
  {
    id: "keep",
    title: "Continuity update held",
    message: "The saved narration needs recovery.",
    diagnosticId: "turn:continuity",
    fields: [
      { label: "Scene ID", value: "scene" },
      { label: "Message ID", value: "turn" },
    ],
  },
];
const report = sceneErrorReport(items, [
  {
    id: "operation:turn:attempt",
    details: '{"cause":"missing_result","stage":"sound-witnesses","field":"attentionWitnesses.segment"}',
  },
  { id: "turn:continuity", details: '{"rejected":[{"id":"note","reason":"Exact validation failure"}]}' },
  { id: "unrelated", details: "UNRELATED ERROR AND PRIVATE EVIDENCE" },
]);
assert.ok(report.includes("Original error: " + items[0]!.message));
assert.match(report, /attentionWitnesses.segment/);
assert.match(report, /Exact validation failure/);
assert.equal(report.match(/Scene ID: scene/gu)?.length, 1, "share repeated Scene context");
assert.doesNotMatch(report, /UNRELATED ERROR/);
assert.match(sceneErrorReport(items, [], "Exact network failure"), /Saved details unavailable: Exact network failure/);
assert.doesNotMatch(
  sceneErrorReport(items, [{ id: "operation:turn:new-attempt", details: "NEW ATTEMPT FAILURE" }]),
  /NEW ATTEMPT FAILURE/,
);
console.log("Scene errors: short specific messages, exact scoped diagnostics, and attempt identity passed.");
