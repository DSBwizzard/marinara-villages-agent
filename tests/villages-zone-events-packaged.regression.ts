import AdmZip from "adm-zip";
import Fastify from "fastify";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { mock } from "node:test";
import { pathToFileURL } from "node:url";
import { readPrivateDiagnostics } from "../packages/villages/src/server/adapters/observability/private-diagnostics.js";
import { relationshipDocumentId } from "../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { reserveMemoryScene } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import {
  authorSceneFixture,
  fixtureSceneState,
  fixtureRelationshipState,
  fixtureVillageState,
  villageFixtureDocuments,
} from "./helpers/village-storage.fixture.js";

// Archive-identical server and actual HTTP handlers, with synthetic storage/models only.
const receipt = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8"));
const zip = new AdmZip(receipt.retainedArchivePath ?? receipt.archivePath ?? receipt.archive);
assert.deepEqual(
  zip
    .getEntries()
    .find((entry) => entry.entryName.endsWith("server.mjs"))!
    .getData(),
  await readFile("packages/villages/server.mjs"),
);
const { activate } = await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
// Define the archive's Date subclasses before Node replaces Date: MockDate's constructor
// does not preserve subclass prototypes. Freeze only the running clock, not class creation.
mock.timers.enable({ apis: ["Date"], now: Date.now() });
const now = new Date().toISOString();
const world = defaultVillageState();
Object.assign(world, {
  seed: "packaged-zone-events",
  foundedAt: now,
  setupAt: now,
  backgroundPace: "off",
  timeZone: "America/Los_Angeles",
  playerPersonaId: "persona",
  playerPersonaName: "Player",
  playerPersonaIdentity: "A visitor",
});
const people = [
  { id: "aqua", name: "Aqua", zone: "terrace" },
  { id: "feddy", name: "Feddy Fastbayer", zone: "terrace" },
  { id: "neighbor", name: "Neighbor", zone: "kitchen" },
  { id: "distant", name: "Distant Resident", zone: "bedroom" },
];
world.villagers = people.map(({ id, name }) => ({
  characterId: id,
  cardSnapshot: {
    id,
    name,
    description: "An authored resident.",
    sourceStatus: "available",
    capturedAt: now,
    revision: 1,
    tags: [],
  },
  addedAt: now,
  ingestSchedule: false,
})) as typeof world.villagers;
world.venues = [
  venueFixture({
    residentIds: [null].filter((id) => typeof id === "string" && !!id),
    id: "harbour",
    name: "The Harbour Terrace",
    classes: ["other"],
    layoutVersion: 1,
    zones: [
      {
        ...defaultVenueSpace("other"),
        id: "exterior",
        name: "Exterior",
        kind: "exterior",
        connectedTo: ["terrace"],
        seen: true,
      },
      {
        ...defaultVenueSpace("other"),
        id: "terrace",
        name: "Terrace",
        kind: "public",
        connectedTo: ["exterior", "kitchen"],
        seen: true,
      },
      {
        ...defaultVenueSpace("other"),
        id: "kitchen",
        name: "Kitchen",
        kind: "public",
        connectedTo: ["terrace", "bedroom"],
      },
      {
        ...defaultVenueSpace("other"),
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
  }),
] as typeof world.venues;
const village = coerceVillageState(world);
const scene = coerceSession({
  version: 4,
  id: "harbour-scene",
  placeId: "harbour",
  placeName: "The Harbour Terrace",
  zoneId: "terrace",
  area: "public",
  villageSeed: village.seed,
  processingVersion: 1,
  semanticVersion: 2,
  gmVersion: 1,
  status: "active",
  startedAt: now,
  lastActivityAt: now,
  activeIds: ["aqua", "feddy"],
  participants: people
    .filter((person) => person.zone === "terrace")
    .map(({ id, name }) => ({ characterId: id, name, doing: "Looking at the water" })),
  sceneAttendance: {
    capturedAt: now,
    layout: captureSceneLayout(village.venues[0]),
    occupants: people.map(({ id, name, zone }) => ({ characterId: id, name, doing: "Passing the time", zoneId: zone })),
  },
  lines: [],
  submissions: [],
});
reserveMemoryScene(village, scene.id, now);
const clone = <T>(value: T): T => structuredClone(value);
const records = new Map<string, any>([
  ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", revision: 1, data: village }],
  [
    "villages-active-venue",
    {
      id: "villages-active-venue",
      packageId: "villages",
      kind: "venue-active",
      revision: 1,
      data: { sessionId: scene.id, placeId: scene.placeId },
    },
  ],
  [
    "villages-venue-visit-" + scene.id,
    { id: "villages-venue-visit-" + scene.id, packageId: "villages", kind: "venue-visit", revision: 1, data: scene },
  ],
]);
let failedSaveId = "";
let saveFault: "before" | "after" | "" = "";
let failContinueSave = false;
const documents = {
  getById: async (_package: string, id: string) => clone(records.get(id) ?? null),
  list: async (_package: string, kind: string) => [...records.values()].filter((row) => row.kind === kind).map(clone),
  create: async (input: any) => {
    assert(!records.has(input.id));
    const row = { ...clone(input), revision: 1 };
    records.set(input.id, row);
    return clone(row);
  },
  update: async (input: any) => {
    const prior = records.get(input.id);
    if (prior?.revision !== input.expectedRevision) return null;
    const row = { ...prior, data: clone(input.data), revision: prior.revision + 1 };
    if (
      failContinueSave &&
      input.id === "villages-venue-visit-" + scene.id &&
      fixtureSceneState(row.data, records).submissions.some((turn: any) =>
        turn.semanticContinuedDomains?.includes("relationships"),
      )
    ) {
      failContinueSave = false;
      throw Error("Injected after durable Continue tombstone, before Scene save");
    }

    const fault =
      failedSaveId &&
      saveFault &&
      input.id === "villages-venue-visit-" + scene.id &&
      fixtureSceneState(row.data, records).submissions?.some((turn: any) => turn.id === failedSaveId) &&
      !fixtureSceneState(prior.data, records).submissions?.some((turn: any) => turn.id === failedSaveId)
        ? saveFault
        : "";
    if (fault) saveFault = "";
    if (fault === "before") throw Error("Injected before prose save");
    records.set(input.id, row);
    if (fault === "after") throw Error("Injected lost prose save acknowledgement");
    return clone(row);
  },
  remove: async (_package: string, id: string, revision: number) =>
    records.get(id)?.revision === revision && records.delete(id),
};

let modelCalls = 0;
let answer: Record<string, unknown>;
let answerContent: string | undefined;
let answerFinishReason = "stop";
let domainRecoveryAnswer: Record<string, unknown> | undefined;
let debugEnabled = false;
const prompts: string[] = [];
const model = {
  connectionId: "synthetic",
  model: "fixture",
  maxContext: 64000,
  maxOutputTokens: 4096,
  fitContext: (messages: any[], options: any) => ({
    messages,
    ...options,
    trimmed: false,
    estimatedTokensBefore: Math.ceil(JSON.stringify(messages).length / 4),
    estimatedTokensAfter: Math.ceil(JSON.stringify(messages).length / 4),
  }),
  chatComplete: async (messages: any[], options: any) => {
    modelCalls++;
    if (options.responseFormat?.type === "json_object")
      assert(messages.some((message) => message.role === "system" && /\bjson\b/i.test(message.content)));
    if (messages[0].content.startsWith("Interpret ONLY the supplied saved exchange")) {
      assert(domainRecoveryAnswer, "Explicit effect recovery needs a supplied fixture response");
      return { content: JSON.stringify(domainRecoveryAnswer), finishReason: "stop" };
    }
    assert.match(
      messages[0].content,
      /Game Master of Villages/,
      "Only the current GM writer may purchase a Scene response",
    );
    prompts.push(messages.map((row) => row.content).join("\n"));
    assert(answer, "Every GM response must be explicitly supplied");
    return {
      content: answerContent ?? JSON.stringify(answer),
      finishReason: answerFinishReason,
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  },
};
const runtime = {
  persistence: { documents: villageFixtureDocuments(documents) },
  resources: {
    listCharacters: async () =>
      people.map(({ id, name }) => ({ id, revision: 1, data: { id, name, description: "An authored resident." } })),
    listPersonas: async () => [{ id: "persona", data: { name: "Player", description: "A visitor" } }],
    listLorebooks: async () => [],
    listEligibleLorebookEntries: async () => [],
  },
  languageModels: { resolve: async () => model, resolveForRequest: async () => model },
  json: { parseJsonish: JSON.parse },
  logger: {
    info() {},
    warn() {},
    error() {},
    debug() {},
    debugOverride() {},
  },
  isDebugAgentsEnabled: () => debugEnabled,
  getAgentConfig: async () => ({ settings: {} }),
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
let app = Fastify();
let stop: (() => Promise<void>) | undefined;
async function start() {
  stop = await activate({
    api: {
      runtime,
      registerPrivilegedRoutes: async (routes: any, options: any) => {
        await app.register(async (instance) => {
          await routes(
            Object.fromEntries(
              ["get", "post", "put", "patch", "delete", "addContentTypeParser"].map((method) => [
                method,
                (instance as any)[method].bind(instance),
              ]),
            ),
          );
        }, options);
        return () => app.close();
      },
    },
  });
}
const state = (): any => fixtureSceneState(records.get("villages-venue-visit-" + scene.id).data, records);
const editFixtureScene = (edit: (saved: any) => void) => {
  const saved = state();
  edit(saved);
  records.get("villages-venue-visit-" + scene.id).data = authorSceneFixture(records, saved);
};
async function publicHistory(scope: string) {
  const lines: unknown[] = [],
    seen = new Set<string>();
  let cursor = "";
  do {
    assert(!seen.has(cursor), "public history pagination advances");
    seen.add(cursor);
    const query = new URLSearchParams({ scope, ...(cursor ? { cursor } : {}) });
    const response = await app.inject({ method: "GET", url: `/api/villages/rooms/${scene.id}/history?${query}` });
    assert.equal(response.statusCode, 200, response.body);
    const page = response.json();
    lines.unshift(...page.lines);
    cursor = page.olderCursor ?? "";
  } while (cursor);
  return JSON.stringify(lines);
}

const payload = (id: string, message = "*waits*") => ({
  sessionId: scene.id,
  submissionId: id,
  message,
  mode: "chat",
  targetId: "",
  expectedSceneRevision: state().sceneRevision,
});
async function turn(id: string, segments: any[], effects: Record<string, unknown> = {}, message = "*waits*") {
  answer = { input: message ? [{ kind: "action", text: message }] : [], segments, ...effects };
  const request = payload(id, message),
    before = modelCalls;
  const response = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: request });
  assert.equal(response.statusCode, 200, response.body);
  assert.equal(response.json().turnOutcome, undefined, response.body);
  assert.equal(modelCalls, before + 1, "A Scene exchange uses one GM response");
  const admitted = JSON.stringify(state().operation.input);
  assert.equal(state().submissions.at(-1).semanticProvenance.producer, "gm");
  const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: request });
  assert.equal(replay.statusCode, 200, replay.body);
  assert.equal(modelCalls, before + 1, "Committed replay never purchases a replacement");
  assert.equal(
    JSON.stringify(state().operation.input),
    admitted,
    "Committed replay preserves its admitted input and allowance",
  );
  return response.json();
}
async function restart() {
  await stop?.();
  await app.close();
  app = Fastify();
  await start();
}
try {
  await start();
  // Prepare the synthetic world through the installed Village calendar before saving its baseline.
  const initialized = await app.inject({ method: "GET", url: "/api/villages" });
  assert.equal(initialized.statusCode, 200, initialized.body);
  assert.equal(modelCalls, 0, "Calendar preparation is provider-free");
  editFixtureScene((saved) => {
    saved.continuity = captureSceneContinuity(
      fixtureVillageState(records.get("villages-village").data, records),
      saved,
      Date.parse(now),
    );
  });
  const baseline = clone(records);
  const restore = () => {
    records.clear();
    for (const [id, row] of clone(baseline)) records.set(id, row);
  };

  const spoken = "We can discuss the harbour tomorrow.";
  await turn(
    "memory",
    [{ speakerId: "aqua", text: "Then let us talk about the harbour tomorrow." }],
    {
      input: [{ kind: "speech", text: spoken }],
      memoryChanges: [
        {
          action: "create",
          kind: "open-matter",
          screening: { disposition: "clear" },
          subjects: ["aqua"],
          text: "Aqua suggested discussing the harbour tomorrow.",
          learners: {
            aqua: {
              basis: "report",
              attributedTo: "aqua",
              support: [{ lineId: 0, excerpt: "Then let us talk about the harbour tomorrow." }],
            },
          },
        },
      ],
    },
    '"' + spoken + '"',
  );
  assert.equal(state().submissions.at(-1).processing.domains.memories.status, "applied");
  assert(
    fixtureVillageState(records.get("villages-village").data, records).memories.records.some(
      (row: any) => row.text === "Aqua suggested discussing the harbour tomorrow.",
    ),
  );
  const readsBefore = modelCalls;
  const view = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
  assert.doesNotMatch(
    view.body,
    /semanticIntent|semanticProvenance|semanticAccess|checkpoints|attempts|memoryContexts/,
  );
  assert.equal(modelCalls, readsBefore);
  restore();

  const distant = await turn("distant-call", [
    { speakerId: "distant", text: "PRIVATE WORDS NEVER DELIVERED", delivery: "shout" },
    { text: "You pause by the railing." },
  ]);
  const distantHistory = await publicHistory(distant.session.playback.scope);
  assert.match(distantHistory, /indistinct/);
  assert.doesNotMatch(
    JSON.stringify(distant) + distantHistory,
    /PRIVATE WORDS NEVER DELIVERED|Distant Resident|"distant"|soundOnly|heardHistory/,
  );
  const local = await turn("local-speech", [{ speakerId: "aqua", text: "Only the terrace hears these words." }]);
  const localLine = state().lines.findLast((line: any) => line.content === "Only the terrace hears these words.");
  assert.deepEqual(localLine.heardBy, ["aqua", "feddy"]);
  assert.deepEqual(localLine.soundOnly.characterIds, ["neighbor"]);
  const beforeRestart = modelCalls;
  await restart();
  assert.doesNotMatch(
    (await app.inject({ method: "GET", url: "/api/villages/rooms/active" })).body +
      (await publicHistory(local.session.playback.scope)),
    /PRIVATE WORDS NEVER DELIVERED|Distant Resident/,
  );
  assert.equal(modelCalls, beforeRestart, "Restored public history remains provider-free");
  restore();

  const disclosure = {
    fromId: "neighbor",
    toId: "neighbor",
    kind: "work",
    text: "Neighbor says they work in the harbour workshop.",
    lineIds: [2],
  };
  const arrived = await turn(
    "doorway-crossing",
    [
      { speakerId: "neighbor", text: "PRIVATE WORDS BEFORE ARRIVAL" },
      { text: "Neighbor steps out of the Kitchen onto the Terrace beside you." },
      {
        speakerId: "neighbor",
        text: "I'm Neighbor. I work in the harbour workshop.",
        delivery: "whisper",
        targetId: "player",
      },
    ],
    {
      events: { moves: [{ characterId: "neighbor", zoneId: "terrace", segment: 1 }] },
      relationshipChanges: { disclosures: [disclosure] },
    },
  );
  const heard = state().lines.findLast((line: any) => line.content === "I'm Neighbor. I work in the harbour workshop.");
  assert.notEqual(heard.contactHidden, true);
  assert.equal(heard.soundOnly, undefined);
  assert.equal(state().submissions.at(-1).processing.domains.relationships.status, "applied");
  const arrivedHistory = await publicHistory(arrived.session.playback.scope);
  assert.match(arrivedHistory, /harbour workshop/);
  assert.doesNotMatch(arrivedHistory, /PRIVATE WORDS BEFORE ARRIVAL/, "Arrival cannot backdate hearing");
  assert(
    fixtureVillageState(records.get("villages-village").data, records).memories.records.some(
      (row: any) => row.text === disclosure.text,
    ),
  );
  restore();

  const privatePlan = "PRIVATE_PLAN_AQUA_TEA: invite the player for tea when the terrace is quiet.";
  const intentionSpeech = "I enjoy a quiet conversation.";
  const intention = await turn(
    "private-intention",
    [{ speakerId: "aqua", text: intentionSpeech }],
    {
      input: [{ kind: "speech", text: "I am happy to listen." }],
      relationshipChanges: {
        intentions: [
          {
            actorId: "aqua",
            expectedRevision: 0,
            lineIds: [0],
            items: [
              { id: "", targetIds: ["player"], text: privatePlan, reason: "Enjoys conversation.", status: "active" },
            ],
          },
        ],
      },
    },
    "I am happy to listen.",
  );
  const social = fixtureRelationshipState(records.get(relationshipDocumentId(village.seed)), records);
  assert.equal(social.intentions.aqua.length, 1);
  assert.equal(social.intentions.aqua[0].text, privatePlan);
  assert.equal(social.intentionRevisions.aqua, 1);
  assert.deepEqual(
    social.intentions.aqua[0].evidenceIds,
    [state().lines.find((line: any) => line.content === intentionSpeech).id],
    "Inserted player speech cannot shift an intention's resident source",
  );
  const activeIntention = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
  const intentionChanges = await app.inject({ method: "GET", url: "/api/villages/rooms/" + scene.id + "/changes" });
  const intentionSnapshot = await app.inject({ method: "GET", url: "/api/villages" });
  for (const response of [activeIntention, intentionChanges, intentionSnapshot])
    assert.equal(response.statusCode, 200, response.body);
  for (const [name, text] of [
    ["turn", JSON.stringify(intention)],
    ["active", activeIntention.body],
    ["changes notices", JSON.stringify(intentionChanges.json().notices)],
    ["snapshot", intentionSnapshot.body],
    ["history", await publicHistory(intention.session.playback.scope)],
  ])
    assert(!text.includes(privatePlan), "Private intention exposed by " + name);

  restore();

  const mixedMessage = 'I whisper "PRIVATE WORDS." to Feddy. *drops a pebble*';
  await turn(
    "mixed-private-noise",
    [
      {
        kind: "narration",
        text: "A pebble taps the terrace boards.",
        sound: { sourceId: "player", text: "A pebble taps", loud: true },
      },
    ],
    {
      input: [
        { kind: "context", text: "I whisper" },
        { kind: "speech", text: "PRIVATE WORDS.", delivery: "whisper", targetId: "feddy" },
        { kind: "context", text: "to Feddy." },
        { kind: "action", text: "*drops a pebble*" },
      ],
    },
    mixedMessage,
  );
  const queries = createSceneQueryService({
    readSession: async () => state(),
    readVillageState: async () => village,
    villagesDocuments: () => documents,
  } as any);
  const evidence = await queries.readProjectTurnEvidence(scene.id, "mixed-private-noise");
  assert.equal(evidence.playerMessagesByActor.feddy, "PRIVATE WORDS.");
  assert.equal(evidence.playerMessagesByActor.aqua, undefined);
  assert.equal(
    evidence.playerMessagesByActor.neighbor,
    undefined,
    "Hearing nonverbal noise cannot reveal private speech",
  );
  restore();

  for (const failure of [
    "sound",
    "input",
    "capture",
    "json",
    "truncated",
    "events",
    "events-array",
    "events-null",
    "event-moves",
    "access-null",
    "project",
    "agency",
    "disclosure",
  ] as const) {
    const request = payload("invalid-" + failure);
    answerContent = undefined;
    answerFinishReason = "stop";
    answer = { input: [{ kind: "action", text: request.message }], segments: [{ text: "Aqua sets her cup down." }] };
    if (failure === "sound")
      answer.segments = [{ text: "Aqua sets her cup down.", sound: { sourceId: "aqua", text: "x".repeat(301) } }];
    if (failure === "input") answer.input = [{ kind: "action", text: "*waits" }];
    if (failure === "capture") answer.input = [{ kind: "action", text: "NOT IN THE ORIGINAL" }];
    if (failure === "json" || failure === "truncated") answerContent = '{"input":';
    if (failure === "truncated") answerFinishReason = "length";
    if (failure === "events") answer.events = "malformed";
    if (failure === "events-array") answer.events = [];
    if (failure === "events-null") answer.events = null;
    if (failure === "event-moves") answer.events = { moves: null };
    if (failure === "access-null") answer.access = null;
    if (failure === "project") {
      answer.segments = [{ speakerId: "aqua", text: "I approve the unknown project." }];
      answer.projectSpeech = [
        { projectId: "unknown-project", revision: 0, kind: "approval", speakerId: "aqua", citations: [{ segment: 0 }] },
      ];
    }
    if (failure === "agency")
      Object.assign(answer, {
        consistent: false,
        playerAgencyViolation: { segment: 0, quote: "Aqua sets her cup down." },
      });
    if (failure === "disclosure")
      Object.assign(answer, {
        segments: [{ speakerId: "neighbor", text: "I'm Neighbor. I work in the harbour workshop." }],
        relationshipChanges: { disclosures: [{ ...disclosure, lineIds: [0] }] },
      });
    const before = clone(state()),
      beforeWorld = clone(records.get("villages-village")),
      calls = modelCalls;
    const rejected = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: request });
    assert.equal(rejected.statusCode, 502, failure + ": " + rejected.body);
    assert.deepEqual(state().lines, before.lines);
    assert.deepEqual(state().submissions, before.submissions);
    assert.deepEqual(state().sceneAttendance, before.sceneAttendance);
    assert.deepEqual(records.get("villages-village"), beforeWorld);
    assert.equal(modelCalls, calls + 1, "Invalid paid output triggers no automatic repair");
    assert.equal(state().operation.input.message, request.message);
    assert(!Object.keys(state().operation.checkpoints).some((key) => key.startsWith("writing-completion:")));
    assert(
      readPrivateDiagnostics(records.get("villages-private-diagnostics").data).entries.some(
        (entry: any) => entry.operationId === request.submissionId && entry.content.includes('"input"'),
      ),
    );
    await restart();
    const restored = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.doesNotMatch(restored.body, /"checkpoints"|"attempts"|invalid-gm-effects|x{301}/);
    for (const retryOfAttemptId of [undefined, "wrong-attempt"]) {
      const blocked = await app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: { ...request, retryOfAttemptId },
      });
      assert.equal(blocked.statusCode, 409, blocked.body);
    }
    assert.equal(modelCalls, calls + 1);
    answerContent = undefined;
    answerFinishReason = "stop";
    answer = { input: [{ kind: "action", text: request.message }], segments: [{ text: "The terrace is quiet." }] };
    const acceptedRequest = { ...request, retryOfAttemptId: state().operation.attemptId };
    const accepted = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: acceptedRequest });
    assert.equal(accepted.statusCode, 200, accepted.body);
    assert.equal(modelCalls, calls + 2, "Matching explicit retry purchases only a replacement GM response");
    const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: acceptedRequest });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(modelCalls, calls + 2);
    restore();
  }

  for (const fault of ["before", "after"] as const) {
    failedSaveId = "save-fault-" + fault;
    saveFault = fault;
    const text = "Exactly once prose " + fault;
    answer = { input: [{ kind: "action", text: "*waits*" }], segments: [{ text }] };
    const request = payload(failedSaveId),
      calls = modelCalls;
    const failed = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: request });
    assert.equal(failed.statusCode, 500, failed.body);
    await restart();
    const recovered = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        ...request,
        retryOfAttemptId: state().operation.attemptId,
      },
    });
    assert.equal(recovered.statusCode, 200, recovered.body);
    assert.equal(modelCalls, calls + 1, "Restart and storage replay reuse the purchased GM response");
    assert.equal(state().lines.filter((line: any) => line.content === text).length, 1);
    assert.equal(state().submissions.filter((turn: any) => turn.id === failedSaveId).length, 1);
    restore();
  }

  for (const [field, domain, proposal, variant] of [
    ["memoryChanges", "memories", "malformed", "text"],
    ["memoryChanges", "memories", null, "null"],
    ["relationshipChanges", "relationships", { changes: "malformed", permissions: [], disclosures: [] }, "nested"],
    ["relationshipChanges", "relationships", "malformed", "outer-text"],
    ["relationshipChanges", "relationships", null, "outer-null"],
    ["relationshipChanges", "relationships", [], "outer-array"],
    ["wishChanges", "wishes", "malformed", "text"],
    ["wishChanges", "wishes", null, "null"],
    ["projectSpeech", "projects", "malformed", "text"],
    ["projectSpeech", "projects", null, "null"],
  ] as const) {
    const id = "malformed-" + domain + "-" + variant,
      text = "Accepted prose for " + domain + ".";
    await turn(id, [{ speakerId: "aqua", text }], { [field]: proposal });
    const held = () => state().submissions.find((entry: any) => entry.id === id);
    assert.equal(held().processing.domains[domain].status, "failed");
    assert(held().effectFailures[domain]);
    const lines = clone(state().lines),
      calls = modelCalls;
    const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/" + scene.id + "/changes/replay" });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(modelCalls, calls);
    domainRecoveryAnswer = {
      [field]: field === "relationshipChanges" ? { changes: [], permissions: [], disclosures: [] } : [],
    };
    const repaired = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/" + scene.id + "/changes/" + id + "/interpret",
      payload: { domain },
    });
    assert.equal(repaired.statusCode, 200, repaired.body);
    assert.equal(modelCalls, calls + 1, "Only the explicit effect repair purchases a request");
    assert.deepEqual(state().lines, lines);
    assert.equal(held().processing.domains[domain].status, "applied");
    restore();
  }

  for (const action of ["grant", "revoke"] as const) {
    const venue = records.get("villages-village").data.venues[0];
    const kitchen = venue.zones.find((zone: any) => zone.id === "kitchen");
    kitchen.kind = "restricted";
    kitchen.access = {
      mode: "permission-required",
      managerIds: ["aqua"],
      memberIds: ["aqua"],
      memberRoles: [],
      inviterIds: ["aqua"],
      visitorHours: "always",
      accompanied: false,
    };
    venue.access.managerIds = ["aqua"];
    if (action === "revoke")
      venue.access.permissions.push({
        id: "existing-standing",
        zoneId: "kitchen",
        visitorId: "player",
        issuerId: "aqua",
        duration: "standing",
        sceneId: null,
        accompaniedBy: null,
        outsideHours: false,
        revoked: false,
        issuedAt: now,
        sourceLineIds: ["earlier-standing"],
      });
    editFixtureScene((saved) => {
      saved.sceneAttendance.layout = captureSceneLayout(venue);
      saved.continuity = captureSceneContinuity(
        fixtureVillageState(records.get("villages-village").data, records),
        saved,
        Date.parse(now),
      );
    });
    const permission = {
      controllerId: "aqua",
      visitorId: "player",
      venueId: "harbour",
      zoneId: "kitchen",
      action,
      lineIds: [0],
    };
    await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const id = "malformed-standing-" + action;
    const text =
      action === "grant"
        ? "You can visit my Kitchen whenever you like."
        : "Your standing permission to visit my Kitchen is withdrawn.";
    answer = {
      input: [{ kind: "action", text: "*waits*" }],
      segments: [{ speakerId: "aqua", text }],
      relationshipChanges: { changes: "malformed", permissions: [permission], disclosures: [] },
    };
    const request = payload(id),
      before = clone(state()),
      worldBefore = clone(records.get("villages-village").data),
      calls = modelCalls;
    const response = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: request });
    assert.equal(response.statusCode, 502, response.body);
    assert.match(response.body, /malformed authority metadata/);
    assert.equal(modelCalls, calls + 1);
    assert.deepEqual(state().lines, before.lines);
    assert.deepEqual(state().submissions, before.submissions);
    assert.deepEqual(
      records.get("villages-village").data,
      worldBefore,
      "No authority or prose applies from the malformed response",
    );
    assert(
      readPrivateDiagnostics(records.get("villages-private-diagnostics").data).entries.some(
        (row: any) => row.operationId === id && row.content.includes('"permissions"'),
      ),
    );
    const continued = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/" + scene.id + "/changes/" + id + "/continue",
      payload: { domain: "relationships" },
    });
    assert.equal(continued.statusCode, 404, continued.body);
    await restart();
    const next = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: payload("blocked-after-" + action),
    });
    assert.equal(next.statusCode, 409, next.body);
    assert.equal(modelCalls, calls + 1, "A held authority response cannot be skipped or replaced implicitly");
    answer.relationshipChanges = { changes: [], permissions: [permission], disclosures: [] };
    const repaired = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        ...request,
        retryOfAttemptId: state().operation.attemptId,
      },
    });
    assert.equal(repaired.statusCode, 200, repaired.body);
    assert.equal(state().submissions.at(-1).processing.domains.relationships.status, "applied");
    const permissions = fixtureVillageState(records.get("villages-village").data, records).venues[0].access!
      .permissions;
    assert.equal(
      permissions.some(
        (entry: any) =>
          entry.zoneId === "kitchen" && entry.visitorId === "player" && entry.duration === "standing" && !entry.revoked,
      ),
      action === "grant",
    );
    assert.equal(modelCalls, calls + 2, "Only matching explicit retry can replace and settle the authority response");
    const settledAccess = clone(fixtureVillageState(records.get("villages-village").data, records).venues[0].access);
    const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: request });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.deepEqual(
      fixtureVillageState(records.get("villages-village").data, records).venues[0].access,
      settledAccess,
    );
    assert.equal(modelCalls, calls + 2, "Successful retry replay cannot duplicate a permission or its revision");
    restore();
  }

  for (const failSceneSave of [false, true]) {
    const id = "continued-social-" + failSceneSave,
      discardedText = "Aqua prefers red notebooks.";
    await turn(id, [{ speakerId: "aqua", text: "I prefer red notebooks." }], {
      relationshipChanges: {
        changes: "discarded malformed metadata",
        permissions: [],
        disclosures: [{ fromId: "aqua", toId: "aqua", kind: "preference", text: discardedText, lineIds: [0] }],
      },
    });
    const held = () => state().submissions.find((entry: any) => entry.id === id);
    const failedEvidence = clone(held().effectFailures.relationships);
    assert(JSON.stringify(failedEvidence).includes(discardedText));
    const request = {
      method: "POST" as const,
      url: "/api/villages/rooms/" + scene.id + "/changes/" + id + "/continue",
      payload: { domain: "relationships" },
    };
    const calls = modelCalls;
    failContinueSave = failSceneSave;
    const continued = await app.inject(request);
    assert.equal(continued.statusCode, failSceneSave ? 500 : 200, continued.body);
    const world = () => fixtureVillageState(records.get("villages-village").data, records);
    assert(
      world().semanticContinuations?.["semantic-continue:" + JSON.stringify([scene.id, id])]?.includes("relationships"),
    );
    await restart();
    assert.equal((await app.inject({ method: "GET", url: "/api/villages/rooms/active" })).statusCode, 200);
    const completed = await app.inject(request);
    assert.equal(completed.statusCode, 200, completed.body);
    assert.equal(held().processing.domains.relationships.status, "rejected");
    assert(held().semanticContinuedDomains.includes("relationships"));
    const repeated = await app.inject(request);
    assert.equal(repeated.statusCode, 200, repeated.body);
    const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: payload(id) });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(modelCalls, calls, "Continue, restart and replay cannot buy an optional repair");
    assert.deepEqual(
      held().effectFailures.relationships,
      failedEvidence,
      "The rejected payload remains exact audit evidence",
    );
    assert(
      !world().memories.records.some((row: any) => row.text.includes(discardedText)),
      "Continued metadata cannot publish later",
    );
    restore();
  }

  for (const [reason, mode, expected] of [
    ["time", "chat", "halt-time"],
    ["condition", "leave", "halt-state"],
  ] as const) {
    editFixtureScene((saved) => {
      saved.liveSceneVersion = 1;
      saved.accompanying = saved.sceneAttendance.occupants.map(({ characterId, zoneId }: any) => ({
        characterId,
        zoneId,
      }));
    });
    await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const message = "Hello. *I sleep for two months*";
    answer = {
      input: [
        { kind: "speech", text: "Hello." },
        { kind: "action", text: "*I sleep for two months*" },
      ],
      segments: [{ speakerId: "aqua", text: "A generated farewell must never replace the held input." }],
      halt: { reason, source: "player", quote: "two months", appointments: [] },
    };
    const request = { ...payload("halt-" + mode, message), mode },
      before = clone(state()),
      worldBefore = clone(records.get("villages-village").data),
      calls = modelCalls;
    const url = mode === "leave" ? "/api/villages/rooms/leave" : "/api/villages/rooms/turn";
    const halted = await app.inject({ method: "POST", url, payload: request });
    assert.equal(halted.statusCode, 200, halted.body);
    assert.equal(halted.json().turnOutcome, expected);
    for (const key of ["lines", "submissions", "sceneAttendance", "activeIds", "sceneRevision", "status"])
      assert.deepEqual(state()[key], before[key], key);
    assert.equal(state().status, "active", "An unsupported Conclude must preserve the Scene");
    assert.deepEqual(records.get("villages-village").data, worldBefore);
    assert.equal(state().operation.input.message, message);
    assert.equal(modelCalls, calls + 1);
    await restart();
    const retained = await app.inject({
      method: "GET",
      url: "/api/villages/rooms/" + scene.id + "/operations/" + request.submissionId,
    });
    assert.equal(retained.json().operation.turnOutcome, expected);
    assert.equal(retained.json().operation.input.message, message);
    const replay = await app.inject({ method: "POST", url, payload: request });
    assert.equal(replay.json().turnOutcome, expected);
    assert.equal(modelCalls, calls + 1, "Held player input replays without replacement");
    restore();
  }

  const beforeNavigation = modelCalls;
  const moved = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/zone",
    payload: {
      sessionId: scene.id,
      zoneId: "kitchen",
      expectedSceneRevision: state().sceneRevision,
      operationId: "discover-kitchen",
    },
  });
  assert.equal(moved.statusCode, 200, moved.body);
  assert.equal(state().zoneId, "kitchen");
  assert(records.get("villages-village").data.venues[0].zones.find((zone: any) => zone.id === "kitchen").seen);
  const denied = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/zone",
    payload: {
      sessionId: scene.id,
      zoneId: "bedroom",
      expectedSceneRevision: state().sceneRevision,
      operationId: "deny-bedroom",
    },
  });
  assert.equal(denied.statusCode, 409, denied.body);
  assert(!records.get("villages-village").data.venues[0].zones.find((zone: any) => zone.id === "bedroom").seen);
  await restart();
  assert(records.get("villages-village").data.venues[0].zones.find((zone: any) => zone.id === "kitchen").seen);
  assert.equal(modelCalls, beforeNavigation, "Navigation and restart remain provider-free");
  restore();

  const memories = clone(fixtureVillageState(records.get("villages-village").data, records).memories),
    beforeDiscard = modelCalls;
  debugEnabled = true;
  const discarded = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/debug/discard",
    payload: { sessionId: scene.id },
  });
  debugEnabled = false;
  assert.equal(discarded.statusCode, 200, discarded.body);
  assert(!records.has("villages-venue-visit-" + scene.id));
  assert.deepEqual(fixtureVillageState(records.get("villages-village").data, records).memories, memories);
  assert.equal(modelCalls, beforeDiscard);
  console.log(
    "Archive-identical GM HTTP tests preserve hearing, access, private input, explicit retry and exactly-once storage recovery.",
  );
} finally {
  await stop?.();
  await app.close();
  globalThis.fetch = originalFetch;
  mock.timers.reset();
}
