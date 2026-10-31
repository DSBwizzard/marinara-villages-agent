import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { SocialWish } from "../../../shared/contracts/wishes.js";
import { immutableMemoryValue, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { immutableSocialWishes, readSocialWish, socialWishCollectionSource } from "../../domain/rules/social-wishes.js";
import {
  createHistoryPageReader,
  createHistoryPageWriter,
  createMemoryPageTracer,
  readHistoryPageRef,
  validateMemoryPageData,
  MEMORY_PAGE_KIND,
  type HistoryPageRef,
  type HistoryPageTree,
  type MemoryPageData,
} from "./memory-pages.js";
import { isRepairSimulation } from "./repair-gate.js";

export type WishHistoryScope = { seed: string; setupAt: string; actorId: string };
export type WishHistoryHead = { format: 1; world: string; count: number; root: HistoryPageRef };
export type WishArchiveEntry = { actorId: string; name: string; head: WishHistoryHead };
export type WishWorldScope = { seed: string; setupAt: string };
type Tail = { count: number; root: HistoryPageRef | null };
type Fields = Omit<SocialWish, "conditions" | "history">;
type Header = { fields: Fields; conditions: Tail; history: Tail };
type Value = {
  value: SocialWish;
  header: Header;
  conditions: HistoryPageTree;
  history: HistoryPageTree;
  bytes: number;
};
type Layout = {
  head: WishHistoryHead | null;
  rows: SocialWish[];
  tree: HistoryPageTree;
  values: Map<string, Value>;
  bytes: number;
};
const rowBytes = new WeakMap<object, number>();
function wishBytes(wish: SocialWish) {
  const { conditions, history, ...fields } = wish;
  let bytes = Buffer.byteLength(JSON.stringify({ ...fields, conditions: [], history: [] }));
  for (const rows of [conditions, history]) {
    for (const row of rows) {
      let size = rowBytes.get(row);
      if (size === undefined) rowBytes.set(row, (size = Buffer.byteLength(JSON.stringify(row))));
      bytes += size;
    }
    bytes += Math.max(0, rows.length - 1);
  }
  return bytes;
}
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 32);
export const wishArchiveWorld = (scope: WishWorldScope) => hash([scope.seed, scope.setupAt, "wish-archive"]);
export const wishArchiveKey = (row: WishArchiveEntry) => hash([row.actorId, row.head]);
function archiveEntry(raw: unknown, id: string, scope: WishWorldScope): WishArchiveEntry {
  memoryObject(raw, ["actorId", "name", "head"]);
  memoryRequire(typeof raw.actorId === "string" && typeof raw.name === "string", "invalid archived Wish owner");
  const head = readWishHistoryHead(raw.head, { ...scope, actorId: raw.actorId });
  memoryRequire(head, "empty archived Wish history");
  const row = { actorId: raw.actorId, name: raw.name, head };
  memoryRequire(id === wishArchiveKey(row), "archived Wish identity changed");
  return row;
}
export function readWishArchiveHead(raw: unknown, scope: WishWorldScope): Tail {
  return readTail(raw, wishArchiveWorld(scope));
}
export function wishHistoryWorld(scope: WishHistoryScope) {
  memoryRequire(
    typeof scope.seed === "string" &&
      typeof scope.setupAt === "string" &&
      typeof scope.actorId === "string" &&
      !!scope.actorId,
    "invalid Wish history owner",
  );
  return hash([scope.seed, scope.setupAt, "wishes", scope.actorId]);
}
const tailWorld = (world: string, id: string, kind: "conditions" | "history") => hash([world, id, kind]);
function readTail(raw: unknown, world: string): Tail {
  memoryObject(raw, ["count", "root"]);
  memoryRequire(Number.isSafeInteger(raw.count) && raw.count >= 0, "invalid Wish history count");
  const root = readHistoryPageRef(raw.root, world);
  memoryRequire((raw.count === 0) === (root === null), "invalid Wish history root");
  return immutableMemoryValue({ count: raw.count, root });
}
export function readWishHistoryHead(raw: unknown, scope: WishHistoryScope): WishHistoryHead | null {
  if (raw === null) return null;
  memoryObject(raw, ["format", "world", "count", "root"]);
  const world = wishHistoryWorld(scope);
  memoryRequire(raw.format === 1 && raw.world === world, "Wish history belongs to another owner");
  const tail = readTail({ count: raw.count, root: raw.root }, world);
  memoryRequire(tail.root && tail.count > 0, "empty Wish history must have no head");
  return immutableMemoryValue({ format: 1, world, count: tail.count, root: tail.root });
}
function header(raw: unknown, id: string, world: string): Header {
  memoryObject(raw, ["fields", "conditions", "history"]);
  memoryObject(raw.fields);
  memoryRequire(
    raw.fields.id === id && !Object.hasOwn(raw.fields, "conditions") && !Object.hasOwn(raw.fields, "history"),
    "invalid Wish header identity",
  );
  const {
    conditions: _conditions,
    history: _history,
    ...canonical
  } = readSocialWish({ ...raw.fields, conditions: [], history: [] });
  memoryRequire(JSON.stringify(canonical) === JSON.stringify(raw.fields), "noncanonical saved Wish header");
  readTail(raw.conditions, tailWorld(world, id, "conditions"));
  readTail(raw.history, tailWorld(world, id, "history"));
  return raw as Header;
}
function align(tree: HistoryPageTree, rows: { id: string }[]): HistoryPageTree {
  const values = new Map(rows.map((row) => [row.id, row]));
  return {
    ...tree,
    groups: tree.groups.map((group) => ({
      ...group,
      entries: group.entries.map(([id]) => [id, values.get(id)!] as [string, unknown]),
    })),
  };
}

/** Each Wish's append-only events have their own tree, independent of its changing current fields. */
export function encodeWishHistory(input: SocialWish[], scope: WishHistoryScope, previous?: Layout) {
  const world = wishHistoryWorld(scope),
    rows = immutableSocialWishes(input);
  memoryRequire(new Set(rows.map((row) => row.id)).size === rows.length, "duplicate Wish identity");
  memoryRequire(!previous?.head || previous.head.world === world, "previous Wish history belongs to another owner");
  const pages = new Map<string, MemoryPageData>(),
    values = new Map<string, Value>();
  let serializedBytes = 0;
  const entries: [string, unknown][] = [];
  for (const wish of rows) {
    const old = previous?.values.get(wish.id);
    if (old?.value === wish) {
      values.set(wish.id, old);
      entries.push([wish.id, old.header]);
      continue;
    }
    const tails = {} as Pick<Value, "conditions" | "history">;
    for (const kind of ["conditions", "history"] as const) {
      memoryRequire(
        new Set(wish[kind].map((row) => row.id)).size === wish[kind].length,
        "duplicate Wish event identity",
      );
      const writer = createHistoryPageWriter(tailWorld(world, wish.id, kind));
      tails[kind] = writer.tree(
        wish[kind].map((row): [string, unknown] => [row.id, row]),
        old?.[kind],
      );
      for (const [id, data] of writer.pages) pages.set(id, data);
      serializedBytes += writer.serializedBytes;
    }
    const { conditions, history, ...fields } = wish;
    const saved: Header = immutableMemoryValue({
      fields,
      conditions: { count: conditions.length, root: tails.conditions.root },
      history: { count: history.length, root: tails.history.root },
    });
    values.set(wish.id, { value: wish, header: saved, ...tails, bytes: wishBytes(wish) });
    entries.push([wish.id, saved]);
  }
  const writer = createHistoryPageWriter(world),
    tree = writer.tree(entries, previous?.tree);
  for (const [id, data] of writer.pages) pages.set(id, data);
  serializedBytes += writer.serializedBytes;
  const head: WishHistoryHead | null = tree.root
    ? immutableMemoryValue({ format: 1, world, count: rows.length, root: tree.root })
    : null;
  return {
    head,
    rows,
    tree,
    values,
    pages,
    serializedBytes,
    bytes: [...values.values()].reduce((sum, value) => sum + value.bytes, rows.length + 2),
  };
}

function* decoder(raw: unknown, scope: WishHistoryScope): Generator<string, Layout, MemoryPageData | null> {
  const head = readWishHistoryHead(raw, scope),
    world = wishHistoryWorld(scope),
    reader = createHistoryPageReader(world);
  const tree = yield* reader.tree(head?.root ?? null),
    values = new Map<string, Value>(),
    decoded: SocialWish[] = [];
  const entries = reader.rows(tree);
  memoryRequire(entries.length === (head?.count ?? 0), "Wish collection count changed");
  for (const [id, rawValue] of entries) {
    const saved = header(rawValue, id, world),
      tails = {} as Pick<Value, "conditions" | "history">;
    const fields = {} as Pick<SocialWish, "conditions" | "history">;
    for (const kind of ["conditions", "history"] as const) {
      const nested = createHistoryPageReader(tailWorld(world, id, kind));
      tails[kind] = yield* nested.tree(saved[kind].root);
      const events = nested.rows(tails[kind]);
      memoryRequire(
        events.length === saved[kind].count &&
          events.every(([key, value]) => !!value && typeof value === "object" && (value as { id?: string }).id === key),
        "Wish event identity or count changed",
      );
      fields[kind] = events.map(([, value]) => value) as never;
    }
    const value = { ...saved.fields, ...fields },
      wish = immutableSocialWishes([value])[0];
    memoryRequire(JSON.stringify(wish) === JSON.stringify(value), "noncanonical saved Wish events");
    decoded.push(wish);
    values.set(id, {
      value: wish,
      header: saved,
      conditions: align(tails.conditions, wish.conditions),
      history: align(tails.history, wish.history),
      bytes: wishBytes(wish),
    });
  }
  const rows = immutableSocialWishes(decoded);
  return {
    head,
    rows,
    tree,
    values,
    bytes: [...values.values()].reduce((sum, value) => sum + value.bytes, rows.length + 2),
  };
}
export function decodeWishHistorySync(
  raw: unknown,
  scope: WishHistoryScope,
  get: (id: string) => MemoryPageData | null,
) {
  const source = decoder(raw, scope);
  let next = source.next();
  while (next.done === false) next = source.next(get(next.value));
  return next.value;
}

export function createWishHistoryStore(documents: CapabilityDocumentStore) {
  const associations = new WeakMap<SocialWish[], Layout>();
  const cached = new Map<string, { layout: Layout; bytes: number }>();
  const live = new Map<string, Layout>();
  let liveHeads = new Set<string>();
  let worldHeads = new Set<string>();
  let sceneHeads = new Set<string>();
  let cachedBytes = 0;
  const usable = () => !isRepairSimulation(documents);
  const key = (head: WishHistoryHead) => JSON.stringify(head);
  function remember(layout: Layout) {
    if (!usable()) return;
    associations.set(layout.rows, layout);
    if (!layout.head) return;
    const id = key(layout.head);
    if (liveHeads.has(id)) {
      live.set(id, layout);
      return;
    }
    cachedBytes -= cached.get(id)?.bytes ?? 0;
    cached.delete(id);
    cached.set(id, { layout, bytes: layout.bytes });
    cachedBytes += layout.bytes;
    while (cached.size > 8 || cachedBytes > 4 * 1024 * 1024) {
      const oldest = cached.keys().next().value!;
      cachedBytes -= cached.get(oldest)!.bytes;
      cached.delete(oldest);
    }
  }
  async function page(id: string) {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row?.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned Wish history page is missing or changed",
    );
    validateMemoryPageData(row.data, id);
    return row.data as MemoryPageData;
  }
  async function read(raw: unknown, scope: WishHistoryScope) {
    const head = readWishHistoryHead(raw, scope);
    if (head) await page(head.root.id);
    const warm = head && usable() ? (live.get(key(head)) ?? cached.get(key(head))?.layout) : undefined;
    if (warm) return warm.rows;
    const source = decoder(head, scope);
    let next = source.next();
    while (next.done === false) {
      const data = await page(next.value);
      next = source.next(data);
    }
    remember(next.value);
    return next.value.rows;
  }
  async function prepare(input: SocialWish[], scope: WishHistoryScope, previous: WishHistoryHead | null) {
    readWishHistoryHead(previous, scope);
    const original = usable() ? associations.get(socialWishCollectionSource(input)) : undefined;
    const protectedLayout =
      original && JSON.stringify(original.head) === JSON.stringify(previous) ? original : undefined;
    const encoded = encodeWishHistory(input, scope, protectedLayout);
    await publish(encoded.pages);
    remember(encoded);
    return { head: encoded.head, rows: encoded.rows };
  }
  async function publish(pages: Map<string, MemoryPageData>) {
    for (const [id, data] of pages) {
      const existing = await documents.getById("villages", id);
      if (existing)
        memoryRequire(JSON.stringify(await page(id)) === JSON.stringify(data), "immutable Wish history changed");
      else {
        const stamp = new Date().toISOString();
        try {
          await documents.create({
            id,
            packageId: "villages",
            kind: MEMORY_PAGE_KIND,
            name: "Private Wish history",
            description: "Immutable desire, condition or history page",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
        } catch (error) {
          try {
            memoryRequire(JSON.stringify(await page(id)) === JSON.stringify(data), "immutable Wish history changed");
          } catch {
            throw error;
          }
        }
      }
    }
  }
  async function appendArchive(raw: unknown, scope: WishWorldScope, additions: WishArchiveEntry[]) {
    const head = readWishArchiveHead(raw, scope);
    if (!additions.length) return head;
    const world = wishArchiveWorld(scope),
      reader = createHistoryPageReader(world);
    const source = reader.tree(head.root);
    let next = source.next();
    while (next.done === false) next = source.next(await page(next.value));
    const tree = next.value,
      rows = reader.rows(tree);
    memoryRequire(rows.length === head.count, "Wish archive count changed");
    for (const [id, row] of rows) archiveEntry(row, id, scope);
    const entries = new Map(rows);
    for (const row of additions) entries.set(wishArchiveKey(row), row);
    const writer = createHistoryPageWriter(world),
      saved = writer.tree([...entries], tree);
    await publish(writer.pages);
    return { count: entries.size, root: saved.root };
  }
  type Owner = { head: WishHistoryHead | null; rows?: SocialWish[] };
  function retain(owners: Owner[], scene: boolean) {
    if (!usable()) return;
    const heads = new Set(owners.flatMap(({ head }) => (head ? [key(head)] : [])));
    if (scene) sceneHeads = heads;
    else worldHeads = heads;
    liveHeads = new Set([...worldHeads, ...sceneHeads]);
    for (const id of live.keys()) if (!liveHeads.has(id)) live.delete(id);
    for (const { head, rows } of owners) {
      if (!head) continue;
      const id = key(head),
        known = rows ? associations.get(socialWishCollectionSource(rows)) : undefined;
      const layout = known?.head && key(known.head) === id ? known : cached.get(id)?.layout;
      if (layout) live.set(id, layout);
    }
  }
  return {
    read,
    prepare,
    appendArchive,
    retain: (owners: Owner[]) => retain(owners, false),
    retainScene: (owners: Owner[]) => retain(owners, true),
  };
}

const stores = new WeakMap<CapabilityDocumentStore, ReturnType<typeof createWishHistoryStore>>();
export function wishHistoryStore(documents: CapabilityDocumentStore) {
  let store = stores.get(documents);
  if (!store) stores.set(documents, (store = createWishHistoryStore(documents)));
  return store;
}

/** Page summaries are shared across retained heads, so checkpoint tracing never replays whole libraries. */
export function createWishHistoryTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const pages = createMemoryPageTracer(get),
    checked = new Map<string, { height: number; count: number; kind: string }>();
  const keys = new Map<string, { ids?: string[]; children?: HistoryPageRef[] }>(),
    unique = new Set<string>();
  function distinct(ref: HistoryPageRef | null) {
    if (!ref || unique.has(ref.id)) return;
    const ids = new Set<string>(),
      visited = new Set<string>();
    function walk(current: HistoryPageRef) {
      memoryRequire(!visited.has(current.id), "duplicate Wish history subtree");
      visited.add(current.id);
      const summary = keys.get(current.id)!;
      if (summary.children) for (const child of summary.children) walk(child);
      else
        for (const id of summary.ids!) {
          memoryRequire(!ids.has(id), "duplicate Wish history identity");
          ids.add(id);
        }
    }
    walk(ref);
    unique.add(ref.id);
  }
  async function tree(
    ref: HistoryPageRef | null,
    world: string,
    kind: "wishes" | "conditions" | "history",
    fields?: Fields,
  ): Promise<number> {
    if (!ref) return 0;
    readHistoryPageRef(ref, world);
    const prior = checked.get(ref.id);
    if (prior) {
      memoryRequire(prior.height === ref.height && prior.kind === kind, "Wish history page role changed");
      return prior.count;
    }
    const node = await pages.readNode(ref, world);
    let count = 0;
    if (node.type === "branch") {
      keys.set(ref.id, { children: node.children.map((child) => readHistoryPageRef(child, world)!) });
      for (const child of node.children) count += await tree(readHistoryPageRef(child, world), world, kind, fields);
    } else {
      memoryRequire(node.type === "block" && ref.height === 0, "invalid Wish history directory");
      const rows = JSON.parse(await pages.readText(node.content, world));
      memoryRequire(Array.isArray(rows) && rows.length > 0 && rows.length <= 64, "invalid Wish history block");
      for (const row of rows)
        memoryRequire(
          Array.isArray(row) && row.length === 2 && typeof row[0] === "string",
          "invalid Wish history entry",
        );
      count = rows.length;
      keys.set(ref.id, { ids: rows.map(([id]: [string]) => id) });
      if (kind === "wishes")
        for (const [id, value] of rows) {
          const saved = header(value, id, world);
          for (const field of ["conditions", "history"] as const) {
            memoryRequire(
              (await tree(saved[field].root, tailWorld(world, id, field), field, saved.fields)) === saved[field].count,
              "Wish event count changed",
            );
            distinct(saved[field].root);
          }
        }
      else {
        memoryRequire(
          fields && rows.every(([id, value]: [string, { id?: string }]) => value?.id === id),
          "invalid Wish event key",
        );
        const canonical = readSocialWish({
          ...fields,
          conditions: [],
          history: [],
          [kind]: rows.map(([, value]: [string, unknown]) => value),
        });
        memoryRequire(
          JSON.stringify(canonical[kind]) === JSON.stringify(rows.map(([, value]: [string, unknown]) => value)),
          "noncanonical saved Wish events",
        );
      }
    }
    checked.set(ref.id, { height: ref.height, count, kind });
    return count;
  }
  async function trace(raw: unknown, scope: WishHistoryScope) {
    const head = readWishHistoryHead(raw, scope);
    memoryRequire(
      (await tree(head?.root ?? null, wishHistoryWorld(scope), "wishes")) === (head?.count ?? 0),
      "Wish collection count changed",
    );
    distinct(head?.root ?? null);
  }
  const archives = new Map<string, { count: number; height: number }>();
  async function archiveTree(ref: HistoryPageRef | null, scope: WishWorldScope): Promise<number> {
    if (!ref) return 0;
    const world = wishArchiveWorld(scope),
      node = await pages.readNode(ref, world);
    readHistoryPageRef(ref, world);
    const prior = archives.get(ref.id);
    if (prior) {
      memoryRequire(prior.height === ref.height, "Wish archive depth changed");
      return prior.count;
    }
    let count = 0;
    if (node.type === "branch") {
      keys.set(ref.id, { children: node.children.map((child) => readHistoryPageRef(child, world)!) });
      for (const child of node.children) count += await archiveTree(readHistoryPageRef(child, world), scope);
    } else {
      memoryRequire(node.type === "block" && ref.height === 0, "invalid Wish archive directory");
      const rows = JSON.parse(await pages.readText(node.content, world));
      memoryRequire(Array.isArray(rows) && rows.length > 0 && rows.length <= 64, "invalid Wish archive block");
      for (const row of rows) {
        memoryRequire(
          Array.isArray(row) && row.length === 2 && typeof row[0] === "string",
          "invalid Wish archive entry",
        );
        const owner = archiveEntry(row[1], row[0], scope);
        await trace(owner.head, { ...scope, actorId: owner.actorId });
      }
      count = rows.length;
      keys.set(ref.id, { ids: rows.map(([id]: [string]) => id) });
    }
    archives.set(ref.id, { count, height: ref.height });
    return count;
  }
  async function traceArchive(raw: unknown, scope: WishWorldScope) {
    const head = readWishArchiveHead(raw, scope);
    memoryRequire((await archiveTree(head.root, scope)) === head.count, "Wish archive count changed");
    distinct(head.root);
  }
  return { trace, traceArchive };
}
