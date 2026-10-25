import type { VillageState } from "../models/world.js";
import type { MemoryDomainRef, MemoryLearning, MemorySource } from "../models/memories.js";
import { memoryHash } from "./memory-integrity.js";
import { memoryProtectionContext } from "./memory-protection.js";
import { applyVillageMemory } from "./village-memories.js";
/** Deterministic authority facts never guess around a protected root. A related repair/Forget
 * defers this optional learning without undoing the committed mechanic or spending a model call. */
export function rememberDomainFact(
  state: VillageState,
  input: {
    id: string;
    at: string;
    recordedAt: string;
    text: string;
    knowers: string[];
    subjects: string[];
    domainRef?: MemoryDomainRef;
    event?: boolean;
    effectId?: string;
    committedAt?: string;
    sceneId?: string;
    disclosed?: Record<string, string | boolean>;
  },
) {
  const effectId = input.effectId ?? input.id;
  const existing = input.event && state.memories.records.find((row) => row.committedEffect?.id === effectId);
  const root = existing && state.memories.records.find((row) => row.id === existing.rootId)!;
  if (!input.event && state.memories.records.some((row) => row.origin.kind === "domain" && row.origin.id === input.id))
    return;
  const text = Buffer.from(input.text)
    .subarray(0, 600)
    .toString("utf8")
    .replace(/\uFFFD$/u, "");
  // A receipt proves its outcome, not richer private prose attached by another learner.
  // Only an identical receipt-derived fact may be shared without a fresh System decision.
  if (
    existing &&
    (existing.text !== text ||
      existing.kind !== "experience" ||
      existing.corrects ||
      existing.resolves ||
      memoryHash(existing.subjects) !== memoryHash(input.subjects) ||
      memoryHash(existing.domainRef) !== memoryHash(input.domainRef))
  )
    return;
  const excerpt = Buffer.from(text)
    .subarray(0, 320)
    .toString("utf8")
    .replace(/\uFFFD$/u, "");
  const audience = [...new Set(input.knowers)].filter(
    (id) =>
      !(input.event && state.memories.records.some((row) => row.committedEffect?.id === effectId && row.knowers[id])) &&
      !memoryProtectionContext(state.memories, {
        knowers: [id],
        query: text,
        domainRefs: input.domainRef ? [input.domainRef] : [],
      }).roots.length,
  );
  if (!audience.length || !text) return;
  const source: MemorySource = {
    kind: "domain",
    id: input.event ? "domain:" + memoryHash([input.id, audience]) : input.id,
    revision: 1,
    fingerprint: memoryHash([input.id, input.at, text, audience, input.domainRef, input.subjects]),
    ...(input.sceneId ? { sceneId: input.sceneId } : {}),
  };
  const evidence = { source, lineId: input.id, excerpt, audience };
  const protection = memoryProtectionContext(state.memories, {
    knowers: audience,
    query: text,
    sourceRefs: [evidence],
    domainRefs: input.domainRef ? [input.domainRef] : [],
  });
  if (protection.roots.length) return;
  const learners = Object.fromEntries(
    audience.map((id) => [
      id,
      {
        basis: input.event ? "validated-event" : "observation",
        support: [evidence],
        ...(input.disclosed ? { disclosed: input.disclosed } : {}),
      },
    ]),
  ) as Record<string, MemoryLearning>;
  applyVillageMemory(
    state,
    {
      operationId: source.id,
      source,
      proposalId: source.id,
      expectedCollectionRevision: state.memories.revision,
      ...(existing
        ? {
            action: "reinforce" as const,
            target: { id: existing.id, revision: existing.revision, rootRevision: root!.revision },
          }
        : { action: "create" as const, kind: "experience" as const, text, subjects: input.subjects }),
      learners,
      ...(input.domainRef ? { domainRef: input.domainRef } : {}),
      ...(input.event ? { effectId } : {}),
      screening: { disposition: "clear", protectedRoots: [], fingerprint: protection.fingerprint },
    },
    {
      source,
      evidence: [evidence],
      recall: existing
        ? { candidates: [{ ...existing, rootRevision: root!.revision }], targetIds: [existing.id] }
        : { candidates: [], targetIds: [] },
      protection,
      committedEffects:
        input.event && input.domainRef
          ? [
              {
                status: "committed",
                id: effectId,
                source,
                domainRef: input.domainRef,
                occurredAt: input.at,
                committedAt: input.committedAt ?? input.recordedAt,
                audience,
              },
            ]
          : [],
      recordedAt: input.recordedAt,
      occurredAt: input.at,
    },
  );
}
