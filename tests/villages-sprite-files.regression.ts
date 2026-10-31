import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { villageEngineJson } from "../packages/villages/src/server/adapters/engine/engine-transport.js";
import { createSpriteFileRemoval } from "../packages/villages/src/server/adapters/engine/sprite-file-removal.js";
import {
  readSpriteFileAllocation,
  retainedSpriteFiles,
  spriteFileId,
  spriteFileProcess,
} from "../packages/villages/src/server/adapters/storage/sprite-files.js";

const assetId = "villages-" + randomUUID(),
  name = "r-" + randomUUID().replaceAll("-", "");
const bytes = Buffer.from("exact sprite bytes");
const allocation = {
  format: 1 as const,
  assetId,
  expression: name,
  filename: name + ".png",
  sha256: createHash("sha256").update(bytes).digest("hex"),
  process: spriteFileProcess,
  ready: true,
  bytes: bytes.length,
};
const row = { id: spriteFileId(assetId, name), kind: "sprite-file", data: allocation };
assert.deepEqual(readSpriteFileAllocation(row), allocation);
assert.throws(() => readSpriteFileAllocation({ ...row, data: { ...allocation, assetId: "mara" } }), /allocation/);
assert.throws(
  () => readSpriteFileAllocation({ ...row, data: { ...allocation, filename: "another.png" } }),
  /allocation/,
);

function owner() {
  const asset = "villages-" + randomUUID(),
    rendered = "r-" + randomUUID().replaceAll("-", "");
  const manager = {
    version: 1,
    artwork: [
      {
        assetId: asset,
        source: { filename: "original.png", url: `/api/sprites/${asset}/file/original.png` },
        rendered: { filename: rendered + ".png", url: `/api/sprites/${asset}/file/${rendered}.png` },
      },
    ],
  };
  return {
    manager,
    world: { villagers: [{ spriteManager: manager }] },
    refs: [spriteFileId(asset, "original"), spriteFileId(asset, rendered)],
  };
}
const live = owner(),
  departure = owner(),
  social = owner(),
  mail = owner();
const world = {
  ...live.world,
  setting: `/api/sprites/${assetId}/file/${name}.png`,
  returnCatchup: { capture: { world: departure.world } },
  socialOutbox: [{ admitted: social.world }],
  socialMailOutbox: [{ input: { admitted: mail.world } }],
};
assert.deepEqual(retainedSpriteFiles("village", world), [
  ...live.refs,
  ...departure.refs,
  ...social.refs,
  ...mail.refs,
]);
assert.deepEqual(
  retainedSpriteFiles("sprite-setup", { manager: live.manager, assignments: [], useSprites: false }),
  live.refs,
);
assert.deepEqual(
  retainedSpriteFiles("venue-visit", {
    continuity: { facts: live.world },
    operation: { snapshot: { continuity: { facts: departure.world } } },
  }),
  [...live.refs, ...departure.refs],
);
for (const kind of ["background-work", "background-history"]) {
  assert.deepEqual(
    retainedSpriteFiles(kind, {
      kind: "personal-mail",
      input: { admitted: mail.world },
      replacement: { kind: "resident-planning", input: { admitted: social.world } },
    }),
    [...mail.refs, ...social.refs],
  );
  assert.deepEqual(
    retainedSpriteFiles(kind, { kind: "social-recovery", input: { entry: { admitted: social.world } } }),
    social.refs,
  );
}
assert.throws(() => retainedSpriteFiles("sprite-setup", {}), /missing/);
const broken = structuredClone(live.world);
broken.villagers[0].spriteManager.artwork[0].source.url = "unrelated";
assert.throws(() => retainedSpriteFiles("village", broken), /retained sprite file/);

for (const mode of ["valid", "tampered", "ambiguous", "bad-list", "unreadable", "partial", "corrupt", "lost-ack"]) {
  let present = true,
    deletes = 0,
    lost = mode === "lost-ack";
  const remove = createSpriteFileRemoval({
    async read() {
      if (!present) return new Response(null, { status: 404 });
      if (mode === "corrupt") return new Response(null, { status: 404 });
      if (mode === "unreadable") return new Response(null, { status: 503 });
      return new Response(mode === "tampered" || mode === "partial" ? Buffer.from("changed") : bytes);
    },
    async list<T>() {
      return (
        !present || mode === "bad-list"
          ? []
          : [{ filename: allocation.filename }, ...(mode === "ambiguous" ? [{ filename: name + ".jpeg" }] : [])]
      ) as T;
    },
    async remove(asset, expression) {
      assert.equal(asset, assetId);
      assert.equal(expression, name);
      if (!present) return;
      deletes++;
      present = false;
      if (lost) {
        lost = false;
        throw Error("Lost deletion acknowledgement");
      }
    },
  });
  const file = { ...allocation, ready: mode !== "partial" };
  if (["tampered", "ambiguous", "bad-list", "unreadable"].includes(mode)) {
    await assert.rejects(remove([file]));
    assert.equal(deletes, 0, "Inspection failure cannot authorize a physical deletion");
    assert(present);
  } else {
    if (mode === "lost-ack") await assert.rejects(remove([file]), /Lost deletion/);
    else await remove([file]);
    assert.equal(deletes, 1);
    await remove([file]);
    assert.equal(deletes, 1, "Reconciliation of an absent exact path never repeats deletion");
  }
}
for (const count of [500, 5000]) {
  const batch = Array.from({ length: count }, (_, index) => {
    const expression = "r-" + index.toString(16).padStart(32, "0");
    return { ...allocation, expression, filename: expression + ".png" };
  });
  let lists = 0,
    reads = 0,
    deletes = 0,
    readBytes = 0;
  await createSpriteFileRemoval({
    async list<T>() {
      lists++;
      return batch.map((file) => ({ filename: file.filename })) as T;
    },
    async read() {
      reads++;
      readBytes += bytes.length;
      return new Response(bytes);
    },
    async remove() {
      deletes++;
    },
  })(batch);
  assert.equal(lists, 1, "One cleanup sweep indexes each asset directory once");
  assert.equal(reads, count);
  assert.equal(deletes, count);
  assert.equal(readBytes, count * bytes.length);
  console.log(
    JSON.stringify({ spriteFiles: count, directoryReads: lists, fileReads: reads, fileBytes: readBytes, deletes }),
  );
}
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };
  await assert.rejects(
    villageEngineJson("/api/sprites/" + assetId),
    (error: any) => error.code === "engine_unavailable",
  );
  globalThis.fetch = async () => Response.json({ error: "Forbidden" }, { status: 403 });
  await assert.rejects(villageEngineJson("/api/sprites/" + assetId), (error: any) => error.code === undefined);
} finally {
  globalThis.fetch = originalFetch;
}
console.log(
  "Owned sprite files: strict typed owners, exact bytes, ambiguous paths, partial uploads and lost acknowledgements passed.",
);
