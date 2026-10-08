# Villages coding guidance

- Villages source is under `packages/villages/src`: client entry/shell/features/shared, server entry/features/domain/adapters/jobs, and shared contracts/helpers. Read DEVELOPMENT.md for repository-owned commands and packages/villages/README.md for product behavior.
- Regenerate bundles, manifests, and checksums with the documented builder; do not hand-edit generated output.
- Normal builds use locked repository dependencies and pinned public declarations under `sources/engine-public`; they never copy or overwrite Engine source. Preserve provenance, license and documented API compatibility. The Decisions private adapter remains an explicit, identity-checked exception with fallback.
- Client code cannot import server implementation or private saved models. Shared contracts contain approved client-visible data. Domain rules cannot access storage, Engine, providers or timers. Connectors cannot call feature coordinators; feature coordination owns the work and depends on explicit services.
- Keep feature state alive for its intended draft, reading-position and pending-operation lifetime. Scene and snapshot authority stay on the server. Preserve request identities, revision checks, retry semantics and delayed-work fences.
- Local development and CI use `npm run check`, the test inventory, `npm run validate` and `npm run verify:build`. Identify mocked and Engine-dependent coverage accurately. Independent review is required for substantial architecture, saved data, privacy, recovery/concurrency or model-spending changes.
- Make focused atomic commits. Separate mechanical moves from behavior changes; explain the current behavior, proposed behavior, benefit and compatibility/cost impact before changing it. Commit maintained source, definitions, tests and documentation; generated output stays ignored.
- Versions identify deliberate releases, not each edit or staging commit. Distinguish staging builds and review iterations by source revision/content hash and archive hash. Freeze published package bytes; bump once for the next numbered release.
- Keep personal workflow tooling, reports, credentials, environments and machine-specific instructions outside product commits. Read any applicable local override. This repository does not authorize Engine source changes, upstream submission, publication or everyday restarts.

## Scene continuity and access

- Venue is the place. Zones are dedicated spaces within a Venue, including Exterior, Common Space, and Private Space. A Scene is the active chat in one Venue and continues across Zone movement until it ends.
- Capture attendance, Zone positions, immediate activities, and scene time across the Venue when a Scene starts. Background agenda changes and resident movement must not mutate the active Scene. Only evidenced movement or departures within the Scene change its positions.
- Preserve Zone-specific witnesses and keep unseen Zone attendance server-only. Use current schedules when starting a new Scene. Preserve persisted identifiers and route compatibility when changing terminology.
