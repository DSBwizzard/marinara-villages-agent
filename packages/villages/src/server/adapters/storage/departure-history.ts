import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VillageState } from "../../domain/models/world.js";
import type { RelationshipState } from "../../domain/models/relationship-types.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { immutableRelationshipState } from "../../domain/rules/relationship-rules.js";
import {
  assertRelationshipWorld,
  readRelationshipHead,
  readRelationshipRoot,
  relationshipDocumentId,
  relationshipPayloadStore,
  validateRelationshipHistory,
  type RelationshipHistoryOwner,
} from "./relationship-payload-store.js";

const associations = new WeakMap<RelationshipState, RelationshipHistoryOwner>();
/** The only historical relationship owner inside a native World is its explicit departure capture. */
export function departureHistoryOwner(
  value: unknown,
): (Omit<RelationshipHistoryOwner, "head"> & { head: RelationshipHistoryOwner["head"] | null }) | undefined {
  memoryObject(value);
  memoryRequire(
    value.version === 10 && typeof value.seed === "string" && typeof value.setupAt === "string",
    "unsupported Village ownership; start a fresh Village",
  );
  if (value.returnCatchup === undefined) return undefined;
  memoryObject(value.returnCatchup);
  const capture = value.returnCatchup.capture;
  if (capture === undefined) return undefined;
  memoryObject(capture, ["at", "memoryRevision", "world"]);
  memoryObject(capture.world);
  const world = capture.world;
  memoryRequire(
    world.seed === value.seed &&
      world.setupAt === value.setupAt &&
      typeof capture.at === "string" &&
      Number.isFinite(Date.parse(capture.at)) &&
      Number.isSafeInteger(capture.memoryRevision) &&
      capture.memoryRevision >= 0 &&
      !Object.hasOwn(world, "relationshipContext") &&
      Object.hasOwn(world, "relationshipHead"),
    "invalid departure history ownership",
  );
  const scope = { seed: value.seed, setupAt: value.setupAt };
  const head = world.relationshipHead === null ? null : readRelationshipHead(world.relationshipHead);
  if (head) assertRelationshipWorld(head, scope);
  return { scope, head };
}
export async function validateDepartureHistory(documents: Pick<CapabilityDocumentStore, "getById">, worlds: unknown[]) {
  const owners: RelationshipHistoryOwner[] = [];
  for (const world of worlds) {
    const owner = departureHistoryOwner(world);
    if (owner?.head) owners.push({ scope: owner.scope, head: owner.head });
  }
  await validateRelationshipHistory(documents, owners);
}

export function createDepartureHistory(documents: CapabilityDocumentStore) {
  const payloads = relationshipPayloadStore(documents);
  async function decode(value: unknown): Promise<Record<string, any>> {
    const captured = departureHistoryOwner(value);
    const raw = value as Record<string, any>;
    if (!captured) return raw;
    const body = captured.head ? await payloads.readSnapshot(captured.head, captured.scope) : undefined;
    if (body && captured.head) associations.set(body, { scope: captured.scope, head: captured.head });
    const { relationshipHead: _head, ...world } = raw.returnCatchup.capture.world;
    return {
      ...raw,
      returnCatchup: {
        ...raw.returnCatchup,
        capture: { ...raw.returnCatchup.capture, world: { ...world, ...(body ? { relationshipContext: body } : {}) } },
      },
    };
  }
  async function encode(state: VillageState, previous?: unknown) {
    const capture = state.returnCatchup?.capture;
    if (!capture) return state.returnCatchup;
    const scope = { seed: capture.world.seed, setupAt: capture.world.setupAt };
    memoryRequire(scope.seed === state.seed && scope.setupAt === state.setupAt, "departure belongs to another world");
    const before = previous ? departureHistoryOwner(previous) : undefined;
    const body = capture.world.relationshipContext;
    let head: RelationshipHistoryOwner["head"] | null = null;
    if (body) {
      const frozen = immutableRelationshipState(scope.seed, body),
        known = associations.get(frozen);
      if (
        known &&
        before?.head &&
        known.scope.seed === scope.seed &&
        known.scope.setupAt === scope.setupAt &&
        known.head.id === before.head.id &&
        known.head.digest === before.head.digest
      ) {
        await payloads.readSnapshot(known.head, scope);
        head = known.head;
      } else {
        const live = await documents.getById("villages", relationshipDocumentId(scope.seed));
        memoryRequire(
          !live ||
            (live.id === relationshipDocumentId(scope.seed) &&
              live.packageId === "villages" &&
              live.kind === "relationships"),
          "invalid live relationship owner identity",
        );
        const current = live ? readRelationshipRoot(live.data, scope).head : undefined;
        head = await payloads.prepare(frozen, scope, current);
      }
      associations.set(frozen, { scope, head });
      capture.world.relationshipContext = frozen;
    }
    const { relationshipContext: _body, ...facts } = capture.world;
    const result = { ...state.returnCatchup, capture: { ...capture, world: { ...facts, relationshipHead: head } } };
    departureHistoryOwner({ ...state, returnCatchup: result });
    return result;
  }
  return { decode, encode };
}
