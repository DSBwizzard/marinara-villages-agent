import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, rename, copyFile, open, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative, isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { validationInputs } from "./validation-inputs.mjs";
import { testInventory } from "./test-inventory.mjs";
import { assertReusableCi } from "./ci-reuse.mjs";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const required = ["validate", "validate-windows", "package-parity"];

export function releaseOptions(args) {
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const key = args[index];
    if (["--wait", "--merge", "--publish"].includes(key)) options[key.slice(2)] = true;
    else if (
      [
        "--version",
        "--candidate",
        "--staging-pr",
        "--main-pr",
        "--acceptance",
        "--notes",
        "--timeout-minutes",
      ].includes(key)
    ) {
      const value = args[++index];
      if (!value || value.startsWith("--") || options[key.slice(2)] !== undefined)
        throw Error("Missing or repeated " + key);
      options[key.slice(2)] = value;
    } else throw Error("Unknown release option: " + key);
  }
  if (!/^\d+\.\d+\.\d+$/.test(options.version ?? "") || !/^[a-f0-9]{40}$/.test(options.candidate ?? ""))
    throw Error("--version and the full --candidate commit are required");
  for (const name of ["staging-pr", "main-pr"])
    if (!/^[1-9]\d*$/.test(options[name] ?? "")) throw Error("--" + name + " is required");
  options.timeout = Number(options["timeout-minutes"] ?? 60) * 60000;
  if (!Number.isFinite(options.timeout) || options.timeout <= 0 || options.timeout > 24 * 60 * 60000)
    throw Error("Timeout must be between zero and 1440 minutes");
  if (options.publish && (!options.merge || !options.notes)) throw Error("--publish requires --merge and --notes");
  if (options.merge && !options.acceptance) throw Error("--merge requires matching packaged --acceptance evidence");
  return options;
}

export function promotionStatus(pr, base, candidate) {
  if (pr.headRefOid !== candidate || pr.baseRefName !== base || !["OPEN", "MERGED"].includes(pr.state))
    throw Error("PR identity changed for " + base);
  const checks = pr.statusCheckRollup ?? [];
  const successful = (check) => check.conclusion === "SUCCESS" || check.status === "SUCCESS";
  if (
    checks.some((check) =>
      ["FAILURE", "CANCELLED", "TIMED_OUT", "ACTION_REQUIRED", "ERROR"].includes(check.conclusion ?? check.status),
    )
  )
    throw Error("CI failed for " + base + "; inspect its diagnostics before resuming");
  return (
    required.every((name) => checks.some((check) => check.name === name && successful(check))) &&
    checks.every((check) => successful(check) || ["SKIPPED", "NEUTRAL"].includes(check.conclusion))
  );
}

export function assertPublishedRelease(release, candidate, version, archiveHash, tag) {
  assert.equal(tag, candidate, "Published tag must identify the frozen candidate");
  assert.equal(release.tag_name, "v" + version);
  assert.equal(release.draft, false);
  assert.equal(release.prerelease, false);
  assert.ok(release.published_at);
  const asset = release.assets.find((asset) => asset.name === "villages-" + version + ".zip");
  assert.equal(asset?.state, "uploaded");
  assert.equal(asset?.digest, "sha256:" + archiveHash, "Published bytes are immutable");
}

/** One resumable process owns waiting and promotion; no model polling or repeated full local runs. */
export async function runRelease(
  options,
  { root = process.cwd(), ghExecutable = "gh", execute = execFileSync, sleep = delay, status = console.log } = {},
) {
  const gh = (...args) =>
    execute(ghExecutable, args, { cwd: root, encoding: "utf8", windowsHide: true, timeout: 60000 }).trim();
  const json = (...args) => JSON.parse(gh(...args));
  const git = (...args) => execute("git", args, { cwd: root, encoding: "utf8", windowsHide: true }).trim();
  const repository = gh("repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner");
  const api = (path) => json("api", "repos/" + repository + "/" + path);
  const directory = join(root, ".build-tmp/releases", options.version + "-" + options.candidate);
  await mkdir(directory, { recursive: true });
  const statePath = join(directory, "state.json");
  const lock = await open(statePath + ".lock", "wx");
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    const save = async (stage, extra = {}) => {
      const state = {
        version: options.version,
        candidate: options.candidate,
        repository,
        stage,
        ...extra,
        updatedAt: new Date().toISOString(),
      };
      await writeFile(statePath + ".tmp", JSON.stringify(state, null, 2) + "\n");
      await rename(statePath + ".tmp", statePath);
      return state;
    };
    const readPr = (number) =>
      json(
        "pr",
        "view",
        number,
        "--repo",
        repository,
        "--json",
        "number,headRefOid,baseRefName,state,isDraft,statusCheckRollup,mergeCommit,url",
      );
    const started = Date.now();
    let last;
    let prs;
    while (true) {
      prs = [readPr(options["staging-pr"]), readPr(options["main-pr"])];
      const ready = prs.map((pr, index) => promotionStatus(pr, index === 0 ? "staging" : "main", options.candidate));
      const current = ready
        .map((value, index) => (index === 0 ? "staging" : "main") + ":" + (value ? "ready" : "waiting"))
        .join(" ");
      if (current !== last) {
        status(current);
        last = current;
      }
      if (ready.every(Boolean)) break;
      const state = await save("waiting", { pullRequests: prs.map((pr) => pr.url) });
      if (!options.wait) return state;
      if (Date.now() - started >= options.timeout) throw Error("Release wait timed out; resume the same command");
      await sleep(Math.min(15000, options.timeout - (Date.now() - started)));
    }
    if (!options.merge) return save("validated", { pullRequests: prs.map((pr) => pr.url) });
    assert.equal(git("rev-parse", "HEAD"), options.candidate, "Use the frozen candidate checkout");
    assert.equal(git("status", "--porcelain"), "", "Commit maintained changes before promotion");
    const build = JSON.parse(await readFile(join(root, ".build-tmp/package-build.json"), "utf8"));
    assert.equal(build.version, options.version);
    assert.equal(build.sourceRevision, options.candidate);
    assert.match(build.sourceDigest, /^[a-f0-9]{64}$/);
    if (options.publish)
      assert.ok((await readFile(resolve(root, options.notes), "utf8")).trim(), "Release notes are required");
    const archive = resolve(root, build.retainedArchivePath);
    const path = relative(join(root, "artifacts"), archive);
    assert.ok(path && !path.startsWith("..") && !isAbsolute(path), "Release archive must belong to this checkout");
    assert.equal(hash(await readFile(archive)), build.sha256);
    const acceptance = JSON.parse(await readFile(resolve(root, options.acceptance), "utf8"));
    assert.equal(acceptance.passed, true);
    assert.equal(acceptance.package.archiveHash, build.sha256);
    assert.equal(acceptance.package.sourceDigest, build.sourceDigest);
    assert.match(acceptance.image, /^sha256:[a-f0-9]{64}$/);
    const current = await validationInputs(root);
    const inventory = (await testInventory(pathToFileURL(resolve(root) + "/")))
      .filter((test) => test.group !== "engine")
      .map((test) => test.path);
    // Multiple PR workflows can attach identically named checks to the same candidate.
    const verifyEvidence = async (platform, runId) => {
      const name = platform === "linux" ? "validate" : "validate-windows";
      const run = api("actions/runs/" + runId);
      assert.equal(run.head_sha, options.candidate);
      const artifactName = "villages-" + name;
      const artifact = api("actions/runs/" + runId + "/artifacts").artifacts.find(
        (asset) => asset.name === artifactName && !asset.expired,
      );
      assert.ok(artifact, "Missing CI artifact");
      const evidence = join(directory, String(artifact.id));
      await mkdir(evidence, { recursive: true });
      // Artifact IDs are immutable. A resumed command reads the same verified artifact.
      const receiptPath = join(evidence, ".build-tmp/ci-validation.json");
      try {
        await readFile(receiptPath);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        gh("run", "download", runId, "--repo", repository, "--name", artifactName, "--dir", evidence);
      }
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
      const jobs = api("actions/runs/" + runId + "/attempts/" + run.run_attempt + "/jobs?per_page=100").jobs;
      assertReusableCi({
        run,
        receipt,
        testedCommit: api("git/commits/" + receipt.sourceRevision),
        job: jobs.find((job) => job.name === name),
        repository,
        platform,
        node: process.version,
      });
      assert.equal(receipt.passed, true);
      assert.equal(receipt.full, true);
      assert.equal(receipt.completeInventory, true);
      assert.equal(receipt.reproducible, true);
      assert.equal(receipt.inputDigest, current.digest);
      assert.deepEqual(receipt.inputs, current.inputs);
      assert.equal(receipt.tests.length, inventory.length);
      assert.ok(
        inventory.every((path) =>
          receipt.tests.some((test) => test.path === path && test.code === 0 && !test.skipped && !test.signal),
        ),
      );
      const packageReceipt = JSON.parse(await readFile(join(evidence, ".build-tmp/package-build.json"), "utf8"));
      assert.equal(packageReceipt.sha256, build.sha256);
      assert.equal(packageReceipt.sourceDigest, build.sourceDigest);
      assert.equal(
        hash(await readFile(join(evidence, "artifacts", "villages-" + options.version + ".zip"))),
        build.sha256,
      );
    };
    for (const platform of ["linux", "win32"]) {
      const name = platform === "linux" ? "validate" : "validate-windows";
      const runIds = [
        ...new Set(
          prs[1].statusCheckRollup
            .filter((check) => check.name === name)
            .map((check) => check.detailsUrl?.match(/\/actions\/runs\/(\d+)/)?.[1])
            .filter(Boolean),
        ),
      ].slice(0, 4);
      let verified = false;
      const failures = [];
      for (const runId of runIds) {
        try {
          await verifyEvidence(platform, runId);
          verified = true;
          break;
        } catch (error) {
          failures.push(error.message);
        }
      }
      assert.ok(verified, "Missing complete authenticated " + name + " evidence: " + failures.join("; "));
    }
    for (let index = 0; index < prs.length; index++) {
      const pr = readPr(String(prs[index].number));
      assert.ok(promotionStatus(pr, index === 0 ? "staging" : "main", options.candidate));
      if (pr.state !== "MERGED") {
        assert.equal(pr.isDraft, false, "Mark the approved PR ready before merging");
        gh("pr", "merge", String(pr.number), "--repo", repository, "--merge", "--match-head-commit", options.candidate);
      }
      assert.equal(readPr(String(pr.number)).state, "MERGED");
      await save(index === 0 ? "merged-staging" : "merged-main", { archiveSha256: build.sha256 });
    }
    if (!options.publish) return save("merged", { archiveSha256: build.sha256 });
    const tagName = "v" + options.version;
    let tag;
    try {
      tag = api("git/ref/tags/" + tagName).object;
    } catch (error) {
      if (!String(error.stderr).includes("HTTP 404")) throw error;
      gh(
        "api",
        "repos/" + repository + "/git/refs",
        "--method",
        "POST",
        "-f",
        "ref=refs/tags/" + tagName,
        "-f",
        "sha=" + options.candidate,
      );
      tag = api("git/ref/tags/" + tagName).object;
    }
    if (tag.type === "tag") tag = api("git/tags/" + tag.sha).object;
    assert.equal(tag.sha, options.candidate, "Never replace an existing release tag");
    let release;
    try {
      release = api("releases/tags/" + tagName);
    } catch (error) {
      if (!String(error.stderr).includes("HTTP 404")) throw error;
    }
    if (!release) {
      gh(
        "release",
        "create",
        tagName,
        "--repo",
        repository,
        "--target",
        options.candidate,
        "--title",
        options.version,
        "--notes-file",
        resolve(root, options.notes),
        "--draft",
      );
      release = api("releases/tags/" + tagName);
    }
    if (release.draft) {
      const asset = release.assets.find((asset) => asset.name === "villages-" + options.version + ".zip");
      if (asset) assert.equal(asset.digest, "sha256:" + build.sha256, "Never overwrite different uploaded bytes");
      else {
        const upload = join(directory, "villages-" + options.version + ".zip");
        await copyFile(archive, upload);
        assert.equal(hash(await readFile(upload)), build.sha256);
        gh("release", "upload", tagName, upload, "--repo", repository);
      }
      release = api("releases/tags/" + tagName);
      assert.equal(
        release.assets.find((asset) => asset.name === "villages-" + options.version + ".zip")?.digest,
        "sha256:" + build.sha256,
      );
      gh("release", "edit", tagName, "--repo", repository, "--draft=false");
      release = api("releases/tags/" + tagName);
    }
    assertPublishedRelease(release, options.candidate, options.version, build.sha256, tag.sha);
    const state = await save("published", {
      url: release.html_url,
      archiveSha256: build.sha256,
      sourceDigest: build.sourceDigest,
      publishedAt: release.published_at,
      nextReleaseTarget: options.version.replace(/\d+$/, (patch) => String(Number(patch) + 1)),
    });
    status(release.html_url);
    return state;
  } finally {
    await lock.close();
    await unlink(statePath + ".lock");
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await runRelease(releaseOptions(process.argv.slice(2)));
}
