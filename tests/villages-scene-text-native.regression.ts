import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";

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
        JSON.stringify([
          { kind: "action", text: action },
          { kind: "speech", text: words, delivery: "whisper", targetId: "mara" },
        ]) +
        "\n[narration] Mara joins you at the quiet end of the table.\n[mara whisper:player] I'll leave it here.\n[bryn aside] I'll put the kettle on.",
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
    assert.equal(calls, 1);
  } finally {
    await host.stop();
  }
}
console.log(
  "Native plain-text Scene response preserves input, private speech, empty optional metadata and replay without another purchase.",
);
