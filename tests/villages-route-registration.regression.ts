import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import { registerAgendaRoutes } from "../packages/villages/src/server/features/residents/routes.js";
import { configureResidentAgendas } from "../packages/villages/src/server/features/residents/resident-agendas.js";
import type { ResidentAgendas } from "../packages/villages/src/server/features/residents/resident-agenda-service.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { WRITING_GUIDANCE_MAX_LENGTH } from "../packages/villages/src/server/domain/rules/narration-style.js";
import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";

async function agendaHttpAdmission() {
  const commands: unknown[] = [];
  const service: ResidentAgendas = {
    async queueVillagerAgenda() {
      throw Error("Unexpected background admission.");
    },
    async backfillAgendas(state) {
      return state;
    },
    async refreshVillagerRemaps() {},
    async buildVillageAgendas() {
      return [];
    },
    async clearVillagerAgenda(characterId, actionId) {
      commands.push(["regenerate", characterId, actionId]);
    },
    async correctCompletedWish(characterId, wishId) {
      commands.push(["correct", characterId, wishId]);
    },
    async setVillagerScheduleInfluence(characterId, value) {
      commands.push(["influence", characterId, value]);
    },
    agendaBackgroundHandler: {
      async generate() {
        throw Error("Unexpected model admission.");
      },
      valid() {
        return false;
      },
      apply() {
        throw Error("Unexpected background mutation.");
      },
    },
  };
  const release = configureResidentAgendas(service);
  const app = Fastify();
  registerAgendaRoutes(app);
  try {
    for (const [method, url, payload] of [
      ["DELETE", "/agendas/a", undefined],
      ["PATCH", "/agendas/a/ingestion", { ingestSchedule: true }],
      ["DELETE", "/remaps/a", undefined],
    ] as const) {
      assert.equal((await app.inject({ method, url, payload })).statusCode, 404);
    }
    for (const actionId of [undefined, "", 4, "has spaces", "a".repeat(101)]) {
      const response = await app.inject({ method: "POST", url: "/agendas/a/regenerate", payload: { actionId } });
      assert.equal(response.statusCode, 400);
      assert.match(response.json().error, /request identity/);
    }
    assert.deepEqual(commands, [], "retired routes and invalid identities cannot reach Agenda commands");
    const generated = await app.inject({
      method: "POST",
      url: "/agendas/a/regenerate",
      payload: { actionId: "review-1" },
    });
    assert.equal(generated.statusCode, 200);
    assert.deepEqual(generated.json(), { villagers: [] });
    const influenced = await app.inject({ method: "PATCH", url: "/agendas/a/influence", payload: { enabled: false } });
    assert.equal(influenced.statusCode, 200);
    assert.deepEqual(influenced.json(), { villagers: [] });
    assert.deepEqual(commands, [
      ["regenerate", "a", "review-1"],
      ["influence", "a", { enabled: false }],
    ]);
  } finally {
    await app.close();
    release();
  }
}

async function main() {
  const routes: Array<{ method: string; path: string; bodyLimit?: number }> = [];
  const collector = Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => [
      method,
      function (this: unknown, path: string, options: unknown, handler?: unknown) {
        assert.equal(
          typeof (typeof options === "function" ? options : handler),
          "function",
          `${method} ${path} has an actual handler`,
        );
        routes.push({
          method,
          path,
          ...(typeof options === "object" && options
            ? { bodyLimit: (options as { bodyLimit?: number }).bodyLimit }
            : {}),
        });
        return this;
      },
    ]),
  );
  await villagesRoutes(collector as unknown as FastifyInstance);
  const baseline = JSON.parse(
    readFileSync(new URL("./fixtures/villages-route-contract.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(routes)),
    baseline.routes,
    "host collector methods, paths, body limits and order match the maintained route contract",
  );
  assert.equal(routes.length, 131);
  await agendaHttpAdmission();
  await currentSceneAndWritingHttp();
  console.log(
    "Villages route registration regression: all 131 maintained definitions and limits match; actual Agenda HTTP rejects retired routes and unidentified regeneration before command admission (mocked service).",
  );
}

async function currentSceneAndWritingHttp() {
  const records = new Map<string, any>();
  const key = (packageId: string, id: string) => `${packageId}:${id}`;
  const accesses: string[] = [];
  const obsolete = {
    packageId: "villages",
    id: "villages-narration",
    kind: "settings",
    revision: 7,
    data: { presetId: "obsolete-preset", voiceGuidance: "obsolete-guidance" },
  };
  records.set(key("villages", obsolete.id), obsolete);
  const documents = {
    async getById(packageId: string, id: string) {
      accesses.push(id);
      return records.get(key(packageId, id)) ?? null;
    },
    async list(packageId: string, kind: string) {
      return [...records.values()].filter((record) => record.packageId === packageId && record.kind === kind);
    },
    async create(input: any) {
      accesses.push(input.id);
      const stored = key(input.packageId, input.id);
      assert.equal(records.has(stored), false);
      const record = { ...input, revision: 1 };
      records.set(stored, record);
      return record;
    },
    async update(input: any) {
      accesses.push(input.id);
      const stored = key(input.packageId, input.id);
      const previous = records.get(stored);
      if (!previous || previous.revision !== input.expectedRevision) return null;
      const record = { ...previous, ...input, revision: previous.revision + 1 };
      records.set(stored, record);
      return record;
    },
    async remove() {
      throw new Error("Current writing controls must not remove documents.");
    },
  };
  const host = {
    persistence: { documents },
    resources: {},
    languageModels: {
      async resolveForRequest() {
        throw new Error("Reading or saving writing settings must not request a model.");
      },
    },
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "" }),
    json: { parseJsonish: (value: string) => JSON.parse(value) },
  } as unknown as CapabilityRuntimeHost;
  const desired = {
    tense: "past",
    person: "third",
    rating: "nsfw",
    writingGuidance: "Keep the narration dry and preserve each character's voice.",
    writingGuidanceMaxLength: WRITING_GUIDANCE_MAX_LENGTH,
  };
  // Recreate the complete activation graph over the same document store to
  // prove persisted settings survive reload without an old preset document.
  for (const reload of [false, true]) {
    const release = configureVillagesRuntime(host);
    const app = Fastify();
    try {
      await villagesRoutes(app);
      for (const url of ["/spinoffs/prompts", "/presets/preset-1/variables", "/spinoffs/chat-1"]) {
        assert.equal((await app.inject({ method: "GET", url })).statusCode, 404, `${url} is retired`);
      }
      const scene = await app.inject({ method: "GET", url: "/rooms/active" });
      assert.equal(scene.statusCode, 200);
      assert.equal(scene.json().session, null, "the current Scene route remains available in a fresh world");
      if (!reload) {
        const initial = await app.inject({ method: "GET", url: "/narration" });
        assert.equal(initial.statusCode, 200);
        assert.deepEqual(initial.json(), {
          tense: "present",
          person: "second",
          rating: "sfw",
          writingGuidance: "",
          writingGuidanceMaxLength: WRITING_GUIDANCE_MAX_LENGTH,
        });
        const saved = await app.inject({ method: "PUT", url: "/narration", payload: desired });
        assert.equal(saved.statusCode, 200);
        assert.deepEqual(saved.json(), desired);
        for (const payload of [
          { tense: "future" },
          { person: "fourth" },
          { rating: "unknown" },
          { writingGuidance: null },
        ]) {
          assert.equal((await app.inject({ method: "PUT", url: "/narration", payload })).statusCode, 400);
        }
      }
      const read = await app.inject({ method: "GET", url: "/narration" });
      assert.equal(read.statusCode, 200);
      assert.deepEqual(read.json(), desired);
      assert.strictEqual(records.get(key("villages", obsolete.id)), obsolete, "retired settings remain untouched");
      assert.equal(accesses.includes(obsolete.id), false, "current writing never reads or writes the retired document");
    } finally {
      await app.close();
      release();
    }
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
