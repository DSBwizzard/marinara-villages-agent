import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, lstat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import AdmZip from "adm-zip";
import { fingerprint } from "./ci-checks.mjs";

/** Restore only verified package outputs. Tracked source and links are never overwritten. */
export async function restorePackage(root, bytes, receipt, snapshot) {
  assert.equal(fingerprint(bytes), receipt.sha256, "Cached package hash changed");
  assert.match(receipt.version, /^\d+\.\d+\.\d+$/);
  assert.match(receipt.sourceDigest, /^[a-f0-9]{64}$/);
  const zip = new AdmZip(bytes);
  const manifestEntry = zip.getEntry("manifest.json");
  assert.ok(manifestEntry, "Package manifest missing");
  const manifest = JSON.parse(manifestEntry.getData().toString("utf8"));
  assert.equal(manifest.version, receipt.version);
  const files = new Map(manifest.files.map((file) => [file.path, file.sha256]));
  assert.equal(files.size, manifest.files.length, "Duplicate package manifest paths");
  files.set("manifest.json", fingerprint(manifestEntry.getData()));
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory);
  assert.equal(new Set(entries.map((entry) => entry.entryName)).size, entries.length, "Duplicate package ZIP paths");
  assert.deepEqual(
    [...entries.map((entry) => entry.entryName)].sort(),
    [...files.keys()].sort(),
    "Package entries differ from manifest",
  );
  const tracked = new Map(snapshot.inputs.map((input) => [input.path, input.sha256]));
  const packageRoot = join(root, "packages/villages");
  for (const parent of [join(root, "packages"), packageRoot])
    assert.ok(!(await lstat(parent).catch(() => null))?.isSymbolicLink(), "Package root cannot be a link");
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const name = entry.entryName;
    assert.ok(
      name &&
        !/[:\\]/.test(name) &&
        !name.startsWith("/") &&
        name.split("/").every((part) => part && part !== "." && part !== ".."),
      "Unsafe package path",
    );
    assert.notEqual((entry.header.attr >>> 16) & 0xf000, 0xa000, "Package links forbidden");
    assert.equal(fingerprint(entry.getData()), files.get(name), "Unexpected package entry or hash");
    const target = resolve(packageRoot, name);
    assert.ok(!relative(packageRoot, target).startsWith(".."));
    let parent = packageRoot;
    for (const part of name.split("/")) {
      parent = join(parent, part);
      const state = await lstat(parent).catch((error) => {
        if (error.code === "ENOENT") return null;
        throw error;
      });
      assert.ok(!state?.isSymbolicLink(), "Package restore refuses links");
    }
    const sourcePath = "packages/villages/" + name;
    if (tracked.has(sourcePath))
      assert.equal(
        fingerprint(await readFile(target)),
        fingerprint(entry.getData()),
        "Cached package cannot overwrite tracked source",
      );
    else {
      await mkdir(resolve(target, ".."), { recursive: true });
      await writeFile(target, entry.getData());
    }
  }
  const archivePath = join(root, "artifacts", "villages-" + receipt.version + ".zip");
  const retainedArchivePath = join(root, "artifacts", receipt.version, receipt.sourceDigest, receipt.sha256 + ".zip");
  await mkdir(resolve(retainedArchivePath, ".."), { recursive: true });
  await writeFile(archivePath, bytes);
  await writeFile(retainedArchivePath, bytes);
  const local = { ...receipt, archivePath, retainedArchivePath };
  await mkdir(join(root, ".build-tmp"), { recursive: true });
  await writeFile(join(root, ".build-tmp/package-build.json"), JSON.stringify(local) + "\n");
  return local;
}
