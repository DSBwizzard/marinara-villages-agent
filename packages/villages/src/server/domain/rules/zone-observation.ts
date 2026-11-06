import type { VillageState, VillageVenue, VillageVenueZone, ZoneObservation } from "../models/world.js";
import { zonePictureContext } from "./zone-picture.js";

/** Presentation remembered at a settled visit; never physical or access authority. */
export function captureZoneObservation(venue: VillageVenue, zone: VillageVenueZone): ZoneObservation {
  return {
    context: zonePictureContext({}, venue, zone),
    name: zone.name,
    description: zone.description,
    purpose: zone.purpose,
    roomSpecification: zone.roomSpecification,
    form: venue.form,
    state: structuredClone(zone.state),
    image: zone.image,
    dayNight: zone.dayNight !== false,
    daylight: zone.picture?.daylight,
    night: zone.picture?.night,
    pictureContext: zone.picture?.context ?? zone.picture?.baseline,
  };
}

export function rememberZoneArtwork(zone: VillageVenueZone, fromObservation = false): void {
  if (!zone.observed) return;
  zone.observed.image = zone.image;
  if (!fromObservation) zone.observed.dayNight = zone.dayNight !== false;
  zone.observed.daylight = zone.picture?.daylight;
  zone.observed.night = zone.picture?.night;
  zone.observed.pictureContext = zone.picture?.context ?? zone.picture?.baseline;
}

export function observedZone(zone: VillageVenueZone, authoring: boolean): VillageVenueZone {
  const observed = zone.observed;
  return authoring
    ? zone
    : {
        ...zone,
        observed: undefined,
        name: observed?.name || zone.name,
        description: observed?.description ?? "",
        purpose: observed?.purpose ?? "",
        roomSpecification: observed?.roomSpecification,
        state: observed?.state ?? { revision: 0, updatedAt: "", recent: null },
        image: observed?.image ?? null,
        dayNight: observed?.dayNight,
        preparation: undefined,
        picture: observed ? { base: observed.image, daylight: observed.daylight, night: observed.night } : undefined,
      };
}

/** Only remembered physical inputs; artwork changes do not create a new observation. */
export function zoneObservationKey(observed: ZoneObservation): string {
  return JSON.stringify([
    observed.context,
    observed.name,
    observed.description,
    observed.purpose,
    observed.roomSpecification,
    observed.form,
    observed.state,
    observed.dayNight,
  ]);
}
export function observedPictureKey(state: VillageState, zone: VillageVenueZone): string {
  return JSON.stringify([
    zone.observed,
    state.sceneryArtStyle,
    state.sceneryStyleProfileId,
    state.setting,
    state.worldRules,
    state.worldName,
  ]);
}
