import { foundingTaskRevision } from "../packages/villages/src/server/domain/rules/founding-tasks.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import assert from "node:assert/strict";
import {
  foundingIdentity,
  foundingRequestMessages,
  ROUTINE_INSTRUCTIONS,
  WISH_INSTRUCTIONS,
} from "../packages/villages/src/server/domain/rules/founding-requests.js";
import {
  parseCompactFounding,
  parseCompactFoundingCompletion,
} from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import { coerceFoundingTasks } from "../packages/villages/src/server/domain/rules/founding-tasks.js";
const card = {
  id: "feddy-fixture",
  name: "Synthetic resident",
  summary: "A nonhuman resident",
  description: "IDENTITY-" + "d".repeat(750),
  personality: "Reserved",
  systemPrompt: "AUTHOR-SYSTEM",
  backstory: "AUTHOR-BACKSTORY",
  appearance: "AUTHOR-APPEARANCE",
  scenario: "AUTHOR-SCENARIO",
  exampleDialogue: "AUTHOR-DIALOGUE",
  postHistoryInstructions: "AUTHOR-POST",
  admission: {
    homeworld: "Othiras",
    startingSituation: "AUTHOR-CIRCUMSTANCES",
  },
} as const;
const context = {
  contractVersion: 1 as const,
  semanticVersion: 2 as const,
  village: "The place",
  setting: "A converted complex shared by residents.",
  home: "A small assigned room",
  card,
  venues: [],
  lore: [],
  activeWishes: [],
  completedWishes: [],
  schedule: null,
};
assert(ROUTINE_INSTRUCTIONS.length <= 1600);
assert(WISH_INSTRUCTIONS.length <= 1800);
for (const task of ["routine", "wish"] as const) {
  const messages = foundingRequestMessages(context, task),
    data = JSON.parse(messages[1].content as string);
  assert.deepEqual(data.identity, foundingIdentity(card), "authored identity is preserved in full");
  assert((messages[0].content as string).toLowerCase().includes("json"));
  assert(messages.reduce((n, row) => n + (row.content as string).length, 0) <= (task === "routine" ? 6000 : 6500));
  assert.equal((JSON.stringify(messages).match(/AUTHOR-BACKSTORY/g) ?? []).length, 1, "identity is supplied once");
}
const long = foundingRequestMessages({ ...context, card: { ...card, description: "d".repeat(40000) } }, "routine");
assert.equal(
  JSON.parse(long[1].content as string).identity.description.length,
  40000,
  "prompt size targets never truncate authored identity",
);
const palette = Array.from({ length: 6 }, (_, i) => ({
  activity: "Activity " + i,
  venue: 0,
  flexible: true,
  essential: false,
  duration: 60,
  parts: [0, 1, 2, 3],
}));
const payload = {
  routine: "A varied daily rhythm",
  palette,
  days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
  rhythm: [],
};
assert.equal(parseCompactFounding(payload, context).agenda.wishes.length, 0);
assert.equal(
  parseCompactFounding({ ...payload, days: Array.from({ length: 7 }, () => [0, 1, 2, 3]) }, context).agenda
    .routineProfile!.days[0].length,
  8,
);
assert.equal(
  parseCompactFounding(
    { ...payload, days: Array.from({ length: 7 }, () => [0, 1, 2, 3]) },
    { ...context, contractVersion: undefined },
  ).agenda.routineProfile!.days[0].length,
  8,
  "legacy dayparts remain recoverable",
);
const task = {
  contract: 1,
  revision: "source",
  jobId: "private-slot",
  status: "completed",
  attempt: 1,
  error: "",
  receipt: "source",
  prompt: "SECRET",
  reply: "SECRET",
};
assert(!JSON.stringify(coerceFoundingTasks({ resident: { routine: task } })).includes("SECRET"));
console.log("Founding request budgets, full identity, explicit Routine contract and safe receipts passed.");

const state = coerceVillageState({
  seed: "revision-fixture",
  setting: "Shared place",
  villagers: [
    {
      characterId: "a",
      cardSnapshot: {
        id: "a",
        name: "A",
        description: "D",
        revision: 1,
        sourceStatus: "available",
        capturedAt: "2026-10-18T12:00:00.000Z",
      },
    },
  ],
  venues: [{ id: "hall", name: "Hall" }],
});
const before = foundingTaskRevision(state, "a", "routine");
state.venues[0].state.condition = "Changed condition";
assert.notEqual(foundingTaskRevision(state, "a", "routine"), before, "place conditions fence stale responses");
const facts = foundingTaskRevision(state, "a", "routine");
state.venues[0].state.publicFacts = ["A new verified fact"];
assert.notEqual(foundingTaskRevision(state, "a", "routine"), facts);
const identity = foundingTaskRevision(state, "a", "routine");
state.villagers[0].cardSnapshot.backstory = "Changed authored history";
assert.notEqual(
  foundingTaskRevision(state, "a", "routine"),
  identity,
  "full authored source participates in ownership",
);

const presentation = foundingTaskRevision(state, "a", "routine");
state.villagers[0].cardSnapshot.nameColor = "#abcdef";
assert.equal(
  foundingTaskRevision(state, "a", "routine"),
  presentation,
  "presentation normalization is not an authored identity edit",
);

const ingredients = {
  ...payload,
  days: undefined,
  palette: palette.map((row) => ({ ...row, parts: [0, 1, 2, 3] })),
  rhythm: [{ startMinute: 1320, endMinute: 360, activity: 0 }],
};
const compiled = parseCompactFounding(ingredients, { ...context, contractVersion: 2 });
assert.deepEqual(
  compiled.agenda.routineProfile!.days,
  parseCompactFounding(ingredients, { ...context, contractVersion: 2 }).agenda.routineProfile!.days,
);
assert.equal(compiled.agenda.routineProfile!.days.length, 7);
for (const blocks of Object.values(compiled.agenda.week!)) {
  assert.equal(blocks[0].startMinute, 0);
  assert.equal(blocks.at(-1)!.endMinute, 1440);
  for (let i = 1; i < blocks.length; i++) assert.equal(blocks[i].startMinute, blocks[i - 1].endMinute);
}
assert.throws(
  () =>
    parseCompactFounding(
      { ...ingredients, palette: ingredients.palette.map((row) => ({ ...row, parts: [0] })) },
      { ...context, contractVersion: 2 },
    ),
  /every daypart/,
);

const weekdayIngredients = {
  ...ingredients,
  palette: ingredients.palette.map((row, index) => ({ ...row, weekdays: index < 3 ? [0] : [1, 2, 3, 4, 5, 6] })),
};
const weekdays = parseCompactFounding(weekdayIngredients, { ...context, contractVersion: 2 }).agenda.routineProfile!
  .days;
assert(
  weekdays[0].every((index) => index < 3),
  "Monday choices preserve resident weekday preferences",
);
assert(
  weekdays.slice(1).every((day) => day.every((index) => index >= 3)),
  "Other weekdays use their own allowed activities",
);
assert.throws(
  () =>
    parseCompactFounding(
      { ...ingredients, palette: ingredients.palette.map((row) => ({ ...row, weekdays: [7] })) },
      { ...context, contractVersion: 2 },
    ),
  /weekday/,
);

assert.throws(
  () =>
    parseCompactFounding(
      {
        ...ingredients,
        palette: ingredients.palette.map((row, index) => (index === 0 ? { ...row, duration: 360 } : row)),
      },
      { ...context, contractVersion: 2 },
    ),
  /Routine activity 1 duration 360; expected 30–240 minutes/,
);

const withDescription = { ...context, identityDescriptionRevision: "first-adoption" };
for (const invalid of [
  undefined,
  null,
  "",
  "x".repeat(241),
  "Two sentences. Another sentence.",
  "- A bullet.",
  "A line.\nAnother line.",
]) {
  const parsed = parseCompactFounding({ ...payload, identityDescription: invalid }, withDescription);
  assert.equal(parsed.identityDescription, "");
  assert(parsed.agenda.routineProfile);
}
const sentence = "An adventurous bird anthro who favors a low-tech way of life.";
assert.equal(
  parseCompactFounding({ ...payload, identityDescription: sentence }, withDescription).identityDescription,
  sentence,
);
const savedReply = { content: JSON.stringify({ ...payload, identityDescription: sentence }), finishReason: "stop" };
assert.equal(parseCompactFoundingCompletion(savedReply as any, withDescription).identityDescription, sentence);
assert.equal(
  parseCompactFounding({ ...payload, identityDescription: sentence }, context).identityDescription,
  undefined,
);
