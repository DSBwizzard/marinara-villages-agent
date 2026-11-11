import { z } from "zod";
import type { VillageProject, VillageProjectLifecycle, VillageState } from "../models/world.js";
import type { Establishment } from "../../../shared/contracts/places.js";
import { findLocation, placeRegistry } from "./places.js";
import { zoneManagers } from "./venue-access.js";
import { assertCanAddVillageVenue } from "./venue-capacity.js";
import { conflict, badRequest } from "./errors.js";
import { renovationAffectedIds, projectAgreementCurrent } from "./project-terms.js";
import { readRenovationChange } from "./project-design.js";
import type { VillageVenue } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { validVenueClasses } from "./venue-model.js";

export function establishmentChange(
  state: VillageState,
  venue: VillageVenue,
  value: unknown,
  spec: Establishment,
  at: Date,
  prior?: VillageProjectLifecycle,
) {
  const row = asRecord(value),
    classes = row.classes ?? venue.classes;
  if (!validVenueClasses(classes)) throw badRequest("Choose one or two Venue Classes.");
  const zones = (venue.zones ?? [])
    .filter((zone) => zone.kind !== "exterior")
    .map((zone) => ({
      ...zone,
      description: "",
      roomSpecification: undefined,
      venueClass:
        zone.kind === "staff" ? "workplace" : classes.includes(zone.venueClass) ? zone.venueClass : classes[0],
    }));
  return readRenovationChange(
    state,
    venue,
    spec.physical ? { ...row, zones: row.zones ?? zones } : { classes, zones, detail: spec.goal },
    at,
    prior,
  );
}

const schema = z
  .object({
    goal: z.string().trim().min(1).max(1000),
    physical: z.boolean(),
    zoneIds: z.array(z.string().max(200)).min(1).max(7),
    objectives: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            text: z.string().trim().min(1).max(500),
            met: z.boolean(),
            evidence: z.array(z.object({ source: z.string().max(500), quote: z.string().max(1200) })).max(8),
          })
          .strict(),
      )
      .max(8),
  })
  .strict();
export function readEstablishment(value: unknown): Establishment {
  const parsed = schema.safeParse(value);
  if (!parsed.success || new Set(parsed.data.objectives.map((row) => row.id)).size !== parsed.data.objectives.length)
    throw badRequest("Describe the establishment goal and up to eight distinct objectives.");
  return parsed.data;
}
export function establishmentControllers(state: VillageState, project: VillageProject): string[] {
  const venue = findLocation(state, project.venueId),
    spec = project.establishment;
  if (!venue || !spec) throw conflict("The establishment Place is missing.");
  if (spec.zoneIds.some((id) => !venue.zones?.some((zone) => zone.id === id)))
    throw conflict("The establishment spaces changed.");
  return [
    ...new Set([
      ...(venue.access?.managerIds ?? []),
      ...(spec.physical
        ? renovationAffectedIds(venue, project.lifecycle?.change, project.lifecycle?.changedZoneIds)
        : []),
      ...(venue.zones ?? [])
        .filter((zone) => spec.zoneIds.includes(zone.id))
        .flatMap((zone) => zoneManagers(venue, zone)),
    ]),
  ].filter((id) => id !== "player");
}
export const establishmentScope = (project: VillageProject) =>
  JSON.stringify([
    project.id,
    project.lifecycle?.revision,
    project.establishment?.goal,
    project.establishment?.zoneIds,
    project.establishment?.physical,
    project.establishment?.objectives.map((row) => [row.id, row.text]),
    project.lifecycle?.change,
  ]);

export function establishmentDraft(value: unknown): Establishment {
  const input = z
    .object({
      goal: z.string(),
      physical: z.boolean(),
      zoneIds: z.array(z.string()),
      objectives: z.array(z.string().trim().min(1).max(500)).max(8),
    })
    .strict()
    .safeParse(value);
  if (!input.success) throw badRequest("Describe the ongoing use, spaces and objectives.");
  return readEstablishment({
    ...input.data,
    objectives: input.data.objectives.map((text, index) => ({
      id: "objective:" + index,
      text,
      met: false,
      evidence: [],
    })),
  });
}

export function promotePlace(
  state: VillageState,
  project: VillageProject,
  controllers = establishmentControllers(state, project),
): void {
  const registry = placeRegistry(state),
    place = registry?.places[project.venueId];
  if (!registry || !place || place.disabled || !place.prepared || place.report)
    throw conflict("Verify and prepare this Place before establishment.");
  if (project.establishment!.objectives.some((objective) => !objective.met))
    throw conflict("Establishment objectives remain unresolved.");
  const flow = project.lifecycle!;
  const missing = controllers.filter(
    (id) =>
      !flow.approvals.some(
        (approval) =>
          approval.residentId === id &&
          projectAgreementCurrent(state, approval) &&
          approval.scope === establishmentScope(project),
      ),
  );
  if (missing.length) throw conflict("Renew the necessary establishment agreements.");
  if (place.location.presentation.x === null || place.location.presentation.y === null)
    throw conflict("Place the location on its map before establishment.");
  const position = place.location.presentation;
  if (!state.maps.some((map) => map.id === position.mapId)) throw conflict("The Place map is unavailable.");
  if (
    state.venues.some(
      (venue) =>
        venue.presentation.mapId === position.mapId &&
        venue.presentation.x !== null &&
        venue.presentation.y !== null &&
        Math.abs(venue.presentation.x - position.x!) < 0.055 &&
        Math.abs(venue.presentation.y - position.y!) < 0.055,
    )
  )
    throw conflict("The Place marker overlaps a Venue. Choose another map position.");
  place.location.classes = project.lifecycle?.change?.classes ?? place.location.classes;
  if (!project.establishment?.physical)
    for (const zone of place.location.zones ?? []) {
      const assigned = project.lifecycle?.change?.zones?.find((row) => row.id === zone.id);
      if (assigned) zone.venueClass = assigned.venueClass;
    }
  assertCanAddVillageVenue(state, place.location.classes, project.id);
  if (state.venues.some((venue) => venue.id === place.id)) throw conflict("This Place is already a Venue.");
  state.venues.push(place.location);
  delete registry.places[place.id];
  registry.revision++;
}
