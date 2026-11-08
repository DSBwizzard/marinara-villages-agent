import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";

const host = await packagedSceneServer();
let calls = 0;
host.model.chatComplete = async (_messages: any[], options?: any) => {
  calls++;
  assert.equal(options?.responseFormat, undefined, "New prose contract has no forced JSON-object format");
  return {
    content:
      'INPUT speech\n[mara whisper:player] The blue cup is yours.\n[narration] Mara smiles.\nCHANGES\n{"halt":{"reason":"none","quote":"","source":"player","appointments":[]}}',
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 10 },
  };
};
try {
  await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
  const payload = {
    sessionId: "browser",
    submissionId: "c1111111-1111-4111-8111-111111111111",
    message: "Hello.",
    mode: "chat",
    targetId: "",
    expectedSceneRevision: host.scene().sceneRevision,
  };
  const response = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
  assert.equal(response.statusCode, 200, response.body);
  const turn = host.scene().submissions.at(-1)!;
  assert.equal(turn.sceneContractVersion, 13);
  const aside = host.scene().lines.find((line) => line.content === "The blue cup is yours.")!;
  assert.equal(aside.delivery, "whisper");
  assert.equal(aside.targetId, "player");
  assert.equal(aside.presentation, "main", "Private delivery does not dictate bubble presentation");
  assert.equal(host.scene().lines.find((line) => line.role === "user" && line.attentionEvidence)?.content, "Hello.");
  const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
  assert.equal(replay.statusCode, 200, replay.body);
  assert.equal(calls, 1);
} finally {
  await host.stop();
}
{
  const host = await packagedSceneServer({
    configure(world) {
      const mara = world.villagers[0]!;
      world.villagers.push({
        ...structuredClone(mara),
        characterId: "bryn",
        cardSnapshot: { ...structuredClone(mara.cardSnapshot), id: "bryn", name: "Bryn" },
      });
    },
    configureScene(scene) {
      const bryn = { characterId: "bryn", name: "Bryn", doing: "Listening" };
      scene.participants.push(bryn);
      scene.activeIds.push("bryn");
      scene.accompanying!.push({ characterId: "bryn", zoneId: "common" });
      scene.sceneAttendance!.occupants.push({ ...bryn, zoneId: "common" });
    },
  });
  const action = "I invite Mara to a quiet corner of this room and say ";
  const words = "Keep the blue cup here.";
  let calls = 0;
  host.model.chatComplete = async () => {
    calls++;
    return {
      content:
        "INPUT " +
        JSON.stringify(
          [
            { kind: "action", text: action },
            { kind: "speech", text: words, delivery: "whisper", targetId: "mara" },
          ],
          null,
          2,
        ) +
        "\n[narration]Mara joins you at the quiet end of the table.\n[mara whisper:player]I'll leave it here.\n[bryn aside]I'll put the kettle on.\nCHANGES memoryChanges:" +
        JSON.stringify([
          {
            text: "The player privately asked Mara to keep the blue cup here.",
            subjects: ["player"],
            support: [{ lineId: "utterance:0", excerpt: words }],
            learners: { mara: { basis: "observation" } },
            screening: { disposition: "clear" },
          },
        ]),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const response = await host.app.inject({
      method: "POST",
      url: "/api/villages/rooms/turn",
      payload: {
        sessionId: "browser",
        submissionId: "c2222222-1111-4111-8111-111111111111",
        message: action + '"' + words + '"',
        mode: "chat",
        targetId: "",
        expectedSceneRevision: host.scene().sceneRevision,
      },
    });
    assert.equal(response.statusCode, 200, response.body);
    const saved = host.scene();
    assert.equal(saved.zoneId, "common", "A quiet corner does not invent a Zone crossing");
    const spoken = saved.lines.find((line) => line.role === "user" && line.speechSource)!;
    assert(spoken);
    assert.equal(spoken.delivery, "whisper");
    assert.equal(spoken.targetId, "mara");
    assert(!spoken.heardBy.includes("bryn"), "The uninvolved listener cannot hear private player speech");
    const privateReply = saved.lines.find((line) => line.content === "I'll leave it here.")!;
    assert.equal(privateReply.delivery, "whisper");
    assert(!privateReply.heardBy.includes("bryn"));
    const publicBubble = saved.lines.find((line) => line.content === "I'll put the kettle on.")!;
    assert.equal(publicBubble.presentation, "aside");
    assert.equal(publicBubble.delivery, "ordinary");
    assert(publicBubble.heardBy.includes("mara"), "A side bubble alone does not restrict hearing");
    const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
    const learned = world.memories.records.find((r) => r.text.includes("blue cup"))!;
    assert(learned?.knowers.mara, "The intended recipient can retain the whispered fact");
    assert(!learned.knowers.bryn, "An aside bubble does not let another listener learn the private fact");
    assert.equal(calls, 1);
  } finally {
    await host.stop();
  }
}
for (const variant of [
  "action-fragment",
  "missing-consent",
  "recent-string",
  "memory-fragment",
  "combined",
  "unlabeled-action",
  "inline-private",
  "missing-input",
  "inline-changes",
  "inline-public",
  "misplaced-changes",
  "denied-controller",
  "malformed-consent",
] as const) {
  const host = await packagedSceneServer({
    configure(world) {
      world.venues[0]!.access!.managerIds = [variant === "denied-controller" ? "mara" : "player"];
      world.venues[0]!.zones![1]!.description = "A loose wooden stool is beside the table. An empty shelf.";
    },
  });
  let calls = 0;
  const isMemory = variant === "memory-fragment";
  const message = isMemory
    ? "My imaginary boat is Marigold, a story rather than property."
    : "I move the loose stool to the west wall.";
  const action: any = {
    happened: true,
    segment: 0,
    actorIds: ["player"],
    appearanceChanged: false,
    edits: [
      { before: "A loose wooden stool is beside the table.", after: "A loose wooden stool stands by the west wall." },
    ],
    dayNight: true,
  };
  if (variant === "malformed-consent") action.consent = null;
  if (variant === "recent-string") action.recent = "The stool rests by the west wall.";
  if (variant === "inline-public") action.segment = 1;
  const memory = [
    {
      text:
        variant === "inline-public"
          ? "The player moved the wooden stool to the west wall."
          : "The player's imaginary boat is called Marigold, a story rather than property.",
      subjects: ["player"],
      support: [{ lineId: isMemory ? "utterance:0" : action.segment }],
      learners: { mara: { basis: "observation" } },
      kind: "information",
      screening: { disposition: "clear" },
    },
  ];
  const narration = isMemory
    ? "Mara nods at your story."
    : "You move the loose stool from beside the table to the west wall.";
  host.model.chatComplete = async () => {
    calls++;
    const metadata = isMemory
      ? "memoryChanges:" + JSON.stringify(memory)
      : variant === "inline-public"
        ? JSON.stringify({ action, memoryChanges: memory })
        : variant === "combined"
          ? "action:" + JSON.stringify(action) + ",memoryChanges:[]"
          : variant === "action-fragment"
            ? "action:" + JSON.stringify(action)
            : JSON.stringify({ action });
    return {
      content:
        variant === "inline-public"
          ? "INPUT action\n[mara] Watch this. [narration] " + narration + " [mara aside]Noted.\nCHANGES " + metadata
          : variant === "misplaced-changes"
            ? "INPUT action\n[narration] You move the stool. CHANGES action:" + JSON.stringify(action)
            : variant === "missing-input"
              ? "[narration] The kettle rattles.\n[mara whisper:player] PRIVATE"
              : variant === "inline-private"
                ? "INPUT speech\nThe kettle rattles. [mara\nwhisper:player] PRIVATE\n[mara] Hello."
                : "INPUT " +
                  (isMemory ? "speech" : "action") +
                  (variant === "unlabeled-action" ? "\n" : "\n[narration] ") +
                  narration +
                  (variant === "inline-changes"
                    ? "\n[mara aside]Noted.\nCHANGES "
                    : "\n[mara aside] Noted.\nCHANGES\n") +
                  metadata,
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const payload = {
      sessionId: "browser",
      submissionId: "regression-" + variant,
      message,
      mode: "chat",
      expectedSceneRevision: host.scene().sceneRevision,
    };
    const result = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
    if (["malformed-consent", "inline-private", "missing-input", "misplaced-changes"].includes(variant)) {
      assert.equal(result.statusCode, 502, result.body);
      assert.equal(host.scene().submissions.length, 0);
      assert.equal(host.scene().lines.length, 0);
      assert.equal(world.venues[0]!.zones![1]!.state.revision, 0);
    } else if (variant === "denied-controller") {
      assert.equal(host.scene().submissions.length, 0, "An unauthorized success is not published as a completed turn");
      assert.equal(
        world.venues[0]!.zones![1]!.state.revision,
        0,
        "Omitted consent grants no authority over a nonacting controller's place",
      );
      assert.match(world.venues[0]!.zones![1]!.description, /beside the table/);
    } else {
      assert.equal(result.statusCode, 200, variant + ": " + result.body);
      assert.equal(host.scene().submissions.length, 1);
      assert.equal(host.scene().lines.find((l) => l.content === "Noted.")!.presentation, "aside");
      if (isMemory)
        assert(
          world.memories.records.some((r) => r.text.includes("Marigold") && Object.hasOwn(r.knowers, "mara")),
          "Witnessed player fact is persisted through the native route",
        );
      else assert.match(world.venues[0]!.zones![1]!.description, /stands by the west wall/);
      if (variant === "inline-public") {
        assert.equal(host.scene().lines.find((l) => l.content === narration)?.kind, "narration");
        assert(
          world.memories.records.some((r) => r.text.includes("moved the wooden stool") && r.knowers.mara),
          "The inline narration index still binds witnessed Memory",
        );
      }
      if (variant === "recent-string") assert.equal(world.venues[0]!.zones![1]!.state.recent!.text, action.recent);
      const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
      assert.equal(replay.statusCode, 200, replay.body);
      assert.equal(calls, 1, "Accepted recovery never buys another response");
    }
    assert.equal(calls, 1, "Neither malformed metadata nor missing consent triggers an automatic repair purchase");
  } finally {
    await host.stop();
  }
}
for (const variant of [
  "action",
  "speech",
  "speech-explicit",
  "speech-bad-index",
  "speech-bad-null",
  "speech-bad-string",
  "whisper",
  "whisper-explicit",
  "mixed-speech",
  "mixed-speech-explicit",
  "thought",
  "context",
  "ambiguous",
  "explicit",
  "bad-index",
  "bad-null",
  "bad-string",
  "denied",
  "zone-hours",
  "spoken-zone-hours",
  "wrong-scope",
] as const) {
  const host = await packagedSceneServer({
    configure(world, now) {
      world.venues[0]!.access!.managerIds = [variant === "denied" ? "mara" : "player"];
      const hour = new Date(now).getHours();
      const clock = (offset: number) => String((hour + offset) % 24).padStart(2, "0") + ":00";
      // Keep the recipient present while testing a policy change, regardless of the runner's clock.
      world.venues[0]!.access!.visitorHours = [
        {
          days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          start: clock(23),
          end: clock(2),
        },
      ];
      if (variant.endsWith("zone-hours")) {
        world.venues[0]!.zones![1]!.access!.memberIds = ["mara"];
        world.venues[0]!.zones![1]!.access!.inviterIds = ["mara"];
        world.venues[0]!.zones![1]!.access!.accompanied = true;
      }
    },
  });
  const first = variant.endsWith("zone-hours")
    ? "As manager, I set this common room's visitor hours to all hours."
    : "As manager, I set this inn's visitor hours to all hours.";
  const last = "All other restrictions remain unchanged.";
  const message = first + " " + last;
  const classification = variant.startsWith("whisper")
    ? JSON.stringify([{ kind: "speech", text: message, delivery: "whisper", targetId: "mara" }])
    : ["ambiguous", "explicit", "mixed-speech", "mixed-speech-explicit"].includes(variant)
      ? JSON.stringify([
          { kind: variant.startsWith("mixed-speech") ? "speech" : "action", text: first },
          { kind: "action", text: last },
        ])
      : variant.startsWith("speech") || variant === "spoken-zone-hours"
        ? "speech"
        : ["thought", "context"].includes(variant)
          ? variant
          : "action";
  const proposal: any = {
    actorId: "player",
    venueId: "mill",
    zoneId: null,
    outcome: "access-management",
    evidence: [0],
    command: { action: "venue-policy", managerIds: ["player"], visitorHours: null },
  };
  if (
    ["explicit", "speech-explicit", "whisper-explicit", "mixed-speech-explicit", "spoken-zone-hours"].includes(variant)
  )
    proposal.inputSpan = 0;
  if (["bad-index", "speech-bad-index"].includes(variant)) proposal.inputSpan = 99;
  if (["bad-null", "speech-bad-null"].includes(variant)) proposal.inputSpan = null;
  if (["bad-string", "speech-bad-string"].includes(variant)) proposal.inputSpan = "0";
  if (["zone-hours", "spoken-zone-hours", "wrong-scope"].includes(variant)) proposal.zoneId = "common";
  const succeeds = [
    "action",
    "speech",
    "speech-explicit",
    "whisper",
    "whisper-explicit",
    "mixed-speech-explicit",
    "explicit",
    "zone-hours",
    "spoken-zone-hours",
  ].includes(variant);
  let calls = 0;
  host.model.chatComplete = async (messages: any[]) => {
    calls++;
    if (variant.endsWith("zone-hours")) {
      const packet = messages
        .flatMap((m) =>
          m.content.split("\n").flatMap((line: string) => {
            try {
              return [JSON.parse(line)];
            } catch {
              return [];
            }
          }),
        )
        .find((p) => p.context);
      const scope = packet.context.accessManagement.find((p: any) => p.actorId === "player" && p.venueId === "mill");
      assert(scope, "Player management uses its supplied current Venue scope");
      const zone = scope.zones.find((z: any) => z.id === "common");
      proposal.command = {
        action: "zone-policy",
        policy: { memberIds: [], memberRoles: [], inviterIds: [], ...zone.policy, visitorHours: "always" },
      };
    }
    return {
      content:
        "INPUT " +
        classification +
        "\n[narration] You change this inn's ordinary visitor hours to all hours; its other restrictions remain unchanged.\n\n" +
        JSON.stringify({
          access: [proposal],
          ...(variant === "spoken-zone-hours"
            ? {
                memoryChanges: [
                  {
                    text: "The manager changed Common room visitor hours to all hours, leaving other restrictions unchanged.",
                    subjects: ["player"],
                    support: [{ lineId: "utterance:0" }],
                    learners: { mara: { basis: "observation" } },
                    screening: { disposition: "clear" },
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
    await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    const before = fixtureVillageState(host.records.get("villages-village").data, host.records);
    const payload = {
      sessionId: "browser",
      submissionId: "bare-policy-" + variant,
      mode: "chat",
      message,
      expectedSceneRevision: host.scene().sceneRevision,
    };
    const result = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(result.statusCode, succeeds ? 200 : 502, variant + ": " + result.body);
    const world = fixtureVillageState(host.records.get("villages-village").data, host.records);
    if (!succeeds) {
      assert.deepEqual(
        world.venues[0]!.access,
        before.venues[0]!.access,
        "Invalid or ambiguous player sources cannot change access",
      );
      assert.equal(host.scene().submissions.length, 0);
      assert.equal(host.scene().lines.length, 0);
      assert.equal(calls, 1);
      continue;
    }
    if (variant.endsWith("zone-hours")) {
      assert.deepEqual(world.venues[0]!.access!.visitorHours, before.venues[0]!.access!.visitorHours);
      assert.deepEqual(
        world.venues[0]!.zones![1]!.access,
        { ...before.venues[0]!.zones![1]!.access, visitorHours: "always" },
        "A Zone-hours change preserves every other restriction",
      );
    } else {
      assert.equal(
        world.venues[0]!.access!.visitorHours,
        null,
        "A reserved complete policy footer is applied, not printed",
      );
      assert.deepEqual(world.venues[0]!.zones![1]!.access, before.venues[0]!.zones![1]!.access);
    }
    assert.deepEqual(world.venues[0]!.access!.managerIds, ["player"]);
    assert(!host.scene().lines.some((l) => l.content.includes('"access"')));
    const source = host.scene().submissions[0]!.accessEvents![0]!.facts.playerInputSource!;
    assert.equal(source.inputSpan, 0);
    assert.equal(message.slice(source.start, source.end), source.text);
    assert.equal(source.text, ["explicit", "mixed-speech-explicit"].includes(variant) ? first : message);
    assert.equal(
      source.kind,
      variant.startsWith("speech") ||
        variant.startsWith("whisper") ||
        variant === "mixed-speech-explicit" ||
        variant === "spoken-zone-hours"
        ? "speech"
        : "action",
    );
    if (source.kind === "speech") {
      const own = host.scene().lines.find((l) => l.speechSource)!;
      assert(!own.heardBy.includes("player"), "Player perception does not rewrite canonical listener IDs");
    }
    if (variant === "spoken-zone-hours")
      assert(
        world.memories.records.some(
          (memory) => memory.text.includes("Common room visitor hours") && memory.knowers.mara,
        ),
        "The captured real-provider shape applies policy and witnessed Memory together",
      );
    const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(calls, 1);
  } finally {
    await host.stop();
  }
}
{
  const guestId = "npc:nico";
  const others = ["bryn", "cory", "dana"];
  const host = await packagedSceneServer({
    configure(world) {
      world.worldPlaces.revision = 1;
      for (const id of others)
        world.villagers.push({
          ...structuredClone(world.villagers[0]!),
          characterId: id,
          cardSnapshot: { ...structuredClone(world.villagers[0]!.cardSnapshot), id, name: id },
        });
      world.worldPlaces.npcs[guestId] = {
        id: guestId,
        revision: 1,
        name: "Nico",
        label: "Nico",
        characterization: "A friendly visitor.",
        facts: [],
        associations: [{ placeId: "mill", role: "visitor" }],
        availability: "",
        disabled: false,
        source: "fixture",
        updatedAt: new Date().toISOString(),
      };
    },
    configureScene(scene) {
      for (const id of others) {
        const person = { characterId: id, name: id, doing: "Listening" };
        scene.participants.push(person);
        scene.activeIds.push(id);
        scene.accompanying!.push({ characterId: id, zoneId: "common" });
        scene.sceneAttendance!.occupants.push({ ...person, zoneId: "common" });
      }
    },
  });
  let calls = 0;
  host.model.chatComplete = async (messages: any[]) => {
    calls++;
    if (calls === 3) {
      const packet = messages
        .flatMap((m) =>
          m.content.split("\n").flatMap((line: string) => {
            try {
              return [JSON.parse(line)];
            } catch {
              return [];
            }
          }),
        )
        .find((p) => p.context);
      assert.equal(
        packet.context.actors.length,
        5,
        "All five present people are eligible, independently of the response cap",
      );
      assert(packet.context.actors.some((a: any) => a.name === "Nico"));
    }
    const content =
      calls === 1
        ? "INPUT speech\n[mara] Hello."
        : calls === 2
          ? 'INPUT speech\n[narration] Nico enters this common room and joins the table. [new:nico aside] Hello, everyone.\nCHANGES {"npcIntroductions":[{"ref":"new:nico","existingId":"npc:nico","name":"Nico","label":"Nico","characterization":"A friendly visitor.","segment":0}]}'
          : "INPUT speech\n[npc:nico] Thank you. [mara] Welcome. [bryn] Hello. [cory aside] Have a seat." +
            (calls === 4 ? " [dana] And hello from me." : "");
    return { content, finishReason: "stop", usage: { inputTokens: 10, outputTokens: 10 } };
  };
  try {
    await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    for (let turn = 1; turn <= 4; turn++) {
      const result = await host.app.inject({
        method: "POST",
        url: "/api/villages/rooms/turn",
        payload: {
          sessionId: "browser",
          submissionId: "npc-inline-" + turn,
          mode: "chat",
          message: turn === 1 ? "Hello before the visitor arrives." : "Nico, mara, bryn, cory and dana, hello.",
          expectedSceneRevision: host.scene().sceneRevision,
        },
      });
      assert.equal(result.statusCode, turn === 4 ? 502 : 200, "turn " + turn + ": " + result.body);
      if (turn === 2) {
        const scene = host.scene();
        assert.equal(scene.activeIds.length, 5);
        const arrival = scene.lines.find((l) => l.content === "Hello, everyone.")!;
        assert.equal(arrival.speakerId, guestId);
        assert.equal(arrival.presentation, "aside");
        const earlier = scene.lines.find((l) => l.content === "Hello before the visitor arrives." && l.speechSource)!;
        assert(!earlier.heardBy.includes(guestId), "Inline introduction never grants old speech to a later arrival");
      }
    }
    assert.equal(host.scene().submissions.length, 3, "Five actual speakers are rejected without publishing the turn");
    assert.equal(calls, 4, "No automatic repair purchase follows the response cap failure");
  } finally {
    await host.stop();
  }
}
console.log(
  "Native plain-text Scene response preserves input, private speech, empty optional metadata and replay without another purchase.",
);
