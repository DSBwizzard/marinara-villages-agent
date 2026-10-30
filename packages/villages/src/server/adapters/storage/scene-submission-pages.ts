import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
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
function submissionStore(store: ReturnType<typeof createSceneRecordStore>) {
  return {
    async read(head: SceneSubmissionHead, scene: VenueScene) {
      const { rows, layout } = await store.read(internal(head), scene);
      return { submissions: [...rows] as VenueSubmission[], layout };
    },
    async prepare(scene: VenueScene, previous?: SceneSubmissionHead) {
      return external(await store.prepare(scene, previous && internal(previous)));
    },
  };
}
export function createSceneSubmissionStore(documents: Pick<CapabilityDocumentStore, "getById" | "create">) {
  return submissionStore(createSceneRecordStore(documents, "submissions"));
}
export function sceneSubmissionStore(documents: CapabilityDocumentStore) {
  return submissionStore(sceneRecordStore(documents, "submissions"));
}
export function createSceneSubmissionTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const tracer = createSceneRecordTracer(get, "submissions");
  return {
    trace: (head: SceneSubmissionHead, participants: VenueScene["participants"]) =>
      tracer.trace(internal(head), participants),
  };
}
