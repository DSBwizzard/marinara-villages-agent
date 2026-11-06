import assert from "node:assert/strict";
import {
  parseCompactFounding,
  parseCompactFoundingCompletion,
} from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import { routineDay } from "../packages/villages/src/server/domain/rules/owned-routine.js";
import { proposeCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";

const card = {
  id: "a",
  name: "Ada",
  summary: "A patient gardener",
  personality: "Kind",
  tags: [],
  description: "Grows herbs",
};
const palette = [
  "Tending the herb beds",
  "Reading at home",
  "Walking in the village",
  "Preparing lunch",
  "Sharing garden advice",
  "Resting at home",
].map((activity) => ({ activity, venue: 0, duration: 90, flexible: true, essential: false, parts: [0, 1, 2, 3] }));
const payload = () => ({
  routine: "Ada tends herbs and spends quiet time at home.",
  wishes: [{ wish: "A new watering can", intensity: 1, tell: "She checks the old one for leaks" }],
  palette,
  rhythm: [],
});
const schedule = (count: number, unique: boolean) => ({
  characterId: "a",
  weekStart: "2026-09-28",
  routineSummary: "",
  talkativeness: null,
  days: Object.fromEntries(
    VILLAGE_WEEKDAYS.map((day, index) => [
      day,
      Array.from({ length: Math.min(16, Math.max(0, count - index * 16)) }, (_, slot) => ({
        time: `${String(slot).padStart(2, "0")}:00-${String(slot + 1).padStart(2, "0")}:00`,
        activity: unique ? `Native activity ${index * 16 + slot}` : "Tending the remote starship",
        status: slot % 2 ? "dnd" : "online",
      })),
    ]),
  ),
});
const context = (native: ReturnType<typeof schedule> | null) => ({
  village: "Willow",
  setting: "A quiet valley",
  home: "Cottage",
  card,
  venues: [],
  lore: ["Bridge: The bridge is old."],
  wishes: [],
  activeWishes: [],
  schedule: native,
});

// Code builds complete days from allowed dayparts; missing coverage is rejected.
{
  const answer = payload();
  assert.equal(parseCompactFounding(answer, context(null)).agenda.routineProfile!.days[0].length, 8);
  assert.throws(
    () => parseCompactFounding({ ...answer, palette: palette.map((row) => ({ ...row, parts: [0] })) }, context(null)),
    /cover every daypart/,
  );
}
// Ordinary activity bounds do not limit fixed overnight rest windows.
for (const endMinute of [360, 480]) {
  const answer = {
    ...payload(),
    wishes: [],
    palette: palette.map((row) => ({ ...row, duration: 90, flexible: false, essential: true, parts: [0, 1, 2, 3] })),
    rhythm: [{ startMinute: 0, endMinute, activity: 0 }],
  };
  const strictContext = context(null);
  const profile = parseCompactFounding(answer, strictContext).agenda.routineProfile!;
  const day = routineDay(profile, "a", new Date(2026, 0, 5, 12));
  assert.equal(day[0].startMinute, 0);
  assert.equal(day[0].endMinute, endMinute);
  answer.palette[0].duration = 360;
  assert.throws(
    () => parseCompactFounding(answer, strictContext),
    /Routine activity 1 .*duration 360; expected 30–240 minutes/,
  );
}

async function main() {
  const unscheduled = parseCompactFounding(payload(), context(null) as any);
  assert.equal(Object.hasOwn(unscheduled, "wishes"), false, "Routine output cannot establish a desire");
  assert.equal(Object.keys(unscheduled.agenda.week ?? {}).length, 7);
  for (const weekday of VILLAGE_WEEKDAYS) {
    const blocks = unscheduled.agenda.week![weekday]!;
    assert.equal(blocks[0]!.startMinute, 0);
    assert.equal(blocks.at(-1)!.endMinute, 1440);
    assert.ok(blocks.some((block) => block.activity === "Tending the herb beds"));
  }
  const currentPayload = payload();
  const savedResponse = { content: JSON.stringify(currentPayload), finishReason: "stop" };
  const recovered = parseCompactFoundingCompletion(savedResponse, context(null)).agenda;
  assert.equal(recovered.routineProfile!.days.length, 7);
  assert.ok(recovered.routineProfile!.days.every((day) => day.length === 8));
  assert.deepEqual(
    JSON.parse(savedResponse.content),
    currentPayload,
    "Recovery leaves the purchased response unchanged",
  );
  assert.throws(
    () => parseCompactFoundingCompletion({ ...savedResponse, finishReason: "length" }, context(null)),
    /truncated/,
  );

  assert.throws(() => parseCompactFounding({ ...payload(), rhythm: undefined }, context(null) as any), /rest windows/);

  let calls = 0;
  let capturedPrompt = "";
  let options: Record<string, unknown> = {};
  let answer = payload();
  let usageDocument: any = null;
  const release = configureVillagesRuntime({
    isDebugAgentsEnabled: () => false,
    getAgentConfig: async () => ({ connectionId: "flash-class" }),
    persistence: {
      documents: villageFixtureDocuments({
        getById: async () => structuredClone(usageDocument),
        create: async (input: any) => {
          assert.equal(usageDocument, null);
          usageDocument = { ...structuredClone(input), revision: 1 };
          return structuredClone(usageDocument);
        },
        update: async (input: any) => {
          assert.equal(input.expectedRevision, usageDocument.revision);
          usageDocument = { ...structuredClone(input), revision: usageDocument.revision + 1 };
          return structuredClone(usageDocument);
        },
      }),
    },
    languageModels: {
      resolveForRequest: async () => ({
        name: "Flash-class test model",
        maxOutputTokens: 4_000,
        fitContext: (messages: unknown[], options: any) => ({
          messages,
          maxTokens: options.maxTokens,
          estimatedTokensAfter: 900,
        }),
        chatComplete: async (_messages: unknown[], next: Record<string, unknown>) => {
          calls += 1;
          capturedPrompt = _messages.map((message: any) => message.content).join("\n");
          options = next;
          return {
            content: JSON.stringify(answer),
            finishReason: "stop",
            usage: { promptTokens: 900, completionTokens: 500 },
          };
        },
      }),
    },
  } as any);
  try {
    for (const [native, _count] of [
      [null, 0],
      [schedule(50, false), 50],
      [schedule(111, true), 111],
    ] as const) {
      answer = payload();
      const before = calls;
      await proposeCompactFounding(context(native) as any, async () => {});
      assert.equal(calls, before + 1, "one package-level request handles this villager's full founding plan");
    }
    for (const playerBackground of ["", "I arrived to help the harbor."]) {
      const roleContext = { ...context(null), setting: "S".repeat(4000), playerBackground, playerPersonaName: "Robin" };
      const before = calls;
      answer = payload();
      await proposeCompactFounding(roleContext as any, async () => {});
      assert.ok(
        capturedPrompt.includes(JSON.stringify({ name: "Robin", startingBackground: playerBackground })),
        "the role is separate from truncated scenery",
      );
      assert.equal(calls, before + 1, "role context adds no generation call");
    }
    assert.match(capturedPrompt, /Omit Wishes/);
    assert.match(capturedPrompt, /30 to 240 inclusive/);
    assert.match(capturedPrompt, /independently of palette duration/);
    assert.doesNotMatch(
      capturedPrompt,
      /chocolate|identifying a tune|stuck in their head|borrowing a pencil|repair a favorite chair|arrange a picnic|perform a song|"activity":"reading"/,
    );
    assert.equal(usageDocument.data.requests.length, calls, "every founding request is accounted for");
    assert.ok(usageDocument.data.requests.every((request: any) => request.status === "complete"));
    assert.equal(options.maxTokens, 2048);
    assert.equal(options.reasoningEffort, "none");
  } finally {
    release();
  }
  console.log("Villages compact founding regressions passed.");
}

await main();
