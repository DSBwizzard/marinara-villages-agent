import assert from "node:assert/strict";
import { runSceneCostFixtures, sceneCostCases } from "./fixtures/scene-cost.fixture.js";
const report = await runSceneCostFixtures();
assert.deepEqual(
  report.results.map((row) => row.id),
  sceneCostCases,
);
assert(
  report.results.every((row) => row.providerRequests === 0 && row.mockedCompletions === 1 && row.replayRequests === 0),
);
console.log(JSON.stringify(report));
