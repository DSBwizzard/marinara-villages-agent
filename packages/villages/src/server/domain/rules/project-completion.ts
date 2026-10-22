import type { VillageState, VillageProject, VillageVenue } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { badRequest, conflict } from "./errors.js";
import { recordProjectProgress } from "./project-progress.js";
import { validImage, renovationAffectedIds } from "./project-terms.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH } from "./prompt-preset.js";
import { readBaseVenueLayout, validateLayoutZones } from "./venue-layout.js";
import { defaultVenueSpace, venueResidentIds } from "./venue-model.js";
import { effectiveVenueClasses, venueZones } from "./venue-zones.js";
import { readVenueImageContext } from "./village-projections.js";
import { applyConnectionEdits } from "../../../shared/helpers/zone-contact.js";
import { validateConnections } from "./space-connections.js";
import { prepareRenovatedPrivateInterior } from "./private-interior.js";

/** Apply the exact saved design; callers stage this mutation before publishing it. */
export function completeProject(
  state: VillageState,
  project: VillageProject,
  row: Record<string, unknown>,
  at: string,
): void {
  const flow = project.lifecycle!;
  if (flow.phase !== "finishing") throw conflict("Construction must finish before the opening visit.");
  const venue = state.venues.find((entry) => entry.id === project.venueId);
  if (!venue) throw conflict("The Project site is missing.");
  if (project.kind === "renovation") {
    if (
      ["classes", "capacity", "homeKind", "slot", "improvement", "zones", "baseZones", "change"].some(
        (key) => row[key] !== undefined,
      )
    )
      throw conflict(
        "Reviewed structural terms cannot change at finishing. Revise the proposal and obtain renewed approval before construction.",
      );
    const change = flow.change!;
    const upgrades = [...(venue.improvements ?? [null, null])];
    if (change.slot !== undefined) upgrades[change.slot] = change.improvement ?? null;
    const projected = {
      ...venue,
      baseClasses: change.classes ?? venue.baseClasses ?? venue.classes,
      improvements: upgrades,
    };
    const classes = effectiveVenueClasses(projected);
    if (classes.length > 2) throw conflict("A Venue may have at most two distinct Classes.");
    if (!classes.includes("residence") && (venueResidentIds(venue).length || venue.occupancy.playerHome))
      throw conflict("Residents must move before Residence is removed.");
    if (!classes.includes("workplace") && venue.workerIds?.length)
      throw conflict("Workers must be unassigned before Workplace is removed.");
    if (
      venueResidentIds(venue).length + Number(venue.occupancy.playerHome) >
      Math.min(
        4,
        (change.capacity ?? venue.residenceCapacity ?? 1) +
          upgrades.reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0),
      )
    )
      throw conflict("The finished Residence needs room for its current residents.");
    validateLayoutZones(
      venue,
      [
        ...(change.baseZones ??
          venueZones(venue).filter(
            (zone) => !zone.upgradeId && zone.kind !== "exterior" && classes.includes(zone.venueClass),
          )),
        ...upgrades.flatMap((upgrade) => upgrade?.zones ?? []),
      ],
      classes,
      state,
    );
    const newAffected = renovationAffectedIds(venue, change).filter((actorId) => !flow.affectedIds.includes(actorId));
    if (newAffected.length)
      throw conflict("The affected residents or workers changed. Renew the Renovation approvals before opening.");
  }
  const applyOpening = () => {
    if (project.kind === "new-venue") {
      const form = boundText(row.form, 240).trim();
      const exterior = boundText(row.exteriorDescription, MAX_VENUE_DESCRIPTION_LENGTH).trim();
      if (!form || !exterior)
        throw badRequest("Define the Venue's physical form and Entrance appearance before opening it.");
      if (row.layoutVersion !== 1) throw badRequest("Choose the venue layout before opening it.");
      if (row.layoutVersion === 1) {
        const zones = readBaseVenueLayout(
          { ...row, description: exterior, presentation: { image: row.exteriorImage } },
          venue.classes ?? ["other"],
          "",
          validImage,
        );
        const existingZones = venueZones(venue);
        if (project.opening?.established && existingZones.some((saved) => !zones.some((zone) => zone.id === saved.id)))
          throw conflict("Keep existing Zones. Renovations unlock after the opening.");
        for (const zone of zones) {
          const existing = existingZones.find((saved) => saved.id === zone.id);
          if (existing && (project.opening?.established || zone.kind === "exterior")) {
            const draft = { ...zone };
            Object.assign(zone, existing, draft, {
              state: existing.state,
              seen: existing.seen,
              picture: existing.picture,
              lastObserved: existing.lastObserved,
              preparation: existing.preparation,
              adaptationPending: existing.adaptationPending,
              image: draft.image ?? existing.image,
            });
          }
          // Structural finishing cannot replace access rules governed by the command service.
          zone.access = existing?.access;
        }
        validateLayoutZones(
          venue,
          zones.filter((zone) => zone.kind !== "exterior"),
          venue.classes ?? ["other"],
          state,
        );
        venue.layoutVersion = 1;
        venue.zones = zones;
        venue.spaces = zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
        venue.privateSpaces = zones
          .filter((zone) => zone.kind === "private-residence")
          .map((zone) => ({ ...zone, ownerId: zone.ownerId || "" }));
        venue.form = form;
        venue.venueType = boundText(row.venueType, 100);
        venue.imageContext = readVenueImageContext(row.imageContext);
        venue.description = exterior;
        venue.presentation.image =
          validImage(row.exteriorImage) ?? (project.opening?.established ? venue.presentation.image : null);
        venue.constructionStatus = "complete";
        if (!project.opening?.established) venue.state.condition = "complete";
        venue.state.updatedAt = at;
        flow.phase = "complete";
        project.status = "complete";
        project.progress = 100;
        project.updatedAt = at;
        state.projectWishOutbox.push({ projectId: project.id, at });
        return;
      }
    } else {
      const change = flow.change!;
      if (change.classes) {
        venue.baseClasses = change.classes;
        venue.classes = change.classes;
        if (venue.layoutVersion !== 1)
          venue.spaces = change.classes.map(
            (venueClass) =>
              venue.spaces?.find((space) => space.venueClass === venueClass) ??
              defaultVenueSpace(venueClass, venue.description),
          );
      }
      const oldZones = venueZones(venue);
      const oldUpgrade = change.slot !== undefined ? venue.improvements?.[change.slot] : null;
      const nextDrafts = change.improvement?.zones ?? [];
      const retired = oldZones.filter(
        (zone) =>
          zone.kind !== "exterior" &&
          ((change.baseZones && !zone.upgradeId && !change.baseZones.some((draft) => draft.id === zone.id)) ||
            (change.classes && !zone.upgradeId && !change.classes.includes(zone.venueClass)) ||
            (oldUpgrade &&
              zone.upgradeId === oldUpgrade.id &&
              (change.improvement?.id !== oldUpgrade.id || !nextDrafts.some((draft) => draft.id === zone.id)))),
      );
      venue.archivedZones = [
        ...(venue.archivedZones ?? []),
        ...retired.map((zone) => ({ zone: structuredClone(zone), archivedAt: at })),
      ].slice(-64);
      venue.zones = oldZones.filter((zone) => !retired.some((entry) => entry.id === zone.id));
      venue.layoutVersion = 1;
      if (change.baseZones) {
        for (const draft of change.baseZones) {
          const index = venue.zones.findIndex((zone) => zone.id === draft.id);
          const previous = index >= 0 ? venue.zones[index] : undefined;
          const zone = {
            ...defaultVenueSpace(draft.venueClass),
            ...previous,
            ...draft,
            description: draft.preserveDescription && previous ? previous.description : draft.description,
            preparation:
              !previous &&
              ["staff", "restricted", "private-residence"].includes(draft.kind) &&
              draft.ownerId !== "player"
                ? { status: "pending" as const }
                : previous?.preparation,
            image: previous?.image ?? null,
            seen: previous?.seen ?? draft.ownerId === "player",
          };
          prepareRenovatedPrivateInterior(zone, previous);
          if (index >= 0) venue.zones[index] = zone;
          else venue.zones.push(zone);
        }
      }
      if (change.improvement)
        for (const draft of nextDrafts) {
          const index = venue.zones.findIndex((zone) => zone.id === draft.id);
          const previous = index >= 0 ? venue.zones[index] : undefined;
          const zone = {
            ...defaultVenueSpace(draft.venueClass, draft.description),
            ...previous,
            ...draft,
            description: draft.preserveDescription && previous ? previous.description : draft.description,
            preparation:
              ["staff", "restricted", "private-residence"].includes(draft.kind) &&
              !previous &&
              draft.ownerId !== "player"
                ? { status: "pending" as const }
                : previous?.preparation,
            upgradeId: change.improvement.id,
            image: previous?.image ?? null,
          };
          prepareRenovatedPrivateInterior(zone, previous);
          const image = validImage(asRecord(row.zoneImages)[draft.id]);
          if (image) zone.image = image;
          if (index >= 0) venue.zones[index] = zone;
          else venue.zones.push(zone);
        }
      venue.zones = applyConnectionEdits(venue.zones, [...(change.baseZones ?? []), ...nextDrafts]);
      validateConnections(venue.zones);
      venue.playerInvitations = venue.playerInvitations?.filter(
        (invitation) => !retired.some((zone) => zone.id === invitation.zoneId),
      );
      if (change.capacity !== undefined) venue.residenceCapacity = change.capacity;
      if (change.homeKind) {
        venue.occupancy.homeKind = change.homeKind;
        const tierName = state.homeBuildingNames[change.homeKind];
        if (tierName && !venue.state.upgrades.includes(tierName)) venue.state.upgrades.push(tierName);
      }
      if (change.slot !== undefined) {
        const upgrades = [...(venue.improvements ?? [null, null])];
        upgrades[change.slot] = change.improvement ? { ...change.improvement, approvedAt: at } : null;
        venue.improvements = upgrades;
      }
      venue.editProposals = venue.editProposals?.filter(
        (proposal) => !retired.some((zone) => zone.id === proposal.zoneId),
      );
      if (venue.layoutVersion === 1) {
        venue.spaces = venue.zones.filter(
          (zone) => !zone.upgradeId && ["public", "shared-residence"].includes(zone.kind),
        );
        venue.privateSpaces = venue.zones
          .filter((zone) => zone.kind === "private-residence")
          .map((zone) => ({ ...zone, ownerId: zone.ownerId || "" }));
      }
      venue.classes = effectiveVenueClasses(venue);
      const exterior = validImage(row.exteriorImage);
      if (exterior) venue.presentation.image = exterior;
    }
    venue.state.updatedAt = at;
    flow.phase = "complete";
    project.status = "complete";
    project.progress = 100;
    project.updatedAt = at;
    state.projectWishOutbox.push({ projectId: project.id, at });
  };
  const evidence = {
    id: `project:${project.id}:opened`,
    kind: "project-opening",
    at,
    sourceId: project.venueId,
    venueId: project.venueId,
  };
  project.status = "finishing";
  flow.blockedReason = "";
  recordProjectProgress(state, project, "opened", evidence, "", applyOpening);
}

export function readProjectPlan(value: unknown, venue: VillageVenue): NonNullable<VillageProject["plan"]> {
  const row = asRecord(value);
  const form = boundText(row.form, 240).trim();
  const exteriorDescription = boundText(row.exteriorDescription, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  if (!form || !exteriorDescription || row.layoutVersion !== 1)
    throw badRequest("Define the physical form, layout and Exterior before work starts.");
  const zones = readBaseVenueLayout(
    { ...row, description: exteriorDescription, presentation: { image: row.exteriorImage } },
    venue.classes ?? ["other"],
    "",
    validImage,
  );
  return {
    imageContext: readVenueImageContext(row.imageContext),
    form,
    venueType: boundText(row.venueType, 100),
    exteriorDescription,
    layoutVersion: 1,
    layout: row.layout as NonNullable<VillageProject["plan"]>["layout"],
    spaces: zones.filter((zone) => zone.kind !== "exterior" && ["public", "shared-residence"].includes(zone.kind)),
    privateSpaces: zones.filter((zone) => !["exterior", "public", "shared-residence"].includes(zone.kind)),
    exteriorImage: validImage(row.exteriorImage),
  };
}
