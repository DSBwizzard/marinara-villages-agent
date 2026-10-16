import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import AdmZip from "adm-zip";
import { fingerprint, assertProofOrigin } from "./ci-checks.mjs";

export function assertManifestOrigin(manifest, run, commit, job, repository, policyDigest) {
  const provenance =
    commit.sha === manifest.sourceRevision &&
    (commit.sha === run.head_sha ||
      (commit.parents?.length === 2 && commit.parents.some((parent) => parent.sha === run.head_sha)));
  assert.ok(provenance, "Coverage source is not the CI head or tested merge");
  assert.equal(run.path, ".github/workflows/ci.yml");
  assert.ok(["push", "pull_request", "workflow_dispatch"].includes(run.event));
  assert.equal(run.head_repository?.full_name, repository, "Foreign CI cannot supply release proof");
  assert.equal(manifest.schemaVersion, 3);
  assert.equal(manifest.policyDigest, policyDigest, "Evidence implementation changed");
  assert.equal(String(manifest.producer.runId), String(run.id));
  assert.equal(manifest.producer.attempt, run.run_attempt, "Stale workflow attempt");
  assert.equal(manifest.producer.job, "package-parity");
  assert.equal(job?.name, "package-parity");
  assert.equal(job.status, "completed");
  assert.ok(["success", "failure"].includes(job.conclusion));
  assert.equal(
    job.steps.find((step) => step.name === "Verify complete candidate coverage")?.conclusion,
    manifest.ready ? "success" : "failure",
  );
  assert.equal(manifest.inputsUnchanged, true);
  assert.ok(manifest.platforms && typeof manifest.platforms === "object");
  for (const [platform, receipt] of Object.entries(manifest.platforms)) {
    assert.equal(receipt.environment.platform, platform);
    assert.equal(receipt.policyDigest, policyDigest);
    assert.equal(receipt.inputDigest, manifest.inputDigest);
    assert.equal(receipt.sourceRevision, manifest.sourceRevision);
    assert.equal(receipt.inputsUnchanged, true);
    assert.equal(String(receipt.producer.runId), String(run.id));
    assert.equal(receipt.producer.attempt, run.run_attempt);
    for (const proof of receipt.checks) assertProofOrigin(proof, receipt.environment);
  }
  return manifest;
}

export class GitHubEvidence {
  constructor({
    root = process.cwd(),
    repository = process.env.GITHUB_REPOSITORY,
    execute = execFileSync,
    environment = process.env,
  } = {}) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? "")) throw Error("Repository required for CI proof");
    this.root = root;
    this.repository = repository;
    this.execute = execute;
    this.environment = environment;
    this.responses = new Map();
    this.archives = new Map();
  }
  gh(args, options = {}) {
    return this.execute(process.platform === "win32" ? "C:/Program Files/GitHub CLI/gh.exe" : "gh", args, {
      cwd: this.root,
      encoding: "utf8",
      windowsHide: true,
      timeout: 30000,
      maxBuffer: 64 * 1024 * 1024,
      ...options,
    });
  }
  api(path) {
    if (!this.responses.has(path))
      this.responses.set(path, JSON.parse(this.gh(["api", "repos/" + this.repository + "/" + path])));
    return this.responses.get(path);
  }
  artifact(runId, name) {
    const artifact = this.api("actions/runs/" + runId + "/artifacts?per_page=100").artifacts.find(
      (row) => row.name === name && !row.expired,
    );
    if (!artifact) throw Error("Missing or expired " + name + " artifact");
    return { ...artifact, runId };
  }
  async zip(artifact) {
    assert.ok(/^[1-9]\d*$/.test(String(artifact.id)));
    assert.match(artifact.digest ?? "", /^sha256:[a-f0-9]{64}$/, "Artifact lacks authenticated digest");
    if (this.archives.has(artifact.id)) return this.archives.get(artifact.id);
    const directory = join(this.root, ".build-tmp/ci-artifacts");
    await mkdir(directory, { recursive: true });
    const path = join(directory, artifact.id + ".zip");
    let bytes = await readFile(path).catch(() => null);
    if (!bytes || "sha256:" + fingerprint(bytes) !== artifact.digest) {
      bytes = this.gh(["api", "repos/" + this.repository + "/actions/artifacts/" + artifact.id + "/zip"], {
        encoding: null,
      });
      assert.equal("sha256:" + fingerprint(bytes), artifact.digest, "Artifact bytes differ from GitHub digest");
      await writeFile(path, bytes);
    }
    const zip = new AdmZip(bytes);
    this.archives.set(artifact.id, zip);
    return zip;
  }
  async file(artifact, path) {
    const zip = await this.zip(artifact);
    const entry = zip.getEntry(path);
    if (!entry || entry.isDirectory) throw Error("Artifact lacks " + path);
    return entry.getData();
  }
  async jsonFile(artifact, path) {
    return JSON.parse((await this.file(artifact, path)).toString("utf8"));
  }
  async coverage(runId, policyDigest) {
    const run = this.api("actions/runs/" + runId);
    const artifact = this.artifact(runId, "villages-coverage");
    const manifest = await this.jsonFile(artifact, "coverage-manifest.json");
    const jobs = this.api("actions/runs/" + runId + "/attempts/" + run.run_attempt + "/jobs?per_page=100").jobs;
    assertManifestOrigin(
      manifest,
      run,
      this.api("git/commits/" + manifest.sourceRevision),
      jobs.find((job) => job.name === "package-parity"),
      this.repository,
      policyDigest,
    );
    return { manifest, run, artifact };
  }
  async discover(policyDigest) {
    const env = this.environment;
    const ids = [];
    // One latest PR attempt (including failure) and one integrated base replace history scans.
    if (env.GITHUB_HEAD_REF) {
      const runs = this.api(
        "actions/workflows/ci.yml/runs?event=pull_request&branch=" +
          encodeURIComponent(env.GITHUB_HEAD_REF) +
          "&per_page=2",
      ).workflow_runs;
      const previous = runs.find((run) => String(run.id) !== String(env.GITHUB_RUN_ID));
      if (previous) ids.push(previous.id);
    }
    if (env.VILLAGES_CI_BASE && /^[a-f0-9]{40}$/.test(env.VILLAGES_CI_BASE)) {
      const checks = this.api("commits/" + env.VILLAGES_CI_BASE + "/check-runs?per_page=100").check_runs;
      const gate = checks.find((check) => check.name === "package-parity" && check.conclusion === "success");
      const id = gate?.details_url?.match(/\/actions\/runs\/(\d+)/)?.[1];
      if (id) ids.push(id);
    }
    if (!ids.length) {
      const branch = env.GITHUB_BASE_REF || env.GITHUB_REF_NAME || "staging";
      const run = this.api(
        "actions/workflows/ci.yml/runs?branch=" + encodeURIComponent(branch) + "&status=success&per_page=1",
      ).workflow_runs[0];
      if (run && String(run.id) !== String(env.GITHUB_RUN_ID)) ids.push(run.id);
    }
    const results = [];
    for (const id of [...new Set(ids)].slice(0, 2)) {
      try {
        results.push(await this.coverage(id, policyDigest));
      } catch (error) {
        console.error("CI baseline unavailable: " + error.message.split("\n")[0]);
      }
    }
    return results;
  }

  async workerProof(platform, policyDigest) {
    const env = this.environment;
    if (!/^[a-f0-9]{40}$/.test(env.VILLAGES_CI_HEAD ?? "")) return [];
    try {
      const runs = this.api(
        "actions/workflows/ci.yml/runs?head_sha=" + env.VILLAGES_CI_HEAD + "&per_page=2",
      ).workflow_runs;
      const run = runs.find((row) => BigInt(row.id) < BigInt(env.GITHUB_RUN_ID));
      if (!run) return [];
      assert.equal(run.path, ".github/workflows/ci.yml");
      assert.equal(run.head_repository?.full_name, this.repository);
      assert.ok(["pull_request", "push", "workflow_dispatch"].includes(run.event));
      const name = platform === "linux" ? "validate" : "validate-windows";
      const artifact = this.artifact(run.id, "villages-" + name);
      const receipt = await this.jsonFile(artifact, ".build-tmp/ci-validation.json");
      const commit = this.api("git/commits/" + receipt.sourceRevision);
      assert.ok(
        commit.sha === run.head_sha ||
          (commit.sha === receipt.sourceRevision &&
            commit.parents?.length === 2 &&
            commit.parents.some((parent) => parent.sha === run.head_sha)),
      );
      const job = this.api("actions/runs/" + run.id + "/attempts/" + run.run_attempt + "/jobs?per_page=100").jobs.find(
        (job) => job.name === name,
      );
      assert.equal(job.status, "completed");
      assert.equal(
        job.steps.find((step) => step.name === "Validate maintained source and package")?.conclusion,
        receipt.coverageComplete ? "success" : "failure",
      );
      assert.equal(receipt.schemaVersion, 3);
      assert.equal(receipt.policyDigest, policyDigest);
      assert.equal(receipt.inputsUnchanged, true);
      assert.equal(receipt.environment.platform, platform);
      assert.equal(String(receipt.producer.runId), String(run.id));
      assert.equal(receipt.producer.attempt, run.run_attempt);
      return receipt.checks.map((proof) => {
        assertProofOrigin(proof, receipt.environment);
        return {
          ...proof,
          from: {
            runId: run.id,
            attempt: run.run_attempt,
            artifact,
            ...(proof.id === "build" ? { build: receipt.build } : {}),
          },
        };
      });
    } catch (error) {
      console.error("Earlier same-head worker unavailable: " + error.message.split("\n")[0]);
      return [];
    }
  }
}
