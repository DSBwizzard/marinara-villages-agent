import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createVillagesClientId,
  shouldSubmitVenueKey,
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
assert.equal(shouldSubmitVenueKey("Enter", false, false), true, "Enter submits");
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
