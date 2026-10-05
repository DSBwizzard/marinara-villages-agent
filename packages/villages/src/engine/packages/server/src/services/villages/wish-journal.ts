import { createHash } from "node:crypto";
import { asRecord, asTrimmedString } from "./coerce.js";
import { WISH_SYSTEM_VERSION } from "./wish-definition.js";
import type { VillageState, VillageWish } from "./types.js";
import type { VenueLine } from "./venue-session.js";
import type { InterpretationEvidence } from "./interpretation.js";

export type WishFactKind = "preference" | "concern" | "possibility" | "condition" | "result";
export type WishFactCandidate = { kind: WishFactKind; quote: string; lineIds: string[]; supersedes?: string };
export type WishJournalEvidence = InterpretationEvidence & { sceneId: string; submissionId: string };
export type WishJournalFact = WishFactCandidate & {
  id: string;
  at: string;
  sceneId: string;
  submissionId: string;
  supersededBy?: string;
  conditionRevision?: number;
};
export type KnownWish = {
  wishId: string;
  text: string;
  learnedAt: string;
  lineIds: string[];
  status?: "active" | "fulfilled" | "expired" | "retired";
  facts?: WishJournalFact[];
  evidence?: WishJournalEvidence[];
};
const factKinds = ["preference", "concern", "possibility", "condition", "result"];
const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
export function coerceWishKnowledge(value: unknown): VillageState["wishKnowledge"] {
  return Object.fromEntries(
    Object.entries(asRecord(value)).map(([actorId, rows]) => [
      actorId,
      (Array.isArray(rows) ? rows : []).flatMap((value): KnownWish[] => {
        const row = asRecord(value);
        if (!asTrimmedString(row.wishId) || !asTrimmedString(row.text)) return [];
        return [
          {
            wishId: asTrimmedString(row.wishId),
            text: asTrimmedString(row.text),
            learnedAt: asTrimmedString(row.learnedAt),
            lineIds: strings(row.lineIds),
            status: ["fulfilled", "expired", "retired"].includes(String(row.status))
              ? (row.status as KnownWish["status"])
              : "active",
            facts: (Array.isArray(row.facts) ? row.facts : []).flatMap((value): WishJournalFact[] => {
              const fact = asRecord(value);
              if (
                !asTrimmedString(fact.id) ||
                !factKinds.includes(String(fact.kind)) ||
                !asTrimmedString(fact.quote) ||
                !strings(fact.lineIds).length
              )
                return [];
              return [
                {
                  id: asTrimmedString(fact.id),
                  kind: fact.kind as WishFactKind,
                  quote: asTrimmedString(fact.quote).slice(0, 320),
                  lineIds: strings(fact.lineIds),
                  at: asTrimmedString(fact.at),
                  sceneId: asTrimmedString(fact.sceneId),
                  submissionId: asTrimmedString(fact.submissionId),
                  ...(Number.isSafeInteger(fact.conditionRevision)
                    ? { conditionRevision: Number(fact.conditionRevision) }
                    : {}),
                  ...(typeof fact.supersedes === "string" ? { supersedes: fact.supersedes } : {}),
                  ...(typeof fact.supersededBy === "string" ? { supersededBy: fact.supersededBy } : {}),
                },
              ];
            }),
            evidence: (Array.isArray(row.evidence) ? row.evidence : []).flatMap((value): WishJournalEvidence[] => {
              const evidence = asRecord(value);
              if (
                !asTrimmedString(evidence.id) ||
                !asTrimmedString(evidence.content) ||
                !asTrimmedString(evidence.sceneId)
              )
                return [];
              return [
                {
                  id: asTrimmedString(evidence.id),
                  speakerId: asTrimmedString(evidence.speakerId),
                  name: asTrimmedString(evidence.name),
                  content: asTrimmedString(evidence.content).slice(0, 1200),
                  kind: asTrimmedString(evidence.kind),
                  at: asTrimmedString(evidence.at),
                  sceneId: asTrimmedString(evidence.sceneId),
                  submissionId: asTrimmedString(evidence.submissionId),
                  current: false,
                },
              ];
            }),
          },
        ];
      }),
    ]),
  );
}
export function knownWish(state: VillageState, actorId: string, wishId: string): KnownWish | undefined {
  return state.wishKnowledge[actorId]?.find((entry) => entry.wishId === wishId);
}
export function discloseWish(
  state: VillageState,
  actorId: string,
  wish: VillageWish,
  at: string,
  lineIds: string[],
): KnownWish {
  wish.learnedAt ||= at;
  wish.learnedLineIds = [...new Set([...(wish.learnedLineIds ?? []), ...lineIds])];
  const rows = (state.wishKnowledge[actorId] ??= []);
  let entry = knownWish(state, actorId, wish.id);
  if (!entry) {
    entry = {
      wishId: wish.id,
      text: wish.wish,
      learnedAt: wish.learnedAt,
      lineIds: [...lineIds],
      status: "active",
      facts: [],
      evidence: [],
    };
    rows.push(entry);
  }
  entry.lineIds = [...new Set([...entry.lineIds, ...lineIds])];
  return entry;
}
/** Captured witnessed excerpts survive Scene boundaries. They are facts, never future tasks. */
export function rememberWishEvidence(
  entry: KnownWish,
  evidence: InterpretationEvidence[],
  sceneId: string,
  submissionId: string,
): void {
  const rows = (entry.evidence ??= []);
  for (const line of evidence) {
    if (
      line.kind === "claim" ||
      line.kind === "receipt" ||
      !line.content ||
      rows.some((old) => old.id === line.id && old.sceneId === sceneId)
    )
      continue;
    rows.push({ ...line, content: line.content.slice(0, 1200), current: false, sceneId, submissionId });
  }
}
/** Only exact resident speech can establish personal preferences or conditions. */
export function bindWishFacts(
  value: unknown,
  actorId: string,
  lines: VenueLine[],
  resolve: (ref: unknown) => string,
): WishFactCandidate[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 4).flatMap((value): WishFactCandidate[] => {
    const row = asRecord(value),
      kind = String(row.kind),
      quote = asTrimmedString(row.quote);
    const lineIds = Array.isArray(row.evidence) ? [...new Set(row.evidence.map(resolve))] : [];
    if (
      !factKinds.includes(kind) ||
      kind === "result" ||
      !quote ||
      quote.length > 320 ||
      !lineIds.length ||
      lineIds.length > 4
    )
      return [];
    if (
      !lineIds.every((id) =>
        lines.some(
          (line) =>
            line.id === id &&
            line.speakerId === actorId &&
            line.heardBy.includes(actorId) &&
            !line.contactHidden &&
            !line.contactReport &&
            !["side", "narration", "whisper"].includes(line.kind ?? "") &&
            line.content.includes(quote),
        ),
      )
    )
      return [];
    if (
      kind === "condition" &&
      (/\b(?:only way|only solution)\b/iu.test(quote) ||
        !/\b(?:only|must|unless|require|need\b.{0,60}\bbefore|won['’]t\b.{0,60}\bwithout)\b/iu.test(quote) ||
        /\b(?:perhaps|maybe|quoted|said that)\b/iu.test(quote))
    )
      return [];
    return [
      {
        kind: kind as WishFactKind,
        quote,
        lineIds,
        ...(typeof row.supersedes === "string" ? { supersedes: row.supersedes } : {}),
      },
    ];
  });
}
export function addWishFacts(
  state: VillageState,
  actorId: string,
  wish: VillageWish,
  candidates: WishFactCandidate[],
  sceneId: string,
  submissionId: string,
  at: string,
): number {
  const entry = knownWish(state, actorId, wish.id);
  if (!entry || !wish.learnedAt || (entry.status && entry.status !== "active")) return 0;
  let added = 0;
  const facts = (entry.facts ??= []);
  for (const candidate of candidates) {
    if (facts.some((fact) => !fact.supersededBy && fact.kind === candidate.kind && fact.quote === candidate.quote))
      continue;
    const prior = candidate.supersedes
      ? facts.find((fact) => fact.id === candidate.supersedes && !fact.supersededBy)
      : undefined;
    if (
      candidate.supersedes &&
      (!prior ||
        !/\b(?:actually|instead|no longer|changed my mind|don[’']t need|do not need|not necessary|forget|rather)\b/iu.test(
          candidate.quote,
        ))
    )
      continue;
    const id = createHash("sha256")
      .update(JSON.stringify([wish.id, sceneId, submissionId, candidate]))
      .digest("hex")
      .slice(0, 24);
    if (facts.some((fact) => fact.id === id)) continue;
    const fact: WishJournalFact = { ...candidate, id, sceneId, submissionId, at };
    facts.push(fact);
    if (prior) prior.supersededBy = id;
    if (candidate.kind === "condition" || prior?.kind === "condition")
      fact.conditionRevision = wish.conditionRevision = (wish.conditionRevision ?? 0) + 1;
    added++;
  }
  return added;
}
export function setWishJournalStatus(
  state: VillageState,
  actorId: string,
  wishId: string,
  status: KnownWish["status"],
): void {
  const entry = knownWish(state, actorId, wishId);
  if (entry) entry.status = status;
}
export function wishConditionRevision(state: VillageState, actorId: string, wish: VillageWish, asOf?: string): number {
  if (!asOf) return wish.conditionRevision ?? 0;
  return Math.max(
    0,
    ...(knownWish(state, actorId, wish.id)?.facts ?? [])
      .filter((fact) => fact.at <= asOf)
      .map((fact) => fact.conditionRevision ?? 0),
  );
}
export function wishCheckKnowledge(state: VillageState, actorId: string, wishId: string, asOf?: string) {
  const entry = knownWish(state, actorId, wishId);
  const active =
    entry?.facts?.filter(
      (fact) =>
        (!asOf || fact.at <= asOf) &&
        (!fact.supersededBy ||
          (!!asOf && (entry.facts?.find((next) => next.id === fact.supersededBy)?.at ?? "") > asOf)),
    ) ?? [];
  return {
    asOf,
    conditionRevision: Math.max(
      0,
      ...(entry?.facts ?? []).filter((fact) => !asOf || fact.at <= asOf).map((fact) => fact.conditionRevision ?? 0),
    ),
    conditions: active
      .filter((fact) => fact.kind === "condition")
      .map(({ id, quote, at, lineIds, submissionId }) => ({ id, quote, at, lineIds, submissionId })),
    discoveries: active
      .filter((fact) => fact.kind !== "condition")
      .slice(-8)
      .map(({ kind, quote, at }) => ({ kind, quote, at })),
    evidence: (entry?.evidence ?? [])
      .filter((line) => !asOf || (!!line.at && line.at <= asOf))
      .slice(-16)
      .map((line) => ({ ...line, current: false })),
  };
}
/** Authorized one-time reset; physical receipts and all real world consequences remain intact. */
export function resetLegacyWishRecords(state: VillageState): void {
  if (state.wishSystemVersion === WISH_SYSTEM_VERSION) return;
  state.wishSystemVersion = WISH_SYSTEM_VERSION;
  state.wishResetPending = state.villagers
    .filter((resident) => !!resident.agenda?.generatedAt && !resident.agenda.personalizationPending)
    .map((resident) => resident.characterId);
  state.wishKnowledge = {};
  state.wishRefillIntents = {};
  state.projectWishOutbox = [];
  state.correctedWishMemoryIds = [];
  state.progressTasks = state.progressTasks.filter((task) => task.definition.owner.kind !== "wish");
  for (const [id, receipt] of Object.entries(state.exchangeReceipts))
    if (receipt.domain === "wishes") delete state.exchangeReceipts[id];
  for (const resident of state.villagers) {
    resident.completedWishes = [];
    resident.wishLifecycle = undefined;
    if (resident.agenda) {
      resident.agenda.wishes = [];
      resident.agenda.wishActivities = [];
    }
  }
}
