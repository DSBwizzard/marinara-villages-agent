import { PLAYER_CAPTURE_CONTRACT } from "../packages/villages/src/server/domain/rules/player-speech-capture.js";
import { sceneWritingHistory } from "../packages/villages/src/server/domain/rules/scene-writing-history.js";
import { readSceneWritingCapabilities } from "../packages/villages/src/server/domain/rules/scene-compact-contract.js";
import assert from "node:assert/strict";
import {
  normalizeSceneEffectReferences,
  normalizeRecoverableSceneReply,
} from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { materializePlayerSpeech } from "../packages/villages/src/server/domain/rules/player-speech-capture.js";
import { workFailureSummary } from "../packages/villages/src/server/domain/rules/work-failure.js";

// Compact optional metadata and citation syntax survive player-speech insertion.
{
  const core = {
    segments: [{ speakerId: "rosa", text: "I prefer ginger tea." }],
    playerSpeechCapture: { status: "captured", utterances: [{ text: "Hello.", occurrence: 1 }] },
  };
  for (const relationshipChanges of [undefined, {}, { changes: [] }, { disclosures: [] }, { permissions: [] }]) {
    const wire = relationshipChanges === undefined ? core : { ...core, relationshipChanges };
    const result = normalizeRecoverableSceneReply(wire);
    assert.deepEqual(result.failures, {});
    assert.deepEqual(result.raw.relationshipChanges, { changes: [], permissions: [], disclosures: [] });
  }
  const refs = ["0", "utterance:0", "saved-line", "01", "-1", "0.0", " 0", "99"];
  const wire = {
    ...core,
    memoryChanges: [{ learners: { rosa: { support: refs.map((lineId) => ({ lineId, excerpt: "tea" })) } } }],
    relationshipChanges: { changes: [{ lineIds: refs }] },
  };
  const canonical = normalizeSceneEffectReferences(wire);
  const expanded = materializePlayerSpeech(canonical, "Hello.");
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
  assert.equal(
    (normalizeSceneEffectReferences(wire, ["0"]).memoryChanges as any)[0].learners.rosa.support[0].lineId,
    "0",
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
import {
  completeSceneObject,
  normalizeSparseSceneReply,
} from "../packages/villages/src/server/domain/rules/scene-writing-contract.js";
import { sceneMissingFields } from "../packages/villages/src/server/domain/rules/response-diagnostics.js";
import {
  compactSceneContract,
  reliableSceneContract,
} from "../packages/villages/src/server/domain/rules/scene-compact-contract.js";
import { zoneEventReply } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { parseVenueReply } from "../packages/villages/src/server/domain/rules/scene-reply.js";

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
assert.deepEqual(implicitKinds, sparse, "inferred segment kinds preserve attribution, delivery and exact prose");
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
const context = {
  opening: false,
  conversational: true,
  liveMemory: true,
  residentControlled: false,
  recapNeeded: false,
  staging: false,
  contactFacts: "",
  zoneEventContract: "zone events",
  invitationZones: "none",
  presentation: "",
  expressions: [],
  projects: false,
  wishes: false,
};
const unavailable = {
  management: false,
  movement: false,
  residences: false,
  residenceDecision: false,
  editApproval: false,
};
const minimal = compactSceneContract(context, unavailable).join("\n");
assert.doesNotMatch(
  minimal,
  /wishChanges|projectSpeech|residenceRequest|residenceDecision|editApproval:|manage-access/,
);
assert.match(minimal, /venueRequest/, "spontaneous available proposals survive ordinary conversation");
const full = compactSceneContract(
  { ...context, wishes: true, projects: true, invitationZones: "common" },
  { management: true, movement: true, residences: true, residenceDecision: true, editApproval: true },
).join("\n");
assert.match(full, /wishChanges/);
assert.match(full, /projectSpeech/);
assert.match(full, /manage-access/);
assert.match(full, /residenceRequest/);
assert.match(full, /editApproval/);
// Mechanical budget excludes authored cards, writing guidance, world facts and history.
// All capabilities remain described; compaction cannot trade away their availability.
const reliableFull = reliableSceneContract(
  { ...context, residentControlled: true, staging: true, wishes: true, projects: true, invitationZones: "common" },
  { management: true, movement: true, residences: true, residenceDecision: true, editApproval: true },
).join("\n");
assert(
  reliableFull.length + PLAYER_CAPTURE_CONTRACT.length <= 8000,
  `v3 mechanical instructions stay within their character budget (${reliableFull.length + PLAYER_CAPTURE_CONTRACT.length}/8000)`,
);
for (const field of [
  "contactMoves",
  "wishChanges",
  "projectSpeech",
  "manage-access",
  "residenceRequest",
  "residenceDecision",
  "editApproval",
  "sound",
  "relationshipChanges",
  "memoryChanges",
])
  assert(reliableFull.includes(field), `${field} remains available inside the mechanical budget`);

console.log(
  "Sparse Scene: complete-only defaults, exact references, private speech, stable indexes, conflicting fields and capability contracts passed.",
);

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
for (const value of [undefined, null, {}, [], { ...unavailable, movement: "true" }, { ...unavailable, extra: false }])
  assert.throws(() => readSceneWritingCapabilities(value), /invalid writing capability/);
assert.deepEqual(readSceneWritingCapabilities(unavailable), unavailable);
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
const history = sceneWritingHistory({ lines: [narration, whisper] } as any, [narration, whisper] as any);
assert.equal(
  history.context.split("The door opened.").length - 1,
  1,
  "narrator continuity and evidence share one full line",
);
assert(history.context.includes("ONLY IF MARA AGREES."), "evidence conditions after 500 characters remain intact");
assert(history.context.includes('"visibleToPlayer":false'));
assert.deepEqual(
  history.evidence.map((row) => row.id),
  ["n", "w"],
);
const continuityOnly = sceneWritingHistory({ lines: [narration] } as any, []);
assert.deepEqual(continuityOnly.evidence, [], "narrator visibility never becomes resident evidence");
assert(continuityOnly.context.includes('"citable":false'));

const asideShorthand = normalizeSparseSceneReply({
  segments: [{ kind: "dialogue", speakerId: "rosa", delivery: "aside", text: "A spoken aside." }],
});
assert.equal((asideShorthand.segments as any[])[0].delivery, "ordinary");
assert.equal((asideShorthand.segments as any[])[0].presentation, "aside");
for (const supplied of [
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
  const { playerSpeechCapture, recoverPlayerSpeech } =
    await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
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
    contactMoves: [{ segment: 0 }],
    invitation: { source: 0 },
    relationshipChanges: { disclosures: [{ source: 0 }] },
  };
  const recovered = recoverPlayerSpeech(saved, { additionalSpeech: [segments[0]], playerSpeechCapture: playerSpeech });
  playerSpeechCapture(recovered, input);
  assert.deepEqual(recovered.segments, segments);
  assert.deepEqual((recovered.memoryChanges as any)[0].evidence, [1, "older-id"]);
  assert.equal((recovered.invitation as any).source, 1);
  assert.equal((recovered.contactMoves as any)[0].segment, 1);
  assert.deepEqual(saved.segments, segments.slice(1));
  assert.throws(() => recoverPlayerSpeech(saved, { segments: [] }), /unrelated/);
  assert.throws(() => recoverPlayerSpeech(saved, { additionalSpeech: [segments[1]] }), /invalid/);
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
  assert(selected.context.length <= 12000);
  assert(selected.evidence.some((row) => row.id === "tea"));
  assert(selected.context.includes(preference.content));
  assert.equal(new Set(selected.evidence.map((row) => row.id)).size, selected.evidence.length);
  assert(selected.context.includes("omission never proves historical absence"));
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
      { message: topic, replyLineIds: ["topic-68"] },
      { message: topic, replyLineIds: ["topic-69"] },
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
  assert(focused.context.length <= 12000);
  const contextual = line("older-detail", "The larch workshop uses the scarlet dovetail pattern.");
  const contextScene = {
    lines: [contextual, ...filler, line("followup", "The scarlet dovetail pattern.")],
    submissions: [{ message: "scarlet dovetail", replyLineIds: ["followup"] }],
  };
  const followup = sceneWritingHistory(contextScene as any, contextScene.lines as any, "?", ["rosa"]);
  assert(
    followup.evidence.some((row) => row.id === "older-detail"),
    "context still retrieves older evidence for a deictic follow-up",
  );
  const huge = line("oversized", "cinnamon ".repeat(2000));
  const skip = sceneWritingHistory(
    { lines: [preference, huge], submissions: [] } as any,
    [preference, huge] as any,
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
  assert(!privacy.context.includes(privateLine.content));
  assert(!privacy.context.includes(sound.content));
  assert(privacy.context.includes("An indistinct voice."));
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
      sceneChange: { happened: true, narration: "The stone moves." },
    };
    const result = normalizeRecoverableSceneReply({ ...core, [field]: "malformed" });
    assert.deepEqual(result.raw.segments, core.segments);
    assert.deepEqual(result.raw.sceneChange, core.sceneChange);
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
  const { recoverPlayerSpeech, playerSpeechCapture } =
    await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const input = "I tell her mint, pause for a breath, then add cinnamon.";
  const saved = {
    segments: [
      { kind: "dialogue", speakerId: "player", text: "mint" },
      { kind: "dialogue", speakerId: "rosa", text: "Hmm." },
    ],
    memoryChanges: [{ evidence: [1] }],
  };
  const result = recoverPlayerSpeech(saved, {
    additionalSpeech: [{ beforeSegment: 1, kind: "dialogue", speakerId: "player", text: "cinnamon" }],
    playerSpeechCapture: {
      status: "captured",
      segments: [
        { segment: 0, sources: [{ text: "mint", occurrence: 1 }] },
        { segment: 1, sources: [{ text: "cinnamon", occurrence: 1 }] },
      ],
    },
  });
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
            { speakerId: "player", text: "second" },
            { speakerId: "player", text: "first" },
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
  for (const projectSpeech of [[{}], [{ projectId: "missing", kind: "unknown", speakerId: "rosa", citations: [] }]]) {
    const result = normalizeRecoverableSceneReply({
      segments: [{ kind: "narration", text: "Prose stays." }],
      projectSpeech,
    });
    assert(result.failures.projects);
  }
}

// Compact quote references avoid repeating input while preserving exact provenance and citations.
{
  const { materializePlayerSpeech, playerSpeechCapture, playerQuoteSources } =
    await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const input = 'I recall "mint". I say "mint" and then "ginger, only hot".';
  const quotes = playerQuoteSources(input);
  assert.equal(quotes[1].occurrence, 2);
  const original = {
    segments: [{ kind: "dialogue", speakerId: "rosa", text: "I hear you." }],
    memoryChanges: [{ evidence: [0, "utterance:0"] }],
    wishChanges: [{ evidence: ["utterance:1"] }],
    relationshipChanges: { changes: [{ lineIds: ["utterance:0", 0] }] },
    playerSpeechCapture: {
      status: "captured",
      utterances: [{ quote: 1 }, { quote: 2, delivery: "whisper", targetId: "rosa" }],
    },
  };
  const aliasInput = {
    ...original,
    playerSpeechCapture: {
      status: "captured",
      utterances: [{ id: 1 }, { id: 2, delivery: "whisper", targetId: "rosa" }],
    },
  };
  const beforeAlias = structuredClone(aliasInput);
  assert.deepEqual(
    materializePlayerSpeech(aliasInput, input),
    materializePlayerSpeech(original, input),
    "Supplied quote IDs retain the same exact text, occurrence and audience",
  );
  assert.deepEqual(aliasInput, beforeAlias, "Saved raw capture is never rewritten");
  for (const id of [-1, 99, "1", 1.5, null])
    assert.throws(
      () =>
        materializePlayerSpeech(
          { ...original, playerSpeechCapture: { status: "captured", utterances: [{ id }] } },
          input,
        ),
      /capture/,
    );
  assert.throws(
    () =>
      materializePlayerSpeech(
        { ...original, playerSpeechCapture: { status: "captured", utterances: [{ id: 1, occurrence: 1 }] } },
        input,
      ),
    /capture/,
  );
  const expanded = materializePlayerSpeech(original, input);
  const captured = playerSpeechCapture(expanded, input);
  assert.equal(captured.get(0)![0].start, input.lastIndexOf("mint"));
  assert.deepEqual((expanded.memoryChanges as any)[0].evidence, [2, 0]);
  assert.deepEqual((expanded.wishChanges as any)[0].evidence, [1]);
  assert.deepEqual((expanded.relationshipChanges as any).changes[0].lineIds, [0, 2]);
  assert.equal((expanded.segments as any)[1].delivery, "whisper");
  assert.equal((expanded.segments as any)[2].text, "I hear you.");
  assert.equal((original.segments as any).length, 1);
  assert.throws(
    () =>
      materializePlayerSpeech(
        { ...original, playerSpeechCapture: { status: "captured", utterances: [{ quote: 99 }] } },
        input,
      ),
    /capture/,
  );
  const interrupted = materializePlayerSpeech(
    {
      segments: [{ kind: "narration", text: "A nod." }],
      playerSpeechCapture: {
        status: "captured",
        utterances: [
          {
            sources: [
              { text: "mint", occurrence: 2 },
              { text: "ginger, only hot", occurrence: 1 },
            ],
          },
        ],
      },
    },
    input,
  );
  playerSpeechCapture(interrupted, input);
  assert.equal((interrupted.segments as any)[0].text, "mint ginger, only hot");
}

{
  const { materializePlayerSpeech, assertRecoveredSpeechPrivacy } =
    await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const capture = { status: "captured", utterances: [{ quote: 0 }] };
  for (const segments of [undefined, null, []])
    assert.throws(
      () => materializePlayerSpeech({ segments, playerSpeechCapture: capture }, '"mint"'),
      /authored moment/,
    );
  const original = {
    segments: [{ kind: "narration", text: "A glance." }],
    playerSpeechCapture: { status: "uncertain", utterances: [{ quote: 0, delivery: "whisper", targetId: "rosa" }] },
  };
  const recovered = (delivery: string, targetId = "rosa") =>
    materializePlayerSpeech(
      { ...original, playerSpeechCapture: { status: "captured", utterances: [{ quote: 0, delivery, targetId }] } },
      '"private mint"',
    );
  assert.doesNotThrow(() => assertRecoveredSpeechPrivacy(original, recovered("whisper"), '"private mint"'));
  assert.throws(
    () => assertRecoveredSpeechPrivacy(original, recovered("ordinary"), '"private mint"'),
    /private delivery/,
  );
  assert.throws(
    () => assertRecoveredSpeechPrivacy(original, recovered("whisper", "mara"), '"private mint"'),
    /private delivery/,
  );
}

{
  const { materializePlayerSpeech } =
    await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const expanded = materializePlayerSpeech(
    {
      segments: [{ kind: "dialogue", speakerId: "rosa", text: "Noted." }],
      memoryChanges: [{ evidence: [1, "utterance:1"] }],
      invitation: { source: 9 },
      playerSpeechCapture: { status: "captured", utterances: [{ quote: 0 }, { quote: 1 }] },
    },
    '"mint" "ginger"',
  );
  assert.deepEqual(
    (expanded.memoryChanges as any)[0].evidence,
    [-1, 1],
    "an invalid authored index cannot acquire an inserted utterance",
  );
  assert.equal((expanded.invitation as any).source, -1);
}

// Saved provider evidence omitted occurrence for exact, unique spoken spans.
{
  const { materializePlayerSpeech, playerSpeechCapture } =
    await import("../packages/villages/src/server/domain/rules/player-speech-capture.js");
  const resolve = (input: string, utterances: unknown[]) => {
    const raw = {
      playerSpeechCapture: { status: "captured", utterances },
      segments: [{ text: "Rosa rests her hand on the rail." }],
    };
    const before = structuredClone(raw);
    const expanded = materializePlayerSpeech(raw, input);
    assert.deepEqual(raw, before, "canonicalization does not alter the saved completion");
    return playerSpeechCapture(expanded, input);
  };
  const input = '\"Everyone should follow the same routine. It would make the village better.\" \"What do you think?\"';
  const capture = resolve(input, [
    { text: "Everyone should follow the same routine. It would make the village better." },
    { text: "What do you think?" },
  ]);
  assert.equal(capture.get(0)![0].occurrence, 1);
  assert.equal(capture.get(1)![0].start, input.indexOf("What do you think?"));
  assert.equal(resolve("mint *pause* ginger", [{ sources: [{ text: "mint" }, { text: "ginger" }] }]).get(0)!.length, 2);
  for (const [input, text] of [
    ["mint mint", "mint"],
    ["aaa", "aa"],
    ['I think "mint". I say "mint".', "mint"],
    ["mint", "missing"],
    ["mint", " "],
  ])
    assert.throws(() => resolve(input, [{ text }]), /capture needs recovery/);
  for (const occurrence of [null, 0, -1, "1", 1.5, NaN, Infinity, 2])
    assert.throws(() => resolve("mint", [{ text: "mint", occurrence }]), /capture needs recovery/);
  assert.throws(
    () => resolve("mint ginger", [{ sources: [{ text: "ginger" }, { text: "mint" }] }]),
    /capture needs recovery/,
  );
  assert.equal(resolve("mint mint", [{ text: "mint", occurrence: 2 }]).get(0)![0].start, 5);
  const originalWords = "Mari, I don’t want to be friends anymore. I’m ending our friendship.";
  const typography = resolve(originalWords, [
    { text: "Mari, I don't want to be friends anymore. I'm ending our friendship.", occurrence: 1 },
  ]);
  assert.equal(typography.get(0)![0].text, originalWords, "Typography repair always keeps the player's original words");
  assert.equal(typography.get(0)![0].start, 0);
  assert.equal(typography.get(0)![0].end, originalWords.length);
  assert.equal(resolve("I don't mind.", [{ text: "I don’t mind." }]).get(0)![0].text, "I don't mind.");
  for (const [input, text, occurrence] of [
    ["I don’t mind. I don‘t mind.", "I don't mind.", 1],
    ["I don’t mind.", "I don't mind.", 2],
    ["I don’t mind.", "I do not mind.", 1],
    ["I don’t mind.", "I don't Mind.", 1],
  ])
    assert.throws(() => resolve(input as string, [{ text, occurrence }]), /capture needs recovery/);
}
