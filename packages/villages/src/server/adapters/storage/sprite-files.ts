import { createHash, randomUUID } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";

export const SPRITE_FILE_KIND = "sprite-file";
const processKey = Symbol.for("villages.sprite-file-process.v1");
if (!Reflect.has(globalThis, processKey)) Object.defineProperty(globalThis, processKey, { value: randomUUID() });
export const spriteFileProcess = Reflect.get(globalThis, processKey) as string;
const uuid = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
const processId = new RegExp("^" + uuid + "$");
memoryRequire(
  typeof spriteFileProcess === "string" && processId.test(spriteFileProcess),
  "invalid sprite file process identity",
);
const asset = new RegExp("^villages-" + uuid + "$");
const expression = /^(original|r-[a-f0-9]{32})$/;
export const spriteFileId = (assetId: string, name: string) =>
  "villages-sprite-file-" +
  createHash("sha256")
    .update(JSON.stringify([assetId, name]))
    .digest("hex");

export function readSpriteFileAllocation(row: { id: string; kind: string; data: unknown }) {
  memoryRequire(row.kind === SPRITE_FILE_KIND, "invalid owned sprite file kind");
  memoryObject(row.data, ["format", "assetId", "expression", "filename", "sha256", "process", "ready", "bytes"]);
  const value = row.data;
  memoryRequire(
    value.format === 1 &&
      typeof value.assetId === "string" &&
      asset.test(value.assetId) &&
      typeof value.expression === "string" &&
      expression.test(value.expression) &&
      typeof value.filename === "string" &&
      /\.(png|jpeg|jpg|webp)$/.test(value.filename) &&
      value.filename.replace(/\.[^.]+$/, "") === value.expression &&
      typeof value.sha256 === "string" &&
      /^[a-f0-9]{64}$/.test(value.sha256) &&
      typeof value.process === "string" &&
      processId.test(value.process) &&
      typeof value.ready === "boolean" &&
      Number.isSafeInteger(value.bytes) &&
      value.bytes > 0 &&
      row.id === spriteFileId(value.assetId, value.expression),
    "invalid owned sprite file allocation",
  );
  return value as {
    format: 1;
    assetId: string;
    expression: string;
    filename: string;
    sha256: string;
    process: string;
    ready: boolean;
    bytes: number;
  };
}
export type SpriteFileAllocation = ReturnType<typeof readSpriteFileAllocation>;

/** Claim before upload, acknowledge before publication; uncertain uploads stay held until their host exits. */
export function createSpriteFiles(documents: CapabilityDocumentStore) {
  return async function save<T>(assetId: string, name: string, image: string, upload: () => Promise<T>): Promise<T> {
    const match = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
    memoryRequire(match, "invalid owned sprite image");
    const buffer = Buffer.from(match[2], "base64");
    const id = spriteFileId(assetId, name),
      stamp = new Date().toISOString();
    const data = {
      format: 1,
      assetId,
      expression: name,
      filename: name + "." + match[1],
      sha256: createHash("sha256").update(buffer).digest("hex"),
      process: spriteFileProcess,
      ready: false,
      bytes: buffer.byteLength,
    };
    readSpriteFileAllocation({ id, kind: SPRITE_FILE_KIND, data });
    const row = await documents.create({
      id,
      packageId: "villages",
      kind: SPRITE_FILE_KIND,
      name: "Owned sprite file",
      description: "Sprite upload and retained-file ownership",
      data,
      createdAt: stamp,
      updatedAt: stamp,
    });
    const result = await upload();
    memoryRequire(
      await documents.update({
        id,
        packageId: "villages",
        expectedRevision: row.revision,
        name: row.name,
        description: row.description,
        data: { ...data, ready: true },
        updatedAt: new Date().toISOString(),
      }),
      "sprite upload acknowledgement changed",
    );
    return result;
  };
}

/** Typed manager fields only: neither prose nor Engine character/Gallery originals confer deletion authority. */
export function spriteManagerFiles(raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  memoryObject(raw);
  memoryRequire(raw.version === 1 && Array.isArray(raw.artwork), "invalid retained sprite manager");
  return raw.artwork.flatMap((art: unknown) => {
    memoryObject(art);
    memoryRequire(typeof art.assetId === "string" && asset.test(art.assetId), "invalid retained sprite asset");
    return ["source", "rendered"].map((key) => {
      const file = art[key];
      memoryObject(file);
      memoryRequire(
        typeof file.filename === "string" &&
          /^(original|r-[a-f0-9]{32})\.(png|jpeg|jpg|webp)$/.test(file.filename) &&
          file.url === `/api/sprites/${art.assetId}/file/${file.filename}`,
        "invalid retained sprite file",
      );
      return spriteFileId(art.assetId, file.filename.replace(/\.[^.]+$/, ""));
    });
  });
}

function residents(raw: unknown): string[] {
  memoryObject(raw);
  memoryRequire(Array.isArray(raw.villagers), "invalid retained sprite resident directory");
  return raw.villagers.flatMap((person: unknown) => {
    memoryObject(person);
    return spriteManagerFiles(person.spriteManager);
  });
}
export function retainedSpriteFiles(kind: string, value: unknown): string[] {
  memoryObject(value);
  if (kind === "sprite-setup") {
    memoryRequire(value.manager != null, "missing retained sprite setup manager");
    return spriteManagerFiles(value.manager);
  }
  if (kind === "venue-visit")
    return [value, value.operation?.snapshot]
      .filter(Boolean)
      .flatMap((scene) => (scene.continuity ? residents(scene.continuity.facts) : []));
  const outbox = (world: Record<string, any>) =>
    (world.socialOutbox ?? []).flatMap((entry: any) => (entry.admitted ? residents(entry.admitted) : []));
  if (kind === "village")
    return [
      ...residents(value),
      ...(value.returnCatchup?.capture ? residents(value.returnCatchup.capture.world) : []),
      ...outbox(value),
      ...(value.socialMailOutbox ?? []).flatMap((entry: any) => residents(entry.input.admitted)),
    ];
  if (["background-work", "background-history"].includes(kind)) {
    return [value, value.replacement].filter(Boolean).flatMap((job) => {
      const input = job.input;
      if (input == null) return [];
      if (["resident-planning", "personal-mail"].includes(job.kind)) return residents(input.admitted);
      if (job.kind === "social-recovery") return residents(input.entry.admitted);
      return [];
    });
  }
  return [];
}
