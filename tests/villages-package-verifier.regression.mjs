import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import AdmZip from "adm-zip";
import { villagesDefinition as definition } from "../packages/villages/package-definition.mjs";
import { portablePackagePath, verifyPackage } from "../scripts/verify-package.mjs";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const root = await mkdtemp(join(tmpdir(), "villages-package-verifier-"));
const packageRoot = join(root, "packages/villages");
await mkdir(packageRoot, { recursive: true });
const payloads = [...Object.values(definition.entrypoints), ...definition.assetPaths].map((name) => [
  name,
  Buffer.from(`Synthetic fixture for ${name}`),
]);
const base = {
  schemaVersion: 2,
  id: definition.id,
  version: definition.version,
  capabilityApi: definition.capabilityApi,
  engine: { min: definition.minEngineVersion, maxExclusive: definition.maxEngineExclusive },
  entrypoints: definition.entrypoints,
  permissions: definition.permissions,
  contributions: definition.contributions,
  files: payloads.map(([path, bytes]) => ({ path, bytes: bytes.length, sha256: hash(bytes) })),
};
for (const [name, bytes] of payloads) await writeFile(join(packageRoot, name), bytes);
async function fixture(changeManifest = () => {}, changeArchive = () => {}) {
  const manifest = structuredClone(base);
  changeManifest(manifest);
  const bytes = Buffer.from(JSON.stringify(manifest));
  await writeFile(join(packageRoot, "manifest.json"), bytes);
  const zip = new AdmZip();
  zip.addFile("manifest.json", bytes);
  for (const [name, data] of payloads) zip.addFile(name, data);
  changeArchive(zip);
  const archive = join(root, "fixture.zip");
  await writeFile(archive, zip.toBuffer());
  return () => verifyPackage(root, archive);
}
try {
  const valid = await fixture();
  assert.equal((await valid()).files, payloads.length);
  const reordered = await fixture((m) => {
    m.capabilityApi = Object.fromEntries(Object.entries(m.capabilityApi).reverse());
    m.entrypoints = Object.fromEntries(Object.entries(m.entrypoints).reverse());
  });
  assert.equal((await reordered()).files, payloads.length);
  for (const name of ["../escape", "/absolute", "C:/drive", "folder\\escape", "CON.txt", "folder./x", "x ", "x\u0000"])
    assert.equal(portablePackagePath(name), false, name);
  assert.equal(portablePackagePath("assets/picture.png"), true);
  await assert.rejects(await fixture((m) => (m.id = "other")), /identity/);
  await assert.rejects(await fixture((m) => (m.version = "0.0.1")), /identity/);
  await assert.rejects(await fixture((m) => (m.entrypoints = {})), /contract/);
  await assert.rejects(await fixture((m) => (m.entrypoints.server = "client.js")), /contract/);
  await assert.rejects(await fixture((m) => (m.engine.min = "0.0.1")), /contract/);
  await assert.rejects(await fixture((m) => m.permissions.push("undeclared")), /Permissions/);
  await assert.rejects(await fixture((m) => (m.files[0].path = "../escape")), /declared path/);
  await assert.rejects(await fixture((m) => m.files.push({ ...m.files[0], path: "AGENTS.JSON" })), /declared path/);
  await assert.rejects(await fixture((m) => (m.files[0].bytes += 1)), /bytes do not match/);
  await assert.rejects(await fixture((m) => (m.files[0].sha256 = "0".repeat(64))), /bytes do not match/);
  await assert.rejects(await fixture((m) => (m.files[0].path = "AGENTS.JSON")), /inventory differs/);
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => {
        const bytes = zip.readFile("client.js");
        zip.deleteFile("client.js");
        zip.addFile("CLIENT.JS", bytes);
      },
    ),
    /bytes do not match/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => {
        const bytes = zip.readFile("manifest.json");
        zip.deleteFile("manifest.json");
        zip.addFile("MANIFEST.JSON", bytes);
      },
    ),
    /manifest differs/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => zip.addFile("CLIENT.JS", Buffer.from("duplicate")),
    ),
    /duplicate/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => zip.addFile("CON.txt", Buffer.from("reserved")),
    ),
    /Unsafe/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => zip.addFile("folder/", Buffer.alloc(0)),
    ),
    /Unsafe/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => {
        zip.addFile("linked", Buffer.from("target"));
        zip.getEntry("linked").header.attr = ((0xa000 | 0o777) << 16) >>> 0;
      },
    ),
    /Unsafe/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => zip.addFile("private.txt", Buffer.from("extra")),
    ),
    /undeclared/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => zip.deleteFile("client.js"),
    ),
    /bytes do not match/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => zip.updateFile("server.mjs", Buffer.from("different")),
    ),
    /bytes do not match/,
  );
  await assert.rejects(
    await fixture(
      () => {},
      (zip) => zip.updateFile("manifest.json", Buffer.from("{}")),
    ),
    /manifest differs/,
  );
  await assert.rejects(
    await fixture(
      (m) => m.files.pop(),
      (zip) => zip.deleteFile(definition.assetPaths.at(-1)),
    ),
    /inventory differs/,
  );
  console.log(
    "Package verifier regression: complete identity, payload contract and hostile/corrupt ZIPs passed (synthetic fixtures).",
  );
} finally {
  await cleanupFixture();
}

async function cleanupFixture() {
  const target = resolve(root);
  if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith("villages-package-verifier-"))
    throw new Error("Refuse cleanup outside this test's temporary directory");
  await rm(target, { recursive: true, force: true });
}
