import type {
  VillageProject,
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueImprovement,
  VillageZoneDraft,
} from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { createProjectProgress } from "../../domain/rules/project-progress.js";
import {
  boundText,
  isHomeBuildingKind,
  isHousePlace,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
} from "../../domain/rules/prompt-preset.js";
import { assertCanAddVillageVenue } from "../../domain/rules/venue-capacity.js";
import { validateLayoutZones } from "../../domain/rules/venue-layout.js";
import { validVenueClasses, venueResidentIds } from "../../domain/rules/venue-model.js";
import { effectiveVenueClasses, venueZones } from "../../domain/rules/venue-zones.js";
import { randomUUID } from "node:crypto";
import { active, lifecycle, sameName } from "../../domain/rules/project-lifecycle-rules.js";

/** Synchronous draft builders mutate supplied state; UUID and current time are allocated at their original validation points. */
export function draftNewVenueProject(
  state: VillageState,
  value: unknown,
  requesterCharacterId = "",
  requestId = "",
): VillageProject {
  const row = asRecord(value);
  const name = boundText(row.name, MAX_VENUE_NAME_LENGTH).trim();
  const description = boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  const classes = Array.isArray(row.classes) ? row.classes : [row.venueClass];
  if (!name || !description || !validVenueClasses(classes) || classes.length !== 1)
    throw badRequest("Give the New Venue one Class, a name, and a description.");
  const existing = requestId && state.projects.find((entry) => entry.id === requestId);
  if (existing) return existing;
  if (!state.setupAt && !state.villagers.length && !state.venues.some((venue) => isHousePlace(venue)))
    throw conflict("Found the Village before starting a Project.");
  if (active(state, "new-venue")) throw conflict("Finish the current New Venue before starting another.");
  if (sameName(state, name)) throw conflict("That Venue name is already in use or reserved.");
  assertCanAddVillageVenue(state, classes as VillageVenue["classes"]);
  const at = new Date().toISOString();
  const project: VillageProject = {
    id: requestId || randomUUID(),
    kind: "new-venue",
    title: name,
    venueId: "",
    participantIds: requesterCharacterId ? [requesterCharacterId] : [],
    progress: 0,
    status: "draft",
    updatedAt: at,
    venueDraft: {
      name,
      classes: classes as VillageVenueClass[],
      description,
      category: "",
      position: { x: null, y: null },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
    },
    lifecycle: lifecycle("concept"),
  };
  state.projects.push(project);
  createProjectProgress(state, project, at);
  return project;
}

export function draftRenovationProject(state: VillageState, venueId: string, value: unknown): VillageProject {
  const row = asRecord(value);
  const title = boundText(row.title, MAX_VENUE_NAME_LENGTH).trim() || "Renovation";
  const detail = boundText(row.detail, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  const classes = row.classes === undefined ? undefined : row.classes;
  if (classes !== undefined && !validVenueClasses(classes)) throw badRequest("Choose one or two Venue Classes.");
  const capacity = row.capacity === undefined ? undefined : Number(row.capacity);
  if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1 || capacity > 4))
    throw badRequest("Residence capacity must be from one to four.");
  const homeKind = row.homeKind === undefined ? undefined : asTrimmedString(row.homeKind);
  if (homeKind !== undefined && !isHomeBuildingKind(homeKind)) throw badRequest("Choose a valid home tier.");
  const baseZonesInput = row.baseZones;
  const slot = row.slot === undefined ? undefined : Number(row.slot);
  if (slot !== undefined && slot !== 0 && slot !== 1) throw badRequest("Choose Upgrade slot one or two.");
  const improvementRow = row.improvement === null ? null : asRecord(row.improvement);
  const improvement: VillageVenueImprovement | null | undefined =
    row.improvement === undefined
      ? undefined
      : improvementRow === null
        ? null
        : {
            id: asTrimmedString(improvementRow.id) || randomUUID(),
            classContribution:
              improvementRow.classContribution === undefined || improvementRow.classContribution === ""
                ? undefined
                : validVenueClasses([improvementRow.classContribution])
                  ? (improvementRow.classContribution as VillageVenueClass)
                  : (() => {
                      throw badRequest("Choose a valid Upgrade Class.");
                    })(),
            zones: undefined,
            title: boundText(improvementRow.title, MAX_VENUE_NAME_LENGTH).trim(),
            description: boundText(improvementRow.description, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
            spaceId: asTrimmedString(improvementRow.spaceId) || null,
            extraBeds: Number(improvementRow.extraBeds ?? 0),
            approvedAt: "",
          };
  if (
    !detail ||
    (classes === undefined &&
      capacity === undefined &&
      homeKind === undefined &&
      slot === undefined &&
      baseZonesInput === undefined) ||
    (slot === undefined && improvement !== undefined) ||
    (improvement &&
      (!improvement.title ||
        !improvement.description ||
        !Number.isInteger(improvement.extraBeds) ||
        improvement.extraBeds < 0 ||
        improvement.extraBeds > 3))
  )
    throw badRequest("Describe a physical change, including its Class, capacity, or Upgrade slot.");
  if (active(state, "renovation")) throw conflict("Finish the current Renovation before starting another.");
  const venue = state.venues.find((entry) => entry.id === venueId && entry.constructionStatus !== "worksite");
  if (!venue) throw notFound("That finished Venue no longer exists.");
  if (homeKind && !venue.classes?.includes("residence")) throw conflict("Only a Residence has a home tier.");
  let baseZones: VillageZoneDraft[] | undefined;
  if (baseZonesInput !== undefined) {
    if (!Array.isArray(baseZonesInput) || baseZonesInput.length > 16)
      throw badRequest("Describe up to sixteen base zones.");
    const ids = new Set<string>();
    baseZones = baseZonesInput.map((value) => {
      const raw = asRecord(value),
        id = asTrimmedString(raw.id) || randomUUID();
      if (ids.has(id) || id === "exterior" || venueZones(venue).some((zone) => zone.id === id && zone.upgradeId))
        throw badRequest("Base zone IDs must be distinct from the exterior and Upgrade zones.");
      ids.add(id);
      const kind = String(raw.kind);
      const existingArea = venueZones(venue).find((zone) => zone.id === id);
      const name = boundText(raw.name, 100).trim(),
        description = boundText(raw.description, 1000).trim();
      if (
        !name ||
        !["public", "shared-residence", "private-residence", "staff", "restricted"].includes(kind) ||
        (!description && !existingArea?.description && ["public", "shared-residence"].includes(kind))
      )
        throw badRequest("Describe each base zone and choose its kind.");
      const existing = venueZones(venue).find((zone) => zone.id === id);
      if (existing?.kind === "private-residence" && asTrimmedString(raw.ownerId) !== (existing.ownerId || ""))
        throw badRequest("Resident moves assign Private Spaces; Renovations cannot transfer occupied rooms.");
      return {
        id,
        name,
        preserveDescription: !description && !!existingArea,
        kind: kind as VillageZoneDraft["kind"],
        description,
        purpose: boundText(raw.purpose, 240),
        ownerId: asTrimmedString(raw.ownerId) || undefined,
        controllerIds: Array.isArray(raw.controllerIds)
          ? raw.controllerIds.filter((id): id is string => typeof id === "string")
          : [],
        venueClass: raw.venueClass as VillageVenueClass,
      };
    });
    for (const kinds of [
      ["public", "shared-residence"],
      ["private-residence", "staff", "restricted"],
    ]) {
      const oldCount = venueZones(venue).filter((zone) => !zone.upgradeId && kinds.includes(zone.kind)).length;
      if (baseZones.filter((zone) => kinds.includes(zone.kind)).length > Math.max(1, oldCount))
        throw badRequest("Further areas must be added as Upgrade zones; existing base areas may be retained.");
    }
  }
  const priorUpgrade = slot !== undefined ? venue.improvements?.[slot] : null;
  if (improvement && improvementRow) {
    if (improvementRow.id && improvement.id !== priorUpgrade?.id)
      throw badRequest("Only the current Upgrade can be modified in this slot.");
    if (improvementRow.zones !== undefined) {
      if (!Array.isArray(improvementRow.zones) || improvementRow.zones.length > 16)
        throw badRequest("Describe up to sixteen Upgrade zones.");
      const ids = new Set<string>();
      improvement.zones = improvementRow.zones.map((value) => {
        const zone = asRecord(value),
          requestedId = asTrimmedString(zone.id);
        const existing = requestedId
          ? venueZones(venue).find((entry) => entry.id === requestedId && entry.upgradeId === improvement.id)
          : undefined;
        if (requestedId && !existing) throw badRequest("A modified zone must belong to this Upgrade.");
        const id = existing?.id ?? randomUUID(),
          name = boundText(zone.name, MAX_VENUE_NAME_LENGTH).trim(),
          description = boundText(zone.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
        if (
          !name ||
          (!description &&
            !existing?.description &&
            !["private-residence", "staff", "restricted"].includes(String(zone.kind))) ||
          ids.has(id) ||
          !["public", "shared-residence", "private-residence", "staff", "restricted"].includes(String(zone.kind))
        )
          throw badRequest("Give every zone a name, description, and supported kind.");
        if (existing?.kind === "private-residence" && asTrimmedString(zone.ownerId) !== (existing.ownerId || ""))
          throw badRequest("Resident moves assign Private Spaces; Renovations cannot transfer occupied rooms.");
        ids.add(id);
        return {
          id,
          name,
          description,
          preserveDescription: !description && !!existing,
          purpose: boundText(zone.purpose, 240),
          ownerId: asTrimmedString(zone.ownerId) || undefined,
          controllerIds: Array.isArray(zone.controllerIds)
            ? [...new Set(zone.controllerIds.filter((id): id is string => typeof id === "string"))]
            : [],
          kind: zone.kind as VillageZoneDraft["kind"],
          venueClass: validVenueClasses([zone.venueClass])
            ? (zone.venueClass as VillageVenueClass)
            : (improvement.classContribution ?? (venue.baseClasses ?? venue.classes ?? ["other"])[0]!),
        };
      });
    } else if (priorUpgrade?.id === improvement.id) improvement.zones = priorUpgrade.zones;
  }
  const baseClasses = (classes ?? venue.baseClasses ?? venue.classes ?? ["other"]) as VillageVenueClass[];
  const proposedUpgrades = [...(venue.improvements ?? [null, null])];
  if (slot !== undefined) proposedUpgrades[slot] = improvement ?? null;
  const nextClasses = effectiveVenueClasses({ ...venue, baseClasses, improvements: proposedUpgrades });
  if (nextClasses.length > 2)
    throw conflict("A Venue may have at most two distinct Classes across its base and Upgrades.");
  const survivingUpgradeZones = venueZones(venue).filter(
    (zone) => zone.upgradeId && zone.upgradeId !== priorUpgrade?.id,
  );
  for (const zone of [...(improvement?.zones ?? []), ...survivingUpgradeZones]) {
    if (
      zone.kind === "restricted" &&
      (!zone.controllerIds?.length ||
        zone.controllerIds.some(
          (id) => id !== "player" && !state.villagers.some((person) => person.characterId === id),
        ))
    )
      throw badRequest("Choose current villagers as private-space controllers.");
    if (
      !nextClasses.includes(zone.venueClass) ||
      (zone.kind === "shared-residence" && zone.venueClass !== "residence") ||
      (zone.kind === "staff" && zone.venueClass !== "workplace")
    )
      throw badRequest("The zone must be supported by the Venue's Classes.");
  }
  if (!nextClasses.includes("residence") && (venueResidentIds(venue).length || venue.occupancy.playerHome))
    throw conflict("Residents must move before Residence is removed.");
  if (!nextClasses.includes("workplace") && (venue.workerIds?.length ?? 0))
    throw conflict("Workers must be unassigned before Workplace is removed.");
  validateLayoutZones(
    venue,
    [
      ...(baseZones ??
        venueZones(venue).filter(
          (zone) => !zone.upgradeId && zone.kind !== "exterior" && nextClasses.includes(zone.venueClass),
        )),
      ...(improvement?.zones ?? []),
      ...survivingUpgradeZones,
    ],
    nextClasses,
    state,
  );
  const nextCapacity = capacity ?? venue.residenceCapacity ?? 1;
  const upgrades = [...(venue.improvements ?? [null, null])];
  if (slot !== undefined) upgrades[slot] = improvement ?? null;
  if (
    venueResidentIds(venue).length + Number(venue.occupancy.playerHome) >
    Math.min(4, nextCapacity + upgrades.reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0))
  )
    throw conflict("The finished Residence needs room for its current residents.");
  if (
    improvement?.spaceId &&
    !venueZones(venue).some((zone) => zone.id === improvement.spaceId) &&
    !nextClasses.includes(improvement.spaceId as VillageVenueClass)
  )
    throw badRequest("The Upgrade must belong to one of this Venue's Classes.");
  const affectedIds = [
    ...new Set([
      ...venueResidentIds(venue),
      ...(venue.workerIds ?? []),
      ...venueZones(venue).flatMap((zone) => zone.controllerIds ?? []),
      ...(baseZones ?? []).flatMap((zone) => zone.controllerIds ?? []),
      ...(improvement?.zones ?? []).flatMap((zone) => zone.controllerIds ?? []),
    ]),
  ].filter((id) => id !== "player");
  const at = new Date().toISOString();
  const project: VillageProject = {
    id: randomUUID(),
    kind: "renovation",
    title,
    venueId,
    participantIds: [],
    progress: 0,
    status: "active",
    updatedAt: at,
    lifecycle: lifecycle(
      affectedIds.length ? "approval" : "builder",
      venueId,
      {
        ...(classes ? { classes: classes as VillageVenueClass[] } : {}),
        ...(capacity !== undefined ? { capacity } : {}),
        ...(baseZones !== undefined ? { baseZones } : {}),
        ...(homeKind !== undefined ? { homeKind: homeKind as NonNullable<VillageVenue["occupancy"]["homeKind"]> } : {}),
        ...(slot !== undefined ? { slot } : {}),
        ...(improvement !== undefined ? { improvement } : {}),
        detail,
      },
      affectedIds,
    ),
  };
  state.projects.push(project);
  createProjectProgress(state, project, at);
  return project;
}
