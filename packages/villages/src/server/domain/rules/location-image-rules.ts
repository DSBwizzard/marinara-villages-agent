import type { VillageState, VillageVenue } from "../models/world.js";
import { imagePromptId } from "./image-generation-rules.js";
import { venueZones } from "./venue-zones.js";
import { describeMoment, type VillageMoment } from "./village-clock.js";

export const LOCATION_IMAGE_WIDTH = 1216;

export const LOCATION_IMAGE_HEIGHT = 832;

const MAX_SETTING_IN_PROMPT_LENGTH = 400;

export const LOCATION_NEGATIVE_PROMPT =
  "people, person, human, crowd, face, portrait, text, lettering, caption, signature, watermark, blurry, low quality";

export const avatarPromptId = imagePromptId;

export function buildLocationPrompt(
  village: VillageState,
  venue: VillageVenue,
  moment: VillageMoment,
  lore = "",
  area: "exterior" | "interior" = "exterior",
  spaceLabel = "",
): string {
  const form = venue.form?.trim() ?? "";
  const setting = village.setting.trim().slice(0, MAX_SETTING_IN_PROMPT_LENGTH);
  const surrounding = village.venues
    .filter((place) => place.id !== venue.id)
    .slice(0, 8)
    .map((place) => place.name)
    .filter(Boolean)
    .join(", ");
  const building = venue.occupancy.homeKind ? village.homeBuildingNames[venue.occupancy.homeKind] : "";
  const outside = area === "exterior";
  const privateResidenceOutside = outside && venue.classes?.includes("residence") && venue.residentIds?.length;
  const condition = outside
    ? venue.exteriorState?.condition || (privateResidenceOutside ? "" : venue.state.condition)
    : venue.state.condition;
  const items = outside
    ? venue.exteriorState?.items?.length
      ? venue.exteriorState.items
      : privateResidenceOutside
        ? []
        : venue.state.furniture
    : venue.state.furniture;
  const facts = outside
    ? venue.exteriorState?.publicFacts?.length
      ? venue.exteriorState.publicFacts
      : privateResidenceOutside
        ? []
        : venue.state.publicFacts
    : venue.state.publicFacts;
  const approvedDescription = venue.description;
  return [
    area === "exterior"
      ? `A wide, empty exterior view of ${venue.name} and its approach in ${village.name}. Show its described entrance and approach, not its enterable interior. For a room within a larger place, the approach can be a corridor; do not invent a detached building or outdoor surroundings.`
      : `A wide, empty interior view of ${spaceLabel || "the described space"} at ${venue.name} in ${village.name}. Show the room from inside; do not show the building exterior.`,
    building ? `Building type: ${building}.` : "",
    venue.classes?.length ? `Venue roles: ${venue.classes.join(" and ")}.` : "",
    venue.layoutVersion === 1
      ? `Physical layout: ${JSON.stringify(venueZones(venue).map((zone) => ({ kind: zone.kind, role: zone.venueClass })))}. Do not invent absent or adjoining interiors, or reveal private contents outside this depicted area.`
      : "",
    venue.occupancy.residentCharacterId && !building ? "This venue is also a villager's residence." : "",
    form ? `Venue form: ${form}.` : "",
    approvedDescription
      ? `Approved description of this ${outside ? "venue (show exterior cues only)" : "space"}: ${approvedDescription}.`
      : "",
    condition ? `Current condition: ${condition}.` : "",
    items.length ? `Visible ${outside ? "exterior details" : "furniture and items"}: ${items.join(", ")}.` : "",
    facts.length ? `Established venue facts: ${facts.join("; ")}.` : "",
    venue.state.upgrades.length ? `Approved improvements: ${venue.state.upgrades.join(", ")}.` : "",
    setting.length > 0 ? `Village setting and theme: ${setting}.` : "",
    village.worldFacts.length ? `Current world facts: ${village.worldFacts.join("; ")}.` : "",
    surrounding ? `Other known places in the village: ${surrounding}.` : "",
    lore ? `Established visual lore: ${lore}.` : "",
    `It is ${describeMoment(moment)}, and the weather is ${moment.weather}.`,
    `Honor these facts and do not invent conflicting architecture, technology or geography. ${village.sceneryArtStyle ? "Background scenery" : "Painted background art"} for a story: no people, no animals, no text, no lettering, no watermark.`,
  ]
    .filter((part) => part.length > 0)
    .join(" ")
    .trim();
}
