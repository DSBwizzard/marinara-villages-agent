import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueLine, VenueScene } from "../../domain/models/scene-model.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import {
  freezeSceneTranscript,
  assertSceneTranscriptCast,
  sceneTranscriptDependencies,
} from "../../domain/rules/scene-transcript.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import {
  createHistoryPageWriter,
  createHistoryPageReader,
  createMemoryPageTracer,
  readHistoryPageRef,
  validateMemoryPageData,
  MEMORY_PAGE_KIND,
  type HistoryPageRef,
  type HistoryPageTree,
  type MemoryPageData,
} from "./memory-pages.js";
import { isRepairSimulation } from "./repair-gate.js";

type Owner = Pick<VenueScene, "id" | "villageSeed">;
export type SceneTranscriptHead = { format: 1; world: string; count: number; lines: HistoryPageRef | null };
const digest = (text: string) => createHash("sha256").update(text).digest("hex");
export const sceneTranscriptWorld = (owner: Owner) =>
  digest(JSON.stringify([owner.id, owner.villageSeed ?? ""])).slice(0, 32);
export function readSceneTranscriptHead(value: unknown, owner: Owner): SceneTranscriptHead {
  memoryObject(value, ["format", "world", "count", "lines"]);
  memoryRequire(
    value.format === 1 &&
      value.world === sceneTranscriptWorld(owner) &&
      Number.isSafeInteger(value.count) &&
      value.count >= 0,
    "invalid Scene transcript owner identity",
  );
  const lines = readHistoryPageRef(value.lines, value.world);
  memoryRequire((value.count === 0) === (lines === null), "invalid Scene transcript count");
  return { format: 1, world: value.world, count: value.count, lines };
}
export function encodeSceneTranscript(lines: VenueLine[], owner: Owner, previous?: HistoryPageTree) {
  memoryRequire(new Set(lines.map((line) => line.id)).size === lines.length, "duplicate Scene line identity");
  const world = sceneTranscriptWorld(owner),
    writer = createHistoryPageWriter(world);
  const layout = writer.tree(
    lines.map((line) => [line.id, line]),
    previous,
  );
  return {
    head: { format: 1, world, count: lines.length, lines: layout.root } as SceneTranscriptHead,
    layout,
    pages: writer.pages,
  };
}
function* decoder(head: SceneTranscriptHead) {
  const reader = createHistoryPageReader(head.world),
    layout = yield* reader.tree(head.lines);
  const entries = reader.rows(layout);
  memoryRequire(entries.length === head.count, "Scene transcript count changed");
  for (const [id, line] of entries)
    memoryRequire(
      line && typeof line === "object" && (line as VenueLine).id === id,
      "Scene transcript identity changed",
    );
  return { lines: entries.map(([, line]) => line) as VenueLine[], layout };
}
export function decodeSceneTranscriptSync(head: SceneTranscriptHead, get: (id: string) => MemoryPageData | null) {
  const read = decoder(head);
  let next = read.next();
  while (next.done === false) next = read.next(get(next.value));
  return next.value;
}
export async function decodeSceneTranscript(
  head: SceneTranscriptHead,
  get: (id: string) => Promise<MemoryPageData | null>,
) {
  const read = decoder(head);
  let next = read.next();
  while (next.done === false) next = read.next(await get(next.value));
  return next.value;
}
/** Direct, typed page owners use the existing history tree and exclusion gate. No second owner registry. */
export function createSceneTranscriptStore(documents: Pick<CapabilityDocumentStore, "getById" | "create">) {
  type Entry = { lines: VenueLine[]; layout: HistoryPageTree };
  const cached = new Map<string, Entry>();
  const identity = (head: SceneTranscriptHead) => JSON.stringify(head);
  const usable = () => !isRepairSimulation(documents as CapabilityDocumentStore);
  async function page(id: string) {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned Scene transcript page is missing or changed",
    );
    validateMemoryPageData(row.data, id);
    return row.data as MemoryPageData;
  }
  function remember(head: SceneTranscriptHead, entry: Entry) {
    if (!usable()) return;
    const key = identity(head);
    cached.delete(key);
    cached.set(key, entry);
    while (cached.size > 4) cached.delete(cached.keys().next().value!);
  }
  async function read(head: SceneTranscriptHead, scene: VenueScene): Promise<Entry> {
    // A decoded cache never substitutes for the physical root of the current owner.
    if (head.lines) await page(head.lines.id);
    const old = usable() ? cached.get(identity(head)) : undefined;
    if (old) {
      assertSceneTranscriptCast({ ...scene, lines: old.lines });
      remember(head, old);
      return old;
    }
    const source = await decodeSceneTranscript(head, page);
    const decoded = coerceSession({
      ...scene,
      continuity: undefined,
      operation: undefined,
      submissions: [],
      lines: source.lines,
    });
    memoryRequire(decoded.lines.length === head.count, "invalid saved Scene transcript");
    memoryRequire(
      JSON.stringify(decoded.lines) === JSON.stringify(source.lines),
      "saved Scene transcript requires unsupported normalization",
    );
    const lines = freezeSceneTranscript(decoded);
    // The writer's retained groups must refer to the same canonical leaves exposed to mutations.
    const byId = new Map(lines.map((line) => [line.id, line]));
    const layout: HistoryPageTree = {
      ...source.layout,
      groups: source.layout.groups.map((group) => ({
        ...group,
        entries: group.entries.map(([id]) => [id, byId.get(id)!]),
      })),
    };
    const entry = { lines, layout };
    remember(head, entry);
    return entry;
  }
  async function prepare(scene: VenueScene, previous?: SceneTranscriptHead) {
    assertSceneTranscriptCast(scene);
    const decoded = coerceSession({ ...scene, continuity: undefined, operation: undefined, submissions: [] });
    const lines = freezeSceneTranscript(decoded);
    memoryRequire(lines.length === scene.lines.length, "invalid Scene transcript publication");
    if (previous?.lines) await page(previous.lines.id);
    const old = previous && usable() ? cached.get(identity(previous)) : undefined;
    const encoded = encodeSceneTranscript(lines, scene, old?.layout);
    // Full work admission covers page creation and the subsequent Scene CAS. A drained cleanup
    // sees either the complete published owner or unowned pages; interrupted publication needs no intent.
    const stamp = new Date().toISOString();
    for (const [id, data] of encoded.pages) {
      const existing = await documents.getById("villages", id);
      if (existing) {
        const verified = await page(id);
        memoryRequire(JSON.stringify(verified) === JSON.stringify(data), "immutable Scene transcript changed");
      } else {
        try {
          await documents.create({
            id,
            packageId: "villages",
            kind: MEMORY_PAGE_KIND,
            name: "Private Scene history",
            description: "Immutable Scene transcript page",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
        } catch (error) {
          if (!(await documents.getById("villages", id))) throw error;
          memoryRequire(JSON.stringify(await page(id)) === JSON.stringify(data), "concurrent Scene transcript changed");
        }
      }
    }
    scene.lines = [...lines];
    remember(encoded.head, { lines, layout: encoded.layout });
    return encoded.head;
  }
  return { read, prepare };
}
const stores = new WeakMap<object, ReturnType<typeof createSceneTranscriptStore>>();
export function sceneTranscriptStore(documents: CapabilityDocumentStore) {
  let store = stores.get(documents);
  if (!store) stores.set(documents, (store = createSceneTranscriptStore(documents)));
  return store;
}
export function createSceneTranscriptTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const tracer = createMemoryPageTracer(get);
  type Summary = { height: number; count: number; cast: Set<string>; ids?: string[]; children?: HistoryPageRef[] };
  const checked = new Map<string, Summary>(),
    validatedHeads = new Set<string>();
  async function inspect(ref: HistoryPageRef, world: string): Promise<Summary> {
    const previous = checked.get(ref.id);
    if (previous) {
      memoryRequire(previous.height === ref.height, "Scene transcript page depth changed");
      return previous;
    }
    const node = await tracer.readNode(ref, world);
    memoryRequire(node.type !== "text", "invalid Scene transcript directory");
    const ids = new Set<string>(),
      cast = new Set<string>();
    let count = 0;
    let children: HistoryPageRef[] | undefined;
    if (node.type === "branch") {
      children = node.children.map((child) => readHistoryPageRef(child, world)!);
      for (const child of children) {
        const summary = await inspect(child, world);
        count += summary.count;
        for (const id of summary.cast) cast.add(id);
      }
    } else {
      const rows = JSON.parse(await tracer.readText(node.content, world));
      memoryRequire(Array.isArray(rows) && rows.length > 0 && rows.length <= 64, "invalid Scene transcript block");
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
          "invalid Scene transcript identity",
        );
        ids.add(row[0]);
        for (const id of sceneTranscriptDependencies(row[1])) cast.add(id);
      }
      // Validate each immutable block once with all its recorded identity dependencies.
      const source = rows.map((row) => row[1]);
      const decoded = coerceSession({
        version: 3,
        participants: [...cast].map((id) => ({ characterId: id, name: id })),
        lines: source,
      });
      memoryRequire(JSON.stringify(decoded.lines) === JSON.stringify(source), "invalid canonical Scene transcript");
      count = ids.size;
    }
    const result: Summary = { height: ref.height, count, cast, ...(children ? { children } : { ids: [...ids] }) };
    checked.set(ref.id, result);
    return result;
  }
  return {
    async trace(head: SceneTranscriptHead, participants: VenueScene["participants"]) {
      const summary = head.lines ? await inspect(head.lines, head.world) : { count: 0, cast: new Set<string>() };
      memoryRequire(summary.count === head.count, "Scene transcript count changed");
      const key = JSON.stringify(head);
      if (!validatedHeads.has(key)) {
        // Keep one transient ID set per distinct owner. Retained append heads share block
        // summaries, not a growing descendant-ID set at every old directory/root.
        const ids = new Set<string>();
        const unique = (ref: HistoryPageRef) => {
          const entry = checked.get(ref.id)!;
          if (entry.children) for (const child of entry.children) unique(child);
          else
            for (const id of entry.ids!) {
              memoryRequire(!ids.has(id), "duplicate Scene transcript identity");
              ids.add(id);
            }
        };
        if (head.lines) unique(head.lines);
        validatedHeads.add(key);
      }
      const cast = new Set(participants.map((person) => person.characterId));
      memoryRequire(
        [...summary.cast].every((id) => cast.has(id)),
        "invalid Scene transcript participant identity",
      );
    },
  };
}
