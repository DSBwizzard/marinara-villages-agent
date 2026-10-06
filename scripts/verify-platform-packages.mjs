import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const packages = [];
for (const platform of ["validate", "validate-windows"]) {
  const root = join(".build-tmp/platforms", `villages-${platform}`);
  const receipt = JSON.parse(await readFile(join(root, ".build-tmp/package-build.json"), "utf8"));
  const bytes = await readFile(join(root, "artifacts", `villages-${receipt.version}.zip`));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), receipt.sha256);
  packages.push(receipt);
}
for (const field of ["version", "sourceRevision", "sourceDigest", "sha256"])
  assert.equal(packages[0][field], packages[1][field], `Windows and Linux must agree on ${field}`);
console.log(`Windows and Linux produced identical Villages ${packages[0].version} bytes: ${packages[0].sha256}`);
