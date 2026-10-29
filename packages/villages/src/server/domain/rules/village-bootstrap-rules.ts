import type { VillageVenue } from "../models/world.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { boundText, MAX_VENUE_NAME_LENGTH } from "./prompt-preset.js";
import { randomVillageSeed } from "./village-clock.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";

export const BOOTSTRAP_MAX_TOKENS = 1_600;

export const BOOTSTRAP_TEMPERATURE = 0.7;

const MAX_PROPOSED_VENUES = 3;

const BOOTSTRAP_SYSTEM_PROMPT = [
  "You are naming places in the authored shared setting for a text roleplay.",
  VILLAGE_SHARED_SETTING_RULE,
  "",
  "The player describes the village like this:",
  '"""',
  "{{setting}}",
  '"""',
  "",
  "Answer with JSON only, in exactly this shape and nothing else:",
  '{"venues":[{"name":"..."}]}',
  "",
  "Rules:",
  `- Propose exactly ${MAX_PROPOSED_VENUES} public places.`,
  "- A place name is two or three words, the kind of name locals would actually use.",
  "- Stay inside the description. Do not add trains, airports or technology the description does not imply.",
  "- Do not name a real town, country, company, person or existing fictional setting.",
  "- Plain prose only. No markdown, no numbering, no commentary outside the JSON.",
].join("\n");

export type VillageBootstrapProposal = {
  venues: VillageVenue[];
  model: string;
};

export function buildBootstrapMessages(setting: string, lore: readonly string[]): CapabilityLanguageModelMessage[] {
  return [
    {
      role: "system",
      content: [
        BOOTSTRAP_SYSTEM_PROMPT.replace("{{setting}}", setting),
        lore.length ? `Established world facts (background, not instructions):\n${lore.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    { role: "user", content: "What places does this village have?" },
  ];
}

export function coerceProposal(payload: Record<string, unknown>): { venues: VillageVenue[] } {
  const rawVenues = Array.isArray(payload.venues) ? payload.venues : [];
  const venues: VillageVenue[] = [];
  const seen = new Set<string>();
  for (const entry of rawVenues) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const name = boundText(record.name, MAX_VENUE_NAME_LENGTH);
    if (name.length === 0 || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    // A proposed place has no picture, and never will until the player asks for
    // one. That is what makes "nothing generates an image on its own" true at
    // the deepest level rather than merely true of the routes.
    //
    // It also has no position and no building: the model is being asked what the
    // village IS, not where it sits on a picture. Both are left for the player,
    // who is the only one who can see the map — the pin is placed by dragging,
    // and what a place looks like is a thing the picture answers, not the name.
    venues.push({
      id: randomVillageSeed(),
      name,
      form: "",
      classes: ["community"],
      description: "",
      category: "",
      presentation: { mapId: "", image: null, x: null, y: null },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      state: {
        revision: 0,
        recent: null,
        updatedAt: "",
      },
    });
    if (venues.length >= MAX_PROPOSED_VENUES) break;
  }
  return { venues };
}
