import type { TownMapView, VillageVillagerView } from "../../../shared/contracts/village.js";
import { pinText, pinTone, placeSpot, playerDisplayName } from "../../shared/presentation.js";
import type { MapFrameShape, MapPin, MapZoomRange } from "../../shared/types.js";
import { isHouse } from "../../shared/venue.js";
import { defaultView, pictureAdvice, PROJECT_BLUEPRINT_IMAGE, STANDING_PIN_STEP } from "./MapStage.js";

export function calculateSavedTownMapView(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}): TownMapView {
  const { snapshot } = ports;
  return snapshot?.settings.townMapView ?? defaultView("cover");
}
export function calculateSavedTownMapShape(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}): MapFrameShape | null {
  const { snapshot } = ports;
  return snapshot
    ? { width: snapshot.settings.townMapExpectedWidth, height: snapshot.settings.townMapExpectedHeight }
    : null;
}
export function calculateTownMapShape(ports: {
  savedTownMapShape: import("../../shared/types").MapFrameShape;
  townMapPick: { image: string; size: { width: number; height: number } };
}): MapFrameShape | null {
  const { savedTownMapShape, townMapPick } = ports;
  return townMapPick?.size ?? savedTownMapShape;
}
export function calculateTownMapZoom(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}): MapZoomRange {
  const { snapshot } = ports;
  return snapshot
    ? {
        min: snapshot.settings.townMapZoomMin,
        max: snapshot.settings.townMapZoomMax,
        step: snapshot.settings.townMapZoomStep,
      }
    : { min: 1, max: 1, step: 0.1 };
}
export function calculateTownMapSrc(ports: {
  mapRemoveDraft: boolean;
  townMapImage: string;
  townMapPick: { image: string; size: { width: number; height: number } };
}) {
  const { mapRemoveDraft, townMapImage, townMapPick } = ports;
  return mapRemoveDraft ? null : townMapPick ? townMapPick.image : townMapImage || null;
}
export function calculateFramingMap(ports: {
  reframingMap: boolean;
  townMapPick: { image: string; size: { width: number; height: number } };
}) {
  const { reframingMap, townMapPick } = ports;
  return townMapPick !== null || reframingMap;
}
export function calculatePanelMapView(ports: {
  framingMap: boolean;
  savedTownMapView: import("../../../shared/contracts/village").TownMapView;
  townMapDraft: import("../../../shared/contracts/village").TownMapView;
}): TownMapView {
  const { framingMap, savedTownMapView, townMapDraft } = ports;
  return framingMap ? (townMapDraft ?? savedTownMapView) : savedTownMapView;
}
export function calculateTownMapAdvice(ports: {
  townMapPick: { image: string; size: { width: number; height: number } };
}) {
  const { townMapPick } = ports;
  return townMapPick ? pictureAdvice(townMapPick.size) : null;
}
export function calculateSavedPins(ports: {
  mobile: boolean;
  nameOfCharacter: (characterId: string) => string;
  openPlaceId: string;
  openVenue: (place: import("../../../shared/contracts/village").VillageVenue) => void;
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}): MapPin[] {
  const { mobile, nameOfCharacter, openPlaceId, openVenue, snapshot } = ports;
  return (() => {
    const places = snapshot?.settings.venues ?? [];
    const pins: MapPin[] = [];
    // Everybody's current place, grouped by which place it is, so that two people
    // at the harbour hang under the harbour rather than on top of each other.
    const standing = new Map<string, VillageVillagerView[]>();
    for (const villager of snapshot?.villagers ?? []) {
      const id = villager.place?.id;
      if (!id) continue;
      const group = standing.get(id);
      if (group) group.push(villager);
      else standing.set(id, [villager]);
    }
    for (const place of places) {
      const spot = placeSpot(place);
      if (!spot) continue;
      const project = snapshot?.projects.find(
        (entry) => entry.venueId === place.id && entry.lifecycle?.phase !== "complete",
      );
      const occupant = place.occupancy.residentCharacterId;
      const house = isHouse(place);
      // Who the place is named after. A villager's own name, or the player's: the
      // player's house is the one house with no villager in it, so the Persona is
      // what stands in the same place rather than a rule of its own. See
      // `houseLabel`, which is the one reader of what a name does to "house".
      const resident = place.occupancy.playerHome ? playerDisplayName(snapshot) : nameOfCharacter(occupant);
      pins.push({
        id: place.id,
        x: spot.x,
        y: spot.y,
        text: mobile ? place.name : house ? pinText(resident) : place.name,
        image: project ? PROJECT_BLUEPRINT_IMAGE : (place.presentation.image?.url ?? null),
        tone: house ? pinTone({ isPlayerHome: place.occupancy.playerHome, occupant }) : "venue",
        selected: openPlaceId === place.id,
        onSelect: () => openVenue(place),
      });
      // Who is here, under the building they are at. Drawn as a label rather than
      // a button, because the place is what you walk into: who happens to be
      // standing in it at this hour is a fact about the place and not a second
      // door into it.
      (standing.get(place.id) ?? []).forEach((villager, index) => {
        pins.push({
          id: `villager:${villager.characterId}`,
          x: spot.x,
          y: spot.y,
          dy: STANDING_PIN_STEP * (index + 1),
          text: villager.name,
          tone: "resident",
          kind: "person",
          venueId: place.id,
          selected: mobile && openPlaceId === place.id,
          onSelect: mobile ? () => openVenue(place) : undefined,
        });
      });
    }
    return pins;
  })();
}
