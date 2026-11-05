import { badRequest } from "../../domain/rules/errors.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import { villageEngineBaseUrl } from "./engine-transport.js";
import { decodeVillageImageDataUrl, inspectVillageImage } from "./image-files.js";

type LoreImage = { path: string; caption: string };
// Engine's public Lorebook entry-image schema; covers and arbitrary URLs are not references.
const ENTRY_IMAGE_PATH =
  /^\/api\/lorebooks\/entry-images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$/;

export function readLoreEntryImages(value: unknown): LoreImage[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 4) throw badRequest("Invalid Lorebook image references.");
  return value.map((image) => {
    if (
      !image ||
      typeof image.path !== "string" ||
      !ENTRY_IMAGE_PATH.test(image.path) ||
      typeof image.caption !== "string" ||
      image.caption.length > 500
    )
      throw badRequest("Invalid Lorebook image references.");
    return { path: image.path, caption: image.caption };
  });
}

/** Load only Engine-owned entry images, with no redirects or unbounded response buffering. */
export async function readLoreImageReferences(images: readonly LoreImage[]): Promise<string[]> {
  const references: string[] = [];
  for (const image of readLoreEntryImages(images)) {
    const response = await fetch(new URL(image.path, villageEngineBaseUrl()), {
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok || !response.body)
      throw badRequest("A Lorebook reference image is unavailable. Restore it in Engine and retry.");
    const mime = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (!["image/png", "image/jpeg", "image/webp"].includes(mime ?? "")) {
      await response.body.cancel();
      throw badRequest("A Lorebook reference is not a supported image.");
    }
    const reader = response.body.getReader(),
      parts: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.length;
        if (size > Math.floor((MAX_LOCATION_IMAGE_BASE64_LENGTH * 3) / 4))
          throw badRequest("A Lorebook reference image is too large.");
        parts.push(chunk.value);
      }
    } finally {
      await reader.cancel();
    }
    const dataUrl = `data:${mime};base64,${Buffer.concat(parts).toString("base64")}`;
    decodeVillageImageDataUrl(dataUrl, {
      label: "Lorebook reference",
      maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
    });
    await inspectVillageImage(dataUrl);
    references.push(dataUrl);
  }
  return references;
}
