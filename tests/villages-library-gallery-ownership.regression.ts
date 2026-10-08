import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { createNativeSchedules } from "../packages/villages/src/server/adapters/engine/native-schedules-service.js";
import {
  readNativeScheduleSnapshot,
  resetNativeScheduleCache,
} from "../packages/villages/src/server/adapters/engine/native-schedules.js";
import { createGlobalGallery } from "../packages/villages/src/server/adapters/engine/global-gallery-service.js";
import {
  configureGlobalGallery,
  ensureVillagesGalleryFolder,
  uploadVillageGalleryImage,
} from "../packages/villages/src/server/adapters/engine/global-gallery.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const now = new Date("2026-10-05T10:00:00");
const ids = ["same-character"];
function library(name: string) {
  let pause = false,
    failed = false,
    reads = 0;
  const gate = deferred(),
    entered = deferred();
  const warnings: unknown[][] = [];
  const logger = {
    debug() {},
    info() {},
    error() {},
    debugOverride() {},
    warn(...args: unknown[]) {
      warnings.push(args);
    },
  };
  const resources: any = {
    async listCharacters(selected?: string[]) {
      reads++;
      assert.deepEqual(selected, ids);
      if (pause) {
        entered.resolve();
        await gate.promise;
      }
      if (failed) throw new Error(`${name} library unavailable`);
      return [
        {
          id: ids[0],
          data: JSON.stringify({
            extensions: {
              conversationSchedule: {
                routineSummary: name,
                days: { Monday: [{ time: "09:00-12:00", activity: `${name} activity`, status: "idle" }] },
              },
            },
          }),
        },
      ];
    },
  };
  const service = createNativeSchedules({ villagesResources: () => resources, villagesLogger: () => logger });
  const host: any = { resources, logger, isDebugAgentsEnabled: () => false };
  return {
    host,
    service,
    gate,
    entered,
    warnings,
    reads: () => reads,
    pause: () => {
      pause = true;
    },
    fail: (value: boolean) => {
      failed = value;
    },
  };
}
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
async function cacheIsolation() {
  const a = library("A"),
    b = library("B");
  a.pause();
  const pending = a.service.readNativeScheduleSnapshot(now, ids);
  await a.entered.promise;
  try {
    assert.equal((await b.service.readNativeScheduleSnapshot(now, ids)).schedules[0].routineSummary, "B");
    a.gate.resolve();
    assert.equal((await pending).schedules[0].routineSummary, "A");
    assert.equal((await b.service.readNativeSchedules(now, ids)).get(ids[0])?.activity, "B activity");
    assert.equal(b.reads(), 1);
    a.service.resetNativeScheduleCache();
    await b.service.readNativeWeekSchedules(now, ids);
    assert.equal(b.reads(), 1, "another owner's reset leaves this cache intact");
    a.fail(true);
    assert.equal((await a.service.readNativeScheduleSnapshot(now, ids)).cardsReadable, false);
    await a.service.readNativeScheduleSnapshot(new Date(now.getTime() + 31_000), ids);
    assert.equal(a.warnings.length, 1, "a continuing failure is reported once by this owner");
    b.fail(true);
    b.service.resetNativeScheduleCache();
    await b.service.readNativeScheduleSnapshot(now, ids);
    assert.equal(b.warnings.length, 1, "another library reports its own failure");
    a.fail(false);
    assert.equal(
      (await a.service.readNativeScheduleSnapshot(new Date(now.getTime() + 62_000), ids)).cardsReadable,
      true,
    );
    a.fail(true);
    await a.service.readNativeScheduleSnapshot(new Date(now.getTime() + 93_000), ids);
    assert.equal(a.warnings.length, 2, "recovery rearms only this owner's failure report");
  } finally {
    a.gate.resolve();
    await pending;
  }
}
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
  const a = library("scoped-A"),
    b = library("scoped-B"),
    ga = gallery("scoped-A"),
    gb = gallery("scoped-B");
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseA = ownerA.run(() => configureVillagesRuntime(a.host));
  const releaseB = ownerB.run(() => configureVillagesRuntime(b.host));
  const releaseGalleryA = ownerA.run(() => configureGlobalGallery(ga.service));
  const releaseGalleryB = ownerB.run(() => configureGlobalGallery(gb.service));
  const clearDefault = installDefaultActivation(ownerB, () => {});
  a.pause();
  const pending = ownerA.run(() => readNativeScheduleSnapshot(now, ids));
  await a.entered.promise;
  try {
    assert.equal((await readNativeScheduleSnapshot(now, ids)).schedules[0].routineSummary, "scoped-B");
    a.gate.resolve();
    assert.equal((await pending).schedules[0].routineSummary, "scoped-A");
    ownerA.run(() => resetNativeScheduleCache());
    assert.equal((await readNativeScheduleSnapshot(now, ids)).schedules[0].routineSummary, "scoped-B");
    assert.equal(b.reads(), 1);
    assert.equal(await ownerA.run(() => ensureVillagesGalleryFolder()), "scoped-A-folder");
    assert.equal(await ensureVillagesGalleryFolder(), "scoped-B-folder");
    releaseGalleryA();
    releaseA();
    releaseA();
    assert.equal((await uploadVillageGalleryImage(image)).id, "scoped-B-image");
    assert.equal((await readNativeScheduleSnapshot(now, ids)).schedules[0].routineSummary, "scoped-B");
    await assert.rejects(
      ownerA.run(() => readNativeScheduleSnapshot(now, ids)),
      /not configured/,
    );
    assert.throws(() => ownerA.run(() => ensureVillagesGalleryFolder()), /not configured/);
    ownerA.dispose();
    assert.throws(() => ownerA.run(() => ensureVillagesGalleryFolder()), /not configured/);
    assert.equal(gb.lookups(), 1);
  } finally {
    a.gate.resolve();
    await pending;
    releaseGalleryA();
    releaseGalleryB();
    releaseA();
    releaseB();
    clearDefault();
    ownerA.dispose();
    ownerB.dispose();
  }
}
async function main() {
  await cacheIsolation();
  await galleryIsolation();
  await assembledDispatch();
  console.log(
    "Schedule caches, library failure reports and gallery lookup promises belong to their originating activation.",
  );
}
void main();
