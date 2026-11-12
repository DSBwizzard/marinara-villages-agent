// Test cases: scene-cost/ordinary, scene-cost/greeting, scene-cost/multi-resident, scene-cost/mixed-input, scene-cost/disclosure, scene-cost/relationship, scene-cost/wish-progress, scene-cost/wish-fulfilled, scene-cost/project-discussion, scene-cost/project-commitment, scene-cost/invitation, scene-cost/refusal, scene-cost/physical, scene-cost/movement-privacy, scene-cost/combined, scene-cost/long-history, scene-cost/rich-resident
import assert from "node:assert/strict";
import { wantsCase } from "../scripts/test-cases.mjs";
import { runSceneCostFixtures, sceneCostCases } from "./fixtures/scene-cost.fixture.js";
const report = await runSceneCostFixtures();
assert.deepEqual(
  report.results.map((row) => row.id),
  sceneCostCases.filter((id) => wantsCase("scene-cost/" + id)),
);
assert(
  report.results.every((row) => row.providerRequests === 0 && row.mockedCompletions === 1 && row.replayRequests === 0),
);
