import { execFileSync } from "node:child_process";
import { lstat, access } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
if (!/github\.com[:/]DSBwizzard\/marinara-villages-agent(?:\.git)?\s/i.test(git("remote", "-v")))
  throw Error("Tooling refresh is Villages-only");
const apply = process.argv.includes("--apply");
if (process.argv.slice(2).some((arg) => !["--check", "--apply"].includes(arg))) throw Error("Use --check or --apply");
const base = "origin/staging";
if (apply) {
  if (!(await lstat(resolve(root, ".git"))).isFile() || !git("branch", "--show-current").startsWith("codex/"))
    throw Error("Refresh requires the task-owned managed codex checkout");
  if (git("status", "--porcelain")) throw Error("Preserve uncommitted work; refresh only a clean task");
  for (const path of [".build-tmp/checkout-operation.lock", git("rev-parse", "--git-path", "MERGE_HEAD")]) {
    try {
      await access(resolve(root, path));
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    throw Error("Task has an active operation or merge; refresh after it completes");
  }
  git("fetch", "origin", "staging");
}
const behind = Number(git("rev-list", "--count", "HEAD.." + base));
if (apply && behind) git("merge", "--no-ff", "--no-edit", base);
console.log(
  JSON.stringify({
    branch: git("branch", "--show-current"),
    head: git("rev-parse", "HEAD"),
    behind: Number(git("rev-list", "--count", "HEAD.." + base)),
    refreshed: apply && behind > 0,
  }),
);
