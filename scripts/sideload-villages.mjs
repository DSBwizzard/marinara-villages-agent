import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [engineRootArgument, archiveArgument, packageId] = process.argv.slice(2);

if (!engineRootArgument || !archiveArgument || !packageId) {
  throw new Error("Usage: node scripts/sideload-villages.mjs <engine-root> <archive.zip> <package-id>");
}

const engineRoot = resolve(engineRootArgument);
const archivePath = resolve(archiveArgument);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePackage = join(repositoryRoot, "packages", packageId);
const packageRoot = join(engineRoot, "packages/server/data/capability-packages");
const installedPath = join(packageRoot, "installed.json");

if (!existsSync(archivePath)) throw new Error(`Missing archive: ${archivePath}`);
if (!existsSync(sourcePackage)) throw new Error(`Missing package output: ${sourcePackage}`);
if (!existsSync(installedPath)) throw new Error(`Missing package registry: ${installedPath}`);

const sourceManifest = JSON.parse(await readFile(join(sourcePackage, "manifest.json"), "utf8"));
if (sourceManifest.id !== packageId) throw new Error(`Expected ${packageId} manifest`);

const installed = JSON.parse(await readFile(installedPath, "utf8"));
const packageIndex = installed.packages.findIndex((entry) => entry.id === packageId);
if (packageIndex < 0) throw new Error(`No installed ${packageId} package record`);

const previous = installed.packages[packageIndex];
const versionRoot = join(packageRoot, "versions", packageId);
const destination = join(versionRoot, sourceManifest.version);
await mkdir(versionRoot, { recursive: true });
await rm(destination, { recursive: true, force: true });
await cp(sourcePackage, destination, { recursive: true, force: true });

for (const declaration of sourceManifest.files) {
  const filePath = join(destination, declaration.path);
  const content = await readFile(filePath);
  const actualHash = createHash("sha256").update(content).digest("hex");
  const actualBytes = (await stat(filePath)).size;
  if (actualHash !== declaration.sha256 || actualBytes !== declaration.bytes) {
    throw new Error(`Manifest mismatch after staging: ${declaration.path}`);
  }
}

const backupPath = `${installedPath}.bak-before${sourceManifest.version}`;
if (!existsSync(backupPath)) await writeFile(backupPath, await readFile(installedPath));
installed.packages[packageIndex] = {
  ...previous,
  version: sourceManifest.version,
  manifest: sourceManifest,
  status: "active",
  readiness: "pending",
  previousVersion: previous.version === sourceManifest.version ? previous.previousVersion : previous.version,
};
await writeFile(installedPath, `${JSON.stringify(installed, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      packageId,
      archive: archivePath,
      previousVersion: previous.version === sourceManifest.version ? previous.previousVersion : previous.version,
      version: sourceManifest.version,
      readiness: "pending",
      files: sourceManifest.files.length,
      backupPath,
    },
    null,
    2,
  ),
);
