import { sharedVenuesFixture } from "./helpers/venues.fixture.js";
import { defaultVillageFixture as defaultVillageState } from "./helpers/venues.fixture.js";
import { agendaFixture, keyedStarterReply } from "./helpers/agenda.fixture.js";
import {
  routineProfileFromWeek,
  influenceSettings,
} from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { clientImplementation } from "./client-source.js";
import { retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityWishes } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { emptyContinuity } from "../packages/villages/src/server/domain/rules/continuity.js";
import { decideResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { observableRoomDescription } from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { villageRouteSource } from "./route-source.js";
// Exact clock projection, restart reconciliation, local progress and the live timer.
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
  const { villageSettings } = await import(moduleUrl("packages/villages/src/server/domain/rules/world-snapshot.ts"));
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
      villagers: [
        {
          agenda: agendaFixture({
            day: [
              { startMinute: 0, endMinute: 583, activity: "Morning", venueId: "" },
              { startMinute: 583, endMinute: 1440, activity: "Later", venueId: "" },
            ],
          }),
        },
      ],
      scheduledEvents: [],
    } as any),
    30_250,
    "the timer targets an exact agenda boundary between atmospheric phases",
  );
  assert.ok(villageSchedulerDelayMs(at(9, 42, 59)) >= REFRESH_MIN_DELAY_MS);
  assert.ok(villageSchedulerDelayMs(at(9, 42, 0)) <= REFRESH_MAX_DELAY_MS);
  assert.equal(villageSchedulerDelayMs(new Date("bad")), REFRESH_MAX_DELAY_MS);

  const current = coerceVillageState({
    ...defaultVillageState(),
    backgroundPace: "quiet",
    foundedAt: "2026-09-01T07:00:00.000Z",
    simulatedThrough: "2026-09-03T19:00:00.000Z",
  });
  assert.equal(current.backgroundPace, "quiet");
  assert.equal(current.simulatedThrough, "2026-09-03T19:00:00.000Z");
  assert.equal(coerceVillageState({ ...defaultVillageState(), backgroundPace: "off" }).backgroundPace, "off");
  assert.equal(coerceVillageState(defaultVillageState()).backgroundPace, "balanced");

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
  let weeklyResponses = 0;
  const requestsByResident = new Map<string, number>();
  let weeklyOutputLimit = 12_288;
  let minimumWeeklyReplyTokens = 0;
  let incompleteWeek = false;
  let repetitiveWeek = false;
  let repeatSameDay = false;
  let recentSuggestion = "";
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
          maxOutputTokens: weeklyOutputLimit,
          fitContext(messages: any[], options: any) {
            return { messages, maxTokens: options?.maxTokens };
          },
          async chatComplete(messages: any[], options: { maxTokens: number }) {
            modelCalls += 1;
            if (agendaMode) {
              agendaRequests.push("Write routine profile.");
              if (failWednesday) throw new Error("Profile unavailable");
              const input = JSON.parse(String(messages.at(-1).content));
              return { content: JSON.stringify(keyedStarterReply(input, "Astronomy activity")), finishReason: "stop" };
            }
            if (String(messages[0]?.content).includes("Plan the entire coming week")) {
              weeklyResponses++;
              assert.equal(options.maxTokens, Math.min(8_192, weeklyOutputLimit));
              if (options.maxTokens < minimumWeeklyReplyTokens)
                return { content: '{"plans":{', finishReason: "length" };
              const request = String(messages.at(-1)?.content);
              const input = JSON.parse(request) as {
                residents: Array<{
                  name: string;
                  brief?: string;
                  characterCard?: string;
                  days: [string, string, number][];
                  slots?: unknown[];
                }>;
              };
              assert.doesNotMatch(request, /"recent"|"interests"|Reading| pursuit \d+\//);
              assert.doesNotMatch(String(messages[0]?.content), /Tend seedlings|Buy twine/);
              const plans: Record<
                string,
                Array<string | [string, number] | { kind: string; minutes: number; label?: string }>
              > = {};
              assert.equal(input.residents.length, 1, "Each request prepares one resident.");
              for (const { name, brief, characterCard, days, slots } of input.residents) {
                const attempt = (requestsByResident.get(name) ?? 0) + 1;
                requestsByResident.set(name, attempt);
                assert.match(characterCard ?? brief ?? "", new RegExp(`${name} values independence`));
                assert.match(characterCard ?? brief ?? "", /Curious and inventive/);
                assert.equal(slots, undefined, "The provider sees day counts without exact schedule slots.");
                let index = 0;
                for (const [id, , count] of days) {
                  assert.ok(!Object.hasOwn(plans, id), "Each resident and date has its own ID.");
                  plans[id] = Array.from({ length: count }, () => `${name} pursuit ${attempt}/${++index}`);
                }
              }
              const [first, second, third] = input.residents[0]!.days.map(([id]) => id);
              if (weeklyResponses === 1) {
                plans[first!]![1] = { kind: "nap", minutes: 30, label: "Porch doze" };
                plans[second!]![2] = { kind: "break", minutes: 45, label: "Quiet pause off-duty" };
                plans[third!]![3] = { kind: "nap", minutes: 60, label: "Afternoon catnap" };
              }
              if (incompleteWeek) {
                plans["unexpected-day"] = plans[third!]!;
                delete plans[third!];
              }
              if (repetitiveWeek) for (const day of Object.values(plans)) day.fill(day[0]!);
              if (repeatSameDay) {
                plans[first!]![1] = plans[first!]![0]!;
                plans[second!]!.unshift(plans[first!]![0]!, recentSuggestion, ["Try an unavailable venue", 999]);
              }
              return {
                content: JSON.stringify({ plans: Object.fromEntries(Object.entries(plans).reverse()) }),
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
  let wallOffset = 0;
  Date.now = () => realNow() + wallOffset;
  const stopWork = startBackgroundWork();
  await villageBackgroundPresence("visible-story-fixture", true);
  try {
    const start = new Date("2026-08-20T12:00:00.000Z");
    await mutateVillageState(
      (state) => {
        state.setupAt = start.toISOString();
        state.foundedAt = start.toISOString();
        state.seed = "continuous-fixture";
        state.backgroundPace = "off";
        state.simulatedThrough = start.toISOString();
        state.lastKnownTimeZone = "Etc/Old";
        state.villagers = [
          {
            letterFontId: "caveat",
            characterId: "retained",
            incarnation: "retained-one",
            addedAt: start.toISOString(),
            cardSnapshot: {
              id: "retained",
              name: "Retained",
              capturedAt: start.toISOString(),
              revision: 1,
              sourceStatus: "available",
            },
            agenda: agendaFixture({
              day: [],
              generatedAt: start.toISOString(),
            }),
          },
        ] as any;
        state.venues = [
          ...[
            venueFixture({
              residentIds: [null].filter((id) => typeof id === "string" && !!id),
              id: "square",
              name: "Village Square",
              category: "public",
              presentation: { image: null, x: null, y: null },
              occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
              capabilities: [],
              state: { condition: "", furniture: [], publicFacts: [], updatedAt: "" },
            }),
          ],
          ...sharedVenuesFixture(),
        ];
        retainAuthoredNote(state, "retained", "Share a conversation", ["retained"], start.toISOString(), {
          class: "desire",
          owner: continuityActor(state, "retained")!,
          current: true,
        });
      },
      { memories: true },
    );

    const later = new Date("2026-09-22T12:34:00.000Z");
    const quiet = await reconcileVillage({ now: later });
    assert.equal(modelCalls, 0, "story pace Off never blocks deterministic reconciliation and spends no model call");
    assert.equal((await readVillageState()).simulatedThrough, later.toISOString());
    assert.equal((await readVillageState()).lastKnownTimeZone, quiet.village.timeZone);
    const retainedState = await readVillageState({ memories: true });
    assert.equal(
      continuityWishes(retainedState, "retained", true, later.toISOString())[0].text,
      "Share a conversation",
      "Restart catch-up retains desires independently of attention or player knowledge",
    );
    assert.deepEqual(continuityWishes(retainedState, "retained", false, later.toISOString()), []);
    assert.equal(
      villageSchedulerDelayMs(later, retainedState),
      villageSchedulerDelayMs(later, { ...retainedState, continuity: emptyContinuity() }),
      "A retained desire creates no expiry wake",
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
      const week = workingAgendaWeek();
      state.villagers = [
        {
          letterFontId: "caveat",
          characterId: "lina",
          incarnation: "lina-one",
          cardSnapshot: {
            id: "lina",
            revision: 1,
            sourceStatus: "available",
            name: "Lina",
            capturedAt: start.toISOString(),
          },
          addedAt: start.toISOString(),
          scheduleInfluence: influenceSettings(null),
          agenda: {
            routineSummary: "",
            day: [],
            week,
            routineProfile: routineProfileFromWeek(week),
            source: "village",
            generatedAt: start.toISOString(),
            activeDay: { dateKey: "2026-09-25", weekday: "Friday", blocks: week.Friday!, scheduleInformed: false },
          },
        } as never,
      ];
    });
    const saturday = new Date(2026, 8, 26, 8);
    assert.equal(await rollActiveAgendas(saturday), true);
    const saturdayBlocks = (await readVillageState()).villagers[0]!.agenda!.activeDay!.blocks;
    assert.equal((await readVillageState()).villagers[0]!.agenda!.activeDay!.scheduleInformed, false);
    await mutateVillageState((state) => {
      state.villagers[0]!.scheduleInfluence.enabled = true;
      state.villagers[0]!.agenda!.week!.Sunday[0]!.activity = "A new village plan";
    });
    assert.equal(await rollActiveAgendas(saturday), false, "a same-day toggle and regeneration do not roll early");
    assert.deepEqual((await readVillageState()).villagers[0]!.agenda!.activeDay!.blocks, saturdayBlocks);
    const sunday = new Date(2026, 8, 27, 8);
    assert.equal(await rollActiveAgendas(sunday), true);
    const activeSunday = (await readVillageState()).villagers[0]!.agenda!.activeDay!;
    assert.equal(activeSunday.dateKey, "2026-09-27");
    assert.equal(activeSunday.scheduleInformed, false);
    assert.ok(activeSunday.blocks.length > 0, "Owned Sunday still covers the day after an influence toggle");

    // A resident whose starter Agenda was never written still uses compact preparation.
    await mutateVillageState((state) => {
      state.villagers[0]!.agenda!.generatedAt = "";
    });
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
      retryBackgroundJob(agendaFailure.id, agendaFailure.attempt, "same-profile-retry", agendaFailure.instanceId),
      retryBackgroundJob(agendaFailure.id, agendaFailure.attempt, "same-profile-retry", agendaFailure.instanceId),
    ]);
    await settleBackgroundWork();
    assert.equal(agendaRequests.length, 2);
    await retryBackgroundJob(agendaFailure.id, agendaFailure.attempt, "same-profile-retry", agendaFailure.instanceId);
    await settleBackgroundWork();
    assert.equal(agendaRequests.length, 2, "lost retry responses do not repeat a successful request");
    assert.equal((await readVillageState()).villagers[0]!.agenda!.personalizationPending, false);
    agendaMode = false;

    // Housing decisions preserve ownership until the full elapsed day passes.
    await mutateVillageState(
      (state) => {
        state.villagers = [
          {
            letterFontId: "caveat",
            characterId: "housing-resident",
            incarnation: "housing-resident-one",
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
          ...[
            venueFixture({
              ...state.venues[0]!,
              id: "rosa-home",
              baseClasses: ["residence"],
              zones: undefined,
              spaces: undefined,
              residentIds: ["housing-resident"],

              name: "Rosa home",
              privateSpaces: [
                {
                  id: "private:housing-resident",
                  ownerId: "housing-resident",
                  name: "Bedroom",
                  purpose: "Rest",
                  description: "Rosa's old nook. A letter lies on the desk.",
                },
              ],
              description: "Rosa's little house.",
              occupancy: { playerHome: false, residentCharacterId: "housing-resident", homeKind: "small-home" },
              presentation: { image: null, x: 0.2, y: 0.2 },
            }),
            venueFixture({
              ...state.venues[0]!,
              id: "empty-venue",
              baseClasses: ["residence"],
              zones: undefined,
              spaces: undefined,
              residentIds: [],
              name: "The bakery",

              description: "A small bakery.",
              occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
              presentation: { image: null, x: 0.6, y: 0.6 },
            }),
          ],
          ...sharedVenuesFixture(),
        ];
        const home = state.venues[0]!;
        const nook = home.zones!.find((zone) => zone.ownerId === "housing-resident")!;
        initializeRoomContinuity(state, home.id, nook.id, nook.description, "original-nook", start.toISOString());
      },
      { memories: true },
    );
    await assert.rejects(
      () => updateVillageVenue("rosa-home", { presentation: { x: 0.8, y: 0.8 } }),
      /Project, natural gameplay, or REPAIR/u,
    );
    const decideAsResident = (approved: boolean) =>
      mutateVillageState((state) => {
        const move = state.residences[0];
        decideResidenceMove(
          state,
          move.characterId,
          approved,
          "villager",
          move.characterId,
          move.agreement!.scope,
          new Date(),
        );
      });
    await proposeVillageResidence("housing-resident", "empty-venue");
    await decideAsResident(false);
    assert.equal((await readVillageState()).residences.length, 0, "the villager can decline the player's request");
    await proposeVillageResidence("housing-resident", "empty-venue");
    await decideAsResident(true);
    const moving = await readVillageState();
    assert.equal(moving.residences[0]?.status, "moving");
    assert.equal(moving.venues[0]?.occupancy.residentCharacterId, "housing-resident");
    assert.ok(
      Date.parse(moving.residences[0]!.completesAt!) - Date.parse(moving.residences[0]!.approvedAt!) >=
        24 * 60 * 60_000,
    );
    await completeVillageResidence("housing-resident", false, new Date());
    assert.equal((await readVillageState()).venues[0]?.occupancy.residentCharacterId, "housing-resident");
    await completeVillageResidence("housing-resident", true, new Date());
    assert.equal((await readVillageState()).venues[1]?.occupancy.residentCharacterId, "housing-resident");
    const movedState = await readVillageState({ memories: true });
    assert.match(
      observableRoomDescription(movedState, "rosa-home", "private:housing-resident", new Date().toISOString()),
      /Rosa's old nook\. A letter lies on the desk/,
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
      villageSettings(movedState, { name: "", description: "", personaId: "", missing: false }).venues.some(
        (home) => home.residentIds?.includes("housing-resident") && home.name === "The bakery",
      ),
      "a move into a public venue remains in the home projection",
    );
    await proposeVillageResidence("housing-resident", "rosa-home", "villager");
    await decideVillageResidence("housing-resident", true, (await readVillageState()).residences[0].agreement!.scope);
    const dueAt = Date.parse((await readVillageState()).residences[0]!.completesAt!);
    await reconcileVillage({ now: new Date(dueAt + 1_000) });
    assert.equal(
      (await readVillageState()).venues[0]?.occupancy.residentCharacterId,
      "housing-resident",
      "normal reconciliation completes a villager-requested move after 24 hours",
    );
    const { agendaBlocksFor, agendaDateKey } =
      await import("../packages/villages/src/server/domain/rules/agenda-week.js");
    const { ZonedDate } = await import("../packages/villages/src/shared/helpers/zoned-date.js");
    const zone = "America/Los_Angeles";
    const date = (day: number) => new ZonedDate(new Date(Date.UTC(2026, 10, day, 20)), zone);
    const setToday = (day: number) => {
      wallOffset = date(day).getTime() - realNow();
    };
    setToday(6);
    await mutateVillageState(
      (state) => {
        const residents = ["Ari", "Mara"].map((name) => ({
          ...state.villagers[0]!,
          characterId: name,
          incarnation: name + "-1",
          agendaGeneration: undefined,
          cardSnapshot: {
            ...state.villagers[0]!.cardSnapshot,
            id: name,
            name,
            summary: `${name} values independence.`,
            personality: "Curious and inventive.",
          },
          agenda: agendaFixture({
            calendarVersion: 1,
            starterWeekFrom: agendaDateKey(date(1)),
            starterWeekThrough: agendaDateKey(date(7)),
            generatedAt: date(1).toISOString(),
            day: [
              {
                startMinute: 0,
                endMinute: 480,
                venueId: "",
                activity: "Sleeping",
                essential: true,
              },
              { startMinute: 480, endMinute: 1320, venueId: "", activity: "Reading", flexible: true },
              {
                startMinute: 1320,
                endMinute: 1440,
                venueId: "",
                activity: "Sleeping",
                essential: true,
              },
            ],
            plannedDays: {
              [agendaDateKey(date(8))]: [
                { startMinute: 0, endMinute: 1440, venueId: "", activity: "Sorting papers", flexible: true },
              ],
            },
          }),
        }));
        Object.assign(state, defaultVillageState(), {
          setupAt: date(1).toISOString(),
          foundedAt: date(1).toISOString(),
          simulatedThrough: date(6).toISOString(),
          timeZone: zone,
          seed: "weekly-refresh-fixture",
          backgroundPace: "quiet",
          villagers: residents,
        });
        delete state.returnCatchup;
        delete state.clock;
        delete state.narrative;
      },
      { memories: true },
    );
    await reconcileVillage({ now: date(6) });
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 0, "The starter week is kept.");

    setToday(7);
    await Promise.all([reconcileVillage({ now: date(7) }), reconcileVillage({ now: date(7) })]);
    await settleBackgroundWork();
    assert.equal(
      weeklyResponses,
      2,
      "Reconciliation requests once for each resident. " + JSON.stringify(await backgroundWorkSummaries()),
    );
    const firstWeek = await readVillageState();
    const restBlocks = [8, 9, 10, 11].map((day) =>
      agendaBlocksFor(firstWeek.villagers[0]!.agenda!, date(day))
        .filter(({ activity }) => ["Porch doze", "Quiet pause off-duty", "Afternoon catnap"].includes(activity))
        .map(({ activity, startMinute, endMinute }) => [activity, endMinute - startMinute]),
    );
    assert.deepEqual(restBlocks, [
      [["Porch doze", 30]],
      [["Quiet pause off-duty", 45]],
      [["Afternoon catnap", 60]],
      [],
    ]);
    for (const resident of firstWeek.villagers) {
      const agenda = resident.agenda!;
      assert.equal(agenda.activeDay?.dateKey, agendaDateKey(date(7)));
      assert.ok(!agenda.activeDay?.blocks.some(({ activity }) => activity.includes("pursuit")));
      const timingLayouts = new Set<string>();
      for (let day = 8; day <= 14; day++) {
        const rows = agendaBlocksFor(agenda, date(day));
        assert.deepEqual(
          rows
            .filter(({ activity }) => activity === "Sleeping")
            .map(({ startMinute, endMinute }) => [startMinute, endMinute]),
          [
            [0, 480],
            [1320, 1440],
          ],
        );
        assert.ok(rows.filter(({ activity }) => activity.startsWith(`${resident.characterId} pursuit 1/`)).length >= 3);
        timingLayouts.add(JSON.stringify(rows.map(({ startMinute, endMinute }) => [startMinute, endMinute])));
      }
      assert.equal(timingLayouts.size, 7, "The seven saved days have different timing while rest stays fixed.");
    }

    const { applyWeeklyAgenda, weeklyAgendaSlots } =
      await import("../packages/villages/src/server/domain/rules/weekly-agenda.js");
    const changed = structuredClone(firstWeek);
    const resident = changed.villagers[0]!;
    const offered = [date(9), date(10), date(11)].flatMap((day) =>
      weeklyAgendaSlots(resident.agenda!, day, resident.characterId),
    );
    for (const { startMinute, endMinute } of offered) {
      assert.ok(endMinute - startMinute >= 30 && endMinute - startMinute <= 240);
    }
    resident.agenda!.repairedDays = [agendaDateKey(date(10))];
    resident.agenda!.reservations = (["work", "project", "social", "appointment"] as const).map((source, index) => ({
      source,
      id: source,
      dateKey: agendaDateKey(date(9)),
      startMinute: 540 + index * 120,
      endMinute: 600 + index * 120,
      venueId: "",
      activity: source,
      replaces: "flexible",
    }));
    applyWeeklyAgenda(
      changed,
      resident,
      date(8),
      offered,
      offered.map(({ date: key }) => ({
        activity: "Work on a woodcut",
        venueId: key === agendaDateKey(date(11)) ? "removed-venue" : "",
      })),
    );
    const live = agendaBlocksFor(resident.agenda!, date(9));
    for (const reserved of resident.agenda!.reservations) {
      assert.ok(
        live.some(
          (row) =>
            row.activity === reserved.activity &&
            row.startMinute === reserved.startMinute &&
            row.endMinute === reserved.endMinute,
        ),
      );
    }
    assert.ok(live.some(({ activity }) => activity === "Work on a woodcut"));
    for (const day of [date(10), date(11)]) {
      assert.deepEqual(agendaBlocksFor(resident.agenda!, day), agendaBlocksFor(firstWeek.villagers[0]!.agenda!, day));
    }
    setToday(8);
    await reconcileVillage({ now: date(8) });
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 2, "A normal day change activates planned activities locally.");
    assert.ok(
      (await readVillageState()).villagers[0]!.agenda?.activeDay?.blocks.some(({ activity }) =>
        activity.includes("pursuit 1/"),
      ),
    );

    setToday(14);
    await reconcileVillage({ now: date(14) });
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 4, "The last covered day prepares the next seven days for each resident.");
    const nextWeek = await readVillageState();
    for (const resident of nextWeek.villagers) {
      for (let day = 15; day <= 21; day++) {
        const rows = agendaBlocksFor(resident.agenda!, date(day));
        assert.ok(rows.filter(({ activity }) => activity.startsWith(`${resident.characterId} pursuit 2/`)).length >= 3);
      }
    }

    incompleteWeek = true;
    setToday(21);
    await reconcileVillage({ now: date(21) });
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 6, "An incomplete reply spends only one automatic request per resident.");
    const incomplete = (await backgroundWorkSummaries()).find((job) => job.kind === "weekly-agenda");
    assert.match(incomplete?.error ?? "", /too few usable activities/i);
    assert.ok(
      !(await readVillageState()).villagers.some((resident) =>
        agendaBlocksFor(resident.agenda!, date(22)).some(({ activity }) => activity.includes("pursuit 3/")),
      ),
    );
    setToday(28);
    incompleteWeek = false;
    minimumWeeklyReplyTokens = 4_500;
    await mutateVillageState((state) => {
      const agenda = state.villagers.find(({ characterId }) => characterId === "Ari")!.agenda!;
      agenda.plannedDays![agendaDateKey(date(29))] = [
        { startMinute: 0, endMinute: 1440, venueId: "", activity: "Sorting papers", flexible: true },
      ];
    });
    await clearVillagerAgenda("Ari", "personal-week");
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 7);
    const personal = (await readVillageState()).villagers.find((row) => row.characterId === "Ari")?.agenda;
    assert.deepEqual(personal?.manualWeek, {
      actionId: "personal-week",
      from: agendaDateKey(date(29)),
      through: agendaDateKey(date(35)),
    });
    for (let day = 29; day <= 35; day++) {
      assert.deepEqual(
        agendaBlocksFor(personal!, date(day))
          .filter(({ activity }) => activity === "Sleeping")
          .map(({ startMinute, endMinute }) => [startMinute, endMinute]),
        [
          [0, 480],
          [1320, 1440],
        ],
        "Manual regeneration preserves the restored overnight window on every date",
      );
    }

    setToday(29);
    await reconcileVillage({ now: date(29) });
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 8, "The next scheduled request prepares Mara's week.");
    const refreshed = await readVillageState();
    for (let day = 29; day <= 35; day++) {
      assert.deepEqual(
        agendaBlocksFor(refreshed.villagers[0]!.agenda!, date(day)),
        agendaBlocksFor(personal!, date(day)),
      );
      assert.ok(
        agendaBlocksFor(refreshed.villagers[1]!.agenda!, date(day)).some(({ activity }) =>
          activity.startsWith("Mara pursuit 4/"),
        ),
      );
    }

    setToday(35);
    await mutateVillageState((state) => {
      state.villagers = state.villagers.filter(({ characterId }) => characterId === "Ari");
    });
    await villageBackgroundPresence("visible-story-fixture", false);
    await reconcileVillage({ now: date(35), returning: true });
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 8, "A queued automatic week waits for browser presence.");
    await assert.rejects(
      clearVillagerAgenda("Ari", "later-personal-week"),
      /weekly Agenda preparation is already in progress/i,
    );
    await villageBackgroundPresence("visible-story-fixture", true);
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 9, "The pending automatic job resumes after the player returns.");

    setToday(42);
    recentSuggestion = agendaBlocksFor((await readVillageState()).villagers[0]!.agenda!, date(42)).find(
      ({ activity }) => activity.startsWith("Ari pursuit 5/"),
    )!.activity;
    repeatSameDay = true;
    await reconcileVillage({ now: date(42) });
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 10, "Same-day repetition uses only the scheduled request.");
    const repeated = (await backgroundWorkSummaries()).find(
      (job) => job.kind === "weekly-agenda" && job.subjectId === "Ari-1",
    )!;
    assert.equal(repeated.status, "completed");
    assert.equal(repeated.requests, 1);
    const recoveredWeek = (await readVillageState()).villagers[0]!.agenda!;
    const firstDay = agendaBlocksFor(recoveredWeek, date(43));
    assert.equal(firstDay.filter(({ activity }) => activity === "Ari pursuit 6/1").length, 1);
    assert.ok(firstDay.some(({ activity }) => activity === "Ari pursuit 6/3"));
    const secondDay = agendaBlocksFor(recoveredWeek, date(44));
    assert.ok(secondDay.some(({ activity }) => activity.startsWith("Ari pursuit 6/")));
    assert.ok(
      secondDay.every(
        ({ activity }) => !["Ari pursuit 6/1", recentSuggestion, "Try an unavailable venue"].includes(activity),
      ),
    );
    assert.ok(agendaBlocksFor(recoveredWeek, date(49)).some(({ activity }) => activity.startsWith("Ari pursuit 6/")));

    setToday(43);
    repeatSameDay = false;
    weeklyOutputLimit = 1_040;
    await clearVillagerAgenda("Ari", "limited-week");
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 11, "A truncated manual week uses one request.");
    const truncated = (await backgroundWorkSummaries()).find(
      (job) => job.kind === "agenda" && job.subjectId === "Ari",
    )!;
    assert.equal(truncated.failure?.cause, "output_limit");
    assert.equal(truncated.failure?.requestedOutputTokens, 1_040);
    assert.ok(
      agendaBlocksFor((await readVillageState()).villagers[0]!.agenda!, date(44)).some(({ activity }) =>
        activity.startsWith("Ari pursuit 6/"),
      ),
    );

    const saved = documentsByKey.get(`villages::${truncated.id}`);
    delete saved.data.input.residents[0].brief;
    weeklyOutputLimit = 12_288;
    await Promise.all([
      retryBackgroundJob(truncated.id, truncated.attempt, "retry-with-room", truncated.instanceId),
      retryBackgroundJob(truncated.id, truncated.attempt, "retry-with-room", truncated.instanceId),
    ]);
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 12, "One retry with sufficient room saves the entire week.");
    const complete = (await readVillageState()).villagers[0]!.agenda!;
    for (let day = 44; day <= 50; day++)
      assert.ok(agendaBlocksFor(complete, date(day)).some(({ activity }) => activity.startsWith("Ari pursuit 7/")));

    setToday(44);
    repetitiveWeek = true;
    await clearVillagerAgenda("Ari", "repetitive-week");
    await settleBackgroundWork();
    assert.equal(weeklyResponses, 13, "A repetitive reply spends only one request.");
    const repetitive = (await backgroundWorkSummaries()).find(
      (job) => job.kind === "agenda" && job.subjectId === "Ari",
    );
    assert.match(repetitive?.error ?? "", /not enough variety/i);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.manualWeek?.actionId, "limited-week");
  } finally {
    Date.now = realNow;
    stopWork();
    await settleBackgroundWork();
    release();
  }

  console.log("Villages continuous time regression: exact time, restart, idempotence, failure and timer passed.");
}

await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
