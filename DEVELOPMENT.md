# Building Villages

This repository contains Villages source, its package definition, and the commands used by both local development and CI. Villages builds as a self-contained optional Marinara package.

## Build

Requires Node.js 24 or newer. A normal build uses this repository's locked dependencies and pinned public Engine declarations. It needs no Engine installation and never updates an Engine checkout or captured source:

```powershell
npm ci
npm run build
npm run verify:package
```

`packages/villages/package-definition.mjs` owns the package identity, version, entry points, permissions, and contributions. `packages/villages/src` owns editable code. `sources/engine-public/PROVENANCE.md` identifies the pinned public declarations and small compatibility fixture. Decisions has a separately documented private compatibility adapter in `engine-boundary.json`; unsupported runtime identities use its existing System fallback.

## Find and check a change

Client features own their screens, state and actions under `src/client/features`. The shell owns navigation and composition. Server features coordinate requests under `src/server/features`; rules and saved models belong in `src/server/domain`, host/storage/model connections in `src/server/adapters`, and background work in `src/server/jobs`. Shared contracts and calculations belong in `src/shared`. Keep private world and Scene records server-only.

For a focused development check:

```powershell
npm run check
npm test -- --filter=venue-access
```

`check` covers formatting, lint, maintained-code compiler checking, pinned declaration integrity, architectural imports and runtime cycles. It rejects client imports of server code, impure domain dependencies, and connector calls back into feature coordinators. An empty test selection fails. Focused checks support iteration; they do not establish complete candidate readiness.

Before presenting a complete candidate:

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

## Package identities and releases

Each build writes working outputs under `packages/villages/` and `artifacts/villages-<version>.zip`. It retains archive bytes at `artifacts/<version>/<source-content-hash>/<archive-sha256>.zip`, with a build receipt alongside them and the latest receipt at `.build-tmp/package-build.json`. Receipts identify source revision, exact input hashes and archive bytes. Use those identities when reviewing or installing a staging build; version equality alone does not identify the build.

Staging integrates reviewed source changes. A merge, tiny edit, local commit or rebuild does not itself consume a release number. Choose one new version when deliberately releasing a batch; retain it through unpublished review iterations. Published numbered archives remain immutable. A later separately numbered release gets a new version. Merged staging packages may retain a release number for personal installation when their revision/hash, validation and rollback copies are recorded.

The architecture milestone is planned as 0.7.0, after the migration and its acceptance checks are complete. The [migration ledger](docs/architecture-migration.md) records the starting baseline and remaining work. Keep changes focused and atomic; separate code movement from behavior corrections. Explain any change to saving, privacy, recovery, concurrency or model spending and obtain independent technical review.

Installing a package uses the host's supported package mechanism and a validated ZIP, rather than copying a source tree into Engine. Computer-specific review environments, approval gates and installation helpers live in local workflow instructions outside this repository. Loading a changed server package requires a restart; follow that environment's explicit restart authorization. This repository does not publish a replacement for the official multi-agent catalog or plan upstream submission.
