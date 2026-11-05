import assert from "node:assert/strict";
import { sceneErrorMessage } from "../packages/villages/src/client/features/scenes/scene-error-message.js";
import { sceneErrorReport } from "../packages/villages/src/client/features/scenes/scene-error-report.js";

const cases = [
  [
    "The reply used an invalid narrated sound. Your draft is preserved.",
    "The AI described a sound the game couldn’t place in the Scene.",
  ],
  ["Malformed memory proposal: memories[0].text must be a nonempty string", "The AI left a memory blank."],
  ["memories[0].text must be a nonempty string.", "The AI left a memory blank."],
  ["System update metadata is missing.", "The AI left out information the game needs to check the reply."],
  ["No language model connection selected", "The game has no usable AI connection."],
  ["System interpretation is not configured.", "The game has no usable AI connection."],
  [
    "The saved physical outcome could not commit. Recover the saved request.",
    "The game couldn’t finish saving an action.",
  ],
  ["The saved standing permission needs recovery.", "The game couldn’t finish saving an action."],
  ["The Villages package runtime is not configured.", "The server hasn’t started Villages correctly."],
  ["System verification failed during the model request.", "The AI service couldn’t complete the request."],
  ["Invalid or missing X-Admin-Secret header", "The server refused admin access."],
  [
    "System verification has insufficient output budget.",
    "The response length limit leaves too little room for this check.",
  ],
  ["System interpretation was truncated. Explicit retry required.", "The AI stopped before it finished the reply."],
  ["Saved evidence exceeds the System context budget.", "The conversation exceeds the AI’s reading limit."],
  ["The model request outcome is unknown.", "The game couldn’t confirm whether the reply finished."],
  ["The model returned no answer.", "The AI returned an empty reply."],
  ["The saved update could not be applied to storage.", "The game couldn’t save the update."],
  ["Insufficient credits", "The AI account has run out of credits or reached its usage limit."],
  ["Rate limit exceeded (429)", "The AI service received too many requests."],
  [
    "Saved Scene evidence fingerprint changed; recover saved data before replay.",
    "The conversation changed before the game could check it.",
  ],
  [
    "This saved request uses an unsupported writing contract. Its history is preserved.",
    "This version of the game can’t read the saved action’s format.",
  ],
  ["TypeError: Cannot read properties of undefined", "The game hit an internal error."],
  [
    "The proposed world change did not meet the requirements for saving. The conversation remains in the transcript; saved diagnostics contain the validation result.",
    "The game rejected the AI’s proposed update.",
  ],
  [
    "The proposed world change cited speech or actions that were not witnessed by everyone it would affect. It wasn’t saved; the conversation remains in the transcript.",
    "The AI based an update on something a resident didn’t see or hear.",
  ],
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
assert.equal(
  sceneErrorMessage("The proposed world change did not meet the requirements for saving.", "memories"),
  "The game rejected a memory update.",
);

const items = [
  {
    id: "operation",
    title: "Message failed",
    message: cases[0][0],
    diagnosticId: "operation:turn:attempt",
    fields: [
      { label: "Scene ID", value: "scene" },
      { label: "Attempt", value: "attempt" },
    ],
  },
  {
    id: "memory",
    title: "World change not saved",
    message: cases[2][0],
    diagnosticId: "turn:memories",
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
  { id: "turn:memories", details: '{"rejectedProposals":[{"index":0,"reason":"Exact validation failure"}]}' },
  { id: "unrelated", details: "UNRELATED ERROR AND PRIVATE EVIDENCE" },
]);
assert.ok(report.includes("Original error: " + cases[0][0]));
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
