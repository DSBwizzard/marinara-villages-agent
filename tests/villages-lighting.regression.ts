import assert from "node:assert/strict";
import { villageLighting } from "../packages/villages/src/shared/helpers/village-lighting.js";

const zone = "America/Los_Angeles";
for (const [instant, expected] of [
  ["2026-11-05T12:59:00Z", "night"],
  ["2026-11-05T13:00:00Z", "morning"],
  ["2026-11-05T16:00:00Z", "day"],
  ["2026-11-06T01:00:00Z", "evening"],
  ["2026-11-06T04:00:00Z", "night"],
  ["2026-07-05T12:00:00Z", "morning"],
  ["2026-11-01T08:30:00Z", "night"],
  ["2026-11-01T09:30:00Z", "night"],
] as const)
  assert.equal(villageLighting(instant, zone), expected);
assert.equal(villageLighting("2026-11-05T04:00:00Z", "UTC"), "night");
assert.equal(villageLighting("2026-11-05T04:00:00Z", "Asia/Tokyo"), "day");
assert.equal(villageLighting("2026-11-05T23:15:00Z", "Asia/Kathmandu"), "morning");
assert.equal(villageLighting("invalid", zone), "day");
console.log("Village lighting: boundaries, timezone differences, fractional offsets and DST passed.");
