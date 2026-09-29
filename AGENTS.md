# Villages workspace instructions

## Standing scope restriction

- Work on code only in DSBwizzard's `marinara-villages-agent` repository unless the user gives explicit, task-specific permission for another location. Read-only inspection outside Villages is allowed when needed.
- Never modify, patch, update, build, sideload into, launch, stop, or restart the user's local Marinara Engine installation or Engine checkouts without explicit, task-specific permission. A Villages plan, prior implementation, or general staging workflow does not grant that permission.
- Never push, open pull requests, merge, or publish anything to a Marinara Engine GitHub repository. GitHub code changes for Villages belong only in DSBwizzard's Villages repository.
- Apply this restriction to every task, including bug fixes, validation, staging, and release steps. Ask for explicit permission before any action that would write outside the Villages repository.

- Keep work focused on Villages and files within this repository required to build or validate Villages.
- Codex may perform Git operations for requested Villages work: create/switch branches, stage, commit, push, and create/update pull requests. Never change remotes or GitHub repository settings without the user's explicit request.
- On this Windows workspace, ordinary Codex processes may report a Git "dubious ownership" error even though the user configured the exact repository as a global `safe.directory`. When Git commands fail for this reason, retry them with elevated access; do not treat the normal-process failure as a blocker. The exact repository path is `C:\Users\dsbwi\Desktop\marinara-villages-agent`. Never change ownership or use `safe.directory '*'`.
- GitHub CLI is installed at `C:\Program Files\GitHub CLI\gh.exe` but may not be available on `PATH`. If `gh` is not resolved, invoke that exact executable before concluding GitHub CLI is unavailable. If it cannot read `%APPDATA%\GitHub CLI\config.yml` in the sandbox, retry it with elevated access rather than switching to browser automation.
- Do not modify or track the preserved source workspace under `marinara-villages/`.
- Preserve package-generated files through the documented build command; do not hand-edit bundles, manifests, or checksums.
- Read `DEVELOPMENT.md` and `packages/villages/README.md` for setup, package, and coding guidance.

## Development and staging workflow

- **Parallel Codex work:** every independently requested task must use its own managed Git worktree and short-lived `codex/` feature branch. Do not switch branches, reset, stash, or clean another thread's checkout. Before starting, fetch `origin/staging` and create the branch from that base. Name branches for the task. If managed worktrees are unavailable, create a separate checkout; never share one mutable checkout across simultaneous threads.
- Start each task from an up-to-date `staging` base on a short-lived `codex/` feature branch. Keep commits focused and atomic, with clear imperative messages. Do not bundle unrelated changes.
- **Integrating concurrent tasks:** before opening/updating a PR, fetch current `origin/staging`, rebase the task branch onto it, inspect the full diff, and run applicable checks. Each task gets its own PR to `staging`. The parallel-work CI check reports paths also changed by other open Villages PRs; resolve overlaps and rebase after another PR merges. Do not automatically merge or sideload a feature branch.
- Before publishing a branch, inspect the full diff and run the applicable checks. Push the branch and open a focused pull request targeting `staging`; never push task changes directly to `staging` or `main`.
- Enable GitHub auto-merge on the PR when repository rules permit it. Merge only after required CI checks pass and required reviews/approvals are satisfied. If auto-merge is unavailable or blocked, leave the PR ready and report the exact blocker; do not bypass protections.
- For package changes, increment the Villages package version on the feature branch before opening the PR, following `DEVELOPMENT.md`. After the PR is merged to `staging`, update the local Villages checkout to the merged `staging` revision, run `npm run check` and the documented Villages package build. Do not sideload into the Marinara Engine installation without explicit, task-specific permission.
- When the user explicitly authorizes a sideload, do it only after build and checks pass. Report the installed version and remind the user that Marinara Engine must restart to load the server package. Do not restart or stop the Engine unless explicitly asked.
- Treat `staging` as integration and local validation; promote reviewed staging work to `main` only through a separate PR. Do not auto-promote to `main` as part of ordinary task completion.
- Follow the documented package build/versioning process. Do not hand-edit generated package output or publish this Villages-only checkout's catalog as a replacement for the official multi-agent catalog.
- For large or risky changes, retain the same PR-to-staging flow but split implementation into multiple focused commits or PRs when that materially improves reviewability. Keep each branch scoped to one coherent outcome.
- If a required credential, remote, branch protection rule, CI check, Engine path, or permission is unavailable, complete the safe local work and report the concrete setup blocker. Never bypass repository protections or use another person's credentials.
