import { MAX_PHYSICAL_DESIGN_LENGTH } from "../../../shared/helpers/project-design.js";
import { applyConnectionEdits } from "../../../shared/helpers/zone-contact.js";
import type { VillageProject, VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { readPlaceDescription } from "./prompt-preset.js";
import { asRecord } from "./coerce.js";
import {
  completeWorksiteEntrance,
  initializeRoomContinuity,
  removeNativeRoom,
  retainNativeFact,
} from "./native-continuity.js";
import { continuityActor } from "./continuity-actors.js";
import { badRequest, conflict } from "./errors.js";
import { isPrivateInterior } from "./private-interior.js";
import { effectiveRenovationChange, validateRenovationDesign } from "./project-design.js";
import { venueDesignHash } from "./project-structure.js";
import { validImage } from "./project-terms.js";
import { boundText } from "./prompt-preset.js";
import { validateConnections } from "./space-connections.js";
import { readBaseVenueLayout, validateLayoutZones } from "./venue-layout.js";
import { defaultVenueSpace } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { initializeVenueAccess } from "./venue-access.js";
import { readVenueImageContext } from "./village-projections.js";
import { findLocation } from "./places.js";
import { captureZoneObservation } from "./zone-observation.js";
import { stageProjectRoomEdits } from "./project-room-edits.js";

/** Only the saved committed design is applied; the lifecycle stages this transaction. */
export function completeProject(
  state: VillageState,
  project: VillageProject,
  at: string,
  options: { administrative?: boolean } = {},
): void {
  const flow = project.lifecycle!;
  const venue = findLocation(state, project.venueId);
  if (!venue) throw conflict("The Project site is missing.");
  const priorIds = new Set(venueZones(venue).map((zone) => zone.id));
  if (project.kind === "new-venue") {
    if (!project.plan) throw conflict("The committed design is missing.");
    const plan = readProjectPlan(project.plan, venue);
    const zones = readBaseVenueLayout(
      { ...plan, description: plan.exteriorDescription, presentation: { image: plan.exteriorImage } },
      "",
      validImage,
    );
    for (const zone of zones) {
      if (zone.preparation?.status !== "pending") continue;
      zone.description = zone.roomSpecification ?? zone.description;
      delete zone.preparation;
    }
    validateLayoutZones(
      venue,
      zones.filter((zone) => zone.kind !== "exterior"),
      state,
    );
    const oldEntrance = venue.zones?.find((zone) => zone.kind === "exterior");
    zones[0].observed = oldEntrance?.observed;
    if (oldEntrance && !plan.exteriorImage) {
      zones[0].image = oldEntrance.image;
      zones[0].picture = oldEntrance.picture && { ...oldEntrance.picture, claim: undefined, dirty: false };
      zones[0].dayNight = oldEntrance.dayNight;
      zones[0].freezePicture = oldEntrance.freezePicture;
    }
    zones[0].pictureRevision = (oldEntrance?.pictureRevision ?? 0) + 1;
    venue.zones = zones;
    venue.form = plan.form;
    venue.venueType = plan.venueType;
    venue.imageContext = plan.imageContext;
    venue.description = plan.exteriorDescription;
    venue.presentation.image = zones[0].image;
    completeWorksiteEntrance(state, venue, project.id, at);
    venue.constructionStatus = "complete";
  } else {
    const change = effectiveRenovationChange(venue, flow.change!, flow.changedZoneIds);
    if (flow.baseDesignHash !== venueDesignHash(venue, flow.changedZoneIds, flow.change))
      throw conflict("The Venue design changed. Cancel this Project and plan the current layout.");
    validateRenovationDesign(state, venue, change, new Date(at));
    Object.assign(state, stageProjectRoomEdits(state, venue, flow, project.id, at));
    const old = venueZones(venue);
    const drafts = change.zones ?? old.filter((zone) => zone.kind !== "exterior");
    const retired = old.filter((zone) => zone.kind !== "exterior" && !drafts.some((draft) => draft.id === zone.id));
    for (const zone of retired) removeNativeRoom(state, venue.id, zone.id, at);
    if (retired.length)
      venue.archivedZones = [
        ...(venue.archivedZones ?? []),
        ...retired.map((zone) => ({ zone: { ...structuredClone(zone), description: "" }, archivedAt: at })),
      ].slice(-64);
    venue.zones = [
      old.find((zone) => zone.kind === "exterior")!,
      ...drafts.map((draft) => {
        const previous = old.find((zone) => zone.id === draft.id);
        if (previous && !flow.changedZoneIds.includes(draft.id)) return previous;
        if (
          previous?.ownerId &&
          draft.ownerId !== previous.ownerId &&
          (draft.kind === "personal" || previous.kind === "personal")
        )
          throw conflict("Resident moves assign Private Spaces; Renovations cannot transfer occupied rooms.");
        const zone: VillageVenueZone = {
          ...defaultVenueSpace(draft.id),
          ...previous,
          ...draft,
          description: previous
            ? previous.description
            : draft.description || (isPrivateInterior(draft) ? (draft.roomSpecification ?? "") : ""),
          purpose: draft.purpose ?? previous?.purpose,
          roomSpecification: draft.roomSpecification ?? previous?.roomSpecification,
          access:
            previous && (previous.kind !== draft.kind || previous.ownerId !== draft.ownerId)
              ? undefined
              : previous?.access,
          image: previous?.image ?? null,
          seen: previous?.seen ?? draft.ownerId === "player",
          preparation: previous?.preparation,
        };
        return zone;
      }),
    ];
    venue.zones = applyConnectionEdits(venue.zones, drafts);
    validateConnections(venue.zones);
    if (change.form !== undefined) {
      venue.form = change.form;
    }
  }
  venue.layoutVersion = 1;
  initializeVenueAccess(venue);
  for (const zone of venue.zones ?? []) {
    if (priorIds.has(zone.id) || (zone.preparation && zone.preparation.status !== "ready")) continue;
    if (zone.description.trim())
      initializeRoomContinuity(state, venue.id, zone.id, zone.description, project.id + ":complete", at);
    if (zone.seen) zone.observed = captureZoneObservation(venue, zone, zone.description);
  }
  venue.spaces = venue.zones!.filter((zone) => ["public"].includes(zone.kind));
  venue.privateSpaces = venue
    .zones!.filter((zone) => zone.kind === "personal")
    .map((zone) => ({ ...zone, ownerId: zone.ownerId ?? "" }));
  flow.phase = "complete";
  flow.completedAt = at;
  flow.blockedReason = "";
  project.status = "complete";
  project.progress = 100;
  project.updatedAt = at;
  retainNativeFact(
    state,
    {
      id: "project-complete:" + project.id,
      kind: "project",
      targetId: project.id,
      revision: 1,
      text: project.title + " was completed.",
      witnesses:
        !options.administrative && flow.builderId && continuityActor(state, flow.builderId) ? [flow.builderId] : [],
    },
    at,
    { about: flow.builderId ? [flow.builderId] : [] },
  );
}
export function readProjectPlan(value: unknown, _venue: VillageVenue): NonNullable<VillageProject["plan"]> {
  const row = asRecord(value);
  const form = boundText(row.form, MAX_PHYSICAL_DESIGN_LENGTH).trim();
  const exteriorDescription = readPlaceDescription(row.exteriorDescription).trim();
  if (!form || !exteriorDescription || row.layoutVersion !== 1)
    throw badRequest("Define the Physical design, layout and Entrance before work starts.");
  const zones = readBaseVenueLayout(
    { ...row, description: exteriorDescription, presentation: { image: row.exteriorImage } },
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
    spaces: zones.filter((zone) => zone.kind !== "exterior" && ["public"].includes(zone.kind)),
    privateSpaces: zones.filter((zone) => !["exterior", "public", "public"].includes(zone.kind)),
    exteriorImage: validImage(row.exteriorImage),
  };
}
