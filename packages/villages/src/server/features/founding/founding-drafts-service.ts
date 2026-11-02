import { admissionLoreContext } from "../../../shared/helpers/resident-admission.js";
import type { findVillagerCard } from "../../adapters/engine/catalog.js";
import type { uploadVillageGalleryImage } from "../../adapters/engine/global-gallery.js";
import type { decodeVillageImageDataUrl } from "../../adapters/engine/image-files.js";
import type { readVillageLore, readVillageVisualLore } from "../../adapters/engine/lorebooks.js";
import type { villagesLanguageModels } from "../../adapters/models/language-models.js";
import type { VillageVenueImage } from "../../domain/models/world.js";
import { asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest } from "../../domain/rules/errors.js";
import { extractFoundingVenueReply } from "../../domain/rules/founding-venue-reply.js";
import {
  LOCATION_IMAGE_WIDTH,
  LOCATION_IMAGE_HEIGHT,
  LOCATION_NEGATIVE_PROMPT,
  venueImageCompositionPrompt,
} from "../../domain/rules/location-image-rules.js";
import {
  DEFAULT_LORE_TOKEN_BUDGET,
  readLoreTokenBudget,
  readSelectedLorebookIds,
} from "../../domain/rules/lore-policy.js";
import { MAX_SETTING_LENGTH, MAX_VENUE_IMAGE_BYTES } from "../../domain/rules/prompt-preset.js";
import { readFoundingResidentAdmissions, renderResidentAdmission } from "../../domain/rules/resident-admission.js";

import { readSceneryStyle, sceneryCardsContext, sceneryPrompt } from "../../domain/rules/scenery-context.js";
import { fitVenueWritingMessages, venueCardProfile } from "../../domain/rules/venue-writing.js";
import type { completeWithRoom } from "../generation/model-requests.js";
import type { generateVillageImage } from "../media/image-generation.js";
import type { villagesConnectionIdFor } from "../settings/connections.js";
import type { readLinkedPersona } from "../settings/personas.js";

import {
  type FoundingVenueSuggestion,
  parseFoundingVenueSuggestions,
  type DraftRow,
  record,
  rowsOf,
  readFoundingDraftContext,
} from "../../domain/rules/founding-draft-rules.js";

export type FoundingDraftsServicePorts = {
  findVillagerCard: typeof findVillagerCard;
  readLinkedPersona: typeof readLinkedPersona;
  readVillageLore: typeof readVillageLore;
  readVillageVisualLore: typeof readVillageVisualLore;
  villagesLanguageModels: typeof villagesLanguageModels;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  completeWithRoom: typeof completeWithRoom;
  generateVillageImage: typeof generateVillageImage;
  uploadVillageGalleryImage: typeof uploadVillageGalleryImage;
  decodeVillageImageDataUrl: typeof decodeVillageImageDataUrl;
};
/** Cold recipe: awaited stages retain one application's model and storage connections. */
export function createFoundingDrafts(ports: FoundingDraftsServicePorts) {
  const {
    findVillagerCard,
    readLinkedPersona,
    readVillageLore,
    readVillageVisualLore,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
    generateVillageImage,
    uploadVillageGalleryImage,
    decodeVillageImageDataUrl,
  } = ports;

  async function suggestStartingVenues(value: unknown): Promise<{ venues: FoundingVenueSuggestion[] }> {
    const input = record(value);
    const quickStart = input.mode === "quick-start";
    if (input.mode !== undefined && !quickStart) throw badRequest("Choose a valid Venue suggestion mode.");
    const setting = asTrimmedString(input.setting);
    const context = readFoundingDraftContext(input.context);
    const circumstances = context.history;
    if (!setting || setting.length > MAX_SETTING_LENGTH || circumstances.length > 2000)
      throw badRequest("Describe the place first.");
    const rows = rowsOf(input.venues);
    const communityVenueId = asTrimmedString(input.communityVenueId);
    const community = rows.find((row) => row.id === communityVenueId);
    const residents = rows.flatMap((row) => row.residentIds);
    if (
      !community ||
      community.venueClass === "residence" ||
      community.residentIds.length ||
      community.playerHome ||
      rows.filter((row) => row.playerHome).length !== 1 ||
      residents.length < 1 ||
      residents.length > 3 ||
      new Set(residents).size !== residents.length ||
      rows.some((row) => row.residentIds.length + Number(row.playerHome) > 4)
    )
      throw badRequest(
        "Choose households for one to three residents and a separate Community Venue before suggestions.",
      );
    const targetId = asTrimmedString(input.targetVenueId);
    if (targetId && (!quickStart || !rows.some((row) => row.id === targetId)))
      throw badRequest("Choose a required starting Venue to regenerate.");
    const requestedRows = targetId ? rows.filter((row) => row.id === targetId) : rows;
    const worldRules = asTrimmedString(context.rules);
    const currentCircumstances = Array.isArray(context.circumstances)
      ? context.circumstances.map((row) => asTrimmedString(record(row).summary)).filter(Boolean)
      : [];
    const villageName = asTrimmedString(input.villageName).slice(0, 80);
    const contexts = readFoundingResidentAdmissions(input.foundingResidentAdmissions, residents);
    const cards = (await Promise.all(residents.map(findVillagerCard))).map((card) =>
      card ? { ...card, admission: contexts[card.id] } : null,
    );
    if (cards.some((card) => !card)) throw badRequest("Choose villagers still available in the character library.");
    const persona = await readLinkedPersona(input.playerPersonaId);
    const loreBudget = readLoreTokenBudget(input.loreTokenBudget ?? DEFAULT_LORE_TOKEN_BUDGET);
    const lore = await readVillageLore(
      readSelectedLorebookIds(input.selectedLorebookIds ?? []),
      [
        villageName,
        setting,
        asTrimmedString(input.worldName),
        admissionLoreContext(
          asTrimmedString(input.worldName),
          cards.map((card) => card?.admission),
        ),
        circumstances,
        worldRules,
        ...currentCircumstances,
        ...cards.map((card) => card!.name),
      ].join("\n"),
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
            "A Residence can take literally any physical form supported by the context: a dumpster, apartment, house, train car, stolen hearse, or something else. Fit its spaces to that form; spaces need not be separate rooms. Respect a supplied nonempty physical form when suggesting its spaces.",
            "Suggest a specific, setting-appropriate name for every Venue, replacing generic or existing names. Supplied names are context, not fixed choices.",
            "Preserve supplied ids and resident assignments. Do not place map pins, infer image coordinates, establish relationships, or invent completed actions, mandatory crises, or community culture.",
            "Exterior is outside each Venue boundary: its entrance and approach, including an indoor corridor if appropriate. Residences require Common, Private, or both; never Exterior only. The initial Community Place requires Common only, is unowned and open to everyone, and has no workers or workplace capabilities.",
            ...(quickStart
              ? [
                  "Quick Start: a single-person Residence uses both Common and Private Space. A shared Residence uses a common sleeping/living space, without a Private Space. The designated Community Venue has a public Common Space.",
                  "Create fresh templates. Tailor each Residence and both its Zones to its assigned character, or to the Player Persona for the player's Residence. Tailor the Community Venue and its Common Zone to the Village itself. These template defaults do not restrict later editing.",
                ]
              : []),
            "For every included Private Space supply privateDescription: a short visible physical description tailored to its assigned household member. Describe the space and ordinary furnishings, not private thoughts or secrets. The explicit playerHome flag identifies the player's home; residentIds identifies its other household members.",
            'Venue Type identifies the place; Form describes its physical structure. Every included Zone needs a concrete purpose. Include connections as undirected [fromId,toId] pairs using exterior, common:base and private:base only for included spaces. Every space must connect to Entrance. Common/Private does not imply position; private spaces may connect directly to Entrance. Return JSON only: {"venues":[{"id":"...","name":"...","venueType":"...","form":"...","description":"Exterior appearance","layout":"common|private|both","commonName":"...","commonPurpose":"activities in this Zone","commonDescription":"visible appearance","privateName":"...","privatePurpose":"activities in this Zone","privateDescription":"visible appearance","connections":[["exterior","common:base"]]}]}.',
            'Return one JSON object with a "venues" array, using double-quoted keys and escaped string values. No commentary, reasoning, Markdown fences, alternative answers, or trailing commas.',
            "Keep each description to one short sentence and each name, form and purpose to a short phrase. The limits are maxima, not targets: names at most 60 characters, purpose at most 240, form at most 2000 and descriptions at most 4000.",
            `Return exactly ${requestedRows.length} venues. Fill every row in the supplied response template, preserve each id verbatim, and use empty strings for absent Zones. Return only the requested template rows.`,
          ].join("\n"),
        },
        { text: persona ? `Player Persona: ${persona.name}\n${persona.identity}` : "" },
        ...cards.map((card) => ({ text: venueCardProfile(card!) })),
        ...lore.map((text) => ({ text, optional: "lore" as const })),
      ],
      JSON.stringify({
        setting,
        worldName: asTrimmedString(input.worldName),
        circumstances,
        villageName,
        worldRules,
        currentCircumstances,
        venues: rows,
        responseTemplate: {
          venues: requestedRows.map((row) => ({
            id: row.id,
            name: "",
            venueType: "",
            form: "",
            description: "",
            layout:
              row.venueClass === "community"
                ? "common"
                : quickStart
                  ? row.residentIds.length + Number(row.playerHome) > 1
                    ? "common"
                    : "both"
                  : row.venueClass === "residence"
                    ? "common|private|both"
                    : "exterior|common|private|both",
            connections: [],
            commonName: "",
            commonPurpose: "",
            commonDescription: "",
            privateName: "",
            privatePurpose: "",
            privateDescription: "",
          })),
        },
      }),
      Math.min(model.maxOutputTokens ?? 4000, 4000),
      "System",
    );
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 4000, {
      responseFormat: { type: "json_object" },
      temperature: 0.7,
      reasoningEffort: "none",
      retryEmpty: false,
      debugMode: false,
    });
    if (["length", "max_tokens"].includes(completion.finishReason ?? ""))
      throw badRequest(
        "The System model ran out of output room while drafting Venues. Your draft is unchanged; check the connection's output and thinking settings or choose another model, then retry.",
      );
    const content = (completion.content ?? "").trim();
    if (!content)
      throw badRequest(
        "The System model returned an empty Venue reply. Your draft is unchanged; check the connection's output and thinking settings, then explicitly retry.",
      );
    const payload = extractFoundingVenueReply(content, completion.finishReason);
    if (!payload)
      throw badRequest(
        "The System reply did not contain one complete, readable set of Venue suggestions. Your draft is unchanged. Try generating again; if this repeats, check the System model’s response format and output limit.",
      );
    return {
      venues: parseFoundingVenueSuggestions(
        payload,
        requestedRows.map((row) => row.id),
        requestedRows,
        true,
      ),
    };
  }

  async function generateFoundingVenueImage(value: unknown): Promise<VillageVenueImage> {
    const input = record(value);
    const context = readFoundingDraftContext(input.context);
    const row = rowsOf([input.venue])[0]! as DraftRow & { venueType?: string };
    const area = input.area === "private" ? "private" : input.area === "interior" ? "interior" : "exterior";
    const owner = asTrimmedString(input.privateOwnerId);
    if (area === "private" && owner && !(owner === "player" ? row.playerHome : row.residentIds.includes(owner)))
      throw badRequest("Choose this private room's assigned household member.");
    const selectedIds = area === "private" ? (owner && owner !== "player" ? [owner] : []) : row.residentIds;
    const admissions = readFoundingResidentAdmissions(input.foundingResidentAdmissions, row.residentIds);
    const cards = await Promise.all(
      selectedIds.map(async (id) => {
        const card = await findVillagerCard(id);
        if (!card) throw badRequest("Choose a villager who is still in the library.");
        return { ...card, admission: admissions[id] };
      }),
    );
    if (
      [input.zoneAppearance, input.privateDescription].some((value) => typeof value === "string" && value.length > 4000)
    )
      throw badRequest("Zone descriptions must be at most 4000 characters.");
    const selectedAppearance = asTrimmedString(input.zoneAppearance);
    const areaDescription =
      selectedAppearance ||
      (area === "private"
        ? asTrimmedString(input.privateDescription)
        : area === "exterior"
          ? row.description
          : row.spaceDescription);
    const personality = input.useAssignedVillagerContext !== false;
    if (
      [input.useVisualLore, input.useAssignedVillagerContext].some(
        (value) => value !== undefined && typeof value !== "boolean",
      )
    )
      throw badRequest("Image context controls must be on or off.");
    const persona =
      area === "private" && input.privateOwnerId === "player" ? await readLinkedPersona(input.playerPersonaId) : null;
    const character = !personality
      ? ""
      : persona
        ? `${persona.name}; ${persona.identity.slice(0, 900)}`
        : sceneryCardsContext(cards);
    if (
      (row.layout === "exterior" && area !== "exterior") ||
      (row.layout === "private" && area === "interior") ||
      (row.layout === "common" && area === "private")
    )
      throw badRequest("That area is absent from the selected layout.");
    if (!areaDescription) throw badRequest(`Add an ${area} description before generating its image.`);
    const setting = [
      asTrimmedString(input.setting),
      asTrimmedString(input.worldName).slice(0, 120),
      ...cards.map((card) => card.admission?.homeworld ?? ""),
      asTrimmedString(context.rules),
    ]
      .filter(Boolean)
      .join("; ");
    if (!setting || asTrimmedString(input.setting).length > MAX_SETTING_LENGTH)
      throw badRequest("Describe the place within the allowed length first.");
    const lore =
      input.useVisualLore === false
        ? ""
        : await readVillageVisualLore(
            readSelectedLorebookIds(input.selectedLorebookIds ?? []),
            `${setting}\n${row.name}\n${row.form}\n${areaDescription}\n${character}`,
            900,
            readLoreTokenBudget(input.loreTokenBudget ?? DEFAULT_LORE_TOKEN_BUDGET),
          );
    const prompt = sceneryPrompt(
      [
        `Venue Type: ${row.venueType || row.venueClass}. Physical form: ${row.form}. Selected Zone: ${asTrimmedString(input.zoneName) || "Entrance"}. Used for: ${asTrimmedString(input.zonePurpose).slice(0, 240) || "Arrival and approach"}.`,
        "Shared architecture: Venue form defines the whole place. Preserve its scale and construction across every Zone. Zone appearance describes part of this same place and must not redefine its architecture. Use only explicitly described architectural facts; do not invent materials, windows or proportions from the building type alone.",
        area !== "exterior" && row.description
          ? `Public exterior context for architectural continuity only: ${row.description}. Carry over explicit architectural cues that apply inside; do not depict this exterior or infer hidden contents.`
          : "",
        `Wide, empty ${area === "private" ? "interior" : area} view of ${row.name || "a village venue"}, a ${row.form || row.venueClass} in ${asTrimmedString(input.villageName) || "a village"}.`,
        area === "exterior"
          ? "Show the described Venue entrance and approach, not its enterable interior. A room's approach can be a corridor within a larger building; do not invent a detached building or outdoor surroundings."
          : "Show only the selected enterable space from inside, within this same Venue, not the exterior. Do not invent or show adjoining rooms, other Zones or hidden private contents.",
        `${area} description, follow closely: ${areaDescription}.`,
        row.layout
          ? `Selected layout: ${row.layout}. Only these areas exist: ${JSON.stringify(Array.isArray(row.areas) ? row.areas.map((area) => ({ id: record(area).id, name: record(area).name })) : [])}. Do not invent other interiors or adjoining rooms. Do not reveal hidden private contents.`
          : "",
        venueImageCompositionPrompt(area === "exterior" ? "exterior" : "interior"),
      ],
      [
        character ? `Occupant context, reflect preferences in the space without depicting people: ${character}.` : "",
        lore ? `Established lore: ${lore}.` : "",
        ...(Array.isArray(context.circumstances)
          ? context.circumstances
              .filter((value) => {
                const situation = record(value);
                return (
                  situation.scope === "village" ||
                  (situation.scope === "zone" && situation.venueId === row.id && situation.zoneId === input.zoneId)
                );
              })
              .map(
                (value) =>
                  "Current circumstance where visually relevant; current physical details remain authoritative: " +
                  asTrimmedString(record(value).summary),
              )
          : []),
      ],
      input.sceneryArtStyle === undefined ? "" : readSceneryStyle(input.sceneryArtStyle),
      [
        "Place: " + setting,
        ...(personality
          ? cards
              .filter((card) => card.admission?.homeworld || card.admission?.startingSituation)
              .map((card) => renderResidentAdmission(card.name, card.admission))
          : []),
      ],
    );
    const decoded = await generateVillageImage({
      sceneryStyleProfileId: input.sceneryStyleProfileId,
      name: row.name || "Founding venue",
      prompt,
      negativePrompt: LOCATION_NEGATIVE_PROMPT,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
      maxBase64Length: Math.ceil(MAX_VENUE_IMAGE_BYTES / 3) * 4,
    });
    return uploadVillageGalleryImage({
      bytes: decoded.bytes,
      mime: decoded.mime,
      name: row.name || "Founding venue",
      prompt,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
    });
  }

  async function uploadFoundingVenueImage(value: unknown): Promise<VillageVenueImage> {
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

  return { suggestStartingVenues, generateFoundingVenueImage, uploadFoundingVenueImage };
}
export type FoundingDraftsService = ReturnType<typeof createFoundingDrafts>;
