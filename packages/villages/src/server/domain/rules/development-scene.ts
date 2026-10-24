import { backgroundRevision } from "./background-revision.js";
import { sceneEvidencePerception } from "./scene-evidence-perception.js";
import { z } from "zod";
import type { DevelopmentSceneChange } from "../models/development-model.js";
import type { VenueReplyLine, VenueScene, VenueSubmission } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { badGateway } from "./errors.js";
import { activePursuit, moveConsentingActors } from "./resident-development.js";
const row = z
  .object({
    pursuitId: z.string().min(1),
    characterId: z.string().min(1),
    expectedRevision: z.number().int().nonnegative(),
    kind: z.enum(["disclose", "consent", "wait", "end"]),
    actorId: z.string().min(1),
    decision: z.enum(["agree", "refuse", "conditional"]).optional(),
    citations: z
      .array(z.object({ segment: z.number().int().nonnegative(), quote: z.string().trim().min(1).max(2000) }).strict())
      .min(1)
      .max(6),
  })
  .strict();
export type SavedDevelopmentChange = DevelopmentSceneChange & { lineIds: string[] };
export function readDevelopmentSceneProposals(raw: unknown): DevelopmentSceneChange[] {
  const parsed = z.array(row).max(6).safeParse(raw);
  if (!parsed.success)
    throw badGateway("The resident development interpretation is incomplete. The draft is retained.");
  return parsed.data;
}
export function readDevelopmentSceneChanges(
  raw: unknown,
  state: VillageState,
  lines: VenueReplyLine[],
): DevelopmentSceneChange[] {
  const changes = readDevelopmentSceneProposals(raw);
  const seen = new Set<string>();
  for (const change of changes) {
    const resident = state.development?.residents[change.characterId];
    const pursuit = resident?.pursuits.find((p) => p.id === change.pursuitId);
    const key = [change.pursuitId, change.kind, change.actorId].join(":");
    if (!pursuit || !activePursuit(pursuit) || resident!.revision !== change.expectedRevision || seen.has(key))
      throw badGateway("The development interpretation cites an unavailable intention or revision.");
    seen.add(key);
    if (change.kind !== "consent" && change.actorId !== change.characterId)
      throw badGateway("Only the resident can disclose or change their own intention.");
    if (change.kind === "consent" && !change.decision)
      throw badGateway("A move decision must state agreement, refusal or an unresolved condition.");
    for (const citation of change.citations) {
      const line = lines[citation.segment];
      if (
        !line ||
        line.kind === "narration" ||
        line.speakerId !== change.actorId ||
        !line.content.includes(citation.quote) ||
        !line.heardBy.includes(change.characterId) ||
        (change.actorId === "player" && !line.speechSource) ||
        (change.kind === "disclose" && sceneEvidencePerception(line).playerPerception !== "full")
      )
        throw badGateway("A resident development change lacks exact witnessed speech.");
    }
  }
  return changes;
}
export function bindDevelopmentChanges(changes: DevelopmentSceneChange[], lineIds: string[]): SavedDevelopmentChange[] {
  return changes.map((change) => ({ ...change, lineIds: change.citations.map((c) => lineIds[c.segment]!) }));
}
/** Apply only exact saved Scene evidence to current authority; retain an immutable same-Scene after-value. */
export function applyDevelopmentScene(
  state: VillageState,
  scene: VenueScene,
  submission: VenueSubmission,
  appliedAt: string,
): void {
  if (scene.villageSeed !== state.seed || submission.semanticProvenance?.developmentVersion !== 1) return;
  const changedActors = new Set<string>();
  for (const change of submission.developmentChanges ?? []) {
    const id =
      "development-scene:" +
      backgroundRevision([scene.id, submission.id, change.characterId, change.pursuitId, change.kind, change.actorId]);
    if (state.exchangeReceipts[id]) continue;
    const r = state.development?.residents[change.characterId];
    const p = r?.pursuits.find((p) => p.id === change.pursuitId);
    const lines = change.lineIds.map((id) => scene.lines.find((line) => line.id === id));
    let reason = "";
    if (!r || !p || !activePursuit(p) || r.revision !== change.expectedRevision)
      reason = "The intention changed since this conversation was captured.";
    else if (
      lines.length !== change.citations.length ||
      lines.some(
        (line, index) =>
          !line ||
          line.speakerId !== change.actorId ||
          line.kind === "narration" ||
          !line.content.includes(change.citations[index]!.quote) ||
          !line.heardBy.includes(change.characterId) ||
          (change.actorId === "player" && !line.speechSource) ||
          (change.kind === "disclose" && sceneEvidencePerception(line).playerPerception !== "full"),
      )
    )
      reason = "Saved development speech could not be verified.";
    else if (change.kind === "consent") {
      const target = state.venues.find((v) => v.id === p.targetVenueId);
      if (
        !target ||
        !change.decision ||
        !moveConsentingActors(target, p.privateZoneId, change.characterId).includes(change.actorId)
      )
        reason = "The speaker cannot consent to this move.";
      else p.consents[change.actorId] = { decision: change.decision, at: appliedAt, source: id };
    }
    if (!reason && r && p) {
      if (change.kind === "disclose") {
        const name =
          state.villagers.find((v) => v.characterId === change.characterId)?.cardSnapshot.name ?? change.characterId;
        const home = state.venues.find((v) => v.id === p.targetVenueId)?.name ?? p.targetVenueId;
        p.known = { at: appliedAt, text: `${name}: move to ${home} : ${p.status}.`, status: p.status };
      } else {
        if (p.status === "arranged")
          state.residences = state.residences.filter(
            (move) => move.characterId !== change.characterId || move.status !== "moving",
          );
        p.status =
          change.kind === "end"
            ? "ended"
            : change.kind === "wait" || change.decision !== "agree"
              ? "stalled"
              : "considering";
        changedActors.add(change.characterId);
        p.updatedAt = appliedAt;
        p.reason = change.citations
          .map((c) => c.quote)
          .join(" ")
          .slice(0, 600);
      }
      // Changes in this atomic exchange share one revision; a later exchange invalidates stale proposals.
    }
    state.exchangeReceipts[id] = {
      id,
      sceneId: scene.id,
      submissionId: submission.id,
      domain: "development",
      at: appliedAt,
      committedAt: appliedAt,
      evidenceIds: change.lineIds,
      status: reason ? "rejected" : "applied",
      reason: reason || "Witnessed resident development change.",
      ...(reason || !r
        ? {}
        : { sceneFacts: { development: { characterId: change.characterId, resident: structuredClone(r) } } }),
    };
  }
  for (const characterId of changedActors) {
    const r = state.development!.residents[characterId]!;
    r.revision++;
    r.nextReviewAt = appliedAt;
    r.reason = "A witnessed conversation changed this intention.";
    for (const receipt of Object.values(state.exchangeReceipts))
      if (
        receipt.sceneId === scene.id &&
        receipt.submissionId === submission.id &&
        receipt.sceneFacts?.development?.characterId === characterId
      )
        receipt.sceneFacts.development.resident = structuredClone(r);
  }
}
