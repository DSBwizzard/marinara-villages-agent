import assert from "node:assert/strict";
import { pendingSceneSubmission } from "./helpers/narration-submission.fixture.js";
import {
  activationScope,
  createActivationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type {
  VenueLine,
  VenueScene,
  VenueSubmission,
} from "../packages/villages/src/server/domain/models/scene-model.js";
import type { SceneTerminal } from "../packages/villages/src/server/domain/models/scene-terminal-model.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { notFound } from "../packages/villages/src/server/domain/rules/errors.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { createSceneChanges } from "../packages/villages/src/server/features/scenes/changes-service.js";
import {
  configureSceneChanges,
  dismissSceneNotice,
  readSceneChanges,
  readSceneErrorDetails,
  replaySceneChanges,
} from "../packages/villages/src/server/features/scenes/changes.js";
import { terminalForScene } from "../packages/villages/src/server/features/scenes/scene-terminal.js";

const stamp = "2026-10-07T12:00:00.000Z";
function applied(id: string, sequence: number, owner: string): VenueSubmission {
  return {
    id,
    changeSequence: sequence,
    at: stamp,
    mode: "chat",
    message: id,
    targetId: "",
    requestFingerprint: memoryHash(["chat", "", null, id]),
    acceptance: { status: "applied", rejected: [] },
    episodeId: "episode:" + id,
    progressProcessedAt: stamp,
    recordEvents: [{ id: id + ":notice", kind: "memory", text: owner + " " + id + " notice" }],
  };
}
function waiting(scene: VenueScene, id: string, sequence: number, status: "pending" | "held" | "abandoned") {
  const owner = scene.villageSeed!;
  return {
    ...pendingSceneSubmission(scene, id, owner + " exact private submission", id + ":reply"),
    changeSequence: sequence,
    acceptance: {
      status,
      rejected: status === "held" ? [{ id: "failed-effect", reason: owner + " precise saved rejection" }] : [],
    },
  };
}
function fixture(owner: string) {
  let world = { ...defaultVillageState(), seed: owner, setupAt: stamp, foundedAt: stamp };
  const scene = coerceSession({
    version: 5,
    id: "same",
    villageSeed: owner,
    status: "active",
    placeId: "venue",
    placeName: owner,
    startedAt: stamp,
  });
  scene.submissions = [applied("first", 1, owner), waiting(scene, "held", 2, "held")];
  let terminal: SceneTerminal | null = null;
  let paused = "",
    fault: { call: string; error: Error } | undefined;
  let mutationHook: ((state: VillageState) => void) | undefined, replayHook: ((id: string) => void) | undefined;
  const calls: string[] = [],
    owners: unknown[] = [];
  const entered = Promise.withResolvers<void>(),
    gate = Promise.withResolvers<void>();
  async function note(call: string) {
    const record = (name: string) => {
      calls.push(name);
      owners.push(activationScope());
      if (activationScope()?.active === false) throw Error("Original changes connection unavailable");
      if (fault?.call === name) throw fault.error;
    };
    record(call);
    if (call !== paused) return;
    paused = "";
    entered.resolve();
    await gate.promise;
    record(call + ":resumed");
  }
  const service = createSceneChanges({
    async withSceneWork(id, work) {
      await note("lock:" + id);
      return work();
    },
    async readSession(id) {
      await note("scene:" + id);
      if (terminal) throw notFound("The Scene prose has retired.");
      return structuredClone(scene);
    },
    async readVillageState() {
      await note("world");
      return structuredClone(world);
    },
    async mutateVillageState(update) {
      await note("mutate");
      mutationHook?.(world);
      const next = structuredClone(world);
      update(next);
      world = next;
      return structuredClone(world);
    },
    async processSavedExchange(sceneId, id) {
      await note("replay:" + sceneId + ":" + id);
      replayHook?.(id);
    },
    async readTerminal(id) {
      await note("terminal:" + id);
      return structuredClone(terminal);
    },
  });
  return {
    scene,
    service,
    calls,
    owners,
    entered,
    gate,
    get world() {
      return world;
    },
    pause(call: string) {
      paused = call;
    },
    fail(call: string, error: Error) {
      fault = { call, error };
    },
    onMutation(hook: (state: VillageState) => void) {
      mutationHook = hook;
    },
    onReplay(hook: (id: string) => void) {
      replayHook = hook;
    },
    retire(value: SceneTerminal) {
      terminal = value;
    },
  };
}

{
  const f = fixture("seed");
  assert.deepEqual(f.calls, [], "Construction is inert");
  const [first, held] = f.scene.submissions;
  first.recordEvents!.push({ id: "dismissed", kind: "wish", text: "Dismissed delivered notice" });
  first.acceptance.rejected.push({ id: "optional", reason: "Independent optional update was rejected" });
  held.recordEvents = [{ id: "unpublished", kind: "memory", text: "Held notice" }];
  f.world.dismissedNoticeIds.push("dismissed");
  f.scene.submissions = [held, first, applied("later", 3, "seed")];
  const before = structuredClone([f.scene, f.world]);
  const page = await f.service.readSceneChanges("same", "", 1);
  assert.deepEqual(f.calls, ["scene:same", "world"]);
  assert.deepEqual(page.changes, [{ submissionId: "first", at: stamp, notices: [first.recordEvents![0]] }]);
  assert.deepEqual(page.notices, [first.recordEvents![0]]);
  assert.equal(page.nextCursor, "1");
  assert.equal(page.hasMore, true);
  assert.deepEqual(page.processingSummary, { pending: 0, failed: 1, rejected: 2 });
  assert.equal(page.unresolved[0].reason, "The saved reply needs review.");
  const next = await f.service.readSceneChanges("same", page.nextCursor, 1);
  assert.deepEqual(next.changes, [{ submissionId: "held", at: stamp, notices: [] }]);
  assert.deepEqual(next.notices, []);
  const last = await f.service.readSceneChanges("same", next.nextCursor);
  assert.deepEqual(
    last.notices.map((notice) => notice.id),
    ["later:notice"],
  );
  assert.equal(last.hasMore, false);
  assert.deepEqual((await f.service.readSceneChanges("same", last.nextCursor)).changes, []);
  assert.doesNotMatch(
    JSON.stringify([page, next, last]),
    /exact private submission|precise saved rejection|Held notice/,
  );
  const details = await f.service.readSceneErrorDetails("same");
  assert.equal(details.errors.length, 2);
  const heldDetails = details.errors.find((row) => row.id === page.unresolved[0].diagnosticId)!;
  assert.match(heldDetails.details, /precise saved rejection/);
  assert.doesNotMatch(JSON.stringify(details), /exact private submission|Held notice/);
  assert.deepEqual([f.scene, f.world], before, "Feed and diagnostics reads never replay or mutate");
  await assert.rejects(f.service.dismissSceneNotice("same", "unpublished"), /unavailable/);
  assert(!f.calls.includes("mutate"));
  for (const cursor of ["-1", "1.2", "wat", "0:0", "9007199254740992"])
    await assert.rejects(f.service.readSceneChanges("same", cursor), /Invalid changes cursor/);
  f.scene.villageSeed = "different";
  await assert.rejects(f.service.readSceneChanges("same", "wat"), /different Village/);
  await assert.rejects(f.service.readSceneErrorDetails("same"), /different Village/);
  await assert.rejects(f.service.replaySceneChanges("same"), /different Village/);
  assert(!f.calls.some((call) => call.startsWith("replay:")));
}

{
  const f = fixture("page-limit");
  f.scene.submissions = Array.from({ length: 55 }, (_, index) => applied("turn-" + index, index + 1, "limit"));
  const page = await f.service.readSceneChanges("same", "", 200);
  assert.equal(page.changes.length, 50);
  assert.equal(page.nextCursor, "50");
  assert.equal(page.hasMore, true);
}

{
  const f = fixture("presence");
  const arrival: VenueLine = {
    id: "arrival",
    role: "assistant",
    kind: "narration",
    speakerId: "__venue_scene__",
    name: "Narration",
    content: "10:00 AM · Mara is here.",
    at: stamp,
    heardBy: ["player"],
    presenceChange: true,
  };
  f.scene.lines.push(
    arrival,
    { ...arrival, id: "hidden", contactHidden: true, content: "Secret departure" },
    {
      ...arrival,
      id: "audible",
      contactHidden: true,
      content: "Hidden words behind a door",
      soundOnly: { player: true, characterIds: [], text: "A distant sound." },
    },
    { ...arrival, id: "held:reply", content: "Unaccepted attendance claim" },
  );
  assert.deepEqual(
    publicSceneResponse(f.scene).lines.map((line) => line.content),
    [arrival.content, "A distant sound."],
  );
  const id = "presence:same:arrival";
  const page = await f.service.readSceneChanges("same", "50");
  assert.deepEqual(page.notices, [{ id, kind: "venue", text: arrival.content }]);
  for (const line of ["hidden", "audible", "held:reply"])
    await assert.rejects(f.service.dismissSceneNotice("same", "presence:same:" + line), /unavailable/);
  assert(!f.calls.includes("mutate"));
  await f.service.dismissSceneNotice("same", id);
  assert.deepEqual((await f.service.readSceneChanges("same", "50")).notices, []);
  f.scene.submissions = f.scene.submissions.filter((turn) => turn.acceptance.status === "applied");
  f.scene.lines = f.scene.lines.filter((line) => line.id !== "held:reply");
  f.scene.status = "closed";
  f.scene.endedAt = stamp;
  const terminal = terminalForScene(f.scene, 3);
  assert.deepEqual(
    terminal.recordEvents.map((notice) => notice.id),
    [id, "first:notice"],
  );
  f.retire(terminal);
  await f.service.dismissSceneNotice("same", "first:notice");
  assert.deepEqual(f.world.dismissedNoticeIds, [id, "first:notice"]);
}

{
  const f = fixture("dismiss");
  await assert.rejects(f.service.dismissSceneNotice("same", "missing"), /unavailable/);
  f.onMutation((state) => {
    state.dismissedNoticeIds = ["concurrent", "first:notice"];
  });
  for (let repeat = 0; repeat < 2; repeat++)
    assert.deepEqual(await f.service.dismissSceneNotice("same", "first:notice"), { dismissed: true });
  assert.deepEqual(f.world.dismissedNoticeIds, ["concurrent", "first:notice"]);
  f.onMutation((state) => {
    state.seed = "replacement";
    state.dismissedNoticeIds = [];
  });
  await assert.rejects(f.service.dismissSceneNotice("same", "first:notice"), /identity changed/);
  assert.deepEqual(f.world.dismissedNoticeIds, []);
}

{
  const f = fixture("replay");
  f.scene.submissions.push(waiting(f.scene, "pending", 3, "pending"), waiting(f.scene, "abandoned", 4, "abandoned"));
  f.pause("replay:same:held");
  const replay = f.service.replaySceneChanges("same");
  await f.entered.promise;
  assert.deepEqual(f.calls, ["lock:same", "scene:same", "world", "replay:same:held"]);
  f.onReplay((id) => {
    const index = f.scene.submissions.findIndex((turn) => turn.id === id);
    f.scene.submissions[index] = applied(id, index + 1, "replay");
    if (id === "held") f.scene.submissions.push(waiting(f.scene, "later", 5, "pending"));
  });
  f.gate.resolve();
  const result = await replay;
  assert.deepEqual(
    f.calls.filter((call) => call.startsWith("replay:")),
    ["replay:same:held", "replay:same:held:resumed", "replay:same:pending"],
  );
  assert.deepEqual(
    result.notices.map((notice) => notice.id),
    ["first:notice", "held:notice", "pending:notice"],
  );
  assert.deepEqual(
    result.unresolved.map((row) => row.submissionId),
    ["later"],
  );
}

for (const call of ["scene:same", "world", "mutate", "replay:same:held"]) {
  const f = fixture("failure");
  const exact = Error("Exact " + call);
  f.fail(call, exact);
  const result =
    call === "mutate"
      ? f.service.dismissSceneNotice("same", "first:notice")
      : call.startsWith("replay:")
        ? f.service.replaySceneChanges("same")
        : f.service.readSceneChanges("same");
  await assert.rejects(result, (error) => error === exact);
}

for (const [pause, action] of [
  ["scene:same", () => readSceneChanges("same")],
  ["world", () => readSceneErrorDetails("same")],
  ["mutate", () => dismissSceneNotice("same", "first:notice")],
  ["replay:same:held", () => replaySceneChanges("same")],
] as const) {
  const a = createActivationScope(),
    b = createActivationScope();
  const first = fixture("A"),
    second = fixture("B");
  const releaseA = a.run(() => configureSceneChanges(first.service));
  const releaseB = b.run(() => configureSceneChanges(second.service));
  first.pause(pause);
  const pending = a.run(action);
  await first.entered.promise;
  b.run(releaseA);
  assert.equal((await b.run(() => readSceneChanges("same"))).notices[0].text, "B first notice");
  first.gate.resolve();
  const result = await pending;
  if ("changes" in result) assert.equal(result.notices[0].text, "A first notice");
  if ("errors" in result) assert.match(result.errors[0].details, /A precise saved rejection/);
  if ("dismissed" in result) assert.deepEqual(first.world.dismissedNoticeIds, ["first:notice"]);
  assert(first.owners.every((owner) => owner === a));
  assert(second.owners.every((owner) => owner === b));
  assert.equal((await b.run(() => readSceneChanges("same"))).sceneId, "same");
  b.run(releaseB);
  a.dispose();
  b.dispose();
}

const disposed = createActivationScope();
const original = fixture("disposed");
disposed.run(() => configureSceneChanges(original.service));
original.pause("scene:same");
const pending = disposed.run(() => readSceneChanges("same"));
await original.entered.promise;
disposed.dispose();
original.gate.resolve();
await assert.rejects(pending, /Original changes connection unavailable/);
await assert.rejects(readSceneChanges("same"), /not configured|disposed/);
console.log("Native Scene feed, notice privacy, scoped dismissal, and saved-only replay passed.");
