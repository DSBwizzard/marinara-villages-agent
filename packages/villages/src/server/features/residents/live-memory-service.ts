import { applyLiveMemories } from "../../domain/rules/live-memory-application.js";
import { semanticContinued, semanticContinuationKey } from "../../domain/rules/semantic-continuity.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { DomainProcessing } from "../../domain/models/exchange-model.js";

import type { LiveEvidenceContext, LiveExchangeProposals } from "../../domain/models/memory-model.js";

import type { VenueScene } from "../../domain/models/scene-model.js";

import { asRecord } from "../../domain/rules/coerce.js";

import { createLiveEvidenceContext } from "../../domain/rules/live-exchange.js";

import { parseRelationshipProposals } from "../../domain/rules/relationship-review.js";

import { applyRelationshipReview } from "../../domain/rules/relationship-rules.js";

import { settleStandingAccess } from "../../domain/rules/venue-access.js";

import { metadataFailure, WorkFailureError, coerceWorkFailure } from "../../domain/rules/work-failure.js";

import { sceneContinuityView } from "../../domain/rules/scene-continuity.js";

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
    expectedIncarnations?: Record<string, string>,
  ): Promise<Partial<DomainProcessing>> {
    const turn = scene.submissions.find((row) => row.id === submissionId);
    if (!Array.isArray(turn?.liveProposals?.memoryChanges))
      throw new WorkFailureError(
        metadataFailure("Memory interpretation is incomplete; the saved dialogue is retained."),
      );
    let result: Partial<DomainProcessing> = { status: "applied", receiptIds: [] };
    await mutateVillageState((state) => {
      if (
        expectedIncarnations &&
        Object.entries(expectedIncarnations).some(
          ([id, at]) => state.villagers.find((r) => r.characterId === id)?.cardSnapshot.capturedAt !== at,
        )
      ) {
        const id = scene.id + ":" + submissionId + ":incarnation";
        state.memoryReceipts[id] ??= {
          id,
          sceneId: scene.id,
          submissionId,
          domain: "memories",
          status: "rejected",
          at: turn.at,
          committedAt: now().toISOString(),
          evidenceIds: [],
          reason: "The correspondent changed before optional Memory learning.",
        };
        result = { status: "rejected", receiptIds: [id], reason: state.memoryReceipts[id]!.reason };
        return;
      }
      if (
        !scene.id.startsWith("offscreen:") &&
        turn.semanticProvenance?.version === 2 &&
        !state.socialPublications?.[scene.id + ":" + turn.id]
      ) {
        result = {
          status:
            Array.isArray(turn.liveProposals.memoryChanges) && turn.liveProposals.memoryChanges.length
              ? "pending"
              : "applied",
          receiptIds: [],
          reason: "Saved Memory interpretation waits for source publication.",
        };
        return;
      }
      result = applyLiveMemories(state, scene, submissionId, now(), evidenceContext);
    });
    return result;
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
      sceneContinuityView(village, scene).relationshipContext,
    );
    if (rejections.length)
      throw new Error("Social interpretation needs correction: " + rejections.map((row) => row.reason).join("; "));
    const receiptIds = [...review.changes, ...review.permissions, ...review.disclosures].map((row) => row.id);
    if (!receiptIds.length && !review.intentions?.length)
      return {
        status: rejections.length ? (turn.semanticProvenance?.version === 2 ? "failed" : "rejected") : "applied",
        reason: rejections.length ? "Relationship proposals rejected" : "No social changes",
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
        sceneContinuityView(authority, scene).relationshipContext,
      );
      if (fresh.rejections.length) throw new Error("Social authority changed before settlement.");
      for (const permission of fresh.review.permissions) {
        const venue = authority.venues.find((row) => row.id === permission.venueId);
        if (venue?.access) {
          settleStandingAccess(venue, permission, turn.at, [
            "player",
            ...authority.villagers.map((person) => person.characterId),
          ]);
          if (!venue.access.receipts[permission.id] || venue.access.receipts[permission.id]?.outcome === "rejected")
            throw new Error("Standing permission needs recovery before this source can be published.");
          authority.exchangeReceipts[permission.id] ??= {
            id: permission.id,
            sceneId: scene.id,
            submissionId: turn.id,
            domain: "relationships",
            at: turn.at,
            evidenceIds: permission.lineIds,
            status: "applied",
            reason: "Witnessed standing permission.",
            sceneFacts: { standingPermissions: [structuredClone(permission)] },
          };
        }
      }
    });
    await mutateRelationships(village.seed, async (state) => {
      if (state.applied[semanticContinuationKey(scene.id, turn.id)]) return;
      const authority = await readVillageAuthority();
      if (semanticContinued(authority, scene.id, turn.id, "relationships")) return;
      if (authority.seed !== village.seed) throw new Error("Village identity changed");
      authority.relationshipContext = state;
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
        sceneContinuityView(authority, scene).relationshipContext,
      );
      if (fresh.rejections.length) throw new Error("Social authority changed before settlement.");
      rejections.splice(0, rejections.length, ...fresh.rejections);
      receiptIds.splice(
        0,
        receiptIds.length,
        ...[...fresh.review.changes, ...fresh.review.permissions, ...fresh.review.disclosures].map((row) => row.id),
      );
      applyRelationshipReview(
        state,
        fresh.review,
        authority,
        scene.id + ":" + turn.id,
        turn.at,
        villageNow().getTime(),
        sceneContinuityView({ ...authority, relationshipContext: state }, scene).relationshipContext,
      );
      for (const id of receiptIds) {
        const receipt = state.receipts[id];
        if (!receipt || receipt.noticeSequence) continue;
        receipt.sceneId = scene.id;
        receipt.submissionId = turn.id;
        receipt.committedAt = now().toISOString();
        receipt.noticeSequence = ++state.noticeSequence;
      }
      for (const item of fresh.review.intentions ?? []) {
        const receipt = state.intentionReceipts[scene.id + ":" + turn.id + ":intentions:" + item.actorId];
        if (receipt) {
          receipt.sceneId = scene.id;
          receipt.submissionId = turn.id;
        }
      }
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
