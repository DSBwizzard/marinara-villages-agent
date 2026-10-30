import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { createSceneRepository } from "../packages/villages/src/server/adapters/storage/scene-repository.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { recallMemories } from "../packages/villages/src/server/domain/rules/memory-recall.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { readSpinoffReview } from "../packages/villages/src/server/domain/rules/spinoff-memory.js";
import { createSceneArchive } from "../packages/villages/src/server/features/scenes/archive-service.js";
import { createLiveScenes } from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { createSpinoffs, type SpinoffPorts } from "../packages/villages/src/server/features/scenes/spinoff-service.js";
import type { SceneView } from "../packages/villages/src/shared/contracts/village.js";
import type {
  CapabilityDocumentStore,
  CapabilityLanguageModelHost,
  CapabilityPersistenceHost,
} from "../sources/package-shared.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

const stamp = "2026-10-15T23:30:00.000Z";
function fixture() {
  let village = defaultVillageState();
  village.seed = "spinoff-world";
  village.foundedAt = "2026-10-14T00:00:00.000Z";
  village.timeZone = "America/Los_Angeles";
  village.playerPersonaId = "persona";
  village.playerPersonaName = "Player";
  village.villagers = [
    {
      characterId: "buster",
      cardSnapshot: {
        id: "buster",
        name: "Buster",
        description: "Village grocer",
        capturedAt: stamp,
        revision: 1,
        sourceStatus: "available",
      },
      wishes: [fixtureWish({ wish: "NEVER EXPORT" })],
      agenda: {
        day: [{ startMinute: 1080, endMinute: 1200, activity: "PRIVATE AGENDA", venueId: "hidden" }],
      },
    },
  ] as unknown as typeof village.villagers;
  const scene = coerceSession({
    version: 3,
    id: "source",
    villageSeed: village.seed,
    processingVersion: 1,
    status: "active",
    sceneRevision: 3,
    startedAt: stamp,
    lastActivityAt: stamp,
    placeId: "market",
    placeName: "Market",
    zoneId: "common",
    activeIds: ["buster"],
    participants: [{ characterId: "buster", name: "Buster", doing: "Shopping" }],
    lines: [
      {
        id: "origin-p",
        role: "user",
        speakerId: "player",
        name: "Player",
        content: "Let us choose apples.",
        at: stamp,
        heardBy: ["buster"],
      },
      {
        id: "origin-b",
        role: "assistant",
        speakerId: "buster",
        name: "Buster",
        content: "A lovely idea.",
        at: stamp,
        heardBy: ["buster"],
      },
      {
        id: "secret",
        role: "assistant",
        speakerId: "someone",
        name: "Other",
        content: "HIDDEN ZONE SECRET",
        contactHidden: true,
        heardBy: ["someone"],
        at: stamp,
      },
    ],
  });
  const records = new Map<string, { id: string; packageId: string; kind: string; data: unknown; revision: number }>([
    [
      "villages-active-venue",
      {
        id: "villages-active-venue",
        packageId: "villages",
        kind: "venue-active",
        data: { sessionId: "source", placeId: "market" },
        revision: 1,
      },
    ],
    [
      "villages-venue-visit-source",
      {
        id: "villages-venue-visit-source",
        packageId: "villages",
        kind: "venue-visit",
        data: scene,
        revision: 1,
      },
    ],
  ]);
  let failSceneWrite = false;
  const documents = {
    getById: async (_package: string, id: string) => structuredClone(records.get(id) ?? null),
    list: async (_package: string, kind: string) =>
      [...records.values()].filter((record) => record.kind === kind).map((record) => structuredClone(record)),
    async create(input: { id: string; packageId: string; kind: string; data: unknown }) {
      assert.ok(!records.has(input.id), "unique document identity");
      const record = { ...structuredClone(input), revision: 1 };
      records.set(input.id, record);
      return record;
    },
    async update(input: { id: string; expectedRevision: number; data: unknown }) {
      if (
        failSceneWrite &&
        input.id === "villages-venue-visit-source" &&
        (input.data as typeof scene).spinoff?.status === "resolved"
      )
        throw new Error("synthetic Scene write failure");
      const prior = records.get(input.id);
      if (prior?.revision !== input.expectedRevision) return null;
      const record = { ...prior, data: structuredClone(input.data), revision: prior.revision + 1 };
      records.set(input.id, record);
      return record;
    },
    remove: async (_package: string, id: string, revision: number) => {
      if (records.get(id)?.revision !== revision) return false;
      return records.delete(id);
    },
  } as unknown as CapabilityDocumentStore;
  let chat: { id: string; metadata: unknown; characterIds: string[]; personaId: string } | null = {
    id: "engine",
    characterIds: ["buster"],
    personaId: "persona",
    metadata: { sceneStatus: "active" },
  };
  let rows = [
    { id: "p1", role: "user", characterId: null, content: "I will listen while you tell me about your father." },
    {
      id: "b1",
      role: "assistant",
      characterId: "buster",
      content: "Thank you for staying beside me at the shrine. It meant a lot.",
    },
  ];
  let result: unknown = {
    eligibility: "compatible",
    explanation: "A short shared encounter consistent with this setting.",
    evidenceIds: [],
    memories: [
      {
        text: "At the old shrine, you stayed beside Buster while he spoke about his father.",
        action: "create",
        kind: "experience",
        subjects: ["buster"],
        learners: Object.fromEntries(
          ["player", "buster"].map((id) => [
            id,
            {
              basis: "observation",
              support: [
                { lineId: "p1", excerpt: rows[0].content },
                { lineId: "b1", excerpt: rows[1].content },
              ],
            },
          ]),
        ),
      },
    ],
  };
  let calls = 0;
  let failModel = false;
  let generationGate: (() => Promise<void>) | undefined;
  const storedDocuments = villageFixtureDocuments(documents);
  const repository = createSceneRepository({
    villagesDocuments: () => storedDocuments,
    mutateDocument: createDocumentMutator(() => storedDocuments),
  });
  const persistence = {
    documents: storedDocuments,
    getChat: async () => structuredClone(chat),
    listMessages: async () => structuredClone(rows),
  } as unknown as CapabilityPersistenceHost;
  const model = {
    connectionId: "narration",
    fitContext: (messages: unknown[]) => ({ messages, trimmed: false }),
    chatComplete: async (messages: any[], options: any) => {
      assert.deepEqual(options.responseFormat, { type: "json_object" });
      assert.match(messages.map((message) => message.content).join("\n"), /json/i);
      calls++;
      await generationGate?.();
      if (failModel) throw new Error("synthetic provider failure");
      const response = structuredClone(result) as any;
      const context = JSON.parse(messages[1].content).memory;
      for (const memory of response.memories ?? [])
        memory.screening = {
          disposition: "clear",
          protectedRoots: [],
          fingerprint: context.administrative.fingerprint,
        };
      return { content: JSON.stringify(response), finishReason: "stop" };
    },
  };
  const ports: SpinoffPorts = {
    repository,
    readVillageState: async () => structuredClone(village),
    mutateVillageState: async (update) => {
      const draft = structuredClone(village);
      update(draft);
      village = draft;
      return structuredClone(village);
    },
    persistence: () => persistence,
    models: () => ({ resolve: async () => model }) as unknown as CapabilityLanguageModelHost,
    connectionId: async () => "narration",
    now: () => new Date(stamp),
    busy: () => false,
    parseJson: JSON.parse,
  };
  let service = createSpinoffs(ports);
  async function start() {
    const value = await service.begin(
      "source",
      "buster",
      (await repository.readSession("source")).sceneRevision,
      randomUUID(),
    );
    assert.equal(
      await service.provider.claim!("source", {
        sceneChatId: "engine",
        characterIds: ["buster"],
        data: { spinoffId: value.id },
      }),
      true,
    );
    return value;
  }
  async function conclude() {
    await service.provider.release!("source", {
      kind: "concluded",
      sceneChatId: "engine",
      data: null,
      summary: "RECAP MUST NOT ENTER RESIDENT PROMPTS",
      description: null,
      scenario: null,
      rating: "sfw",
      characterIds: ["buster"],
    });
    chat!.metadata = { sceneStatus: "concluded", sceneSummary: "RECAP MUST NOT ENTER RESIDENT PROMPTS" };
  }
  return {
    ports,
    repository,
    records,
    start,
    conclude,
    service: () => service,
    restart: () => {
      service = createSpinoffs(ports);
    },
    village: () => village,
    changeVillage: (update: (state: typeof village) => void) => update(village),
    setResult: (value: unknown) => {
      result = value;
    },
    setRows: (value: typeof rows) => {
      rows = value;
    },
    setChat: (value: typeof chat) => {
      chat = value;
    },
    calls: () => calls,
    failModel: (value: boolean) => {
      failModel = value;
    },
    gate: (value: typeof generationGate) => {
      generationGate = value;
    },
    failSceneWrite: (value: boolean) => {
      failSceneWrite = value;
    },
  };
}

const frozen = fixture();
await frozen.repository.changeSession("source", (scene) => {
  scene.continuity = captureSceneContinuity(frozen.village(), scene, Date.parse(stamp));
});
frozen.changeVillage((world) => {
  world.setting = "FUTURE SETTING";
  world.worldFacts = ["FUTURE FACT"];
  world.playerPersonaName = "FUTURE PLAYER";
  world.villagers[0]!.cardSnapshot.description = "FUTURE DESCRIPTION";
});
await frozen.start();
const frozenContext = (await frozen.repository.readSession("source")).spinoff!.context;
assert(!frozenContext.includes("FUTURE"), "spinoffs export the source Scene snapshot");
assert(frozenContext.includes("Village grocer"));

const personaChange = fixture();
await personaChange.repository.changeSession("source", (scene) => {
  scene.continuity = captureSceneContinuity(personaChange.village(), scene, Date.parse(stamp));
});
personaChange.changeVillage((world) => {
  world.playerPersonaId = "different-persona";
});
await assert.rejects(personaChange.start(), /Persona changed.*new Scene/);
assert.equal(personaChange.calls(), 0, "mismatched Persona does not start generation");

const roundtrip = fixture();
assert.equal(
  (publicSceneResponse(await roundtrip.repository.readSession("source")) as unknown as SceneView).spinoffPending,
  undefined,
  "ordinary Scenes do not request spinoff recovery",
);
const initial = await roundtrip.start();
const saved = await roundtrip.repository.readSession("source");
assert.ok(!JSON.stringify(saved.spinoff!.context).includes("NEVER EXPORT"));
assert.ok(!JSON.stringify(saved.spinoff).includes("HIDDEN ZONE SECRET"));
assert.ok(!JSON.stringify(saved.spinoff!.context).includes("PRIVATE AGENDA"));
assert.equal(
  (publicSceneResponse(saved) as typeof saved).spinoff,
  undefined,
  "private handoff context never leaks through normal Scene APIs",
);
assert.equal(
  (publicSceneResponse(saved) as unknown as SceneView).spinoffPending,
  true,
  "normal Scene APIs expose only the pending handoff flag for reload recovery",
);
for (const status of ["prepared", "running", "returned", "resolved"] as const) {
  const pending = { ...saved, spinoff: { ...saved.spinoff!, status, resolvedAt: undefined } };
  assert.equal(
    (publicSceneResponse(pending) as unknown as SceneView).spinoffPending,
    true,
    `${status} handoffs retain recovery, including an interrupted final resume`,
  );
}
await assert.rejects(
  roundtrip.repository.changeSession("source", (scene) => {
    scene.zoneId = "other";
  }),
  /spinoff/,
);
const live = createLiveScenes({
  ...roundtrip.ports,
  ...roundtrip.repository,
  hasVenueOperation: () => false,
});
await assert.rejects(live.requireLiveVenueSession("source"), /spinoff/);
await roundtrip.conclude();
assert.equal(roundtrip.calls(), 0, "callback makes no model call");
const proposed = await roundtrip.service().prepare("source");
assert.equal(proposed.memories.length, 1);
assert.equal(roundtrip.village().memories.records.length, 0, "nothing saved before review");
await roundtrip.service().resolve(
  "source",
  proposed.memories.map((memory) => memory.id),
);
await roundtrip.service().resolve(
  "source",
  proposed.memories.map((memory) => memory.id),
);
assert.equal(roundtrip.village().memories.records.length, 1, "double apply creates one memory");
assert.equal(
  (publicSceneResponse(await roundtrip.repository.readSession("source")) as unknown as SceneView).spinoffPending,
  false,
  "a completed handoff no longer requests recovery",
);
const recalled = recallMemories(roundtrip.village().memories, {
  purpose: "narration",
  audience: ["buster"],
  query: "shrine father",
  budget: 1000,
}).candidates;
assert.equal(recalled.length, 1, "accepted shared experience is available to existing resident recall");
assert.deepEqual(
  recallMemories(roundtrip.village().memories, {
    purpose: "narration",
    audience: ["other"],
    query: "shrine father",
    budget: 1000,
  }).candidates,
  [],
);
assert.equal(recalled[0].occurredAt, stamp);
assert.ok(!JSON.stringify(recalled).includes("RECAP MUST NOT"));
assert.ok(
  roundtrip.records.has(`villages-spinoff-${initial.id}`),
  "evidence survives independently of Scene retention",
);

for (const event of [
  "I fall asleep for two months",
  "We spend fourteen hours shopping",
  "I kill Buster",
  "Uncertain continuity",
]) {
  const f = fixture();
  await f.start();
  await f.conclude();
  f.setResult({
    eligibility: event === "Uncertain continuity" ? "uncertain" : "incompatible",
    explanation: event,
    evidenceIds: ["p1"],
    memories: [],
  });
  const result = await f.service().prepare("source");
  assert.equal(result.memories.length, 0);
  await assert.rejects(f.service().resolve("source", ["invented"]));
  await f.service().resolve("source", []);
  assert.equal(f.village().memories.records.length, 0);
}

for (const kind of ["abandoned", "deleted", "converted"] as const) {
  const f = fixture();
  await f.start();
  await f.service().provider.release!("source", { kind, sceneChatId: "engine", data: null });
  assert.equal((await f.repository.readSession("source")).spinoff!.status, "resolved");
  assert.equal(f.calls(), 0);
  await f.repository.changeSession("source", (scene) => {
    scene.zoneId = "next";
  });
}

const missed = fixture();
await missed.start();
missed.restart();
missed.setChat({
  id: "engine",
  personaId: "persona",
  characterIds: ["buster"],
  metadata: { sceneStatus: "concluded", sceneSummary: "Recovered recap" },
});
assert.equal((await missed.service().reconcile("source")).status, "returned");
const missing = fixture();
await missing.start();
missing.setChat(null);
assert.equal((await missing.service().reconcile("source")).status, "resolved");

const failed = fixture();
await failed.start();
await failed.conclude();
failed.failModel(true);
await assert.rejects(failed.service().prepare("source"), /provider failure/);
failed.restart();
failed.failModel(false);
await assert.rejects(failed.service().prepare("source"), /Retry explicitly/);
const retried = await failed.service().prepare("source", true);
assert.equal(retried.memories.length, 1);
assert.equal(failed.calls(), 2);

const reset = fixture();
await reset.start();
await reset.conclude();
reset.changeVillage((state) => {
  state.seed = "new-village";
});
await assert.rejects(reset.service().prepare("source"), /no longer belongs/);
assert.equal(reset.calls(), 0);

const interrupted = fixture();
await interrupted.start();
await interrupted.conclude();
const offer = await interrupted.service().prepare("source");
interrupted.failSceneWrite(true);
await assert.rejects(interrupted.service().resolve("source", [offer.memories[0].id]), /Scene write failure/);
assert.equal(interrupted.village().memories.records.length, 1);
interrupted.failSceneWrite(false);
interrupted.restart();
await interrupted.service().resolve("source", [offer.memories[0].id]);
assert.equal(interrupted.village().memories.records.length, 1, "retry after memory commit does not duplicate it");

const malformed = fixture();
await malformed.start();
await malformed.conclude();
malformed.setResult({
  eligibility: "compatible",
  explanation: "invented citation",
  evidenceIds: [],
  memories: [
    {
      action: "create",
      kind: "information",
      text: "Unsupported",
      subjects: [],
      learners: { buster: { basis: "observation", support: [{ lineId: "not-present", excerpt: "unsupported" }] } },
      screening: { disposition: "clear", protectedRoots: [], fingerprint: "fake" },
    },
  ],
});
await assert.rejects(malformed.service().prepare("source"), /unsupplied source/);
assert.equal(malformed.village().memories.records.length, 0);
assert.throws(
  () =>
    readSpinoffReview(
      {
        eligibility: "incompatible",
        explanation: "No",
        evidenceIds: [],
        memories: [{ text: "smuggled", evidenceIds: ["p1"] }],
      },
      saved.spinoff!,
    ),
  /not supplied|ineligible/i,
);

// A handoff inherits Scene time, not the wall clock when its launch button is pressed.
const anchored = fixture();
anchored.ports.now = () => new Date("2026-10-18T23:30:00Z");
assert.equal((await anchored.start()).anchoredAt, stamp);
await anchored.service().provider.release!("source", { kind: "deleted", sceneChatId: "engine", data: null });
assert.equal((await anchored.repository.readSession("source")).lastActivityAt, "2026-10-18T23:30:00.000Z");

for (const extra of [
  { hiddenFromUser: true },
  { hiddenFromAI: true },
  { hiddenFromAICharacterIds: ["buster"] },
  { commandOnly: true },
  { roleplayPrivateOnly: true },
]) {
  const f = fixture();
  await f.start();
  await f.conclude();
  f.setRows([
    Object.assign(
      { id: "hidden", role: "user", characterId: null, content: "NEVER EXPOSE THIS" },
      { extra: JSON.stringify(extra) },
    ),
  ]);
  await assert.rejects(f.service().prepare("source"), /private or excluded/);
  assert.equal(f.calls(), 0);
  assert.ok(!JSON.stringify((await f.repository.readSession("source")).spinoff!.evidence).includes("NEVER EXPOSE"));
}

const removed = fixture();
await removed.start();
removed.changeVillage((state) => {
  state.villagers = [];
});
assert.equal((await removed.service().reconcile("source")).status, "resolved");
await removed.repository.changeSession("source", (scene) => {
  scene.zoneId = "next";
});

// A turn admitted while model resolution awaited must defeat handoff admission.
const admission = fixture();
const models = admission.ports.models;
admission.ports.models = () =>
  ({
    resolve: async () => {
      await admission.repository.changeSpinoffSession("source", (scene) => {
        scene.operation = { status: "running" } as typeof scene.operation;
      });
      return models().resolve("narration");
    },
  }) as unknown as CapabilityLanguageModelHost;
await assert.rejects(admission.service().begin("source", "buster", 3, randomUUID()), /Scene changed/);
assert.equal((await admission.repository.readSession("source")).spinoff, undefined);

// Claim wins before selection: discard must not free an Engine-owned scene.
const claimWins = fixture();
const prepared = await claimWins.service().begin("source", "buster", 3, randomUUID());
const rawChange = claimWins.repository.changeSpinoffSession;
let race = true;
claimWins.repository.changeSpinoffSession = async (id, update) => {
  if (race) {
    race = false;
    assert.equal(
      await claimWins.service().provider.claim!("source", {
        sceneChatId: "engine",
        characterIds: ["buster"],
        data: { spinoffId: prepared.id },
      }),
      true,
    );
  }
  return rawChange(id, update);
};
await assert.rejects(claimWins.service().resolve("source", []), /status changed/);
assert.equal((await claimWins.repository.readSession("source")).spinoff!.status, "running");

// Selection wins first: the in-flight Engine claim is refused, including an empty selection.
const discardWins = fixture();
const disposable = await discardWins.service().begin("source", "buster", 3, randomUUID());
const documents = discardWins.ports.persistence().documents;
const readDocument = documents.getById;
documents.getById = async (packageId, id) => {
  if (id === `villages-spinoff-${disposable.id}`) {
    assert.equal(
      await discardWins.service().provider.claim!("source", {
        sceneChatId: "engine",
        characterIds: ["buster"],
        data: { spinoffId: disposable.id },
      }),
      false,
    );
  }
  return readDocument(packageId, id);
};
await discardWins.service().resolve("source", []);
assert.ok(!discardWins.records.has(`villages-spinoff-${disposable.id}`), "discard retains no standalone transcript");

// Starting over removes independent accepted-memory evidence, not unrelated package data.
await roundtrip.repository.clearActivePointer("source");
const archive = createSceneArchive({
  villagesDocuments: () => roundtrip.ports.persistence().documents,
  readActive: roundtrip.repository.readActive,
  readSession: roundtrip.repository.readSession,
  readVillageState: roundtrip.ports.readVillageState,
  mutateVillageState: roundtrip.ports.mutateVillageState,
  processSavedProgressSubmission: async () => {},
  removeInterpretationDiagnostics: async () => {},
});
await archive.resetVenueSessions();
assert.equal(
  [...roundtrip.records.values()].filter((row) => row.kind !== "memory-page").length,
  0,
  "reset removes Scene authority; immutable history pages retire through owner-aware cleanup",
);

console.log(
  "Spinoff lifecycle, privacy, whole-scene decision handling, receipt recovery, identity fences and resident memory selection passed (synthetic model outputs; no semantic-quality or paid-provider claim).",
);
