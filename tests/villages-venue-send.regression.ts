import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createVillagesClientId,
  shouldSubmitVenueKey,
  sceneResend,
} from "../packages/villages/src/engine/packages/client/src/villages-venue-send.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ui = readFileSync(
  resolve(root, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
  "utf8",
);
const sendButton = ui.match(
  /className=\{`\$\{ELEMENT_TAG\}-chat-send`\}[\s\S]*?aria-label=\{busy \? "Sending" : "Send"\}/u,
)?.[0];
assert.ok(sendButton, "the room has a native Send button");
assert.match(sendButton, /onClick=\{submitComposer\}/u, "one click handler sends the room line");
assert.doesNotMatch(sendButton, /onPointerDown|onTouchStart|onTouchEnd/u, "Send has no competing touch handlers");
assert.match(
  ui,
  /roomSubmissionIdRef\.current \?\? createVillagesClientId\(\)/u,
  "room sends use the LAN-safe ID helper",
);
assert.doesNotMatch(ui, /crypto\.randomUUID\(\)/u, "other Villages controls also work over an HTTP LAN address");
assert.equal(shouldSubmitVenueKey("Enter", false, false), false, "Enter does not submit by default");
assert.equal(shouldSubmitVenueKey("Enter", false, false, true), true, "Enter submits when enabled");
assert.equal(shouldSubmitVenueKey("Enter", true, false, true), false, "Shift+Enter remains a newline when enabled");
assert.equal(shouldSubmitVenueKey("Enter", false, true, true), false, "IME composition remains safe when enabled");
const saved = {
  id: "original",
  kind: "turn",
  status: "interrupted",
  attemptId: "attempt",
  input: { message: "Hello", mode: "chat", targetId: "" },
};
assert.deepEqual(sceneResend(saved, saved.input, "new"), { submissionId: "original", retryOfAttemptId: "attempt" });
assert.deepEqual(sceneResend(saved, { ...saved.input, message: "Hello again" }, "new"), {
  submissionId: "new",
  retryOfAttemptId: "attempt",
  replaceOfOperationId: "original",
});
assert.deepEqual(sceneResend({ ...saved, status: "complete" }, saved.input, "new"), { submissionId: "new" });
assert.deepEqual(sceneResend({ ...saved, status: "complete", error: "invalid-json" }, saved.input, "new"), {
  submissionId: "original",
  retryOfAttemptId: "attempt",
});
for (const mode of ["chat", "leave", "contact"])
  assert.deepEqual(
    sceneResend(
      { ...saved, kind: "change-interpretation", status: "complete", error: "Invalid background retry.", input: {} },
      { message: "My next reply", mode },
      "next",
    ),
    { submissionId: "next" },
    "A failed completed interpretation cannot block a new Scene operation",
  );
assert.throws(() => sceneResend({ ...saved, status: "running" }, saved.input, "new"), /still responding/);
assert.throws(() => sceneResend(saved, { ...saved.input, mode: "contact" }, "new"), /edits are preserved/);
const interruptedMove = { ...saved, kind: "move", input: { zoneId: "common" } };
assert.deepEqual(sceneResend(interruptedMove, { zoneId: "common" }, "new"), {
  submissionId: "original",
  retryOfAttemptId: "attempt",
});
assert.throws(() => sceneResend(interruptedMove, { zoneId: "exterior" }, "new"), /Recover the saved request/);
assert.throws(
  () => sceneResend(interruptedMove, { mode: "chat", message: "Hello" }, "new"),
  /Recover the saved request/,
);
assert.equal(shouldSubmitVenueKey("Enter", true, false), false, "Shift Enter inserts a line break");
assert.equal(shouldSubmitVenueKey("Enter", false, true), false, "IME composition does not submit");

const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
try {
  let counter = 0;
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: {
      getRandomValues(bytes: Uint8Array) {
        for (let index = 0; index < bytes.length; index += 1) bytes[index] = (counter++ + index) & 255;
        return bytes;
      },
    },
  });
  const first = createVillagesClientId();
  const second = createVillagesClientId();
  assert.match(first, /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/u);
  assert.notEqual(first, second, "successive HTTP LAN sends get different submission IDs");
} finally {
  if (originalCrypto) Object.defineProperty(globalThis, "crypto", originalCrypto);
  else Reflect.deleteProperty(globalThis, "crypto");
}

console.log("villages-venue-send: ok");
