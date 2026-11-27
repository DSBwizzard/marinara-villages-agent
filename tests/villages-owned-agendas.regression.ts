import { sharedVenuesFixture } from "./helpers/venues.fixture.js";
import { defaultVillageFixture as defaultVillageState } from "./helpers/venues.fixture.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { applyWorldRepair, worldRepairRecords } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { planRoutineDays } from "../packages/villages/src/server/domain/rules/resident-agenda.js";
import { sameSceneRoutine } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import type { VenueScene } from "../packages/villages/src/server/domain/models/scene-model.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  routineProfileFromWeek,
  influenceSettings,
  routineDay,
  validateRoutineDay,
} from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { villagePresence } from "../packages/villages/src/server/domain/rules/village-projections.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { routineRevision, routineRevisionMatches } from "../packages/villages/src/server/domain/rules/wish-policy.js";
import {
  buildVillageAgendas,
  clearVillagerAgenda,
} from "../packages/villages/src/server/features/residents/resident-agendas.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

import {
  agendaBlocksFor,
  agendaDateKey,
  completeAgendaWeek,
} from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { parseCompactFounding } from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { rollActiveAgendas } from "../packages/villages/src/server/features/residents/resident-agendas.js";
import { previewVillageBurst } from "../packages/villages/src/server/features/settings/usage-preview.js";
import { reconcileVillage } from "../packages/villages/src/server/features/world/village.js";
import {
  backgroundWorkSummaries,
  settleBackgroundWork,
  startBackgroundWork,
} from "../packages/villages/src/server/jobs/background-work.js";

const today = new Date(),
  dateKey = agendaDateKey(today),
  weekday = VILLAGE_WEEKDAYS[(today.getDay() + 6) % 7]!;
const card = {
  id: "a",
  name: "Ada",
  summary: "An autonomous gardener",
  description: "Grows herbs",
  personality: "Patient",
  tags: [],
};
const palette = ["Tending herbs", "Reading", "Walking", "Painting", "Playing music", "Resting"].map((activity) => ({
  activity,
  venue: 0,
  status: "idle",
  flexible: true,
  essential: false,
  duration: 180,
  parts: [0, 1, 2, 3],
}));
const payload = {
  routine: "Ada enjoys herbs, reading and music.",
  palette,
  rhythm: [],
};
const context = {
  village: "Willow",
  setting: "Quiet valley",
  card,
  home: "Home",
  venues: [],
  lore: [],
  wishes: [],
};
const block = {
  startMinute: 0,
  endMinute: 1440,
  venueId: "",
  zoneId: undefined,
  activity: "Reading",
  flexible: true,
};
const ownedWeek = Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [block]]));
const raw = {
  ...defaultVillageState(),

  seed: "owned-test",
  setting: "Quiet valley",
  backgroundPace: "off",
  selectedLorebookIds: [],
  venues: [...[], ...sharedVenuesFixture()],
  villagers: [
    {
      letterFontId: "caveat",
      characterId: "a",
      incarnation: "one",
      addedAt: "2026-09-01",
      scheduleInfluence: influenceSettings({ enabled: true }),
      cardSnapshot: { ...card, revision: 1, sourceStatus: "available", capturedAt: "2026-09-01T00:00:00.000Z" },
      agenda: {
        generatedAt: "2026-09-01T00:00:00.000Z",
        routineSummary: "Existing life",
        week: ownedWeek,
        routineProfile: routineProfileFromWeek(ownedWeek),
        day: [],
        activeDay: { dateKey, weekday, blocks: [block], scheduleInformed: true },
      },
    },
  ],
};
const records = new Map<string, any>();

let calls = 0,
  fail = false,
  lastOptions: any;
const release = configureVillagesRuntime({
  isDebugAgentsEnabled: () => false,
  logger: { debugOverride() {}, debug() {}, warn() {}, error() {}, info() {} },
  getAgentConfig: async () => ({ connectionId: "mock" }),
  persistence: {
    documents: villageFixtureDocuments({
      async getById(_package: string, id: string) {
        return structuredClone(records.get(id) ?? null);
      },
      async list(_package: string, kind: string) {
        return structuredClone([...records.values()].filter((record) => record.kind === kind));
      },
      async create(value: any) {
        const saved = { ...structuredClone(value), revision: 1 };
        records.set(value.id, saved);
        return saved;
      },
      async update(value: any) {
        const saved = {
          ...records.get(value.id),
          ...structuredClone(value),
          revision: (records.get(value.id)?.revision ?? 0) + 1,
        };
        records.set(value.id, saved);
        return saved;
      },
    }),
  },
  resources: {
    async listCharacters() {
      return [
        {
          id: "a",
          name: "Ada",
          data: { ...card, extensions: { conversationSchedule: { routineSummary: "Retired schedule" } } },
        },
      ];
    },
  },
  languageModels: {
    async resolveForRequest() {
      return {
        connectionId: "mock",
        model: "mock",
        name: "Mock",
        maxContext: 32000,
        maxOutputTokens: 4000,
        fitContext(messages: any, options: any) {
          return { messages, ...options };
        },
        async chatComplete(_messages: any, options: any) {
          calls++;
          lastOptions = options;
          return {
            content: fail ? "{invalid" : JSON.stringify(payload),
            usage: { promptTokens: 200, completionTokens: 100, totalTokens: 300 },
            finishReason: "stop",
          };
        },
      };
    },
  },
} as any);

async function main() {
  const repairedWorld = coerceVillageState(raw);
  repairedWorld.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const repairAgenda = unwrittenVillageAgenda(today);
  const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12);
  const followingDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12);
  const chosenDate = agendaDateKey(nextDay);
  const ordinary = repairAgenda.day[0]!;
  repairAgenda.plannedDays = {
    [chosenDate]: [
      { ...ordinary, endMinute: 540, activity: "Dawn walk", flexible: true, essential: true },
      { ...ordinary, startMinute: 540, activity: "Reading", flexible: true },
    ],
    [agendaDateKey(followingDay)]: [{ ...ordinary, activity: "Painting", flexible: true }],
  };
  repairAgenda.reservations = [
    {
      id: "appointment",
      source: "appointment",
      replaces: "flexible",
      dateKey: chosenDate,
      startMinute: 600,
      endMinute: 660,
      activity: "Meet at the gate",
      venueId: "",
    },
  ];
  repairedWorld.villagers[0]!.agenda = repairAgenda;
  const original = structuredClone(repairAgenda);
  const rows = worldRepairRecords(repairedWorld, false, "a", today.toISOString()).filter((row) => row.agendaDay);
  assert.equal(rows.length, 7);
  assert.equal(rows[0]!.agenda?.today, true);
  assert.ok(rows[0]!.actions.some((action) => action.id === "correct"));
  const repairRecord = rows.find((row) => row.id === JSON.stringify(["agenda", "a", chosenDate]))!;
  assert.ok(repairRecord.source.some((text) => text.includes("10:00–11:00, Meet at the gate")));
  const request = (values: Record<string, string>, action = "correct") => ({ action, values }) as any;
  assert.throws(
    () => applyWorldRepair(repairedWorld, repairRecord, request({ "start:1": "08:00" }), today.toISOString()),
    /overlap/,
  );
  assert.throws(
    () => applyWorldRepair(repairedWorld, repairRecord, request({ "start:1": "9:72" }), today.toISOString()),
    /24-hour/,
  );
  assert.throws(
    () => applyWorldRepair(repairedWorld, rows[0]!, request({ "activity:0": "Quiet crafting" }), nextDay.toISOString()),
    /rolled over/,
  );
  for (const [start, end, message] of [
    ["10:15", "10:45", /overlaps reserved time/],
    ["07:30", "08:00", /essential activity/],
  ] as const)
    assert.throws(
      () =>
        applyWorldRepair(
          repairedWorld,
          repairRecord,
          request(
            {
              "activity:new": "Water the plants",
              "start:new": start,
              "end:new": end,
            },
            "add-activity",
          ),
          today.toISOString(),
        ),
      message,
    );
  assert.deepEqual(repairAgenda, original, "Rejected agenda repairs leave the saved plan intact");
  applyWorldRepair(
    repairedWorld,
    repairRecord,
    request({ "activity:1": "Quiet crafting", "start:1": "09:30" }),
    today.toISOString(),
  );
  const repairedReload = coerceVillageState(JSON.parse(JSON.stringify(repairedWorld)));
  const savedAgenda = repairedReload.villagers[0]!.agenda!;
  planRoutineDays(repairedReload, today);
  assert.deepEqual(
    savedAgenda.activeDay,
    coerceVillageState({ ...repairedWorld, villagers: [{ ...repairedWorld.villagers[0], agenda: original }] })
      .villagers[0]!.agenda!.activeDay,
    "Repair preserves today's admitted plan",
  );
  assert.deepEqual(savedAgenda.repairedDays, [chosenDate]);
  assert.equal(
    savedAgenda.plannedDays![chosenDate]!.find((block) => block.startMinute === 570)?.activity,
    "Quiet crafting",
  );
  assert.equal(savedAgenda.plannedDays![agendaDateKey(followingDay)]![0]!.activity, "Painting");
  assert.deepEqual(
    savedAgenda.routineProfile,
    coerceVillageState({ ...repairedWorld, villagers: [{ ...repairedWorld.villagers[0], agenda: original }] })
      .villagers[0]!.agenda!.routineProfile,
  );
  assert.deepEqual(
    agendaBlocksFor(repairAgenda, nextDay).filter((block) => block.commitmentId),
    agendaBlocksFor(original, nextDay).filter((block) => block.commitmentId),
  );
  const noon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const captured = {
    startedAt: noon.toISOString(),
    continuity: {
      facts: {
        villagers: structuredClone(repairedWorld.villagers),
      },
    },
  } as VenueScene;
  applyWorldRepair(
    repairedWorld,
    rows[0]!,
    request(
      {
        "activity:new": "Water the plants",
        "start:new": "13:00",
        "end:new": "14:00",
      },
      "add-activity",
    ),
    noon.toISOString(),
  );
  assert.equal(
    sameSceneRoutine(repairedWorld, captured, "a", noon),
    true,
    "A later insertion keeps the recorded movement during the ongoing ordinary activity",
  );
  assert.equal(
    sameSceneRoutine(repairedWorld, captured, "a", new Date(+noon + 90 * 60000)),
    false,
    "The resident takes up the inserted activity when it starts",
  );
  assert.equal(
    sameSceneRoutine(repairedWorld, captured, "a", new Date(+noon + 150 * 60000)),
    false,
    "Returning to the ordinary activity after an interruption does not retain old movement",
  );
  const capturedAfterAdd = {
    ...captured,
    continuity: {
      facts: {
        villagers: structuredClone(repairedWorld.villagers),
      },
    },
  } as VenueScene;
  const beforeAdd = coerceVillageState({
    ...repairedWorld,
    villagers: [{ ...repairedWorld.villagers[0], agenda: original }],
  });
  assert.equal(
    sameSceneRoutine(beforeAdd, capturedAfterAdd, "a", noon),
    true,
    "Undo keeps recorded movement within the surviving activity",
  );
  assert.equal(calls, 0, "Manual Agenda repair never purchases generation");

  const currentWorld = coerceVillageState(raw),
    resident = currentWorld.villagers[0]!;
  assert.deepEqual(resident.agenda!.week, completeAgendaWeek(ownedWeek, ownedWeek), "Exact current owned week reloads");
  assert.deepEqual(
    resident.agenda!.activeDay?.blocks,
    completeAgendaWeek({ Monday: [block] }, ownedWeek).Monday,
    "today is preserved separately",
  );
  assert.equal(resident.agenda!.personalizationPending, false);
  assert.equal(resident.scheduleInfluence!.enabled, true);
  assert.deepEqual(coerceVillageState(currentWorld), currentWorld, "Current-world reload is stable");

  const bookedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 19, 12);
  const bookedKey = agendaDateKey(bookedDate);
  const legacy = structuredClone({ ...raw, setupAt: today.toISOString() });
  const legacyAgenda = legacy.villagers[0]!.agenda;
  legacyAgenda.week = completeAgendaWeek(
    Object.fromEntries(VILLAGE_WEEKDAYS.map((name) => [name, [{ ...block, activity: "Fixed duty", essential: true }]])),
    ownedWeek,
  );
  const savedExactWeek = coerceVillageState({
    ...legacy,
    villagers: [{ ...legacy.villagers[0], agenda: { ...legacyAgenda, week: undefined, activeDay: undefined } }],
  }).villagers[0]!.agenda!;
  assert(agendaBlocksFor(savedExactWeek, bookedDate).some((part) => part.activity === "Reading"));
  const legacyPlayer = continuityActor(coerceVillageState(legacy), "player")!.incarnation;
  legacy.residentPlans.appointments = [
    {
      id: "booked-far-ahead",
      resident: { id: "a", incarnation: "one" },
      playerIncarnation: legacyPlayer,
      time: { date: bookedKey, startMinute: 720, endMinute: 780, venueId: legacy.venues[0]!.id },
      activity: "Lunchtime meetup",
    },
  ];
  const migrated = coerceVillageState(legacy);
  const migratedAgenda = migrated.villagers[0]!.agenda!;
  assert(agendaBlocksFor(migratedAgenda, bookedDate).some((part) => part.activity === "Lunchtime meetup"));
  assert(
    agendaBlocksFor(coerceVillageState(migrated).villagers[0]!.agenda!, bookedDate).some(
      (part) => part.activity === "Lunchtime meetup",
    ),
  );

  const previousDigest = routineRevision(raw.villagers[0]!.agenda as any);
  assert.ok(routineRevisionMatches(resident.agenda!, previousDigest), "exact current routine revision remains valid");
  assert.equal(
    routineRevisionMatches(resident.agenda!, "0".repeat(64)),
    false,
    "stale social revisions are not blessed",
  );
  const changedRoutine = structuredClone(resident.agenda!);
  changedRoutine.week!.Monday![0]!.activity = "Changed routine";
  assert.equal(
    routineRevisionMatches(changedRoutine, previousDigest),
    false,
    "a real routine change invalidates the continuation",
  );
  for (const fields of [{ essential: true }, { commitmentId: "committed" }]) {
    const protectedBlock = {
      ...block,
      reason: undefined,
      status: undefined,
      activity: "Keeping a commitment",
      startMinute: 0,
      endMinute: 720,
      ...fields,
    };
    const restBlock = { ...block, activity: "Resting", startMinute: 720, endMinute: 1440, flexible: false };
    const baseWeek = Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [protectedBlock, restBlock]]));
    const profile = routineProfileFromWeek(baseWeek as any);
    const influence = {
      ...resident.agenda!.scheduleInfluenceSnapshot,
      rhythms: [{ weekday: "Monday", startMinute: 660, endMinute: 1440 }],
    } as any;
    const day = routineDay(profile, "seed", new Date(2026, 9, 5, 12), influence, influenceSettings({ enabled: true }));
    assert.equal(day[0]!.endMinute, 720, "rest preference cannot shift essential or committed time");
    const optional = { ...block, activity: "Optional reading", startMinute: 0, endMinute: 1440 };
    profile.baseWeek = Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [optional]]));
    profile.activities = [{ ...profile.activities[0]!, ...fields }];
    const replacement = routineDay(profile, "seed", new Date(2026, 9, 5, 12));
    assert.ok(
      replacement.every((row) => row.activity === "Optional reading"),
      "protected palette activity cannot replace optional time",
    );
  }
  assert.equal(influenceSettings(null).enabled, false, "new residents opt in");
  const owned = parseCompactFounding(payload, context as any).agenda;
  assert.equal(owned.routineProfile!.rhythm.length, 0, "nonhuman residents need no imposed sleep");
  for (const invalid of [
    { activityPaletteIndex: "0" },
    { activityPaletteIndex: 6 },
    { activityPaletteIndex: -1 },
    { activityPaletteIndex: 0.5 },
    {},
  ])
    assert.throws(
      () =>
        parseCompactFounding(
          { ...payload, rhythm: [{ startMinute: 1320, endMinute: 360, ...invalid }] },
          context as any,
        ),
      /rest pattern/,
    );
  for (const invalid of [
    { venue: "0" },
    { venueNumber: "0" },
    { venue: 1 },
    { venueNumber: -1 },
    { venueNumber: 0.5 },
    { venue: null },
    {},
  ]) {
    const { venue: _venue, ...row } = palette[0]!;
    assert.throws(
      () =>
        parseCompactFounding({ ...payload, palette: [{ ...row, ...invalid }, ...palette.slice(1)] }, context as any),
      /venue/,
    );
  }
  for (const activity of ["", " ", "private detail".repeat(20)])
    assert.throws(
      () =>
        parseCompactFounding(
          { ...payload, palette: [{ ...palette[0], activity }, ...palette.slice(1)] },
          context as any,
        ),
      /1–160/,
    );
  resident.agenda = owned;
  assert.throws(
    () =>
      parseCompactFounding(
        {
          ...payload,
          rhythm: [
            { startMinute: 0, endMinute: 400, activity: 0 },
            { startMinute: 300, endMinute: 500, activity: 1 },
          ],
        },
        context as any,
      ),
    /overlap/,
  );
  const days = Array.from({ length: 14 }, (_, i) => new Date(2026, 9, 5 + i, 12));
  const activities = days.map((day) => agendaBlocksFor(owned, day).map((row) => row.activity));
  assert(
    new Set(activities.map((part) => JSON.stringify(part))).size > 7,
    "Ordinary activities vary across days and weeks",
  );
  assert.deepEqual(agendaBlocksFor(owned, days[0]!), agendaBlocksFor(owned, days[0]!));
  assert.equal(resident.agenda!.calendarVersion, 1);
  assert(migratedAgenda.plannedDays?.[bookedKey]?.length, "Migration pins the ordinary calendar for existing bookings");

  records.set("villages-village", {
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    data: coerceVillageState(raw),
    revision: 1,
  });
  const stop = startBackgroundWork();
  try {
    await rollActiveAgendas(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12));
    await rollActiveAgendas(today);
    await buildVillageAgendas();
    await buildVillageAgendas();
    assert.equal(calls, 0, "Calendar rollover and Agenda reads cost no requests");
    assert.equal((await previewVillageBurst({ action: "agenda", characterId: "a" })).requests, 1);
    await mutateVillageState((value) => {
      value.villagers[0]!.agenda!.activeDay!.scheduleInformed = true;
    });
    const persisted = await readVillageState({ memories: true });
    assert.ok(
      Object.keys(persisted.villagers[0]!.agenda!.plannedDays!).length >= 7,
      "resolved future days survive coercion/reload",
    );
    assert.deepEqual(
      coerceVillageState(persisted).villagers[0]!.agenda!.plannedDays,
      persisted.villagers[0]!.agenda!.plannedDays,
    );
    const before = persisted.villagers[0]!.agenda!.activeDay;
    await clearVillagerAgenda("a", "one-action");
    await settleBackgroundWork();
    assert.equal(
      calls,
      1,
      "one generation request, no translation afterwards: " + JSON.stringify(await backgroundWorkSummaries()),
    );
    assert.ok(
      (await backgroundWorkSummaries()).some((job) => job.kind === "agenda" && job.status === "completed"),
      "the valid response actually completes Routine generation",
    );
    assert.ok(lastOptions.maxTokens <= 4000);
    assert.equal(lastOptions.reasoningEffort, "none");
    assert.deepEqual(
      (await readVillageState({ memories: true })).villagers[0]!.agenda!.activeDay,
      before,
      "regeneration preserves today",
    );
    await clearVillagerAgenda("a", "one-action");
    await settleBackgroundWork();
    assert.equal(calls, 1);
    const next = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12);
    await rollActiveAgendas(next);
    const nextDay = (await readVillageState({ memories: true })).villagers[0]!.agenda!.activeDay;
    await rollActiveAgendas(next);
    assert.deepEqual((await readVillageState({ memories: true })).villagers[0]!.agenda!.activeDay, nextDay);
    assert.equal(calls, 1);
    const state = await readVillageState({ memories: true }),
      actor = state.villagers[0]!;
    actor.agenda!.activeDay = {
      dateKey: agendaDateKey(next),
      weekday: VILLAGE_WEEKDAYS[(next.getDay() + 6) % 7]!,
      blocks: [block],
      scheduleInformed: false,
    };
    const safeVenue = venueFixture({
      spaces: [{ id: "other", description: "A place in the community.", image: null }],
      residentIds: [null].filter((id) => typeof id === "string" && !!id),
      id: "library",
      name: "Library",
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      presentation: { image: null, x: 0.2, y: 0.2 },
    });
    const access = coerceVillageState({
      ...defaultVillageState(),

      ...raw,
      venues: [...[safeVenue], ...sharedVenuesFixture()],
    });
    const destination = { ...block, venueId: "library", zoneId: "exterior" };
    const libraryActivity = validateRoutineDay([{ ...destination, zoneId: undefined }], resident, access)[0]!;
    assert.notEqual(
      libraryActivity.zoneId,
      "exterior",
      "unspecified routine destinations resolve to an appropriate accessible Zone",
    );
    access.venues[0]!.constructionStatus = "worksite";
    assert.equal(validateRoutineDay([destination], resident, access)[0]!.venueId, "");
    const crowd = coerceVillageState({
      ...defaultVillageState(),

      ...raw,
      venues: [...[safeVenue], ...sharedVenuesFixture()],
      villagers: Array.from({ length: 6 }, (_, i) => ({
        letterFontId: "caveat",
        ...raw.villagers[0],
        characterId: "crowd" + i,
        cardSnapshot: { ...raw.villagers[0]!.cardSnapshot, id: "crowd" + i, name: "Crowd " + i },
        agenda: {
          ...raw.villagers[0]!.agenda,
          activeDay: undefined,
          week: Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [libraryActivity]])),
          routineProfile: routineProfileFromWeek(
            Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [libraryActivity]])),
          ),
        },
      })),
    });
    records.set("villages-village", { ...records.get("villages-village"), data: crowd });
    await rollActiveAgendas(today);
    const capacity = await readVillageState({ memories: true });
    const withoutLibrary = structuredClone(capacity);
    const outside = withoutLibrary.villagers.at(-1)!;
    delete outside.agenda!.plannedDays?.[dateKey];
    outside.agenda!.activeDay!.blocks = [block];
    const outsideDay = worldRepairRecords(withoutLibrary, false, outside.characterId, today.toISOString()).find(
      (row) => row.agenda?.today,
    )!;
    assert.throws(
      () =>
        applyWorldRepair(
          withoutLibrary,
          outsideDay,
          request(
            {
              "activity:new": "Read at the Library",
              "start:new": "12:00",
              "end:new": "13:00",
              "venue:new": "library",
            },
            "add-activity",
          ),
          today.toISOString(),
        ),
      /location is full/,
    );
    for (let minute = 0; minute < 1440; minute += 30) {
      const positions = [...villagePresence(capacity, minute, today).values()];
      assert.equal(positions.length, 6);
      for (const position of positions)
        assert.ok(
          positions.filter((other) => other.id === position.id && other.zoneId === position.zoneId).length <= 4,
          "all agenda overlays resolve to capacity-bounded Zones",
        );
    }
    assert.equal(calls, 1);
    records.set("villages-village", { ...records.get("villages-village"), data: state });
    fail = true;
    await clearVillagerAgenda("a", "bad-output");
    await settleBackgroundWork();
    assert.equal(calls, 3, "malformed output receives one eligible replacement request");
    const failed = (await backgroundWorkSummaries()).find((job) => job.kind === "agenda" && job.status === "failed");
    assert.equal(failed?.attempt, 3, "successful generation, explicit regeneration, then one automatic retry");
    assert.equal(failed?.requests, 2);
    await buildVillageAgendas();
    await settleBackgroundWork();
    assert.equal(calls, 3, "local reads cannot purchase another retry after the allowance is spent");
    assert.ok((await backgroundWorkSummaries()).some((job) => job.kind === "agenda" && job.status === "failed"));
    assert.ok(agendaBlocksFor((await readVillageState({ memories: true })).villagers[0]!.agenda!, next).length);
    await mutateVillageState((value) => {
      value.villagers[0]!.agenda = null;
      value.backgroundPace = "off";
      value.setupAt = today.toISOString();
    });
    await reconcileVillage({ now: today });
    await settleBackgroundWork();
    assert.equal(calls, 3, "Missing agendas cannot admit a paid request");
    assert.equal((await readVillageState({ memories: true })).villagers[0]!.agenda, null);
  } finally {
    stop();
    release();
  }
  console.log("Villages Agenda regressions passed: date variation, date repairs, capacity, and generation recovery.");
}
await main();
