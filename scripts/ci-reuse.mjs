import { execFileSync } from "node:child_process";
import { readFile, mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { reusableTests } from "./ci-evidence.mjs";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const jobName = (platform) => (platform === "win32" ? "validate-windows" : "validate");

/** Authenticate an individual validation job independently of other jobs in its workflow. */
export function assertReusableCi({ run, receipt, testedCommit, job, repository, platform, node }) {
  const provenance =
    testedCommit.sha === receipt.sourceRevision &&
    (receipt.sourceRevision === run.head_sha ||
      (testedCommit.parents?.length === 2 && testedCommit.parents.some((parent) => parent.sha === run.head_sha)));
  const validation = job?.steps?.find((step) => step.name === "Validate maintained source and package");
  if (
    !["pull_request", "push", "workflow_dispatch"].includes(run.event) ||
    run.path !== ".github/workflows/ci.yml" ||
    run.head_repository?.full_name !== repository ||
    !provenance ||
    receipt.schemaVersion !== 2 ||
    typeof receipt.passed !== "boolean" ||
    String(receipt.runId) !== String(run.id) ||
    receipt.runAttempt !== run.run_attempt ||
    receipt.job !== jobName(platform) ||
    job?.name !== receipt.job ||
    job.status !== "completed" ||
    !["success", "failure"].includes(job.conclusion) ||
    validation?.conclusion !== (receipt.passed ? "success" : "failure") ||
    receipt.platform !== platform ||
    receipt.node !== node ||
    receipt.inputsUnchanged !== true ||
    !Array.isArray(receipt.tests) ||
    !Array.isArray(receipt.requestedInventory) ||
    new Set(receipt.requestedInventory).size !== receipt.requestedInventory.length ||
    new Set(receipt.tests.map((test) => test.path)).size !== receipt.tests.length ||
    receipt.tests.some((test) => !receipt.requestedInventory.includes(test.path)) ||
    (receipt.completeInventory === true && receipt.full !== true) ||
    (receipt.passed &&
      (receipt.tests.length !== receipt.requestedInventory.length ||
        receipt.tests.some((test) => test.code !== 0 || test.skipped || test.signal)))
  )
    throw Error("CI job provenance, attempt, platform or coverage is invalid");
  return receipt;
}

/** Read published artifacts; never wait for another run or use Actions caches as test proof. */
export async function reusableCi({
  current,
  inventory,
  consumers,
  full,
  root = process.cwd(),
  execute = execFileSync,
}) {
  const repository = process.env.GITHUB_REPOSITORY;
  if (
    !["pull_request", "push", "workflow_dispatch"].includes(process.env.GITHUB_EVENT_NAME) ||
    !process.env.GH_TOKEN ||
    !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? "") ||
    process.env.VILLAGES_CI_FRESH === "true"
  )
    return null;
  const gh = (args, options = {}) =>
    execute("gh", args, {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      timeout: 30000,
      maxBuffer: 8 * 1024 * 1024,
      ...options,
    });
  const api = (path) => JSON.parse(gh(["api", "repos/" + repository + "/" + path]));
  const tests = new Map();
  const sources = [];
  let archiveHash;
  let reproducible = false;
  try {
    const runs = api("actions/workflows/ci.yml/runs?per_page=20").workflow_runs.filter(
      (run) =>
        String(run.id) !== process.env.GITHUB_RUN_ID &&
        run.head_repository?.full_name === repository &&
        ["pull_request", "push", "workflow_dispatch"].includes(run.event),
    );
    let downloaded = 0;
    for (const run of runs) {
      if (downloaded >= 4 || tests.size === inventory.length) break;
      try {
        const name = process.platform === "win32" ? "villages-validate-windows" : "villages-validate";
        const artifact = api("actions/runs/" + run.id + "/artifacts").artifacts.find(
          (artifact) => artifact.name === name && !artifact.expired,
        );
        if (!artifact) continue;
        downloaded++;
        const directory = join(root, ".build-tmp/ci-reuse", String(artifact.id));
        const receiptPath = join(directory, ".build-tmp/ci-validation.json");
        try {
          await access(receiptPath);
        } catch {
          await mkdir(directory, { recursive: true });
          gh(["run", "download", String(run.id), "--repo", repository, "--name", name, "--dir", directory], {
            timeout: 60000,
          });
        }
        const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
        const reusable = reusableTests(receipt, current, inventory, consumers, { full });
        if (!reusable.length) continue;
        const jobs = api("actions/runs/" + run.id + "/attempts/" + run.run_attempt + "/jobs?per_page=100").jobs;
        const commit = api("git/commits/" + receipt.sourceRevision);
        assertReusableCi({
          run,
          receipt,
          testedCommit: commit,
          job: jobs.find((job) => job.name === jobName(process.platform)),
          repository,
          platform: process.platform,
          node: process.version,
        });
        const build = JSON.parse(await readFile(join(directory, ".build-tmp/package-build.json"), "utf8"));
        if (
          build.sourceRevision !== receipt.sourceRevision ||
          !/^[a-f0-9]{64}$/.test(build.sha256) ||
          !/^\d+\.\d+\.\d+$/.test(build.version)
        )
          throw Error("CI build provenance does not match");
        const archive = join(directory, "artifacts", "villages-" + build.version + ".zip");
        if (sha256(await readFile(archive)) !== build.sha256) throw Error("CI archive changed");
        if (archiveHash && archiveHash !== build.sha256) continue;
        archiveHash = build.sha256;
        reproducible ||= receipt.reproducible === true;
        const source = { runId: run.id, attempt: run.run_attempt, artifactId: artifact.id, url: run.html_url };
        sources.push(source);
        for (const test of reusable) if (!tests.has(test.path)) tests.set(test.path, { ...test, reusedFrom: source });
      } catch (error) {
        console.error("CI evidence skipped: " + error.message.split("\n")[0]);
      }
    }
  } catch (error) {
    console.error("Prior CI proof unavailable; running current validation: " + error.message.split("\n")[0]);
  }
  return tests.size ? { tests: [...tests.values()], archiveHash, reproducible, sources } : null;
}
