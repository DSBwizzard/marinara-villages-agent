import { defaultVillageFixture as defaultVillageState } from "./helpers/venues.fixture.js";
import AdmZip from "adm-zip";
import Fastify from "fastify";
import assert from "node:assert/strict";
import { keyedFoundingSetup, keyedStarterReply } from "./helpers/agenda.fixture.js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { agendaBlocksFor, ordinaryAgendaBlocksFor } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { calendarAt } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
const receipt = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8")),
  zip = new AdmZip(receipt.retainedArchivePath ?? receipt.archivePath ?? receipt.archive);
assert.deepEqual(
  zip
    .getEntries()
    .find((row) => row.entryName.endsWith("server.mjs"))!
    .getData(),
  await readFile("packages/villages/server.mjs"),
);
const { activate } = await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
const now = "2026-11-26T12:00:00.000Z";
const realNow = Date.now;
Date.now = () => Date.parse(now);
const world = coerceVillageState({
  ...defaultVillageState(),

  seed: "founding-http",
  name: "Synthetic place",
  setting: "Shared converted rooms",
  backgroundPace: "off",
  timeZone: "UTC",
  setupAt: now,
  foundedAt: now,
  foundingPreparation: {
    status: "failed",
    completedIds: [],
    currentId: "",
    venueDetailsSeeded: true,
    error: "Explicit retry required",
  },
  villagers: ["a", "b"].map((id) => ({
    letterFontId: "caveat",
    characterId: id,
    incarnation: "one",
    identityDescription: { text: "", revision: "initial-description-" + id, initialGenerationComplete: false },
    addedAt: now,
    cardSnapshot: {
      id,
      name: id,
      description: "Full authored identity",
      capturedAt: now,
      revision: 1,
      sourceStatus: "available",
    },
  })),
});
for (const resident of world.villagers) {
  resident.agenda = unwrittenVillageAgenda(new Date(now));
  world.startingHistory.reviewed[resident.characterId] = resident.incarnation;
}
world.residentPlans.appointments = [
  {
    id: "saved-opening-appointment",
    resident: { id: "b", incarnation: "one" },
    playerIncarnation: continuityActor(world, "player")!.incarnation,
    time: { date: "2026-11-26", startMinute: 1305, endMinute: 1350, venueId: world.venues[0]!.id },
    activity: "Meet at the square",
  },
];
const clone = <T>(x: T): T => structuredClone(x);
const records = new Map<string, any>([
  ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", revision: 1, data: world }],
]);
const documents = {
  getById: async (_p: string, id: string) => clone(records.get(id) ?? null),
  list: async (_p: string, kind: string) => [...records.values()].filter((row) => row.kind === kind).map(clone),
  create: async (input: any) => {
    const row = { ...clone(input), revision: 1 };
    assert(!records.has(row.id));
    records.set(row.id, row);
    return clone(row);
  },
  update: async (input: any) => {
    const prior = records.get(input.id);
    if (prior?.revision !== input.expectedRevision) return null;
    const row = { ...prior, ...clone(input), revision: prior.revision + 1 };
    records.set(row.id, row);
    return clone(row);
  },
  remove: async (_p: string, id: string) => records.delete(id),
};
let calls = 0,
  failWish = true;
const model = {
  connectionId: "synthetic",
  model: "synthetic",
  name: "Synthetic System",
  maxContext: 32000,
  maxOutputTokens: 4096,
  fitContext: (messages: any[], options: any) => ({ messages, ...options }),
  chatComplete: async (messages: any[], options: any) => {
    calls++;
    assert.equal(options.responseFormat?.type, "json_object");
    const wish = messages[0].content.includes("{wish:null}"),
      packet = JSON.parse(messages[1].content);
    assert.equal(options.reasoningEffort, wish ? "none" : undefined);
    assert.equal(options.maxTokens, wish ? 1536 : 4096);
    const plan = wish ? undefined : keyedStarterReply(packet);
    const napDay: string | undefined = packet.residents?.[0].days[1][0];
    return {
      finishReason: "stop",
      content: JSON.stringify(
        wish
          ? failWish && packet.identity.id === "a"
            ? {}
            : { wish: null }
          : {
              ...plan,
              ...(napDay
                ? {
                    plans: {
                      ...plan!.plans,
                      [napDay]: [{ kind: "nap", minutes: 45 }, ...plan!.plans[napDay]!.slice(1)],
                    },
                  }
                : {}),
              setup: keyedFoundingSetup(packet, {
                ...plan!.setup,
                identityDescription: "A patient resident with a lasting interest in local history.",
              }),
            },
      ),
    };
  },
};
const runtime = {
  persistence: { documents: villageFixtureDocuments(documents) },
  resources: {
    listCharacters: async () => [],
    listPersonas: async () => [],
    listLorebooks: async () => [],
    listEligibleLorebookEntries: async () => [],
  },
  languageModels: { resolve: async () => model, resolveForRequest: async () => model },
  json: { parseJsonish: JSON.parse },
  logger: { info() {}, warn() {}, error() {}, debug() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ connectionId: "synthetic", settings: {} }),
};
const fetchBefore = globalThis.fetch;
globalThis.fetch = async () => new Response("[]", { headers: { "Content-Type": "application/json" } });
let app = Fastify(),
  stop: (() => Promise<void>) | undefined;
async function start() {
  stop = await activate({
    api: {
      runtime,
      registerPrivilegedRoutes: async (routes: any, options: any) => {
        await app.register(async (instance) => {
          await routes(
            Object.fromEntries(
              ["get", "post", "put", "patch", "delete", "addContentTypeParser"].map((method) => [
                method,
                (instance as any)[method].bind(instance),
              ]),
            ),
          );
        }, options);
        return () => app.close();
      },
    },
  });
}
async function settled() {
  for (let i = 0; i < 200; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (records.get("villages-village").data.foundingPreparation.status !== "pending") return;
  }
  throw Error("Synthetic founding did not settle");
}
try {
  await start();
  const read = await app.inject({ method: "GET", url: "/api/villages/setup/preparation" });
  assert.equal(read.statusCode, 200, read.body);
  assert.equal(read.json().foundingPreparation.canPlay, false);
  const enter = () => app.inject({ method: "POST", url: "/api/villages/rooms", payload: { venueId: "square" } });
  const blocked = await enter();
  assert.equal(blocked.statusCode, 409, blocked.body);
  assert.match(blocked.body, /Finish Founding preparation/);
  assert.equal(calls, 0);
  const batch = { actionId: "batch-http" };
  let response = await app.inject({ method: "POST", url: "/api/villages/setup/preparation/retry", payload: batch });
  assert.equal(response.statusCode, 200, response.body);
  await settled();
  let marker = records.get("villages-village").data.foundingPreparation;
  assert.equal(marker.tasks.b.wish.status, "completed");
  const failedWish = [...records.values()].find(
    (row) => row.kind === "background-work" && row.data.kind === "wish" && row.data.subjectId === "a",
  )!.data;
  assert.equal(
    failedWish.failure?.cause,
    "missing_result",
    "a complete saved malformed reply has a known parser failure, not an unknown provider outcome",
  );
  assert.equal(calls, 4, "Both Agendas share one request. The failed Wish receives one automatic retry.");
  assert.equal(marker.status, "failed");
  assert.equal((await enter()).statusCode, 409, "An unfinished Wish still blocks entry");
  assert.equal(marker.tasks.a.routine.status, "completed");
  const starterAgenda = records.get("villages-village").data.villagers[0].agenda;
  const bookedAgenda = records.get("villages-village").data.villagers[1].agenda;
  assert.ok(
    agendaBlocksFor(bookedAgenda, new Date(now)).some(
      (block) =>
        block.commitmentId === "saved-opening-appointment" && block.startMinute === 1305 && block.endMinute === 1350,
    ),
    "A booked opening-day appointment still spans the whole reserved interval",
  );
  const planned = Object.entries(
    starterAgenda.plannedDays as Record<
      string,
      { activity: string; essential?: boolean; startMinute: number; endMinute: number }[]
    >,
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);
  assert.equal(planned.length, 7);
  assert.equal(planned[0]![0], "2026-11-26", "The saved week begins on Founding day");
  assert.equal(planned.at(-1)?.[0], starterAgenda.starterWeekThrough);
  assert.equal(starterAgenda.starterWeekThrough, "2026-12-02");
  assert.deepEqual(
    planned.map(([, blocks]) =>
      blocks
        .filter(({ activity }) => activity === "Napping")
        .map(({ startMinute, endMinute }) => endMinute - startMinute),
    ),
    [[], [45], [], [], [], [], []],
  );
  assert.equal(starterAgenda.activeDay.blocks[0].activity, "Taking care of their own affairs");
  assert.equal(starterAgenda.activeDay.blocks[0].endMinute, 720, "Elapsed minutes are preserved");
  assert.ok(
    starterAgenda.activeDay.blocks.some(
      (block: { activity: string; startMinute: number }) =>
        block.startMinute === 720 && block.activity.startsWith("Starter activity 1/"),
    ),
    "Afternoon plans are active today",
  );
  const afterStarter = calendarAt(new Date(), starterAgenda.starterWeekThrough, 720);
  afterStarter.setDate(afterStarter.getDate() + 1);
  const fallback = ordinaryAgendaBlocksFor(starterAgenda, afterStarter);
  assert.ok(new Set(fallback.filter((block) => block.flexible).map((block) => block.activity)).size >= 3);
  for (const [index, [, blocks]] of planned.entries()) {
    assert.ok(blocks.filter(({ activity }) => activity.startsWith(`Starter activity ${index + 1}/`)).length >= 3);
    assert.ok(blocks.some((block) => block.activity === "Sleeping" && block.essential));
  }
  assert.equal(
    records.get("villages-village").data.villagers[0].identityDescription.text,
    "A patient resident with a lasting interest in local history.",
  );
  assert.equal(marker.tasks.a.wish.attempt, 2);
  assert.equal(
    [...records.values()].find(
      (row) => row.kind === "background-work" && row.data.kind === "wish" && row.data.subjectId === "a",
    )?.data.automaticRetryUsed,
    true,
  );
  const initialDescription = records.get("villages-village").data.villagers[0].identityDescription;
  const manualText = "A reserved resident with a lasting interest in local history.";
  const savedDescription = await app.inject({
    method: "PATCH",
    url: "/api/villages/villagers/a/description",
    payload: { text: manualText, revision: initialDescription.revision },
  });
  assert.equal(savedDescription.statusCode, 200, savedDescription.body);
  assert.equal(savedDescription.json().villagers[0].summary, manualText);
  const staleDescription = await app.inject({
    method: "PATCH",
    url: "/api/villages/villagers/a/description",
    payload: { text: "Stale edit.", revision: initialDescription.revision },
  });
  assert.equal(staleDescription.statusCode, 409);
  assert.equal(records.get("villages-village").data.villagers[0].identityDescription.text, manualText);
  const oversizedDescription = await app.inject({
    method: "PATCH",
    url: "/api/villages/villagers/a/description",
    payload: {
      text: "x".repeat(241),
      revision: records.get("villages-village").data.villagers[0].identityDescription.revision,
    },
  });
  assert.equal(oversizedDescription.statusCode, 400);
  assert.equal(calls, 4, "Editing uses no model request.");
  const before = calls;
  await stop!();
  app = Fastify();
  await start();
  await app.inject({ method: "GET", url: "/api/villages/setup/preparation" });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(calls, before, "startup and reads make no replacement request");
  assert.equal(
    records.get("villages-village").data.villagers[0].identityDescription.text,
    manualText,
    "Player edits survive reactivation.",
  );
  const publicResponse = await app.inject({ method: "GET", url: "/api/villages/setup/preparation" });
  assert(!/admission|savedProposal|needComparison/.test(publicResponse.body), "private frozen inputs stay private");
  marker = records.get("villages-village").data.foundingPreparation;
  const target = {
    characterId: "a",
    task: "wish",
    expectedAttempt: marker.tasks.a.wish.attempt,
    actionId: "wish-http",
  };
  response = await app.inject({
    method: "POST",
    url: "/api/villages/setup/preparation/retry",
    payload: { ...target, expectedAttempt: 99 },
  });
  assert.equal(response.statusCode, 409, response.body);
  assert.equal(calls, before);
  failWish = false;
  response = await app.inject({ method: "POST", url: "/api/villages/setup/preparation/retry", payload: target });
  assert.equal(response.statusCode, 200, response.body);
  await settled();
  assert.equal(calls, before + 1);
  assert.equal(records.get("villages-village").data.foundingPreparation.status, "ready");
  assert.equal(
    (await app.inject({ method: "GET", url: "/api/villages/setup/preparation" })).json().foundingPreparation.canPlay,
    true,
  );
  await app.inject({ method: "POST", url: "/api/villages/setup/preparation/retry", payload: target });
  assert.equal(calls, before + 1, "duplicate retry is free");
  const rebuild = () =>
    app.inject({
      method: "POST",
      url: "/api/villages/agendas/a/regenerate",
      payload: { actionId: "fresh-sleep", rebuild: true, characterIds: ["a", "b"] },
    });
  const completedMarker = structuredClone(records.get("villages-village").data.foundingPreparation);
  const duplicateScope = await app.inject({
    method: "POST",
    url: "/api/villages/agendas/a/regenerate",
    payload: { actionId: "duplicate-scope", rebuild: true, characterIds: ["a", " a "] },
  });
  assert.equal(duplicateScope.statusCode, 400);
  const rebuilt = await rebuild();
  assert.equal(rebuilt.statusCode, 202, rebuilt.body);
  assert.equal((await rebuild()).statusCode, 202, "An identical admission reuses the pending request");
  for (let attempt = 0; attempt < 200; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    const job = [...records.values()].find((row) => row.kind === "background-work" && row.data.subjectId === "rebuild");
    if (job && !["queued", "running"].includes(job.data.status)) {
      assert.equal(job.data.status, "completed", job.data.error);
      break;
    }
  }
  const rebuiltWorld = records.get("villages-village").data;
  assert.equal(rebuiltWorld.foundingPreparation.status, "ready");
  assert.deepEqual(rebuiltWorld.foundingPreparation.tasks, completedMarker.tasks, "Founding receipts are preserved");
  assert.deepEqual(rebuiltWorld.foundingPreparation.completedIds, completedMarker.completedIds);
  assert.deepEqual(rebuiltWorld.foundingPreparation.retryActions, completedMarker.retryActions);
  for (const resident of rebuiltWorld.villagers) {
    assert.equal(resident.agenda.manualWeek.actionId, "fresh-sleep");
    const active = resident.agenda.activeDay;
    assert.equal(active.dateKey, "2026-11-26");
    assert.equal(active.blocks[0].activity, "Sleeping", "Rebuilding begins at midnight on the current day");
  }
  assert.ok(
    agendaBlocksFor(rebuiltWorld.villagers[1].agenda, new Date(now)).some(
      (block) =>
        block.commitmentId === "saved-opening-appointment" && block.startMinute === 1305 && block.endMinute === 1350,
    ),
  );
  assert.equal(rebuiltWorld.villagers[0].identityDescription.text, manualText);
  assert.equal((await rebuild()).statusCode, 202);
  assert.equal(calls, before + 2, "The explicit rebuild uses one request for both residents");
  console.log(
    "Packaged HTTP founding jobs: independent results, restart, target fences, quiet Wish, readiness and private inputs passed.",
  );
} finally {
  await stop?.();
  globalThis.fetch = fetchBefore;
  Date.now = realNow;
}
