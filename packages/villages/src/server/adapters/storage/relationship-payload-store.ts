import { createHash, randomUUID } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { RelationshipState } from "../../domain/models/relationship-types.js";
import type { VillageState } from "../../domain/models/world.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { coerceRelationshipState, immutableRelationshipState } from "../../domain/rules/relationship-rules.js";
import { VILLAGES_PACKAGE_ID } from "../engine/runtime-host.js";
import { isRepairSimulation } from "./repair-gate.js";
import { MEMORY_PAGE_KIND, type MemoryPageData } from "./memory-pages.js";
import { decodeRelationshipPages, encodeRelationshipPages, type RelationshipPageLayout } from "./relationship-pages.js";

export const RELATIONSHIP_PAYLOAD_KIND = "relationship-payload";
export const RELATIONSHIP_INTENT_KIND = "relationship-payload-intent";
export type RelationshipScope = Pick<VillageState, "seed" | "setupAt">;
export type RelationshipHead = { id: string; digest: string };
export type RelationshipRoot = RelationshipScope & { format: 4; head: RelationshipHead };
const PREFIX = "villages-relationship-history-";
const HEAD = /^villages-relationship-history-([a-f0-9]{32})-([a-f0-9]{64})$/;
export const relationshipDigest = (value: string) => createHash("sha256").update(value).digest("hex");
export const relationshipDocumentId = (seed: string) =>
  "villages-relationships-" + relationshipDigest(seed).slice(0, 24);
export const relationshipWorldKey = (scope: RelationshipScope) =>
  relationshipDigest(JSON.stringify([scope.seed, scope.setupAt])).slice(0, 32);
export function readRelationshipHead(raw: unknown): RelationshipHead {
  memoryObject(raw, ["id", "digest"]);
  memoryRequire(
    typeof raw.id === "string" && HEAD.test(raw.id) && HEAD.exec(raw.id)![2] === raw.digest,
    "invalid relationship history reference",
  );
  return Object.freeze({ id: raw.id, digest: raw.digest }) as RelationshipHead;
}
export function assertRelationshipWorld(head: RelationshipHead, scope: RelationshipScope) {
  memoryRequire(
    head.id.startsWith(PREFIX + relationshipWorldKey(scope) + "-"),
    "relationship history belongs to another world",
  );
}
export function readRelationshipRoot(raw: unknown, expected?: RelationshipScope): RelationshipRoot {
  memoryObject(raw, ["format", "seed", "setupAt", "head"]);
  memoryRequire(
    raw.format === 4 && typeof raw.seed === "string" && typeof raw.setupAt === "string",
    "unsupported relationship storage format; start a fresh Village",
  );
  const head = readRelationshipHead(raw.head);
  const scope = { seed: raw.seed, setupAt: raw.setupAt };
  if (expected)
    memoryRequire(
      expected.seed === scope.seed && expected.setupAt === scope.setupAt,
      "relationship root belongs to another world",
    );
  assertRelationshipWorld(head, scope);
  return { format: 4, ...scope, head };
}
export function readRelationshipOwner(row: { id: string; kind: string; data: unknown }, expected?: RelationshipScope) {
  const root = readRelationshipRoot(row.data, expected);
  memoryRequire(
    row.id === relationshipDocumentId(root.seed) && row.kind === "relationships",
    "invalid relationship owner identity",
  );
  return root;
}
type Row = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
export function relationshipPayloadData(row: { id: string; kind: string; data: unknown }) {
  const identity = HEAD.exec(row.id),
    value = row.data;
  memoryObject(value, ["format", "world", "payload"]);
  memoryRequire(
    row.kind === RELATIONSHIP_PAYLOAD_KIND &&
      identity &&
      value.format === 1 &&
      value.world === identity[1] &&
      typeof value.payload === "string" &&
      relationshipDigest(value.payload) === identity[2],
    "invalid retained relationship payload identity",
  );
  return value as { format: 1; world: string; payload: string };
}
/** One live head and a small set of historical decoded heads can alternate without loading the whole ledger again. */
export function createRelationshipPayloadStore(documents: CapabilityDocumentStore) {
  type Cached = { head: RelationshipHead; value: RelationshipState; layout: RelationshipPageLayout };
  const decoded = new Map<string, Cached>();
  let liveId: string | undefined;
  const usable = () => !isRepairSimulation(documents);
  function cache(value: Cached, live = false) {
    if (!usable()) return;
    const stored = { ...value, head: Object.freeze({ ...value.head }) };
    if (live) liveId = stored.head.id;
    decoded.delete(stored.head.id);
    decoded.set(stored.head.id, stored);
    while (decoded.size > 4) {
      const id = [...decoded.keys()].find((key) => key !== liveId)!;
      decoded.delete(id);
    }
  }
  function validate(
    row: Row,
    head: RelationshipHead,
    scope: RelationshipScope,
  ): asserts row is Row & { data: { format: 1; world: string; payload: string } } {
    assertRelationshipWorld(head, scope);
    memoryRequire(
      row.id === head.id &&
        row.packageId === VILLAGES_PACKAGE_ID &&
        row.kind === RELATIONSHIP_PAYLOAD_KIND &&
        row.revision === 1,
      "relationship payload identity changed",
    );
    memoryObject(row.data, ["format", "world", "payload"]);
    memoryRequire(
      row.data.format === 1 &&
        row.data.world === relationshipWorldKey(scope) &&
        typeof row.data.payload === "string" &&
        relationshipDigest(row.data.payload) === head.digest,
      "relationship payload changed",
    );
  }
  async function load(head: RelationshipHead, scope: RelationshipScope, live = false): Promise<Cached> {
    readRelationshipHead(head);
    assertRelationshipWorld(head, scope);
    const row = await documents.getById(VILLAGES_PACKAGE_ID, head.id);
    memoryRequire(row, "committed relationship history is missing");
    validate(row, head, scope);
    const prior = usable() ? decoded.get(head.id) : undefined;
    if (prior) {
      cache(prior, live);
      return prior;
    }
    const result = await decodeRelationshipPages(
      JSON.parse(row.data.payload),
      relationshipWorldKey(scope),
      async (id) => {
        const page = await documents.getById(VILLAGES_PACKAGE_ID, id);
        memoryRequire(
          page &&
            page.id === id &&
            page.kind === MEMORY_PAGE_KIND &&
            page.packageId === VILLAGES_PACKAGE_ID &&
            page.revision === 1,
          "owned relationship page is missing or changed",
        );
        return page.data as MemoryPageData;
      },
    );
    memoryRequire(result.value.seed === scope.seed, "relationship payload belongs to another Village");
    const value = immutableRelationshipState(scope.seed, result.value),
      entry = { head, value, layout: result.layout };
    cache(entry, live);
    return entry;
  }
  async function read(head: RelationshipHead, scope: RelationshipScope, live = false): Promise<RelationshipState> {
    return coerceRelationshipState(scope.seed, (await load(head, scope, live)).value);
  }
  async function readSnapshot(head: RelationshipHead, scope: RelationshipScope): Promise<RelationshipState> {
    return (await load(head, scope)).value;
  }
  async function prepare(
    value: RelationshipState,
    scope: RelationshipScope,
    previous?: RelationshipHead,
    expectedRevision = 0,
  ): Promise<RelationshipHead> {
    scope = { seed: scope.seed, setupAt: scope.setupAt };
    memoryRequire(value.seed === scope.seed, "relationship publication belongs to another Village");
    if (previous) {
      readRelationshipHead(previous);
      assertRelationshipWorld(previous, scope);
    }
    const frozen = immutableRelationshipState(scope.seed, value);
    // A cache cannot prove that an old, unowned head survived cleanup. A current root
    // protects its pages under this work admission; otherwise encode/materialize every dependency.
    let protectedPrevious = false;
    if (previous) {
      const owner = await documents.getById(VILLAGES_PACKAGE_ID, relationshipDocumentId(scope.seed));
      if (owner?.kind === "relationships" && (owner.data as { format?: unknown })?.format === 4) {
        const root = readRelationshipRoot(owner.data, scope);
        protectedPrevious = root.head.id === previous.id && root.head.digest === previous.digest;
      }
      if (protectedPrevious) {
        const body = await documents.getById(VILLAGES_PACKAGE_ID, previous.id);
        memoryRequire(body, "committed relationship history is missing");
        validate(body, previous, scope);
      }
    }
    const prior = usable() && protectedPrevious && previous ? decoded.get(previous.id) : undefined;
    const result = encodeRelationshipPages(frozen, relationshipWorldKey(scope), prior?.layout);
    const payload = JSON.stringify(result.manifest),
      digest = relationshipDigest(payload);
    const head = Object.freeze({ id: PREFIX + relationshipWorldKey(scope) + "-" + digest, digest });
    if (protectedPrevious && previous?.id === head.id && previous.digest === head.digest) return previous;
    const stamp = new Date().toISOString(),
      intentId = "villages-relationship-intent-" + randomUUID();
    const intent = {
      format: 1,
      scope,
      candidate: head,
      previous: previous ?? null,
      expectedRevision,
      phase: "preparing",
    };
    await documents.create({
      id: intentId,
      packageId: VILLAGES_PACKAGE_ID,
      kind: RELATIONSHIP_INTENT_KIND,
      name: "Relationship publication",
      description: "Unfinished immutable history publication",
      data: intent,
      createdAt: stamp,
      updatedAt: stamp,
    });
    const body = { format: 1, world: relationshipWorldKey(scope), payload };
    const existing = await documents.getById(VILLAGES_PACKAGE_ID, head.id);
    if (existing) validate(existing, head, scope);
    else {
      try {
        await documents.create({
          id: head.id,
          packageId: VILLAGES_PACKAGE_ID,
          kind: RELATIONSHIP_PAYLOAD_KIND,
          name: "Relationships",
          description: "Immutable private relationship and correspondence history",
          data: body,
          createdAt: stamp,
          updatedAt: stamp,
        });
      } catch (error) {
        const concurrent = await documents.getById(VILLAGES_PACKAGE_ID, head.id);
        if (!concurrent) throw error;
        validate(concurrent, head, scope);
      }
    }
    for (const [id, data] of result.pages) {
      const page = await documents.getById(VILLAGES_PACKAGE_ID, id);
      if (page) {
        memoryRequire(
          page.kind === MEMORY_PAGE_KIND &&
            page.revision === 1 &&
            page.packageId === VILLAGES_PACKAGE_ID &&
            JSON.stringify(page.data) === JSON.stringify(data),
          "immutable relationship page changed",
        );
      } else {
        try {
          await documents.create({
            id,
            packageId: VILLAGES_PACKAGE_ID,
            kind: MEMORY_PAGE_KIND,
            name: "Private history page",
            description: "Immutable private history",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
        } catch (error) {
          const concurrent = await documents.getById(VILLAGES_PACKAGE_ID, id);
          if (!concurrent) throw error;
          memoryRequire(
            concurrent.kind === MEMORY_PAGE_KIND &&
              concurrent.packageId === VILLAGES_PACKAGE_ID &&
              concurrent.revision === 1 &&
              JSON.stringify(concurrent.data) === JSON.stringify(data),
            "concurrent immutable relationship page changed",
          );
        }
      }
    }
    const ready = await documents.update({
      id: intentId,
      packageId: VILLAGES_PACKAGE_ID,
      expectedRevision: 1,
      name: "Relationship publication",
      description: "Immutable history ready for owner CAS",
      data: { ...intent, phase: "ready" },
      updatedAt: stamp,
    });
    memoryRequire(ready, "relationship publication intent changed");
    cache({ head, value: frozen, layout: result.layout });
    return head;
  }
  return { read, readSnapshot, prepare };
}
const payloadStores = new WeakMap<CapabilityDocumentStore, ReturnType<typeof createRelationshipPayloadStore>>();
/** Live ledgers and frozen snapshots on the same admitted backend share only this bounded decoded cache. */
export function relationshipPayloadStore(documents: CapabilityDocumentStore) {
  let value = payloadStores.get(documents);
  if (!value) payloadStores.set(documents, (value = createRelationshipPayloadStore(documents)));
  return value;
}
