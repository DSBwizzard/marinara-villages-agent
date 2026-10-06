import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import assert from "node:assert/strict";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  interpretWishClaim,
  wishInterpretationCheck,
  validateWishInterpretation,
  matchingWishReceipts,
  wishFingerprint,
  wishReceiptRecords,
} from "../packages/villages/src/server/features/residents/wishes/wish-interpretation.js";
import { readWishCriteria } from "../packages/villages/src/server/domain/decoding/wish-criteria.js";
import { coerceWishApplicationProof } from "../packages/villages/src/server/domain/decoding/wish-criteria.js";
import { type WishInterpretationContext } from "../packages/villages/src/server/domain/models/wish-interpretation-model.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVenueActionResult } from "../packages/villages/src/server/features/venues/venue-actions.js";
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
    const failed = await operation(() => interpretWishClaim(context, "scene", "physical-claim"));
    assert.equal(failed.verdict.fulfilled, false, "Even a positive native answer without a transfer is rejected");
    assert.equal(interpretations, 0, "Missing physical proof avoids judgment altogether");
    assert.equal(failed.interpretationStatus, undefined, "Absent proof is a settled negative, not a retryable failure");
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
      const result = await operation(() => interpretWishClaim(context, "scene", `physical-${enabled}`));
      assert.equal(result.verdict.fulfilled, true);
      assert.equal(result.batch.results[0].source, "system", "Absent Decisions connection always falls back");
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
        title: "Greenhouse",
        venueId: "garden",
        status: "finishing",
        updatedAt: at,
        lifecycle: { phase: "finishing", completedAt: at, builderId: "a" },
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
    const action = readVenueActionResult(
      { happened: true, narration: "Pat gives Aqua the cupcake", removeItem: "cupcake", transferTo: "a" },
      ["cupcake"],
      [],
      ["a"],
    );
    assert.equal(action.transferTo, "a");
    assert.equal(
      readVenueActionResult(
        { happened: true, narration: "Pat gives Aqua the cupcake", removeItem: "cupcake", transferTo: "a" },
        [],
        [],
        ["a"],
      ).happened,
      false,
    );
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
    const social = await operation(() => interpretWishClaim(context, "scene", "social"));
    assert.equal(social.verdict.fulfilled, true);
    for (const outcome of ["none", "unresolved"]) {
      nativeOutcome = outcome;
      const result = await operation(() => interpretWishClaim(context, "scene", `social-${outcome}`));
      assert.equal(result.verdict.fulfilled, false);
      assert.equal(result.interpretationStatus, outcome === "unresolved" ? "unresolved" : undefined);
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
      "Villages wish interpretation: native fallback, cached conditions, actual interaction, transfer evidence, wrong positives and storage ok",
    );
  } finally {
    release();
  }
}
void main();
