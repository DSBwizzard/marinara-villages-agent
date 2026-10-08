import type { DomainProcessing } from "../../domain/models/exchange-model.js";

import type { LiveEvidenceContext, LiveExchangeProposals } from "../../domain/models/memory-model.js";

import type { VenueScene } from "../../domain/models/scene-model.js";

import type { VillageChronicleEntry, VillageMemoryCategory } from "../../domain/models/world.js";

import { asRecord } from "../../domain/rules/coerce.js";

import { createLiveEvidenceContext, memoryVersion } from "../../domain/rules/live-exchange.js";

import { MAX_MEMORY_LENGTH } from "../../domain/rules/memory-policy.js";

import { parseRelationshipProposals, substantiveContact } from "../../domain/rules/relationship-review.js";

import { applyRelationshipReview } from "../../domain/rules/relationship-rules.js";

import { settleStandingAccess } from "../../domain/rules/venue-access.js";

import { deriveVillageMoment } from "../../domain/rules/village-clock.js";

import { metadataFailure, WorkFailureError } from "../../domain/rules/work-failure.js";

import { captureRelationshipKnowledge } from "../../domain/rules/relationship-knowledge.js";

import type { mutateVillageState, readVillageAuthority, readVillageState } from "../world/village-store.js";
import type { mutateRelationships } from "./relationship-store.js";
export type LiveMemoryPorts = {
  mutateVillageState: typeof mutateVillageState;
  readVillageAuthority: typeof readVillageAuthority;
  readVillageState: typeof readVillageState;
  mutateRelationships: typeof mutateRelationships;
};
/** Live memory and relationship settlement share their originating authority and save connections. */
export function createLiveMemory(ports: LiveMemoryPorts) {
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

  const categories = ["commitment", "personal-fact", "preference", "relationship", "shared-experience"];

  const ids = (value: unknown): string[] =>
    Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && !!id))] : [];

  const sameIds = (a: string[], b: string[]) => [...a].sort().join("\n") === [...b].sort().join("\n");

  async function processLiveMemories(
    scene: VenueScene,
    submissionId: string,
    context?: LiveEvidenceContext,
  ): Promise<Partial<DomainProcessing>> {
    const turn = scene.submissions.find((turn) => turn.id === submissionId)!;
    const proposals = turn.liveProposals;
    if (!proposals || !Array.isArray(proposals.memoryChanges))
      throw new WorkFailureError(
        metadataFailure(
          "Memory proposals missing or incomplete. Replay cannot reconstruct missing metadata; explicitly retry Memories interpretation.",
          proposals?.responseDiagnostics,
        ),
      );
    if (proposals.memoryChanges.length > 16) throw new Error("Too many memory proposals");
    if (!proposals.memoryChanges.length) return { reason: "No memory changes proposed", receiptIds: [] };
    const { byId } = context ?? createLiveEvidenceContext(scene, proposals);
    const at = turn.at!;
    const receiptIds: string[] = [],
      errors: string[] = [];
    await mutateVillageState((state) => {
      if (state.seed !== scene.villageSeed) throw new Error("Village identity changed");
      receiptIds.length = 0;
      errors.length = 0;
      const residents = new Set(state.villagers.map((person) => person.characterId));
      if (Array.isArray(proposals.memoryChanges))
        proposals.memoryChanges.forEach((value, index) => {
          const id = `${scene.id}:${turn.id}:memory:${index}`;
          const prior = state.exchangeReceipts[id];
          if (prior) {
            receiptIds.push(id);
            if (prior.status === "rejected") errors.push(prior.reason);
            return;
          }
          let lineIds: string[] = [];
          try {
            const row = asRecord(value),
              kind = row.kind;
            if (!["passing", "durable", "reinforce", "supersede"].includes(String(kind)))
              throw new Error("Invalid memory kind");
            const text = typeof row.text === "string" ? row.text.trim() : "";
            if (text.length > MAX_MEMORY_LENGTH) throw new Error("Memory exceeds the saved text limit");
            const subjects = ids(row.subjectCharacterIds),
              knowers = ids(row.knownByCharacterIds);
            lineIds = refs(row.evidence, proposals);
            if (
              !text ||
              !knowers.length ||
              subjects.some((id) => !residents.has(id)) ||
              knowers.some((id) => !residents.has(id))
            )
              throw new Error("Memory text, subjects or witnesses invalid");
            if (
              lineIds.some((id) => !byId.has(id) || knowers.some((knower) => !byId.get(id)!.heardBy.includes(knower)))
            )
              throw new Error("Memory evidence missing or not heard by every knower");
            if (!lineIds.some((id) => proposals.replyLineIds.includes(id) || id === proposals.playerLineId))
              throw new Error("Memory proposal has no new exchange evidence");
            const memoryIds = ids(row.memoryIds);
            const references = memoryIds.map((id) => state.chronicle.find((memory) => memory.id === id));
            if ((kind === "reinforce" || kind === "supersede") && !references.length)
              throw new Error("Existing memory reference absent");
            if (
              references.some(
                (memory) =>
                  !memory ||
                  memory.supersededBy ||
                  proposals.memoryVersions[memory.id] !== memoryVersion(memory) ||
                  !sameIds(memory.knownByCharacterIds ?? memory.actors.map((actor) => actor.id), knowers),
              )
            )
              throw new Error("Referenced memory changed, became obsolete, or has different witnesses");
            if (kind !== "passing" && !categories.includes(String(row.category)))
              throw new Error("Durable memory category invalid");
            const evidenceItem = { visitId: scene.id, submissionId: turn.id, lineIds };
            let savedMemory: VillageChronicleEntry | undefined;
            if (kind === "passing") {
              const expiry = new Date(Date.parse(at) + 24 * 60 * 60 * 1000).toISOString();
              if (Date.parse(expiry) > Date.now()) {
                state.recollections = state.recollections.filter((entry) => Date.parse(entry.expiresAt) > Date.now());
                const repeated = state.recollections.find(
                  (entry) =>
                    entry.text.toLowerCase() === text.toLowerCase() &&
                    sameIds(entry.knownByCharacterIds, knowers) &&
                    sameIds(entry.subjectCharacterIds, subjects),
                );
                if (repeated) {
                  if (Date.parse(expiry) > Date.parse(repeated.expiresAt)) repeated.expiresAt = expiry;
                  if (Date.parse(at) > Date.parse(repeated.lastReinforcedAt)) repeated.lastReinforcedAt = at;
                  repeated.reinforcementCount++;
                  repeated.sourceLineIds = [...new Set([...repeated.sourceLineIds, ...lineIds])];
                  repeated.sourceSubmissionIds.push(turn.id);
                  repeated.evidence.push(evidenceItem);
                } else
                  state.recollections.unshift({
                    id,
                    visitId: scene.id,
                    occurredAt: at,
                    expiresAt: expiry,
                    text,
                    subjectCharacterIds: subjects,
                    knownByCharacterIds: knowers,
                    sourceLineIds: lineIds,
                    sourceSubmissionIds: [turn.id],
                    evidence: [evidenceItem],
                    reinforcementCount: 0,
                    lastReinforcedAt: at,
                  });
              }
            } else if (kind === "reinforce") {
              for (const memory of references as VillageChronicleEntry[]) {
                memory.evidenceHistory = [...(memory.evidenceHistory ?? []), evidenceItem];
                memory.sourceLineIds = [...new Set([...(memory.sourceLineIds ?? []), ...lineIds])];
                if (!memory.lastReinforcedAt || Date.parse(at) > Date.parse(memory.lastReinforcedAt))
                  memory.lastReinforcedAt = at;
              }
            } else {
              const duplicate =
                kind === "durable" &&
                state.chronicle.find(
                  (memory) =>
                    !memory.supersededBy &&
                    memory.text.toLowerCase() === text.toLowerCase() &&
                    sameIds(memory.knownByCharacterIds ?? [], knowers),
                );
              if (duplicate) {
                duplicate.evidenceHistory = [...(duplicate.evidenceHistory ?? []), evidenceItem];
                duplicate.sourceLineIds = [...new Set([...(duplicate.sourceLineIds ?? []), ...lineIds])];
                if (!duplicate.lastReinforcedAt || Date.parse(at) > Date.parse(duplicate.lastReinforcedAt))
                  duplicate.lastReinforcedAt = at;
              } else {
                const moment = deriveVillageMoment({ foundedAt: state.foundedAt, seed: state.seed, now: new Date(at) });
                savedMemory = {
                  id,
                  text,
                  dayIndex: moment.dayIndex,
                  clock: moment.dayPhase,
                  occurredAt: at,
                  timePrecision: "exact",
                  scope: "private",
                  kind: "chat",
                  actors: knowers.map((id) => ({
                    id,
                    name: state.villagers.find((person) => person.characterId === id)!.cardSnapshot.name,
                  })),
                  memoryCategory: row.category as VillageMemoryCategory,
                  subjectCharacterIds: subjects,
                  knownByCharacterIds: knowers,
                  sourceLineIds: lineIds,
                  sourceVisitId: scene.id,
                  evidenceHistory: [evidenceItem],
                  lastReinforcedAt: at,
                };
                state.chronicle.unshift(savedMemory);
                for (const memory of references as VillageChronicleEntry[]) {
                  memory.supersededBy = id;
                  memory.supersededAt = at;
                  memory.evidenceHistory = [...(memory.evidenceHistory ?? []), evidenceItem];
                }
              }
            }
            const visible = lineIds.every((id) => byId.get(id)?.playerHeard !== false);
            state.exchangeReceipts[id] = {
              id,
              domain: "memories",
              sceneId: scene.id,
              submissionId: turn.id,
              at,
              evidenceIds: lineIds,
              reason: "Cited memory applied",
              status: "applied",
              ...(savedMemory && visible
                ? { notice: { id, kind: "memory", text: "A memory was forged.", detail: savedMemory.text } }
                : {}),
            };
          } catch (error) {
            const reason = String(error).replace(/^Error: /u, "");
            errors.push(reason);
            state.exchangeReceipts[id] = {
              id,
              domain: "memories",
              sceneId: scene.id,
              submissionId: turn.id,
              at,
              evidenceIds: lineIds,
              reason,
              status: "rejected",
            };
          }
          receiptIds.push(id);
        });
    });
    return {
      status: errors.length ? "rejected" : "applied",
      reason: errors.join("; ") || "Cited memory proposals applied",
      receiptIds,
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
    const raw = asRecord(proposals.relationshipChanges),
      lines = (context ?? createLiveEvidenceContext(scene, proposals)).lines;
    const village = await readVillageState();
    if (village.seed !== scene.villageSeed) throw new Error("Village identity changed");
    const { review, rejections } = parseRelationshipProposals(raw, scene.id + ":" + turn.id, lines, village, (row) => ({
      ...row,
      lineIds: refs(row.lineIds, proposals),
    }));
    const actors = [...new Set(lines.map((line) => (line.role === "user" ? "player" : line.speakerId)))].filter(
      (id) => id === "player" || village.villagers.some((person) => person.characterId === id),
    );
    for (const fromId of actors.filter((id) => id !== "player"))
      for (const toId of actors) {
        if (fromId === toId || !substantiveContact(lines, fromId, toId)) continue;
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
        status: rejections.length ? "rejected" : "applied",
        reason: rejections.length
          ? "Relationship proposals rejected"
          : "No relationship changes or substantive contact",
        receiptIds,
        rejectedProposals: rejections,
      };
    await mutateVillageState((authority) => {
      const fresh = parseRelationshipProposals(raw, scene.id + ":" + turn.id, lines, authority, (row) => ({
        ...row,
        lineIds: refs(row.lineIds, proposals),
      }));
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
      const authority = await readVillageAuthority();
      if (authority.seed !== village.seed) throw new Error("Village identity changed");
      const fresh = parseRelationshipProposals(raw, scene.id + ":" + turn.id, lines, authority, (row) => ({
        ...row,
        lineIds: refs(row.lineIds, proposals),
      }));
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
      applyRelationshipReview(state, fresh.review, authority, scene.id, turn.at);
      for (const id of receiptIds) {
        const receipt = state.receipts[id];
        if (!receipt || receipt.noticeSequence) continue;
        receipt.sceneId = scene.id;
        receipt.submissionId = turn.id;
        receipt.committedAt = new Date().toISOString();
        receipt.noticeSequence = ++state.noticeSequence;
      }
      captureRelationshipKnowledge(state, authority);
    });
    return {
      status: !receiptIds.length && rejections.length ? "rejected" : "applied",
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
