import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { authorSceneFixture, authorVillageFixture } from "./helpers/village-storage.fixture.js";
import { pendingSceneSubmission } from "./helpers/narration-submission.fixture.js";
import {
  activationScope,
  createActivationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { SESSION_KIND, SESSION_PREFIX } from "../packages/villages/src/server/adapters/storage/scene-slots.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VenueLine, VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import {
  configureSceneQueries,
  sceneQueries,
  type SceneQueries,
} from "../packages/villages/src/server/features/scenes/services.js";

type Document = Awaited<ReturnType<CapabilityDocumentStore["list"]>>[number];
const stamp = "2026-10-07T12:00:00.000Z";

function line(id: string, content: string): VenueLine {
  return {
    id,
    speakerId: "mara",
    name: "Mara",
    role: "assistant",
    kind: "dialogue",
    content,
    at: stamp,
    heardBy: ["player", "mara"],
  };
}
function ownedScene(owner: string, id = "same") {
  const message = owner + " exact input (private thought)";
  const scene = coerceSession({
    version: 5,
    id,
    villageSeed: owner,
    placeId: "venue-" + owner,
    placeName: owner + " Venue",
    zoneId: "exterior",
    status: "active",
    sceneRevision: 2,
    startedAt: stamp,
    participants: [{ characterId: "mara", name: "Mara", doing: "listening" }],
    activeIds: ["mara"],
    lines: [
      line("spoken", owner + " exact dialogue"),
      { ...line("private", owner + " hidden speech"), heardBy: ["mara"] },
      {
        id: "input",
        inputOf: "proof",
        speakerId: "player",
        name: "Player",
        role: "user",
        kind: "input",
        content: message,
        at: stamp,
        heardBy: [],
      },
      line("draft", owner + " held reply"),
    ],
  });
  scene.submissions.push({
    ...pendingSceneSubmission(scene, "proof", message, "draft"),
    acceptance: { status: "held", rejected: [] },
    progressError: owner + " held",
  });
  return scene;
}

function fixture(seed: string) {
  const world = { ...defaultVillageState(), seed, name: seed, setupAt: stamp, foundedAt: stamp };
  const scope = villageWorldScope(world);
  const pages = new Map<string, Document>();
  const records: Document[] = [];
  const sessions = new Map<string, VenueScene>();
  const calls: string[] = [];
  const owners: unknown[] = [];
  let paused: "world" | "session" | undefined;
  let worldFault: Error | undefined, listFault: Error | undefined;
  const entered = Promise.withResolvers<void>(),
    gate = Promise.withResolvers<void>();
  function row(id: string, kind: string, data: Document["data"]): Document {
    return {
      id,
      packageId: "villages",
      kind,
      name: id,
      description: "",
      data,
      revision: 1,
      createdAt: stamp,
      updatedAt: stamp,
    };
  }
  pages.set("villages-village", row("villages-village", "village", authorVillageFixture(pages, world)));
  function note(call: string) {
    calls.push(call);
    owners.push(activationScope());
    if (activationScope()?.active === false) throw Error("Original query connection unavailable.");
  }
  async function pauseAt(target: "world" | "session") {
    if (paused !== target) return;
    paused = undefined;
    entered.resolve();
    await gate.promise;
    note(target + "-resumed");
  }
  const service = createSceneQueryService({
    async readSession(id) {
      note("session:" + id);
      await pauseAt("session");
      const session = sessions.get(id);
      assert(session, "A current Scene must exist");
      return structuredClone(session);
    },
    async readVillageState() {
      note("world");
      await pauseAt("world");
      if (worldFault) throw worldFault;
      return structuredClone(world);
    },
    villagesDocuments() {
      note("documents");
      return {
        async getById(packageId, id) {
          note("get:" + id);
          assert.equal(packageId, "villages");
          return structuredClone(pages.get(id) ?? null);
        },
        async list(packageId, kind) {
          note("list");
          assert.equal(packageId, "villages");
          assert.equal(kind, SESSION_KIND);
          if (listFault) throw listFault;
          return structuredClone(records);
        },
      };
    },
  });
  const queries: SceneQueries = {
    ...service,
    activeVenueSession: async () => null,
    listVenueVisits: async () => [],
    processSavedExchange: async () => assert.fail("Scene queries cannot replay saved work"),
  };
  function add(scene: VenueScene) {
    scene.continuity = captureSceneContinuity({ ...world, seed: scene.villageSeed! }, scene, Date.parse(stamp));
    sessions.set(scene.id, scene);
    const id = SESSION_PREFIX + scene.id;
    const record = row(id, SESSION_KIND, authorSceneFixture(pages, scene));
    records.push(record);
    pages.set(id, record);
    return record;
  }
  return {
    scope,
    calls,
    owners,
    records,
    pages,
    service,
    queries,
    add,
    entered,
    gate,
    pause(target: "world" | "session") {
      paused = target;
    },
    failWorld(error: Error) {
      worldFault = error;
    },
    failList(error: Error) {
      listFault = error;
    },
  };
}

const ownerReads = ["documents", "get:villages-village", "get:" + SESSION_PREFIX + "same"];
const backlogRow = (owner: string) => ({
  sessionId: "same",
  submissionId: "proof",
  at: stamp,
  error: owner + " held",
});

{
  const f = fixture("current");
  assert.deepEqual(f.calls, [], "Construction is inert");
  const scene = ownedScene("current");
  const pending = pendingSceneSubmission(scene, "pending", "Still in the outbox", "next");
  scene.submissions.push(
    pending,
    {
      ...pendingSceneSubmission(scene, "applied", "An accepted turn", "accepted-reply"),
      narration: undefined,
      acceptance: { status: "applied", rejected: [] },
      episodeId: "done",
      progressProcessedAt: stamp,
    },
    {
      ...pendingSceneSubmission(scene, "abandoned", "A deliberately abandoned response", "abandoned-reply"),
      acceptance: { status: "abandoned", rejected: [] },
    },
    {
      ...pendingSceneSubmission(scene, "before-founding", "Work from before founding", "early-reply"),
      at: "2026-10-06T12:00:00.000Z",
    },
  );
  const owner = f.add(scene);
  const foreign = f.add(ownedScene("other", "foreign"));
  const before = structuredClone(f.records);
  await assert.rejects(f.service.readHistoryPage("same", { scope: "f".repeat(64) }), /Village changed/);
  assert.deepEqual(f.calls, ownerReads.slice(0, 2), "Foreign World scope reads no Scene owner or prose");
  f.calls.length = 0;
  await assert.rejects(f.service.readHistoryPage("foreign", { scope: f.scope }), /no longer available/);
  assert.deepEqual(f.calls, ["documents", "get:villages-village", "get:" + foreign.id]);
  f.calls.length = 0;
  const history = await f.service.readHistoryPage("same", { scope: f.scope });
  assert.deepEqual(
    history.lines.map((entry) => entry.content),
    ["current exact dialogue", scene.submissions[0].message],
  );
  assert(history.lines.every((entry) => !Object.hasOwn(entry, "heardBy")));
  assert.deepEqual(f.calls.slice(0, 3), ownerReads);
  assert(
    f.calls.slice(3).every((call) => call.startsWith("get:villages-memory-page-")),
    "History reads only admitted pages",
  );
  assert.deepEqual(f.records, before, "History reads never publish a change");

  f.calls.length = 0;
  assert.deepEqual(await f.service.progressBacklog(), [
    backlogRow("current"),
    { sessionId: "same", submissionId: "pending", at: stamp, error: "" },
  ]);
  assert.deepEqual(f.calls.slice(0, 3), ["world", "documents", "list"]);
  const { transcript, submissionHistory } = owner.data as {
    transcript: { world: string };
    submissionHistory: { submissions: { id: string } };
  };
  assert(f.calls.slice(3).every((call) => call.startsWith("get:villages-memory-page-")));
  assert(!f.calls.some((call) => call.startsWith("get:villages-memory-page-" + transcript.world + "-")));
  assert.deepEqual(f.records, before, "Backlog reads never replay or prune saved work");

  f.pages.delete(submissionHistory.submissions.id);
  const beforeMissing = structuredClone(f.pages);
  await assert.rejects(f.service.progressBacklog(), /submissions page is missing or changed/);
  assert.deepEqual(f.pages, beforeMissing, "Corrupt saved work remains untouched");
}

{
  const worldFailure = Error("Exact World read failure");
  const world = fixture("broken-world");
  world.failWorld(worldFailure);
  await assert.rejects(world.service.progressBacklog(), (cause) => cause === worldFailure);
  assert.deepEqual(world.calls, ["world"]);
  const listFailure = Error("Exact document list failure");
  const documents = fixture("broken-documents");
  documents.failList(listFailure);
  await assert.rejects(documents.service.progressBacklog(), (cause) => cause === listFailure);
  assert.deepEqual(documents.calls, ["world", "documents", "list"]);
}

{
  const a = createActivationScope(),
    b = createActivationScope();
  const first = fixture("A"),
    second = fixture("B");
  first.add(ownedScene("A"));
  second.add(ownedScene("B"));
  const releaseA = a.run(() => configureSceneQueries(first.queries));
  first.pause("world");
  const inFlight = a.run(() => sceneQueries().progressBacklog());
  await first.entered.promise;
  const releaseB = a.run(() => b.run(() => configureSceneQueries(second.queries)));
  const bHistory = await b.run(() => sceneQueries().readHistoryPage("same", { scope: second.scope }));
  assert.deepEqual(
    bHistory.lines.map((entry) => entry.content),
    ["B exact dialogue", "B exact input (private thought)"],
  );
  first.gate.resolve();
  assert.deepEqual(await inFlight, [backlogRow("A")]);
  assert.deepEqual(first.calls.slice(0, 4), ["world", "world-resumed", "documents", "list"]);
  assert(first.owners.every((owner) => owner === a));
  assert(second.owners.every((owner) => owner === b));
  b.run(() => a.run(releaseA));
  a.dispose();
  assert.deepEqual(await b.run(() => sceneQueries().progressBacklog()), [backlogRow("B")]);
  assert.throws(() => a.run(() => sceneQueries()), /not configured/);
  b.run(releaseB);
  b.dispose();
}

{
  const retired = createActivationScope(),
    original = fixture("retired");
  original.add(ownedScene("retired"));
  retired.run(() => configureSceneQueries(original.queries));
  original.pause("world");
  const abandoned = retired.run(() => sceneQueries().progressBacklog());
  await original.entered.promise;
  retired.dispose();
  original.gate.resolve();
  await assert.rejects(abandoned, /Original query connection unavailable/);
  assert(!original.calls.includes("documents"), "A disposed activation cannot borrow another document store");
}

{
  const c = createActivationScope(),
    d = createActivationScope();
  const older = fixture("C"),
    newer = fixture("D");
  const cScene = ownedScene("C"),
    dScene = ownedScene("D");
  older.add(cScene);
  newer.add(dScene);
  const releaseC = c.run(() => configureSceneQueries(older.queries));
  older.pause("session");
  const heldProjection = c.run(() => sceneQueries().projectSceneResponse({ ...cScene, sceneRevision: 1 }));
  await older.entered.promise;
  const releaseD = c.run(() => d.run(() => configureSceneQueries(newer.queries)));
  const dResponse = await d.run(() => sceneQueries().projectSceneResponse(dScene));
  assert.equal(dResponse.lines[0].content, "D exact dialogue");
  older.gate.resolve();
  const cResponse = await heldProjection;
  assert.equal(cResponse.placeId, "venue-C");
  assert.equal(cResponse.sceneRevision, 2);
  assert.deepEqual(
    cResponse.lines.map((entry) => entry.content),
    ["C exact dialogue", "C exact input (private thought)"],
  );
  assert.deepEqual(cResponse.latestTurn, { id: "proof", at: stamp, published: false });
  assert.deepEqual(older.calls.slice(0, 5), [...ownerReads, "session:same", "session-resumed"]);
  assert(older.owners.every((owner) => owner === c));
  assert(newer.owners.every((owner) => owner === d));
  d.run(() => c.run(releaseC));
  c.dispose();
  d.run(releaseD);
  d.dispose();
}
assert.throws(() => sceneQueries(), /not configured/);
console.log(
  "Scene history and backlog remain read-only, bounded by native ownership, and bound to their originating activation.",
);
