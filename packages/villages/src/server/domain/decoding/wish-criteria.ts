import type { WishCriteria } from "../models/wish-interpretation-model.js";
import type { VillageWish } from "../models/world.js";
import { asRecord, asTrimmedString } from "../rules/coerce.js";

export function coerceWishApplicationProof(value: unknown): {
  fingerprint: string;
  criteria: WishCriteria;
  receiptIds: string[];
} {
  const row = asRecord(value),
    criteria = readWishCriteria({ ...asRecord(row.criteria), complete: true }, { wish: "" } as VillageWish);
  return {
    fingerprint: /^[a-f0-9]{64}$/u.test(asTrimmedString(row.fingerprint))
      ? asTrimmedString(row.fingerprint)
      : "invalid",
    criteria: criteria || { kind: "complex", goal: "Invalid stored proof", requiresPhysical: true },
    receiptIds: Array.isArray(row.receiptIds)
      ? row.receiptIds.filter((id): id is string => typeof id === "string" && id.length <= 200).slice(0, 200)
      : [],
  };
}
export function readWishCriteria(value: unknown, wish: VillageWish): WishCriteria | null {
  const row = asRecord(value);
  if (
    row.complete !== true ||
    !["conversation", "transfer", "action", "complex"].includes(String(row.kind)) ||
    typeof row.requiresPhysical !== "boolean" ||
    !asTrimmedString(row.goal) ||
    asTrimmedString(row.goal).length > 1000
  )
    return null;
  const kind = row.kind as WishCriteria["kind"];
  if (kind === "conversation" && row.requiresPhysical !== false) return null;
  if ((kind === "transfer" || kind === "action") && row.requiresPhysical !== true) return null;
  if (kind === "transfer" && !asTrimmedString(row.itemName)) return null;
  if (
    kind === "action" &&
    (!["item-added", "item-removed", "trace-resolved"].includes(String(row.predicate)) || !asTrimmedString(row.target))
  )
    return null;
  return {
    kind,
    conditionRevision: Number.isSafeInteger(row.conditionRevision) ? Number(row.conditionRevision) : 0,
    conditionAt: asTrimmedString(row.conditionAt) || undefined,
    goal: asTrimmedString(row.goal) || wish.wish,
    requiresPhysical: row.requiresPhysical,
    itemName: asTrimmedString(row.itemName).slice(0, 200),
    predicate: row.predicate as WishCriteria["predicate"],
    target: asTrimmedString(row.target).slice(0, 200),
    venueId: asTrimmedString(row.venueId),
  };
}
