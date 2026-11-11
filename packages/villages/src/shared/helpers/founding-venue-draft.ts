import { zoneDayNightDefault } from "./zone-day-night.js";
import type { VillageVenue } from "../contracts/village.js";
import type { FoundingVenueSuggestion } from "../contracts/founding.js";
import { draftZonePolicy } from "./founding-zone-policy.js";
import { resolveZoneLayout } from "./zone-layout.js";

export function foundingVenueDraftSource(venue: VillageVenue): VillageVenue {
  return { ...venue, presentation: { ...venue.presentation, x: null, y: null } };
}

export function applyFoundingVenueDraft(venue: VillageVenue, plan: FoundingVenueSuggestion): VillageVenue {
  if (!plan.zones) throw new Error("The Venue draft has no Zone plan.");
  const existing = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])];
  const zones = plan.zones.map((zone) => {
    const prior = existing.find((old) => old.id === zone.id);
    const venueClass = zone.private ? "residence" : (venue.classes?.[0] ?? "other");
    const base = prior ?? {
      id: zone.id,
      ownerId: zone.ownerId,
      venueClass,
      image: null,
      description: "",
      access: draftZonePolicy(venue, { ownerId: zone.ownerId, venueClass }, zone.private),
    };
    return {
      ...base,
      ...(zone.description !== base.description ? zoneDayNightDefault(zone.dayNight) : {}),
      name: zone.name,
      purpose: zone.purpose,
      description: zone.description,
      connectedTo: zone.connectedTo,
    };
  });
  const privateSpaces = zones
    .filter((zone) => plan.zones!.find((draft) => draft.id === zone.id)!.private)
    .map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" }));
  const spaces = zones.filter((zone) => !plan.zones!.find((draft) => draft.id === zone.id)!.private);
  return {
    ...venue,
    ...(plan.description !== venue.description ? zoneDayNightDefault(plan.dayNight) : {}),
    name: plan.name,
    venueType: plan.venueType,
    form: plan.form,
    description: plan.description,
    spaces,
    privateSpaces,
    layout: spaces.length ? (privateSpaces.length ? "both" : "common") : privateSpaces.length ? "private" : "exterior",
    zoneLayout: resolveZoneLayout(["exterior", ...zones.map((zone) => zone.id)], venue.zoneLayout),
  };
}
