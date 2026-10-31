import assert from "node:assert/strict";
import { publicSceneRoutes } from "../packages/villages/src/server/adapters/http/public-scene-routes.js";
import type { FastifyInstance } from "fastify";
import {
  publicSceneResponse,
  publicSceneAuthority,
  publicSceneHistoryProjection,
  sameSceneHistoryTurnPolicy,
} from "../packages/villages/src/server/domain/rules/scene-public.js";
import { operationSummary } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";

async function main() {
  {
    const held = { semanticProvenance: { version: 2 }, processing: { lineIds: ["held-line"] } };
    assert(sameSceneHistoryTurnPolicy(held, { ...held, timing: { elapsedMs: 4 } }));
    assert(!sameSceneHistoryTurnPolicy(held, { ...held, semanticReady: true }));
    assert(!sameSceneHistoryTurnPolicy(held, { ...held, processing: { lineIds: ["different-line"] } }));
    assert(!sameSceneHistoryTurnPolicy({}, { zoneEventsVersion: 1 }));
    assert(!sameSceneHistoryTurnPolicy({}, { attention: { validation: { version: 3 } } }));
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
    for (const flag of [{ zoneEventsVersion: 1 }, { attention: { validation: { version: 3 } } }]) {
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
  console.log(
    "Villages Scene privacy: active wrapper filters only Scene payloads, preserving visible content, progress summaries, saved records and explicit diagnostics (mocked collector).",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
