import {
  readFoundingResidentContexts,
  renderResidentFoundingContext,
  RESIDENT_CONTINUITY_RULE,
} from "./resident-founding-context.js";
import { readSceneryStyle, sceneryPrompt, sceneryCardsContext } from "./scenery-context.js";
import { readLinkedPersona } from "./village.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { findVillagerCard } from "./catalog.js";
import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { uploadVillageGalleryImage } from "./global-gallery.js";
import { decodeVillageImageDataUrl, generateVillageImage } from "./image-generation.js";
import {
  readSelectedLorebookIds,
  readVillageLore,
  readVillageVisualLore,
  readLoreTokenBudget,
  DEFAULT_LORE_TOKEN_BUDGET,
} from "./lorebooks.js";
import { completeWithRoom, villagesLanguageModels } from "./package-runtime.js";
import { villagesConnectionIdFor } from "./connections.js";
import { MAX_VENUE_IMAGE_BYTES, villageFoundingSetting } from "./prompt-preset.js";
import { coerceScenarioImprint, coerceWorldFacts } from "./scenario-imprint.js";
import { extractJsonObject } from "./village-bootstrap.js";
import type { VillageState, VillageVenueImage } from "./types.js";
import type { FoundingProgress } from "./founding-progress.js";
import { fitVenueWritingMessages, venueCardProfile } from "./venue-writing.js";

export type FoundingVenueSuggestion = {
  id: string;
  name: string;
  form: string;
  venueType?: string;
  description: string;
  layout: "exterior" | "common" | "private" | "both";
  commonName: string;
  commonPurpose?: string;
  commonDescription: string;
  privateName: string;
  privatePurpose: string;
};

/** Suggestions never carry positions, assignments, private contents, or gameplay effects. */
export function parseFoundingVenueSuggestions(value: unknown, ids: readonly string[]): FoundingVenueSuggestion[] {
  const payload = record(value);
  if (!Array.isArray(payload.venues))
    throw badRequest(
      "The System model did not return readable Venue suggestions. Your draft is unchanged; retry when ready.",
    );
  const rows = payload.venues;
  const returnedIds = new Set(rows.map((row) => record(row).id));
  if (rows.length !== ids.length || returnedIds.size !== ids.length || ids.some((id) => !returnedIds.has(id)))
    throw badRequest(
      "The System model did not return every starting Venue exactly once with its supplied id. Your draft is unchanged; retry when ready.",
    );
  return ids.map((id) => {
    const row = record(rows.find((candidate) => record(candidate).id === id));
    const text = (key: string, max: number, required = false) => {
      const result = asTrimmedString(row[key]);
      if (result.length > max || (required && !result))
        throw badRequest(`Complete the suggested ${key} for every Venue.`);
      return result;
    };
    const layout = row.layout;
    if (!["exterior", "common", "private", "both"].includes(String(layout)))
      throw badRequest("Choose a valid suggested Zone layout.");
    return {
      id,
      name: text("name", 100, true),
      form: text("form", 240, true),
      venueType: text("venueType", 100),
      description: text("description", 1000, true),
      layout: layout as FoundingVenueSuggestion["layout"],
      commonName: text("commonName", 100, layout === "common" || layout === "both"),
      commonPurpose: text("commonPurpose", 240),
      commonDescription: text("commonDescription", 1000, layout === "common" || layout === "both"),
      privateName: text("privateName", 100, layout === "private" || layout === "both"),
      privatePurpose: text("privatePurpose", 240, layout === "private" || layout === "both"),
    };
  });
}

export async function suggestStartingVenues(value: unknown): Promise<{ venues: FoundingVenueSuggestion[] }> {
  const input = record(value);
  const setting = asTrimmedString(input.setting);
  const circumstances = asTrimmedString(input.foundingDetails);
  if (!setting || setting.length > 1200 || !circumstances || circumstances.length > 2000)
    throw badRequest("Describe the place and shared starting circumstances first.");
  const rows = rowsOf(input.venues);
  if (
    rows.length < 3 ||
    new Set(rows.map((row) => row.id)).size !== rows.length ||
    rows.filter((row) => row.venueClass === "gathering").length !== 1 ||
    rows.some((row) => row.venueClass === "gathering" && row.residentCharacterId) ||
    rows.filter((row) => row.venueClass === "residence" && !row.residentCharacterId).length !== 1 ||
    rows.some((row) => !["residence", "gathering"].includes(row.venueClass))
  )
    throw badRequest("Include one living space per person and one Gathering Place.");
  const residents = rows.filter((row) => row.residentCharacterId).map((row) => row.residentCharacterId);
  if (residents.length !== rows.length - 2 || new Set(residents).size !== residents.length)
    throw badRequest("Assign a different villager to each starting living space.");
  const contexts = readFoundingResidentContexts(input.foundingResidentContexts, residents);
  const cards = (await Promise.all(residents.map(findVillagerCard))).map((card) =>
    card ? { ...card, foundingContext: contexts[card.id] } : null,
  );
  if (cards.some((card) => !card)) throw badRequest("Choose villagers still available in the character library.");
  const persona = await readLinkedPersona(input.playerPersonaId);
  const loreBudget = readLoreTokenBudget(input.loreTokenBudget ?? DEFAULT_LORE_TOKEN_BUDGET);
  const lore = await readVillageLore(
    readSelectedLorebookIds(input.selectedLorebookIds ?? []),
    [setting, circumstances, ...cards.map((card) => card!.name)].join("\n"),
    undefined,
    loreBudget,
  );
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const fitted = fitVenueWritingMessages(
    model,
    [
      {
        text: [
          "Suggest the required starting Venues for this shared-life setting. These are editable drafts, not saved facts.",
          "A village may be indoors or already established. Living spaces may be rooms, cells, bunks, apartments, tents, or buildings. Follow the player's setting; do not assume cottages.",
          "Preserve supplied ids and resident assignments. Do not place map pins, infer image coordinates, establish relationships, or invent completed actions, mandatory crises, or community culture.",
          "Exterior is each Venue's entrance and approach, including an indoor corridor if appropriate. Common and Private Space are independent optional areas; choose a fitting layout.",
          "Only suggest Private Space names and structural purposes. Never return private descriptions, images, objects or resident secrets. A Gathering Place with a Private Space is controlled by the player.",
          'Venue Type identifies the place (home, bakery, church); Physical form describes its structure. Every Zone needs a concrete use, independent of access. Return JSON only: {"venues":[{"id":"...","name":"...","venueType":"...","form":"...","description":"Entrance appearance","layout":"exterior|common|private|both","commonName":"...","commonPurpose":"activities in this Zone","commonDescription":"visible appearance","privateName":"...","privatePurpose":"activities in this Zone"}]}.',
          "Keep each description to one short sentence and each name, form and purpose to a short phrase. The limits are maxima, not targets: names at most 100 characters, form/purpose at most 240 and descriptions at most 1000.",
          `Return exactly ${rows.length} venues. Fill every row in the supplied response template, preserve each id verbatim, and use empty strings for absent Zones. Do not omit the player's living space or the Gathering Place.`,
        ].join("\n"),
      },
      { text: persona ? `Player Persona: ${persona.name}\n${persona.identity}` : "" },
      ...cards.map((card) => ({ text: venueCardProfile(card!) })),
      ...lore.map((text) => ({ text, optional: "lore" as const })),
    ],
    JSON.stringify({
      setting,
      circumstances,
      venues: rows,
      responseTemplate: {
        venues: rows.map((row) => ({
          id: row.id,
          name: "",
          venueType: "",
          form: "",
          description: "",
          layout: "exterior|common|private|both",
          commonName: "",
          commonPurpose: "",
          commonDescription: "",
          privateName: "",
          privatePurpose: "",
        })),
      },
    }),
    Math.min(model.maxOutputTokens ?? 4000, 4000),
    "System",
  );
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 4000, {
    temperature: 0.7,
    reasoningEffort: "none",
    retryEmpty: false,
    debugMode: false,
  });
  if (["length", "max_tokens"].includes(completion.finishReason ?? ""))
    throw badRequest(
      "The System model ran out of output room while drafting Venues. Your draft is unchanged; check the connection's output and thinking settings or choose another model, then retry.",
    );
  return {
    venues: parseFoundingVenueSuggestions(
      extractJsonObject(completion.content ?? ""),
      rows.map((row) => row.id),
    ),
  };
}

type DraftRow = {
  id: string;
  name: string;
  form: string;
  description: string;
  spaceDescription: string;
  venueClass: "residence" | "gathering" | "workplace" | "other";
  residentCharacterId: string;
  layout?: string;
  areas?: unknown;
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
      venueType: asTrimmedString(row.venueType).slice(0, 100),
      form: asTrimmedString(row.form).slice(0, 240),
      description: asTrimmedString(row.description).slice(0, 1000),
      spaceDescription: asTrimmedString(row.spaceDescription).slice(0, 1000),
      venueClass: venueClass as DraftRow["venueClass"],
      residentCharacterId: asTrimmedString(row.residentCharacterId).slice(0, 100),
      layout: asTrimmedString(row.layout),
      areas: row.areas,
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
          foundingBackground: renderResidentFoundingContext(card.name, card.foundingContext),
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
  onProgress?: (progress: Partial<FoundingProgress>) => Promise<void>,
): Promise<Record<string, SeededFoundingVenueDetails>> {
  const rows = await Promise.all(
    rowsOf(
      village.venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        form: venue.form,
        description: venue.description,
        spaceDescription: venue.spaces?.[0]?.description,
        layout:
          venue.layoutVersion === 1
            ? venue.zones?.filter((zone) => zone.kind !== "exterior").length
              ? "Explicit saved zones"
              : "Exterior only"
            : undefined,
        areas: venue.zones?.map((zone) => ({ id: zone.id, name: zone.name, kind: zone.kind })),
        venueClass: venue.classes?.includes("gathering") ? "gathering" : "residence",
        residentCharacterId: venue.occupancy.residentCharacterId,
      })),
    ).map(async (row) => {
      const prepared = await withResident(row);
      const resident = village.villagers.find((person) => person.characterId === row.residentCharacterId);
      if (prepared.resident && resident?.foundingContext)
        prepared.resident.foundingBackground = renderResidentFoundingContext(
          resident.cardSnapshot.name,
          resident.foundingContext,
        );
      return prepared;
    }),
  );
  const setting = villageFoundingSetting(village);
  const lore = await readVillageLore(
    village.selectedLorebookIds,
    [setting, ...rows.map((row) => `${row.name} ${row.form} ${row.description} ${row.spaceDescription}`)].join("\n"),
    undefined,
    village.loreTokenBudget,
  );
  await onProgress?.({ stage: "resolving", loreEntryCount: lore.length });
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const messages: CapabilityLanguageModelMessage[] = [
    {
      role: "system",
      content: [
        "Seed a few observable initial physical details for each founding Venue.",
        ...(village.villagers.some((person) => person.foundingContext) ? [RESIDENT_CONTINUITY_RULE] : []),
        "Player-written names, form, exterior and interior descriptions are authoritative. Never replace or redefine them.",
        "Use shared starting circumstances selectively for plausible initial condition; do not invent completed player actions or repeat the premise in every Venue.",
        "Use selected lore and resident cards where relevant. Do not invent named people or contradict established facts.",
        'Return JSON only: {"venues":[{"id":"...","condition":"...","items":["..."],"publicFacts":["..."],"features":["..."]}]}.',
        "Respect the actual layout. Exterior-only venues have no interior. A Private Space can be the entire interior with no Common Space. Seed only observable exterior/Common Space details, never private contents.",
        "Use short concrete details. Empty lists and an empty condition are valid where nothing is established.",
      ].join("\n"),
    },
    { role: "user", content: JSON.stringify({ setting, lore, venues: rows }) },
  ];
  const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 2000, 2000) });
  if (
    village.villagers.some((person) => person.foundingContext) &&
    JSON.stringify(fitted.messages) !== JSON.stringify(messages)
  )
    throw badRequest("The required resident backgrounds do not fit the System connection. No request was sent.");
  await onProgress?.({ stage: "model", modelName: model.name || model.model, attempt: 1 });
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 2000, {
    temperature: 0.7,
    reasoningEffort: "none",
    retryEmpty: false,
    usagePurpose: "background",
    debugMode: false,
  });
  await onProgress?.({ stage: "validating" });
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
  const foundingContext =
    input.residentFoundingContext === undefined
      ? undefined
      : readFoundingResidentContexts({ [row.residentCharacterId]: input.residentFoundingContext }, [
          row.residentCharacterId,
        ])[row.residentCharacterId];
  const area = input.area === "private" ? "private" : input.area === "interior" ? "interior" : "exterior";
  const selectedAppearance = asTrimmedString(input.zoneAppearance).slice(0, 1000);
  const areaDescription =
    selectedAppearance ||
    (area === "private"
      ? asTrimmedString(input.privateDescription).slice(0, 1000)
      : area === "exterior"
        ? row.description
        : row.spaceDescription);
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
  if (
    (row.layout === "exterior" && area !== "exterior") ||
    (row.layout === "private" && area === "interior") ||
    (row.layout === "common" && area === "private")
  )
    throw badRequest("That area is absent from the selected layout.");
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
      personality && row.resident && foundingContext
        ? renderResidentFoundingContext(row.resident.name, foundingContext)
        : "",
      `Venue Type: ${row.venueType || row.venueClass}. Physical form: ${row.form}. Selected Zone: ${asTrimmedString(input.zoneName) || "Entrance"}. Used for: ${asTrimmedString(input.zonePurpose).slice(0, 240) || "Arrival and approach"}.`,
      `Wide, empty ${area === "private" ? "interior" : area} view of ${row.name || "a village venue"}, a ${row.form || row.venueClass} in ${asTrimmedString(input.villageName) || "a village"}.`,
      area === "exterior"
        ? "Show the described Venue entrance and approach, not its enterable interior. A room's approach can be a corridor within a larger building; do not invent a detached building or outdoor surroundings."
        : "Show the described enterable space from inside, not the exterior.",
      `${area} description, follow closely: ${areaDescription}.`,
      row.layout
        ? `Selected layout: ${row.layout}. Only these areas exist: ${JSON.stringify(Array.isArray(row.areas) ? row.areas.map((area) => ({ id: record(area).id, name: record(area).name })) : [])}. Do not invent other interiors or adjoining rooms. Do not reveal hidden private contents.`
        : "",
      "No people, lettering, numerals, signs, labels, or interface graphics.",
    ],
    [
      `Setting: ${setting}.`,
      character ? `Occupant context, reflect preferences in the space without depicting people: ${character}.` : "",
      lore ? `Established lore: ${lore}.` : "",
      asTrimmedString(input.foundingDetails)
        ? `Starting circumstances where visually relevant: ${asTrimmedString(input.foundingDetails).slice(0, 600)}`
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
