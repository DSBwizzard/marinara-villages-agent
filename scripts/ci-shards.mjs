import assert from "node:assert/strict";
import { assembleChecks, checkKeys, fingerprint, assertProofOrigin } from "./ci-checks.mjs";

// Relative measured costs, not timeouts. Unknown suites have a conservative weight.
const weights = new Map([
  ["villages-founding-layout.e2e.mjs", 100],
  ["villages-sprite-manager.e2e.mjs", 82],
  ["villages-scene-staging.e2e.mjs", 65],
  ["villages-scene-controls.e2e.mjs", 51],
  ["villages-venue-layout.e2e.mjs", 49],
  ["villages-dossier.e2e.mjs", 40],
]);
export const workerName = (platform, index) =>
  index === 0 ? (platform === "linux" ? "validate" : "validate-windows") : `browser-${platform}-${index}`;
export const workerCount = (plan, platform) => plan.shards?.[platform] ?? 1;
export function shardAssignments(specs, count) {
  assert.ok(Number.isInteger(count) && count >= 1 && count <= 3, "Invalid CI shard count");
  const assignments = new Map(specs.map((spec) => [spec.id, 0]));
  const loads = Array(count).fill(0);
  const cost = (spec) => weights.get(spec.path?.split("/").pop()) ?? 20;
  for (const spec of specs
    .filter((spec) => spec.group === "browser")
    .sort((a, b) => cost(b) - cost(a) || a.id.localeCompare(b.id))) {
    const index = loads.indexOf(Math.min(...loads));
    assignments.set(spec.id, index);
    loads[index] += cost(spec);
  }
  return assignments;
}
export function shardSpecs(specs, count, index) {
  assert.ok(Number.isInteger(index) && index >= 0 && index < count, "Invalid CI shard index");
  const assignments = shardAssignments(specs, count);
  return specs.filter((spec) => assignments.get(spec.id) === index);
}
export function planShards(plan) {
  return Object.fromEntries(
    Object.entries(plan.platforms).map(([platform, value]) => [
      platform,
      value.pending.filter((spec) => spec.group === "browser").length >= 6 ? 3 : 1,
    ]),
  );
}
export function mergeShardReceipts(plan, platform, workers, { allowPartial = false } = {}) {
  const count = workerCount(plan, platform);
  if (!allowPartial) assert.equal(workers.length, count, "Missing CI shard receipt");
  assert.ok(workers.length > 0 && workers.length <= count, "No available CI shards");
  const first = workers.find((worker) => worker.shard?.index === 0) ?? (allowPartial ? workers[0] : null);
  assert.ok(first, "Missing primary CI worker");
  const specs = checkKeys(plan.blueprint, first.environment);
  const seen = new Set();
  for (const worker of workers) {
    const index = worker.shard?.index;
    assert.ok(!seen.has(index), "Duplicate CI shard");
    seen.add(index);
    assert.equal(worker.shard?.count, count);
    assert.equal(worker.producer.job, workerName(platform, index));
    assert.equal(worker.schemaVersion, 3);
    assert.equal(worker.sourceRevision, plan.sourceRevision);
    assert.equal(worker.inputDigest, plan.blueprint.inputDigest);
    assert.equal(worker.policyDigest, plan.blueprint.policyDigest);
    assert.equal(worker.validationProfile, plan.blueprint.validationProfile);
    assert.equal(worker.inputsUnchanged, true);
    assert.equal(fingerprint(worker.environment), fingerprint(first.environment), "CI shard environments differ");
    assert.equal(String(worker.producer.runId), String(first.producer.runId));
    assert.equal(worker.producer.attempt, first.producer.attempt);
    const assigned = shardSpecs(specs, count, index);
    for (const proof of worker.checks) {
      assertProofOrigin(proof, worker.environment);
      if (proof.executed) {
        assert.ok(
          assigned.some((spec) => spec.id === proof.id && spec.key === proof.key),
          "Check executed by wrong shard",
        );
        assert.deepEqual(proof.origin, worker.producer, "Check producer differs from shard producer");
      }
    }
    // Incomplete workers retain useful passing proof, but never make the candidate ready.
    assert.ok(index >= 0 && index < count);
  }
  const checks = specs
    .map((spec) =>
      workers.flatMap((worker) => worker.checks).find((proof) => proof.id === spec.id && proof.key === spec.key),
    )
    .filter(Boolean);
  const missing = assembleChecks(specs, checks).pending;
  return {
    ...first,
    checks,
    workers,
    shard: undefined,
    coverageComplete: workers.length === count && workers.every((worker) => worker.shardComplete) && !missing.length,
    executedAllTests: specs
      .filter((spec) => spec.kind === "test")
      .every((spec) => checks.some((proof) => proof.id === spec.id && proof.executed)),
    missing: missing.map((spec) => spec.id),
  };
}
