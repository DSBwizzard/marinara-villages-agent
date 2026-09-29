// Continuous Villages time: exact projection, migration, idempotent restart
// reconciliation, model-independent progress, and the live unreferenced timer.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const moduleUrl = (relativePath: string) => pathToFileURL(join(repoRoot, relativePath)).href;
  const routesSource = readFileSync(
    join(repoRoot, "packages/villages/src/engine/packages/server/src/routes/villages.routes.ts"),
    "utf8",
  );
  const clientSource = readFileSync(
    join(repoRoot, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
    "utf8",
  );
  assert.match(routesSource, /app\.post<[^\n]+>\("\/reconcile"/u);
  assert.doesNotMatch(routesSource, /"\/tick"/u);
  assert.match(clientSource, /request<VillageSnapshot>\("\/reconcile"/u);
  const { configureVillagesRuntime } = await import(
    moduleUrl("packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts")
  );
  const { coerceVillageState, mutateVillageState, readVillageState } = await import(
    moduleUrl("packages/villages/src/engine/packages/server/src/services/villages/village-store.ts")
  );
  const { deriveVillageMoment } = await import(
    moduleUrl("packages/villages/src/engine/packages/server/src/services/villages/village-clock.ts")
  );
  const {
    reconcileVillage,
    rollActiveAgendas,
    setVillageStoryPace,
    proposeVillageResidence,
    decideVillageResidence,
    completeVillageResidence,
    requestVillageHomeUpgrade,
    decideVillageHomeUpgrade,
    updateVillageVenue,
    projectHomeLines,
  } = await import(moduleUrl("packages/villages/src/engine/packages/server/src/services/villages/village.ts"));
  const { workingAgendaWeek } = await import(
    moduleUrl("packages/villages/src/engine/packages/server/src/services/villages/agenda-week.ts")
  );
  const { renderHomesBlock } = await import(
    moduleUrl("packages/villages/src/engine/packages/server/src/services/villages/prompt-preset.ts")
  );
  const { REFRESH_MAX_DELAY_MS, REFRESH_MIN_DELAY_MS, startVillageRefreshScheduler, villageSchedulerDelayMs } =
    await import(
      moduleUrl("packages/villages/src/engine/packages/server/src/services/villages/village-refresh-scheduler.ts")
    );

  const at = (hour: number, minute: number, second = 0) => new Date(2026, 8, 22, hour, minute, second, 0);
  const before = deriveVillageMoment({ foundedAt: "2026-09-01T00:00:00.000Z", seed: "fixture", now: at(11, 59) });
  const after = deriveVillageMoment({ foundedAt: "2026-09-01T00:00:00.000Z", seed: "fixture", now: at(12, 0) });
  assert.equal(before.minuteOfDay, 719);
  assert.equal(after.minuteOfDay, 720);
  assert.equal(before.dayPhase, "morning");
  assert.equal(after.dayPhase, "afternoon", "day phase is derived atmosphere at the exact minute boundary");
  assert.equal(new Date(before.nextTransitionAt).getTime(), at(12, 0).getTime());
  const midnight = deriveVillageMoment({
    foundedAt: "2026-09-01T00:00:00.000Z",
    seed: "fixture",
    now: new Date(2026, 8, 22, 23, 59, 0, 0),
  });
  assert.equal(new Date(midnight.nextTransitionAt).getDate(), 23, "midnight advances to the next local calendar day");
  const springBefore = new Date(2026, 2, 8, 1, 59, 0, 0);
  const springAfter = new Date(springBefore);
  springAfter.setMinutes(springAfter.getMinutes() + 1);
  assert.equal(
    deriveVillageMoment({ foundedAt: "2026-03-01T00:00:00.000Z", seed: "fixture", now: springAfter }).minuteOfDay,
    springAfter.getHours() * 60 + springAfter.getMinutes(),
    "DST projection follows the device's actual local minute",
  );
  assert.equal(
    villageSchedulerDelayMs(at(9, 42, 30), {
      villagers: [{ agenda: { day: [{ startMinute: 0, endMinute: 583 }] } }],
      scheduledEvents: [],
    } as any),
    30_250,
    "the timer targets an exact agenda boundary between atmospheric phases",
  );
  assert.ok(villageSchedulerDelayMs(at(9, 42, 59)) >= REFRESH_MIN_DELAY_MS);
  assert.ok(villageSchedulerDelayMs(at(9, 42, 0)) <= REFRESH_MAX_DELAY_MS);
  assert.equal(villageSchedulerDelayMs(new Date("bad")), REFRESH_MAX_DELAY_MS);

  const migrated = coerceVillageState({
    foundedAt: "2026-09-01T07:00:00.000Z",
    lastHappeningKey: "2:morning",
    refreshClocks: ["morning"],
    happenings: [{ id: "old", dayIndex: 1, clock: "evening", text: "An old line." }],
    villagers: [
      {
        characterId: "old-resident",
        cardSnapshot: {
          id: "old-resident",
          name: "Old resident",
          revision: 1,
          sourceStatus: "available",
          capturedAt: "2026-09-01T00:00:00.000Z",
        },
        agenda: { day: [{ clock: "morning", venueId: "square", activity: "walking" }], wishes: [] },
      },
    ],
  });
  assert.equal(migrated.storyPace, "quiet");
  assert.ok(Date.parse(migrated.simulatedThrough) > 0);
  assert.equal(migrated.happenings[0]?.timePrecision, "phase");
  assert.equal(migrated.villagers[0]?.agenda?.day[0]?.startMinute, 300);
  assert.equal(coerceVillageState({ refreshClocks: [] }).storyPace, "off");
  assert.equal(coerceVillageState({ refreshClocks: ["morning", "evening"] }).storyPace, "balanced");

  const documentsByKey = new Map<string, any>();
  const documents = {
    async list(packageId: string, kind: string) {
      return [...documentsByKey.values()].filter((row) => row.packageId === packageId && row.kind === kind);
    },
    async getById(packageId: string, id: string) {
      return documentsByKey.get(`${packageId}::${id}`) ?? null;
    },
    async create(input: any) {
      const key = `${input.packageId}::${input.id}`;
      const row = { ...input, revision: 1 };
      documentsByKey.set(key, row);
      return row;
    },
    async update(input: any) {
      const key = `${input.packageId}::${input.id}`;
      const current = documentsByKey.get(key);
      if (!current || current.revision !== input.expectedRevision) return null;
      const row = { ...current, ...input, revision: current.revision + 1 };
      documentsByKey.set(key, row);
      return row;
    },
    async remove(packageId: string, id: string, expectedRevision: number) {
      const key = `${packageId}::${id}`;
      const current = documentsByKey.get(key);
      if (!current || current.revision !== expectedRevision) return false;
      return documentsByKey.delete(key);
    },
  };
  let modelCalls = 0;
  let failModel = false;
  let invalidProposal = false;
  const warnings: string[] = [];
  const release = configureVillagesRuntime({
    logger: {
      debug() {},
      info() {},
      warn(message: string, ...args: any[]) {
        warnings.push([message, ...args].join(" "));
      },
      error() {},
      debugOverride() {},
    },
    persistence: { documents },
    resources: {
      async listCharacters() {
        return [];
      },
    },
    languageModels: {
      async resolveForRequest() {
        return {
          name: "Fixture",
          connectionId: "fixture",
          model: "fixture-model",
          maxContext: 8192,
          maxOutputTokens: 4096,
          fitContext(messages: any[], options: any) {
            return { messages, maxTokens: options?.maxTokens };
          },
          async chatComplete(messages: any[]) {
            modelCalls += 1;
            if (failModel) throw new Error("model unavailable");
            const prompt = String(messages[0]?.content ?? "");
            assert.ok(prompt.includes("This feed has no effect on the village or its residents."));
            assert.ok(!prompt.includes('"memory":[') && !prompt.includes('"featureEdits":['));
            const offered = prompt.match(/(opportunity-\d+) \((\w+); actors ([^;]*); venue ([^;]+);/u);
            const actorIds = invalidProposal
              ? ["nonexistent-actor"]
              : offered?.[3]?.length
                ? offered[3].split(",")
                : [];
            return {
              content: JSON.stringify({
                happenings: offered
                  ? [
                      {
                        opportunityId: offered[1],
                        kind: offered[2],
                        actorIds,
                        venueId: invalidProposal ? "nonexistent-venue" : offered[4] === "none" ? "" : offered[4],
                        narration: `Happening ${modelCalls}.`,
                      },
                    ]
                  : [],
                // The prose feed may propose side effects, but Events is visual only.
                memory: [{ text: "A visual event tried to become shared memory.", who: [], private: false }],
                notices: [{ author: "Narrator", text: "A visual event tried to pin a notice." }],
              }),
              finishReason: "stop",
            };
          },
        };
      },
    },
    json: Object.freeze({ parseJsonish: (raw: string) => JSON.parse(raw) }),
    async getAgentConfig() {
      return { connectionId: null };
    },
    isDebugAgentsEnabled() {
      return false;
    },
  } as any);

  try {
    const start = new Date("2026-08-20T12:00:00.000Z");
    await mutateVillageState((state) => {
      state.setupAt = start.toISOString();
      state.foundedAt = start.toISOString();
      state.seed = "continuous-fixture";
      state.storyPace = "off";
      state.simulatedThrough = start.toISOString();
      state.lastKnownTimeZone = "Etc/Old";
      state.venues = [
        {
          id: "square",
          name: "Village Square",
          category: "public",
          presentation: { image: null, x: null, y: null },
          occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
          capabilities: [],
          state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
        },
      ];
    });

    const later = new Date("2026-09-22T12:34:00.000Z");
    const quiet = await reconcileVillage({ now: later });
    assert.equal(modelCalls, 0, "story pace Off never blocks deterministic reconciliation and spends no model call");
    assert.equal((await readVillageState()).simulatedThrough, later.toISOString());
    assert.equal((await readVillageState()).lastKnownTimeZone, quiet.village.timeZone);
    assert.ok(quiet.recap, "a long return receives a layered recap");
    assert.ok((quiet.recap?.summaries.length ?? 0) <= 6);

    const backward = new Date("2026-09-22T11:15:00.000Z");
    const projected = await reconcileVillage({ now: backward });
    assert.equal(
      (await readVillageState()).simulatedThrough,
      later.toISOString(),
      "a backward clock never rewinds committed state",
    );
    assert.equal(projected.village.localTime, `${String(backward.getHours()).padStart(2, "0")}:15`);

    await setVillageStoryPace("balanced");
    await mutateVillageState((state) => {
      state.lastCreativeDate = "";
      state.simulatedThrough = start.toISOString();
    });
    const callsBefore = modelCalls;
    const creative = await reconcileVillage({ now: later });
    assert.equal(modelCalls, callsBefore + 1, "one planning call covers the active local day");
    assert.equal(creative.happenings[0]?.occurredAt, later.toISOString());
    assert.equal(creative.happenings[0]?.timePrecision, "exact");
    assert.ok(creative.happenings[0]?.sourceOpportunityId);
    assert.equal((await readVillageState()).chronicle.length, 0, "visual Events write no memories");
    assert.equal((await readVillageState()).noticeboard.length, 0, "visual Events pin no notices");
    assert.equal((await readVillageState()).venues[0]?.state.condition, "", "visual Events do not edit places");
    assert.ok(creative.recap, "a month-long return uses the same single planning call and returns a recap");
    await reconcileVillage({ now: new Date(later.getTime() + 10 * 60_000) });
    assert.equal(modelCalls, callsBefore + 1, "repeated reconciliation on one local day is idempotent");

    failModel = true;
    const tomorrow = new Date("2026-09-23T13:00:00.000Z");
    await reconcileVillage({ now: tomorrow });
    assert.equal(
      (await readVillageState()).simulatedThrough,
      tomorrow.toISOString(),
      "model failure still advances time",
    );
    assert.notEqual((await readVillageState()).lastCreativeDate, "2026-09-23", "a failed story remains retryable");
    failModel = false;
    await reconcileVillage({ now: tomorrow });
    assert.equal((await readVillageState()).lastCreativeDate, "2026-09-23");

    invalidProposal = true;
    const invalidDay = new Date("2026-09-24T13:00:00.000Z");
    const happeningsBeforeInvalid = (await readVillageState()).happenings.length;
    await reconcileVillage({ now: invalidDay });
    assert.equal(
      (await readVillageState()).happenings.length,
      happeningsBeforeInvalid,
      "a proposal with impossible actors and venues is discarded without affecting valid state",
    );
    invalidProposal = false;

    const concurrentDay = new Date("2026-09-25T13:00:00.000Z");
    const happeningsBeforeConcurrent = (await readVillageState()).happenings.length;
    await Promise.all([reconcileVillage({ now: concurrentDay }), reconcileVillage({ now: concurrentDay })]);
    const afterConcurrent = await readVillageState();
    assert.equal(
      afterConcurrent.happenings.length,
      happeningsBeforeConcurrent + 1,
      "concurrent reconciliation cannot commit the same opportunity twice",
    );
    assert.equal(new Set(afterConcurrent.happenings.map((entry) => entry.id)).size, afterConcurrent.happenings.length);

    await mutateVillageState((state) => {
      state.storyPace = "off";
    });
    const stop = startVillageRefreshScheduler({ delayMs: () => 5 });
    await sleep(30);
    stop();
    const cursorAfterWake = Date.parse((await readVillageState()).simulatedThrough);
    assert.ok(cursorAfterWake >= tomorrow.getTime(), "the live timer uses the same durable reconciliation cursor");
    stop();

    // A restart or first read after local midnight commits the queued week once.
    await mutateVillageState((state) => {
      const week = workingAgendaWeek(state.venues, "Lina");
      const scheduleWeek = structuredClone(week);
      scheduleWeek.Sunday[0]!.activity = "Keeping watch";
      state.villagers = [
        {
          characterId: "lina",
          cardSnapshot: {
            id: "lina",
            revision: 1,
            sourceStatus: "available",
            name: "Lina",
            capturedAt: start.toISOString(),
          },
          addedAt: start.toISOString(),
          ingestSchedule: false,
          agenda: {
            wishes: [],
            routineSummary: "",
            day: [],
            week,
            scheduleWeek,
            source: "village",
            generatedAt: start.toISOString(),
            activeDay: { dateKey: "2026-09-25", weekday: "Friday", blocks: week.Friday!, scheduleInformed: false },
          },
          remap: null,
          remapFailure: null,
        } as never,
      ];
    });
    const saturday = new Date(2026, 8, 26, 8);
    assert.equal(await rollActiveAgendas(saturday), true);
    const saturdayBlocks = (await readVillageState()).villagers[0]!.agenda!.activeDay!.blocks;
    assert.equal((await readVillageState()).villagers[0]!.agenda!.activeDay!.scheduleInformed, false);
    await mutateVillageState((state) => {
      state.villagers[0]!.ingestSchedule = true;
      state.villagers[0]!.agenda!.week!.Sunday[0]!.activity = "A new village plan";
    });
    assert.equal(await rollActiveAgendas(saturday), false, "a same-day toggle and regeneration do not roll early");
    assert.deepEqual((await readVillageState()).villagers[0]!.agenda!.activeDay!.blocks, saturdayBlocks);
    const sunday = new Date(2026, 8, 27, 8);
    assert.equal(await rollActiveAgendas(sunday), true);
    const activeSunday = (await readVillageState()).villagers[0]!.agenda!.activeDay!;
    assert.equal(activeSunday.dateKey, "2026-09-27");
    assert.equal(activeSunday.scheduleInformed, true);
    assert.equal(activeSunday.blocks[0]!.activity, "Keeping watch");

    // Housing decisions preserve ownership until the full elapsed day passes.
    await mutateVillageState((state) => {
      state.villagers = [
        {
          characterId: "housing-resident",
          cardSnapshot: {
            id: "housing-resident",
            name: "Rosa",
            revision: 1,
            sourceStatus: "available",
            capturedAt: start.toISOString(),
          },
          addedAt: start.toISOString(),
          agenda: null,
        } as never,
      ];
      state.residences = [];
      state.venues = [
        {
          ...state.venues[0]!,
          id: "rosa-home",
          classes: ["residence"],
          name: "",
          description: "Rosa's little house.",
          occupancy: { playerHome: false, residentCharacterId: "housing-resident", homeKind: "small-home" },
          presentation: { image: null, x: 0.2, y: 0.2 },
        },
        {
          ...state.venues[0]!,
          id: "empty-venue",
          classes: ["residence"],
          name: "The bakery",
          description: "A small bakery.",
          occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
          presentation: { image: null, x: 0.6, y: 0.6 },
        },
      ];
    });
    await assert.rejects(
      () => updateVillageVenue("rosa-home", { presentation: { x: 0.8, y: 0.8 } }),
      /only name and description/u,
    );
    await requestVillageHomeUpgrade("housing-resident", "rosa-home");
    const upgrade = (await readVillageState()).pendingDecisions.find((entry) => entry.kind === "venue-upgrade")!;
    await decideVillageHomeUpgrade(upgrade.id, true);
    assert.equal((await readVillageState()).venues[0]!.occupancy.homeKind, "small-home");
    assert.equal(
      (await readVillageState()).projects.find((entry) => entry.kind === "renovation")?.lifecycle?.change?.homeKind,
      "medium-home",
    );
    await proposeVillageResidence("housing-resident", "empty-venue");
    await decideVillageResidence("housing-resident", false, "villager");
    assert.equal((await readVillageState()).residences.length, 0, "the villager can decline the player's request");
    await proposeVillageResidence("housing-resident", "empty-venue");
    await decideVillageResidence("housing-resident", true, "villager");
    const moving = await readVillageState();
    assert.equal(moving.residences[0]?.status, "moving");
    assert.equal(moving.venues[0]?.occupancy.residentCharacterId, "housing-resident");
    assert.ok(
      Date.parse(moving.residences[0]!.completesAt!) - Date.parse(moving.residences[0]!.approvedAt!) >=
        24 * 60 * 60_000,
    );
    await mutateVillageState((state) => {
      state.venues[0]!.privateSpaces = [
        {
          id: "private:housing-resident",
          ownerId: "housing-resident",
          venueClass: "residence",
          description: "Rosa's old nook.",
          image: null,
          state: {
            condition: "",
            items: ["Rosa's letter"],
            publicFacts: [],
            features: [],
            traces: [],
            updatedAt: start.toISOString(),
          },
        },
      ];
      state.venues[0]!.spaces = [
        {
          id: "residence",
          venueClass: "residence",
          description: "Shared kitchen.",
          image: null,
          state: {
            condition: "",
            items: ["shared table"],
            publicFacts: [],
            features: [],
            traces: [],
            updatedAt: start.toISOString(),
          },
        },
      ];
    });
    await completeVillageResidence("housing-resident", false, new Date());
    assert.equal((await readVillageState()).venues[0]?.occupancy.residentCharacterId, "housing-resident");
    await completeVillageResidence("housing-resident", true, new Date());
    assert.equal((await readVillageState()).venues[1]?.occupancy.residentCharacterId, "housing-resident");
    const movedState = await readVillageState();
    assert.deepEqual(movedState.venues[0]?.archivedPrivateSpaces?.at(-1)?.space.state.items, ["Rosa's letter"]);
    assert.equal(
      movedState.venues[0]?.privateSpaces?.some((space) => space.ownerId === "housing-resident"),
      false,
    );
    assert.equal(
      movedState.venues[1]?.privateSpaces
        ?.find((space) => space.ownerId === "housing-resident")
        ?.state.items.includes("shared table"),
      false,
      "a new private space never copies shared furnishings",
    );
    assert.match(
      renderHomesBlock(projectHomeLines(await readVillageState(), new Map()), "Player"),
      /Rosa lives at The bakery/u,
      "a move into a public venue is still a residence in narration",
    );
    await proposeVillageResidence("housing-resident", "rosa-home", "villager");
    await decideVillageResidence("housing-resident", true, "player");
    const dueAt = Date.parse((await readVillageState()).residences[0]!.completesAt!);
    await reconcileVillage({ now: new Date(dueAt + 1_000) });
    assert.equal(
      (await readVillageState()).venues[0]?.occupancy.residentCharacterId,
      "housing-resident",
      "normal reconciliation completes a villager-requested move after 24 hours",
    );
  } finally {
    release();
  }

  assert.equal(
    warnings.some((line) => line.includes("model unavailable")),
    true,
  );
  console.log("Villages continuous time regression: exact time, migration, restart, idempotence, failure, timer ok");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
