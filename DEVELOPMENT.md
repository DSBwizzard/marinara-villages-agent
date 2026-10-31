# Developing Villages

Use Node 24 with Corepack (CI pins Node 24.21.0 with npm 11.19.0). The checked-in [Villages Codex environment](.codex/environments/environment.toml) selects the npm version from `packageManager` before locked installation and creates npm shims in that worktree’s ignored `node_modules/.bin` so nested scripts use it too. Select this environment for new worktrees; rerun its setup after dependency changes or removing `node_modules`. Run the npm commands below as `corepack npm` in local Codex shells. Global Node/npm installations are unchanged; strict version and install-script checks remain enabled. Maintained source is in `packages/villages/src`; package identity, version, permissions and entry points are in `packages/villages/package-definition.mjs`. [AGENTS.md](AGENTS.md) owns development principles.

## Ordinary work

When inspecting a deployed environment, verify its installed package identity and deployed revision against its deployment records before using matching source for analysis. Report the identity and any mismatch or unverifiable correspondence. A branch, checkout, preview or version number alone does not establish what is deployed. Use read-only inspection and preserve runtime and saved-data boundaries.

Before any audit, review, investigation or implementation that depends on current staging, run `git fetch origin staging` and require success, then record the verified revision with `git rev-parse --verify origin/staging`. For read-only work, inspect that commit (for example, `git show <commit>:<path>`) rather than assuming a checkout is current, and identify the inspected commit when reporting findings. If fetching fails, explicitly report that staging freshness could not be verified and do not present cached code as current.

1. Assess PR boundaries under AGENTS.md before substantial implementation and revisit them when scope grows. For each cohesive change, create an owned worktree from verified `origin/staging` and set up its dependencies. Confirm `HEAD` matches that revision, then create a unique `codex/...` branch before editing. Implement, test and review in the owned worktree, and reuse it for feedback.
2. Implement the smallest coherent change. Run `npm run check:changed` and explicit affected tests, for example `npm test -- --filter=venue-access` or `npm run test:browser -- --case=settings/package`. Empty and unknown selections fail.
3. Build with `npm run build` and verify with `npm run verify:package` when package inputs or build behavior change, or a package is needed for a preview. Removing an unused helper or editing instructions needs the affected static checks and regressions; runtime, saved-state and layout tests apply when those behaviors change. Open a PR to staging as soon as the change is reviewable, with a concise description of the final behavior and relevant validation. Let CI run while preparing any required preview.
4. Present significant new behavior in an independent working preview and obtain acceptance of that package before merging. Routine corrections follow the standing authorization in AGENTS.md. CI validates the combined merge candidate. Resolve failures and conflicts, then merge after required checks and any applicable acceptance. Use a final summary for the merge commit rather than a list of intermediate commit titles. Main promotion is a separate explicit decision.
5. Confirm the PR is merged and the review targets the owned checkout before reporting source delivery. Complete each independent change without waiting for other work in the request. Report deployment separately, including any deferral; verify the installed package before claiming deployment. Release and housekeeping remain separate outcomes.

### Staging turns

Use the GitHub PR label `staging-turn` to coordinate final validation and merging across sessions. This is an advisory convention; the strict current-base ruleset and required checks remain the final merge safeguards.

- Development, review and preliminary CI can proceed in parallel. Before taking a turn, inspect all open staging PRs for the label and enabled auto-merge. Wait while another turn or competing auto-merge is active; do not initiate a competing merge or enable auto-merge. Only a PR ready for final validation and merging may claim the label.
- Add the label to the chosen PR, then recheck all open staging PRs before updating the branch or merging. If simultaneous claims produce multiple labels, the lowest PR number keeps its claim; all other claimants remove theirs and wait. Recheck immediately before merging, and stop if ownership is unclear or staging has moved. Update to current staging and obtain all required checks on the current candidate before merging. Never bypass protection.
- Remove the label promptly after merge or when checks fail, changes are needed, the PR is blocked, or preview acceptance is pending. Do not hold a turn while waiting for review or acceptance. A closed PR does not own a turn.
- To recover a stale turn, inspect the labeled PR, its checks and recent activity. If it is clearly closed, blocked, failed or abandoned, remove the label and proceed; if active ownership is uncertain, leave it in place and ask the user to resolve it. Do not interrupt or message another session to recover a turn.

On resume inspect the owned checkout and PR, and read current tracked guidance before edits. Preserve other branches and unrelated work when updating checkouts. Do not interrupt or move another task without explicit user authorization.

Task scratch files belong in `.build-tmp/`; generated conversation assets belong in ignored `output/`. Technical review is proportional to risk as described in AGENTS.md. Routine copy/layout corrections need no separate preview acceptance; significant new behavior does.

Worktree archival is separate housekeeping. Preserve active, unknown and unrelated dirty checkouts.

## Commands and coverage

```sh
npm run audit:dependencies # fail on low-or-higher dependency advisories
npm run check             # format, lint, types, Engine declarations, architecture
npm run check:changed     # affected static checks; optional --base=<ref> or --file=<path>
npm test -- --filter=name # explicit regression feedback
npm run test:browser      # provider-free browser tests
npm run test:inventory    # all suites and available cases
npm run validate          # full static + two builds + package + regression/browser inventory
```

Install the locked Chromium runtime locally with `npx playwright install chromium`. CI runs full static/build/regression validation on Linux and Windows without browser provisioning, plus the complete browser inventory split into two fixed partitions per OS (`--shard=1/2`, `--shard=2/2`). Linux browser jobs use the official Playwright Noble image pinned by version and digest, with its preinstalled browsers at `/ms-playwright`; update that pin together with the locked Playwright dependency. Windows browser jobs cache the locked Chromium runtime. Node is pinned and npm downloads are cached. Package parity waits for every partition. Required job names are `validate`, `validate-windows`, and `package-parity`. A new PR head cancels its superseded run. CI runs on PRs and manual dispatch. Protected current-base requirements apply.

Only regular UTF-8 edits to root `AGENTS.md` and `DEVELOPMENT.md` qualify for instruction-only CI. The exact PR merge parent must match the event base; missing history, mode changes, new/deleted/renamed files, other paths and manual dispatch use full CI. Existing job/check names remain successful, both platforms still install locked dependencies and build twice, and artifact receipts/package parity remain current. Product static checks and regression/browser execution are omitted only for that narrow path; no prior results are reused.

Manual workflow operations must explicitly select the intended ref, for example `gh workflow run ci.yml --ref staging` or an explicitly chosen task branch. Default `main` still contains older workflow machinery; do not rely on an implicit default ref.

Unexpected build warnings, test stderr, browser console warnings/errors and uncaught page exceptions fail validation. Deliberate negative browser responses use the shared fixture helper to allow at most one diagnostic for that exact URL and response; other messages fail. Full and filtered runs verify the completion of every declared selected case. Dependency install scripts require the reviewed package.json policy; new scripts fail installation.

The runner executes selected tests afresh. Focused local tests are feedback; passing CI describes the tested merge candidate. The runner defaults to four workers and up to two local browser workers. `--jobs=1`, `--browser-jobs=1`, `--keep-going` and `--fail-fast` control execution. Resource locks prevent unsafe overlap; unknown suites run exclusively. Logs, progress, first failure and coverage are under `.build-tmp/test-results`. Inspect the owner before recovering an interrupted checkout lock.

`npm run test:engine` is separate integration coverage. Its tests require an explicitly supplied compatible Engine root, existing built runtime or isolated Engine URL. They do not authorize Engine changes, builds, upgrades or personal installation operations. Mocked tests do not prove real-provider quality. Private Docker tooling verifies packaged activation, desktop/phone rendering, restart and persistence using disposable provider-free storage.

## Preview and saved data

Villages is an unreleased prototype without a public installer or official catalog entry. Test installation is arranged separately; historical tagged downloads are not the current prototype distribution.

The [social Wishes](docs/wishes.md) and [experimental spinoffs](docs/spinoffs.md) guides document their behavior and extension boundaries. Social Wishes replace the prior Wish/Pursuit implementations. The current build requires a fresh format-13 Village with immutable Memory pages; no conversion is provided.

During development, **DEBUG Settings → Advance Village time** advances the current instance by a chosen elapsed duration. The saved offset survives restart; days are 24 hours. It runs ordinary absence catch-up across Village mechanics, including any normally enabled model work, and preserves active Scene snapshots and held failures. Operational clocks and model settings remain unchanged. It is available in every development instance. Before admitting active playtesters, remove the `TimeControl.tsx` UI and `/clock/advance` route. Retain saved-offset compatibility so existing development worlds do not jump backwards; resetting the offset is not an undo operation. Checkpoint retained worlds before consequential time tests.

**DEBUG Settings → Verbose runtime logging** defaults Off and can print prompts, replies and private conversation context in the server terminal. It is separate from destructive debug controls. Keep logs private. Background leases renew every 30 seconds while visible; unsettled work may use scoped status reads, while settled views have no dedicated polling timer. The [generation lifecycle](docs/generation-pipeline.md), [Scene privacy](docs/scene-response-privacy.md), [response recovery](docs/scene-response-recovery.md) and [saved-state contracts](docs/architecture-migration.md#saved-work-and-compatibility) own request, evidence, persistence and compatibility details.

Sprite analysis sends temporary PNG copies capped at a 1024px longest edge without enlargement, with up to two requests in flight and an 800-token allowance per image. Originals and framing stay unchanged. Each completed proposal saves independently; cancellation stops new dispatches but an in-flight sibling may still be billed. The browser remembers the separately chosen vision connection; System and Image Captioning selections do not control it.

New previews copy selective setup and Villages data from a verified saved checkpoint into independent storage, without stopping the source environment. Existing preview progress is preserved on feedback. Package changes require the guarded installer and checkpoint/recovery protection. Deliberate paid gameplay and personal installation operations require separate authorization.

## Build and release

The builder owns generated bundles, manifests, locales and ZIPs. Commit maintained sources, tests and documentation. Locked dependencies and pinned public Engine declarations permit builds without an Engine checkout. `sources/engine-public/PROVENANCE.md` identifies those declarations. Engine 2.5.0 is the minimum; Decisions uses the public `api.runtime.decisions.evaluate()` capability when present and otherwise System.

`npm run verify:build` builds twice, compares archive hashes and checks that tracked source bytes are unchanged. The latest build receipt is `.build-tmp/package-build.json`; exact retained archives are under `artifacts/<version>/<source-content-hash>/<archive-sha256>.zip`. Version equality alone does not establish package identity.

For an explicitly authorized release:

1. Choose the deliberate release version once in the package definition. Do not bump it for each development edit. Preserve published numbered bytes.
2. Open the staging-to-main PR. Obtain all required checks for its current merge candidate. Record the successful Actions run URL, tested Git SHA/tree, package artifact and SHA256. Download the artifact from that successful run; verify its hash and the Linux/Windows parity job. If a merge changes executable source, validate the new candidate.
3. Rehearse the exact ZIP with guarded provider-free packaged verification and, when needed, a checkpointed copy of an existing world. Preserve rollback and review meaningful saved-data compatibility changes.
4. Obtain explicit authorization for main promotion and numbered publication. Publish the verified immutable artifact, not an unverified rebuild. Record the version, commit, run URL and archive hash in the normal release description.

Never substitute a local success, identical bytes alone, or stale PR approval for required current checks. No publication occurs merely because staging merged.

## Product contracts

Client features own screens/actions; the shell composes them. Server features coordinate requests, domain modules own rules and saved models, adapters own host I/O, and jobs own background work. Shared contracts/calculations remain explicit. `scripts/feature-interfaces.mjs` declares cross-feature contracts; architecture checks enforce client/server privacy and domain boundaries and reject missing literal relative imports in standalone scripts. These checks run through `check`, `check:changed` and CI. A new layer or interface needs a concrete purpose.

Saved-data changes must preserve existing worlds or explicitly explain the compatibility decision. The fresh-world 0.7.0 baseline is historical, not authorization for future loss. See [architecture and compatibility](docs/architecture-migration.md). Engine image styles use the public shared export and HTTP API; private Engine implementations are not bundled. Product details belong in `packages/villages/README.md` and relevant feature docs.

Keep process changes small: demonstrate the problem and net maintenance benefit, remove what they replace, and measure request-to-preview/staging time including queueing and interventions. Faster tests or more checks alone do not justify permanent machinery.
