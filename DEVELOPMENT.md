# Building Villages

This repository contains Villages source, its package definition, and the commands used by both local development and CI. Villages builds as a self-contained optional Marinara package.

## Build

Requires Node.js 24 or newer. A normal build uses this repository's locked dependencies and pinned public Engine declarations. It needs no Engine installation and never updates an Engine checkout or captured source:

```powershell
npm ci
npm run build
npm run verify:package
```

`packages/villages/package-definition.mjs` owns the package identity, version, entry points, permissions, and contributions. `packages/villages/src` owns editable code. `sources/engine-public/PROVENANCE.md` identifies the pinned public declarations and small compatibility fixture. Decisions uses `api.runtime.decisions.evaluate()` introduced by Engine PR #7369. Engine 2.5.0 is the minimum; earlier 2.5.0 builds without the capability use System. `engine-boundary.json` contains no private runtime imports.

## Find and check a change

Client features own their screens, state and actions under `src/client/features`. The shell owns navigation and composition. Server features coordinate requests under `src/server/features`; rules and saved models belong in `src/server/domain`, host/storage/model connections in `src/server/adapters`, and background work in `src/server/jobs`. Shared contracts and calculations belong in `src/shared`. Keep private world and Scene records server-only.

For a focused development check:

```powershell
npm run check:changed
npm test -- --filter=venue-access
```

`check` covers formatting, lint, maintained-code compiler checking, pinned declaration integrity, architectural imports and runtime cycles. It rejects client imports of server code, impure domain dependencies, and connector calls back into feature coordinators. Client and server features collaborate only through the named contracts in [feature-interfaces.mjs](scripts/feature-interfaces.mjs); other modules and exports remain private. Entry assembles factories, the client shell connects its feature implementations, and modules within one feature may use their own implementation. Shared client support cannot import features or shell assembly; features cannot import the shell. Types, aliases, reexports and delayed imports obey the same boundaries. Add public contracts deliberately after reviewing their ownership and effects. An empty test selection fails. Focused checks support iteration; they do not establish complete candidate readiness.

During feedback, a clearly labeled preview may use static checks and explicit affected regression/browser selections plus relevant packaged acceptance. Shared helpers require coverage of affected consumers; unknown impact requires broader validation.

CI validates the current candidate through `npm run validate:ci`. Schema-3 evidence fingerprints each static check, build, package/reproducibility check and test independently using bundler dependencies, declared fixture reads, helpers, locked dependencies and the pinned Node/runner/platform environment. Dynamic or unknown dependencies conservatively include the broader maintained input set. Feature/test/helper edits invalidate consumers; version-only metadata edits preserve behavior evidence that does not read that metadata. A policy/toolchain change establishes a new trust baseline. `coverageComplete` means every check required by the recorded validation profile has verified passing evidence; `executedAllTests` separately records execution in this attempt. Failed, skipped, stale, changed-input and foreign CI results never satisfy coverage. Local tests remain feedback; authenticated CI is the reusable release authority.

Staging PRs and staging pushes use the `staging` profile: complete Linux behavior coverage, Windows static/build/package/reproducibility, all Node/process/filesystem suites, and the explicit rendering cohort in `scripts/ci-platform-policy.json`. Directly changed and new/unknown browser suites always run on Windows. Platform-sensitive infrastructure, fixture, browser-runtime and global-style changes broaden to the complete Windows inventory; unknown integration history also broadens. The explicit deferred Windows scenarios still run on Linux. This reduces duplicate browser work during iteration, with the tradeoff that a Windows-specific defect outside the retained cohort may be discovered during qualification.

PRs targeting main, main pushes, explicit `--fresh`, and manual full mode use `qualification`, requiring the complete Linux and Windows inventories. Passing checks can be reused across profiles, but omitted Windows checks must be obtained before qualification. Release preparation reconstructs canonical membership from current source; a staging manifest, a changed profile label, identical package bytes or a `ready` flag cannot satisfy release qualification. Explicit fresh/full execution ignores prior proof. Protected `validate`, `validate-windows`, `package-parity` and current-base requirements remain in force.

When a complete local or release check is explicitly required:

```sh
npm run validate
npm run verify:build
```

`validate` runs the same check/build/package verification and provider-free regression/browser inventory as CI. Browser scenarios use mocked APIs and synthetic artwork. `verify:build` builds twice, compares archive hashes and verifies that tracked source bytes remain unchanged. Generated bundles, manifests, locales and ZIPs are ignored; commit source, definitions, relevant tests and documentation.

```sh
npm run test:inventory
npm test
npm run test:browser
npm run test:engine
```

The inventory accounts for every regression and browser scenario. Engine tests are explicitly separate: the image compatibility test requires `MARINARA_ENGINE_ROOT` for read-only source, Decisions transport requires a compatible existing built runtime and synthetic local provider, and the shell test needs `VILLAGES_ENGINE_URL` pointing to an isolated running Engine. They do not authorize Engine source changes, rebuilds or everyday restarts. Mocked tests complement actual packaged activation, persistence, Scene privacy, recovery and desktop/mobile verification.

## Fast feedback and measured coverage

Use npm run test:impact -- --file=<repository-relative-path> to inspect local selection, CI invalidation and unresolved-input reasons without running tests. Multiple --file options model a batch. The diagnostic does not grant coverage or release readiness.

CI and local evidence validity use scripts/check-inputs.mjs. Known acoustic prompt/interpretation edits use the attention, sound and privacy feedback suites; mixed/unknown paths retain ordinary selection. Ordinary feedback uses the cheaper owner/literal view in test-dependencies.mjs; it selects useful checks without claiming complete consumer coverage or granting reusable CI proof. Literal imports, file reads and supported inline bundles follow actual compiler inputs. Dynamic loaders/read paths remain conservative. scripts/test-inputs.json declares reviewed runtime-data scopes, paired with the normalized source SHA256 of the specific reader. A source change without a fresh review automatically falls back to broader coverage; never refresh hashes mechanically to silence a warning. Directory scopes include new/deleted maintained inputs. Imported helpers are inspected separately, while declared raw-data dependencies are fingerprinted rather than executed by the analyzer.

Tests report start/completion, wall time, worker limits and the slowest suites. Measure changed-code workflows as well as unchanged promotion: small style changes, focused behavior fixes, test-only corrections, shared contracts, cold baselines and prepared promotion. Request-to-preview, request-to-staging and publication times are separate. Include unexpected preparation and queueing; never present a warm verification rehearsal as an actual publication measurement. Timing targets guide optimization rather than creating flaky wall-clock assertions on shared runners.

For repeated focused local feedback, add `--reuse` to the test runner. It stores successful whole-suite results under `.build-tmp/feedback-proof` and reuses only identical complete input graphs, reviewed per-reader scope declarations, Node/platform, cases and relevant browser/test environment. Failed, skipped, interrupted or changed-input runs cannot populate it. Screenshot/visual requests execute again. CI rejects this option and continues to require authenticated evidence. Per-reader declaration edits invalidate that reader's consumers; unknown readers retain broad invalidation. Browser suites use the lockfile-pinned Playwright Chromium, avoiding machine-dependent system Chrome. Install it with `npx playwright install chromium` for local browser work.

The runner writes `progress.jsonl` and `first-failure.json` immediately inside each test report directory. CI publishes the first failure while collecting the remaining diagnostics. Same-PR CI corrections keep earlier work running to completion so its authenticated proof can be reused; a newer head can consequently queue behind that work. Measure correction latency including that queue rather than reporting only the last job duration.

Optimize actual tests as well as evidence reuse: state-only harnesses use one width, layout tests retain desktop/phone, and process-local/owned-temp suites can run concurrently. Unknown suites remain exclusive until inspected. Broad runtime contracts may still rerun several infrastructure suites per edit; do not weaken unknown-loader handling merely to lower a count.

## Keeping the architecture healthy

Identify the user-visible outcome and affected owner/Engine contract. Routine reversible edits need no design ceremony. Start with the smallest change that fits those owners. If the request appears to require a dependency outside an existing feature contract, duplicated host service, new private Engine import, data-policy change or broad restructuring, explain the concrete tradeoff and discuss the approach before expanding implementation. Follow the engineering discussion guidance in [AGENTS.md](AGENTS.md); conventions are revisable, but changes to them need a reason and appropriate validation.

During review, check these points:

- Ownership and dependencies remain explicit; client-visible projections expose only permitted data, and asynchronous work respects its activation and operation lifetime.
- New interfaces or layers have an evidenced purpose. Superseded paths are removed within scope, rather than leaving two ways to implement the same behavior.
- A maintainer can find the behavior and diagnose its failures. Important tradeoffs and changed contracts are documented close to their maintained guidance, without creating a permanent log of routine implementation decisions.
- Tests protect observable behavior and relevant failures, with accurate coverage limitations. A rising test count or line count alone does not demonstrate improvement. Fix unreliable fixtures or excessive test grouping without dropping assertions or weakening gates.
- Git history and the PR stay focused on one outcome. Integration changes are reviewed and revalidated; required checks, publication authorization, immutable released bytes and separate staging/main decisions remain intact.

Small cleanup belongs with the feature it affects. Larger refactors require a demonstrated problem, bounded scope and an agreed outcome; they are not a routine prerequisite for new features. For post-0.7.0 work, discuss saved-data compatibility whenever a change affects existing worlds. The fresh-world decision for 0.7.0 does not silently authorize future data loss or require speculative migration machinery for every edit.

## Package identities and releases

Each build writes working outputs under `packages/villages/` and `artifacts/villages-<version>.zip`. It retains archive bytes at `artifacts/<version>/<source-content-hash>/<archive-sha256>.zip`, with a build receipt alongside them and the latest receipt at `.build-tmp/package-build.json`. Receipts identify source revision, exact input hashes and archive bytes. Use those identities when reviewing or installing a staging build; version equality alone does not identify the build.

Staging integrates reviewed source changes. A merge, tiny edit, local commit or rebuild does not itself consume a release number. Choose one new version when deliberately releasing a batch; retain it through unpublished review iterations. Published numbered archives remain immutable. A later separately numbered release gets a new version. Merged staging packages may retain a release number for personal installation when their revision/hash, validation and rollback copies are recorded.

The architecture baseline is numbered 0.7.0 and starts with fresh worlds. The [migration ledger](docs/architecture-migration.md) records the starting baseline, completed work and validation scope. Keep changes focused and atomic; separate code movement from behavior corrections. Explain any change to saving, privacy, recovery, concurrency or model spending and obtain independent technical review.

Installing a package uses the host's supported package mechanism and a validated ZIP, rather than copying a source tree into Engine. Computer-specific review environments, approval gates and installation helpers live in local workflow instructions outside this repository. Loading a changed server package requires a restart; follow that environment's explicit restart authorization. This repository does not publish a replacement for the official multi-agent catalog or plan upstream submission.

## Engine image style profiles

Villages reads the user's synced image style settings over the Engine HTTP API and normalizes them with the running Engine's public `@marinara-engine/shared` export. That public export also compiles background prompts before Villages submits its exact image override. The audited loader resolves the import entry declared by the Engine shared package manifest from the existing built server/shared package layout; it never bundles Engine implementations or loads private image modules. Illustrator is not required. Unsupported public exports report an actionable failure; saved custom descriptions and uploads remain usable.

New villages follow Engine's default profile; explicit choices store only the profile ID, and existing descriptions remain custom. The catalog exposes only profile names/IDs and the default ID. Authored source prompts retain their 4000-character limit; normalized profile compilation has a separate 16000-character final positive/negative limit checked before provider dispatch. Map and Venue framing stays under Villages' control. The read-only image Engine contract test now also requires the selected Engine's existing built shared export.

## Test iteration and diagnostics

The runner defaults to four total workers and two browser workers. Use --jobs=1 for a serial comparison or --browser-jobs=1 to reduce pressure. Maintained resource ownership permits isolated tests to overlap even after edits; unknown suites stay exclusive. Local runs stop after the first failure; CI keeps going for diagnostics. Unexecuted tests never count as passing. Reports record exact coverage, outcomes and wall time. A per-checkout lock prevents overlapping builders/runners; inspect interrupted owners before recovery.

Use `node scripts/select-tests.mjs` for affected owners/consumers and `node scripts/run-tests.mjs browser --case=settings/package` for a named scenario. Settings, Venue layout and Scene action scenarios expose cases in the inventory. Real layout checks retain desktop/mobile coverage; state-only fixtures run once per StrictMode variant. Source tooling can be refreshed on an idle clean managed task with `node scripts/task-tooling.mjs --apply`; it uses normal Git integration and preserves uncommitted work. Private preview orchestration remains outside product Git.

## Release a validated candidate

Staging/main PRs for the same head serialize each platform job before a runner is allocated. The next job consumes the first job's evidence when inputs match. Different maintained inputs and missing qualification checks still require their own coverage. Per-PR workflow concurrency retains earlier running work so corrections can reuse its passing checks; a newer head may queue behind that work.

Development PRs validate the combined candidate. CI stores a compact `villages-coverage` manifest and an immutable `villages-candidate` artifact containing the exact reproducible package and both platform build receipts. Preparation uses at most two indexed manifests instead of scanning artifact history. A cached Windows check requires its original Windows environment, but a fully covered Windows receipt can be verified on a Linux runner without executing Windows checks. Same-head workers refresh proof after serialization to avoid repeating an earlier job's work.

Do focused local diagnosis and use CI for the complete integration run. Do not run a duplicate full local inventory while CI validates the same candidate. Keep applicable pinned, provider-free Engine acceptance as separate package evidence.

Use the maintained release command from the frozen candidate checkout with Node matching CI:

```sh
node scripts/release.mjs --version 0.7.3 --candidate <full-commit> --staging-pr <number> --main-pr <number> --wait
```

The command records elapsed time from invocation, including any unexpected preparation, under `.build-tmp/releases/`. It waits without model polling and prints state changes. Failed checks require diagnosis. Missing/expired candidate proof automatically dispatches preparation; `--wait` waits for it. Preparation can take longer than the under-five-minute warm release target, and incomplete evidence never permits publication. Choose the intended version and complete candidate CI and applicable pinned Engine acceptance during development. `node scripts/prepare-release.mjs --run=<CI-run>` authenticates coverage and restores exact prepared bytes without rebuilding. Environment-specific Engine acceptance stays in the private guarded workflow.

Rehearse the entire verification path with `--dry-run --acceptance <verification.json>`; this never merges, tags or creates a release. Measure a ready candidate before claiming the under-five-minute target. Promotion reuses static/build/reproducibility and gameplay proof and publishes the same verified bytes. Source revision may advance while identical build inputs/bytes retain their original build provenance.\n\nAfter explicit authorization for staging/main merges, add `--merge --acceptance <verification.json>`. The command verifies both platform receipts, exact archive bytes and matching successful pinned Engine package acceptance before merging staging, then main. Branch protections and matching-head checks remain enforced.

Numbered publication additionally requires `--publish --notes <release-notes.md>`. It creates a draft, uploads the verified archive, checks its GitHub digest, publishes, and verifies the immutable tag/asset identity. Existing different bytes or tags are rejected. Repeating the same command verifies remote state and skips completed mutations. The published checkpoint contains the next patch target for workflow bookkeeping; it does not modify private review worlds or machine-specific release coordination.

A per-candidate operation lock rejects concurrent invocations. After an interrupted process, inspect its recorded PID and checkpoint before recovering a stale lock; never remove a live process's lock.

## Contribution boundary

Follow [upstream-contribution.md](docs/upstream-contribution.md) for the official Marinara Agents engineering and submission expectations. Local source-only commits and upstream generated catalog commits are deliberately different workflows.

For a normal staging-to-main promotion, open the main PR with head staging and run the maintained release command with --candidate <exact-staging-SHA> and --main-pr <number>, omitting --staging-pr. It verifies the live staging identity before promotion. A moved staging branch requires a newly frozen validated candidate. The older two-PR form remains available for an explicitly authorized frozen release batch; ordinary feature work should integrate into staging first. Merge/publish flags retain their authorization requirements.

Browser cases write per-case durations and pass/fail diagnostics alongside existing coverage reports. Settings hook/request ownership, Venue mutations and Venue requests run as independently scheduled suites; founding desktop, phone and compact layouts retain every existing viewport in separate suites. Sprite screenshots are opt-in through VILLAGES_SCREENSHOT_DIR; pixel, layout and behavior assertions always run. Use the maintained runner (node scripts/run-tests.mjs review --test=<suite>) so TypeScript imports use the locked tsx loader.

Browser runtime caches are warmed on staging when package-lock.json or the cache workflow changes. PRs can restore the base-branch cache; PR-created caches remain isolated to that PR. The browser-runtime workflow can be dispatched on staging after cache eviction. Its runner, cache path/key and locked dependencies match CI. Cached binaries optimize setup only; required validation and fresh Linux system dependencies remain independent.
