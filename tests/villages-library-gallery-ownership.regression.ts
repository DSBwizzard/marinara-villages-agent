import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import assert from "node:assert/strict";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { createGlobalGallery } from "../packages/villages/src/server/adapters/engine/global-gallery-service.js";
import {
  configureGlobalGallery,
  ensureVillagesGalleryFolder,
  uploadVillageGalleryImage,
} from "../packages/villages/src/server/adapters/engine/global-gallery.js";

function deferred() {
  return Promise.withResolvers<void>();
}
const host = () => ({
  persistence: { documents: villageFixtureDocuments({ getById: async () => null, list: async () => [] }) },
  isDebugAgentsEnabled: () => false,
});
function gallery(name: string) {
  let pause = false,
    fail = false,
    lookups = 0;
  const gate = deferred(),
    entered = deferred();
  const uploads: { path: string; form: FormData }[] = [];
  const service = createGlobalGallery({
    villageEngineJson: async <T>() => {
      lookups++;
      if (pause) {
        entered.resolve();
        await gate.promise;
      }
      if (fail) throw new Error(`${name} gallery unavailable`);
      return [{ id: `${name}-folder`, name: "Villages" }] as T;
    },
    villageEngineForm: async <T>(path: string, form: FormData) => {
      uploads.push({ path, form });
      return { id: `${name}-image`, url: `/gallery/${name}-image` } as T;
    },
  });
  return {
    service,
    uploads,
    gate,
    entered,
    lookups: () => lookups,
    pause: () => {
      pause = true;
    },
    fail: (value: boolean) => {
      fail = value;
    },
  };
}
const image = { bytes: new Uint8Array([1, 2, 3]), mime: "image/png", name: "../Picture", prompt: "fixture" };
async function galleryIsolation() {
  const a = gallery("A"),
    b = gallery("B");
  a.pause();
  const pending = a.service.ensureVillagesGalleryFolder();
  assert.equal(pending, a.service.ensureVillagesGalleryFolder(), "simultaneous lookups join the exact owned Promise");
  await a.entered.promise;
  try {
    const resultB = await b.service.uploadVillageGalleryImage(image);
    assert.equal(resultB.id, "B-image");
    assert.match(b.uploads[0].path, /folderId=B-folder/);
    assert.equal(b.lookups(), 1, "another owner's pending lookup never joins this gallery");
    a.gate.resolve();
    assert.equal(await pending, "A-folder");
    await a.service.uploadVillageGalleryImage(image);
    assert.match(a.uploads[0].path, /folderId=A-folder/);
    assert.equal(a.lookups(), 1);
    const file = a.uploads[0].form.get("file") as File;
    assert.equal(file.name, "picture.png");
    assert.equal(a.uploads[0].form.get("provider"), "villages");
    await assert.rejects(a.service.uploadVillageGalleryImage({ ...image, mime: "text/plain" }), /gallery cannot store/);
    assert.equal(a.uploads.length, 1, "invalid artwork is refused before any upload");
    const failure = gallery("unavailable");
    failure.fail(true);
    await failure.service.uploadVillageGalleryImage(image);
    assert.doesNotMatch(failure.uploads[0].path, /folderId=/, "folder lookup failure still permits root upload");
    failure.fail(false);
    await failure.service.uploadVillageGalleryImage(image);
    assert.equal(failure.lookups(), 2, "failed lookups are retried on the next upload");
    assert.match(failure.uploads[1].path, /folderId=unavailable-folder/);
  } finally {
    a.gate.resolve();
    await pending;
  }
}
async function assembledDispatch() {
  const ga = gallery("scoped-A"),
    gb = gallery("scoped-B");
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseA = ownerA.run(() => configureVillagesRuntime(host() as any));
  const releaseB = ownerB.run(() => configureVillagesRuntime(host() as any));
  const releaseGalleryA = ownerA.run(() => configureGlobalGallery(ga.service));
  const releaseGalleryB = ownerB.run(() => configureGlobalGallery(gb.service));

  try {
    await ownerB.run(async () =>
      assert.equal(await ownerA.run(() => ensureVillagesGalleryFolder()), "scoped-A-folder"),
    );
    await ownerB.run(async () => assert.equal(await ensureVillagesGalleryFolder(), "scoped-B-folder"));
    ownerB.run(() => releaseGalleryA());
    ownerB.run(() => releaseA());
    ownerB.run(() => releaseA());
    await ownerB.run(async () => assert.equal((await uploadVillageGalleryImage(image)).id, "scoped-B-image"));
    ownerB.run(() => assert.throws(() => ownerA.run(() => ensureVillagesGalleryFolder()), /not configured/));
    ownerA.dispose();
    ownerB.run(() => assert.throws(() => ownerA.run(() => ensureVillagesGalleryFolder()), /not configured/));
    ownerB.run(() => assert.equal(gb.lookups(), 1));
  } finally {
    ownerB.run(() => releaseGalleryA());
    ownerB.run(() => releaseGalleryB());
    ownerB.run(() => releaseA());
    ownerB.run(() => releaseB());

    ownerA.dispose();
    ownerB.dispose();
  }
}
async function main() {
  await galleryIsolation();
  await assembledDispatch();
  console.log("Gallery lookup promises and uploads belong to their originating activation.");
}
await main();
