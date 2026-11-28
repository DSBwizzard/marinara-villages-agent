import { sharedVenuesFixture } from "./helpers/venues.fixture.js";
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
import { applyAccessCommand } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  SCENE_TERMINAL_PREFIX,
  terminalForScene,
} from "../packages/villages/src/server/features/scenes/scene-terminal.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { sceneFixtureText } from "./helpers/tagged-scene.fixture.js";
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
  venues: [venue, ...sharedVenuesFixture()],
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
const contactMessage = "I call out across the terrace.";
const model = {
  connectionId: "synthetic",
  model: "fixture",
  maxContext: 64000,
  maxOutputTokens: 4096,
  fitContext: (messages: any[], options: any) => ({ messages, ...options, trimmed: false }),
  async chatComplete(messages: { role: string; content: string }[], options?: { responseFormat?: unknown }) {
    completions++;
    assert.match(messages[0].content, /GM of Villages/);
    const prompt = messages.map(({ content }) => content).join("\n");
    assert.equal(messages.at(-2)?.role, "user");
    lastInput = messages.at(-2)!.content;
    if (lastInput === contactMessage) {
      assert.match(prompt, /Put native actions on separate \[command\] lines/u);
      assert.match(prompt, /Contact context: .*"boundaryZoneId":"kitchen"/u);
      assert.doesNotMatch(prompt, /"kind":"knock"|doorway contact/iu);
    }
    if (prompt.includes("The place can initiate this even when nobody is present.")) {
      assert.match(messages.at(-1)!.content, /Use Narration: text/);
      assert.doesNotMatch(messages.at(-1)!.content, /one JSON object/);
      assert.equal(options?.responseFormat, undefined);
    }
    assert(answer, "Only an explicitly supplied synthetic response may dispatch");
    const selected = answer;
    answer = undefined;
    return {
      ...selected,
      content: sceneFixtureText(messages, selected.content),
      usage: { inputTokens: 10, outputTokens: 10 },
    };
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
async function setSpontaneousEvents(value: boolean) {
  const response = await app.inject({
    method: "PATCH",
    url: "/api/villages/settings",
    payload: { spontaneousEvents: value },
  });
  assert.equal(response.statusCode, 200, response.body);
  assert.equal(response.json().settings.spontaneousEvents, value);
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
async function turn(id: string, raw: object, message?: string, contacted?: string) {
  const payload = {
    ...submit(id, message),
    ...(contacted ? { mode: "contact", contact: { kind: "call", boundaryZoneId: contacted } } : {}),
  };
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
  const contact = {
    ...submit("contact", contactMessage),
    mode: "contact",
    contact: { boundaryZoneId: "kitchen" },
  };
  await request("/rooms/turn", contact);
  await request("/rooms/turn", {
    ...contact,
    contact: { ...contact.contact, kind: "knock" },
  });
  assert.equal(completions, beforeContact + 1);
  assert.equal(turnOf("contact")?.mode, "contact");
  const doorway = await turn(
    "doorway-call",
    {
      segments: [
        { kind: "dialogue", speakerId: "neighbor", text: "I can hear you from the Kitchen.", delivery: "shout" },
      ],
    },
    "Anyone there?",
    "kitchen",
  );
  const doorwayPublic = JSON.stringify(await history(scope));
  assert.match(doorwayPublic, /I can hear you from the Kitchen/);
  assert.doesNotMatch(JSON.stringify(doorway) + doorwayPublic, /Distant Resident|UNSEEN BEDROOM FURNITURE|"soundOnly"/);
  await turn("local", {
    segments: [{ kind: "dialogue", speakerId: "aqua", text: "Only the terrace hears these words." }],
  });
  const local = episodeOf("local")!.segments[0];
  assert.deepEqual(local.heardBy.toSorted(), ["aqua", "feddy", "player"]);
  assert.equal(local.soundOnly, undefined);
  const beforeRestart = completions;
  await restart();
  assert.doesNotMatch(JSON.stringify(await history(scope)), /indistinct|Distant Resident/);
  assert.equal(completions, beforeRestart);

  const arrival = await turn(
    "crossing",
    {
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
    },
    "I ask Neighbor to come onto the Terrace.",
    "kitchen",
  );
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
    assert.equal(opened.status, "active", "an occupied ordinary visit is quiet with spontaneous events off");
    visits.push(opened.id);
    const record = records.get("villages-venue-visit-" + opened.id)!;
    record.data = { ...record.data, status: "opening", visitEvent: "opening" };
    await restart();
    await setSpontaneousEvents(true);
    provide({
      segments: [{ id: "news", kind: "dialogue", speakerId: "aqua", text: note }],
      keep: [{ id: "news", for: ["player"], class: "information", text: note, source: [{ segment: "news" }] }],
    });
    const before = completions;
    const greeted = (await request("/rooms/greet", { sessionId: opened.id })).session;
    assert.equal(greeted.status, "active");
    assert.equal(records.get("villages-venue-visit-" + opened.id)!.data.visitEvent, undefined);
    assert.equal(completions, before + 1);
    await request("/rooms/greet", { sessionId: opened.id });
    assert.equal(completions, before + 1, "Repeating a greeting replays only the same Scene");
    await request("/rooms/end", { sessionId: opened.id, expectedSceneRevision: greeted.sceneRevision });
    await setSpontaneousEvents(false);
  }
  assert.equal(new Set(visits).size, 2);
  const greetings = storedVillage(records).episodes.records.filter((episode) => episode.submissionId === "greeting");
  assert.deepEqual(
    greetings.map((episode) => episode.sceneId),
    visits,
  );
  assert.equal(new Set(greetings.flatMap((episode) => episode.continuityVersionIds)).size, 2);

  const arrivalAtEntrance = (await request("/rooms", { venueId: placeId, zoneId: "exterior" })).session;
  const entranceRecord = records.get("villages-venue-visit-" + arrivalAtEntrance.id)!;
  entranceRecord.data = { ...entranceRecord.data, status: "opening", visitEvent: "place" };
  await restart();
  const beforeDisabled = completions;
  const quietEntrance = (await request("/rooms/greet", { sessionId: arrivalAtEntrance.id })).session;
  assert.equal(quietEntrance.status, "active");
  assert.equal(completions, beforeDisabled, "a persisted visit event is skipped if the setting is off before dispatch");
  await request("/rooms/end", { sessionId: quietEntrance.id, expectedSceneRevision: quietEntrance.sceneRevision });
  const placeArrival = (await request("/rooms", { venueId: placeId, zoneId: "exterior" })).session;
  const placeRecord = records.get("villages-venue-visit-" + placeArrival.id)!;
  placeRecord.data = { ...placeRecord.data, status: "opening", visitEvent: "place" };
  await restart();
  await setSpontaneousEvents(true);
  const readyEntrance = (await request("/rooms/active")).session;
  assert.equal(readyEntrance.visitEventOpening, true);
  assert.deepEqual(readyEntrance.activeIds, []);
  answer = {
    content: "A gust rattles the shutters.",
    finishReason: "stop",
  };
  const greetedEntrance = (await request("/rooms/greet", { sessionId: placeArrival.id })).session;
  assert.equal(greetedEntrance.status, "active");
  assert.equal(completions, beforeDisabled + 1);
  assert.match(JSON.stringify(greetedEntrance.lines), /gust rattles the shutters/);
  assert.equal(greetedEntrance.zoneId, "exterior");
  await request("/rooms/greet", { sessionId: placeArrival.id });
  assert.equal(completions, beforeDisabled + 1, "the saved opening never dispatches again");

  await setSpontaneousEvents(false);
  const entranceId = placeArrival.id;
  const savedEntrance = () => fixtureSceneState(records.get("villages-venue-visit-" + entranceId)!.data, records);
  async function entranceTurn(submissionId: string, message: string, content: string, contact = false, status = 200) {
    const { session: current } = await request("/rooms/active");
    assert.equal(current.id, entranceId);
    const payload = {
      sessionId: entranceId,
      submissionId,
      message,
      mode: contact ? "contact" : "chat",
      expectedSceneRevision: current.sceneRevision,
      ...(contact ? { targetId: "aqua", contact: { kind: "call", boundaryZoneId: "terrace" } } : {}),
    };
    answer = { content, finishReason: "stop" };
    const before = completions;
    const result = await request("/rooms/turn", payload, status);
    if (status === 200) await request("/rooms/turn", payload);
    assert.equal(completions, before + 1);
    return status === 200 ? result.session : result;
  }

  const untagged = await entranceTurn(
    "entrance-untagged",
    "I throw a rock at the window.",
    "Aqua opens the door and stands in the doorway.",
    false,
    502,
  );
  assert.doesNotMatch(JSON.stringify(untagged), /Aqua opens the door/);
  assert.equal(episodeOf("entrance-untagged"), undefined);
  assert.deepEqual(savedEntrance().activeIds, []);
  assert.deepEqual(savedEntrance().doorwayContacts, []);
  assert.equal(
    savedEntrance().sceneAttendance?.occupants.find(({ characterId }) => characterId === "aqua")?.zoneId,
    "terrace",
  );

  const unbound = await entranceTurn(
    "entrance-unbound",
    "I tap the window and wait.",
    "Narration [scene]: The tap makes the glass rattle once.\nNarration: Aqua opens the door and stands beside you.",
  );
  assert.deepEqual(unbound.activeIds, []);
  assert.match(JSON.stringify(unbound.lines), /The tap makes the glass rattle once/);
  assert.doesNotMatch(JSON.stringify(unbound.lines), /Aqua/);
  const cue = await entranceTurn(
    "entrance-cue",
    "Did anybody notice?",
    "Narration [scene]: A floorboard creaks across the threshold.\nNarration: [actors aqua]: Aqua is still leaning beside you.",
  );
  assert.match(JSON.stringify(cue.lines), /A floorboard creaks across the threshold/);
  assert.doesNotMatch(JSON.stringify(cue.lines), /Aqua|leaning/);
  assert.deepEqual(savedEntrance().doorwayContacts, []);
  assert.deepEqual(episodeOf("entrance-cue")!.segments[0].heardBy, ["player"]);

  const inaudible = await entranceTurn(
    "entrance-inaudible",
    "I listen at the entrance.",
    "[aqua]: Keep these words on the terrace.",
    false,
    502,
  );
  assert.deepEqual(inaudible.sceneFailure.diagnostic.checks, [
    { code: "no_perceived_scene_lines", path: ["segments"] },
  ]);
  assert.doesNotMatch(JSON.stringify(inaudible), /Keep these words on the terrace/);
  assert.equal(episodeOf("entrance-inaudible"), undefined);
  assert.deepEqual(savedEntrance().doorwayContacts, []);

  const offstage = await entranceTurn(
    "entrance-offstage",
    "I listen for movement.",
    'Narration!: Distant Resident saunters up to you.\n[command]: {"type":"move","who":"distant","to":"exterior"}\n[distant]: You found me.',
    false,
    502,
  );
  assert.doesNotMatch(JSON.stringify(offstage), /Distant Resident|You found me/);
  assert.equal(episodeOf("entrance-offstage"), undefined);

  const blockedCrossing = await entranceTurn(
    "entrance-invalid-crossing",
    "I wait in the entrance.",
    [
      "Narration [scene]: Rain drips from the eaves.",
      "Narration!: Aqua pushes past the threshold and stands next to you.",
      '[command]: {"type":"move","who":"aqua","to":"exterior","trespass":true}',
      "Narration [actors aqua]: Aqua shakes rain from an umbrella beside you.",
      "[aqua]: I made it.",
    ].join("\n"),
  );
  assert.deepEqual(blockedCrossing.activeIds, []);
  assert.deepEqual(
    blockedCrossing.lines.map(({ content }: { content: string }) => content),
    ["Rain drips from the eaves."],
  );
  assert.equal(episodeOf("entrance-invalid-crossing")!.commandReceipts.length, 0);

  const beforeAnswer = clone(records);
  const contactAnswer = await entranceTurn(
    "entrance-contact-answer",
    'I call toward the terrace, "Is anyone there?"',
    "Narration [scene]: The terrace falls quiet.\nNarration [actors aqua]: Aqua joins you at the entrance.\n[aqua] [to player]: I hear you from here.",
    true,
  );
  assert.match(JSON.stringify(contactAnswer.lines), /I hear you from here/);
  assert.match(JSON.stringify(contactAnswer.lines), /The terrace falls quiet/);
  assert.doesNotMatch(JSON.stringify(contactAnswer.lines), /Aqua joins you/);
  assert.deepEqual(contactAnswer.activeIds, []);
  assert.equal(savedEntrance().doorwayContacts?.[0]?.characterZoneId, "terrace");
  assert.equal(episodeOf("entrance-contact-answer")!.commandReceipts.length, 0);
  const continuedAnswer = await entranceTurn(
    "entrance-contact-continues",
    'I ask, "Can you still hear me?"',
    "Narration [actors aqua]: Aqua sits beside you.\n[aqua] [to player]: Yes, from the terrace.",
  );
  assert.doesNotMatch(JSON.stringify(continuedAnswer.lines), /Aqua sits beside you/);
  assert.match(JSON.stringify(continuedAnswer.lines), /Yes, from the terrace/);
  assert.deepEqual(continuedAnswer.activeIds, []);
  await restart(beforeAnswer);

  const steppedOut = await entranceTurn(
    "entrance-crossing",
    "I wait beside the entrance.",
    [
      "[aqua]: Words from before the crossing.",
      "Narration!: Aqua rounds the corner of the terrace and stops beside the entrance post.",
      '[command]: {"type":"move","who":"aqua","to":"exterior"}',
      "[aqua]: I can talk out here.",
      "Narration [actors aqua]: Aqua brushes dust from a sleeve.",
      "Narration [actors distant]: Distant Resident joins the conversation.",
    ].join("\n"),
  );
  assert.equal(steppedOut.zoneId, "exterior");
  assert.deepEqual(steppedOut.activeIds, ["aqua"]);
  assert.deepEqual(
    steppedOut.participants.map((person: { characterId: string }) => person.characterId),
    ["aqua"],
  );
  assert.match(
    JSON.stringify(steppedOut.lines),
    /Aqua rounds the corner of the terrace and stops beside the entrance post/,
  );
  assert.match(JSON.stringify(steppedOut.lines), /I can talk out here/);
  assert.match(JSON.stringify(steppedOut.lines), /Aqua brushes dust from a sleeve/);
  assert.doesNotMatch(JSON.stringify(steppedOut), /Words from before the crossing|Distant Resident/);
  const crossing = episodeOf("entrance-crossing")!;
  assert.equal(crossing.commandReceipts[0].movement?.from, "terrace");
  assert.deepEqual(crossing.segments[0].heardBy.toSorted(), ["aqua", "feddy"]);
  assert.deepEqual(crossing.segments[2].heardBy.toSorted(), ["aqua", "player"]);
  assert.deepEqual(crossing.segments[3].heardBy.toSorted(), ["aqua", "player"]);
  const steppedBack = await entranceTurn(
    "entrance-crossing-back",
    "I wait while Aqua heads back to the terrace.",
    'Narration!: Aqua lifts a hand in farewell and heads back onto the terrace.\n[command]: {"type":"move","who":"aqua","to":"terrace"}',
  );
  assert.deepEqual(steppedBack.activeIds, []);
  assert.deepEqual(steppedBack.participants, []);
  assert.match(JSON.stringify(steppedBack.lines), /Aqua lifts a hand in farewell and heads back onto the terrace/);
  assert.equal(savedEntrance().doorwayContacts?.[0]?.characterZoneId, "terrace");

  await restart(beforeAnswer);
  const admittedShopkeeper = await entranceTurn(
    "entrance-npc-admission",
    "I tap the window and wait outside.",
    [
      "Narration!: A shopkeeper comes around from the side of the building and stops by the window.",
      '[command]: {"type":"npc.admit","localKey":"new:keeper","name":"Mera","label":"Shopkeeper","characterization":"A shopkeeper finishing her work."}',
      "[new:keeper]: We shut at six.",
    ].join("\n"),
  );
  assert.equal(admittedShopkeeper.activeIds.length, 1);
  const [shopkeeper] = admittedShopkeeper.activeIds;
  assert.match(shopkeeper, /^npc:/u);
  const stillOutside = await entranceTurn(
    "entrance-npc-follow-up",
    "I raise the parcel toward the glass, keeping my feet outside.",
    [
      "Narration [scene]: The parcel catches the light from the window.",
      "Narration: The shopkeeper slips behind the chained door.",
      `Narration: [actors ${shopkeeper}]: She looks at the parcel, then at your face, and doesn't reach for it. Her cloth goes into her apron pocket.`,
      "Mera: That's not from my shelves.",
    ].join("\n"),
  );
  assert.equal(stillOutside.zoneId, "exterior");
  assert.deepEqual(stillOutside.activeIds, [shopkeeper]);
  assert.deepEqual(stillOutside.doorwayContacts, []);
  assert.equal(
    savedEntrance().sceneAttendance?.occupants.find(({ characterId }) => characterId === shopkeeper)?.zoneId,
    "exterior",
  );
  const followUp = episodeOf("entrance-npc-follow-up")!;
  assert.equal(followUp.commandReceipts.length, 0);
  assert.deepEqual(
    followUp.segments.map(({ content, zoneId }) => [content, zoneId]),
    [
      ["The parcel catches the light from the window.", "exterior"],
      [
        "She looks at the parcel, then at your face, and doesn't reach for it. Her cloth goes into her apron pocket.",
        "exterior",
      ],
      ["That's not from my shelves.", "exterior"],
    ],
  );
  assert(followUp.segments.every(({ heardBy }) => heardBy.includes("player") && heardBy.includes(shopkeeper)));

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
  const rejected = await request("/rooms/turn", held, 502);
  assert.equal(rejected.error, "The reply could not be saved.");
  assert.equal(turnOf(held.submissionId)?.acceptance.status, "abandoned");
  assert.equal(turnOf(held.submissionId)?.message, held.message);
  assert.equal(turnOf(held.submissionId)?.narration, undefined);
  assert.equal(episodeOf(held.submissionId), undefined);
  await restart();
  await request(roomUrl + "/changes/replay", {});
  assert.equal(turnOf(held.submissionId)?.acceptance.status, "abandoned");
  assert.equal(completions, beforeHeld + 1, "Restart and refresh do not buy another reply");
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
  const gatheringVillage = freshGathering.get(villageRecordId).data;
  gatheringVillage.opening = initialOpening(["aqua", "feddy"], placeId, "fresh-founding");
  for (const person of gatheringVillage.villagers) {
    if (person.characterId === "distant") continue;
    for (const block of person.agenda.activeDay.blocks)
      block.zoneId = person.characterId === "neighbor" ? "terrace" : "kitchen";
  }
  await restart(freshGathering);
  await request("/rooms", { venueId: placeId, zoneId: "bedroom" }, 409);
  assert.equal(
    storedVillage(records).opening?.gatheringSceneId,
    "",
    "An explicit private target cannot start a gathering",
  );
  const founded = (await request("/rooms", { venueId: placeId })).session;
  assert.equal(founded.zoneId, "terrace", "Opening entry chooses a qualifying public Zone");
  assert.equal(founded.status, "opening");
  assert.equal(storedVillage(records).opening?.gatheringSceneId, founded.id);
  assert.deepEqual(
    founded.activeIds,
    ["aqua", "feddy"],
    "The gathering admits its founders regardless of their routine",
  );
  const overwrittenGathering = clone(records);
  const oldOpening = overwrittenGathering.get("villages-venue-visit-" + founded.id).data;
  oldOpening.sceneAttendance.occupants = people
    .filter(({ characterId }) => characterId !== "distant")
    .map((person) => ({ ...person, zoneId: person.characterId === "neighbor" ? "terrace" : "kitchen" }));
  oldOpening.activeIds = ["neighbor"];
  await restart(overwrittenGathering);
  const beforeGreeting = (await request("/rooms/active")).session;
  assert.equal(beforeGreeting?.id, founded.id);
  assert.deepEqual(beforeGreeting.activeIds, founded.activeIds);
  assert.equal(completions, beforeGathering);
  provide({ segments: [{ kind: "dialogue", speakerId: "aqua", text: "Will you help set out the plates?" }] });
  const greeted = (await request("/rooms/greet", { sessionId: founded.id })).session;
  assert.equal(greeted.status, "active");
  assert.equal(greeted.lines.find((line) => line.speakerId === "aqua")?.content, "Will you help set out the plates?");
  assert.equal(completions, beforeGathering + 1);
  const resumed = (await request("/rooms/active")).session;
  assert.deepEqual(resumed.activeIds, founded.activeIds, "The admitted cast is still present for the player's reply");
  provide({ segments: [{ kind: "dialogue", speakerId: "aqua", text: "Two by the window, please." }] });
  const answered = (
    await request("/rooms/turn", {
      sessionId: founded.id,
      expectedSceneRevision: resumed.sceneRevision,
      submissionId: "first-gathering-response",
      mode: "chat",
      targetId: "aqua",
      message: '"Where do you want the plates?"',
    })
  ).session;
  assert.equal(answered.lines.at(-1)?.content, "Two by the window, please.");
  assert.equal(completions, beforeGathering + 2);
  assert.deepEqual((await request("/rooms/active")).session.activeIds, ["neighbor"], "Routine attendance resumes");

  const pendingEntry = clone(baseline);
  const authority = storedVillage(pendingEntry);
  const home = authority.venues[0];
  const actorIds = ["player", ...people.map(({ characterId }) => characterId)];
  for (const operationId of ["pending-entry", "other-invitation"])
    applyAccessCommand(
      home,
      {
        action: "invite",
        operationId,
        expectedRevision: home.access!.revision,
        zoneId: "bedroom",
        visitorId: "player",
        duration: "visit",
        accompanied: false,
        outsideHours: true,
      },
      "distant",
      at,
      actorIds,
    );
  const pendingOwner = pendingEntry.get(sceneRecordId);
  const pending = fixtureSceneState(pendingOwner.data, pendingEntry);
  pending.zoneId = "bedroom";
  pending.activeIds = [];
  pending.participants = [];
  pending.pendingAccessClaim = "pending-entry";
  pending.continuity = captureSceneContinuity(authority, pending, Date.parse(at));
  pendingOwner.data = authorSceneFixture(pendingEntry, pending, authority);
  pendingEntry.get(villageRecordId).data = authorVillageFixture(pendingEntry, authority);
  await restart(pendingEntry);
  const admitted = (await request("/rooms/active")).session;
  assert.equal(admitted.zoneId, "bedroom");
  assert.deepEqual(admitted.activeIds, ["distant"]);
  assert.equal(admitted.participants[0].name, "Distant Resident");
  assert.deepEqual(
    storedVillage(records).venues[0].access!.permissions.map((grant) => grant.sceneId),
    [sceneId, null],
  );
  assert.equal(savedScene().pendingAccessClaim, undefined);

  applyAccessCommand(
    home,
    {
      action: "revoke",
      operationId: "withdraw-before-entry",
      expectedRevision: home.access!.revision,
      zoneId: "bedroom",
      permissionId: "pending-entry",
    },
    "distant",
    at,
    actorIds,
  );
  pendingEntry.get(villageRecordId).data = authorVillageFixture(pendingEntry, authority);
  await restart(pendingEntry);
  const hiddenHistory = await request(roomUrl + "/history?" + new URLSearchParams({ scope }), undefined, 409);
  assert.doesNotMatch(JSON.stringify(hiddenHistory), /Distant Resident|UNSEEN BEDROOM FURNITURE/);
  const closedDenied = await request("/rooms/end", {
    sessionId: sceneId,
    expectedSceneRevision: savedScene().sceneRevision,
  });
  assert.equal(closedDenied.session.zoneId, "exterior");
  assert.deepEqual(closedDenied.session.participants, []);
  assert.doesNotMatch(JSON.stringify(closedDenied), /Distant Resident|UNSEEN BEDROOM FURNITURE/);
  assert(storedVillage(records).venues[0].access!.permissions.every((grant) => grant.sceneId === null));
  assert.equal(completions, beforeGathering + 2);

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
      const committed = owner === "world" && time === "after";
      assert.equal(!!episodeOf(id), committed);
      await restart();
      assert.equal(completions, before + 1, "Restart does not buy another reply");
      const saved = savedScene();
      const acceptedId = committed ? id : id + "-retry";
      if (!committed) provide({ segments: [{ kind: "narration", text }] });
      await request("/rooms/turn", {
        ...payload,
        expectedSceneRevision: saved.sceneRevision,
        retryOfAttemptId: saved.operation?.attemptId,
        ...(committed ? {} : { submissionId: acceptedId, replaceOfOperationId: id }),
      });
      assert.equal(completions, before + (committed ? 1 : 2), "Only a lost reply needs a new completion");
      assert.equal(savedScene().lines.filter((line) => line.content === text).length, 1);
      assert.equal(savedScene().submissions.filter((entry) => entry.id === acceptedId).length, 1);
      assert.equal(
        storedVillage(records).episodes.records.filter((entry) => entry.submissionId === acceptedId).length,
        1,
      );
    }
  }
} finally {
  await stop?.();
  await app.close();
  globalThis.fetch = originalFetch;
  mock.timers.reset();
}
