import assert from "node:assert/strict";
import { selectSceneEffects } from "../packages/villages/src/server/domain/rules/scene-acceptance.js";

const promised = selectSceneEffects(
  [{ id: "remember-tawny", independent: true, requires: [], failure: "Memory storage failed." }],
  ["remember-tawny"],
);
assert.equal(
  promised.held,
  true,
  "an explicit important retention promise is a critical dependency even when mislabeled independent",
);
assert.deepEqual(promised.acceptedIds, []);
assert.equal(promised.rejected[0].reason, "Memory storage failed.");

const independent = selectSceneEffects(
  [
    { id: "appearance-cue", independent: true, requires: [], failure: "Unknown expression." },
    { id: "rowan", requires: [] },
    { id: "unrelated-note", independent: true, requires: [], failure: "Invalid optional text." },
    { id: "permission", requires: [] },
  ],
  ["rowan", "permission"],
);
assert.equal(independent.held, false);
assert.deepEqual(independent.acceptedIds, ["rowan", "permission"]);
assert.deepEqual(
  independent.rejected.map((row) => row.id),
  ["appearance-cue", "unrelated-note"],
);

const dependent = selectSceneEffects(
  [
    { id: "grant", independent: true, requires: [], failure: "Controller revision changed." },
    { id: "entered", requires: ["grant"] },
  ],
  ["entered"],
);
assert.equal(dependent.held, true, "a valid proposal cannot survive its failed native dependency");
assert.ok(dependent.rejected.some((row) => row.id === "entered" && row.reason.includes("grant")));

assert.equal(selectSceneEffects([], ["missing-retention"]).held, true);
assert.equal(
  selectSceneEffects([{ id: "note", requires: [], failure: "Unknown dependency significance." }], []).held,
  true,
  "unspecified criticality is conservative",
);
assert.equal(
  selectSceneEffects(
    [
      { id: "a", independent: true, requires: ["b"] },
      { id: "b", independent: true, requires: ["a"] },
      { id: "valid", requires: [] },
    ],
    [],
  ).held,
  false,
  "an independently invalid optional cycle does not erase valid fiction",
);
assert.throws(
  () =>
    selectSceneEffects(
      [
        { id: "same", requires: [] },
        { id: "same", requires: [] },
      ],
      [],
    ),
  /duplicate/,
);

console.log(
  "Scene acceptance: asserted and transitive dependencies hold false fiction; independent failures preserve valid effects without model work.",
);
