import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { publicSceneRoutes } from "../packages/villages/src/server/adapters/http/public-scene-routes.js";
import Fastify, { type FastifyInstance } from "fastify";
import { configureSceneChanges } from "../packages/villages/src/server/features/scenes/changes.js";
import { registerSceneOperationRoutes } from "../packages/villages/src/server/features/scenes/routes.js";
import { conflict } from "../packages/villages/src/server/domain/rules/errors.js";
import {
  publicSceneResponse,
  publicSceneAuthority,
  publicSceneHistoryProjection,
  sameSceneHistoryTurnPolicy,
} from "../packages/villages/src/server/domain/rules/scene-public.js";
import { operationSummary } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import { pendingSceneSubmission } from "./helpers/narration-submission.fixture.js";

const at = "2026-10-31T00:00:00.000Z";
const narration = (id: string, content: string) => ({
  id,
  role: "assistant",
  kind: "narration",
  speakerId: "__venue_scene__",
  name: "Narration",
  at,
  content,
  heardBy: ["player", "visible", "private-knower"],
});

async function main() {
  for (const status of ["prepared", "running", "returned", "resolved"]) {
    const retired = {
      version: 4,
      id: "retired",
      participants: [],
      lines: [],
      submissions: [],
      spinoff: { id: "old", sessionId: "retired", status, context: "PRIVATE RETIRED EVIDENCE" },
    };
    const before = structuredClone(retired);
    assert.throws(() => coerceSession(retired), /Unsupported Scene format/);
    assert.deepEqual(retired, before, "Retired feature rejection preserves the saved record");
  }
  {
    const held = { acceptance: { status: "held", rejected: [] }, replyLineIds: ["held-line"] };
    assert(sameSceneHistoryTurnPolicy(held, { ...held, timing: { elapsedMs: 4 } }));
    assert(!sameSceneHistoryTurnPolicy(held, { ...held, acceptance: { status: "applied", rejected: [] } }));
    assert(!sameSceneHistoryTurnPolicy(held, { ...held, replyLineIds: ["different-line"] }));
  }
  {
    const exact = "I wait. (I hope they don't notice.)";
    const scene = coerceSession({
      version: 5,
      id: "private-playback",
      villageSeed: "privacy-world",
      startedAt: at,
      lines: [
        narration("spoken", "Exact public words"),
        ...Array.from({ length: 1000 }, (_, index) => ({
          ...narration("private:" + index, "Private words"),
          contactHidden: true,
        })),
        {
          ...narration("sound", "Private cause"),
          contactHidden: true,
          soundOnly: { player: true, text: "A quiet knock.", characterIds: [] },
        },
        {
          id: "input",
          role: "user",
          kind: "input",
          speakerId: "player",
          name: "Player",
          inputOf: "turn",
          content: exact,
          at,
          heardBy: [],
        },
        narration("unaccepted", "Unaccepted draft"),
      ],
    });
    const pending = pendingSceneSubmission(scene, "turn", exact, "unaccepted");
    scene.submissions.push({ ...pending, acceptance: { status: "held", rejected: [] } });
    const { positions } = publicSceneHistoryProjection(scene);
    assert.deepEqual(positions, [0, 1001, 1002], "Hidden-only spans and unaccepted drafts add no public positions");
    const selected = positions.map((position) => publicSceneResponse([scene.lines[position]], new Set(["visible"]))[0]);
    assert.deepEqual(
      selected,
      publicSceneResponse(scene).lines,
      "Indexed selected projection matches the complete privacy boundary",
    );
    assert.equal(selected[1].content, "A quiet knock.");
    assert.equal(selected[2].content, exact);
    assert.deepEqual(scene.lines[1002].heardBy, []);
    assert(selected.every((line) => !Object.hasOwn(line, "heardBy")));
    assert(!JSON.stringify(selected).includes("private-knower"));
    assert(!JSON.stringify(selected).includes("Private cause"));
    scene.submissions[0] = {
      ...pending,
      acceptance: { status: "applied", rejected: [] },
      episodeId: "episode",
      progressProcessedAt: at,
    };
    assert.deepEqual(publicSceneHistoryProjection(scene).positions, [0, 1001, 1002, 1003]);
  }
  const handlers = new Map<string, (request: unknown, reply: unknown) => Promise<any>>();
  const collector = Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => [
      method,
      (path: string, options: any, handler?: any) => {
        handlers.set(method + " " + path, typeof options === "function" ? options : handler);
      },
    ]),
  );
  const surface = publicSceneRoutes(collector as unknown as FastifyInstance, async (value) => {
    const scene = value as VenueScene;
    return {
      ...publicSceneAuthority(scene),
      lines: publicSceneResponse(scene).lines,
      operation: operationSummary(scene.operation),
    };
  });
  const scene = coerceSession({
    version: 5,
    id: "fixture",
    villageSeed: "privacy-world",
    startedAt: at,
    activeIds: ["visible"],
    participants: [{ characterId: "visible", name: "Visible" }],
    lines: [
      narration("public-line", "Visible dialogue"),
      { ...narration("hidden-line", "private contact sentinel"), contactHidden: true },
    ],
  });
  const turn = pendingSceneSubmission(scene, "turn", "Exact source", "purchased");
  turn.narration!.raw.privateProposal = "private proposal sentinel";
  scene.submissions.push(turn);
  Object.assign(scene, {
    sceneAttendance: { occupants: [{ characterId: "hidden", doing: "private attendance sentinel" }] },
    privateAuthority: "private root sentinel",
    operation: {
      id: "greeting",
      kind: "greet",
      status: "complete",
      error: "Opening failed",
      attemptId: "failed-opening",
      stage: "greet",
      checkpoints: { "greeting-reply": { secret: "private saved greeting sentinel" } },
      attempts: { secret: "private attempt sentinel" },
    },
  });
  const before = structuredClone(scene);
  surface.get("/scene", async () => ({ session: scene }));
  surface.post("/archive", { bodyLimit: 1024 }, async () => ({ visit: scene }));
  for (const [route, key] of [
    ["get /scene", "session"],
    ["post /archive", "visit"],
  ]) {
    const result = await handlers.get(route)!({}, {});
    assert.doesNotMatch(JSON.stringify(result), /private .* sentinel/);
    assert.equal(result[key].lines[0].content, "Visible dialogue");
    assert.equal(result[key].operation.recoverable, true, "Recovery is derived before stripping checkpoints");
    assert.equal(result[key].operation.error, "Opening failed");
    assert.equal(Object.hasOwn(result[key].lines[0], "heardBy"), false);
    assert.equal(Object.hasOwn(result[key], "submissions"), false);
    assert.equal(result[key].latestTurn.id, "turn");
    assert.deepEqual(result[key].processingSummary, { pending: 1, failed: 0, rejected: 0 });
    assert.equal(Object.hasOwn(result[key], "privateAuthority"), false);
  }
  assert.deepEqual(scene, before, "projection preserves server-owned Scene records");
  const diagnostic = {
    access: { publicPolicy: "visible" },
    requestMetrics: { ownerDiagnostic: true },
    attempts: ["explicit inspect data"],
  };
  surface.get("/owner-diagnostic", async () => diagnostic);
  assert.deepEqual(
    await handlers.get("get /owner-diagnostic")!({}, {}),
    diagnostic,
    "other public and explicit owner-diagnostic payloads remain intact",
  );

  {
    const visibleNotice = {
      id: "known",
      kind: "memory",
      text: "You learned a visible fact.",
      wishUpdate: { actorId: "visible", wishId: "known-wish", state: "progress" },
    };
    const issue = {
      submissionId: "turn",
      status: "held",
      at,
      diagnosticId: "failure-id",
      reason: "This update needs explicit repair.",
    };
    const raw = {
      sceneId: "fixture",
      notices: [visibleNotice],
      dismissedNoticeIds: ["dismissed"],
      changes: [
        {
          submissionId: "turn",
          at,
          notices: [visibleNotice],
          evidence: ["private hearing sentinel"],
          receipts: { private: "private receipt sentinel" },
        },
      ],
      unresolved: [{ ...issue, privateEvidence: "private issue sentinel" }],
      backgroundChecks: [{ status: "running", subjectId: "private subject sentinel", error: "private job sentinel" }],
      activeRequest: { status: "complete", error: "private request sentinel", requests: "private metrics sentinel" },
      processingSummary: { pending: 0, failed: 1, rejected: 0, private: "private summary sentinel" },
      nextCursor: "4",
      hasMore: true,
      private: "private root sentinel",
    };
    const original = structuredClone(raw),
      reads: unknown[] = [];
    let failRead = false;
    const releaseChanges = configureSceneChanges({
      readSceneChanges: async (...args: unknown[]) => {
        if (failRead) throw conflict("This Scene belongs to a previous village.");
        reads.push(args);
        return structuredClone(raw);
      },
      replaySceneChanges: async () => structuredClone(raw),
    } as any);
    const app = Fastify();
    registerSceneOperationRoutes(publicSceneRoutes(app, async (scene) => publicSceneResponse(scene)));
    try {
      for (const request of [
        { method: "GET" as const, url: "/rooms/fixture/changes?cursor=1&limit=7" },
        { method: "POST" as const, url: "/rooms/fixture/changes/replay" },
      ]) {
        const response = await app.inject(request);
        assert.equal(response.statusCode, 200, response.body);
        assert.doesNotMatch(response.body, /private .* sentinel/);
        const feed = response.json();
        assert.deepEqual(feed.notices, [visibleNotice]);
        assert.deepEqual(feed.changes, [{ submissionId: "turn", at, notices: [visibleNotice] }]);
        assert.deepEqual(feed.unresolved, [issue]);
        assert.deepEqual(feed.processingSummary, { pending: 0, failed: 1, rejected: 0 });
        assert.deepEqual(feed.backgroundChecks, [{ status: "running" }]);
        assert.deepEqual(feed.activeRequest, { status: "complete" });
        assert.deepEqual(feed.dismissedNoticeIds, ["dismissed"]);
        assert.equal(feed.nextCursor, "4");
        assert.equal(feed.hasMore, true);
      }
      assert.deepEqual(reads, [["fixture", "1", 7]]);
      for (const route of ["continue", "interpret"]) {
        const response = await app.inject({ method: "POST", url: "/rooms/fixture/changes/turn/" + route });
        assert.equal(response.statusCode, 404);
      }
      const explicit = await app.inject({
        method: "GET",
        url: "/rooms/fixture/changes/diagnostics?cursor=4&limit=3",
      });
      assert.equal(explicit.statusCode, 200, explicit.body);
      assert.deepEqual(
        explicit.json(),
        raw,
        "Deliberate owner inspection retains its existing private evidence contract",
      );
      assert.deepEqual(reads.at(-1), ["fixture", "4", 3]);
      assert.deepEqual(raw, original, "Projection never mutates retained diagnostic evidence");
      failRead = true;
      for (const path of ["/rooms/fixture/changes", "/rooms/fixture/changes/diagnostics"]) {
        const rejected = await app.inject({ method: "GET", url: path });
        assert.equal(rejected.statusCode, 409, rejected.body);
        assert.equal(rejected.json().error, "This Scene belongs to a previous village.");
      }
    } finally {
      await app.close();
      releaseChanges();
    }
  }

  console.log(
    "Villages Scene privacy: active wrapper filters only Scene payloads, preserving visible content, progress summaries, saved records and explicit diagnostics (mocked collector).",
  );
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
