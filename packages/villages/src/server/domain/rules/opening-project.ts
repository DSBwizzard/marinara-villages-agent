import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import { readOpeningRenovation, openingRenovationDraft } from "./opening-renovation.js";
import { createHash } from "node:crypto";
import { physicalVenueEvents } from "./venue-scene-state.js";
import type { OpeningProposal, OpeningView } from "../../../shared/contracts/opening.js";
import type { VillageState } from "../models/world.js";
import type { VenueScene, VenueSubmission, VenueReplyLine } from "../models/scene-model.js";
import { asRecord, asStringArray, asTrimmedString } from "./coerce.js";
import { conflict, VillagesRequestError } from "./errors.js";

/** Exact private preparation identity, independent of object property order. */
export function openingProposalFingerprint(proposal: OpeningProposal): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        proposal.residentId,
        proposal.name,
        proposal.description,
        proposal.situation ?? "",
        proposal.venueClass,
        proposal.established,
        proposal.provenance,
        proposal.work,
        proposal.firstUse,
        ...(proposal.kind ? [proposal.kind, proposal.renovation ?? null] : []),
      ]),
    )
    .digest("hex");
}

export class IncompleteOpeningPitch extends VillagesRequestError {
  constructor() {
    super(502, "The introduction did not explain the proposal. Retry the opening to replace the incomplete response.");
  }
}

export class IncompleteOpeningGathering extends VillagesRequestError {
  constructor() {
    super(
      502,
      "The gathering did not include every founder’s interest and idea. Retry the opening to replace the incomplete response.",
    );
  }
}

export type OpeningSignal = { kind: "pitch" | "first-use"; residentId: string; quote: string; playerQuote: string };
export type OpeningRecord = {
  id: string;
  version: 2;
  stage: OpeningView["stage"];
  communityVenueId: string;
  gatheringSceneId: string;
  residentIds: string[];
  proposals: OpeningProposal[];
  reveals: { residentId: string; sceneId: string; submissionId: string; lineId: string; quote: string }[];
  declinedIds: string[];
  projectId: string;
  outcome: string;
  firstUseEvidence?: { sceneId: string; submissionId: string; lineId: string };
};

export function gatheringDialogueComplete(scene: VenueScene): boolean {
  return (
    scene.submissions.some((turn) => turn.id === "greeting" && turn.openingContext?.gatheringComplete === true) &&
    scene.activeIds.every((id) => scene.lines.some((line) => line.kind === "dialogue" && line.speakerId === id))
  );
}

export function openingActive(state: Pick<VillageState, "opening">): boolean {
  return !!state.opening && !["complete", "ended"].includes(state.opening.stage);
}
export function initialOpening(
  residentIds: string[],
  communityVenueId: string,
  id: string,
  version: 2 = 2,
): OpeningRecord {
  return {
    id,
    version,
    stage: "gathering",
    communityVenueId,
    gatheringSceneId: "",
    residentIds: [...residentIds],
    proposals: [],
    reveals: [],
    declinedIds: [],
    projectId: "",
    outcome: "",
  };
}

export function readOpeningProposal(value: unknown, residentId: string): OpeningProposal {
  const row = asRecord(value);
  if (row.kind !== undefined && row.kind !== "new-venue" && row.kind !== "renovation")
    throw conflict("The generated opening idea has an unsupported Project type. Retry failed preparation.");
  const text = (key: string, max: number, label = key) => {
    const raw = row[key];
    // Supporting facts are descriptive text, never authority or permission.
    const value =
      key === "provenance" && Array.isArray(raw) && raw.every((fact) => typeof fact === "string" && fact.trim())
        ? raw.map((fact) => fact.trim()).join("\n")
        : asTrimmedString(raw);
    if (!value) throw conflict(`The generated opening idea is missing its ${label}. Retry failed preparation.`);
    if (value.length > max)
      throw conflict(`The generated opening idea has too much text in its ${label}. Retry failed preparation.`);
    return value;
  };
  if (!["workplace", "community", "other"].includes(String(row.venueClass)) || typeof row.established !== "boolean")
    throw conflict("The generated opening idea is missing its place type or history. Retry failed preparation.");
  return {
    ...(row.kind === "new-venue" || row.kind === "renovation" ? { kind: row.kind } : {}),
    ...(row.kind === "renovation" ? { renovation: readOpeningRenovation(row.renovation) } : {}),
    residentId,
    name: text("name", 100),
    description: text("description", 1000),
    ...(asTrimmedString(row.situation) ? { situation: asTrimmedString(row.situation).slice(0, 500) } : {}),
    venueClass: row.venueClass as OpeningProposal["venueClass"],
    established: row.established,
    provenance: text("provenance", 1000, "supporting setting facts"),
    work: text("work", 1000, "practical preparation"),
    firstUse: text("firstUse", 500, "intended first use"),
  };
}

/** Bind an exact quote across speech interrupted only by player-heard narration. */
export function openingGatheringQuoteMatches(
  lines: readonly {
    speakerId: string;
    kind: string;
    content: string;
    playerHeard: boolean;
    soundOnly?: VenueReplyLine["soundOnly"];
  }[],
  residentId: string,
  quote: string,
): boolean {
  if (!quote.trim()) return false;
  let speech = "";
  for (const line of lines) {
    if (line.playerHeard && line.kind === "dialogue" && !line.soundOnly && line.speakerId === residentId) {
      speech = speech ? speech + " " + line.content : line.content;
      if (speech.includes(quote)) return true;
    } else if (!line.playerHeard || line.kind !== "narration") speech = "";
  }
  return false;
}

export function readOpening(value: unknown): OpeningRecord | undefined {
  if (value == null) return undefined;
  const row = asRecord(value);
  const stages = ["gathering", "conversations", "project", "first-use", "complete", "ended"];
  if (row.version !== 2 || !stages.includes(String(row.stage))) throw conflict("This opening record is unsupported.");
  const residentIds = [...new Set(asStringArray(row.residentIds))].slice(0, 3);
  const proposals = Array.isArray(row.proposals)
    ? row.proposals.map((entry) => readOpeningProposal(entry, asTrimmedString(asRecord(entry).residentId)))
    : [];
  const reveals = Array.isArray(row.reveals)
    ? row.reveals
        .map((entry) => {
          const proof = asRecord(entry);
          return {
            residentId: asTrimmedString(proof.residentId),
            sceneId: asTrimmedString(proof.sceneId),
            submissionId: asTrimmedString(proof.submissionId),
            lineId: asTrimmedString(proof.lineId),
            quote: asTrimmedString(proof.quote).slice(0, 2000),
          };
        })
        .filter((proof) => residentIds.includes(proof.residentId) && proof.lineId && proof.sceneId)
    : [];
  const evidence = asRecord(row.firstUseEvidence);
  return {
    id: asTrimmedString(row.id),
    version: row.version as 2,
    stage: row.stage as OpeningRecord["stage"],
    communityVenueId: asTrimmedString(row.communityVenueId),
    gatheringSceneId: asTrimmedString(row.gatheringSceneId),
    residentIds,
    proposals: proposals.filter((proposal) => residentIds.includes(proposal.residentId)).slice(0, 3),
    reveals: reveals.slice(0, 3),
    declinedIds: asStringArray(row.declinedIds).filter((id) => residentIds.includes(id)),
    projectId: asTrimmedString(row.projectId),
    outcome: asTrimmedString(row.outcome),
    ...(evidence.lineId
      ? {
          firstUseEvidence: {
            sceneId: asTrimmedString(evidence.sceneId),
            submissionId: asTrimmedString(evidence.submissionId),
            lineId: asTrimmedString(evidence.lineId),
          },
        }
      : {}),
  };
}

export function reconcileOpening(state: VillageState): void {
  const opening = state.opening;
  if (!opening || !openingActive(state)) return;
  const remaining = opening.residentIds.filter((id) => state.villagers.some((resident) => resident.characterId === id));
  if (!opening.projectId && !remaining.some((id) => !opening.declinedIds.includes(id))) {
    opening.stage = "ended";
    opening.outcome = "No proposals remain";
  }
  const project = state.projects.find((entry) => entry.id === opening.projectId);
  if (project?.status === "complete") opening.stage = "first-use";
  if (project?.status === "cancelled") {
    opening.stage = "ended";
    opening.outcome = "Project cancelled";
  }
}

export function openingView(state: VillageState): OpeningView | undefined {
  if (!state.opening) return undefined;
  const opening = structuredClone(state.opening);
  const viewState = { ...state, opening };
  reconcileOpening(viewState);
  const residentIds = opening.residentIds.filter((id) =>
    state.villagers.some((resident) => resident.characterId === id),
  );
  const heardIds = opening.reveals.map((proof) => proof.residentId);
  const project = state.projects.find((entry) => entry.id === opening.projectId);
  const pending = residentIds.find((id) => !heardIds.includes(id));
  const name = state.villagers.find((resident) => resident.characterId === pending)?.cardSnapshot.name;
  const phases: Record<string, string> = {
    planning: "Choose the design, agreements and lead",
    working: "Work underway",
    paused: "Review paused work",
    complete: "Experience its first use",
    cancelled: "Project cancelled",
  };
  const action =
    opening.stage === "gathering"
      ? "Community gathering"
      : opening.stage === "conversations"
        ? pending
          ? `Talk to ${name} · ${heardIds.filter((id) => residentIds.includes(id)).length}/${residentIds.length}`
          : "Choose a proposal"
        : opening.stage === "first-use"
          ? "Experience its first use"
          : opening.stage === "project"
            ? (phases[project?.lifecycle?.phase ?? ""] ?? "Open Project")
            : "";
  return {
    id: opening.id,
    version: opening.version,
    stage: opening.stage,
    communityVenueId: opening.communityVenueId,
    gatheringSceneId: opening.gatheringSceneId,
    residentIds,
    heardIds,
    proposals: opening.proposals
      .filter((proposal) => heardIds.includes(proposal.residentId))
      .map((proposal) => ({
        available: (() => {
          try {
            if (proposal.renovation) openingRenovationDraft(proposal, state.venues);
            return true;
          } catch {
            return false;
          }
        })(),
        ...proposal,
        provenance: "",
        ...(proposal.renovation ? { renovation: { ...proposal.renovation, sourceFingerprint: undefined } } : {}),
      })),
    declinedIds: opening.declinedIds,
    projectId: opening.projectId,
    action,
    outcome: opening.outcome,
  };
}

/** Only the current resident's idea is supplied to an individual Scene. */
export function openingSceneDirection(state: VillageState, scene: VenueScene, includeSignals = true): string {
  const opening = state.opening;
  if (!opening || !openingActive(state)) return "";
  if (opening.stage === "gathering" && scene.id === opening.gatheringSceneId)
    return (
      "OPENING GATHERING: Respect authored histories. Prepared public interests and ideas: " +
      JSON.stringify(
        opening.proposals.map(({ residentId, situation, name, description }) => ({
          residentId,
          situation,
          name,
          description,
        })),
      ) +
      ". Give every present founder their distinct spoken interest and idea in this short response, then end at a natural pause. Never invent player words or commitments. The player can leave or pursue ordinary Projects at any time."
    );
  const proposal = opening.proposals.find(
    (entry) => scene.activeIds.length === 1 && entry.residentId === scene.activeIds[0],
  );
  if (
    opening.stage === "conversations" &&
    proposal &&
    !opening.reveals.some((proof) => proof.residentId === proposal.residentId)
  )
    return `OPENING PITCH (private preparation, not established speech or consent): ${JSON.stringify(proposal)}. In this individual conversation, let this resident naturally pitch their own idea in their own voice, in a conversation appropriate to their established relationship with the player. ${scene.openingIntroductionResidentId ? "Deliver the complete pitch in this opening response, before the player has to say or do anything." : ""} Explain its name, purpose and actual work aloud; do not disclose private motives or secrets. Use the proposed name when pitching it. Preserve their personality and ability to disagree. Pitching does not volunteer them as builder. Do not make player commitments. ${includeSignals ? `When their spoken dialogue actually explains this proposal, return openingSignal:{kind:"pitch",residentId:"${proposal.residentId}",quote:"exact substantial quote from their dialogue",playerQuote:""}.` : ""} Do not also return venueRequest for this pitch.`;
  const project = state.projects.find((entry) => entry.id === opening.projectId);
  if (project?.status === "complete" && project.venueId === scene.placeId && true) {
    const chosen = opening.proposals.find((entry) => entry.residentId === project.requesterCharacterId);
    return `OPENING FIRST USE: Intended use: ${chosen?.firstUse ?? projectPhysicalDesign(project)}. Continue ordinary play; never perform the player's actions for them. ${includeSignals ? 'Only if this current player exchange and visible response actually depict that use, return openingSignal:{kind:"first-use",residentId:"",quote:"exact response quote depicting use",playerQuote:"exact current player words participating in that use"}.' : "Let actual player participation and visible responses establish the use."} Greetings, entering, promises and descriptions of possible use do not count. No invented physical effects.`;
  }
  return "";
}

export function readOpeningSignal(value: unknown): OpeningSignal | undefined {
  const row = asRecord(value);
  if ((row.kind !== "pitch" && row.kind !== "first-use") || !asTrimmedString(row.quote)) return undefined;
  return {
    kind: row.kind,
    residentId: asTrimmedString(row.residentId),
    quote: asTrimmedString(row.quote).slice(0, 2000),
    playerQuote: asTrimmedString(row.playerQuote).slice(0, 2000),
  };
}

/** Saved Scene is the outbox; applying the same exchange never repeats a reveal or outcome. */
export function applyOpeningExchange(state: VillageState, scene: VenueScene, turn: VenueSubmission): void {
  const opening = state.opening;
  if (!opening || !openingActive(state) || scene.villageSeed !== state.seed || turn.movement) return;
  reconcileOpening(state);
  const signal = turn.openingSignal;
  if (!signal || turn.openingContext?.stage !== opening.stage || turn.openingContext.projectId !== opening.projectId)
    return;
  const line = scene.lines.find(
    (entry) =>
      turn.replyLineIds?.includes(entry.id) &&
      !entry.contactHidden &&
      !entry.contactReport &&
      (!entry.zoneId || entry.zoneId === turn.zoneIdAtTurn) &&
      entry.content.includes(signal.quote) &&
      entry.kind !== "side" &&
      entry.kind !== "whisper",
  );
  if (!line) return;
  if (
    signal.kind === "pitch" &&
    opening.stage === "conversations" &&
    scene.openingIntroductionResidentId === signal.residentId &&
    turn.id === "greeting" &&
    turn.activeIdsAtTurn?.length === 1 &&
    turn.activeIdsAtTurn[0] === signal.residentId &&
    line.speakerId === signal.residentId &&
    line.kind === "dialogue" &&
    Object.hasOwn(turn.openingContext, "proposalFingerprint") &&
    opening.proposals.some(
      (entry) =>
        entry.residentId === signal.residentId &&
        turn.semanticProvenance?.version === 2 &&
        turn.semanticProvenance.pipelineVersion === 3 &&
        /^[a-f0-9]{64}$/u.test(turn.semanticProvenance.sourceHash) &&
        turn.openingContext!.proposalFingerprint === openingProposalFingerprint(entry),
    ) &&
    state.villagers.some((entry) => entry.characterId === signal.residentId) &&
    !opening.reveals.some((entry) => entry.residentId === signal.residentId)
  )
    opening.reveals.push({
      residentId: signal.residentId,
      sceneId: scene.id,
      submissionId: turn.id,
      lineId: line.id,
      quote: signal.quote,
    });
  const physicalUseVerified =
    !(turn.physicalOutcomeVersion || turn.requestMode === "act" || turn.mode === "act") ||
    physicalVenueEvents(state).some(
      (event) => event.id === `venue-chat:${scene.id}:${turn.id}` && event.actionReceipt?.happened,
    );
  const greetingOnly =
    /^(?:(?:hi|hello|hey|greetings)(?:\s+(?:there|everyone|all))?|good (?:morning|afternoon|evening))[.!?\s]*$/iu.test(
      turn.message.trim(),
    );
  if (
    physicalUseVerified &&
    !greetingOnly &&
    signal.kind === "first-use" &&
    opening.stage === "first-use" &&
    turn.mode !== "leave" &&
    signal.playerQuote &&
    turn.message.includes(signal.playerQuote) &&
    state.projects.some(
      (entry) =>
        entry.id === opening.projectId && entry.status === "complete" && entry.venueId === scene.placeId && true,
    )
  ) {
    opening.firstUseEvidence = { sceneId: scene.id, submissionId: turn.id, lineId: line.id };
    opening.stage = "complete";
    opening.outcome = "First use";
  }
}
