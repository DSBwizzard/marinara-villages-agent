import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import type { VillageState } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { renovationTerms } from "./project-terms.js";
export type ProjectSpeechContext = { projectId: string; revision: number; phase: string };
export type ProjectSpeechProposal = ProjectSpeechContext & {
  version: 1;
  kind: "approval" | "builder" | "withdrawal";
  speakerId: string;
  citations: { lineId: string; quote: string }[];
  contextual?: { version: 1; source: "system" | "decisions"; checkId: string; decisionEvidenceVersion?: 1 };
};
type SpeechLine = { id: string; speakerId: string; content: string; heardBy?: string[]; kind?: string };
const normalized = (text: string) =>
  text.normalize("NFKC").replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim().toLowerCase();

export function projectSpeechContexts(
  state: VillageState,
  activeIds: string[],
  _conversation: string,
  _message = "",
  _venueId = "",
): ProjectSpeechContext[] {
  return state.projects.flatMap((project) =>
    project.lifecycle && ["planning", "paused", "working"].includes(project.status) && activeIds.length
      ? [{ projectId: project.id, revision: project.lifecycle.revision, phase: project.lifecycle.phase }]
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
          ...context,
          title: project.title,
          description: project.lifecycle?.change
            ? renovationTerms(project.lifecycle.change)
            : projectPhysicalDesign(project),
          design: project.plan,
          leadId: project.lifecycle?.builderId,
          affectedIds: project.lifecycle?.affectedIds,
        };
      }),
    ) +
    ". Residents may approve a relevant physical design, willingly commit to lead it, decline or withdraw in natural language. Approval and volunteering can occur in the same exchange. No speech starts, resumes or completes work. Projects take 24 elapsed real hours after the player's explicit Start. Gifts and objects provide no Project benefit."
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
              quote: asTrimmedString(asRecord(value).quote).slice(0, 1200),
            }))
          : [],
        ...(context.version === 1 && ["system", "decisions"].includes(String(context.source))
          ? {
              contextual: {
                version: 1 as const,
                source: context.source as "system" | "decisions",
                checkId: asTrimmedString(context.checkId),
                ...(context.decisionEvidenceVersion === 1 ? { decisionEvidenceVersion: 1 as const } : {}),
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
