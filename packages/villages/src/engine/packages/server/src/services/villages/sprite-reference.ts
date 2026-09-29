import { randomUUID } from "node:crypto";
import { villageEngineBaseUrl, villageEngineJson } from "./engine-loopback.js";
import { asRecord, asString } from "./coerce.js";
import { inspectVillageImage, decodeVillageImageDataUrl } from "./image-generation.js";

export type SpriteReference = { url: string; capturedAt: string; origin: "snapshot" | "current-card" | "upload" };

export async function saveStudioImage(image: string, expression = "original", requestedAssetId?: string) {
  decodeVillageImageDataUrl(image, { label: "sprite", maxBase64Length: 16_000_000 });
  const size = await inspectVillageImage(image);
  const assetId = requestedAssetId ?? `villages-${randomUUID()}`;
  if (!/^villages-[a-f0-9-]{36}$/i.test(assetId)) throw new Error("Invalid Villages sprite asset id.");
  const saved = asRecord(await villageEngineJson(`/api/sprites/${assetId}`, { body: { expression, image } }));
  const filename = asString(saved.filename);
  if (!/^[a-z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(filename))
    throw new Error("The Engine did not save a supported sprite image.");
  return { assetId, url: `/api/sprites/${assetId}/file/${filename}`, ...size };
}

export async function captureSpriteReference(
  characterId: string,
  origin: SpriteReference["origin"],
  image?: string,
): Promise<SpriteReference | null> {
  if (!image) {
    const card = asRecord(await villageEngineJson(`/api/characters/${encodeURIComponent(characterId)}`));
    const path = asString(card.avatarPath).split("?")[0]!;
    if (!/^\/api\/avatars\/file\/[A-Za-z0-9_.-]+$/.test(path)) return null;
    const response = await fetch(`${villageEngineBaseUrl()}${path}`);
    if (!response.ok) throw new Error("The character avatar could not be read.");
    const length = Number(response.headers.get("content-length"));
    if (length > 12_000_000) throw new Error("The reference image is too large.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length > 12_000_000) throw new Error("The reference image is too large.");
    const mime = response.headers.get("content-type")?.split(";")[0] || "image/png";
    image = `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
  }
  const saved = await saveStudioImage(image, "reference");
  return { url: saved.url, capturedAt: new Date().toISOString(), origin };
}

/** A missing avatar must not prevent adopting a character. Studio offers explicit recovery. */
export async function captureSnapshotSpriteReference(characterId: string) {
  try {
    return (await captureSpriteReference(characterId, "snapshot")) ?? undefined;
  } catch {
    return undefined;
  }
}
