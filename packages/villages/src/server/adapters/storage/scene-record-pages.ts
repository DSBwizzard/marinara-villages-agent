import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueLine, VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import {
  assertSceneTranscriptCast,
  freezeSceneTranscript,
  sceneTranscriptDependencies,
} from "../../domain/rules/scene-transcript.js";
import { assertSceneSubmissionCast, freezeSceneSubmissions } from "../../domain/rules/scene-submissions.js";
import {
  createHistoryPageWriter,
  createHistoryPageReader,
  historyPageHeight,
  createMemoryPageTracer,
  readHistoryPageRef,
  validateMemoryPageData,
  MEMORY_PAGE_KIND,
  type HistoryPageRef,
  type HistoryPageTree,
  type MemoryPageData,
} from "./memory-pages.js";
import { isRepairSimulation } from "./repair-gate.js";

// Closed to the two concrete Scene collections. Their native heads and public entry points stay typed.
type Kind = "lines" | "submissions";
type Row = VenueLine | VenueSubmission;
type Owner = Pick<VenueScene, "id" | "villageSeed">;
export type SceneRecordHead = { format: 1; world: string; count: number; root: HistoryPageRef | null };
export const sceneRecordWorld = (owner: Owner, kind: Kind) =>
  createHash("sha256")
    .update(JSON.stringify([owner.id, owner.villageSeed ?? "", kind]))
    .digest("hex")
    .slice(0, 32);
const label = (kind: Kind) => (kind === "lines" ? "Scene transcript" : "Scene submissions");
export function readSceneRecordHead(value: unknown, owner: Owner, kind: Kind): SceneRecordHead {
  memoryObject(value, ["format", "world", "count", kind]);
  memoryRequire(
    value.format === 1 &&
      value.world === sceneRecordWorld(owner, kind) &&
      Number.isSafeInteger(value.count) &&
      value.count >= 0,
    "invalid " + label(kind) + " owner identity",
  );
  const root = readHistoryPageRef(value[kind], value.world);
  memoryRequire((value.count === 0) === (root === null), "invalid " + label(kind) + " count");
  return { format: 1, world: value.world, count: value.count, root };
}
export function encodeSceneRecords(rows: Row[], owner: Owner, kind: Kind, previous?: HistoryPageTree) {
  memoryRequire(new Set(rows.map((row) => row.id)).size === rows.length, "duplicate " + label(kind) + " identity");
  const world = sceneRecordWorld(owner, kind),
    writer = createHistoryPageWriter(world);
  const layout = writer.tree(
    rows.map((row) => [row.id, row]),
    previous,
    kind === "submissions" ? 1 : 64,
  );
  return {
    head: { format: 1, world, count: rows.length, root: layout.root } as SceneRecordHead,
    layout,
    pages: writer.pages,
  };
}
function* decoder(head: SceneRecordHead, kind: Kind) {
  const reader = createHistoryPageReader(head.world),
    layout = yield* reader.tree(head.root, { count: head.count, items: kind === "submissions" ? 1 : 64 });
  memoryRequire(
    kind !== "submissions" || layout.groups.every((group) => group.entries.length === 1),
    "invalid Scene submission block",
  );
  const entries = reader.rows(layout);
  memoryRequire(entries.length === head.count, label(kind) + " count changed");
  memoryRequire(new Set(entries.map(([id]) => id)).size === entries.length, "duplicate " + label(kind) + " identity");
  for (const [id, row] of entries)
    memoryRequire(row && typeof row === "object" && (row as Row).id === id, label(kind) + " identity changed");
  return { rows: entries.map(([, row]) => row) as Row[], layout };
}
export function decodeSceneRecordsSync(head: SceneRecordHead, kind: Kind, get: (id: string) => MemoryPageData | null) {
  const read = decoder(head, kind);
  let next = read.next();
  while (next.done === false) next = read.next(get(next.value));
  return next.value;
}
export async function decodeSceneRecords(
  head: SceneRecordHead,
  kind: Kind,
  get: (id: string) => Promise<MemoryPageData | null>,
) {
  const read = decoder(head, kind);
  let next = read.next();
  while (next.done === false) next = read.next(await get(next.value));
  return next.value;
}
function normalize(scene: Partial<VenueScene>, rows: Row[], kind: Kind) {
  return coerceSession({
    ...scene,
    continuity: undefined,
    operation: undefined,
    lines: [],
    submissions: [],
    [kind]: rows,
  });
}
function freeze(scene: VenueScene, kind: Kind): Row[] {
  return kind === "lines" ? freezeSceneTranscript(scene) : freezeSceneSubmissions(scene);
}
function assertCast(scene: VenueScene, rows: Row[], kind: Kind) {
  if (kind === "lines") assertSceneTranscriptCast({ ...scene, lines: rows as VenueLine[] });
  else assertSceneSubmissionCast({ ...scene, submissions: rows as VenueSubmission[] });
}
function dependencies(row: Row, kind: Kind): string[] {
  if (kind === "lines") return sceneTranscriptDependencies(row);
  const ids = (row as VenueSubmission).activeIdsAfterTurn;
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
}
async function readRecordPage(documents: Pick<CapabilityDocumentStore, "getById">, kind: Kind, id: string) {
  const row = await documents.getById("villages", id);
  memoryRequire(
    row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
    "owned " + label(kind) + " page is missing or changed",
  );
  validateMemoryPageData(row.data, id);
  return row.data as MemoryPageData;
}
export async function readSceneRecordPositions(
  documents: Pick<CapabilityDocumentStore, "getById">,
  head: SceneRecordHead,
  scene: VenueScene,
  kind: Kind,
  positions: readonly number[],
): Promise<Row[]> {
  memoryRequire(head.world === sceneRecordWorld(scene, kind), "invalid " + label(kind) + " owner identity");
  const reader = createHistoryPageReader(head.world),
    rows: Row[] = [];
  for (const position of positions) {
    const read = reader.range(head.root, head.count, position, position + 1, kind === "submissions" ? 1 : 64);
    let next = read.next();
    while (next.done === false) next = read.next(await readRecordPage(documents, kind, next.value));
    for (const [id, row] of next.value) {
      memoryRequire(row && typeof row === "object" && (row as Row).id === id, label(kind) + " identity changed");
      rows.push(row as Row);
    }
  }
  memoryRequire(new Set(rows.map((row) => row.id)).size === rows.length, "duplicate " + label(kind) + " identity");
  const decoded = normalize(scene, rows, kind);
  memoryRequire(JSON.stringify(decoded[kind]) === JSON.stringify(rows), "invalid canonical " + label(kind));
  return freeze(decoded, kind);
}
/** Page creation remains inside the caller's full work admission through the native owner CAS. */
export function createSceneRecordStore(documents: Pick<CapabilityDocumentStore, "getById" | "create">, kind: Kind) {
  type Entry = { rows: Row[]; layout: HistoryPageTree };
  const cached = new Map<string, Entry>(),
    identity = (head: SceneRecordHead) => JSON.stringify(head);
  const usable = () => !isRepairSimulation(documents as CapabilityDocumentStore);
  const page = (id: string) => readRecordPage(documents, kind, id);
  function remember(head: SceneRecordHead, entry: Entry) {
    if (!usable()) return;
    const key = identity(head);
    cached.delete(key);
    cached.set(key, entry);
    while (cached.size > 4) cached.delete(cached.keys().next().value!);
  }
  async function read(head: SceneRecordHead, scene: VenueScene): Promise<Entry> {
    memoryRequire(head.world === sceneRecordWorld(scene, kind), "invalid " + label(kind) + " owner identity");
    if (head.root) await page(head.root.id);
    const old = usable() ? cached.get(identity(head)) : undefined;
    if (old) {
      assertCast(scene, old.rows, kind);
      remember(head, old);
      return old;
    }
    const source = await decodeSceneRecords(head, kind, page),
      decoded = normalize(scene, source.rows, kind);
    memoryRequire(decoded[kind].length === head.count, "invalid saved " + label(kind));
    memoryRequire(
      JSON.stringify(decoded[kind]) === JSON.stringify(source.rows),
      "saved " + label(kind) + " requires unsupported normalization",
    );
    const rows = freeze(decoded, kind),
      byId = new Map(rows.map((row) => [row.id, row]));
    const layout = {
      ...source.layout,
      groups: source.layout.groups.map((group) => ({
        ...group,
        entries: group.entries.map(([id]) => [id, byId.get(id)!] as [string, Row]),
      })),
    };
    const entry = { rows, layout };
    remember(head, entry);
    return entry;
  }
  async function prepare(scene: VenueScene, previous?: SceneRecordHead) {
    assertCast(scene, scene[kind], kind);
    const rows = freeze(normalize(scene, scene[kind], kind), kind);
    memoryRequire(rows.length === scene[kind].length, "invalid " + label(kind) + " publication");
    if (previous)
      memoryRequire(previous.world === sceneRecordWorld(scene, kind), "invalid previous " + label(kind) + " owner");
    if (previous?.root) await page(previous.root.id);
    const old = previous && usable() ? cached.get(identity(previous)) : undefined;
    const encoded = encodeSceneRecords(rows, scene, kind, old?.layout),
      stamp = new Date().toISOString();
    for (const [id, data] of encoded.pages) {
      const existing = await documents.getById("villages", id);
      if (existing)
        memoryRequire(JSON.stringify(await page(id)) === JSON.stringify(data), "immutable " + label(kind) + " changed");
      else {
        try {
          await documents.create({
            id,
            packageId: "villages",
            kind: MEMORY_PAGE_KIND,
            name: "Private Scene history",
            description: "Immutable " + label(kind) + " page",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
        } catch (error) {
          if (!(await documents.getById("villages", id))) throw error;
          memoryRequire(
            JSON.stringify(await page(id)) === JSON.stringify(data),
            "concurrent " + label(kind) + " changed",
          );
        }
      }
    }
    if (kind === "lines") scene.lines = [...rows] as VenueLine[];
    else scene.submissions = [...rows] as VenueSubmission[];
    remember(encoded.head, { rows, layout: encoded.layout });
    return encoded.head;
  }
  return {
    read,
    readPositions: (head: SceneRecordHead, scene: VenueScene, positions: readonly number[]) =>
      readSceneRecordPositions(documents, head, scene, kind, positions),
    prepare,
  };
}
const stores = new WeakMap<object, Partial<Record<Kind, ReturnType<typeof createSceneRecordStore>>>>();
export function sceneRecordStore(documents: CapabilityDocumentStore, kind: Kind) {
  let entries = stores.get(documents);
  if (!entries) stores.set(documents, (entries = {}));
  return (entries[kind] ??= createSceneRecordStore(documents, kind));
}
export function createSceneRecordTracer(
  get: (id: string) => Promise<MemoryPageData | null>,
  kind: Kind,
  visit?: (
    row: Row,
    world: string,
  ) => Promise<readonly { actorId: string; capturedAt: string; seed: string; setupAt: string }[]>,
) {
  const tracer = createMemoryPageTracer(get);
  type Summary = {
    height: number;
    count: number;
    cast: Set<string>;
    captures: Map<string, { actorId: string; capturedAt: string; seed: string; setupAt: string }>;
    ids?: string[];
    children?: HistoryPageRef[];
  };
  const checked = new Map<string, Summary>(),
    validatedHeads = new Set<string>();
  async function inspect(ref: HistoryPageRef, world: string): Promise<Summary> {
    const previous = checked.get(ref.id);
    if (previous) {
      memoryRequire(previous.height === ref.height, label(kind) + " page depth changed");
      return previous;
    }
    const node = await tracer.readNode(ref, world);
    memoryRequire(node.type !== "text", "invalid " + label(kind) + " directory");
    const ids = new Set<string>(),
      cast = new Set<string>(),
      captures: Summary["captures"] = new Map();
    let count = 0,
      children: HistoryPageRef[] | undefined;
    if (node.type === "branch") {
      children = node.children.map((child) => readHistoryPageRef(child, world)!);
      const capacity = (kind === "submissions" ? 1 : 64) * 32 ** (ref.height - 1);
      for (const [index, child] of children.entries()) {
        const summary = await inspect(child, world);
        memoryRequire(
          summary.count <= capacity && (index === children.length - 1 || summary.count === capacity),
          "invalid packed " + label(kind) + " branch",
        );
        count += summary.count;
        for (const id of summary.cast) cast.add(id);
        for (const [id, value] of summary.captures) captures.set(id, value);
      }
    } else {
      const rows = JSON.parse(await tracer.readText(node.content, world));
      memoryRequire(
        Array.isArray(rows) && rows.length > 0 && rows.length <= (kind === "submissions" ? 1 : 64),
        "invalid " + label(kind) + " block",
      );
      for (const row of rows) {
        memoryRequire(
          Array.isArray(row) &&
            row.length === 2 &&
            typeof row[0] === "string" &&
            row[0].length &&
            row[1] &&
            typeof row[1] === "object" &&
            row[1].id === row[0] &&
            !ids.has(row[0]),
          "invalid " + label(kind) + " identity",
        );
        ids.add(row[0]);
        for (const id of dependencies(row[1], kind)) cast.add(id);
        for (const value of (await visit?.(row[1], world)) ?? [])
          captures.set(JSON.stringify([value.seed, value.setupAt, value.actorId, value.capturedAt]), value);
      }
      const source = rows.map((row) => row[1]);
      const decoded = normalize(
        { version: 3, participants: [...cast].map((id) => ({ characterId: id, name: id, doing: "" })) },
        source,
        kind,
      );
      memoryRequire(JSON.stringify(decoded[kind]) === JSON.stringify(source), "invalid canonical " + label(kind));
      count = ids.size;
    }
    const result = { height: ref.height, count, cast, captures, ...(children ? { children } : { ids: [...ids] }) };
    checked.set(ref.id, result);
    return result;
  }
  return {
    async trace(head: SceneRecordHead, participants: VenueScene["participants"]) {
      const height = historyPageHeight(head.count, kind === "submissions" ? 1 : 64);
      memoryRequire(
        head.root ? head.count > 0 && head.root.height === height : head.count === 0,
        "invalid packed " + label(kind) + " depth",
      );
      const summary = head.root
        ? await inspect(head.root, head.world)
        : { count: 0, cast: new Set<string>(), captures: new Map() };
      memoryRequire(summary.count === head.count, label(kind) + " count changed");
      const key = JSON.stringify(head);
      if (!validatedHeads.has(key)) {
        const ids = new Set<string>();
        const unique = (ref: HistoryPageRef) => {
          const entry = checked.get(ref.id)!;
          if (entry.children) for (const child of entry.children) unique(child);
          else
            for (const id of entry.ids!) {
              memoryRequire(!ids.has(id), "duplicate " + label(kind) + " identity");
              ids.add(id);
            }
        };
        if (head.root) unique(head.root);
        validatedHeads.add(key);
      }
      const cast = new Set(participants.map((person) => person.characterId));
      memoryRequire(
        [...summary.cast].every((id) => cast.has(id)),
        "invalid " + label(kind) + " participant identity",
      );
      return [...summary.captures.values()];
    },
  };
}
