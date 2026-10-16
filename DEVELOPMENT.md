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

CI uses affected-owner and consumer tests for ordinary product changes through `npm run validate:ci`; it does not run the complete inventory for a small known change. Static checks, builds and package verification remain required. Documentation-only changes verify the package without browser setup. CI-only changes run the four pipeline/portability suites. Secondary CI runs portability suites and explicitly changed tests, broadening for platform-sensitive changes. Unknown impact, build/dependency/Engine-boundary changes, main promotion and explicit manual/full release validation run complete integration. Coverage receipts distinguish focused and complete results; focused results cannot establish full release readiness. PR validation and staging/main promotion reuse authenticated per-platform CI evidence when maintained inputs, Node/platform and package bytes match. A failure in another platform or suite does not discard successful suites. Known test-only edits rerun the edited suites and their dependency consumers; product, harness, dependency and workflow edits invalidate reuse. Full release coverage must originate in full-validation receipts and cover the entire current inventory. Every invocation performs fresh static/build/package checks; missing or mismatched proof runs the required tests. `--fresh` (or the manual workflow's `fresh` input) requests new execution. Receipts retain per-suite origins and distinguish complete, focused and failing coverage. Reproducibility may be reused only with matching inputs and archive bytes. Development pushes/draft PRs use focused checks under applicable local authorization.

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

## Keeping the architecture healthy

For each task, state the intended user-visible outcome and identify its feature owner, collaborators and relevant Engine contract. Start with the smallest change that fits those owners. If the request appears to require a dependency outside an existing feature contract, duplicated host service, new private Engine import, data-policy change or broad restructuring, explain the concrete tradeoff and discuss the approach before expanding implementation. Follow the engineering discussion guidance in [AGENTS.md](AGENTS.md); conventions are revisable, but changes to them need a reason and appropriate validation.

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

Staging/main PRs for the same head serialize each platform job before a runner is allocated. The next job consumes the first job's evidence when inputs match, rather than launching a duplicate full matrix. Different maintained inputs still require their own coverage. Per-PR workflow concurrency continues to cancel superseded commits.

Pipeline-only and documentation-only promotions to main retain their focused coverage. Product promotions to main, explicit `--release`, and manual full workflows still require complete integration.

Do focused local diagnosis and use CI for the complete integration run. Do not run a duplicate full local inventory while CI validates the same candidate. Keep applicable pinned, provider-free Engine acceptance as separate package evidence.

Use the maintained release command from the frozen candidate checkout with Node matching CI:

```sh
node scripts/release.mjs --version 0.7.3 --candidate <full-commit> --staging-pr <number> --main-pr <number> --wait
```

The default only reports readiness and records a local checkpoint under `.build-tmp/releases/`. The process waits without model polling and prints status changes. A failing check stops it; fix the failure, freeze the new candidate and resume with its identity. CI proves full coverage on main; promotion does not start another local full run.

After explicit authorization for staging/main merges, add `--merge --acceptance <verification.json>`. The command verifies both platform receipts, exact archive bytes and matching successful pinned Engine package acceptance before merging staging, then main. Branch protections and matching-head checks remain enforced.

Numbered publication additionally requires `--publish --notes <release-notes.md>`. It creates a draft, uploads the verified archive, checks its GitHub digest, publishes, and verifies the immutable tag/asset identity. Existing different bytes or tags are rejected. Repeating the same command verifies remote state and skips completed mutations. The published checkpoint contains the next patch target for workflow bookkeeping; it does not modify private review worlds or machine-specific release coordination.

A per-candidate operation lock rejects concurrent invocations. After an interrupted process, inspect its recorded PID and checkpoint before recovering a stale lock; never remove a live process's lock.
