import { findLocation } from "./places.js";
import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";
import { connectionProblem } from "../../../shared/helpers/zone-contact.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { defaultVenueSpace } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { sceneRelationshipView } from "./relationship-rules.js";
import { mergeNarrativeAfter } from "./narrative-development.js";
import { extendSceneNarrative } from "./scene-narrative-effects.js";

export function requireSceneZoneId(scene: Pick<VenueScene, "zoneId">): string {
  if (!scene.zoneId) throw conflict("That Scene has no captured Zone.");
  return scene.zoneId;
}

/** Only captured access inputs; persistent effects still validate against the current world. */
export function sceneAccessState(state: VillageState, scene: VenueScene): VillageState {
  const facts = scene.continuity?.facts;
  if (facts && scene.liveSceneVersion === 1 && scene.villageSeed === state.seed)
    return {
      ...state,
      venues: facts.venues,
      worldPlaces: facts.worldPlaces ?? state.worldPlaces,
      projects: facts.projects,
      narrative: facts.narrative,
      relationshipContext: facts.relationshipContext,
    };
  const narrative = structuredClone(facts?.narrative);
  if (facts && narrative)
    for (const turn of scene.submissions) {
      extendSceneNarrative({ ...state, venues: [], narrative }, state, scene, turn);
      for (const receipt of state.narrative?.receipts ?? []) {
        if (receipt.source !== "action" || receipt.sourceId !== scene.id) continue;
        const applied = Object.values(state.exchangeReceipts).some(
          (proof) =>
            proof.sceneId === scene.id &&
            proof.submissionId === turn.id &&
            proof.domain === "physical" &&
            proof.status === "applied" &&
            receipt.physical.some(
              (after) =>
                after.venueId === proof.physicalOutcome?.venueId &&
                after.zoneId === proof.physicalOutcome?.zoneId &&
                after.state.revision === proof.physicalOutcome?.actionReceipt?.after.state.revision,
            ),
        );
        if (applied) mergeNarrativeAfter(narrative, receipt.after);
      }
    }
  return facts && scene.villageSeed === state.seed
    ? {
        ...state,
        venues: facts.venues,
        worldPlaces: facts.worldPlaces ?? state.worldPlaces,
        projects: facts.projects,
        narrative,
        relationshipContext: sceneRelationshipView(state.relationshipContext, scene),
      }
    : state;
}

/** Scene layout and authority follow its captured world and witnessed developments. */
export function sceneLayoutVenue(venue: VillageVenue, scene?: VenueScene): VillageVenue {
  venue = findLocation(scene?.continuity?.facts, venue.id) ?? venue;
  const layout = scene?.sceneAttendance?.layout;
  if (!layout) return venue;
  const current = venueZones(venue);
  return {
    ...venue,
    zones: layout.map((saved) => {
      const live = current.find((zone) => zone.id === saved.id);
      return {
        ...defaultVenueSpace(saved.venueClass),
        ...saved,
        ...(live ?? {}),
        id: saved.id,
        kind: saved.kind,
        name: saved.name,
        venueClass: saved.venueClass,
        connectedTo: saved.connectedTo,
        ...(!live ? { closed: true } : {}),
      };
    }),
  };
}
export function captureSceneLayout(venue: VillageVenue) {
  const zones = venueZones(venue);
  if (connectionProblem(zones))
    throw conflict("The Venue connection map is invalid. Review it before opening a Scene.");
  return structuredClone(
    zones.map((zone) => ({
      id: zone.id,
      kind: zone.kind,
      name: zone.name,
      venueClass: zone.venueClass,
      connectedTo: zone.connectedTo,
    })),
  );
}

export function readSceneLayout(value: unknown): NonNullable<VenueScene["sceneAttendance"]>["layout"] {
  if (value === undefined) return undefined;
  const fail = () => conflict("This saved Scene has an invalid connection map. Its history is preserved.");
  if (!Array.isArray(value) || !value.length || value.length > 64) throw fail();
  const rows = value.map((value) => {
    const row = asRecord(value);
    if (
      typeof row.id !== "string" ||
      !row.id ||
      row.id.length > 200 ||
      typeof row.name !== "string" ||
      row.name.length > 100 ||
      !["exterior", "public", "shared-residence", "private-residence", "staff", "restricted"].includes(
        String(row.kind),
      ) ||
      !["residence", "workplace", "community", "other"].includes(String(row.venueClass)) ||
      !Array.isArray(row.connectedTo) ||
      row.connectedTo.length > 64 ||
      row.connectedTo.some((id) => typeof id !== "string")
    )
      throw fail();
    return { id: row.id, name: row.name, kind: row.kind, venueClass: row.venueClass, connectedTo: row.connectedTo };
  }) as NonNullable<NonNullable<VenueScene["sceneAttendance"]>["layout"]>;
  if (connectionProblem(rows)) throw fail();
  return rows;
}
