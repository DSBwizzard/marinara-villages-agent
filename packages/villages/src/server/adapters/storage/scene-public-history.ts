import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueLine, VenueScene } from "../../domain/models/scene-model.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { isImmutableSceneLine } from "../../domain/rules/scene-transcript.js";
import { publicSceneHistoryProjection, publicSceneResponse } from "../../domain/rules/scene-public.js";
import { isRepairSimulation } from "./repair-gate.js";
import {
  createHistoryPageReader,
  createHistoryPageWriter,
  createMemoryPageTracer,
  historyPageHeight,
  readHistoryPageRef,
  validateMemoryPageData,
  MEMORY_PAGE_KIND,
  type HistoryPageRef,
  type HistoryPageTree,
  type MemoryPageData,
} from "./memory-pages.js";
import { readSceneTranscriptHead, type SceneTranscriptHead } from "./scene-transcript-pages.js";
import { readSceneSubmissionHead, type SceneSubmissionHead } from "./scene-submission-pages.js";
import {
  createScenePresentations,
  createScenePresentationTracer,
  encodeScenePresentations,
  readScenePresentationHead,
  type ScenePresentationHead,
} from "./scene-presentation-pages.js";

type Owner = Pick<VenueScene, "id" | "villageSeed" | "participants">;
export type PublicScenePosition = { id: string; position: number; publicDigest: string };
export type ScenePublicHistoryHead = {
  format: 2;
  world: string;
  count: number;
  lineCount: number;
  positions: HistoryPageRef | null;
  source: string;
  publicVersion: string;
  privateHearing: boolean;
  presentation: ScenePresentationHead;
};
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const emptyVersion = hash("public-empty");
const worldOf = (scene: Owner) =>
  hash(JSON.stringify([scene.id, scene.villageSeed ?? "", "public-history"])).slice(0, 32);
const sourceOf = (
  scene: Owner,
  transcript: SceneTranscriptHead,
  submissions: SceneSubmissionHead,
  privateHearing: boolean,
) =>
  hash(
    JSON.stringify([transcript, submissions, scene.participants.map((person) => person.characterId), privateHearing]),
  );

export function readScenePublicHistoryHead(
  value: unknown,
  scene: Owner,
  transcript: SceneTranscriptHead,
  submissions: SceneSubmissionHead,
): ScenePublicHistoryHead {
  memoryObject(value, [
    "format",
    "world",
    "count",
    "lineCount",
    "positions",
    "source",
    "publicVersion",
    "privateHearing",
    "presentation",
  ]);
  memoryRequire(
    Array.isArray(scene.participants) &&
      scene.participants.every((person) => person && typeof person.characterId === "string" && person.characterId),
    "invalid public Scene history source ownership",
  );
  memoryRequire(
    value.format === 2 &&
      value.world === worldOf(scene) &&
      Number.isSafeInteger(value.count) &&
      value.count >= 0 &&
      value.count <= transcript.count &&
      value.lineCount === transcript.count &&
      typeof value.privateHearing === "boolean",
    "invalid public Scene history owner",
  );
  memoryRequire(
    value.source === sourceOf(scene, transcript, submissions, value.privateHearing) &&
      typeof value.publicVersion === "string" &&
      /^[a-f0-9]{64}$/.test(value.publicVersion),
    "public Scene history source changed",
  );
  const positions = readHistoryPageRef(value.positions, value.world);
  memoryRequire(
    positions
      ? value.count > 0 && positions.height === historyPageHeight(value.count)
      : value.count === 0 && value.publicVersion === emptyVersion,
    "invalid public Scene history count",
  );
  const presentation = readScenePresentationHead(value.presentation, scene);
  memoryRequire(
    presentation.count <= value.count && presentation.source === value.source,
    "invalid Scene presentation source or count",
  );
  return value as ScenePublicHistoryHead;
}
function readPosition(value: unknown, id: string, lineCount: number): PublicScenePosition {
  memoryObject(value, ["id", "position", "publicDigest"]);
  memoryRequire(
    value.id === id &&
      id.length > 0 &&
      Number.isSafeInteger(value.position) &&
      value.position >= 0 &&
      value.position < lineCount &&
      typeof value.publicDigest === "string" &&
      /^[a-f0-9]{64}$/.test(value.publicDigest),
    "invalid public Scene history position",
  );
  return value as PublicScenePosition;
}
/** Only private timing changed; the caller preserves selection, prose, cast and hearing policy. */
export function rebindScenePublicHistory(
  head: ScenePublicHistoryHead,
  scene: Owner,
  transcript: SceneTranscriptHead,
  submissions: SceneSubmissionHead,
) {
  const source = sourceOf(scene, transcript, submissions, head.privateHearing);
  return readScenePublicHistoryHead(
    { ...head, source, presentation: { ...head.presentation, source } },
    scene,
    transcript,
    submissions,
  );
}
function projectLine(line: VenueLine, cast: Set<string>, privateHearing: boolean): VenueLine {
  const result = publicSceneResponse([line], cast, privateHearing);
  memoryRequire(result.length === 1, "public Scene history points to unpublished content");
  return result[0];
}
export function projectSceneHistoryPage(
  lines: VenueLine[],
  entries: PublicScenePosition[],
  participants: VenueScene["participants"],
  privateHearing: boolean,
): VenueLine[] {
  memoryRequire(lines.length === entries.length, "public Scene history page count changed");
  const cast = new Set(participants.map((person) => person.characterId));
  return lines.map((line, index) => {
    const projected = projectLine(line, cast, privateHearing);
    memoryRequire(
      line.id === entries[index].id && hash(JSON.stringify(projected)) === entries[index].publicDigest,
      "public Scene history content changed",
    );
    return projected;
  });
}
const lineDigests = new WeakMap<VenueLine, { policy: string; digest: string }>();
function lineDigest(line: VenueLine, cast: Set<string>, privateHearing: boolean) {
  // Only membership that changes this line's public output invalidates its cached digest.
  const policy = privateHearing
    ? "private"
    : line.contactHidden
      ? "sound"
      : "public:" + line.heardBy.map((id) => (cast.has(id) ? "1" : "0")).join("");
  const old = isImmutableSceneLine(line) ? lineDigests.get(line) : undefined;
  if (old?.policy === policy) return old.digest;
  const digest = hash(JSON.stringify(projectLine(line, cast, privateHearing)));
  if (isImmutableSceneLine(line)) lineDigests.set(line, { policy, digest });
  return digest;
}
// This public checksum excludes private positions and source heads, including when hidden-only content changes.
function publicVersion(layout: HistoryPageTree, known: WeakMap<HistoryPageRef, string>) {
  if (!layout.root) return emptyVersion;
  for (const group of layout.groups)
    if (!known.has(group.ref))
      known.set(
        group.ref,
        hash("public-leaf:" + group.entries.map(([, value]) => (value as PublicScenePosition).publicDigest).join("")),
      );
  for (let level = 1; level < layout.levels.length; level++)
    for (const [index, parent] of layout.levels[level].entries())
      if (!known.has(parent))
        known.set(
          parent,
          hash(
            "public-branch:" +
              layout.levels[level - 1]
                .slice(index * 32, (index + 1) * 32)
                .map((child) => known.get(child)!)
                .join(""),
          ),
        );
  return known.get(layout.root)!;
}
async function readPublicPage(documents: Pick<CapabilityDocumentStore, "getById">, id: string) {
  const row = await documents.getById("villages", id);
  memoryRequire(
    row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
    "owned public Scene history page is missing or changed",
  );
  validateMemoryPageData(row.data, id);
  return row.data as MemoryPageData;
}
async function consume<T>(
  read: Generator<string, T, MemoryPageData | null>,
  get: (id: string) => Promise<MemoryPageData>,
): Promise<T> {
  let next = read.next();
  while (next.done === false) next = read.next(await get(next.value));
  return next.value;
}
export async function readScenePublicHistoryRange(
  documents: Pick<CapabilityDocumentStore, "getById">,
  head: ScenePublicHistoryHead,
  lineCount: number,
  start: number,
  end: number,
) {
  const reader = createHistoryPageReader(head.world),
    entries = await consume(reader.range(head.positions, head.count, start, end), (id) =>
      readPublicPage(documents, id),
    );
  const rows = entries.map(([id, value]) => readPosition(value, id, lineCount));
  memoryRequire(
    rows.every((row, index) => index === 0 || row.position > rows[index - 1].position),
    "public Scene history order changed",
  );
  return rows;
}
function encodePositions(
  scene: VenueScene,
  transcript: SceneTranscriptHead,
  submissions: SceneSubmissionHead,
  old?: { rows: PublicScenePosition[]; layout: HistoryPageTree },
  versions = new WeakMap<HistoryPageRef, string>(),
) {
  readSceneTranscriptHead(transcript, scene);
  readSceneSubmissionHead(submissions, scene);
  memoryRequire(
    transcript.count === scene.lines.length && submissions.count === scene.submissions.length,
    "public Scene history publication source changed",
  );
  const projection = publicSceneHistoryProjection(scene),
    cast = new Set(scene.participants.map((person) => person.characterId));
  const rows = projection.positions.map((position, index) => {
    const line = scene.lines[position],
      publicDigest = lineDigest(line, cast, projection.privateHearing),
      before = old?.rows[index];
    return before && before.id === line.id && before.position === position && before.publicDigest === publicDigest
      ? before
      : { id: line.id, position, publicDigest };
  });
  const writer = createHistoryPageWriter(worldOf(scene)),
    layout = writer.tree(
      rows.map((row) => [row.id, row]),
      old?.layout,
    );
  const head: Omit<ScenePublicHistoryHead, "presentation"> = {
    format: 2,
    world: worldOf(scene),
    count: rows.length,
    lineCount: transcript.count,
    positions: layout.root ? Object.freeze({ ...layout.root }) : null,
    source: sourceOf(scene, transcript, submissions, projection.privateHearing),
    publicVersion: publicVersion(layout, versions),
    privateHearing: projection.privateHearing,
  };
  return { head, rows, layout, pages: writer.pages };
}
export function encodeScenePublicHistory(
  scene: VenueScene,
  transcript: SceneTranscriptHead,
  submissions: SceneSubmissionHead,
) {
  const result = encodePositions(scene, transcript, submissions);
  const presentation = encodeScenePresentations(scene, result.rows, result.head.privateHearing, result.head.source);
  return {
    ...result,
    head: { ...result.head, presentation: presentation.head },
    pages: new Map([...result.pages, ...presentation.pages]),
  };
}
export function createScenePublicHistory(documents: Pick<CapabilityDocumentStore, "getById" | "create">) {
  type Entry = { rows: PublicScenePosition[]; layout: HistoryPageTree };
  const cached = new Map<string, Entry>(),
    versions = new WeakMap<HistoryPageRef, string>();
  const presentations = createScenePresentations(documents);
  const usable = () => !isRepairSimulation(documents as CapabilityDocumentStore);
  const identity = (head: ScenePublicHistoryHead) => JSON.stringify([head.world, head.count, head.positions]);
  const page = (id: string) => readPublicPage(documents, id);
  function remember(head: ScenePublicHistoryHead, value: Entry) {
    if (!usable()) return;
    const key = identity(head);
    cached.delete(key);
    cached.set(key, value);
    while (cached.size > 4) cached.delete(cached.keys().next().value!);
  }
  async function read(head: ScenePublicHistoryHead, lineCount: number): Promise<Entry> {
    if (head.positions) await page(head.positions.id);
    const old = usable() ? cached.get(identity(head)) : undefined;
    if (old) {
      memoryRequire(
        (!old.rows.length || old.rows.at(-1)!.position < lineCount) &&
          publicVersion(old.layout, versions) === head.publicVersion,
        "public Scene history source changed",
      );
      return old;
    }
    const reader = createHistoryPageReader(head.world),
      layout = await consume(reader.tree(head.positions, { count: head.count, items: 64 }), page);
    const rows = reader.rows(layout).map(([id, value]) => readPosition(value, id, lineCount));
    memoryRequire(
      rows.every((row, index) => index === 0 || row.position > rows[index - 1].position),
      "public Scene history order changed",
    );
    memoryRequire(publicVersion(layout, versions) === head.publicVersion, "public Scene history version changed");
    const result = { rows, layout };
    remember(head, result);
    return result;
  }
  async function readRange(head: ScenePublicHistoryHead, lineCount: number, start: number, end: number) {
    return readScenePublicHistoryRange(documents, head, lineCount, start, end);
  }
  async function prepare(
    scene: VenueScene,
    transcript: SceneTranscriptHead,
    submissions: SceneSubmissionHead,
    previous?: ScenePublicHistoryHead,
  ) {
    memoryRequire(!previous || previous.world === worldOf(scene), "public Scene history publication source changed");
    const old = previous ? await read(previous, previous.lineCount) : undefined;
    const encoded = encodePositions(scene, transcript, submissions, old, versions);
    const { rows, layout, pages } = encoded;
    const presentation = await presentations.prepare(
      scene,
      rows,
      encoded.head.privateHearing,
      encoded.head.source,
      previous?.presentation,
    );
    const head = { ...encoded.head, presentation };
    const stamp = new Date().toISOString();
    for (const [id, data] of pages) {
      const existing = await documents.getById("villages", id);
      if (existing)
        memoryRequire(
          JSON.stringify(await page(id)) === JSON.stringify(data),
          "immutable public Scene history changed",
        );
      else {
        try {
          await documents.create({
            id,
            packageId: "villages",
            kind: MEMORY_PAGE_KIND,
            name: "Private Scene history index",
            description: "Public positions without duplicated prose",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
        } catch (error) {
          if (!(await documents.getById("villages", id))) throw error;
          memoryRequire(
            JSON.stringify(await page(id)) === JSON.stringify(data),
            "concurrent public Scene history changed",
          );
        }
      }
    }
    remember(head, { rows, layout });
    return head;
  }
  return { prepare, readRange };
}
const stores = new WeakMap<object, ReturnType<typeof createScenePublicHistory>>();
export function scenePublicHistoryStore(documents: CapabilityDocumentStore) {
  let store = stores.get(documents);
  if (!store) stores.set(documents, (store = createScenePublicHistory(documents)));
  return store;
}

export function createScenePublicHistoryTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const pages = new Map<string, Promise<MemoryPageData | null>>();
  const page = (id: string) => {
    let value = pages.get(id);
    if (!value) pages.set(id, (value = get(id)));
    return value;
  };
  const tracer = createMemoryPageTracer(page);
  const presentation = createScenePresentationTracer(page);
  type Summary = {
    height: number;
    count: number;
    first: number;
    last: number;
    version: string;
    rows?: PublicScenePosition[];
    children?: HistoryPageRef[];
  };
  const checked = new Map<string, Summary>();
  async function inspect(ref: HistoryPageRef, world: string): Promise<Summary> {
    const known = checked.get(ref.id);
    if (known) {
      memoryRequire(known.height === ref.height, "public Scene history depth changed");
      return known;
    }
    const node = await tracer.readNode(ref, world);
    memoryRequire(node.type !== "text", "invalid public Scene history directory");
    let count = 0,
      first = -1,
      last = -1,
      version: string;
    let leafRows: PublicScenePosition[] | undefined, children: HistoryPageRef[] | undefined;
    if (node.type === "branch") {
      children = node.children.map((child) => readHistoryPageRef(child, world)!);
      const hashes: string[] = [],
        capacity = 64 * 32 ** (ref.height - 1);
      for (const [index, child] of children.entries()) {
        const value = await inspect(child, world);
        memoryRequire(
          value.count <= capacity && (index === children.length - 1 || value.count === capacity) && value.first > last,
          "invalid packed public Scene history branch",
        );
        if (first === -1) first = value.first;
        last = value.last;
        count += value.count;
        hashes.push(value.version);
      }
      version = hash("public-branch:" + hashes.join(""));
    } else {
      const rows: unknown = JSON.parse(await tracer.readText(node.content, world));
      memoryRequire(Array.isArray(rows) && rows.length > 0 && rows.length <= 64, "invalid public Scene history block");
      const hashes: string[] = [],
        ids = new Set<string>();
      leafRows = [];
      for (const row of rows) {
        memoryRequire(
          Array.isArray(row) && row.length === 2 && typeof row[0] === "string" && !ids.has(row[0]),
          "invalid public Scene history identity",
        );
        const value = readPosition(row[1], row[0], Number.MAX_SAFE_INTEGER);
        leafRows.push(value);
        memoryRequire(value.position > last, "public Scene history order changed");
        if (first === -1) first = value.position;
        last = value.position;
        ids.add(value.id);
        hashes.push(value.publicDigest);
      }
      count = rows.length;
      version = hash("public-leaf:" + hashes.join(""));
    }
    const summary = { height: ref.height, count, first, last, version, rows: leafRows, children };
    checked.set(ref.id, summary);
    return summary;
  }
  return {
    async trace(head: ScenePublicHistoryHead, scene: Owner) {
      memoryRequire(
        head.positions ? head.count > 0 && head.positions.height === historyPageHeight(head.count) : head.count === 0,
        "invalid public Scene history depth",
      );
      const coverage = await presentation.trace(head.presentation, scene, head.lineCount);
      const value = head.positions
        ? await inspect(head.positions, head.world)
        : { count: 0, last: -1, version: emptyVersion };
      memoryRequire(
        value.count === head.count && value.last < head.lineCount && value.version === head.publicVersion,
        "public Scene history count or version changed",
      );
      memoryRequire(coverage.size === head.count, "Scene presentation coverage changed");
      function compare(ref: HistoryPageRef) {
        const summary = checked.get(ref.id)!;
        for (const row of summary.rows ?? []) {
          const moment = coverage.get(row.position);
          memoryRequire(
            moment?.id === row.id && moment.publicDigest === row.publicDigest,
            "Scene presentation coverage changed",
          );
        }
        for (const child of summary.children ?? []) compare(child);
      }
      if (head.positions) compare(head.positions);
    },
  };
}
