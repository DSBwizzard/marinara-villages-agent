import assert from "node:assert/strict";
import {
  bindActivationService,
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";
import {
  createResidentAgendas,
  type ResidentAgendaPorts,
} from "../packages/villages/src/server/features/residents/resident-agenda-service.js";
import {
  agendaRevision,
  configureResidentAgendas,
  queueVillagerAgenda,
  clearVillagerAgenda,
} from "../packages/villages/src/server/features/residents/resident-agendas.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const state = defaultVillageState();
  state.name = name;
  state.seed = `seed-${name}`;
  const card = readVillagerCard({ id: "same", data: JSON.stringify({ name, description: `Owned ${name}` }) } as any);
  const resident = {
    characterId: "same",
    cardSnapshot: snapshotFromCard(card, 2),
    addedAt: "2026-10-06T12:00:00Z",
    completedWishes: [],
    remap: null,
    remapFailure: null,
    ingestSchedule: false,
    agenda: unwrittenVillageAgenda(state.venues, name),
  };
  state.villagers = [resident];
  const calls: string[] = [],
    owners: unknown[] = [],
    jobs: any[] = [];
  const gate = deferred(),
    entered = deferred();
  let pauseLore = false,
    pauseModel = false,
    unavailable = false,
    failure: Error | undefined;
  let parsed = 0,
    generated = 0;
  const note = (operation: string) => {
    calls.push(operation);
    owners.push(scopedActivation());
  };
  const ports: ResidentAgendaPorts = {
    async readVillageState() {
      note("read");
      return structuredClone(state);
    },
    async mutateVillageState(update) {
      note("mutate");
      update(state);
      return structuredClone(state);
    },
    readEffectiveVillagerCard() {
      note("card");
      if (failure) throw failure;
      return unavailable ? null : structuredClone(card);
    },
    async reportFoundingProgress(_seed, progress) {
      note(`progress:${progress.stage}`);
    },
    async reserveInitialWishAllowance() {
      note("allowance");
      return `wish-${name}`;
    },
    async readVillageLore() {
      note("lore");
      if (pauseLore) {
        pauseLore = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      return [`Lore ${name}`];
    },
    async queueBackgroundJob(work) {
      note("queue");
      jobs.push(structuredClone(work));
    },
    async backgroundWorkSummaries() {
      note("jobs");
      return [{ kind: "agenda", subjectId: "same", attempt: 3 }] as any;
    },
    parseCompactFoundingCompletion() {
      note("parse");
      parsed++;
      return { agenda: structuredClone(resident.agenda) } as any;
    },
    async proposeCompactFounding(_context, onModel) {
      note("generate");
      generated++;
      await onModel?.(`Model ${name}`);
      if (pauseModel) {
        pauseModel = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      return { agenda: structuredClone(resident.agenda) } as any;
    },
    async readNativeScheduleSnapshot() {
      note("schedule");
      return { cardsReadable: true, schedules: [] };
    },
    async rollActiveAgendas() {
      note("roll");
      return false;
    },
    registerInitialWish() {
      note("register-wish");
    },
    async correctResidentWish(characterId, wishId) {
      note(`correct:${characterId}:${wishId}`);
    },
  };
  const service = createResidentAgendas(ports);
  assert.deepEqual(calls, [], "Factory construction does not read storage, schedules or models.");
  return {
    state,
    resident,
    card,
    service,
    calls,
    owners,
    jobs,
    gate,
    entered,
    pauseLore() {
      pauseLore = true;
    },
    pauseModel() {
      pauseModel = true;
    },
    missingCard() {
      unavailable = true;
    },
    fail(error: Error) {
      failure = error;
    },
    get parsed() {
      return parsed;
    },
    get generated() {
      return generated;
    },
  };
}
const a = fixture("A"),
  b = fixture("B");
const revision = agendaRevision(a.state, "same");
assert.equal(agendaRevision(structuredClone(a.state), "same"), revision);
a.card.description = "Different library prose";
assert.equal(
  agendaRevision(a.state, "same"),
  revision,
  "The adopted snapshot, rather than a live library edit, identifies work.",
);
const changed = structuredClone(a.state);
changed.villagers[0]!.cardSnapshot.revision++;
assert.notEqual(agendaRevision(changed, "same"), revision);
await a.service.queueVillagerAgenda("absent");
assert.deepEqual(a.calls, ["read"], "Missing residents admit no work.");
await a.service.queueVillagerAgenda("same", false);
assert.equal(a.jobs[0].finite, false);
assert.equal(a.jobs[0].revision, revision);
assert.equal(a.jobs[0].input.context.village, "A");
assert.deepEqual(a.jobs[0].input.context.lore, ["Lore A"]);
assert.equal(a.jobs[0].input.context.allowInitialWish, false);
assert(!a.calls.includes("allowance"));
assert.equal(a.generated, 0, "Queueing records input; the handler owns generation.");
await b.service.queueVillagerAgenda("same");
assert.equal(b.jobs[0].input.context.village, "B");

const founding = fixture("Founding");
founding.state.foundingPreparation = { status: "pending" } as any;
await founding.service.queueVillagerAgenda("same");
assert.equal(founding.jobs[0].input.initialWishAttemptId, "wish-Founding");
assert.equal(founding.jobs[0].input.context.allowInitialWish, true);
assert(founding.calls.indexOf("allowance") < founding.calls.indexOf("lore"));
const unavailable = fixture("Unavailable");
unavailable.missingCard();
const retained = structuredClone(unavailable.resident.agenda);
await unavailable.service.queueVillagerAgenda("same");
assert.equal(unavailable.jobs.length, 0);
assert.equal(unavailable.generated, 0);
assert.equal(unavailable.resident.agenda.personalizationPending, false);
assert.match(unavailable.resident.agenda.personalizationFailure!, /unavailable/);
assert.deepEqual(unavailable.resident.agenda.week, retained.week);
const failed = fixture("Failed"),
  expected = new Error("Exact library failure");
failed.fail(expected);
await assert.rejects(failed.service.queueVillagerAgenda("same"), (error) => error === expected);
assert.deepEqual(failed.calls, ["read", "progress:reading", "card"]);
assert.equal(failed.jobs.length, 0);

const deliberate = fixture("Deliberate");
await deliberate.service.clearVillagerAgenda("same", "one-action");
await deliberate.service.clearVillagerAgenda("same", "one-action");
assert.equal(deliberate.jobs.length, 1, "Repeated explicit action IDs retain their original admission policy.");
assert.equal(deliberate.state.villagers[0]!.agendaGeneration, "one-action");
await assert.rejects(deliberate.service.clearVillagerAgenda("absent", "action"), /does not live here/);
const local = fixture("Local");
await local.service.setVillagerScheduleInfluence("same", { enabled: true, categories: { rhythm: false } });
await local.service.buildVillageAgendas();
await local.service.correctCompletedWish("same", "wish");
assert.equal(local.jobs.length, 0);
assert.equal(local.generated, 0);
assert(local.calls.includes("correct:same:wish"));
assert.equal(local.state.villagers[0]!.scheduleInfluence!.categories.rhythm, false);
const mutations = local.calls.filter((operation) => operation === "mutate").length;
await assert.rejects(
  local.service.setVillagerScheduleInfluence("same", { categories: { arbitrary: true } }),
  /valid schedule/,
);
assert.equal(local.calls.filter((operation) => operation === "mutate").length, mutations);

const handler = a.service.agendaBackgroundHandler,
  input = a.jobs[0].input;
assert(handler.valid(a.state, input));
assert(!handler.valid(changed, input));
const departed = structuredClone(a.state);
departed.villagers = [];
assert(!handler.valid(departed, input));
handler.apply(departed, input, retained, { retrying: false });
assert.deepEqual(departed.villagers, []);
assert.equal(handler.recoverSavedResult!(input, []), undefined);
assert.equal(a.parsed, 0);
handler.recoverSavedResult!(input, [
  { key: "owned-routine-profile", status: "completed", response: { content: "saved" } },
] as any);
assert.equal(a.parsed, 1);
assert.equal(a.generated, 0, "Saved completion parsing dispatches no model.");
const now = new Date(),
  today = agendaDateKey(now),
  weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
const current = { dateKey: today, weekday, blocks: [], scheduleInformed: false };
a.resident.agenda.activeDay = structuredClone(current);
const result = structuredClone(a.resident.agenda);
result.wishes = [{ id: "unadmitted", description: "A generated wish" }] as any;
handler.apply(a.state, input, result, { retrying: false });
assert.deepEqual(a.state.villagers[0]!.agenda!.activeDay, current, "A profile result preserves today's captured plan.");
assert.deepEqual(a.state.villagers[0]!.agenda!.wishes, [], "Ordinary regeneration cannot introduce an initial wish.");

const one = createActivationScope(),
  two = createActivationScope();
const first = fixture("First owner"),
  second = fixture("Second owner");
const releaseFirst = one.run(() => configureResidentAgendas(first.service));
const releaseSecond = two.run(() => configureResidentAgendas(second.service));
const clearFirst = installDefaultActivation(one, () => {});
first.pauseLore();
const pending = queueVillagerAgenda("same");
await first.entered.promise;
const clearSecond = installDefaultActivation(two, () => {});
await queueVillagerAgenda("same");
first.gate.resolve();
await pending;
assert.equal(first.jobs[0].seed, first.state.seed);
assert.equal(second.jobs[0].seed, second.state.seed);
assert(first.owners.every((owner) => owner === one));
assert(second.owners.every((owner) => owner === two));
one.run(releaseFirst);
one.dispose();
clearFirst();
await clearVillagerAgenda("same", "new-owner-action");
assert.equal(second.state.villagers[0]!.agendaGeneration, "new-owner-action");
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => queueVillagerAgenda("same")),
  /not configured/,
);
two.run(releaseSecond);
two.dispose();
clearSecond();
missing.dispose();
await assert.rejects(
  two.run(() => queueVillagerAgenda("same")),
  /not configured/,
);

// Entry binds the callback object itself, retaining its origin even when invoked without a caller scope.
const callbackOwner = createActivationScope(),
  replacementOwner = createActivationScope();
const callbackFixture = fixture("Callback");
const captured = callbackOwner.run(() => bindActivationService(callbackFixture.service.agendaBackgroundHandler));
callbackFixture.pauseModel();
const generation = captured.generate({ characterId: "same", seed: callbackFixture.state.seed, context: {} });
await callbackFixture.entered.promise;
const clearReplacement = installDefaultActivation(replacementOwner, () => {});
callbackFixture.gate.resolve();
await generation;
assert.equal(callbackFixture.generated, 1);
assert(callbackFixture.owners.every((owner) => owner === callbackOwner));
assert.equal(callbackFixture.calls.at(-1), "progress:applying");
clearReplacement();
callbackOwner.dispose();
replacementOwner.dispose();
console.log(
  "Resident Agenda ownership: inert ports, input/revision admission, recovery without regeneration, current-day preservation, independent owners and bound background callbacks passed (mocked storage, schedules and generation).",
);
