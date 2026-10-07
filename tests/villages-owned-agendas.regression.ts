import {
  clearVillagerAgenda,
  setVillagerScheduleInfluence,
  buildVillageAgendas,
} from "../packages/villages/src/server/features/residents/resident-agendas.js";
import assert from "node:assert/strict";
import {
  influenceSettings,
  deriveInfluence,
  routineDay,
  compressAgendaBlocks,
  addRoutineIdea,
  agendaPromptDay,
  validateRoutineDay,
} from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVillageState, mutateVillageState } from "../packages/villages/src/server/features/world/village-store.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { reconcileVillage } from "../packages/villages/src/server/features/world/village.js";
import { rollActiveAgendas } from "../packages/villages/src/server/features/residents/agenda-roll.js";
import {
  startBackgroundWork,
  settleBackgroundWork,
  backgroundWorkSummaries,
} from "../packages/villages/src/server/jobs/background-work.js";
import { parseCompactFounding } from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import { previewVillageBurst } from "../packages/villages/src/server/features/settings/usage-preview.js";
import { agendaDateKey, agendaBlocksFor } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { wishSlots } from "../packages/villages/src/server/domain/rules/wish-lifecycle-rules.js";
import { resetNativeScheduleCache } from "../packages/villages/src/server/adapters/engine/native-schedules.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";

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
  duration: 180,
  parts: [0, 1, 2, 3],
}));
const payload = {
  routine: "Ada enjoys herbs, reading and music.",
  wishes: [],
  palette,
  days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 2]),
  rhythm: [],
};
const context = {
  village: "Willow",
  setting: "Quiet valley",
  card,
  home: "Home",
  venues: [],
  lore: [],
  completedWishes: [],
  activeWishes: [],
  schedule: null,
};
const block = {
  startMinute: 0,
  endMinute: 1440,
  venueId: "",
  zoneId: undefined,
  activity: "Reading",
  reason: "A long repetitive explanation",
  status: "idle" as const,
  flexible: true,
};
const legacyWeek = Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [block]]));
const translated = Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [{ ...block, activity: "Tending herbs" }]]));
const raw = {
  seed: "owned-test",
  setting: "Quiet valley",
  storyPace: "off",
  selectedLorebookIds: [],
  venues: [],
  villagers: [
    {
      characterId: "a",
      addedAt: "2026-09-01",
      ingestSchedule: true,
      cardSnapshot: { ...card, revision: 1, sourceStatus: "available", capturedAt: "2026-09-01T00:00:00.000Z" },
      agenda: {
        wishes: [],
        generatedAt: "2026-09-01T00:00:00.000Z",
        routineSummary: "Existing life",
        week: legacyWeek,
        scheduleWeek: translated,
        day: [],
        activeDay: { dateKey, weekday, blocks: [block], scheduleInformed: true },
      },
    },
  ],
};
let source: any = {
  characterId: "a",
  weekStart: "2026-09-28",
  routineSummary: "Ignored",
  talkativeness: 99,
  days: {
    Monday: [
      { time: "22:00-06:00", activity: "Sleeping", status: "dnd" },
      { time: "08:00-12:00", activity: "Working at Starship Corp", status: "online" },
      { time: "18:00-20:00", activity: "Reading", status: "offline" },
    ],
    Saturday: [{ time: "10:00-12:00", activity: "Gardening", status: "dnd" }],
  },
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
    documents: {
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
    },
  },
  resources: {
    async listCharacters() {
      return [{ id: "a", name: "Ada", data: { ...card, extensions: source ? { conversationSchedule: source } : {} } }];
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
  const migration = coerceVillageState(raw),
    resident = migration.villagers[0]!;
  assert.equal(resident.agenda!.scheduleWeek, null);
  assert.deepEqual(resident.agenda!.week, translated, "adopt the effective saved translated life");
  assert.deepEqual(resident.agenda!.activeDay?.blocks, [block], "today is preserved separately");
  assert.equal(resident.agenda!.personalizationPending, false);
  assert.equal(resident.scheduleInfluence!.enabled, true);
  assert.deepEqual(coerceVillageState(migration), migration, "migration is idempotent");
  assert.equal(influenceSettings(null).enabled, false, "new residents opt in");
  const owned = parseCompactFounding(payload, context as any).agenda;
  assert.equal(owned.routineProfile!.rhythm.length, 0, "nonhuman residents need no imposed sleep");
  const aliases = { ...payload, palette: palette.map(({ venue, ...row }) => ({ ...row, venueNumber: venue })) };
  assert.deepEqual(
    parseCompactFounding(aliases, context as any).agenda.routineProfile,
    owned.routineProfile,
    "saved venueNumber replies retain exact destinations",
  );
  const rest = { ...payload, rhythm: [{ startMinute: 1320, endMinute: 360, activity: 0 }] };
  assert.deepEqual(
    parseCompactFounding(
      { ...aliases, rhythm: [{ startMinute: 1320, endMinute: 360, activityPaletteIndex: 0 }] },
      context as any,
    ).agenda.routineProfile,
    parseCompactFounding(rest, context as any).agenda.routineProfile,
    "saved rest aliases normalize without changing timing or activity",
  );
  for (const invalid of [
    { activity: 0, activityPaletteIndex: 1 },
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
    { venue: 0, venueNumber: 1 },
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
  resident.scheduleInfluence = influenceSettings({ enabled: true });
  const first = deriveInfluence(source, resident, migration);
  source.weekStart = "2099-01-01";
  source.days.Monday.forEach((row: any) => (row.status = "different"));
  assert.equal(
    deriveInfluence(source, resident, migration).signature,
    first.signature,
    "Engine dates and availability have no authority",
  );
  assert.ok(first.rhythms.some((row) => row.startMinute === 1320 && row.endMinute === 360));
  assert.ok(first.busy.length);
  assert.ok(first.interests.includes("Reading"));
  assert.equal(first.entities.length, 0, "no imported starship employer");
  for (const category of ["rhythm", "busyFree", "weekdayWeekend", "interests", "establishedEntities"]) {
    resident.scheduleInfluence = influenceSettings({ enabled: true, categories: { [category]: false } });
    const result = deriveInfluence(source, resident, migration);
    if (category === "rhythm") assert.equal(result.rhythms.length, 0);
    if (category === "busyFree") assert.equal(result.busy.length, 0);
    if (category === "interests") assert.equal(result.interests.length, 0);
    if (category === "weekdayWeekend") assert.equal(result.patterns!.length, 0);
    if (category === "establishedEntities") assert.equal(result.entities.length, 0);
  }
  resident.scheduleInfluence = influenceSettings({
    enabled: true,
    categories: Object.fromEntries(
      ["rhythm", "busyFree", "weekdayWeekend", "interests", "establishedEntities"].map((key) => [
        key,
        key === "weekdayWeekend",
      ]),
    ),
  });
  const weekendOnly = deriveInfluence(source, resident, migration);
  assert.ok(weekendOnly.patterns!.length);
  assert.equal(weekendOnly.rhythms.length, 0);
  assert.equal(weekendOnly.busy.length, 0);
  assert.doesNotThrow(() =>
    deriveInfluence(
      { days: { Monday: [null, { time: 34 }, { time: "bad", activity: "Sleeping" }] } } as any,
      resident,
      migration,
    ),
  );
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
  const dated = new Date(2026, 9, 5, 12);
  assert.deepEqual(routineDay(owned.routineProfile!, "a", dated), routineDay(owned.routineProfile!, "a", dated));
  const variants = new Set(
    Array.from({ length: 14 }, (_, index) =>
      JSON.stringify(routineDay(owned.routineProfile!, "a", new Date(2026, 9, 5 + index, 12))),
    ),
  );
  assert.ok(variants.size > 7, "daily choices have local variety");
  const pieces = Array.from({ length: 24 }, (_, hour) => ({
    ...block,
    startMinute: hour * 60,
    endMinute: (hour + 1) * 60,
  }));
  const compressed = compressAgendaBlocks(pieces);
  const oldPrompt = pieces
    .map((row) => String(row.startMinute) + "-" + row.endMinute + " " + row.activity + " (" + row.reason + ")")
    .join("; ");
  const newPrompt = agendaPromptDay(
    pieces.map((row) => ({ ...row, time: String(row.startMinute) + "-" + row.endMinute, here: row.activity })),
  );
  console.log(
    "Repeated-day prompt fixture estimated tokens (characters / 4): " +
      Math.ceil(oldPrompt.length / 4) +
      " -> " +
      Math.ceil(newPrompt.length / 4) +
      ". Provider usage is mocked, not a billing measurement.",
  );
  const commitments = pieces.slice(0, 2).map((row, index) => ({ ...row, commitmentId: "c" + index }));
  assert.equal(
    compressAgendaBlocks(commitments).length,
    2,
    "equivalent activities with distinct commitments never merge",
  );
  assert.equal(compressed.length, 1);
  assert.equal(compressed[0]!.endMinute, 1440);
  assert.ok(JSON.stringify(compressed).length < JSON.stringify(pieces).length / 10);
  assert.equal(
    compressAgendaBlocks([
      { ...block, endMinute: 60, zoneId: "exterior" },
      { ...block, startMinute: 60, zoneId: "common" },
    ]).length,
    2,
  );
  assert.ok(addRoutineIdea(owned, { activity: "Writing poetry", flexible: true, venueId: "" }, resident, migration));
  assert.equal(
    addRoutineIdea(owned, { activity: "Flying a starship", flexible: true, venueId: "missing" }, resident, migration),
    false,
  );

  records.set("villages-village", {
    id: "villages-village",
    kind: "village",
    data: coerceVillageState(raw),
    revision: 1,
  });
  const stop = startBackgroundWork();
  try {
    await setVillagerScheduleInfluence("a", { enabled: true, categories: { rhythm: false } });
    await setVillagerScheduleInfluence("a", { enabled: false });
    await buildVillageAgendas();
    await buildVillageAgendas();
    assert.equal(calls, 0, "local plan initialization, influence and repeated reads cost no requests");
    assert.equal((await previewVillageBurst({ action: "translation", characterId: "a" })).requests, 0);
    assert.equal((await previewVillageBurst({ action: "influence", characterId: "a" })).requests, 0);
    assert.deepEqual((await previewVillageBurst({ action: "influence", characterId: "a" })).dollars, {
      min: 0,
      max: 0,
    });
    assert.equal((await previewVillageBurst({ action: "agenda", characterId: "a" })).requests, 1);
    const persisted = await readVillageState();
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
    assert.ok(lastOptions.maxTokens <= 4000);
    assert.equal(lastOptions.reasoningEffort, "none");
    assert.deepEqual(
      (await readVillageState()).villagers[0]!.agenda!.activeDay,
      before,
      "regeneration preserves today",
    );
    await clearVillagerAgenda("a", "one-action");
    await settleBackgroundWork();
    assert.equal(calls, 1);
    const next = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12);
    await rollActiveAgendas(next);
    const nextDay = (await readVillageState()).villagers[0]!.agenda!.activeDay;
    await rollActiveAgendas(next);
    assert.deepEqual((await readVillageState()).villagers[0]!.agenda!.activeDay, nextDay);
    assert.equal(calls, 1);
    const state = await readVillageState(),
      actor = state.villagers[0]!;
    actor.agenda!.activeDay = {
      dateKey: agendaDateKey(next),
      weekday: VILLAGE_WEEKDAYS[(next.getDay() + 6) % 7]!,
      blocks: [block],
      scheduleInformed: false,
    };
    const slots = wishSlots(actor, state, new Date(next.getFullYear(), next.getMonth(), next.getDate(), 8));
    assert.ok(
      slots.length && slots.every((slot) => slot.endMinute - slot.startMinute <= 60),
      "long optional activities contain opportunities",
    );
    source = null;
    resetNativeScheduleCache();
    await buildVillageAgendas();
    assert.equal(calls, 1);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.scheduleInfluenceSnapshot!.available, false);
    const safeVenue = {
      id: "library",
      name: "Library",
      classes: ["other"],
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      state: { condition: "sound", publicFacts: [] },
      presentation: { image: null, x: 0.2, y: 0.2 },
    };
    const access = coerceVillageState({ wishSystemVersion: 3, ...raw, venues: [safeVenue] });
    resident.scheduleInfluence = influenceSettings({ enabled: true });
    assert.ok(
      deriveInfluence(
        { days: { Monday: [{ time: "10:00-12:00", activity: "Reading at Library" }] } } as any,
        resident,
        access,
      ).entities.includes("library"),
    );
    const destination = { ...block, venueId: "library", zoneId: "exterior" };
    assert.notEqual(
      validateRoutineDay([{ ...destination, zoneId: undefined }], resident, access)[0]!.zoneId,
      "exterior",
      "unspecified routine destinations resolve to an appropriate accessible Zone",
    );
    access.venues[0]!.constructionStatus = "worksite";
    assert.equal(validateRoutineDay([destination], resident, access)[0]!.venueId, "");
    const crowd = coerceVillageState({
      wishSystemVersion: 3,
      ...raw,
      venues: [safeVenue],
      villagers: Array.from({ length: 6 }, (_, i) => ({
        ...raw.villagers[0],
        characterId: "crowd" + i,
        cardSnapshot: { ...raw.villagers[0]!.cardSnapshot, id: "crowd" + i, name: "Crowd " + i },
        agenda: {
          ...raw.villagers[0]!.agenda,
          scheduleWeek: null,
          activeDay: undefined,
          week: Object.fromEntries(VILLAGE_WEEKDAYS.map((day) => [day, [destination]])),
        },
      })),
    });
    records.set("villages-village", { ...records.get("villages-village"), data: crowd });
    await rollActiveAgendas(today);
    const capacity = (await readVillageState()).villagers;
    for (let minute = 0; minute < 1440; minute += 30)
      assert.ok(
        capacity.filter((person) =>
          person.agenda!.activeDay!.blocks.some(
            (row) => row.venueId === "library" && row.startMinute <= minute && row.endMinute > minute,
          ),
        ).length <= 4,
        "capacity checked locally",
      );
    assert.equal(calls, 1);
    records.set("villages-village", { ...records.get("villages-village"), data: state });
    fail = true;
    await clearVillagerAgenda("a", "bad-output");
    await settleBackgroundWork();
    assert.equal(calls, 2);
    await buildVillageAgendas();
    await settleBackgroundWork();
    assert.equal(calls, 2, "invalid output never automatically retries");
    assert.ok((await backgroundWorkSummaries()).some((job) => job.kind === "agenda" && job.status === "failed"));
    await mutateVillageState((value) => {
      value.villagers[0]!.scheduleInfluence = influenceSettings({ enabled: false });
    });
    assert.ok(agendaBlocksFor((await readVillageState()).villagers[0]!.agenda!, false, next).length);
    await mutateVillageState((value) => {
      value.villagers[0]!.agenda = null;
      value.storyPace = "off";
      value.setupAt = today.toISOString();
    });
    await reconcileVillage({ now: today });
    await settleBackgroundWork();
    assert.equal(calls, 2, "entire missing legacy agendas are repaired locally, never a paid migration");
    assert.equal((await readVillageState()).villagers[0]!.agenda!.personalizationPending, false);
  } finally {
    stop();
    release();
  }
  console.log(
    "Villages owned Agenda regressions passed; routine requests 8 -> 1, translation/influence/local rollover requests 0.",
  );
}
void main().catch((error) => {
  release();
  console.error(error);
  process.exitCode = 1;
});
