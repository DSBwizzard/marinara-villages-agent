import type { VillageVenueImage } from "../../domain/models/world.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import { badRequest } from "../../domain/rules/errors.js";
import { villageEngineBaseUrl, villageEngineJson } from "./engine-transport.js";
import { decodeVillageImageDataUrl, inspectVillageImage } from "./image-files.js";

/** References can only read an exact, registered Engine gallery file; never an arbitrary URL. */
export async function readZonePictureReference(
  image: VillageVenueImage,
): Promise<{ dataUrl: string; width: number; height: number }> {
  if (image.ref !== `global-gallery:${image.id}` || !/^\/api\/global-gallery\/file\/[\w.-]+$/.test(image.url))
    throw badRequest("This picture cannot be used as an editing reference.");
  const rows = await villageEngineJson<unknown>("/api/global-gallery");
  if (!Array.isArray(rows) || !rows.some((row) => row?.id === image.id && row?.url === image.url))
    throw badRequest("The original picture is no longer available.");
  const response = await fetch(new URL(image.url, villageEngineBaseUrl()), {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || !response.body) throw badRequest("The original picture is unavailable.");
  const reader = response.body.getReader(),
    parts: Uint8Array[] = [];
  const maxBytes = Math.floor((MAX_LOCATION_IMAGE_BASE64_LENGTH * 3) / 4);
  let total = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      total += chunk.value.length;
      if (total > maxBytes) throw badRequest("This picture is too large to edit.");
      parts.push(chunk.value);
    }
  } finally {
    await reader.cancel();
  }
  const mime = response.headers.get("content-type")?.split(";")[0] ?? "";
  const dataUrl = `data:${mime};base64,${Buffer.concat(parts).toString("base64")}`;
  decodeVillageImageDataUrl(dataUrl, { label: "Zone reference", maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH });
  return { dataUrl, ...(await inspectVillageImage(dataUrl)) };
}
