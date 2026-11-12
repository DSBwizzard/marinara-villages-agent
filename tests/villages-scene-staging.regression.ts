import assert from "node:assert/strict";
import {
  initialStaging,
  currentStaging,
  lineStagingCues,
  readStagingCues,
  stagingLayout,
  stagingTranscriptEvents,
  type StagingCue,
  type StagingLine,
} from "../packages/villages/src/shared/helpers/scene-staging.js";
import { replayStaging } from "./helpers/scene-staging.fixture.js";

import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { validateSpriteExpression } from "../packages/villages/src/server/domain/rules/sprite-expressions.js";
import { selectSpriteImage } from "../packages/villages/src/client/features/scenes/villages-sprite-stage.js";

const ids = ["mara", "eli", "lina", "taro"];
for (const [count, expected] of [
  [1, ["left"]],
  [2, ["left", "right"]],
  [3, ["left", "center", "right"]],
  [4, ["left", "left", "right", "right"]],
] as const) {
  const state = initialStaging(ids.slice(0, count));
  assert.deepEqual(
    Object.values(state).map((person) => person.position),
    expected,
  );
  assert.ok(Object.values(state).every((person) => person.expression === "" && person.look.target === "player"));
}
const sprite = {
  assetId: "mara-art",
  framing: { mode: "full" as const, cropPercent: 0 },
  expressions: [{ view: "front" as const, label: "thinking", expressionId: "e-thinking", filename: "thinking.png" }],
};
const cues = readStagingCues(
  [
    null,
    { characterId: "outsider", position: "right" },
    {
      characterId: "mara",
      position: "invalid",
      expression: "e-someone-else",
      look: { target: "villager", characterId: "mara" },
    },
    {
      characterId: "mara",
      position: "right",
      expression: "e-thinking",
      look: { target: "villager", characterId: "outsider" },
    },
    { characterId: "mara", look: { target: "direction", direction: "left" } },
    { characterId: "eli", expression: "e-thinking", position: "center" },
  ],
  ids,
  (id, expression) => validateSpriteExpression(id === "mara" ? sprite : null, expression),
);
assert.deepEqual(cues, [
  {
    characterId: "mara",
    position: "right",
    expression: "e-thinking",
    look: { target: "direction", direction: "left" },
  },
  { characterId: "eli", position: "center" },
]);
const lone = replayStaging(["mara"], [{ cues: cues.slice(0, 1) }, {}, {}]);
assert.deepEqual(lone[0], lone[2], "quiet paragraphs keep expression, position, and attention");
assert.equal(stagingLayout(["mara"], lone[2].state).mara.facing, "left", "a lone resident can look into empty space");
assert.equal(initialStaging(["mara"]).mara.position, "left", "replay never mutates defaults");

const explicit = lineStagingCues({
  speakerId: "mara",
  staging: [{ characterId: "mara", expression: "e-thinking", position: "right", look: { target: "player" } }],
});
assert.deepEqual(explicit, [
  { characterId: "mara", position: "right", expression: "e-thinking", look: { target: "player" } },
]);
assert.deepEqual(lineStagingCues({ speakerId: "mara", kind: "whisper", targetId: "eli" }), [
  { characterId: "mara", look: { target: "villager", characterId: "eli" } },
]);
assert.deepEqual(lineStagingCues({ speakerId: "", staging: cues }), cues, "narration can cue silent listeners");

const events = [
  { cues: [{ characterId: "mara", look: { target: "villager", characterId: "eli" } }] as StagingCue[] },
  { cues: [{ characterId: "eli", position: "left" }] as StagingCue[] },
  { cues: [{ characterId: "eli", position: "right" }] as StagingCue[] },
  { afterIds: ["mara", "lina", "taro"] },
];
const frames = replayStaging(ids, events);
assert.equal(stagingLayout(ids, frames[0].state).mara.facing, "right");
assert.equal(stagingLayout(ids, frames[1].state).eli.facing, "front", "listeners do not automatically turn back");
assert.equal(stagingLayout(ids, frames[1].state).mara.facing, "right", "same-zone gaze uses actual subslots");
assert.equal(stagingLayout(ids, frames[2].state).mara.facing, "right", "attention follows a moving target");
assert.equal(
  stagingLayout(frames[3].activeIds, frames[3].state).mara.facing,
  "front",
  "departed gaze targets reset to player",
);
const beforeDeparture = stagingLayout(ids, frames[2].state);
const afterDeparture = stagingLayout(frames[3].activeIds, frames[3].state);
for (const id of frames[3].activeIds)
  assert.equal(afterDeparture[id].x, beforeDeparture[id].x, "departure does not move survivors");
assert.deepEqual(replayStaging(ids, events.slice(0, 2)).at(-1), frames[1], "rewinding reconstructs the prior frame");
assert.deepEqual(
  replayStaging(ids, JSON.parse(JSON.stringify(events))),
  frames,
  "refresh reconstructs identical frames",
);

for (const zone of ["left", "center", "right"] as const) {
  const state = replayStaging(ids, [{ cues: ids.map((characterId) => ({ characterId, position: zone })) }])[0].state;
  const slots = Object.values(stagingLayout(ids, state));
  assert.ok(slots[0].x - slots[0].width / 2 >= 0);
  assert.ok(slots.at(-1)!.x + slots.at(-1)!.width / 2 <= 1);
  for (let i = 1; i < slots.length; i++)
    assert.ok(slots[i - 1].x + slots[i - 1].width / 2 < slots[i].x - slots[i].width / 2);
}
const crossed = replayStaging(
  ["mara", "eli"],
  [
    {
      cues: [
        { characterId: "mara", position: "right", look: { target: "villager", characterId: "eli" } },
        { characterId: "eli", position: "left", look: { target: "villager", characterId: "mara" } },
      ],
    },
  ],
)[0];
assert.equal(
  stagingLayout(crossed.activeIds, crossed.state).mara.facing,
  "left",
  "gaze is not based on original cast order",
);
assert.equal(stagingLayout(crossed.activeIds, crossed.state).eli.facing, "right");

const parsed = readNarrationReply(
  {
    segments: [
      { kind: "narration", text: "Mara considers the idea.", staging: cues },
      {
        kind: "dialogue",
        speakerId: "eli",
        text: "Perhaps.",
        staging: [
          { characterId: "outsider", position: "left" },
          { characterId: "eli", look: { target: "direction", direction: "up" }, position: "right" },
        ],
      },
    ],
  },
  ids,
);
assert.deepEqual(parsed.segments[0].staging, cues);
assert.deepEqual(parsed.segments[1].staging, [{ characterId: "eli", position: "right" }]);
assert.equal(parsed.segments[1].text, "Perhaps.");

const validatedCues = readStagingCues(
  [
    { characterId: "mara", expression: "e-thinking", position: "right" },
    { characterId: "mara", expression: "e-outsider", look: { target: "player" } },
  ],
  ids,
  (id, requested) => validateSpriteExpression(id === "mara" ? sprite : null, requested),
);
assert.equal(validatedCues[0].expression, "e-thinking", "Invalid later fields do not overwrite earlier valid fields");
const rawScene = {
  version: 5,
  id: "current-cues",
  status: "closed",
  participants: [{ characterId: "mara", name: "Mara" }],
  lines: [
    {
      id: "line",
      speakerId: "mara",
      content: "Perhaps.",
      role: "assistant",
      at: "2026-11-06T00:00:00Z",
      heardBy: ["mara"],
      expression: "forged",
      gazeAt: "outsider",
      staging: validatedCues,
    },
  ],
};
const beforeScene = JSON.stringify(rawScene);
const saved = coerceSession(rawScene);
assert(!Object.hasOwn(saved.lines[0], "expression"));
assert(!Object.hasOwn(saved.lines[0], "gazeAt"));
assert.deepEqual(saved.lines[0].staging, validatedCues);
assert.deepEqual(coerceSession(JSON.parse(JSON.stringify(saved))).lines[0].staging, validatedCues);
assert.equal(JSON.stringify(rawScene), beforeScene);

const lines: (StagingLine & { id: string; role: string; asideFor?: string })[] = [
  { id: "player", role: "user", speakerId: "" },
  {
    id: "aside",
    role: "assistant",
    kind: "whisper",
    speakerId: "eli",
    asideFor: "main",
    targetId: "mara",
    staging: [{ characterId: "mara", expression: "e-thinking" }],
  },
  {
    id: "main",
    role: "assistant",
    kind: "narration",
    speakerId: "__venue_scene__",
    staging: [{ characterId: "mara", position: "center" }],
  },
];
const turns = [{ activeIdsAtTurn: ["mara", "eli"], activeIdsAfterTurn: ["mara"], replyLineIds: ["aside", "main"] }];
const transcriptEvents = stagingTranscriptEvents(lines, turns);
assert.deepEqual(transcriptEvents[0].beforeIds, ["mara", "eli"]);
assert.deepEqual(
  transcriptEvents[1].cues?.map((cue) => cue.characterId),
  ["mara", "mara", "eli"],
  "even leading asides play after their main segment",
);
assert.deepEqual(transcriptEvents[1].afterIds, ["mara"]);
const final = replayStaging(["mara", "eli"], transcriptEvents).at(-1)!;
assert.equal(final.state.mara.expression, "e-thinking");
assert.deepEqual(final.activeIds, ["mara"]);
assert.deepEqual(replayStaging(["mara", "eli"], transcriptEvents).at(-1), final, "repeated playback is idempotent");
assert.deepEqual(currentStaging(["mara", "eli"], transcriptEvents), final.state);
assert.deepEqual(currentStaging(ids, []), initialStaging(ids));
for (let end = 0; end <= events.length; end++) {
  const prefix = events.slice(0, end);
  assert.deepEqual(currentStaging(ids, prefix), replayStaging(ids, prefix).at(-1)?.state ?? initialStaging(ids));
}
for (const count of [1000, 10000, 25000]) {
  const history = Array.from({ length: count }, (_, index) => ({
    cues: [{ characterId: "mara", expression: "e-" + index }],
  }));
  const frames = replayStaging(ids, history),
    current = currentStaging(ids, history);
  assert.deepEqual(current, frames.at(-1)!.state);
  assert.equal(current.mara.expression, "e-" + (count - 1));
  assert(frames[0].state.mara.expression === "e-0", "later folding cannot change an earlier playback frame");
  const frameBytes = Buffer.byteLength(JSON.stringify(frames)),
    currentBytes = Buffer.byteLength(JSON.stringify(current));
  assert(currentBytes < 1024);
  console.log(
    JSON.stringify({ stagingEvents: count, retainedFrameBytes: frameBytes, currentStateBytes: currentBytes }),
  );
}

const art = [
  { view: "front" as const, expressionId: "e-thinking", label: "thinking", url: "/thinking" },
  { view: "side" as const, expressionId: "e-composed", label: "e-composed", isDefault: true, url: "/side" },
];
assert.equal(
  selectSpriteImage(art, "e-thinking", "left")?.image.url,
  "/side",
  "attention uses the default in the requested view before an expression in the other view",
);
assert.equal(selectSpriteImage(art, "", "left")?.mirrored, true);
assert.equal(selectSpriteImage(art, "unavailable", "front")?.image.url, "/side");
assert.equal(
  selectSpriteImage([{ view: "side", label: "composed", isDefault: true, url: "/side" }], "", "left")?.mirrored,
  true,
);
assert.equal(selectSpriteImage([], "", "left"), null, "missing art keeps portrait fallback");
console.log("Villages scene staging: validation, persistent state, gaze, spacing, cast boundaries, and replay passed");
