import { decodeVillageImageDataUrl } from "../../adapters/engine/image-files.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import { MAX_VENUE_IMAGE_BYTES } from "../../domain/rules/prompt-preset.js";
/** Supplied image decoding is available before an activation is configured. */

export function decodeImageDataUrl(value: unknown) {
  return decodeVillageImageDataUrl(value, {
    label: "place picture",
    maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
    tooLargeMessage: `A place's picture can be at most ${Math.round(MAX_VENUE_IMAGE_BYTES / 1_000_000)} MB of image data.`,
  });
}
