import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";
import { portablePackagePath } from "./verify-package.mjs";

/** Verify the service digest before extracting the declared build inputs. */
export async function unpackCiPackage(artifact, bytes, directory) {
  assert.match(artifact.digest ?? "", /^sha256:[a-f0-9]{64}$/);
  assert.equal(
    "sha256:" + createHash("sha256").update(bytes).digest("hex"),
    artifact.digest,
    "CI artifact digest mismatch",
  );
  const entries = new AdmZip(bytes).getEntries();
  const files = entries.filter((entry) => !entry.isDirectory);
  assert.equal(files.length, 2, "Expected archive and build receipt");
  const names = new Set();
  for (const entry of entries) {
    const name = entry.entryName.replace(/\/$/, "");
    assert.ok(portablePackagePath(name), "Unsafe CI artifact path");
    assert.ok(((entry.header.attr >>> 16) & 0xf000) !== 0xa000, "CI artifact links are forbidden");
    assert.ok(!names.has(name.toLowerCase()), "Duplicate CI artifact path");
    names.add(name.toLowerCase());
    if (!entry.isDirectory)
      assert.ok(
        name === ".build-tmp/package-build.json" || /^artifacts\/villages-[0-9]+\.[0-9]+\.[0-9]+\.zip$/.test(name),
        "Unexpected CI artifact member",
      );
  }
  assert.ok(files.reduce((total, entry) => total + entry.header.size, 0) <= 100 * 1024 * 1024, "Oversized CI artifact");
  await mkdir(directory);
  for (const entry of files) {
    const target = join(directory, entry.entryName);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, entry.getData(), { flag: "wx" });
  }
}

export async function downloadCiPackages({ repository, runId, token, directory, request = fetch }) {
  assert.match(repository ?? "", /^[\w.-]+\/[\w.-]+$/);
  assert.match(String(runId ?? ""), /^\d+$/);
  assert.ok(token, "A read-only Actions token is required");
  const api = async (path) => {
    const response = await request("https://api.github.com/repos/" + repository + "/actions/" + path, {
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    assert.ok(response.ok, "GitHub artifact request failed: " + response.status);
    return response;
  };
  const { artifacts, total_count: count } = await (await api("runs/" + runId + "/artifacts?per_page=100")).json();
  assert.ok(count <= 100, "Unexpected artifact inventory; refusing an incomplete page");
  await mkdir(dirname(directory), { recursive: true });
  await mkdir(directory);
  for (const name of ["villages-linux", "villages-windows"]) {
    const matches = artifacts.filter((entry) => entry.name === name && !entry.expired);
    assert.equal(matches.length, 1, "Expected one current " + name + " artifact");
    const artifact = matches[0];
    const bytes = Buffer.from(await (await api("artifacts/" + artifact.id + "/zip")).arrayBuffer());
    await unpackCiPackage(artifact, bytes, join(directory, name));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await downloadCiPackages({
    repository: process.env.GITHUB_REPOSITORY,
    runId: process.env.GITHUB_RUN_ID,
    token: process.env.GH_TOKEN,
    directory: ".build-tmp/platforms",
  });
