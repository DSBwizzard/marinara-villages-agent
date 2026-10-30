import type { RelationshipState } from "../models/relationship-types.js";
import type { ReturnCatchupCapture, VillageState } from "../models/world.js";
import { coerceRelationshipState, immutableRelationshipState } from "./relationship-rules.js";

/** Clone mutable world facts while retaining only a verified immutable relationship body. */
export function cloneWorldContext<T extends { relationshipContext?: RelationshipState }>(value: T): T {
  const { relationshipContext, ...facts } = value;
  const result = structuredClone(facts) as T;
  if (relationshipContext)
    result.relationshipContext = immutableRelationshipState(relationshipContext.seed, relationshipContext);
  return result;
}

export function cloneReturnCapture(capture: ReturnCatchupCapture): ReturnCatchupCapture {
  return { ...structuredClone({ ...capture, world: undefined }), world: cloneWorldContext(capture.world) };
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
