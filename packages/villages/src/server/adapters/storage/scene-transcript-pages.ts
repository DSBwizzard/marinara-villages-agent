import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueLine, VenueScene } from "../../domain/models/scene-model.js";
import type { HistoryPageRef, HistoryPageTree, MemoryPageData } from "./memory-pages.js";
import {
  sceneRecordWorld,
  readSceneRecordHead,
  encodeSceneRecords,
  decodeSceneRecords,
  decodeSceneRecordsSync,
  createSceneRecordStore,
  sceneRecordStore,
  createSceneRecordTracer,
  type SceneRecordHead,
} from "./scene-record-pages.js";

type Owner = Pick<VenueScene, "id" | "villageSeed">;
export type SceneTranscriptHead = { format: 1; world: string; count: number; lines: HistoryPageRef | null };
const internal = ({ lines, ...head }: SceneTranscriptHead): SceneRecordHead => ({ ...head, root: lines });
const external = ({ root, ...head }: SceneRecordHead): SceneTranscriptHead => ({ ...head, lines: root });
export const sceneTranscriptWorld = (owner: Owner) => sceneRecordWorld(owner, "lines");
export function readSceneTranscriptHead(value: unknown, owner: Owner): SceneTranscriptHead {
  return external(readSceneRecordHead(value, owner, "lines"));
}
export function encodeSceneTranscript(lines: VenueLine[], owner: Owner, previous?: HistoryPageTree) {
  const encoded = encodeSceneRecords(lines, owner, "lines", previous);
  return { ...encoded, head: external(encoded.head) };
}
export function decodeSceneTranscriptSync(head: SceneTranscriptHead, get: (id: string) => MemoryPageData | null) {
  const { rows, layout } = decodeSceneRecordsSync(internal(head), "lines", get);
  return { lines: rows as VenueLine[], layout };
}
export async function decodeSceneTranscript(
  head: SceneTranscriptHead,
  get: (id: string) => Promise<MemoryPageData | null>,
) {
  const { rows, layout } = await decodeSceneRecords(internal(head), "lines", get);
  return { lines: rows as VenueLine[], layout };
}
function transcriptStore(store: ReturnType<typeof createSceneRecordStore>) {
  return {
    async read(head: SceneTranscriptHead, scene: VenueScene) {
      const { rows, layout } = await store.read(internal(head), scene);
      return { lines: [...rows] as VenueLine[], layout };
    },
    async prepare(scene: VenueScene, previous?: SceneTranscriptHead) {
      return external(await store.prepare(scene, previous && internal(previous)));
    },
  };
}
export function createSceneTranscriptStore(documents: Pick<CapabilityDocumentStore, "getById" | "create">) {
  return transcriptStore(createSceneRecordStore(documents, "lines"));
}
export function sceneTranscriptStore(documents: CapabilityDocumentStore) {
  return transcriptStore(sceneRecordStore(documents, "lines"));
}
export function createSceneTranscriptTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const tracer = createSceneRecordTracer(get, "lines");
  return {
    trace: (head: SceneTranscriptHead, participants: VenueScene["participants"]) =>
      tracer.trace(internal(head), participants),
  };
}
