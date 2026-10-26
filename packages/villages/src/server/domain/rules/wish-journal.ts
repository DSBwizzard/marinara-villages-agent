import { z } from "zod";
import type { InterpretationEvidence } from "../models/interpretation-check-model.js";
import type { VenueLine } from "../models/scene-model.js";
import type { VillageState, VillageWish } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { createHash } from "node:crypto";
import { projectMemories } from "./memory-views.js";
export type WishFactKind = "goal" | "condition" | "result";
export type WishFactCandidate = {
  semanticVersion?: 2;
  kind: WishFactKind;
  quote: string;
  lineIds: string[];
  supersedes?: string;
};
export type WishJournalEvidence = InterpretationEvidence & { sceneId: string; submissionId: string };
export type WishJournalFact = WishFactCandidate & {
  id: string;
  at: string;
  sceneId: string;
  submissionId: string;
  supersededBy?: string;
  conditionRevision?: number;
};
/** Goal-affecting owner statements and exact completion proof belong to the Wish authority. */
export type WishGoalJournal = { facts: WishJournalFact[]; evidence: WishJournalEvidence[] };
export type KnownWish = {
  wishId: string;
  text: string;
  learnedAt: string;
  lineIds: string[];
  status?: "active" | "fulfilled" | "expired" | "retired";
  facts?: { id: string; kind: string; quote: string; at: string; sceneId: string; lineIds: string[] }[];
};
const journalTime = z.string().refine((value) => Number.isFinite(Date.parse(value)));
const journalText = z.string().min(1),
  journalFact = z
    .object({
      semanticVersion: z.literal(2).optional(),
      kind: z.enum(["goal", "condition", "result"]),
      quote: z.string().min(1).max(320),
      lineIds: z.array(journalText),
      supersedes: journalText.optional(),
      id: journalText,
      at: journalTime,
      sceneId: journalText,
      submissionId: journalText,
      supersededBy: journalText.optional(),
      conditionRevision: z.number().int().nonnegative().optional(),
    })
    .strict();
const journalProof = z
  .object({
    id: journalText,
    speakerId: z.string(),
    name: z.string(),
    content: z.string().min(1).max(1200),
    kind: z.string().optional(),
    current: z.boolean().optional(),
    at: journalTime.optional(),
    sceneId: journalText,
    submissionId: journalText,
  })
  .strict();
export function readWishGoalJournal(value: unknown): WishGoalJournal | undefined {
  return value === undefined
    ? undefined
    : z
        .object({ facts: z.array(journalFact), evidence: z.array(journalProof) })
        .strict()
        .parse(value);
}
const factKinds = ["goal", "condition", "result"];
export function wishJournal(state: VillageState, actorId: string, wishId: string): WishGoalJournal | undefined {
  const resident = state.villagers.find((row) => row.characterId === actorId);
  const wish =
    resident?.agenda?.wishes.find((row) => row.id === wishId) ??
    resident?.completedWishes?.find((row) => row.wish.id === wishId)?.wish ??
    resident?.wishLifecycle?.pendingOutcomes.find((row) => row.wish.id === wishId)?.wish;
  return wish?.goalJournal;
}
/** Public history comes solely from independently eligible player Memories. */
export function knownWishes(state: VillageState, actorId: string): KnownWish[] {
  const grouped = new Map<string, KnownWish>();
  const titles = new Map<string, string>();
  for (const row of projectMemories(state.memories, ["player"])
    .filter((row) => row.domainRef?.kind === "wish" && row.domainRef.characterId === actorId)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id))) {
    const fields = row.knowers.player!.disclosed;
    const prior = grouped.get(row.domainRef!.id);
    const status = fields?.status;
    if (typeof fields?.title === "string") titles.set(row.domainRef!.id, fields.title);
    grouped.set(row.domainRef!.id, {
      wishId: row.domainRef!.id,
      text: titles.get(row.domainRef!.id) ?? row.text,
      learnedAt: row.knowers.player!.learnedAt,
      lineIds: [],
      ...(prior?.status ? { status: prior.status } : {}),
      ...(["active", "fulfilled", "expired", "retired"].includes(String(status))
        ? { status: status as KnownWish["status"] }
        : {}),
      facts: [
        ...(prior?.facts ?? []),
        {
          id: row.id,
          kind: String(row.knowers[actorId]?.disclosed?.kind ?? row.kind),
          quote: row.text,
          at: row.occurredAt,
          sceneId: "",
          lineIds: [],
        },
      ],
    });
  }
  return [...grouped.values()];
}
export function knownWish(state: VillageState, actorId: string, wishId: string) {
  return knownWishes(state, actorId).find((row) => row.wishId === wishId);
}
export function rememberWishEvidence(
  entry: WishGoalJournal,
  evidence: InterpretationEvidence[],
  sceneId: string,
  submissionId: string,
): void {
  for (const line of evidence)
    if (
      line.kind !== "claim" &&
      line.kind !== "receipt" &&
      line.content &&
      !entry.evidence.some((old) => old.id === line.id && old.sceneId === sceneId)
    )
      entry.evidence.push({ ...line, content: line.content.slice(0, 1200), current: false, sceneId, submissionId });
}
/** Only exact resident speech can establish personal preferences or conditions. */
export function bindWishFacts(
  value: unknown,
  actorId: string,
  lines: VenueLine[],
  resolve: (ref: unknown) => string,
  semantic = false,
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
      !semantic &&
      kind === "condition" &&
      (/\b(?:only way|only solution)\b/iu.test(quote) ||
        !/\b(?:only|must|unless|require|need\b.{0,60}\bbefore|won['’]t\b.{0,60}\bwithout)\b/iu.test(quote) ||
        /\b(?:perhaps|maybe|quoted|said that)\b/iu.test(quote))
    )
      return [];
    return [
      {
        ...(semantic ? { semanticVersion: 2 as const } : {}),
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
  const entry = (wish.goalJournal ??= { facts: [], evidence: [] });
  if (!entry) return 0;
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
        (candidate.semanticVersion !== 2 &&
          !/\b(?:actually|instead|no longer|changed my mind|don[’']t need|do not need|not necessary|forget|rather)\b/iu.test(
            candidate.quote,
          )))
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
    if (["goal", "condition"].includes(candidate.kind) || (prior && ["goal", "condition"].includes(prior.kind)))
      fact.conditionRevision = wish.conditionRevision = (wish.conditionRevision ?? 0) + 1;
    added++;
  }
  return added;
}
export function wishConditionRevision(state: VillageState, actorId: string, wish: VillageWish, asOf?: string): number {
  if (!asOf) return wish.conditionRevision ?? 0;
  return Math.max(
    0,
    ...(wishJournal(state, actorId, wish.id)?.facts ?? [])
      .filter((fact) => fact.at <= asOf)
      .map((fact) => fact.conditionRevision ?? 0),
  );
}
export function wishCheckKnowledge(state: VillageState, actorId: string, wishId: string, asOf?: string) {
  const entry = wishJournal(state, actorId, wishId);
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
    discoveries: [
      ...active
        .filter((fact) => fact.kind === "goal")
        .map((fact) => ({ kind: fact.kind, quote: fact.quote, at: fact.at })),
      ...projectMemories(state.memories, [actorId])
        .filter(
          (row) => row.domainRef?.kind === "wish" && row.domainRef.id === wishId && (!asOf || row.occurredAt <= asOf),
        )
        .map((row) => ({
          kind: String(row.knowers[actorId]?.disclosed?.kind ?? row.kind),
          quote: row.text,
          at: row.occurredAt,
        })),
    ],
    evidence: (entry?.evidence ?? [])
      .filter((line) => !asOf || (!!line.at && line.at <= asOf))
      .slice(-16)
      .map((line) => ({ ...line, current: false })),
  };
}
