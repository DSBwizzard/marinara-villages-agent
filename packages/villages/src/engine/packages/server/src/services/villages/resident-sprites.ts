import { randomUUID } from "node:crypto";
import { asRecord, asString } from "./coerce.js";
import { villageEngineBaseUrl, villageEngineJson } from "./engine-loopback.js";
import { badRequest, notFound } from "./errors.js";
import { decodeVillageImageDataUrl, inspectVillageImage, resolveVillageImageConnectionId } from "./image-generation.js";
import { mutateVillageState, readVillageState } from "./village-store.js";
import { buildVillageSnapshot } from "./village.js";

const MAX_SPRITE_DATA_URL = 8_000_000;
const STARTER_EXPRESSIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking"] as const;

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

function spriteUrl(assetId: string, filename: string): string {
  return `/api/sprites/${assetId}/file/${encodeURIComponent(filename)}`;
}

async function sourcePortrait(characterId: string): Promise<string | null> {
  try {
    const card = asRecord(await villageEngineJson<unknown>(`/api/characters/${encodeURIComponent(characterId)}`));
    const path = asString(card.avatarPath);
    return /^\/api\/avatars\/file\/[A-Za-z0-9_.-]+$/.test(path) ? path : null;
  } catch {
    return null;
  }
}

function generatedMime(bytes: Uint8Array): string {
  if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216) return "image/jpeg";
  if (bytes[0] === 82 && bytes[1] === 73 && bytes[8] === 87 && bytes[9] === 69) return "image/webp";
  throw badRequest("The image connection returned a sprite format Villages cannot preview.");
}

export async function generateResidentSprite(
  characterId: string,
  input: {
    expression?: unknown;
    appearance?: unknown;
    useReference?: unknown;
  },
): Promise<{ expression: string; image: string; width: number; height: number }> {
  const owner = await resident(characterId);
  const expression = readSpriteExpression(input.expression);
  if (
    !owner.sprite?.expressions.some((entry) => entry.label === expression) &&
    (owner.sprite?.expressions.length ?? 0) >= 24
  ) {
    throw badRequest("This resident already has the maximum of 24 expressions.");
  }
  const neutral = owner.sprite?.expressions.find((entry) => entry.label === "neutral");
  if (expression !== "neutral" && !neutral) throw badRequest("Approve a neutral sprite before generating expressions.");
  const appearance =
    typeof input.appearance === "string" && input.appearance.trim()
      ? input.appearance.trim()
      : owner.cardSnapshot.appearance.trim() || owner.cardSnapshot.description.trim();
  if (!appearance || appearance.length > 2000)
    throw badRequest("Describe the resident's appearance in at most 2,000 characters.");
  const useReference = input.useReference !== false;
  const portrait = useReference ? await sourcePortrait(characterId) : null;
  const connectionId = await resolveVillageImageConnectionId();
  const body = {
    connectionId,
    appearance: `${owner.cardSnapshot.name}: ${appearance}`,
    expressions: [expression],
    cols: 1,
    rows: 1,
    spriteType: "full-body",
    fullBodyExpressionMode: expression !== "neutral",
    noBackground: true,
    nativeTransparentPng: true,
    ...(useReference && neutral && owner.sprite
      ? { neutralFullBodyReference: spriteUrl(owner.sprite.assetId, neutral.filename) }
      : {}),
    ...(portrait ? { referenceImages: [portrait] } : {}),
  };
  let generated: unknown;
  try {
    generated = await villageEngineJson<unknown>("/api/sprites/generate-sheet", { body });
  } catch (error) {
    // Some image connections accept only one reference. The approved full-body
    // neutral already carries the resident's identity, so retry with that alone.
    if (
      !body.fullBodyExpressionMode ||
      !portrait ||
      !neutral ||
      !String(error).includes("All full-body expression generations failed")
    )
      throw error;
    generated = await villageEngineJson<unknown>("/api/sprites/generate-sheet", {
      body: { ...body, referenceImages: [] },
    });
  }
  const answer = asRecord(generated);
  const cell = Array.isArray(answer.cells) ? asRecord(answer.cells[0]) : {};
  const base64 = asString(cell.base64);
  if (!base64 || base64.length > MAX_SPRITE_DATA_URL)
    throw badRequest("The image connection returned no usable sprite or exceeded the image limit.");
  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  const image = `data:${generatedMime(bytes)};base64,${base64}`;
  const size = await inspectVillageImage(image);
  return { expression, image, ...size };
}

export async function approveResidentSprite(
  characterId: string,
  input: {
    expression?: unknown;
    image?: unknown;
  },
) {
  const owner = await resident(characterId);
  const expression = readSpriteExpression(input.expression);
  if (
    !owner.sprite?.expressions.some((entry) => entry.label === expression) &&
    (owner.sprite?.expressions.length ?? 0) >= 24
  ) {
    throw badRequest("This resident already has the maximum of 24 expressions.");
  }
  if (expression !== "neutral" && !owner.sprite?.expressions.some((entry) => entry.label === "neutral")) {
    throw badRequest("Approve a neutral sprite before saving expressions.");
  }
  const image = typeof input.image === "string" ? input.image : "";
  decodeVillageImageDataUrl(image, { label: "sprite", maxBase64Length: MAX_SPRITE_DATA_URL });
  await inspectVillageImage(image);
  const assetId = owner.sprite?.assetId ?? `villages-${randomUUID()}`;
  const saved = asRecord(
    await villageEngineJson<unknown>(`/api/sprites/${assetId}`, {
      body: { expression, image },
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
      assetId,
      expressions: [
        ...(prior?.expressions.filter((entry) => entry.label !== expression) ?? []),
        { label: expression, filename, revision: Date.now() },
      ],
      framing: prior?.framing ?? { mode: "full", cropPercent: 58 },
    };
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

export async function importSourceResidentSprite(characterId: string, expressionValue: unknown) {
  const expression = readSpriteExpression(expressionValue);
  const source = (await listSourceResidentSprites(characterId)).find((entry) => entry.expression === expression);
  if (!source) throw notFound("That full-body Engine sprite is unavailable.");
  const response = await fetch(`${villageEngineBaseUrl()}${source.url}`);
  if (!response.ok) throw badRequest("The source sprite could not be read.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length > 6_000_000) throw badRequest("The source sprite exceeds the image limit.");
  const mime = generatedMime(bytes);
  return approveResidentSprite(characterId, {
    expression,
    image: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`,
  });
}

export const RESIDENT_SPRITE_STARTER_EXPRESSIONS = STARTER_EXPRESSIONS;
