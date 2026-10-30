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

/** Memory-specific immutable pages. Only changed blocks and their bounded directory path serialize. */
export function encodeMemoryPages(value: MemoryPayload, world: string, previous?: MemoryPageLayout) {
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
  return { manifest, pages, layout: { records, scenes, receipts, sceneValues }, serializedBytes };
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
function* memoryPageDecoder(raw: unknown, world: string) {
  memoryObject(raw, ["format", "revision", "records", "scenes", "receipts"]);
  memoryRequire(
    raw.format === 2 && Number.isSafeInteger(raw.revision) && raw.revision >= 0,
    "invalid history directory",
  );
  const seen = new Map<string, Page>();
  function* load(ref: Ref): Generator<string, Page, MemoryPageData | null> {
    if (seen.has(ref.id)) return seen.get(ref.id)!;
    const data = yield ref.id;
    memoryRequire(data, "committed history page is missing");
    memoryObject(data, ["format", "world", "node"]);
    memoryRequire(
      data.format === 1 &&
        data.world === world &&
        Buffer.byteLength(JSON.stringify(data)) <= MEMORY_PAGE_BYTES &&
        pageDigest(JSON.stringify(data.node)) === ref.digest,
      "history page changed",
    );
    const node = data.node;
    memoryObject(node);
    memoryRequire(["text", "block", "branch"].includes(node.type), "invalid history page");
    memoryObject(
      node,
      node.type === "text" ? ["type", "text"] : node.type === "block" ? ["type", "content"] : ["type", "children"],
    );
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
  const records = yield* tree(raw.records),
    scenes = yield* tree(raw.scenes),
    receipts = yield* tree(raw.receipts);
  const rows = (value: Tree) => value.groups.flatMap((group) => group.entries);
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
    pageIds: [...seen.keys()],
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
