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
  assert.equal(turn.sceneContractVersion, 10);
  const aside = host.scene().lines.find((line) => line.content === "The blue cup is yours.")!;
  assert.equal(aside.delivery, "whisper");
  assert.equal(aside.targetId, "player");
  assert.equal(host.scene().lines.find((line) => line.role === "user" && line.attentionEvidence)?.content, "Hello.");
  const replay = await host.app.inject({ method: "POST", url: "/api/villages/rooms/turn", payload });
  assert.equal(replay.statusCode, 200, replay.body);
  assert.equal(calls, 1);
} finally {
  await host.stop();
}
console.log(
  "Native plain-text Scene response preserves input, private speech, empty optional metadata and replay without another purchase.",
);
