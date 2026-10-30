import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { clientImplementation } from "./client-source.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { villageRouteSource } from "./route-source.js";
// Continuous Villages time: exact projection, migration, idempotent restart
// reconciliation, model-independent progress, and the live unreferenced timer.
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const moduleUrl = (relativePath: string) => pathToFileURL(join(repoRoot, relativePath)).href;
  const routesSource = villageRouteSource();
  const clientSource = clientImplementation();
  assert.match(routesSource, /"\/reconcile"/u);
  assert.doesNotMatch(routesSource, /"\/tick"/u);
  assert.match(clientSource, /"\/background\/presence"/u);
  const { configureVillagesRuntime } = await import(moduleUrl("packages/villages/src/server/entry/runtime.ts"));
  const {
    startBackgroundWork,
    settleBackgroundWork,
    villageBackgroundPresence,
    backgroundWorkSummaries,
    retryBackgroundJob,
  } = await import(moduleUrl("packages/villages/src/server/jobs/background-work.ts"));
  const { coerceVillageState } = await import(
    moduleUrl("packages/villages/src/server/domain/decoding/village-codec.ts")
  );
  const { mutateVillageState, readVillageState } = await import(
    moduleUrl("packages/villages/src/server/features/world/village-store.ts")
  );
  const { deriveVillageMoment } = await import(moduleUrl("packages/villages/src/server/domain/rules/village-clock.ts"));
  const { reconcileVillage } = await import(moduleUrl("packages/villages/src/server/features/world/village.ts"));
  const { projectHomeLines } = await import(
    moduleUrl("packages/villages/src/server/domain/rules/village-projections.ts")
  );
  const { proposeVillageResidence, decideVillageResidence, completeVillageResidence } = await import(
    moduleUrl("packages/villages/src/server/features/venues/residences.ts")
  );
  const { clearVillagerAgenda } = await import(
    moduleUrl("packages/villages/src/server/features/residents/resident-agendas.ts")
  );
  const { updateVillageVenue } = await import(moduleUrl("packages/villages/src/server/features/venues/services.ts"));
  const { rollActiveAgendas } = await import("../packages/villages/src/server/features/residents/resident-agendas.ts");
  const { workingAgendaWeek } = await import(moduleUrl("packages/villages/src/server/domain/rules/agenda-week.ts"));
  const { REFRESH_MAX_DELAY_MS, REFRESH_MIN_DELAY_MS, villageSchedulerDelayMs } = await import(
    moduleUrl("packages/villages/src/server/jobs/village-refresh-scheduler.ts")
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
  const retainedDeadline = {
    villagers: [
      {
        wishes: [{ size: "larger", learnedAt: at(9, 40).toISOString(), expiresAt: at(9, 43).toISOString() }],
        agenda: {
          day: [],
        },
      },
    ],
    scheduledEvents: [],
  } as any;
  assert.equal(
    villageSchedulerDelayMs(at(9, 42, 30), retainedDeadline),
    villageSchedulerDelayMs(at(9, 42, 30)),
    "A retained discovered wish creates no expiry wake",
  );
  assert.equal(villageSchedulerDelayMs(new Date("bad")), REFRESH_MAX_DELAY_MS);

  const migrated = coerceVillageState({
    ...defaultVillageState(),
    backgroundPace: "quiet",

    wishSystemVersion: 3,
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
        wishes: [],
        agenda: { day: [{ clock: "morning", venueId: "square", activity: "walking" }] },
      },
    ],
  });
  assert.equal(migrated.backgroundPace, "quiet");
  assert.ok(Date.parse(migrated.simulatedThrough) > 0);
  assert.equal(Object.hasOwn(migrated, "happenings"), false);
  assert.equal(migrated.villagers[0]?.agenda?.day[0]?.startMinute, 300);
  assert.equal(
    coerceVillageState({
      ...defaultVillageState(),

      wishSystemVersion: 3,
      backgroundPace: "off",
      refreshClocks: [],
    }).backgroundPace,
    "off",
  );
  assert.equal(
    coerceVillageState({
      ...defaultVillageState(),

      wishSystemVersion: 3,
      refreshClocks: ["morning", "evening"],
    }).backgroundPace,
    "balanced",
  );

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
  let agendaMode = false;
  let failWednesday = false;
  const agendaRequests: string[] = [];
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
    persistence: { documents: villageFixtureDocuments(documents) },
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
          async chatComplete(_messages: any[]) {
            modelCalls += 1;
            if (agendaMode) {
              agendaRequests.push("Write routine profile.");
              if (failWednesday) throw new Error("Profile unavailable");
              return {
                content: JSON.stringify({
                  routine: "Studying quietly.",
                  palette: Array.from({ length: 6 }, (_, i) => ({
                    activity: "Studying the stars " + i,
                    venue: 0,
                    status: "idle",
                    flexible: true,
                    essential: false,
                    duration: 180,
                    parts: [0, 1, 2, 3],
                  })),
                  days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
                  rhythm: [],
                }),
                finishReason: "stop",
              };
            }
            throw new Error("Unexpected planning request in a deterministic catch-up fixture");
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

  const realNow = Date.now;
  const wallOffset = 0;
  Date.now = () => realNow() + wallOffset;
  const stopWork = startBackgroundWork();
  await villageBackgroundPresence("visible-story-fixture", true);
  try {
    const start = new Date("2026-08-20T12:00:00.000Z");
    await mutateVillageState((state) => {
      state.setupAt = start.toISOString();
      state.foundedAt = start.toISOString();
      state.seed = "continuous-fixture";
      state.backgroundPace = "off";
      state.simulatedThrough = start.toISOString();
      state.lastKnownTimeZone = "Etc/Old";
      state.villagers = [
        {
          characterId: "retained",
          cardSnapshot: {
            id: "retained",
            name: "Retained",
            capturedAt: start.toISOString(),
            revision: 1,
            sourceStatus: "available",
          },
          wishes: [fixtureWish({ wish: "Share a conversation" }, "retained", start.toISOString())],
          agenda: {
            day: [],
            generatedAt: start.toISOString(),
          },
        },
      ] as any;
      state.venues = [
        {
          id: "square",
          name: "Village Square",
          category: "public",
          presentation: { image: null, x: null, y: null },
          occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
          capabilities: [],
          state: { condition: "", furniture: [], publicFacts: [], updatedAt: "" },
        },
      ];
    });

    const later = new Date("2026-09-22T12:34:00.000Z");
    const quiet = await reconcileVillage({ now: later });
    assert.equal(modelCalls, 0, "story pace Off never blocks deterministic reconciliation and spends no model call");
    assert.equal((await readVillageState()).simulatedThrough, later.toISOString());
    assert.equal((await readVillageState()).lastKnownTimeZone, quiet.village.timeZone);
    const retainedState = await readVillageState();
    assert.equal(
      retainedState.villagers[0].wishes[0].id,
      "retained",
      "Restart catch-up retains desires independently of attention or player knowledge",
    );
    await mutateVillageState((state) => {
      state.villagers = [];
    });
    assert.equal(Object.hasOwn(quiet, "recap"), false);

    const backward = new Date("2026-09-22T11:15:00.000Z");
    const projected = await reconcileVillage({ now: backward });
    assert.equal(
      (await readVillageState()).simulatedThrough,
      later.toISOString(),
      "a backward clock never rewinds committed state",
    );
    assert.equal(projected.village.localTime, `${String(backward.getHours()).padStart(2, "0")}:15`);

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
          wishes: [],
          agenda: {
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
    assert.equal(activeSunday.scheduleInformed, false);
    assert.notEqual(activeSunday.blocks[0]!.activity, "Keeping watch", "Engine translation no longer owns Sunday");

    // One compact request, deliberate recovery, and deduplicated action IDs.
    agendaMode = true;
    failWednesday = true;
    await Promise.all([
      clearVillagerAgenda("lina", "same-agenda-action"),
      clearVillagerAgenda("lina", "same-agenda-action"),
    ]);
    await settleBackgroundWork();
    assert.deepEqual(agendaRequests, ["Write routine profile."]);
    const agendaFailure = (await backgroundWorkSummaries()).find((job) => job.kind === "agenda")!;
    assert.equal(agendaFailure.status, "failed");
    assert.equal(agendaFailure.completedSteps, 0);
    await reconcileVillage({ now: new Date(2026, 8, 28, 8) });
    await settleBackgroundWork();
    assert.equal(agendaRequests.length, 1, "daily ticks cannot retry an unresolved request");
    failWednesday = false;
    await Promise.all([
      retryBackgroundJob(agendaFailure.id, agendaFailure.attempt, "same-profile-retry"),
      retryBackgroundJob(agendaFailure.id, agendaFailure.attempt, "same-profile-retry"),
    ]);
    await settleBackgroundWork();
    assert.equal(agendaRequests.length, 2);
    await retryBackgroundJob(agendaFailure.id, agendaFailure.attempt, "same-profile-retry");
    await settleBackgroundWork();
    assert.equal(agendaRequests.length, 2, "lost retry responses do not repeat a successful request");
    assert.equal((await readVillageState()).villagers[0]!.agenda!.personalizationPending, false);
    agendaMode = false;

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
          baseClasses: ["residence"],
          zones: undefined,
          spaces: undefined,
          residentIds: undefined,
          name: "",
          description: "Rosa's little house.",
          occupancy: { playerHome: false, residentCharacterId: "housing-resident", homeKind: "small-home" },
          presentation: { image: null, x: 0.2, y: 0.2 },
        },
        {
          ...state.venues[0]!,
          id: "empty-venue",
          classes: ["residence"],
          baseClasses: ["residence"],
          zones: undefined,
          spaces: undefined,
          residentIds: undefined,
          name: "The bakery",
          description: "A small bakery.",
          occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
          presentation: { image: null, x: 0.6, y: 0.6 },
        },
      ];
    });
    await assert.rejects(
      () => updateVillageVenue("rosa-home", { presentation: { x: 0.8, y: 0.8 } }),
      /Project, natural gameplay, or REPAIR/u,
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
      const home = state.venues[0]!;
      home.layoutVersion = 1;
      const nook = home.zones!.find((zone) => zone.ownerId === "housing-resident")!;
      nook.description = "Rosa's old nook. A letter lies on the desk.";
      home.privateSpaces = home.zones!.filter((zone) => zone.kind === "private-residence");
    });
    await completeVillageResidence("housing-resident", false, new Date());
    assert.equal((await readVillageState()).venues[0]?.occupancy.residentCharacterId, "housing-resident");
    await completeVillageResidence("housing-resident", true, new Date());
    assert.equal((await readVillageState()).venues[1]?.occupancy.residentCharacterId, "housing-resident");
    const movedState = await readVillageState();
    assert.match(
      movedState.venues[0]?.archivedPrivateSpaces?.find((row) => row.space.description.includes("A letter lies"))?.space
        .description ?? "",
      /A letter lies on the desk/,
    );
    assert.match(
      movedState.venues[0]?.zones?.find((zone) => zone.kind === "private-residence")?.description ?? "",
      /Rosa's old nook/,
    );
    assert.equal(
      movedState.venues[0]?.privateSpaces?.some((space) => space.ownerId === "housing-resident"),
      false,
    );
    assert.equal(
      (movedState.venues[1]?.privateSpaces ?? []).some((space) => space.ownerId === "housing-resident"),
      false,
      "moving without a selected Private Space never creates a room",
    );
    assert.ok(
      projectHomeLines(await readVillageState(), new Map()).some(
        (home) => home.occupant === "Rosa" && home.venueName === "The bakery",
      ),
      "a move into a public venue remains in the home projection",
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
    Date.now = realNow;
    stopWork();
    await settleBackgroundWork();
    release();
  }

  console.log("Villages continuous time regression: exact time, migration, restart, idempotence, failure, timer ok");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
