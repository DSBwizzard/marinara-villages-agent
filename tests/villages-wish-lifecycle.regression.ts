import {
  startBackgroundWork,
  settleBackgroundWork,
  villageBackgroundPresence,
  backgroundWorkSummaries,
  retryBackgroundJob,
} from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";
import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  coerceVillageState,
  readVillageState,
  mutateVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  workingAgendaWeek,
  agendaBlocksFor,
} from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-week.js";
import { coerceWish } from "../packages/villages/src/engine/packages/server/src/services/villages/prompt-preset.js";
import {
  newWishLifecycle,
  knownNeedBlocked,
  selectWishNeeds,
  rememberWishNeed,
  wishRevision,
  routineRevision,
  recordWishOutcome,
  pruneWishActivities,
  WISH_DAY_MS,
} from "../packages/villages/src/engine/packages/server/src/services/villages/wish-policy.js";
import {
  registerInitialWish,
  reserveInitialWishAllowance,
  reconcileWishLifecycle,
  reserveWishAttempts,
  processWishAttempt,
  fulfillResidentWish,
  expireResidentWishes,
  correctResidentWish,
  wishSlots,
  canApplyWishActivity,
} from "../packages/villages/src/engine/packages/server/src/services/villages/wish-lifecycle.js";
import {
  flushWishOutcomes,
  readWishHistoryPage,
  readWishOutcome,
} from "../packages/villages/src/engine/packages/server/src/services/villages/wish-archive.js";
import { remapSignature } from "../packages/villages/src/engine/packages/server/src/services/villages/native-remap.js";
import {
  coordinateVenue,
  venueOperationSignal,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-coordinator.js";
import type {
  VillageState,
  VillageVenue,
  VillageWish,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";
import type {
  WishActivity,
  WishNeed,
} from "../packages/villages/src/engine/packages/server/src/services/villages/wish-types.js";

type Document = {
  id: string;
  packageId: string;
  kind: string;
  name: string;
  description: string;
  revision: number;
  data: unknown;
  createdAt: string;
  updatedAt: string;
};
const docs = new Map<string, Document>();
let pageFailure = false,
  conflictOnce = false,
  listCalls = 0,
  modelCalls: string[] = [];
let mode: "fresh" | "none" | "repeat" | "uncertain" | "blank" | "throw" | "compare-throw" = "fresh";
let onModel: (() => Promise<void>) | undefined;
let comparisonId = "";
let unavailableGenerationUsage = false;
let debugEnabled = false;
const now = new Date(2026, 8, 30, 8);
function freshWish(
  id: string,
  text = "Fresh flowers",
  policy: "lasting" | "recurring" | "unknown" = "recurring",
): VillageWish {
  return coerceWish(
    {
      wish: text,
      tell: "Looks thoughtfully at the windowsill",
      intensity: 1,
      need: { subject: "flowers", action: "acquire", policy },
    },
    id,
    now.toISOString(),
  )!;
}
let stopBackground: (() => void) | undefined;
function seed(count = 1): VillageState {
  stopBackground?.();
  docs.clear();
  stopBackground = startBackgroundWork();
  void villageBackgroundPresence("wish-tests", true);
  modelCalls = [];
  pageFailure = false;
  conflictOnce = false;
  mode = "fresh";
  unavailableGenerationUsage = false;
  debugEnabled = false;
  onModel = undefined;
  const state = coerceVillageState({
    seed: "wish-test",
    name: "Willow",
    setting: "A quiet village",
    foundedAt: new Date(now.getTime() - 10 * WISH_DAY_MS).toISOString(),
    storyPace: "balanced",
    villagers: Array.from({ length: count }, (_, index) => {
      const id = `r${index}`;
      return {
        characterId: id,
        addedAt: now.toISOString(),
        cardSnapshot: {
          id,
          name: id,
          revision: 1,
          sourceStatus: "available",
          capturedAt: now.toISOString(),
          summary: "A quiet gardener",
          description: "Keeps flowers",
          personality: "Patient",
          tags: [],
        },
        completedWishes: [],
        agenda: {
          wishes: [],
          source: "village",
          generatedAt: now.toISOString(),
          routineSummary: "An ordinary week",
          day: [],
          week: workingAgendaWeek([], `r${index}`),
          personalizationPending: false,
        },
        wishLifecycle: newWishLifecycle(),
      };
    }),
  });
  docs.set("villages-village", {
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    name: "Willow",
    description: "",
    revision: 1,
    data: state,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  });
  return state;
}
const put = (state: VillageState) => {
  const record = docs.get("villages-village")!;
  record.data = structuredClone(state);
  record.revision++;
};
const release = configureVillagesRuntime({
  logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
  isDebugAgentsEnabled: () => debugEnabled,
  getAgentConfig: async () => ({ connectionId: null }),
  persistence: {
    documents: {
      async getById(_packageId: string, id: string) {
        return structuredClone(docs.get(id) ?? null);
      },
      async list(_packageId: string, kind: string) {
        if (kind === "background-work" || kind === "background-connection")
          return [...docs.values()].filter((entry) => entry.kind === kind).map((entry) => structuredClone(entry));
        listCalls++;
        throw new Error("Unpaginated history reads are forbidden");
      },
      async create(input: Omit<Document, "revision">) {
        if (pageFailure && input.kind === "wish-history-page") throw new Error("archive unavailable");
        if (docs.has(input.id)) throw new Error("already exists");
        const record = { ...structuredClone(input), revision: 1 };
        docs.set(input.id, record);
        return structuredClone(record);
      },
      async update(input: Document & { expectedRevision: number }) {
        if (pageFailure && input.id.includes(":page:")) throw new Error("archive unavailable");
        const previous = docs.get(input.id);
        if (!previous || previous.revision !== input.expectedRevision) return null;
        if (conflictOnce && input.id === "villages-village") {
          conflictOnce = false;
          previous.revision++;
          return null;
        }
        const record = { ...previous, ...structuredClone(input), revision: previous.revision + 1 };
        docs.set(input.id, record);
        return structuredClone(record);
      },
    },
  },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "wish-fixture",
        maxOutputTokens: 8192,
        fitContext(messages: unknown[], options: { maxTokens: number }) {
          return { messages, maxTokens: options.maxTokens };
        },
        async chatComplete(messages: { content: string }[]) {
          const prompt = messages.map((message) => message.content).join("\n");
          modelCalls.push(prompt);
          if (onModel) {
            const callback = onModel;
            onModel = undefined;
            await callback();
          }
          if (mode === "throw") throw new Error("provider unavailable");
          if (mode === "blank") return { content: "", finishReason: "length" };
          if (mode === "compare-throw" && prompt.includes("Compare one wish"))
            throw new Error("comparison unavailable");
          if (prompt.includes("Compare one wish"))
            return {
              content: JSON.stringify({
                matchedNeedId: mode === "repeat" ? comparisonId : "",
                certain: mode !== "uncertain",
              }),
              finishReason: "stop",
              usage: { promptTokens: 100, completionTokens: 20 },
            };
          return {
            content: JSON.stringify(
              mode === "none"
                ? { wish: null }
                : {
                    matchedNeedId: mode === "repeat" ? comparisonId : "",
                    certain: mode !== "uncertain",
                    wish: {
                      wish:
                        mode === "repeat"
                          ? "A bright bouquet for the windowsill"
                          : "An hour learning a new garden sketch",
                      tell: "Sets a pencil beside a blank page",
                      intensity: 1,
                      need: { subject: "garden sketch", action: "learn", policy: "recurring" },
                    },
                  },
            ),
            finishReason: "stop",
            ...(unavailableGenerationUsage ? {} : { usage: { promptTokens: 150, completionTokens: 45 } }),
          };
        },
      };
    },
  },
} as any);

async function run() {
  try {
    // Replay and daily fairness are enforced by persistent reservations, not process memory.
    seed(3);
    conflictOnce = true;
    const jobs = await reserveWishAttempts(now);
    assert.equal(jobs.length, 2);
    assert.equal(
      (await reserveWishAttempts(now)).length,
      2,
      "reconciliation resumes existing reservations without minting more",
    );
    await Promise.all(
      jobs.flatMap((job) => [
        processWishAttempt(job.characterId, job.id, now, () => now),
        processWishAttempt(job.characterId, job.id, now, () => now),
      ]),
    );
    assert.equal(modelCalls.length, 2, "concurrent workers spend one request for each empty-history resident");
    let state = await readVillageState();
    assert.equal(state.villagers.filter((resident) => resident.agenda!.wishes.length === 1).length, 2);
    assert.equal(
      (await reserveWishAttempts(now)).length,
      0,
      "the phase's two-resident allowance survives completed jobs",
    );
    const noon = new Date(2026, 8, 30, 13);
    await reconcileWishLifecycle(noon, false, () => noon);
    assert.equal(modelCalls.length, 3, "the deferred resident gets the next phase");
    await reconcileWishLifecycle(noon, false, () => noon);
    assert.equal(modelCalls.length, 3, "no refill loop on repeated reads");
    const nextEarly = new Date(now.getTime() + WISH_DAY_MS - 1);
    assert.equal((await reserveWishAttempts(nextEarly)).length, 0, "24-hour interval is independent of the date");
    const nextDay = new Date(now.getTime() + WISH_DAY_MS);
    await reconcileWishLifecycle(nextDay, false, () => nextDay);
    state = await readVillageState();
    assert.ok(state.villagers.every((resident) => resident.agenda!.wishes.length <= 2));
    const farLater = new Date(now.getTime() + 50 * WISH_DAY_MS);
    await reconcileWishLifecycle(farLater, false, () => farLater);
    assert.ok(
      (await readVillageState()).villagers.every((resident) => resident.agenda!.wishes.length <= 2),
      "absence creates no backlog",
    );
    seed();
    mode = "none";
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes.length, 0);
    await reconcileWishLifecycle(noon, false, () => noon);
    assert.equal(modelCalls.length, 1, "a quiet result spends the daily allowance");
    seed();
    mode = "blank";
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal(modelCalls.length, 1, "empty reasoning output is not retried");
    seed();
    mode = "throw";
    await reconcileWishLifecycle(now, false, () => now);
    await reconcileWishLifecycle(noon, false, () => noon);
    assert.equal(modelCalls.length, 1, "failed attempts are paced");
    assert.equal(
      (await reserveWishAttempts(new Date(now.getTime() - WISH_DAY_MS))).length,
      0,
      "clock rollback cannot mint an allowance",
    );
    seed(6);
    await reconcileWishLifecycle(now, false, () => now);
    await reconcileWishLifecycle(nextDay, false, () => nextDay);
    assert.equal(
      (await reserveWishAttempts(now)).length,
      0,
      "rollback cannot reopen an older phase for deferred residents",
    );
    seed();
    debugEnabled = true;
    await reconcileWishLifecycle(now, false, () => now);
    await reconcileWishLifecycle(noon, false, () => noon);
    assert.equal(modelCalls.length, 1, "debug generation observes the same persisted allowance");
    const initial = seed();
    registerInitialWish(initial.villagers[0]!, now);
    put(initial);
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal(modelCalls.length, 0, "an empty initial wish still consumes today's allowance");
    seed();
    const initialClaims = await Promise.all([
      reserveInitialWishAllowance("r0", now),
      reserveInitialWishAllowance("r0", now),
    ]);
    assert.equal(initialClaims.filter(Boolean).length, 1, "one founding request owns the initial allowance");
    assert.equal(
      await reserveInitialWishAllowance("r0", now),
      undefined,
      "a restart cannot repeat an uncertain initial request",
    );
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal(modelCalls.length, 0);
    seed();
    docs.set("villages-venue-visit-background-wish", {
      id: "villages-venue-visit-background-wish",
      packageId: "villages",
      kind: "venue-visit",
      name: "Visit",
      description: "",
      revision: 1,
      data: { id: "background-wish", status: "active", sceneRevision: 0, lines: [], submissions: [] },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    onModel = async () => {
      assert.equal(
        venueOperationSignal(),
        undefined,
        "background wishes have independent ownership and billing journals",
      );
    };
    await coordinateVenue("background-wish", "wish-integration", "turn", {}, 0, undefined, async () => {
      assert.ok(venueOperationSignal());
      await reconcileWishLifecycle(now, false, () => now);
    });
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes.length, 1);
    assert.deepEqual((docs.get("villages-venue-visit-background-wish")!.data as any).operation.attempts, {});

    // A legacy recorded provider failure becomes retryable, without an automatic daily repair.
    const legacyFailureState = seed();
    registerInitialWish(legacyFailureState.villagers[0]!, new Date(now.getTime() - 2 * WISH_DAY_MS));
    const legacyAttempt = legacyFailureState.villagers[0]!.wishLifecycle!.attempt!;
    legacyAttempt.calls = 1;
    legacyAttempt.reason = "provider unavailable";
    legacyAttempt.revision = wishRevision(legacyFailureState.villagers[0]!, legacyFailureState);
    put(legacyFailureState);
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal(modelCalls.length, 0);
    assert.equal((await backgroundWorkSummaries()).find((entry) => entry.kind === "wish")!.status, "failed");
    await reconcileWishLifecycle(nextDay, false, () => nextDay);
    assert.equal(modelCalls.length, 0, "legacy failures remain blocked across dates");

    // Interrupted provider calls are not silently sent again; persisted candidates and verdicts replay.
    seed();
    let job = (await reserveWishAttempts(now))[0]!;
    await mutateVillageState((live) => {
      live.villagers[0]!.wishLifecycle!.attempt!.calls = 1;
    });
    await processWishAttempt(job.characterId, job.id, now, () => now);
    assert.equal(modelCalls.length, 0);
    assert.match((await backgroundWorkSummaries()).find((entry) => entry.kind === "wish")!.error, /unknown/);
    seed();
    job = (await reserveWishAttempts(now))[0]!;
    await mutateVillageState((live) => {
      const resident = live.villagers[0]!,
        attempt = resident.wishLifecycle!.attempt!;
      rememberWishNeed(resident, freshWish("other", "A lasting watering can", "lasting"));
      attempt.stage = "generated";
      attempt.calls = 1;
      attempt.candidate = freshWish("saved-candidate", "A garden sketch");
      attempt.revision = wishRevision(resident, live);
    });
    await processWishAttempt(job.characterId, job.id, now, () => now);
    assert.equal(
      modelCalls.length,
      0,
      "legacy generated proposals without a matching verdict never spend a repair request",
    );
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes.length, 0);
    seed();
    job = (await reserveWishAttempts(now))[0]!;
    await mutateVillageState((live) => {
      const attempt = live.villagers[0]!.wishLifecycle!.attempt!;
      attempt.stage = "validated";
      attempt.calls = 2;
      attempt.candidate = freshWish("saved-verdict");
      attempt.accepted = true;
    });
    await processWishAttempt(job.characterId, job.id, now, () => now);
    assert.equal(modelCalls.length, 0);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes.length, 1);
    seed();
    job = (await reserveWishAttempts(now))[0]!;
    await mutateVillageState((live) => {
      const attempt = live.villagers[0]!.wishLifecycle!.attempt!;
      attempt.stage = "comparing";
      attempt.calls = 2;
      attempt.candidate = freshWish("interrupted-compare");
    });
    await processWishAttempt(job.characterId, job.id, now, () => now);
    assert.equal(modelCalls.length, 0);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes.length, 0);
    seed();
    onModel = async () => {
      await mutateVillageState((live) => {
        live.setting = "A different village";
      });
    };
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes.length, 0, "stale generation cannot commit");
    seed();
    await reconcileWishLifecycle(now, false, () => new Date(now.getTime() + WISH_DAY_MS));
    assert.equal(
      (await readVillageState()).villagers[0]!.agenda!.wishes.length,
      0,
      "a response crossing midnight cannot grant yesterday's wish",
    );

    // Lasting achievements, repeatable needs, exact duplicates and bounded paraphrase matching.
    const need: WishNeed = {
      id: "flowers",
      subject: "flowers",
      action: "acquire",
      policy: "recurring",
      aliases: ["Fresh flowers"],
      lastFulfilledAt: now.toISOString(),
    };
    assert.equal(knownNeedBlocked(need, new Date(now.getTime() + 6 * WISH_DAY_MS)), true);
    assert.equal(knownNeedBlocked(need, new Date(now.getTime() + 7 * WISH_DAY_MS)), false);
    assert.equal(knownNeedBlocked({ ...need, policy: "lasting" }, farLater), true);
    assert.equal(knownNeedBlocked({ ...need, policy: "unknown" }, farLater), true);
    const usageState = seed();
    usageState.villagers[0]!.wishLifecycle!.needs = [need];
    put(usageState);
    unavailableGenerationUsage = true;
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal(modelCalls.length, 1);
    assert.equal(
      (await readVillageState()).villagers[0]!.wishLifecycle!.attempt!.inputTokens,
      null,
      "partial usage remains explicitly unavailable",
    );
    // An invalid single proposal remains blocked; only deliberate retry spends again.
    const comparisonState = seed();
    rememberWishNeed(comparisonState.villagers[0]!, freshWish("known", "A watering can", "lasting"));
    put(comparisonState);
    mode = "blank";
    await reconcileWishLifecycle(now, false, () => now);
    const comparisonFailure = (await backgroundWorkSummaries()).find((entry) => entry.kind === "wish")!;
    assert.equal(comparisonFailure.status, "failed");
    assert.equal(modelCalls.length, 1);
    await reconcileWishLifecycle(nextDay, false, () => nextDay);
    assert.equal(modelCalls.length, 1);
    mode = "fresh";
    await Promise.all([
      retryBackgroundJob(comparisonFailure.id, comparisonFailure.attempt, "single-proposal-retry"),
      retryBackgroundJob(comparisonFailure.id, comparisonFailure.attempt, "single-proposal-retry"),
    ]);
    await settleBackgroundWork();
    assert.equal(modelCalls.length, 2);
    await retryBackgroundJob(comparisonFailure.id, comparisonFailure.attempt, "single-proposal-retry");
    await settleBackgroundWork();
    assert.equal(modelCalls.length, 2, "lost retry responses do not duplicate requests");
    for (const count of [10, 1000, 10000]) {
      const live = seed(),
        resident = live.villagers[0]!;
      resident.wishLifecycle!.needs = Array.from({ length: count }, (_, index) => ({
        id: `need-${index}`,
        subject: `item-${index}`,
        action: "acquire",
        policy: "lasting",
        aliases: [`Own item ${index}`],
        lastFulfilledAt: new Date(now.getTime() - 20 * WISH_DAY_MS).toISOString(),
      }));
      put(live);
      await reconcileWishLifecycle(now, false, () => now);
      assert.equal(modelCalls.length, 1, `${count} needs have the same single-request ceiling`);
      const comparison = JSON.parse(modelCalls[0]!.split("\n").at(-1)!);
      assert.equal(comparison.known.length, Math.min(12, count));
      assert.ok(
        modelCalls.every((prompt) => prompt.length < 18000),
        "prompt size is independent of archive length",
      );
    }
    const active = freshWish("active");
    active.need = { id: "active-need", subject: "flowers", action: "acquire", policy: "recurring" };
    const shortlist = selectWishNeeds(
      "Repair an old boat",
      [active],
      [
        ...Array.from({ length: 20 }, (_, index) => ({ ...need, id: `other-${index}` })),
        { ...need, id: "boat", subject: "boat", action: "repair", aliases: ["Repair the boat"] },
      ],
    );
    assert.equal(shortlist[0]!.id, "active-need");
    assert.ok(shortlist.some((entry) => entry.id === "boat"));
    for (const policy of ["lasting", "recurring", "unknown"] as const) {
      const live = seed();
      live.villagers[0]!.wishLifecycle!.needs = [{ ...need, policy }];
      put(live);
      comparisonId = "flowers";
      mode = "repeat";
      await reconcileWishLifecycle(now, false, () => now);
      assert.equal(
        (await readVillageState()).villagers[0]!.agenda!.wishes.length,
        0,
        "a settled paraphrase stays blocked",
      );
    }
    const repeatState = seed();
    repeatState.villagers[0]!.wishLifecycle!.needs = [
      { ...need, lastFulfilledAt: new Date(now.getTime() - 8 * WISH_DAY_MS).toISOString() },
    ];
    put(repeatState);
    mode = "repeat";
    comparisonId = "flowers";
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal(
      (await readVillageState()).villagers[0]!.agenda!.wishes[0]!.need!.id,
      "flowers",
      "an eligible paraphrase reuses its server identity",
    );
    seed();
    state = await readVillageState();
    rememberWishNeed(state.villagers[0]!, freshWish("boat", "Own a boat", "lasting"));
    state.villagers[0]!.wishLifecycle!.needs[0]!.lastFulfilledAt = now.toISOString();
    put(state);
    mode = "uncertain";
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes.length, 0, "uncertain verdicts fail closed");
    const repairState = seed();
    const acquisition = rememberWishNeed(
      repairState.villagers[0]!,
      freshWish("acquired-boat", "Own a boat", "lasting"),
    );
    acquisition.subject = "boat";
    acquisition.action = "acquire";
    acquisition.lastFulfilledAt = now.toISOString();
    put(repairState);
    job = (await reserveWishAttempts(now))[0]!;
    await mutateVillageState((live) => {
      const attempt = live.villagers[0]!.wishLifecycle!.attempt!;
      const repair = freshWish("boat-repair", "Repair the boat", "lasting");
      repair.need = { id: "", subject: "boat", action: "repair", policy: "lasting" };
      attempt.candidate = repair;
      attempt.needComparison = { matchedNeedId: "", certain: true, knownIds: [acquisition.id] };
      attempt.calls = 1;
      attempt.stage = "generated";
    });
    await processWishAttempt(job.characterId, job.id, now, () => now);
    assert.equal((await readVillageState()).villagers[0]!.agenda!.wishes[0]!.id, "boat-repair");
    assert.notEqual((await readVillageState()).villagers[0]!.agenda!.wishes[0]!.need!.id, acquisition.id);
    assert.equal(modelCalls.length, 0, "a saved folded verdict needs no matching call");

    // Outcomes live outside the hot village; outbox writes and corrections are replayable.
    state = seed();
    const resident = state.villagers[0]!;
    resident.agenda!.wishes = [freshWish("fulfilled"), freshWish("unrelated", "A watering can", "lasting")];
    registerInitialWish(resident, now);
    const beforeWeek = structuredClone(resident.agenda!.week),
      receipt = "visit:wish:fulfilled";
    assert.ok(fulfillResidentWish(resident, "fulfilled", now.toISOString(), receipt));
    assert.equal(fulfillResidentWish(resident, "fulfilled", now.toISOString(), receipt), null);
    assert.deepEqual(resident.agenda!.week, beforeWeek);
    assert.equal(resident.agenda!.wishes[0]!.id, "unrelated");
    assert.equal(modelCalls.length, 0);
    for (let index = 1; index < 101; index++)
      recordWishOutcome(
        resident,
        freshWish(`outcome-${index}`, `ordinary need ${index}`),
        now.toISOString(),
        `receipt-${index}`,
        "fulfilled",
      );
    put(state);
    pageFailure = true;
    await assert.rejects(flushWishOutcomes(), /archive unavailable/);
    assert.equal((await readVillageState()).villagers[0]!.wishLifecycle!.pendingOutcomes.length, 101);
    pageFailure = false;
    await flushWishOutcomes();
    await flushWishOutcomes();
    await flushWishOutcomes();
    await flushWishOutcomes();
    assert.equal((await readVillageState()).villagers[0]!.wishLifecycle!.pendingOutcomes.length, 0);
    const latest = await readWishHistoryPage("r0");
    assert.equal(latest.entries.length, 1);
    assert.equal(latest.total, 101);
    const middle = await readWishHistoryPage("r0", latest.nextCursor!);
    assert.equal(middle.entries.length, 50);
    const first = await readWishHistoryPage("r0", middle.nextCursor!);
    assert.equal(first.entries.length, 50);
    assert.equal(first.nextCursor, null);
    assert.equal(listCalls, 0);
    assert.equal((await readWishOutcome("r0", "fulfilled"))!.memoryId, receipt);
    await assert.rejects(readWishHistoryPage("r0", "-1"), /cursor/);
    await correctResidentWish("r0", "fulfilled", now);
    await correctResidentWish("r0", "fulfilled", now);
    assert.ok((await readWishOutcome("r0", "fulfilled"))!.correctedAt);
    assert.equal(modelCalls.length, 0);
    assert.ok((await readVillageState()).villagers[0]!.agenda!.wishes.some((wish) => wish.id === "fulfilled"));

    await mutateVillageState((live) => {
      assert.ok(fulfillResidentWish(live.villagers[0]!, "fulfilled", now.toISOString(), "second-fulfillment-receipt"));
    });
    await flushWishOutcomes();
    assert.equal(
      (await readWishOutcome("r0", "fulfilled"))!.memoryId,
      "second-fulfillment-receipt",
      "a corrected and fulfilled-again wish resolves to its newest receipt",
    );

    // Activity overlays preserve ordinary schedules and respect boundaries and commitments.
    state = seed();
    const person = state.villagers[0]!,
      slot = wishSlots(person, state, now)[0]!;
    assert.ok(slot);
    const activity: WishActivity = {
      ...slot,
      wishId: "activity-wish",
      venueId: "",
      activity: "Sketching a flower",
      reason: "A private interest",
      baseRevision: routineRevision(person.agenda!),
    };
    assert.equal(canApplyWishActivity(activity, person, state, now), true);
    person.agenda!.wishes = [freshWish("activity-wish")];
    person.agenda!.wishActivities = [activity];
    const date = new Date(`${slot.dateKey}T12:00:00`),
      atSlot = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, slot.startMinute + 1);
    assert.equal(
      agendaBlocksFor(person.agenda!, false, atSlot).find((block) => block.startMinute === slot.startMinute)!.activity,
      "Sketching a flower",
    );
    assert.equal(
      agendaBlocksFor(person.agenda!, false, atSlot).find((row) => row.commitmentId === "activity-wish")!.flexible,
      false,
      "accepted dated Wish intervals cannot be overwritten by social planning",
    );
    fulfillResidentWish(person, "activity-wish", atSlot.toISOString(), "activity-receipt");
    assert.equal(
      agendaBlocksFor(person.agenda!, false, atSlot).find((block) => block.startMinute === slot.startMinute)!.activity,
      "Sketching a flower",
      "current block stays stable until its boundary",
    );
    person.agenda!.wishActivities = [activity];
    person.agenda!.wishes = [freshWish("future-fulfilled")];
    person.agenda!.wishActivities[0]!.wishId = "future-fulfilled";
    fulfillResidentWish(person, "future-fulfilled", now.toISOString(), "future-receipt");
    assert.equal(person.agenda!.wishActivities.length, 0, "future adjustments disappear without a request");
    assert.equal(canApplyWishActivity({ ...activity, venueId: "missing" }, person, state, now), false);
    person.agenda!.wishes = [freshWish(activity.wishId)];
    person.agenda!.wishActivities = [{ ...activity, venueId: "missing" }];
    pruneWishActivities(state, now);
    assert.equal(person.agenda!.wishActivities.length, 0, "expired venue links drop future overlays locally");
    person.agenda!.wishActivities = [activity];
    person.agenda!.activeDay = {
      dateKey: slot.dateKey,
      weekday: "Wednesday",
      blocks: person.agenda!.week!.Wednesday!,
      scheduleInformed: false,
    };
    person.agenda!.week!.Monday![0]!.activity = "A revised routine";
    pruneWishActivities(state, atSlot);
    assert.equal(
      agendaBlocksFor(person.agenda!, false, atSlot).find((block) => block.startMinute === slot.startMinute)!.activity,
      activity.activity,
      "current overlay survives a base revision until the activity boundary",
    );
    activity.baseRevision = routineRevision(person.agenda!);
    person.agenda!.wishActivities = [];
    person.agenda!.projectWork = {
      projectId: "project",
      venueId: "site",
      startsAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, slot.startMinute).toISOString(),
      endsAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, slot.endMinute).toISOString(),
    };
    assert.equal(canApplyWishActivity(activity, person, state, now), false, "construction keeps its reserved time");
    delete person.agenda!.projectWork;
    person.agenda!.week!.Monday![0]!.activity = "A revised ordinary routine";
    assert.equal(
      canApplyWishActivity(activity, person, state, now),
      true,
      "an unrelated base change preserves a compatible dated interval",
    );
    const privateVenue = {
      id: "private",
      occupancy: { playerHome: false, residentCharacterId: "somebody-else" },
      zones: [{ id: "bedroom", kind: "private-residence", ownerId: "somebody-else" }],
    } as VillageVenue;
    state.venues.push(privateVenue);
    assert.equal(
      canApplyWishActivity(
        { ...activity, baseRevision: routineRevision(person.agenda!), venueId: "private", zoneId: "bedroom" },
        person,
        state,
        now,
      ),
      false,
    );

    state = seed();
    state.storyPace = "off";
    const expired = freshWish("expired");
    expired.expiresAt = new Date(now.getTime() - 1).toISOString();
    state.villagers[0]!.agenda!.wishes = [expired];
    expireResidentWishes(state.villagers[0]!, now);
    put(state);
    await reconcileWishLifecycle(now, false, () => now);
    assert.equal(modelCalls.length, 0);
    assert.equal(
      (await readVillageState()).villagers[0]!.agenda!.wishes.length,
      0,
      "Off still permits deterministic expiry",
    );
    assert.equal((await readWishHistoryPage("r0")).entries[0]!.kind, "expired");
    const signatureContext = { setting: "Village", venues: [], wishes: [], weekStart: "2026-09-28", blocks: [] };
    assert.equal(
      remapSignature(signatureContext),
      remapSignature({ ...signatureContext, wishes: [freshWish("changed")] }),
      "wishes never invalidate the native routine",
    );
    console.log(
      "villages-wish-lifecycle: daily supply, restart budgets, bounded history, archive, correction, overlays, and Off: ok",
    );
  } finally {
    stopBackground?.();
    release();
  }
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
