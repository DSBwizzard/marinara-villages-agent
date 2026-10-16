import { sourceAttentionSystemCheck } from "../packages/villages/src/server/domain/rules/attention-sources.js";
import { createSystemInterpretation } from "../packages/villages/src/server/features/generation/system-interpretation-service.js";
import assert from "node:assert/strict";
import {
  attentionQuotes,
  attentionSourceSpan,
} from "../packages/villages/src/server/domain/rules/attention-sources.js";
import {
  attentionCheck,
  readAttentionPlan,
  directAttention,
  bindAttentionPlan,
  validAttentionPlan,
  coercePendingAttention,
} from "../packages/villages/src/server/domain/rules/scene-attention.js";
import { interpretationPayload } from "../packages/villages/src/server/domain/rules/interpretation-evidence-rules.js";
import { applyAttentionWitnesses } from "../packages/villages/src/server/domain/rules/attention-witnesses.js";
import { decisionCandidates } from "../packages/villages/src/server/domain/rules/decision-candidates.js";

const venue: any = {
  zones: [
    { id: "exterior", kind: "exterior", seen: true, name: "Exterior" },
    { id: "common", kind: "public", seen: true, name: "Common Space" },
    { id: "workshop", kind: "public", seen: true, name: "Workshop" },
    { id: "private", kind: "private-residence", name: "Hidden bedroom" },
  ],
};
const scene: any = {
  zoneId: "exterior",
  activeIds: ["local"],
  participants: [
    { characterId: "local", name: "Ada" },
    { characterId: "buster", name: "Buster" },
  ],
  lines: [],
  departedIds: [],
  accompanying: [],
  sceneAttendance: {
    occupants: [
      { characterId: "buster", zoneId: "common" },
      { characterId: "other", zoneId: "workshop" },
      { characterId: "hidden", zoneId: "private" },
    ],
  },
  doorwayContacts: [{ playerZoneId: "exterior", characterZoneId: "common", characterId: "buster" }],
};
const parse = (message: string, fragments: any[], outcome = "attention", modern = true) =>
  readAttentionPlan(
    {
      outcome,
      source: "system",
      evidenceIds: ["player-input"],
      reason: "Labeled synthetic routing",
      details: { fragments },
    },
    message,
    venue,
    scene,
    modern,
  );
const speech = (source: any, zoneIds = ["common"], reach = "directed") => ({ source, kind: "speech", reach, zoneIds });
const text = (value: string, occurrence = 0) => ({ text: value, occurrence });
const message =
  "I call through the doorway, “Hello Buster, are you awake?” I adjust my sleeve. “I wanted to ask about tourism.”";
const quotes = attentionQuotes(message);
assert.equal(quotes.length, 2);
const plan = parse(
  message,
  quotes.map((quote) => speech({ quoteId: quote.id })),
);
assert.equal(plan.status, "attention");
assert.deepEqual(
  plan.fragments.map((fragment) => message.slice(fragment.start, fragment.end)),
  ["Hello Buster, are you awake?", "I wanted to ask about tourism."],
);
assert(!plan.fragments.some((fragment) => message.slice(fragment.start, fragment.end).includes("sleeve")));
assert.equal(parse(message, [speech(text("Hello Buster"))]).status, "clarify", "never expand clipped quotations");
assert.equal(parse(message, [speech({ quoteId: "q99" })]).status, "clarify");
assert.equal(
  parse(message, [
    { start: quotes[0].start, end: quotes[0].end, kind: "speech", reach: "directed", zoneIds: ["common"] },
  ]).status,
  "clarify",
  "new proposals cannot supply offsets",
);
const unquoted = "I call through the doorway: Buster, can you hear me? I straighten my jacket.";
const audible = "Buster, can you hear me?";
assert.equal(parse(unquoted, [speech(text(audible))]).status, "attention");
assert.equal(attentionSourceSpan(text("ell"), "Hello"), undefined, "cannot select inside words");
assert.deepEqual(attentionSourceSpan(text("Hello", 1), "Hello. Hello."), { start: 7, end: 12 });
assert.equal(attentionSourceSpan({ text: "Hello" }, "Hello. Hello."), undefined, "occurrence must be explicit");
assert.equal(attentionSourceSpan(text("Hello", 2), "Hello. Hello."), undefined);
assert.equal(
  parse("I whisper “My secret” to Ada.", [speech({ quoteId: "q0" })]).status,
  "clarify",
  "private speech cannot be granted remote witnesses",
);
assert.equal(
  parse("I would knock tomorrow", [
    { source: text("I would knock tomorrow"), kind: "sound", reach: "directed", zoneIds: ["common"] },
  ]).status,
  "clarify",
);
assert.equal(
  parse(message, [speech({ quoteId: "q0" }, ["private"])]).status,
  "clarify",
  "a two-hop bedroom is outside reach",
);
assert.equal(
  parse(message, [speech({ quoteId: "q0" }), speech({ quoteId: "q0" })]).status,
  "clarify",
  "overlapping sources rejected",
);
assert.equal(
  parse(
    message,
    Array.from({ length: 5 }, () => speech({ quoteId: "q0" })),
  ).status,
  "clarify",
  "bounded four-fragment limit",
);
const shout = "I shout toward Buster, “Can everyone nearby hear me?”";
const loud = parse(shout, [
  { ...speech({ quoteId: "q0" }, ["common", "workshop"], "broadcast"), deliverySource: text("I shout toward Buster") },
]);
assert.equal(loud.status, "attention");
assert.deepEqual(loud.fragments[0].zoneIds, ["common", "workshop"]);
assert.equal(
  parse("I say “Hello.”", [speech({ quoteId: "q0" }, [], "broadcast")]).status,
  "clarify",
  "ordinary speech cannot become broadcast",
);
assert.equal(
  parse(shout, [{ start: 24, end: 53, kind: "speech", reach: "broadcast", zoneIds: ["common"] }], "attention", false)
    .status,
  "clarify",
  "legacy protocol retains its speech restrictions",
);
const bound = bindAttentionPlan(loud, shout, venue, scene, true);
assert.equal(bound.validation?.version, 2);
assert(validAttentionPlan(bound, shout, venue, scene));
const stale = structuredClone(scene);
stale.departedIds = ["buster"];
assert(!validAttentionPlan(bound, shout, venue, stale));
const pending = coercePendingAttention({
  id: "choice",
  message: shout,
  revision: 0,
  originZoneId: "exterior",
  plan: { ...bound, status: "clarify" },
  choices: [],
});
assert.equal(pending?.plan.validation?.version, 2);
assert.equal(parse("I call “Hello”", [speech({ quoteId: "q0" }, [])], "clarify").status, "clarify");
assert(
  directAttention('"Thank you."', venue, scene)?.status === "attention",
  "existing zero-call quotation shortcut retained",
);
assert.equal(
  directAttention("I knock.", venue, scene)?.status,
  "clarify",
  "ambiguous standalone knock needs only a destination choice",
);
const ordinary = attentionCheck("Hello", venue, scene, false, true);
assert(decisionCandidates(ordinary), "simple complete contexts retain Decisions eligibility");
assert.equal(
  decisionCandidates(attentionCheck(shout, venue, scene, false, true)),
  null,
  "loud extraction skips a speculative Decision",
);
const history: any[] = [];
for (let index = 0; index < 4; index++)
  history.push(
    {
      id: "u" + index,
      role: "user",
      speakerId: "",
      name: "Player",
      content: "Earlier question " + index,
      kind: "speech",
    },
    {
      id: "a" + index,
      role: "assistant",
      speakerId: "buster",
      name: "Buster",
      content: "Complete reply " + index,
      kind: "dialogue",
    },
  );
const contextual = { ...scene, lines: history };
const check = attentionCheck("Can you explain that?", venue, contextual, false, true);
assert.deepEqual(
  check.evidence.filter((line) => !line.current).map((line) => line.id),
  ["u1", "a1", "u2", "a2", "u3", "a3"],
);
assert.equal((check.facts as any).historyOmitted, true);
assert(interpretationPayload([check]).serialized.length <= 6000);
assert.equal((check.facts as any).openSpeakers[0].name, "Buster");
const oversized = { ...scene, lines: history.map((line) => ({ ...line, content: "x".repeat(7000) })) };
const bounded = attentionCheck("Can you explain that?", venue, oversized, false, true);
assert.equal(bounded.evidence.length, 1, "oversized whole exchanges are omitted, never clipped");
assert.equal((bounded.facts as any).historyOmitted, true);
assert.equal(decisionCandidates(bounded), null);
const noRoute = { ...contextual, doorwayContacts: [] };
const selfContained = attentionCheck("Hello", venue, noRoute, false, true);
assert.equal(selfContained.evidence.length, 1, "self-contained input does not buy extra history tokens");
const old = attentionCheck("Hello", venue, noRoute);
assert(
  interpretationPayload([selfContained]).serialized.length <= 6000,
  "current request stays within existing evidence allowance",
);
const current = "x".repeat(7000);
assert.equal(
  attentionCheck(current, venue, scene, false, true).evidence.at(-1)?.content,
  current,
  "never shorten current input to force dispatch",
);

const context = {
  ...scene,
  contactGeneration: {
    attention: loud,
    localIds: ["local"],
    remoteIds: ["buster", "other"],
    replyAudiences: { buster: ["buster", "local"], other: ["other", "local"] },
  },
};
const reply: any = {
  heardPlayerBy: ["local", "buster"],
  lines: [{ kind: "dialogue", speakerId: "buster", content: "Yes!", heardBy: ["buster", "local"] }],
};
applyAttentionWitnesses(
  { attentionWitnesses: [{ id: "attention:0", emitted: true, heardBy: ["buster", "other"] }] },
  context,
  shout,
  reply,
);
assert.deepEqual(reply.heardPlayerBy, ["local"]);
assert.equal(reply.lines[1].content, "Can everyone nearby hear me?");
assert.deepEqual(reply.lines[1].heardBy, ["buster", "other"]);
assert.throws(
  () =>
    applyAttentionWitnesses(
      { attentionWitnesses: [{ id: "attention:0", emitted: true, heardBy: ["hidden"] }] },
      context,
      shout,
      { heardPlayerBy: [], lines: [] },
    ),
  /adjacent audience/,
);
assert.throws(
  () =>
    applyAttentionWitnesses(
      { attentionWitnesses: [{ id: "attention:0", emitted: false, heardBy: [] }] },
      context,
      shout,
      { heardPlayerBy: [], lines: [{ kind: "dialogue", speakerId: "buster", content: "I heard you", heardBy: [] }] },
    ),
  /without hearing/,
);
console.log(
  JSON.stringify({
    currentPayload: interpretationPayload([selfContained]).serialized.length,
    legacyPayload: interpretationPayload([old]).serialized.length,
    contextualPayload: interpretationPayload([check]).serialized.length,
  }),
);
console.log("Exact quoted/unquoted sources, contextual budgets, adjacent broadcast and witness restrictions passed.");

const suffix = '"Can everyone hear me?" I shout toward the doorway.';
assert.equal(
  parse(suffix, [
    { ...speech({ quoteId: "q0" }, [], "broadcast"), deliverySource: text("I shout toward the doorway.") },
  ]).status,
  "attention",
);
for (const utterance of [
  "I will be there in five minutes.",
  "I don't know.",
  "Earlier, I spoke to Ada.",
  "I would like some tea.",
]) {
  for (const quoted of [true, false]) {
    const input = quoted
      ? 'I call through the doorway: "' + utterance + '"'
      : "I call through the doorway: " + utterance;
    assert.equal(
      parse(input, [speech(quoted ? { quoteId: "q0" } : text(utterance))]).status,
      "attention",
      "audible speech can express plans/negations",
    );
  }
}

let systemCalls = 0;
let emptyResponse = false;
const system = createSystemInterpretation({
  villagesConnectionIdFor: async () => undefined,
  villagesLanguageModels: () => ({
    resolveForRequest: async () => ({
      maxOutputTokens: 4096,
      fitContext: (messages: any[], options: any) => ({ messages, ...options }),
    }),
  }),
  completeWithRoom: async (_resolved: any, messages: any[], maxTokens: number, options: any) => {
    systemCalls++;
    assert.equal(maxTokens, 1024);
    assert.equal(options.retryEmpty, false);
    const payload = JSON.parse(messages[1].content);
    assert(messages[1].content.length <= 6000);
    assert(payload.checks[0].outcomes.some((option: any) => option.id === "attention"));
    return {
      finishReason: "stop",
      content: emptyResponse
        ? ""
        : JSON.stringify({
            results: [
              {
                id: "attention",
                outcome: "attention",
                evidenceIds: ["player-input"],
                reason: "Labeled current unquoted call",
                details: { fragments: [speech(text("Buster can you hear me"))] },
              },
            ],
          }),
    };
  },
} as any);
const shortInput = "Buster can you hear me";
const shortCheck = attentionCheck(shortInput, venue, scene, false, true);
assert.equal(shortCheck.decisionEligible, true);
const systemResult = await system.systemInterpretations([shortCheck]);
assert.equal(systemCalls, 1);
assert.equal(systemResult[0].failure, undefined, "System accepts source extraction for simple input");
assert.equal(parse(shortInput, (systemResult[0].details as any).fragments).status, "attention");
await system.systemInterpretations([attentionCheck("x".repeat(7000), venue, scene, false, true)]);
assert.equal(systemCalls, 1, "oversized evidence stops before provider dispatch");
emptyResponse = true;
await system.systemInterpretations([shortCheck]);
assert.equal(systemCalls, 2, "empty extraction does not purchase an automatic repair");
const splitShout = 'I shout, "Hello!" I wave across the courtyard and then take a long breath. "Can everyone hear me?"';
assert.equal(
  parse(
    splitShout,
    attentionQuotes(splitShout).map((quote) => ({
      ...speech({ quoteId: quote.id }, [], "broadcast"),
      deliverySource: text("I shout"),
    })),
  ).status,
  "attention",
);

let trimmedBoundary = false;
for (let size = 1200; size < 2400; size += 5) {
  const near = {
    ...scene,
    lines: [{ id: "boundary", role: "user", speakerId: "", name: "Player", kind: "speech", content: "x".repeat(size) }],
  };
  const selected = attentionCheck("Can you explain that?", venue, near, false, true);
  assert(
    interpretationPayload([sourceAttentionSystemCheck(selected)]).serialized.length <= 6000,
    "history fits actual System shape including extraction outcome",
  );
  if (selected.evidence.length === 1) trimmedBoundary = true;
}
assert(trimmedBoundary, "near-limit history is omitted whole instead of failing provider preflight");
