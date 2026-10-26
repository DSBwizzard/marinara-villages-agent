import type { VillageState } from "../models/world.js";
import type { VenueScene } from "../models/scene-model.js";
import type { DomainProcessing } from "../models/exchange-model.js";
import type { LiveEvidenceContext } from "../models/memory-model.js";
import type { MemoryProposal, MemorySource } from "../models/memories.js";
import { bindSceneMemorySuggestion, committedSceneMemoryEffects, sceneMemoryUnit } from "./scene-memories.js";
import { applyVillageMemory } from "./village-memories.js";
import { semanticContinued } from "./semantic-continuity.js";
import { asRecord } from "./coerce.js";
import { createLiveEvidenceContext } from "./live-exchange.js";
import { metadataFailure, WorkFailureError } from "./work-failure.js";
export function applyLiveMemories(
  state: VillageState,
  scene: VenueScene,
  submissionId: string,
  now: Date,
  evidenceContext?: LiveEvidenceContext,
): Partial<DomainProcessing> {
  const turn = scene.submissions.find((row) => row.id === submissionId);
  if (!turn || !turn.liveProposals || !Array.isArray(turn.liveProposals.memoryChanges))
    throw new WorkFailureError(metadataFailure("Memory interpretation is incomplete; the saved dialogue is retained."));
  const saved = turn.liveProposals;
  const changes = saved.memoryChanges as unknown[];
  if (!changes.length) return { reason: "No meaningful memory changes", receiptIds: [] };
  if (changes.length > 16) throw new WorkFailureError(metadataFailure("Too many memory proposals"));
  const lines = (evidenceContext ?? createLiveEvidenceContext(scene, saved)).lines;
  const source: MemorySource = {
    kind: scene.id.startsWith("offscreen:") ? "offscreen" : "scene",
    id: scene.id + ":" + turn.id,
    sceneId: scene.id,
    revision: 1,
    fingerprint: saved.sourceFingerprint,
  };
  const receiptIds: string[] = [],
    rejections: { kind: string; index: number; reason: string }[] = [];
  let waiting = false;
  {
    if (state.seed !== scene.villageSeed) throw new Error("Village identity changed");
    if (semanticContinued(state, scene.id, turn.id, "memories")) return { status: "applied", receiptIds: [] };
    receiptIds.length = 0;
    rejections.length = 0;
    waiting = false;
    const effects = committedSceneMemoryEffects(state, scene.id, turn.id, source, turn.at!);
    changes.forEach((value, index) => {
      const unit = sceneMemoryUnit(value, (ref) =>
          ref === "player" ? saved.playerLineId : typeof ref === "number" ? saved.replyLineIds[ref] : ref,
        ),
        id = scene.id + ":" + turn.id + ":memory:" + unit;
      receiptIds.push(id);
      const prior = state.memoryReceipts[id];
      if (prior) {
        if (prior.status === "rejected") rejections.push({ kind: "memory", index, reason: prior.reason });
        return;
      }
      let proposal: MemoryProposal | undefined;
      try {
        const screening = asRecord(asRecord(value).screening);
        const context = saved.memoryContexts?.[String(screening.fingerprint)];
        if (!context) throw new Error("Saved memory screening context is missing");
        const bound = bindSceneMemorySuggestion(value, {
          source,
          operationId: id,
          proposalId: unit,
          collectionRevision: state.memories.revision,
          lines,
          playerLineId: saved.playerLineId,
          replyLineIds: saved.replyLineIds,
          residentIds: state.villagers.map((row) => row.characterId),
        });
        proposal = bound.proposal;
        if (
          proposal.action === "create" &&
          proposal.domainRef?.kind === "relationship" &&
          proposal.learners.player &&
          Array.isArray(asRecord(saved.relationshipChanges).disclosures) &&
          (asRecord(saved.relationshipChanges).disclosures as unknown[]).length
        ) {
          delete proposal.learners.player;
          if (!Object.keys(proposal.learners).length)
            throw new Error("Relationship disclosure learning belongs to source publication.");
        }
        const expectedEffects = [
          ...(turn.physicalOutcomeVersion === 1 ? [`venue-chat:${scene.id}:${turn.id}`] : []),
          ...(turn.wishProposals ?? []).map(
            (wish) => `wish-change:${scene.id}:${turn.id}:${wish.wishId}:${wish.intent}`,
          ),
        ];
        if (
          proposal.effectId &&
          expectedEffects.includes(proposal.effectId) &&
          !state.exchangeReceipts[proposal.effectId]
        ) {
          waiting = true;
          return;
        }
        if (!bound.evidence.some((e) => e.lineId === saved.playerLineId || saved.replyLineIds.includes(e.lineId)))
          throw new Error("Memory has no new exchange evidence");
        applyVillageMemory(state, proposal, {
          source,
          occurredAt: turn.at!,
          recordedAt: now.toISOString(),
          evidence: bound.evidence,
          committedEffects: effects,
          ...context,
        });
        state.memoryReceipts[id] = {
          id,
          sceneId: scene.id,
          submissionId: turn.id,
          domain: "memories",
          status: "applied",
          at: turn.at!,
          committedAt: now.toISOString(),
          evidenceIds: [...new Set(bound.evidence.map((e) => e.lineId))],
          reason: "Cited memory applied",
          memoryProposal: proposal,
        };
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        rejections.push({ kind: "memory", index, reason });
        state.memoryReceipts[id] = {
          id,
          sceneId: scene.id,
          submissionId: turn.id,
          domain: "memories",
          status: "rejected",
          at: turn.at!,
          committedAt: now.toISOString(),
          evidenceIds: [],
          reason,
          ...(proposal ? { memoryProposal: proposal } : {}),
        };
      }
    });
  }
  return {
    status: waiting ? "pending" : rejections.length ? "rejected" : "applied",
    receiptIds,
    rejectedProposals: rejections,
    reason: waiting
      ? "Waiting for the corresponding effect receipt to commit"
      : rejections.length
        ? "Affected memory proposals rejected; dialogue and independent effects retained"
        : "Cited memories applied",
  };
}
