import { createHash } from "node:crypto";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { z } from "zod";
import { groupSceneMoments } from "../../../shared/helpers/scene-speech.js";
import { villagesWalk } from "../../../shared/helpers/scene-paragraphs.js";
import {
  advanceStaging,
  createStagingCursor,
  lineStagingCues,
  restoreStagingCursor,
  stagingBoundaries,
  stagingCheckpoint,
  stagingPresentation,
  type StagingCheckpoint,
  type StagingPresentation,
} from "../../../shared/helpers/scene-staging.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { publicSceneResponse } from "../../domain/rules/scene-public.js";
import { isImmutableSceneLine } from "../../domain/rules/scene-transcript.js";
import { isRepairSimulation } from "./repair-gate.js";
import {
  createHistoryPageReader,
  createHistoryPageWriter,
  createMemoryPageTracer,
  historyPageHeight,
  MEMORY_PAGE_KIND,
  readHistoryPageRef,
  validateMemoryPageData,
  type HistoryPageRef,
  type HistoryPageTree,
  type MemoryPageData,
} from "./memory-pages.js";

type Owner = Pick<VenueScene, "id" | "villageSeed" | "participants">;
type Position = { id: string; position: number; publicDigest: string };
export type SceneMomentPosition = {
  id: string;
  paragraphStart: number;
  paragraphs: number;
  lines: Position[];
  source: string;
  frame: HistoryPageRef;
  publicDigest: string;
};
export type SceneMomentPresentation = { start: StagingPresentation; end: StagingPresentation };
export type ScenePresentationHead = {
  format: 1;
  world: string;
  initialIds: string[];
  count: number;
  paragraphs: number;
  moments: HistoryPageRef | null;
  publicVersion: string;
  source: string;
  current: Omit<StagingCheckpoint, "actors"> & { count: number; actors: HistoryPageRef | null };
};
type Entry = {
  moments: SceneMomentPosition[];
  layout: HistoryPageTree;
  actors: StagingCheckpoint["actors"];
  actorLayout: HistoryPageTree;
};
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const worldOf = (scene: Owner) =>
  hash(JSON.stringify([scene.id, scene.villageSeed ?? "", "presentation"])).slice(0, 32);
const emptyVersion = hash("presentation-empty");
const MOMENTS_PER_BLOCK = 32;
const id = z.string().min(1),
  ids = z.array(id).refine((value) => new Set(value).size === value.length),
  digest = z.string().regex(/^[a-f0-9]{64}$/),
  look = z.discriminatedUnion("target", [
    z.object({ target: z.literal("player") }).strict(),
    z.object({ target: z.literal("villager"), characterId: id }).strict(),
    z.object({ target: z.literal("direction"), direction: z.enum(["left", "right"]) }).strict(),
  ]),
  person = z.object({ position: z.enum(["left", "center", "right"]), expression: z.string(), look }).strict(),
  facing = z.enum(["front", "left", "right"]),
  finite = z.number().finite(),
  presentation = z
    .object({
      state: z.record(z.string(), person),
      activeIds: ids,
      desktop: z.record(z.string(), z.object({ x: finite, width: finite.positive(), facing }).strict()),
      mobile: z.record(z.string(), z.object({ x: finite, depth: finite, facing }).strict()),
    })
    .strict(),
  frames = z.object({ start: presentation, end: presentation }).strict(),
  actor = z.object({ id, person: person.optional(), explicit: z.boolean() }).strict(),
  current = z
    .object({
      count: z.number().int().nonnegative().safe(),
      actors: z.unknown(),
      activeIds: ids,
      initialSlots: ids.max(4),
      firstBefore: ids.max(4).optional(),
      seenAttendance: ids.max(4),
    })
    .strict();

function assertIds(value: readonly string[], cast: Set<string>) {
  memoryRequire(
    value.every((id) => cast.has(id)),
    "Scene presentation names an uncaptured resident",
  );
}
export function readScenePresentationHead(value: unknown, scene: Owner): ScenePresentationHead {
  memoryObject(value, [
    "format",
    "world",
    "initialIds",
    "count",
    "paragraphs",
    "moments",
    "publicVersion",
    "source",
    "current",
  ]);
  memoryRequire(
    value.format === 1 && value.world === worldOf(scene) && Number.isSafeInteger(value.count) && value.count >= 0,
    "invalid Scene presentation owner",
  );
  memoryRequire(
    Number.isSafeInteger(value.paragraphs) && value.paragraphs >= 0 && (value.count > 0 || value.paragraphs === 0),
    "invalid Scene paragraph count",
  );
  ids.parse(value.initialIds);
  digest.parse(value.publicVersion);
  digest.parse(value.source);
  current.parse(value.current);
  const cast = new Set(scene.participants.map((entry) => entry.characterId));
  assertIds(value.initialIds, cast);
  for (const key of ["activeIds", "initialSlots", "firstBefore", "seenAttendance"] as const)
    assertIds(value.current[key] ?? [], cast);
  for (const [root, count, items] of [
    [value.moments, value.count, MOMENTS_PER_BLOCK],
    [value.current.actors, value.current.count, 64],
  ] as const) {
    const ref = readHistoryPageRef(root, value.world);
    memoryRequire(
      ref ? count > 0 && ref.height === historyPageHeight(count, items) : count === 0,
      "invalid Scene presentation count",
    );
  }
  memoryRequire(value.count > 0 || value.publicVersion === emptyVersion, "invalid empty Scene presentation");
  return value as ScenePresentationHead;
}
function readMoment(value: unknown, key: string, head: ScenePresentationHead, lineCount: number): SceneMomentPosition {
  memoryObject(value, ["id", "paragraphStart", "paragraphs", "lines", "source", "frame", "publicDigest"]);
  memoryRequire(value.id === key, "Scene moment identity changed");
  id.parse(key);
  memoryRequire(
    Number.isSafeInteger(value.paragraphStart) &&
      value.paragraphStart >= 0 &&
      Number.isSafeInteger(value.paragraphs) &&
      value.paragraphs >= 0 &&
      Number.isSafeInteger(value.paragraphStart + value.paragraphs),
    "invalid Scene paragraph position",
  );
  digest.parse(value.source);
  digest.parse(value.publicDigest);
  memoryRequire(Array.isArray(value.lines) && value.lines.length > 0, "empty Scene moment");
  const seen = new Set<string>();
  for (const entry of value.lines) {
    memoryObject(entry, ["id", "position", "publicDigest"]);
    id.parse(entry.id);
    digest.parse(entry.publicDigest);
    memoryRequire(
      !seen.has(entry.id) && Number.isSafeInteger(entry.position) && entry.position >= 0 && entry.position < lineCount,
      "invalid Scene moment position",
    );
    seen.add(entry.id);
  }
  memoryRequire(
    value.lines[0].id === key && readHistoryPageRef(value.frame, head.world)?.height === 0,
    "invalid Scene moment frame",
  );
  return value as SceneMomentPosition;
}
function readFrames(value: unknown, cast: Set<string>): SceneMomentPresentation {
  frames.parse(value);
  const result = value as SceneMomentPresentation;
  // Record parsing drops special object keys; validate their exact original values too.
  for (const frame of [result.start, result.end]) {
    for (const pose of Object.values(frame.state)) person.parse(pose);
    for (const slot of Object.values(frame.desktop))
      z.object({ x: finite, width: finite.positive(), facing }).strict().parse(slot);
    for (const slot of Object.values(frame.mobile)) z.object({ x: finite, depth: finite, facing }).strict().parse(slot);
  }
  assertFrameCast(result, cast);
  return result;
}
function assertFrameCast(result: SceneMomentPresentation, cast: Set<string>) {
  for (const frame of [result.start, result.end]) {
    const visible = new Set(frame.activeIds);
    assertIds(frame.activeIds, cast);
    for (const fields of [frame.state, frame.desktop])
      memoryRequire(
        Object.keys(fields).length === visible.size && Object.keys(fields).every((id) => visible.has(id)),
        "Scene frame visibility changed",
      );
    memoryRequire(
      Object.keys(frame.mobile).length <= 4 && Object.keys(frame.mobile).every((id) => visible.has(id)),
      "invalid mobile Scene frame",
    );
    for (const person of Object.values(frame.state))
      memoryRequire(
        person.look.target !== "villager" || visible.has(person.look.characterId),
        "Scene frame exposes unseen gaze",
      );
  }
}
function momentDigest(lines: Position[], frame: SceneMomentPresentation, paragraphs: number) {
  return hash(JSON.stringify([lines.map((line) => [line.id, line.publicDigest]), frame, paragraphs]));
}
const sourceSignatures = new WeakMap<
  VenueScene["lines"][number],
  {
    positions: Pick<Position, "id" | "publicDigest">[];
    beforeIds?: string[];
    afterIds?: string[];
    signature: string;
  }
>();
function sourceSignature(
  line: VenueScene["lines"][number],
  positions: Position[],
  beforeIds?: string[],
  afterIds?: string[],
) {
  const old = isImmutableSceneLine(line) ? sourceSignatures.get(line) : undefined;
  const sameIds = (a: string[] | undefined, b: string[] | undefined) =>
    a === b || (!!a && !!b && a.length === b.length && a.every((id, index) => id === b[index]));
  if (
    old &&
    old.positions.length === positions.length &&
    old.positions.every(
      (row, index) => row.id === positions[index].id && row.publicDigest === positions[index].publicDigest,
    ) &&
    sameIds(old.beforeIds, beforeIds) &&
    sameIds(old.afterIds, afterIds)
  )
    return old.signature;
  const signature = hash(
    JSON.stringify([positions.map((entry) => [entry.id, entry.publicDigest]), beforeIds, afterIds]),
  );
  if (isImmutableSceneLine(line))
    sourceSignatures.set(line, {
      positions: positions.map(({ id, publicDigest }) => ({ id, publicDigest })),
      beforeIds: beforeIds ? [...beforeIds] : undefined,
      afterIds: afterIds ? [...afterIds] : undefined,
      signature,
    });
  return signature;
}
function versionOf(layout: HistoryPageTree, known: WeakMap<HistoryPageRef, string>) {
  if (!layout.root) return emptyVersion;
  for (const [index, group] of layout.groups.entries()) {
    if (!known.has(group.ref))
      known.set(
        group.ref,
        hash("moment-leaf:" + group.entries.map(([, row]) => (row as SceneMomentPosition).publicDigest).join("")),
      );
    known.set(layout.levels[0][index], known.get(group.ref)!);
  }
  for (let level = 1; level < layout.levels.length; level++)
    for (const [index, parent] of layout.levels[level].entries())
      if (!known.has(parent))
        known.set(
          parent,
          hash(
            "moment-branch:" +
              layout.levels[level - 1]
                .slice(index * 32, (index + 1) * 32)
                .map((ref) => known.get(ref)!)
                .join(""),
          ),
        );
  return known.get(layout.root)!;
}
async function page(documents: Pick<CapabilityDocumentStore, "getById">, id: string) {
  const row = await documents.getById("villages", id);
  memoryRequire(
    row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
    "owned Scene presentation page is missing or changed",
  );
  validateMemoryPageData(row.data, id);
  return row.data as MemoryPageData;
}
async function consume<T>(
  read: Generator<string, T, MemoryPageData | null>,
  get: (id: string) => Promise<MemoryPageData | null>,
): Promise<T> {
  let next = read.next();
  while (next.done === false) next = read.next(await get(next.value));
  return next.value;
}
export async function readSceneMomentRange(
  documents: Pick<CapabilityDocumentStore, "getById">,
  head: ScenePresentationHead,
  lineCount: number,
  start: number,
  end: number,
) {
  const reader = createHistoryPageReader(head.world);
  return (
    await consume(reader.range(head.moments, head.count, start, end, MOMENTS_PER_BLOCK), (id) => page(documents, id))
  ).map(([id, row]) => readMoment(row, id, head, lineCount));
}
export async function readSceneMomentFrames(
  documents: Pick<CapabilityDocumentStore, "getById">,
  head: ScenePresentationHead,
  moments: SceneMomentPosition[],
  scene: Owner,
) {
  const reader = createHistoryPageReader(head.world),
    cast = new Set(scene.participants.map((person) => person.characterId));
  const result: SceneMomentPresentation[] = [];
  for (const moment of moments) {
    const entries = await consume(reader.range(moment.frame, 1, 0, 1), (id) => page(documents, id));
    memoryRequire(entries[0][0] === "frame", "invalid Scene frame identity");
    const frame = readFrames(entries[0][1], cast);
    memoryRequire(
      momentDigest(moment.lines, frame, moment.paragraphs) === moment.publicDigest,
      "Scene moment presentation changed",
    );
    result.push(structuredClone(frame));
  }
  return result;
}

export function createScenePresentations(documents: Pick<CapabilityDocumentStore, "getById" | "create">) {
  const cache = new Map<string, Entry>(),
    versions = new WeakMap<HistoryPageRef, string>();
  const identity = (head: ScenePresentationHead) =>
    JSON.stringify([head.world, head.count, head.moments, head.current.count, head.current.actors]);
  function remember(head: ScenePresentationHead, entry: Entry) {
    if (isRepairSimulation(documents as CapabilityDocumentStore)) return;
    const key = identity(head);
    cache.delete(key);
    cache.set(key, entry);
    while (cache.size > 4) cache.delete(cache.keys().next().value!);
  }
  async function read(head: ScenePresentationHead, scene: Owner, lineCount: number): Promise<Entry> {
    const assertParagraphs = (moments: SceneMomentPosition[]) => {
      const last = moments.at(-1);
      memoryRequire(
        head.paragraphs === (last ? last.paragraphStart + last.paragraphs : 0),
        "Scene paragraph count changed",
      );
    };
    const remembered = !isRepairSimulation(documents as CapabilityDocumentStore) && cache.get(identity(head));
    if (head.moments) await page(documents, head.moments.id);
    if (head.current.actors) await page(documents, head.current.actors.id);
    if (remembered) {
      assertParagraphs(remembered.moments);
      memoryRequire(
        versionOf(remembered.layout, versions) === head.publicVersion,
        "Scene presentation version changed",
      );
      assertIds(
        [
          ...head.initialIds,
          ...head.current.activeIds,
          ...head.current.initialSlots,
          ...(head.current.firstBefore ?? []),
          ...head.current.seenAttendance,
        ],
        new Set(remembered.actors.filter((actor) => actor.person).map((actor) => actor.id)),
      );
      return remembered;
    }
    const reader = createHistoryPageReader(head.world),
      get = (id: string) => page(documents, id);
    const layout = await consume(reader.tree(head.moments, { count: head.count, items: MOMENTS_PER_BLOCK }), get);
    const moments = reader.rows(layout).map(([id, row]) => readMoment(row, id, head, lineCount));
    assertParagraphs(moments);
    memoryRequire(versionOf(layout, versions) === head.publicVersion, "Scene presentation version changed");
    const actorLayout = await consume(reader.tree(head.current.actors, { count: head.current.count, items: 64 }), get);
    const cast = new Set(scene.participants.map((person) => person.characterId));
    const actors = reader.rows(actorLayout).map(([id, row]) => {
      const result = actor.parse(row);
      memoryRequire(result.id === id && cast.has(id), "Scene staging actor changed");
      memoryRequire(result.person !== undefined || result.explicit, "invalid pending staging actor");
      if (result.person?.look.target === "villager") assertIds([result.person.look.characterId], cast);
      return result as StagingCheckpoint["actors"][number];
    });
    assertIds(
      [
        ...head.initialIds,
        ...head.current.activeIds,
        ...head.current.initialSlots,
        ...(head.current.firstBefore ?? []),
        ...head.current.seenAttendance,
      ],
      new Set(actors.filter((actor) => actor.person).map((actor) => actor.id)),
    );
    const entry = { moments, layout, actors, actorLayout };
    remember(head, entry);
    return entry;
  }
  async function prepare(
    scene: VenueScene,
    positions: Position[],
    privateHearing: boolean,
    source: string,
    previous?: ScenePresentationHead,
  ) {
    if (previous) readScenePresentationHead(previous, scene);
    const old = previous ? await read(previous, scene, scene.lines.length) : undefined;
    if (previous?.source === source) return previous;
    const { head, pages, ...entry } = encodeScenePresentations(
      scene,
      positions,
      privateHearing,
      source,
      previous,
      old,
      versions,
    );
    const stamp = new Date().toISOString();
    for (const [id, data] of pages) {
      const exists = await documents.getById("villages", id);
      if (!exists) {
        try {
          await documents.create({
            id,
            packageId: "villages",
            kind: MEMORY_PAGE_KIND,
            name: "Scene presentation",
            description: "Visible playback without transcript duplication",
            data,
            createdAt: stamp,
            updatedAt: stamp,
          });
          continue;
        } catch (error) {
          if (!(await documents.getById("villages", id))) throw error;
        }
      }
      memoryRequire(
        JSON.stringify(await page(documents, id)) === JSON.stringify(data),
        "immutable Scene presentation changed",
      );
    }
    remember(head, entry);
    return head;
  }
  return { prepare };
}

export function encodeScenePresentations(
  scene: VenueScene,
  positions: Position[],
  privateHearing: boolean,
  source: string,
  previous?: ScenePresentationHead,
  old?: Entry,
  versions = new WeakMap<HistoryPageRef, string>(),
) {
  const cast = scene.participants.map((person) => person.characterId),
    visible = new Set(cast);
  const initialIds = previous?.initialIds ?? [...new Set(scene.activeIds)];
  const lines = positions.map(({ position }) => {
    const line = scene.lines[position];
    return line.contactHidden
      ? { ...line, kind: "narration" as const, presentation: "main" as const, asideFor: undefined }
      : line;
  });
  const boundaries = stagingBoundaries(
    lines,
    scene.submissions.filter((turn) => turn.semanticProvenance?.version !== 2 || turn.semanticReady === true),
  );
  const byId = new Map(positions.map((position) => [position.id, position]));
  const sources = groupSceneMoments(lines).map(({ line, asides }) => {
    const selected = [line, ...asides],
      edges = selected.map((line) => boundaries.get(line.id));
    const beforeIds = edges.find((edge) => edge?.beforeIds)?.beforeIds,
      afterIds = edges.find((edge) => edge?.afterIds)?.afterIds;
    const positions = selected.map((line) => byId.get(line.id)!);
    return {
      line,
      asides,
      positions,
      beforeIds,
      afterIds,
      signature: sourceSignature(line, positions, beforeIds, afterIds),
    };
  });
  const append =
    !!old &&
    old.moments.length <= sources.length &&
    old.moments.every(
      (moment, index) => moment.id === sources[index].line.id && moment.source === sources[index].signature,
    );
  if (
    append &&
    old!.moments.length === sources.length &&
    old!.moments.every((moment, index) =>
      moment.lines.every((line, offset) => line.position === sources[index].positions[offset].position),
    )
  ) {
    return { ...old!, head: { ...previous!, source }, pages: new Map<string, MemoryPageData>() };
  }
  const cursor = append
    ? restoreStagingCursor({ ...previous!.current, actors: old!.actors }, cast)
    : createStagingCursor(initialIds, cast);
  const writer = createHistoryPageWriter(worldOf(scene));
  let paragraphStart = 0;
  const moments = sources.map((source, index): SceneMomentPosition => {
    const prior = old?.moments[index];
    if (append && index < old!.moments.length) {
      memoryRequire(prior!.paragraphStart === paragraphStart, "Scene paragraph position changed");
      paragraphStart += prior!.paragraphs;
      return prior!.lines.every((line, index) => line.position === source.positions[index].position)
        ? prior!
        : { ...prior!, lines: source.positions };
    }
    const project = (line: typeof source.line) => publicSceneResponse([line], visible, privateHearing)[0];
    const main = project(source.line);
    const paragraphs = villagesWalk(main.content, null).paragraphs.length,
      offset = paragraphStart;
    paragraphStart += paragraphs;
    advanceStaging(cursor, { beforeIds: source.beforeIds, cues: lineStagingCues(main) });
    const start = stagingPresentation(cursor);
    advanceStaging(cursor, {
      cues: source.asides.flatMap((line) => lineStagingCues(project(line))),
      afterIds: source.afterIds,
    });
    const value = { start, end: stagingPresentation(cursor) },
      publicDigest = momentDigest(source.positions, value, paragraphs);
    return prior?.source === source.signature &&
      prior.publicDigest === publicDigest &&
      prior.paragraphStart === offset &&
      prior.lines.every((line, index) => line.position === source.positions[index].position)
      ? prior
      : {
          id: source.line.id,
          paragraphStart: offset,
          paragraphs,
          lines: source.positions,
          source: source.signature,
          frame: writer.tree([["frame", value]]).root!,
          publicDigest,
        };
  });
  const checkpoint = stagingCheckpoint(cursor),
    { actors: actorRows, ...facts } = checkpoint;
  const actors = actorRows.map((row, index) => {
    const prior = old?.actors[index];
    return prior?.id === row.id &&
      prior.explicit === row.explicit &&
      ((prior.person === undefined && row.person === undefined) ||
        (prior.person !== undefined &&
          row.person !== undefined &&
          prior.person.position === row.person.position &&
          prior.person.expression === row.person.expression &&
          prior.person.look.target === row.person.look.target &&
          (prior.person.look.target !== "villager" ||
            (row.person.look.target === "villager" && prior.person.look.characterId === row.person.look.characterId)) &&
          (prior.person.look.target !== "direction" ||
            (row.person.look.target === "direction" && prior.person.look.direction === row.person.look.direction))))
      ? prior
      : row;
  });
  const layout = writer.tree(
    moments.map((moment) => [moment.id, moment]),
    old?.layout,
    MOMENTS_PER_BLOCK,
  );
  const actorLayout = writer.tree(
    actors.map((actor) => [actor.id, actor]),
    old?.actorLayout,
  );
  const head: ScenePresentationHead = {
    format: 1,
    world: worldOf(scene),
    initialIds,
    count: moments.length,
    paragraphs: paragraphStart,
    moments: layout.root,
    publicVersion: versionOf(layout, versions),
    source,
    current: { ...facts, count: actors.length, actors: actorLayout.root },
  };
  readScenePresentationHead(head, scene);
  return { head, moments, layout, actors, actorLayout, pages: writer.pages };
}

export function createScenePresentationTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const tracer = createMemoryPageTracer(get);
  const readers = new Map<string, ReturnType<typeof createHistoryPageReader>>();
  const checkedMoments = new WeakSet<SceneMomentPosition>(),
    checkedActors = new WeakSet<object>();
  const checkedDigests = new WeakSet<SceneMomentPosition>();
  const checkedFrames = new Map<string, SceneMomentPresentation>();
  const versions = new WeakMap<HistoryPageRef, string>();
  return {
    async trace(head: ScenePresentationHead, scene: Owner, lineCount: number) {
      readScenePresentationHead(head, scene);
      let reader = readers.get(head.world);
      if (!reader) readers.set(head.world, (reader = createHistoryPageReader(head.world)));
      const layout = await consume(reader.tree(head.moments, { count: head.count, items: MOMENTS_PER_BLOCK }), get);
      const moments = reader.rows(layout).map(([id, row]) => {
        const moment = row as SceneMomentPosition;
        if (!checkedMoments.has(moment)) {
          readMoment(row, id, head, Number.MAX_SAFE_INTEGER);
          checkedMoments.add(moment);
        }
        memoryRequire(
          moment.id === id && moment.lines.every((line) => line.position < lineCount),
          "Scene moment position changed",
        );
        return moment;
      });
      memoryRequire(versionOf(layout, versions) === head.publicVersion, "Scene presentation version changed");
      const seenIds = new Set<string>(),
        seenPositions = new Map<number, Position>();
      const cast = new Set(scene.participants.map((person) => person.characterId));
      let paragraphStart = 0,
        lastMain = -1;
      for (const moment of moments) {
        memoryRequire(
          moment.paragraphStart === paragraphStart && moment.lines[0].position > lastMain,
          "Scene paragraph order changed",
        );
        paragraphStart += moment.paragraphs;
        lastMain = moment.lines[0].position;
        for (const line of moment.lines) {
          memoryRequire(
            !seenIds.has(line.id) && !seenPositions.has(line.position),
            "duplicate Scene presentation line",
          );
          seenIds.add(line.id);
          seenPositions.set(line.position, line);
        }
        let frame = checkedFrames.get(moment.frame.id);
        if (!frame) {
          const [[key, value]] = await consume(reader.range(moment.frame, 1, 0, 1), get);
          memoryRequire(key === "frame", "invalid Scene frame identity");
          frame = readFrames(value, cast);
          checkedFrames.set(moment.frame.id, frame);
        } else assertFrameCast(frame, cast);
        if (!checkedDigests.has(moment)) {
          memoryRequire(
            momentDigest(moment.lines, frame, moment.paragraphs) === moment.publicDigest,
            "Scene moment presentation changed",
          );
          checkedDigests.add(moment);
        }
      }
      memoryRequire(paragraphStart === head.paragraphs, "Scene paragraph count changed");
      const actors = await consume(reader.range(head.current.actors, head.current.count, 0, head.current.count), get);
      const actorIds = new Set<string>();
      for (const [id, row] of actors) {
        if (!checkedActors.has(row as object)) {
          actor.parse(row);
          checkedActors.add(row as object);
        }
        const saved = row as StagingCheckpoint["actors"][number];
        memoryRequire(saved.id === id && cast.has(id), "invalid Scene presentation actor");
        memoryRequire(saved.person !== undefined || saved.explicit, "invalid pending staging actor");
        if (saved.person?.look.target === "villager") assertIds([saved.person.look.characterId], cast);
        if (saved.person) actorIds.add(id);
      }
      for (const values of [
        head.initialIds,
        head.current.activeIds,
        head.current.initialSlots,
        head.current.firstBefore ?? [],
        head.current.seenAttendance,
      ])
        assertIds(values, actorIds);
      await tracer.traceTrees(
        [head.moments, head.current.actors, ...moments.map((moment) => moment.frame)],
        head.world,
      );
      return seenPositions;
    },
  };
}
