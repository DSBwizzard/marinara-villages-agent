# Pinned Engine public declarations

The spinoff proof of concept additionally captures the type-only public `packages/shared/src/types/scene.ts` module as `types/scene.d.ts`, byte-for-byte from the same revision `bcc50689fd3885cc4ce7884f25cb2296f8fe400e`. It contains declarations only and requires Capability API 1.66. Its exact source/output SHA-256 and exported roots are recorded in `pin.json` under `supplementalFiles`; `check:engine-types` verifies it with the base closure. Base-closure regeneration preserves the separately captured module. To reproduce it, fetch that exact public file, preserve UTF-8/LF bytes and compare the recorded hash. No Engine source modification, runtime build, or test-runtime repin is involved.

The public declaration closure is derived from Marinara Engine **2.5.0**, capability API **1.14**, at exact merged PR #7369 revision `bcc50689fd3885cc4ce7884f25cb2296f8fe400e`. Source: https://github.com/Pasta-Devs/Marinara-Engine. Upstream AGPL-3.0 licensing is retained. Ordinary builds never refresh these files.

`pin.json` records the full upstream declaration input hashes and retained closure hashes. The source archive for the exact revision was read in temporary task storage. TypeScript 5.9.3 emitted declarations only from `packages/shared/src/types/capability-runtime.ts` and its dependencies, with `rootDir=packages/shared/src`, `target=ESNext`, `module=ESNext`, `moduleResolution=Bundler`, `declaration=true`, `emitDeclarationOnly=true`, and `skipLibCheck=true`. No Engine runtime build or source modification was performed.

Reproduce the closure from that full declaration output:

```sh
node scripts/engine-public-declarations.mjs --refresh --from <full-declaration-directory> --revision bcc50689fd3885cc4ce7884f25cb2296f8fe400e --engine-version 2.5.0 --capability-api 1.14
node scripts/engine-public-declarations.mjs --check --from <full-declaration-directory>
npm run check:engine-types
```

The independent `privileged-access.json` fixture retains its own recorded revision/hash. It contains only the public admin-access key and refusal hint and was not recaptured for Decisions. `sources/package-shared.ts` exposes public declarations only; Villages has no private Engine runtime dependencies.

