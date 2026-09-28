import assert from "node:assert/strict";
import {
  acquireBuildSource,
  addBuildSource,
  agreeBuildProject,
  commitBuildSupply,
  promiseBuildSource,
  proposeBuildProject,
  recruitBuildWorker,
  reconcileBuildProjects,
  startBuildWork,
} from "../packages/villages/src/engine/packages/server/src/services/villages/build-projects.ts";
import {
  agendaAt,
  unwrittenVillageAgenda,
} from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.ts";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  defaultVillageState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.ts";
import type {
  VillageVenue,
  VillageVillager,
} from "../packages/villages/src/engine/packages/server/src/services/villages/types.ts";

const at = "2026-09-28T12:00:00.000Z";
let evidenceAt = at;
const records = new Map<string, any>();
const documents = {
  async getById(_packageId: string, id: string) {
    return records.get(id) ?? null;
  },
  async list(_packageId: string, kind: string) {
    return [...records.values()].filter((entry) => entry.kind === kind);
  },
  async create(input: any) {
    if (records.has(input.id)) throw new Error("already created");
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
  spaces: [defaultVenueSpace("workplace", "A mill beside the river.")],
  description: "A mill beside the river.",
  category: "",
  presentation: { image: null, x: 0.4, y: 0.4 },
  occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
  capabilities: [],
  state: { condition: "standing", upgrades: [], furniture: ["salvage gear"], publicFacts: [], updatedAt: at },
};
village.venues.push(mill);
village.villagers.push({
  characterId: "rosa",
  cardSnapshot: { id: "rosa", revision: 1, sourceStatus: "available", name: "Rosa", capturedAt: at },
  agenda: unwrittenVillageAgenda(village.venues, "Rosa"),
  addedAt: at,
  completedWishes: [],
} as VillageVillager);
village.villagers.push({
  characterId: "ivo",
  cardSnapshot: { id: "ivo", revision: 1, sourceStatus: "available", name: "Ivo", capturedAt: at },
  agenda: unwrittenVillageAgenda(village.venues, "Ivo"),
  addedAt: at,
  completedWishes: [],
} as VillageVillager);
records.set("villages-village", { id: "villages-village", kind: "village", data: village, revision: 1 });
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  persistence: { documents },
} as Parameters<typeof configureVillagesRuntime>[0]);

function addRoomTurn(submissionId: string, mode: "chat", speakerId: string, content: string) {
  const sessionId = `visit-${submissionId}`;
  records.set(`villages-venue-visit-${sessionId}`, {
    id: `villages-venue-visit-${sessionId}`,
    kind: "venue-visit",
    revision: 1,
    data: {
      id: sessionId,
      placeId: "mill",
      placeName: "Old Mill",
      participants: [{ characterId: speakerId, name: speakerId, doing: "working" }],
      lines: [
        {
          id: `line-${submissionId}`,
          role: "assistant",
          speakerId,
          name: "Rosa",
          content,
          at: evidenceAt,
          heardBy: ["rosa"],
        },
      ],
      submissions: [
        {
          id: submissionId,
          message: `Attempt ${content}`,
          mode,
          targetId: "",
          verdict: null,
          wishId: "",
          wishMemory: "",
          at: evidenceAt,
        },
      ],
    },
  });
  return { sessionId, submissionId, lineId: `line-${submissionId}` };
}

async function main() {
  try {
    await proposeBuildProject({
      name: "Power Plant",
      classes: ["workplace"],
      description: "A river-powered plant for reliable village light.",
    });
    let state = await readVillageState();
    const projectId = state.projects[0]!.id;
    assert.equal(state.venues.length, 1, "a proposal is only a draft");
    assert.equal(state.projects[0]?.status, "draft");
    assert.equal(state.projects[0]?.plan?.requirements.length, 4);
    assert.equal(state.projects[0]?.plan?.sources.length, 4, "the draft offers finite routes at a current venue");
    await agreeBuildProject(projectId);
    await agreeBuildProject(projectId);
    state = await readVillageState();
    assert.equal(state.projects[0]?.plan?.revision, 1, "agreement is idempotent");
    assert.equal(state.venues.length, 1, "agreement cannot create a completed venue");
    evidenceAt = new Date(Date.parse(state.projects[0]!.plan!.agreedAt) + 1_000).toISOString();

    const unsafe = state.projects[0]!.plan!.sources.find((source) => source.requirementId === "power-source")!;
    const unsupported = addRoomTurn("unsupported-magic", "chat", "rosa", `I conjure ${unsafe.itemName}.`);
    await assert.rejects(
      acquireBuildSource(projectId, { sourceId: unsafe.id, ...unsupported }),
      /established magic|not explicitly offered/u,
    );
    assert.equal((await readVillageState()).projects[0]?.plan?.receipts.length, 0);

    for (const source of state.projects[0]!.plan!.sources) {
      const words =
        source.requirementId === "site-permission"
          ? "Yes, you may build the Power Plant here."
          : `I will offer ${source.itemName} for the Power Plant.`;
      const evidence = addRoomTurn(`promise-${source.requirementId}`, "chat", "rosa", words);
      await promiseBuildSource(projectId, { sourceId: source.id, ...evidence });
      await promiseBuildSource(projectId, { sourceId: source.id, ...evidence });
      if (source.requirementId === "site-permission") continue;
      const handoff = addRoomTurn(
        `recover-${source.requirementId}`,
        "chat",
        "rosa",
        `I hand you ${source.itemName} at the mill.`,
      );
      await acquireBuildSource(projectId, { sourceId: source.id, ...handoff });
      await acquireBuildSource(projectId, { sourceId: source.id, ...handoff });
      const acquired = (await readVillageState()).projects[0]!.plan!.receipts.find(
        (entry) => entry.kind === "acquired" && entry.sourceId === source.id,
      )!;
      await commitBuildSupply(projectId, {
        acquiredReceiptId: acquired.id,
        submissionId: `commit-${source.requirementId}`,
      });
      if (source.requirementId === "power-source") {
        await assert.rejects(
          addBuildSource(projectId, {
            requirementId: "power-source",
            venueId: "mill",
            supplierId: "rosa",
            itemName: "summoned lightning",
            kind: "limited-opportunity",
            magic: true,
            loreQuote: "There are lightning spirits in this village",
            cost: "a favor",
            prerequisite: "ask Rosa",
          }),
          /established setting or lore fact/u,
        );
        await addBuildSource(projectId, {
          requirementId: "power-source",
          venueId: "mill",
          supplierId: "rosa",
          itemName: "repaired mill dynamo",
          kind: "limited-opportunity",
          cost: "help Rosa repair the mill",
          prerequisite: "ask Rosa at the mill",
        });
        const revised = (await readVillageState()).projects[0]!.plan!;
        assert.equal(revised.revision, 2, "a new route makes a visible plan revision");
        assert.equal(revised.receipts.filter((entry) => entry.kind === "released").length, 1);
        assert.equal(revised.receipts.filter((entry) => entry.kind === "acquired").length, 1);
        await commitBuildSupply(projectId, {
          acquiredReceiptId: acquired.id,
          submissionId: "recommit-power-source",
        });
      }
      await commitBuildSupply(projectId, {
        acquiredReceiptId: acquired.id,
        submissionId: `commit-${source.requirementId}`,
      });
    }
    const builder = addRoomTurn("builder", "chat", "rosa", "I will build the Power Plant.");
    await recruitBuildWorker(projectId, { residentId: "rosa", ...builder });
    const workStart = new Date(Date.parse(evidenceAt) + 60_000);
    await startBuildWork(projectId, workStart);
    await startBuildWork(projectId, workStart);
    state = await readVillageState();
    const shell = state.venues.find((venue) => venue.buildProjectId === projectId)!;
    assert.equal(shell.constructionStatus, "worksite");
    assert.equal(state.venues.filter((venue) => venue.buildProjectId === projectId).length, 1);
    assert.deepEqual(state.villageCapabilities, [], "a worksite grants no capability");
    const shiftInstant = workStart;
    assert.equal(
      agendaAt(state.villagers[0]!.agenda, shiftInstant.getHours() * 60 + shiftInstant.getMinutes(), shiftInstant)
        ?.venueId,
      shell.id,
    );
    await mutateVillageState((next) => {
      next.villagers = next.villagers.filter((resident) => resident.characterId !== "rosa");
      reconcileBuildProjects(next, new Date(workStart.getTime() + 60 * 60_000));
    });
    state = await readVillageState();
    assert.equal(state.projects[0]?.status, "blocked", "builder departure pauses the work order");
    assert.equal(state.venues.find((venue) => venue.id === shell.id)?.constructionStatus, "worksite");
    evidenceAt = new Date(workStart.getTime() + 60 * 60_000 + 1_000).toISOString();
    const replacement = addRoomTurn("replacement-builder", "chat", "ivo", "I will build the Power Plant.");
    await recruitBuildWorker(projectId, { residentId: "ivo", ...replacement });
    const resumedStart = new Date(workStart.getTime() + 2 * 60 * 60_000);
    await startBuildWork(projectId, resumedStart);
    await mutateVillageState((next) =>
      reconcileBuildProjects(next, new Date(resumedStart.getTime() + 4 * 60 * 60_000 - 1)),
    );
    assert.equal((await readVillageState()).projects[0]?.status, "building");
    await mutateVillageState((next) =>
      reconcileBuildProjects(next, new Date(resumedStart.getTime() + 4 * 60 * 60_000)),
    );
    await mutateVillageState((next) =>
      reconcileBuildProjects(next, new Date(resumedStart.getTime() + 4 * 60 * 60_000)),
    );
    state = await readVillageState();
    assert.equal(state.projects[0]?.status, "complete");
    assert.equal(state.venues.find((venue) => venue.id === shell.id)?.constructionStatus, "complete");
    assert.deepEqual(state.villageCapabilities, ["village-wide power"]);
    assert.equal(state.projects[0]?.plan?.receipts.filter((entry) => entry.kind === "acquired").length, 3);
    assert.equal(state.projects[0]?.plan?.receipts.filter((entry) => entry.kind === "installed").length, 3);

    await mutateVillageState((next) => {
      next.villagers.unshift(village.villagers[0]!);
      next.venues.find((venue) => venue.id === "mill")!.state.furniture.push("conjured capacitor");
      next.narrativeItems.push({ venueId: "mill", itemName: "conjured capacitor" });
    });

    await proposeBuildProject({
      name: "Lamp Workshop",
      classes: ["workplace"],
      description: "A workshop for maintaining the village lamps.",
    });
    state = await readVillageState();
    const second = state.projects.find((project) => project.venueDraft?.name === "Lamp Workshop")!;
    await assert.rejects(agreeBuildProject(second.id), /available, server-checkable route/u);
    await addBuildSource(second.id, {
      requirementId: "materials",
      venueId: "mill",
      supplierId: "rosa",
      itemName: "fresh boards",
      kind: "limited-opportunity",
      cost: "help Rosa at the mill",
      prerequisite: "ask Rosa for fresh boards",
    });
    await agreeBuildProject(second.id);
    state = await readVillageState();
    evidenceAt = new Date(
      Date.parse(state.projects.find((project) => project.id === second.id)!.plan!.agreedAt) + 1_000,
    ).toISOString();
    await assert.rejects(
      addBuildSource(second.id, {
        requirementId: "equipment",
        venueId: "mill",
        itemName: "conjured capacitor",
        kind: "existing-item",
        cost: "use the part",
        prerequisite: "ask at the mill",
      }),
      /recorded when this project began/u,
    );
    await addBuildSource(second.id, {
      requirementId: "equipment",
      venueId: "mill",
      itemName: "salvage gear",
      kind: "existing-item",
      cost: "use the old mill gear",
      prerequisite: "ask at the mill",
    });
    state = await readVillageState();
    const itemSource = state.projects
      .find((project) => project.id === second.id)!
      .plan!.sources.find((source) => source.kind === "existing-item")!;
    evidenceAt = new Date(
      Date.parse(state.projects.find((project) => project.id === second.id)!.plan!.revisions[1]!.agreedAt) + 1_000,
    ).toISOString();
    const itemHandoff = addRoomTurn("item-handoff", "chat", "rosa", "I hand you salvage gear from the mill.");
    await acquireBuildSource(second.id, { sourceId: itemSource.id, ...itemHandoff });
    await acquireBuildSource(second.id, { sourceId: itemSource.id, ...itemHandoff });
    assert.equal(
      (await readVillageState()).venues.find((venue) => venue.id === "mill")?.state.furniture.includes("salvage gear"),
      false,
    );
    const sharedSource = state.projects
      .find((project) => project.id === second.id)!
      .plan!.sources.find((source) => source.itemName === "building materials")!;
    const secondPromise = addRoomTurn("second-promise", "chat", "rosa", "I will offer building materials.");
    await promiseBuildSource(second.id, { sourceId: sharedSource.id, ...secondPromise });
    const secondRecovery = addRoomTurn("second-recovery", "chat", "rosa", "I hand you building materials.");
    await assert.rejects(
      acquireBuildSource(second.id, { sourceId: sharedSource.id, ...secondRecovery }),
      /already transferred/u,
      "two projects cannot claim the same finite resident source",
    );
    assert.equal((await readVillageState()).projectSourceClaims.length, 3);
    console.log(
      "Villages build projects regression: draft, distinct receipts, retries, worksite, agenda, completion ok",
    );
  } finally {
    release();
  }
}

void main();
