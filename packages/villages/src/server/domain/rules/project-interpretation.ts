import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import type { VillageState, VillageProject } from "../models/world.js";
import { approvalScope, projectDesignKey, renovationAffectedIds } from "./project-terms.js";
import { establishmentControllers, establishmentScope } from "./establishment.js";
import { findLocation } from "./places.js";
import { memoryHash } from "./memory-integrity.js";
import { recallTerms } from "./text-recall.js";
export type ProjectSpeechContext = {
  projectId: string;
  revision: number;
  phase: string;
  terms: ReturnType<typeof projectSpeechTerms>;
  agreements: Record<string, string>;
};

export function projectSpeechTerms(state: VillageState, project: VillageProject) {
  const venue = findLocation(state, project.venueId),
    flow = project.lifecycle!;
  const requiredApprovers =
    project.kind === "establishment"
      ? establishmentControllers(state, project)
      : venue
        ? renovationAffectedIds(venue, flow.change, flow.changedZoneIds)
        : [];
  return {
    kind: project.kind,
    venueId: project.venueId,
    proposal: structuredClone(
      project.kind === "new-venue" ? { draft: project.venueDraft ?? null, plan: project.plan ?? null } : flow.change,
    ),
    ...(project.establishment
      ? {
          establishment: {
            goal: project.establishment.goal,
            physical: project.establishment.physical,
            zoneIds: [...project.establishment.zoneIds],
            objectives: project.establishment.objectives.map(({ id, text }) => ({ id, text })),
          },
        }
      : {}),
    requiredApprovers: requiredApprovers.toSorted(),
  };
}

/** Compute once against the native batch's unmodified authority, then apply its commands to a detached candidate. */
export function projectSpeechContext(
  state: VillageState,
  project: VillageProject,
  actorIds: string[],
): ProjectSpeechContext {
  const flow = project.lifecycle!,
    terms = projectSpeechTerms(state, project),
    venue = findLocation(state, project.venueId);
  return {
    projectId: project.id,
    revision: flow.revision,
    phase: flow.phase,
    terms,
    agreements: Object.fromEntries(
      [...new Set([...actorIds, ...terms.requiredApprovers, flow.builderId].filter(Boolean))].map((id) => [
        id,
        memoryHash({
          approvalScope:
            project.kind === "establishment"
              ? establishmentScope(project)
              : venue && flow.change
                ? approvalScope(venue, flow.change, id, flow.changedZoneIds)
                : "",
          design: projectDesignKey(project),
          approvals: flow.approvals.filter((row) => row.residentId === id),
          candidates: flow.candidates.filter((row) => row.residentId === id),
          selectedLead: flow.builderId === id,
          history: flow.spokenProofs.filter((row) => row.speakerId === id),
        }),
      ]),
    ),
  };
}
export function projectSpeechContexts(
  state: VillageState,
  activeIds: string[],
  conversation: string,
  message = "",
  venueId = "",
): ProjectSpeechContext[] {
  const query = message + "\n" + conversation;
  const terms = new Set(recallTerms(query));
  return state.projects.flatMap((project) =>
    project.lifecycle &&
    ["planning", "paused", "working"].includes(project.status) &&
    (project.venueId === venueId ||
      project.lifecycle.targetVenueId === venueId ||
      [
        ...project.participantIds,
        ...project.lifecycle.affectedIds,
        project.requesterCharacterId,
        project.lifecycle.builderId,
        ...project.lifecycle.candidates.map((candidate) => candidate.residentId),
      ].some((id) => id && activeIds.includes(id)) ||
      query.includes(project.id) ||
      query.includes(project.title) ||
      recallTerms(project.title + " " + projectPhysicalDesign(project)).some((term) => terms.has(term)))
      ? [projectSpeechContext(state, project, activeIds)]
      : [],
  );
}
export function projectSpeechPrompt(state: VillageState, contexts: ProjectSpeechContext[]): string {
  if (!contexts.length) return "";
  return (
    "Relevant Projects: " +
    JSON.stringify(
      contexts.map((context) => {
        const project = state.projects.find((project) => project.id === context.projectId)!;
        return {
          projectId: context.projectId,
          phase: context.phase,
          title: project.title,
          terms: context.terms,
          ...(project.lifecycle?.builderId ? { leadId: project.lifecycle.builderId } : {}),
          ...(project.establishment
            ? { completedObjectives: project.establishment.objectives.filter((row) => row.met).map((row) => row.id) }
            : {}),
        };
      }),
    ) +
    ". These complete scoped terms are native reference, not automatically shared character knowledge. Supporting controllers may approve their own Place or Renovations; only Villagers may volunteer to lead physical work. Native approval requires the deciding person's actual unqualified current words about these exact terms, witnessed by the player. Conditions, uncertainty, politeness and promises of later agreement are not approval. Preserve them as ordinary roleplay/common offers. Approval and volunteering may use the same utterance. A refusal or withdrawal is unilateral. Approval or willingness alone never starts work. Only the actual Player explicit Start/Resume request can invoke project.start; no command directly completes work. Physical Projects take 24 elapsed real hours after the player's explicit Start. Social establishment uses no timer or lead and requires actual witnessed objectives, never promised future results. Gifts and objects provide no Project benefit."
  );
}
