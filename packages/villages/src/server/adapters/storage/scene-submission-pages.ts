import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueScene, VenueSubmission } from "../../domain/models/scene-model.js";
import type { CapturedWishSnapshot } from "../../domain/models/wish-check-model.js";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";
import { isImmutableSceneSubmission } from "../../domain/rules/scene-submissions.js";
import {
  createSceneWishContexts,
  capturedWishReferences,
  readCapturedWishSnapshot,
  capturedWishSnapshotKey,
  assertCapturedWishOwners,
} from "./scene-wish-contexts.js";
import { operationEvidenceStore } from "./operation-evidence.js";
import { createWishHistoryTracer } from "./wish-history.js";
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

type Owner = Pick<VenueScene, "id" | "villageSeed" | "continuity" | "operation">;
export type SceneSubmissionHead = { format: 1; world: string; count: number; submissions: HistoryPageRef | null };
const internal = ({ submissions, ...head }: SceneSubmissionHead): SceneRecordHead => ({ ...head, root: submissions });
const external = ({ root, ...head }: SceneRecordHead): SceneSubmissionHead => ({ ...head, submissions: root });
export const sceneSubmissionWorld = (owner: Owner) => sceneRecordWorld(owner, "submissions");
const packets = new WeakMap<
  VenueSubmission,
  { sceneId: string; seed: string; setupAt: string; value: CapturedWishSnapshot }
>();
function packet(row: VenueSubmission, owner: Owner) {
  const raw = row.wishContexts;
  if (raw === undefined || (Array.isArray(raw) && raw.length === 0)) return;
  memoryRequire(
    owner.continuity && owner.continuity.seed === owner.villageSeed,
    "captured Wish owner has no frozen World scope",
  );
  const known = isImmutableSceneSubmission(row) ? packets.get(row) : undefined;
  if (known) {
    memoryRequire(
      known.sceneId === owner.id && known.seed === owner.continuity.seed && known.setupAt === owner.continuity.setupAt,
      "captured Wish submission World changed",
    );
    assertCapturedWishOwners(known.value, [owner.continuity, owner.operation?.snapshot?.continuity]);
    return known.value;
  }
  const value = readCapturedWishSnapshot(raw, {
    sceneId: owner.id,
    seed: owner.continuity.seed,
    setupAt: owner.continuity.setupAt,
  });
  assertCapturedWishOwners(value, [owner.continuity, owner.operation?.snapshot?.continuity]);
  if (isImmutableSceneSubmission(row))
    packets.set(row, { sceneId: owner.id, seed: owner.continuity.seed, setupAt: owner.continuity.setupAt, value });
  return value;
}
export function readSceneSubmissionHead(value: unknown, owner: Owner): SceneSubmissionHead {
  return external(readSceneRecordHead(value, owner, "submissions"));
}
export function encodeSceneSubmissions(submissions: VenueSubmission[], owner: Owner, previous?: HistoryPageTree) {
  for (const row of submissions) packet(row, owner);
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
function submissionStore(
  store: ReturnType<typeof createSceneRecordStore>,
  documents: Pick<CapabilityDocumentStore, "getById" | "create">,
) {
  const wishes = createSceneWishContexts(documents as CapabilityDocumentStore);
  return {
    async read(head: SceneSubmissionHead, scene: VenueScene) {
      const { rows, layout } = await store.read(internal(head), scene);
      for (const row of rows) packet(row as VenueSubmission, scene);
      return { submissions: [...rows] as VenueSubmission[], layout };
    },
    async prepare(scene: VenueScene, previous?: SceneSubmissionHead) {
      if (
        scene.submissions.some(
          (row) =>
            row.wishContexts !== undefined && !(Array.isArray(row.wishContexts) && row.wishContexts.length === 0),
        )
      ) {
        const saved = await documents.getById("villages", "villages-venue-visit-" + scene.id);
        memoryRequire(
          !saved ||
            (saved.id === "villages-venue-visit-" + scene.id &&
              saved.packageId === "villages" &&
              saved.kind === "venue-visit"),
          "invalid captured Wish submission owner",
        );
        const native = saved?.data as VenueScene & { submissionHistory: SceneSubmissionHead },
          scope = { ...scene, continuity: scene.continuity ?? native?.continuity },
          protectedSnapshots = new Map<string, CapturedWishSnapshot>();
        const owned =
          previous &&
          [native, native?.operation?.snapshot].some(
            (value) => value && JSON.stringify((value as any).submissionHistory) === JSON.stringify(previous),
          );
        const prior = owned ? ((await store.read(internal(previous), scope)).rows as VenueSubmission[]) : [];
        const byId = new Map(prior.map((row) => [row.id, row]));
        const changed = scene.submissions.filter((row) => row !== byId.get(row.id));
        const protect = (captured: CapturedWishSnapshot | undefined) => {
          if (captured) protectedSnapshots.set(capturedWishSnapshotKey(captured), captured);
        };
        if (native)
          for (const [key, value] of await operationEvidenceStore(documents as CapabilityDocumentStore).protectedWishes(
            native.operation,
            scope,
          ))
            protectedSnapshots.set(key, value);
        const latest = new Set<string>();
        for (let index = prior.length - 1; index >= 0; index--) {
          const captured = packet(prior[index], scope);
          if (captured && captured.owners.some((owner) => !latest.has(owner.actorId))) {
            for (const owner of captured.owners) latest.add(owner.actorId);
            protect(captured);
          }
        }
        for (const row of changed) {
          const before = byId.get(row.id);
          if (before) protect(packet(before, scope));
        }
        for (let index = 0; index < scene.submissions.length; index++) {
          const row = scene.submissions[index];
          if (row === byId.get(row.id)) continue;
          scene.submissions[index] = (await wishes.prepareValue(row, scope, protectedSnapshots)) as VenueSubmission;
        }
      }
      const head = await store.prepare(scene, previous && internal(previous));
      for (const row of scene.submissions) packet(row, scene);
      return external(head);
    },
  };
}
export function createSceneSubmissionStore(documents: Pick<CapabilityDocumentStore, "getById" | "create">) {
  return submissionStore(createSceneRecordStore(documents, "submissions"), documents);
}
export function sceneSubmissionStore(documents: CapabilityDocumentStore) {
  return submissionStore(sceneRecordStore(documents, "submissions"), documents);
}
export function createSceneSubmissionTracer(get: (id: string) => Promise<MemoryPageData | null>) {
  const scopes = new Map<string, Owner>(),
    wishes = createWishHistoryTracer(get);
  const tracer = createSceneRecordTracer(get, "submissions", async (row, world) => {
    const owner = scopes.get(world)!;
    const captured = packet(row as VenueSubmission, owner);
    if (captured)
      for (const ref of capturedWishReferences(captured, {
        sceneId: owner.id,
        seed: captured.seed,
        setupAt: captured.setupAt,
      }))
        await wishes.trace(ref.head, ref.scope);
    return (
      captured?.owners.map(({ actorId, capturedAt }) => ({
        actorId,
        capturedAt,
        seed: captured.seed,
        setupAt: captured.setupAt,
      })) ?? []
    );
  });
  return {
    async trace(head: SceneSubmissionHead, participants: VenueScene["participants"], owner: Owner) {
      memoryRequire(head.world === sceneSubmissionWorld(owner), "captured Wish submission World changed");
      scopes.set(head.world, owner);
      const owners = await tracer.trace(internal(head), participants);
      if (owners.length) {
        memoryRequire(owner.continuity, "captured Wish owner has no frozen World scope");
        memoryRequire(
          owners.every((value) => value.seed === owner.continuity!.seed && value.setupAt === owner.continuity!.setupAt),
          "captured Wish submission World changed",
        );
        assertCapturedWishOwners({ seed: owner.continuity.seed, setupAt: owner.continuity.setupAt, owners }, [
          owner.continuity,
          owner.operation?.snapshot?.continuity,
        ]);
      }
    },
  };
}
