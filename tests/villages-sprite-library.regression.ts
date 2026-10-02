import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { PNG } from "pngjs";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import {
  readSpriteStudio,
  importStudioSheet,
  deleteUnusedStudioFiles,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio.ts";
import {
  listStudioCharacterLibrary,
  adoptStudioCharacterSprites,
  planStudioPublication,
  executeStudioPublication,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-library.ts";
import {
  resolveStudioStyle,
  compileStudioPrompt,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-styles.ts";
import { defaultStudioState } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts";

const records = new Map<string, any>(),
  assets = new Map<string, string>();
const village = defaultVillageState();
village.villagers = coerceVillageState({
  villagers: [
    {
      characterId: "mara",
      addedAt: "2026-10-01T00:00:00Z",
      cardSnapshot: {
        id: "mara",
        revision: 1,
        name: "Mara",
        sourceStatus: "available",
        capturedAt: "2026-10-01T00:00:00Z",
        appearance: "A bird",
      },
    },
  ],
}).villagers;
records.set("villages-village", { id: "villages-village", data: village, revision: 1 });
let failVillage = false,
  failBackup = false,
  cardMissing = false,
  unknownUpload = false,
  unknownDelete = false,
  uploadCount = 0,
  paid = 0,
  styleUnavailable = false;
let originalUploads = 0,
  failOriginalAt = 0,
  failPublicationName = "";
const cleanupRequests: unknown[] = [];
const release = configureVillagesRuntime({
  resources: { listCharacters: async () => [] },
  isDebugAgentsEnabled: () => false,
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  persistence: {
    documents: {
      getById: async (_pkg: string, id: string) => structuredClone(records.get(id) ?? null),
      list: async (_pkg: string, kind: string) =>
        structuredClone([...records.values()].filter((row) => row.kind === kind)),
      create: async (input: any) => {
        const row = { ...structuredClone(input), revision: 1 };
        records.set(input.id, row);
        return row;
      },
      update: async (input: any) => {
        if (failVillage && input.id === "villages-village") throw Error("Disk unavailable");
        const prior = records.get(input.id);
        if (!prior || prior.revision !== input.expectedRevision) return null;
        const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
        records.set(input.id, row);
        return row;
      },
    },
  },
} as any);
function image(color: number) {
  const png = new PNG({ width: 64, height: 96 });
  for (let y = 10; y < 84; y++) for (let x = 12; x < 52; x++) png.data.set([color, 50, 180, 255], (y * 64 + x) * 4);
  // An opaque magenta character detail must survive import.
  for (let y = 38; y < 43; y++) for (let x = 28; x < 33; x++) png.data.set([255, 0, 255, 255], (y * 64 + x) * 4);
  return "data:image/png;base64," + PNG.sync.write(png).toString("base64");
}
const original = image(30),
  alternative = image(180),
  hash = (image: string) =>
    createHash("sha256")
      .update(Buffer.from(image.split(",")[1]!, "base64"))
      .digest("hex");
assets.set("mara/full_neutral.png", original);
const profiles: any = {
  defaultProfileId: "global",
  profiles: [
    {
      id: "global",
      name: "Global ink",
      baseStyle: "custom",
      promptMode: "natural",
      styleText: "Ink drawing",
      positiveTags: "ink",
      negativeTags: "watermark",
      subjectTags: { sprite: "waist-up" },
    },
    {
      id: "connection",
      name: "Connection paint",
      baseStyle: "custom",
      promptMode: "natural",
      styleText: "Painted",
      positiveTags: "paint",
      negativeTags: "logo",
      subjectTags: { sprite: "portrait" },
    },
  ],
};
const priorFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const path = decodeURIComponent(new URL(String(url)).pathname),
    body = init?.body ? JSON.parse(String(init.body)) : {};
  if (path === "/api/app-settings/ui")
    return styleUnavailable
      ? Response.json({}, { status: 503 })
      : Response.json({
          value: JSON.stringify({ imageStyleProfiles: profiles, unrelatedPrivateSetting: "DO_NOT_EXPOSE" }),
        });
  if (path === "/api/connections") return Response.json([]);
  if (path === "/api/characters/mara")
    return cardMissing ? Response.json({}, { status: 404 }) : Response.json({ avatarPath: "" });
  if (path === "/api/sprites/capabilities") return Response.json({ backgroundRemovalAvailable: true });
  if (path === "/api/sprites/cleanup") {
    cleanupRequests.push(body);
    return Response.json({ cells: body.cells });
  }
  if (path.includes("generate-sheet") || path.includes("avatar-generation")) {
    paid++;
    throw Error("Unexpected paid generation");
  }
  if (path === "/api/image-metadata/inspect") {
    const png = PNG.sync.read(Buffer.from(body.image.split(",")[1], "base64"));
    return Response.json({ width: png.width, height: png.height });
  }
  const match = path.match(/^\/api\/sprites\/([^/]+)(?:\/file\/(.+)|\/([^/]+))?$/);
  if (match) {
    const [, owner, filename, expression] = match;
    if (filename) {
      const value = assets.get(owner + "/" + filename);
      return value
        ? new Response(Buffer.from(value.split(",")[1]!, "base64"), {
            headers: { "content-type": value.split(";")[0]!.slice(5) },
          })
        : Response.json({}, { status: 404 });
    }
    if (init?.method === "DELETE") {
      const key = [...assets.keys()].find(
        (key) => key.startsWith(owner + "/") && key.slice(owner!.length + 1).replace(/\.[^.]+$/, "") === expression,
      );
      if (!key) return Response.json({}, { status: 404 });
      assets.delete(key);
      if (owner === "mara" && unknownDelete) {
        unknownDelete = false;
        throw Error("Lost deletion response");
      }
      return new Response(null, { status: 204 });
    }
    if (init?.body) {
      if (owner!.startsWith("villages-") && body.expression === "original" && ++originalUploads === failOriginalAt)
        return Response.json({}, { status: 507 });
      if (owner === "mara" && body.expression === failPublicationName) return Response.json({}, { status: 503 });
      if (failBackup && body.expression === "backup") return Response.json({}, { status: 507 });
      const ext = body.image.startsWith("data:image/jpeg") ? "jpeg" : "png",
        file = body.expression + "." + ext;
      assets.set(owner + "/" + file, body.image);
      if (owner === "mara") {
        uploadCount++;
        if (unknownUpload) {
          unknownUpload = false;
          throw Error("Lost upload response");
        }
      }
      return Response.json({ filename: file });
    }
    return Response.json(
      [...assets.keys()]
        .filter((key) => key.startsWith(owner + "/"))
        .map((key) => {
          const filename = key.slice(owner!.length + 1);
          return {
            filename,
            expression: filename.replace(/\.[^.]+$/, ""),
            url: `/api/sprites/${owner}/file/${filename}`,
          };
        }),
    );
  }
  throw Error("Unexpected request " + path);
};
async function main() {
  try {
    const initial = await readSpriteStudio("mara");
    assert.equal(initial.settings.styleSelection?.kind, "default");
    assert.ok(!JSON.stringify(initial.styleProfiles).includes("DO_NOT_EXPOSE"));
    const settings = defaultStudioState().settings,
      connection = {
        source: "automatic1111",
        defaults: {
          imageGeneration: {
            version: 1,
            service: "automatic1111",
            styleProfileId: "connection",
            automatic1111: { promptPrefix: "Configured prefix" },
          },
        },
      };
    assert.equal((await resolveStudioStyle(settings, connection)).id, "connection");
    assert.equal((await resolveStudioStyle(settings, { source: "api", defaults: {} })).id, "global");
    const resolved = await resolveStudioStyle(
      { ...settings, styleSelection: { kind: "profile", profileId: "global" } },
      connection,
    );
    const compiled = compileStudioPrompt(
      "Complete character with exactly 2 columns and 1 rows. Solid matte.",
      "text",
      resolved,
      connection,
    );
    assert.match(compiled.prompt, /ink/i);
    assert.match(compiled.prompt, /Configured prefix/);
    assert.ok(!compiled.prompt.includes("waist-up"));
    await assert.rejects(
      resolveStudioStyle({ ...settings, styleSelection: { kind: "profile", profileId: "gone" } }, connection),
      /unavailable/,
    );
    profiles.profiles[0].styleText = "Changed ink";
    assert.notEqual(
      (await resolveStudioStyle({ ...settings, styleSelection: { kind: "profile", profileId: "global" } }, connection))
        .fingerprint,
      resolved.fingerprint,
    );
    styleUnavailable = true;
    await assert.rejects(resolveStudioStyle(settings, connection));
    assert.equal((await resolveStudioStyle({ ...settings, styleSelection: { kind: "studio" } }, connection)).id, "off");
    assert.ok((await readSpriteStudio("mara")).styleError);
    styleUnavailable = false;

    const library = await listStudioCharacterLibrary("mara");
    assert.equal(library.items.length, 1);
    assert.equal(library.items[0]!.view, "front");
    const input = {
      submissionId: randomUUID(),
      items: library.items.map((item) => ({
        filename: item.filename,
        sha256: item.sha256,
        label: "neutral",
        view: "front",
      })),
    };
    await assert.rejects(
      adoptStudioCharacterSprites("mara", { ...input, items: [...input.items, ...input.items] }),
      /one sprite/,
    );
    await assert.rejects(
      adoptStudioCharacterSprites("mara", { ...input, items: [{ ...input.items[0], sha256: "changed" }] }),
      /changed/,
    );
    const adopted = await adoptStudioCharacterSprites("mara", input),
      cell = adopted.studio.jobs.at(-1)!.sheets[0]!.cells[0]!;
    assert.equal(cell.cleanup, false);
    assert.equal(adopted.studio.assignments.length, 1);
    assert.equal(cleanupRequests.length, 0);
    const adoptedPixels = PNG.sync.read(
      Buffer.from(
        assets.get(cell.rendered!.url.replace("/api/sprites/", "").replace("/file/", "/"))!.split(",")[1]!,
        "base64",
      ),
    );
    assert.ok(adoptedPixels.data.some((value, index) => index % 4 === 3 && value === 0));
    assert.ok(
      adoptedPixels.data.some(
        (value, index) =>
          index % 4 === 0 &&
          value === 255 &&
          adoptedPixels.data[index + 1] === 0 &&
          adoptedPixels.data[index + 2] === 255 &&
          adoptedPixels.data[index + 3] === 255,
      ),
      "opaque magenta detail survives transparent adoption",
    );
    const activeUrl = cell.rendered!.url;
    assets.delete("mara/full_neutral.png");
    assert.ok(assets.has(activeUrl.replace("/api/sprites/", "").replace("/file/", "/")));
    const jobs = adopted.studio.jobs.length;
    await adoptStudioCharacterSprites("mara", input);
    assert.equal((await readSpriteStudio("mara")).jobs.length, jobs);
    assets.set("mara/full_batch_one.png", original);
    assets.set("mara/full_batch_two.png", alternative);
    const batchLibrary = await listStudioCharacterLibrary("mara");
    const assignmentsBeforeAdoption = structuredClone((await readSpriteStudio("mara")).assignments);
    failOriginalAt = originalUploads + 2;
    await assert.rejects(
      adoptStudioCharacterSprites("mara", {
        submissionId: randomUUID(),
        items: batchLibrary.items.map((item, index) => ({
          filename: item.filename,
          sha256: item.sha256,
          label: "batch_" + index,
          view: "front",
        })),
      }),
    );
    failOriginalAt = 0;
    assert.deepEqual((await readSpriteStudio("mara")).assignments, assignmentsBeforeAdoption);
    assert.equal(
      (await readSpriteStudio("mara")).jobs.length,
      jobs + 1,
      "successfully saved art remains after a later adoption failure",
    );

    const imported = await importStudioSheet("mara", {
      image: alternative,
      cells: [{ label: "happy", view: "side", x: 0, y: 0, width: 64, height: 96, cleanup: false }],
    });
    const candidate = imported.jobs.at(-1)!.sheets[0]!.cells[0]!;
    const beforeAssignments = structuredClone(imported.assignments);
    await assert.rejects(
      planStudioPublication("mara", {
        items: [
          { cellId: cell.id, name: "full_happy" },
          { cellId: candidate.id, name: "happy" },
        ],
      }),
      /unique/,
    );
    let plan = await planStudioPublication("mara", { items: [{ cellId: candidate.id }] });
    assert.equal(plan.items[0]!.name, "full_happy_side");
    unknownUpload = true;
    let published = await executeStudioPublication("mara", { id: plan.id, token: plan.token });
    assert.equal(published.publications!.at(-1)!.items[0]!.status, "saved");
    assert.equal(uploadCount, 1);
    await executeStudioPublication("mara", { id: plan.id, token: plan.token });
    assert.equal(uploadCount, 1, "confirmed uncertain upload is not repeated");
    assert.deepEqual(published.assignments, beforeAssignments, "publishing does not assign artwork");
    const mapping = (await listStudioCharacterLibrary("mara")).items.find(
      (item) => item.expression === "full_happy_side",
    )!;
    assert.equal(mapping.view, "side");
    assert.equal(mapping.label, "happy");

    assets.set("mara/full_neutral.png", original);
    assets.set("mara/full_neutral.jpeg", original.replace("data:image/png", "data:image/jpeg"));
    plan = await planStudioPublication("mara", {
      items: [{ cellId: candidate.id, name: "full_neutral", action: "replace" }],
    });
    assert.equal(plan.items[0]!.expected.length, 2);
    failBackup = true;
    await assert.rejects(executeStudioPublication("mara", { id: plan.id, token: plan.token }));
    assert.equal(assets.get("mara/full_neutral.png"), original);
    failBackup = false;
    assert.equal((await readSpriteStudio("mara")).publications!.at(-1)!.items[0]!.status, "failed");
    unknownDelete = true;
    published = await executeStudioPublication("mara", { id: plan.id, token: plan.token });
    assert.equal(published.publications!.at(-1)!.items[0]!.status, "unresolved");
    published = await executeStudioPublication("mara", { id: plan.id, token: plan.token });
    assert.equal(published.publications!.at(-1)!.items[0]!.status, "saved");
    assert.ok(!assets.has("mara/full_neutral.jpeg"));
    const backups = published.publications!.at(-1)!.items[0]!.backups;
    assert.equal(backups.length, 2);
    const backupKeys = backups.map((backup) => backup.url.replace("/api/sprites/", "").replace("/file/", "/"));
    await deleteUnusedStudioFiles("mara");
    for (const key of backupKeys) assert.ok(assets.has(key));
    const restore = await planStudioPublication("mara", {
      restoreOf: plan.id,
      items: [{ backupUrl: backups[0]!.url, name: "full_neutral", action: "replace" }],
    });
    await executeStudioPublication("mara", { id: restore.id, token: restore.token });
    assert.equal(hash(assets.get("mara/full_neutral.png")!), hash(original));

    const changed = await planStudioPublication("mara", {
      items: [{ cellId: candidate.id, name: "full_neutral", action: "replace" }],
    });
    assets.set("mara/full_neutral.png", alternative);
    await assert.rejects(executeStudioPublication("mara", { id: changed.id, token: changed.token }), /changed/);
    assert.equal(assets.get("mara/full_neutral.png"), alternative);
    const skip = await planStudioPublication("mara", {
      items: [{ cellId: candidate.id, name: "full_neutral", action: "skip" }],
    });
    await executeStudioPublication("mara", { id: skip.id, token: skip.token });
    assert.equal((await readSpriteStudio("mara")).publications!.at(-1)!.items[0]!.status, "skipped");
    const libraryAgain = await listStudioCharacterLibrary("mara");
    const another = {
      submissionId: randomUUID(),
      items: [
        {
          filename: libraryAgain.items[0]!.filename,
          sha256: libraryAgain.items[0]!.sha256,
          label: "surprised",
          view: "front",
        },
      ],
    };
    const assignments = (await readSpriteStudio("mara")).assignments;
    failVillage = true;
    await assert.rejects(adoptStudioCharacterSprites("mara", another));
    assert.deepEqual((await readSpriteStudio("mara")).assignments, assignments);
    failVillage = false;
    await adoptStudioCharacterSprites("mara", another);
    const partial = await planStudioPublication("mara", {
      items: [
        { cellId: cell.id, name: "full_partial_one" },
        { cellId: candidate.id, name: "full_partial_two" },
        { cellId: cell.id, name: "full_partial_three" },
      ],
    });
    failPublicationName = "full_partial_two";
    const partialState = await executeStudioPublication("mara", { id: partial.id, token: partial.token });
    assert.deepEqual(
      partialState.publications!.at(-1)!.items.map((item) => item.status),
      ["saved", "unresolved", "pending"],
    );
    assert.ok(!assets.has("mara/full_partial_three.png"));
    failPublicationName = "";
    const completed = await executeStudioPublication("mara", { id: partial.id, token: partial.token });
    assert.deepEqual(
      completed.publications!.at(-1)!.items.map((item) => item.status),
      ["saved", "saved", "saved"],
    );
    cardMissing = true;
    assert.equal((await listStudioCharacterLibrary("mara")).available, false);
    assert.ok((await readSpriteStudio("mara")).jobs.length);
    await assert.rejects(planStudioPublication("mara", { items: [{ cellId: candidate.id }] }));
    assert.equal(paid, 0);
    console.log(
      "Sprite library regression passed: adoption, alpha, mappings, styles, conflicts, backups, uncertain writes, restore and missing-card isolation.",
    );
  } finally {
    globalThis.fetch = priorFetch;
    release();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
