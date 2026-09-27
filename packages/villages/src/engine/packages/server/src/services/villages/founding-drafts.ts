import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { findVillagerCard } from "./catalog.js";
import { asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { uploadVillageGalleryImage } from "./global-gallery.js";
import { decodeVillageImageDataUrl, generateVillageImage } from "./image-generation.js";
import {
  DEFAULT_LORE_TOKEN_BUDGET,
  readLoreTokenBudget,
  readSelectedLorebookIds,
  readVillageLore,
  readVillageVisualLore,
} from "./lorebooks.js";
import { completeWithRoom, villagesLanguageModels } from "./package-runtime.js";
import { villagesConnectionIdFor } from "./connections.js";
import { MAX_VENUE_IMAGE_BYTES, villageNarrativeSetting } from "./prompt-preset.js";
import { extractJsonObject } from "./village-bootstrap.js";
import type { VillageVenueImage } from "./types.js";

type DraftRow = {
  id: string;
  name: string;
  form: string;
  purpose: string;
  description: string;
  spaceDescription: string;
  venueClass: "residence" | "gathering";
  residentCharacterId: string;
  guidance: string;
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
    if (venueClass !== "residence" && venueClass !== "gathering") throw badRequest("Choose a founding Venue Class.");
    const id = asTrimmedString(row.id).slice(0, 100);
    if (!id) throw badRequest("A founding venue needs an id.");
    return {
      id,
      name: asTrimmedString(row.name).slice(0, 100),
      form: asTrimmedString(row.form).slice(0, 240),
      purpose: asTrimmedString(row.purpose).slice(0, 240),
      description: asTrimmedString(row.description).slice(0, 1000),
      spaceDescription: asTrimmedString(row.spaceDescription).slice(0, 1000),
      venueClass,
      residentCharacterId: asTrimmedString(row.residentCharacterId).slice(0, 100),
      guidance: asTrimmedString(row.guidance).slice(0, 1000),
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

export async function draftFoundingVenueText(
  value: unknown,
): Promise<{ drafts: Record<string, Record<string, unknown>> }> {
  const input = record(value);
  const setting = villageNarrativeSetting({
    setting: asTrimmedString(input.setting),
    foundingReason: asTrimmedString(input.foundingReason),
    foundingDetails: asTrimmedString(input.foundingDetails),
    foundingGuidance: asTrimmedString(input.foundingGuidance),
  });
  if (!setting.trim()) throw badRequest("Write the Setting and Theme first.");
  const rows = await Promise.all(rowsOf(input.venues).map(withResident));
  const lore = await readVillageLore(
    readSelectedLorebookIds(input.selectedLorebookIds ?? []),
    [setting, ...rows.map((row) => `${row.name} ${row.form} ${row.purpose} ${row.guidance}`)].join("\n"),
    undefined,
    input.loreTokenBudget === undefined ? DEFAULT_LORE_TOKEN_BUDGET : readLoreTokenBudget(input.loreTokenBudget),
  );
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const messages: CapabilityLanguageModelMessage[] = [
    {
      role: "system",
      content: [
        "Draft vivid but grounded founding Venue details for a small fictional village.",
        "Use the supplied setting, selected lore, resident card, and player guidance. Do not contradict supplied facts or invent named people.",
        "A Residence belongs to its assigned person; a Gathering Place serves the community.",
        'Return JSON only: {"venues":[{"id":"...","name":"...","form":"...","purpose":"...","description":"...","spaceDescription":"...","condition":"...","items":["..."],"publicFacts":["..."],"features":["..."]}]}.',
        "Keep names under 100 characters; each description under 1000 characters; items, facts and features short and concrete.",
      ].join("\n"),
    },
    { role: "user", content: JSON.stringify({ setting: setting.slice(0, 2000), lore, venues: rows }) },
  ];
  const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 3000, 3000) });
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 3000, {
    temperature: 0.7,
    debugMode: false,
  });
  const payload = extractJsonObject(completion.content ?? "");
  const generated = Array.isArray(payload?.venues) ? payload.venues : [];
  const drafts: Record<string, Record<string, unknown>> = {};
  for (const row of rows) {
    const result = generated.map(record).find((candidate) => candidate.id === row.id);
    if (!result) continue;
    const text = (key: string, limit: number) => asTrimmedString(result[key]).slice(0, limit);
    const lines = (key: string, max: number) =>
      Array.isArray(result[key])
        ? (result[key] as unknown[])
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim().slice(0, 300))
            .filter(Boolean)
            .slice(0, max)
        : [];
    drafts[row.id] = {
      name: text("name", 100),
      form: text("form", 240),
      purpose: text("purpose", 240),
      description: text("description", 1000),
      spaceDescription: text("spaceDescription", 1000),
      condition: text("condition", 300),
      items: lines("items", 20),
      publicFacts: lines("publicFacts", 20),
      features: lines("features", 5),
    };
  }
  if (Object.keys(drafts).length !== rows.length)
    throw badRequest("The model did not return every requested venue draft. Try again.");
  return { drafts };
}

export async function generateFoundingVenueImage(value: unknown): Promise<VillageVenueImage> {
  const input = record(value);
  const row = await withResident(rowsOf([input.venue])[0]!);
  const area = input.area === "interior" ? "interior" : "exterior";
  const setting = asTrimmedString(input.setting).slice(0, 1200);
  if (!setting) throw badRequest("Write the Setting and Theme first.");
  const lore = await readVillageVisualLore(
    readSelectedLorebookIds(input.selectedLorebookIds ?? []),
    `${setting}\n${row.name}\n${row.form}\n${row.guidance}`,
    300,
  );
  const prompt = [
    `Wide, empty ${area} illustration of ${row.name || "a village venue"}, a ${row.form || row.venueClass} in ${asTrimmedString(input.villageName) || "a village"}.`,
    area === "exterior"
      ? "Show the building and its approach from outside, not an interior."
      : "Show its enterable room from inside, not the building exterior.",
    `Setting: ${setting}.`,
    row.purpose && `Purpose: ${row.purpose}.`,
    row.description && `Exterior description: ${row.description}.`,
    area === "interior" && row.spaceDescription && `Room description: ${row.spaceDescription}.`,
    row.resident &&
      `Resident: ${row.resident.name}; ${row.resident.description}; ${row.resident.personality}; ${row.resident.appearance}.`,
    lore && `Established lore: ${lore}.`,
    row.guidance && `Player art direction: ${row.guidance}.`,
    "No people, lettering, numerals, signs, labels, or interface graphics.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 4000);
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
