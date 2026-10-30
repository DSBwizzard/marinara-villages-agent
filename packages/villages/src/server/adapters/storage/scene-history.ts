import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { RelationshipState } from "../../domain/models/relationship-types.js";
import { coerceSession } from "../../domain/decoding/scene-codec.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { immutableRelationshipState } from "../../domain/rules/relationship-rules.js";
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
  sceneSubmissionStore,
  readSceneSubmissionHead,
  decodeSceneSubmissions,
  createSceneSubmissionTracer,
  type SceneSubmissionHead,
} from "./scene-submission-pages.js";
import {
  relationshipPayloadStore,
  relationshipDocumentId,
  readRelationshipRoot,
  readRelationshipHead,
  assertRelationshipWorld,
  validateRelationshipHistory,
  type RelationshipHead,
  type RelationshipScope,
} from "./relationship-payload-store.js";

export const SCENE_STORAGE_FORMAT = 7;
export type SceneHistoryOwner = { sceneId: string; scope: RelationshipScope; head: RelationshipHead };
const associations = new WeakMap<RelationshipState, { scope: RelationshipScope; head: RelationshipHead }>();
const identity = (head: RelationshipHead) => head.id + ":" + head.digest;
export async function readActiveSceneOwner(documents: Pick<CapabilityDocumentStore, "getById">) {
  const pointer = await documents.getById("villages", "villages-active-venue");
  if (!pointer) return { pointer, scene: null };
  memoryRequire(
    pointer.id === "villages-active-venue" && pointer.packageId === "villages" && pointer.kind === "venue-active",
    "invalid active Scene owner identity",
  );
  memoryObject(pointer.data);
  const id = pointer.data.sessionId;
  memoryRequire(id === undefined || id === null || typeof id === "string", "invalid active Scene reference");
  if (!id) return { pointer, scene: null };
  const scene = await documents.getById("villages", "villages-venue-visit-" + id);
  memoryRequire(
    scene &&
      scene.id === "villages-venue-visit-" + id &&
      scene.packageId === "villages" &&
      scene.kind === "venue-visit",
    "active Scene ownership is missing or changed",
  );
  sceneHistoryOwners(scene.data);
  memoryRequire((scene.data as { id?: string }).id === id, "active Scene owner identity changed");
  return { pointer, scene };
}

function storedContinuity(raw: unknown, scene: Record<string, any>) {
  if (raw === undefined) return undefined;
  memoryObject(raw, ["version", "seed", "setupAt", "capturedAt", "receiptIds", "facts", "relationshipHead"]);
  memoryObject(
    raw.facts,
    sceneContinuityFields.filter((key) => key !== "relationshipContext"),
  );
  memoryRequire(
    raw.version === 3 &&
      typeof raw.seed === "string" &&
      raw.seed === scene.villageSeed &&
      raw.facts.seed === raw.seed &&
      typeof raw.setupAt === "string" &&
      typeof raw.capturedAt === "string" &&
      Number.isFinite(Date.parse(raw.capturedAt)) &&
      Array.isArray(raw.receiptIds) &&
      raw.receiptIds.every((id) => typeof id === "string") &&
      Object.hasOwn(raw, "relationshipHead") &&
      !Object.hasOwn(raw.facts, "relationshipContext"),
    "invalid frozen Scene history owner",
  );
  const scope = { seed: raw.seed as string, setupAt: raw.setupAt as string };
  const head = raw.relationshipHead === null ? null : readRelationshipHead(raw.relationshipHead);
  if (head) assertRelationshipWorld(head, scope);
  return { raw, scope, head };
}
/** Enumerate only the two explicitly owned Scene contexts, never arbitrary prose or model output. */
export function sceneHistoryOwners(value: unknown): SceneHistoryOwner[] {
  const owners: SceneHistoryOwner[] = [];
  function scene(raw: unknown, admitted = false, expectedId?: string) {
    memoryObject(raw);
    memoryRequire(
      raw.storageFormat === SCENE_STORAGE_FORMAT &&
        raw.version === 3 &&
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
    const context = storedContinuity(raw.continuity, raw);
    if (context?.head) owners.push({ sceneId: raw.id, scope: context.scope, head: context.head });
    if (raw.operation !== undefined && raw.operation !== null) {
      memoryObject(raw.operation);
      const snapshot = raw.operation.snapshot;
      if (snapshot !== undefined && snapshot !== null) {
        memoryRequire(!admitted, "nested admitted Scene snapshot");
        memoryObject(snapshot);
        memoryRequire(snapshot.villageSeed === raw.villageSeed, "admitted Scene belongs to another Village");
        const admittedContext = storedContinuity(snapshot.continuity, snapshot);
        if (context && admittedContext)
          memoryRequire(
            context.scope.seed === admittedContext.scope.seed &&
              context.scope.setupAt === admittedContext.scope.setupAt,
            "admitted Scene belongs to another world scope",
          );
        scene(snapshot, true, raw.id);
      }
    }
  }
  scene(value);
  return owners;
}
export function sceneTranscriptOwners(
  value: unknown,
): { head: SceneTranscriptHead; participants: VenueScene["participants"] }[] {
  sceneHistoryOwners(value);
  const raw = value as Record<string, any>;
  const heads = [
    {
      head: readSceneTranscriptHead(raw.transcript, raw as VenueScene),
      participants: coerceSession({ version: 3, participants: raw.participants }).participants,
    },
  ];
  if (raw.operation?.snapshot)
    heads.push({
      head: readSceneTranscriptHead(raw.operation.snapshot.transcript, raw.operation.snapshot),
      participants: coerceSession({ version: 3, participants: raw.operation.snapshot.participants }).participants,
    });
  return heads;
}
export function sceneSubmissionOwners(
  value: unknown,
): { head: SceneSubmissionHead; participants: VenueScene["participants"] }[] {
  sceneHistoryOwners(value);
  const raw = value as Record<string, any>;
  return [raw, ...(raw.operation?.snapshot ? [raw.operation.snapshot] : [])].map((owner) => ({
    head: readSceneSubmissionHead(owner.submissionHistory, owner),
    participants: coerceSession({ version: 3, participants: owner.participants }).participants,
  }));
}
/** Consequential retirement checks the authored source before permissive logical field decoding. */
export async function readSceneRetirementSource(documents: Pick<CapabilityDocumentStore, "getById">, value: unknown) {
  sceneHistoryOwners(value);
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
/** Backlog and recovery enumeration need mechanics, not transcript or frozen relationship hydration. */
export function readSceneIndex(value: unknown): Omit<VenueScene, "continuity"> {
  sceneHistoryOwners(value);
  const {
    storageFormat: _format,
    continuity,
    transcript: _transcript,
    submissionHistory: _submissions,
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
/** Recovery consumers explicitly load saved turn mechanics, independently of prose and frozen relationships. */
export async function readSceneWorkIndex(documents: Pick<CapabilityDocumentStore, "getById">, value: unknown) {
  const scene = readSceneIndex(value);
  const { submissions } = await sceneSubmissionStore(documents as CapabilityDocumentStore).read(
    readSceneSubmissionHead((value as Record<string, any>).submissionHistory, scene),
    scene,
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
  await validateRelationshipHistory(documents, scenes.flatMap(sceneHistoryOwners));
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
  for (const owner of scenes.flatMap(sceneSubmissionOwners)) await submissions.trace(owner.head, owner.participants);
}
/** Logical Scenes stay host-free. Only this adapter binds an exact verified immutable body to a native reference. */
export function createSceneHistory(documents: CapabilityDocumentStore) {
  const payloads = relationshipPayloadStore(documents);
  const transcripts = sceneTranscriptStore(documents);
  const submissions = sceneSubmissionStore(documents);
  async function decode(value: unknown): Promise<VenueScene> {
    sceneHistoryOwners(value);
    const raw = value as Record<string, any>,
      { storageFormat: _format, transcript, submissionHistory, ...logical } = raw;
    const captured = storedContinuity(raw.continuity, raw);
    let body: RelationshipState | undefined;
    logical.continuity = undefined;
    if (captured) {
      if (captured.head) {
        body = await payloads.readSnapshot(captured.head, captured.scope);
        associations.set(body, { scope: captured.scope, head: captured.head });
      }
      const { relationshipHead: _head, ...continuity } = captured.raw;
      logical.continuity = { ...continuity, facts: { ...continuity.facts, relationshipContext: body } };
    }
    const header = coerceSession({ ...logical, continuity: undefined, lines: [] });
    logical.lines = (await transcripts.read(readSceneTranscriptHead(transcript, header), header)).lines;
    logical.submissions = (
      await submissions.read(readSceneSubmissionHead(submissionHistory, header), header)
    ).submissions;
    // The coordinator retains its native admitted snapshot. Its sole consumer hydrates it explicitly.
    const scene = coerceSession(logical);
    if (scene.continuity && body) scene.continuity.facts.relationshipContext = body;
    return scene;
  }
  async function encode(scene: VenueScene, previous?: unknown) {
    const protectedHeads = new Set(previous ? sceneHistoryOwners(previous).map((owner) => identity(owner.head)) : []);
    const continuity = scene.continuity;
    let stored: unknown;
    if (continuity) {
      memoryRequire(
        typeof continuity.setupAt === "string" && continuity.seed === scene.villageSeed,
        "invalid captured Scene scope",
      );
      const scope = { seed: continuity.seed, setupAt: continuity.setupAt };
      let head: RelationshipHead | null = null;
      const captured = continuity.facts.relationshipContext;
      if (captured) {
        const body = immutableRelationshipState(scope.seed, captured),
          known = associations.get(body);
        if (
          known &&
          known.scope.seed === scope.seed &&
          known.scope.setupAt === scope.setupAt &&
          protectedHeads.has(identity(known.head))
        ) {
          // The previous native owner remains protected under the caller's full work admission.
          await payloads.readSnapshot(known.head, scope);
          head = known.head;
        } else {
          const live = await documents.getById("villages", relationshipDocumentId(scope.seed));
          memoryRequire(
            !live || (live.packageId === "villages" && live.kind === "relationships"),
            "invalid live relationship owner identity",
          );
          const current = live?.kind === "relationships" ? readRelationshipRoot(live.data, scope).head : undefined;
          head = await payloads.prepare(body, scope, current);
        }
        associations.set(body, { scope, head });
        continuity.facts.relationshipContext = body;
      }
      const { relationshipContext: _body, ...facts } = continuity.facts;
      stored = { ...continuity, facts, relationshipHead: head };
    }
    const prior = previous ? readSceneTranscriptHead((previous as Record<string, any>).transcript, scene) : undefined;
    const transcript = await transcripts.prepare(scene, prior);
    const priorSubmissions = previous
      ? readSceneSubmissionHead((previous as Record<string, any>).submissionHistory, scene)
      : undefined;
    const submissionHistory = await submissions.prepare(scene, priorSubmissions);
    const { lines: _lines, submissions: _submissions, ...facts } = scene;
    const result = { ...facts, storageFormat: SCENE_STORAGE_FORMAT, transcript, submissionHistory, continuity: stored };
    sceneHistoryOwners(result);
    return result;
  }
  return { decode, encode };
}
