# Local Engine support for Sprite Studio

This directory belongs only to **DSBwizzard/marinara-villages-agent**. This patch is for the user's local Villages Builder installation, not an upstream Engine contribution or production release. Do not push, open a PR, or merge it into Pasta-Devs/Marinara-Engine.

`sprite-studio.patch` adds the public single-sheet planning, execution and recovery endpoints used by Villages 0.6.75. Provider credentials stay in the Engine. Other image callers retain their existing behavior. Base: Engine staging commit `338e066ae97784db6ae9c5f956cba1caf54f8a30` (2.4.6).

Check compatibility without changing the target:

```powershell
node scripts/apply-villages-studio-host-patch.mjs 'C:/path/to/local/Marinara-Engine'
```

After the Villages change has merged to this repository's staging and passed checks, apply locally:

```powershell
node scripts/apply-villages-studio-host-patch.mjs 'C:/path/to/local/Marinara-Engine' --apply
```

The helper checks the entire patch first. It never switches branches, changes remotes, pushes, or restarts the Engine. An already applied patch is a no-op; conflicts stop without partial application. Engine updates can replace these local changes, so recheck compatibility after updating.

Run the Engine's documented `pnpm check` and `node scripts/run-regressions.mjs --filter sprite-studio` before using the patched build. Then build and sideload Villages using DEVELOPMENT.md. Restart the local Engine yourself to load both changes. No upstream merge or production deployment is involved.

Without this patch, approved art and import/review/export remain available; generation reports the required Engine update. ComfyUI/RunPod connections need reference-image, width and height workflow placeholders. Unknown provider pricing and local workflow internals are shown as unavailable. No paid benchmark runs automatically.

The patch modifies Marinara Engine's AGPL-3.0 source. Preserve the source and license obligations when distributing a patched Engine.
