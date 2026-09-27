const { GH_TOKEN, PR_NUMBER, REPOSITORY } = process.env;

if (!GH_TOKEN || !PR_NUMBER || !REPOSITORY) {
  throw new Error("GH_TOKEN, PR_NUMBER, and REPOSITORY are required");
}

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GH_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const repo = `/repos/${REPOSITORY}`;
const current = await github(`${repo}/pulls/${PR_NUMBER}`);
import { execFileSync } from "node:child_process";

const baseSha = execFileSync("git", ["rev-parse", "origin/staging"], { encoding: "utf8" }).trim();

if (current.base.ref !== "staging") {
  console.log("Skipping parallel-work checks: pull request does not target staging.");
  process.exit(0);
}

const mergeBase = execFileSync("git", ["merge-base", baseSha, current.head.sha], { encoding: "utf8" }).trim();
if (mergeBase !== baseSha) {
  throw new Error("This branch is behind origin/staging. Rebase onto the latest staging and push again.");
}

async function paginated(path) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const batch = await github(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

const [currentFiles, openPulls] = await Promise.all([
  paginated(`${repo}/pulls/${PR_NUMBER}/files`),
  paginated(`${repo}/pulls?state=open&base=staging`),
]);
const currentPaths = new Set(currentFiles.map((file) => file.filename));
const conflicts = [];

for (const pull of openPulls) {
  if (pull.number === current.number || pull.head.repo?.full_name !== REPOSITORY) continue;
  const otherFiles = await paginated(`${repo}/pulls/${pull.number}/files`);
  for (const file of otherFiles) {
    if (currentPaths.has(file.filename)) {
      conflicts.push({ path: file.filename, number: pull.number, title: pull.title });
    }
  }
}

if (conflicts.length) {
  console.error("These paths are also changed by other open Villages PRs:");
  for (const conflict of conflicts) {
    console.error(`- ${conflict.path} (PR #${conflict.number}: ${conflict.title})`);
  }
  throw new Error("Review overlapping changes together and rebase after integrating the related PR.");
}

console.log("Branch is based on current staging and has no changed-file overlap with other open Villages PRs.");
