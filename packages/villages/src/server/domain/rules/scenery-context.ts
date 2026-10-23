import type { VillageState, VillageVenue } from "../models/world.js";
import { badRequest } from "./errors.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { RESIDENT_CONTINUITY_RULE } from "./resident-admission.js";
import { resolveVenueZone } from "./venue-zones.js";

export const DEFAULT_SCENERY_STYLE =
  "Painted storybook illustration, coherent brushwork, soft lighting, and a consistent color palette.";
export function readSceneryStyle(value: unknown): string {
  if (typeof value !== "string" || value.length > 600)
    throw badRequest("Scenery art style must be at most 600 characters.");
  return value.trim();
}
export function sceneryPrompt(required: string[], optional: string[], style = "", essential: string[] = []): string {
  const framing = [VILLAGE_SHARED_SETTING_RULE, style ? `Art style for this scenery: ${style}.` : ""]
    .filter(Boolean)
    .join("\n");
  const preserved = essential.filter(Boolean).join("\n");
  const parts = required.filter(Boolean);
  const budget = 4000 - framing.length - preserved.length - parts.length - 2;
  if (budget < 0)
    throw badRequest("The complete starting situations do not fit the image prompt. No image was requested.");
  // Keep short scene instructions intact and share the remaining room between long descriptions.
  let low = 0;
  let high = Math.max(0, budget);
  while (low < high) {
    const limit = Math.ceil((low + high) / 2);
    if (parts.reduce((length, part) => length + Math.min(part.length, limit), 0) <= budget) low = limit;
    else high = limit - 1;
  }
  let prompt = [
    ...parts.map((part) =>
      part.length <= low ? part : part.slice(0, Math.max(0, low - 1)).replace(/[\uD800-\uDBFF]$/u, "") + "…",
    ),
    framing,
    preserved,
  ].join("\n");
  for (const part of optional) if (part && prompt.length + part.length + 1 <= 4000) prompt += "\n" + part;
  return prompt;
}
export function sceneryCardsContext(
  cards: readonly {
    name: string;
    admission?: import("../../../shared/helpers/resident-admission.js").ResidentAdmission;
    summary?: string;
    personality?: string;
    backstory?: string;
    description?: string;
    appearance?: string;
  }[],
): string {
  const allowance = Math.min(600, Math.floor(1100 / Math.max(1, cards.length)));
  return cards
    .map((card) => {
      const name = card.name.slice(0, Math.min(60, Math.floor(allowance / 4)));
      const remaining = Math.max(0, allowance - name.length - 12);
      return [
        name,
        card.personality?.slice(0, Math.floor(remaining * 0.35)),
        card.summary?.slice(0, Math.floor(remaining * 0.2)),
        card.description?.slice(0, Math.floor(remaining * 0.2)),
        card.backstory?.slice(0, Math.floor(remaining * 0.15)),
        card.appearance?.slice(0, Math.floor(remaining * 0.1)),
      ]
        .filter(Boolean)
        .join("; ");
    })
    .join("\n");
}
export function sceneryCharacterContext(village: VillageState, venue: VillageVenue, ownerId = ""): string {
  if (!ownerId && !(venue.imageContext?.useAssignedVillagerContext ?? village.personalizeVenueImagesByDefault))
    return "";
  if (ownerId === "player")
    return [village.playerName, village.playerDescription.slice(0, 900)].filter(Boolean).join("; ");
  const ids = ownerId ? [ownerId] : [...(venue.residentIds ?? []), ...(venue.workerIds ?? [])];
  return sceneryCardsContext(
    village.villagers
      .filter((person) => ids.includes(person.characterId))
      .map((person) => ({ ...person.cardSnapshot, admission: person.admission })),
  );
}

export function sceneryImageKey(village: VillageState, venue: VillageVenue, zoneId = "exterior"): string {
  const zone = resolveVenueZone(venue, zoneId);
  const ownerId = zone?.kind === "private-residence" ? zone.ownerId : "";
  const personality =
    !!ownerId || (venue.imageContext?.useAssignedVillagerContext ?? village.personalizeVenueImagesByDefault);
  const ids = ownerId ? [ownerId] : [...(venue.residentIds ?? []), ...(venue.workerIds ?? [])];
  return JSON.stringify([
    zoneId,
    village.zonePictureEpoch ?? 0,
    zone?.pictureRevision ?? 0,
    zone?.freezePicture ?? false,
    village.sceneryArtStyle,
    village.sceneryStyleProfileId ?? null,
    village.setting,
    village.worldName,
    village.worldFacts,
    (venue.imageContext?.useVisualLore ?? village.useVisualLoreByDefault) ? village.selectedLorebookIds : [],
    personality && ownerId === "player" ? [village.playerPersonaId, village.playerName, village.playerDescription] : [],
    personality
      ? village.villagers
          .filter((person) => ids.includes(person.characterId))
          .map((person) =>
            person.admission ? { ...person.cardSnapshot, admission: person.admission } : person.cardSnapshot,
          )
      : [],
    venue.name,
    venue.venueType,
    venue.form,
    venue.layoutVersion,
    venue.zones?.map((area) => [area.id, area.kind, area.venueClass]),
    venue.residentIds,
    venue.workerIds,
    venue.imageContext,
    zone
      ? [
          zone.name,
          zone.purpose,
          zone.roomSpecification,
          zone.description,
          zone.state.condition,
          zone.state.items,
          zone.state.publicFacts,
          zone.image,
        ]
      : null,
  ]);
}

export function sceneryAdmissionContext(village: VillageState, venue: VillageVenue): string[] {
  if (!(venue.imageContext?.useAssignedVillagerContext ?? village.personalizeVenueImagesByDefault)) return [];
  const ids = [...(venue.residentIds ?? []), ...(venue.workerIds ?? [])];
  const people = village.villagers.filter((person) => ids.includes(person.characterId));
  if (!people.length) return [];
  return [
    RESIDENT_CONTINUITY_RULE,
    ...people.map((person) => person.cardSnapshot.name + ": " + JSON.stringify(person.admission)),
  ];
}
