import { MAX_IDENTITY_DESCRIPTION_LENGTH } from "../../../shared/contracts/resident-description.js";
import type { VillageVillager } from "../models/world.js";
import { randomVillageSeed } from "./village-clock.js";

export function initialIdentityDescription() {
  return { text: "", revision: randomVillageSeed(), initialGenerationComplete: false };
}

export function generatedIdentityDescription(value: unknown): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!text || text.length > MAX_IDENTITY_DESCRIPTION_LENGTH || /[\r\n]/u.test(text)) return "";
  if (/^(?:[-*•]|\d+[.)])\s/u.test(text)) return "";
  return [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(text)].length === 1 ? text : "";
}

/** A player edit, completed preparation, or new resident incarnation wins over delayed output. */
export function applyInitialIdentityDescription(resident: VillageVillager, revision: unknown, value: unknown): void {
  const description = resident.identityDescription;
  if (!description || description.initialGenerationComplete || description.revision !== revision) return;
  description.text = generatedIdentityDescription(value);
  description.initialGenerationComplete = true;
  description.revision = randomVillageSeed();
}
