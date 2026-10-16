import assert from "node:assert/strict";
import { publicSceneRoutes } from "../packages/villages/src/server/adapters/http/public-scene-routes.js";
import type { FastifyInstance } from "fastify";

async function main() {
  const handlers = new Map<string, (request: unknown, reply: unknown) => Promise<any>>();
  const collector = Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => [
      method,
      (path: string, options: any, handler?: any) => {
        handlers.set(method + " " + path, typeof options === "function" ? options : handler);
      },
    ]),
  );
  const surface = publicSceneRoutes(collector as unknown as FastifyInstance);
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
    checkpoints: { saved: { secret: "private checkpoint sentinel" } },
    relationshipReview: { applied: true, receipts: [], raw: "private review sentinel" },
  };
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
    assert.deepEqual(result[key].lines[0].heardBy, ["visible"]);
    assert.deepEqual(result[key].submissions[0].processing, { version: 1, domains: { memory: { status: "pending" } } });
    assert.deepEqual(result[key].processingSummary, { pending: 1, failed: 0, rejected: 0 });
    assert.deepEqual(result[key].relationshipReview, { applied: true, receipts: [] });
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
