import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  configureDecisionsAdapter,
  loadDecisionEngineModules,
  decisionAdapterStatus,
} from "../packages/villages/src/engine/packages/server/src/services/villages/decisions-adapter.js";
import {
  coordinateVenue,
  venueCheckpoint,
  coordinatedOptionalCompletion,
  venueInterpretationSettings,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-coordinator.js";
import {
  saveInterpretationSettings,
  readInterpretationSettings,
} from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation-settings.js";
import {
  interpretChecks,
  readDecisionInterpretation,
  readSystemInterpretations,
  type InterpretationCheck,
} from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation.js";
import {
  readInterpretationDiagnostics,
  writeInterpretationDiagnostics,
  scheduleSystemComparisons,
  stopInterpretationComparisons,
} from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation-diagnostics.js";
import { applyInterpretedRoomEvents } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.js";
import {
  roomInterpretationChecks,
  dismissalDestination,
} from "../packages/villages/src/engine/packages/server/src/services/villages/room-interpretation.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";

const records = new Map<string, any>();
const documents = {
  async getById(_package: string, id: string) {
    return structuredClone(records.get(id) ?? null);
  },
  async create(input: any) {
    if (records.has(input.id)) throw new Error("Duplicate");
    const row = { ...structuredClone(input), revision: 1 };
    records.set(input.id, row);
    return row;
  },
  async update(input: any) {
    const old = records.get(input.id);
    if (!old || old.revision !== input.expectedRevision) return null;
    const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
    records.set(input.id, row);
    return structuredClone(row);
  },
};
let systemCalls = 0,
  nativeOutcome = "invite-now",
  holdComparison = false;
let releaseComparison: (() => void) | undefined;
const frozenInputs: unknown[] = [];
const release = configureVillagesRuntime({
  persistence: { documents },
  logger: { debug() {}, debugOverride() {}, warn() {}, error() {}, info() {} },
  async getAgentConfig() {
    return null;
  },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[], options: any) {
          systemCalls++;
          const { checks } = JSON.parse(messages[1].content);
          frozenInputs.push(checks);
          if (holdComparison)
            await new Promise<void>((resolve, reject) => {
              releaseComparison = resolve;
              options.signal?.addEventListener("abort", () => reject(new Error("cancelled")), { once: true });
            });
          return {
            content: JSON.stringify({
              results: checks.map((check: any) => ({
                id: check.id,
                outcome: nativeOutcome,
                evidenceIds: ["answer"],
                reason: "Contextual fixture",
              })),
            }),
            finishReason: "stop",
          };
        },
      };
    },
  },
} as any);
const check: InterpretationCheck = {
  id: "room",
  domain: "room",
  question: "Did Aqua invite you into her room?",
  facts: { actorId: "aqua", zoneId: "bedroom" },
  outcomes: [
    { id: "invite-now", statement: "Aqua permits entry now." },
    { id: "refuse", statement: "Aqua refuses entry now." },
  ],
  evidence: [
    { id: "question", speakerId: "player", name: "Player", content: "Can I look at your room?" },
    { id: "answer", speakerId: "aqua", name: "Aqua", content: "Oh yeah.", current: true },
  ],
};
let number = 0;
async function operation(work: () => Promise<any>) {
  const id = `test-${++number}`;
  records.set(`villages-venue-visit-${id}`, {
    id: `villages-venue-visit-${id}`,
    revision: 1,
    name: "Scene",
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
  const root = await mkdtemp(join(tmpdir(), "villages-decision-contract-"));
  let teardown: (() => void) | undefined;
  try {
    const dist = join(root, "dist");
    await mkdir(join(dist, "services/decision"), { recursive: true });
    await mkdir(join(dist, "services/storage"), { recursive: true });
    await mkdir(join(dist, "config"), { recursive: true });
    await writeFile(join(root, "package.json"), JSON.stringify({ name: "@marinara-engine/server", type: "module" }));
    await writeFile(join(dist, "index.js"), "");
    await writeFile(join(dist, "config/build-meta.json"), JSON.stringify({ commit: "ead04150a132" }));
    await writeFile(
      join(dist, "services/storage/connections.storage.js"),
      'export const createConnectionsStorage = () => ({ getDefaultForDecision: async () => ({id:"fixture"}), getWithKey: async () => ({}) });',
    );
    await writeFile(
      join(dist, "services/storage/app-settings.storage.js"),
      "export const createAppSettingsStorage = () => ({get:async()=>null});",
    );
    await writeFile(
      join(dist, "services/decision/decision-default.js"),
      'export const DECISION_SETTINGS_KEYS = {localDefault:"local",thinkingPreGeneration:"thinking"}; export let calls=0; export let mode="yes"; export const setMode=value=>{mode=value}; export async function resolveDecisionBackend(){if(mode==="absent")return null;return {model:"fixture",maxStateTokens:30000,calibration:{defaultThreshold:0.1,questionShape:"statement"},deferPreGeneration:mode==="deferred",ask:async(state,questions)=>{calls++;if(mode==="error")throw new Error("SECRET provider body");if(mode==="missing")return null;return new Map(questions.map((question,index)=>[question.id,mode==="conflict"?1:mode==="no"?0:mode==="malformed"?NaN:index===0?0.2:0]))}}};',
    );
    const entry = join(dist, "index.js");
    const fixture = await import(pathToFileURL(join(dist, "services/decision/decision-default.js")).href);
    const modules = await loadDecisionEngineModules(entry);
    assert.equal(modules.resolveDecisionBackend, fixture.resolveDecisionBackend, "canonical live ESM module reused");
    teardown = configureDecisionsAdapter({ app: { db: {} } }, entry);
    assert.equal((await decisionAdapterStatus()).available, true);
    assert.deepEqual(await readInterpretationSettings(), { decisionsEnabled: false, compareSystem: true });
    const off = await operation(() => interpretChecks([check], "off", "visible"));
    assert.equal(off.results[0].source, "system");
    assert.equal(fixture.calls, 0);
    await saveInterpretationSettings({ decisionsEnabled: true });
    const enabled = await operation(() => interpretChecks([check], "on", "visible"));
    assert.equal(enabled.results[0].source, "decisions");
    assert.equal(systemCalls, 1, "no authoritative native vote for usable Decisions");
    assert.equal(enabled.traces[0].decisions.threshold, 0.1);
    for (const mode of ["no", "conflict", "missing", "malformed", "error", "absent", "deferred"]) {
      fixture.setMode(mode);
      const batch = await operation(() => interpretChecks([check], mode));
      assert.equal(batch.results[0].source, "system", mode);
      assert.equal(batch.results[0].outcome, "invite-now", "request failures are never refusals");
      assert.ok(!JSON.stringify(batch.traces).includes("SECRET"));
    }
    fixture.setMode("yes");
    const exhausted = await operation(async () => {
      let calls = 0;
      await coordinatedOptionalCompletion("once", async () => {
        calls++;
        throw new Error("lost answer");
      });
      await coordinatedOptionalCompletion("once", async () => {
        calls++;
        return 1;
      });
      assert.equal(calls, 1);
      return true;
    });
    assert.equal(exhausted, true);
    const deadlineStarted = performance.now();
    await operation(async () => {
      assert.equal(await coordinatedOptionalCompletion("slow", () => new Promise(() => {})), undefined);
      let afterDeadline = 0;
      assert.equal(await coordinatedOptionalCompletion("remaining", async () => ++afterDeadline), undefined);
      assert.equal(afterDeadline, 0, "whole operation allowance is exhausted, not reset per check");
    });
    assert.ok(performance.now() - deadlineStarted >= 9500 && performance.now() - deadlineStarted < 13000);
    await operation(async () => {
      assert.equal(venueInterpretationSettings().decisionsEnabled, true);
      await saveInterpretationSettings({ decisionsEnabled: false });
      assert.equal(venueInterpretationSettings().decisionsEnabled, true, "mid-operation setting is frozen");
      const replay = await venueCheckpoint("saved", () => interpretChecks([check], "saved-inner"));
      const second = await venueCheckpoint("saved", async () => {
        throw new Error("must replay");
      });
      assert.deepEqual(replay, second);
    });
    assert.equal(await operation(async () => venueInterpretationSettings().decisionsEnabled), false);
    await saveInterpretationSettings({ decisionsEnabled: true });
    enabled.traces[0].applied = "Entry offer created";
    await writeInterpretationDiagnostics("visible", enabled.traces);
    const before = structuredClone(records.get("villages-interpretation-visible").data);
    const count = systemCalls;
    holdComparison = true;
    nativeOutcome = "refuse";
    scheduleSystemComparisons("visible", enabled);
    for (let index = 0; index < 100 && !releaseComparison; index++)
      await new Promise((resolve) => setTimeout(resolve, 5));
    assert.ok(releaseComparison, "comparison dispatched independently");
    assert.equal(systemCalls, count + 1);
    assert.deepEqual(
      (frozenInputs.at(-1) as any[]).map(({ evidenceIds: _evidenceIds, ...row }) => ({
        ...row,
        evidence: enabled.checks.find((check) => check.id === row.id)?.evidence,
      })),
      enabled.checks,
      "same witnessed input without Decisions verdict",
    );
    releaseComparison!();
    for (
      let index = 0;
      index < 100 && (await readInterpretationDiagnostics("visible")).checks.at(-1)?.system.status !== "complete";
      index++
    )
      await new Promise((resolve) => setTimeout(resolve, 5));
    const compared = (await readInterpretationDiagnostics("visible")).checks.at(-1)!;
    assert.equal(compared.system.outcome, "refuse");
    assert.equal(compared.result.outcome, "invite-now");
    assert.equal(compared.applied, "Entry offer created");
    assert.deepEqual(compared.evidence, before.checks.at(-1).evidence);
    scheduleSystemComparisons("visible", enabled);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(systemCalls, count + 1, "comparison not repeated");
    holdComparison = false;
    const scores = new Map([
      ["0:0", 0],
      ["0:1", 0],
    ]);
    assert.equal(readDecisionInterpretation(check, scores, 0.1, 0), null);
    for (const text of ["Oh yeah.", "Sure, I guess. Try not to touch anything.", "Nods and steps aside."]) {
      const short = structuredClone(check);
      short.evidence[1].content = text;
      assert.equal(
        readSystemInterpretations({ results: [{ id: "room", outcome: "invite-now", evidenceIds: ["answer"] }] }, [
          short,
        ])[0].outcome,
        "invite-now",
      );
    }
    assert.equal(
      readSystemInterpretations({ results: [{ id: "room", outcome: "invite-now", evidenceIds: ["question"] }] }, [
        check,
      ])[0].outcome,
      "unresolved",
      "old question is not new permission",
    );
    const village = defaultVillageState();
    const venue: any = {
      id: "home",
      residentIds: ["aqua"],
      occupancy: { playerHome: false },
      zones: [
        { id: "exterior", name: "Exterior", kind: "exterior", venueClass: "residence" },
        { id: "hall", name: "Hall", kind: "shared-residence", venueClass: "residence" },
        {
          id: "bedroom",
          name: "Secret description",
          kind: "private-residence",
          ownerId: "aqua",
          venueClass: "residence",
        },
      ],
    };
    village.venues = [venue];
    const scene: any = {
      id: "same-scene",
      placeId: "home",
      zoneId: "bedroom",
      area: "private",
      activeIds: ["aqua"],
      participants: [{ characterId: "aqua", name: "Aqua" }],
      lines: [{ id: "unseen", role: "user", content: "secret", heardBy: [], zoneId: "hall" }],
      grantedZoneIds: ["hall", "bedroom"],
      enteredFromZoneId: "hall",
    };
    const checks = roomInterpretationChecks(
      scene,
      village,
      "I ask",
      [{ speakerId: "aqua", content: "Leave.", kind: "dialogue", heardBy: ["aqua"] }],
      "key",
      [],
    );
    assert.ok(checks.length);
    assert.ok(!JSON.stringify(checks).includes("secret"));
    assert.ok(!JSON.stringify(checks).includes("Secret description"));
    assert.equal(dismissalDestination(village, venue, scene), "hall");
    const dismiss = {
      ...enabled,
      checks: [check],
      results: [{ outcome: "dismiss", source: "system" as const, evidenceIds: ["answer"], reason: "" }],
      traces: [structuredClone(enabled.traces[0])],
    };
    applyInterpretedRoomEvents(scene, dismiss, village);
    assert.equal(scene.id, "same-scene");
    assert.equal(scene.zoneId, "hall");
    assert.deepEqual(scene.dismissedZoneIds, ["bedroom"]);
    assert.ok(!scene.grantedZoneIds.includes("bedroom"));
    const rejected = structuredClone(scene);
    rejected.zoneId = "bedroom";
    venue.zones[2].ownerId = "someone-else";
    applyInterpretedRoomEvents(rejected, dismiss, village);
    assert.equal(rejected.zoneId, "bedroom");
    await assert.rejects(() => loadDecisionEngineModules(join(root, "unsupported.ts")));
    console.log("villages-interpretation: ok");
  } finally {
    stopInterpretationComparisons();
    teardown?.();
    release();
    await rm(root, { recursive: true, force: true });
  }
}
void main();
