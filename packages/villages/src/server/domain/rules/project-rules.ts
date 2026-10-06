import type { VillageBuildSource, VillageProject, VillageState } from "../models/world.js";
import { legacyZoneId, resolveVenueZone } from "./venue-zones.js";

export function sourceKey(source: VillageBuildSource): string {
  return [source.venueId, source.supplierId, source.itemName.trim().toLocaleLowerCase()].join("\u0000");
}
export function sourceAvailable(state: VillageState, source: VillageBuildSource): boolean {
  if (source.remaining < 1) return false;
  const venue = state.venues.find((entry) => entry.id === source.venueId);
  if (!venue || venue.constructionStatus === "worksite") return false;
  if (source.kind === "existing-item")
    return (
      resolveVenueZone(venue, source.zoneId ?? legacyZoneId(venue, "public"))?.state.items.includes(source.itemName) ??
      false
    );
  return (
    state.villagers.some((resident) => resident.characterId === source.supplierId) &&
    !state.projectSourceClaims.some((claim) => claim.key === sourceKey(source))
  );
}
export function committedFor(plan: NonNullable<VillageProject["plan"]>, requirementId: string) {
  if (requirementId === "site-permission")
    return plan.receipts.find((entry) => entry.kind === "promise" && entry.requirementId === requirementId);
  return plan.receipts.find(
    (entry) =>
      entry.kind === "committed" &&
      entry.requirementId === requirementId &&
      !plan.receipts.some((release) => release.kind === "released" && release.sourceLineId === entry.id),
  );
}
export function reconcileBuildProjects(state: VillageState, now: Date): void {
  for (const project of state.projects) {
    if (project.kind === "build-venue" && project.status === "active" && project.plan) {
      const plan = project.plan;
      const missing = plan.requirements.find((requirement) => {
        if (
          committedFor(plan, requirement.id) ||
          plan.receipts.some((entry) => entry.kind === "acquired" && entry.requirementId === requirement.id)
        )
          return false;
        return !plan.sources.some(
          (source) => requirement.routeIds.includes(source.id) && sourceAvailable(state, source),
        );
      });
      if (missing) {
        project.status = "blocked";
        plan.blockedReason = `The source for ${missing.title} is missing. Add an alternative route.`;
      }
    }
    if (project.kind !== "build-venue" || project.status !== "building" || !project.plan?.workOrder) continue;
    const plan = project.plan;
    const venue = state.venues.find((entry) => entry.id === project.venueId && entry.buildProjectId === project.id);
    const builder = state.villagers.find((resident) => resident.characterId === plan.builderId);
    if (!venue || !builder?.agenda) {
      project.status = "blocked";
      plan.blockedReason = venue
        ? "The builder left; recruit a new resident to finish the work."
        : "The worksite is missing.";
      plan.workOrder.pausedAt = now.toISOString();
      if (builder?.agenda?.projectWork?.projectId === project.id) delete builder.agenda.projectWork;
      continue;
    }
    if (Date.parse(plan.workOrder.completesAt) > now.getTime()) continue;
    venue.constructionStatus = "complete";
    venue.form = project.venueDraft?.description ?? venue.form;
    venue.description = project.venueDraft?.description ?? venue.description;
    venue.state.condition = "complete";
    venue.state.updatedAt = plan.workOrder.completesAt;
    if (plan.capability) {
      venue.capabilities = [...new Set([...venue.capabilities, plan.capability])];
      state.villageCapabilities = [...new Set([...state.villageCapabilities, plan.capability])];
    }
    if (builder.agenda.projectWork?.projectId === project.id) delete builder.agenda.projectWork;
    project.status = "complete";
    project.progress = 100;
    project.updatedAt = plan.workOrder.completesAt;
    plan.outcomeAt = plan.workOrder.completesAt;
    plan.blockedReason = "";
  }
}
