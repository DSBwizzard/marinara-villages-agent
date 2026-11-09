import type { ContinuityCollection } from "../../domain/models/continuity-model.js";
import type { EpisodeCollection } from "../../domain/models/episode-model.js";
import type { PlaceRegistry } from "../../domain/models/places.js";
import { readContinuity } from "../../domain/decoding/continuity-codec.js";
import { readEpisodes } from "../../domain/decoding/episode-codec.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { readPlaceRegistry } from "../../domain/rules/places.js";
import { assertContinuityRetention } from "../../domain/rules/continuity-retention.js";
import {
  createHistoryPageWriter,
  createHistoryPageReader,
  type HistoryPageRef,
  type HistoryPageTree,
  type MemoryPageData,
} from "./memory-pages.js";

export type ContinuityPayload = {
  continuity: ContinuityCollection;
  episodes: EpisodeCollection;
  worldPlaces: PlaceRegistry;
};
const trees = [
  "records",
  "versions",
  "receipts",
  "episodes",
  "places",
  "npcs",
  "placeReceipts",
  "placeOperations",
] as const;
type TreeName = (typeof trees)[number];
export type ContinuityPageLayout = Record<TreeName, HistoryPageTree>;
export type ContinuityPageManifest = Record<TreeName, HistoryPageRef | null> & {
  format: 1;
  revision: number;
  episodeRevision: number;
  placeRevision: number;
};

/** The existing immutable history pages own bulk continuity; the Village root owns their one manifest. */
export function encodeContinuityPages(value: ContinuityPayload, world: string, previous?: ContinuityPageLayout) {
  const writer = createHistoryPageWriter(world),
    places = value.worldPlaces;
  const rows: Record<TreeName, [string, unknown][]> = {
    records: value.continuity.records.map((row) => [row.id, row]),
    versions: value.continuity.versions.map((row) => [row.id, row]),
    receipts: Object.entries(value.continuity.receipts),
    episodes: value.episodes.records.map((row) => [row.id, row]),
    places: Object.entries(places.places),
    npcs: Object.entries(places.npcs),
    placeReceipts: Object.entries(places.receipts),
    placeOperations: Object.entries(places.operations),
  };
  const layout = Object.fromEntries(
    trees.map((key) => [key, writer.tree(rows[key], previous?.[key], key === "episodes" ? 1 : 64)]),
  ) as ContinuityPageLayout;
  const manifest = {
    format: 1,
    revision: value.continuity.revision,
    episodeRevision: value.episodes.revision,
    placeRevision: places.revision,
    ...Object.fromEntries(trees.map((key) => [key, layout[key].root])),
  } as ContinuityPageManifest;
  return { manifest, layout, pages: writer.pages, serializedBytes: writer.serializedBytes };
}

function* decoder(raw: unknown, world: string, seed: string) {
  memoryObject(raw, ["format", "revision", "episodeRevision", "placeRevision", ...trees]);
  memoryRequire(
    raw.format === 1 &&
      [raw.revision, raw.episodeRevision, raw.placeRevision].every(
        (value) => Number.isSafeInteger(value) && value >= 0,
      ),
    "unsupported continuity history directory",
  );
  const reader = createHistoryPageReader(world),
    layout = {} as ContinuityPageLayout;
  for (const key of trees)
    layout[key] = yield* reader.tree(
      raw[key],
      key === "episodes" ? { count: raw.episodeRevision, items: 1 } : undefined,
    );
  const objects = (key: "records" | "versions" | "episodes") =>
    reader.rows(layout[key]).map(([id, row]) => {
      memoryRequire(
        row && typeof row === "object" && (row as { id?: unknown }).id === id,
        "continuity history identity changed",
      );
      return row;
    });
  const value: ContinuityPayload = {
    continuity: readContinuity(
      {
        format: 1,
        revision: raw.revision,
        records: objects("records"),
        versions: objects("versions"),
        receipts: Object.fromEntries(reader.rows(layout.receipts)),
      },
      seed,
    ),
    episodes: readEpisodes({ format: 1, revision: raw.episodeRevision, records: objects("episodes") }, seed),
    worldPlaces: readPlaceRegistry({
      revision: raw.placeRevision,
      places: Object.fromEntries(reader.rows(layout.places)),
      npcs: Object.fromEntries(reader.rows(layout.npcs)),
      receipts: Object.fromEntries(reader.rows(layout.placeReceipts)),
      operations: Object.fromEntries(reader.rows(layout.placeOperations)),
    }),
  };
  assertContinuityRetention(value.continuity, value.episodes);
  return { value, layout, pageIds: reader.pageIds };
}

export async function decodeContinuityPages(
  raw: unknown,
  world: string,
  seed: string,
  get: (id: string) => Promise<MemoryPageData | null>,
) {
  const read = decoder(raw, world, seed);
  let next = read.next();
  while (next.done === false) next = read.next(await get(next.value));
  return next.value;
}
