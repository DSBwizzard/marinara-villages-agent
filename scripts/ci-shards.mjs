import assert from "node:assert/strict";
import { assembleChecks, checkKeys, fingerprint, assertProofOrigin } from "./ci-checks.mjs";
import { testCost } from "./test-costs.mjs";

// Relative measured costs, not timeouts. Unknown suites have a conservative weight.
export const workerName = (platform, index) =>
  index === 0 ? (platform === "linux" ? "validate" : "validate-windows") : `browser-${platform}-${index}`;
export const workerCount = (plan, platform) => plan.shards?.[platform] ?? 1;
function primaryCost(pending) {
  return (
    (pending.some((spec) => spec.kind === "static") ? 25 : 0) +
    (pending.some((spec) => ["build", "package", "reproducibility"].includes(spec.kind)) ? 15 : 0) +
    pending
      .filter((spec) => spec.kind === "test" && spec.group !== "browser")
      .reduce((sum, spec) => sum + testCost(spec), 0) /
      4
  );
}
export function shardAssignments(specs, count, pending = specs) {
  assert.ok(Number.isInteger(count) && count >= 1 && count <= 3, "Invalid CI shard count");
  const assignments = new Map(specs.map((spec) => [spec.id, 0]));
  const loads = Array(count).fill(0);
  // Browser cost is distributed across three slots; primary-only work already
  // occupies that runner before tests start. Reused checks consume no slots.
  loads[0] = primaryCost(pending) * 3;
  for (const spec of pending
    .filter((spec) => spec.group === "browser")
    .sort((a, b) => testCost(b) - testCost(a) || a.id.localeCompare(b.id))) {
    const index = loads.indexOf(Math.min(...loads));
    assignments.set(spec.id, index);
    loads[index] += testCost(spec);
  }
  return assignments;
}
export function shardSpecs(specs, count, index, pending = specs) {
  assert.ok(Number.isInteger(index) && index >= 0 && index < count, "Invalid CI shard index");
  const assignments = shardAssignments(specs, count, pending);
  return specs.filter((spec) => assignments.get(spec.id) === index);
}
export function planShards(plan) {
  return Object.fromEntries(
    Object.entries(plan.platforms).map(([platform, { pending }]) => {
      const estimate = (count) => {
        const assignments = shardAssignments(pending, count);
        const loads = Array.from({ length: count }, (_, index) => ({
          slots: [0, 0, 0],
          overhead: index ? 8 : primaryCost(pending),
        }));
        for (const spec of pending
          .filter((spec) => spec.group === "browser")
          .sort((a, b) => testCost(b) - testCost(a))) {
          const worker = loads[assignments.get(spec.id)];
          const index = worker.slots.indexOf(Math.min(...worker.slots));
          worker.slots[index] += testCost(spec);
        }
        return Math.max(...loads.map((worker) => worker.overhead + Math.max(...worker.slots)));
      };
      let count = 1,
        best = estimate(1);
      for (const candidate of [2, 3]) {
        if (pending.filter((spec) => spec.group === "browser").length < candidate) continue;
        const duration = estimate(candidate);
        if (best - duration >= 15) {
          count = candidate;
          best = duration;
        }
      }
      return [platform, count];
    }),
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
    const assigned = shardSpecs(specs, count, index, plan.platforms[platform].pending);
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
