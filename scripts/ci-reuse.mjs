import { execFileSync } from "node:child_process";
import { readFile, mkdir, access } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function assertReusableCi({ run, receipt, testedCommit, tree, base, current, inventory, platform, node, full }) {
  const provenance =
    receipt.sourceRevision === run.head_sha ||
    (testedCommit.sha === receipt.sourceRevision &&
      testedCommit.parents?.length === 2 &&
      testedCommit.parents.some((parent) => parent.sha === run.head_sha) &&
      testedCommit.parents.some((parent) => parent.sha === base));
  if (
    run.event !== "pull_request" ||
    run.status !== "completed" ||
    run.conclusion !== "success" ||
    run.path !== ".github/workflows/ci.yml" ||
    !provenance ||
    testedCommit.tree?.sha !== tree
  )
    throw Error("No successful CI proof for this exact tested tree");
  if (
    receipt.schemaVersion !== 1 ||
    receipt.passed !== true ||
    String(receipt.runId) !== String(run.id) ||
    receipt.platform !== platform ||
    receipt.node !== node ||
    receipt.inputDigest !== current.digest ||
    JSON.stringify(receipt.inputs) !== JSON.stringify(current.inputs) ||
    (full && receipt.full !== true) ||
    (receipt.full === true && receipt.completeInventory !== true) ||
    !Array.isArray(receipt.tests) ||
    receipt.tests.some((test) => test.code !== 0 || test.skipped) ||
    JSON.stringify(receipt.tests.map((test) => test.path)) !== JSON.stringify(receipt.inventory) ||
    inventory.some((path) => !receipt.inventory.includes(path))
  )
    throw Error("CI coverage, platform or maintained inputs do not match");
  return receipt;
}

export async function reusableCi({ current, inventory, full, root = process.cwd() }) {
  if (
    process.env.GITHUB_EVENT_NAME !== "push" ||
    process.env.GITHUB_REF !== "refs/heads/staging" ||
    !process.env.GH_TOKEN
  )
    return null;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? "")) return null;
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const parents = git("show", "-s", "--format=%P", "HEAD").split(" ");
  if (parents.length !== 2) return null;
  const tree = git("rev-parse", "HEAD^{tree}");
  const api = (path) =>
    JSON.parse(
      execFileSync("gh", ["api", "repos/" + repository + "/" + path], {
        cwd: root,
        encoding: "utf8",
        windowsHide: true,
        timeout: 30000,
        maxBuffer: 8 * 1024 * 1024,
      }),
    );
  try {
    const runs = api("actions/workflows/ci.yml/runs?event=pull_request&status=success&per_page=20").workflow_runs;
    const run = runs.find(
      (row) => row.head_sha === parents[1] && row.status === "completed" && row.conclusion === "success",
    );
    if (!run) return null;
    const directory = join(root, ".build-tmp/ci-reuse", String(run.id), process.platform);
    const receiptPath = join(directory, ".build-tmp/ci-validation.json");
    try {
      await access(receiptPath);
    } catch {
      await mkdir(directory, { recursive: true });
      execFileSync(
        "gh",
        [
          "run",
          "download",
          String(run.id),
          "--repo",
          repository,
          "--name",
          process.platform === "win32" ? "villages-validate-windows" : "villages-validate",
          "--dir",
          directory,
        ],
        {
          cwd: root,
          windowsHide: true,
          stdio: "pipe",
          timeout: 120000,
        },
      );
    }
    const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
    const commit = api("git/commits/" + receipt.sourceRevision);
    assertReusableCi({
      run,
      receipt,
      testedCommit: commit,
      tree,
      base: parents[0],
      current,
      inventory,
      platform: process.platform,
      node: process.version,
      full,
    });
    const build = JSON.parse(await readFile(join(directory, ".build-tmp/package-build.json"), "utf8"));
    if (build.sourceRevision !== receipt.sourceRevision || !/^[a-f0-9]{64}$/.test(build.sha256))
      throw Error("CI build provenance does not match");
    const archive = join(directory, "artifacts", "villages-" + build.version + ".zip");
    if (sha256(await readFile(archive)) !== build.sha256) throw Error("CI archive changed");
    return {
      ...receipt,
      archiveHash: build.sha256,
      reusedFrom: { runId: run.id, testedRevision: receipt.sourceRevision, tree, url: run.html_url },
    };
  } catch (error) {
    console.error("Prior CI proof unavailable; running current validation: " + error.message.split("\n")[0]);
    return null;
  }
}
