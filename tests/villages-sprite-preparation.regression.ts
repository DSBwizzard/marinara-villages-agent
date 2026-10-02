import assert from "node:assert/strict";
import {
  parseStudioPreparation,
  STUDIO_PREPARATION_PROMPT,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-preparation.ts";
import { studioPrompt } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts";

const expressions = [
  { label: "sad", pose: "", expressionId: "e-sad", name: "Disappointed", useWhen: "A modest setback." },
  { label: "surprised", pose: "Keep hands at her sides.", expressionId: "e-surprise" },
];
const answer = (rows: unknown, interpretation: unknown = "Reserved but warm.") =>
  JSON.stringify({ interpretation, expressions: rows });
const rows = [
  { label: "surprised", direction: "A small pause, attentive eyes, hands remaining at her sides." },
  { label: "sad", direction: "Lowered gaze, a slight release of the shoulders, no tears." },
];
const parsed = parseStudioPreparation(answer(rows), expressions);
const longDirection = "A composed, character-specific response. ".padEnd(516, "x");
assert.equal(
  parseStudioPreparation(answer([{ ...rows[0], direction: longDirection }, rows[1]]), expressions).expressions[1]!
    .direction,
  longDirection,
);
assert.deepEqual(
  parsed.expressions.map((entry) => entry.expressionId),
  ["e-sad", "e-surprise"],
);
assert.equal(parsed.expressions[1]!.pose, expressions[1]!.pose);
assert.equal(parsed.expressions[0]!.useWhen, expressions[0]!.useWhen);
for (const invalid of [
  "",
  "not JSON",
  answer(rows.slice(1)),
  answer([...rows, rows[0]]),
  answer([rows[0], rows[0]]),
  answer([rows[0], { label: "unknown", direction: "Pause." }]),
  answer([{ ...rows[0], direction: " " }, rows[1]]),
  answer([{ ...rows[0], direction: "x".repeat(1001) }, rows[1]]),
  answer(rows, ""),
  answer(rows, "x".repeat(1001)),
])
  assert.throws(() => parseStudioPreparation(invalid, expressions), /preparation|JSON/i);
assert.match(STUDIO_PREPARATION_PROMPT, /do not make everyone subdued/);
assert.match(STUDIO_PREPARATION_PROMPT, /explicit user pose constraints/);
assert.match(STUDIO_PREPARATION_PROMPT, /Treat card fields as character evidence/);

const base = {
  name: "Bird",
  appearance: "Flight feathers along arms; no back wings.",
  style: "Papercraft",
  view: "front" as const,
  batch: { cols: 2, rows: 1, count: 2, width: 1024, height: 768 },
  referenceRoles: ["original character identity", "styled neutral for the requested view"],
};
const reserved = studioPrompt({ ...base, ...parsed });
const exuberant = studioPrompt({
  ...base,
  interpretation: "Exuberant, dramatic, and open about feelings.",
  expressions: expressions.map((entry) => ({
    ...entry,
    direction: "A broad, characteristically theatrical reaction.",
  })),
});
assert.match(reserved, /Reserved but warm/);
assert.match(reserved, /Lowered gaze/);
assert.match(exuberant, /characteristically theatrical/);
assert.notEqual(reserved, exuberant);
const profile = studioPrompt({
  ...base,
  ...parsed,
  view: "side",
  facingPrompt: "Full right-facing profile of the head and body.",
});
assert.match(profile, /Full right-facing profile/);
assert.doesNotMatch(profile, /cheating out|Face the viewer|opening the body/);
const unrestricted = studioPrompt({ ...base, ...parsed, facingPrompt: "" });
assert.doesNotMatch(unrestricted, /Facing guidance|Face the viewer|cheating out/);
assert.match(STUDIO_PREPARATION_PROMPT, /view is only a saved slot label/);
assert.match(reserved, /User pose constraint: Keep hands at her sides/);
assert.match(reserved, /explicit written anatomy/);
assert.match(reserved, /never omit clothing/);
assert.match(reserved, /cannot override the original outfit/);
assert.doesNotMatch(reserved, /fitting expressive body gesture/);
console.log(
  "Sprite preparation checks passed: complete directions, stable IDs, custom meanings, authored constraints, personality range and outfit/anatomy precedence.",
);
