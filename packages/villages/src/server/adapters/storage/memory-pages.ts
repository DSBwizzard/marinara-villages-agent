import { createHash } from "node:crypto";
import type { MemoryPayload } from "./memory-payload-store.js";
import { immutableMemoryValue, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";

export const MEMORY_PAGE_KIND = "memory-page";
export const MEMORY_PAGE_BYTES = 256 * 1024;
const ITEMS = 64,
  FANOUT = 32,
  CHARS = 32 * 1024;
const TEXT_PREFIX = "memory:";
type Ref = { id: string; digest: string; height: number };
type Page = { type: "text"; text: string } | { type: "block"; content: Ref } | { type: "branch"; children: Ref[] };
type Entry = [string, unknown];
type Group = { entries: Entry[]; ref: Ref };
type Tree = { groups: Group[]; levels: Ref[][]; root: Ref | null };
export type HistoryPageTree = Tree;
export type HistoryPageRef = Ref;
type Scene = { header: unknown; before: Tree; effects: Tree };
export type MemoryPageLayout = {
  records: Tree;
  scenes: Tree;
  receipts: Tree;
  sceneValues: Map<string, Scene>;
};
export type MemoryPageManifest = {
  format: 2;
  revision: number;
  records: Ref | null;
  scenes: Ref | null;
  receipts: Ref | null;
};
export type MemoryPageData = { format: 1; world: string; node: Page };
export const pageDigest = (text: string) => createHash("sha256").update(text).digest("hex");
const equalRefs = (a: Ref[], b?: Ref[]) => !!b && a.length === b.length && a.every((r, i) => r.id === b[i].id);
const entries = (value: Record<string, unknown>): Entry[] => Object.entries(value);

/** Shared private-history primitives; typed payload owners define their own manifests. */
export function createHistoryPageWriter(world: string) {
  const pages = new Map<string, MemoryPageData>();
  let serializedBytes = 0;
  function page(node: Page, height: number): Ref {
    const text = JSON.stringify(node);
    serializedBytes += Buffer.byteLength(text);
    const digest = pageDigest(text),
      id = `villages-memory-page-${world}-${digest}`;
    const data: MemoryPageData = { format: 1, world, node };
    memoryRequire(Buffer.byteLength(JSON.stringify(data)) <= MEMORY_PAGE_BYTES, "history page is too large");
    pages.set(id, data);
    return { id, digest, height };
  }
  function directory(leaves: Ref[], old?: Ref[][]): { root: Ref | null; levels: Ref[][] } {
    const levels = [leaves];
    let current = leaves;
    while (current.length > 1) {
      const next: Ref[] = [],
        level = levels.length;
      for (let i = 0; i < current.length; i += FANOUT) {
        const children = current.slice(i, i + FANOUT),
          prior = old?.[level]?.[i / FANOUT];
        next.push(
          equalRefs(children, old?.[level - 1]?.slice(i, i + FANOUT)) && prior
            ? prior
            : page({ type: "branch", children }, children[0].height + 1),
        );
      }
      levels.push(next);
      current = next;
    }
    return { root: current[0] ?? null, levels };
  }
  function block(rows: Entry[]) {
    const text = JSON.stringify(rows);
    serializedBytes += Buffer.byteLength(text);
    const chunks: Ref[] = [];
    for (let i = 0; i < text.length; i += CHARS)
      chunks.push(page({ type: "text", text: TEXT_PREFIX + text.slice(i, i + CHARS) }, 0));
    const content = directory(chunks).root!;
    return page({ type: "block", content }, 0);
  }
  function tree(rows: Entry[], prior?: Tree): Tree {
    const groups: Group[] = [];
    for (let i = 0; i < rows.length; i += ITEMS) {
      const selected = rows.slice(i, i + ITEMS),
        old = prior?.groups[i / ITEMS];
      groups.push(
        old &&
          selected.length === old.entries.length &&
          selected.every(([key, v], j) => key === old.entries[j][0] && v === old.entries[j][1])
          ? old
          : { entries: selected, ref: block(selected) },
      );
    }
    return {
      groups,
      ...directory(
        groups.map((g) => g.ref),
        prior?.levels,
      ),
    };
  }
  return {
    tree,
    pages,
    get serializedBytes() {
      return serializedBytes;
    },
  };
}

/** Memory-specific manifest and nested Scene preimages. */
export function encodeMemoryPages(value: MemoryPayload, world: string, previous?: MemoryPageLayout) {
  const writer = createHistoryPageWriter(world);
  const { tree, pages } = writer;
  const records = tree(
    value.memories.records.map((r) => [r.id, r]),
    previous?.records,
  );
  const sceneValues = new Map<string, Scene>();
  const sceneRows: Entry[] = Object.entries(value.memoryScenes).map(([id, scene]) => {
    const prior = previous?.sceneValues.get(id);
    const before = tree(entries(scene.snapshot.before), prior?.before),
      effects = tree(entries(scene.effects), prior?.effects);
    const header = { snapshot: { ...scene.snapshot, before: before.root }, effects: effects.root };
    const old = prior?.header;
    // Headers contain only bounded Scene metadata and two references, never preimage bodies.
    const retained = old && JSON.stringify(header) === JSON.stringify(old) ? old : immutableMemoryValue(header);
    sceneValues.set(id, { header: retained, before, effects });
    return [id, retained];
  });
  const scenes = tree(sceneRows, previous?.scenes),
    receipts = tree(entries(value.memoryReceipts), previous?.receipts);
  const manifest: MemoryPageManifest = {
    format: 2,
    revision: value.memories.revision,
    records: records.root,
    scenes: scenes.root,
    receipts: receipts.root,
  };
  return {
    manifest,
    pages,
    layout: { records, scenes, receipts, sceneValues },
    serializedBytes: writer.serializedBytes,
  };
}

function readRef(raw: unknown, world: string): Ref | null {
  if (raw === null) return null;
  memoryObject(raw, ["id", "digest", "height"]);
  memoryRequire(
    typeof raw.digest === "string" &&
      /^[a-f0-9]{64}$/.test(raw.digest) &&
      raw.id === `villages-memory-page-${world}-${raw.digest}` &&
      Number.isInteger(raw.height) &&
      raw.height >= 0 &&
      raw.height < 32,
    "invalid history page reference",
  );
  return raw as Ref;
}
export const readHistoryPageRef = readRef;
/** Strict native envelope: text is opaque, and structural nodes contain only page identities. */
export function validateMemoryPageData(data: unknown, id: string): asserts data is MemoryPageData {
  const identity = /^villages-memory-page-([a-f0-9]{32})-([a-f0-9]{64})$/.exec(id);
  memoryObject(data, ["format", "world", "node"]);
  memoryRequire(
    identity &&
      data.format === 1 &&
      data.world === identity[1] &&
      Buffer.byteLength(JSON.stringify(data)) <= MEMORY_PAGE_BYTES &&
      pageDigest(JSON.stringify(data.node)) === identity[2],
    "history page changed",
  );
  const node = data.node;
  memoryObject(node);
  memoryRequire(["text", "block", "branch"].includes(node.type), "invalid history page");
  memoryObject(
    node,
    node.type === "text" ? ["type", "text"] : node.type === "block" ? ["type", "content"] : ["type", "children"],
  );
  if (node.type === "text")
    memoryRequire(
      typeof node.text === "string" &&
        node.text.startsWith(TEXT_PREFIX) &&
        node.text.length <= CHARS + TEXT_PREFIX.length,
      "invalid history text page",
    );
  else if (node.type === "block") memoryRequire(readRef(node.content, data.world), "invalid history block content");
  else {
    memoryRequire(
      Array.isArray(node.children) && node.children.length > 0 && node.children.length <= FANOUT,
      "invalid history directory branch",
    );
    for (const child of node.children) memoryRequire(readRef(child, data.world), "invalid history child");
  }
}
export function createHistoryPageReader(world: string) {
  const seen = new Map<string, Page>();
  function* load(ref: Ref): Generator<string, Page, MemoryPageData | null> {
    if (seen.has(ref.id)) return seen.get(ref.id)!;
    const data = yield ref.id;
    memoryRequire(data, "committed history page is missing");
    validateMemoryPageData(data, ref.id);
    const node = data.node;
    seen.set(ref.id, node as Page);
    return node as Page;
  }
  function* leaves(
    ref: Ref,
    kind: "text" | "block",
  ): Generator<string, { refs: Ref[]; levels: Ref[][] }, MemoryPageData | null> {
    const node = yield* load(ref);
    if (node.type === kind) return { refs: [ref], levels: [[ref]] };
    memoryRequire(
      node.type === "branch" &&
        Array.isArray(node.children) &&
        node.children.length >= 1 &&
        node.children.length <= FANOUT,
      "invalid history directory branch",
    );
    const children = node.children.map((child) => readRef(child, world)!);
    memoryRequire(
      children.every((child) => child && child.height === ref.height - 1),
      "invalid history directory depth",
    );
    const parts: { refs: Ref[]; levels: Ref[][] }[] = [];
    for (const child of children) parts.push(yield* leaves(child, kind));
    const levels: Ref[][] = [];
    for (const part of parts) for (let i = 0; i < part.levels.length; i++) (levels[i] ??= []).push(...part.levels[i]);
    levels.push([ref]);
    return { refs: parts.flatMap((part) => part.refs), levels };
  }
  function* tree(value: unknown): Generator<string, Tree, MemoryPageData | null> {
    const root = readRef(value, world);
    if (!root) return { root, groups: [], levels: [[]] };
    const list = yield* leaves(root, "block");
    const groups: Group[] = [];
    const keys = new Set<string>();
    for (const ref of list.refs) {
      const node = yield* load(ref);
      memoryRequire(node.type === "block", "invalid history block");
      const content = readRef(node.content, world);
      memoryRequire(content && ref.height === 0, "invalid history block content");
      const texts = yield* leaves(content, "text");
      const parts: string[] = [];
      for (const textRef of texts.refs) {
        const text = yield* load(textRef);
        memoryRequire(
          text.type === "text" &&
            textRef.height === 0 &&
            typeof text.text === "string" &&
            text.text.startsWith(TEXT_PREFIX) &&
            text.text.length <= CHARS + TEXT_PREFIX.length,
          "invalid history text page",
        );
        parts.push(text.text.slice(TEXT_PREFIX.length));
      }
      const rows = JSON.parse(parts.join(""));
      memoryRequire(Array.isArray(rows) && rows.length > 0 && rows.length <= ITEMS, "invalid history block entries");
      for (const row of rows) {
        memoryRequire(
          Array.isArray(row) && row.length === 2 && typeof row[0] === "string" && !keys.has(row[0]),
          "invalid history entry identity",
        );
        keys.add(row[0]);
      }
      groups.push({ ref, entries: immutableMemoryValue(rows) });
    }
    return { root, groups, levels: list.levels };
  }
  const rows = (value: Tree) => value.groups.flatMap((group) => group.entries);
  return {
    tree,
    rows,
    get pageIds() {
      return [...seen.keys()];
    },
  };
}

function* memoryPageDecoder(raw: unknown, world: string) {
  memoryObject(raw, ["format", "revision", "records", "scenes", "receipts"]);
  memoryRequire(
    raw.format === 2 && Number.isSafeInteger(raw.revision) && raw.revision >= 0,
    "invalid history directory",
  );
  const reader = createHistoryPageReader(world);
  const { tree, rows } = reader;
  const records = yield* tree(raw.records),
    scenes = yield* tree(raw.scenes),
    receipts = yield* tree(raw.receipts);
  const sceneValues = new Map<string, Scene>();
  const memoryScenes: Record<string, unknown> = {};
  for (const [id, header] of rows(scenes)) {
    memoryObject(header, ["snapshot", "effects"]);
    memoryObject(header.snapshot);
    const before = yield* tree(header.snapshot.before),
      effects = yield* tree(header.effects);
    sceneValues.set(id, { header, before, effects });
    memoryScenes[id] = {
      snapshot: { ...header.snapshot, before: Object.fromEntries(rows(before)) },
      effects: Object.fromEntries(rows(effects)),
    };
  }
  const recordsRows = rows(records);
  memoryRequire(
    recordsRows.every(([id, value]) => !!value && (value as { id?: unknown }).id === id),
    "history record identity changed",
  );
  return {
    value: {
      memories: { format: 1, revision: raw.revision, records: recordsRows.map(([, row]) => row) },
      memoryScenes,
      memoryReceipts: Object.fromEntries(rows(receipts)),
    } as MemoryPayload,
    layout: { records, scenes, receipts, sceneValues } as MemoryPageLayout,
    pageIds: reader.pageIds,
  };
}
export async function decodeMemoryPages(
  raw: unknown,
  world: string,
  get: (id: string) => Promise<MemoryPageData | null>,
) {
  const decoder = memoryPageDecoder(raw, world);
  let step = decoder.next();
  while (step.done === false) step = decoder.next(await get(step.value));
  return step.value;
}
/** Fixture and offline checkpoint inspection use the same strict decoder as live storage. */
export function decodeMemoryPagesSync(raw: unknown, world: string, get: (id: string) => MemoryPageData | null) {
  const decoder = memoryPageDecoder(raw, world);
  let step = decoder.next();
  while (step.done === false) step = decoder.next(get(step.value));
  return step.value;
}

/** A cleanup pass visits shared structural pages once, including links inside Scene headers.
 * Keep a separate tracer for each proposed publication overlay; virtual data cannot prove
 * that a physically published owner has all of its dependencies.
 */
export function createMemoryPageTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const nodes = new Map<string, Page>(),
    heights = new Map<string, number>(),
    sceneTrees = new Set<string>(),
    contents = new Map<string, string>();
  async function walk(ref: Ref, world: string, kind: "block" | "text" = "block"): Promise<Page> {
    const prior = nodes.get(ref.id);
    if (prior) {
      memoryRequire(heights.get(ref.id) === ref.height, "history page depth changed");
      memoryRequire(prior.type === "branch" || prior.type === kind, "invalid history page kind");
      return prior;
    }
    const data = await get(ref.id);
    memoryRequire(data, "committed history page is missing");
    validateMemoryPageData(data, ref.id);
    memoryRequire(data.world === world, "history page belongs to another world");
    const node = data.node;
    memoryRequire(node.type === "branch" || node.type === kind, "invalid history page kind");
    memoryRequire(node.type === "branch" ? ref.height > 0 : ref.height === 0, "invalid history page depth");
    nodes.set(ref.id, node);
    heights.set(ref.id, ref.height);
    if (node.type === "block") {
      const content = readRef(node.content, world);
      memoryRequire(content, "missing history block content");
      await walk(content, world, "text");
    } else if (node.type === "branch") {
      for (const value of node.children) {
        const child = readRef(value, world);
        memoryRequire(child && child.height === ref.height - 1, "invalid history directory depth");
        await walk(child, world, kind);
      }
    }
    return node;
  }
  async function text(ref: Ref, world: string): Promise<string> {
    const saved = contents.get(ref.id);
    if (saved !== undefined) return saved;
    const node = await walk(ref, world, "text");
    memoryRequire(node.type !== "block", "invalid history block content");
    const parts: string[] = [];
    if (node.type === "text") parts.push(node.text.slice(TEXT_PREFIX.length));
    else for (const child of node.children) parts.push(await text(readRef(child, world)!, world));
    const value = parts.join("");
    contents.set(ref.id, value);
    return value;
  }
  async function scenes(ref: Ref, world: string) {
    const node = await walk(ref, world);
    if (sceneTrees.has(ref.id)) return;
    sceneTrees.add(ref.id);
    memoryRequire(node.type !== "text", "invalid history Scene directory");
    if (node.type === "branch") {
      for (const child of node.children) await scenes(readRef(child, world)!, world);
      return;
    }
    const rows = JSON.parse(await text(readRef(node.content, world)!, world));
    memoryRequire(Array.isArray(rows) && rows.length > 0 && rows.length <= ITEMS, "invalid history Scene entries");
    const ids = new Set<string>();
    for (const row of rows) {
      memoryRequire(
        Array.isArray(row) && row.length === 2 && typeof row[0] === "string" && !ids.has(row[0]),
        "invalid history Scene identity",
      );
      ids.add(row[0]);
      const header = row[1];
      memoryObject(header, ["snapshot", "effects"]);
      memoryObject(header.snapshot);
      for (const value of [header.snapshot.before, header.effects]) {
        const dependency = readRef(value, world);
        if (dependency) await walk(dependency, world);
      }
    }
  }
  async function trace(raw: unknown, world: string) {
    memoryObject(raw, ["format", "revision", "records", "scenes", "receipts"]);
    memoryRequire(
      raw.format === 2 && Number.isSafeInteger(raw.revision) && raw.revision >= 0,
      "invalid history directory",
    );
    for (const value of [raw.records, raw.receipts]) {
      const ref = readRef(value, world);
      if (ref) await walk(ref, world);
    }
    const scene = readRef(raw.scenes, world);
    if (scene) await scenes(scene, world);
    return new Set(nodes.keys());
  }
  async function traceTrees(values: unknown[], world: string) {
    for (const value of values) {
      const ref = readRef(value, world);
      if (ref) await walk(ref, world);
    }
    return new Set(nodes.keys());
  }
  async function readNode(value: unknown, world: string) {
    const ref = readRef(value, world);
    memoryRequire(ref, "missing history node reference");
    return immutableMemoryValue(await walk(ref, world));
  }
  async function readText(value: unknown, world: string) {
    const ref = readRef(value, world);
    memoryRequire(ref, "missing history content reference");
    return text(ref, world);
  }
  return { trace, traceTrees, readNode, readText };
}
