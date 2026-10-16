import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validationInputs } from "../../scripts/validation-inputs.mjs";
import { releaseOptions, runRelease } from "../../scripts/release.mjs";

export async function releaseDriverFixture(root) {
  await mkdir(join(root, "tests"), { recursive: true });
  await mkdir(join(root, "artifacts"), { recursive: true });
  await mkdir(join(root, ".build-tmp"), { recursive: true });
  execFileSync("git", ["init", root], { stdio: "ignore" });
  await writeFile(join(root, "tests/a.regression.mjs"), "// fixture\n");
  const current = await validationInputs(root);
  const candidate = "a".repeat(40);
  const bytes = Buffer.from("immutable release package");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const build = {
    version: "1.2.3",
    sourceRevision: candidate,
    sourceDigest: "d".repeat(64),
    retainedArchivePath: join(root, "artifacts/candidate.zip"),
    sha256,
  };
  await writeFile(build.retainedArchivePath, bytes);
  await writeFile(join(root, ".build-tmp/package-build.json"), JSON.stringify(build));
  await writeFile(
    join(root, "acceptance.json"),
    JSON.stringify({
      passed: true,
      image: "sha256:" + "b".repeat(64),
      package: { archiveHash: sha256, sourceDigest: build.sourceDigest },
    }),
  );
  const checks = ["validate", "validate-windows", "package-parity"].map((name) => ({
    name,
    status: "COMPLETED",
    conclusion: "SUCCESS",
    detailsUrl: "https://github.com/example/villages/actions/runs/5/job/1",
  }));
  checks.unshift({ ...checks[0], detailsUrl: "https://github.com/example/villages/actions/runs/4/job/1" });
  const prs = [10, 11].map((number, index) => ({
    number,
    headRefOid: candidate,
    baseRefName: index === 0 ? "staging" : "main",
    state: "OPEN",
    isDraft: false,
    statusCheckRollup: checks,
    url: "https://github.com/example/villages/pull/" + number,
  }));
  let release;
  let tag;
  const commands = [];
  let waiting = false;
  const receipt = (platform) => ({
    schemaVersion: 2,
    passed: true,
    runId: 5,
    runAttempt: 1,
    job: platform === "linux" ? "validate" : "validate-windows",
    platform,
    node: process.version,
    sourceRevision: candidate,
    inputs: current.inputs,
    inputDigest: current.digest,
    inputsUnchanged: true,
    full: true,
    completeInventory: true,
    reproducible: true,
    requestedInventory: ["tests/a.regression.mjs"],
    tests: [{ path: "tests/a.regression.mjs", code: 0 }],
  });
  const run = {
    id: 5,
    run_attempt: 1,
    event: "pull_request",
    path: ".github/workflows/ci.yml",
    head_sha: candidate,
    head_repository: { full_name: "example/villages" },
  };
  const execute = (command, args) => {
    commands.push([command, ...args]);
    if (command === "git") return args[0] === "rev-parse" ? candidate : "";
    assert.equal(command, "gh");
    const send = (value) => JSON.stringify(value);
    if (args[0] === "repo") return "example/villages";
    if (args[0] === "pr") {
      const pr = prs.find((pr) => String(pr.number) === args[2]);
      if (args[1] === "view") return send(waiting ? { ...pr, statusCheckRollup: [] } : pr);
      assert.equal(args[1], "merge");
      assert.ok(args.includes("--match-head-commit"));
      if (pr.number === 11) assert.equal(prs[0].state, "MERGED", "Staging merges before main");
      pr.state = "MERGED";
      return "";
    }
    if (args[0] === "run") {
      const name = args[args.indexOf("--name") + 1];
      const platform = name.endsWith("windows") ? "win32" : "linux";
      const destination = args[args.indexOf("--dir") + 1];
      mkdirSync(join(destination, ".build-tmp"), { recursive: true });
      mkdirSync(join(destination, "artifacts"), { recursive: true });
      writeFileSync(join(destination, ".build-tmp/ci-validation.json"), send(receipt(platform)));
      writeFileSync(join(destination, ".build-tmp/package-build.json"), send(build));
      writeFileSync(join(destination, "artifacts/villages-1.2.3.zip"), bytes);
      return "";
    }
    if (args[0] === "release") {
      if (args[1] === "create") {
        assert.ok(args.includes("--draft"));
        release = {
          tag_name: "v1.2.3",
          draft: true,
          prerelease: false,
          assets: [],
          html_url: "https://example/release",
        };
      } else if (args[1] === "upload") {
        assert.ok(args[3].endsWith("villages-1.2.3.zip"), "Upload uses the public archive filename");
        assert.deepEqual(readFileSync(args[3]), bytes);
        release.assets.push({ name: "villages-1.2.3.zip", digest: "sha256:" + sha256, state: "uploaded" });
      } else if (args[1] === "edit") {
        release.draft = false;
        release.published_at = "2026-10-16";
      } else throw Error("Unexpected release operation");
      return "";
    }
    assert.equal(args[0], "api");
    const path = args[1].slice("repos/example/villages/".length);
    if (path === "actions/runs/4") return send({ ...run, id: 4 });
    if (path === "actions/runs/4/artifacts") return send({ artifacts: [] });
    if (path === "actions/runs/5") return send(run);
    if (path === "actions/runs/5/artifacts")
      return send({
        artifacts: [
          { id: 7, name: "villages-validate" },
          { id: 8, name: "villages-validate-windows" },
        ],
      });
    if (path === "actions/runs/5/attempts/1/jobs?per_page=100")
      return send({
        jobs: ["validate", "validate-windows"].map((name) => ({
          name,
          status: "completed",
          conclusion: "success",
          steps: [{ name: "Validate maintained source and package", conclusion: "success" }],
        })),
      });
    if (path === "git/commits/" + candidate) return send({ sha: candidate });
    if (path === "git/ref/tags/v1.2.3") {
      if (tag) return send({ object: tag });
      const error = new Error("Not found");
      error.stderr = "HTTP 404";
      throw error;
    }
    if (path === "git/refs") {
      tag = { sha: candidate, type: "commit" };
      return "{}";
    }
    if (path === "releases/tags/v1.2.3") {
      if (release) return send(release);
      const error = new Error("Not found");
      error.stderr = "HTTP 404";
      throw error;
    }
    throw Error("Unexpected fixture API: " + path);
  };
  const args = ["--version", "1.2.3", "--candidate", candidate, "--staging-pr", "10", "--main-pr", "11"];
  const deps = { root, execute, status: () => {} };
  waiting = true;
  assert.equal((await runRelease(releaseOptions(args), deps)).stage, "waiting");
  assert.ok(!commands.some((args) => args[1] === "merge"), "Status never merges");
  let sleeps = 0;
  const waitingResult = await runRelease(releaseOptions([...args, "--wait"]), {
    ...deps,
    sleep: async () => {
      sleeps++;
      waiting = false;
    },
  });
  assert.equal(waitingResult.stage, "validated");
  assert.equal(sleeps, 1, "The release process owns waiting");
  const authorized = releaseOptions([
    ...args,
    "--merge",
    "--acceptance",
    "acceptance.json",
    "--publish",
    "--notes",
    "notes.md",
  ]);
  await writeFile(join(root, "notes.md"), "Release notes");
  assert.equal((await runRelease(authorized, deps)).stage, "published");
  const mutations = commands.filter((args) => args[1] === "release" || args[2] === "merge").length;
  assert.equal((await runRelease(authorized, deps)).stage, "published");
  assert.equal(
    commands.filter((args) => args[1] === "release" || args[2] === "merge").length,
    mutations,
    "Resume never merges or publishes twice",
  );
  assert.equal(
    JSON.parse(await readFile(join(root, ".build-tmp/releases/1.2.3-" + candidate + "/state.json"), "utf8"))
      .nextReleaseTarget,
    "1.2.4",
  );
  tag.sha = "c".repeat(40);
  await assert.rejects(() => runRelease(authorized, deps), /Never replace/);
  // The operation lock must be released even when verification rejects a changed tag.
  tag.sha = candidate;
  assert.equal((await runRelease(authorized, deps)).stage, "published");
}
