import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueScene } from "../../domain/models/scene-model.js";
import { readVillageRoot } from "./village-repository.js";
import {
  operationEvidenceReferences,
  operationEvidenceStore,
  operationCheckpointClaims,
} from "./operation-evidence.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { sceneContinuityFields } from "../../domain/rules/scene-continuity.js";
import {
  sceneTranscriptStore,
  readSceneTranscriptHead,
  createSceneTranscriptTracer,
  decodeSceneTranscript,
  type SceneTranscriptHead,
} from "./scene-transcript-pages.js";
import { MEMORY_PAGE_KIND, type MemoryPageData } from "./memory-pages.js";
import {
  readScenePublicHistoryHead,
  scenePublicHistoryStore,
  createScenePublicHistoryTracer,
  rebindScenePublicHistory,
} from "./scene-public-history.js";
import {
  sceneSubmissionStore,
  readSceneSubmissionHead,
  decodeSceneSubmissions,
  createSceneSubmissionTracer,
  type SceneSubmissionHead,
} from "./scene-submission-pages.js";
export const SCENE_STORAGE_FORMAT = 15;
function publicHistoryHead(raw: Record<string, any>) {
  return readScenePublicHistoryHead(
    raw.publicHistory,
    raw as VenueScene,
    readSceneTranscriptHead(raw.transcript, raw as VenueScene),
    readSceneSubmissionHead(raw.submissionHistory, raw as VenueScene),
  );
}
export async function readActiveSceneOwner(documents: Pick<CapabilityDocumentStore, "getById">) {
  const pointer = await documents.getById("villages", "villages-active-venue");
  if (!pointer) return { pointer, scene: null, playbackScene: null };
  memoryRequire(
    pointer.id === "villages-active-venue" && pointer.packageId === "villages" && pointer.kind === "venue-active",
    "invalid active Scene owner identity",
  );
  memoryObject(pointer.data);
  const id = pointer.data.sessionId;
  memoryRequire(id === undefined || id === null || typeof id === "string", "invalid active Scene reference");
  const playbackId = pointer.data.playbackSceneId;
  memoryRequire(
    playbackId === undefined || (typeof playbackId === "string" && !!playbackId && playbackId !== id),
    "invalid playback Scene reference",
  );
  const read = async (sceneId: string) => {
    const scene = await documents.getById("villages", "villages-venue-visit-" + sceneId);
    memoryRequire(
      scene &&
        scene.id === "villages-venue-visit-" + sceneId &&
        scene.packageId === "villages" &&
        scene.kind === "venue-visit",
      "active Scene ownership is missing or changed",
    );
    readSceneHistoryRoot(scene.data);
    memoryRequire((scene.data as { id?: string }).id === sceneId, "active Scene owner identity changed");
    return scene;
  };
  const scene = id ? await read(id) : null;
  const playbackScene = playbackId ? await read(playbackId as string) : null;
  if (playbackScene) {
    const world = readVillageRoot(await documents.getById("villages", "villages-village"));
    const saved = playbackScene.data as VenueScene;
    memoryRequire(saved.status === "closed", "playback Scene is not closed");
    memoryRequire(
      world &&
        saved.villageSeed === world.seed &&
        saved.continuity?.seed === world.seed &&
        saved.continuity.setupAt === world.setupAt,
      "playback Scene belongs to another Village",
    );
  }
  return { pointer, scene, playbackScene };
}

function storedContinuity(raw: unknown, scene: Record<string, any>) {
  if (raw === undefined) return undefined;
  memoryObject(raw, ["version", "seed", "setupAt", "capturedAt", "facts"]);
  memoryObject(raw.facts, [...sceneContinuityFields, "worldPlaces"]);
  memoryRequire(
    raw.version === 4 &&
      typeof raw.seed === "string" &&
      raw.seed === scene.villageSeed &&
      raw.facts.seed === raw.seed &&
      typeof raw.setupAt === "string" &&
      typeof raw.capturedAt === "string" &&
      Number.isFinite(Date.parse(raw.capturedAt)),
    "invalid frozen Scene context",
  );
  return { seed: raw.seed as string, setupAt: raw.setupAt as string };
}
/** Validate the current Scene and its one admitted request snapshot. */
export function readSceneHistoryRoot(value: unknown): void {
  function scene(raw: unknown, admitted = false, expectedId?: string) {
    memoryObject(raw);
    memoryRequire(
      raw.storageFormat === SCENE_STORAGE_FORMAT &&
        raw.version === 5 &&
        typeof raw.id === "string" &&
        (!expectedId || raw.id === expectedId),
      "unsupported Scene storage format; start a fresh Village",
    );
    memoryRequire(
      !Object.hasOwn(raw, "lines") && !Object.hasOwn(raw, "heardHistory") && !Object.hasOwn(raw, "submissions"),
      "inline Scene transcript is unsupported",
    );
    readSceneTranscriptHead(raw.transcript, raw as VenueScene);
    readSceneSubmissionHead(raw.submissionHistory, raw as VenueScene);
    publicHistoryHead(raw);
    const context = storedContinuity(raw.continuity, raw);
    if (raw.abandonedOperations !== undefined) {
      memoryRequire(!admitted && Array.isArray(raw.abandonedOperations), "invalid abandoned Scene operations");
      const identities = new Set<string>();
      for (const operation of raw.abandonedOperations) {
        memoryObject(operation);
        const identity = JSON.stringify([operation.id, operation.attemptId]);
        memoryRequire(
          operation.snapshot === null &&
            operation.status === "complete" &&
            typeof operation.id === "string" &&
            !!operation.id &&
            typeof operation.attemptId === "string" &&
            !!operation.attemptId &&
            !identities.has(identity),
          "invalid abandoned operation owner",
        );
        identities.add(identity);
        operationEvidenceReferences(operation, raw as VenueScene);
        operationCheckpointClaims(operation, raw as VenueScene);
      }
    }
    if (raw.operation !== undefined && raw.operation !== null) {
      memoryRequire(!admitted, "admitted Scene snapshots cannot contain an operation");
      memoryObject(raw.operation);
      operationEvidenceReferences(raw.operation, raw as VenueScene);
      operationCheckpointClaims(raw.operation, raw as VenueScene);
      const snapshot = raw.operation.snapshot;
      if (snapshot !== undefined && snapshot !== null) {
        memoryRequire(!admitted, "nested admitted Scene snapshot");
        memoryObject(snapshot);
        memoryRequire(snapshot.villageSeed === raw.villageSeed, "admitted Scene belongs to another Village");
        const admittedContext = storedContinuity(snapshot.continuity, snapshot);
        if (context && admittedContext)
          memoryRequire(
            context.seed === admittedContext.seed && context.setupAt === admittedContext.setupAt,
            "admitted Scene belongs to another world scope",
          );
        scene(snapshot, true, raw.id);
      }
    }
  }
  scene(value);
}
export function sceneTranscriptOwners(
  value: unknown,
): { head: SceneTranscriptHead; participants: VenueScene["participants"] }[] {
  readSceneHistoryRoot(value);
  const raw = value as Record<string, any>;
  const heads = [
    {
      head: readSceneTranscriptHead(raw.transcript, raw as VenueScene),
      participants: coerceSession({ version: 5, participants: raw.participants }).participants,
    },
  ];
  if (raw.operation?.snapshot)
    heads.push({
      head: readSceneTranscriptHead(raw.operation.snapshot.transcript, raw.operation.snapshot),
      participants: coerceSession({ version: 5, participants: raw.operation.snapshot.participants }).participants,
    });
  return heads;
}
export function sceneSubmissionOwners(
  value: unknown,
): { head: SceneSubmissionHead; participants: VenueScene["participants"]; scene: VenueScene }[] {
  readSceneHistoryRoot(value);
  const raw = value as Record<string, any>;
  return [raw, ...(raw.operation?.snapshot ? [raw.operation.snapshot] : [])].map((owner) => ({
    head: readSceneSubmissionHead(owner.submissionHistory, owner),
    participants: coerceSession({ version: 5, participants: owner.participants }).participants,
    scene: owner,
  }));
}
export function scenePublicHistoryOwners(value: unknown) {
  readSceneHistoryRoot(value);
  const raw = value as Record<string, any>;
  return [raw, ...(raw.operation?.snapshot ? [raw.operation.snapshot] : [])].map((scene) => ({
    head: publicHistoryHead(scene),
    scene: scene as VenueScene,
  }));
}
async function validatePublicHistory(documents: Pick<CapabilityDocumentStore, "getById">, scenes: unknown[]) {
  const tracer = createScenePublicHistoryTracer(async (id) => {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row?.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned public Scene history page is missing or changed",
    );
    return row.data as MemoryPageData;
  });
  for (const { head, scene } of scenes.flatMap(scenePublicHistoryOwners)) await tracer.trace(head, scene);
}
/** Consequential retirement checks the authored source before permissive logical field decoding. */
export async function readSceneRetirementSource(documents: Pick<CapabilityDocumentStore, "getById">, value: unknown) {
  readSceneHistoryRoot(value);
  await validatePublicHistory(documents, [value]);
  const raw = value as VenueScene & { storageFormat: number; transcript: unknown; submissionHistory: unknown };
  const { lines } = await decodeSceneTranscript(readSceneTranscriptHead(raw.transcript, raw), async (id) => {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned Scene transcript page is missing or changed",
    );
    return row.data as MemoryPageData;
  });
  const { submissions } = await decodeSceneSubmissions(
    readSceneSubmissionHead((raw as any).submissionHistory, raw),
    async (id) => {
      const row = await documents.getById("villages", id);
      memoryRequire(
        row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
        "owned Scene submission page is missing or changed",
      );
      return row.data as MemoryPageData;
    },
  );
  return { ...raw, lines, submissions };
}
export async function readSceneTranscriptIndex(documents: Pick<CapabilityDocumentStore, "getById">, value: unknown) {
  const scene = await readSceneWorkIndex(documents, value);
  const { lines } = await sceneTranscriptStore(documents as CapabilityDocumentStore).read(
    readSceneTranscriptHead((value as Record<string, any>).transcript, scene),
    scene,
  );
  return { ...scene, lines };
}
/** Coordinator saves operation metadata and submission timing, preserving public turn visibility. */
export function publishSceneOperationHistory(before: Record<string, unknown>, next: Record<string, unknown>) {
  const old = publicHistoryHead(before);
  memoryRequire(
    JSON.stringify([before.id, before.villageSeed, before.transcript, before.participants]) ===
      JSON.stringify([next.id, next.villageSeed, next.transcript, next.participants]),
    "Scene operation cannot change transcript or cast",
  );
  const scene = coerceSession({
    version: 5,
    id: next.id,
    villageSeed: next.villageSeed,
    participants: next.participants,
  });
  const transcript = readSceneTranscriptHead(next.transcript, scene),
    submissions = readSceneSubmissionHead(next.submissionHistory, scene);
  next.publicHistory = rebindScenePublicHistory(old, scene, transcript, submissions);
}
/** Backlog and recovery enumeration need mechanics, not transcript or frozen native context. */
export function readSceneIndex(value: unknown): Omit<VenueScene, "continuity"> {
  readSceneHistoryRoot(value);
  const {
    storageFormat: _format,
    continuity,
    transcript: _transcript,
    submissionHistory: _submissions,
    publicHistory: _publicHistory,
    ...fields
  } = value as Record<string, any>;
  const scene = coerceSession(fields);
  Object.defineProperty(scene, "lines", {
    enumerable: false,
    get() {
      throw new Error("Scene transcript was not loaded for this operation.");
    },
  });
  Object.defineProperty(scene, "submissions", {
    enumerable: false,
    configurable: true,
    get() {
      throw new Error("Scene submissions were not loaded for this operation.");
    },
  });
  if (continuity)
    Object.defineProperty(scene, "continuity", {
      enumerable: false,
      get() {
        throw new Error("Frozen Scene history was not loaded for this operation.");
      },
    });
  return scene;
}
/** Recovery consumers explicitly load saved turn mechanics, independently of prose. */
export async function readSceneWorkIndex(documents: Pick<CapabilityDocumentStore, "getById">, value: unknown) {
  const scene = readSceneIndex(value);
  const { submissions } = await sceneSubmissionStore(documents as CapabilityDocumentStore).read(
    readSceneSubmissionHead((value as Record<string, any>).submissionHistory, scene),
    { ...scene, continuity: (value as VenueScene).continuity },
  );
  Object.defineProperty(scene, "submissions", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: [...submissions],
  });
  return scene;
}
/** Checkpoint publication validates every referenced page once without decoding ordinary historical prose. */
export async function validateSceneHistory(documents: Pick<CapabilityDocumentStore, "getById">, scenes: unknown[]) {
  const tracer = createSceneTranscriptTracer(async (id) => {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned Scene transcript page is missing or changed",
    );
    return row.data as MemoryPageData;
  });
  for (const owner of scenes.flatMap(sceneTranscriptOwners)) await tracer.trace(owner.head, owner.participants);
  const submissions = createSceneSubmissionTracer(async (id) => {
    const row = await documents.getById("villages", id);
    memoryRequire(
      row && row.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "owned Scene submission page is missing or changed",
    );
    return row.data as MemoryPageData;
  });
  for (const owner of scenes.flatMap(sceneSubmissionOwners))
    await submissions.trace(owner.head, owner.participants, owner.scene);
  await validatePublicHistory(documents, scenes);
  for (const value of scenes) {
    const raw = value as Record<string, any>;
    for (const operation of [raw.operation, ...(raw.abandonedOperations ?? [])])
      await validateOperationEvidenceOwners(documents, operation, raw as VenueScene);
  }
}
export async function validateOperationEvidenceOwners(
  documents: Pick<CapabilityDocumentStore, "getById">,
  operation: unknown,
  scope: Pick<VenueScene, "id" | "villageSeed" | "continuity">,
  mark: (id: string) => void = () => {},
) {
  const store = operationEvidenceStore(documents as CapabilityDocumentStore);
  for (const claim of operationCheckpointClaims(operation, scope)) {
    const saved = await store.pending(claim, scope);
    if (saved) {
      mark(saved.ref.id);
    }
  }
  for (const ref of operationEvidenceReferences(operation, scope)) {
    await store.inspect(ref, scope);
    mark(ref.id);
  }
}
/** Native request snapshots are inline; prose and submission history share immutable pages. */
export function createSceneHistory(documents: CapabilityDocumentStore) {
  const transcripts = sceneTranscriptStore(documents),
    submissions = sceneSubmissionStore(documents),
    evidence = operationEvidenceStore(documents),
    publicHistories = scenePublicHistoryStore(documents);
  async function decode(value: unknown): Promise<VenueScene> {
    readSceneHistoryRoot(value);
    const raw = value as Record<string, any>,
      { storageFormat: _format, transcript, submissionHistory, publicHistory: _publicHistory, ...logical } = raw;
    logical.operation = await evidence.decode(raw.operation, raw as VenueScene);
    const header = coerceSession({ ...logical, lines: [], submissions: [] });
    logical.lines = (await transcripts.read(readSceneTranscriptHead(transcript, header), header)).lines;
    logical.submissions = (
      await submissions.read(readSceneSubmissionHead(submissionHistory, header), header)
    ).submissions;
    return coerceSession(logical);
  }
  async function encode(scene: VenueScene, previous?: unknown) {
    if (previous) readSceneHistoryRoot(previous);
    const before = previous as Record<string, any> | undefined;
    const transcript = await transcripts.prepare(
      scene,
      before ? readSceneTranscriptHead(before.transcript, scene) : undefined,
    );
    const submissionHistory = await submissions.prepare(
      scene,
      before ? readSceneSubmissionHead(before.submissionHistory, scene) : undefined,
    );
    const publicHistory = await publicHistories.prepare(
      scene,
      transcript,
      submissionHistory,
      before ? publicHistoryHead(before) : undefined,
    );
    const { lines: _lines, submissions: _submissions, ...facts } = scene;
    const operation = await evidence.encode(scene.operation, scene, before?.operation);
    const result = {
      ...facts,
      operation,
      storageFormat: SCENE_STORAGE_FORMAT,
      transcript,
      submissionHistory,
      publicHistory,
    };
    readSceneHistoryRoot(result);
    return result;
  }
  return { decode, encode };
}
