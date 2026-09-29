import { readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const [target, mode, ...extra] = process.argv.slice(2);
if (!target || (mode && mode !== "--apply") || extra.length) {
  throw new Error("Usage: node scripts/apply-villages-studio-host-patch.mjs <local Engine directory> [--apply]");
}
const engine = realpathSync(resolve(target));
const metadata = JSON.parse(readFileSync(join(engine, "package.json"), "utf8"));
if (metadata.name !== "marinara-engine") throw new Error("The target is not a Marinara Engine checkout.");
const patch = resolve(dirname(fileURLToPath(import.meta.url)), "../host-patches/sprite-studio.patch");
function git(args) {
  const result = spawnSync("git", ["-C", engine, "apply", ...args, patch], { encoding: "utf8", windowsHide: true });
  if (result.error) throw result.error;
  return result;
}
if (git(["--reverse", "--check"]).status === 0) {
  console.log("Sprite Studio host patch is already applied. No files changed.");
} else {
  const check = git(["--check"]);
  if (check.status !== 0)
    throw new Error("The host patch cannot be applied cleanly. No files changed.\n" + check.stderr);
  if (mode === "--apply") {
    const applied = git([]);
    if (applied.status !== 0) throw new Error(applied.stderr || "Host patch application failed.");
    console.log(
      "Applied Sprite Studio support to the local Engine only. Run its checks/build before use; restart it yourself.",
    );
  } else {
    console.log("The host patch applies cleanly. No files changed. Use --apply to install locally.");
  }
}
