import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import assert from "node:assert/strict";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readNarrationSubmission } from "../packages/villages/src/server/domain/decoding/narration-submission.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";

async function main() {
  const Fastify = (await import("fastify")).default;
  // Use the host router's default 100-character parameter ceiling.
  const app = Fastify();
  const sceneId = "3260cf01-1771-43b8-b72c-c050c713029d";
  const noticeId = `${sceneId}:989be974-b9ad-4ed3-9256-8e732575d6fa:project:077092eca1d088f3dd4a0440`;
  assert.ok(noticeId.length > 100);
  const at = new Date().toISOString(),
    message = "I accept the proposal.";
  const state = defaultVillageState();
  state.seed = "notice-world";
  state.setupAt = state.foundedAt = at;
  const scene = {
    version: 5,
    id: sceneId,
    villageSeed: state.seed,
    status: "active",
    startedAt: at,
    submissions: [
      readNarrationSubmission({
        mode: "chat",
        id: "turn",
        message,
        targetId: "",
        requestFingerprint: memoryHash(["chat", "", null, message]),
        at,
        acceptance: { status: "applied", rejected: [] },
        episodeId: "notice-episode",
        progressProcessedAt: at,
        recordEvents: [
          { id: noticeId, kind: "project", text: "The proposal was accepted." },
          { id: "short", kind: "venue", text: "The room was opened." },
        ],
      }),
    ],
  };
  const records = new Map<string, any>([
    ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", data: state, revision: 1 }],
    [
      `villages-venue-visit-${sceneId}`,
      { id: `villages-venue-visit-${sceneId}`, packageId: "villages", kind: "venue-visit", data: scene, revision: 1 },
    ],
  ]);
  let modelCalls = 0;
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => false,
    logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
    persistence: {
      documents: villageFixtureDocuments({
        async list(_pkg: string, kind: string) {
          return [...records.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row));
        },
        async getById(_packageId: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async create(input: any) {
          assert(!records.has(input.id));
          const row = { ...structuredClone(input), revision: 1 };
          records.set(input.id, row);
          return structuredClone(row);
        },
        async update(input: any) {
          const current = records.get(input.id);
          if (!current || current.revision !== input.expectedRevision) return null;
          const row = { ...current, ...structuredClone(input), revision: current.revision + 1 };
          records.set(input.id, row);
          return structuredClone(row);
        },
      }),
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
      url: `/api/villages/rooms/${sceneId}/notices/short/dismiss`,
    });
    assert.equal(oldRequest.statusCode, 404, "only the current body endpoint is registered");
    for (const invalid of [null, 7, "", "   ", "x".repeat(1025)]) {
      const response = await send(invalid);
      assert.equal(response.statusCode, 400, response.body);
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
    assert.equal((await send("short")).statusCode, 200);
    records.get("villages-village").data.seed = "different-village";
    assert.equal((await send(noticeId)).statusCode, 409, "dismissal still enforces Village identity");
    assert.equal(modelCalls, 0);
    console.log(
      "villages-notice-dismiss: long-ID body transport, validation, persistence, idempotence and Village identity passed",
    );
  } finally {
    await app.close();
    release();
  }
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
