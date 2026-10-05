# Villages coding guidance

- Villages source is under packages/villages/src/engine. Read DEVELOPMENT.md for the build commands and packages/villages/README.md for product behavior.
- Regenerate bundles, manifests, and checksums with the documented builder; do not hand-edit generated output.
- The build uses the source snapshot under sources/engine and overlays Villages source. Changes to a package's Engine dependencies must remain within its documented compatibility and capability API boundaries.

## Scene continuity and access

- Venue is the place. Zones are dedicated spaces within a Venue, including Exterior, Common Space, and Private Space. A Scene is the active chat in one Venue and continues across Zone movement until it ends.
- Capture attendance, Zone positions, immediate activities, and scene time across the Venue when a Scene starts. Background agenda changes and resident movement must not mutate the active Scene. Only evidenced movement or departures within the Scene change its positions.
- Preserve Zone-specific witnesses and keep unseen Zone attendance server-only. Use current schedules when starting a new Scene. Preserve persisted identifiers and route compatibility when changing terminology.
