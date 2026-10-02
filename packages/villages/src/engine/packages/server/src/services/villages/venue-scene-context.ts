import { villageRelevantOrigin } from "./prompt-preset.js";

/** Preserve the shared founding facts as history, separate from the current encounter. */
export function venueFoundingBackground(village: Parameters<typeof villageRelevantOrigin>[0]): string {
  const origin = villageRelevantOrigin(village, "founding");
  return origin
    ? "Shared historical background, separate from the current activity and individual ambitions:\n" + origin
    : "";
}
