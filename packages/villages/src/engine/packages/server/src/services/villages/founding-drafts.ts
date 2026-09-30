import { readSceneryStyle, sceneryPrompt, sceneryCardsContext } from "./scenery-context.js";
import { readLinkedPersona } from "./village.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { findVillagerCard } from "./catalog.js";
import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { uploadVillageGalleryImage } from "./global-gallery.js";
import { decodeVillageImageDataUrl, generateVillageImage } from "./image-generation.js";
import { readSelectedLorebookIds, readVillageLore, readVillageVisualLore } from "./lorebooks.js";
import { completeWithRoom, villagesLanguageModels } from "./package-runtime.js";
import { villagesConnectionIdFor } from "./connections.js";
import { MAX_VENUE_IMAGE_BYTES, villageFoundingSetting } from "./prompt-preset.js";
import { coerceScenarioImprint, coerceWorldFacts } from "./scenario-imprint.js";
import { extractJsonObject } from "./village-bootstrap.js";
import type { VillageState, VillageVenueImage } from "./types.js";

type DraftRow = {
  id: string;
  name: string;
  form: string;
  description: string;
  spaceDescription: string;
  venueClass: "residence" | "gathering" | "workplace" | "other";
  residentCharacterId: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function rowsOf(value: unknown): DraftRow[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 5)
    throw badRequest("Choose one to five founding venues.");
  return value.map((raw) => {
    const row = record(raw);
    const venueClass = row.venueClass;
    if (!["residence", "gathering", "workplace", "other"].includes(String(venueClass)))
      throw badRequest("Choose a founding Venue Class.");
    const id = asTrimmedString(row.id).slice(0, 100);
    if (!id) throw badRequest("A founding venue needs an id.");
    return {
      id,
      name: asTrimmedString(row.name).slice(0, 100),
      form: asTrimmedString(row.form).slice(0, 240),
      description: asTrimmedString(row.description).slice(0, 1000),
      spaceDescription: asTrimmedString(row.spaceDescription).slice(0, 1000),
      venueClass: venueClass as DraftRow["venueClass"],
      residentCharacterId: asTrimmedString(row.residentCharacterId).slice(0, 100),
    };
  });
}

async function withResident(row: DraftRow) {
  const card = row.residentCharacterId ? await findVillagerCard(row.residentCharacterId) : null;
  if (row.residentCharacterId && !card) throw badRequest("Choose a villager who is still in the library.");
  return {
    ...row,
    resident: card
      ? {
          name: card.name,
          summary: card.summary.slice(0, 400),
          description: card.description.slice(0, 600),
          personality: card.personality.slice(0, 400),
          backstory: card.backstory.slice(0, 400),
          appearance: card.appearance.slice(0, 300),
        }
      : null,
  };
}

export type SeededFoundingVenueDetails = {
  condition: string;
  items: string[];
  publicFacts: string[];
  features: string[];
};

/** Initial physical details are drafted after founding, never as editable setup answers. */
export async function seedFoundingVenueDetails(
  village: VillageState,
): Promise<Record<string, SeededFoundingVenueDetails>> {
  const rows = await Promise.all(
    rowsOf(
      village.venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        form: venue.form,
        description: venue.description,
        spaceDescription: venue.spaces?.[0]?.description,
        venueClass: venue.classes?.includes("gathering") ? "gathering" : "residence",
        residentCharacterId: venue.occupancy.residentCharacterId,
      })),
    ).map(withResident),
  );
  const setting = villageFoundingSetting(village);
  const lore = await readVillageLore(
    village.selectedLorebookIds,
    [setting, ...rows.map((row) => `${row.name} ${row.form} ${row.description} ${row.spaceDescription}`)].join("\n"),
    undefined,
    village.loreTokenBudget,
  );
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const messages: CapabilityLanguageModelMessage[] = [
    {
      role: "system",
      content: [
        "Seed a few observable initial physical details for each founding Venue.",
        "Player-written names, form, exterior and interior descriptions are authoritative. Never replace or redefine them.",
        "Use Day 1 selectively for plausible initial condition; do not repeat it in every Venue.",
        "Use selected lore and resident cards where relevant. Do not invent named people or contradict established facts.",
        'Return JSON only: {"venues":[{"id":"...","condition":"...","items":["..."],"publicFacts":["..."],"features":["..."]}]}.',
        "Use short concrete details. Empty lists and an empty condition are valid where nothing is established.",
      ].join("\n"),
    },
    { role: "user", content: JSON.stringify({ setting: setting.slice(0, 2000), lore, venues: rows }) },
  ];
  const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 2000, 2000) });
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 2000, {
    temperature: 0.7,
    debugMode: false,
  });
  const payload = extractJsonObject(completion.content ?? "");
  const generated = Array.isArray(payload?.venues) ? payload.venues : [];
  const details: Record<string, SeededFoundingVenueDetails> = {};
  for (const row of rows) {
    const result = generated.map(record).find((candidate) => candidate.id === row.id);
    if (!result) throw badRequest("The model did not return every founding Venue.");
    const lines = (key: string, max: number) =>
      Array.isArray(result[key])
        ? (result[key] as unknown[])
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim().slice(0, 300))
            .filter(Boolean)
            .slice(0, max)
        : [];
    details[row.id] = {
      condition: asTrimmedString(result.condition).slice(0, 300),
      items: lines("items", 20),
      publicFacts: lines("publicFacts", 20),
      features: lines("features", 5),
    };
  }
  return details;
}

export async function generateFoundingVenueImage(value: unknown): Promise<VillageVenueImage> {
  const input = record(value);
  const row = await withResident(rowsOf([input.venue])[0]!);
  const area = input.area === "private" ? "private" : input.area === "interior" ? "interior" : "exterior";
  const areaDescription =
    area === "private"
      ? asTrimmedString(input.privateDescription).slice(0, 1000)
      : area === "exterior"
        ? row.description
        : row.spaceDescription;
  if (area === "private" && input.privateOwnerId !== "player")
    throw badRequest("Hidden personal spaces are drawn only after an invited entry.");
  const personality = input.useAssignedVillagerContext !== false;
  if (
    [input.useVisualLore, input.useAssignedVillagerContext].some(
      (value) => value !== undefined && typeof value !== "boolean",
    )
  )
    throw badRequest("Image context controls must be on or off.");
  const persona = area === "private" ? await readLinkedPersona(input.playerPersonaId) : null;
  const character = persona
    ? `${persona.name}; ${persona.identity.slice(0, 900)}`
    : personality && row.resident
      ? sceneryCardsContext([row.resident])
      : "";
  if (!areaDescription) throw badRequest(`Add an ${area} description before generating its image.`);
  const imprint = coerceScenarioImprint(input.scenarioImprint);
  const setting = [
    asTrimmedString(input.setting).slice(0, 1200),
    ...(imprint?.worldFacts ?? coerceWorldFacts(input.worldFacts)),
    ...(imprint?.visualCues ?? []),
  ]
    .filter(Boolean)
    .join("; ");
  if (!setting) throw badRequest("Describe what the village is like first.");
  const lore =
    input.useVisualLore === false
      ? ""
      : await readVillageVisualLore(
          readSelectedLorebookIds(input.selectedLorebookIds ?? []),
          `${setting}\n${row.name}\n${row.form}\n${areaDescription}\n${character}`,
          900,
        );
  const prompt = sceneryPrompt(
    [
      `Wide, empty ${area === "private" ? "interior" : area} view of ${row.name || "a village venue"}, a ${row.form || row.venueClass} in ${asTrimmedString(input.villageName) || "a village"}.`,
      area === "exterior"
        ? "Show the building and approach from outside, not an interior."
        : "Show the described enterable space from inside, not the exterior.",
      `${area} description, follow closely: ${areaDescription}.`,
      "No people, lettering, numerals, signs, labels, or interface graphics.",
    ],
    [
      `Setting: ${setting}.`,
      character ? `Occupant context, reflect preferences in the space without depicting people: ${character}.` : "",
      lore ? `Established lore: ${lore}.` : "",
      asTrimmedString(input.foundingDetails)
        ? `Day 1 context where visually relevant: ${asTrimmedString(input.foundingDetails).slice(0, 600)}`
        : "",
    ],
    input.sceneryArtStyle === undefined ? "" : readSceneryStyle(input.sceneryArtStyle),
  );
  const decoded = await generateVillageImage({
    name: row.name || "Founding venue",
    prompt,
    negativePrompt: "people, faces, text, letters, numbers, numerals, signs, labels, captions, watermark, interface",
    width: 1216,
    height: 832,
    maxBase64Length: Math.ceil(MAX_VENUE_IMAGE_BYTES / 3) * 4,
  });
  return uploadVillageGalleryImage({
    bytes: decoded.bytes,
    mime: decoded.mime,
    name: row.name || "Founding venue",
    prompt,
    width: 1216,
    height: 832,
  });
}

export async function uploadFoundingVenueImage(value: unknown): Promise<VillageVenueImage> {
  const input = record(value);
  const decoded = decodeVillageImageDataUrl(input.image, {
    label: "founding venue image",
    maxBase64Length: Math.ceil(MAX_VENUE_IMAGE_BYTES / 3) * 4,
  });
  return uploadVillageGalleryImage({
    bytes: decoded.bytes,
    mime: decoded.mime,
    name: asTrimmedString(input.name) || "Founding venue",
    prompt: "",
  });
}
