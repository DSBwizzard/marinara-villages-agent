import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { villagesRoutes } from "../packages/villages/src/engine/packages/server/src/routes/villages.routes.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";

async function main() {
  const engineRoot = process.env.MARINARA_ENGINE_ROOT;
  assert.ok(engineRoot, "Set MARINARA_ENGINE_ROOT for the read-only Fastify dependency.");
  const Fastify = (
    await import(pathToFileURL(join(engineRoot, "packages/server/node_modules/fastify/fastify.js")).href)
  ).default;
  // Use the host router's default 100-character parameter ceiling.
  const app = Fastify();
  const sceneId = "3260cf01-1771-43b8-b72c-c050c713029d";
  const noticeId = `${sceneId}:989be974-b9ad-4ed3-9256-8e732575d6fa:relationship:077092eca1d088f3dd4a0440`;
  assert.ok(noticeId.length > 100);
  const state = defaultVillageState();
  const scene = {
    id: sceneId,
    processingVersion: 1,
    memoryMode: "live",
    villageSeed: state.seed,
    status: "active",
    startedAt: new Date().toISOString(),
    submissions: [
      {
        id: "turn",
        recordEvents: [
          { id: noticeId, kind: "relationship-up", text: "A relationship changed." },
          { id: "short", kind: "memory", text: "A memory was forged." },
        ],
      },
    ],
  };
  const records = new Map<string, any>([
    ["villages-village", { id: "villages-village", data: state, revision: 1 }],
    [`villages-venue-visit-${sceneId}`, { id: `villages-venue-visit-${sceneId}`, data: scene, revision: 1 }],
  ]);
  let modelCalls = 0;
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => false,
    persistence: {
      documents: {
        async getById(_packageId: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async update(input: any) {
          const row = { ...structuredClone(input), revision: records.get(input.id).revision + 1 };
          records.set(input.id, row);
          return structuredClone(row);
        },
      },
    },
    languageModels: {
      async resolveForRequest() {
        modelCalls++;
        throw new Error("Dismissal must not request a model.");
      },
    },
  } as any);
  try {
    await app.register(villagesRoutes, { prefix: "/api/villages" });
    const endpoint = `/api/villages/rooms/${sceneId}/notices/dismiss`;
    const send = (notice: unknown) => app.inject({ method: "POST", url: endpoint, payload: { noticeId: notice } });
    const oldRequest = await app.inject({
      method: "POST",
      url: `/api/villages/rooms/${sceneId}/notices/${encodeURIComponent(noticeId)}/dismiss`,
    });
    assert.equal(oldRequest.statusCode, 414, "the original URL reproduces the router limit");
    for (const invalid of [null, 7, "", "   ", "x".repeat(1025)]) {
      assert.equal((await send(invalid)).statusCode, 400);
    }
    assert.equal((await app.inject({ method: "POST", url: endpoint })).statusCode, 400);
    assert.equal((await send("missing-notice")).statusCode, 404);
    assert.deepEqual(records.get("villages-village").data.dismissedNoticeIds, []);
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await send(noticeId);
      assert.equal(response.statusCode, 200, response.body);
      assert.deepEqual(response.json(), { dismissed: true });
      assert.deepEqual(
        records.get("villages-village").data.dismissedNoticeIds,
        [noticeId],
        "persist the original ID exactly once",
      );
    }
    const legacy = await app.inject({ method: "POST", url: `/api/villages/rooms/${sceneId}/notices/short/dismiss` });
    assert.equal(legacy.statusCode, 200, "short-ID clients retain compatibility");
    records.get(`villages-venue-visit-${sceneId}`).data.villageSeed = "different-village";
    assert.equal((await send(noticeId)).statusCode, 409, "dismissal still enforces Village identity");
    assert.equal(modelCalls, 0);
    console.log(
      "villages-notice-dismiss: router reproduction, long-ID body transport, validation, persistence, idempotence and compatibility passed",
    );
  } finally {
    await app.close();
    release();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
