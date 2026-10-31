import type { RelationshipState } from "../models/relationship-types.js";
import type { BackgroundInput } from "../models/background-model.js";
import type { SocialOutboxEntry } from "../models/social-outbox-model.js";
import type { ReturnCatchupCapture, VillageState, VillageVillager } from "../models/world.js";
import { coerceRelationshipState, immutableRelationshipState } from "./relationship-rules.js";
import { blockWishHistory, copySocialWishes, immutableSocialWishes, wishHistoryLoaded } from "./social-wishes.js";
import { isImmutableMemoryValue, memoryRequire } from "./memory-integrity.js";

/** Receipt metadata is mutable; exact Wish after-images share immutable leaves. */
export function copyExchangeReceipts(receipts: VillageState["exchangeReceipts"]): VillageState["exchangeReceipts"] {
  return Object.fromEntries(
    Object.entries(receipts).map(([id, receipt]) => {
      const wish = receipt.sceneFacts?.wish;
      if (!wish) return [id, structuredClone(receipt)];
      memoryRequire(!Object.hasOwn(wish, "head"), "Wish after-images require explicit hydration");
      const copy = structuredClone({
        ...receipt,
        sceneFacts: { ...receipt.sceneFacts, wish: undefined as typeof wish | undefined },
      });
      copy.sceneFacts.wish = isImmutableMemoryValue(wish as unknown)
        ? wish
        : { ...wish, ...(wish.value ? { value: immutableSocialWishes([wish.value])[0] } : {}) };
      return [id, copy];
    }),
  );
}

/** Clone mutable world facts while sharing verified immutable history leaves. */
export function cloneWorldContext<
  T extends {
    relationshipContext?: RelationshipState;
    villagers?: VillageVillager[];
    exchangeReceipts?: VillageState["exchangeReceipts"];
  },
>(value: T): T {
  const { relationshipContext, villagers, exchangeReceipts, ...facts } = value;
  const result = structuredClone(facts) as T;
  if (exchangeReceipts) result.exchangeReceipts = copyExchangeReceipts(exchangeReceipts);
  if (villagers)
    result.villagers = villagers.map((resident) => {
      // Frozen-context revisions include field order.
      const fields = Object.fromEntries(
        Object.entries(resident).map(([key, value]) => [key, key === "wishes" ? undefined : value]),
      );
      const copy = structuredClone(fields) as VillageVillager;
      if (wishHistoryLoaded(resident)) copy.wishes = copySocialWishes(immutableSocialWishes(resident.wishes));
      else blockWishHistory(copy);
      return copy;
    });
  if (relationshipContext)
    result.relationshipContext = immutableRelationshipState(relationshipContext.seed, relationshipContext);
  return result;
}

export function cloneReturnCapture(capture: ReturnCatchupCapture): ReturnCatchupCapture {
  return { ...structuredClone({ ...capture, world: undefined }), world: cloneWorldContext(capture.world) };
}

export function captureResidentActivity(world: VillageState, catchup = false) {
  return cloneWorldContext({
    seed: world.seed,
    setupAt: world.setupAt,
    villagers: world.villagers,
    venues: world.venues,
    residences: world.residences,
    projects: world.projects,
    timeZone: world.timeZone,
    narrative: world.narrative,
    ...(catchup ? { opening: world.opening } : {}),
  });
}
export function copySocialOutboxEntry(entry: SocialOutboxEntry): SocialOutboxEntry {
  const { admitted, relationshipSnapshot, ...facts } = entry;
  return {
    ...structuredClone(facts),
    ...(admitted ? { admitted: cloneWorldContext(admitted) } : {}),
    ...(relationshipSnapshot
      ? { relationshipSnapshot: immutableRelationshipState(entry.seed, relationshipSnapshot) }
      : {}),
  };
}

/** Snapshot mutable admission facts before asynchronous publication, sharing exact immutable history. */
export function copyBackgroundWork(work: BackgroundInput): BackgroundInput {
  const raw = work.input as any;
  const facts = structuredClone({ ...work, input: undefined });
  if (!raw || !["resident-planning", "personal-mail", "social-recovery"].includes(work.kind))
    return { ...facts, input: structuredClone(raw) };
  if (work.kind === "social-recovery") {
    if (Object.hasOwn(raw, "socialHead")) return { ...facts, input: structuredClone(raw) };
    const { entry, social, ...input } = raw;
    return {
      ...facts,
      input: {
        ...structuredClone(input),
        entry: copySocialOutboxEntry(entry),
        social: social ? immutableRelationshipState(work.seed, social) : undefined,
      },
    };
  }
  if (raw.admitted?.admissionFormat === 1) return { ...facts, input: structuredClone(raw) };
  const { admitted, context, ...input } = raw;
  const copy: any = { ...structuredClone(input), admitted: admitted ? cloneWorldContext(admitted) : admitted };
  if (context) {
    const { residents, social, ...metadata } = context;
    copy.context = structuredClone(metadata);
    if (residents)
      copy.context.residents = residents.map((row: any) => {
        const { wishes, ...metadata } = row;
        return {
          ...structuredClone(metadata),
          ...(wishes ? { wishes: copySocialWishes(immutableSocialWishes(wishes)) } : {}),
        };
      });
    if (social) {
      const { state, ...metadata } = social;
      copy.context.social = {
        ...structuredClone(metadata),
        ...(Object.hasOwn(social, "state")
          ? { state: state ? immutableRelationshipState(work.seed, state) : undefined }
          : {}),
      };
    }
  }
  return { ...facts, input: copy };
}

/** Historical projections must not duplicate either the live ledger or the departure ledger. */
export function cloneVillageContext(value: VillageState): VillageState {
  const { returnCatchup, ...facts } = value;
  const result = cloneWorldContext(facts) as VillageState;
  if (result.relationshipContext)
    result.relationshipContext = coerceRelationshipState(result.relationshipContext.seed, result.relationshipContext);
  if (returnCatchup) {
    result.returnCatchup = structuredClone({ ...returnCatchup, capture: undefined });
    if (returnCatchup.capture) result.returnCatchup.capture = cloneReturnCapture(returnCatchup.capture);
  }
  return result;
}

/** JSON object absence and own undefined have the same persisted meaning. Shared immutable leaves are constant work. */
export function sameRelationshipContext(a: RelationshipState | undefined, b: RelationshipState | undefined): boolean {
  const same = (left: any, right: any): boolean => {
    if (left === right) return true;
    if (!left || !right || typeof left !== "object" || typeof right !== "object") return false;
    if (Array.isArray(left) || Array.isArray(right))
      return (
        Array.isArray(left) &&
        Array.isArray(right) &&
        left.length === right.length &&
        left.every((v, i) => same(v, right[i]))
      );
    const keys = Object.keys(left).filter((key) => left[key] !== undefined);
    return (
      keys.length === Object.keys(right).filter((key) => right[key] !== undefined).length &&
      keys.every((key) => Object.hasOwn(right, key) && same(left[key], right[key]))
    );
  };
  return same(a, b);
}
