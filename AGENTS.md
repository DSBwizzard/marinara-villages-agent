# Villages coding guidance

- Villages source is under packages/villages/src/engine. Read DEVELOPMENT.md for the build commands and packages/villages/README.md for product behavior.
- Regenerate bundles, manifests, and checksums with the documented builder; do not hand-edit generated output.
- The build uses the source snapshot under sources/engine and overlays Villages source. Changes to a package's Engine dependencies must remain within its documented compatibility and capability API boundaries.
