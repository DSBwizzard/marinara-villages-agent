import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  if (manifest.schemaVersion !== 2 || manifest.capabilityApi?.major !== 1 || manifest.capabilityApi?.minor !== 14)
    throw new Error("Unexpected package contract");
  if (
    JSON.stringify(manifest.contributions) !== JSON.stringify(villagesDefinition.contributions) ||
    JSON.stringify(manifest.permissions) !== JSON.stringify(villagesDefinition.permissions)
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
    members.set(key, entry.getData());
  }
  const expected = new Set(["manifest.json"]);
  if (!members.get("manifest.json")?.equals(manifestBytes))
    throw new Error("Archive manifest differs from the built manifest");
  for (const file of manifest.files ?? []) {
    if (!portablePackagePath(file.path) || expected.has(file.path.toLowerCase()))
      throw new Error(`Invalid declared path: ${file.path}`);
    expected.add(file.path.toLowerCase());
    const bytes = await readFile(join(packageRoot, file.path));
    if (
      !Number.isSafeInteger(file.bytes) ||
      file.bytes !== bytes.length ||
      file.sha256 !== hash(bytes) ||
      !members.get(file.path.toLowerCase())?.equals(bytes)
    )
      throw new Error(`Package bytes do not match: ${file.path}`);
  }
  for (const path of Object.values(manifest.entrypoints ?? {}))
    if (!expected.has(path)) throw new Error(`Undeclared entrypoint: ${path}`);
  if (members.size !== expected.size || [...members.keys()].some((name) => !expected.has(name)))
    throw new Error("Archive contains undeclared members");
  return { version: manifest.version, sha256: hash(archive), files: manifest.files.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  console.log(JSON.stringify(await verifyPackage(root, process.argv[2]), null, 2));
}
