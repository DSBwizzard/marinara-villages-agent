import assert from "node:assert/strict";
import { sceneErrorMessage } from "../packages/villages/src/client/features/scenes/scene-error-message.js";

// Display translations must retain the useful distinction between failure causes.
for (const [technical, meaning] of [
  ["The reply used an invalid narrated sound. Your draft is preserved.", /sound.*Scene/u],
  ["The generated opening idea is missing its provenance. Retry failed preparation.", /supporting setting facts/u],
  ["System update metadata is missing.", /missing information/u],
  [
    "Could not reach the server (POST /api/villages/rooms/greet). Check your connection and reload to see whether the action completed before trying again.",
    /connection was interrupted.*saved reply/u,
  ],
  ["No language model connection selected", /AI connection is not ready/u],
  ["System interpretation is not configured.", /AI connection is not ready/u],
  [
    "The saved physical outcome could not commit. Recover the saved request.",
    /unfinished saved action.*Recover the saved request/u,
  ],
  ["The saved standing permission needs recovery.", /unfinished saved action.*Recover the saved request/u],
  ["The Villages package runtime is not configured.", /game's server is not ready/u],
  [
    "The reply did not establish which attention fragments were heard. Your draft is preserved; retry.",
    /who could hear/u,
  ],
  ["System verification failed during the model request.", /AI service did not return/u],
  ["Invalid or missing X-Admin-Secret header", /Settings → Advanced → Admin Access/u],
  ["System verification has insufficient output budget.", /response length limit.*too small/u],
  [
    "The server returned an invalid or empty JSON response (HTTP 200; POST /api/villages/rooms/turn). Reload to check the current state before trying again.",
    /server.*Reload to check whether the action completed/u,
  ],
  ["System interpretation was truncated. Explicit retry required.", /stopped before finishing/u],
  ["System output allowance is insufficient; no request was made.", /No AI request was sent/u],
  ["Saved evidence exceeds the System context budget.", /room to read.*information/u],
  ["System context remains insufficient. No outcome was applied.", /No changes from this step were applied/u],
  ["System access issuer or scope lacks current authority. The draft is preserved.", /who gave permission/u],
  ["A citation is unavailable or was not witnessed by every affected resident.", /residents saw or heard/u],
  ["Malformed memory proposal: memories[0].text must be a nonempty string", /reply.*could not be read/u],
  ["The model request outcome is unknown.", /whether.*finished.*saved reply/u],
  ["The model request failed.", /did not return a usable answer/u],
  ["The saved update could not be applied to storage.", /could not save/u],
  ["Insufficient credits", /account or usage limit/u],
  ["Rate limit exceeded (429)", /too many requests/u],
  ["Connection rejected JSON mode", /connection does not support.*format/u],
  ["Saved Scene evidence fingerprint changed; recover saved data before replay.", /investigated before retrying/u],
  ["This saved request uses an unsupported writing contract. Its history is preserved.", /format.*cannot resume/u],
  ["TypeError: Cannot read properties of undefined", /Copy the details/u],
] as const) {
  const friendly = sceneErrorMessage(technical);
  assert.match(friendly, meaning, technical);
  assert.doesNotMatch(friendly, /provenance|metadata|JSON|semantic|issuer|fingerprint|memories\[0\]/iu);
}
assert.match(
  sceneErrorMessage("The reply used an invalid narrated sound. Your draft is preserved."),
  /draft is still here/u,
);
assert.doesNotMatch(
  sceneErrorMessage("System update metadata is missing."),
  /draft|retry/iu,
  "do not promise an unsaved draft or suggest an unsafe retry",
);
assert.match(
  sceneErrorMessage(
    "The proposed update cited words or events that were not witnessed by everyone it would affect. It wasn’t saved; the conversation remains in the transcript.",
  ),
  /update wasn’t saved; the conversation is still in the transcript/u,
);
const http = "Request failed. The request conflicts with the current saved state. Reload before trying again.";
assert.equal(sceneErrorMessage(http + " (HTTP 409; POST /api/villages/rooms/turn)"), http);
assert.doesNotMatch(sceneErrorMessage("System verification has insufficient output budget."), /stopped|answer|retry/iu);
const readable = "This zone needs its controller's invitation.";
assert.equal(sceneErrorMessage(readable), readable, "keep specific readable access explanations");
const reconnect = "Reconnecting to check your saved reply…";
assert.equal(sceneErrorMessage(reconnect + "\n\nFailed to fetch\n\nRequest: turn-123"), reconnect);
assert.match(sceneErrorMessage(""), /could not complete/u);
console.log(
  "Scene error messages: distinct causes, readable explanations, honest recovery advice and legacy errors passed.",
);
