import assert from "node:assert/strict";
import { materializePlayerSpeech } from "../packages/villages/src/server/domain/rules/player-speech-capture.js";
import { sceneMissingFields } from "../packages/villages/src/server/domain/rules/response-diagnostics.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import {
  completeSceneObject,
  normalizeRecoverableSceneReply,
  normalizeSparseSceneReply,
} from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { sceneWritingHistory } from "../packages/villages/src/server/domain/rules/scene-writing-history.js";
import { workFailureSummary } from "../packages/villages/src/server/domain/rules/work-failure.js";
import { zoneEventReply } from "../packages/villages/src/server/domain/rules/zone-events.js";

// Compact optional metadata and citation syntax survive player-speech insertion.
{
  const core = {
    segments: [{ kind: "dialogue", speakerId: "rosa", text: "I prefer ginger tea." }],
    playerSpeechCapture: { status: "captured", utterances: [{ text: "Hello.", occurrence: 1 }] },
  };
  for (const relationshipChanges of [undefined, {}, { changes: [] }, { disclosures: [] }, { permissions: [] }]) {
    const wire = relationshipChanges === undefined ? core : { ...core, relationshipChanges };
    const result = normalizeRecoverableSceneReply(wire);
    assert.deepEqual(result.failures, {});
    assert.deepEqual(result.raw.relationshipChanges, { changes: [], permissions: [], disclosures: [] });
  }
  const refs = [0, "utterance:0", "saved-line", "0", "01", "-1", "0.0", " 0", "99"];
  const wire = {
    ...core,
    memoryChanges: [{ learners: { rosa: { support: refs.map((lineId) => ({ lineId, excerpt: "tea" })) } } }],
    relationshipChanges: { changes: [{ lineIds: refs }] },
  };
  const expanded = materializePlayerSpeech(wire, "Hello.");
  assert.deepEqual(
    (expanded.memoryChanges as any)[0].learners.rosa.support.map((row: any) => row.lineId),
    [1, 0, ...refs.slice(2)],
  );
  assert.deepEqual((expanded.relationshipChanges as any).changes[0].lineIds, [1, 0, ...refs.slice(2)]);
  assert.deepEqual(
    (wire.memoryChanges as any)[0].learners.rosa.support.map((row: any) => row.lineId),
    refs,
    "normalization never mutates saved input",
  );
  const change = {
    fromId: "rosa",
    toId: "player",
    expectedRevision: "PRIVATE REASON",
    sceneAfter: {
      connection: "Acquaintances",
      stance: "Enjoys conversation",
      expectations: [],
      concerns: [],
      records: [],
    },
    liveAfter: {
      connection: "Acquaintances",
      stance: "Enjoys conversation",
      expectations: [],
      concerns: [],
      records: [],
    },
    lineIds: [0],
  };
  const malformed = normalizeRecoverableSceneReply({ ...core, relationshipChanges: { changes: [change] } });
  const message = malformed.failures.relationships!.message;
  assert.match(message, /changes\[0\]\.reason must be a nonempty string/);
  assert.match(workFailureSummary({ cause: "missing_result", stage: "metadata", message }), /changes\[0\]\.reason/);
  assert.doesNotMatch(
    workFailureSummary({ cause: "provider_exception", stage: "provider", message: "SECRET TOKEN" }),
    /SECRET/,
  );
  const invalidFlag = normalizeRecoverableSceneReply({
    ...core,
    relationshipChanges: { changes: [{ ...change, reason: "Friendly visit" }] },
  });
  assert.match(invalidFlag.failures.relationships!.message, /expectedRevision must be a nonnegative integer/);
  const valid = normalizeRecoverableSceneReply({
    ...core,
    relationshipChanges: { changes: [{ ...change, expectedRevision: 0, reason: "Friendly visit" }] },
  });
  assert.deepEqual(valid.failures, {});
}

const raw = {
  segments: [
    {
      kind: "dialogue",
      speakerId: "rosa",
      text: "If Mara approves tomorrow, I might help. I am not committing today.",
    },
    { kind: "narration", text: "Rosa crosses into the courtyard." },
    {
      kind: "dialogue",
      speakerId: "rosa",
      text: "Please keep my private letters to yourself.",
      delivery: "whisper",
      targetId: "player",
    },
  ],
};
const sparse = normalizeSparseSceneReply(raw);
assert.deepEqual(sceneMissingFields(sparse), []);
assert(sceneMissingFields(raw).includes("memoryChanges"), "legacy omission remains incomplete");
assert(!Object.hasOwn(raw, "memoryChanges"), "normalization cannot mutate original diagnostic input");
const parsed = parseVenueReply(zoneEventReply(sparse, "")!, ["rosa", "player"]);
assert.equal(parsed.lines.length, 3);
assert.equal(parsed.lines[2].targetId, "player");
assert.equal(parsed.lines[2].delivery, "whisper");

const referenced = normalizeSparseSceneReply({
  ...raw,
  invitation: { source: 0, venueId: "home", zoneId: "common" },
  contactMoves: [{ characterId: "rosa", zoneId: "exterior", segment: 1 }],
  relationshipChanges: { disclosures: [{ source: 2, kind: "boundary" }] },
  projectSpeech: [{ projectId: "bridge", speakerId: "rosa", citations: [{ segment: 0 }] }],
});
assert.equal(
  (referenced.invitation as any).quote,
  raw.segments[0].text,
  "a reference retains every condition and negation",
);
assert.equal((referenced.contactMoves as any)[0].quote, raw.segments[1].text);
assert.deepEqual((referenced.relationshipChanges as any).disclosures[0], {
  kind: "boundary",
  fromId: "rosa",
  toId: "player",
  text: raw.segments[2].text,
  lineIds: [2],
});
assert.equal((referenced.projectSpeech as any)[0].citations[0].quote, raw.segments[0].text);
for (const source of [-1, 3, "0", null, 1])
  assert.throws(() => normalizeSparseSceneReply({ ...raw, invitation: { source } }), /source|cited/i);
for (const invitation of [
  { source: 0, quote: "I will help" },
  { source: 0, speakerId: "mara" },
])
  assert.throws(() => normalizeSparseSceneReply({ ...raw, invitation }), /conflicting/);
assert.throws(
  () =>
    normalizeSparseSceneReply({
      ...raw,
      relationshipChanges: { disclosures: [{ source: 0, text: "I will help", kind: "preference" }] },
    }),
  /conflicting/,
);
assert.throws(
  () => normalizeSparseSceneReply({ ...raw, projectSpeech: [{ speakerId: "mara", citations: [{ segment: 0 }] }] }),
  /another speaker/,
);
for (const memoryChanges of [null, {}, "", false])
  assert.throws(() => normalizeSparseSceneReply({ ...raw, memoryChanges }), /malformed/);
for (const relationshipChanges of [null, [], { changes: null }, { disclosures: {} }, { unexpected: [] }])
  assert.throws(() => normalizeSparseSceneReply({ ...raw, relationshipChanges }), /malformed/);
const implicitKinds = normalizeSparseSceneReply({
  ...raw,
  segments: raw.segments.map(({ kind: _kind, ...segment }) => segment),
});
assert.throws(() => parseVenueReply(zoneEventReply(implicitKinds, "")!, ["rosa"]), /kind must be/);
const complete = JSON.stringify(raw);
assert(completeSceneObject(complete, "stop"));
assert(completeSceneObject("```json\n" + complete + "\n```", "stop"));
for (const [text, finish] of [
  [complete, "length"],
  [complete, "unknown"],
  [complete.slice(0, -2), "stop"],
  [complete + complete, "stop"],
  ["Prefix " + complete, "stop"],
  ['{"segments":[],"segments":[]}', "stop"],
])
  assert.equal(completeSceneObject(text, finish), null, "incomplete or ambiguous output never earns sparse defaults");
for (const length of [321, 1201]) {
  const text = "I might help " + "x".repeat(length) + " only if Mara later agrees.";
  assert.throws(
    () =>
      normalizeSparseSceneReply({
        segments: [{ kind: "dialogue", speakerId: "rosa", text }],
        ...(length === 321
          ? { relationshipChanges: { disclosures: [{ source: 0, kind: "boundary" }] } }
          : { projectSpeech: [{ speakerId: "rosa", citations: [{ segment: 0 }] }] }),
      }),
    /limit/,
  );
}
const narration = {
  id: "n",
  kind: "narration",
  speakerId: "__venue_scene__",
  content: "The door opened. " + "x".repeat(550) + " ONLY IF MARA AGREES.",
  heardBy: ["rosa"],
};
const whisper = {
  id: "w",
  kind: "whisper",
  speakerId: "rosa",
  content: "Secret words",
  heardBy: ["rosa"],
  contactHidden: true,
};
const history = sceneWritingHistory({ lines: [narration, whisper] } as any, [narration, whisper] as any, "", ["rosa"]);
assert.equal(
  history.blocks
    .map((block) => block.text)
    .join("\n\n")
    .split("The door opened.").length - 1,
  1,
  "narrator continuity and evidence share one full line",
);
assert(
  history.blocks.some((block) => block.text.includes("ONLY IF MARA AGREES.")),
  "evidence conditions after 500 characters remain intact",
);
assert(history.blocks.some((block) => block.text.includes('"visibleToPlayer":false')));
assert.deepEqual(
  history.evidence.map((row) => row.id),
  ["n", "w"],
);
const continuityOnly = sceneWritingHistory({ lines: [narration] } as any, [], "", ["rosa"]);
assert.deepEqual(continuityOnly.evidence, [], "narrator visibility never becomes resident evidence");
assert(continuityOnly.blocks.some((block) => block.text.includes('"citable":false')));

const explicitAside = normalizeSparseSceneReply({
  segments: [
    { kind: "dialogue", speakerId: "rosa", delivery: "ordinary", presentation: "aside", text: "A spoken aside." },
  ],
});
assert.equal((explicitAside.segments as any[])[0].delivery, "ordinary");
assert.equal((explicitAside.segments as any[])[0].presentation, "aside");
for (const supplied of [
  { delivery: "aside" },
  { delivery: "side", presentation: "aside" },
  { delivery: "aside", presentation: "main" },
  { delivery: "aside", targetId: "player" },
  { delivery: "quiet" },
]) {
  const raw = normalizeSparseSceneReply({
    segments: [{ kind: "dialogue", speakerId: "rosa", text: "A line.", ...supplied }],
  });
  assert.throws(() => parseVenueReply(zoneEventReply(raw, "")!, ["rosa", "player"]), /delivery/);
}

// v3 captures are exact source occurrences, independent of character reactions.
{
  const { playerSpeechCapture } = await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const input = 'I think "mint". I say "mint" and then *pause* "cinnamon, if cold".';
  const segments = [
    { kind: "dialogue", speakerId: "player", text: "mint cinnamon, if cold" },
    { kind: "dialogue", speakerId: "rosa", text: "You never told me." },
  ];
  const playerSpeech = {
    status: "captured",
    segments: [
      {
        segment: 0,
        sources: [
          { text: "mint", occurrence: 2 },
          { text: "cinnamon, if cold", occurrence: 1 },
        ],
      },
    ],
  };
  const capture = playerSpeechCapture({ segments, playerSpeechCapture: playerSpeech }, input);
  assert.equal(capture.get(0)![0].start, input.lastIndexOf("mint"));
  assert.equal(capture.get(0)![1].text, "cinnamon, if cold");
  assert.throws(() => playerSpeechCapture({ segments }, input), /capture needs recovery/);
  assert.throws(
    () => playerSpeechCapture({ segments, playerSpeechCapture: { status: "silent", segments: [] } }, input),
    /capture/,
  );
  assert.throws(
    () => playerSpeechCapture({ segments, playerSpeechCapture: { ...playerSpeech, status: "uncertain" } }, input),
    /capture/,
  );
  assert.throws(() => playerSpeechCapture({ segments, playerSpeechCapture: playerSpeech }, input, true), /capture/);
  assert.deepEqual(
    [
      ...playerSpeechCapture(
        { segments: segments.slice(1), playerSpeechCapture: { status: "silent", segments: [] } },
        "*thinks of mint*",
      ),
    ],
    [],
  );
  const saved = {
    segments: segments.slice(1),
    memoryChanges: [{ evidence: [0, "older-id"] }],
    events: { moves: [{ segment: 0 }], sceneEnded: { source: 0 } },
    relationshipChanges: { disclosures: [{ source: 0 }] },
    playerSpeechCapture: {
      status: "captured",
      utterances: [
        { text: "mint", occurrence: 2 },
        { text: "cinnamon, if cold", occurrence: 1 },
      ],
    },
  };
  const before = structuredClone(saved);
  const expanded = materializePlayerSpeech(saved, input);
  playerSpeechCapture(expanded, input);
  assert.deepEqual(
    (expanded.segments as any[]).map((line) => line.text),
    ["mint", "cinnamon, if cold", "You never told me."],
  );
  assert.deepEqual((expanded.memoryChanges as any)[0].evidence, [2, "older-id"]);
  assert.equal((expanded.events as any).moves[0].segment, 2);
  assert.equal((expanded.events as any).sceneEnded.source, 2);
  assert.deepEqual(saved, before);
}

// Retrieval finds old exact evidence without expanding the serialized history allowance.
{
  const line = (id: string, content: string, extra: any = {}) => ({
    id,
    content,
    speakerId: "rosa",
    role: "assistant",
    kind: "dialogue",
    heardBy: ["rosa"],
    ...extra,
  });
  const preference = line("tea", "I dislike cinnamon in tea. Mint is my favourite, unless it is cold.");
  const correction = line("correction", "Correction: mint is my favourite only while hot; never cold.");
  const filler = Array.from({ length: 65 }, (_, i) =>
    line("filler-" + i, "We discuss the wooden bench and its grain. " + "timber ".repeat(35)),
  );
  const lines = [preference, correction, ...filler];
  const selected = sceneWritingHistory(
    { lines, submissions: [] } as any,
    lines as any,
    "Which tea flavour did I dislike?",
    ["rosa"],
  );
  assert(selected.blocks.map((block) => block.text).join("\n\n").length <= 12000);
  assert(selected.evidence.some((row) => row.id === "tea"));
  assert(selected.blocks.some((block) => block.text.includes(preference.content)));
  assert.equal(new Set(selected.evidence.map((row) => row.id)).size, selected.evidence.length);
  assert(selected.blocks.some((block) => block.text.includes("omission never proves historical absence")));
  const flooded = Array.from({ length: 70 }, (_, i) =>
    line(
      "topic-" + i,
      Array.from({ length: 6 }, (_, word) => `topic${i}detail${word}`).join(" ") +
        " An unrelated detailed conversation continues.",
    ),
  );
  const topic = flooded.map((row) => row.content).join(" ");
  const floodedScene = {
    lines: [preference, correction, ...flooded],
    submissions: [
      { mode: "chat", message: topic, replyLineIds: ["topic-68"] },
      { mode: "chat", message: topic, replyLineIds: ["topic-69"] },
    ],
  };
  const focused = sceneWritingHistory(
    floodedScene as any,
    floodedScene.lines as any,
    "Which tea flavour did I dislike?",
    ["rosa"],
  );
  assert(
    focused.evidence.some((row) => row.id === "tea"),
    "current question outranks unrelated recent topic flood",
  );
  assert(focused.blocks.map((block) => block.text).join("\n\n").length <= 12000);
  const contextual = line("older-detail", "The larch workshop uses the scarlet dovetail pattern.");
  const contextScene = {
    lines: [contextual, ...filler, line("followup", "The scarlet dovetail pattern.")],
    submissions: [{ mode: "chat", message: "scarlet dovetail", replyLineIds: ["followup"] }],
  };
  const followup = sceneWritingHistory(contextScene as any, contextScene.lines as any, "?", ["rosa"]);
  assert(
    followup.evidence.some((row) => row.id === "older-detail"),
    "context still retrieves older evidence for a deictic follow-up",
  );
  const huge = line("oversized", "cinnamon ".repeat(2000));
  const skip = sceneWritingHistory(
    { lines: [preference, huge, ...filler.slice(0, 6)], submissions: [] } as any,
    [preference, huge, ...filler.slice(0, 6)] as any,
    "cinnamon",
    ["rosa"],
  );
  assert(skip.evidence.some((row) => row.id === "tea"));
  assert(!skip.evidence.some((row) => row.id === "oversized"));
  const privateLine = line("secret", "Secret mint letter", { heardBy: ["other"], contactHidden: true });
  const sound = line("sound", "Unseen private cinnamon action", {
    heardBy: ["other"],
    contactHidden: true,
    soundOnly: { characterIds: ["rosa"], player: false, text: "An indistinct voice." },
  });
  const privacy = sceneWritingHistory(
    { lines: [privateLine, sound], submissions: [] } as any,
    [sound] as any,
    "cinnamon",
    ["rosa"],
  );
  assert(!privacy.blocks.some((block) => block.text.includes(privateLine.content)));
  assert(!privacy.blocks.some((block) => block.text.includes(sound.content)));
  assert(privacy.blocks.some((block) => block.text.includes("An indistinct voice.")));
  assert.deepEqual(sceneWritingHistory({ lines: [], submissions: [] } as any, [], "tea", ["rosa"]).evidence, []);
}

// Bad bookkeeping cannot discard complete prose or critical metadata.
{
  const { normalizeRecoverableSceneReply } =
    await import("../packages/villages/src/server/domain/rules/scene-writing-contract.js");
  for (const [field, domain] of [
    ["memoryChanges", "memories"],
    ["wishChanges", "wishes"],
    ["relationshipChanges", "relationships"],
    ["projectSpeech", "projects"],
  ]) {
    const core = {
      segments: [{ kind: "dialogue", speakerId: "rosa", text: "I will bluff if I please." }],
      placeUpdate: {
        happened: true,
        narration: "The stone moves.",
        expectedRevision: 0,
        recent: { text: "A stone beside the wall." },
      },
    };
    const result = normalizeRecoverableSceneReply({ ...core, [field]: "malformed" });
    assert.deepEqual(result.raw.segments, core.segments);
    assert.deepEqual(result.raw.placeUpdate, core.placeUpdate);
    assert.equal(result.failures[domain as keyof typeof result.failures]?.kind, "metadata");
    assert.equal(result.raw[field], undefined);
    assert.equal((result.failures[domain as keyof typeof result.failures]?.proposal as any)[field], "malformed");
  }
  const disclosure = normalizeRecoverableSceneReply({
    segments: [{ kind: "narration", text: "The door opens." }],
    relationshipChanges: { disclosures: [{ source: 0 }] },
  });
  assert(disclosure.failures.relationships);
  assert.deepEqual(disclosure.raw.memoryChanges, []);
  const { playerSpeechCapture } = await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const input = "I tell her mint, pause for a breath, then add cinnamon.";
  const saved = {
    segments: [{ kind: "dialogue", speakerId: "rosa", text: "Hmm." }],
    memoryChanges: [{ evidence: [0] }],
    playerSpeechCapture: {
      status: "captured",
      utterances: [
        { text: "mint", occurrence: 1 },
        { text: "cinnamon", occurrence: 1 },
      ],
    },
  };
  const result = materializePlayerSpeech(saved, input);
  playerSpeechCapture(result, input);
  assert.deepEqual((result.memoryChanges as any)[0].evidence, [2]);
}

{
  const { publicSceneResponse } = await import("../packages/villages/src/server/domain/rules/scene-public.js");
  const projected = JSON.stringify(
    publicSceneResponse({
      lines: [],
      submissions: [
        {
          mode: "chat",
          zoneEventsVersion: 1,
          effectFailures: {
            projects: {
              kind: "metadata",
              proposal: { projectSpeech: [{ speakerId: "unseen-person", quote: "PRIVATE FAILURE" }] },
            },
          },
          speechSource: { version: 3, spans: [{ text: "PRIVATE SOURCE" }] },
        },
      ],
    }),
  );
  assert.doesNotMatch(projected, /effectFailures|speechSource|PRIVATE FAILURE|PRIVATE SOURCE|unseen-person/);
}

{
  const { playerSpeechCapture } = await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  assert.throws(
    () =>
      playerSpeechCapture(
        {
          segments: [
            { kind: "dialogue", speakerId: "player", text: "second" },
            { kind: "dialogue", speakerId: "player", text: "first" },
          ],
          playerSpeechCapture: {
            status: "captured",
            segments: [
              { segment: 1, sources: [{ text: "first", occurrence: 1 }] },
              { segment: 0, sources: [{ text: "second", occurrence: 1 }] },
            ],
          },
        },
        "first second",
      ),
    /capture/,
  );
  const { normalizeRecoverableSceneReply } =
    await import("../packages/villages/src/server/domain/rules/scene-writing-contract.js");
  const project = { projectId: "bridge", speakerId: "rosa", citations: [{ segment: 0 }] };
  const segments = [{ kind: "dialogue", speakerId: "rosa", text: "I withdraw my commitment to lead the bridge." }];
  const withdrawal = normalizeRecoverableSceneReply({
    segments,
    projectSpeech: [{ ...project, kind: "withdrawal" }],
  });
  assert.deepEqual(withdrawal.failures, {});
  assert.equal((withdrawal.raw.projectSpeech as any)[0].kind, "withdrawal");
  assert.equal((withdrawal.raw.projectSpeech as any)[0].citations[0].quote, segments[0].text);
  for (const projectSpeech of [
    [{}],
    [{ projectId: "missing", kind: "unknown", speakerId: "rosa", citations: [] }],
    [{ ...project, kind: "requirements" }],
  ]) {
    const result = normalizeRecoverableSceneReply({
      segments,
      projectSpeech,
    });
    assert(result.failures.projects);
    assert.equal(result.raw.projectSpeech, undefined);
    assert.deepEqual(result.raw.segments, withdrawal.raw.segments, "Invalid metadata preserves the accepted prose");
  }
}

// Current GM speech uses literal text and exact occurrences; citations follow inserted speech.
{
  const { playerSpeechCapture } = await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const input = 'I recall "mint". I say "mint" and then "ginger, only hot".';
  const original = {
    segments: [{ kind: "dialogue", speakerId: "rosa", text: "I hear you." }],
    memoryChanges: [{ evidence: [0, "utterance:0"] }],
    wishChanges: [{ evidence: ["utterance:1"] }],
    relationshipChanges: { changes: [{ lineIds: ["utterance:0", 0] }] },
    playerSpeechCapture: {
      status: "captured",
      utterances: [
        { text: "mint", occurrence: 2 },
        { text: "ginger, only hot", occurrence: 1, delivery: "whisper", targetId: "rosa" },
      ],
    },
  };
  const before = structuredClone(original);
  const expanded = materializePlayerSpeech(original, input);
  const capture = playerSpeechCapture(expanded, input);
  assert.equal(capture.get(0)![0].start, input.lastIndexOf("mint"));
  assert.equal(capture.get(1)![0].text, "ginger, only hot");
  assert.deepEqual((expanded.memoryChanges as any)[0].evidence, [2, 0]);
  assert.deepEqual((expanded.wishChanges as any)[0].evidence, [1]);
  assert.deepEqual((expanded.relationshipChanges as any).changes[0].lineIds, [0, 2]);
  assert.equal((expanded.segments as any)[1].delivery, "whisper");
  assert.equal((expanded.segments as any)[1].targetId, "rosa");
  assert.equal((expanded.segments as any)[2].text, "I hear you.");
  assert.deepEqual(original, before);
  (expanded.segments as any)[2].text = "A later working copy";
  assert.deepEqual(original, before, "working results cannot rewrite the original response");
  for (const unsupported of [
    { quote: 1 },
    { id: 1 },
    { text: "mint" },
    { sources: [{ text: "mint", occurrence: 2 }] },
  ]) {
    const raw = { ...original, playerSpeechCapture: { status: "captured", utterances: [unsupported] } };
    const saved = structuredClone(raw);
    assert.throws(() => materializePlayerSpeech(raw, input), /capture needs recovery/);
    assert.deepEqual(raw, saved);
  }
  const invalidIndex = materializePlayerSpeech(
    {
      ...original,
      memoryChanges: [{ evidence: [1, "utterance:1"] }],
      events: { sceneEnded: { source: 9 } },
    },
    input,
  );
  assert.deepEqual((invalidIndex.memoryChanges as any)[0].evidence, [-1, 1]);
  assert.equal(
    (invalidIndex.events as any).sceneEnded.source,
    -1,
    "invalid reply references never acquire inserted speech",
  );
}

{
  const { playerSpeechCapture } = await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const resolve = (input: string, utterances: unknown[]) => {
    const raw = {
      playerSpeechCapture: { status: "captured", utterances },
      segments: [{ kind: "narration", text: "Rosa rests her hand on the rail." }],
    };
    const before = structuredClone(raw);
    const expanded = materializePlayerSpeech(raw, input);
    assert.deepEqual(raw, before);
    return playerSpeechCapture(expanded, input);
  };
  const input = "mint *pause* ginger";
  const captured = resolve(input, [
    { text: "mint", occurrence: 1 },
    { text: "ginger", occurrence: 1 },
  ]);
  assert.equal(captured.get(0)![0].start, 0);
  assert.equal(captured.get(1)![0].start, input.indexOf("ginger"));
  assert.equal(resolve("mint mint", [{ text: "mint", occurrence: 2 }]).get(0)![0].start, 5);
  for (const occurrence of [undefined, null, 0, -1, "1", 1.5, NaN, Infinity, 2])
    assert.throws(() => resolve("mint", [{ text: "mint", occurrence }]), /capture needs recovery/);
  assert.throws(
    () =>
      resolve("mint ginger", [
        { text: "ginger", occurrence: 1 },
        { text: "mint", occurrence: 1 },
      ]),
    /capture needs recovery/,
  );
  const words = "Mari, I don’t want to be friends anymore. I’m ending our friendship.";
  assert.equal(resolve(words, [{ text: words, occurrence: 1 }]).get(0)![0].text, words);
  assert.equal(resolve(words, [{ text: words, occurrence: 1 }]).get(0)![0].end, words.length);
  for (const [input, text] of [
    [words, "Mari, I don't want to be friends anymore. I'm ending our friendship."],
    ["mint", "Mint"],
    ["mint", "missing"],
    ["mint", " "],
  ])
    assert.throws(() => resolve(input, [{ text, occurrence: 1 }]), /capture needs recovery/);
  for (const segments of [undefined, null, []])
    assert.throws(
      () =>
        materializePlayerSpeech(
          { segments, playerSpeechCapture: { status: "captured", utterances: [{ text: "mint", occurrence: 1 }] } },
          "mint",
        ),
      /authored moment/,
    );
  for (const capture of [
    { status: "uncertain", utterances: [] },
    { status: "silent", utterances: [{ text: "mint", occurrence: 1 }] },
    { status: "captured", segments: [] },
  ])
    assert.throws(
      () =>
        materializePlayerSpeech(
          { segments: [{ kind: "narration", text: "A nod." }], playerSpeechCapture: capture },
          "mint",
        ),
      /capture needs recovery/,
    );
  const silent = materializePlayerSpeech(
    { segments: [{ kind: "narration", text: "A nod." }], playerSpeechCapture: { status: "silent", utterances: [] } },
    "*nods*",
  );
  assert.equal(playerSpeechCapture(silent, "*nods*").size, 0);
  assert.throws(
    () =>
      materializePlayerSpeech(
        {
          segments: Array.from({ length: 24 }, () => ({ kind: "narration", text: "A nod." })),
          playerSpeechCapture: { status: "captured", utterances: [{ text: "mint", occurrence: 1 }] },
        },
        "mint",
      ),
    /capture needs recovery/,
  );
}

console.log(
  "Sparse Scene: complete-only defaults, exact references, private speech, stable indexes and conflicting fields passed.",
);
