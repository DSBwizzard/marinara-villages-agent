import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { managerResidentSprite } from "../packages/villages/src/server/domain/rules/sprite-manager-model.js";
import {
  createSpriteSetup,
  type SpriteSetupPorts,
} from "../packages/villages/src/server/features/media/sprite-setup-service.js";
import { createSpriteWrites } from "../packages/villages/src/server/features/media/sprite-writes.js";
import { retainedSpriteFiles } from "../packages/villages/src/server/adapters/storage/sprite-files.js";

const id = "mara";
const documents = new Map<string, unknown>();
const documentId = "villages-sprite-setup-" + createHash("sha256").update(id).digest("hex");
const signal = new AbortController().signal;
let world = defaultVillageState();
let version = "100";
let copied = 0;
let prepareHook = () => {};
let fail = "";
const image = "data:image/png;base64,";
const png = (name: string) => image + Buffer.from(name).toString("base64");
const sourceDigest = (data: string) =>
  createHash("sha256")
    .update(Buffer.from(data.slice(image.length), "base64"))
    .digest("hex");
const makeArt = (filename: string, data: string, characterId = id) => {
  const assetId = "villages-" + randomUUID();
  const rendered = "r-" + randomUUID().replaceAll("-", "") + ".png";
  const file = (name: string) => ({ filename: name, url: "/api/sprites/" + assetId + "/file/" + name });
  return {
    id: "a-" + randomUUID(),
    name: filename,
    origin: "engine" as const,
    engineSource: { characterId, filename },
    assetId,
    source: { ...file("original.png"), width: 32, height: 32, sha256: sourceDigest(data) },
    rendered: file(rendered),
    frame: { x: 0, y: 0, width: 32, height: 32, scale: 1, offsetX: 0, offsetY: 0 },
    warnings: [],
  };
};
const front = makeArt("happy.png", png("happy.png?v=100"));
const unassigned = makeArt("draft-only.png", png("old"));
documents.set(documentId, {
  revision: 5,
  manager: { version: 1, artwork: [front, unassigned], expressions: [], assignments: [], framing: { mode: "half" } },
  assignments: [
    { artworkId: front.id, name: "Happy", view: "front", included: true, approved: true },
    { artworkId: unassigned.id, name: "Draft", view: "front", included: true, approved: false },
  ],
  defaultArtworkId: front.id,
  useSprites: true,
  errors: {},
});
const initialDocument = structuredClone(documents.get(documentId));
const looseFiles = ["loose.png", ...Array.from({ length: 100 }, (_, index) => `extra-${index}.png`)];
const service = createSpriteSetup({
  villagesDocuments: () => ({
    getById: async (_pkg: string, key: string) => ({ data: structuredClone(documents.get(key)) }),
  }),
  mutateDocument: async (key, slot, update) => {
    const next = slot.coerce(documents.get(key));
    await update(next);
    documents.set(key, structuredClone(next));
  },
  villageEngineJson: async (url) => {
    if (url.startsWith("/api/characters/")) return { id };
    if (!url.endsWith("/catalog")) throw new Error(url);
    return {
      folders: [{ id: "full", name: "Full body", category: "full-body" }],
      sprites: ["neutral.png", "happy.png", "happy-side.png", "happy-alt.png", ...looseFiles].map((filename) => ({
        filename,
        label: filename,
        folderId: looseFiles.includes(filename) ? null : "full",
        url: "/api/sprites/mara/file/" + filename + "?v=" + version,
      })),
    };
  },
  manager: {
    readImage: async (url) => {
      if (url.includes(fail) && fail) throw Error("Unreadable");
      return png(url.split("/").at(-1)!);
    },
    prepareArtwork: async (name, data, source) => {
      copied++;
      prepareHook();
      return makeArt(name, data, source?.characterId);
    },
  },
  writes: createSpriteWrites(),
  readVillageState: async () => structuredClone(world),
  mutateVillageState: async (update) => {
    const next = structuredClone(world);
    update(next);
    world = coerceVillageState(next);
    return structuredClone(world);
  },
} as SpriteSetupPorts);

const initial = await service.settled(id);
assert.deepEqual(
  documents.get(documentId),
  initialDocument,
  "Reading legacy data does not change the founding revision",
);
assert.deepEqual((await service.settled(id)).manager, initial.manager, "Migrated expression IDs are deterministic");
assert.equal(await service.preparedManager(id), null);
assert.equal(initial.manager.expressions.length, 1);
assert.equal(initial.files[0].version, version);
const happyId = initial.manager.expressions[0].id;
const expressions = [
  { id: happyId, name: "Happy", front: { artworkId: front.id }, side: { filename: "happy-side.png", version } },
];
const body = { token: initial.token, requestId: "pair", useSprites: true, expressions, defaultExpressionId: happyId };
const paired = await service.save(id, body, signal);
assert.equal(paired.revision, 6);
assert.equal(paired.manager.assignments.length, 2);
assert.equal(paired.manager.framing.mode, "half");
assert.equal(paired.manager.assignments[0].artworkId, front.id);
assert.deepEqual(await service.save(id, body, signal), paired, "Lost acknowledgements replay the exact committed save");
assert.equal(copied, 1);
await assert.rejects(service.save(id, { ...body, useSprites: false }, signal), /save changed/);
await assert.rejects(service.preparedManager(id, 5), /changed/);
assert.deepEqual(await service.preparedManager(id, 6), paired.manager);
assert.equal(retainedSpriteFiles("sprite-setup", documents.get(documentId)).length, 6);

world = coerceVillageState({
  ...world,
  seed: "resident-world",
  villagers: [
    {
      characterId: id,
      incarnation: "11111111-1111-4111-8111-111111111111",
      addedAt: "2026-01-01T00:00:00.000Z",
      letterFontId: "caveat",
      cardSnapshot: {
        id,
        revision: 1,
        sourceStatus: "available",
        capturedAt: "2026-01-01T00:00:00.000Z",
        name: "Mara",
      },
      spriteManager: paired.manager,
    },
  ],
});
const resident = await service.settled(id, true);
const sideId = resident.manager.assignments.find((slot) => slot.view === "side")!.artworkId;
const existing = [{ id: happyId, name: "Happy", front: { artworkId: front.id }, side: { artworkId: sideId } }];
const portrait = await service.save(
  id,
  {
    token: resident.token,
    resident: true,
    requestId: "portrait",
    useSprites: false,
    expressions: existing,
    defaultExpressionId: happyId,
  },
  signal,
);
assert.equal(managerResidentSprite(world.villagers[0].spriteManager), null);
assert.equal(portrait.manager.assignments.length, 2);
const enabled = await service.save(
  id,
  {
    token: portrait.token,
    resident: true,
    requestId: "sprites",
    useSprites: true,
    expressions: existing,
    defaultExpressionId: happyId,
  },
  signal,
);
assert.equal(managerResidentSprite(world.villagers[0].spriteManager)?.expressions.length, 2);
assert.equal(
  enabled.token,
  (await service.settled(id, true)).token,
  "A second save in the same editor uses the acknowledged token",
);
assert.equal(copied, 1, "Portrait and metadata changes do not copy images");

version = "200";
const replacement = {
  token: enabled.token,
  resident: true,
  requestId: "replace",
  useSprites: true,
  expressions: [{ ...existing[0], side: { filename: "happy-side.png", version: "100" } }],
  defaultExpressionId: happyId,
};
await assert.rejects(service.save(id, replacement, signal), /Engine sprites changed/);
const currentReplacement = {
  ...replacement,
  expressions: [{ ...existing[0], side: { filename: "happy-side.png", version } }],
};
fail = "happy-side.png";
await assert.rejects(service.save(id, currentReplacement, signal), /Unreadable/);
assert.equal((await service.settled(id, true)).token, enabled.token);
fail = "";
const replaced = await service.save(id, currentReplacement, signal);
assert.equal(replaced.manager.assignments.find((row) => row.view === "front")?.artworkId, front.id);
assert.notEqual(replaced.manager.assignments.find((row) => row.view === "side")?.artworkId, sideId);
assert.equal(
  replaced.manager.artwork.some((art) => art.id === sideId),
  false,
  "Replacement releases the old active copy",
);
assert.equal(
  (await service.preparedManager(id, 6))?.artwork.some((art) => art.id === sideId),
  true,
  "Founding ownership remains separate",
);
await assert.rejects(service.save(id, { ...replacement, requestId: "stale" }, signal), /Appearance changed/);
prepareHook = () => {
  world.seed = "different-world";
};
await assert.rejects(
  service.save(
    id,
    {
      ...currentReplacement,
      token: replaced.token,
      requestId: "racing",
      expressions: [{ ...existing[0], side: { filename: "happy-alt.png", version } }],
    },
    signal,
  ),
  /Appearance changed/,
);
assert.deepEqual(world.villagers[0].spriteManager, replaced.manager);
prepareHook = () => {};
const beforeFolders = await service.settled(id);
const folderSave = {
  token: beforeFolders.token,
  requestId: "use-folders",
  useSprites: true,
  folders: { front: "full", side: "" },
  defaultExpressionId: "new-happy",
  expressions: [{ id: "new-happy", name: "happy", front: { filename: "happy.png", version } }],
};
await assert.rejects(
  service.save(id, { ...folderSave, folders: { front: "wrong", side: "" } }, signal),
  /Engine folders or labels changed/,
);
await assert.rejects(
  service.save(id, { ...folderSave, expressions: [{ ...folderSave.expressions[0], name: "wrong" }] }, signal),
  /Engine folders or labels changed/,
);
const folderSaved = await service.save(id, folderSave, signal);
assert.deepEqual(folderSaved.manager.folders, folderSave.folders);
assert.equal(folderSaved.manager.assignments.length, 1);
assert.deepEqual(await service.save(id, folderSave, signal), folderSaved);
assert.deepEqual((await service.settled(id)).manager, folderSaved.manager);
const selected = folderSaved.manager.assignments[0];
const portraitSave = await service.save(
  id,
  {
    ...folderSave,
    token: folderSaved.token,
    requestId: "folder-portrait",
    useSprites: false,
    defaultExpressionId: selected.expressionId,
    expressions: [{ id: selected.expressionId, name: "happy", front: { artworkId: selected.artworkId } }],
  },
  signal,
);
assert.deepEqual(portraitSave.manager.assignments, folderSaved.manager.assignments);
assert.deepEqual(portraitSave.manager.folders, folderSave.folders);
const looseSave = {
  ...folderSave,
  token: portraitSave.token,
  requestId: "no-folder",
  folders: { front: "", side: "" },
  expressions: [{ id: "new-happy", name: "loose", front: { filename: "loose.png", version } }],
};
await assert.rejects(
  service.save(id, { ...looseSave, expressions: folderSave.expressions }, signal),
  /Engine folders or labels changed/,
);
const looseSaved = await service.save(id, looseSave, signal);
assert.deepEqual(looseSaved.manager.folders, looseSave.folders);
assert.equal(looseSaved.manager.assignments[0].view, "front");
assert.deepEqual((await service.settled(id)).manager, looseSaved.manager);
const bothFacings = await service.save(
  id,
  {
    ...looseSave,
    token: looseSaved.token,
    requestId: "same-loose-source",
    defaultExpressionId: "new-front-0",
    expressions: ["front", "side"].flatMap((view) =>
      looseFiles.map((filename, index) => ({
        id: `new-${view}-${index}`,
        name: filename.replace(/\.png$/, ""),
        [view]: { filename, version },
      })),
    ),
  },
  signal,
);
assert.equal(bothFacings.manager.assignments.length, 202);
assert.equal(new Set(bothFacings.manager.assignments.map((row) => row.artworkId)).size, 101);
console.log(
  "Appearance preserves legacy drafts, validates Engine folder selections, retries exact saves and fences resident changes.",
);
