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
  assert.equal(turn.sceneContractVersion, 11);
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
        "\nMara joins you at the quiet end of the table.\n[mara whisper:player] I'll leave it here.\n[bryn aside] I'll put the kettle on.\nCHANGES\nmemoryChanges:" +
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
  const memory = [
    {
      text: "The player's imaginary boat is called Marigold, a story rather than property.",
      subjects: ["player"],
      support: [{ lineId: isMemory ? "utterance:0" : 0 }],
      learners: { mara: { basis: "observation" } },
      kind: "information",
      screening: { disposition: "clear" },
    },
  ];
  host.model.chatComplete = async () => {
    calls++;
    const narration = isMemory
      ? "Mara nods at your story."
      : "You move the loose stool from beside the table to the west wall.";
    const metadata = isMemory
      ? "memoryChanges:" + JSON.stringify(memory)
      : variant === "combined"
        ? "action:" + JSON.stringify(action) + ",memoryChanges:[]"
        : variant === "action-fragment"
          ? "action:" + JSON.stringify(action)
          : JSON.stringify({ action });
    return {
      content:
        variant === "inline-private"
          ? "INPUT speech\nThe kettle rattles. [mara\nwhisper:player] PRIVATE\n[mara] Hello."
          : "INPUT " +
            (isMemory ? "speech" : "action") +
            (variant === "unlabeled-action" ? "\n" : "\n[narration] ") +
            narration +
            "\n[mara aside] Noted.\nCHANGES\n" +
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
    if (variant === "malformed-consent" || variant === "inline-private") {
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
console.log(
  "Native plain-text Scene response preserves input, private speech, empty optional metadata and replay without another purchase.",
);
