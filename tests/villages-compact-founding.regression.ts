import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { routineDay } from "../packages/villages/src/server/domain/rules/owned-routine.js";
import assert from "node:assert/strict";
import {
  foundingNativeActivities,
  parseCompactFounding,
  parseCompactFoundingCompletion,
} from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import { createCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact-service.js";
import { proposeCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";

const card = {
  id: "a",
  name: "Ada",
  summary: "A patient gardener",
  personality: "Kind",
  tags: [],
  description: "Grows herbs",
};
const days = Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]);
const palette = [
  "Tending the herb beds",
  "Reading at home",
  "Walking in the village",
  "Preparing lunch",
  "Sharing garden advice",
  "Resting at home",
].map((activity) => ({ activity, venue: 0, status: "idle" }));
const payload = (count: number) => ({
  routine: "Ada tends herbs and spends quiet time at home.",
  wishes: [{ wish: "A new watering can", intensity: 1, tell: "She checks the old one for leaks" }],
  palette,
  days,
  rhythm: [],
  native: Array.from({ length: count }, () => 0),
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
  completedWishes: [],
  activeWishes: [],
  schedule: native,
});

// A single choice per daypart is complete and normalizes without inventing choices.
{
  const answer = {
    ...payload(0),
    wishes: [],
    palette: palette.map((row) => ({ ...row, duration: 90, flexible: false, essential: true, parts: [0, 1, 2, 3] })),
    days: Array.from({ length: 7 }, () => [0, 1, 2, 3]),
  };
  const contextV1 = { ...context(null), contractVersion: 1 as const, allowInitialWish: false };
  assert.deepEqual(parseCompactFounding(answer, contextV1).agenda.routineProfile!.days[0], [0, 0, 1, 1, 2, 2, 3, 3]);
  for (const invalid of [
    [0, 1, 2],
    [0, 1, 2, 99],
  ])
    assert.throws(
      () => parseCompactFounding({ ...answer, days: [invalid, ...answer.days.slice(1)] }, contextV1),
      /complete seven-day/,
    );
}
// Ordinary activity bounds do not limit fixed overnight rest windows.
for (const endMinute of [360, 480]) {
  const answer = {
    ...payload(0),
    wishes: [],
    palette: palette.map((row) => ({ ...row, duration: 90, flexible: false, essential: true, parts: [0, 1, 2, 3] })),
    rhythm: [{ startMinute: 0, endMinute, activity: 0 }],
  };
  const strictContext = { ...context(null), contractVersion: 1 as const, allowInitialWish: false };
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

async function openingIdeaShapes() {
  const proposal = {
    name: "Pavilion garden",
    description: "A small garden along the entrance.",
    situation: "The paved entrance has little shade.",
    venueClass: "community",
    established: false,
    provenance: ["The entrance is paved.", "The park has local gardeners."],
    work: "Coordinate a planting day.",
    firstUse: "Visitors enjoy the planting.",
  };
  const renovation = { venueId: "hall", spaceId: "garden", title: "Garden", description: "Low shrubs." };
  let answer: unknown;
  let calls = 0;
  const requestKeys: string[] = [];
  const model = { maxOutputTokens: 1536, fitContext: (messages: unknown) => ({ messages, maxTokens: 1536 }) };
  const service = createCompactFounding({
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
    villagesConnectionIdFor: async () => "system",
    completeWithRoom: async (_model: unknown, _messages: unknown, _tokens: unknown, options: any) => {
      calls++;
      requestKeys.push(options.savedRequest.key);
      const completion = { content: JSON.stringify(answer), finishReason: "stop" };
      assert.equal(
        options.savedRequest.valid(completion),
        true,
        "the purchased response is usable without replacement",
      );
      return completion;
    },
  } as any);
  const openingContext = {
    ...context(null),
    openingVersion: 2,
    venues: [
      {
        id: "hall",
        name: "Pavilion",
        classes: ["community"],
        occupancy: {},
        state: { condition: "Open", publicFacts: [] },
        zones: [
          { id: "exterior", name: "Entrance", kind: "exterior", state: { condition: "", features: [] } },
          {
            id: "garden",
            name: "Garden",
            kind: "public",
            venueClass: "community",
            description: "A garden.",
            state: { condition: "Paved", features: [] },
          },
        ],
      },
    ],
  } as any;
  for (const kind of ["new-venue", "renovation"] as const) {
    answer = { openingProposal: proposal, kind, ...(kind === "renovation" ? { renovation } : {}) };
    const parsed = await service.proposeOpeningIdea(openingContext, kind, false);
    assert.equal(parsed.kind, kind);
    assert.equal(parsed.provenance, proposal.provenance.join("\n"));
    if (kind === "renovation") {
      assert.equal(parsed.renovation?.venueId, renovation.venueId);
      assert.match(parsed.renovation?.sourceFingerprint ?? "", /^[a-f0-9]{64}$/u);
    }
  }
  assert.equal(calls, 2, "normalizing each response needs only its original request");
  assert.deepEqual(
    requestKeys,
    ["new-venue:format:2", "renovation:format:2"],
    "the corrected prompt uses new identities without overwriting earlier paid receipts",
  );
}
async function main() {
  await openingIdeaShapes();
  const unscheduled = parseCompactFounding(payload(0), context(null) as any);
  assert.equal(unscheduled.agenda.wishes.length, 1);
  assert.equal(Object.keys(unscheduled.agenda.week ?? {}).length, 7);
  for (const weekday of VILLAGE_WEEKDAYS) {
    const blocks = unscheduled.agenda.week![weekday]!;
    assert.equal(blocks[0]!.startMinute, 0);
    assert.equal(blocks.at(-1)!.endMinute, 1440);
    assert.ok(blocks.some((block) => block.activity === "Tending the herb beds"));
  }
  const compactDayparts = {
    ...payload(0),
    days: Array.from({ length: 7 }, () => [0, 1, 2, 3]),
    wishes: [
      {
        wish: "An engraved keepsake",
        intensity: 2,
        neutralWording: true,
        criteria: { kind: "action", requiresPhysical: true, predicate: "item-added", itemName: "engraved keepsake" },
      },
    ],
  };
  const semanticContext = { ...context(null), semanticVersion: 2 } as any;
  const savedResponse = { content: JSON.stringify(compactDayparts), finishReason: "stop" };
  const recovered = parseCompactFoundingCompletion(savedResponse, semanticContext).agenda;
  assert.deepEqual(
    recovered.routineProfile!.days,
    Array.from({ length: 7 }, () => [0, 0, 1, 1, 2, 2, 3, 3]),
    "one supplied option per daypart normalizes without inventing an activity or changing its daypart",
  );
  assert.equal(recovered.wishes[0]!.semanticCriteria!.target, "engraved keepsake");
  assert.deepEqual(
    JSON.parse(savedResponse.content),
    compactDayparts,
    "local recovery preserves the purchased response",
  );
  assert.deepEqual(
    parseCompactFounding({ ...payload(0), wishes: [] }, semanticContext).agenda.routineProfile!.days,
    days,
    "existing eight-choice plans retain every supplied alternative",
  );
  for (const invalid of [[], [0, 1, 2], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5, 0], [0, 1, 2, 99], [0, 1, 2, "3"]])
    assert.throws(
      () =>
        parseCompactFounding(
          { ...compactDayparts, days: [invalid, ...compactDayparts.days.slice(1)] },
          semanticContext,
        ),
      /seven-day/,
    );
  assert.throws(
    () => parseCompactFounding({ ...compactDayparts, days: compactDayparts.days.slice(1) }, semanticContext),
    /seven-day/,
  );
  assert.throws(
    () => parseCompactFoundingCompletion({ ...savedResponse, finishReason: "length" }, semanticContext),
    /truncated/,
  );

  for (const count of [50, 111]) {
    const native = schedule(count, count === 111);
    const unique = foundingNativeActivities(native);
    assert.equal(unique.length, count === 111 ? 111 : 1);
    const result = parseCompactFounding(payload(unique.length), context(native) as any);
    assert.equal(result.moves.length, 0, "native schedules are not translated");
  }
  assert.throws(() => parseCompactFounding({ ...payload(0), days: [] }, context(null) as any), /seven-day/);
  assert.equal(
    parseCompactFounding({ ...payload(0), wishes: [] }, context(null) as any).agenda.wishes.length,
    0,
    "a quiet founding day needs no wish",
  );
  assert.equal(
    parseCompactFounding(payload(0), { ...context(null), allowInitialWish: false } as any).agenda.wishes.length,
    0,
    "an interrupted preparation retry cannot replenish its initial wish",
  );
  assert.throws(() => parseCompactFounding({ ...payload(0), rhythm: undefined }, context(null) as any), /rest windows/);

  for (const wish of ["You want company", "Repair my chair"])
    assert.throws(() => parseCompactFounding({ ...payload(0), wishes: [{ wish }] }, context(null) as any), /neutrally/);

  let calls = 0;
  let capturedPrompt = "";
  let options: Record<string, unknown> = {};
  let answer = payload(0);
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
      answer = payload(native ? foundingNativeActivities(native).length : 0);
      const before = calls;
      await proposeCompactFounding(context(native) as any, async () => {});
      assert.equal(calls, before + 1, "one package-level request handles this villager's full founding plan");
    }
    for (const playerBackground of ["", "I arrived to help the harbor."]) {
      const roleContext = { ...context(null), setting: "S".repeat(4000), playerBackground, playerPersonaName: "Robin" };
      const before = calls;
      answer = payload(0);
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

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
