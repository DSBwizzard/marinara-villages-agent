import { MAX_PHYSICAL_DESIGN_LENGTH } from "../../../shared/helpers/project-design.js";
import { applyConnectionEdits } from "../../../shared/helpers/zone-contact.js";
import type { VillageProject, VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { rememberDomainFact } from "./domain-memories.js";
import { badRequest, conflict } from "./errors.js";
import { prepareRenovatedPrivateInterior } from "./private-interior.js";
import { effectiveRenovationChange, validateRenovationDesign } from "./project-design.js";
import { venueDesignHash } from "./project-structure.js";
import { validImage } from "./project-terms.js";
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH } from "./prompt-preset.js";
import { validateConnections } from "./space-connections.js";
import { readBaseVenueLayout, validateLayoutZones } from "./venue-layout.js";
import { defaultVenueSpace } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { readVenueImageContext } from "./village-projections.js";

/** Only the saved committed design is applied; the lifecycle stages this transaction. */
export function completeProject(state: VillageState, project: VillageProject, at: string): void {
  const flow = project.lifecycle!;
  const venue = state.venues.find((entry) => entry.id === project.venueId);
  if (!venue) throw conflict("The Project site is missing.");
  if (project.kind === "new-venue") {
    if (!project.plan) throw conflict("The committed design is missing.");
    const plan = readProjectPlan(project.plan, venue);
    const zones = readBaseVenueLayout(
      { ...plan, description: plan.exteriorDescription, presentation: { image: plan.exteriorImage } },
      venue.classes ?? ["other"],
      "",
      validImage,
    );
    validateLayoutZones(
      venue,
      zones.filter((zone) => zone.kind !== "exterior"),
      venue.classes ?? ["other"],
      state,
    );
    venue.zones = zones;
    venue.form = plan.form;
    venue.venueType = plan.venueType;
    venue.imageContext = plan.imageContext;
    venue.description = plan.exteriorDescription;
    venue.presentation.image = plan.exteriorImage;
    venue.residenceCapacity = plan.capacity;
    venue.constructionStatus = "complete";
  } else {
    const change = effectiveRenovationChange(venue, flow.change!, flow.changedZoneIds);
    if (flow.baseDesignHash !== venueDesignHash(venue, flow.changedZoneIds))
      throw conflict("The Venue design changed. Cancel this Project and plan the current layout.");
    validateRenovationDesign(state, venue, change);
    const old = venueZones(venue);
    const drafts = change.zones ?? old.filter((zone) => zone.kind !== "exterior");
    const retired = old.filter((zone) => zone.kind !== "exterior" && !drafts.some((draft) => draft.id === zone.id));
    venue.archivedZones = [
      ...(venue.archivedZones ?? []),
      ...retired.map((zone) => ({ zone: structuredClone(zone), archivedAt: at })),
    ].slice(-64);
    venue.zones = [
      old.find((zone) => zone.kind === "exterior")!,
      ...drafts.map((draft) => {
        const previous = old.find((zone) => zone.id === draft.id);
        if (previous && !flow.changedZoneIds.includes(draft.id)) return previous;
        const zone: VillageVenueZone = {
          ...defaultVenueSpace(draft.venueClass),
          ...previous,
          ...draft,
          description: draft.preserveDescription && previous ? previous.description : draft.description,
          roomSpecification: draft.roomSpecification ?? previous?.roomSpecification,
          access: previous?.access,
          image: previous?.image ?? null,
          seen: previous?.seen ?? draft.ownerId === "player",
          preparation:
            !previous && ["private-residence", "staff", "restricted"].includes(draft.kind) && draft.ownerId !== "player"
              ? { status: "pending" }
              : previous?.preparation,
        };
        prepareRenovatedPrivateInterior(zone, previous);
        return zone;
      }),
    ];
    venue.zones = applyConnectionEdits(venue.zones, drafts);
    validateConnections(venue.zones);
    venue.classes = change.classes ?? venue.classes;
    venue.residenceCapacity = change.capacity ?? venue.residenceCapacity;
    venue.playerInvitations = venue.playerInvitations?.filter(
      (entry) => !retired.some((zone) => zone.id === entry.zoneId),
    );
    venue.editProposals = venue.editProposals?.filter((entry) => !retired.some((zone) => zone.id === entry.zoneId));
  }
  venue.layoutVersion = 1;
  venue.spaces = venue.zones!.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
  venue.privateSpaces = venue
    .zones!.filter((zone) => zone.kind === "private-residence")
    .map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" }));
  venue.state.updatedAt = at;
  venue.state.condition = "complete";
  flow.phase = "complete";
  flow.completedAt = at;
  flow.blockedReason = "";
  project.status = "complete";
  project.progress = 100;
  project.updatedAt = at;
  rememberDomainFact(state, {
    id: "project-complete:" + project.id,
    at,
    recordedAt: at,
    text: project.title + " was completed.",
    subjects: flow.builderId ? [flow.builderId] : [],
    knowers: flow.builderId ? [flow.builderId] : [],
    domainRef: { kind: "project", id: project.id },
    event: true,
  });
}
export function readProjectPlan(value: unknown, venue: VillageVenue): NonNullable<VillageProject["plan"]> {
  const row = asRecord(value);
  const form = boundText(row.form, MAX_PHYSICAL_DESIGN_LENGTH).trim();
  const exteriorDescription = boundText(row.exteriorDescription, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  if (!form || !exteriorDescription || row.layoutVersion !== 1)
    throw badRequest("Define the Physical design, layout and Entrance before work starts.");
  const capacity = Number(row.capacity ?? 1);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 4)
    throw badRequest("Residence capacity must be from one to four.");
  const zones = readBaseVenueLayout(
    { ...row, description: exteriorDescription, presentation: { image: row.exteriorImage } },
    venue.classes ?? ["other"],
    "",
    validImage,
  );
  return {
    capacity: Number(row.capacity ?? 1),
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
