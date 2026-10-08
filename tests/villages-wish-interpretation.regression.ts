import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import assert from "node:assert/strict";
import {
  activationScope,
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { villagesDocuments } from "../packages/villages/src/server/adapters/engine/runtime-host.js";
import { createWishInterpretation } from "../packages/villages/src/server/features/residents/wishes/wish-interpretation-service.js";
import { systemInterpretations } from "../packages/villages/src/server/features/generation/system-interpretation.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  interpretWishBatch,
  cachedWishCriteria,
  configureWishInterpretation,
} from "../packages/villages/src/server/features/residents/wishes/wish-interpretation.js";
import {
  wishInterpretationCheck,
  validateWishInterpretation,
  matchingWishReceipts,
  wishFingerprint,
  wishReceiptRecords,
} from "../packages/villages/src/server/domain/rules/wish-interpretation-rules.js";
import { readWishCriteria } from "../packages/villages/src/server/domain/decoding/wish-criteria.js";
import { coerceWishApplicationProof } from "../packages/villages/src/server/domain/decoding/wish-criteria.js";
import { type WishInterpretationContext } from "../packages/villages/src/server/domain/models/wish-interpretation-model.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coordinateVenue } from "../packages/villages/src/server/jobs/venue-coordinator.js";
import { saveInterpretationSettings } from "../packages/villages/src/server/features/settings/interpretation-settings.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
const records = new Map<string, any>();
let preparations = 0,
  interpretations = 0;
let nativeOutcome = "fulfilled";
const release = configureVillagesRuntime({
  persistence: {
    documents: {
      async getById(_package: string, id: string) {
        return structuredClone(records.get(id) ?? null);
      },
      async create(input: any) {
        const row = { ...structuredClone(input), revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const row = records.get(input.id);
        if (!row || row.revision !== input.expectedRevision) return null;
        const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
        records.set(input.id, next);
        return next;
      },
    },
  },
  async getAgentConfig() {
    return null;
  },
  logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 4000,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[]) {
          if (messages[0].content.startsWith("Prepare faithful fulfillment conditions")) {
            preparations++;
            const { wish } = JSON.parse(messages[1].content);
            return {
              content: JSON.stringify({
                complete: true,
                kind: wish.id === "social" ? "conversation" : "transfer",
                requiresPhysical: wish.id !== "social",
                goal: wish.wish,
                itemName: wish.id === "physical" ? "cupcake" : "",
              }),
              finishReason: "stop",
            };
          }
          interpretations++;
          const checks = fixtureInterpretationChecks(messages[1].content);
          return {
            content: JSON.stringify({
              results: checks.map((check: any) => ({
                id: check.id,
                outcome: nativeOutcome,
                evidenceIds: check.evidence
                  .filter(
                    (line: any) => line.kind === "receipt" || (line.speakerId === "player" && line.kind !== "claim"),
                  )
                  .map((line: any) => line.id),
                reason: "Independent labeled fixture",
              })),
            }),
            finishReason: "stop",
          };
        },
      };
    },
  },
} as any);
const at = "2026-10-01T10:00:00Z";
const context: WishInterpretationContext = {
  actorId: "a",
  village: "Village",
  setting: "",
  moment: {} as any,
  card: { id: "a", name: "Aqua" } as any,
  playerName: "Pat",
  playerDescription: "",
  wishes: [{ id: "physical", wish: "Have Pat give me a cupcake", tell: "", intensity: 1, addedAt: at, expiresAt: "" }],
  claim: "I gave you a cupcake.",
  transcript: [],
  happenings: [],
  memory: [],
  worldState: [],
  receipts: [],
  evidence: [{ id: "warm", speakerId: "a", name: "Aqua", kind: "dialogue", content: "Oh, you're so thoughtful.", at }],
};
let sequence = 0;
async function operation(work: () => Promise<any>) {
  const id = `wish-test-${++sequence}`;
  records.set(`villages-venue-visit-${id}`, {
    id: `villages-venue-visit-${id}`,
    revision: 1,
    data: {
      id,
      status: "active",
      sceneRevision: 0,
      lastActivityAt: new Date().toISOString(),
      lines: [],
      submissions: [],
    },
  });
  return coordinateVenue(id, id, "turn", {}, 0, undefined, work);
}
async function wishConnectionOwnership() {
  function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
      resolve = done;
    });
    return { promise, resolve };
  }
  function fixture(label: string, stage?: string) {
    const scope = createActivationScope(),
      entered = deferred(),
      gate = deferred(),
      controller = new AbortController();
    const criteria = { kind: "conversation" as const, requiresPhysical: false, goal: label + " planting agreement" };
    const ownedRecords = new Map<string, any>([
      [
        "villages-wish-interpretation-criteria",
        { id: "villages-wish-interpretation-criteria", revision: 1, data: { entries: [{ key: label, criteria }] } },
      ],
    ]);
    let held = false,
      calls = 0,
      resolutions = 0;
    let foreign: ReturnType<typeof createActivationScope> | undefined;
    let readError: Error | undefined, interpretError: Error | undefined;
    async function pause(candidate: string) {
      if (!held && stage === candidate) {
        held = true;
        entered.resolve();
        await gate.promise;
      }
    }
    const model = {
      model: "wish-owner-model",
      connectionId: "equal-model",
      maxOutputTokens: 4096,
      fitContext(messages: any[], options: any) {
        assert.equal(this.model, model.model);
        assert.equal(this.connectionId, model.connectionId);
        assert.equal(activationScope(), scope);
        return { messages, ...options };
      },
      async chatComplete(messages: any[], options: any) {
        assert.equal(this, model);
        assert.equal(activationScope(), scope);
        assert.equal(options.signal, controller.signal);
        calls++;
        assert(!messages[0].content.startsWith("Prepare"));
        await pause("completion");
        assert.equal(activationScope(), scope);
        const checks = fixtureInterpretationChecks(messages[1].content);
        assert(checks.length > 0);
        assert(messages[1].content.includes(label + " planting"));
        return {
          content: JSON.stringify({
            results: checks.map((check: any) => ({
              id: check.id,
              outcome: "progress",
              evidenceIds: check.evidence.filter((line: any) => line.current).map((line: any) => line.id),
              reason: label + " agreement",
              details: { proofKind: "conversation" },
            })),
          }),
          finishReason: "stop",
        };
      },
    };
    const documents = {
      async getById(_packageId: string, id: string) {
        assert.equal(activationScope(), scope);
        if (id === "villages-wish-interpretation-criteria") {
          await pause("criteria");
          assert.equal(activationScope(), scope);
          if (readError) throw readError;
        }
        return structuredClone(ownedRecords.get(id) ?? null);
      },
      async list() {
        return [];
      },
      async create(input: any) {
        assert.equal(activationScope(), scope);
        const row = { ...structuredClone(input), revision: 1 };
        ownedRecords.set(input.id, row);
        return structuredClone(row);
      },
      async update(input: any) {
        assert.equal(activationScope(), scope);
        const old = ownedRecords.get(input.id);
        if (!old || old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
        ownedRecords.set(input.id, row);
        return structuredClone(row);
      },
      async remove() {
        return false;
      },
    };
    const releaseOwned = scope.run(() =>
      configureVillagesRuntime({
        persistence: { documents },
        getAgentConfig: async () => null,
        logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
        languageModels: {
          async resolveForRequest() {
            assert.equal(activationScope(), scope);
            resolutions++;
            await pause("resolve");
            assert.equal(activationScope(), scope);
            return model;
          },
        },
      } as any),
    );
    const releaseWish = scope.run(() =>
      configureWishInterpretation(
        createWishInterpretation({
          VILLAGES_PACKAGE_ID: "villages",
          villagesDocuments,
          systemInterpretations,
          bindCallback: (callback) => scope.bind(callback),
          async interpretChecks(checks, _stage, _sceneId, system) {
            assert.equal(activationScope(), scope);
            assert(checks.every((check) => check.decisionEligible === false));
            await pause("interpreter");
            if (interpretError) throw interpretError;
            assert(system);
            const results = await (foreign ?? scope).run(() => system(checks, controller.signal));
            return {
              checks,
              results,
              settings: { decisionsEnabled: false, compareSystem: false },
              traces: checks.map((check, index) => ({
                id: check.id,
                question: check.question,
                domain: check.domain,
                evidence: check.evidence,
                decisions: { status: "off" as const },
                system: { status: "complete" as const },
                result: results[index],
                applied: "Not yet applied",
                startedAt: new Date().toISOString(),
              })),
            };
          },
        }),
      ),
    );
    const when = new Date().toISOString();
    const input: WishInterpretationContext = {
      ...structuredClone(context),
      card: { ...context.card, name: label },
      claim: "Discuss planting",
      receipts: [],
      wishes: [
        {
          id: "equal-wish",
          wish: "Talk about gardening and agree on a planting day",
          tell: "",
          intensity: 1,
          addedAt: when,
          expiresAt: "",
        },
      ],
      evidence: [
        {
          id: "player",
          speakerId: "player",
          name: "Player",
          content: label + " planting on Saturday works for me.",
          at: when,
          current: true,
        },
        { id: "reply", speakerId: "a", name: label, content: "Saturday is agreed.", at: when, current: true },
      ],
    };
    assert.equal(calls, 0, "assembling ports performs no semantic request");
    return {
      scope,
      entered,
      gate,
      controller,
      records: ownedRecords,
      release: releaseOwned,
      releaseWish,
      input,
      calls: () => calls,
      resolutions: () => resolutions,
      foreign(owner: typeof scope) {
        foreign = owner;
      },
      failRead(error?: Error) {
        readError = error;
      },
      failInterpret(error?: Error) {
        interpretError = error;
      },
    };
  }
  for (const stage of ["criteria", "interpreter", "resolve", "completion"]) {
    const a = fixture("A", stage),
      b = fixture("B"),
      clearA = installDefaultActivation(a.scope, () => {});
    let clearB = () => {};
    a.foreign(b.scope);
    try {
      const pending =
        stage === "criteria" ? cachedWishCriteria() : interpretWishBatch([a.input], "equal-scene", "equal-key");
      await Promise.race([
        a.entered.promise,
        pending.then(() => assert.fail("Wish request completed before controlled " + stage + " pause")),
      ]);
      clearB = installDefaultActivation(b.scope, () => {});
      if (stage === "criteria")
        assert.deepEqual(
          [...(await cachedWishCriteria())].map(([key]) => key),
          ["B"],
        );
      else {
        const own = await interpretWishBatch([b.input], "equal-scene", "equal-key");
        assert.equal(own.results[0].reason, "B agreement");
        assert.equal(b.calls(), 1);
      }
      clearA();
      a.gate.resolve();
      const result = await pending;
      if (result instanceof Map) {
        assert.deepEqual([...result.keys()], ["A"]);
        assert.equal(a.calls(), 0);
      } else {
        assert.equal(result.results[0].outcome, "progress");
        assert.equal(result.results[0].reason, "A agreement");
        assert.equal(a.calls(), 1);
        assert.equal(a.resolutions(), 1);
      }
      for (const owned of [a, b]) {
        const requests = owned.records.get("villages-ai-usage")?.data.requests ?? [];
        assert.equal(requests.length, stage === "criteria" ? 0 : 1);
        if (requests.length) {
          assert.equal(requests[0].status, "complete");
          assert.equal(requests[0].purpose, "checks");
          assert.equal(requests[0].connectionId, "equal-model");
          assert(!JSON.stringify(requests).includes("planting on Saturday"), "accounting retains no conversation text");
        }
      }
      console.log("Owned Wish interpretation stage passed:", stage);
    } finally {
      a.gate.resolve();
      clearA();
      clearB();
      a.releaseWish();
      b.releaseWish();
      a.release();
      b.release();
      a.scope.dispose();
      b.scope.dispose();
    }
  }
  const a = fixture("A"),
    b = fixture("B"),
    clearA = installDefaultActivation(a.scope, () => {});
  let clearB = () => {};
  a.foreign(b.scope);
  try {
    const exactRead = new Error("exact cached criteria failure");
    a.failRead(exactRead);
    await assert.rejects(cachedWishCriteria(), (error) => error === exactRead);
    a.failRead();
    const exactInterpret = new Error("exact supplied Interpreter failure");
    a.failInterpret(exactInterpret);
    await assert.rejects(
      interpretWishBatch([a.input], "equal-scene", "equal-key"),
      (error) => error === exactInterpret,
    );
    assert.equal(a.calls(), 0);
    a.failInterpret();
    const refused = structuredClone(a.input);
    refused.wishes[0].wish = "Have Pat give me a cupcake";
    const batch = await interpretWishBatch([refused], "equal-scene", "no-admission");
    assert.equal(batch.results[0].outcome, "none");
    assert.equal(a.calls(), 0, "unadmitted evidence never reaches the System provider");
    clearB = installDefaultActivation(b.scope, () => {});
    a.scope.dispose();
    await assert.rejects(
      a.scope.run(() => cachedWishCriteria()),
      /not configured/,
    );
    await assert.rejects(
      a.scope.run(() => interpretWishBatch([a.input], "equal-scene", "equal-key")),
      /not configured/,
    );
    assert.equal(b.calls(), 0);
    await interpretWishBatch([b.input], "equal-scene", "equal-key");
    assert.equal(b.calls(), 1);
  } finally {
    clearA();
    clearB();
    a.releaseWish();
    b.releaseWish();
    a.release();
    b.release();
    a.scope.dispose();
    b.scope.dispose();
  }
}

async function main() {
  try {
    const criteria = {
      kind: "transfer" as const,
      requiresPhysical: true,
      goal: "Actual cupcake delivery",
      itemName: "cupcake",
    };
    const check = wishInterpretationCheck(context, context.wishes[0], criteria, "claim");
    assert.equal(check.decisionEligible, false, "No physical proof routes directly to native interpretation");
    for (const source of ["system", "decisions"] as const) {
      assert.match(
        validateWishInterpretation(check, {
          source,
          outcome: "fulfilled",
          evidenceIds: ["warm", "wish-claim"],
          reason: "wrong positive",
        }),
        /physical receipt/u,
        "Confident wrong answers and incorrect agreement cannot substitute for the required transfer",
      );
    }
    const failed = await operation(() => interpretWishBatch([context], "scene", "physical-claim", false));
    assert.equal(failed.results[0].outcome, "none", "Missing physical proof is never admitted to the paid batch");
    assert.equal(interpretations, 0, "Missing physical proof avoids judgment altogether");
    assert.ok(failed.results[0].reason, "Absent proof retains its admission reason");
    context.receipts = [
      {
        id: "transfer",
        venueId: "cafe",
        zoneId: "common",
        venueName: "Cafe",
        text: "Pat handed Aqua the cupcake.",
        at,
        actionReceipt: {
          submissionId: "transfer",
          happened: true,
          narration: "Pat handed Aqua the cupcake.",
          removeItem: "cupcake",
          transferTo: "a",
          witnessIds: ["a"],
          itemTransfer: { itemName: "cupcake", recipientId: "a" },
        },
      },
    ];
    assert.equal(matchingWishReceipts(criteria, context, context.wishes[0]).length, 1);
    const current = structuredClone(context);
    for (const mutation of ["wrong-recipient", "wrong-item", "unwitnessed", "failed", "older"] as const) {
      const proof = current.receipts[0].actionReceipt!;
      if (mutation === "wrong-recipient") proof.itemTransfer!.recipientId = "b";
      if (mutation === "wrong-item") proof.itemTransfer!.itemName = "coffee";
      if (mutation === "unwitnessed") proof.witnessIds = [];
      if (mutation === "failed") proof.happened = false;
      if (mutation === "older") current.receipts[0].at = "2026-09-30T10:00:00Z";
      assert.equal(matchingWishReceipts(criteria, current, context.wishes[0]).length, 0);
      current.receipts = structuredClone(context.receipts);
    }
    for (const enabled of [false, true]) {
      await saveInterpretationSettings({ decisionsEnabled: enabled, compareSystem: false });
      const result = await operation(() => interpretWishBatch([context], "scene", `physical-${enabled}`, false));
      assert.equal(result.results[0].outcome, "fulfilled");
      assert.equal(result.results[0].source, "system", "Cited finite Wish batches retain their System judge");
      assert.ok(result.results[0].evidenceIds.includes("receipt:transfer"));
    }
    assert.equal(preparations, 0, "Condition preparation never dispatches a request");
    const state = defaultVillageState();
    state.venueEvents = context.receipts;
    assert.deepEqual(
      coerceVillageState(state).venueEvents,
      context.receipts,
      "Witnessed transfer metadata survives storage",
    );
    state.projects = [
      {
        id: "project",
        kind: "renovation",
        title: "Greenhouse",
        venueId: "garden",
        status: "finishing",
        updatedAt: at,
        lifecycle: { version: 2, phase: "finishing", completedAt: at, builderId: "a" },
      },
    ] as any;
    state.venues = [{ id: "garden", name: "Garden" }] as any;
    assert.equal(
      wishReceiptRecords(state, "a").filter((event) => event.completedProject).length,
      0,
      "A claim or unfinished construction is not proof",
    );
    state.projects[0].status = "complete";
    state.projects[0].lifecycle!.phase = "complete";
    state.progressEngineVersion = 1;
    assert.equal(
      wishReceiptRecords(state, "a").filter((event) => event.completedProject).length,
      0,
      "Engine Villages require canonical resolution",
    );
    state.progressTasks = [{ definition: { owner: { id: "project", kind: "project" } }, resolvedAt: at }] as any;
    const complete = wishReceiptRecords(state, "a").find((event) => event.completedProject)!;
    assert.ok(complete);
    assert.equal(complete.actionReceipt?.witnessIds, undefined, "Public verified state does not invent witnesses");
    const stripped = publicSceneResponse({
      wishInterpretationProof: { criteria: { goal: "private" } },
      optionalAttempts: { secret: true },
      safe: "ok",
    });
    assert.deepEqual(stripped, { safe: "ok" });
    assert.equal(coerceWishApplicationProof({ fingerprint: "bad", criteria: null }).fingerprint, "invalid");
    context.wishes = [
      { id: "social", wish: "Have a conversation about gardening", tell: "", intensity: 1, addedAt: at, expiresAt: "" },
    ];
    context.evidence.push({
      id: "spoken",
      speakerId: "player",
      name: "Pat",
      kind: "dialogue",
      content: "My roses are blooming. How are your seedlings?",
      at,
    });
    context.receipts = [];
    const social = await operation(() => interpretWishBatch([context], "scene", "social", false));
    assert.equal(social.results[0].outcome, "fulfilled");
    assert.equal(social.results[0].source, "system");
    assert.equal(social.results[0].reason, "Independent labeled fixture");
    assert.ok(social.results[0].evidenceIds.includes("spoken"));
    for (const outcome of ["none", "unresolved"]) {
      nativeOutcome = outcome;
      const result = await operation(() => interpretWishBatch([context], "scene", `social-${outcome}`, false));
      assert.equal(result.results[0].outcome, outcome);
      assert.equal(result.results[0].source, "system");
      assert.equal(result.results[0].reason, "Independent labeled fixture");
    }
    const socialCheck = wishInterpretationCheck(
      context,
      context.wishes[0],
      { kind: "conversation", goal: "talk about gardening", requiresPhysical: false },
      "social",
    );
    assert.match(
      validateWishInterpretation(socialCheck, {
        source: "decisions",
        outcome: "fulfilled",
        evidenceIds: ["wish-claim", "warm"],
        reason: "wrong positive",
      }),
      /player interaction/u,
    );
    assert.equal(
      readWishCriteria(
        { complete: true, kind: "conversation", goal: "Delivery", requiresPhysical: true },
        context.wishes[0],
      ),
      null,
    );
    assert.notEqual(
      wishFingerprint(context.wishes[0]),
      wishFingerprint({ ...context.wishes[0], wish: "A changed wish" }),
    );
    assert.equal(interpretations, 5);
    console.log(
      "Villages finite Wish batch: cited System results, no preparation requests, actual interaction, transfer evidence, wrong positives and storage ok",
    );
  } finally {
    release();
  }
  await wishConnectionOwnership();
}
await main();
