import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { createHash } from "node:crypto";
const hashes = [];
for (const directory of process.argv.slice(2)) {
  const receipt = JSON.parse(await readFile(join(directory, ".build-tmp/package-build.json"), "utf8"));
  const bytes = await readFile(join(directory, "artifacts", basename(receipt.archivePath.replaceAll("\\", "/"))));
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(hash, receipt.sha256, "Artifact bytes must match their build receipt");
  hashes.push(hash);
}
assert.equal(hashes.length, 2, "Both platform artifacts are required");
assert.equal(hashes[0], hashes[1], "Linux and Windows packages must be identical");
console.log("Platform package parity:", hashes[0]);
