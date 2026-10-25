import type { MemoryProposal, MemorySource } from "../../domain/models/memories.js";
import {
  bindSceneMemorySuggestion,
  committedSceneMemoryEffects,
  sceneMemoryUnit,
} from "../../domain/rules/scene-memories.js";
import { applyVillageMemory } from "../../domain/rules/village-memories.js";
import { semanticContinued, semanticContinuationKey } from "../../domain/rules/semantic-continuity.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { DomainProcessing } from "../../domain/models/exchange-model.js";

import type { LiveEvidenceContext, LiveExchangeProposals } from "../../domain/models/memory-model.js";

import type { VenueScene } from "../../domain/models/scene-model.js";

import { asRecord } from "../../domain/rules/coerce.js";

import { createLiveEvidenceContext } from "../../domain/rules/live-exchange.js";

import { parseRelationshipProposals, substantiveContact } from "../../domain/rules/relationship-review.js";

import { applyRelationshipReview } from "../../domain/rules/relationship-rules.js";

import { settleStandingAccess } from "../../domain/rules/venue-access.js";

import { metadataFailure, WorkFailureError, coerceWorkFailure } from "../../domain/rules/work-failure.js";

import { captureRelationshipKnowledge } from "../../domain/rules/relationship-knowledge.js";

import type { mutateVillageState, readVillageAuthority, readVillageState } from "../world/village-store.js";
import type { mutateRelationships } from "./relationship-store.js";
export type LiveMemoryPorts = {
  now?: () => Date;
  mutateVillageState: typeof mutateVillageState;
  readVillageAuthority: typeof readVillageAuthority;
  readVillageState: typeof readVillageState;
  mutateRelationships: typeof mutateRelationships;
};
/** Live memory and relationship settlement share their originating authority and save connections. */
export function createLiveMemory(ports: LiveMemoryPorts) {
  const now = ports.now ?? villageNow;
  const { mutateVillageState, readVillageAuthority, readVillageState, mutateRelationships } = ports;

  function refs(value: unknown, proposals: LiveExchangeProposals): string[] {
    if (!Array.isArray(value) || !value.length) throw new Error("Required cited evidence absent");
    return [
      ...new Set(
        value.map((ref) => {
          const id =
            ref === "player" ? proposals.playerLineId : typeof ref === "number" ? proposals.replyLineIds[ref] : ref;
          if (
            typeof id !== "string" ||
            !id ||
            ![proposals.playerLineId, ...proposals.replyLineIds, ...proposals.earlierLineIds].includes(id)
          )
            throw new Error("Citation was not supplied in this reply context");
          return id;
        }),
      ),
    ];
  }

  async function processLiveMemories(
    scene: VenueScene,
    submissionId: string,
    evidenceContext?: LiveEvidenceContext,
  ): Promise<Partial<DomainProcessing>> {
    const turn = scene.submissions.find((row) => row.id === submissionId);
    if (!turn || !turn.liveProposals || !Array.isArray(turn.liveProposals.memoryChanges))
      throw new WorkFailureError(
        metadataFailure("Memory interpretation is incomplete; the saved dialogue is retained."),
      );
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
    await mutateVillageState((state) => {
      if (state.seed !== scene.villageSeed) throw new Error("Village identity changed");
      if (semanticContinued(state, scene.id, turn.id, "memories")) return;
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
        const prior = state.exchangeReceipts[id];
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
            recordedAt: now().toISOString(),
            evidence: bound.evidence,
            committedEffects: effects,
            ...context,
          });
          state.exchangeReceipts[id] = {
            id,
            sceneId: scene.id,
            submissionId: turn.id,
            domain: "memories",
            status: "applied",
            at: turn.at!,
            committedAt: now().toISOString(),
            evidenceIds: [...new Set(bound.evidence.map((e) => e.lineId))],
            reason: "Cited memory applied",
            memoryProposal: proposal,
          };
        } catch (error) {
          const reason = error instanceof Error ? error.message : String(error);
          rejections.push({ kind: "memory", index, reason });
          state.exchangeReceipts[id] = {
            id,
            sceneId: scene.id,
            submissionId: turn.id,
            domain: "memories",
            status: "rejected",
            at: turn.at!,
            committedAt: now().toISOString(),
            evidenceIds: [],
            reason,
            ...(proposal ? { memoryProposal: proposal } : {}),
          };
        }
      });
    });
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

  async function processLiveRelationships(
    scene: VenueScene,
    submissionId: string,
    context?: LiveEvidenceContext,
  ): Promise<Partial<DomainProcessing>> {
    const turn = scene.submissions.find((turn) => turn.id === submissionId)!;
    const proposals = turn.liveProposals;
    if (
      !proposals ||
      !["changes", "permissions", "disclosures"].every((key) =>
        Array.isArray(asRecord(proposals.relationshipChanges)[key]),
      )
    )
      throw new WorkFailureError(
        metadataFailure(
          "Relationship proposals missing or incomplete. Replay cannot reconstruct missing metadata; explicitly retry Relationships interpretation.",
          proposals?.responseDiagnostics,
        ),
      );
    const unverified = asRecord(proposals.relationshipChanges).changes;
    if (
      Array.isArray(unverified) &&
      unverified.some((value) => ["rejected", "unresolved"].includes(String(asRecord(value).systemVerification)))
    )
      throw new WorkFailureError(
        coerceWorkFailure(
          asRecord(
            unverified.find((value) => ["rejected", "unresolved"].includes(String(asRecord(value).systemVerification))),
          ).systemVerificationFailure,
        ) ?? {
          cause: "unsupported_outcome",
          stage: "interpretation",
          message:
            "Consequential relationship proposal was not supported by System; explicitly retry Relationships interpretation",
        },
      );
    const raw = asRecord(proposals.relationshipChanges),
      lines = (context ?? createLiveEvidenceContext(scene, proposals)).lines;
    const village = await readVillageState();
    if (village.seed !== scene.villageSeed) throw new Error("Village identity changed");
    const { review, rejections } = parseRelationshipProposals(
      raw,
      scene.id + ":" + turn.id,
      lines,
      village,
      (row) => ({
        ...row,
        lineIds: refs(row.lineIds, proposals),
      }),
      turn.semanticProvenance?.version === 2,
    );
    const actors = [...new Set(lines.map((line) => (line.role === "user" ? "player" : line.speakerId)))].filter(
      (id) => id === "player" || village.villagers.some((person) => person.characterId === id),
    );
    for (const fromId of actors.filter((id) => id !== "player"))
      for (const toId of actors) {
        if (turn.semanticProvenance?.version === 2 || fromId === toId || !substantiveContact(lines, fromId, toId))
          continue;
        review.changes.push({
          id: `${scene.id}:${turn.id}:contact:${fromId}:${toId}`,
          fromId,
          toId,
          dimension: "warmth",
          amount: 0,
          ordinary: true,
          reason: "Shared substantive contact.",
          lineIds: lines.filter((line) => line.heardBy.includes(fromId)).map((line) => line.id),
          disclosed: false,
          contact: true,
          contactOnly: true,
        });
      }
    const receiptIds = [...review.changes, ...review.permissions, ...review.disclosures].map((row) => row.id);
    if (!receiptIds.length)
      return {
        status: rejections.length ? (turn.semanticProvenance?.version === 2 ? "failed" : "rejected") : "applied",
        reason: rejections.length
          ? "Relationship proposals rejected"
          : "No relationship changes or substantive contact",
        receiptIds,
        rejectedProposals: rejections,
      };
    await mutateVillageState((authority) => {
      if (semanticContinued(authority, scene.id, turn.id, "relationships")) return;
      const fresh = parseRelationshipProposals(
        raw,
        scene.id + ":" + turn.id,
        lines,
        authority,
        (row) => ({
          ...row,
          lineIds: refs(row.lineIds, proposals),
        }),
        turn.semanticProvenance?.version === 2,
      );
      for (const permission of fresh.review.permissions) {
        const venue = authority.venues.find((row) => row.id === permission.venueId);
        if (venue?.access)
          settleStandingAccess(venue, permission, turn.at, [
            "player",
            ...authority.villagers.map((person) => person.characterId),
          ]);
      }
    });
    await mutateRelationships(village.seed, async (state) => {
      if (state.applied[semanticContinuationKey(scene.id, turn.id)]) return;
      const authority = await readVillageAuthority();
      if (semanticContinued(authority, scene.id, turn.id, "relationships")) return;
      if (authority.seed !== village.seed) throw new Error("Village identity changed");
      const fresh = parseRelationshipProposals(
        raw,
        scene.id + ":" + turn.id,
        lines,
        authority,
        (row) => ({
          ...row,
          lineIds: refs(row.lineIds, proposals),
        }),
        turn.semanticProvenance?.version === 2,
      );
      fresh.review.changes.push(
        ...review.changes.filter(
          (change) =>
            change.contactOnly &&
            authority.villagers.some((person) => person.characterId === change.fromId) &&
            (change.toId === "player" || authority.villagers.some((person) => person.characterId === change.toId)),
        ),
      );
      rejections.splice(0, rejections.length, ...fresh.rejections);
      receiptIds.splice(
        0,
        receiptIds.length,
        ...[...fresh.review.changes, ...fresh.review.permissions, ...fresh.review.disclosures].map((row) => row.id),
      );
      applyRelationshipReview(state, fresh.review, authority, scene.id, turn.at, now().getTime());
      for (const id of receiptIds) {
        const receipt = state.receipts[id];
        if (!receipt || receipt.noticeSequence) continue;
        receipt.sceneId = scene.id;
        receipt.submissionId = turn.id;
        receipt.committedAt = now().toISOString();
        receipt.noticeSequence = ++state.noticeSequence;
      }
      captureRelationshipKnowledge(state, authority, now());
    });
    return {
      status:
        turn.semanticProvenance?.version === 2 && rejections.length
          ? "failed"
          : !receiptIds.length && rejections.length
            ? "rejected"
            : "applied",
      reason:
        !receiptIds.length && rejections.length
          ? "Relationship proposals rejected against current authority"
          : "Cited relationship proposals applied",
      receiptIds,
      rejectedProposals: rejections,
    };
  }

  return { processLiveMemories, processLiveRelationships };
}
export type LiveMemoryService = ReturnType<typeof createLiveMemory>;
