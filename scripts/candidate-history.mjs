// Discovery chooses bounded run IDs only. GitHubEvidence authenticates every
// manifest/worker/check before any of these results can supply proof.
export function candidateRunIds(environment, api) {
  const env = environment,
    ids = [],
    fallback = [];
  if (/^[a-f0-9]{40}$/.test(env.VILLAGES_CI_HEAD ?? "")) {
    let head = env.VILLAGES_CI_HEAD;
    if (env.GITHUB_EVENT_NAME === "push") {
      const commit = api("git/commits/" + head);
      if (commit.parents?.length === 2) head = commit.parents[1].sha;
    }
    const checks = api("commits/" + head + "/check-runs?per_page=100").check_runs;
    const gate = checks.find(
      (check) =>
        check.name === "package-parity" &&
        check.status === "completed" &&
        ["success", "failure"].includes(check.conclusion),
    );
    const id = gate?.details_url?.match(/\/actions\/runs\/(\d+)/)?.[1];
    if (id && String(id) !== String(env.GITHUB_RUN_ID)) ids.push(id);
  }
  if (env.GITHUB_HEAD_REF) {
    const runs = api(
      "actions/workflows/ci.yml/runs?event=pull_request&branch=" +
        encodeURIComponent(env.GITHUB_HEAD_REF) +
        "&per_page=10",
    ).workflow_runs;
    const earlier = runs.filter((run) => String(run.id) !== String(env.GITHUB_RUN_ID) && run.status === "completed");
    // Pending workflow replacement creates cancelled attempts with no artifacts.
    // Prefer completed success/failure, then try bounded cancelled fallbacks.
    const useful = earlier.filter((run) => ["success", "failure"].includes(run.conclusion));
    const cancelled = earlier.filter((run) => run.conclusion === "cancelled");
    if (useful.length) ids.push(useful[0].id);
    fallback.push(...useful.slice(1).map((run) => run.id), ...cancelled.map((run) => run.id));
  }
  if (/^[a-f0-9]{40}$/.test(env.VILLAGES_CI_BASE ?? "")) {
    const checks = api("commits/" + env.VILLAGES_CI_BASE + "/check-runs?per_page=100").check_runs;
    const gate = checks.find((check) => check.name === "package-parity" && check.conclusion === "success");
    const id = gate?.details_url?.match(/\/actions\/runs\/(\d+)/)?.[1];
    if (id) ids.push(id);
    else {
      // A protected merge can be usable before its push workflow completes.
      // Its PR head supplies discovery only; coverage still authenticates it.
      const commit = api("git/commits/" + env.VILLAGES_CI_BASE);
      const parent = commit.parents?.length === 2 ? commit.parents[1].sha : null;
      if (/^[a-f0-9]{40}$/.test(parent ?? "")) {
        const parentChecks = api("commits/" + parent + "/check-runs?per_page=100").check_runs;
        const parentGate = parentChecks.find(
          (check) => check.name === "package-parity" && check.status === "completed" && check.conclusion === "success",
        );
        const parentId = parentGate?.details_url?.match(/\/actions\/runs\/(\d+)/)?.[1];
        if (parentId) ids.push(parentId);
      }
    }
  }
  if (!ids.length) {
    const branch = env.GITHUB_BASE_REF || env.GITHUB_REF_NAME || "staging";
    const run = api("actions/workflows/ci.yml/runs?branch=" + encodeURIComponent(branch) + "&status=success&per_page=1")
      .workflow_runs[0];
    if (run && String(run.id) !== String(env.GITHUB_RUN_ID)) ids.push(run.id);
  }
  return [...new Set([...ids, ...fallback].map(String))]
    .filter((id) => /^[1-9]\d*$/.test(id) && id !== String(env.GITHUB_RUN_ID))
    .slice(0, 8);
}
