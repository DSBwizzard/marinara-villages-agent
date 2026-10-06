import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import AdmZip from "adm-zip";
import { villagesDefinition } from "../packages/villages/package-definition.mjs";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export function portablePackagePath(path) {
  return (
    typeof path === "string" &&
    path.length > 0 &&
    // eslint-disable-next-line no-control-regex -- package names must reject control bytes
    !/[\\:*?"<>|\u0000-\u001f]/.test(path) &&
    path
      .split("/")
      .every(
        (part) =>
          part &&
          part !== "." &&
          part !== ".." &&
          !/[. ]$/.test(part) &&
          !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part),
      )
  );
}
export async function verifyPackage(root, archivePath) {
  const packageRoot = join(root, "packages/villages");
  const manifestBytes = await readFile(join(packageRoot, "manifest.json"));
  const manifest = JSON.parse(manifestBytes);
  if (
    manifest.id !== "villages" ||
    !/^\d+\.\d+\.\d+$/.test(manifest.version) ||
    manifest.version !== villagesDefinition.version
  )
    throw new Error("Unexpected package identity/version");
  if (
    manifest.schemaVersion !== 2 ||
    !isDeepStrictEqual(manifest.capabilityApi, villagesDefinition.capabilityApi) ||
    !isDeepStrictEqual(manifest.entrypoints, villagesDefinition.entrypoints) ||
    manifest.engine?.min !== villagesDefinition.minEngineVersion ||
    manifest.engine?.maxExclusive !== villagesDefinition.maxEngineExclusive
  )
    throw new Error("Unexpected package contract");
  if (
    !isDeepStrictEqual(manifest.contributions, villagesDefinition.contributions) ||
    !isDeepStrictEqual(manifest.permissions, villagesDefinition.permissions)
  )
    throw new Error("Permissions/contributions differ from the authoritative definition");
  const archive = await readFile(archivePath ?? join(root, "artifacts", `villages-${manifest.version}.zip`));
  if (archive.length > 100 * 1024 * 1024) throw new Error("Oversized package archive");
  const entries = new AdmZip(archive).getEntries();
  if (entries.length > 1000 || !Array.isArray(manifest.files) || !manifest.files.length)
    throw new Error("Invalid package file inventory");
  const members = new Map();
  let expandedBytes = 0;
  for (const entry of entries) {
    expandedBytes += entry.header.size;
    if (expandedBytes > 100 * 1024 * 1024) throw new Error("Oversized expanded package");
    const name = entry.entryName;
    const key = name.toLocaleLowerCase("en-US");
    if (
      !portablePackagePath(name) ||
      entry.isDirectory ||
      members.has(key) ||
      ((entry.header.attr >>> 16) & 0xf000) === 0xa000 ||
      entry.header.size > 50 * 1024 * 1024
    )
      throw new Error(`Unsafe/duplicate archive member: ${name}`);
    members.set(key, { path: name, bytes: entry.getData() });
  }
  const expected = new Set(["manifest.json"]);
  const foldedPaths = new Set(expected);
  const declaredPayloads = [...Object.values(villagesDefinition.entrypoints), ...villagesDefinition.assetPaths];
  const archivedManifest = members.get("manifest.json");
  if (archivedManifest?.path !== "manifest.json" || !archivedManifest.bytes.equals(manifestBytes))
    throw new Error("Archive manifest differs from the built manifest");
  for (const file of manifest.files ?? []) {
    if (!portablePackagePath(file.path) || foldedPaths.has(file.path.toLowerCase()))
      throw new Error(`Invalid declared path: ${file.path}`);
    if (!declaredPayloads.includes(file.path))
      throw new Error("Package inventory differs from the authoritative definition");
    foldedPaths.add(file.path.toLowerCase());
    expected.add(file.path);
    const bytes = await readFile(join(packageRoot, file.path));
    const archived = members.get(file.path.toLowerCase());
    if (
      !Number.isSafeInteger(file.bytes) ||
      file.bytes !== bytes.length ||
      file.sha256 !== hash(bytes) ||
      archived?.path !== file.path ||
      !archived.bytes.equals(bytes)
    )
      throw new Error(`Package bytes do not match: ${file.path}`);
  }
  for (const path of Object.values(manifest.entrypoints ?? {}))
    if (!expected.has(path)) throw new Error(`Undeclared entrypoint: ${path}`);
  if (expected.size !== declaredPayloads.length + 1 || declaredPayloads.some((path) => !expected.has(path)))
    throw new Error("Package inventory differs from the authoritative definition");
  if (members.size !== expected.size || [...members.values()].some((entry) => !expected.has(entry.path)))
    throw new Error("Archive contains undeclared members");
  return { version: manifest.version, sha256: hash(archive), files: manifest.files.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  console.log(JSON.stringify(await verifyPackage(root, process.argv[2]), null, 2));
}
