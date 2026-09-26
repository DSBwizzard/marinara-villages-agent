# Villages workspace instructions

- Keep work focused on Villages and the shared files required to build or validate Villages.
- The user handles all Git operations. Do not initialize or modify Git, create or switch branches, stage, commit, push, fetch, open pull requests, or change remotes.
- Do not modify or track the preserved source workspace under `marinara-villages/`.
- Preserve package-generated files through the documented build command; do not hand-edit bundles, manifests, or checksums.
- Read `DEVELOPMENT.md` and `packages/villages/README.md` for setup, package, and coding guidance.

## Intended development and release workflow

- Keep Git history reviewable: make each change on a short-lived feature branch based on `staging`, then integrate it into `staging` through a focused pull request.
- Treat `staging` as the integration and local validation line, and `main` as the production-ready line. Promote reviewed staging work to `main` through a separate pull request so production promotion has its own review record.
- For local Marinara validation, use the documented Villages build and sideload flow. Sideloading is the intended way to inspect the running package locally; it does not publish the package or require changes to the Engine Git repository.
- Follow the documented package build/versioning process. Do not hand-edit generated package output or publish this Villages-only checkout's catalog as a replacement for the official multi-agent catalog.
- If a requested workflow appears to bypass the feature-branch → staging PR → local build/sideload validation → staging-to-main PR path, remind the user of this preference and explain the consequence before proceeding. The user still owns all Git operations; never perform Git operations on their behalf.


