import { createHash, randomUUID } from "node:crypto";
import { PNG } from "pngjs";
import { asRecord, asString } from "./coerce.js";
import { badRequest, conflict, notFound } from "./errors.js";
import { villageEngineBaseUrl, villageEngineJson, deleteVillageSpriteFile } from "./engine-loopback.js";
import { decodeVillageImageDataUrl, inspectVillageImage } from "./image-files.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { buildVillageSnapshot } from "./village.js";
import { villagesLogger } from "./package-runtime.js";
import {
  emptySpriteManager,
  isEngineSpriteFilename,
  type SpriteArtwork,
  type SpriteFrame,
  type SpriteManagerState,
  type SpriteLibraryItem,
} from "./sprite-manager-model.js";
import { initialSpriteFrame, renderSpritePixels, type SpritePixels } from "./sprite-manager-pixels.js";

const writes = new Map<string, Promise<unknown>>();
function serialize<T>(id: string, action: () => Promise<T>): Promise<T> {
  const task = (writes.get(id) ?? Promise.resolve()).catch(() => undefined).then(action);
  writes.set(id, task);
  return task.finally(() => {
    if (writes.get(id) === task) writes.delete(id);
  });
}
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
async function owner(id: string) {
  const resident = (await readVillageState()).villagers.find((item) => item.characterId === id);
  if (!resident) throw notFound("That resident no longer lives here.");
  return resident;
}
export async function readSpriteManager(id: string): Promise<SpriteManagerState> {
  return (await owner(id)).spriteManager ?? emptySpriteManager();
}
async function commit(id: string, addedAt: string, change: (manager: SpriteManagerState) => void) {
  await mutateVillageState((village) => {
    const resident = village.villagers.find((item) => item.characterId === id && item.addedAt === addedAt);
    if (!resident) throw conflict("The resident changed. Reopen Sprite Manager.");
    resident.spriteManager ??= emptySpriteManager();
    change(resident.spriteManager);
  });
}
async function result(id: string) {
  return { manager: await readSpriteManager(id), snapshot: await buildVillageSnapshot() };
}
export async function decodeSpriteImage(image: string): Promise<SpritePixels> {
  const decoded = decodeVillageImageDataUrl(image, { label: "sprite", maxBase64Length: 16_000_000 });
  if (!["image/png", "image/jpeg", "image/webp"].includes(decoded.mime))
    throw badRequest("Choose a PNG, WebP, or JPEG image.");
  const size = await inspectVillageImage(image);
  try {
    if (decoded.mime === "image/png") {
      const png = PNG.sync.read(Buffer.from(decoded.bytes));
      if (png.width !== size.width || png.height !== size.height) throw new Error("Image dimensions changed");
      return { ...size, data: new Uint8ClampedArray(png.data) };
    }
    const { default: sharp } = await import("sharp");
    const { data, info } = await sharp(Buffer.from(decoded.bytes), { limitInputPixels: 16_000_000 })
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
  } catch {
    throw badRequest("This image is corrupt or could not be decoded. Choose another PNG, WebP, or JPEG.");
  }
}
export function spritePng(image: SpritePixels) {
  return (
    "data:image/png;base64," +
    PNG.sync.write({ width: image.width, height: image.height, data: Buffer.from(image.data) }).toString("base64")
  );
}
async function saveImage(assetId: string, expression: string, image: string) {
  const saved = asRecord(await villageEngineJson(`/api/sprites/${assetId}`, { body: { expression, image } }));
  const filename = asString(saved.filename);
  if (!/^[a-z0-9_-]{1,40}\.(png|jpeg|jpg|webp)$/.test(filename))
    throw badRequest("Engine could not save a usable sprite file.");
  return { filename, url: `/api/sprites/${assetId}/file/${filename}` };
}
async function readImage(url: string) {
  const response = await fetch(villageEngineBaseUrl() + url);
  if (!response.ok || Number(response.headers.get("content-length")) > 12_000_000)
    throw badRequest("The sprite image could not be read.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 12_000_000) throw badRequest("The sprite is empty or exceeds the image limit.");
  const mime =
    bytes[0] === 137 && bytes[1] === 80
      ? "image/png"
      : bytes[0] === 255 && bytes[1] === 216
        ? "image/jpeg"
        : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP"
          ? "image/webp"
          : "";
  if (!mime) throw badRequest("Choose a PNG, WebP, or JPEG sprite.");
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
async function prepareArtwork(
  name: string,
  image: string,
  engineSource?: SpriteArtwork["engineSource"],
): Promise<SpriteArtwork> {
  const source = await decodeSpriteImage(image);
  const frame = initialSpriteFrame(source.width, source.height);
  const processed = renderSpritePixels(source, frame);
  const assetId = `villages-${randomUUID()}`;
  // Preserve the upload; Scene derivatives are independent PNGs.
  const original = image;
  const savedSource = await saveImage(assetId, "original", original);
  const rendered = await saveImage(assetId, "r-" + randomUUID().replaceAll("-", ""), spritePng(processed.image));
  return {
    id: "a-" + randomUUID(),
    name: name.slice(0, 100) || "Artwork",
    assetId,
    origin: engineSource ? "engine" : "upload",
    engineSource,
    source: {
      ...savedSource,
      width: source.width,
      height: source.height,
      sha256: digest(Buffer.from(original.split(",")[1]!, "base64")),
    },
    rendered,
    frame,
    warnings: processed.warnings,
  };
}
export function importSpriteArtwork(id: string, raw: unknown) {
  return serialize(id, async () => {
    const resident = await owner(id),
      body = asRecord(raw);
    const entries = (Array.isArray(body.images) ? body.images : []).map(asRecord);
    if (!entries.length || entries.length > 40) throw badRequest("Upload between one and forty individual images.");
    // Decode every file before storing any, so a corrupt batch cannot replace assignments.
    for (const entry of entries) await decodeSpriteImage(asString(entry.image));
    const artwork: SpriteArtwork[] = [];
    for (const entry of entries) artwork.push(await prepareArtwork(asString(entry.name), asString(entry.image)));
    await commit(id, resident.addedAt, (manager) => {
      manager.artwork.push(...artwork);
    });
    return { ...(await result(id)), addedArtworkIds: artwork.map((item) => item.id) };
  });
}
export async function listSpriteLibrary(id: string): Promise<{ items: SpriteLibraryItem[]; error: string }> {
  const manager = (await owner(id)).spriteManager ?? emptySpriteManager();
  try {
    await villageEngineJson(`/api/characters/${encodeURIComponent(id)}`);
    const files = await villageEngineJson<unknown>(`/api/sprites/${encodeURIComponent(id)}`);
    const available = (Array.isArray(files) ? files : []).map(asRecord).flatMap((file) => {
      const filename = asString(file.filename);
      if (!isEngineSpriteFilename(filename)) return [];
      return [{ filename, url: `/api/sprites/${encodeURIComponent(id)}/file/${encodeURIComponent(filename)}` }];
    });
    const items = await Promise.all(
      available.map(async (file) => {
        let adopted = manager.artwork.find(
          (art) => art.engineSource?.characterId === id && art.engineSource.filename === file.filename,
        );
        // Older adoptions retained only the filename as their name. Match bytes too,
        // so a different upload with the same name remains independent.
        const legacy = manager.artwork.filter(
          (art) => !art.engineSource && art.origin !== "upload" && art.name === file.filename.slice(0, 100),
        );
        if (!adopted && legacy.length) {
          try {
            const image = await readImage(file.url);
            const hash = digest(Buffer.from(image.split(",")[1]!, "base64"));
            adopted = legacy.find((art) => art.source.sha256 === hash);
          } catch {
            // An unreadable legacy source must not hide the other library files.
          }
        }
        return { ...file, ...(adopted ? { adoptedArtworkId: adopted.id } : {}) };
      }),
    );
    return { items, error: "" };
  } catch {
    return {
      items: [],
      error: "The Engine character sprite library is unavailable. You can still upload and manage artwork.",
    };
  }
}
export function adoptSpriteArtwork(id: string, raw: unknown) {
  return serialize(id, async () => {
    const resident = await owner(id),
      body = asRecord(raw);
    const selected = Array.isArray(body.filenames) ? body.filenames.map(asString) : [];
    if (!selected.length || selected.length > 40 || new Set(selected).size !== selected.length)
      throw badRequest("Choose between one and forty different character sprites.");
    const library = await listSpriteLibrary(id);
    const artwork: SpriteArtwork[] = [];
    const selectedArtworkIds: string[] = [];
    const reused: { artworkId: string; filename: string }[] = [];
    for (const filename of selected) {
      const file = library.items.find((item) => item.filename === filename);
      if (!file) throw badRequest("The character library changed. Refresh it before choosing sprites.");
      if (file.adoptedArtworkId) {
        selectedArtworkIds.push(file.adoptedArtworkId);
        if (!findArtwork(resident.spriteManager!, file.adoptedArtworkId).engineSource)
          reused.push({ artworkId: file.adoptedArtworkId, filename });
      } else {
        const art = await prepareArtwork(filename, await readImage(file.url), { characterId: id, filename });
        artwork.push(art);
        selectedArtworkIds.push(art.id);
      }
    }
    if (artwork.length || reused.length)
      await commit(id, resident.addedAt, (manager) => {
        manager.artwork.push(...artwork);
        for (const entry of reused) {
          const art = findArtwork(manager, entry.artworkId);
          art.engineSource = { characterId: id, filename: entry.filename };
          art.origin = "engine";
        }
      });
    return { ...(await result(id)), addedArtworkIds: artwork.map((item) => item.id), selectedArtworkIds };
  });
}
function findArtwork(manager: SpriteManagerState, id: string) {
  const art = manager.artwork.find((item) => item.id === id);
  if (!art) throw notFound("That artwork is no longer available.");
  return art;
}
export function saveSpriteArtwork(id: string, raw: unknown) {
  return serialize(id, async () => {
    const resident = await owner(id),
      manager = resident.spriteManager ?? emptySpriteManager(),
      body = asRecord(raw);
    const art = findArtwork(manager, asString(body.artworkId));
    if (body.expectedUrl !== art.rendered.url)
      throw conflict("This artwork changed. Reload Sprite Manager before saving.");
    const frame = asRecord(body.frame) as unknown as SpriteFrame;
    const image = await readImage(art.source.url);
    const bytes = decodeVillageImageDataUrl(image, { label: "sprite", maxBase64Length: 16_000_000 }).bytes;
    if (digest(bytes) !== art.source.sha256) throw conflict("The saved original changed. Upload the artwork again.");
    let processed;
    try {
      processed = renderSpritePixels(await decodeSpriteImage(image), frame);
    } catch (error) {
      throw badRequest(error instanceof Error ? error.message : "Check the artwork framing.");
    }
    if (processed.clipped)
      throw badRequest("Artwork exceeds the safe margin. Reduce scale or adjust the crop and position before saving.");
    const name = asString(body.name).trim(),
      useWhen = asString(body.useWhen).trim();
    if (!name || name.length > 100 || useWhen.length > 1000)
      throw badRequest("Choose an expression name of 1–100 characters and a description of at most 1000 characters.");
    if (body.view !== "front" && body.view !== "side") throw badRequest("Choose front or side view.");
    const expressionId = asString(body.expressionId) || "e-" + randomUUID();
    if (body.expressionId && !manager.expressions.some((item) => item.id === expressionId))
      throw badRequest("That expression is no longer available.");
    const rendered = await saveImage(art.assetId, "r-" + randomUUID().replaceAll("-", ""), spritePng(processed.image));
    await commit(id, resident.addedAt, (next) => {
      const current = findArtwork(next, art.id);
      if (current.rendered.url !== body.expectedUrl) throw conflict("This artwork changed. Reload Sprite Manager.");
      current.frame = frame;
      current.rendered = rendered;
      current.warnings = processed.warnings;
      const expression = next.expressions.find((item) => item.id === expressionId);
      if (expression) {
        expression.name = name;
        expression.useWhen = useWhen;
      } else next.expressions.push({ id: expressionId, name, useWhen });
      next.assignments = next.assignments.filter(
        (item) => item.expressionId !== expressionId || item.view !== body.view,
      );
      next.assignments.push({ expressionId, view: body.view as "front" | "side", artworkId: art.id });
      next.defaultExpressionId ??= expressionId;
    });
    return result(id);
  });
}
export function setSpriteDefault(id: string, raw: unknown) {
  return serialize(id, async () => {
    const resident = await owner(id),
      expressionId = asString(asRecord(raw).expressionId);
    await commit(id, resident.addedAt, (manager) => {
      if (!manager.assignments.some((item) => item.expressionId === expressionId))
        throw badRequest("Choose an expression with assigned artwork.");
      manager.defaultExpressionId = expressionId;
    });
    return result(id);
  });
}
export function setSpriteFraming(id: string, raw: unknown) {
  return serialize(id, async () => {
    const resident = await owner(id),
      body = asRecord(raw);
    // Older clients may still send cropPercent; Scene rendering uses only mode.
    if (!["full", "half"].includes(asString(body.mode))) throw badRequest("Choose full or half body.");
    await commit(id, resident.addedAt, (manager) => {
      manager.framing = { mode: body.mode as "full" | "half" };
    });
    return result(id);
  });
}
export function removeSpriteArtwork(id: string, raw: unknown) {
  return serialize(id, async () => {
    const resident = await owner(id),
      body = asRecord(raw);
    const art = findArtwork(resident.spriteManager ?? emptySpriteManager(), asString(body.artworkId));
    if (body.expectedUrl !== art.rendered.url)
      throw conflict("This artwork changed. Reload Sprite Manager before removing it.");
    await commit(id, resident.addedAt, (manager) => {
      manager.artwork = manager.artwork.filter((item) => item.id !== art.id);
      manager.assignments = manager.assignments.filter((item) => item.artworkId !== art.id);
      manager.expressions = manager.expressions.filter((item) =>
        manager.assignments.some((assignment) => assignment.expressionId === item.id),
      );
      if (!manager.assignments.some((item) => item.expressionId === manager.defaultExpressionId))
        manager.defaultExpressionId = manager.assignments[0]?.expressionId;
    });
    // Only files owned by this new manager entry. Never scan or delete old Studio art.
    for (const filename of [art.source.filename, art.rendered.filename]) {
      try {
        await deleteVillageSpriteFile(art.assetId, filename.replace(/\.[^.]+$/, ""));
      } catch {
        villagesLogger().warn("A removed Sprite Manager file could not be deleted; its assignment is removed.");
      }
    }
    return result(id);
  });
}
