# Developing Villages

Use Node 24 and `npm ci`. Maintained source is in `packages/villages/src`; package identity, version, permissions and entry points are in `packages/villages/package-definition.mjs`. [AGENTS.md](AGENTS.md) owns development principles.

## Ordinary work

1. Use an owned branch/checkout from current `staging`. Reuse it for feedback and preserve unrelated work.
2. Implement the smallest coherent change. Run `npm run check:changed` and explicit affected tests, for example `npm test -- --filter=venue-access` or `npm run test:browser -- --case=settings/package`. Empty and unknown selections fail.
3. Build with `npm run build`; verify the archive with `npm run verify:package`. Present significant new behavior in an independent working preview. Obtain acceptance of that package before staging. Routine corrections follow the standing authorization in AGENTS.md.
4. Open a PR to staging. CI validates the combined merge candidate. Resolve failures and conflicts, then merge after required checks and any applicable acceptance. Main promotion is a separate explicit decision.

No task catalog, evidence receipt graph, automatic instruction refresh or custom release controller is required. Use normal Git and GitHub PR/check status. On resume inspect the checkout and PR; do not replay historical process instructions. Technical review is proportional to risk as described in AGENTS.md.

## Commands and coverage

```sh
npm run check             # format, lint, types, Engine declarations, architecture
npm run check:changed     # affected static checks; optional --base=<ref> or --file=<path>
npm test -- --filter=name # explicit regression feedback
npm run test:browser      # provider-free browser tests
npm run test:inventory    # all suites and available cases
npm run validate          # full static + two builds + package + regression/browser inventory
```

Install the locked Chromium runtime with `npx playwright install chromium`. CI runs full static/build/regression validation on Linux and Windows, plus the complete browser inventory split into two fixed partitions per OS (`--shard=1/2`, `--shard=2/2`). Package parity waits for every partition. This ordinary fixed matrix replaces a measured slow single-job baseline; it has no planner, dependency graph or passing-result reuse. Node is pinned; npm and browser binary caches remain. Required job names remain `validate`, `validate-windows`, and `package-parity`. A new PR head cancels its superseded run. CI runs on PRs and manual dispatch; merging does not automatically repeat the same full workload. Protected current-base requirements still apply.

There is no reuse of passing test results. Focused local tests are feedback; passing CI describes the tested merge candidate. The runner defaults to four workers and up to two local browser workers. `--jobs=1`, `--browser-jobs=1`, `--keep-going` and `--fail-fast` control execution. Resource locks prevent unsafe overlap; unknown suites run exclusively. Logs, progress, first failure and coverage are under `.build-tmp/test-results`. Inspect the owner before recovering an interrupted checkout lock.

`npm run test:engine` is separate integration coverage. Its tests require an explicitly supplied compatible Engine root, existing built runtime or isolated Engine URL. They do not authorize Engine changes, builds, upgrades or personal installation operations. Mocked tests do not prove real-provider quality. Private Docker tooling verifies packaged activation, desktop/phone rendering, restart and persistence using disposable provider-free storage.

## Preview and saved data

Machine-specific commands are in the private Docker runtime guide referenced by the global Villages pointer. New previews copy selective setup and Villages data from a verified saved staging checkpoint into independent storage, without stopping live staging. Existing preview progress is preserved on feedback. Package changes require the guarded installer and checkpoint/recovery protection. Deliberate paid gameplay and personal installation operations require separate authorization.

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

Client features own screens/actions; the shell composes them. Server features coordinate requests, domain modules own rules and saved models, adapters own host I/O, and jobs own background work. Shared contracts/calculations remain explicit. `scripts/feature-interfaces.mjs` declares cross-feature contracts; architecture checks enforce client/server privacy and domain boundaries. A new layer or interface needs a concrete purpose.

Saved-data changes must preserve existing worlds or explicitly explain the compatibility decision. The fresh-world 0.7.0 baseline is historical, not authorization for future loss. See `docs/architecture-migration.md`. Engine image styles use the public shared export and HTTP API; private Engine implementations are not bundled. Product details belong in `packages/villages/README.md` and relevant feature docs.

Keep process changes small: demonstrate the problem and net maintenance benefit, remove what they replace, and measure request-to-preview/staging time including queueing and interventions. Faster tests or more checks alone do not justify permanent machinery.
