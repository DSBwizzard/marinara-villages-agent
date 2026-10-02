import { randomUUID } from "node:crypto";
import { asRecord, asString } from "./coerce.js";
import { villageEngineBaseUrl, villageEngineJson } from "./engine-loopback.js";
import { badRequest, notFound } from "./errors.js";
import { decodeVillageImageDataUrl, inspectVillageImage } from "./image-generation.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { buildVillageSnapshot } from "./village.js";

const MAX_SPRITE_DATA_URL = 8_000_000;
const STARTER_EXPRESSIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking"] as const;
type SpriteView = "front" | "side";

export function readSpriteView(value: unknown): SpriteView {
  if (value === undefined || value === "front") return "front";
  if (value === "side") return "side";
  throw badRequest("Choose front or side view.");
}

export function readSpriteExpression(value: unknown): string {
  const expression = typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "_") : "";
  if (!/^[a-z0-9_-]{1,40}$/.test(expression))
    throw badRequest("Use a short expression name with letters, numbers, dashes, or underscores.");
  return expression;
}

async function resident(characterId: string) {
  const village = await readVillageState();
  const found = village.villagers.find((entry) => entry.characterId === characterId);
  if (!found) throw notFound("That resident no longer lives in this village.");
  return found;
}

export function generatedMime(bytes: Uint8Array): string {
  if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216) return "image/jpeg";
  if (bytes[0] === 82 && bytes[1] === 73 && bytes[8] === 87 && bytes[9] === 69) return "image/webp";
  throw badRequest("The image connection returned a sprite format Villages cannot preview.");
}

export async function generateResidentSprite(
  characterId: string,
  input: {
    view?: unknown;
    expression?: unknown;
    appearance?: unknown;
    useReference?: unknown;
  },
): Promise<{ view: SpriteView; expression: string; image: string; width: number; height: number }> {
  await resident(characterId);
  const view = readSpriteView(input.view);
  const expression = readSpriteExpression(input.expression);
  const { generateLegacyStudioSprite } = await import("./sprite-studio.js");
  const image = await generateLegacyStudioSprite(characterId, { ...input, view, expression });
  return { view, expression, image, width: 512, height: 768 };
}

export async function approveResidentSprite(
  characterId: string,
  input: {
    view?: unknown;
    expression?: unknown;
    image?: unknown;
  },
) {
  const owner = await resident(characterId);
  const view = readSpriteView(input.view);
  const expression = readSpriteExpression(input.expression);
  const image = typeof input.image === "string" ? input.image : "";
  decodeVillageImageDataUrl(image, { label: "sprite", maxBase64Length: MAX_SPRITE_DATA_URL });
  await inspectVillageImage(image);
  const assetId =
    view === "side"
      ? (owner.sprite?.sideAssetId ?? `villages-${randomUUID()}`)
      : (owner.sprite?.assetId ?? `villages-${randomUUID()}`);
  const saved = asRecord(
    await villageEngineJson<unknown>(`/api/sprites/${assetId}`, {
      // Publish the new filename only after persistence succeeds. Existing approved
      // bytes must remain intact if the village document update fails.
      body: { expression: "s-" + randomUUID().replaceAll("-", ""), image },
    }),
  );
  const filename = asString(saved.filename);
  if (!/^[a-z0-9_-]{1,40}\.(?:png|jpg|jpeg|webp|avif)$/.test(filename)) {
    throw badRequest("The Engine saved the sprite without a usable filename.");
  }
  await mutateVillageState((state) => {
    const current = state.villagers.find((entry) => entry.characterId === characterId);
    if (!current) throw notFound("That resident no longer lives in this village.");
    const prior = current.sprite;
    current.sprite = {
      ...prior,
      assetId: prior?.assetId ?? assetId,
      ...(view === "side" || prior?.sideAssetId ? { sideAssetId: prior?.sideAssetId ?? assetId } : {}),
      expressions: [
        ...(prior?.expressions.filter((entry) => entry.view !== view || entry.label !== expression) ?? []),
        { view, label: expression, filename, revision: Date.now() },
      ],
      framing: prior?.framing ?? { mode: "full", cropPercent: 58 },
    };
  });
  return buildVillageSnapshot();
}

export async function removeResidentSprite(
  characterId: string,
  input: { view?: unknown; expression?: unknown; expectedUrl?: unknown },
) {
  const view = readSpriteView(input.view);
  const expression = readSpriteExpression(input.expression);
  const expectedUrl = typeof input.expectedUrl === "string" ? input.expectedUrl : "";
  await mutateVillageState((state) => {
    const current = state.villagers.find((entry) => entry.characterId === characterId);
    if (!current) throw notFound("That resident no longer lives in this village.");
    const sprite = current.sprite;
    const approved = sprite?.expressions.find((entry) => entry.view === view && entry.label === expression);
    if (!sprite || !approved) throw notFound("That approved sprite is no longer active.");
    const assetId = approved.assetId ?? (view === "side" ? sprite.sideAssetId : sprite.assetId);
    const url = `/api/sprites/${assetId}/file/${encodeURIComponent(approved.filename)}${approved.revision ? `?v=${approved.revision}` : ""}`;
    if (expectedUrl !== url) throw badRequest("This sprite changed. Refresh Sprite Studio before removing it.");
    sprite.expressions = sprite.expressions.filter((entry) => entry !== approved);
    if (!sprite.expressions.some((entry) => entry.expressionId === sprite.defaultExpressionId))
      sprite.defaultExpressionId =
        sprite.expressions.find((entry) => entry.label === "neutral")?.expressionId ??
        sprite.expressions[0]?.expressionId;
    if (sprite.expressions.length === 0) current.sprite = null;
  });
  return buildVillageSnapshot();
}

export async function setResidentSpriteFraming(characterId: string, input: { mode?: unknown; cropPercent?: unknown }) {
  const mode = input.mode === "half" ? "half" : input.mode === "full" ? "full" : null;
  const cropPercent = input.cropPercent;
  if (
    !mode ||
    typeof cropPercent !== "number" ||
    !Number.isFinite(cropPercent) ||
    cropPercent < 40 ||
    cropPercent > 85
  ) {
    throw badRequest("Choose full or half body and a crop from 40% to 85%.");
  }
  await mutateVillageState((state) => {
    const current = state.villagers.find((entry) => entry.characterId === characterId);
    if (!current?.sprite) throw notFound("This resident has no approved sprites.");
    current.sprite.framing = { mode, cropPercent };
  });
  return buildVillageSnapshot();
}

export async function listSourceResidentSprites(
  characterId: string,
): Promise<Array<{ expression: string; url: string }>> {
  await resident(characterId);
  const items = await villageEngineJson<unknown>(`/api/sprites/${encodeURIComponent(characterId)}`);
  return (Array.isArray(items) ? items : [])
    .map(asRecord)
    .filter((item) => /^full_[a-z0-9_-]{1,40}$/.test(asString(item.expression)))
    .map((item) => ({ expression: asString(item.expression).slice(5), url: asString(item.url) }))
    .filter((item) => item.url.startsWith(`/api/sprites/${encodeURIComponent(characterId)}/file/`));
}

export async function importSourceResidentSprite(characterId: string, expressionValue: unknown, viewValue?: unknown) {
  const view = readSpriteView(viewValue);
  const expression = readSpriteExpression(expressionValue);
  const source = (await listSourceResidentSprites(characterId)).find((entry) => entry.expression === expression);
  if (!source) throw notFound("That full-body Engine sprite is unavailable.");
  const response = await fetch(`${villageEngineBaseUrl()}${source.url}`);
  if (!response.ok) throw badRequest("The source sprite could not be read.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length > 6_000_000) throw badRequest("The source sprite exceeds the image limit.");
  const mime = generatedMime(bytes);
  return approveResidentSprite(characterId, {
    view,
    expression,
    image: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`,
  });
}

export const RESIDENT_SPRITE_STARTER_EXPRESSIONS = STARTER_EXPRESSIONS;
