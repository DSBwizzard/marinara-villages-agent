import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { documentationOnly } from "../scripts/documentation-only.mjs";

const fixture = await mkdtemp(join(tmpdir(), "villages-documentation-"));
try {
  for (const scenario of [
    "instructions",
    "product",
    "configuration",
    "workflow",
    "unknown",
    "rename",
    "mode",
    "binary",
    "invalid-utf8",
    "empty",
  ]) {
    const root = join(fixture, scenario);
    await mkdir(root);
    const git = (...args) =>
      execFileSync("git", args, {
        cwd: root,
        encoding: "utf8",
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    git("init", "--quiet");
    git("config", "user.name", "Fixture");
    git("config", "user.email", "fixture@example.invalid");
    git("config", "commit.gpgsign", "false");
    git("config", "core.autocrlf", "false");
    for (const path of ["AGENTS.md", "DEVELOPMENT.md", "source.mjs", "package.json"])
      await writeFile(join(root, path), "baseline\n");
    git("add", ".");
    git("commit", "--quiet", "-m", "base");
    const base = git("rev-parse", "HEAD");
    git("checkout", "--quiet", "-b", "change");
    if (scenario === "instructions") {
      await writeFile(join(root, "AGENTS.md"), "updated principles\n");
      await writeFile(join(root, "DEVELOPMENT.md"), "updated commands\n");
    } else if (scenario === "rename") git("mv", "AGENTS.md", "OTHER.md");
    else if (scenario === "mode") git("update-index", "--chmod=+x", "AGENTS.md");
    else if (scenario === "binary") await writeFile(join(root, "AGENTS.md"), Buffer.from([0, 1, 2]));
    else if (scenario === "invalid-utf8") await writeFile(join(root, "AGENTS.md"), Buffer.from([0xff, 0xfe]));
    else if (scenario !== "empty") {
      const path = {
        product: "source.mjs",
        configuration: "package.json",
        workflow: ".github/workflows/ci.yml",
        unknown: "README.md",
      }[scenario];
      if (scenario === "workflow") await mkdir(join(root, ".github/workflows"), { recursive: true });
      await writeFile(join(root, path), "changed\n");
    }
    // Preserve a staged mode change on Windows, where the filesystem has no
    // executable bit. Other fixtures stage the actual working-tree change.
    if (scenario !== "mode") git("add", ".");
    git("commit", "--quiet", "--allow-empty", "-m", "change");
    git("checkout", "--quiet", "-b", "candidate", base);
    git("merge", "--quiet", "--no-ff", "change", "-m", "candidate");
    const input = { root, event: "pull_request", base };
    assert.equal(documentationOnly(input), scenario === "instructions", scenario);
    assert.equal(documentationOnly({ ...input, event: "workflow_dispatch" }), false);
    assert.equal(documentationOnly({ ...input, base: "f".repeat(40) }), false);
    if (scenario === "instructions") {
      // A head commit is not the tested merge candidate, and missing base
      // identity can never authorize lighter qualification.
      assert.equal(documentationOnly({ ...input, base: undefined }), false);
      git("checkout", "--quiet", "change");
      assert.equal(documentationOnly(input), false);
    }
  }
} finally {
  await rm(fixture, { recursive: true, force: true });
}
console.log(
  "Documentation qualification: exact merge parent and regular UTF-8 instruction edits only; all meaningful or ambiguous changes require full CI.",
);
