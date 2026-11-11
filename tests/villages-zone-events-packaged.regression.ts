import AdmZip from "adm-zip";
import Fastify from "fastify";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { mock } from "node:test";
import { pathToFileURL } from "node:url";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityViews } from "../packages/villages/src/server/domain/rules/continuity.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { initialOpening } from "../packages/villages/src/server/domain/rules/opening-project.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  SCENE_TERMINAL_PREFIX,
  terminalForScene,
} from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import {
  authorSceneFixture,
  authorVillageFixture,
  fixtureSceneState,
  storedVillage,
} from "./helpers/village-storage.fixture.js";

// Use the exact packaged server with real HTTP handlers and synthetic host I/O.
const receipt = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8"));
const zip = new AdmZip(receipt.retainedArchivePath ?? receipt.archivePath ?? receipt.archive);
const packagedServer = zip.getEntries().find((entry) => entry.entryName.endsWith("server.mjs"));
assert(packagedServer);
assert.deepEqual(packagedServer.getData(), await readFile("packages/villages/server.mjs"));
const { activate } = await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
// Load the archive's Date subclasses before installing MockDate.
mock.timers.enable({ apis: ["Date"], now: Date.now() });
const at = new Date().toISOString();
const people = [
  { characterId: "aqua", name: "Aqua", zoneId: "terrace" },
  { characterId: "feddy", name: "Feddy Fastbayer", zoneId: "terrace" },
  { characterId: "neighbor", name: "Neighbor", zoneId: "kitchen" },
  { characterId: "distant", name: "Distant Resident", zoneId: "bedroom" },
];
const placeId = "harbour",
  sceneId = "harbour-scene";
const venue = venueFixture({
  id: placeId,
  name: "The Harbour Terrace",
  classes: ["other"],
  zones: [
    {
      ...defaultVenueSpace("other", "An outdoor approach."),
      id: "exterior",
      name: "Entrance",
      kind: "exterior",
      seen: true,
      connectedTo: ["terrace"],
    },
    {
      ...defaultVenueSpace("other", "A terrace facing the harbour."),
      id: "terrace",
      name: "Terrace",
      kind: "public",
      seen: true,
      connectedTo: ["exterior", "kitchen"],
    },
    {
      ...defaultVenueSpace("other", "A kitchen with stone counters."),
      id: "kitchen",
      name: "Kitchen",
      kind: "public",
      connectedTo: ["terrace", "bedroom"],
    },
    {
      ...defaultVenueSpace("other", "UNSEEN BEDROOM FURNITURE."),
      id: "bedroom",
      name: "Bedroom",
      kind: "restricted",
      connectedTo: ["kitchen"],
      access: {
        mode: "permission-required",
        managerIds: ["distant"],
        memberIds: ["distant"],
        memberRoles: [],
        inviterIds: [],
        visitorHours: "always",
        accompanied: false,
      },
    },
  ],
});
const village = coerceVillageState({
  ...defaultVillageState(),
  seed: "packaged-zone-events",
  foundedAt: at,
  setupAt: at,
  backgroundPace: "off",
  automaticZonePictures: false,
  timeZone: "UTC",
  playerPersonaId: "persona",
  playerPersonaName: "Player",
  playerPersonaIdentity: "A visitor",
  startingHistory: {
    ...defaultVillageState().startingHistory,
    reviewed: Object.fromEntries(people.map(({ characterId }) => [characterId, "resident-" + characterId])),
  },
  venues: [venue],
  villagers: people.map(({ characterId, name, zoneId }) => {
    const block = {
      startMinute: 0,
      endMinute: 1440,
      activity: "Passing the time",
      venueId: placeId,
      zoneId,
      status: "online" as const,
      flexible: true,
    };
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long" }).format(new Date(at));
    const agenda = agendaFixture({
      day: [block],
      generatedAt: at,
      personalizationPending: false,
      activeDay: {
        dateKey: at.slice(0, 10),
        weekday: weekday as NonNullable<ReturnType<typeof agendaFixture>["activeDay"]>["weekday"],
        blocks: [block],
        scheduleInformed: false,
      },
    });
    return {
      characterId,
      incarnation: "resident-" + characterId,
      letterFontId: "caveat",
      addedAt: at,
      cardSnapshot: {
        id: characterId,
        name,
        description: "An authored resident.",
        sourceStatus: "available",
        capturedAt: at,
        revision: 1,
      },
      agenda,
    };
  }),
});
const location = village.venues[0]!;
for (const zone of location.zones!)
  initializeRoomContinuity(village, location.id, zone.id, zone.description, "authored", at);
const occupants = people.map((person) => ({ ...person, doing: "Passing the time" }));
const scene = coerceSession({
  version: 5,
  sceneRevision: 1,
  id: sceneId,
  placeId,
  placeName: location.name,
  zoneId: "terrace",
  area: "public",
  villageSeed: village.seed,
  status: "active",
  startedAt: at,
  lastActivityAt: at,
  activeIds: ["aqua", "feddy"],
  participants: occupants.filter(({ zoneId }) => zoneId === "terrace"),
  sceneAttendance: { capturedAt: at, layout: captureSceneLayout(location), occupants },
  accompanying: people.map(({ characterId, zoneId }) => ({ characterId, zoneId })),
});
scene.continuity = captureSceneContinuity(village, scene, Date.parse(at));

const villageRecordId = "villages-village";
const sceneRecordId = "villages-venue-visit-" + sceneId;
const records = new Map<string, any>();
function seed(id: string, kind: string, data: unknown) {
  records.set(id, { id, kind, packageId: "villages", data, revision: 1, createdAt: at, updatedAt: at });
}
seed(villageRecordId, "village", authorVillageFixture(records, village));
seed(sceneRecordId, "venue-visit", authorSceneFixture(records, scene, village));
seed("villages-active-venue", "venue-active", { sessionId: sceneId, placeId });
const savedScene = () => fixtureSceneState(records.get(sceneRecordId).data, records);
const turnOf = (id: string) => savedScene().submissions.find((turn) => turn.id === id);
const episodeOf = (id: string) =>
  storedVillage(records).episodes.records.find((episode) => episode.submissionId === id);
type Fault = { id: string; owner: "outbox" | "world"; time: "before" | "after" };
let fault: Fault | undefined;
let failGatheringCompletion = false;
const clone = structuredClone;
const documents = {
  getById: async (_package: string, id: string) => clone(records.get(id) ?? null),
  list: async (_package: string, kind: string) =>
    [...records.values()].filter((row) => row.kind === kind).map((row) => clone(row)),
  async create(input: any) {
    assert(!records.has(input.id), input.id);
    const row = { ...clone(input), revision: 1 };
    records.set(input.id, row);
    return clone(row);
  },
  async update(input: any) {
    const prior = records.get(input.id);
    if (!prior || prior.revision !== input.expectedRevision) return null;
    const row = { ...prior, data: clone(input.data), revision: prior.revision + 1 };
    if (failGatheringCompletion && input.id === villageRecordId && row.data.opening?.stage === "complete") {
      failGatheringCompletion = false;
      throw Error("Injected failure before gathering completion");
    }
    let injected: Fault | undefined;
    if (fault) {
      const outbox =
        fault.owner === "outbox" &&
        input.id === sceneRecordId &&
        !turnOf(fault.id) &&
        fixtureSceneState(row.data, records).submissions.some((entry) => entry.id === fault!.id);
      const world =
        fault.owner === "world" &&
        input.id === villageRecordId &&
        row.data.memoryHead?.id !== prior.data.memoryHead?.id &&
        turnOf(fault.id)?.acceptance.status === "pending";
      if (outbox || world) {
        injected = fault;
        fault = undefined;
      }
    }
    if (injected?.time === "before") throw Error("Injected failure before " + injected.owner + " save");
    records.set(input.id, row);
    if (injected?.time === "after") throw Error("Injected acknowledgement loss after " + injected.owner + " save");
    return clone(row);
  },
  remove: async (_package: string, id: string, revision: number) =>
    records.get(id)?.revision === revision && records.delete(id),
};

let completions = 0;
let answer: { content: string; finishReason: string } | undefined;
let lastInput = "";
const model = {
  connectionId: "synthetic",
  model: "fixture",
  maxContext: 64000,
  maxOutputTokens: 4096,
  fitContext: (messages: any[], options: any) => ({ messages, ...options, trimmed: false }),
  async chatComplete(messages: { role: string; content: string }[]) {
    completions++;
    assert.match(messages[0].content, /GM of Villages/);
    assert.equal(messages.at(-1)?.role, "user");
    lastInput = messages.at(-1)!.content;
    assert(answer, "Only an explicitly supplied synthetic response may dispatch");
    const selected = answer;
    answer = undefined;
    return { ...selected, usage: { inputTokens: 10, outputTokens: 10 } };
  },
};
const runtime = {
  persistence: { documents },
  resources: {
    listCharacters: async () =>
      people.map(({ characterId: id, name }) => ({
        id,
        revision: 1,
        data: { id, name, description: "An authored resident." },
      })),
    listPersonas: async () => [{ id: "persona", data: { name: "Player", description: "A visitor" } }],
    listLorebooks: async () => [],
    listEligibleLorebookEntries: async () => [],
  },
  languageModels: { resolve: async () => model, resolveForRequest: async () => model },
  json: { parseJsonish: JSON.parse },
  logger: { info() {}, warn() {}, error() {}, debug() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ settings: {} }),
};
let app = Fastify();
let stop: (() => Promise<void>) | undefined;
async function start() {
  stop = await activate({
    api: {
      runtime,
      registerPrivilegedRoutes: async (routes: any, options: any) => {
        await app.register(
          async (instance) =>
            routes(
              Object.fromEntries(
                ["get", "post", "put", "patch", "delete", "addContentTypeParser"].map((method) => [
                  method,
                  (instance as any)[method].bind(instance),
                ]),
              ),
            ),
          options,
        );
        return () => app.close();
      },
    },
  });
}
async function restart(baseline?: typeof records) {
  await stop?.();
  stop = undefined;
  await app.close();
  if (baseline) {
    records.clear();
    for (const [id, row] of clone(baseline)) records.set(id, row);
  }
  app = Fastify();
  await start();
}
const roomUrl = "/rooms/" + sceneId;
async function request(url: string, payload?: object, status = 200) {
  const response = await app.inject({
    method: payload === undefined ? "GET" : "POST",
    url: "/api/villages" + url,
    ...(payload === undefined ? {} : { payload }),
  });
  assert.equal(response.statusCode, status, url + " " + response.body);
  return response.json();
}
const submit = (id: string, message = "I watch the water.") => ({
  sessionId: sceneId,
  submissionId: id,
  message,
  mode: "chat",
  targetId: "",
  expectedSceneRevision: savedScene().sceneRevision,
});
const provide = (raw: object) => (answer = { content: JSON.stringify(raw), finishReason: "stop" });
async function turn(id: string, raw: object, message?: string) {
  const payload = submit(id, message);
  provide(raw);
  const before = completions;
  const result = await request("/rooms/turn", payload);
  assert.equal(lastInput, payload.message);
  assert.equal(completions, before + 1);
  assert.equal(turnOf(id)?.acceptance.status, "applied");
  const episode = episodeOf(id);
  assert.equal(episode?.privateInput, payload.message);
  assert.equal(turnOf(id)?.episodeId, episode?.id);
  await request("/rooms/turn", payload);
  assert.equal(completions, before + 1, "Committed replay cannot purchase a replacement");
  return result;
}
async function history(scope: string) {
  return request(roomUrl + "/history?" + new URLSearchParams({ scope }));
}

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => Response.json([]);
try {
  await start();
  await request("");
  const opening = await request("/rooms/active");
  assert.equal(opening.session.id, sceneId);
  assert.deepEqual(opening.session.activeIds.toSorted(), ["aqua", "feddy"]);
  assert.equal(completions, 0, "Activation and reading prepare no model work");
  const baseline = clone(records);
  await request("/rooms/zone", { sessionId: sceneId, expectedSceneRevision: savedScene().sceneRevision }, 400);
  await request("/rooms/enter-private", { sessionId: sceneId, ownerId: "distant" }, 404);
  for (const mode of ["ask", "act", "fulfill", "leave", undefined])
    await request("/rooms/turn", { ...submit("unsupported-" + String(mode)), mode }, 400);
  assert.deepEqual(records, baseline);
  assert.equal(completions, 0);

  const spoken = "We can discuss the harbour tomorrow.";
  const original = "  I privately think of the hidden brass key.\nI say, “" + spoken + "”  🪑";
  const ordinary = await turn(
    "mixed",
    {
      segments: [{ id: "reply", kind: "dialogue", speakerId: "aqua", text: "Tomorrow sounds good." }],
      keep: [
        {
          id: "remember",
          for: ["aqua", "player"],
          class: "information",
          text: spoken,
          source: [{ input: spoken, ground: { kind: "spoken", to: ["aqua"] } }],
        },
      ],
    },
    original,
  );
  const mixed = episodeOf("mixed")!;
  const savedInput = savedScene().lines.find((line) => line.kind === "input")!;
  assert.equal(savedInput.content, original);
  assert.deepEqual(savedInput.heardBy, []);
  assert(mixed.grounding.some((source) => source.excerpt === spoken && source.kind === "speech"));
  assert(!JSON.stringify(mixed.grounding).includes("hidden brass key"));
  const logicalWorld = storedVillage(records);
  assert(
    continuityViews(logicalWorld.continuity, continuityActor(logicalWorld, "aqua")!, at, new Set()).some(
      (view) => view.version.text === spoken,
    ),
  );
  const scope = ordinary.session.playback.scope;
  for (const url of ["/history", "/playback"]) {
    const response = await request(roomUrl + url + "?" + new URLSearchParams({ scope }));
    const input = response.lines.find((line: any) => line.kind === "input");
    assert.equal(input.content, original);
    assert.deepEqual(input.heardBy ?? [], []);
    assert.doesNotMatch(JSON.stringify(response), /"readset"|"grounding"|"checkpoints"|"attempts"/);
  }
  await request("/rooms/turn", { ...submit("mixed"), message: original + " changed" }, 409);
  const gathering = clone(records);
  const openingRecord = initialOpening(["aqua", "feddy"], placeId, "founding");
  openingRecord.gatheringSceneId = sceneId;
  gathering.get(villageRecordId).data.opening = openingRecord;
  gathering.get(sceneRecordId).data.openingGatheringId = openingRecord.id;

  const beforeContact = completions;
  provide({ segments: [{ kind: "dialogue", speakerId: "aqua", text: "I am here." }] });
  await request("/rooms/turn", {
    ...submit("contact"),
    mode: "contact",
    contact: { kind: "call", boundaryZoneId: "kitchen" },
  });
  assert.equal(completions, beforeContact + 1);
  assert.equal(turnOf("contact")?.mode, "contact");
  const distant = await turn("distant", {
    segments: [
      { kind: "dialogue", speakerId: "distant", text: "PRIVATE WORDS NEVER DELIVERED", delivery: "shout" },
      { kind: "narration", text: "You pause at the railing." },
    ],
  });
  const distantPublic = JSON.stringify(await history(scope));
  assert.match(distantPublic, /indistinct/);
  assert.doesNotMatch(
    JSON.stringify(distant) + distantPublic,
    /PRIVATE WORDS NEVER DELIVERED|Distant Resident|UNSEEN BEDROOM FURNITURE|"soundOnly"/,
  );
  await turn("local", {
    segments: [{ kind: "dialogue", speakerId: "aqua", text: "Only the terrace hears these words." }],
  });
  const local = episodeOf("local")!.segments[0];
  assert.deepEqual(local.heardBy.toSorted(), ["aqua", "feddy", "player"]);
  assert.deepEqual(local.soundOnly?.characterIds, ["neighbor"]);
  const beforeRestart = completions;
  await restart();
  assert.doesNotMatch(JSON.stringify(await history(scope)), /PRIVATE WORDS NEVER DELIVERED|Distant Resident/);
  assert.equal(completions, beforeRestart);

  const arrival = await turn("crossing", {
    segments: [
      { id: "before", kind: "dialogue", speakerId: "neighbor", text: "PRIVATE WORDS BEFORE ARRIVAL" },
      {
        id: "cross",
        kind: "narration",
        text: "Neighbor steps out of the Kitchen onto the Terrace beside you.",
        requires: ["arrive"],
      },
      {
        id: "after",
        kind: "dialogue",
        speakerId: "neighbor",
        text: "I work in the harbour workshop.",
        delivery: "whisper",
        targetId: "player",
      },
    ],
    commands: [
      {
        id: "arrive",
        type: "move",
        who: "neighbor",
        to: "terrace",
        at: "cross",
        source: [{ segment: "cross", perceive: { kind: "seen", by: ["player"] } }],
      },
    ],
    keep: [
      {
        for: ["player"],
        class: "information",
        text: "Neighbor works in the harbour workshop.",
        source: [{ segment: "after", perceive: { kind: "heard", by: ["player"] } }],
      },
    ],
  });
  const moved = episodeOf("crossing")!;
  assert(!moved.segments[0].heardBy.includes("player"));
  assert.deepEqual(moved.segments[2].heardBy.toSorted(), ["neighbor", "player"]);
  assert.equal(moved.commandReceipts[0].movement?.zoneId, "terrace");
  const arrivedPublic = JSON.stringify(arrival) + JSON.stringify(await history(scope));
  assert.match(arrivedPublic, /harbour workshop/);
  assert.doesNotMatch(arrivedPublic, /PRIVATE WORDS BEFORE ARRIVAL/);

  await restart(baseline);
  await request("/rooms/end", { sessionId: sceneId, expectedSceneRevision: savedScene().sceneRevision });
  const visits: string[] = [];
  for (const note of ["I am making cedar shelves.", "I am learning glassblowing."]) {
    const opened = (await request("/rooms", { venueId: placeId, zoneId: "terrace" })).session;
    assert.equal(opened.status, "opening");
    visits.push(opened.id);
    provide({
      segments: [{ id: "news", kind: "dialogue", speakerId: "aqua", text: note }],
      keep: [{ id: "news", for: ["player"], class: "information", text: note, source: [{ segment: "news" }] }],
    });
    const before = completions;
    const greeted = (await request("/rooms/greet", { sessionId: opened.id })).session;
    assert.equal(greeted.status, "active");
    assert.equal(completions, before + 1);
    await request("/rooms/greet", { sessionId: opened.id });
    assert.equal(completions, before + 1, "Repeating a greeting replays only the same Scene");
    await request("/rooms/end", { sessionId: opened.id, expectedSceneRevision: greeted.sceneRevision });
  }
  assert.equal(new Set(visits).size, 2);
  const greetings = storedVillage(records).episodes.records.filter((episode) => episode.submissionId === "greeting");
  assert.deepEqual(
    greetings.map((episode) => episode.sceneId),
    visits,
  );
  assert.equal(new Set(greetings.flatMap((episode) => episode.continuityVersionIds)).size, 2);

  await restart(baseline);
  const validKeep = {
    id: "news",
    for: ["player"],
    class: "information",
    text: "The harbour workshop is open.",
    source: [{ segment: "news" }],
  };
  const rejectedKeep = { ...validKeep, id: "discard", class: "unknown-class", independent: true };
  await turn("optional-effect", {
    segments: [{ id: "news", kind: "dialogue", speakerId: "aqua", text: validKeep.text }],
    keep: [validKeep, rejectedKeep],
  });
  const optionalEpisode = episodeOf("optional-effect")!;
  assert.equal(optionalEpisode.continuityVersionIds.length, 1);
  assert.deepEqual(
    optionalEpisode.rejectedEffects?.map(({ id }) => id),
    ["discard"],
  );
  assert.deepEqual(turnOf("optional-effect")?.acceptance.rejected, optionalEpisode.rejectedEffects);

  const held = submit("required-effect", "  I privately reconsider my plans.  ");
  const beforeHeld = completions;
  provide({
    segments: [{ id: "news", kind: "dialogue", speakerId: "aqua", text: validKeep.text, requires: ["discard"] }],
    keep: [rejectedKeep],
  });
  await request("/rooms/turn", held, 500);
  assert.equal(turnOf(held.submissionId)?.acceptance.status, "held");
  assert.equal(turnOf(held.submissionId)?.narration?.readset.source.input, held.message);
  assert.equal(episodeOf(held.submissionId), undefined);
  await restart();
  await request(roomUrl + "/changes/replay", {});
  assert.equal(turnOf(held.submissionId)?.acceptance.status, "held");
  assert.equal(completions, beforeHeld + 1, "A held reply survives restart and replay without another purchase");
  const replacement = { ...submit("replacement"), replaceOfOperationId: held.submissionId };
  await request("/rooms/turn", { ...replacement, retryOfAttemptId: "wrong-attempt" }, 409);
  assert.equal(completions, beforeHeld + 1);
  provide({ segments: [{ kind: "narration", text: "You watch the light on the water." }] });
  await request("/rooms/turn", { ...replacement, retryOfAttemptId: savedScene().operation?.attemptId });
  assert.equal(completions, beforeHeld + 2);
  assert.equal(turnOf(held.submissionId)?.acceptance.status, "abandoned");
  assert.equal(episodeOf(held.submissionId), undefined);
  assert.equal(episodeOf(replacement.submissionId)?.privateInput, replacement.message);

  const beforeGathering = completions;
  const activeRecordId = "villages-active-venue";
  for (const state of ["active", "closed-with-pointer", "closed-without-pointer"] as const) {
    const interrupted = clone(gathering);
    const interruptedScene = interrupted.get(sceneRecordId).data;
    if (state !== "active") Object.assign(interruptedScene, { status: "closed", endedAt: at, endReason: "player" });
    if (state !== "closed-with-pointer") interrupted.delete(activeRecordId);
    await restart(interrupted);
    if (state === "closed-with-pointer") {
      assert.equal((await request("/rooms/active")).session, null);
    } else {
      const recovered = (await request("/rooms", { venueId: placeId, zoneId: "terrace" })).session;
      assert.equal(recovered.id, sceneId);
      assert.equal(recovered.status, state === "active" ? "active" : "closed");
    }
    assert.equal((await request("/rooms/active")).session?.id, state === "active" ? sceneId : undefined);
    assert.equal(storedVillage(records).opening?.stage, state === "active" ? "gathering" : "complete");
    assert.equal(savedScene().lines.find((line) => line.kind === "input")?.content, original);
    assert.equal(completions, beforeGathering, "Gathering recovery cannot dispatch new narration");
  }

  const wrongGathering = clone(gathering);
  wrongGathering.get(sceneRecordId).data.openingGatheringId = "different-founding";
  wrongGathering.delete(activeRecordId);
  await restart(wrongGathering);
  await request("/rooms", { venueId: placeId, zoneId: "terrace" }, 409);
  assert.equal((await request("/rooms/active")).session, null);
  assert.equal(storedVillage(records).opening?.stage, "gathering");
  assert.equal(completions, beforeGathering);

  await restart(gathering);
  failGatheringCompletion = true;
  await request("/rooms/end", { sessionId: sceneId, expectedSceneRevision: savedScene().sceneRevision }, 500);
  assert.equal(failGatheringCompletion, false);
  assert.equal(savedScene().status, "closed");
  assert.equal(savedScene().operation?.status, "interrupted");
  assert.equal(storedVillage(records).opening?.stage, "gathering");
  const failedClose = clone(records);
  await request("/rooms/end", {
    sessionId: sceneId,
    expectedSceneRevision: savedScene().sceneRevision,
    retryOfAttemptId: savedScene().operation?.attemptId,
  });
  assert.equal(storedVillage(records).opening?.stage, "complete");
  assert.equal(savedScene().operation?.status, "complete");
  assert.equal((await request("/rooms/active")).session, null);
  await restart(failedClose);
  assert.equal(storedVillage(records).opening?.stage, "complete", "Startup settles the marker from the saved close");
  assert.equal(savedScene().operation?.status, "complete");
  assert.equal(completions, beforeGathering);

  const retiredGathering = clone(gathering);
  retiredGathering.delete(activeRecordId);
  retiredGathering.delete(sceneRecordId);
  const terminalId = SCENE_TERMINAL_PREFIX + sceneId;
  const terminal = terminalForScene(savedScene(), records.get(sceneRecordId).revision);
  retiredGathering.set(terminalId, { id: terminalId, kind: "scene-terminal", packageId: "villages", data: terminal });
  await restart(retiredGathering);
  await request("/rooms", { venueId: placeId, zoneId: "terrace" }, 409);
  assert(!records.has(sceneRecordId), "A terminal receipt rules out reusing a retired Scene identity");
  assert.equal(completions, beforeGathering);

  const freshGathering = clone(baseline);
  freshGathering.delete(activeRecordId);
  freshGathering.delete(sceneRecordId);
  freshGathering.get(villageRecordId).data.opening = initialOpening(["aqua", "feddy"], placeId, "fresh-founding");
  await restart(freshGathering);
  const founded = (await request("/rooms", { venueId: placeId, zoneId: "terrace" })).session;
  assert.equal(founded.status, "opening");
  assert.equal(storedVillage(records).opening?.gatheringSceneId, founded.id);
  assert.equal((await request("/rooms/active")).session?.id, founded.id);
  assert.equal(completions, beforeGathering);

  // Restore only the synthetic documents between independent failure scenarios.
  for (const owner of ["outbox", "world"] as const) {
    for (const time of ["before", "after"] as const) {
      await restart(baseline);
      const id = owner + "-" + time;
      const payload = submit(id);
      const text = "Exactly once prose " + id;
      const before = completions;
      provide({ segments: [{ kind: "narration", text }] });
      fault = { id, owner, time };
      await request("/rooms/turn", payload, 500);
      assert.equal(fault, undefined, "The intended storage boundary was exercised");
      assert.equal(completions, before + 1);
      assert.equal(!!episodeOf(id), owner === "world" && time === "after");
      await restart();
      await request("/rooms/turn", { ...payload, retryOfAttemptId: savedScene().operation?.attemptId });
      assert.equal(completions, before + 1, "Storage recovery reuses the purchased response");
      assert.equal(savedScene().lines.filter((line) => line.content === text).length, 1);
      assert.equal(savedScene().submissions.filter((entry) => entry.id === id).length, 1);
      assert.equal(storedVillage(records).episodes.records.filter((entry) => entry.submissionId === id).length, 1);
    }
  }
} finally {
  await stop?.();
  await app.close();
  globalThis.fetch = originalFetch;
  mock.timers.reset();
}
