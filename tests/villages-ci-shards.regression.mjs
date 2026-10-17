import assert from "node:assert/strict";
import { shardSpecs, shardAssignments, planShards, mergeShardReceipts, workerName } from "../scripts/ci-shards.mjs";
import { checkKeys, fingerprint, assertCoverage } from "../scripts/ci-checks.mjs";
import { assertWorkerOrigin } from "../scripts/ci-manifests.mjs";
const environment = {
  platform: "linux",
  node: process.version,
  arch: process.arch,
  runner: "ubuntu-24.04",
  image: "fixture",
};
const blueprint = {
  validationProfile: "qualification",
  inputDigest: "a".repeat(64),
  policyDigest: "b".repeat(64),
  catalog: [],
  toolchain: { node: process.version.slice(1), arch: process.arch, runners: { linux: environment.runner } },
  specs: [
    { id: "build", kind: "build", inputs: [] },
    ...Array.from({ length: 12 }, (_, index) => ({
      id: `test:${index}`,
      kind: "test",
      path: `tests/browser-${index}.e2e.mjs`,
      group: "browser",
      inputs: [],
    })),
  ],
};
const specs = checkKeys(blueprint, environment);
const plan = {
  sourceRevision: "c".repeat(40),
  blueprint,
  shards: { linux: 3 },
  platforms: { linux: { pending: specs, reused: [] } },
};
assert.deepEqual(planShards(plan), { linux: 3 });
assert.deepEqual(planShards({ ...plan, platforms: { linux: { pending: specs.slice(0, 3) } } }), { linux: 1 });
assert.deepEqual(shardAssignments([...specs].reverse(), 3), shardAssignments(specs, 3));
assert.equal(
  new Set([0, 1, 2].flatMap((index) => shardSpecs(specs, 3, index).map((spec) => spec.id))).size,
  specs.length,
);
assert.throws(() => shardSpecs(specs, 3, 3));
const workers = [0, 1, 2].map((index) => {
  const producer = {
    runId: "123",
    attempt: 1,
    job: workerName("linux", index),
    sourceRevision: plan.sourceRevision,
    platform: "linux",
    node: environment.node,
    environmentDigest: fingerprint(environment),
  };
  return {
    schemaVersion: 3,
    validationProfile: blueprint.validationProfile,
    sourceRevision: plan.sourceRevision,
    inputDigest: blueprint.inputDigest,
    policyDigest: blueprint.policyDigest,
    inputsUnchanged: true,
    environment,
    executor: { platform: "linux", node: environment.node },
    producer,
    shard: { index, count: 3 },
    shardComplete: true,
    checks: shardSpecs(specs, 3, index).map((spec) => ({
      id: spec.id,
      key: spec.key,
      code: 0,
      passed: true,
      executed: true,
      origin: producer,
    })),
  };
});
const receipt = mergeShardReceipts(plan, "linux", workers);
assert.equal(receipt.coverageComplete, true);
assertCoverage(receipt, blueprint);
assert.throws(() => mergeShardReceipts(plan, "linux", workers.slice(1)), /Missing/);
assert.throws(() => mergeShardReceipts(plan, "linux", [workers[0], workers[1], workers[1]]), /Duplicate/);
for (const delta of [
  { inputDigest: "foreign" },
  { sourceRevision: "d".repeat(40) },
  { policyDigest: "foreign" },
  { inputsUnchanged: false },
  { environment: { ...environment, image: "other" } },
  { producer: { ...workers[1].producer, attempt: 2 } },
])
  assert.throws(() => mergeShardReceipts(plan, "linux", [workers[0], { ...workers[1], ...delta }, workers[2]]));
assert.throws(
  () => mergeShardReceipts(plan, "linux", [workers[0], { ...workers[1], checks: workers[0].checks }, workers[2]]),
  /wrong shard/,
);
assert.equal(
  mergeShardReceipts(plan, "linux", [workers[0], { ...workers[1], shardComplete: false }, workers[2]]).coverageComplete,
  false,
);
assert.equal(
  mergeShardReceipts(plan, "linux", [workers[0], { ...workers[1], checks: workers[1].checks.slice(1) }, workers[2]])
    .coverageComplete,
  false,
);
const jobs = workers.map((worker) => ({
  name: worker.producer.job,
  status: "completed",
  labels: [environment.runner],
  steps: [{ name: "Validate maintained source and package", conclusion: "success" }],
}));
const run = { id: "123", run_attempt: 1 };
assertWorkerOrigin(receipt, run, jobs[0], jobs);
assert.throws(() => assertWorkerOrigin(receipt, run, jobs[0], jobs.slice(0, 2)));
assert.throws(() => assertWorkerOrigin(receipt, { ...run, run_attempt: 2 }, jobs[0], jobs));
assert.throws(
  () =>
    assertWorkerOrigin(
      {
        ...receipt,
        checks: [{ ...receipt.checks[0], origin: { ...receipt.checks[0].origin, job: "browser-linux-2" } }],
      },
      run,
      jobs[0],
      jobs,
    ),
  /absent/,
);
console.log(
  "Balanced CI shards: complete coverage, source/environment/attempt binding, missing/duplicate/failed/foreign workers and authenticated aggregation passed.",
);

const partial = mergeShardReceipts(plan, "linux", workers.slice(1), { allowPartial: true });
assert.equal(partial.coverageComplete, false);
assert.ok(partial.checks.length > 0);
assertWorkerOrigin(partial, run, jobs[1], jobs);
