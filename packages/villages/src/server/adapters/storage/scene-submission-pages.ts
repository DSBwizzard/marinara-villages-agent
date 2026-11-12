import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { HistoryPageRef, HistoryPageTree, MemoryPageData } from "./memory-pages.js";
import {
  createSceneRecordTracer,
  decodeSceneRecords,
  decodeSceneRecordsSync,
  encodeSceneRecords,
  readSceneRecordHead,
  sceneRecordStore,
  sceneRecordWorld,
  type SceneRecordHead,
} from "./scene-record-pages.js";

type Owner = Pick<VenueScene, "id" | "villageSeed">;
export type SceneSubmissionHead = { format: 1; world: string; count: number; submissions: HistoryPageRef | null };
const internal = ({ submissions, ...head }: SceneSubmissionHead): SceneRecordHead => ({ ...head, root: submissions });
const external = ({ root, ...head }: SceneRecordHead): SceneSubmissionHead => ({ ...head, submissions: root });
export const sceneSubmissionWorld = (owner: Owner) => sceneRecordWorld(owner, "submissions");

export function readSceneSubmissionHead(value: unknown, owner: Owner): SceneSubmissionHead {
  return external(readSceneRecordHead(value, owner, "submissions"));
}
export function encodeSceneSubmissions(submissions: VenueSubmission[], owner: Owner, previous?: HistoryPageTree) {
  const encoded = encodeSceneRecords(submissions, owner, "submissions", previous);
  return { ...encoded, head: external(encoded.head) };
}
export function decodeSceneSubmissionsSync(head: SceneSubmissionHead, get: (id: string) => MemoryPageData | null) {
  const { rows, layout } = decodeSceneRecordsSync(internal(head), "submissions", get);
  return { submissions: rows as VenueSubmission[], layout };
}
export async function decodeSceneSubmissions(
  head: SceneSubmissionHead,
  get: (id: string) => Promise<MemoryPageData | null>,
) {
  const { rows, layout } = await decodeSceneRecords(internal(head), "submissions", get);
  return { submissions: rows as VenueSubmission[], layout };
}
export function sceneSubmissionStore(documents: CapabilityDocumentStore) {
  const store = sceneRecordStore(documents, "submissions");
  return {
    async readPositions(head: SceneSubmissionHead, scene: VenueScene, positions: readonly number[]) {
      return (await store.readPositions(internal(head), scene, positions)) as VenueSubmission[];
    },
    async read(head: SceneSubmissionHead, scene: VenueScene) {
      const { rows, layout } = await store.read(internal(head), scene);
      return { submissions: [...rows] as VenueSubmission[], layout };
    },
    async prepare(scene: VenueScene, previous?: SceneSubmissionHead) {
      return external(await store.prepare(scene, previous && internal(previous)));
    },
  };
}
export function createSceneSubmissionTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const tracer = createSceneRecordTracer(get, "submissions");
  return {
    async trace(head: SceneSubmissionHead, participants: VenueScene["participants"], owner: Owner) {
      memoryRequire(head.world === sceneSubmissionWorld(owner), "Scene submission World changed");
      await tracer.trace(internal(head), participants);
    },
  };
}
