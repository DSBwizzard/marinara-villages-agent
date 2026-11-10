// Test cases: resident-planning/one-gm, resident-planning/reflection, resident-planning/mail, resident-planning/pre-spend, resident-planning/paid-hold, resident-planning/independent, resident-planning/catchup, resident-planning/strict-input, resident-planning/protected-context, resident-planning/live-scene, resident-planning/mail-initiative, resident-planning/delayed-meeting, resident-planning/background-recovery
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  readEffectiveVillagerCard,
  readVillagerCard,
} from "../packages/villages/src/server/adapters/engine/catalog.js";
import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { createResidentPlanning } from "../packages/villages/src/server/features/residents/resident-planning-service.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { readResidentPlanningInput } from "../packages/villages/src/server/domain/rules/resident-planning.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityHolderKey,
  continuityViews,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { readDeliveredLetter } from "../packages/villages/src/server/domain/rules/mail-delivery.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import type { VillageState, ResidentPlanningOpportunity } from "../packages/villages/src/server/domain/models/world.js";
import {
  readFoundingCircumstances,
  seedFoundingCircumstances,
} from "../packages/villages/src/server/domain/rules/founding-circumstances.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { socialPlanCandidates, acceptSocialPlan } from "../packages/villages/src/server/domain/rules/social-rules.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { captureContinuityContext } from "../packages/villages/src/server/domain/rules/continuity-context.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { configureVillageClock } from "../packages/villages/src/server/adapters/time/clock-gate.js";
import { venue as homeFixture } from "./fixtures/villages-projects.fixture.js";
import { narrationAccessPrompt } from "../packages/villages/src/server/domain/rules/narration-access.js";
import { narrationResidencePrompt } from "../packages/villages/src/server/domain/rules/narration-residence.js";
import { requestResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";

function fixture(now = new Date()) {
  const at = now.toISOString(),
    state = defaultVillageState();
  Object.assign(state, {
    seed: "native-planner",
    name: "Test village",
    setting: "A shared village",
    setupAt: at,
    foundedAt: new Date(now.getTime() - 86400000).toISOString(),
    simulatedThrough: at,
    timeZone: "UTC",
    backgroundPace: "lively",
  });
  state.venues = [venueFixture({ id: "square", name: "Square", category: "public" })];
  const zone = state.venues[0].zones!.find((row) => row.kind !== "exterior")!.id,
    room = { kind: "room" as const, placeId: "square", zoneId: zone };
  state.villagers = ["mara", "leo"].map((id) => ({
    incarnation: "one",
    characterId: id,
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: snapshotFromCard(
      readVillagerCard({ id, comment: "", data: { name: id, description: "A distinctive complete character." } }),
      1,
    ),
    agenda: agendaFixture({
      day: [
        { startMinute: 0, endMinute: 1440, activity: "Free time", venueId: "square", zoneId: zone, flexible: true },
      ],
    }),
  })) as VillageState["villagers"];
  retainNativeFact(
    state,
    {
      id: "room",
      kind: "structure",
      targetId: JSON.stringify([room.placeId, room.zoneId]),
      revision: 1,
      text: "A room with a blue cup on the shelf.",
      witnesses: [],
    },
    at,
    { room },
  );
  const queued: any[] = [],
    calls: any[] = [],
    background = createBackgroundContext();
  let payload: any = {},
    prior: any = null,
    activeScene: any = null;
  const model: any = {
    connectionId: "fixture",
    model: "fixture",
    maxOutputTokens: 4096,
    maxContext: 100000,
    chatComplete: async () => ({ finishReason: "stop", content: JSON.stringify(payload) }),
    fitContext: (messages: any, options: any) => ({ messages, ...options }),
  };
  const service = createResidentPlanning({
    activeVenueSession: async () => activeScene,
    readVillageState: async () => state,
    readEffectiveVillagerCard,
    queueBackgroundJob: async (input) => {
      queued.push(input);
    },
    backgroundJobSnapshot: async () => prior,
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }) as any,
    villagesConnectionIdFor: async () => "fixture",
    completeWithRoom: async (_model, messages, _tokens, options) => {
      await options?.beforeBackgroundDispatch?.();
      calls.push(messages);
      const complete = background.backgroundCalls.getStore();
      return complete ? complete(_model, messages, _tokens, options) : model.chatComplete(messages, options);
    },
  });
  const views = (id: string) => continuityViews(state.continuity, continuityActor(state, id)!, at, new Set());
  function correct() {
    const key = continuityHolderKey(room),
      record = state.continuity.records.find((row) => row.heads[key])!;
    state.continuity = protectContinuity(
      state.continuity,
      { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
      [room],
      "correct-room",
      at,
      { text: "An empty shelf." },
    );
  }
  const encounter = (input: any) => ({
    encounter: {
      opportunityId: input.context.narration.opportunity.id,
      lines: [
        { id: "hello", speakerId: "mara", text: "How was your afternoon?" },
        { id: "answer", speakerId: "leo", text: "Quiet, thank you." },
      ],
    },
  });
  return {
    now,
    at,
    state,
    zone,
    room,
    queued,
    calls,
    service,
    background,
    views,
    correct,
    encounter,
    payload: (value: any) => (payload = value),
    prior: (value: any) => (prior = value),
    scene: (value: any) => (activeScene = value),
  };
}

await runCase("resident-planning/one-gm", async () => {
  const f = fixture();
  await f.service.reconcile(f.now);
  assert.equal(f.calls.length, 0);
  const input = f.queued[0].input;
  assert.equal(input.context.narration.opportunity.kind, "encounter");
  f.payload(f.encounter(input));
  const result = await f.service.handler.generate(input);
  assert.equal(f.calls.length, 1);
  assert.equal(f.service.handler.valid(f.state, input), true);
  f.service.handler.apply(f.state, input, result, { retrying: false });
  const episode = f.state.episodes.records.at(-1)!;
  assert.deepEqual(
    f.service.handler.recoverSavedResult!(input, [
      {
        key: "resident-planning:gm:" + input.context.narration.opportunity.id,
        status: "completed",
        response: { finishReason: "stop", content: JSON.stringify(f.encounter(input)) },
      },
    ] as any),
    result,
    "saved response recovery uses the same native parser without a new request",
  );
  assert(!episode.sceneId);
  assert.equal(episode.opportunity!.id, input.context.narration.opportunity.id);
  assert.equal(episode.segments.length, 2);
  assert(!f.state.socialOutbox?.length && !f.state.socialMailOutbox?.length);
  assert.equal(f.state.planningUsage.count, 1);
  f.service.handler.apply(f.state, input, result, { retrying: true });
  assert.equal(f.state.planningUsage.count, 1);
  assert.equal(f.calls.length, 1);
});
await runCase("resident-planning/reflection", async () => {
  const f = fixture();
  await f.service.reconcile(f.now);
  const input = f.queued[0].input;
  f.payload({
    reflection: { actorId: "mara", text: "Mara privately decides she wants a quieter studio." },
    keep: [
      {
        id: "wish",
        for: ["mara"],
        owner: "mara",
        class: "desire",
        text: "Mara wants a quieter studio.",
        source: [{ segment: "reflection", perceive: { kind: "private", by: ["mara"] } }],
      },
    ],
    requires: ["wish"],
  });
  const result = await f.service.handler.generate(input);
  f.service.handler.apply(f.state, input, result, { retrying: false });
  assert(f.views("mara").some((row) => row.version.class === "desire"));
  assert.equal(f.views("leo").length, 0);
  assert.equal(f.views("player").length, 0);
  assert.equal(f.calls.length, 1);
});
await runCase("resident-planning/mail", async () => {
  const f = fixture();
  await f.service.reconcile(f.now);
  const input = f.queued[0].input;
  f.payload({
    mail: { senderId: "mara", text: "Dear friend, the common room has a blue cup on its shelf. — Mara" },
    keep: [
      {
        id: "remember",
        for: ["mara", "player"],
        class: "information",
        text: "Mara wrote that the common room has a blue cup.",
        source: ["letter"],
      },
    ],
    requires: ["remember"],
  });
  const result = await f.service.handler.generate(input);
  f.service.handler.apply(f.state, input, result, { retrying: false });
  const letter = Object.values(f.state.mailbox.messages)[0];
  assert.equal(letter.status, "delivered");
  assert.equal(f.views("player").length, 0);
  readDeliveredLetter(f.state, letter.id, new Date().toISOString());
  assert.equal(f.views("player").length, 1);
  assert.equal(f.calls.length, 1);
  const storage = sceneHistoryFixture(),
    repository = createVillageRepository(() => storage.gate.documents);
  try {
    await repository.mutateAuthority((state) => Object.assign(state, f.state), { memories: true });
    const before = await repository.readAuthority({ memories: true });
    await collectRetainedStorage(storage.gate);
    const cold = await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true });
    assert.deepEqual(
      cold.mailbox,
      before.mailbox,
      "native mailbox and original artifacts survive real owned-history collection",
    );
  } finally {
    storage.release();
  }
});
await runCase("resident-planning/pre-spend", async () => {
  for (const changed of ["room", "attendance"]) {
    const f = fixture();
    await f.service.reconcile(f.now);
    const input = f.queued[0].input;
    if (changed === "room") f.correct();
    else f.state.villagers[0].incarnation = "replacement";
    await assert.rejects(f.service.handler.generate(input));
    assert.equal(f.calls.length, 0);
  }
});
await runCase("resident-planning/paid-hold", async () => {
  const f = fixture();
  await f.service.reconcile(f.now);
  const input = f.queued[0].input;
  f.payload(f.encounter(input));
  const result = await f.service.handler.generate(input);
  f.correct();
  const before = structuredClone(f.state);
  assert.throws(
    () => f.service.handler.apply(f.state, input, result, { retrying: false }),
    /protection changed|room context changed/,
  );
  assert.deepEqual(f.state, before);
  assert.equal(f.calls.length, 1);
});
await runCase("resident-planning/independent", async () => {
  const f = fixture();
  await f.service.reconcile(f.now);
  const input = f.queued[0].input;
  f.payload({
    ...f.encounter(input),
    keep: [{ id: "bad", for: ["mara"], text: "", source: ["hello"], independent: true }],
  });
  const result = await f.service.handler.generate(input);
  f.service.handler.apply(f.state, input, result, { retrying: false });
  assert.equal(f.state.episodes.records.at(-1)!.segments.length, 2);
  assert.equal(f.views("mara").length, 0);
  assert.equal(f.calls.length, 1);
});
await runCase("resident-planning/catchup", async () => {
  const f = fixture(),
    departure = new Date(f.now.getTime() - 2 * 3600000),
    capture = captureReturnContext(f.state, departure),
    eventAt = new Date(f.now.getTime() - 3600000).toISOString(),
    opportunity: ResidentPlanningOpportunity = {
      id: "historical",
      kind: "encounter",
      startsAt: eventAt,
      endsAt: eventAt,
      actorIds: ["mara", "leo"],
      venueId: "square",
      zoneId: f.zone,
      facts: ["Residents shared this Zone during the absence."],
    };
  f.state.returnCatchup = {
    capture,
    batch: {
      id: "return",
      status: "running",
      from: capture.at,
      until: f.at,
      budgetDate: f.at.slice(0, 10),
      opportunityLimit: 1,
      opportunities: [opportunity],
      records: [{ opportunityId: opportunity.id, status: "queued" }],
    },
  };
  await f.service.queueReturnOpportunity("return", opportunity, capture);
  const input = f.queued[0].input;
  f.payload({
    ...f.encounter(input),
    keep: [
      {
        id: "learn",
        for: ["mara"],
        class: "information",
        text: "Leo said their afternoon was quiet.",
        source: ["answer"],
      },
    ],
    requires: ["learn"],
  });
  const result = await f.service.handler.generate(input);
  f.service.handler.apply(f.state, input, result, { retrying: false });
  assert.equal(f.state.returnCatchup.batch!.records![0].status, "settled");
  assert.equal(f.state.returnCatchup.capture!.continuityRevision, f.state.continuity.revision);
  assert.equal(f.state.returnCatchup.capture!.episodeRevision, f.state.episodes.revision);
  assert(f.views("mara").length);
  assert(!f.state.socialOutbox?.length);
  assert.equal(f.calls.length, 1);
  assert.equal(coerceVillageState(f.state).returnCatchup!.capture!.episodeRevision, f.state.episodes.revision);
});
await runCase("resident-planning/protected-context", async () => {
  const f = fixture(),
    secret = "FORGOTTEN CIRCUMSTANCE SENTINEL",
    corrected = "The village is peaceful.",
    holders = ["player", "mara", "leo"].map((id) => continuityActor(f.state, id)!);
  seedFoundingCircumstances(
    f.state,
    readFoundingCircumstances([{ scope: "village", summary: secret }], [], f.at),
    holders.map((row) => row.id),
    f.at,
  );
  const record = f.state.continuity.records.at(-1)!,
    heads = Object.fromEntries(
      holders.map((holder) => [continuityHolderKey(holder), record.heads[continuityHolderKey(holder)].revision]),
    );
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: record.id, recordRevision: record.revision, heads },
    holders,
    "correct-circumstance",
    f.at,
    { text: corrected },
  );
  for (const resident of f.state.villagers)
    for (const activity of resident.agenda!.routineProfile!.activities)
      activity.activity = "FORGOTTEN ROUTINE SENTINEL";
  await f.service.reconcile(f.now);
  const input = f.queued[0].input;
  f.payload({});
  await f.service.handler.generate(input);
  const packet = JSON.parse(f.calls[0][1].content);
  assert(packet.continuity.protections.some((row: any) => row.forbidden.includes(secret)));
  packet.continuity.protections = [];
  const prompt = String(f.calls[0][0].content) + JSON.stringify(packet);
  assert(!prompt.includes(secret), "protected old circumstance is only a prohibition, never ordinary context");
  assert(!prompt.includes("FORGOTTEN ROUTINE SENTINEL"));
  assert(prompt.includes(corrected), "canonical corrected circumstances are required common context");
  assert.equal(
    f.state.narrative!.situations[0].summary,
    secret,
    "administrative continuity edits preserve native mechanics",
  );
  for (const onlyUnrelated of [false, true]) {
    const next = fixture();
    if (onlyUnrelated) {
      const outside = structuredClone(next.state.villagers[0]);
      outside.characterId = "outside";
      outside.cardSnapshot = { ...outside.cardSnapshot, id: "outside", name: "Outside" };
      outside.agenda = null;
      next.state.villagers.push(outside);
    }
    const ids = onlyUnrelated ? ["outside"] : ["player", "mara", "leo"],
      situations = readFoundingCircumstances([{ scope: "village", summary: secret }], [], next.at);
    seedFoundingCircumstances(next.state, situations, ids, next.at);
    if (!onlyUnrelated) {
      const row = next.state.continuity.records.at(-1)!,
        owners = ids.map((id) => continuityActor(next.state, id)!);
      next.state.continuity = protectContinuity(
        next.state.continuity,
        {
          id: row.id,
          recordRevision: row.revision,
          heads: Object.fromEntries(
            owners.map((owner) => [continuityHolderKey(owner), row.heads[continuityHolderKey(owner)].revision]),
          ),
        },
        owners,
        "forget-all",
        next.at,
        { forget: true },
      );
    }
    const mail = captureContinuityContext(next.state, ["player", "mara"], "An unrelated greeting", next.at);
    assert(
      !JSON.stringify(mail.prompt.entries).includes(secret),
      "unavailable circumstances neither block shared mail capture nor become learned context",
    );
    await next.service.reconcile(next.now);
    await next.service.handler.generate(next.queued[0].input);
    assert.equal(
      next.calls.length,
      1,
      "all-holder Forget and unrelated-holder-only facts do not block ordinary new opportunities",
    );
  }
});

await runCase("resident-planning/live-scene", async () => {
  function scene(f: ReturnType<typeof fixture>, zoneId: string, startedAt = f.at) {
    return zoneEventScene(
      coerceSession({
        version: 5,
        id: "active-scene",
        placeId: "square",
        placeName: "Square",
        villageSeed: f.state.seed,
        zoneId,
        sceneRevision: 1,
        startedAt,
        lastActivityAt: startedAt,
        status: "active",
        activeIds: ["mara", "leo"],
        participants: ["mara", "leo"].map((characterId) => ({ characterId, name: characterId, doing: "Free time" })),
        sceneAttendance: {
          capturedAt: startedAt,
          layout: captureSceneLayout(f.state.venues[0]),
          occupants: ["mara", "leo"].map((characterId) => ({
            characterId,
            name: characterId,
            doing: "Free time",
            zoneId: f.zone,
          })),
        },
      }),
      f.state.venues[0],
    );
  }
  const local = fixture();
  local.scene(scene(local, local.zone));
  await local.service.reconcile(local.now);
  assert.equal(local.queued.length, 0, "same-zone active local cast is not an absent-player opportunity");
  const queued = fixture();
  await queued.service.reconcile(queued.now);
  queued.scene(scene(queued, queued.zone));
  await assert.rejects(queued.service.handler.generate(queued.queued[0].input), /live Scene/);
  assert.equal(queued.calls.length, 0);
  const remote = fixture();
  remote.scene(scene(remote, "exterior"));
  await remote.service.reconcile(remote.now);
  assert.equal(
    remote.queued[0].input.context.narration.opportunity.kind,
    "encounter",
    "ordinary offscreen dialogue in another actual Zone stays separate",
  );
  const later = fixture();
  await later.service.reconcile(later.now);
  later.scene(scene(later, later.zone, new Date(later.now.getTime() + 60000).toISOString()));
  await later.service.handler.generate(later.queued[0].input);
  assert.equal(later.calls.length, 1, "a later arrival cannot change the earlier admitted audience");
});

await runCase("resident-planning/mail-initiative", async () => {
  const f = fixture(new Date(Date.now() - 120000)),
    mara = continuityActor(f.state, "mara")!,
    leo = continuityActor(f.state, "leo")!;
  for (let index = 0; index < 20; index++)
    retainNativeFact(
      f.state,
      {
        id: "motive-" + index,
        kind: "initialization",
        targetId: "mara",
        revision: 1,
        text: "Mara wants a new studio theme " + index + ". " + "A detailed personal intention. ".repeat(65),
        witnesses: ["mara"],
      },
      f.at,
      { class: "desire", owner: mara },
    );
  retainNativeFact(
    f.state,
    {
      id: "leo-motive",
      kind: "initialization",
      targetId: "leo",
      revision: 1,
      text: "Leo wants a quiet afternoon.",
      witnesses: ["leo"],
    },
    f.at,
    { class: "desire", owner: leo },
  );
  await f.service.reconcile(f.now);
  const first = f.queued[0].input,
    offered = first.context.narration.context.offered.find((row: any) => row.holder.id === "mara").ids;
  assert(offered.length > 0 && offered.length < 20, "the actual bounded capture leaves some motives for later");
  f.payload({ mail: { senderId: "mara", text: "Dear friend, how have you been? — Mara" } });
  const result = await f.service.handler.generate(first);
  f.service.handler.apply(f.state, first, result, { retrying: false });
  const written = f.state.episodes.records.at(-1)!;
  assert.deepEqual(
    written.offered,
    [{ holder: mara, ids: offered }],
    "only the actual writer advances fitted initiative",
  );
  Object.assign(f.state, coerceVillageState(JSON.parse(JSON.stringify(f.state))));
  await f.service.reconcile(new Date(f.now.getTime() + 60000));
  const second = f.queued[1].input.context.narration.context.offered.find((row: any) => row.holder.id === "mara").ids;
  assert(
    second.some((id: string) => !offered.includes(id)),
    "accepted mail rotates bounded motive coverage after cold reopen",
  );
});

await runCase("resident-planning/delayed-meeting", async () => {
  const source = new Date(Date.now() - 3 * 3600000);
  source.setUTCMinutes(0, 0, 0);
  const f = fixture(source),
    local = new ZonedDate(source, "UTC"),
    plan = socialPlanCandidates(f.state, local).find((row) => row.kind === "meeting")!;
  assert(plan);
  acceptSocialPlan(f.state, [plan], plan.id, local);
  const at = new Date(source);
  at.setUTCHours(Math.floor(plan.startMinute / 60), (plan.startMinute % 60) + 1, 0, 0);
  await f.service.reconcile(at, true);
  const input = f.queued[0].input;
  f.payload(f.encounter(input));
  const result = await f.service.handler.generate(input);
  const releaseClock = configureVillageClock({
    now: () => new Date(Date.parse(input.context.narration.context.at) + 3600000),
    observe: async () => null,
  });
  try {
    f.service.handler.apply(f.state, input, result, { retrying: false });
  } finally {
    releaseClock();
  }
  assert.equal(
    f.state.residentPlans.plans.find((row) => row.id === plan.id)!.status,
    "completed",
    "provider delay beyond an unchanged meeting interval does not erase its captured event",
  );
  assert.equal(f.calls.length, 1);
});

await runCase("resident-planning/strict-input", async () => {
  const f = fixture(),
    home = homeFixture("home", "residence"),
    secret = "REMOTE_ROOM_SENTINEL_774";
  home.zones!.find((zone) => zone.kind === "shared-residence")!.description = secret;
  home.residentIds = ["mara"];
  home.occupancy.residentCharacterId = "mara";
  home.access!.managerIds = ["mara"];
  f.state.venues.push(home);
  f.state.venues[0].access!.managerIds = ["mara"];
  f.state.venues[0].zones!.find((zone) => zone.id === f.zone)!.access!.managerIds = ["mara"];
  requestResidenceMove(f.state, "leo", "home", "villager", "", "private-home-request", f.now);
  await f.service.reconcile(f.now);
  const input = f.queued[0].input;
  assert.throws(() => readResidentPlanningInput({ ...input, admitted: { wishes: [] } }));
  f.payload({ ...f.encounter(input), meaning: { wishChanges: [] } });
  await assert.rejects(f.service.handler.generate(input));
  assert.equal(f.calls.length, 1);
  assert.equal(f.state.planningUsage.count, 0);
  assert(!JSON.stringify(f.calls[0]).includes(secret), "valid native scopes do not reveal remote room contents");
  for (const field of [
    "access-zone",
    "access-policy",
    "residence-zone",
    "duplicate-manager",
    "offstage-manager",
    "unrelated-request",
  ]) {
    const corrupt = structuredClone(input),
      capture = corrupt.context.narration;
    if (field === "access-zone") capture.access[0].authorities[0].zones[0].description = secret;
    if (field === "access-policy") capture.access[0].authorities[0].zones[0].policy.description = secret;
    if (field === "residence-zone") capture.residence.homes[0].sleepZones[0].description = secret;
    if (field === "duplicate-manager") capture.access[0].authorities[0].zones[0].policy.managerIds = ["mara", "mara"];
    if (field === "offstage-manager") capture.access[0].authorities[0].actorId = "unrelated";
    if (field === "unrelated-request") {
      capture.residence.requests[0].person = "unrelated";
      capture.residence.requests[0].requiredIds = ["unrelated"];
    }
    assert.throws(() => readResidentPlanningInput(corrupt), undefined, field);
    await assert.rejects(f.service.handler.generate(corrupt));
    assert.equal(f.calls.length, 1, "invalid stored scope is rejected before another provider admission");
    assert(!narrationAccessPrompt(capture.access).includes(secret));
    assert(!narrationResidencePrompt(capture.residence).includes(secret));
  }
});

await runCase("resident-planning/background-recovery", async () => {
  const f = fixture(),
    storage = sceneHistoryFixture(),
    repository = createVillageRepository(() => storage.gate.documents);
  let failPages = false;
  f.state.venues[0].access!.managerIds = ["mara"];
  f.state.venues[0].zones!.find((zone) => zone.id === f.zone)!.access!.managerIds = ["mara"];
  const create = storage.documents.create;
  storage.documents.create = async (input: any) => {
    if (failPages && input.kind === "memory-page") throw Error("injected native page failure");
    return create(input);
  };
  try {
    await repository.mutateAuthority((state) => Object.assign(state, f.state), { memories: true });
    Object.assign(f.state, await repository.readAuthority({ memories: true }));
    await f.service.reconcile(f.now);
    const work = f.queued[0];
    const response = f.encounter(work.input);
    response.encounter.lines[0].text = "Leo, you have standing permission to use this room.";
    f.payload({
      ...response,
      commands: [
        {
          id: "grant",
          type: "permission.grant",
          by: "mara",
          visitor: "leo",
          venue: "square",
          zone: f.zone,
          at: "hello",
          source: ["hello"],
        },
      ],
      requires: ["grant"],
    });
    const worker = createBackgroundWork({
      villagesDocuments: () => storage.gate.documents,
      villagesLogger: () => ({ warn() {}, info() {}, error() {} }),
      readVillageAuthority: (options: any) => repository.readAuthority(options),
      mutateVillageAuthority: (update: any, options: any) => {
        assert.equal(options.memories, true);
        return repository.mutateAuthority(update, options);
      },
      readVillageState: () => {
        throw Error("native planner must use raw authority");
      },
      mutateVillageState: () => {
        throw Error("native planner must publish in its raw root CAS");
      },
      withUsagePurpose: (_purpose: string, run: any) => run(),
      measurePipeline: (_name: string, _facts: any, run: any) => run(),
      runtimeDebug() {},
      backgroundCalls: f.background.backgroundCalls,
      withCurrentJobWrite: (run: any) => repository.withAuthorityLock!(run),
      handlers: [["resident-planning", f.service.handler]],
    } as any);
    await worker.villageBackgroundPresence("planner-test", true);
    failPages = true;
    await worker.queueBackgroundJob(work);
    await worker.settleBackgroundWork();
    const failed = (await worker.backgroundWorkSummaries())[0];
    assert.equal(failed.status, "failed");
    assert.equal(failed.requests, 1);
    assert.equal(f.calls.length, 1);
    assert(
      [...storage.rows.values()].some((row) => row.kind === "background-work" && row.data.hasResult),
      "the actual worker retains its purchased native result before page failure",
    );
    assert.equal((await repository.readAuthority({ memories: true })).planningUsage.count, 0);
    assert.equal(
      (await repository.readAuthority({ memories: true })).venues[0].access!.permissions.length,
      0,
      "a failed history write cannot publish an unaccepted native grant",
    );
    failPages = false;
    await worker.retryBackgroundJob(failed.id, failed.attempt, "retry-native", failed.instanceId);
    await worker.settleBackgroundWork();
    const completed = (await worker.backgroundWorkSummaries())[0],
      accepted = await repository.readAuthority({ memories: true });
    assert.equal(completed.status, "completed");
    assert.equal(accepted.planningUsage.count, 1);
    assert.equal(accepted.venues[0].access!.permissions.length, 1);
    assert.equal(accepted.venues[0].access!.permissions[0].sceneId, null);
    assert(
      ![...storage.rows.values()].some((row) => row.kind === "venue-visit"),
      "actual background native acceptance never creates a fake Scene",
    );
    assert(
      accepted.episodes.records.some((row) => row.opportunity?.id === work.input.context.narration.opportunity.id),
    );
    assert.equal(f.calls.length, 1, "page recovery reuses the saved result with zero further requests");
    await repository.mutateAuthority((state) => {
      state.processedActionIds = [];
      state.villagers[0].incarnation = "replacement";
    });
    await worker.queueBackgroundJob(work);
    await worker.settleBackgroundWork();
    assert.equal((await repository.readAuthority({ memories: true })).planningUsage.count, 1);
    assert.equal(
      f.calls.length,
      1,
      "durable background acceptance wins over bounded action-ID eviction and later identity changes",
    );
  } finally {
    storage.release();
  }
});
