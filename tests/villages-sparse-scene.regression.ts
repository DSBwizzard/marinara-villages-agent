import assert from "node:assert/strict";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { completeSceneObject } from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import {
  fitVenueWritingMessages,
  type VenueWritingBlock,
} from "../packages/villages/src/server/domain/rules/venue-writing.js";

const words = "If Mara approves tomorrow, I might help. I am not committing today.";
const raw = { segments: [{ kind: "dialogue", speakerId: "rosa", text: words }] };
const complete = JSON.stringify(raw);
for (const text of [complete, "```json\n" + complete + "\n```"]) {
  const parsed = readNarrationReply(completeSceneObject(text, "stop"), ["rosa"]);
  assert.equal(parsed.segments[0].text, words);
  assert.deepEqual(parsed.keep, []);
  assert.deepEqual(parsed.commands, []);
}
for (const [text, finish] of [
  [complete, "length"],
  [complete, "unknown"],
  [complete.slice(0, -2), "stop"],
  [complete + complete, "stop"],
  ["Prefix " + complete, "stop"],
  ['{"segments":[],"segments":[]}', "stop"],
])
  assert.equal(completeSceneObject(text, finish), null);

const input = "  I wonder about the tea. “Why?”\n";
const required: VenueWritingBlock = { text: "Complete character identity.", evidenceId: "required" };
const shared: VenueWritingBlock = {
  text: "I dislike cinnamon in tea. Mint is my favourite, unless it is cold.",
  evidenceId: "shared",
  optional: "history",
  pruningPriority: 1,
};
const history: VenueWritingBlock[] = Array.from({ length: 72 }, (_, index) => ({
  text: "An unrelated exchange about a wooden bench. " + "timber ".repeat(32),
  evidenceId: "episode-" + index,
  optional: "history",
}));
const memory: VenueWritingBlock = {
  text: "Rosa is considering a new recipe.",
  evidenceId: "memory",
  optional: "memory",
};
const blocks = [required, shared, ...history, memory];
const frozen = structuredClone(blocks);
let fitCalls = 0;
const fitted = fitVenueWritingMessages(
  {
    fitContext(messages, options) {
      fitCalls++;
      const size = messages.reduce((sum, row) => sum + row.content.length, 0);
      return {
        ...options,
        messages: size <= 3400 ? messages : [],
        trimmed: size > 3400,
        estimatedTokensBefore: Math.ceil(size / 4),
        estimatedTokensAfter: Math.min(850, Math.ceil(size / 4)),
      };
    },
  },
  blocks,
  input,
  4096,
);
assert(fitted.trimmed);
assert(fitCalls < 20, "Long histories fit in batches");
assert(fitted.evidenceIds.length < blocks.length);
assert(fitted.evidenceIds.includes("required"));
assert(fitted.evidenceIds.includes("shared"));
assert(fitted.evidenceIds.includes("memory"));
assert(
  fitted.messages.some((message) => message.content.includes(shared.text)),
  "Conditional meaning survives intact",
);
assert.equal(fitted.messages.at(-1)?.content, input);
assert.deepEqual(blocks, frozen, "Fitting leaves saved source blocks intact");
console.log("Sparse narration parsing and bounded exact prompt fitting passed.");
