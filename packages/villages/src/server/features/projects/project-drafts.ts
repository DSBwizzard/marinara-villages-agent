import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageProject, VillageState } from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound, VillagesRequestError } from "../../domain/rules/errors.js";
import { boundText } from "../../domain/rules/prompt-preset.js";
import { validVenueClasses } from "../../domain/rules/venue-model.js";
import { lifecycle } from "../../domain/rules/project-lifecycle-rules.js";
import { readRenovationChange } from "../../domain/rules/project-design.js";
import { venueDesignHash, changedZoneIds } from "../../domain/rules/project-structure.js";
import { renovationAffectedIds } from "../../domain/rules/project-terms.js";
import { randomUUID } from "node:crypto";
import { MAX_PROJECT_DRAFTS } from "../../../shared/helpers/project-design.js";

function requireDraftSpace(state: VillageState): void {
  if (state.projects.filter((project) => project.status === "planning").length >= MAX_PROJECT_DRAFTS)
    throw new VillagesRequestError(
      409,
      "Six Project drafts maximum. Start or cancel a draft, then retry.",
      "PROJECT_DRAFT_CAPACITY",
    );
}

export function draftNewVenueProject(
  state: VillageState,
  value: unknown,
  requesterCharacterId = "",
  requestId = "",
): VillageProject {
  const prior = requestId && state.projects.find((project) => project.id === requestId);
  if (prior) return prior;
  requireDraftSpace(state);
  const row = asRecord(value),
    name = boundText(row.name, 100).trim(),
    description = boundText(row.description, 2000).trim();
  const classes = row.classes ?? [row.venueClass];
  if (!name || !description || !validVenueClasses(classes))
    throw badRequest("Choose one or two Classes, a name and a description.");
  if (!state.setupAt) throw conflict("Found the Village before planning a Project.");
  const project: VillageProject = {
    id: requestId || randomUUID(),
    kind: "new-venue",
    title: name,
    venueId: "",
    participantIds: [],
    requesterCharacterId,
    progress: 0,
    status: "planning",
    updatedAt: villageNow().toISOString(),
    venueDraft: { name, classes, description, position: { x: null, y: null } },
    lifecycle: lifecycle(),
  };
  state.projects.push(project);
  return project;
}
export function draftRenovationProject(
  state: VillageState,
  venueId: string,
  value: unknown,
  requestId = "",
): VillageProject {
  const prior = requestId && state.projects.find((project) => project.id === requestId);
  if (prior) return prior;
  requireDraftSpace(state);
  const venue = state.venues.find((venue) => venue.id === venueId && venue.constructionStatus !== "worksite");
  if (!venue) throw notFound("Choose a finished Venue.");
  const row = asRecord(value),
    change = readRenovationChange(state, venue, row);
  const project: VillageProject = {
    id: requestId || randomUUID(),
    kind: "renovation",
    title: asTrimmedString(row.title).slice(0, 100) || "Renovation",
    venueId,
    participantIds: [],
    progress: 0,
    status: "planning",
    updatedAt: villageNow().toISOString(),
    lifecycle: lifecycle(venueId, change),
  };
  project.lifecycle!.changedZoneIds = changedZoneIds(venue, change);
  project.lifecycle!.baseDesignHash = venueDesignHash(venue, project.lifecycle!.changedZoneIds, change);
  project.lifecycle!.affectedIds = renovationAffectedIds(venue, change, project.lifecycle!.changedZoneIds);
  state.projects.push(project);
  return project;
}
