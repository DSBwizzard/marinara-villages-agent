import { createHash } from "node:crypto";
import { z } from "zod";
import type { SocialWish, WishDisclosure } from "../../../shared/contracts/wishes.js";
import type { VillageState, VillageVillager } from "../models/world.js";
import { rememberDomainFact } from "./domain-memories.js";
import { projectMemories } from "./memory-views.js";
import { immutableMemoryValue } from "./memory-integrity.js";

const text = z.string().trim().min(1).max(320);
const attention = z.object({ state: z.enum(["background", "foreground"]), reason: text }).strict();
const candidate = z.object({ wish: text, reason: text }).strict();
const change = z
  .object({
    actorId: z.string().min(1),
    wishId: z.string().min(1),
    intent: z.enum(["create", "reveal", "clarify", "approach", "attention", "progress", "fulfilled", "withdrawn"]),
    evidence: z
      .array(z.union([z.string().min(1), z.number().int().nonnegative()]))
      .min(1)
      .max(8),
    desire: candidate.optional(),
    attention: attention.optional(),
    approach: z.string().trim().max(320).optional(),
    condition: text.optional(),
    quote: text.optional(),
    supersedes: z.string().min(1).optional(),
    reason: text,
    fulfilled: z.boolean().optional(),
    disclosedStatus: z.enum(["open", "fulfilled", "withdrawn"]).optional(),
    statusQuote: text.optional(),
  })
  .strict();
export type SocialWishChange = z.infer<typeof change>;
export class WishInterpretationError extends Error {}
export function readSocialWishChanges(value: unknown): SocialWishChange[] {
  try {
    return z.array(change).max(16).parse(value);
  } catch (error) {
    throw new WishInterpretationError("Invalid social Wish interpretation.", { cause: error });
  }
}
export type WishLine = {
  id: string;
  speakerId: string;
  content: string;
  heardBy: string[];
  playerHeard?: boolean;
  contactHidden?: boolean;
  kind?: string;
  contactReport?: boolean;
};
const authorityOwner = z
  .object({
    actorId: z.string().min(1),
    capturedAt: z.string(),
    creationFingerprint: z
      .string()
      .regex(/^[a-f0-9]{32}$/)
      .optional(),
    expected: z.array(
      z.object({ wishId: z.string().min(1), fingerprint: z.string().regex(/^[a-f0-9]{32}$/) }).strict(),
    ),
  })
  .strict();
const wishAuthority = z.object({ version: z.literal(1), owners: z.array(authorityOwner) }).strict();
export type WishAuthority = z.infer<typeof wishAuthority>;
export function readWishAuthority(value: unknown): WishAuthority {
  const parsed = wishAuthority.parse(value);
  if (
    new Set(parsed.owners.map((owner) => owner.actorId)).size !== parsed.owners.length ||
    parsed.owners.some((owner) => new Set(owner.expected.map((wish) => wish.wishId)).size !== owner.expected.length)
  )
    throw new WishInterpretationError("Ambiguous saved Wish authority.");
  return parsed;
}
/** Application needs exact guards, while model reinterpretation owns its separate complete frozen context. */
export function captureWishAuthority(
  residents: { characterId: string; cardSnapshot: { capturedAt: string }; wishes: SocialWish[] }[],
  changes: SocialWishChange[],
): WishAuthority {
  const actorIds = [...new Set(changes.map((row) => row.actorId))];
  return readWishAuthority({
    version: 1,
    owners: actorIds.flatMap((actorId) => {
      const owner = residents.find((resident) => resident.characterId === actorId);
      if (!owner) return [];
      const targets = new Set(changes.filter((row) => row.actorId === actorId).map((row) => row.wishId));
      return [
        {
          actorId,
          capturedAt: owner.cardSnapshot.capturedAt,
          ...(changes.some((row) => row.actorId === actorId && row.intent === "create")
            ? { creationFingerprint: hash(owner.wishes) }
            : {}),
          expected: owner.wishes
            .filter((wish) => targets.has(wish.id))
            .map((wish) => ({ wishId: wish.id, fingerprint: wishFingerprint(wish) })),
        },
      ];
    }),
  });
}
export type WishSource = {
  id: string;
  kind: SocialWish["origin"]["kind"];
  at: string;
  recordedAt: string;
  lines: WishLine[];
  currentLineIds: string[];
  changes: unknown;
  /** Authority captured before this source was written or interpreted. */
  authority: WishAuthority;
  learn: boolean;
};
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 32);
export const wishKey = (value: string) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export const wishFingerprint = (wish: SocialWish) =>
  hash([wish.id, wish.revision, wish.wish, wish.status, wish.conditions]);

export const SOCIAL_WISH_INSTRUCTION = `Return wishChanges:[] or social Wish changes. Each row is {actorId,wishId,intent:"create|reveal|clarify|approach|attention|progress|fulfilled|withdrawn",evidence:[exact current source IDs or indexes],reason:"brief grounded meaning"}.
Wishes are resident-owned concrete desired social outcomes. Admit actual current wants deserving continuity, including small ordinary experiences. Interests, hypothetical preferences, polite agreement and player suggestions alone do not establish the resident's desire. Quiet results are valid. Preserve whole character, current circumstances and independent agency. Only social conversations/shared experiences/relationships belong in this pass; no housing, construction, possessions, jobs or skills. Never invent people, history, emergencies, obligations or player participation.
Create uses wishId:"new:local-key",desire:{wish:"short neutral desired outcome",reason:"grounded significance"}. Create/reveal additionally require quote:"exact short owner words communicating this desire". Public learning retains only this quotation, never fills gaps with private goal wording. Reveal may include disclosedStatus:"open|fulfilled|withdrawn" and statusQuote:"exact current owner words explicitly communicating that status" ONLY when those words actually communicate that current status; omit it when only the desire is communicated. A closed private outcome never becomes public merely because the desire was mentioned. Reuse an existing ID for the same unmet desire; never paraphrase it into a second Wish. One source may create and satisfy a Wish using fulfilled:true ONLY when its actual outcome is established in this source. It can then be referenced by the same new:local-key. No prescribed routes, secret preferences, intensity scores, size classes, expiry rolls or required player help.
Existing rows use exact supplied IDs and their complete captured conditions/history. Reveal means the owner actually communicates the desire; player learning is separately bound to perception. Clarify may include condition:"exact owner quotation" and supersedes:"exact earlier condition ID" only for an explicitly essential condition or its genuine correction, prospectively. A different desired outcome is a new Wish; withdraw the old one only when the owner actually stops wanting it. Ending one approach does not withdraw a desire.
Approach requires approach:string (empty means stop this attempt); it records the owner's actual chosen response, not instructions or mandatory steps. Attention requires attention:{state:"background|foreground",reason}; retention alone never demands attention. Most conversations have no Wish relevance. A sustained preoccupation needs grounded character/circumstance support. No principal-Wish quota. Existing approaches, refusals and history matter: repeated solicitation needs a genuinely new reason, not merely an open Wish.
Progress/fulfilled require actual new witnessed interaction establishing the desired outcome, every applicable essential condition, and any specified participant/channel. An invitation, accepted plan, promise, gratitude, claim or elapsed time alone is not the requested shared experience. Apologizing differs from being forgiven. Other participants decide independently; cite their actual response where necessary. Never invent affection or automatic rewards. NPC-only interaction can fulfill a Wish without player participation or knowledge. Evidence must be heard by the owner and cite at least one current line. Owner-only claims about an earlier event do not prove that earlier event; earlier supplied history may support conditions but cannot replace new evidence. No unsupported physical results. For fulfilled reason briefly identifies the outcome actually established.`;

const savedWishCondition = z
  .object({
    id: z.string(),
    quote: text,
    at: z.string().datetime(),
    sourceId: z.string(),
    lineIds: z.array(z.string()),
  })
  .strict();
const savedWishHistory = z
  .object({
    id: z.string(),
    at: z.string().datetime(),
    kind: z.string(),
    text,
    sourceId: z.string(),
    lineIds: z.array(z.string()),
  })
  .strict();
const savedSocialWishHeader = z
  .object({
    id: z.string().min(1),
    revision: z.number().int().positive(),
    wish: text,
    reason: text,
    status: z.enum(["open", "fulfilled", "withdrawn"]),
    addedAt: z.string().datetime(),
    changedAt: z.string().datetime(),
    origin: z
      .object({
        kind: z.enum(["preparation", "scene", "encounter", "mail", "reflection"]),
        sourceId: z.string().min(1),
        lineIds: z.array(z.string()),
      })
      .strict(),
    attention,
    approach: z.string().max(320),
  })
  .strict();
const savedSocialWish = savedSocialWishHeader.extend({
  conditions: z.array(savedWishCondition),
  history: z.array(savedWishHistory),
});
export function readSocialWish(value: unknown): SocialWish {
  return savedSocialWish.parse(value);
}

const frozenWishes = new WeakSet<object>();
const frozenWishCollections = new WeakSet<object>();
const conditionValues = new WeakSet<object>();
const historyValues = new WeakSet<object>();
const collectionSources = new WeakMap<SocialWish[], SocialWish[]>();
function sharedSocialWish(source: SocialWish) {
  if (frozenWishes.has(source)) return source;
  const { conditions, history, ...fields } = source;
  if (!Array.isArray(conditions) || !Array.isArray(history)) return readSocialWish(source);
  return {
    ...savedSocialWishHeader.parse(fields),
    conditions: conditions.map((row) => (conditionValues.has(row) ? row : savedWishCondition.parse(row))),
    history: history.map((row) => (historyValues.has(row) ? row : savedWishHistory.parse(row))),
  };
}
export function immutableSocialWishes(value: SocialWish[]): SocialWish[] {
  if (frozenWishCollections.has(value)) return value;
  const source = collectionSources.get(value);
  if (source && value.length === source.length && value.every((wish, index) => wish === source[index])) return source;
  const result = value.map((source) => {
    if (frozenWishes.has(source)) return source;
    const wish = sharedSocialWish(source);
    const frozen = immutableMemoryValue(wish);
    for (const row of frozen.conditions) conditionValues.add(row);
    for (const row of frozen.history) historyValues.add(row);
    frozenWishes.add(frozen);
    return frozen;
  });
  const frozen = immutableMemoryValue(result);
  frozenWishCollections.add(frozen);
  return frozen;
}
export function copySocialWishes(value: unknown): SocialWish[] {
  if (!Array.isArray(value)) return [];
  if (!frozenWishCollections.has(value) && !collectionSources.has(value)) return value.map(readSocialWish);
  const result = value.map(sharedSocialWish);
  collectionSources.set(result, collectionSources.get(value) ?? value);
  return result;
}
export function socialWishCollectionSource(value: SocialWish[]) {
  return collectionSources.get(value) ?? value;
}
export function mutableSocialWish(value: SocialWish): SocialWish {
  return {
    ...value,
    attention: { ...value.attention },
    conditions: [...value.conditions],
    history: [...value.history],
  };
}
function unavailableWishes(): never {
  throw new Error("Wishes were not loaded for this operation.");
}
export function blockWishHistory(owner: { wishes: SocialWish[] }) {
  Object.defineProperty(owner, "wishes", {
    configurable: true,
    enumerable: false,
    get: unavailableWishes,
    set: unavailableWishes,
  });
}
export function wishHistoryLoaded(owner: { wishes: SocialWish[] }) {
  return Object.getOwnPropertyDescriptor(owner, "wishes")?.get !== unavailableWishes;
}

export function newSocialWish(
  desire: { wish: string; reason: string },
  id: string,
  at: string,
  origin: SocialWish["origin"],
): SocialWish {
  return readSocialWish({
    id,
    revision: 1,
    ...candidate.parse(desire),
    status: "open",
    addedAt: at,
    changedAt: at,
    origin,
    attention: { state: "background", reason: "Available when relevant." },
    approach: "",
    conditions: [],
    history: [],
  });
}

export function publishWishDisclosure(state: VillageState, fact: WishDisclosure, recordedAt: string): void {
  rememberDomainFact(state, {
    id: fact.id + ":player",
    at: fact.at,
    recordedAt,
    text: fact.text,
    knowers: ["player"],
    subjects: [fact.actorId],
    domainRef: { kind: "wish", id: fact.wishId, characterId: fact.actorId },
    disclosed: { title: fact.title, ...(fact.status ? { status: fact.status } : {}) },
  });
}

/** One atomic authority mutation. Purchased meaning is replayed from the original immutable source. */
export function applyWishSource(
  state: VillageState,
  source: WishSource,
): { receiptIds: string[]; disclosures: WishDisclosure[] } {
  const rows = readSocialWishChanges(source.changes);
  const receiptIds: string[] = [],
    disclosures: WishDisclosure[] = [];
  const aliases = new Map<string, string>();
  const disclosedHere = new Map<string, string>();
  const authority = readWishAuthority(source.authority);
  const creationBaselines = new Map(authority.owners.map((owner) => [owner.actorId, owner.creationFingerprint]));
  const expected = new Map(
    authority.owners.flatMap((owner) =>
      owner.expected.map((wish) => [owner.actorId + ":" + wish.wishId, wish.fingerprint] as const),
    ),
  );
  const current = new Set(source.currentLineIds);
  for (const row of rows) {
    const local = row.actorId + ":" + row.wishId;
    const wishId =
      aliases.get(local) ??
      (row.intent === "create" ? "wish:" + hash([source.id, row.actorId, row.wishId]) : row.wishId);
    aliases.set(local, wishId);
    const id = "wish-change:" + source.id.replace(":turn:", ":") + ":" + wishId + ":" + hash(row);
    receiptIds.push(id);
    const prior = state.exchangeReceipts[id];
    if (prior) {
      if (prior.wishDisclosures) disclosures.push(...prior.wishDisclosures);
      for (const fact of prior.wishDisclosures ?? []) disclosedHere.set(fact.actorId + ":" + fact.wishId, fact.title);
      continue;
    }
    const resident = state.villagers.find((r) => r.characterId === row.actorId);
    const captured = authority.owners.find((owner) => owner.actorId === row.actorId);
    const refs = row.evidence.map((ref) => (typeof ref === "number" ? source.currentLineIds[ref] : ref));
    const lines = refs.map((ref) => source.lines.find((line) => line.id === ref));
    let wish = resident?.wishes.find((w) => w.id === wishId);
    let rejection = "";
    if (!resident || !captured || resident.cardSnapshot.capturedAt !== captured.capturedAt)
      rejection = "Wish owner changed.";
    else if (
      lines.some((l) => !l || !l.heardBy.includes(row.actorId) || l.contactReport || l.kind === "side") ||
      !refs.some((ref) => current.has(ref))
    )
      rejection = "Wish change lacks current witnessed evidence.";
    else if (
      ["create", "reveal", "clarify", "approach", "attention", "withdrawn"].includes(row.intent) &&
      !lines.some((l) => l?.speakerId === row.actorId && current.has(l.id) && l.kind !== "narration")
    )
      rejection = "Only the owner can establish or change this desire.";
    else if (row.intent === "create" && (!row.wishId.startsWith("new:") || !row.desire))
      rejection = "New Wish has no source-local identity or desire.";
    else if (
      row.intent === "create" &&
      (!captured.creationFingerprint || creationBaselines.get(row.actorId) !== hash(resident.wishes))
    )
      rejection = "Resident desires changed since this source was captured.";
    else if (
      ["create", "reveal"].includes(row.intent) &&
      (!row.quote ||
        !lines.some((l) => l?.speakerId === row.actorId && current.has(l.id) && l.content.includes(row.quote!)))
    )
      rejection = "Wish disclosure lacks the owner's exact communicated desire.";
    else if (
      row.intent !== "create" &&
      (!wish ||
        (row.intent !== "reveal" && wish.status !== "open") ||
        expected.get(row.actorId + ":" + wishId) !== wishFingerprint(wish))
    )
      rejection = "Wish changed since this source was captured.";
    else if (
      row.disclosedStatus &&
      (row.intent !== "reveal" ||
        row.disclosedStatus !== wish?.status ||
        !row.statusQuote ||
        !lines.some((l) => l?.speakerId === row.actorId && current.has(l.id) && l.content.includes(row.statusQuote!)))
    )
      rejection = "Communicated status lacks current owner words or does not match the captured Wish.";
    else if (row.intent === "attention" && !row.attention) rejection = "Attention decision is incomplete.";
    else if (row.intent === "approach" && row.approach === undefined) rejection = "Approach decision is incomplete.";
    else if (
      row.intent === "clarify" &&
      (!row.condition ||
        !lines.some((l) => l?.speakerId === row.actorId && current.has(l.id) && l.content.includes(row.condition!)))
    )
      rejection = "Essential condition lacks the owner's exact words.";
    if (!rejection && resident) {
      if (row.intent === "create") {
        const same = resident.wishes.find((w) => w.status === "open" && wishKey(w.wish) === wishKey(row.desire!.wish));
        if (same && same.id !== wishId) rejection = "This desired outcome already has an open Wish.";
        else if (!wish) {
          wish = newSocialWish(row.desire!, wishId, source.at, {
            kind: source.kind,
            sourceId: source.id,
            lineIds: refs,
          });
          resident.wishes.push(wish);
        }
      }
      if (!rejection && wish) {
        if (frozenWishes.has(wish)) {
          const index = resident.wishes.indexOf(wish);
          wish = mutableSocialWish(wish);
          resident.wishes[index] = wish;
        }
        if (row.intent === "clarify") {
          if (row.supersedes && !wish.conditions.some((c) => c.id === row.supersedes))
            rejection = "The corrected condition is unavailable.";
          else
            wish.conditions = [
              ...wish.conditions.filter((c) => c.id !== row.supersedes),
              { id, quote: row.condition!, at: source.at, sourceId: source.id, lineIds: refs },
            ];
        }
        if (!rejection) {
          if (row.intent !== "reveal") {
            if (row.intent === "attention") wish.attention = row.attention!;
            if (row.intent === "approach") wish.approach = row.approach!;
            if (row.intent === "fulfilled" || (row.intent === "create" && row.fulfilled)) wish.status = "fulfilled";
            if (row.intent === "withdrawn") wish.status = "withdrawn";
            if (
              row.intent === "fulfilled" ||
              row.intent === "withdrawn" ||
              (row.intent === "create" && row.fulfilled)
            ) {
              wish.approach = "";
              wish.attention = { state: "background", reason: row.reason };
            }
            wish.revision++;
            wish.changedAt = source.at;
            wish.history.push({
              id,
              at: source.at,
              kind: row.intent,
              text: row.reason,
              sourceId: source.id,
              lineIds: refs,
            });
          }
          expected.set(row.actorId + ":" + wish.id, wishFingerprint(wish));
          if (captured.creationFingerprint) creationBaselines.set(row.actorId, hash(resident.wishes));
          const ownerText = row.intent === "create" ? wish.wish : (row.condition ?? row.approach ?? row.reason);
          rememberDomainFact(state, {
            id,
            at: source.at,
            recordedAt: source.recordedAt,
            text: ownerText,
            knowers: [row.actorId],
            subjects: [row.actorId],
            domainRef: { kind: "wish", id: wish.id, characterId: row.actorId },
          });
          // Knowledge comes from these exact communicated lines, not private goal wording or the judge's explanation.
          const visible = lines.every(
            (l) => l!.playerHeard === true || (!l!.contactHidden && l!.playerHeard !== false && l!.kind !== "whisper"),
          );
          const communicated =
            ["create", "reveal"].includes(row.intent) &&
            lines.some((l) => l!.speakerId === row.actorId && current.has(l!.id));
          const publicTitle =
            disclosedHere.get(row.actorId + ":" + wish.id) ??
            knownSocialWishes(state, row.actorId).find((w) => w.wishId === wish!.id)?.text;
          const facts: WishDisclosure[] =
            visible && (communicated || publicTitle)
              ? [
                  {
                    id,
                    actorId: row.actorId,
                    wishId: wish.id,
                    title: communicated ? row.quote! : publicTitle!,
                    text: lines
                      .filter((l) => current.has(l!.id))
                      .map((l) => l!.content)
                      .join(" ")
                      .slice(0, 320),
                    status: row.intent === "reveal" ? row.disclosedStatus : wish.status,
                    at: source.at,
                    sourceId: source.id,
                    lineIds: refs,
                  },
                ]
              : [];
          disclosures.push(...facts);
          for (const fact of facts) disclosedHere.set(fact.actorId + ":" + fact.wishId, fact.title);
          if (source.learn) facts.forEach((fact) => publishWishDisclosure(state, fact, source.recordedAt));
          state.exchangeReceipts[id] = {
            id,
            sceneId: source.id.split(":turn:")[0]!,
            submissionId: source.id.split(":turn:")[1] ?? source.id,
            domain: "wishes",
            status: "applied",
            actorId: row.actorId,
            wishId: wish.id,
            at: source.at,
            committedAt: source.recordedAt,
            evidenceIds: refs,
            reason: row.reason,
            wishDisclosures: facts,
            wishOutcome:
              row.intent === "fulfilled" || (row.intent === "create" && row.fulfilled) ? "fulfilled" : undefined,
            wishGoal: wish.wish,
            sceneFacts: { wish: { actorId: row.actorId, wishId: wish.id, value: immutableSocialWishes([wish])[0] } },
            ...(source.learn && facts.length && state.wishFollowing?.[row.actorId + ":" + wish.id] !== false
              ? {
                  notice: {
                    id,
                    kind: "wish",
                    text:
                      row.intent === "reveal"
                        ? "Wish shared"
                        : wish.status === "fulfilled"
                          ? "Wish fulfilled"
                          : wish.status === "withdrawn"
                            ? "Wish withdrawn"
                            : row.intent === "create"
                              ? "Wish shared"
                              : "Wish",
                    detail: facts[0]!.title,
                    wishUpdate: {
                      actorId: row.actorId,
                      wishId: wish.id,
                      state: facts[0]!.status === "fulfilled" ? "fulfilled" : "progress",
                    },
                  },
                }
              : {}),
          };
        }
      }
    }
    if (rejection)
      state.exchangeReceipts[id] = {
        id,
        sceneId: source.id,
        submissionId: source.id,
        domain: "wishes",
        status: "rejected",
        at: source.at,
        committedAt: source.recordedAt,
        evidenceIds: refs.filter(Boolean),
        reason: rejection,
      };
  }
  return { receiptIds, disclosures };
}

export function knownSocialWishes(
  state: VillageState,
  actorId: string,
): import("../../../shared/contracts/wishes.js").KnownWish[] {
  const known = new Map<string, import("../../../shared/contracts/wishes.js").KnownWish>();
  const sequence = new Map(state.memories.records.map((row) => [row.id, row.createdRevision]));
  for (const row of projectMemories(state.memories, ["player"])
    .filter((m) => m.domainRef?.kind === "wish" && m.domainRef.characterId === actorId)
    .sort(
      (a, b) =>
        a.occurredAt.localeCompare(b.occurredAt) ||
        (sequence.get(a.id) ?? 0) - (sequence.get(b.id) ?? 0) ||
        a.id.localeCompare(b.id),
    )) {
    const id = row.domainRef!.id,
      fields = row.knowers.player!.disclosed,
      prior = known.get(id);
    known.set(id, {
      wishId: id,
      text: typeof fields?.title === "string" ? fields.title : (prior?.text ?? row.text),
      at: prior?.at ?? row.knowers.player!.learnedAt,
      status: ["open", "fulfilled", "withdrawn"].includes(String(fields?.status))
        ? (fields!.status as SocialWish["status"])
        : prior?.status,
      followed: state.wishFollowing?.[actorId + ":" + id] !== false,
      facts: [...(prior?.facts ?? []), { id: row.id, text: row.text, at: row.knowers.player!.learnedAt }],
    });
  }
  return [...known.values()];
}

/** A quiet private choice uses the existing resident-planning allowance. It proves no interaction. */
export function applyWishReflection(
  state: VillageState,
  value: unknown,
  sourceId: string,
  at: string,
  captured: VillageVillager[],
): void {
  if (value == null) return;
  const row = z
    .object({
      actorId: z.string().min(1),
      desire: candidate.optional(),
      wishId: z.string().optional(),
      decision: z.enum(["attention", "approach", "withdrawn"]).optional(),
      approach: z.string().trim().max(320).optional(),
      attention: attention.optional(),
      reason: text,
    })
    .strict()
    .parse(value);
  const resident = state.villagers.find((r) => r.characterId === row.actorId),
    original = captured.find((r) => r.characterId === row.actorId);
  if (!resident || !original || resident.cardSnapshot.capturedAt !== original.cardSnapshot.capturedAt) return;
  const id = "wish-reflection:" + hash([sourceId, row.actorId]);
  if (state.exchangeReceipts[id]) return;
  let wish = row.wishId ? resident.wishes.find((w) => w.id === row.wishId && w.status === "open") : undefined;
  if (row.wishId) {
    const prior = original.wishes.find((w) => w.id === row.wishId);
    if (!wish || !prior || wishFingerprint(wish) !== wishFingerprint(prior) || row.desire) return;
    if (frozenWishes.has(wish)) {
      const index = resident.wishes.indexOf(wish);
      wish = mutableSocialWish(wish);
      resident.wishes[index] = wish;
    }
    const decision = row.decision ?? "attention";
    if (decision === "withdrawn") {
      wish.status = "withdrawn";
      wish.approach = "";
      wish.attention = { state: "background", reason: row.reason };
    } else if (decision === "approach" && row.approach !== undefined) {
      if (wish.approach === row.approach) return;
      wish.approach = row.approach;
    } else if (decision === "attention" && row.attention) {
      if (JSON.stringify(wish.attention) === JSON.stringify(row.attention)) return;
      wish.attention = row.attention;
    } else return;
    wish.revision++;
    wish.changedAt = at;
  } else {
    if (
      row.decision ||
      row.approach !== undefined ||
      !row.desire ||
      resident.wishes.some((w) => w.status === "open" && wishKey(w.wish) === wishKey(row.desire!.wish))
    )
      return;
    if (hash(original.wishes) !== hash(resident.wishes)) return;
    wish = newSocialWish(row.desire, "wish:" + hash([sourceId, row.actorId]), at, {
      kind: "reflection",
      sourceId,
      lineIds: [],
    });
    if (row.attention) wish.attention = row.attention;
    resident.wishes.push(wish);
  }
  wish.history.push({ id, at, kind: "reflection", text: row.reason, sourceId, lineIds: [] });
  rememberDomainFact(state, {
    id,
    at,
    recordedAt: at,
    text: row.desire ? wish.wish : row.reason,
    knowers: [row.actorId],
    subjects: [row.actorId],
    domainRef: { kind: "wish", id: wish.id, characterId: row.actorId },
  });
  state.exchangeReceipts[id] = {
    id,
    sceneId: sourceId,
    submissionId: sourceId,
    domain: "wishes",
    actorId: row.actorId,
    wishId: wish.id,
    at,
    committedAt: at,
    status: "applied",
    evidenceIds: [],
    reason: row.reason,
  };
}
