import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import type { VillageState, VillageProject } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
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
export type ProjectSpeechProposal = ProjectSpeechContext & {
  version: 1;
  kind: "approval" | "builder" | "withdrawal";
  speakerId: string;
  citations: { lineId: string; quote: string }[];
  contextual?: { version: 1; source: "system" | "gm"; checkId: string };
};
type SpeechLine = { id: string; speakerId: string; content: string; heardBy?: string[]; kind?: string };
const normalized = (text: string) =>
  text.normalize("NFKC").replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim().toLowerCase();

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
    ". These complete scoped terms are native reference, not automatically shared character knowledge. Supporting controllers may approve their own Place or Renovations; only Villagers may volunteer to lead physical work. Native approval requires the deciding person's actual unqualified current words about these exact terms, witnessed by the player. Conditions, uncertainty, politeness and promises of later agreement are not approval. Preserve them as ordinary roleplay/common offers. Approval and volunteering may use the same utterance. A refusal or withdrawal is unilateral. No speech starts, resumes or completes work. Physical Projects take 24 elapsed real hours after the player's explicit Start. Social establishment uses no timer or lead and requires actual witnessed objectives, never promised future results. Gifts and objects provide no Project benefit."
  );
}
export function coerceProjectSpeech(value: unknown): ProjectSpeechProposal[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap((value) => {
    const row = asRecord(value),
      context = asRecord(row.contextual);
    if (row.version !== 1 || !["approval", "builder", "withdrawal"].includes(String(row.kind))) return [];
    return [
      {
        version: 1 as const,
        projectId: asTrimmedString(row.projectId),
        revision: Number(row.revision),
        phase: asTrimmedString(row.phase),
        kind: row.kind as ProjectSpeechProposal["kind"],
        speakerId: asTrimmedString(row.speakerId),
        citations: Array.isArray(row.citations)
          ? row.citations.slice(0, 12).map((value) => ({
              lineId: asTrimmedString(asRecord(value).lineId),
              quote: asTrimmedString(asRecord(value).quote),
            }))
          : [],
        ...(context.version === 1 && ["system", "gm"].includes(String(context.source))
          ? {
              contextual: {
                version: 1 as const,
                source: context.source as "system" | "gm",
                checkId: asTrimmedString(context.checkId),
              },
            }
          : {}),
      },
    ];
  });
}
export function bindProjectSpeech(
  value: unknown,
  contexts: ProjectSpeechContext[],
  lines: SpeechLine[],
): ProjectSpeechProposal[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((value) => {
    const row = asRecord(value),
      context = contexts.find((context) => context.projectId === row.projectId);
    if (!context) return [];
    return coerceProjectSpeech([
      {
        ...row,
        ...context,
        version: 1,
        citations: Array.isArray(row.citations)
          ? row.citations.map((value) => {
              const citation = asRecord(value);
              return {
                ...citation,
                lineId: Number.isInteger(citation.segment) ? lines[Number(citation.segment)]?.id : "",
              };
            })
          : [],
      },
    ]);
  });
}
export function validateProjectSpeech(proposal: ProjectSpeechProposal, lines: SpeechLine[]): string {
  if (!proposal.citations.length) return "Interpretation has no saved speech citation.";
  for (const citation of proposal.citations) {
    const line = lines.find((entry) => entry.id === citation.lineId);
    if (
      !line ||
      citation.quote.length > 2000 ||
      line.speakerId !== proposal.speakerId ||
      line.kind === "narration" ||
      !normalized(citation.quote) ||
      (proposal.contextual
        ? !line.content.includes(citation.quote)
        : !normalized(line.content).includes(normalized(citation.quote)))
    )
      return "Interpretation citation does not match this speaker's saved words.";
  }
  return "";
}
