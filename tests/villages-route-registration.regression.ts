import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import { registerAgendaRoutes } from "../packages/villages/src/server/features/residents/routes.js";
import { configureResidentAgendas } from "../packages/villages/src/server/features/residents/resident-agendas.js";
import type { ResidentAgendas } from "../packages/villages/src/server/features/residents/resident-agenda-service.js";
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
  assert.equal(routes.length, 134);
  await agendaHttpAdmission();
  console.log(
    "Villages route registration regression: all 134 maintained definitions and limits match; actual Agenda HTTP rejects retired routes and unidentified regeneration before command admission (mocked service).",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
