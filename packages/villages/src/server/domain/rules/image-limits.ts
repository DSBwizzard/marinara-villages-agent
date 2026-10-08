import { MAX_VENUE_IMAGE_BYTES } from "./prompt-preset.js";

export const MAX_LOCATION_IMAGE_BASE64_LENGTH = Math.ceil(MAX_VENUE_IMAGE_BYTES / 3) * 4;
