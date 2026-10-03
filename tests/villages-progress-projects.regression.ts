import assert from "node:assert/strict";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.ts";
import {
  acceptProjectRequirements,
  createNewVenueProject,
  createRenovationProject,
  reviseRenovationProject,
  renewRenovationApprovals,
  deliverProjectMaterial,
  lockProjectBuilder,
  openFinishedProject,
  placeNewVenueProject,
  reconcileProjectLifecycles,
  startProjectConstruction,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-lifecycle.ts";
import {
  recordExistingProjectSource,
  recordProjectSpokenEvidence,
  reallocateHeldProjectSupply,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-evidence.ts";
import {
  createProgressTask,
  revealProgress,
  visibleProgress,
} from "../packages/villages/src/engine/packages/server/src/services/villages/progress-engine.ts";
import {
  processSavedProgressSubmission,
  processSavedExchange,
  readSceneChanges,
  progressBacklog,
  startProgressRecovery,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.ts";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import { createExchangeProcessing } from "../packages/villages/src/engine/packages/server/src/services/villages/exchange-processing.ts";
import {
  coerceVillageState,
  defaultVillageState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.ts";
import type {
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.ts";

const records = new Map<string, any>();
let faultTask = "",
  faultAfterWrite = false;
const documents = {
  async getById(_packageId: string, id: string) {
    return records.get(id) ?? null;
  },
  async list(_packageId: string, kind: string) {
    return [...records.values()].filter((row) => row.kind === kind);
  },
  async create(input: any) {
    const row = { ...input, revision: 1 };
    records.set(input.id, row);
    return row;
  },
  async update(input: any) {
    const previous = records.get(input.id);
    if (!previous || previous.revision !== input.expectedRevision) return null;
    const addedReceipt =
      faultTask &&
      input.id === "villages-village" &&
      (input.data.progressTasks.find((task: any) => task.definition.id === faultTask)?.receipts.length ?? 0) >
        (previous.data.progressTasks.find((task: any) => task.definition.id === faultTask)?.receipts.length ?? 0);
    if (addedReceipt && !faultAfterWrite) throw new Error("Project owner write failed");
    const row = { ...previous, ...input, revision: previous.revision + 1 };
    records.set(input.id, row);
    if (addedReceipt && faultAfterWrite) throw new Error("Project owner acknowledgement lost");
    return row;
  },
  async remove(_packageId: string, id: string) {
    return records.delete(id);
  },
};
const foundedAt = new Date().toISOString();
const village = defaultVillageState();
village.seed = "project-fixture";
village.setupAt = foundedAt;
village.foundedAt = foundedAt;
village.progressEngineVersion = 1;
const mill: VillageVenue = {
  id: "mill",
  name: "Old Mill",
  playerSeenPublic: true,
  classes: ["workplace"],
  spaces: [defaultVenueSpace("workplace", "A working mill.")],
  description: "A working mill.",
  category: "",
  presentation: { image: null, x: 0.3, y: 0.3 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: [],
  workerIds: ["rosa"],
  residenceCapacity: 1,
  residentIds: [],
  improvements: [null, null],
  state: { condition: "standing", upgrades: [], furniture: ["benches"], publicFacts: [], updatedAt: foundedAt },
};
village.venues.push(mill);
for (const [id, name] of [
  ["rosa", "Rosa"],
  ["ivo", "Ivo"],
])
  village.villagers.push({
    characterId: id,
    cardSnapshot: { id, revision: 1, sourceStatus: "available", name, capturedAt: foundedAt },
    agenda: unwrittenVillageAgenda(village.venues, name),
    addedAt: foundedAt,
    completedWishes: [],
  } as VillageVillager);
records.set("villages-village", { id: "villages-village", kind: "village", data: village, revision: 1 });
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => true,
  persistence: { documents },
  languageModels: {
    async resolveForRequest() {
      throw new Error("Progress verification must not call a model");
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);

let turnNumber = 0;
function saveTurn(message: string, content: string, speakerId = "rosa", venueId = "mill") {
  const number = ++turnNumber;
  const sessionId = `visit-${number}`;
  const submissionId = `turn-${number}`;
  const lineId = `line-${number}`;
  const at = new Date(Date.now() + 60_000 + number * 1_000).toISOString();
  records.set(`villages-venue-visit-${sessionId}`, {
    id: `villages-venue-visit-${sessionId}`,
    kind: "venue-visit",
    revision: 1,
    data: {
      id: sessionId,
      placeId: venueId,
      placeName: venueId,
      status: "closed",
      startedAt: at,
      participants: [{ characterId: speakerId, name: speakerId }],
      activeIds: [speakerId],
      submissions: [
        {
          id: submissionId,
          message,
          mode: "chat",
          targetId: speakerId,
          activeIdsAtTurn: [speakerId],
          replyLineIds: [lineId],
          at,
        },
      ],
      lines: [
        { id: `user-${number}`, speakerId: "", role: "user", content: message, at, heardBy: [speakerId] },
        { id: lineId, speakerId, role: "assistant", kind: "dialogue", content, at, heardBy: [speakerId] },
      ],
    },
  });
  return { sessionId, submissionId, lineId, at };
}

async function main() {
  try {
    assert.equal(coerceVillageState({ ...village, progressEngineVersion: undefined }).progressEngineVersion, 1);
    assert.throws(() => coerceVillageState({ ...village, progressEngineVersion: 0 }), /retired Project engine/);
    await mutateVillageState((current) =>
      current.progressTasks.push(
        createProgressTask({
          id: "hidden:test",
          revision: 1,
          owner: { kind: "test", id: "hidden" },
          resolver: "progress.noop",
          phases: [
            {
              id: "noticed",
              title: "A resident notices",
              requirements: [
                {
                  id: "line",
                  title: "Hear a resident",
                  routes: [
                    {
                      id: "saved",
                      verifier: "core.saved-event",
                      params: { speakerId: "rosa", venueId: "mill" },
                      automatic: true,
                      evidenceKinds: ["saved-resident-line"],
                    },
                  ],
                },
              ],
            },
            {
              id: "again",
              title: "Hear another turn",
              requirements: [
                {
                  id: "second-line",
                  title: "Another saved turn",
                  routes: [
                    {
                      id: "saved",
                      verifier: "core.saved-event",
                      params: { speakerId: "rosa", venueId: "mill" },
                      automatic: true,
                      evidenceKinds: ["saved-resident-line"],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    );
    const hiddenFirst = saveTurn("A visit before disclosure", "I was here.");
    assert.equal(
      (await progressBacklog()).some((turn) => turn.submissionId === hiddenFirst.submissionId),
      true,
    );
    await processSavedProgressSubmission(hiddenFirst.sessionId, hiddenFirst.submissionId);
    let hiddenTask = (await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")!;
    assert.equal(hiddenTask.phaseIndex, 1);
    assert.equal(visibleProgress(hiddenTask), null);
    const hiddenDocument = records.get(`villages-venue-visit-${hiddenFirst.sessionId}`);
    hiddenDocument.data.submissions[0].progressProcessedAt = ""; // interruption after the Village write
    await processSavedProgressSubmission(hiddenFirst.sessionId, hiddenFirst.submissionId);
    hiddenTask = (await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")!;
    assert.equal(hiddenTask.phaseIndex, 1); // replay cannot use the same line in a later phase
    saveTurn("Another day", "I returned.");
    const stopRecovery = startProgressRecovery();
    for (let attempt = 0; attempt < 30; attempt++) {
      if ((await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")?.resolvedAt)
        break;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    stopRecovery();
    await mutateVillageState((current) =>
      revealProgress(
        current.progressTasks.find((task) => task.definition.id === "hidden:test")!,
        new Date().toISOString(),
      ),
    );
    hiddenTask = (await readVillageState()).progressTasks.find((task) => task.definition.id === "hidden:test")!;
    assert.equal(hiddenTask.resolutionKey, "hidden:test:1:resolved");
    assert.equal(hiddenTask.receipts.length, 2);
    assert.ok(visibleProgress(hiddenTask));
    const recorded = saveTurn("A recorded exchange", "We can discuss the mill.");
    const recordedScene = records.get(`villages-venue-visit-${recorded.sessionId}`).data;
    recordedScene.processingVersion = 1;
    recordedScene.villageSeed = village.seed;
    recordedScene.submissions[0].processing = createExchangeProcessing({
      seed: village.seed,
      sceneId: recorded.sessionId,
      submissionId: recorded.submissionId,
      order: 0,
      lineIds: recordedScene.lines.map((line: any) => line.id),
      actionReceiptIds: [],
    });
    const beforeReads = JSON.stringify([...records.values()]);
    const changes = await readSceneChanges(recorded.sessionId);
    assert.equal(changes.changes[0].processing?.domains.projects.status, "pending");
    assert.equal(JSON.stringify([...records.values()]), beforeReads, "diagnostic reads do not write or generate");
    await processSavedExchange(recorded.sessionId, recorded.submissionId);
    assert.equal(
      (await readSceneChanges(recorded.sessionId)).changes[0].processing?.domains.projects.status,
      "applied",
    );
    recordedScene.submissions[0].processing.seed = "replaced-village";
    recordedScene.submissions[0].processing.domains.projects.status = "pending";
    // Replace the stored document, rather than the pre-commit fixture object.
    records.get(`villages-venue-visit-${recorded.sessionId}`).data = recordedScene;
    await processSavedExchange(recorded.sessionId, recorded.submissionId);
    assert.equal(
      (await readSceneChanges(recorded.sessionId)).changes[0].processing?.domains.projects.status,
      "rejected",
    );
    await assert.rejects(readSceneChanges(recorded.sessionId, "-1"), /cursor/);
    const lastChanges = await readSceneChanges(recorded.sessionId);
    assert.equal((await readSceneChanges(recorded.sessionId, lastChanges.nextCursor)).changes.length, 0);
    for (const after of [false, true]) {
      const taskId = "fault-project-" + after;
      await mutateVillageState((current) =>
        current.progressTasks.push(
          createProgressTask({
            id: taskId,
            revision: 1,
            owner: { kind: "test", id: taskId },
            resolver: "progress.noop",
            phases: [
              {
                id: "evidence",
                title: "Witnessed evidence",
                requirements: [
                  {
                    id: "line",
                    title: "Hear Rosa",
                    routes: [
                      {
                        id: "saved",
                        verifier: "core.saved-event",
                        params: { speakerId: "rosa", venueId: "mill" },
                        automatic: true,
                        evidenceKinds: ["saved-resident-line"],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        ),
      );
      const turn = saveTurn("A new Project exchange", "I checked this condition.");
      const saved = records.get("villages-venue-visit-" + turn.sessionId).data;
      saved.processingVersion = 1;
      saved.villageSeed = village.seed;
      const submission = saved.submissions[0];
      submission.wishProposals = [];
      submission.wishProposalError = "";
      submission.processing = createExchangeProcessing({
        seed: village.seed,
        sceneId: turn.sessionId,
        submissionId: turn.submissionId,
        order: 0,
        lineIds: saved.lines.map((line: any) => line.id),
        actionReceiptIds: [],
      });
      for (const domain of ["memories", "relationships"]) submission.processing.domains[domain].status = "applied";
      faultTask = taskId;
      faultAfterWrite = after;
      await processSavedExchange(turn.sessionId, turn.submissionId);
      faultTask = "";
      await processSavedExchange(turn.sessionId, turn.submissionId);
      await processSavedExchange(turn.sessionId, turn.submissionId);
      assert.equal(
        (await readVillageState()).progressTasks.find((task) => task.definition.id === taskId)!.receipts.length,
        1,
        "the Project effect and its receipt survive replay once",
      );
    }
    await createNewVenueProject({
      name: "Lantern House",
      venueClass: "gathering",
      description: "A hall for evenings.",
    });
    const projectId = (await readVillageState()).projects.find((entry) => entry.kind === "new-venue")!.id;
    let state = await readVillageState();
    assert.equal(
      state.progressTasks.find((task) => task.definition.owner.id === projectId)?.definition.phases[0]?.id,
      "concept",
    );
    await placeNewVenueProject(projectId, { x: 0.7, y: 0.7 });
    state = await readVillageState();
    assert.equal(state.progressTasks.find((task) => task.definition.owner.id === projectId)?.phaseIndex, 1);
    const absent = saveTurn("Will you build Lantern House?", "I will build Lantern House.");
    records.get(`villages-venue-visit-${absent.sessionId}`).data.submissions[0].activeIdsAtTurn = [];
    await assert.rejects(recordProjectSpokenEvidence(projectId, { kind: "builder", ...absent }), /while present/u);
    const elsewhere = saveTurn("Will you build Lantern House?", "I will build Lantern House.", "rosa", "unknown");
    await assert.rejects(recordProjectSpokenEvidence(projectId, { kind: "builder", ...elsewhere }), /Village Venue/u);
    const stale = saveTurn("Will you build Lantern House?", "I will build Lantern House.");
    records.get(`villages-venue-visit-${stale.sessionId}`).data.submissions[0].at = "2020-01-01T00:00:00.000Z";
    await assert.rejects(recordProjectSpokenEvidence(projectId, { kind: "builder", ...stale }), /fresh visit/u);
    const builder = saveTurn("Will you build Lantern House?", "I will build Lantern House.");
    await recordProjectSpokenEvidence(projectId, { kind: "builder", ...builder });
    await lockProjectBuilder(projectId, { residentId: "rosa" });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.lifecycle?.phase, "requirements");
    const plan = saveTurn(
      "What does Lantern House need?",
      "Structure: timber; Equipment: benches; Finish: not needed.",
    );
    await recordProjectSpokenEvidence(projectId, { kind: "requirements", ...plan });
    await acceptProjectRequirements(projectId);
    state = await readVillageState();
    const flow = state.projects.find((entry) => entry.id === projectId)!.lifecycle!;
    assert.equal(flow.phase, "materials");
    const timberId = flow.requirements.find((entry) => entry.title === "timber")!.id;
    const benchesId = flow.requirements.find((entry) => entry.title === "benches")!.id;
    const unrelated = saveTurn("Is there anything else?", "I can supply timber.", "ivo", "mill");
    await recordProjectSpokenEvidence(projectId, { kind: "offer", requirementId: timberId, ...unrelated });
    const timber = saveTurn(
      "May I take the timber for Lantern House?",
      "Here is timber for Lantern House.",
      "ivo",
      "mill",
    );
    await recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: timberId, ...timber });
    await recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: timberId, ...timber });
    await recordExistingProjectSource(projectId, { requirementId: benchesId, venueId: "mill" });
    const benches = saveTurn("May I take the benches for Lantern House?", "Here are benches for Lantern House.");
    await mutateVillageState((current) => {
      current.venues.find((venue) => venue.id === "mill")!.state.furniture = [];
    });
    await assert.rejects(
      recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: benchesId, ...benches }),
      /no longer available/u,
    );
    await mutateVillageState((current) => {
      current.venues.find((venue) => venue.id === "mill")!.state.furniture = ["benches"];
    });
    await recordProjectSpokenEvidence(projectId, { kind: "handoff", requirementId: benchesId, ...benches });
    state = await readVillageState();
    assert.equal(state.venues.find((entry) => entry.id === "mill")?.state.furniture.includes("benches"), false);
    assert.equal(state.projectSourceClaims.length, 1);
    const task = state.progressTasks.find((entry) => entry.definition.owner.id === projectId)!;
    assert.equal(task.receipts.filter((receipt) => receipt.requirementId.startsWith("acquired:")).length, 2);
    const replacement = saveTurn("Will you build Lantern House instead?", "I will build Lantern House.", "ivo");
    await recordProjectSpokenEvidence(projectId, { kind: "builder", ...replacement });
    await lockProjectBuilder(projectId, { residentId: "ivo" });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.lifecycle?.heldSupplies.length, 2);
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.revisionHistory.length,
      2,
    );
    const revisedPlan = saveTurn(
      "What does Lantern House need now?",
      "Structure: timber; Equipment: benches; Finish: not needed.",
      "ivo",
    );
    await recordProjectSpokenEvidence(projectId, { kind: "requirements", ...revisedPlan });
    await acceptProjectRequirements(projectId);
    state = await readVillageState();
    const revised = state.projects.find((entry) => entry.id === projectId)!.lifecycle!;
    for (const requirement of revised.requirements.filter((entry) => entry.needed)) {
      const held = revised.heldSupplies.find((entry) => entry.itemName === requirement.title)!;
      await reallocateHeldProjectSupply(projectId, { requirementId: requirement.id, heldId: held.id });
    }
    state = await readVillageState();
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.revisionHistory.length,
      3,
    );
    await deliverProjectMaterial(projectId, { requirementId: timberId });
    await deliverProjectMaterial(projectId, { requirementId: benchesId });
    await startProjectConstruction(projectId);
    state = await readVillageState();
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.definition.phases[
        state.progressTasks.find((entry) => entry.definition.owner.id === projectId)!.phaseIndex
      ]?.id,
      "construction",
    );
    await mutateVillageState((current) => {
      current.villagers = current.villagers.filter((resident) => resident.characterId !== "ivo");
      reconcileProjectLifecycles(current, new Date());
    });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.status, "blocked");
    assert.equal(state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.phaseIndex, 4);
    const continuing = saveTurn("Can you finish Lantern House?", "I will build Lantern House.", "rosa");
    await recordProjectSpokenEvidence(projectId, { kind: "builder", ...continuing });
    await lockProjectBuilder(projectId, { residentId: "rosa" });
    state = await readVillageState();
    const workEnd = state.projects.find((entry) => entry.id === projectId)!.lifecycle!.workOrder!.completesAt;
    await mutateVillageState((current) => reconcileProjectLifecycles(current, new Date(workEnd)));
    await openFinishedProject(projectId, {
      layoutVersion: 1,
      layout: "both",
      spaces: [{ venueClass: "gathering", description: "Tables and a hearth." }],
      form: "A timber hall",
      exteriorDescription: "Warm windows.",
      interiorDescription: "Tables and a hearth.",
      privateSpaces: [
        {
          id: "restricted:archive",
          venueClass: "gathering",
          name: "Archive",
          purpose: "Store records",
          controllerIds: ["player"],
          description: "An authored archive",
        },
      ],
      imageContext: { useAssignedVillagerContext: false, useVisualLore: false },
    });
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === projectId)?.status, "complete");
    const openedVenue = state.venues.find((entry) => entry.buildProjectId === projectId);
    const privateRoom = openedVenue.zones.find((zone) => zone.id === "restricted:archive");
    assert.equal(privateRoom.description, "An authored archive");
    assert.deepEqual(privateRoom.controllerIds, ["player"]);
    assert.ok(privateRoom.preparation, "private preparation belongs to the opening flow");
    assert.deepEqual(openedVenue.imageContext, { useAssignedVillagerContext: false, useVisualLore: false });
    assert.equal(
      state.progressTasks.find((entry) => entry.definition.owner.id === projectId)?.resolutionKey,
      `project:${projectId}:4:resolved`,
    );
    assert.equal(
      state.venues.filter((entry) => entry.buildProjectId === projectId && entry.constructionStatus === "complete")
        .length,
      1,
    );
    await assert.rejects(
      openFinishedProject(projectId, {
        form: "A timber hall",
        exteriorDescription: "Warm windows.",
        interiorDescription: "Tables and a hearth.",
      }),
      /Construction must finish|phase and verified progress/u,
    );
    assert.equal(
      (await readVillageState()).progressTasks
        .find((entry) => entry.definition.owner.id === projectId)
        ?.receipts.filter((receipt) => receipt.requirementId === "opened").length,
      1,
    );
    assert.deepEqual(coerceVillageState(state).progressTasks, state.progressTasks);
    assert.ok(state.progressTasks.find((entry) => entry.definition.owner.id === projectId)!.attempts.length >= 4);
    await createRenovationProject("mill", {
      title: "Mill roof",
      detail: "Weatherproof the working mill.",
      slot: 0,
      improvement: { title: "New roof", description: "A sound timber roof.", extraBeds: 0 },
    });
    state = await readVillageState();
    const renovationId = state.projects.find((entry) => entry.kind === "renovation")!.id;
    assert.equal(state.projects.find((entry) => entry.id === renovationId)?.lifecycle?.phase, "approval");
    const approval = saveTurn("Do you approve Mill roof?", "Yes, I approve Mill roof.");
    await recordProjectSpokenEvidence(renovationId, { kind: "approval", ...approval });
    await reviseRenovationProject(renovationId, {
      title: "Mill roof",
      detail: "Weatherproof with improved beams.",
      slot: 0,
      improvement: { title: "New roof", description: "A sound timber roof with stronger beams.", extraBeds: 0 },
    });
    state = await readVillageState();
    assert.deepEqual(
      state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.approvals,
      [],
      "revised terms clear old approvals",
    );
    assert.equal(state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.phase, "approval");
    await assert.rejects(
      recordProjectSpokenEvidence(renovationId, { kind: "approval", ...approval }),
      /revision|used|phase|definition|already/i,
    );
    const revisedApproval = saveTurn(
      "Do you approve Mill roof with stronger beams?",
      "Yes, I approve Mill roof with stronger beams.",
    );
    await recordProjectSpokenEvidence(renovationId, { kind: "approval", ...revisedApproval });
    const renovationBuilder = saveTurn("Will you build Mill roof?", "I will build Mill roof.");
    await recordProjectSpokenEvidence(renovationId, { kind: "builder", ...renovationBuilder });
    await lockProjectBuilder(renovationId, { residentId: "rosa" });
    const renovationPlan = saveTurn(
      "What does Mill roof need?",
      "Structure: not needed; Equipment: not needed; Finish: not needed.",
    );
    await recordProjectSpokenEvidence(renovationId, { kind: "requirements", ...renovationPlan });
    await acceptProjectRequirements(renovationId);
    await startProjectConstruction(renovationId);
    state = await readVillageState();
    await mutateVillageState((current) =>
      reconcileProjectLifecycles(
        current,
        new Date(current.projects.find((entry) => entry.id === renovationId)!.lifecycle!.workOrder!.completesAt),
      ),
    );
    await assert.rejects(openFinishedProject(renovationId, { improvement: null }), /Reviewed structural terms/);
    await mutateVillageState((current) => {
      current.villagers.push({
        ...structuredClone(current.villagers.find((entry) => entry.characterId === "rosa")!),
        characterId: "new-worker",
        cardSnapshot: {
          ...current.villagers.find((entry) => entry.characterId === "rosa")!.cardSnapshot,
          id: "new-worker",
        },
      });
      current.venues.find((entry) => entry.id === "mill")!.workerIds!.push("new-worker");
    });
    await assert.rejects(openFinishedProject(renovationId, {}), /Renew.*approvals/);
    const completedReceipts = (await readVillageState()).progressTasks
      .find((task) => task.definition.owner.id === renovationId)!
      .receipts.filter((receipt) => receipt.phaseId !== "approval")
      .map((receipt) => receipt.id);
    await renewRenovationApprovals(renovationId);
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.phase, "approval");
    const renewedApproval = saveTurn("Do you approve Mill roof?", "Yes, I approve Mill roof.", "new-worker");
    await recordProjectSpokenEvidence(renovationId, { kind: "approval", ...renewedApproval });
    state = await readVillageState();
    assert.equal(
      state.projects.find((entry) => entry.id === renovationId)!.lifecycle!.phase,
      "finishing",
      "renewed roster preserves completed construction",
    );
    assert.deepEqual(
      state.progressTasks
        .find((task) => task.definition.owner.id === renovationId)!
        .receipts.filter((receipt) => receipt.phaseId !== "approval")
        .map((receipt) => receipt.id),
      completedReceipts,
    );
    await openFinishedProject(renovationId, {});
    state = await readVillageState();
    assert.equal(state.projects.find((entry) => entry.id === renovationId)?.status, "complete");
    assert.equal(state.venues.find((entry) => entry.id === "mill")?.improvements?.[0]?.title, "New roof");
    assert.ok(state.progressTasks.find((entry) => entry.definition.owner.id === renovationId)?.resolutionKey);
    console.log(
      "Villages Progress Project regression: cited offer, finite handoff, item debit, phases, clock, resolution ok",
    );
  } finally {
    release();
  }
}
void main();
