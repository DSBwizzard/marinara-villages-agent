import assert from "node:assert/strict";
import {
  initialStaging,
  lineStagingCues,
  readStagingCues,
  replayStaging,
  stagingLayout,
  stagingTranscriptEvents,
  type StagingCue,
  type StagingLine,
} from "../packages/villages/src/engine/packages/shared/src/villages/scene-staging.js";
import { parseVenueReply } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";
import { validateSpriteExpression } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-expressions.js";
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

const legacy = lineStagingCues({
  speakerId: "mara",
  expression: "e-thinking",
  gazeAt: "eli",
  staging: [{ characterId: "mara", position: "right", look: { target: "player" } }],
});
assert.deepEqual(legacy, [
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

const parsed = parseVenueReply(
  {
    heardPlayerBy: [],
    segments: [
      { kind: "narration", text: "Mara considers the idea.", heardBy: ids, staging: cues },
      {
        kind: "dialogue",
        speakerId: "eli",
        text: "Perhaps.",
        heardBy: ids,
        staging: [
          { characterId: "outsider", position: "left" },
          { characterId: "eli", look: { target: "direction", direction: "up" }, position: "right" },
        ],
      },
    ],
  },
  ids,
);
assert.equal(parsed.lines[0].staging?.[0].characterId, "mara");
assert.deepEqual(
  parsed.lines[1].staging,
  [{ characterId: "eli", position: "right" }],
  "invalid optional cues retain speech and valid fields",
);

const validatedReply = parseVenueReply(
  {
    heardPlayerBy: [],
    segments: [
      {
        kind: "narration",
        text: "A quiet reaction.",
        staging: [
          { characterId: "mara", expression: "e-thinking", position: "right" },
          { characterId: "mara", expression: "e-outsider", look: { target: "player" } },
        ],
      },
    ],
  },
  ids,
  (id, requested) => validateSpriteExpression(id === "mara" ? sprite : null, requested),
);
assert.equal(
  validatedReply.lines[0].staging?.[0].expression,
  "e-thinking",
  "invalid later fields do not overwrite earlier valid fields",
);

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

const art = [
  { view: "front" as const, expressionId: "e-thinking", label: "thinking", url: "/thinking" },
  { view: "side" as const, expressionId: "e-composed", label: "e-composed", isDefault: true, url: "/side" },
];
assert.equal(
  selectSpriteImage(art, "e-thinking", "left")?.image.url,
  "/thinking",
  "matching front expression retains existing fallback",
);
assert.equal(selectSpriteImage(art, "", "left")?.mirrored, true);
assert.equal(selectSpriteImage(art, "unavailable", "front")?.image.url, "/side");
assert.equal(
  selectSpriteImage([{ view: "side", label: "composed", isDefault: true, url: "/side" }], "", "left")?.mirrored,
  true,
);
assert.equal(selectSpriteImage([], "", "left"), null, "missing art keeps portrait fallback");
console.log("Villages scene staging: validation, persistent state, gaze, spacing, cast boundaries, and replay passed");
