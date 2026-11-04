import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const documentation = new Set(["AGENTS.md", "DEVELOPMENT.md", "README.md", "packages/villages/README.md"]);

// These prose paths are not runtime or package inputs. Missing Git
// history, a different merge base, mode changes and every other path run full CI.
export function documentationOnly({
  root = process.cwd(),
  event = process.env.GITHUB_EVENT_NAME,
  base = process.env.BASE_REVISION,
} = {}) {
  if (event !== "pull_request" || !/^[a-f0-9]{40}$/.test(base ?? "")) return false;
  try {
    const git = (...args) =>
      execFileSync("git", args, {
        cwd: root,
        encoding: "utf8",
        windowsHide: true,
        stdio: ["ignore", "pipe", "ignore"],
      });
    const candidate = git("rev-list", "--parents", "-n", "1", "HEAD").trim().split(/\s+/);
    if (candidate.length !== 3 || candidate[1] !== base) return false;
    const fields = git("diff", "--raw", "--no-abbrev", "--no-renames", "-z", base, "HEAD", "--").split("\0");
    if (fields.pop() !== "" || !fields.length || fields.length % 2) return false;
    for (let index = 0; index < fields.length; index += 2) {
      const path = fields[index + 1];
      if (
        !/^:100644 100644 [a-f0-9]{40} [a-f0-9]{40} M$/.test(fields[index]) ||
        (!documentation.has(path) && !/^docs\/[^/]+\.md$/.test(path))
      )
        return false;
      const bytes = readFileSync(join(root, path));
      if (bytes.includes(0)) return false;
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }
    return true;
  } catch {
    return false;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const only = documentationOnly();
  console.log(
    only
      ? "Documentation-only change: source qualification passed; no product build or tests required."
      : "Full CI qualification required.",
  );
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `only=${only}\n`);
}
