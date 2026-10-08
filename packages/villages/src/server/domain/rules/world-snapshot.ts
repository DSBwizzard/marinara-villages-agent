import { residentSignature } from "../../../shared/helpers/resident-signature.js";
import type {
  VillageMomentView,
  VillagePlaceView,
  VillagePlayerIdentity,
  VillageSettingsView,
  VillageState,
  VillageVillager,
  VillageVillagerView,
} from "../models/world.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { MAX_LORE_TOKEN_BUDGET, MIN_LORE_TOKEN_BUDGET } from "./lore-policy.js";
import {
  DEFAULT_HOME_BUILDING,
  homeBuildingOptions,
  isHousePlace,
  MAX_NOTICE_LENGTH,
  MAX_NOTICEBOARD_NOTES,
  MAX_SETTING_LENGTH,
  MAX_TOWN_MAP_IMAGE_LENGTH,
  MAX_VENUE_IMAGE_BYTES,
  MAX_VENUE_IMAGE_ID_LENGTH,
  MAX_VENUE_IMAGE_URL_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  MAX_VILLAGE_NAME_LENGTH,
  SETUP_MAX_VILLAGER_COUNT,
  SETUP_MIN_VILLAGER_COUNT,
  TOWN_MAP_EXPECTED_HEIGHT,
  TOWN_MAP_EXPECTED_WIDTH,
  TOWN_MAP_ZOOM_MAX,
  TOWN_MAP_ZOOM_MIN,
  TOWN_MAP_ZOOM_STEP,
  VILLAGE_PRESET_MACROS,
  VILLAGES_DEFAULT_KNOWLEDGE,
  VILLAGES_GALLERY_FOLDER_NAME,
  VILLAGES_PROMPT_BOX_MAX_LENGTH,
} from "./prompt-preset.js";
import { relationshipZoneController } from "./relationship-rules.js";
import { DEFAULT_TOWN_MAP_LAYOUT_PROMPT, DEFAULT_TOWN_MAP_NEGATIVE_PROMPT } from "./town-map-prompts.js";
import { projectVenueAccess, projectZoneAccess } from "./venue-access.js";
import { villageVenueLimit } from "./venue-capacity.js";
import { legacyZoneId, venueZones, zoneClosed } from "./venue-zones.js";
import { deriveVillageMoment } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";

export function projectVillager(
  villager: VillageVillager,
  cardName: string | null,
  cardSummary: string,
  cardTags: string[],
  nameColor: string,
  dialogueColor: string,
  place: VillagePlaceView | null,
): VillageVillagerView {
  return {
    characterId: villager.characterId,
    signatureFallback: residentSignature(villager.cardSnapshot),
    ...(villager.signature ? { signature: villager.signature } : {}),
    nameColor,
    dialogueColor,
    sprite: villager.sprite
      ? {
          ...villager.sprite,
          images: villager.sprite.expressions.map(({ view, label, filename, assetId, expressionId }) => ({
            view,
            label,
            expressionId,
            isDefault: Boolean(expressionId) && expressionId === villager.sprite!.defaultExpressionId,
            url: `/api/sprites/${assetId}/file/${encodeURIComponent(filename)}`,
          })),
        }
      : null,
    ...(villager.foundingContext ? { foundingContext: villager.foundingContext } : {}),
    name: cardName ?? villager.cardSnapshot.name,
    summary: cardSummary,
    tags: cardTags,
    missing: cardName === null,
    place,
  };
}
/**
 * The village as the tab draws it.
 *
 * Everything except the name, the setting and the venues is DERIVED here rather
 * than stored, so the tab cannot show a stale time and the prompt and the chips
 * are always describing the same instant.
 */
export function villageMomentView(village: VillageState, now: Date, nextTransitionAt?: string): VillageMomentView {
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  return {
    name: village.name,
    setting: village.setting,
    dateLabel: moment.dateLabel,
    weekday: moment.weekday,
    season: moment.season,
    dayPhase: moment.dayPhase,
    instant: moment.instant,
    localTime: moment.localTime,
    minuteOfDay: moment.minuteOfDay,
    timeZone: moment.timeZone,
    hour: moment.hour,
    minute: moment.minute,
    weather: moment.weather,
    dayIndex: moment.dayIndex,
    nextTransitionAt: nextTransitionAt ?? moment.nextTransitionAt,
  };
}
export function exactSnapshotTransition(village: VillageState, now: Date): string {
  const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
  const candidates = [Date.parse(moment.nextTransitionAt)];
  const currentMinute = moment.minuteOfDay;
  const addMinute = (minute: number) => {
    if (minute <= currentMinute || minute >= 1440) return;
    const at = new Date(now);
    at.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    candidates.push(at.getTime());
  };
  for (const villager of village.villagers) {
    for (const row of villager.agenda ? agendaBlocksFor(villager.agenda, villager.ingestSchedule !== false, now) : []) {
      addMinute(row.startMinute);
      addMinute(row.endMinute);
    }
  }
  return new Date(Math.min(...candidates.filter(Number.isFinite))).toISOString();
}
/**
 * The editable side of the village, as the settings panel needs it. The limits
 * and the macro list travel with the values so the tab never restates a number
 * or a token the server already owns.
 */
export function villageSettings(
  village: VillageState,
  player: VillagePlayerIdentity,
  residenceAccess: {
    placeId: string;
    area: "outside" | "shared" | "private" | "public";
    privateOwnerId: string;
    zoneId?: string;
  } | null,
  accessContext?: import("../../domain/rules/venue-access.js").AccessContext,
): VillageSettingsView {
  return {
    visitRetention: village.visitRetention,
    promptKnowledge: village.promptKnowledge,
    defaultPromptKnowledge: VILLAGES_DEFAULT_KNOWLEDGE,
    promptBoxMaxLength: VILLAGES_PROMPT_BOX_MAX_LENGTH,
    macros: VILLAGE_PRESET_MACROS,
    storyPace: village.storyPace,
    storyPaces: ["off", "quiet", "balanced", "lively"],
    characterSpeechColors: village.characterSpeechColors,
    sendOnEnter: village.sendOnEnter,
    spriteCardFlipEnabled: village.spriteCardFlipEnabled,
    villageNameMaxLength: MAX_VILLAGE_NAME_LENGTH,
    playerPersonaId: village.playerPersonaId,
    // The cached name travels even when the link is broken, so the panel can
    // name the Persona it is telling the player about — "Robin Hale is gone" is
    // a sentence worth reading and "your Persona is gone" is not. The flag
    // beside it is what tells a panel whether to draw a choice or a notice.
    playerPersonaName: player.name,
    playerPersonaMissing: player.missing,
    maxNoticeboardNotes: MAX_NOTICEBOARD_NOTES,
    maxNoticeLength: MAX_NOTICE_LENGTH,
    setting: village.setting,
    foundingReason: village.foundingReason,
    foundingDetails: village.foundingDetails,
    foundingGuidance: village.foundingGuidance,
    playerRole: village.playerRole,
    scenarioImprint: village.scenarioImprint,
    worldFacts: village.worldFacts,
    selectedLorebookIds: village.selectedLorebookIds,
    sceneryArtStyle: village.sceneryArtStyle,
    personalizeVenueImagesByDefault: village.personalizeVenueImagesByDefault,
    useVisualLoreByDefault: village.useVisualLoreByDefault,
    loreTokenBudget: village.loreTokenBudget,
    loreTokenBudgetMin: MIN_LORE_TOKEN_BUDGET,
    loreTokenBudgetMax: MAX_LORE_TOKEN_BUDGET,
    foundingDetailsMaxLength: 2_000,
    foundingGuidanceMaxLength: 500,
    townMapLayoutPrompt: DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
    townMapNegativePrompt: DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
    settingMaxLength: MAX_SETTING_LENGTH,
    venues: village.venues.map((venue) => {
      const previewAt = accessContext?.at ?? new Date();
      const context =
        residenceAccess?.placeId === venue.id
          ? accessContext
          : {
              at: previewAt,
              positions: Object.fromEntries(
                village.villagers.flatMap((resident) => {
                  const destination = villagerPlaceView(
                    village,
                    resident,
                    null,
                    deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: previewAt })
                      .minuteOfDay,
                    previewAt,
                  );
                  return destination?.id === venue.id && destination.zoneId
                    ? [[resident.characterId, destination.zoneId]]
                    : [];
                }),
              ),
            };
      const blankState = { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" };
      const zones = venueZones(venue).map((originalZone) => {
        const zone = {
          ...originalZone,
          access: undefined,
          controllerIds: venue.access ? undefined : originalZone.controllerIds,
          accessView: venue.access
            ? projectZoneAccess(venue, originalZone, "player", {
                ...context,
                sceneId: context?.sceneId ?? "next-visit-preview",
                accepting: true,
                unavailable: zoneClosed(village, venue, originalZone),
                relationships: village.relationshipContext,
              })
            : undefined,
          relationshipAccess: !!relationshipZoneController(
            village.relationshipContext,
            village,
            venue,
            originalZone,
            "player",
          ),
        };
        const visible =
          zone.kind === "exterior" ||
          zone.seen ||
          (zone.kind === "shared-residence" && venue.occupancy.playerHome) ||
          (residenceAccess?.placeId === venue.id && residenceAccess.zoneId === zone.id);
        return visible
          ? { ...zone, closed: zoneClosed(village, venue, zone) }
          : {
              ...zone,
              closed: zoneClosed(village, venue, zone),
              description: "",
              image: null,
              state: blankState,
              initialImageAttemptedAt: undefined,
              adaptationPending: undefined,
              adaptationSourceArchiveAt: undefined,
            };
      });
      const visibleIds = new Set(
        zones
          .filter(
            (zone) =>
              zone.kind === "exterior" ||
              zone.seen ||
              (residenceAccess?.placeId === venue.id && residenceAccess.zoneId === zone.id) ||
              (zone.kind === "shared-residence" && venue.occupancy.playerHome),
          )
          .map((zone) => zone.id),
      );
      const primary = zones.find(
        (zone) =>
          !zone.upgradeId && zone.kind !== "exterior" && zone.kind !== "private-residence" && visibleIds.has(zone.id),
      );
      return {
        ...venue,
        access: undefined,
        accessView: projectVenueAccess(venue, "player"),
        zones,
        archivedZones: [],
        archivedPrivateSpaces: [],
        state: primary
          ? {
              ...venue.state,
              condition: primary.state.condition,
              furniture: primary.state.items,
              publicFacts: primary.state.publicFacts,
              features: primary.state.features,
              traces: primary.state.traces,
            }
          : { ...venue.state, condition: "", furniture: [], publicFacts: [], features: [], traces: [] },
        spaces: zones.filter(
          (zone) => !zone.upgradeId && zone.kind !== "exterior" && zone.kind !== "private-residence",
        ),
        privateSpaces: zones
          .filter((zone) => zone.kind === "private-residence")
          .map((zone) => ({ ...zone, ownerId: zone.ownerId! })),
        improvements: venue.improvements?.map((upgrade) =>
          upgrade
            ? {
                ...upgrade,
                zones: upgrade.zones?.map((zone) => ({
                  ...zone,
                  access: undefined,
                  controllerIds: venue.access ? undefined : zone.controllerIds,
                  description: visibleIds.has(zone.id) ? zone.description : "",
                })),
              }
            : null,
        ),
        editProposals: venue.editProposals
          ?.filter((proposal) =>
            visibleIds.has(proposal.zoneId ?? legacyZoneId(venue, proposal.target, "residence", proposal.ownerId)),
          )
          .map((proposal) => ({
            ...proposal,
            proposed: { ...proposal.proposed, access: undefined, accessView: undefined, controllerIds: undefined },
          })),
      };
    }),
    homeBuildingNames: village.homeBuildingNames,
    maxPlaces: villageVenueLimit(village),
    maxVenueNameLength: MAX_VENUE_NAME_LENGTH,
    maxVenueNoteLength: MAX_VENUE_NOTE_LENGTH,
    maxVenueImageUrlLength: MAX_VENUE_IMAGE_URL_LENGTH,
    maxVenueImageIdLength: MAX_VENUE_IMAGE_ID_LENGTH,
    maxVenueImageBytes: MAX_VENUE_IMAGE_BYTES,
    villageGalleryFolderName: VILLAGES_GALLERY_FOLDER_NAME,
    homeBuildings: homeBuildingOptions(),
    defaultHomeBuilding: DEFAULT_HOME_BUILDING,
    setupHomeCount: 1 + SETUP_MAX_VILLAGER_COUNT,
    setupPlaceCount: 2 + SETUP_MAX_VILLAGER_COUNT,
    setupMinVillagerCount: SETUP_MIN_VILLAGER_COUNT,
    setupMaxVillagerCount: SETUP_MAX_VILLAGER_COUNT,
    // The stamp, not the image: the tab holds the picture and refetches it from
    // `/town-map` when this changes, which keeps a megabyte off every snapshot.
    townMapImageSetAt: village.townMapImageSetAt,
    townMapImageMaxLength: MAX_TOWN_MAP_IMAGE_LENGTH,
    townMapCanvasWidth: village.townMapCanvasWidth,
    townMapCanvasHeight: village.townMapCanvasHeight,
    townMapView: village.townMapView,
    // The shape, and the picture size it is authored against. The tab lays its
    // frame out from these rather than owning a ratio of its own, so the shape
    // the map is drawn in and the shape the panel describes are one number.
    townMapExpectedWidth: village.townMapCanvasWidth,
    townMapExpectedHeight: village.townMapCanvasHeight,
    townMapGenerationWidth: TOWN_MAP_EXPECTED_WIDTH,
    townMapGenerationHeight: TOWN_MAP_EXPECTED_HEIGHT,
    townMapZoomMin: TOWN_MAP_ZOOM_MIN,
    townMapZoomMax: TOWN_MAP_ZOOM_MAX,
    townMapZoomStep: TOWN_MAP_ZOOM_STEP,
  };
}
/**
 * Whether the village has been founded yet, which is what decides between the
 * wizard and the village.
 *
 * The setup stamp alone is not enough. A village that already has a house on its
 * map or anybody living in it was plainly founded, whatever its record says, so
 * a village in progress is never dropped back into the wizard. The stamp is
 * still the only thing that says the flow FINISHED, which is why it is checked
 * alongside the other two rather than instead of them.
 *
 * A place the MODEL proposed is not one of those three. Coming up with the
 * village's geography is a question asked once the village exists, so a record
 * that holds nothing but proposed places is a record whose wizard was never
 * finished — and the wizard is what puts the four houses on the map.
 */
export function isVillageFounded(village: VillageState): boolean {
  return (
    village.setupAt.length > 0 || village.villagers.length > 0 || village.venues.some((place) => isHousePlace(place))
  );
}
