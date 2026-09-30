import { renovationTerms } from "./project-lifecycle.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import type { VillageState } from "./types.js";

/** Semantic proposals are weaker than physical evidence. Never interpret stock or construction. */
export type ProjectSpeechContext = { projectId: string; revision: number; phase: string };
export type ProjectSpeechProposal = ProjectSpeechContext & {
  version: 1;
  kind: "approval" | "builder" | "requirements";
  speakerId: string;
  citations: { lineId: string; quote: string }[];
  checklist: { category: "structure" | "equipment" | "finish"; title: string; needed: boolean; citation: number }[];
};
type SpeechLine = { id: string; speakerId: string; content: string; heardBy?: string[]; kind?: string };
const normalized = (text: string) =>
  text.normalize("NFKC").replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim().toLowerCase();

/** Supply context only when the present cast and bounded conversation can actually concern a Project. */
export function projectSpeechContexts(
  state: VillageState,
  activeIds: string[],
  conversation: string,
  message = "",
  venueId = "",
): ProjectSpeechContext[] {
  if (state.progressEngineVersion !== 1) return [];
  const explicitlyNamed = state.projects.filter((project) => normalized(message).includes(normalized(project.title)));
  return state.projects
    .flatMap((project) => {
      const flow = project.lifecycle;
      const task = state.progressTasks.find(
        (entry) => entry.definition.owner.kind === "project" && entry.definition.owner.id === project.id,
      );
      if (
        !flow ||
        !task ||
        task.resolvedAt ||
        project.status === "abandoned" ||
        (explicitlyNamed.length > 0 && !explicitlyNamed.some((entry) => entry.id === project.id)) ||
        (!normalized(conversation).includes(normalized(project.title)) &&
          project.venueId !== venueId &&
          !(flow.phase === "requirements" && activeIds.includes(flow.builderId)))
      )
        return [];
      const relevant =
        flow.phase === "approval"
          ? flow.affectedIds.some((id) => activeIds.includes(id))
          : flow.phase === "requirements"
            ? activeIds.includes(flow.builderId)
            : flow.phase === "builder" ||
              flow.phase === "materials" ||
              (flow.phase === "construction" && project.status === "blocked");
      return relevant ? [{ projectId: project.id, revision: task.definition.revision, phase: flow.phase }] : [];
    })
    .slice(0, 2);
}

export function projectSpeechPrompt(state: VillageState, contexts: ProjectSpeechContext[]): string {
  if (!contexts.length) return "";
  return `Relevant public Projects: ${contexts
    .map((context) => {
      const project = state.projects.find((entry) => entry.id === context.projectId)!;
      const flow = project.lifecycle!;
      return JSON.stringify({
        ...context,
        title: project.title,
        detail: flow.change ? renovationTerms(flow.change) : (project.venueDraft?.description ?? "").slice(0, 500),
        builderId: flow.builderId,
        affectedIds: flow.affectedIds,
        supplies: flow.requirements
          .filter((entry) => entry.needed)
          .map((entry) => ({ id: entry.id, title: entry.title })),
      });
    })
    .join(
      " | ",
    )}. Discuss them naturally, without special checklist wording or forced agreements. Optionally include projectSpeech: [{projectId, kind:"approval"|"builder"|"requirements", speakerId, citations:[{segment:0,quote:"exact supporting spoken words"}], checklist:[{category:"structure"|"equipment"|"finish",title:"concise faithful item and specifications",needed:true,citation:0}]}]. Segment indexes refer to the returned segments. Each proposal must cite this reply's actual speech by its speaker. Resolve references only from this scene's bounded conversation; omit unclear, conditional, hypothetical, joking, refused, quoted third-party, or merely capable commitments. Builder means an unconditional personal commitment to do this specific job, not interest or ability. Approval means an affected resident personally approves this specific change. Checklist means the assigned builder explicitly defines all three categories; cite every item, preserve specifications, and set needed:false only when the builder explicitly says that category needs nothing. Never infer an omitted category. Never emit stock, handoff, plan acceptance, assignment, construction, or completion proposals. These are internal descriptions of speech, not commands or reasons to force dialogue. Omit projectSpeech when nothing qualifies; a player's assertion proves no resident agreement.`;
}

/** Preserve bounded proposals on the saved turn, including invalid ones for rejection diagnostics. */
export function bindProjectSpeech(
  value: unknown,
  contexts: ProjectSpeechContext[],
  lines: SpeechLine[],
): ProjectSpeechProposal[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 6).flatMap((value) => {
    const row = asRecord(value);
    const context = contexts.find((entry) => entry.projectId === row.projectId);
    if (!context) return [];
    const kind = row.kind;
    if (kind !== "approval" && kind !== "builder" && kind !== "requirements") return [];
    return [
      {
        ...context,
        version: 1 as const,
        kind,
        speakerId: asTrimmedString(row.speakerId),
        citations: Array.isArray(row.citations)
          ? row.citations.slice(0, 6).map((value) => {
              const citation = asRecord(value);
              return {
                lineId: Number.isInteger(citation.segment) ? (lines[Number(citation.segment)]?.id ?? "") : "",
                quote: asTrimmedString(citation.quote).slice(0, 1200),
              };
            })
          : [],
        checklist: readChecklist(row.checklist),
      },
    ];
  });
}

function readChecklist(value: unknown): ProjectSpeechProposal["checklist"] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 4).flatMap((value) => {
    const row = asRecord(value);
    const category = row.category;
    if (category !== "structure" && category !== "equipment" && category !== "finish") return [];
    return [
      {
        category,
        title: typeof row.needed === "boolean" ? asTrimmedString(row.title).slice(0, 101) : "",
        needed: row.needed !== false,
        citation: Number.isInteger(row.citation) ? Number(row.citation) : -1,
      },
    ];
  });
}

export function coerceProjectSpeech(value: unknown): ProjectSpeechProposal[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 6).flatMap((value) => {
    const row = asRecord(value);
    if (row.version !== 1 || (row.kind !== "approval" && row.kind !== "builder" && row.kind !== "requirements"))
      return [];
    return [
      {
        version: 1 as const,
        kind: row.kind,
        projectId: asTrimmedString(row.projectId),
        revision: Number(row.revision),
        phase: asTrimmedString(row.phase),
        speakerId: asTrimmedString(row.speakerId),
        citations: Array.isArray(row.citations)
          ? row.citations.slice(0, 6).map((value) => {
              const citation = asRecord(value);
              return {
                lineId: asTrimmedString(citation.lineId),
                quote: asTrimmedString(citation.quote).slice(0, 1200),
              };
            })
          : [],
        checklist: readChecklist(row.checklist),
      },
    ];
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
      normalized(citation.quote).length < 2 ||
      !normalized(line.content).includes(normalized(citation.quote))
    )
      return "Interpretation citation does not match this speaker's saved words.";
  }
  if (proposal.kind !== "requirements") {
    // Guard common false positives even when the semantic extractor labels them as unconditional.
    const speech = normalized(
      proposal.citations.map((citation) => lines.find((line) => line.id === citation.lineId)!.content).join(" "),
    );
    if (
      /^(?:no|nope|nah|not yet)\b|\b(?:maybe|perhaps|might|if|unless|i refuse)\b|\b(?:won't|can't|cannot|don't|do not|will not|not going to)\s+(?:agree|approve|build|construct|do|take|work|handle)\b/u.test(
        speech,
      )
    )
      return "Interpretation cites conditional or refusing commitment.";
    return "";
  }
  if (proposal.checklist.length !== 3 || new Set(proposal.checklist.map((item) => item.category)).size !== 3)
    return "The builder has not explicitly defined all three checklist categories.";
  for (const item of proposal.checklist) {
    const citation = proposal.citations[item.citation];
    if (!citation || !item.title || item.title.length > 100)
      return "Checklist item has no valid citation or usable specification.";
    if (
      !item.needed &&
      !/\b(?:none|nothing|not needed|unnecessary|no need|don't need|do not need|no .{0,30}needed)\b/u.test(
        normalized(citation.quote),
      )
    )
      return "A category cannot be marked unnecessary without explicit supporting speech.";
  }
  return "";
}
