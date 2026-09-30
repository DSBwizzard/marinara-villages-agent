import assert from "node:assert/strict";
import {
  acceptProjectRequirements,
  applyProjectMailboxDecisions,
  createNewVenueProject,
  createRenovationProject,
  debugCompleteProjectConstruction,
  deliverProjectMaterial,
  lockProjectBuilder,
  openFinishedProject,
  placeNewVenueProject,
  reconcileProjectLifecycles,
  recordProjectConversation,
  startProjectConstruction,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-lifecycle.ts";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.ts";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  coerceVillageState,
  defaultVillageState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.ts";
import { removeVillager } from "../packages/villages/src/engine/packages/server/src/services/villages/village.ts";
import { recheckRecentBuilderConversations } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-session.ts";
import type {
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.ts";

const at = "2026-09-28T12:00:00.000Z";
const records = new Map<string, any>();
const documents = {
  async getById(_packageId: string, id: string) {
    return records.get(id) ?? null;
  },
  async list(_packageId: string, kind: string) {
    return [...records.values()].filter((entry) => entry.kind === kind);
  },
  async create(input: any) {
    const row = { ...input, revision: 1 };
    records.set(input.id, row);
    return row;
  },
  async update(input: any) {
    const previous = records.get(input.id);
    if (!previous || previous.revision !== input.expectedRevision) return null;
    const row = { ...previous, ...input, revision: previous.revision + 1 };
    records.set(input.id, row);
    return row;
  },
  async remove(_packageId: string, id: string) {
    return records.delete(id);
  },
};
const village = defaultVillageState();
village.setupAt = at;
village.foundedAt = at;
const mill: VillageVenue = {
  id: "mill",
  name: "Old Mill",
  classes: ["workplace"],
  spaces: [defaultVenueSpace("workplace", "The village mill.")],
  description: "The village mill.",
  category: "",
  presentation: { image: null, x: 0.3, y: 0.3 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: [],
  workerIds: ["rosa"],
  residenceCapacity: 1,
  residentIds: [],
  improvements: [null, null],
  state: { condition: "standing", upgrades: [], furniture: [], publicFacts: [], updatedAt: at },
};
village.venues.push(mill);
for (const [id, name] of [
  ["rosa", "Rosa"],
  ["ivo", "Ivo"],
])
  village.villagers.push({
    characterId: id,
    cardSnapshot: { id, revision: 1, sourceStatus: "available", name, capturedAt: at },
    agenda: unwrittenVillageAgenda(village.venues, name),
    addedAt: at,
    completedWishes: [],
  } as VillageVillager);
records.set("villages-village", { id: "villages-village", kind: "village", data: village, revision: 1 });
let modelEvents: unknown[] = [];
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => true,
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  persistence: { documents },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 1400,
        fitContext(messages: any[], options: any) {
          return { messages, maxTokens: options.maxTokens };
        },
        async chatComplete() {
          return { content: JSON.stringify({ events: modelEvents }) };
        },
      };
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);

async function main() {
  try {
    await createNewVenueProject({
      name: "Lantern House",
      venueClass: "gathering",
      description: "A warm room for village evenings.",
    });
    const id = (await readVillageState()).projects.find((row) => row.kind === "new-venue")!.id;
    await assert.rejects(
      createNewVenueProject({ name: "Second", venueClass: "other", description: "Another place." }),
      /current New Venue/u,
    );
    await assert.rejects(startProjectConstruction(id), /Deliver every/u);
    await assert.rejects(lockProjectBuilder(id, { residentId: "rosa" }), /phase/u);
    await placeNewVenueProject(id, { x: 0.7, y: 0.7 });
    assert.equal(
      (await readVillageState()).venues.find((row) => row.buildProjectId === id)?.constructionStatus,
      "worksite",
    );
    await mutateVillageState((state) => {
      state.projects.find((row) => row.id === id)!.venueDraft!.description =
        "The lookout rests in an ironwood tree above the road.";
    });
    modelEvents = [];
    await recordProjectConversation({
      submissionId: "unrelated-offer",
      venueId: "mill",
      playerMessage: "Do you want to build cabinets for the mill?",
      lines: [{ id: "unrelated-line", speakerId: "rosa", content: "I'll do it." }],
      context: [],
      at,
    });
    assert.equal((await readVillageState()).projects.find((row) => row.id === id)?.lifecycle?.candidates.length, 0);
    const replayAt = new Date(Date.now() + 1_000).toISOString();
    records.set("villages-venue-visit-builder-replay", {
      id: "villages-venue-visit-builder-replay",
      kind: "venue-visit",
      revision: 1,
      data: {
        id: "builder-replay",
        status: "closed",
        placeId: "mill",
        startedAt: replayAt,
        participants: [{ characterId: "ivo", name: "Ivo" }],
        submissions: [
          {
            id: "replay-turn",
            mode: "chat",
            message: "Do you want to build the lookout on the ironwood tree?",
            at: replayAt,
          },
        ],
        lines: [
          { id: "replay-user", role: "user", speakerId: "", content: "Build the ironwood tree lookout?", at: replayAt },
          {
            id: "replay-offer",
            role: "assistant",
            speakerId: "ivo",
            content: "I'll do it. Bird lady doesn't need to know what's up there.",
            at: replayAt,
          },
        ],
      },
    });
    await recheckRecentBuilderConversations(id);
    await recheckRecentBuilderConversations(id);
    assert.deepEqual(
      (await readVillageState()).projects
        .find((row) => row.id === id)
        ?.lifecycle?.candidates.map((row) => row.evidenceId),
      ["replay-offer"],
    );
    records.delete("villages-venue-visit-builder-replay");
    await mutateVillageState((state) => {
      const flow = state.projects.find((row) => row.id === id)!.lifecycle!;
      flow.candidates = [];
      flow.evidenceIds = [];
    });
    await recordProjectConversation({
      submissionId: "lookout-offer",
      venueId: "mill",
      playerMessage: "Do you want to build the lookout on the ironwood tree?",
      lines: [
        { id: "lookout-reference", speakerId: "rosa", content: "The tree." },
        { id: "lookout-acceptance", speakerId: "rosa", content: "I'll do it." },
      ],
      context: [],
      at,
    });
    assert.deepEqual(
      (await readVillageState()).projects
        .find((row) => row.id === id)
        ?.lifecycle?.candidates.map((row) => row.evidenceId),
      ["lookout-acceptance"],
    );
    const line = { id: "builder-offer", speakerId: "rosa", content: "I can build Lantern House." };
    modelEvents = [
      { projectId: id, kind: "builder-agreement", residentId: "rosa", lineId: line.id, quote: line.content },
    ];
    const conversation = {
      submissionId: "builder-visit",
      venueId: "mill",
      playerMessage: "Could you build Lantern House?",
      lines: [line],
      context: [],
      at,
    };
    await recordProjectConversation(conversation);
    await recordProjectConversation(conversation);
    assert.equal((await readVillageState()).projects.find((row) => row.id === id)?.lifecycle?.candidates.length, 1);
    await mutateVillageState((state) => {
      const flow = state.projects.find((row) => row.id === id)!.lifecycle!;
      flow.candidates = [
        { residentId: "rosa", evidenceId: "visit-rosa", at },
        { residentId: "ivo", evidenceId: "visit-ivo", at },
      ];
    });
    await lockProjectBuilder(id, { residentId: "rosa" });
    await assert.rejects(acceptProjectRequirements(id), /complete requirements/u);
    const planLine = {
      id: "builder-plan",
      speakerId: "rosa",
      content: "Lantern House needs timber and benches; no need for finishing supplies.",
    };
    modelEvents = [
      {
        projectId: id,
        kind: "requirements",
        residentId: "rosa",
        lineId: planLine.id,
        quote: planLine.content,
        items: [
          { category: "structure", title: "timber", needed: true },
          { category: "equipment", title: "benches", needed: true },
          { category: "finish", title: "none", needed: false },
        ],
      },
    ];
    await recordProjectConversation({
      submissionId: "plan-visit",
      venueId: "mill",
      playerMessage: "What does Lantern House need?",
      lines: [planLine],
      context: [],
      at,
    });
    assert.equal((await readVillageState()).projects.find((row) => row.id === id)?.lifecycle?.requirements.length, 3);
    await lockProjectBuilder(id, { residentId: "ivo" });
    assert.equal((await readVillageState()).projects.find((row) => row.id === id)?.lifecycle?.requirements.length, 0);
    await mutateVillageState((state) => {
      const flow = state.projects.find((row) => row.id === id)!.lifecycle!;
      flow.requirementsEvidenceId = "visit-plan-ivo";
      flow.requirements = ["structure", "equipment", "finish"].map((category) => ({
        id: category,
        category: category as "structure" | "equipment" | "finish",
        title: category,
        needed: true,
        carriedAt: "",
        deliveredAt: "",
      }));
    });
    await acceptProjectRequirements(id);
    for (const requirementId of ["structure", "equipment", "finish"]) {
      const supplyLine = {
        id: `supply-${requirementId}`,
        speakerId: "rosa",
        content: `Here is ${requirementId} for Lantern House.`,
      };
      modelEvents = [
        { projectId: id, kind: "supply", residentId: "rosa", lineId: supplyLine.id, quote: supplyLine.content },
      ];
      const supplyVisit = {
        submissionId: supplyLine.id,
        venueId: "mill",
        playerMessage: `Can I take ${requirementId} to Lantern House?`,
        lines: [supplyLine],
        context: [],
        at,
      };
      await recordProjectConversation(supplyVisit);
      await recordProjectConversation(supplyVisit);
      await deliverProjectMaterial(id, { requirementId });
      await deliverProjectMaterial(id, { requirementId });
    }
    await startProjectConstruction(id, new Date(at));
    let state = await readVillageState();
    assert.equal(
      Date.parse(state.projects.find((row) => row.id === id)!.lifecycle!.workOrder!.completesAt) - Date.parse(at),
      86_400_000,
    );
    assert.equal(state.villagers.find((row) => row.characterId === "ivo")?.agenda?.projectWork?.projectId, id);
    await removeVillager("ivo");
    state = await readVillageState();
    assert.equal(state.projects.find((row) => row.id === id)?.status, "blocked");
    assert.ok(state.projects.find((row) => row.id === id)?.lifecycle?.workOrder?.pausedAt);
    await lockProjectBuilder(id, { residentId: "rosa" });
    state = await readVillageState();
    assert.equal(state.projects.find((row) => row.id === id)?.status, "building");
    await mutateVillageState((current) =>
      reconcileProjectLifecycles(
        current,
        new Date(current.projects.find((row) => row.id === id)!.lifecycle!.workOrder!.completesAt),
      ),
    );
    assert.equal((await readVillageState()).projects.find((row) => row.id === id)?.lifecycle?.phase, "finishing");
    await assert.rejects(openFinishedProject(id, { form: "hall" }), /form, exterior, and interior/u);
    await openFinishedProject(id, {
      form: "A low timber hall",
      exteriorDescription: "Warm light at the door.",
      interiorDescription: "Tables gather round a hearth.",
    });
    state = await readVillageState();
    assert.equal(state.projects.find((row) => row.id === id)?.status, "complete");
    assert.equal(state.venues.find((row) => row.buildProjectId === id)?.constructionStatus, "complete");
    await createNewVenueProject({ name: "Quiet Shed", venueClass: "other", description: "A modest shed." });
    const debugId = (await readVillageState()).projects.find((row) => row.venueDraft?.name === "Quiet Shed")!.id;
    await placeNewVenueProject(debugId, { x: 0.85, y: 0.85 });
    await mutateVillageState((current) => {
      current.projects
        .find((row) => row.id === debugId)!
        .lifecycle!.candidates.push({ residentId: "rosa", evidenceId: "debug-offer", at });
    });
    await lockProjectBuilder(debugId, { residentId: "rosa" });
    await mutateVillageState((current) => {
      const flow = current.projects.find((row) => row.id === debugId)!.lifecycle!;
      flow.requirementsEvidenceId = "debug-plan";
      flow.requirements = (["structure", "equipment", "finish"] as const).map((category) => ({
        id: category,
        category,
        title: "Not needed",
        needed: false,
        carriedAt: "",
        deliveredAt: "",
      }));
    });
    await acceptProjectRequirements(debugId);
    await startProjectConstruction(debugId);
    await debugCompleteProjectConstruction(debugId);
    assert.equal((await readVillageState()).projects.find((row) => row.id === debugId)?.lifecycle?.phase, "finishing");
    await createRenovationProject("mill", {
      title: "Mill gallery",
      detail: "An upstairs gallery for the mill.",
      classes: ["workplace", "gathering"],
    });
    const renovation = (await readVillageState()).projects.find((row) => row.kind === "renovation")!;
    await assert.rejects(
      createRenovationProject("mill", { title: "Another", detail: "Another change.", capacity: 2 }),
      /current Renovation/u,
    );
    assert.equal(renovation.lifecycle?.phase, "approval");
    await mutateVillageState((current) =>
      applyProjectMailboxDecisions(current, renovation.id, "mail-1", [{ characterId: "rosa", accepted: true }], at),
    );
    assert.equal(
      (await readVillageState()).projects.find((row) => row.id === renovation.id)?.lifecycle?.phase,
      "builder",
    );
    const legacy = coerceVillageState({
      ...state,
      projects: [
        {
          id: "old-inn",
          kind: "build-venue",
          title: "Inn",
          status: "building",
          venueId: "old-site",
          participantIds: [],
          progress: 40,
          updatedAt: at,
        },
      ],
      venues: [...state.venues, { ...mill, id: "old-site", constructionStatus: "worksite", buildProjectId: "old-inn" }],
    });
    assert.equal(legacy.projects[0]?.status, "building", "zone migration preserves unfinished Projects");
    assert.ok(
      legacy.venues.some((row) => row.id === "old-site"),
      "the saved work site remains",
    );
    console.log(
      "Villages Project lifecycle regression: ordering, slots, replanning, delivery, clock, finishing, approval, migration ok",
    );
  } finally {
    release();
  }
}
void main();
