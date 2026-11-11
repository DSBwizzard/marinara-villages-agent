import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import type { VillageState, VillageProject } from "../models/world.js";
import { approvalScope, projectDesignKey, renovationAffectedIds } from "./project-terms.js";
import { establishmentControllers, establishmentScope } from "./establishment.js";
import { findLocation } from "./places.js";
import { memoryHash } from "./memory-integrity.js";
import { continuityActor } from "./continuity-actors.js";
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
                ? approvalScope(venue, flow.change, id, flow.changedZoneIds, flow.roomBasis)
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
        project.requesterCharacterId &&
        continuityActor(state, project.requesterCharacterId)?.incarnation === project.requesterIncarnation
          ? project.requesterCharacterId
          : "",
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
    )
  );
}

export const PROJECT_SPEECH_DIRECTION =
  "Use only the fitted Project terms as native reference. Residents know the terms through actual communication. Controllers can approve their own Place or Renovation. Villagers may volunteer to lead physical work. Approval needs unqualified current words about the exact terms, witnessed by the player. Conditions, politeness and later promises stay ordinary roleplay or common offers. Approval and volunteering may share an utterance. Refusal or withdrawal is unilateral. Only explicit Player Start or Resume begins physical work, which takes 24 elapsed hours. Social establishment needs witnessed objectives. Gifts and objects provide no Project benefit.";
