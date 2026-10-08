import type {
  SpriteArtwork,
  SpriteFrame,
  SpriteLibraryItem,
  SpriteManagerState,
} from "../../../shared/contracts/sprites.js";
import { initialSpriteFrame, renderSpritePixels, type SpritePixels } from "../../../shared/helpers/sprite-framing.js";
import type { VillageState, VillageSnapshot } from "../../domain/models/world.js";
import { decodeVillageImageDataUrl } from "../../adapters/engine/image-files.js";
import { asRecord, asString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { emptySpriteManager, isEngineSpriteFilename } from "../../domain/rules/sprite-manager-model.js";
import { createHash, randomUUID } from "node:crypto";
import { spritePng } from "./sprite-image-codec.js";
import type { SpriteWrites } from "./sprite-writes.js";

export interface SpriteManagerPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  decodeSpriteImage(image: string): Promise<SpritePixels>;
  villageEngineJson<T>(path: string, init?: { method?: string; body?: unknown; signal?: AbortSignal }): Promise<T>;
  readSpriteFile(url: string): Promise<Response>;
  deleteVillageSpriteFile(assetId: string, expression: string): Promise<void>;
  villagesLogger(): { warn(message: string): void };
  writes: SpriteWrites;
}

/** Commands retain explicit connections; the backend owns write admission. */
export function createSpriteManager({
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  decodeSpriteImage,
  villageEngineJson,
  readSpriteFile,
  deleteVillageSpriteFile,
  villagesLogger,
  writes,
}: SpriteManagerPorts) {
  const serialize = writes.serialize;
  const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
  async function owner(id: string) {
    const resident = (await readVillageState()).villagers.find((item) => item.characterId === id);
    if (!resident) throw notFound("That resident no longer lives here.");
    return resident;
  }
  async function readSpriteManager(id: string): Promise<SpriteManagerState> {
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
  async function saveImage(assetId: string, expression: string, image: string) {
    const saved = asRecord(await villageEngineJson(`/api/sprites/${assetId}`, { body: { expression, image } }));
    const filename = asString(saved.filename);
    if (!/^[a-z0-9_-]{1,40}\.(png|jpeg|jpg|webp)$/.test(filename))
      throw badRequest("Engine could not save a usable sprite file.");
    return { filename, url: `/api/sprites/${assetId}/file/${filename}` };
  }
  async function readImage(url: string) {
    const response = await readSpriteFile(url);
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
      ...(engineSource ? { origin: "engine" as const, engineSource } : { origin: "upload" as const }),
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
  function importSpriteArtwork(id: string, raw: unknown) {
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
  async function listSpriteLibrary(id: string): Promise<{ items: SpriteLibraryItem[]; error: string }> {
    const manager = (await owner(id)).spriteManager ?? emptySpriteManager();
    try {
      await villageEngineJson(`/api/characters/${encodeURIComponent(id)}`);
      const files = await villageEngineJson<unknown>(`/api/sprites/${encodeURIComponent(id)}`);
      const available = (Array.isArray(files) ? files : []).map(asRecord).flatMap((file) => {
        const filename = asString(file.filename);
        if (!isEngineSpriteFilename(filename)) return [];
        return [{ filename, url: `/api/sprites/${encodeURIComponent(id)}/file/${encodeURIComponent(filename)}` }];
      });
      const items = available.map((file) => {
        const adopted = manager.artwork.find(
          (art) =>
            art.origin === "engine" &&
            art.engineSource.characterId === id &&
            art.engineSource.filename === file.filename,
        );
        return { ...file, ...(adopted ? { adoptedArtworkId: adopted.id } : {}) };
      });
      return { items, error: "" };
    } catch {
      return {
        items: [],
        error: "The Engine character sprite library is unavailable. You can still upload and manage artwork.",
      };
    }
  }
  function adoptSpriteArtwork(id: string, raw: unknown) {
    return serialize(id, async () => {
      const resident = await owner(id),
        body = asRecord(raw);
      const selected = Array.isArray(body.filenames) ? body.filenames.map(asString as (value: unknown) => string) : [];
      if (!selected.length || selected.length > 40 || new Set(selected).size !== selected.length)
        throw badRequest("Choose between one and forty different character sprites.");
      const library = await listSpriteLibrary(id);
      const artwork: SpriteArtwork[] = [];
      const selectedArtworkIds: string[] = [];
      for (const filename of selected) {
        const file = library.items.find((item) => item.filename === filename);
        if (!file) throw badRequest("The character library changed. Refresh it before choosing sprites.");
        if (file.adoptedArtworkId) {
          selectedArtworkIds.push(file.adoptedArtworkId);
        } else {
          const art = await prepareArtwork(filename, await readImage(file.url), { characterId: id, filename });
          artwork.push(art);
          selectedArtworkIds.push(art.id);
        }
      }
      if (artwork.length)
        await commit(id, resident.addedAt, (manager) => {
          manager.artwork.push(...artwork);
        });
      return { ...(await result(id)), addedArtworkIds: artwork.map((item) => item.id), selectedArtworkIds };
    });
  }
  function findArtwork(manager: SpriteManagerState, id: string) {
    const art = manager.artwork.find((item) => item.id === id);
    if (!art) throw notFound("That artwork is no longer available.");
    return art;
  }
  function saveSpriteArtwork(id: string, raw: unknown) {
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
        throw badRequest(
          "Artwork exceeds the safe margin. Reduce scale or adjust the crop and position before saving.",
        );
      const name = asString(body.name).trim(),
        useWhen = asString(body.useWhen).trim();
      if (!name || name.length > 100 || useWhen.length > 1000)
        throw badRequest("Choose an expression name of 1–100 characters and a description of at most 1000 characters.");
      if (body.view !== "front" && body.view !== "side") throw badRequest("Choose front or side view.");
      const expressionId = asString(body.expressionId) || "e-" + randomUUID();
      if (body.expressionId && !manager.expressions.some((item) => item.id === expressionId))
        throw badRequest("That expression is no longer available.");
      const rendered = await saveImage(
        art.assetId,
        "r-" + randomUUID().replaceAll("-", ""),
        spritePng(processed.image),
      );
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
  function setSpriteDefault(id: string, raw: unknown) {
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
  function setSpriteFraming(id: string, raw: unknown) {
    return serialize(id, async () => {
      const resident = await owner(id),
        body = asRecord(raw);
      if (!["full", "half"].includes(asString(body.mode))) throw badRequest("Choose full or half body.");
      await commit(id, resident.addedAt, (manager) => {
        manager.framing = { mode: body.mode as "full" | "half" };
      });
      return result(id);
    });
  }
  function pruneSpriteExpressions(manager: SpriteManagerState) {
    manager.expressions = manager.expressions.filter((item) =>
      manager.assignments.some((assignment) => assignment.expressionId === item.id),
    );
    if (!manager.assignments.some((item) => item.expressionId === manager.defaultExpressionId))
      manager.defaultExpressionId = manager.assignments[0]?.expressionId;
  }
  function removeSpriteAssignment(id: string, raw: unknown) {
    return serialize(id, async () => {
      const resident = await owner(id),
        body = asRecord(raw),
        expressionId = asString(body.expressionId);
      if (body.view !== "front" && body.view !== "side") throw badRequest("Choose front or side view.");
      await commit(id, resident.addedAt, (manager) => {
        const art = findArtwork(manager, asString(body.artworkId));
        if (body.expectedUrl !== art.rendered.url)
          throw conflict("This artwork changed. Reload Sprite Manager before removing its assignment.");
        const assignment = manager.assignments.find(
          (item) => item.expressionId === expressionId && item.view === body.view,
        );
        if (!assignment || assignment.artworkId !== art.id)
          throw conflict("This assignment changed. Reload Sprite Manager before removing it.");
        manager.assignments = manager.assignments.filter((item) => item !== assignment);
        pruneSpriteExpressions(manager);
      });
      return result(id);
    });
  }
  function removeSpriteArtwork(id: string, raw: unknown) {
    return serialize(id, async () => {
      const resident = await owner(id),
        body = asRecord(raw);
      const art = findArtwork(resident.spriteManager ?? emptySpriteManager(), asString(body.artworkId));
      if (body.expectedUrl !== art.rendered.url)
        throw conflict("This artwork changed. Reload Sprite Manager before removing it.");
      await commit(id, resident.addedAt, (manager) => {
        manager.artwork = manager.artwork.filter((item) => item.id !== art.id);
        manager.assignments = manager.assignments.filter((item) => item.artworkId !== art.id);
        pruneSpriteExpressions(manager);
      });
      // Delete only the original and derivative owned by this manager entry.
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

  return {
    readSpriteManager,
    importSpriteArtwork,
    listSpriteLibrary,
    adoptSpriteArtwork,
    saveSpriteArtwork,
    setSpriteDefault,
    setSpriteFraming,
    removeSpriteAssignment,
    removeSpriteArtwork,
    decodeSpriteImage,
  };
}
export type SpriteManager = ReturnType<typeof createSpriteManager>;
