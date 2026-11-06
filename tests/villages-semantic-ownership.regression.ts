import assert from "node:assert/strict";
import { createExchangeProcessing } from "../packages/villages/src/server/domain/decoding/exchange-codec.js";
import {
  continueSemanticDomain,
  semanticBlocker,
} from "../packages/villages/src/server/domain/rules/semantic-continuity.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { materializeGmReply } from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { sceneMemoryContext, sceneMemoryUnit } from "../packages/villages/src/server/domain/rules/scene-memories.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import {
  readSemanticEffects,
  semanticContext,
  semanticImmediate,
  semanticWishChangesCovered,
} from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { sceneSpriteSelection } from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { createSemanticService } from "../packages/villages/src/server/features/generation/semantic-service.js";
import { createResidentPlanning } from "../packages/villages/src/server/features/residents/resident-planning-service.js";
import { fixtureWish, wishWorld } from "./helpers/social-wishes-fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { fixtureRelationshipIdentity, fixtureWishIdentity } from "./helpers/village-storage.fixture.js";

async function main() {
  // A door-closing narration is not a resident statement ending contact.
  {
    const farewell = [
      { speakerId: "player", kind: "dialogue", content: "Good night!" },
      { speakerId: "buster", kind: "dialogue", content: "Good night. Watch the step." },
      { speakerId: "__venue_scene__", kind: "narration", content: "He holds the door." },
      { speakerId: "buster", kind: "dialogue", content: "See you tomorrow." },
      { speakerId: "__venue_scene__", kind: "narration", content: "The door clicks shut." },
    ] as any;
    const frozen = JSON.stringify(farewell);
    assert.throws(
      () => semanticImmediate({ moves: [], departures: [], contactEnd: [{ source: 4 }] }, farewell),
      /invalid source/,
    );
    assert.throws(
      () => semanticImmediate({ moves: [], departures: [], contactEnd: [], sceneEnded: { source: 0 } }, farewell),
      /invalid source/,
    );
    const ended = semanticImmediate({ moves: [], departures: [], contactEnd: [], sceneEnded: { source: 1 } }, farewell);
    assert.deepEqual(ended.sceneEnded, { source: 1, speakerId: "buster", quote: "Good night. Watch the step." });
    assert.equal(JSON.stringify(farewell), frozen, "Rejected event binding never rewrites saved prose");
  }

  // Ordinary multi-resident dialogue must not grow optional earlier history without a byte budget.
  {
    const historyState = defaultVillageState();
    historyState.seed = "bounded-system-history";
    historyState.villagers = ["a", "b", "c"].map((characterId) => ({
      letterFontId: "caveat",
      characterId,
      cardSnapshot: { id: characterId, name: characterId },
      wishes: [],
    })) as any;
    const rows = Array.from({ length: 18 }, (_, index) => ({
      id: "earlier-" + index,
      speakerId: "a",
      role: "assistant",
      kind: "dialogue",
      content: "Unchanged witnessed supper conversation " + index + " " + "river ".repeat(100),
      heardBy: ["a", "b", "c"],
      at: "2026-10-19T06:00:00.000Z",
      zoneId: "common:base",
      delivery: "ordinary",
      contactHidden: false,
      staging: { prose: "render-only ".repeat(80) },
    }));
    const historyScene = {
      version: 4,
      id: "supper",
      startedAt: "2026-11-01T12:00:00.000Z",
      activeIds: ["a", "b", "c"],
      lines: rows,
      placeId: "missing",
      zoneId: "common:base",
      sceneRevision: 1,
    } as any;
    const original = JSON.stringify(historyScene);
    const bounded = semanticContext(historyScene, historyState, "Tell me about yourselves", true);
    assert(
      Buffer.byteLength(JSON.stringify(bounded.history), "utf8") <= 6000,
      "Earlier System history must stay bounded during ordinary three-resident conversation",
    );
    assert(bounded.history.length > 0 && bounded.history.length < rows.length);
    for (const line of bounded.history) {
      const source = rows.find((row) => row.id === line.id)!;
      assert.equal(line.content, source.content, "Whole evidence text stays exact");
      assert.deepEqual(line.heardBy, source.heardBy, "Witness scope stays exact");
      assert.equal(line.contactHidden, source.contactHidden);
      assert.equal(line.delivery, source.delivery);
    }
    assert.equal(bounded.history.at(-1)?.id, rows.at(-1)?.id, "Recent conversational context remains available");
    assert.equal(JSON.stringify(historyScene), original, "Prompt projection never edits saved dialogue");
  }

  // Long Wish evidence reaches System exactly once, with its private source details intact.
  {
    const state = wishWorld();
    const wish = fixtureWish({ wish: "Share a quiet conversation" }, "quiet-conversation");
    wish.conditions = [
      {
        id: "quiet",
        quote: "Only when I choose to talk.",
        at: wish.addedAt,
        sourceId: "condition-source",
        lineIds: ["condition-line"],
      },
    ];
    wish.history = Array.from({ length: 200 }, (_, index) => ({
      id: "event-" + index,
      at: wish.addedAt,
      kind: "approach",
      text: "Exact refusal marker " + index + ": café 東京 " + "Please leave this approach alone. ".repeat(8),
      sourceId: "source-" + index,
      lineIds: ["line-" + index],
    }));
    state.villagers[0].wishes = [wish];
    const scene = {
      id: "wish-evidence",
      startedAt: "2026-11-01T12:00:00.000Z",
      activeIds: ["a"],
      lines: [],
      placeId: "missing",
      zoneId: "common:base",
      sceneRevision: 1,
    } as any;
    const before = JSON.stringify(state);
    const packet = semanticContext(scene, state, "Would you like to talk?", true);
    assert.deepEqual(packet.actors[0].wishes, [wish], "Whole conditions, refusals and source IDs remain available");
    const serialized = JSON.stringify(packet);
    assert.equal(
      serialized.split(wish.history[199].text).length - 1,
      1,
      "Long exact evidence must not be charged twice in the model input",
    );
    assert.equal(JSON.stringify(state), before, "Prompt construction preserves the saved ledger");
  }

  // Closed archives are optional; open desires and every selected unit remain complete.
  {
    const state = wishWorld();
    const open = fixtureWish({ wish: "Visit the pottery studio" }, "open-pottery");
    const archive = Array.from({ length: 60 }, (_, index) => {
      const wish = fixtureWish({ wish: "Chart the constellations " + index }, "closed-star-" + index);
      wish.status = index % 2 ? "withdrawn" : "fulfilled";
      wish.history = Array.from({ length: 30 }, (_, event) => ({
        id: "history-" + event,
        at: wish.addedAt,
        kind: "progress",
        text: "Retained telescope observation " + "café 東京 ".repeat(12),
        sourceId: "source-" + event,
        lineIds: ["line-" + event],
      }));
      return wish;
    });
    const target = archive[0];
    target.conditions = [
      {
        id: "consent",
        quote: "Only by the blue observatory.",
        at: target.addedAt,
        sourceId: "consent",
        lineIds: ["c"],
      },
    ];
    state.villagers[0].wishes = [open, ...archive];
    const scene = {
      id: "archive",
      startedAt: "2026-11-01T12:00:00.000Z",
      activeIds: ["a"],
      lines: [],
      placeId: "missing",
    } as any;
    const before = JSON.stringify(state);
    const selected = semanticContext(scene, state, "Hello there", true);
    assert.deepEqual(selected.actors[0].wishes, [open], "Unrelated closed history cannot crowd out ordinary speech");
    const full = semanticContext(scene, state, "Hello there", false);
    assert(JSON.stringify(selected).length < JSON.stringify(full).length / 10, "Closed-archive payload falls over 90%");
    for (const query of [target.id, "constellations", "blue observatory", "東京"])
      assert.deepEqual(
        semanticContext(scene, state, query, true).actors[0].wishes.find((wish) => wish.id === target.id),
        target,
        "Referenced closed records keep exact conditions, history and sources",
      );
    assert.deepEqual(
      semanticContext(scene, state, "Hello there", true, false, state, target.id).actors[0].wishes,
      [open, target],
      "The current draft can introduce a reference absent from the input",
    );
    scene.lines = [{ content: "blue observatory", heardBy: ["a"] }];
    assert(semanticContext(scene, state, "How was it?", true).actors[0].wishes.some((wish) => wish.id === target.id));
    assert.equal(JSON.stringify(state), before, "Selection never rewrites retained history");

    const proposal = { actorId: "a", wishId: open.id, intent: "progress", evidence: [0], reason: "Witnessed outcome" };
    assert(semanticWishChangesCovered([proposal], selected.actors));
    assert(!semanticWishChangesCovered([{ ...proposal, wishId: target.id }], selected.actors));
    assert(!semanticWishChangesCovered([{ ...proposal, actorId: "b" }], selected.actors));
    assert(!semanticWishChangesCovered([{ ...proposal, wishId: "forged" }], selected.actors));
    assert(!semanticWishChangesCovered([{}], selected.actors));
    const create = {
      ...proposal,
      wishId: "new:tea",
      intent: "create",
      desire: { wish: "Have tea", reason: "Company" },
    };
    const follow = { ...proposal, wishId: create.wishId };
    assert(semanticWishChangesCovered([create, follow], selected.actors), "Same-source aliases remain supported");
    assert(!semanticWishChangesCovered([follow, create], selected.actors), "A future alias is not supplied evidence");
    assert(!semanticWishChangesCovered([create, { ...follow, actorId: "b" }], selected.actors));
    assert(!semanticWishChangesCovered([{ ...create, actorId: "b" }], selected.actors));
  }

  // Enforce JSON-mode compatibility using actual resident planning and offscreen review prompts.
  const { deriveVillageMoment } = await import("../packages/villages/src/server/domain/rules/village-clock.js");
  const eventMoment = deriveVillageMoment({
    foundedAt: "2026-10-16T00:00:00.000Z",
    seed: "json-mode",
    now: new Date("2026-10-16T12:00:00.000Z"),
  });
  const opportunity = {
    id: "offered",
    kind: "routine",
    actorIds: ["a"],
    venueId: "room",
    startsAt: eventMoment.instant,
    endsAt: eventMoment.instant,
    facts: [],
  };
  const spokenLines = [{ speakerId: "a", text: "Tea is ready." }];
  const jsonCalls: string[] = [];
  const fakeSystem = {
    model: "fake-system",
    connectionId: "system",
    maxOutputTokens: 4096,
    fitContext: (messages: unknown, options: any) => ({ messages, ...options, trimmed: false }),
  };
  const planning = createResidentPlanning({
    activeVenueSession: async () => null,
    relationshipIdentity: fixtureRelationshipIdentity,
    wishIdentity: fixtureWishIdentity,
    readVillageState: async () => defaultVillageState(),
    villagesLanguageModels: () => ({ resolveForRequest: async () => fakeSystem }),
    villagesConnectionIdFor: async () => "system",
    completeWithRoom: async (_model: unknown, messages: any[], _tokens: number, options: any) => {
      assert.equal(options.responseFormat?.type, "json_object");
      assert(
        messages.some((message) => message.role === "system" && /\bjson\b/i.test(message.content)),
        "Strict provider rejects JSON mode without application-authored JSON instruction",
      );
      const review = messages[0].content.startsWith("Independently interpret");
      jsonCalls.push(review ? "review" : "planning");
      if (review)
        assert.deepEqual(JSON.parse(messages[1].content).lines, spokenLines, "Review preserves supplied speech");
      return {
        finishReason: "stop",
        content: JSON.stringify(
          review
            ? {
                wishChanges: [],
                memoryChanges: [],
                relationshipReview: { changes: [], permissions: [], disclosures: [] },
              }
            : {
                happenings: [
                  {
                    opportunityId: opportunity.id,
                    kind: opportunity.kind,
                    actorIds: opportunity.actorIds,
                    venueId: opportunity.venueId,
                    narration: "A kettle steams.",
                  },
                ],
                housingRequests: [],
                routineIdea: null,
                social: { encounter: { lines: spokenLines } },
              },
        ),
      };
    },
  } as any);
  const choices = await planning.handler.generate({
    context: {
      version: 1,
      memory: sceneMemoryContext(defaultVillageState(), [], ""),
      worldFacts: [],
      pendingHousingCharacterIds: [],
      village: "Test",
      setting: "A quiet village",
      moment: eventMoment,
      residents: [],
      recent: [],
      venues: [],
      opportunity,
      lastSimulatedAt: eventMoment.instant,
      forced: false,
      social: { candidates: [], relationships: [] },
    },
  } as any);
  assert.deepEqual(jsonCalls, ["planning"]);
  assert.equal(Object.hasOwn(choices, "happenings"), false);
  assert.equal((choices.social?.encounter as any).semanticVersion, 2);
  assert.deepEqual((choices.social?.encounter as any).lines, spokenLines);

  const state = defaultVillageState();
  state.seed = "synthetic-gm";
  const venue = venueFixture({
    id: "access-venue",
    name: "House",
    residentIds: ["host"],
    classes: ["residence"],
    occupancy: { playerHome: false, residentCharacterId: "host" },
    zones: ["exterior", "common", "room", "other"].map((id) => ({
      ...defaultVenueSpace("residence"),
      id,
      name: id === "other" ? "SECRET INTERIOR" : id,
      kind: id === "exterior" ? "exterior" : id === "common" ? "public" : "restricted",
      ownerId: "host",
      seen: id !== "other",
      connectedTo: id === "common" ? ["exterior", "room", "other"] : ["common"],
    })),
  });
  initializeVenueAccess(venue);
  state.venues = [venue];
  state.villagers = [
    { letterFontId: "caveat", characterId: "host", cardSnapshot: { id: "host", name: "Host" }, wishes: [] },
  ] as any;
  const stamp = "2026-11-05T20:00:00.000Z";
  const scene = coerceSession({
    version: 4,
    id: "scene",
    placeId: venue.id,
    zoneId: "common",
    status: "active",
    startedAt: stamp,
    villageSeed: state.seed,
    gmVersion: 1,
    semanticVersion: 2,
    processingVersion: 1,
    activeIds: ["host"],
    participants: [{ characterId: "host", name: "Host", doing: "Waiting" }],
    sceneAttendance: {
      capturedAt: stamp,
      layout: captureSceneLayout(venue),
      occupants: [{ characterId: "host", name: "Host", doing: "Waiting", zoneId: "common" }],
    },
    lines: [],
    submissions: [],
  });
  scene.operation = {
    id: "turn",
    input: {
      gmVersion: 1,
      semanticPipelineVersion: 3,
      interactionScopeVersion: 6,
      residentMovementReviewVersion: 1,
      hearingTimelineVersion: 1,
    },
  } as any;
  const ports = {
    readVillageState: async () => state,
    venueCheckpoint: async (_key: string, work: () => Promise<any>) => work(),
    villagesLanguageModels: () => assert.fail("GM validation cannot resolve a System model"),
    villagesConnectionIdFor: () => assert.fail("GM validation cannot select a System connection"),
    completeWithRoom: () => assert.fail("GM validation cannot purchase a second response"),
    venueOperationSignal: () => undefined,
    rejectVenueCompletion: async () => assert.fail("The writer owns rejection of its purchased response"),
  } as any;
  const service = createSemanticService(ports);
  const response = (message: string, extra: Record<string, unknown> = {}) => ({
    ...materializeGmReply(
      {
        input: message ? [{ kind: "action", text: message }] : [],
        segments: [{ kind: "narration", text: "A quiet moment." }],
      },
      message,
    ),
    ...extra,
  });
  const run = async (
    message: string,
    raw: Record<string, unknown>,
    lines: any[] = [],
    current = scene,
    using = service,
    context = semanticContext(current, state, message, true, true),
    hearingSource?: Record<string, unknown>,
  ) => {
    const before = structuredClone({ raw, lines, current, state, context });
    try {
      return await using.exchange(
        current,
        message,
        lines,
        {
          raw,
          context,
          presentation: sceneSpriteSelection(current, state),
        },
        null,
        undefined,
        false,
        undefined,
        hearingSource,
      );
    } finally {
      assert.deepEqual(
        { raw, lines, current, state, context },
        before,
        "Local validation preserves exact source and authority",
      );
    }
  };
  const plain = await run("I wait.", response("I wait."));
  assert.equal(plain.producer, "gm");
  assert.equal(plain.intent?.status, "resolved");
  assert.deepEqual(plain.authority, {
    physical: false,
    access: false,
    projects: false,
    standing: false,
    social: false,
  });
  assert.deepEqual(plain.effects.wishChanges, []);
  assert.deepEqual(
    readSemanticEffects(
      { sourceHash: "x", memoryChanges: [{ systemVerification: "supported", semanticVersion: 2, text: "test" }] },
      "x",
    ).memoryChanges,
    [{ text: "test" }],
  );
  assert.equal(
    sceneMemoryUnit({
      action: "create",
      text: "one",
      learners: { host: { support: [{ lineId: 2 }, { lineId: 1 }] } },
    }),
    sceneMemoryUnit({
      action: "create",
      text: "two",
      learners: { host: { support: [{ lineId: 1 }, { lineId: 2 }] } },
    }),
  );
  const visible = publicSceneResponse({
    semanticIntent: plain.intent,
    semanticProvenance: plain,
    content: "Visible",
  }) as any;
  assert.equal(visible.semanticIntent, undefined);
  assert.equal(visible.semanticProvenance, undefined);
  assert.equal(visible.content, "Visible");

  // Full source coverage includes roleplay punctuation, operators and repeated utterances.
  const intent = (timeline: unknown[]) => ({
    status: "resolved",
    instructions: "",
    action: null,
    movement: null,
    timeline,
  });
  for (const kind of ["speech", "thought", "action", "context", "movement"]) {
    for (const zoneId of [undefined, "common", "other", "invented", null, 7, ""]) {
      const raw = response("I wave.", {
        intent: intent([{ kind, text: "I wave.", ...(zoneId === undefined ? {} : { zoneId }) }]),
      });
      if (zoneId === "common" || (zoneId === undefined && kind !== "movement")) {
        assert.deepEqual((await run("I wave.", raw)).intent?.timeline, [
          { kind: kind === "movement" ? "action" : kind, text: "I wave.", start: 0, end: 7 },
        ]);
      } else
        await assert.rejects(
          run("I wave.", raw),
          kind === "movement" && zoneId === "other" ? /Use Move to change Zones/ : /invalid Zone metadata/,
        );
    }
  }
  const exactMessage = "“Hello.” *(I wave.)* [I think quietly.]";
  const exact = await run(
    exactMessage,
    response(exactMessage, {
      intent: intent([
        { kind: "speech", text: "Hello.", targetId: "host", delivery: "whisper", zoneId: "common" },
        { kind: "action", text: "*(I wave.)*", zoneId: "common" },
        { kind: "thought", text: "[I think quietly.]", zoneId: "common" },
      ]),
    }),
  );
  for (const row of exact.intent!.timeline) {
    assert.equal(exactMessage.slice(row.start, row.end), row.text);
    assert.equal(row.zoneId, undefined);
  }
  assert.equal(exact.intent?.timeline[0].targetId, "host");
  assert.equal(exact.intent?.timeline[0].delivery, "whisper");
  assert.deepEqual(
    (
      await run(
        "Yes. Yes.",
        response("Yes. Yes.", {
          intent: intent([
            { kind: "speech", text: "Yes." },
            { kind: "speech", text: "Yes." },
          ]),
        }),
      )
    ).intent?.timeline.map(({ start, end }) => [start, end]),
    [
      [0, 4],
      [5, 9],
    ],
  );
  for (const [message, fragments] of [
    ["I leave. I wave.", ["I wave."]],
    ["I wave. I leave. I smile.", ["I wave.", "I smile."]],
    ["I wave. I leave.", ["I wave."]],
    ["I do not wave.", ["I do", "wave."]],
    ["I pay $5.", ["I pay", "5."]],
    ["Hello!", ["Hello"]],
    ["I transfer 2*5 coins.", ["I transfer 2", "5 coins."]],
    ["I transfer 2 * 5 coins.", ["I transfer 2", "5 coins."]],
    ["guest_room", ["guest", "room"]],
    ["don't", ["don", "t"]],
    ["𝟚’𝟛", ["𝟚", "𝟛"]],
    ["é’é", ["é", "é"]],
  ] as const)
    await assert.rejects(
      run(message, response(message, { intent: intent(fragments.map((text) => ({ kind: "action", text }))) })),
      /omits player input/,
    );
  for (const [row, error] of [
    [{ kind: "action", text: "Invented." }, /invalid or reordered spans/],
    [{ kind: "invalid", text: "I wave." }, /invalid kind/],
    [{ kind: "speech", text: "I wave.", targetId: "unknown" }, /invalid actor reference/],
    [{ kind: "speech", text: "I wave.", delivery: "sing" }, /invalid delivery/],
  ] as const)
    await assert.rejects(run("I wave.", response("I wave.", { intent: intent([row]) })), error);
  await assert.rejects(
    run(
      "I wave. I smile.",
      response("I wave. I smile.", {
        intent: intent([
          { kind: "action", text: "I smile." },
          { kind: "action", text: "I wave." },
        ]),
      }),
    ),
    /invalid or reordered spans/,
  );
  await assert.rejects(
    run(
      "I wave.",
      response("I wave.", {
        intent: { ...intent([{ kind: "action", text: "I wave." }]), movement: { zoneId: "other", quote: "I wave." } },
      }),
    ),
    /Use Move to change Zones/,
  );

  // An unseen Zone exposes only the authority needed to validate access, never its interior.
  const packet = semanticContext(scene, state, "May I visit?", true, true);
  assert(!packet.zones.some((zone) => zone.id === "other"));
  assert.deepEqual(packet.accessScopes.find((zone) => zone.id === "other")?.adjacentZoneIds, ["common"]);
  assert.doesNotMatch(JSON.stringify(packet.accessScopes), /SECRET INTERIOR|condition|items|occupants/);
  const beforeLedger = structuredClone(packet.access);
  for (let index = 0; index < 100; index++) {
    venue.access!.receipts["old-" + index] = {
      fingerprint: "old audit".repeat(30),
      revision: index,
      outcome: "applied",
    };
    venue.access!.changes.push({
      id: "old-" + index,
      revision: index,
      actorId: "host",
      zoneId: "other",
      action: "invite",
      at: stamp,
      sourceLineIds: [],
    });
  }
  assert.deepEqual(
    semanticContext(scene, state, "May I visit?", true, true).access,
    beforeLedger,
    "Old audit growth cannot inflate live authority",
  );
  const accessLine = {
    kind: "dialogue",
    speakerId: "host",
    content: "Stay beside me; we can go through this way.",
    heardBy: ["host"],
    playerHeard: true,
  } as any;
  const row = {
    actorId: "host",
    visitorId: "player",
    venueId: venue.id,
    zoneId: "room",
    outcome: "invite-now",
    duration: "visit",
    conditions: ["accompanied"],
    accompanies: true,
    evidence: [0],
  };
  const invitations = await run("", response("", { access: [row, { ...row, zoneId: "other" }] }), [accessLine]);
  assert.equal(invitations.access?.checks.length, 2);
  assert.equal((invitations.access?.checks[0].facts as any).accessCommand.accompanied, true);
  assert.equal(invitations.access?.results[0].source, "gm");
  assert.equal(
    (
      await run("", response("", { access: [{ ...row, outcome: "unresolved", conditions: ["after supper"] }] }), [
        accessLine,
      ])
    ).authority.access,
    false,
  );
  for (const [changes, error] of [
    [{ conditions: ["after supper"] }, /condition is unsupported/],
    [{ actorId: "stranger" }, /lacks current authority/],
    [{ visitorId: "neighbor" }, /scope is incomplete/],
    [{ evidence: [4] }, /invalid citations/],
    [{ duration: "standing" }, /standing grant contract/],
  ] as const)
    await assert.rejects(run("", response("", { access: [{ ...row, ...changes }] }), [accessLine]), error);
  await assert.rejects(run("", response("", { access: [row] }), [{ ...accessLine, heardBy: [] }]), /not witnessed/);
  const command = {
    action: "invite",
    zoneId: "room",
    visitorId: "player",
    duration: "visit",
    accompanied: true,
    outsideHours: false,
  };
  for (const changed of [{ zoneId: "other" }, { visitorId: "host" }, { duration: "standing" }, { accompanied: false }])
    await assert.rejects(
      run(
        "",
        response("", { access: [{ ...row, outcome: "access-management", command: { ...command, ...changed } }] }),
        [accessLine],
      ),
      /does not match/,
    );
  await assert.rejects(
    run("", response("", { action: { happened: false, segment: 0 } }), [accessLine]),
    /completed, cited action/,
  );
  const memory = await run(
    "",
    response("", {
      memoryChanges: [{ action: "create", text: "A quiet greeting", screening: { fingerprint: "forged" } }],
    }),
  );
  const capturedContext = semanticContext(scene, state, "", true, true);
  assert.equal(
    (memory.effects.memoryChanges as any[])[0].screening.fingerprint,
    capturedContext._memoryWrite.protection.fingerprint,
  );

  const invented = {
    kind: "narration",
    speakerId: "__venue_scene__",
    content: "Your greeting carries across the boards.",
    heardBy: ["host"],
  } as any;
  for (const [extra, error] of [
    [
      { consistent: false, playerAgencyViolation: { segment: 0, quote: invented.content } },
      /invented a player action or speech/,
    ],
    [
      { consistent: false, playerAgencyViolation: { segment: 0, quote: "not in the draft" } },
      /could not match its player-agency review/,
    ],
    [
      { consistent: true, playerAgencyViolation: { segment: 3, quote: invented.content } },
      /could not match its player-agency review/,
    ],
    [
      { consistent: true, playerAgencyViolation: { segment: 0, quote: invented.content } },
      /contradictory player-agency review/,
    ],
    [
      { consistent: false, perceptionViolation: { segment: 0, quote: invented.content } },
      /contradicts its hearing or positions/,
    ],
    [
      { consistent: false, perceptionViolation: { segment: 0, quote: "not in the draft" } },
      /could not match its hearing review/,
    ],
  ] as const)
    await assert.rejects(
      run(
        "",
        response("", extra),
        [invented],
        scene,
        service,
        semanticContext(scene, state, "", true, true),
        Object.hasOwn(extra, "perceptionViolation") ? {} : undefined,
      ),
      error,
    );
  assert.equal((await run("", response(""))).intent?.status, "resolved", "Empty opening carries no invented input");

  const checkpoints = new Map<string, unknown>();
  const replayService = createSemanticService({
    ...ports,
    venueCheckpoint: async (key: string, work: () => Promise<any>) => {
      if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
      const value = await work();
      checkpoints.set(key, structuredClone(value));
      return value;
    },
  });
  const frozenContext = semanticContext(scene, state, "I wave.", true, true);
  const first = await run("I wave.", response("I wave."), [], scene, replayService, frozenContext);
  const savedInput = structuredClone([...checkpoints.values()][0]);
  const changedScene = { ...scene, zoneId: "other" };
  await assert.rejects(
    run(
      "I wave.",
      response("I wave.", { intent: intent([{ kind: "action", text: "I wave.", zoneId: "common" }]) }),
      [],
      changedScene,
      replayService,
      frozenContext,
    ),
    /invalid Zone metadata/,
  );
  assert.deepEqual([...checkpoints.values()][0], savedInput, "Changed live state cannot overwrite admitted evidence");
  assert.equal(
    (await run("I wave.", response("I wave."), [], scene, replayService, frozenContext)).sourceHash,
    first.sourceHash,
  );
  assert.equal(checkpoints.size, 1, "Replay reuses the exact captured validation input");

  for (const [domain, authority, proposals, action, allowed, retained = false] of [
    ["memories", {}, {}, undefined, true],
    ["relationships", {}, {}, undefined, true],
    ["relationships", { standing: true }, {}, undefined, false],
    ["relationships", { social: true }, {}, undefined, false],
    ["relationships", {}, { permissions: [{ action: "grant" }] }, undefined, false],
    ["relationships", {}, { changes: [{ liveAfter: { records: [{ kind: "agreement" }] } }] }, undefined, false],
    ["projects", { projects: true }, {}, undefined, false],
    ["projects", {}, {}, { happened: true }, false],
    ["relationships", {}, { permissions: [{ action: "grant" }] }, undefined, false, true],
    ["relationships", {}, { permissions: [{ action: "revoke" }] }, undefined, false, true],
    ["relationships", {}, { permissions: "malformed" }, undefined, false, true],
    ["relationships", {}, { changes: [{ liveAfter: { connection: "Partners" } }] }, undefined, false, true],
    ["relationships", {}, { changes: [{ liveAfter: { records: [{ kind: "agreement" }] } }] }, undefined, false, true],
    ["projects", {}, { projectSpeech: [{ kind: "approval" }] }, undefined, false, true],
    ["projects", {}, [{ kind: "approval" }], undefined, false, true],
  ] as const) {
    const processing = createExchangeProcessing({
      seed: state.seed,
      sceneId: scene.id,
      submissionId: "continued",
      order: 0,
      lineIds: [],
      actionReceiptIds: [],
    });
    for (const row of Object.values(processing.domains)) row.status = "applied";
    processing.domains[domain].status = "failed";
    const turn = {
      id: "continued",
      semanticProvenance: { ...plain, pipelineVersion: 3, authority },
      semanticReady: true,
      processing,
      liveProposals: { relationshipChanges: retained ? {} : proposals },
      effectFailures: retained
        ? { [domain]: { proposal: domain === "relationships" ? { relationshipChanges: proposals } : proposals } }
        : undefined,
      action,
    } as any;
    if (allowed) {
      assert.equal(semanticBlocker({ submissions: [turn] }), null, "Optional failed metadata cannot block new play");
      continueSemanticDomain(turn, domain);
      assert.equal(processing.domains[domain].status, "rejected");
      const once = structuredClone(turn);
      continueSemanticDomain(turn, domain);
      assert.deepEqual(turn, once, "Repeated Continue is idempotent");
    } else {
      const before = structuredClone(turn);
      assert.match(semanticBlocker({ submissions: [turn] })!, /Retry the failed immediate update/);
      assert.throws(() => continueSemanticDomain(turn, domain), /Only a failed semantic update/);
      assert.deepEqual(turn, before, "Continue cannot discard consequential authority");
    }
  }
  const pending = {
    id: "pending",
    semanticProvenance: { ...plain, pipelineVersion: 3 },
    semanticReady: true,
    processing: createExchangeProcessing({
      seed: state.seed,
      sceneId: scene.id,
      submissionId: "pending",
      order: 0,
      lineIds: [],
      actionReceiptIds: [],
    }),
  } as any;
  assert.equal(semanticBlocker({ submissions: [pending] }), "Updates pending.");
  for (const domain of ["memories", "relationships", "wishes", "projects"] as const)
    assert.throws(() => continueSemanticDomain(pending, domain), /Only a failed semantic update/);
  pending.semanticReady = false;
  assert.match(semanticBlocker({ submissions: [pending] })!, /needs recovery/);

  console.log(
    "Current GM local validation preserves full source coverage, authority, private evidence and checkpoint identity without a System purchase.",
  );
}
void main();
