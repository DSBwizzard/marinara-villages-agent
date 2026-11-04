import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { documentationOnly } from "../scripts/documentation-only.mjs";

const fixture = await mkdtemp(join(tmpdir(), "villages-documentation-"));
try {
  for (const scenario of [
    "instructions",
    "readmes",
    "guide",
    "mixed",
    "mixed-guide",
    "added-guide",
    "markdown-source",
    "deleted",
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
    // Mode cases use the index explicitly on every host, including Windows.
    git("config", "core.filemode", "false");
    await mkdir(join(root, "docs"));
    await mkdir(join(root, "packages/villages"), { recursive: true });
    for (const path of [
      "AGENTS.md",
      "DEVELOPMENT.md",
      "README.md",
      "UNVERIFIED.md",
      "packages/villages/README.md",
      "packages/villages/prompt.md",
      "docs/wishes.md",
      "source.mjs",
      "package.json",
    ])
      await writeFile(join(root, path), "baseline\n");
    git("add", ".");
    git("commit", "--quiet", "-m", "base");
    const base = git("rev-parse", "HEAD");
    git("checkout", "--quiet", "-b", "change");
    if (scenario === "instructions") {
      await writeFile(join(root, "AGENTS.md"), "updated principles\n");
      await writeFile(join(root, "DEVELOPMENT.md"), "updated commands\n");
    } else if (scenario === "readmes") {
      await writeFile(join(root, "README.md"), "updated overview\n");
      await writeFile(join(root, "packages/villages/README.md"), "updated player guide\n");
    } else if (scenario === "guide" || scenario === "mixed-guide") {
      await writeFile(join(root, "docs/wishes.md"), "updated guide\n");
      if (scenario === "mixed-guide") await writeFile(join(root, "source.mjs"), "changed\n");
    } else if (scenario === "mixed") {
      await writeFile(join(root, "AGENTS.md"), "updated principles\n");
      await writeFile(join(root, "source.mjs"), "changed\n");
    } else if (scenario === "deleted") git("rm", "AGENTS.md");
    else if (scenario === "rename") git("mv", "AGENTS.md", "OTHER.md");
    else if (scenario === "mode") git("update-index", "--chmod=+x", "AGENTS.md");
    else if (scenario === "binary") await writeFile(join(root, "AGENTS.md"), Buffer.from([0, 1, 2]));
    else if (scenario === "invalid-utf8") await writeFile(join(root, "AGENTS.md"), Buffer.from([0xff, 0xfe]));
    else if (scenario !== "empty") {
      const path = {
        product: "source.mjs",
        configuration: "package.json",
        workflow: ".github/workflows/ci.yml",
        unknown: "UNVERIFIED.md",
        "added-guide": "docs/new.md",
        "markdown-source": "packages/villages/prompt.md",
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
    const qualifies = ["instructions", "readmes", "guide"].includes(scenario);
    assert.equal(documentationOnly(input), qualifies, scenario);
    const output = join(root, "qualification-output");
    execFileSync(process.execPath, [fileURLToPath(new URL("../scripts/documentation-only.mjs", import.meta.url))], {
      cwd: root,
      env: { ...process.env, GITHUB_EVENT_NAME: "pull_request", BASE_REVISION: base, GITHUB_OUTPUT: output },
      windowsHide: true,
      stdio: "pipe",
    });
    assert.equal(await readFile(output, "utf8"), `only=${qualifies}\n`);
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
  "Documentation qualification: exact merge parent and regular UTF-8 edits to verified prose paths; mixed and ambiguous changes require full CI.",
);
