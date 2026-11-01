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
import { agendaRevision } from "../packages/villages/src/server/domain/rules/agenda-revision.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { initialIdentityDescription } from "../packages/villages/src/server/domain/rules/resident-description.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";
import {
  createResidentAgendas,
  type ResidentAgendaPorts,
} from "../packages/villages/src/server/features/residents/resident-agenda-service.js";
import {
  clearVillagerAgenda,
  configureResidentAgendas,
  queueVillagerAgenda,
  rollActiveAgendas,
} from "../packages/villages/src/server/features/residents/resident-agendas.js";

function deferred() {
  return Promise.withResolvers<void>();
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
    wishes: [],
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
    pauseRead = false,
    pauseModel = false,
    unavailable = false,
    failure: Error | undefined;
  let parsed = 0,
    generated = 0;
  let parsedResponse: unknown, parsedContext: unknown;
  const note = (operation: string) => {
    calls.push(operation);
    owners.push(scopedActivation());
  };
  const ports: ResidentAgendaPorts = {
    async readVillageState() {
      note("read");
      if (pauseRead) {
        pauseRead = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
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
    parseCompactFoundingCompletion(response, context) {
      note("parse");
      parsed++;
      parsedResponse = response;
      parsedContext = context;
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
    pauseRead() {
      pauseRead = true;
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
    get parsedResponse() {
      return parsedResponse;
    },
    get parsedContext() {
      return parsedContext;
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
assert(!a.calls.includes("allowance"));
assert.equal(a.generated, 0, "Queueing records input; the handler owns generation.");
await b.service.queueVillagerAgenda("same");
assert.equal(b.jobs[0].input.context.village, "B");

const founding = fixture("Founding");
founding.state.foundingPreparation = { status: "pending" } as any;
await founding.service.queueVillagerAgenda("same");
assert(!founding.calls.includes("allowance"), "Routine does not reserve a Wish allowance");
const unavailable = fixture("Unavailable");
unavailable.missingCard();
const retained = structuredClone(unavailable.resident.agenda);
await assert.rejects(unavailable.service.queueVillagerAgenda("same"), /identity is unavailable/);
assert.equal(unavailable.jobs.length, 0);
assert.equal(unavailable.generated, 0);
assert.equal(unavailable.resident.agenda.personalizationPending, false);
assert.match(unavailable.resident.agenda.personalizationFailure!, /unavailable/);
assert.deepEqual(unavailable.resident.agenda.week, retained.week);
const failed = fixture("Failed"),
  expected = new Error("Exact library failure");
failed.fail(expected);
await assert.rejects(failed.service.queueVillagerAgenda("same"), (error) => error === expected);
assert.deepEqual(failed.calls, ["read", "read", "progress:reading", "card"]);
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
assert.equal(local.jobs.length, 0);
assert.equal(local.generated, 0);
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
assert.equal(
  handler.recoverSavedResult!(input, [
    { key: "owned-routine-profile", status: "completed", response: { content: "retired profile" } },
    { key: "founding-routine-v1", status: "completed", response: { content: "another contract" } },
  ] as any),
  undefined,
);
assert.equal(a.parsed, 0, "Unrelated saved responses cannot enter the admitted parser");
for (const version of [undefined, 1, 2]) {
  const context = { ...input.context, contractVersion: version };
  if (version === undefined) delete context.contractVersion;
  const admitted = { ...input, context };
  const key = version === 2 ? "founding-routine-v2" : "founding-routine-v1";
  const response = { content: "exact admitted response " + version };
  const steps = [
    { key: "owned-routine-profile", status: "completed", response: { content: "retired profile" } },
    {
      key: version === 2 ? "founding-routine-v1" : "founding-routine-v2",
      status: "completed",
      response: { content: "wrong contract" },
    },
    { key, status: "running", response: { content: "unfinished response" } },
    { key, status: "completed", response },
  ];
  const before = JSON.stringify(steps),
    parsed = a.parsed;
  handler.recoverSavedResult!(admitted, steps as any);
  assert.equal(a.parsed, parsed + 1);
  assert.equal(a.parsedResponse, response);
  assert.equal(a.parsedContext, context, "Recovery uses the frozen admitted context");
  assert.equal(JSON.stringify(steps), before, "Historical paid evidence stays unchanged");
}
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
assert.deepEqual(a.state.villagers[0]!.wishes, [], "Ordinary regeneration cannot introduce an initial wish.");

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

// Rollover is an owned command, including its read-to-mutation continuation.
const rollOne = createActivationScope(),
  rollTwo = createActivationScope();
const rollA = fixture("Roll A"),
  rollB = fixture("Roll B");
const releaseRollA = rollOne.run(() => configureResidentAgendas(rollA.service));
const releaseRollB = rollTwo.run(() => configureResidentAgendas(rollB.service));
const clearRollA = installDefaultActivation(rollOne, () => {});
const rollAt = new Date("2026-10-07T12:00:00Z");
rollA.resident.agenda.activeDay = undefined;
rollB.resident.agenda.activeDay = undefined;
rollA.pauseRead();
const pendingRoll = rollActiveAgendas(rollAt);
await rollA.entered.promise;
const clearRollB = installDefaultActivation(rollTwo, () => {});
assert.equal(await rollActiveAgendas(rollAt), true);
assert.equal(rollA.calls.filter((call) => call === "mutate").length, 0);
rollA.gate.resolve();
assert.equal(await pendingRoll, true);
assert.equal(rollA.resident.agenda.activeDay?.dateKey, agendaDateKey(rollAt));
assert.equal(rollB.resident.agenda.activeDay?.dateKey, agendaDateKey(rollAt));
assert(rollA.owners.every((owner) => owner === rollOne));
assert(rollB.owners.every((owner) => owner === rollTwo));
const completedCalls = rollA.calls.length;
assert.equal(await rollOne.run(() => rollActiveAgendas(rollAt, rollA.state)), false);
assert.equal(rollA.calls.length, completedCalls, "Supplied current state avoids both read and mutation.");
const suppliedRoll = fixture("Supplied roll");
suppliedRoll.resident.agenda.activeDay = undefined;
assert.equal(await suppliedRoll.service.rollActiveAgendas(rollAt, suppliedRoll.state), true);
assert.deepEqual(
  suppliedRoll.calls,
  ["mutate"],
  "Supplied stale state bypasses the read and keeps the original mutation.",
);
rollOne.run(releaseRollA);
rollOne.dispose();
clearRollA();
assert.equal(await rollActiveAgendas(rollAt), false, "Releasing A retains B's current command.");
rollTwo.run(releaseRollB);
rollTwo.dispose();
clearRollB();
await assert.rejects(
  rollTwo.run(() => rollActiveAgendas(rollAt)),
  /not configured/,
);
console.log(
  "Resident Agenda ownership: inert ports, input/revision admission, recovery without regeneration, current-day preservation, independent owners and bound background callbacks passed (mocked storage, schedules and generation).",
);

const identity = fixture("Identity");
identity.state.villagers[0]!.identityDescription = initialIdentityDescription();
await identity.service.queueVillagerAgenda("same");
const identityInput = identity.jobs[0].input;
assert.equal(
  identityInput.context.identityDescriptionRevision,
  identity.state.villagers[0]!.identityDescription!.revision,
);
const identityResult = {
  agenda: { ...structuredClone(identity.resident.agenda), generatedAt: new Date().toISOString() },
  identityDescription: "A patient gardener with an interest in herbs.",
};
identity.service.agendaBackgroundHandler.apply(identity.state, identityInput, identityResult, { retrying: false });
assert.equal(identity.state.villagers[0]!.identityDescription!.text, identityResult.identityDescription);
assert.equal(identity.state.villagers[0]!.identityDescription!.initialGenerationComplete, true);
await identity.service.clearVillagerAgenda("same", "later-routine");
assert.equal(identity.jobs.at(-1).input.context.identityDescriptionRevision, undefined);
identity.service.agendaBackgroundHandler.apply(
  identity.state,
  identity.jobs.at(-1).input,
  { ...identityResult, identityDescription: "Unexpected replacement." },
  { retrying: false },
);
assert.equal(identity.state.villagers[0]!.identityDescription!.text, identityResult.identityDescription);
const editedIdentity = fixture("Edited during preparation");
editedIdentity.state.villagers[0]!.identityDescription = initialIdentityDescription();
await editedIdentity.service.queueVillagerAgenda("same");
editedIdentity.state.villagers[0]!.identityDescription = {
  text: "",
  revision: "player-edit",
  initialGenerationComplete: true,
};
editedIdentity.service.agendaBackgroundHandler.apply(
  editedIdentity.state,
  editedIdentity.jobs[0].input,
  identityResult,
  { retrying: false },
);
assert.equal(
  editedIdentity.state.villagers[0]!.identityDescription!.text,
  "",
  "Even an intentional blank wins over delayed generation.",
);
const invalidIdentity = fixture("Invalid description");
invalidIdentity.state.villagers[0]!.identityDescription = initialIdentityDescription();
await invalidIdentity.service.queueVillagerAgenda("same");
invalidIdentity.service.agendaBackgroundHandler.apply(
  invalidIdentity.state,
  invalidIdentity.jobs[0].input,
  { ...identityResult, identityDescription: "Two sentences. Not one." },
  { retrying: false },
);
assert.equal(invalidIdentity.state.villagers[0]!.identityDescription!.text, "");
assert.equal(invalidIdentity.state.villagers[0]!.identityDescription!.initialGenerationComplete, true);
assert(
  invalidIdentity.state.villagers[0]!.agenda!.generatedAt,
  "An invalid description does not reject a valid agenda.",
);
