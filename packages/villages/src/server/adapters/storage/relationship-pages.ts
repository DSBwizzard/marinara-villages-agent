import type { RelationshipState, RelationshipEdge } from "../../domain/models/relationship-types.js";
import type { SocialMailThread } from "../../domain/models/social-mail.js";
import {
  defaultRelationshipState,
  coerceRelationshipState,
  relationshipKey,
} from "../../domain/rules/relationship-rules.js";
import { immutableMemoryValue, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import {
  createHistoryPageWriter,
  createHistoryPageReader,
  readHistoryPageRef,
  createMemoryPageTracer,
  type HistoryPageRef,
  type HistoryPageTree,
  type MemoryPageData,
} from "./memory-pages.js";

const MAPS = [
  "intentions",
  "intentionRevisions",
  "intentionReceipts",
  "grants",
  "receipts",
  "applied",
  "disclosureReceipts",
  "sharedRecords",
  "mailDeliveries",
] as const;
const LISTS = [
  "reviewedActorIds",
  "startingTies",
  "startingActorIds",
  "initializationConflicts",
  "socialPlans",
  "socialEncounters",
] as const;
type Field = (typeof MAPS)[number] | (typeof LISTS)[number];
type EdgeLayout = { header: unknown; records: HistoryPageTree; experiences: HistoryPageTree };
type ThreadLayout = { header: unknown; messages: HistoryPageTree };
export type RelationshipPageLayout = {
  fields: Record<Field, HistoryPageTree>;
  edges: HistoryPageTree;
  threads: HistoryPageTree;
  edgeValues: Map<string, EdgeLayout>;
  threadValues: Map<string, ThreadLayout>;
};
export type RelationshipPageManifest = {
  format: 1;
  header: Pick<RelationshipState, "version" | "seed" | "clockShiftMs" | "noticeSequence" | "eventSequence">;
  fields: Record<Field, HistoryPageRef | null>;
  edges: HistoryPageRef | null;
  threads: HistoryPageRef | null;
};
const entries = (value: object): [string, unknown][] => Object.entries(value);

/** Separate per-edge and per-thread trees prevent a single long history becoming one growing leaf. */
export function encodeRelationshipPages(value: RelationshipState, world: string, previous?: RelationshipPageLayout) {
  memoryObject(value, [
    "version",
    "seed",
    "noticeSequence",
    "eventSequence",
    "clockShiftMs",
    "edges",
    "mailThreads",
    ...MAPS,
    ...LISTS,
  ]);
  const writer = createHistoryPageWriter(world),
    fields = {} as RelationshipPageLayout["fields"];
  for (const field of MAPS) fields[field] = writer.tree(entries(value[field]), previous?.fields[field]);
  for (const field of LISTS)
    fields[field] = writer.tree(
      value[field].map((item, index): [string, unknown] => [String(index), item]),
      previous?.fields[field],
    );
  const retainHeader = (value: unknown, prior?: unknown) =>
    prior && JSON.stringify(value) === JSON.stringify(prior) ? prior : immutableMemoryValue(value);
  const edgeValues = new Map<string, EdgeLayout>();
  const edges = writer.tree(
    Object.entries(value.edges).map(([id, edge]) => {
      const old = previous?.edgeValues.get(id),
        { records: _records, experiences: _experiences, ...facts } = edge;
      const records = writer.tree(entries(edge.records), old?.records),
        experiences = writer.tree(
          edge.experiences.map((item, index) => [String(index), item]),
          old?.experiences,
        );
      const header = retainHeader({ facts, records: records.root, experiences: experiences.root }, old?.header);
      edgeValues.set(id, { header, records, experiences });
      return [id, header];
    }),
    previous?.edges,
  );
  const threadValues = new Map<string, ThreadLayout>();
  const threads = writer.tree(
    Object.entries(value.mailThreads).map(([id, thread]) => {
      const old = previous?.threadValues.get(id),
        { messages: _messages, ...facts } = thread;
      const messages = writer.tree(
        thread.messages.map((message) => [message.id, message]),
        old?.messages,
      );
      const header = retainHeader({ facts, messages: messages.root }, old?.header);
      threadValues.set(id, { header, messages });
      return [id, header];
    }),
    previous?.threads,
  );
  const manifest: RelationshipPageManifest = {
    format: 1,
    header: {
      version: value.version,
      seed: value.seed,
      noticeSequence: value.noticeSequence,
      eventSequence: value.eventSequence,
      ...(value.clockShiftMs === undefined ? {} : { clockShiftMs: value.clockShiftMs }),
    },
    fields: Object.fromEntries(
      Object.entries(fields).map(([field, tree]) => [field, tree.root]),
    ) as RelationshipPageManifest["fields"],
    edges: edges.root,
    threads: threads.root,
  };
  return {
    manifest,
    pages: writer.pages,
    serializedBytes: writer.serializedBytes,
    layout: { fields, edges, threads, edgeValues, threadValues },
  };
}

export function readRelationshipPageManifest(raw: unknown, world: string): RelationshipPageManifest {
  memoryObject(raw, ["format", "header", "fields", "edges", "threads"]);
  memoryRequire(raw.format === 1, "unsupported relationship page manifest");
  memoryObject(raw.header, ["version", "seed", "noticeSequence", "eventSequence", "clockShiftMs"]);
  memoryRequire(
    raw.header.version === 3 &&
      typeof raw.header.seed === "string" &&
      [raw.header.noticeSequence, raw.header.eventSequence].every((n) => Number.isSafeInteger(n) && n >= 0),
    "invalid relationship page header",
  );
  memoryRequire(
    raw.header.clockShiftMs === undefined || Number.isFinite(raw.header.clockShiftMs),
    "invalid relationship clock shift",
  );
  memoryObject(raw.fields, [...MAPS, ...LISTS]);
  for (const field of [...MAPS, ...LISTS]) readHistoryPageRef(raw.fields[field], world);
  readHistoryPageRef(raw.edges, world);
  readHistoryPageRef(raw.threads, world);
  return raw as RelationshipPageManifest;
}
function edgeHeader(raw: unknown, id: string, world: string) {
  memoryObject(raw, ["facts", "records", "experiences"]);
  memoryObject(raw.facts, [
    "fromId",
    "toId",
    "revision",
    "connection",
    "stance",
    "expectations",
    "concerns",
    "updatedAt",
  ]);
  const facts = raw.facts;
  memoryRequire(
    [facts.fromId, facts.toId, facts.connection, facts.stance, facts.updatedAt].every((s) => typeof s === "string") &&
      Number.isSafeInteger(facts.revision) &&
      facts.revision >= 0 &&
      [facts.expectations, facts.concerns].every((a) => Array.isArray(a) && a.every((s) => typeof s === "string")) &&
      relationshipKey(facts.fromId, facts.toId) === id,
    "invalid relationship edge header",
  );
  readHistoryPageRef(raw.records, world);
  readHistoryPageRef(raw.experiences, world);
  return raw as {
    facts: Omit<RelationshipEdge, "records" | "experiences">;
    records: HistoryPageRef | null;
    experiences: HistoryPageRef | null;
  };
}
function threadHeader(raw: unknown, id: string, world: string) {
  memoryObject(raw, ["facts", "messages"]);
  memoryObject(raw.facts, ["id", "participantIds", "revision"]);
  memoryRequire(
    raw.facts.id === id &&
      typeof raw.facts.id === "string" &&
      Number.isSafeInteger(raw.facts.revision) &&
      raw.facts.revision >= 0 &&
      Array.isArray(raw.facts.participantIds) &&
      raw.facts.participantIds.every((s) => typeof s === "string"),
    "invalid correspondence thread header",
  );
  readHistoryPageRef(raw.messages, world);
  return raw as { facts: Omit<SocialMailThread, "messages">; messages: HistoryPageRef | null };
}
function listRows(tree: HistoryPageTree) {
  const rows = tree.groups.flatMap((group) => group.entries);
  memoryRequire(
    rows.every(([id], index) => id === String(index)),
    "relationship list order changed",
  );
  return rows.map(([, value]) => value);
}
function* relationshipDecoder(raw: unknown, world: string) {
  const manifest = readRelationshipPageManifest(raw, world),
    reader = createHistoryPageReader(world);
  const fields = {} as RelationshipPageLayout["fields"],
    value = defaultRelationshipState(manifest.header.seed);
  Object.assign(value, manifest.header);
  for (const field of MAPS) {
    fields[field] = yield* reader.tree(manifest.fields[field]);
    Object.assign(value, { [field]: Object.fromEntries(reader.rows(fields[field])) });
  }
  for (const field of LISTS) {
    fields[field] = yield* reader.tree(manifest.fields[field]);
    Object.assign(value, { [field]: listRows(fields[field]) });
  }
  const edges = yield* reader.tree(manifest.edges),
    edgeValues = new Map<string, EdgeLayout>();
  for (const [id, raw] of reader.rows(edges)) {
    const header = edgeHeader(raw, id, world);
    const records = yield* reader.tree(header.records),
      experiences = yield* reader.tree(header.experiences);
    const rows = reader.rows(records);
    memoryRequire(
      rows.every(([key, record]) => record && (record as { id?: unknown }).id === key),
      "social record identity changed",
    );
    value.edges[id] = {
      ...header.facts,
      records: Object.fromEntries(rows),
      experiences: listRows(experiences),
    } as RelationshipEdge;
    edgeValues.set(id, { header, records, experiences });
  }
  const threads = yield* reader.tree(manifest.threads),
    threadValues = new Map<string, ThreadLayout>();
  for (const [id, raw] of reader.rows(threads)) {
    const header = threadHeader(raw, id, world);
    const messages = yield* reader.tree(header.messages),
      rows = reader.rows(messages);
    memoryRequire(
      rows.every(([key, message]) => message && (message as { id?: unknown }).id === key),
      "correspondence message identity changed",
    );
    Object.defineProperty(value.mailThreads, id, {
      value: { ...header.facts, messages: rows.map(([, message]) => message) } as SocialMailThread,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    threadValues.set(id, { header, messages });
  }
  // Validate the logical ledger before exposing it. The detached/immutable representation is retained for publication reuse.
  const validated = coerceRelationshipState(value.seed, value);
  return { value: validated, layout: { fields, edges, threads, edgeValues, threadValues }, pageIds: reader.pageIds };
}
export async function decodeRelationshipPages(
  raw: unknown,
  world: string,
  get: (id: string) => Promise<MemoryPageData | null>,
) {
  const decoder = relationshipDecoder(raw, world);
  let step = decoder.next();
  while (step.done === false) step = decoder.next(await get(step.value));
  return step.value;
}
export function decodeRelationshipPagesSync(raw: unknown, world: string, get: (id: string) => MemoryPageData | null) {
  const decoder = relationshipDecoder(raw, world);
  let step = decoder.next();
  while (step.done === false) step = decoder.next(get(step.value));
  return step.value;
}

/** Nested edge/thread roots are inside serialized headers; ordinary body trees need no prose decoding. */
export function createRelationshipPageTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const pages = createMemoryPageTracer(get),
    edgeHeaders = new Set<string>(),
    threadHeaders = new Set<string>();
  async function headers(value: unknown, world: string, kind: "edge" | "thread"): Promise<void> {
    const ref = readHistoryPageRef(value, world);
    if (!ref) return;
    const visited = kind === "edge" ? edgeHeaders : threadHeaders;
    const node = await pages.readNode(ref, world);
    if (visited.has(ref.id)) return;
    memoryRequire(node.type !== "text", "invalid relationship header tree");
    if (node.type === "branch") {
      for (const child of node.children) await headers(child, world, kind);
    } else {
      const rows = JSON.parse(await pages.readText(node.content, world)),
        ids = new Set<string>();
      memoryRequire(Array.isArray(rows) && rows.length > 0 && rows.length <= 64, "invalid relationship header entries");
      for (const entry of rows) {
        memoryRequire(
          Array.isArray(entry) && entry.length === 2 && typeof entry[0] === "string" && !ids.has(entry[0]),
          "invalid relationship header identity",
        );
        ids.add(entry[0]);
        if (kind === "edge") {
          const header = edgeHeader(entry[1], entry[0], world);
          await pages.traceTrees([header.records, header.experiences], world);
        } else {
          const header = threadHeader(entry[1], entry[0], world);
          await pages.traceTrees([header.messages], world);
        }
      }
    }
    visited.add(ref.id);
  }
  async function trace(raw: unknown, world: string) {
    const manifest = readRelationshipPageManifest(raw, world);
    await pages.traceTrees(Object.values(manifest.fields), world);
    await headers(manifest.edges, world, "edge");
    await headers(manifest.threads, world, "thread");
  }
  return { trace };
}
