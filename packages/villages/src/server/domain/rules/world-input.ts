import type { VillageState } from "../models/world.js";
import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import {
  boundText,
  HOME_BUILDING_ORDER,
  HOME_BUILDINGS,
  MAX_SETTING_LENGTH,
  MAX_VILLAGE_NAME_LENGTH,
  VILLAGES_PROMPT_BOX_MAX_LENGTH,
} from "./prompt-preset.js";

/**
 * Read the village's prompt box out of a request body.
 *
 * An over-long box is refused rather than silently truncated — the player is
 * editing text they can see, so quietly dropping the end of it would be the
 * worst possible outcome. `what` names the box the refusal is about, which is
 * now one name but was two.
 */
export function readPromptBox(value: unknown, what: string): string {
  if (typeof value !== "string") throw badRequest(`${what} must be text.`);
  if (value.length > VILLAGES_PROMPT_BOX_MAX_LENGTH) {
    throw badRequest(`${what} can be at most ${VILLAGES_PROMPT_BOX_MAX_LENGTH} characters.`);
  }
  return value;
}
/**
 * Read a village name out of a request body.
 *
 * Shared with the setup flow so the wizard and the settings panel cannot
 * disagree about what counts as a name. An over-long one is refused rather
 * than cut down: the player is looking at the field they typed it into.
 */
export function readVillageName(value: unknown): string {
  if (typeof value !== "string") throw badRequest("The village name must be text.");
  const name = value.trim();
  if (name.length === 0) throw badRequest("Give the village a name.");
  if (name.length > MAX_VILLAGE_NAME_LENGTH) {
    throw badRequest(`The village name can be at most ${MAX_VILLAGE_NAME_LENGTH} characters.`);
  }
  return name;
}
/** Read the setting out of a request body. Shared with the setup flow. */
export function readVillageSetting(value: unknown): string {
  if (typeof value !== "string") throw badRequest("The setting must be text.");
  if (value.length > MAX_SETTING_LENGTH) {
    throw badRequest(`The setting can be at most ${MAX_SETTING_LENGTH} characters.`);
  }
  return value.trim();
}
export function readHomeBuildingNames(value: unknown): VillageState["homeBuildingNames"] {
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    HOME_BUILDING_ORDER.map((kind) => [kind, boundText(record[kind], 60).trim() || HOME_BUILDINGS[kind].name]),
  ) as VillageState["homeBuildingNames"];
}
export function residenceCharacterId(value: unknown): string {
  const characterId = asTrimmedString(value);
  if (characterId.length === 0) throw badRequest("A character id is required.");
  return characterId;
}
export function residenceVenueId(value: unknown): string {
  const venueId = asTrimmedString(value);
  if (venueId.length === 0) throw badRequest("A venue id is required.");
  return venueId;
}
