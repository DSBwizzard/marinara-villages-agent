# Pinned Engine public declarations

The public declaration closure comes from Marinara Engine **2.5.2**, Capability API **1.818**, at staging revision `27805040eed0d91d4ea7b49f478b0b197b13676d`. Source: https://github.com/Pasta-Devs/Marinara-Engine. Upstream AGPL-3.0 licensing is retained. Ordinary builds never refresh these files.

`sources/package-shared.ts` declares the public roots. The generator follows their public dependencies, including Scene origin types, into one closure. `pin.json` records exact upstream declaration input hashes, retained symbols and output hashes. There are no separately maintained supplemental declarations or private runtime dependencies.

To reproduce, export that exact Engine tree, install its frozen dependencies, and emit public declarations with its pinned TypeScript 6.0.3 (run from the exported Engine root):

```sh
node node_modules/typescript/bin/tsc --ignoreConfig --declaration --emitDeclarationOnly --skipLibCheck --target ESNext --module ESNext --moduleResolution Bundler --rootDir packages/shared/src --outDir <full-declaration-directory> packages/shared/src/types/capability-runtime.ts packages/shared/src/types/scene.ts
```

Then run from the Villages root:

```sh
node scripts/engine-public-declarations.mjs --refresh --from <full-declaration-directory> --revision 27805040eed0d91d4ea7b49f478b0b197b13676d --engine-version 2.5.2 --capability-api 1.818
node scripts/engine-public-declarations.mjs --check --from <full-declaration-directory>
corepack npm run check:engine-types
```

No generated declarations are patched by hand. The independent `privileged-access.json` fixture retains its own recorded revision/hash; it contains the public admin-access key and refusal hint.

