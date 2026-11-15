import { observedZone } from "./zone-observation.js";
import type { VenueScene } from "../models/scene-model.js";
import { contactPath, liveSceneMovePermission, sceneMoveAccompanying } from "./venue-contact.js";
import { sceneZoneOccupants } from "./scene-attendance.js";
import { findLocation } from "./places.js";
import { VillagesRequestError } from "./errors.js";
import { zonePictureContext } from "./zone-picture.js";
import { copyDate } from "../../../shared/helpers/zoned-date.js";
import { MAX_ZONE_VILLAGERS } from "./venue-model.js";
import { residentSignature } from "../../../shared/helpers/resident-signature.js";
import {
  engineSpriteUrl,
  groupNumberedSpritePairs,
  groupSpritesByMood,
} from "../../../shared/helpers/sprite-variants.js";
import type {
  VillageMomentView,
  VillageCardCharacter,
  VillagePlaceView,
  VillagePlayerIdentity,
  VillageSettingsView,
  VillageState,
  VillageVillagerView,
} from "../models/world.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { MAX_LORE_TOKEN_BUDGET, MIN_LORE_TOKEN_BUDGET } from "./lore-policy.js";
import { readLoreUse } from "../../../shared/helpers/lore.js";
import {
  DEFAULT_HOME_BUILDING,
  homeBuildingOptions,
  isHousePlace,
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
  VILLAGES_GALLERY_FOLDER_NAME,
} from "./prompt-preset.js";
import { DEFAULT_TOWN_MAP_LAYOUT_PROMPT, DEFAULT_TOWN_MAP_NEGATIVE_PROMPT } from "./town-map-prompts.js";
import { evaluateZoneAccess, projectVenueAccess, projectZoneAccess } from "./venue-access.js";
import { villageVenueLimit } from "./venue-capacity.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { deriveVillageMoment } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";
import { nextVisitorTransition } from "./visitors.js";

export function projectVillager(
  villager: VillageCardCharacter,
  cardName: string | null,
  _cardSummary: string,
  cardTags: string[],
  nameColor: string,
  dialogueColor: string,
  place: VillagePlaceView | null,
): VillageVillagerView {
  const sprite = villager.sprite;
  const pairs = [...new Map(sprite?.expressions.map((entry) => [entry.expressionId, entry])).values()];
  const groups = sprite?.named
    ? [...groupSpritesByMood(pairs).values()]
    : groupNumberedSpritePairs(pairs).map(({ members }) => members);
  const variantGroups = new Map(
    groups.flatMap((members) =>
      members.length > 1 ? members.map((entry) => [entry.expressionId, members[0]!.expressionId] as const) : [],
    ),
  );
  return {
    characterId: villager.characterId,
    letterFontId: villager.letterFontId,
    signatureFallback: residentSignature(villager.cardSnapshot),
    ...(villager.signature ? { signature: villager.signature } : {}),
    nameColor,
    dialogueColor,
    sprite: sprite
      ? {
          ...sprite,
          images: sprite.expressions.map(({ view, label, filename, assetId, expressionId, version }) => ({
            view,
            label,
            expressionId,
            variantGroup: variantGroups.get(expressionId),
            isDefault:
              Boolean(expressionId) &&
              expressionId === sprite.defaultExpressionId &&
              (!sprite.defaultView || view === sprite.defaultView),
            url: engineSpriteUrl(assetId, filename, version),
          })),
        }
      : null,
    name: cardName ?? villager.cardSnapshot.name,
    summary: villager.identityDescription?.text ?? "",
    identityDescription: {
      text: villager.identityDescription?.text ?? "",
      revision: villager.identityDescription?.revision ?? "",
    },
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
  const moment = deriveVillageMoment({
    foundedAt: village.foundedAt,
    environment: village.narrative,
    seed: village.seed,
    timeZone: village.timeZone || undefined,
    now,
  });
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
  const moment = deriveVillageMoment({
    foundedAt: village.foundedAt,
    environment: village.narrative,
    seed: village.seed,
    timeZone: village.timeZone || undefined,
    now,
  });
  const candidates = [Date.parse(moment.nextTransitionAt), nextVisitorTransition(village, now)];
  const currentMinute = moment.minuteOfDay;
  const addMinute = (minute: number) => {
    if (minute <= currentMinute || minute >= 1440) return;
    const at = copyDate(now);
    at.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    candidates.push(at.getTime());
  };
  for (const villager of village.villagers) {
    for (const row of villager.agenda ? agendaBlocksFor(villager.agenda, now) : []) {
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
  residenceAccess: VenueScene | null,
  accessContext?: import("../../domain/rules/venue-access.js").AccessContext,
  now = new Date(),
  liveSceneWorld?: VillageState,
): VillageSettingsView {
  return {
    foundingLore: [
      ...village.villagers.flatMap((resident) =>
        (["routine", "wish"] as const).map((kind) => ({
          label: `${resident.cardSnapshot.name} · ${kind === "routine" ? "Personal routine" : "Initial Wish"}`,
          entries: readLoreUse(village.foundingPreparation?.tasks?.[resident.characterId]?.[kind]?.lore),
        })),
      ),
      { label: "Starting history", entries: readLoreUse(village.startingHistory.lore) },
      ...village.venues.flatMap((venue) =>
        (venue.zones ?? [])
          .filter((zone) => zone.preparation?.status === "ready" && (!isVillageFounded(village) || !!zone.observed))
          .map((zone) => ({
            label: `${venue.name} · ${zone.name}`,
            entries: readLoreUse(zone.preparation?.lore),
          })),
      ),
    ].filter((row) => row.entries.length),
    backgroundPace: village.backgroundPace,
    narrativeConsequence: village.narrativeConsequence ?? "gentle",
    backgroundPaces: ["off", "quiet", "balanced", "lively"],
    characterSpeechColors: village.characterSpeechColors,
    sendOnEnter: village.sendOnEnter,
    spontaneousEvents: village.spontaneousEvents === true,
    spriteCardFlipEnabled: village.spriteCardFlipEnabled,
    spriteVariantsEnabled: village.spriteVariantsEnabled,
    villageNameMaxLength: MAX_VILLAGE_NAME_LENGTH,
    playerPersonaId: village.playerPersonaId,
    // The cached name travels even when the link is broken, so the panel can
    // name the Persona it is telling the player about — "Robin Hale is gone" is
    // a sentence worth reading and "your Persona is gone" is not. The flag
    // beside it is what tells a panel whether to draw a choice or a notice.
    playerPersonaName: player.name,
    playerPersonaMissing: player.missing,
    setting: village.setting,
    worldRules: village.worldRules,
    communityVenueId: village.communityVenueId,
    worldName: village.worldName ?? null,
    playerBackground: village.playerBackground,
    selectedLorebookIds: village.selectedLorebookIds,
    sceneryArtStyle: village.sceneryArtStyle,
    sceneryStyleProfileId: village.sceneryStyleProfileId ?? null,
    automaticZonePictures: village.automaticZonePictures !== false,
    personalizeVenueImagesByDefault: village.personalizeVenueImagesByDefault,
    loreTokenBudget: village.loreTokenBudget,
    loreTokenBudgetMin: MIN_LORE_TOKEN_BUDGET,
    loreTokenBudgetMax: MAX_LORE_TOKEN_BUDGET,
    townMapLayoutPrompt: DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
    townMapNegativePrompt: DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
    settingMaxLength: MAX_SETTING_LENGTH,
    venues: village.venues.map((venue) => {
      const previewAt = now;
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
                    deriveVillageMoment({
                      foundedAt: village.foundedAt,
                      environment: village.narrative,
                      seed: village.seed,
                      now: previewAt,
                    }).minuteOfDay,
                    previewAt,
                  );
                  return destination?.id === venue.id && destination.zoneId
                    ? [[resident.characterId, destination.zoneId]]
                    : [];
                }),
              ),
            };
      const authoring = !isVillageFounded(village);
      const liveVenue = liveSceneWorld && findLocation(liveSceneWorld, venue.id);
      const zones = venueZones(venue).map((originalZone) => {
        const visible = observedZone(originalZone, authoring);
        const scene = residenceAccess?.placeId === venue.id ? residenceAccess : null;
        const accompanying = scene ? sceneMoveAccompanying(scene, venue, originalZone, village) : undefined;
        const closed = zoneClosed(village, venue, originalZone);
        const access = {
          ...context,
          ...(scene
            ? {
                positions: {
                  ...context?.positions,
                  ...Object.fromEntries(
                    (accompanying ?? [])
                      .filter((entry) => !scene.departedIds?.includes(entry.characterId))
                      .map((entry) => [entry.characterId, entry.zoneId]),
                  ),
                },
              }
            : {}),
          sceneId: context?.sceneId ?? "next-visit-preview",
          accepting: true,
          unavailable: closed,
          environment: village.narrative,
        };
        const accessView = projectZoneAccess(venue, originalZone, "player", access);
        const movement = scene && { ...scene, accompanying };
        let reachable = false;
        if (
          liveSceneWorld &&
          liveVenue &&
          venue.access &&
          scene?.status === "active" &&
          movement &&
          originalZone.id !== scene.zoneId &&
          accessView.decision.allowed &&
          !closed &&
          contactPath(village, venue, movement.zoneId, originalZone.id, "player", movement, context?.at) &&
          sceneZoneOccupants(movement, venue, originalZone.id).filter(
            (person) => !person.characterId.startsWith("npc:"),
          ).length <= MAX_ZONE_VILLAGERS
        ) {
          try {
            liveSceneMovePermission(
              liveSceneWorld,
              liveVenue,
              originalZone.id,
              scene,
              accompanying,
              context?.at,
              evaluateZoneAccess(venue, originalZone, "player", access).permissionId,
            );
            reachable = true;
          } catch (error) {
            if (!(error instanceof VillagesRequestError)) throw error;
          }
        }
        const present =
          residenceAccess?.placeId === venue.id &&
          residenceAccess?.zoneId === originalZone.id &&
          originalZone.observed?.context === zonePictureContext(village, venue, originalZone, previewAt.toISOString());
        const zone = {
          ...visible,
          observed: undefined,
          picture: undefined,
          pictureReference: originalZone.picture?.reference,
          referencePending:
            !!originalZone.picture?.reference &&
            originalZone.picture.referenceAppliedId !== originalZone.picture.reference.id,
          pictureGenerateAvailable: authoring || !!originalZone.observed,
          pictureOutdated: !!(
            originalZone.observed?.image &&
            originalZone.observed.pictureContext &&
            originalZone.observed.pictureContext !== originalZone.observed.context
          ),
          daylightReady: visible.picture?.daylight === true,
          nightImage:
            visible.dayNight && visible.image && visible.picture?.night?.sourceId === visible.image.id
              ? visible.picture!.night.image
              : undefined,
          nightPending:
            visible.dayNight === true &&
            (!visible.picture?.daylight || !visible.image || visible.picture?.night?.sourceId !== visible.image.id),
          pictureRevision: undefined,
          pictureRetryAvailable:
            !!originalZone.observed &&
            originalZone.observed.image?.id === originalZone.image?.id &&
            originalZone.picture?.failed === true,
          pictureProblem: present ? originalZone.picture?.problem : undefined,
          pictureUpdating: present && !!originalZone.picture?.claim && originalZone.picture?.failed !== true,
          preparation: originalZone.preparation
            ? {
                status: originalZone.preparation.status,
                error:
                  visible.preparation?.error ||
                  (originalZone.preparation.status === "failed" ? "Room preparation failed." : undefined),
              }
            : undefined,
          access: undefined,
          controllerIds: undefined,
          accessView: liveSceneWorld ? { ...accessView, reachable } : accessView,
        };
        return {
          ...zone,
          closed,
        };
      });
      const entrance = zones.find((zone) => zone.kind === "exterior");
      return {
        ...venue,
        dayNight: zones.find((zone) => zone.kind === "exterior")?.dayNight,
        description: entrance?.description ?? "",
        form: authoring ? venue.form : venue.zones?.find((zone) => zone.kind === "exterior")?.observed?.form,
        presentation: { ...venue.presentation, image: entrance?.image ?? null },
        access: undefined,
        accessView: projectVenueAccess(venue, "player", village.communityVenueId),
        zones,
        archivedZones: [],
        archivedPrivateSpaces: [],
        spaces: zones.filter((zone) => zone.kind !== "exterior" && zone.kind !== "private-residence"),
        privateSpaces: zones
          .filter((zone) => zone.kind === "private-residence")
          .map((zone) => ({ ...zone, ownerId: zone.ownerId! })),
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
    maps: village.maps,
    townMapImageMaxLength: MAX_TOWN_MAP_IMAGE_LENGTH,
    townMapExpectedWidth: TOWN_MAP_EXPECTED_WIDTH,
    townMapExpectedHeight: TOWN_MAP_EXPECTED_HEIGHT,
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
