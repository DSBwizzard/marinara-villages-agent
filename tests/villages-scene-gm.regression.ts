import assert from "node:assert/strict";
import { mock } from "node:test";
import {
  materializeGmReply,
  normalizeGmEffects,
  sceneGmContext,
} from "../packages/villages/src/server/domain/rules/scene-gm.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { semanticContext } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { createSemanticService } from "../packages/villages/src/server/features/generation/semantic-service.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import {
  mapScenePeople,
  scenePersonReferences,
} from "../packages/villages/src/server/domain/rules/scene-prompt-references.js";
import { sceneWritingHistory } from "../packages/villages/src/server/domain/rules/scene-writing-history.js";

{
  const people = scenePersonReferences(["resident-long-id", "other-long-id"]);
  const encode = Object.fromEntries(Object.entries(people).map(([alias, id]) => [id, alias]));
  const example = {
    actors: [{ id: "resident-long-id" }],
    learners: { "resident-long-id": { support: [{ lineId: "resident-long-id", excerpt: "resident-long-id" }] } },
    speakerId: "other-long-id",
    target: { id: "resident-long-id" },
    subjects: ["resident-long-id"],
    text: "resident-long-id",
  };
  const encoded = mapScenePeople(example, encode) as typeof example;
  assert.deepEqual(mapScenePeople(encoded, people), example);
  assert.equal(encoded.text, example.text);
  assert.equal(encoded.target.id, example.target.id, "Memory IDs are not person aliases");
  assert.deepEqual(
    mapScenePeople({ placeDiscoveries: [{ existingId: "resident-long-id" }] }, encode),
    { placeDiscoveries: [{ existingId: "resident-long-id" }] },
    "Place references are not NPC references",
  );
  assert.equal(
    Object.values(encoded.learners)[0]!.support[0]!.lineId,
    "resident-long-id",
    "Source references are separate",
  );
  const alias = encode["resident-long-id"]!;
  assert.throws(() => scenePersonReferences(["resident-long-id", alias]), /references conflict/);
  assert.throws(
    () => mapScenePeople({ learners: { [alias]: {}, "resident-long-id": {} } }, people),
    /references conflict/,
  );
  assert.equal(
    Object.fromEntries(
      Object.entries(scenePersonReferences(["new-arrival", "resident-long-id"])).map(([key, id]) => [id, key]),
    )["resident-long-id"],
    alias,
  );

  const at = "2026-11-01T12:00:00.000Z";
  const lines = ["Old Name", "New Name"].map((name, index) => ({
    id: "line-" + index,
    role: "assistant",
    speakerId: "resident-long-id",
    name,
    kind: "dialogue",
    delivery: "ordinary",
    presentation: "main",
    content: "Exact words " + index,
    heardBy: index ? ["other-long-id", "resident-long-id"] : ["resident-long-id", "other-long-id"],
    at,
    zoneId: "room",
    contactHidden: false,
  }));
  const scene = { lines, submissions: [{ replyLineIds: lines.map((row) => row.id) }], zoneId: "room" } as any;
  const legacy = sceneWritingHistory(scene, lines as any, "", ["resident-long-id", "other-long-id"]);
  const compact = sceneWritingHistory(scene, lines as any, "", ["resident-long-id", "other-long-id"], people);
  const original = JSON.parse(legacy.blocks[0]!.text.slice("Scene exchange: ".length));
  const packet = mapScenePeople(JSON.parse(compact.blocks[0]!.text.slice("Scene exchange: ".length)), people) as any;
  for (const group of packet.groups) {
    group.facts.heardBy = compact.audiences[group.facts.heardBy];
    for (const line of group.lines) {
      line.citable ??= true;
      if (line.kind === "dialogue") {
        line.delivery ??= "ordinary";
        line.presentation ??= "main";
      }
      line.name ??= packet.names[line.speakerId];
    }
  }
  assert.deepEqual(packet.groups, original, "Compact history restores exact historical names, witnesses and text");
  const arrived = sceneWritingHistory(
    {
      ...scene,
      lines: [...lines, { ...lines[0], id: "new", speakerId: "new-arrival", heardBy: ["new-arrival"] }],
      submissions: [...scene.submissions, { replyLineIds: ["new"] }],
    } as any,
    lines as any,
    "",
    ["resident-long-id", "other-long-id", "new-arrival"],
    scenePersonReferences(["resident-long-id", "other-long-id", "new-arrival"]),
  );
  assert.equal(arrived.blocks[0]!.text, compact.blocks[0]!.text, "An arrival cannot rewrite prior history references");
}

const segments = [{ kind: "dialogue", speakerId: "mara", text: "Tea sounds good." }];
const raw = materializeGmReply(
  {
    input: [
      { kind: "thought", text: "I privately think about the key, then say " },
      { kind: "speech", text: "Tea?" },
    ],
    segments,
    access: [{ evidence: [0], actorId: "mara" }],
  },
  'I privately think about the key, then say "Tea?"',
);
assert.equal((raw.segments as any[])[0].text, "Tea?");
assert.deepEqual((raw.access as any[])[0].evidence, [1], "Sources follow inserted player speech");
assert.equal((raw.intent as any).timeline[0].kind, "thought");
assert.throws(() => materializeGmReply({ input: [{ kind: "speech", text: "Invented" }], segments }, "Tea?"));
const context = semanticContext(
  coerceSession({
    version: 4,
    id: "empty",
    startedAt: "2026-11-01T12:00:00.000Z",
    activeIds: [],
    participants: [],
    lines: [],
    submissions: [],
  }),
  defaultVillageState(),
  "",
  true,
);
const empty = normalizeGmEffects({}, context);
{
  const captured = structuredClone(context);
  captured._memoryWrite.recall.candidates = [{ id: "memory", rootId: "memory", revision: 2, rootRevision: 2 }] as any;
  captured._memoryWrite.recall.targetIds = ["memory"];
  captured.zoneId = "room";
  captured.zones = [{ id: "room", revision: 3 }] as any;
  captured.projects = [{ projectId: "project", revision: 4 }] as any;
  const compact = normalizeGmEffects(
    {
      segments: [{ text: "Walls turn blue." }],
      action: { happened: true, segment: 0 },
      projectSpeech: [{ projectId: "project" }],
      memoryChanges: [
        {
          action: "reinforce",
          target: { id: "memory" },
          support: [{ lineId: "h1", excerpt: "Exact words" }],
          learners: {
            a: { basis: "observation" },
            b: { basis: "report", support: [{ lineId: "h2", excerpt: "Different evidence" }] },
          },
          screening: { disposition: "clear" },
        },
      ],
    },
    captured,
    { h1: "original-one", h2: "original-two" },
    true,
  );
  assert.deepEqual((compact.memoryChanges as any[])[0].target, { id: "memory", revision: 2, rootRevision: 2 });
  assert.equal((compact.memoryChanges as any[])[0].learners.a.support[0].lineId, "original-one");
  assert.equal((compact.memoryChanges as any[])[0].learners.b.support[0].lineId, "original-two");
  assert.equal((compact.memoryChanges as any[])[0].support, undefined);
  assert.equal((compact.action as any).expectedRevision, 3);
  assert.equal((compact.action as any).narration, "Walls turn blue.");
  assert.equal((compact.projectSpeech as any[])[0].revision, 4);
  const cited = [0, 1].map((index) => ({
    at: String(index),
    kind: "progress",
    text: "I decline.",
    lineIds: ["source" + index],
  }));
  captured.actors = [
    {
      id: "a",
      name: "A",
      wishes: [
        {
          id: "wish",
          wish: "An exact wish",
          reason: "A reason",
          status: "open",
          origin: { kind: "scene" },
          conditions: [{ id: "condition", quote: "Only together.", at: "original" }],
          history: [
            ...cited,
            ...Array.from({ length: 20 }, (_, i) => ({
              at: String(i),
              kind: "reflection",
              text: "Reflection " + i,
              lineIds: [],
            })),
          ],
        },
      ],
    },
  ] as any;
  const view = sceneGmContext(captured).actors[0]!.wishes[0]!;
  assert.deepEqual(
    view.history.slice(0, 2),
    cited.map(({ lineIds: _ids, ...row }) => row),
    "Separate cited events survive even when words repeat",
  );
  assert.equal(view.history.length, 3, "Superseded uncited reflection bookkeeping is folded");
  assert.equal(view.conditions[0]!.quote, "Only together.");
  assert.equal(captured.actors[0]!.wishes[0]!.history.length, 22, "Saved Wish history is untouched");
}
assert.deepEqual(empty.memoryChanges, []);
assert.deepEqual(empty.wishChanges, []);
assert.equal(empty.consistent, undefined, "No fabricated independent review");
await assert.rejects(
  createSemanticService({
    readVillageState: () => assert.fail("Missing GM context must stop before any I/O"),
  } as any).exchange(coerceSession({ version: 4, id: "missing-context" }), "", [], null),
  /current GM response context is required/,
);

mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-05T20:00:00Z") });
{
  const world = defaultVillageState();
  world.seed = "matched-evidence";
  world.venues = [venueFixture({ id: "room", name: "Room" })];
  world.villagers = ["a", "b"].map((characterId) => ({
    characterId,
    wishes: [],
    cardSnapshot: { id: characterId, name: characterId },
  })) as any;
  const scene = coerceSession({
    version: 4,
    semanticVersion: 2,
    liveSceneVersion: 1,
    id: "history-validation",
    villageSeed: world.seed,
    placeId: "room",
    zoneId: "common",
    startedAt: "2026-11-05T20:00:00Z",
    activeIds: ["a", "b"],
    lines: [],
    submissions: [],
  });
  const source = {
    id: "old-source",
    name: "a",
    role: "assistant",
    speakerId: "a",
    kind: "dialogue",
    content: "I enjoy this conversation.",
    heardBy: ["a", "b"],
    at: scene.startedAt,
  } as const;
  const context = semanticContext(scene, world, "Okay.", true, true);
  const aliases = { h1: source.id };
  const proposal = {
    input: [{ kind: "speech", text: "Okay." }],
    segments: [{ kind: "dialogue", speakerId: "a", text: "h1 remains literal prose." }],
    relationshipChanges: {
      changes: [
        {
          fromId: "a",
          toId: "player",
          expectedRevision: 0,
          patch: { stance: "Interested" },
          lineIds: ["h1"],
          reason: "A witnessed statement",
        },
      ],
    },
  };
  const raw = materializeGmReply(normalizeGmEffects(proposal, context, aliases), "Okay.");
  assert.equal((raw.segments as any[]).at(-1).text, proposal.segments[0].text, "References never rewrite prose");
  assert.equal(
    (
      normalizeGmEffects(
        { memoryChanges: [{ learners: { a: { support: [{ lineId: "constructor", excerpt: "h1" }] } } }] },
        context,
        aliases,
      ).memoryChanges as any[]
    )[0].learners.a.support[0].lineId,
    "constructor",
  );
  raw.heardPlayerBy = ["a", "b"];
  const parsed = (await import("../packages/villages/src/server/domain/rules/scene-reply.js")).parseVenueReply(raw, [
    "a",
    "b",
    "player",
  ]);
  const service = createSemanticService({
    readVillageState: async () => world,
    venueCheckpoint: async (_key, work) => work(),
  } as any);
  const gm = { raw, context, presentation: { state: {}, sprites: {}, variants: false } };
  const accepted = await service.exchange(scene, "Okay.", parsed.lines, { ...gm, earlierEvidence: [source] as any });
  assert.deepEqual(
    accepted.effects.earlierLineIds,
    [source.id],
    "The fitted evidence, not a second history selector, owns citations",
  );
  context.history = [source] as any;
  await assert.rejects(
    () => service.exchange(scene, "Okay.", parsed.lines, { ...gm, earlierEvidence: [] }),
    /Citation was not supplied/,
    "Explicit empty evidence must not fall back",
  );
  await service.exchange(scene, "Okay.", parsed.lines, gm);
  context.history = [];
  await assert.rejects(
    () => service.exchange(scene, "Okay.", parsed.lines, gm),
    /Citation was not supplied/,
    "Legacy requests retain their captured whitelist",
  );
  const sound = {
    ...source,
    id: "sound-source",
    speakerId: "b",
    heardBy: ["b"],
    content: "PRIVATE WORDS",
    contactHidden: true,
    soundOnly: { characterIds: ["a"], player: false, text: "A murmur." },
  };
  const acousticContext = { ...context, actors: context.actors.filter((actor) => actor.id === "a") };
  const acousticRaw = materializeGmReply(
    normalizeGmEffects(
      {
        ...proposal,
        relationshipChanges: {
          changes: [{ ...proposal.relationshipChanges.changes[0], fromId: "b", lineIds: [sound.id] }],
        },
      },
      acousticContext,
    ),
    "Okay.",
  );
  await assert.rejects(
    () =>
      service.exchange(scene, "Okay.", parsed.lines, {
        ...gm,
        raw: acousticRaw,
        context: acousticContext,
        earlierEvidence: [sound] as any,
      }),
    /Citation was not supplied/,
    "An anonymous acoustic source cannot authorize social effects for its unseen speaker",
  );
}
for (const invited of [false, true]) {
  const host = await packagedSceneServer({
    configure(world) {
      if (!invited) return;
      const venue = world.venues[0];
      venue.zones.find((z) => z.id === "common")!.connectedTo.push("workshop");
      venue.zones.push({
        ...defaultVenueSpace("other"),
        id: "workshop",
        name: "Workshop",
        kind: "restricted",
        connectedTo: ["common"],
        seen: true,
        access: {
          mode: "permission-required",
          managerIds: ["mara"],
          memberIds: ["mara"],
          memberRoles: [],
          inviterIds: ["mara"],
          visitorHours: "always",
          accompanied: false,
        },
      });
      initializeVenueAccess(venue);
    },
  });
  let calls = 0;
  const message = invited ? "May I visit with you?" : 'I privately think of the silver key but say "Tea?"';
  host.model.chatComplete = async (messages) => {
    calls++;
    assert.match(messages[0].content, /Game Master of Villages/);
    assert(!messages[0].content.startsWith("You interpret Villages gameplay."));
    return {
      content: JSON.stringify({
        input: invited
          ? [{ kind: "speech", text: message }]
          : [
              { kind: "thought", text: "I privately think of the silver key but say " },
              { kind: "speech", text: "Tea?" },
            ],
        segments: invited
          ? [{ kind: "dialogue", speakerId: "mara", text: "You are welcome to visit my Workshop with me." }]
          : segments,
        ...(invited
          ? {
              access: [
                {
                  actorId: "mara",
                  venueId: "mill",
                  zoneId: "workshop",
                  outcome: "invite-now",
                  evidence: [0],
                  accompanies: true,
                },
              ],
            }
          : {}),
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(active.statusCode, 200);
    const payload = {
      sessionId: "browser",
      submissionId: invited ? "a2222222-2222-4222-8222-222222222222" : "a1111111-1111-4111-8111-111111111111",
      message,
      mode: "chat",
      targetId: "",
      expectedSceneRevision: host.scene().sceneRevision,
    };
    const response = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(calls, 1, "Ordinary GM turn purchases one response");
    const turn = host.scene().submissions.at(-1)!;
    assert.equal(turn.semanticProvenance?.producer, "gm");
    assert.equal(turn.semanticReady, true);
    assert(
      !host.scene().lines.some((line) => line.role === "assistant" && line.content.includes("silver key")),
      "Private input is not spoken by a resident",
    );
    assert(
      !host
        .scene()
        .lines.filter((line) => line.heardBy.includes("mara"))
        .some((line) =>
          (line.speechSource ? line.speechSource.spans.map((span) => span.text).join(" ") : line.content).includes(
            "silver key",
          ),
        ),
      "Resident witnesses contain only captured speech",
    );
    if (invited) {
      const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
      const permission = world.venues[0].access?.permissions.find((row) => row.zoneId === "workshop");
      assert(permission && permission.duration === "visit" && permission.accompaniedBy === "mara");
    }
    const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(calls, 1, "Replay cannot repurchase the GM response");
    if (invited) {
      const view = await host.app.inject({ method: "GET", url: "/api/villages" });
      assert.equal(view.statusCode, 200, view.body);
      const destination = view.json().sceneVenue.venue.zones.find((zone: any) => zone.id === "workshop");
      assert.equal(
        destination.accessView.decision.allowed,
        true,
        "The Move picker must offer an accompanied invitation before the escort crosses",
      );
      assert.equal(
        host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId,
        "common",
        "Previewing entry never moves the escort",
      );
      const moved = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/zone",
        payload: {
          sessionId: "browser",
          zoneId: "workshop",
          expectedSceneRevision: host.scene().sceneRevision,
          operationId: "c2222222-2222-4222-8222-222222222222",
        },
      });
      assert.equal(moved.statusCode, 200, moved.body);
      assert.equal(host.scene().zoneId, "workshop");
      assert.equal(host.scene().accompanying?.find((row) => row.characterId === "mara")?.zoneId, "workshop");
      assert.equal(calls, 1, "Accepting the saved invitation needs no new model response");
    }
  } finally {
    await host.stop();
  }
}
mock.timers.reset();
console.log("GM turns bind speech and permission, settle empty domains and replay without a second model call.");
