import { createHash } from "node:crypto";
import type { OpeningProposal } from "../../../shared/contracts/opening.js";
import type { VillageVenue } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { conflict } from "./errors.js";
import { venueZones } from "./venue-zones.js";

type Renovation = NonNullable<OpeningProposal["renovation"]>;
export function readOpeningRenovation(value: unknown): Renovation {
  const row = asRecord(value);
  const text = (key: string, max: number) => {
    const value = asTrimmedString(row[key]);
    if (!value || value.length > max) throw conflict("The improvement needs a valid target and description.");
    return value;
  };
  if (row.slot !== 0 && row.slot !== 1) throw conflict("Choose an empty Upgrade slot.");
  return {
    venueId: text("venueId", 200),
    spaceId: text("spaceId", 200),
    slot: row.slot,
    title: text("title", 100),
    description: text("description", 1000),
    ...(asTrimmedString(row.sourceFingerprint) ? { sourceFingerprint: asTrimmedString(row.sourceFingerprint) } : {}),
  };
}

function target(venues: readonly VillageVenue[], terms: Pick<Renovation, "venueId" | "spaceId" | "slot">) {
  const venue = venues.find((entry) => entry.id === terms.venueId && entry.constructionStatus !== "worksite");
  const space =
    venue && venueZones(venue).find((zone) => zone.id === terms.spaceId && ["exterior", "public"].includes(zone.kind));
  if (!venue || !space || venue.improvements?.[terms.slot]) throw conflict("This improvement is no longer available.");
  return { venue, space };
}
export function openingRenovationFingerprint(venues: readonly VillageVenue[], terms: Renovation): string {
  const { venue, space } = target(venues, terms);
  return createHash("sha256")
    .update(
      JSON.stringify([
        venue.id,
        venue.name,
        venue.baseClasses ?? venue.classes,
        venue.occupancy,
        venue.residentIds,
        venue.workerIds,
        space.id,
        space.name,
        space.kind,
        space.ownerId,
        space.controllerIds,
        space.description,
        space.state.condition,
        space.state.features,
        terms.slot,
      ]),
    )
    .digest("hex");
}
export function openingRenovationChoices(venues: readonly VillageVenue[]) {
  return venues.flatMap((venue) => {
    if (venue.constructionStatus === "worksite") return [];
    const slot = [0, 1].find((index) => !venue.improvements?.[index]);
    if (slot === undefined) return [];
    return venueZones(venue)
      .filter((space) => ["exterior", "public"].includes(space.kind))
      .map((space) => ({
        venueId: venue.id,
        venue: venue.name,
        spaceId: space.id,
        space: space.name,
        slot,
      }));
  });
}
export function bindOpeningRenovation(proposal: OpeningProposal, venues: readonly VillageVenue[]): OpeningProposal {
  if (!proposal.renovation) return proposal;
  return {
    ...proposal,
    renovation: {
      ...proposal.renovation,
      sourceFingerprint: openingRenovationFingerprint(venues, proposal.renovation),
    },
  };
}
export function openingRenovationDraft(proposal: OpeningProposal, venues: readonly VillageVenue[]) {
  const terms = proposal.renovation;
  if (!terms || !terms.sourceFingerprint || terms.sourceFingerprint !== openingRenovationFingerprint(venues, terms))
    throw conflict("This improvement changed. Choose another proposal or skip the opening.");
  return {
    title: proposal.name,
    detail: proposal.description,
    slot: terms.slot,
    improvement: { title: terms.title, description: terms.description, spaceId: terms.spaceId, extraBeds: 0 },
  };
}
