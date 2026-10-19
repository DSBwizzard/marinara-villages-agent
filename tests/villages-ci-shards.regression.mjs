import assert from "node:assert/strict";
import { shardSpecs, shardAssignments, planShards, mergeShardReceipts, workerName } from "../scripts/ci-shards.mjs";
import { checkKeys, fingerprint, assertCoverage } from "../scripts/ci-checks.mjs";
import { assertWorkerOrigin, GitHubEvidence } from "../scripts/ci-manifests.mjs";
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
const onlyPending = specs.slice(1, 5);
assert.deepEqual(
  shardAssignments(specs, 3, onlyPending),
  shardAssignments(specs, 3, [...onlyPending].reverse()),
  "Pending-only assignment is deterministic",
);
for (const spec of onlyPending)
  assert.equal(
    shardAssignments(specs, 3, onlyPending).get(spec.id),
    shardAssignments(onlyPending, 3).get(spec.id),
    "Reused checks must not consume estimated runner capacity",
  );
assert.deepEqual(planShards({ platforms: { linux: { pending: [] } } }), { linux: 1 });
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
      environment,
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
  { producer: { ...workers[1].producer, attempt: 0 } },
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

// Hosted image rollout and targeted rerun reproduce the production failures.
const mixedWorkers = structuredClone(workers);
for (const [index, image, attempt] of [
  [1, "new-hosted-image", 2],
  [2, "other-hosted-image", 1],
]) {
  const worker = mixedWorkers[index];
  worker.environment = { ...worker.environment, image };
  worker.producer.attempt = attempt;
  worker.producer.environmentDigest = fingerprint(worker.environment);
  for (const proof of worker.checks) {
    proof.environment = structuredClone(worker.environment);
    proof.origin = structuredClone(worker.producer);
  }
}
const mixed = mergeShardReceipts(plan, "linux", mixedWorkers);
assert.equal(mixed.coverageComplete, true);
assertCoverage(mixed, blueprint);
const attemptJobs = mixedWorkers.map((worker) => ({
  ...jobs.find((job) => job.name === worker.producer.job),
  run_attempt: worker.producer.attempt,
}));
assertWorkerOrigin(mixed, { ...run, run_attempt: 2 }, attemptJobs[0], attemptJobs);
assert.throws(() => assertWorkerOrigin(mixed, run, attemptJobs[0], attemptJobs), /attempt/);
assert.throws(
  () =>
    assertWorkerOrigin(
      mixed,
      { ...run, run_attempt: 2 },
      attemptJobs[0],
      attemptJobs.map((job) => (job.name === "browser-linux-1" ? { ...job, run_attempt: 1 } : job)),
    ),
  /attempt|name/,
);
assert.throws(() =>
  assertWorkerOrigin(
    mixed,
    { ...run, run_attempt: 2 },
    attemptJobs[0],
    attemptJobs.map((job) =>
      job.name === "browser-linux-1"
        ? { ...job, steps: [{ name: "Validate maintained source and package", conclusion: "failure" }] }
        : job,
    ),
  ),
);
for (const delta of [{ node: "v0.0.0" }, { runner: "ubuntu-latest" }, { arch: "arm64" }, { platform: "win32" }]) {
  const invalid = structuredClone(mixedWorkers);
  Object.assign(invalid[1].environment, delta);
  invalid[1].producer.environmentDigest = fingerprint(invalid[1].environment);
  assert.throws(() => mergeShardReceipts(plan, "linux", invalid), /toolchain|environment/);
}
const forgedImage = structuredClone(mixedWorkers);
forgedImage[1].checks[0].environment.image = "forged";
assert.throws(() => mergeShardReceipts(plan, "linux", forgedImage), /origin|environment/);
const foreignRun = structuredClone(mixedWorkers);
foreignRun[1].producer.runId = "456";
assert.throws(() => mergeShardReceipts(plan, "linux", foreignRun));
const changedSource = structuredClone(mixedWorkers);
changedSource[1].sourceRevision = "d".repeat(40);
assert.throws(() => mergeShardReceipts(plan, "linux", changedSource));
assert.equal(
  mergeShardReceipts(plan, "linux", [mixedWorkers[0], mixedWorkers[1]], { allowPartial: true }).coverageComplete,
  false,
);

// Authenticate an actual collected manifest through the GitHub reader across attempts.
const history = new GitHubEvidence({ repository: "example/villages" });
const manifest = {
  schemaVersion: 3,
  sourceRevision: plan.sourceRevision,
  policyDigest: blueprint.policyDigest,
  inputDigest: blueprint.inputDigest,
  inputsUnchanged: true,
  ready: true,
  blueprint,
  validationProfile: blueprint.validationProfile,
  producer: { runId: "123", attempt: 2, job: "package-parity" },
  platforms: { linux: mixed },
};
const parityJob = {
  name: "package-parity",
  status: "completed",
  conclusion: "success",
  steps: [{ name: "Verify complete candidate coverage", conclusion: "success" }],
};
const queriedAttempts = [];
history.artifact = () => ({ id: 7 });
history.jsonFile = async () => manifest;
history.api = (path) => {
  if (path === "actions/runs/123")
    return {
      ...run,
      run_attempt: 2,
      path: ".github/workflows/ci.yml",
      event: "pull_request",
      head_sha: plan.sourceRevision,
      head_repository: { full_name: "example/villages" },
    };
  if (path === "git/commits/" + plan.sourceRevision) return { sha: plan.sourceRevision };
  const attempt = Number(path.match(/attempts\/(\d+)\/jobs/)[1]);
  queriedAttempts.push(attempt);
  return { jobs: [...attemptJobs.filter((job) => job.run_attempt === attempt), ...(attempt === 2 ? [parityJob] : [])] };
};
await history.coverage("123", blueprint.policyDigest);
assert.deepEqual(queriedAttempts.sort(), [1, 2], "Every producing attempt is authenticated separately");
const validApi = history.api;
history.api = (path) => (path.includes("attempts/1/jobs") ? { jobs: [] } : validApi(path));
await assert.rejects(() => history.coverage("123", blueprint.policyDigest), /attempt|name/);

const partial = mergeShardReceipts(plan, "linux", workers.slice(1), { allowPartial: true });
assert.equal(partial.coverageComplete, false);
assert.ok(partial.checks.length > 0);
assertWorkerOrigin(partial, run, jobs[1], jobs);
