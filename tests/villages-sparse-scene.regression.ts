import assert from "node:assert/strict";
import { materializePlayerSpeech } from "../packages/villages/src/server/domain/rules/player-speech-capture.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";
import {
  completeSceneObject,
  isolateSceneEffects,
} from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import {
  sceneHistoryRow,
  sceneWritingHistory,
} from "../packages/villages/src/server/domain/rules/scene-writing-history.js";
import { fitVenueWritingMessages } from "../packages/villages/src/server/domain/rules/venue-writing.js";
import { workFailureSummary } from "../packages/villages/src/server/domain/rules/work-failure.js";
import { zoneEventReply } from "../packages/villages/src/server/domain/rules/zone-events.js";

// Native operation isolation preserves independent dialogue and exact failure payloads.
{
  const core = { segments: [{ kind: "dialogue", speakerId: "rosa", text: "I prefer ginger tea." }] };
  const change = {
    fromId: "rosa",
    toId: "player",
    expectedRevision: "PRIVATE REASON",
    lineIds: [0],
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
  };
  const relationship = (changes: unknown[]) => ({ changes, permissions: [], disclosures: [] });
  const malformed = isolateSceneEffects({ ...core, relationshipChanges: relationship([change]) });
  const message = malformed.failures.relationships!.message;
  assert.match(message, /changes\[0\]\.reason must be a nonempty string/);
  assert.match(workFailureSummary({ cause: "missing_result", stage: "metadata", message }), /changes\[0\]\.reason/);
  assert.doesNotMatch(
    workFailureSummary({ cause: "provider_exception", stage: "provider", message: "SECRET TOKEN" }),
    /SECRET/,
  );
  const invalid = isolateSceneEffects({
    ...core,
    relationshipChanges: relationship([{ ...change, reason: "Friendly visit" }]),
  });
  assert.match(invalid.failures.relationships!.message, /expectedRevision must be a nonnegative integer/);
  const valid = isolateSceneEffects({
    ...core,
    relationshipChanges: relationship([{ ...change, expectedRevision: 0, reason: "Friendly visit" }]),
  });
  assert.deepEqual(valid.failures, {});
  assert.deepEqual(valid.raw.segments, core.segments);
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
const parsed = parseVenueReply(zoneEventReply(raw, "")!, ["rosa", "player"]);
assert.equal(parsed.lines[2].targetId, "player");
assert.equal(parsed.lines[2].delivery, "whisper");
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
  assert.equal(completeSceneObject(text, finish), null);
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

const explicitAside = {
  segments: [
    { kind: "dialogue", speakerId: "rosa", delivery: "ordinary", presentation: "aside", text: "A spoken aside." },
  ],
};
assert.equal((explicitAside.segments as any[])[0].delivery, "ordinary");
assert.equal((explicitAside.segments as any[])[0].presentation, "aside");
for (const supplied of [
  { delivery: "aside" },
  { delivery: "side", presentation: "aside" },
  { delivery: "aside", presentation: "main" },
  { delivery: "aside", targetId: "player" },
  { delivery: "quiet" },
]) {
  const raw = {
    segments: [{ kind: "dialogue", speakerId: "rosa", text: "A line.", ...supplied }],
  };
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
  assert.throws(() => playerSpeechCapture({ segments }, input), /capture|player source/);
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

// Full history stays appendable; actual model pressure prunes whole low-value rows.
{
  let fitCalls = 0;
  const fit = (history: ReturnType<typeof sceneWritingHistory>) => {
    fitCalls = 0;
    return fitVenueWritingMessages(
      {
        fitContext(messages, options) {
          fitCalls++;
          const size = messages.reduce((sum, row) => sum + row.content.length, 0);
          return {
            ...options,
            messages: size <= 12000 ? messages : [],
            trimmed: size > 12000,
            estimatedTokensBefore: Math.ceil(size / 4),
            estimatedTokensAfter: Math.min(3000, Math.ceil(size / 4)),
          };
        },
      },
      history.blocks,
      "Which tea?",
      4096,
    );
  };
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
  assert(selected.blocks.map((block) => block.text).join("\n\n").length > 12000);
  assert.equal(selected.evidence.length, lines.length, "An unrelated byte cap cannot evict fitting history");
  const appended = sceneWritingHistory(
    { lines: [...lines, line("new", "A new reply.")], submissions: [] } as any,
    [...lines, line("new", "A new reply.")] as any,
    "A different topic",
    ["rosa"],
  );
  assert.deepEqual(
    appended.blocks.slice(0, selected.blocks.length).map((block) => block.text),
    selected.blocks.map((block) => block.text),
  );
  const fitted = fit(selected);
  assert(fitted.messages.reduce((sum, row) => sum + row.content.length, 0) <= 12000);
  assert(fitted.trimmed);
  assert(fitCalls < 20, "Long histories fit in bounded batches rather than one pass per row");
  assert(fitted.evidenceIds.includes("tea"));
  for (const row of lines.slice(-6))
    assert(fitted.evidenceIds.includes(row.id), "Latest exchange context is mandatory");
  assert(fitted.evidenceIds.length < selected.evidence.length);
  for (const row of selected.evidence.filter((row) => !fitted.evidenceIds.includes(row.id)))
    assert(!fitted.messages.some((message) => message.content.includes("[" + JSON.stringify(row.id) + ",")));
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
  assert(fit(focused).evidenceIds.includes("tea"));
  const contextual = line("older-detail", "The larch workshop uses the scarlet dovetail pattern.");
  const contextScene = {
    lines: [contextual, ...filler, line("followup", "The scarlet dovetail pattern.")],
    submissions: [{ mode: "chat", message: "scarlet dovetail", replyLineIds: ["followup"] }],
  };
  const followup = sceneWritingHistory(contextScene as any, contextScene.lines as any, "?", ["rosa"]);
  assert(
    fit(followup).evidenceIds.includes("older-detail"),
    "context still retrieves older evidence for a deictic follow-up",
  );
  const huge = line("oversized", "cinnamon ".repeat(2000));
  const skip = sceneWritingHistory(
    { lines: [preference, huge, ...filler.slice(0, 6)], submissions: [] } as any,
    [preference, huge, ...filler.slice(0, 6)] as any,
    "cinnamon",
    ["rosa"],
  );
  const skipFit = fit(skip);
  assert(skipFit.evidenceIds.includes("tea"));
  assert(!skipFit.evidenceIds.includes("oversized"));
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
  const visibleOnly = line("narrator-only", "A private player observation.", { kind: "narration", heardBy: [] });
  for (const audience of [["rosa"], ["later", "rosa", "rosa"]]) {
    const canonical = [preference, sound, visibleOnly];
    const view = sceneWritingHistory(
      { lines: canonical, submissions: [] } as any,
      [preference, sound] as any,
      "",
      audience,
    );
    const encoded = view.blocks.flatMap((block) => {
      try {
        return [JSON.parse(block.text)];
      } catch {
        return [];
      }
    });
    const defaults = encoded.find((row) => row.historyDefaults).historyDefaults;
    assert.deepEqual(defaults.heardBy, [...new Set(audience)].sort());
    for (const original of canonical) {
      const [id, speakerId, kind, text, overrides] = encoded.find(
        (row) => Array.isArray(row) && row[0] === original.id,
      );
      const wire = { id, speakerId, kind, text, ...overrides };
      assert.deepEqual({ ...defaults, ...wire }, sceneHistoryRow(original as any, audience, original !== visibleOnly));
      if (original !== preference) assert.deepEqual(wire.heardBy, [], "Empty hearing never inherits the current cast");
    }
    if (audience.includes("later"))
      assert.deepEqual(
        encoded.find((row) => Array.isArray(row) && row[0] === "tea")[4].heardBy,
        ["rosa"],
        "A later arrival never inherits earlier dialogue through defaults",
      );
  }
  assert.deepEqual(sceneWritingHistory({ lines: [], submissions: [] } as any, [], "tea", ["rosa"]).evidence, []);
}

// Bad bookkeeping cannot discard complete prose or critical metadata.
{
  const { isolateSceneEffects } =
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
    const result = isolateSceneEffects({ ...core, [field]: "malformed" });
    assert.deepEqual(result.raw.segments, core.segments);
    assert.deepEqual(result.raw.placeUpdate, core.placeUpdate);
    assert.equal(result.failures[domain as keyof typeof result.failures]?.kind, "metadata");
    assert.equal(result.raw[field], undefined);
    assert.equal((result.failures[domain as keyof typeof result.failures]?.proposal as any)[field], "malformed");
  }
  const disclosure = isolateSceneEffects({
    segments: [{ kind: "narration", text: "The door opens." }],
    relationshipChanges: { disclosures: [{ source: 0 }] },
  });
  assert(disclosure.failures.relationships);
  assert.equal(disclosure.raw.memoryChanges, undefined);
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
  const { isolateSceneEffects } =
    await import("../packages/villages/src/server/domain/rules/scene-writing-contract.js");
  const segments = [{ kind: "dialogue", speakerId: "rosa", text: "I withdraw my commitment to lead the bridge." }];
  const project = { projectId: "bridge", speakerId: "rosa", citations: [{ segment: 0, quote: segments[0].text }] };
  const withdrawal = isolateSceneEffects({
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
    const result = isolateSceneEffects({
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
    assert.throws(() => materializePlayerSpeech(raw, input), /capture|player source/);
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
    assert.throws(() => resolve("mint", [{ text: "mint", occurrence }]), /capture|player source/);
  assert.throws(
    () =>
      resolve("mint ginger", [
        { text: "ginger", occurrence: 1 },
        { text: "mint", occurrence: 1 },
      ]),
    /capture|player source/,
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
    assert.throws(() => resolve(input, [{ text, occurrence: 1 }]), /capture|player source/);
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
      /capture|player source/,
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
    /capture|player source/,
  );
}

console.log(
  "Sparse Scene: complete-only defaults, exact references, private speech, stable indexes and conflicting fields passed.",
);
