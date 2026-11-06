import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { publicSceneRoutes } from "../packages/villages/src/server/adapters/http/public-scene-routes.js";
import Fastify, { type FastifyInstance } from "fastify";
import { configureSceneChanges } from "../packages/villages/src/server/features/scenes/changes.js";
import { configureSceneCommands } from "../packages/villages/src/server/features/scenes/venue-session.js";
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

async function main() {
  for (const status of ["prepared", "running", "returned", "resolved"]) {
    const retired = {
      version: 3,
      id: "retired",
      participants: [],
      lines: [],
      submissions: [],
      spinoff: { id: "old", sessionId: "retired", status, context: "PRIVATE RETIRED EVIDENCE" },
    };
    const before = structuredClone(retired);
    assert.throws(() => coerceSession(retired), /retired feature/);
    assert.deepEqual(retired, before, "Retired feature rejection preserves the saved record");
    assert.equal(JSON.stringify(publicSceneResponse(retired)).includes("PRIVATE RETIRED EVIDENCE"), false);
  }
  {
    const held = { semanticProvenance: { version: 2 }, processing: { lineIds: ["held-line"] } };
    assert(sameSceneHistoryTurnPolicy(held, { ...held, timing: { elapsedMs: 4 } }));
    assert(!sameSceneHistoryTurnPolicy(held, { ...held, semanticReady: true }));
    assert(!sameSceneHistoryTurnPolicy(held, { ...held, processing: { lineIds: ["different-line"] } }));
    assert(!sameSceneHistoryTurnPolicy({}, { zoneEventsVersion: 1 }));
  }
  {
    const scene = {
      participants: [{ characterId: "visible" }],
      operation: { input: { interactionScopeVersion: 6 } },
      lines: [
        { id: "spoken", content: "Exact public words", heardBy: ["visible", "private-knower"] },
        ...Array.from({ length: 1000 }, (_, index) => ({
          id: "private:" + index,
          content: "Private words",
          contactHidden: true,
        })),
        {
          id: "sound",
          content: "Private cause",
          contactHidden: true,
          soundOnly: { player: true, text: "A quiet knock." },
        },
        { id: "unaccepted", content: "Unaccepted draft" },
      ],
      submissions: [
        { semanticProvenance: { version: 2 }, semanticReady: false, processing: { lineIds: ["unaccepted"] } },
      ],
    };
    const { positions, privateHearing } = publicSceneHistoryProjection(scene as any);
    assert.deepEqual(positions, [0, 1001], "Hidden-only spans and unaccepted drafts add no public positions");
    const selected = positions.map(
      (position) => publicSceneResponse([scene.lines[position]], new Set(["visible"]), privateHearing)[0],
    );
    assert.deepEqual(
      selected,
      publicSceneResponse(scene).lines,
      "Indexed selected projection matches the complete privacy boundary",
    );
    assert.equal(selected[1].content, "A quiet knock.");
    assert(!JSON.stringify(selected).includes("private-knower"));
    assert(!JSON.stringify(selected).includes("Private cause"));
    for (const flag of [{ zoneEventsVersion: 1 }]) {
      const unready = {
        ...scene,
        operation: undefined,
        submissions: scene.submissions.map((turn) => ({ ...turn, ...flag })),
      };
      const policy = publicSceneHistoryProjection(unready as any);
      assert.equal(
        policy.privateHearing,
        false,
        "Unpublished turn flags cannot change the existing Scene-wide hearing policy",
      );
      assert.deepEqual(
        policy.positions.map(
          (index) => publicSceneResponse([unready.lines[index]], new Set(["visible"]), policy.privateHearing)[0],
        ),
        publicSceneResponse(unready).lines,
      );
    }
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
      operation: operationSummary(scene.operation, scene.rejectedSubmissions),
    };
  });
  const scene = {
    id: "fixture",
    participants: [{ characterId: "visible", name: "Visible" }],
    lines: [
      { id: "public-line", content: "Visible dialogue", heardBy: ["visible", "hidden"] },
      { id: "hidden-line", content: "private contact sentinel", contactHidden: true },
    ],
    submissions: [
      {
        id: "turn",
        liveProposals: { secret: "private proposal sentinel" },
        requestMetrics: { secret: "private metrics sentinel" },
        processing: { domains: { memory: { status: "pending", evidence: "private evidence sentinel" } } },
      },
    ],
    sceneAttendance: { occupants: [{ characterId: "hidden", doing: "private attendance sentinel" }] },
    continuity: { version: 1, facts: { chronicle: [{ text: "private captured context sentinel" }] } },
    sceneFacts: { memories: [{ text: "private effect context sentinel" }] },
    checkpoints: { saved: { secret: "private checkpoint sentinel" } },
    relationshipReview: { applied: true, receipts: [], raw: "private review sentinel" },
  };
  Object.assign(scene, {
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
    assert.deepEqual(result[key].lines[0].heardBy, ["visible"]);
    assert.equal(Object.hasOwn(result[key], "submissions"), false);
    assert.equal(result[key].latestTurn.id, "turn");
    assert.deepEqual(result[key].processingSummary, { pending: 1, failed: 0, rejected: 0 });
    assert.equal(Object.hasOwn(result[key], "relationshipReview"), false);
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
      domain: "relationships",
      status: "failed",
      at: "now",
      diagnosticId: "failure-id",
      reason: "This update needs explicit repair.",
      canContinue: false,
      continued: false,
    };
    const raw = {
      sceneId: "fixture",
      notices: [visibleNotice],
      dismissedNoticeIds: ["dismissed"],
      changes: [
        {
          submissionId: "turn",
          at: "now",
          notices: [visibleNotice],
          interpretations: {
            relationship: { intentions: "private intention sentinel", stance: "private stance sentinel" },
            wishes: "private Wish sentinel",
            memory: "private Memory sentinel",
          },
          evidence: ["private hearing sentinel"],
          receipts: { private: "private receipt sentinel" },
          interpretationHistory: ["private history sentinel"],
          processing: { error: "private raw reason sentinel" },
        },
      ],
      unresolved: [{ ...issue, privateEvidence: "private issue sentinel" }],
      backgroundChecks: [{ status: "running", subjectId: "private subject sentinel", error: "private job sentinel" }],
      activeRequest: { status: "complete", error: "private request sentinel", requests: "private metrics sentinel" },
      processingSummary: { pending: 0, failed: 1, rejected: 0, private: "private summary sentinel" },
      nextCursor: "2:3:4",
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
      continueSceneChange: async () => structuredClone(raw),
    } as any);
    const releaseCommands = configureSceneCommands({
      retrySceneChangeInterpretation: async () => structuredClone(raw),
    } as any);
    const app = Fastify();
    registerSceneOperationRoutes(publicSceneRoutes(app, async (scene) => publicSceneResponse(scene)));
    try {
      for (const request of [
        { method: "GET" as const, url: "/rooms/fixture/changes?cursor=1:2:3&limit=7" },
        { method: "POST" as const, url: "/rooms/fixture/changes/replay" },
        { method: "POST" as const, url: "/rooms/fixture/changes/turn/continue", payload: { domain: "relationships" } },
        { method: "POST" as const, url: "/rooms/fixture/changes/turn/interpret", payload: { domain: "relationships" } },
      ]) {
        const response = await app.inject(request);
        assert.equal(response.statusCode, 200, response.body);
        assert.doesNotMatch(response.body, /private .* sentinel/);
        const feed = response.json();
        assert.deepEqual(feed.notices, [visibleNotice]);
        assert.deepEqual(feed.changes, [{ submissionId: "turn", at: "now", notices: [visibleNotice] }]);
        assert.deepEqual(feed.unresolved, [issue]);
        assert.deepEqual(feed.processingSummary, { pending: 0, failed: 1, rejected: 0 });
        assert.deepEqual(feed.backgroundChecks, [{ status: "running" }]);
        assert.deepEqual(feed.activeRequest, { status: "complete" });
        assert.deepEqual(feed.dismissedNoticeIds, ["dismissed"]);
        assert.equal(feed.nextCursor, "2:3:4");
        assert.equal(feed.hasMore, true);
      }
      assert.deepEqual(reads, [["fixture", "1:2:3", 7]]);
      const explicit = await app.inject({
        method: "GET",
        url: "/rooms/fixture/changes/diagnostics?cursor=4:5:6&limit=3",
      });
      assert.equal(explicit.statusCode, 200, explicit.body);
      assert.deepEqual(
        explicit.json(),
        raw,
        "Deliberate owner inspection retains its existing private evidence contract",
      );
      assert.deepEqual(reads.at(-1), ["fixture", "4:5:6", 3]);
      assert.deepEqual(raw, original, "Projection never mutates retained diagnostic evidence");
      failRead = true;
      for (const path of ["/rooms/fixture/changes", "/rooms/fixture/changes/diagnostics"]) {
        const rejected = await app.inject({ method: "GET", url: path });
        assert.equal(rejected.statusCode, 409, rejected.body);
        assert.equal(rejected.json().error, "This Scene belongs to a previous village.");
      }
    } finally {
      await app.close();
      releaseCommands();
      releaseChanges();
    }
  }

  console.log(
    "Villages Scene privacy: active wrapper filters only Scene payloads, preserving visible content, progress summaries, saved records and explicit diagnostics (mocked collector).",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
