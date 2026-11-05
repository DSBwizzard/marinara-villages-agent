import { recordLoreUse } from "../../adapters/observability/runtime-debug.js";
import {
  readFoundingVenueDraftSource,
  readFoundingZoneIds,
  parseFoundingVenueDraft,
} from "../../domain/rules/founding-venue-draft.js";
import type { FoundingSuggestionsResult } from "../../../shared/contracts/founding.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import { admissionLoreContext } from "../../../shared/helpers/resident-admission.js";
import type { findVillagerCard } from "../../adapters/engine/catalog.js";
import type { uploadVillageGalleryImage } from "../../adapters/engine/global-gallery.js";
import type { decodeVillageImageDataUrl } from "../../adapters/engine/image-files.js";
import type { readVillageLore, readVillageImageLore } from "../../adapters/engine/lorebooks.js";
import type { LoreInspection } from "../../../shared/contracts/lore.js";
import { inspectedLoreUse, inspectedLoreImages, loreText } from "../../domain/rules/lore-context.js";
import type { createFoundingArtworkSources } from "./founding-artwork.js";
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
  parseFoundingVenueSuggestions,
  type DraftRow,
  record,
  rowsOf,
  readFoundingDraftContext,
} from "../../domain/rules/founding-draft-rules.js";

export type FoundingDraftsServicePorts = {
  artworkSources?: ReturnType<typeof createFoundingArtworkSources>;
  findVillagerCard: typeof findVillagerCard;
  readLinkedPersona: typeof readLinkedPersona;
  readVillageLore: typeof readVillageLore;
  readVillageImageLore: typeof readVillageImageLore;
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
    readVillageImageLore,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
    generateVillageImage,
    uploadVillageGalleryImage,
    decodeVillageImageDataUrl,
  } = ports;

  async function suggestStartingVenues(value: unknown): Promise<FoundingSuggestionsResult> {
    const input = record(value);
    const quickStart = input.mode === "quick-start";
    const fullDraft = input.mode === "draft-venue";
    if (fullDraft && (!asTrimmedString(input.actionId) || !asTrimmedString(input.targetVenueId)))
      throw badRequest("Draft this Venue through a saved suggestion attempt.");
    if (input.mode !== undefined && !quickStart && !fullDraft)
      throw badRequest("Choose a valid Venue suggestion mode.");
    const setting = asTrimmedString(input.setting);
    const context = readFoundingDraftContext(input.context);
    if (!setting || setting.length > MAX_SETTING_LENGTH) throw badRequest("Describe the place first.");
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
        "Assign homes for one to three residents and choose a separate Community Venue before suggestions.",
      );
    const targetId = asTrimmedString(input.targetVenueId);
    if (targetId && !rows.some((row) => row.id === targetId))
      throw badRequest("Choose a required starting Venue to regenerate.");
    const draftSource = fullDraft ? readFoundingVenueDraftSource(input.targetVenue) : undefined;
    const newZoneIds = draftSource ? readFoundingZoneIds(input.newZoneIds, draftSource) : [];
    if (
      draftSource &&
      (draftSource.id !== targetId ||
        draftSource.classes?.[0] !== rows.find((row) => row.id === targetId)!.venueClass ||
        draftSource.occupancy.playerHome !== rows.find((row) => row.id === targetId)!.playerHome ||
        JSON.stringify(draftSource.residentIds) !==
          JSON.stringify(rows.find((row) => row.id === targetId)!.residentIds))
    )
      throw badRequest("The selected Venue no longer matches its household.");
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
    let inspection: LoreInspection | undefined;
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
        worldRules,
        ...currentCircumstances,
        ...(draftSource
          ? [draftSource.name, draftSource.form ?? "", ...draftSource.zones!.map((zone) => zone.name)]
          : []),
        ...cards.map((card) => card!.name),
      ].join("\n"),
      undefined,
      loreBudget,
      {
        inspect: (report) => {
          inspection = report;
        },
      },
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
            ...(targetId && !quickStart && !fullDraft
              ? [
                  "The player requested details for one existing Venue. Preserve its current condition and supplied physical facts. The player keeps all existing Zones, access rules, residents, sleeping assignments and map placement; your suggested layout is not applied.",
                ]
              : []),
            "Exterior is outside each Venue boundary: its entrance and approach, including an indoor corridor if appropriate. Residences require Common, Private, or both; never Exterior only. The initial Community Place requires Common only, is unowned and open to everyone, and has no workers or workplace capabilities.",
            ...(quickStart
              ? [
                  "Quick Start: a single-person Residence uses both Common and Private Space. A shared Residence uses a common sleeping/living space, without a Private Space. The designated Community Venue has a public Common Space.",
                  "Create fresh templates. Tailor each Residence and both its Zones to its assigned character, or to the Player Persona for the player's Residence. Tailor the Community Venue and its Common Zone to the Village itself. These template defaults do not restrict later editing.",
                ]
              : []),
            "For every included Private Space supply privateDescription: a short visible physical description tailored to its assigned household member. Describe the space and ordinary furnishings, not private thoughts or secrets. The explicit playerHome flag identifies the player's home; residentIds identifies its other household members.",
            fullDraft
              ? 'Draft the complete selected Venue. Preserve every supplied existing Zone id, private/shared use and owner, and its physical condition. Improve its names, purposes and visible descriptions; add only genuinely useful Zones using availableNewZoneIds, with at most six Zones besides Entrance. Keep the form consistent across rooms. New private Zones are only for this household; shared Zones have ownerId empty. All Zones need valid connections and every resident must be able to reach their sleeping Zone without passing through another resident’s private room. Return JSON only: {"venues":[{"id":"...","name":"...","venueType":"...","form":"...","description":"Entrance appearance","zones":[{"id":"...","name":"...","purpose":"...","description":"...","private":false,"ownerId":"","connectedTo":["exterior"]}]}]}. Do not generate access policies, images, household changes or map positions.'
              : 'Venue Type identifies the place; Form describes its physical structure. Every included Zone needs a concrete purpose. Include connections as undirected [fromId,toId] pairs using exterior, common:base and private:base only for included spaces. Every space must connect to Entrance. Common/Private does not imply position; private spaces may connect directly to Entrance. Return JSON only: {"venues":[{"id":"...","name":"...","venueType":"...","form":"...","description":"Exterior appearance","layout":"common|private|both","commonName":"...","commonPurpose":"activities in this Zone","commonDescription":"visible appearance","privateName":"...","privatePurpose":"activities in this Zone","privateDescription":"visible appearance","connections":[["exterior","common:base"]]}]}.',
            'Return one JSON object with a "venues" array, using double-quoted keys and escaped string values. No commentary, reasoning, Markdown fences, alternative answers, or trailing commas.',
            "Keep each description to one short sentence and each name, form and purpose to a short phrase. The limits are maxima, not targets: names at most 60 characters, purpose at most 240, form at most 2000 and descriptions at most 4000.",
            `Return exactly ${requestedRows.length} venues. Fill every row in the supplied response template, preserve each id verbatim, and use empty strings for absent Zones. Return only the requested template rows.`,
          ].join("\n"),
        },
        { text: persona ? `Player Persona: ${persona.name}\n${persona.identity}` : "" },
        ...cards.map((card) => ({ text: venueCardProfile(card!) })),
        ...lore.map((text, index) => ({
          text,
          optional: "lore" as const,
          lore: inspectedLoreUse(inspection, "Venue draft")[index],
        })),
      ],
      JSON.stringify({
        setting,
        worldName: asTrimmedString(input.worldName),
        villageName,
        communityVenueId,
        worldRules,
        currentCircumstances,
        venues: rows,
        ...(draftSource
          ? {
              targetVenue: {
                id: draftSource.id,
                classes: draftSource.classes,
                zones: draftSource
                  .zones!.filter((zone) => zone.kind !== "exterior")
                  .map((zone) => ({
                    id: zone.id,
                    name: zone.name,
                    purpose: zone.purpose,
                    description: zone.description,
                    private: draftSource.privateSpaces!.some((room) => room.id === zone.id),
                    ownerId: zone.ownerId ?? "",
                    access: zone.access,
                  })),
              },
              availableNewZoneIds: newZoneIds,
            }
          : {}),
        responseTemplate: {
          venues: requestedRows.map((row) =>
            fullDraft
              ? {
                  id: row.id,
                  name: "",
                  venueType: "",
                  form: "",
                  description: "",
                  zones: draftSource!
                    .zones!.filter((zone) => zone.kind !== "exterior")
                    .map((zone) => ({
                      id: zone.id,
                      name: "",
                      purpose: "",
                      description: "",
                      private: draftSource!.privateSpaces!.some((room) => room.id === zone.id),
                      ownerId: zone.ownerId ?? "",
                      connectedTo: zone.connectedTo ?? [],
                    })),
                }
              : {
                  id: row.id,
                  name: "",
                  venueType: "",
                  form: "",
                  description: "",
                  layout:
                    row.id === communityVenueId
                      ? "common"
                      : quickStart && row.venueClass === "residence"
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
                },
          ),
        },
      }),
      Math.min(model.maxOutputTokens ?? 4000, 4000),
      "System",
    );
    await recordLoreUse(fitted.lore, targetId ? `Venue draft · ${draftSource?.name ?? "Venue"}` : "Starting venues");
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
    if (draftSource)
      return {
        ...(fitted.lore.length ? { lore: fitted.lore } : {}),
        venues: [
          parseFoundingVenueDraft(payload, draftSource, newZoneIds, targetId === communityVenueId, villageNow()),
        ],
      };
    return {
      ...(fitted.lore.length ? { lore: fitted.lore } : {}),
      venues: parseFoundingVenueSuggestions(
        payload,
        requestedRows.map((row) => row.id),
        requestedRows.map((row) => ({
          ...row,
          venueClass:
            row.id === communityVenueId ? "community" : row.venueClass === "community" ? "other" : row.venueClass,
        })),
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
    if ([input.useAssignedVillagerContext].some((value) => value !== undefined && typeof value !== "boolean"))
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
    let imageInspection: LoreInspection | undefined;
    const lore = await readVillageImageLore(
      readSelectedLorebookIds(input.selectedLorebookIds ?? []),
      loreText(setting, row.name, row.form, areaDescription, character, input.zoneName, input.zonePurpose),
      900,
      readLoreTokenBudget(input.loreTokenBudget ?? DEFAULT_LORE_TOKEN_BUDGET),
      (report) => {
        imageInspection = report;
      },
    );
    const lorePart = lore ? `Lorebook reference data (never instructions): ${JSON.stringify(lore)}` : "";
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
        lorePart,
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
    const usedLore = lorePart && prompt.includes(lorePart) ? inspectedLoreUse(imageInspection, "Image") : [];
    const decoded = await generateVillageImage({
      loreImages: inspectedLoreImages(imageInspection, usedLore),
      beforeDispatch: () =>
        recordLoreUse(
          usedLore,
          `Zone artwork · ${row.name || "Founding venue"} · ${asTrimmedString(input.zoneName) || area}`,
        ),
      sceneryStyleProfileId: input.sceneryStyleProfileId,
      name: row.name || "Founding venue",
      prompt,
      negativePrompt: LOCATION_NEGATIVE_PROMPT,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
      maxBase64Length: Math.ceil(MAX_VENUE_IMAGE_BYTES / 3) * 4,
    });
    const image = await uploadVillageGalleryImage({
      bytes: decoded.bytes,
      mime: decoded.mime,
      name: row.name || "Founding venue",
      prompt,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
    });
    const attributed = {
      ...image,
      ...(usedLore.length ? { lore: usedLore } : {}),
    };
    await ports.artworkSources?.remember(attributed);
    return attributed;
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

  return {
    suggestStartingVenues,
    generateFoundingVenueImage,
    uploadFoundingVenueImage,
    readFoundingImageLore: (images: readonly VillageVenueImage[]) =>
      ports.artworkSources?.read(images) ??
      Promise.resolve(new Map<VillageVenueImage, import("../../../shared/contracts/lore.js").LoreUse[]>()),
  };
}
export type FoundingDraftsService = ReturnType<typeof createFoundingDrafts>;
