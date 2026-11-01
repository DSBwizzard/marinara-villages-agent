import { readPrivateDiagnostics } from "../packages/villages/src/server/adapters/observability/private-diagnostics.js";
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
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { reserveMemoryScene } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { createSceneQueryService } from "../packages/villages/src/server/features/scenes/scene-query-service.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";
import {
  fixtureVillageState,
  villageFixtureDocuments,
  fixtureSceneState,
  authorSceneFixture,
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
  {
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
      { ...defaultVenueSpace("other"), id: "bedroom", name: "Bedroom", kind: "restricted", connectedTo: ["kitchen"] },
    ],
  },
] as typeof world.venues;
const village = coerceVillageState(world);
const scene = coerceSession({
  version: 3,
  id: "harbour-scene",
  placeId: "harbour",
  placeName: "The Harbour Terrace",
  zoneId: "terrace",
  area: "public",
  villageSeed: village.seed,
  processingVersion: 1,
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
let saveFaultStage: "submission" | "rejection" = "submission";
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
    const fault =
      failedSaveId &&
      saveFault &&
      input.id === "villages-venue-visit-" + scene.id &&
      (saveFaultStage === "rejection"
        ? row.data.rejectedSubmissions
        : fixtureSceneState(row.data, records).submissions
      )?.some((turn: any) => turn.id === failedSaveId) &&
      !(
        saveFaultStage === "rejection"
          ? prior.data.rejectedSubmissions
          : fixtureSceneState(prior.data, records).submissions
      )?.some((turn: any) => turn.id === failedSaveId)
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
let answer: any;
const captureRecoveryAnswers: unknown[] = [];
let domainRecoveryAnswer: unknown;
let closeCoreBeforeEffects = false;
let narrationCalls = 0;
const narrationPrompts: string[] = [];
let semanticIntentAnswer: Record<string, unknown> | undefined;
let semanticExchangeAnswer: Record<string, unknown> | undefined;
let beforeSemanticResponse: (() => void) | undefined;
const semanticStages: string[] = [];
let lastSemanticInput: any;
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
    if (options.responseFormat?.type === "json_object")
      assert(
        messages.some((message: any) => message.role === "system" && /\bjson\b/i.test(message.content)),
        "JSON mode must be requested in application instructions, independent of player text",
      );
    modelCalls++;
    if (messages[0].content.startsWith("You interpret Villages gameplay.")) {
      const packet = JSON.parse(messages[1].content);
      lastSemanticInput = clone(packet.input);
      const intent = messages[0].content.includes("Interpret current player intent");
      semanticStages.push(intent ? "intent" : "exchange");
      if (!intent && beforeSemanticResponse) {
        const intervene = beforeSemanticResponse;
        beforeSemanticResponse = undefined;
        intervene();
      }
      const response = intent
        ? semanticIntentAnswer
        : {
            ...(Object.hasOwn(packet.input, "narrativeGrant")
              ? { narrativeIntroduction: { status: "quiet", development: null } }
              : {}),
            halt: { reason: "none", quote: "", appointments: [] },
            immediateResidentMoves: [],
            ...semanticExchangeAnswer,
            intent: semanticIntentAnswer,
          };
      assert(response, "A labeled System response is required");
      if (!intent && Array.isArray((response as any).memoryChanges))
        for (const row of (response as any).memoryChanges)
          row.screening = {
            disposition: "clear",
            protectedRoots: [],
            fingerprint: packet.input.context.memory.administrative.fingerprint,
          };
      // The fixture supplies meaning explicitly; System discovers these omitted Narration actions.
      const accessActions = ((response as any).access ?? []).map(({ evidence, ...row }: any, index: number) => ({
        ...row,
        id: "discovered-" + index,
        source: {
          speakerId: packet.input.evidence[evidence[0]].speakerId,
          quote: packet.input.evidence[evidence[0]].content,
        },
      }));
      return {
        content: JSON.stringify({
          ...response,
          sourceHash: packet.sourceHash,
          ...(packet.input.residentActions
            ? {
                access: [],
                residentActionReview: {
                  version: 1,
                  additionalActions: accessActions,
                  decisions: accessActions.map((a: any) => ({
                    id: a.id,
                    status: "accepted",
                    reason: "Fixture supplies this resident action",
                  })),
                  coverage: packet.input.evidence.flatMap((line: any, segment: number) =>
                    line.playerHeard && line.speakerId !== "player"
                      ? [
                          {
                            segment,
                            status: accessActions.some(
                              (a: any) => a.source.speakerId === line.speakerId && a.source.quote === line.content,
                            )
                              ? "actions"
                              : "none",
                            actionIds: accessActions
                              .filter(
                                (a: any) => a.source.speakerId === line.speakerId && a.source.quote === line.content,
                              )
                              .map((a: any) => a.id),
                            reason: "Explicit fixture meaning",
                          },
                        ]
                      : [],
                  ),
                },
              }
            : {}),
        }),
        finishReason: "stop",
        usage: { promptTokens: 10, completionTokens: 10 },
      };
    }
    if (messages[0].content.includes("Recover ONLY capture metadata")) {
      assert(captureRecoveryAnswers.length, "explicit capture recovery answer required");
      return { content: JSON.stringify(captureRecoveryAnswers.shift()), finishReason: "stop" };
    }
    if (messages[0].content.startsWith("Interpret ONLY the supplied saved exchange")) {
      assert(domainRecoveryAnswer, "explicit domain answer required");
      return { content: JSON.stringify(domainRecoveryAnswer), finishReason: "stop" };
    }
    narrationCalls++;
    narrationPrompts.push(messages.map((message: any) => message.content).join("\n"));
    assert.match(messages[0].content, /ZONE EVENTS/, "no acoustic interpreter or unexpected model request");
    assert(answer, "a model response must be explicitly supplied by this fixture");
    let content = JSON.stringify({
      ...answer,
      ...(messages.some((m: any) => m.content.includes("Always include residentActions"))
        ? { residentActions: [] }
        : {}),
    });
    if (closeCoreBeforeEffects) {
      closeCoreBeforeEffects = false;
      const { memoryChanges, ...core } = answer;
      content = JSON.stringify(core) + ',"memoryChanges":' + JSON.stringify(memoryChanges) + "}";
    }
    return { content, finishReason: "stop", usage: { inputTokens: 10, outputTokens: 10 } };
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
  isDebugAgentsEnabled: () => false,
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
async function turn(
  id: string,
  message: string,
  segments: any[],
  extra: any = {},
  effects: any = {},
  _expectedChecks?: number,
) {
  const captured = segments.flatMap((row, index) =>
    row.speakerId === "player"
      ? [{ segment: index, sources: (row.fragments ?? [row.text]).map((text: string) => ({ text, occurrence: 1 })) }]
      : [],
  );
  answer = {
    playerSpeechCapture: { status: captured.length ? "captured" : "silent", segments: captured },
    ...effects,
    segments,
  };
  const expectedCalls = state().semanticVersion === 2 ? 2 : 1;
  const payload = {
    sessionId: scene.id,
    submissionId: id,
    mode: "chat",
    targetId: "",
    message,
    expectedSceneRevision: state().sceneRevision,
    ...extra,
  };
  const before = modelCalls;
  const response = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
  assert.equal(response.statusCode, 200, response.body);
  assert.equal(response.json().turnOutcome, undefined, response.body);
  assert.equal(modelCalls, before + expectedCalls, "Narration plus the existing combined System stage only");
  assert.equal(state().operation.input.interactionScopeVersion, 6);
  assert.equal(state().operation.input.soundHopVersion, 1);
  assert.equal(state().operation.input.writingContractVersion, 3);
  assert.equal(typeof state().operation.input.writingCapabilities.movement, "boolean");
  assert(!Object.keys(state().operation.checkpoints).some((key) => /attention-plan|acoustic-routing/.test(key)));
  const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
  assert.equal(replay.statusCode, 200, replay.body);
  assert.equal(modelCalls, before + expectedCalls, "replay uses saved writer/check responses without model work");
  return response.json();
}
try {
  await start();
  // A fresh v2 Scene exercises the archive-identical server and real HTTP application owners.
  records.get("villages-venue-visit-" + scene.id).data = coerceSession({
    version: 3,
    ...clone(scene),
    continuity: captureSceneContinuity(
      fixtureVillageState(records.get("villages-village").data, records),
      scene,
      Date.parse(now),
    ),
    semanticVersion: 2,
    lines: [],
    submissions: [],
    sceneRevision: 0,
    zoneId: "terrace",
  });
  semanticIntentAnswer = {
    status: "resolved",
    timeline: [{ kind: "speech", text: "We can discuss the harbour tomorrow." }],
    instructions: "Ordinary current speech, no physical effects.",
    action: null,
    movement: null,
  };
  semanticExchangeAnswer = {
    consistent: true,
    authority: { physical: false, access: false, projects: false, standing: false, social: false },
    action: null,
    access: [],
    events: { moves: [], departures: [], contactEnd: [] },
    memoryChanges: [
      {
        action: "create",
        kind: "open-matter",
        subjects: ["aqua"],
        text: "Aqua suggested discussing the harbour tomorrow.",
        learners: {
          aqua: {
            basis: "report",
            attributedTo: "aqua",
            support: [{ lineId: 1, excerpt: "Then let us talk about the harbour tomorrow." }],
          },
        },
      },
    ],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
    wishChanges: [],
    projectSpeech: [],
  };
  await turn(
    "semantic-discovery",
    '"We can discuss the harbour tomorrow."',
    [
      { speakerId: "player", text: "We can discuss the harbour tomorrow." },
      { speakerId: "aqua", text: "Then let us talk about the harbour tomorrow." },
    ],
    {},
    {
      memoryChanges: [{ kind: "durable", text: "FORGED NARRATOR AUTHORITY", systemVerification: "supported" }],
      contactMoves: [{ segment: 999, characterId: "invented", zoneId: "invented" }],
    },
  );
  assert.deepEqual(semanticStages, ["exchange"], "the packaged new contract uses one combined System check");
  assert.equal(state().submissions.at(-1).semanticReady, true);
  assert.equal(state().submissions.at(-1).processing.domains.memories.status, "applied");
  assert(
    fixtureVillageState(records.get("villages-village").data, records).memories.records.some(
      (row: any) => row.text === "Aqua suggested discussing the harbour tomorrow.",
    ),
  );
  assert(
    !JSON.stringify(fixtureVillageState(records.get("villages-village").data, records).memories.records).includes(
      "FORGED NARRATOR AUTHORITY",
    ),
  );
  const beforeSemanticRead = modelCalls;
  const semanticPublic = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
  assert.doesNotMatch(
    semanticPublic.body,
    /semanticIntent|semanticProvenance|semanticAccess|semanticReady|residentActionReceipt|residentActions|FORGED NARRATOR AUTHORITY/,
  );
  assert.equal(modelCalls, beforeSemanticRead, "New-contract read and replay are provider-free");

  // Current packaged coverage replaces the retired Narration-owned protocol fixtures.
  {
    const retained = clone(records),
      oldIntent = semanticIntentAnswer,
      oldExchange = semanticExchangeAnswer;
    const quietSystem = () => ({
      consistent: true,
      authority: { physical: false, access: false, projects: false, standing: false, social: false },
      action: null,
      access: [],
      events: { moves: [], departures: [], contactEnd: [] },
      memoryChanges: [],
      relationshipChanges: { changes: [], permissions: [], disclosures: [] },
      wishChanges: [],
      projectSpeech: [],
    });
    semanticIntentAnswer = {
      status: "resolved",
      timeline: [{ kind: "action", text: "*waits*" }],
      instructions: "",
      action: null,
      movement: null,
    };
    semanticExchangeAnswer = quietSystem();
    const distant = await turn("current-distant-call", "*waits*", [
      { speakerId: "distant", text: "PRIVATE WORDS NEVER DELIVERED", delivery: "shout" },
      { text: "You pause by the railing." },
    ]);
    const history = await publicHistory(distant.session.playback.scope);
    assert.match(history, /indistinct/);
    assert.doesNotMatch(
      JSON.stringify(distant) + history,
      /PRIVATE WORDS NEVER DELIVERED|Distant Resident|"distant"|soundOnly|heardHistory/,
    );
    const local = await turn("current-local-speech", "*waits*", [
      { speakerId: "aqua", text: "Only the terrace hears these words." },
    ]);
    const localLine = state().lines.findLast((line: any) => line.content === "Only the terrace hears these words.");
    assert.deepEqual(localLine.heardBy, ["aqua", "feddy"]);
    assert.deepEqual(localLine.soundOnly.characterIds, ["neighbor"]);
    for (const [field, domain] of [
      ["memoryChanges", "memories"],
      ["relationshipChanges", "relationships"],
      ["wishChanges", "wishes"],
      ["projectSpeech", "projects"],
    ]) {
      const id = "corrupt-" + domain;
      const text = "Accepted prose for " + domain + ".";
      semanticExchangeAnswer = quietSystem();
      delete semanticExchangeAnswer[field];
      if (field === "relationshipChanges")
        semanticExchangeAnswer[field] = { changes: "bad", permissions: [], disclosures: [] };
      answer = {
        playerSpeechCapture: { status: "silent", utterances: [] },
        segments: [{ kind: "dialogue", speakerId: "aqua", text }],
      };
      const beforeTurn = modelCalls;
      const response = await app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: {
          sessionId: scene.id,
          submissionId: id,
          message: "*waits*",
          mode: "chat",
          targetId: "",
          expectedSceneRevision: state().sceneRevision,
        },
      });
      assert.equal(response.statusCode, domain === "relationships" ? 500 : 200, response.body);
      assert.equal(modelCalls, beforeTurn + 2);
      const saved = state().submissions.find((row: any) => row.id === id);
      assert.equal(saved.processing.domains[domain].status, "failed");
      assert(saved.effectFailures[domain]);
      assert(state().lines.some((line: any) => line.content === text));
      assert.doesNotMatch(response.body, /effectFailures|speechSource|Malformed Project/);
      const beforeReplay = modelCalls;
      const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/" + scene.id + "/changes/replay" });
      assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(modelCalls, beforeReplay, "storage replay makes zero model calls");
      domainRecoveryAnswer =
        domain === "projects"
          ? { projectSpeech: [] }
          : domain === "memories"
            ? { memoryChanges: [] }
            : domain === "wishes"
              ? { wishChanges: [] }
              : { relationshipChanges: { changes: [], permissions: [], disclosures: [] } };
      const beforeLines = clone(state().lines);
      const beforeNarration = narrationCalls;
      const retry = await app.inject({
        method: "POST",
        url: "/api/villages/rooms/" + scene.id + "/changes/" + id + "/interpret",
        payload: { domain },
      });
      assert.equal(retry.statusCode, 200, retry.body);
      assert.equal(narrationCalls, beforeNarration, "effect recovery never rewrites Narration");
      assert.deepEqual(state().lines, beforeLines);
      assert.equal(state().submissions.find((row: any) => row.id === id).processing.domains[domain].status, "applied");
    }

    semanticExchangeAnswer = quietSystem();
    {
      const previousIntent = semanticIntentAnswer;
      const message = 'I whisper "PRIVATE WORDS." to Feddy. *drops a pebble*';
      const span = (kind: string, words: string, extra: Record<string, unknown> = {}) => ({
        kind,
        text: words,
        start: message.indexOf(words),
        end: message.indexOf(words) + words.length,
        ...extra,
      });
      semanticIntentAnswer = {
        status: "resolved",
        instructions: "Preserve whispered speech and separate nonverbal noise.",
        action: null,
        movement: null,
        timeline: [
          span("context", "I whisper"),
          span("speech", "PRIVATE WORDS.", { delivery: "whisper", targetId: "feddy" }),
          span("context", "to Feddy."),
          span("action", "*drops a pebble*"),
        ],
      };
      await turn("current-mixed-private-noise", message, [
        { speakerId: "player", text: "PRIVATE WORDS.", delivery: "whisper", targetId: "feddy" },
        {
          kind: "narration",
          text: "A pebble taps the terrace boards.",
          sound: { sourceId: "player", text: "A pebble taps", loud: true },
        },
      ]);
      const queries = createSceneQueryService({
        readSession: async () => fixtureSceneState(state(), records),
        readVillageState: async () => village,
        villagesDocuments: () => documents,
      } as any);
      const evidence = await queries.readProjectTurnEvidence(scene.id, "current-mixed-private-noise");
      assert.equal(evidence.playerMessagesByActor.feddy, "PRIVATE WORDS.");
      assert.equal(evidence.playerMessagesByActor.aqua, undefined);
      assert.equal(
        evidence.playerMessagesByActor.neighbor,
        undefined,
        "Hearing noise cannot disclose the private Project input",
      );
      semanticIntentAnswer = previousIntent;
    }
    for (const fault of ["before", "after"] as const) {
      failedSaveId = "save-fault-" + fault;
      saveFault = fault;
      const text = "Exactly once prose " + fault;
      answer = { playerSpeechCapture: { status: "silent", segments: [] }, segments: [{ kind: "narration", text }] };
      const payload = {
        sessionId: scene.id,
        submissionId: failedSaveId,
        mode: "chat",
        targetId: "",
        message: "*waits*",
        expectedSceneRevision: state().sceneRevision,
      };
      const beforeCalls = modelCalls;
      const failed = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(failed.statusCode, 500, failed.body);
      await stop?.();
      await app.close();
      app = Fastify();
      await start();
      const recovered = await app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: { ...payload, retryOfAttemptId: state().operation.attemptId },
      });
      assert.equal(recovered.statusCode, 200, recovered.body);
      assert.equal(modelCalls, beforeCalls + 2, "restart/storage replay uses the checkpointed Narration");
      assert.equal(state().lines.filter((line: any) => line.content === text).length, 1);
      assert.equal(state().submissions.filter((turn: any) => turn.id === failedSaveId).length, 1);
    }

    const beforeRestart = modelCalls;
    await stop?.();
    await app.close();
    app = Fastify();
    await start();
    const restored = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.doesNotMatch(
      restored.body + (await publicHistory(local.session.playback.scope)),
      /PRIVATE WORDS NEVER DELIVERED|Distant Resident/,
    );
    assert.equal(modelCalls, beforeRestart, "Reading restored sound history buys no model response");
    records.clear();
    for (const [id, row] of retained) records.set(id, row);
    semanticIntentAnswer = oldIntent;
    semanticExchangeAnswer = oldExchange;
  }
  delete semanticExchangeAnswer.memoryChanges;
  semanticIntentAnswer.timeline = [{ kind: "action", text: "*waits*" }];
  await turn("semantic-missing-domain", "*waits*", [{ text: "The conversation pauses." }]);
  assert.equal(
    state().submissions.at(-1).semanticReady,
    true,
    "Non-authority metadata failure preserves usable dialogue",
  );
  assert.equal(state().submissions.at(-1).processing.domains.memories.status, "failed");
  await turn("after-optional-failure", "*waits*", [{ text: "The conversation continues." }]);
  const failedMemoryTurn = () => state().submissions.find((row: any) => row.id === "semantic-missing-domain");
  assert.equal(
    failedMemoryTurn().processing.domains.memories.status,
    "failed",
    "optional failure remains visible without blocking play",
  );
  const continued = await app.inject({
    method: "POST",
    url: `/api/villages/rooms/${scene.id}/changes/semantic-missing-domain/continue`,
    payload: { domain: "memories" },
  });
  assert.equal(continued.statusCode, 200, continued.body);
  assert.equal(failedMemoryTurn().processing.domains.memories.status, "rejected");
  assert(failedMemoryTurn().semanticContinuedDomains.includes("memories"));
  assert(
    Object.values(records.get("villages-village").data.semanticContinuations).some((domains: any) =>
      domains.includes("memories"),
    ),
  );
  semanticExchangeAnswer.memoryChanges = [];
  await turn("semantic-after-continue", "*waits*", [{ text: "The room settles again." }]);
  semanticExchangeAnswer.events = {
    moves: [{ characterId: "aqua", zoneId: "not-a-zone", segment: 0 }],
    departures: [],
    contactEnd: [],
  };
  answer = {
    playerSpeechCapture: { status: "silent", segments: [] },
    segments: [{ text: "Aqua waits beside the railing." }],
  };
  const metadataPayload = {
    sessionId: scene.id,
    submissionId: "semantic-metadata-recovery",
    mode: "chat",
    targetId: "",
    message: "*waits*",
    expectedSceneRevision: state().sceneRevision,
  };
  const beforeMetadata = modelCalls,
    beforeMetadataNarration = narrationCalls;
  const invalidMetadata = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/turn",
    payload: metadataPayload,
  });
  assert.equal(invalidMetadata.statusCode, 502, invalidMetadata.body);
  assert.equal(modelCalls, beforeMetadata + 2);
  assert(!state().submissions.some((row: any) => row.id === metadataPayload.submissionId));
  const noAutomaticReplacement = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/turn",
    payload: metadataPayload,
  });
  assert.equal(noAutomaticReplacement.statusCode, 409, noAutomaticReplacement.body);
  assert.equal(modelCalls, beforeMetadata + 2, "Rejected System output never triggers automatic replacement");
  semanticExchangeAnswer.events = { moves: [], departures: [], contactEnd: [] };
  const recoveredMetadata = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/turn",
    payload: { ...metadataPayload, retryOfAttemptId: state().operation.attemptId },
  });
  assert.equal(recoveredMetadata.statusCode, 200, recoveredMetadata.body);
  assert.equal(modelCalls, beforeMetadata + 3, "Explicit retry replaces only the failed System stage");
  assert.equal(narrationCalls, beforeMetadataNarration + 1, "The saved narration is retained byte for byte");
  // Invalid writer sound metadata must be replaced only by a deliberate retry,
  // including after System has completed and across package reactivation.
  const beforeInvalidSound = clone(records);
  for (const [semanticVersion, writingVersion] of [[2, 3]]) {
    records.clear();
    for (const [key, record] of clone(beforeInvalidSound)) records.set(key, record);
    editFixtureScene((saved) => {
      saved.semanticVersion = semanticVersion;
    });
    const beforeScene = clone(state());
    const beforeWorld = clone(records.get("villages-village"));
    const payload: Record<string, any> = {
      sessionId: scene.id,
      submissionId: `invalid-sound-${semanticVersion}-${writingVersion}`,
      message: "*waits*",
      mode: "chat",
      targetId: "",
      expectedSceneRevision: state().sceneRevision,
    };
    if (writingVersion !== 3) {
      const { operation, ...snapshot } = clone(state());
      const input = { ...operation.input, writingContractVersion: writingVersion };
      if (writingVersion === 1) delete input.writingCapabilities;
      editFixtureScene((saved) => {
        saved.operation = {
          ...operation,
          id: payload.submissionId,
          input,
          snapshot,
          status: "interrupted",
          sceneRevision: state().sceneRevision,
          checkpoints: {},
          attempts: {},
        };
      });
      payload.retryOfAttemptId = state().operation.attemptId;
    }
    answer = {
      playerSpeechCapture: { status: "silent", segments: [] },
      residentActions: [],
      segments: [{ text: "Aqua sets her cup down.", sound: { sourceId: "aqua", text: "x".repeat(301) } }],
    };
    const beforeCalls = modelCalls,
      beforeWriting = narrationCalls;
    const failed = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(failed.statusCode, 502, failed.body);
    assert.match(failed.body, /invalid narrated sound/);
    assert.equal(narrationCalls, beforeWriting + 1);
    assert.deepEqual(state().lines, beforeScene.lines);
    assert.deepEqual(state().submissions, beforeScene.submissions);
    assert.deepEqual(state().sceneAttendance, beforeScene.sceneAttendance);
    assert.deepEqual(records.get("villages-village"), beforeWorld, "invalid sound applies no world effects");
    assert.equal(state().operation.input.message, payload.message, "the player's original draft survives");
    assert(!Object.keys(state().operation.checkpoints).some((key) => key.startsWith("writing-completion:")));
    assert(
      Object.entries(state().operation.attempts).some(
        ([key, value]: [string, any]) =>
          key.startsWith(writingVersion === 3 ? "writing-completion:" : "turn-reply:") && value.status === "rejected",
      ),
    );
    assert(
      readPrivateDiagnostics(records.get("villages-private-diagnostics").data).entries.some(
        (entry: any) => entry.reason === "invalid-narrated-sound" && entry.content.includes("x".repeat(301)),
      ),
      "the rejected writer response remains in bounded server-only diagnostics",
    );
    const afterFailure = modelCalls;
    assert.equal(afterFailure, beforeCalls + (semanticVersion === 2 ? 2 : 1));
    await stop?.();
    await app.close();
    app = Fastify();
    await start();
    const restored = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.doesNotMatch(restored.body, /"checkpoints"|"attempts"|rejected-responses|x{301}/);
    const blocked = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(blocked.statusCode, 409, blocked.body);
    const stale = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: { ...payload, retryOfAttemptId: "wrong-attempt" },
    });
    assert.equal(stale.statusCode, 409, stale.body);
    assert.equal(modelCalls, afterFailure, "read, restart and unauthorized replay never replace a reply");
    answer.segments = [{ text: "Aqua puts her cup beside the railing." }];
    const retryPayload = { ...payload, retryOfAttemptId: state().operation.attemptId };
    const recovered = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: retryPayload });
    assert.equal(recovered.statusCode, 200, recovered.body);
    assert.equal(narrationCalls, beforeWriting + 2, "explicit retry replaces the invalid writer completion");
    assert.equal(modelCalls, afterFailure + (semanticVersion === 2 ? 2 : 1));
    assert.equal(state().submissions.filter((row: any) => row.id === payload.submissionId).length, 1);
    assert(!state().lines.some((line: any) => line.content === "Aqua sets her cup down."));
    const afterRetry = modelCalls;
    const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: retryPayload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(modelCalls, afterRetry, "successful retry replays without another model request");
  }
  records.clear();
  for (const [key, record] of clone(beforeInvalidSound)) records.set(key, record);
  // A wrong System move can invalidate routing without making the writer invalid.
  semanticExchangeAnswer.events = {
    moves: [{ characterId: "aqua", zoneId: "kitchen", segment: 0 }],
    departures: [],
    contactEnd: [],
  };
  answer = {
    playerSpeechCapture: { status: "silent", segments: [] },
    residentActions: [],
    segments: [
      { text: "Aqua settles beside the railing." },
      { speakerId: "aqua", text: "Just between us.", delivery: "whisper", targetId: "player" },
    ],
  };
  const routingPayload = {
    sessionId: scene.id,
    submissionId: "system-routing-recovery",
    message: "*waits*",
    mode: "chat",
    targetId: "",
    expectedSceneRevision: state().sceneRevision,
  };
  const beforeRoutingWriting = narrationCalls;
  const wrongRouting = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: routingPayload });
  assert.equal(wrongRouting.statusCode, 502, wrongRouting.body);
  assert.match(wrongRouting.body, /recipient in the same Zone/);
  assert(Object.keys(state().operation.checkpoints).some((key) => key.startsWith("writing-completion:")));
  semanticExchangeAnswer.events = { moves: [], departures: [], contactEnd: [] };
  const beforeRoutingRetry = modelCalls;
  const routingRetry = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/turn",
    payload: { ...routingPayload, retryOfAttemptId: state().operation.attemptId },
  });
  assert.equal(routingRetry.statusCode, 200, routingRetry.body);
  assert.equal(modelCalls, beforeRoutingRetry + 1, "only the incorrect System interpretation is replaced");
  assert.equal(narrationCalls, beforeRoutingWriting + 1, "valid writing survives movement-dependent routing failure");
  assert.deepEqual(
    state().sceneAttendance,
    beforeInvalidSound.get("villages-venue-visit-" + scene.id).data.sceneAttendance,
  );
  records.clear();
  for (const [key, record] of clone(beforeInvalidSound)) records.set(key, record);
  // A simple complete System verdict is consumed once, without Decisions or a second Wish judge.
  const liveWorld = fixtureVillageState(records.get("villages-village").data, records);
  const wish = fixtureWish(
    { wish: "A brief discussion of the harbour" },
    "semantic-simple-wish",
    new Date(now).toISOString(),
  );
  liveWorld.villagers.find((row: any) => row.characterId === "aqua").wishes = [wish];
  records.get("villages-village").data = liveWorld;
  editFixtureScene((saved) => {
    saved.continuity.facts.villagers = clone(liveWorld.villagers);
  });
  semanticIntentAnswer.timeline = [{ kind: "speech", text: "Let us discuss the harbour." }];
  semanticExchangeAnswer.wishChanges = [
    {
      actorId: "aqua",
      wishId: wish.id,
      intent: "fulfilled",
      evidence: [0, 1],
      reason: "The brief discussion took place.",
    },
  ];
  await turn("semantic-simple-wish", '"Let us discuss the harbour."', [
    { speakerId: "player", text: "Let us discuss the harbour." },
    { speakerId: "aqua", text: "The harbour is peaceful today; that was a pleasant discussion." },
  ]);
  assert.equal(state().submissions.at(-1).processing.domains.wishes.status, "applied");
  assert(
    fixtureVillageState(records.get("villages-village").data, records)
      .villagers.find((row: any) => row.characterId === "aqua")
      .wishes.some((row: any) => row.id === wish.id && row.status === "fulfilled"),
  );
  const canonicalVenue = records.get("villages-village").data.venues[0];
  initializeVenueAccess(canonicalVenue);
  canonicalVenue.access.managerIds = ["aqua"];
  records.get("villages-venue-visit-" + scene.id).data = coerceSession({
    version: 3,
    ...clone(scene),
    continuity: captureSceneContinuity(
      fixtureVillageState(records.get("villages-village").data, records),
      scene,
      Date.parse(now),
    ),
    semanticVersion: 2,
    status: "opening",
    lines: [],
    submissions: [],
    sceneRevision: 0,
  });
  {
    const beforeGreeting = clone(records);
    const text = "Your greeting carries across the boards.";
    semanticIntentAnswer = { status: "resolved", timeline: [], instructions: "", action: null, movement: null };
    semanticExchangeAnswer = {
      consistent: false,
      playerAgencyViolation: { segment: 0, quote: text },
      authority: { physical: false, access: false, projects: false, standing: false, social: false },
      action: null,
      access: [],
      events: { moves: [], departures: [], contactEnd: [] },
      memoryChanges: [],
      relationshipChanges: { changes: [], permissions: [], disclosures: [] },
      wishChanges: [],
      projectSpeech: [],
    };
    answer = { playerSpeechCapture: { status: "silent", utterances: [] }, segments: [{ text }] };
    const count = modelCalls,
      narrationCount = narrationCalls;
    const rejected = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/greet",
      payload: { sessionId: scene.id },
    });
    assert.equal(rejected.statusCode, 502, rejected.body);
    assert.match(rejected.body, /invented a player action or speech/);
    assert.equal(state().status, "opening");
    assert.deepEqual(state().lines, []);
    assert.equal(modelCalls, count + 2, "no automatic regeneration after rejection");
    const retryOfAttemptId = state().operation.attemptId;
    semanticExchangeAnswer = { ...semanticExchangeAnswer, consistent: true, playerAgencyViolation: null };
    answer = {
      playerSpeechCapture: { status: "silent", utterances: [] },
      segments: [{ text: "The lantern sways gently." }],
    };
    const retried = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/greet",
      payload: { sessionId: scene.id, retryOfAttemptId },
    });
    assert.equal(retried.statusCode, 200, retried.body);
    assert.equal(narrationCalls, narrationCount + 2, "explicit retry replaces the rejected opening");
    assert.equal(state().lines.filter((line: any) => line.content === "The lantern sways gently.").length, 1);
    records.clear();
    for (const [key, value] of clone(beforeGreeting)) records.set(key, value);
  }
  const invitation = {
    actorId: "aqua",
    visitorId: "player",
    venueId: "harbour",
    zoneId: "kitchen",
    outcome: "invite-now",
    duration: "visit",
    conditions: ["accompanied"],
    accompanies: true,
    evidence: [0],
  };
  semanticExchangeAnswer = {
    consistent: true,
    authority: { physical: false, access: true, projects: false, standing: false, social: false },
    action: null,
    access: [invitation],
    events: { moves: [], departures: [], contactEnd: [] },
    memoryChanges: [],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
    wishChanges: [],
    projectSpeech: [],
  };
  answer = {
    playerSpeechCapture: { status: "silent", segments: [] },
    segments: [{ speakerId: "aqua", text: "Come through with me." }],
  };
  semanticIntentAnswer = { status: "resolved", timeline: [], instructions: "", action: null, movement: null };
  const beforeOpening = modelCalls;
  const opening = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/greet",
    payload: { sessionId: scene.id },
  });
  assert.equal(opening.statusCode, 200, opening.body);
  assert.equal(modelCalls, beforeOpening + 2, "Opening uses one Narration and one System pass");
  assert.equal(state().submissions[0].semanticReady, true);
  const openingGrant = records.get("villages-village").data.venues[0].access.permissions.at(-1);
  assert.equal(openingGrant.zoneId, "kitchen");
  assert.equal(openingGrant.accompaniedBy, "aqua");
  await app.inject({ method: "POST", url: "/api/villages/rooms/greet", payload: { sessionId: scene.id } });
  assert.equal(modelCalls, beforeOpening + 2, "Opening recovery reuses the access receipt");
  semanticIntentAnswer = {
    status: "resolved",
    timeline: [{ kind: "action", text: "*waits*" }],
    instructions: "Wait quietly.",
    action: null,
    movement: null,
  };
  semanticExchangeAnswer.access = [{ ...invitation, zoneId: "terrace", outcome: "invite-outside-hours" }];
  await turn("semantic-after-hours", "*waits*", [
    { speakerId: "aqua", text: "We can stay past closing as long as you stay beside me." },
  ]);
  const afterHours = records.get("villages-village").data.venues[0].access.permissions.at(-1);
  assert.equal(afterHours.outsideHours, true);
  assert.equal(afterHours.accompaniedBy, "aqua", "Outside-hours scope must retain accompaniment");
  semanticExchangeAnswer.access = [invitation, { ...invitation, zoneId: "bedroom" }];
  await turn("semantic-two-invites", "*waits*", [
    { speakerId: "aqua", text: "You may visit the kitchen or bedroom with me." },
  ]);
  const multiple = records.get("villages-village").data.venues[0].access.permissions.slice(-2);
  assert.deepEqual(multiple.map((row: any) => row.zoneId).sort(), ["bedroom", "kitchen"]);
  const physical = {
    segment: 0,
    happened: true,
    narration: "The cloth is straightened.",
    expectedRevision: canonicalVenue.zones.find((zone: any) => zone.id === "terrace").state.revision,
    actorIds: ["player"],
    consent: [],
    recent: { text: "The cloth is straight." },
  };
  semanticIntentAnswer = {
    status: "resolved",
    timeline: [{ kind: "action", text: "*straightens the cloth*" }],
    instructions: "Supported local action.",
    action: physical,
    movement: null,
  };
  semanticExchangeAnswer.action = physical;
  semanticExchangeAnswer.access = [];
  semanticExchangeAnswer.authority = { physical: true, access: false, projects: false, standing: false, social: false };
  semanticExchangeAnswer.memoryChanges = [
    {
      action: "create",
      kind: "experience",
      text: "I straightened the cloth.",
      subjects: ["player"],
      domainRef: { kind: "physical", id: scene.placeId },
      effectId: `venue-chat:${scene.id}:semantic-physical`,
      learners: {
        player: { basis: "validated-event", support: [{ lineId: 0, excerpt: "You straighten the cloth." }] },
      },
    },
  ];
  await turn("semantic-physical", "*straightens the cloth*", [{ text: "You straighten the cloth." }]);
  assert(
    fixtureVillageState(records.get("villages-village").data, records).memories.records.some(
      (row) => row.text === "I straightened the cloth." && row.knowers.player,
    ),
    "a player-witnessed physical receipt supports their own Memory",
  );
  semanticExchangeAnswer.memoryChanges = [];
  assert.equal(state().submissions.at(-1).semanticReady, true);
  assert.equal(
    records.get("villages-village").data.venues[0].zones.find((zone: any) => zone.id === "terrace").state.recent.text,
    physical.recent.text,
  );
  assert(
    Object.values(records.get("villages-village").data.exchangeReceipts).some(
      (row: any) => row.domain === "physical" && row.submissionId === "semantic-physical",
    ),
  );
  const mixed = '"Before." *walks into the kitchen* "Between." *returns to the terrace* "After."';
  semanticIntentAnswer = {
    status: "resolved",
    instructions: "Preserve ordered whispers and movement.",
    action: null,
    movement: null,
    timeline: [
      { kind: "speech", text: "Before.", delivery: "whisper", targetId: "feddy" },
      { kind: "movement", text: "*walks into the kitchen*", zoneId: "kitchen" },
      { kind: "speech", text: "Between.", delivery: "whisper", targetId: "neighbor" },
      { kind: "movement", text: "*returns to the terrace*", zoneId: "terrace" },
      { kind: "speech", text: "After.", delivery: "whisper", targetId: "feddy" },
    ],
  };
  semanticExchangeAnswer.action = null;
  semanticExchangeAnswer.authority = {
    physical: false,
    access: false,
    projects: false,
    standing: false,
    social: false,
  };
  semanticExchangeAnswer.events = {
    moves: [],
    playerMoves: [
      { zoneId: "kitchen", segment: 1 },
      { zoneId: "terrace", segment: 3 },
    ],
    departures: [],
    contactEnd: [],
  };
  const beforeBlocked = structuredClone(records);
  const frozenScene = structuredClone(state());
  const frozenWorld = structuredClone(records.get("villages-village"));
  for (const mode of ["chat", "act", "fulfill"]) {
    records.clear();
    for (const [key, record] of structuredClone(beforeBlocked)) records.set(key, record);
    answer = {
      playerSpeechCapture: { status: "silent", utterances: [] },
      residentActions: [],
      segments: [{ text: "You remain on the terrace." }],
    };
    const response = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: scene.id,
        submissionId: "blocked-" + mode,
        mode,
        targetId: "",
        message: mixed,
        expectedSceneRevision: state().sceneRevision,
      },
    });
    assert.equal(response.statusCode, 409, response.body);
    assert.match(response.body, /Use Move to change Zones/);
    assert.equal(state().zoneId, frozenScene.zoneId);
    assert.deepEqual(state().lines, frozenScene.lines);
    assert.deepEqual(state().submissions, frozenScene.submissions);
    assert.deepEqual(records.get("villages-village"), frozenWorld, "Blocked travel commits no world effects");
    const writingCalls = modelCalls;
    const retry = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: scene.id,
        submissionId: "blocked-" + mode,
        mode,
        targetId: "",
        message: mixed,
        expectedSceneRevision: state().sceneRevision,
        retryOfAttemptId: state().operation.attemptId,
      },
    });
    assert.equal(retry.statusCode, 409, retry.body);
    assert.match(retry.body, /Use Move to change Zones/);
    assert.equal(modelCalls, writingCalls + 1, "Explicit retry preserves writing and retries only interpretation");
  }
  records.clear();
  for (const [key, record] of structuredClone(beforeBlocked)) records.set(key, record);

  // The reported fountain walk is local even if System calls it movement.
  const fountain = 'I walk over towards the fountain. "Sup gamers?"';
  semanticIntentAnswer = {
    status: "resolved",
    instructions: "",
    action: null,
    movement: null,
    timeline: [
      { kind: "movement", text: "I walk over towards the fountain.", zoneId: "terrace" },
      { kind: "speech", text: "Sup gamers?", delivery: "ordinary" },
    ],
  };
  semanticExchangeAnswer.events = { moves: [], departures: [], contactEnd: [] };
  await turn("same-zone-fountain", fountain, [
    { text: "You walk toward the fountain on the terrace." },
    { speakerId: "player", text: "Sup gamers?" },
    { speakerId: "aqua", text: "Morning!" },
  ]);
  assert.equal(state().zoneId, "terrace");
  assert.deepEqual(state().submissions.at(-1).semanticPlayerMoves, []);

  // Packaged intent validation preserves drafts, frozen evidence and explicit retry accounting.
  {
    const retained = clone(records),
      oldIntent = clone(semanticIntentAnswer);
    const localMessage = "*I wave to Aqua.*";
    semanticIntentAnswer = {
      status: "resolved",
      instructions: "",
      action: null,
      movement: null,
      timeline: [{ kind: "action", text: localMessage, zoneId: "terrace", targetId: "aqua" }],
    };
    const beforeLocal = clone(state()),
      beforeWorld = clone(records.get("villages-village"));
    await turn("local-zone-annotation", localMessage, [{ text: "You wave to Aqua." }]);
    assert.equal(state().zoneId, beforeLocal.zoneId);
    assert.deepEqual(state().sceneAttendance, beforeLocal.sceneAttendance);
    assert.deepEqual(
      records.get("villages-village").data.venues,
      beforeWorld.data.venues,
      "Local annotations grant no physical/access effects",
    );
    assert.deepEqual(records.get("villages-village").data.villagers, beforeWorld.data.villagers);
    assert.deepEqual(state().submissions.at(-1).semanticPlayerMoves, []);
    for (const [id, message, timeline, error] of [
      ["prefix", "*I wave.* *I smile.*", [{ kind: "action", text: "*I smile.*" }], /omits player input/],
      [
        "middle",
        "*I wave.* *I nod.* *I smile.*",
        [
          { kind: "action", text: "*I wave.*" },
          { kind: "action", text: "*I smile.*" },
        ],
        /omits player input/,
      ],
      ["suffix", "*I wave.* *I smile.*", [{ kind: "action", text: "*I wave.*" }], /omits player input/],
      [
        "zone",
        "*I wave.* *I smile.*",
        [{ kind: "action", text: "*I wave.* *I smile.*", zoneId: "kitchen" }],
        /invalid Zone metadata/,
      ],
    ] as const) {
      records.clear();
      for (const [key, value] of clone(retained)) records.set(key, value);
      semanticIntentAnswer = { status: "resolved", instructions: "", action: null, movement: null, timeline };
      answer = {
        playerSpeechCapture: { status: "silent", utterances: [] },
        residentActions: [],
        segments: [{ text: "You greet Aqua with a wave and a smile." }],
      };
      const before = clone(state()),
        worldBefore = clone(records.get("villages-village"));
      const payload = {
        sessionId: scene.id,
        submissionId: "timeline-" + id,
        mode: "chat",
        targetId: "",
        message,
        expectedSceneRevision: state().sceneRevision,
      };
      const callsBefore = modelCalls,
        writingBefore = narrationCalls;
      const rejected = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(rejected.statusCode, 502, rejected.body);
      assert.match(rejected.body, error);
      assert.equal(modelCalls, callsBefore + 2, "Invalid intent triggers no automatic replacement");
      assert.deepEqual(state().lines, before.lines);
      assert.deepEqual(state().submissions, before.submissions);
      assert.deepEqual(state().sceneAttendance, before.sceneAttendance);
      assert.deepEqual(records.get("villages-village"), worldBefore);
      assert.equal(state().operation.input.message, message);
      const snapshots = Object.entries(state().operation.checkpoints).filter(([key]) => key.endsWith(":input"));
      assert(snapshots.length > 0);
      const frozen = JSON.stringify(snapshots);
      const blocked = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(blocked.statusCode, 409, blocked.body);
      assert.equal(modelCalls, callsBefore + 2);
      await stop?.();
      await app.close();
      app = Fastify();
      await start();
      semanticIntentAnswer = {
        status: "resolved",
        instructions: "",
        action: null,
        movement: null,
        timeline: [{ kind: "action", text: message, zoneId: "terrace" }],
      };
      let retrySnapshots = "";
      beforeSemanticResponse = () => {
        retrySnapshots = JSON.stringify(
          Object.entries(state().operation.checkpoints).filter(([key]) => key.endsWith(":input")),
        );
      };
      const retryPayload = { ...payload, retryOfAttemptId: state().operation.attemptId };
      const recovered = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: retryPayload });
      assert.equal(recovered.statusCode, 200, recovered.body);
      assert.equal(modelCalls, callsBefore + 3, "Explicit retry repeats only the rejected System interpretation");
      assert.equal(narrationCalls, writingBefore + 1, "Recovery preserves the saved Narration");
      assert.equal(retrySnapshots, frozen, "Retry dispatch preserves the frozen prompt/input byte for byte");
      assert.equal(state().submissions.filter((row: any) => row.id === payload.submissionId).length, 1);
      const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: retryPayload });
      assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(modelCalls, callsBefore + 3, "Accepted recovery replays without another model request");
    }
    records.clear();
    for (const [key, value] of clone(retained)) records.set(key, value);
    semanticIntentAnswer = oldIntent;
  }

  // A cited player-agency violation retires the invalid narration, but replacement
  // is dispatched only on the player's explicit retry.
  {
    const retained = clone(records),
      oldIntent = clone(semanticIntentAnswer),
      oldExchange = clone(semanticExchangeAnswer);
    const beforeLines = clone(state().lines);
    const text = "Your greeting carries across the boards.";
    const payload = {
      sessionId: scene.id,
      submissionId: "invented-greeting",
      message: "*waits quietly*",
      mode: "chat",
      targetId: "",
      expectedSceneRevision: state().sceneRevision,
    };
    semanticIntentAnswer = {
      status: "resolved",
      instructions: "",
      action: null,
      movement: null,
      timeline: [{ kind: "action", text: payload.message }],
    };
    semanticExchangeAnswer = { ...oldExchange, consistent: false, playerAgencyViolation: { segment: 0, quote: text } };
    answer = { playerSpeechCapture: { status: "silent", utterances: [] }, segments: [{ text }] };
    const before = modelCalls,
      beforeNarration = narrationCalls;
    const rejected = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(rejected.statusCode, 502, rejected.body);
    assert.match(rejected.body, /invented a player action or speech/, JSON.stringify(lastSemanticInput.evidence));
    assert.deepEqual(state().lines, beforeLines, "rejected prose never enters the Scene");
    assert.equal(modelCalls, before + 2, "rejection does not automatically request a replacement");
    assert.equal(narrationCalls, beforeNarration + 1);
    const retryOfAttemptId = state().operation.attemptId;
    semanticExchangeAnswer = { ...oldExchange, consistent: true, playerAgencyViolation: null };
    answer = {
      playerSpeechCapture: { status: "silent", utterances: [] },
      segments: [{ text: "Aqua watches the water." }],
    };
    const retried = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: { ...payload, retryOfAttemptId },
    });
    assert.equal(retried.statusCode, 200, retried.body);
    assert.equal(narrationCalls, beforeNarration + 2, "explicit retry replaces the rejected draft");
    assert(!state().lines.some((line: any) => line.content === text));
    assert.equal(state().lines.filter((line: any) => line.content === "Aqua watches the water.").length, 1);
    records.clear();
    for (const [key, value] of clone(retained)) records.set(key, value);
    semanticIntentAnswer = oldIntent;
    semanticExchangeAnswer = oldExchange;
  }

  // The whole mixed submission is an expected rejection, before consistency/effect review.
  {
    const retained = clone(records),
      oldIntent = clone(semanticIntentAnswer),
      oldExchange = clone(semanticExchangeAnswer);
    const blocked = coerceSession({
      version: 3,
      ...clone(scene),
      continuity: captureSceneContinuity(
        fixtureVillageState(records.get("villages-village").data, records),
        scene,
        Date.parse(now),
      ),
      semanticVersion: 2,
      sceneRevision: 0,
    });
    blocked.sceneAttendance!.occupants.find((row) => row.characterId === "distant")!.zoneId = "kitchen";
    records.get("villages-village").data.venues[0].zones.find((zone: any) => zone.id === "kitchen").seen = true;
    records.get("villages-venue-visit-" + scene.id).data = blocked;
    const mixed = '"Aqua and Feddy, come into the Kitchen now." *folds the cloth*';
    semanticIntentAnswer = {
      status: "resolved",
      instructions: "",
      action: null,
      movement: null,
      timeline: [
        { kind: "speech", text: "Aqua and Feddy, come into the Kitchen now." },
        { kind: "action", text: "*folds the cloth*" },
      ],
    };
    semanticExchangeAnswer = {
      consistent: false,
      reason: "Draft promises an impossible crossing.",
      immediateResidentMoves: [{ characterIds: ["aqua", "feddy"], zoneId: "kitchen", source: 0 }],
      authority: { physical: true, access: true, projects: true, standing: true },
      action: { invalid: "must never be applied" },
      access: [{ invalid: "must never be applied", evidence: [1] }],
      events: { moves: [{ characterId: "aqua", zoneId: "kitchen", segment: 2 }] },
      memoryChanges: [{ invalid: "must never become a memory" }],
    };
    answer = {
      playerSpeechCapture: {
        status: "captured",
        segments: [{ segment: 0, sources: [{ text: "Aqua and Feddy, come into the Kitchen now.", occurrence: 1 }] }],
      },
      segments: [
        { speakerId: "player", text: "Aqua and Feddy, come into the Kitchen now." },
        { speakerId: "aqua", text: "I'm coming." },
      ],
    };
    // Kitchen has two occupants: add one more captured passive resident, leaving one slot.
    blocked.sceneAttendance!.occupants.push({
      ...clone(blocked.sceneAttendance!.occupants[2]),
      characterId: "passive",
      name: "Passive witness",
    });
    const fictional = () =>
      clone({
        lines: state().lines,
        submissions: state().submissions,
        accompanying: state().accompanying,
        attendance: state().sceneAttendance,
        revision: state().sceneRevision,
      });
    const beforeFiction = fictional(),
      beforeWorld = clone(records.get("villages-village"));
    const payload = {
      sessionId: scene.id,
      submissionId: "occupancy-unavailable",
      message: mixed,
      mode: "act",
      targetId: "",
      expectedSceneRevision: 0,
    };
    const beforeCalls = modelCalls;
    const result = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().turnOutcome, "occupancy-unavailable");
    assert.deepEqual(
      [...lastSemanticInput.residentRequestLocalIds].sort(),
      ["aqua", "feddy"],
      "Request resolution receives captured local residents separately from reply profiles",
    );
    assert(!lastSemanticInput.residentRequestLocalIds.includes("passive"), "Unseen occupancy stays private");
    assert.equal(result.json().session.operation.status, "complete");
    assert.equal(result.json().session.operation.error, "");
    assert.equal(result.json().session.operation.input.message, mixed, "reload can restore the player's own draft");
    assert(!result.body.includes("rejectedSubmissions"));
    assert(!result.body.includes("passive"), "private attendance does not explain occupancy");
    assert.equal(modelCalls, beforeCalls + 2, "only the existing writer and System exchange are used");
    assert.deepEqual(fictional(), beforeFiction, "mixed input and generated reaction add no fictional state");
    assert.deepEqual(
      records.get("villages-village").data,
      beforeWorld.data,
      "no world, memory, access or physical effect",
    );
    const replay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(replay.json().turnOutcome, "occupancy-unavailable");
    assert.equal(modelCalls, beforeCalls + 2);
    const mismatch = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: { ...payload, message: "Different request" },
    });
    assert.equal(mismatch.statusCode, 409);

    // Lost storage acknowledgements on either side of the receipt cannot cause new provider work.
    saveFaultStage = "rejection";
    for (const fault of ["before", "after"] as const) {
      failedSaveId = "occupancy-fault-" + fault;
      saveFault = fault;
      const faultPayload = { ...payload, submissionId: failedSaveId };
      const failed = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload: faultPayload });
      assert.equal(failed.statusCode, 500, failed.body);
      const savedCalls = modelCalls;
      if (fault === "after") {
        const read = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
        assert.equal(
          read.json().session.operation.status,
          "complete",
          "a durable unavailable receipt is terminal on reload",
        );
        assert.equal(read.json().session.operation.turnOutcome, "occupancy-unavailable");
        const edited = await app.inject({
          method: "POST",
          url: "/api/villages/rooms/turn",
          payload: { ...payload, submissionId: "occupancy-edited-before-cleanup" },
        });
        assert.equal(edited.statusCode, 200, edited.body);
        assert.equal(
          edited.json().turnOutcome,
          "occupancy-unavailable",
          "an edited Send is not stuck behind receipt cleanup",
        );
      }
      await stop?.();
      await app.close();
      app = Fastify();
      await start();
      const recovered = await app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: { ...faultPayload, retryOfAttemptId: state().operation.attemptId },
      });
      assert.equal(recovered.statusCode, 200, recovered.body);
      assert.equal(recovered.json().turnOutcome, "occupancy-unavailable");
      assert.equal(state().operation.status, "complete");
      assert.equal(
        modelCalls,
        savedCalls + (fault === "after" ? 2 : 0),
        "recovery uses the saved semantic result or receipt",
      );
      assert.deepEqual(fictional(), beforeFiction);
    }
    saveFaultStage = "submission";
    failedSaveId = "";
    const oldId = payload.submissionId;
    const history = await app.inject({ method: "GET", url: `/api/villages/rooms/${scene.id}/operations/${oldId}` });
    assert.equal(
      history.json().operation.turnOutcome,
      "occupancy-unavailable",
      "a newer operation cannot hide a rejected result",
    );
    assert.equal(history.json().operation.input, null, "historical receipt stores no discarded dialogue");
    const callsBeforeHistoricalReplay = modelCalls;
    const historicalReplay = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(historicalReplay.statusCode, 200, historicalReplay.body);
    assert.equal(historicalReplay.json().turnOutcome, "occupancy-unavailable");
    assert.equal(modelCalls, callsBeforeHistoricalReplay, "superseded rejected IDs never regenerate");
    const receiptsBeforeStale = clone(state().rejectedSubmissions);
    beforeSemanticResponse = () => {
      editFixtureScene((saved) => {
        saved.sceneRevision++;
      });
    };
    const stale = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: { ...payload, submissionId: "occupancy-stale" },
    });
    assert.equal(stale.statusCode, 409, stale.body);
    assert.deepEqual(
      state().rejectedSubmissions,
      receiptsBeforeStale,
      "stale owners cannot save an unavailable receipt",
    );
    records.clear();
    for (const [key, record] of retained) records.set(key, record);
    semanticIntentAnswer = oldIntent;
    semanticExchangeAnswer = oldExchange;
  }

  // A valid negative check is retained; only generated world-boundary failures earn one replacement.
  for (const scenario of ["success", "repeat", "greeting"]) {
    const repeat = scenario === "repeat",
      greeting = scenario === "greeting";
    const retained = clone(records),
      oldIntent = clone(semanticIntentAnswer),
      oldExchange = clone(semanticExchangeAnswer);
    if (greeting) {
      editFixtureScene((saved) => {
        saved.status = "opening";
        saved.lines = [];
        saved.submissions = [];
      });
    }
    const beforeLines = clone(state().lines),
      beforeCalls = modelCalls,
      beforeWriting = narrationCalls;
    const bad = "Aqua dies.",
      good = "Aqua watches the water.";
    semanticIntentAnswer = {
      status: "resolved",
      instructions: "",
      action: null,
      movement: null,
      timeline: greeting ? [] : [{ kind: "action", text: "*waits quietly*" }],
    };
    answer = { playerSpeechCapture: { status: "silent", utterances: [] }, segments: [{ text: bad }] };
    const adjudicate = () => {
      semanticExchangeAnswer = {
        ...oldExchange,
        halt: { reason: "condition", source: "draft", quote: bad, appointments: [] },
      };
      if (!repeat) {
        answer = { playerSpeechCapture: { status: "silent", utterances: [] }, segments: [{ text: good }] };
        beforeSemanticResponse = () => {
          semanticExchangeAnswer = { ...oldExchange, halt: { reason: "none", quote: "", appointments: [] } };
        };
      }
    };
    beforeSemanticResponse = adjudicate;
    const payload = {
      sessionId: scene.id,
      submissionId: "boundary-repair-" + scenario,
      message: greeting ? "" : "*waits quietly*",
      mode: "chat",
      targetId: "",
      expectedSceneRevision: state().sceneRevision,
    };
    const route = greeting ? "/api/villages/rooms/greet" : "/api/villages/rooms/turn";
    const result = await app.inject({ method: "POST", url: route, payload });
    assert.equal(result.statusCode, repeat ? 502 : 200, result.body);
    assert.equal(narrationCalls, beforeWriting + 2);
    assert.equal(modelCalls, beforeCalls + (repeat ? 3 : 4), "identical bad evidence reuses its adjudication");
    assert(!state().lines.some((line: any) => line.content === bad));
    if (repeat) assert(state().operation.checkpoints["scene-boundary-replacement"]);
    const after = modelCalls;
    const replay = await app.inject({ method: "POST", url: route, payload });
    assert.equal(modelCalls, after, "duplicate sends cannot buy another replacement");
    if (repeat) {
      assert.deepEqual(state().lines, beforeLines);
      assert.match(result.body, /generated reply exceeded/);
      // Simulate a provider-complete replacement whose completion checkpoint was not persisted.
      const rawReplacement = Object.entries(state().operation.attempts).find(
        ([key]) => key.startsWith("writing-completion:") && key.includes("-boundary:"),
      );
      assert(rawReplacement);
      const rawAnswer = JSON.parse((rawReplacement[1] as any).result.content);
      rawAnswer.segments = [{ text: good }];
      editFixtureScene((saved) => {
        const attempt = saved.operation.attempts[rawReplacement[0]];
        attempt.status = "complete";
        attempt.result = { ...attempt.result, content: JSON.stringify(rawAnswer) };
        delete attempt.response;
      });
      const rawCalls = modelCalls,
        rawWriting = narrationCalls;
      await stop!();
      app = Fastify();
      await start();
      assert.equal(narrationCalls, rawWriting, "restart reuses a completed replacement without dispatch");
      assert.equal(modelCalls, rawCalls, "startup cannot buy a missing System check");
      assert(
        Object.keys(state().operation.checkpoints).some(
          (key) => key.startsWith("writing-completion:") && key.endsWith("-boundary"),
        ),
        "raw replacement is checkpointed during local recovery",
      );
      answer = { playerSpeechCapture: { status: "silent", utterances: [] }, segments: [{ text: good }] };
      semanticExchangeAnswer = { ...oldExchange, halt: { reason: "none", quote: "", appointments: [] } };
      const retried = await app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: { ...payload, retryOfAttemptId: state().operation.attemptId },
      });
      assert.equal(retried.statusCode, 200, retried.body);
      assert.equal(narrationCalls, beforeWriting + 2, "explicit retry after restart reuses the completed writer");
      assert.equal(modelCalls, rawCalls + 1, "explicit retry buys only the missing System check");
    } else assert.equal(replay.statusCode, 200, replay.body);
    records.clear();
    for (const [key, value] of clone(retained)) records.set(key, value);
    semanticIntentAnswer = oldIntent;
    semanticExchangeAnswer = oldExchange;
    beforeSemanticResponse = undefined;
  }

  // Preservation boundaries use the real packaged admission, storage and recovery owners.
  {
    const retained = clone(records),
      oldIntent = clone(semanticIntentAnswer),
      oldExchange = clone(semanticExchangeAnswer);
    const message = '"Hello." *I sleep for two months*';
    let sourceLines: unknown[] = [];
    const reset = async () => {
      beforeSemanticResponse = undefined;
      records.clear();
      for (const [key, record] of retained) records.set(key, clone(record));
      // Construct a chronologically valid old capture, without a later incidental arrangement.
      records.get("villages-village").data.venues[0].zones.find((row: any) => row.id === "terrace").state.recent = null;
      const preserved = coerceSession({
        ...clone(scene),
        version: 3,
        semanticVersion: 2,
        sceneRevision: 0,
        startedAt: "2026-10-12T14:00:00.000Z",
        sceneAttendance: { ...clone(scene.sceneAttendance), capturedAt: "2026-10-12T14:00:00.000Z" },
        lines: [],
        submissions: [],
      });
      preserved.continuity = captureSceneContinuity(
        fixtureVillageState(records.get("villages-village").data, records),
        preserved,
        Date.parse(preserved.startedAt),
      );
      records.get("villages-venue-visit-" + scene.id).data = preserved;
      semanticIntentAnswer = {
        status: "resolved",
        instructions: "Ordinary speech",
        action: null,
        movement: null,
        timeline: [
          { kind: "speech", text: "Hello." },
          { kind: "action", text: "*I sleep for two months*" },
        ],
      };
      semanticExchangeAnswer = {
        consistent: true,
        authority: { physical: false, access: false, projects: false, standing: false, social: false },
        action: null,
        access: [],
        events: { moves: [], departures: [], contactEnd: [] },
        memoryChanges: [],
        relationshipChanges: { changes: [], permissions: [], disclosures: [] },
        wishChanges: [],
        projectSpeech: [],
      };
      answer = {
        playerSpeechCapture: {
          status: "captured",
          segments: [{ segment: 0, sources: [{ text: "Hello.", occurrence: 1 }] }],
        },
        segments: [
          { speakerId: "player", text: "Hello." },
          { speakerId: "aqua", text: "Hello back." },
        ],
      };
      await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
      sourceLines = clone(state().lines);
    };
    for (const [reason, expected] of [
      ["time", "halt-time"],
      ["activity", "halt-time"],
      ["condition", "halt-state"],
      ["world", "halt-world"],
      ["appointment", "halt-appointment"],
    ]) {
      await reset();
      semanticExchangeAnswer.halt =
        reason === "appointment"
          ? {
              reason: "none",
              quote: "",
              appointments: [{ source: "player", date: "2026-10-13", minute: 780, quote: "Hello." }],
            }
          : { reason, source: "player", quote: "two months" };
      const before = clone(state()),
        worldBefore = clone(records.get("villages-village").data),
        calls = modelCalls;
      const payload = {
        sessionId: scene.id,
        submissionId: "halt-" + reason,
        message,
        mode: "act",
        targetId: "",
        expectedSceneRevision: state().sceneRevision,
      };
      const result = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(result.statusCode, 200, result.body);
      assert.equal(result.json().turnOutcome, expected);
      for (const key of ["lines", "submissions", "sceneAttendance", "activeIds", "sceneRevision"])
        assert.deepEqual(state()[key], before[key], key);
      assert.deepEqual(records.get("villages-village").data, worldBefore, "held turns have no world or memory effects");
      assert.equal(state().operation.input.message, message);
      assert.equal(state().operation.input.chosenAt, now);
      assert.equal(lastSemanticInput.context.preservation.sceneAt, "2026-10-12T14:00:00.000Z");
      assert.deepEqual(lastSemanticInput.context.preservation.calendar, {
        instant: "2026-10-12T14:00:00.000Z",
        date: "2026-10-12",
        weekday: "Monday",
        time: "07:00",
        timeZone: "America/Los_Angeles",
      });
      assert.equal(modelCalls, calls + 2, "HALT adds no provider calls");
      await stop?.();
      await app.close();
      app = Fastify();
      await start();
      const recovered = await app.inject({
        method: "GET",
        url: `/api/villages/rooms/${scene.id}/operations/${payload.submissionId}`,
      });
      assert.equal(recovered.json().operation.turnOutcome, expected, "restart preserves the held result");
      assert.equal(recovered.json().operation.input.message, message);
      const retry = await app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(retry.json().turnOutcome, expected);
      assert.equal(modelCalls, calls + 2, "replay does not regenerate");
    }
    await reset();
    semanticExchangeAnswer.halt = { reason: "time", source: "player", quote: "two months" };
    const farewell = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/leave",
      payload: {
        sessionId: scene.id,
        submissionId: "halt-farewell",
        message,
        expectedSceneRevision: state().sceneRevision,
      },
    });
    assert.equal(farewell.statusCode, 200, farewell.body);
    assert.equal(farewell.json().turnOutcome, "halt-time");
    assert.equal(state().status, "active", "a held farewell does not conclude the Scene");
    assert.deepEqual(state().lines, sourceLines);
    await reset();
    const death = "I start walking away before I slip, hit my head, and die";
    semanticExchangeAnswer.halt = { reason: "condition", source: "player", quote: "hit my head, and die" };
    answer = {
      playerSpeechCapture: { status: "silent", segments: [] },
      segments: [{ speakerId: "aqua", text: "Go steady." }],
    };
    const deathResult = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/leave",
      payload: {
        sessionId: scene.id,
        submissionId: "halt-death-farewell",
        message: death,
        expectedSceneRevision: state().sceneRevision,
      },
    });
    assert.equal(deathResult.statusCode, 200, deathResult.body);
    assert.equal(deathResult.json().turnOutcome, "halt-state");
    assert.equal(state().status, "active");
    assert.equal(state().operation.input.message, death);
    assert.deepEqual(state().lines, sourceLines, "the safe farewell cannot replace an unsupported death input");
    await reset();
    const zone = () => records.get("villages-village").data.venues[0].zones.find((row: any) => row.id === "terrace");
    const action = {
      happened: true,
      segment: 0,
      narration: "You fold the cloth.",
      expectedRevision: zone().state.revision,
      actorIds: ["player"],
      consent: [],
      recent: { text: "A neat folded cloth." },
    };
    semanticIntentAnswer = {
      status: "resolved",
      instructions: "Fold the cloth.",
      action,
      movement: null,
      timeline: [{ kind: "action", text: "*folds the cloth*" }],
    };
    semanticExchangeAnswer.action = action;
    semanticExchangeAnswer.authority = {
      physical: true,
      access: false,
      projects: false,
      standing: false,
      social: false,
    };
    answer = { playerSpeechCapture: { status: "silent", segments: [] }, segments: [{ text: "You fold the cloth." }] };
    beforeSemanticResponse = () => {
      zone().description = "The cloth was removed elsewhere.";
      zone().state.revision++;
    };
    const changed = await app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: scene.id,
        submissionId: "halt-changed-target",
        message: "*folds the cloth*",
        mode: "chat",
        targetId: "",
        expectedSceneRevision: state().sceneRevision,
      },
    });
    assert.equal(changed.statusCode, 200, changed.body);
    assert.equal(changed.json().turnOutcome, "halt-world");
    assert.deepEqual(state().lines, sourceLines);
    assert.equal(zone().description, "The cloth was removed elsewhere.");
    zone().description = state().continuity.facts.venues[0].zones.find((row: any) => row.id === "terrace").description;
    zone().state.revision = action.expectedRevision;
    await turn("preserved-physical", "*folds the cloth*", [{ text: "You fold the cloth." }]);
    assert.equal(
      zone().state.updatedAt,
      "2026-10-12T14:00:00.000Z",
      "physical continuity retains Scene occurrence time",
    );
    assert.equal(
      zone().state.recent.expiresAt,
      "2026-10-13T14:00:00.000Z",
      "accepting old events cannot refresh them to today",
    );
    const physicalEvent =
      records.get("villages-village").data.exchangeReceipts[`venue-chat:${scene.id}:preserved-physical`];
    assert.equal(physicalEvent.at, "2026-10-12T14:00:00.000Z");
    assert.equal(physicalEvent.committedAt, now);
    await reset();
    const acceptedText = "Aqua likes blue bicycles.";
    semanticExchangeAnswer.memoryChanges = [
      {
        action: "create",
        kind: "open-matter",
        subjects: ["aqua"],
        text: acceptedText,
        learners: { aqua: { basis: "report", attributedTo: "aqua", support: [{ lineId: 0, excerpt: acceptedText }] } },
      },
    ];
    semanticIntentAnswer.timeline = [{ kind: "speech", text: "Tell me about bicycles." }];
    await turn("preserved-memory", '"Tell me about bicycles."', [{ speakerId: "aqua", text: acceptedText }]);
    assert.equal(state().submissions.at(-1).at, "2026-10-12T14:00:00.000Z");
    const memory = fixtureVillageState(records.get("villages-village").data, records).memories.records.find(
      (row) => row.text === acceptedText,
    )!;
    assert(memory, "a supported rewrite can be accepted in an old Scene");
    assert.equal(memory.occurredAt, "2026-10-12T14:00:00.000Z");
    assert.equal(memory.recordedAt, now, "recording does not invent intervening days");
    records.clear();
    for (const [key, record] of retained) records.set(key, record);
    semanticIntentAnswer = oldIntent;
    semanticExchangeAnswer = oldExchange;
  }

  const afterMovePhysical = {
    ...physical,
    segment: 1,
    expectedRevision: records.get("villages-village").data.venues[0].zones.find((row: any) => row.id === "terrace")
      .state.revision,
    recent: { text: "The cloth is folded." },
  };
  semanticIntentAnswer = {
    status: "resolved",
    instructions: "Fold the cloth locally.",
    action: afterMovePhysical,
    movement: null,
    timeline: [{ kind: "action", text: "*folds the cloth*" }],
  };
  semanticExchangeAnswer.action = afterMovePhysical;
  semanticExchangeAnswer.authority = { physical: true, access: false, projects: false, standing: false, social: false };
  semanticExchangeAnswer.events = {
    moves: [{ characterId: "aqua", zoneId: "kitchen", segment: 0 }],
    departures: [],
    contactEnd: [],
  };
  await turn("semantic-physical-after-departure", "*folds the cloth*", [
    { text: "Aqua steps into the kitchen." },
    { text: "You fold the cloth on the terrace." },
  ]);
  const movedWitnessReceipt =
    records.get("villages-village").data.exchangeReceipts[`venue-chat:${scene.id}:semantic-physical-after-departure`];
  assert.deepEqual(
    movedWitnessReceipt.physicalOutcome.actionReceipt.witnessIds,
    ["player", "feddy"],
    "Physical proof uses actual witnesses at its segment, not initial attendance",
  );
  semanticIntentAnswer = {
    status: "resolved",
    instructions: "Wait quietly.",
    action: null,
    movement: null,
    timeline: [{ kind: "action", text: "*waits*" }],
  };
  semanticExchangeAnswer.action = null;
  semanticExchangeAnswer.authority = {
    physical: false,
    access: false,
    projects: false,
    standing: false,
    social: false,
  };
  semanticExchangeAnswer.events = { moves: [], departures: [], contactEnd: [], sceneEnded: { source: 0 } };
  delete semanticExchangeAnswer.memoryChanges;
  await turn("semantic-conclusion-recovery", "*waits*", [{ speakerId: "feddy", text: "I'll see you next time." }]);
  assert.equal(state().status, "active", "An NPC goodbye cannot end the preserved encounter; Conclude is explicit");
  assert.equal(state().submissions.at(-1).processing.domains.memories.status, "failed");
  const beforeConcludeRead = modelCalls;
  await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
  assert.equal(modelCalls, beforeConcludeRead, "Reading the concluded Scene performs no paid recovery");
  console.log(
    "Archive-identical HTTP acceptance: current System generation, private sound/history, exactly-once recovery, held domains, continuity and Wish settlement passed with synthetic providers.",
  );
} finally {
  await stop?.();
  await app.close();
  globalThis.fetch = originalFetch;
  mock.timers.reset();
}
