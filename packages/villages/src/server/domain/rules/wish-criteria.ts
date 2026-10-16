import { asRecord } from "./coerce.js";
import type { WishCriteria } from "../models/wish-interpretation-model.js";

export function readSemanticWishCriteria(value: unknown, goal: string): WishCriteria | undefined {
  const row = asRecord(value);
  if (
    !["conversation", "transfer", "action", "complex"].includes(String(row.kind)) ||
    typeof row.requiresPhysical !== "boolean"
  )
    return undefined;
  if (["transfer", "action"].includes(String(row.kind)) && row.requiresPhysical !== true) return undefined;
  if (
    row.kind === "conversation" &&
    (row.requiresPhysical || row.itemName !== undefined || row.predicate !== undefined || row.target !== undefined)
  )
    return undefined;
  if (row.kind === "transfer" && (typeof row.itemName !== "string" || !row.itemName)) return undefined;
  if (
    row.kind === "action" &&
    (!["item-added", "item-removed", "trace-resolved"].includes(String(row.predicate)) ||
      typeof row.target !== "string" ||
      !row.target.trim())
  )
    return undefined;
  return {
    semanticVersion: 2,
    kind: row.kind as WishCriteria["kind"],
    goal,
    requiresPhysical: row.requiresPhysical,
    ...(typeof row.itemName === "string" ? { itemName: row.itemName } : {}),
    ...(typeof row.target === "string" ? { target: row.target } : {}),
    ...(typeof row.venueId === "string" ? { venueId: row.venueId } : {}),
    ...(row.kind === "action" ? { predicate: row.predicate as WishCriteria["predicate"] } : {}),
  };
}
