import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { projectVillager } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import { resolveSpriteExpression } from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
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
const version = "100";
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
const happySide = Array.from({ length: 17 }, (_, index) => "side-" + (index + 1) + ".png");
const looseFiles = ["new-front.png", ...happySide];
let catalogReads = 0;
let libraryAvailable = true;
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
    catalogReads++;
    if (!libraryAvailable) throw new Error("Unavailable");
    return {
      folders: [],
      sprites: looseFiles.map((filename, index) => ({
        filename,
        label: index === 0 ? "Happy_2" : "Happy_" + index,
        folderId: null,
        url: "/api/sprites/mara/file/" + filename + "?v=" + version,
      })),
    };
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
  { id: happyId, name: "Happy", front: { artworkId: front.id } },
  { id: "new-front", name: "Happy_2", front: { filename: looseFiles[0], version } },
  ...happySide.map((filename, index) => ({
    id: "new-side-" + index,
    name: "Happy_" + (index + 1),
    side: { filename, version },
  })),
];
const body = { token: initial.token, requestId: "batch", useSprites: true, expressions, defaultExpressionId: happyId };

await assert.rejects(
  service.save(
    id,
    {
      ...body,
      defaultExpressionId: "new-front",
      expressions: [{ ...expressions[1], front: { filename: looseFiles[0], version: "99" } }],
    },
    signal,
  ),
  /Engine sprites changed/,
);
await assert.rejects(
  service.save(id, { ...body, expressions: [...expressions, { ...expressions[2], id: "new-duplicate" }] }, signal),
  /Choose each sprite once per facing/,
);
await assert.rejects(
  service.save(
    id,
    { ...body, expressions: [{ ...expressions[1], name: "Wrong" }], defaultExpressionId: "new-front" },
    signal,
  ),
  /Engine sprites changed/,
);
await assert.rejects(
  service.save(
    id,
    {
      ...body,
      expressions: [{ ...expressions[1], front: { filename: "outside-library.png", version } }],
      defaultExpressionId: "new-front",
    },
    signal,
  ),
  /Engine sprites changed/,
);
assert.deepEqual(documents.get(documentId), initialDocument);
const readsBeforeSave = catalogReads;
const saved = await service.save(id, body, signal);
assert.equal(catalogReads, readsBeforeSave + 1, "A whole batch validates against one Engine catalog read");
assert.equal(saved.revision, 6);
assert.equal(saved.manager.assignments.length, 19);
assert.deepEqual(
  saved.manager.artwork,
  initial.manager.artwork,
  "Selections reference Engine files without producing copies",
);
assert.equal(saved.manager.framing.mode, "half");
assert.equal(saved.manager.assignments[0].artworkId, front.id);
assert.deepEqual(await service.save(id, body, signal), saved, "Lost acknowledgements replay the exact committed save");
await assert.rejects(service.save(id, { ...body, useSprites: false }, signal), /save changed/);
await assert.rejects(service.preparedManager(id, 5), /changed/);
assert.deepEqual(await service.preparedManager(id, 6), saved.manager);
assert.equal(
  retainedSpriteFiles("sprite-setup", documents.get(documentId)).length,
  4,
  "Only Village-owned files are retained",
);

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
      spriteManager: saved.manager,
    },
  ],
});
const resident = await service.settled(id, true);
const sprite = managerResidentSprite(resident.manager, id)!;
assert.equal(sprite.named, true);
assert.equal(sprite.expressions.filter((row) => row.view === "front").length, 2);
assert.equal(sprite.expressions.filter((row) => row.view === "side").length, 17);
assert.equal(sprite.expressions[2].assetId, id);
assert.equal(sprite.expressions[2].filename, "side-1.png");
assert.equal(sprite.expressions[2].version, version);
const projected = projectVillager(world.villagers[0], "Mara", "", [], "", "", null);
assert.equal(projected.sprite?.images[2].url, "/api/sprites/mara/file/side-1.png?v=100");
assert.equal(resolveSpriteExpression(sprite, "happy", true, "front", 0.999), sprite.expressions[1].expressionId);
assert.equal(resolveSpriteExpression(sprite, "happy", true, "side", 0.999), sprite.expressions.at(-1)?.expressionId);

libraryAvailable = false;
const rows = resident.manager.assignments.map(({ expressionId, artworkId, view, engineFilename, version }) => ({
  id: expressionId,
  name: resident.manager.expressions.find((row) => row.id === expressionId)!.name,
  [view]: engineFilename ? { filename: engineFilename, version } : { artworkId },
}));
const portrait = await service.save(
  id,
  {
    ...body,
    token: resident.token,
    requestId: "portrait",
    resident: true,
    useSprites: false,
    expressions: rows,
  },
  signal,
);
assert.equal(managerResidentSprite(world.villagers[0].spriteManager, id), null);
assert.deepEqual(
  portrait.manager.assignments,
  saved.manager.assignments,
  "Unchanged references do not need the catalog",
);
const removed = await service.save(
  id,
  {
    ...body,
    token: portrait.token,
    requestId: "remove",
    resident: true,
    expressions: rows.slice(0, -1),
  },
  signal,
);
assert.equal(removed.manager.assignments.length, 18);
assert.deepEqual(removed.manager.artwork, initial.manager.artwork);
assert.equal((await service.settled(id, true)).token, removed.token);
await assert.rejects(
  service.save(id, { ...body, token: portrait.token, requestId: "stale", resident: true }, signal),
  /Appearance changed/,
);
console.log(
  "Appearance saves independent Engine references, preserves owned art and retries, and resolves 2 Front and 17 Side sprites.",
);
