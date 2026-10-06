import {
  addBuildSource,
  acquireBuildSource,
} from "../packages/villages/src/server/features/projects/build-projects.js";
import { fixtureInterpretationChecks } from "./fixtures/villages-interpretation-payload.js";
import assert from "node:assert/strict";
import { mock } from "node:test";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  venueZones,
  resolveVenueZone,
  canOccupyZone,
  chooseAgendaZone,
  effectiveVenueClasses,
  zoneClosed,
} from "../packages/villages/src/server/domain/rules/venue-zones.js";
import {
  draftRenovationProject,
  createRenovationProject,
  openFinishedProject,
} from "../packages/villages/src/server/features/projects/project-lifecycle.js";

import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  enterVenue,
  greetVenue,
  sendVenueTurn,
  moveVenueZone,
  activeVenueSession,
  endVenueSession,
  recoverVenueSceneWork,
  discardVenueVisitDebug,
} from "../packages/villages/src/server/features/scenes/venue-session.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import { applyVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import { setVillageVenueImage } from "../packages/villages/src/server/features/world/village.js";
import { buildVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot.js";
import { agendaDateKey } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import type { VillageVenue, VillageVillager } from "../packages/villages/src/server/domain/models/world.js";

const now = new Date(),
  stamp = now.toISOString(),
  dateKey = agendaDateKey(now),
  weekday = now.toLocaleDateString("en-US", { weekday: "long" });
function venue(id: string, classes: VillageVenue["classes"] = ["gathering"]): VillageVenue {
  return {
    id,
    name: id,
    classes,
    spaces: classes!.map((role) => defaultVenueSpace(role, "The " + role + " interior.")),
    description: "The outside of " + id,
    category: "",
    presentation: { image: null, x: 0.2, y: 0.3 },
    occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
    residentIds: [],
    workerIds: [],
    improvements: [null, null],
    residenceCapacity: 1,
    capabilities: [],
    state: {
      condition: "standing",
      furniture: [],
      upgrades: [],
      publicFacts: [],
      features: [],
      traces: [],
      updatedAt: stamp,
    },
  };
}
function villager(id: string, venueId: string, zoneId: string, activity = "Visiting"): VillageVillager {
  const block = {
    startMinute: 0,
    endMinute: 1440,
    venueId,
    zoneId,
    activity,
    reason: "Routine",
    status: "online" as const,
  };
  return {
    characterId: id,
    cardSnapshot: {
      id,
      name: id,
      revision: 1,
      sourceStatus: "available",
      capturedAt: stamp,
      comment: "",
      summary: "",
      tags: [],
      description: "",
      personality: "",
      systemPrompt: "",
      scenario: "",
      backstory: "",
      appearance: "",
      exampleDialogue: "",
    },
    addedAt: stamp,
    completedWishes: [],
    remap: null,
    ingestSchedule: false,
    agenda: {
      wishes: [],
      routineSummary: "",
      day: [block],
      week: { [weekday]: [block] },
      activeDay: { dateKey, weekday, blocks: [block], scheduleInformed: false },
      source: "village",
      generatedAt: stamp,
    },
  } as VillageVillager;
}
const old = defaultVillageState();
old.foundedAt = stamp;
old.setupAt = stamp;
old.visitMemoryBackfilled = true;
const cafe = venue("cafe");
cafe.state.furniture = ["legacy bench"];
cafe.playerSeenPublic = true;
const home = venue("home", ["residence"]);
home.residentIds = ["resident"];
home.occupancy.residentCharacterId = "resident";
home.privateSpaces = [
  { ...defaultVenueSpace("residence", "Personal keepsakes."), id: "private:resident", ownerId: "resident" },
];
home.playerSeenPrivateIds = ["resident"];
home.playerInvitations = [
  { residentId: "resident", scope: "private", ownerId: "resident", recordedAt: stamp, sourceLineId: "old-invite" },
];
old.venues = [cafe, home];
old.narrativeItems = [{ venueId: "cafe", zoneId: "exterior", itemName: "made-up flower" }];
old.villagers = [
  villager("chef", "cafe", "gathering"),
  villager("guest", "cafe", "gathering"),
  villager("resident", "home", "private:resident", "Sleeping"),
];
const migrated = coerceVillageState(old);
assert.deepEqual(
  coerceVillageState(JSON.parse(JSON.stringify(migrated))).venues,
  migrated.venues,
  "migration is repeatable",
);
assert.equal(migrated.narrativeItems[0]!.zoneId, "exterior", "narrative item boundaries persist");
assert.deepEqual(migrated.venues[0]!.baseClasses, ["gathering"]);
assert.ok(resolveVenueZone(migrated.venues[0]!, "gathering")!.state.items.includes("legacy bench"));
assert.equal(migrated.venues[1]!.playerInvitations![0]!.zoneId, "private:resident");
assert.equal(resolveVenueZone(migrated.venues[1]!, "private:resident")!.seen, true);
assert.equal(
  canOccupyZone(migrated.venues[1]!, resolveVenueZone(migrated.venues[1]!, "private:resident")!, "guest"),
  false,
);
assert.equal(chooseAgendaZone(migrated.venues[1]!, "resident", "Sleeping").id, "private:resident");
assert.equal(chooseAgendaZone(migrated.venues[1]!, "guest", "Sleeping", "private:resident").id, "exterior");
const cap = structuredClone(migrated);
const capped = cap.venues[0]!;
capped.baseClasses = ["gathering"];
capped.improvements = [
  {
    id: "kitchen",
    title: "Kitchen",
    description: "Kitchen",
    spaceId: null,
    extraBeds: 0,
    approvedAt: stamp,
    classContribution: "workplace",
  },
  null,
];
assert.deepEqual(effectiveVenueClasses(capped), ["gathering", "workplace"]);
assert.throws(
  () =>
    draftRenovationProject(cap, "cafe", {
      title: "Apartment",
      detail: "Add a home",
      slot: 1,
      improvement: { title: "Apartment", description: "A home", classContribution: "residence" },
    }),
  /at most two/,
);
assert.doesNotThrow(() =>
  draftRenovationProject(cap, "cafe", {
    title: "Second kitchen",
    detail: "Add a kitchen",
    slot: 1,
    improvement: { title: "Kitchen", description: "A kitchen", classContribution: "workplace" },
  }),
);

const cramped = structuredClone(migrated);
cramped.venues[1]!.residentIds = ["resident", "second"];
assert.throws(
  () => draftRenovationProject(cramped, "home", { title: "Shrink", detail: "Smaller shared space", capacity: 1 }),
  /needs room/,
);
const playerHome = structuredClone(migrated);
playerHome.venues[1]!.residentIds = [];
playerHome.venues[1]!.occupancy.residentCharacterId = null;
playerHome.venues[1]!.occupancy.playerHome = true;
assert.throws(
  () =>
    draftRenovationProject(playerHome, "home", { title: "Convert", detail: "Remove the home", classes: ["gathering"] }),
  /Residents must move/,
);
const discovery = structuredClone(migrated);
discovery.venues[0]!.improvements![0] = {
  id: "old-upgrade",
  title: "Addition",
  description: "An old addition",
  extraBeds: 0,
  approvedAt: stamp,
};
discovery.venues[0]!.zones!.push({
  ...defaultVenueSpace("gathering", "Hidden zone details"),
  id: "unseen-zone",
  name: "Unseen room",
  kind: "public",
  upgradeId: "old-upgrade",
  seen: false,
});
assert.equal(
  resolveVenueZone(coerceVillageState(discovery).venues[0]!, "unseen-zone")!.seen,
  false,
  "discovery remains zone-specific after reload",
);

const records = new Map<string, any>();
records.set("villages-village", { id: "villages-village", kind: "village", data: migrated, revision: 1 });
let inviterId = "chef";
let failMovementCommit = false;
let paidCalls = 0;
let nominatedMovement: { zoneId: string; quote: string } | null = null;
let replyGate: Promise<void> | null = null,
  signalReplyStarted: (() => void) | null = null;
let lastPrompt = "",
  response: "ordinary" | "invite-now" | "invite-later" | "legacy-handoff" | "depart-chef" = "ordinary";
const release = configureVillagesRuntime({
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => true,
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: {
    async listCharacters() {
      return [];
    },
  },
  persistence: {
    documents: {
      async getById(_p: string, id: string) {
        return records.get(id) ?? null;
      },
      async list(_p: string, kind: string) {
        return [...records.values()].filter((row) => row.kind === kind);
      },
      async create(input: any) {
        const row = { ...input, revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        if (failMovementCommit && input.data.operation?.kind === "move" && input.data.zoneId === "stock") {
          throw new Error("movement commit interrupted");
        }
        const prior = records.get(input.id);
        if (!prior || prior.revision !== input.expectedRevision) return null;
        const row = { ...prior, ...input, revision: prior.revision + 1 };
        records.set(input.id, row);
        return row;
      },
      async remove(_p: string, id: string) {
        return records.delete(id);
      },
    },
  },
  languageModels: {
    async resolveForRequest() {
      return {
        model: "fixture",
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, ...options };
        },
        async chatComplete(messages: any[]) {
          if (messages[0]?.content.startsWith("Interpret the meaning of witnessed Scene evidence")) {
            const checks = fixtureInterpretationChecks(messages[1].content);
            return {
              content: JSON.stringify({
                results: checks.map((check: any) => {
                  const current = check.evidence.filter((line: any) => line.current && line.speakerId === "chef");
                  const text = current.map((line: any) => line.content).join(" ");
                  const outcome =
                    check.facts.zoneId === "stock" && text === "Come into the stockroom with me now."
                      ? "invite-now"
                      : check.facts.zoneId === "stock" && text === "Come back tomorrow and visit the stockroom."
                        ? "invite-later"
                        : "none";
                  return {
                    id: check.id,
                    outcome,
                    evidenceIds: current.map((line: any) => line.id),
                    reason: "Labeled stockroom fixture",
                  };
                }),
              }),
              finishReason: "stop",
            };
          }
          paidCalls++;
          if (nominatedMovement)
            return {
              content: JSON.stringify({
                heardPlayerBy: [],
                segments: [{ kind: "narration", text: "Use Move to change Zones.", heardBy: [] }],
                movementIntent: nominatedMovement,
                // Invented social effects on a movement candidate must never be applied.
                memoryChanges: [{ kind: "durable", text: "Unwarranted movement memory" }],
                relationshipChanges: { changes: [{ fromId: "chef", toId: "player", strength: "major" }] },
              }),
              finishReason: "stop",
            };
          if (replyGate) {
            const gate = replyGate;
            replyGate = null;
            signalReplyStarted?.();
            await gate;
          }
          lastPrompt = messages.map((message) => message.content).join("\n");
          const audience = (lastPrompt.match(/The residents currently here are: ([^.]*)\./)?.[1] ?? "")
            .split(", ")
            .filter(Boolean);
          if (response === "depart-chef") {
            const quote = "I am heading out of the Venue now.";
            return {
              content: JSON.stringify({
                heardPlayerBy: audience,
                segments: [{ kind: "dialogue", speakerId: "chef", text: quote, heardBy: audience }],
                departures: [{ speakerId: "chef", quote }],
              }),
              finishReason: "stop",
            };
          }
          if (response === "legacy-handoff")
            return {
              content: JSON.stringify({
                heardPlayerBy: audience,
                segments: [{ kind: "dialogue", speakerId: "chef", text: "Here is legacy timber.", heardBy: audience }],
              }),
              finishReason: "stop",
            };
          const quote =
            response === "invite-later"
              ? "Come back tomorrow and visit the stockroom."
              : "Come into the stockroom with me now.";
          return {
            content: JSON.stringify(
              response !== "ordinary"
                ? {
                    heardPlayerBy: audience,
                    segments: [{ kind: "dialogue", speakerId: inviterId, text: quote, heardBy: audience }],
                    invitation: {
                      speakerId: inviterId,
                      venueId: "cafe",
                      zoneId: "stock",
                      scope: "shared",
                      timing: response === "invite-later" ? "later" : "now",
                      accompanies: true,
                      quote,
                    },
                  }
                : {
                    heardPlayerBy: audience,
                    segments: [{ kind: "narration", text: "The moment continues quietly.", heardBy: audience }],
                  },
            ),
            finishReason: "stop",
          };
        },
      };
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);

async function finishProject(projectId: string) {
  await mutateVillageState((state) => {
    const project = state.projects.find((entry) => entry.id === projectId)!;
    project.lifecycle!.phase = "finishing";
    project.status = "finishing";
    const task = state.progressTasks.find((entry) => entry.definition.owner.id === projectId)!;
    task.phaseIndex = task.definition.phases.findIndex((phase) => phase.id === "finishing");
  });
  await openFinishedProject(projectId, {});
}

async function sceneAttendanceChecks() {
  const original = structuredClone(await readVillageState());
  const beforeBoundary = new Date(now);
  beforeBoundary.setHours(15, 59, 50, 0);
  mock.timers.enable({ apis: ["Date"], now: beforeBoundary.getTime() });
  try {
    await mutateVillageState((state) => {
      state.venues[0]!.workerIds = ["chef", "resident"];
      state.villagers.push(villager("late", "home", "exterior"));
      const locations = [
        ["cafe", "exterior", "home", "exterior"],
        ["cafe", "gathering", "cafe", "exterior"],
        ["cafe", "stock", "cafe", "gathering"],
        ["home", "exterior", "cafe", "exterior"],
      ];
      state.villagers.forEach((person, index) => {
        const [venueId, zoneId, nextVenueId, nextZoneId] = locations[index]!;
        const block = person.agenda!.activeDay!.blocks[0]!;
        const blocks = [
          {
            ...block,
            startMinute: 0,
            endMinute: 960,
            venueId,
            zoneId,
            activity: `captured activity ${person.characterId}`,
          },
          {
            ...block,
            startMinute: 960,
            endMinute: 1440,
            venueId: nextVenueId,
            zoneId: nextZoneId,
            activity: `later activity ${person.characterId}`,
          },
        ];
        person.agenda!.activeDay!.blocks = blocks;
        person.agenda!.day = blocks;
        person.agenda!.week = { [weekday]: blocks };
      });
    });
    const entered = await enterVenue("cafe", undefined, "", undefined, "exterior");
    assert.deepEqual(entered.activeIds, ["chef"]);
    assert.equal(entered.sceneAttendance!.occupants.length, 3, "all Venue Zones are captured together");
    mock.timers.setTime(beforeBoundary.getTime() + 20_000);
    let scene = await greetVenue(entered.id);
    assert.deepEqual(scene.activeIds, ["chef"], "crossing a boundary during opening preserves attendance");
    assert.deepEqual(
      scene.participants.map((person) => person.characterId),
      ["chef"],
      "unseen Zones do not leak their cast",
    );
    assert.match(lastPrompt, /Activity captured at Scene start: captured activity chef/);
    assert.doesNotMatch(lastPrompt, /later activity chef/);
    assert.deepEqual(
      (await activeVenueSession())!.activeIds,
      ["chef"],
      "polling cannot reconcile background attendance",
    );

    const routeHandlers = new Map<string, (request: any, reply: any) => any>();
    const collector = Object.fromEntries(
      ["get", "post", "put", "patch", "delete"].map((method) => [
        method,
        (_path: string, optionsOrHandler: any, handler?: any) => {
          routeHandlers.set(method + " " + _path, typeof optionsOrHandler === "function" ? optionsOrHandler : handler);
        },
      ]),
    );
    await villagesRoutes(collector as any);
    const callsBeforeProjection = paidCalls;
    const preservedScene = structuredClone(scene);
    const browserResponse = await routeHandlers.get("get /rooms/active")!({}, {});
    assert.equal(browserResponse.session.sceneAttendance, undefined, "route responses hide the whole-Venue snapshot");
    assert.doesNotMatch(JSON.stringify(browserResponse), /captured activity resident/);
    assert.equal(scene.sceneAttendance!.occupants.length, 3, "projection cannot mutate durable attendance");
    const archiveId = "privacy-archive-" + scene.id;
    const archiveKey = "villages-venue-visit-" + archiveId;
    records.set(archiveKey, {
      id: archiveKey,
      kind: "venue-visit",
      revision: 1,
      data: { ...structuredClone(scene), id: archiveId, status: "closed", endedAt: stamp },
    });
    try {
      const archiveResponse = await routeHandlers.get("get /rooms/archive/:id")!({ params: { id: archiveId } }, {});
      assert.equal(
        archiveResponse.visit.sceneAttendance,
        undefined,
        "the actual archive handler hides whole-Venue attendance",
      );
      assert.doesNotMatch(JSON.stringify(archiveResponse), /captured activity resident/);
      assert.equal(
        records.get(archiveKey).data.sceneAttendance.occupants.length,
        3,
        "archive projection preserves private saved data",
      );
    } finally {
      records.delete(archiveKey);
    }
    assert.equal(paidCalls, callsBeforeProjection, "Scene response projection never requests a model");
    assert.deepEqual(scene, preservedScene, "Scene response projection does not change its input");
    const nested = publicSceneResponse({
      session: scene,
      operation: { snapshot: scene, checkpoints: { saved: scene } },
    });
    assert.doesNotMatch(JSON.stringify(nested), /sceneAttendance/);

    let resumeSnapshotReply!: () => void;
    replyGate = new Promise((resolve) => {
      resumeSnapshotReply = resolve;
    });
    const snapshotReplyStarted = new Promise<void>((resolve) => {
      signalReplyStarted = resolve;
    });
    const pendingSnapshotReply = sendVenueTurn({
      sessionId: scene.id,
      message: "Keep discussing the captured moment.",
      mode: "chat",
      targetId: "chef",
      submissionId: "snapshot-turn",
    });
    await snapshotReplyStarted;
    mock.timers.setTime(beforeBoundary.getTime() + 70_000);
    await mutateVillageState((state) => {
      state.villagers[0]!.agenda!.activeDay!.blocks[1]!.zoneId = "gathering";
    });
    assert.deepEqual((await activeVenueSession())!.activeIds, ["chef"], "an admitted reply retains its Scene audience");
    resumeSnapshotReply();
    const sent = await pendingSnapshotReply;
    signalReplyStarted = null;
    assert.deepEqual(sent.session.submissions.at(-1)!.activeIdsAtTurn, ["chef"]);
    assert.ok(
      sent.session.lines.every((line) => !line.heardBy.includes("late")),
      "later arrivals cannot witness speech",
    );
    scene = await moveVenueZone(scene.id, "gathering");
    assert.equal(scene.id, entered.id, "Zone movement continues the same Scene");
    assert.deepEqual(scene.activeIds, ["guest"], "first entry into a Zone uses Scene-start positions");
    scene = await moveVenueZone(scene.id, "exterior");
    assert.deepEqual(scene.activeIds, ["chef"], "returning to a Zone preserves its original occupants");
    const saved = records.get(`villages-venue-visit-${scene.id}`)!;
    saved.data = JSON.parse(JSON.stringify(saved.data));
    assert.deepEqual((await activeVenueSession())!.activeIds, ["chef"], "storage reload preserves positions");
    delete saved.data.sceneAttendance;
    assert.deepEqual(
      (await activeVenueSession())!.activeIds,
      ["chef"],
      "legacy active Scenes retain their visible cast",
    );
    assert.ok((await activeVenueSession())!.sceneAttendance, "legacy attendance is captured once");
    response = "depart-chef";
    const departure = await sendVenueTurn({
      sessionId: scene.id,
      message: "Farewell, chef.",
      mode: "chat",
      targetId: "chef",
      submissionId: "snapshot-departure",
    });
    assert.deepEqual(departure.session.activeIds, [], "a cited spoken departure updates the Scene");
    assert.equal(
      departure.session.status,
      "active",
      "an empty Zone does not end a Scene with residents in other Zones",
    );
    response = "ordinary";
    scene = await moveVenueZone(scene.id, "gathering");
    assert.deepEqual(scene.activeIds, ["guest"]);
    scene = await moveVenueZone(scene.id, "exterior");
    assert.deepEqual(scene.activeIds, [], "Zone movement cannot resurrect a resident who left the Scene");
    await discardVenueVisitDebug(scene.id);
    scene = await greetVenue((await enterVenue("cafe", undefined, "", undefined, "exterior")).id);
    assert.deepEqual(scene.activeIds, ["guest", "late"], "a new Scene uses current schedules");
    await discardVenueVisitDebug(scene.id);

    await mutateVillageState((state) => {
      Object.assign(state, structuredClone(original));
      const home = state.venues[1]!;
      home.occupancy.playerHome = true;
      home.residentIds = ["resident", "chef"];
      const chef = state.villagers[0]!;
      const block = chef.agenda!.activeDay!.blocks[0]!;
      block.venueId = "home";
      block.zoneId = "residence";
    });
    scene = await enterVenue("home", undefined, "", undefined, "exterior");
    assert.deepEqual(scene.activeIds, []);
    await mutateVillageState((state) => {
      for (const person of state.villagers) {
        person.agenda!.activeDay!.blocks[0]!.venueId = "cafe";
        person.agenda!.activeDay!.blocks[0]!.zoneId = "exterior";
      }
    });
    scene = await moveVenueZone(scene.id, "residence");
    assert.deepEqual(scene.activeIds, ["chef"], "Common Space uses the whole-Venue snapshot");
    scene = await moveVenueZone(scene.id, "private:resident");
    assert.deepEqual(scene.activeIds, ["resident"], "Private Space uses its captured resident after agenda movement");
    scene = await moveVenueZone(scene.id, "exterior");
    assert.deepEqual(scene.activeIds, []);
    scene = await moveVenueZone(scene.id, "private:resident");
    assert.deepEqual(scene.activeIds, ["resident"], "Exterior to Private Space to Exterior remains one Scene");
    await discardVenueVisitDebug(scene.id);
  } finally {
    response = "ordinary";
    mock.timers.reset();
    await mutateVillageState((state) => Object.assign(state, structuredClone(original)));
  }
}
async function main() {
  try {
    await createRenovationProject("cafe", {
      title: "Kitchen",
      detail: "Add a kitchen with a stockroom",
      slot: 0,
      improvement: {
        title: "Kitchen",
        description: "A working kitchen",
        classContribution: "workplace",
        zones: [{ name: "stock", kind: "staff", venueClass: "workplace", description: "A quiet stockroom." }],
      },
    });
    let state = await readVillageState(),
      project = state.projects.find((entry) => entry.kind === "renovation")!;
    assert.equal(
      venueZones(state.venues[0]!).some((entry) => entry.name === "stock"),
      false,
      "proposed zones are not playable",
    );
    await finishProject(project.id);
    state = await readVillageState();
    let shop = state.venues[0]!;
    const actualStock = venueZones(shop).find((entry) => entry.name === "stock")!;
    const stockId = actualStock.id;
    await mutateVillageState((current) => {
      const shop = current.venues[0]!;
      resolveVenueZone(shop, stockId)!.id = "stock";
      shop.improvements![0]!.zones![0]!.id = "stock";
      resolveVenueZone(shop, "stock")!.preparation = { status: "ready" };
      shop.workerIds = ["chef"];
      const block = current.villagers[0]!.agenda!.activeDay!.blocks[0]!;
      block.zoneId = "gathering";
    });
    state = await readVillageState();
    shop = state.venues[0]!;
    assert.deepEqual(shop.classes, ["gathering", "workplace"]);
    assert.equal(canOccupyZone(shop, resolveVenueZone(shop, "stock")!, "chef"), true);
    assert.equal(canOccupyZone(shop, resolveVenueZone(shop, "stock")!, "guest"), false);
    await sceneAttendanceChecks();
    await assert.rejects(() => enterVenue("cafe", undefined, "", undefined, "stock"), /invitation/);
    let visit = await greetVenue((await enterVenue("cafe", undefined, "", undefined, "gathering")).id);
    assert.deepEqual(visit.activeIds, ["chef", "guest"]);
    await assert.rejects(
      () => enterVenue("cafe", undefined, "", undefined, "exterior"),
      (error: any) => error.code === "SCENE_STALE",
      "legacy entry cannot bypass movement's scene revision",
    );
    await assert.rejects(
      () => enterVenue("cafe", undefined, "", undefined, "exterior", visit.sceneRevision! + 1),
      (error: any) => error.code === "SCENE_STALE",
    );
    await sendVenueTurn({
      sessionId: visit.id,
      message: "A conversation only on the cafe floor",
      mode: "chat",
      targetId: "",
      submissionId: "floor-talk",
    });
    const hidden = (await buildVillageSnapshot()).settings.venues
      .find((entry) => entry.id === "cafe")!
      .zones!.find((entry) => entry.id === "stock")!;
    assert.equal(hidden.description, "");
    assert.deepEqual(hidden.state.items, []);
    await assert.rejects(
      () => setVillageVenueImage("cafe", null, undefined, "", false, "stock"),
      /Visit this zone|current invitation/,
    );
    response = "invite-now";
    inviterId = "guest";
    const unauthorized = await sendVenueTurn({
      sessionId: visit.id,
      message: "Can a guest invite me into the stockroom?",
      mode: "chat",
      targetId: "guest",
      submissionId: "unauthorized",
    });
    assert.equal(unauthorized.session.zoneId, "gathering");
    await assert.rejects(() => moveVenueZone(visit.id, "stock"), /invitation/);
    inviterId = "chef";
    response = "ordinary";
    let resumeReply: (() => void) | undefined;
    replyGate = new Promise((resolve) => {
      resumeReply = resolve;
    });
    const started = new Promise<void>((resolve) => {
      signalReplyStarted = resolve;
    });
    const pending = sendVenueTurn({
      sessionId: visit.id,
      message: "Wait for this reply",
      mode: "chat",
      targetId: "",
      submissionId: "pending-navigation",
    });
    await started;
    await assert.rejects(() => moveVenueZone(visit.id, "exterior"), /Scene is responding/);
    resumeReply!();
    await pending;
    signalReplyStarted = null;
    response = "invite-now";
    const invited = await sendVenueTurn({
      sessionId: visit.id,
      message: "Please show me the stockroom",
      mode: "chat",
      targetId: "chef",
      submissionId: "invite-stock",
    });
    assert.equal(invited.session.zoneId, "gathering", "permission alone does not move the player");
    assert.equal(invited.session.entryOffers?.[0]?.zoneId, "stock");
    const accepted = await moveVenueZone(visit.id, "stock");
    assert.deepEqual(
      accepted.activeIds,
      ["chef"],
      "the inviter accompanies after acceptance; the guest stays on the floor",
    );
    response = "ordinary";
    await sendVenueTurn({
      sessionId: visit.id,
      message: "A private stockroom conversation",
      mode: "chat",
      targetId: "chef",
      submissionId: "stock-talk",
    });
    await moveVenueZone(visit.id, "gathering");
    await sendVenueTurn({
      sessionId: visit.id,
      message: "Back on the cafe floor",
      mode: "chat",
      targetId: "",
      submissionId: "back-floor",
    });
    assert.doesNotMatch(
      lastPrompt,
      /A private stockroom conversation/,
      "the floor's new audience does not see the stockroom transcript",
    );
    const back = await moveVenueZone(visit.id, "stock");
    assert.equal(back.id, visit.id, "movement keeps the visit");
    const archive = (await activeVenueSession())!;
    assert.ok(archive.lines.filter((line) => line.zoneId === "stock").every((line) => !line.heardBy.includes("guest")));
    await mutateVillageState((current) =>
      applyVenueSceneChange(
        current,
        "cafe",
        { narration: "A cup is set down.", addItem: "cup" },
        "zone-item",
        stamp,
        undefined,
        "public",
        "",
        "stock",
      ),
    );
    state = await readVillageState();
    assert.ok(resolveVenueZone(state.venues[0]!, "stock")!.state.items.includes("cup"));
    assert.equal(resolveVenueZone(state.venues[0]!, "gathering")!.state.items.includes("cup"), false);
    await mutateVillageState((current) => {
      resolveVenueZone(current.venues[0]!, "stock")!.state.items.push("legacy timber");
      resolveVenueZone(current.venues[0]!, "gathering")!.state.items.push("legacy timber");
      current.projects.push({
        id: "legacy-project",
        kind: "build-venue",
        title: "Legacy Project",
        venueId: "cafe",
        participantIds: [],
        progress: 0,
        status: "active",
        updatedAt: stamp,
        plan: {
          revision: 1,
          agreedAt: stamp,
          need: "Timber",
          revisions: [],
          requirements: [{ id: "timber", title: "Timber", routeIds: [] }],
          sources: [],
          recordedItems: [{ venueId: "cafe", zoneId: "stock", itemName: "legacy timber" }],
          receipts: [],
          builderId: "",
          builderAgreedAt: "",
          workOrder: null,
          finishing: null,
          blockedReason: "",
        },
      } as any);
    });
    await addBuildSource("legacy-project", {
      requirementId: "timber",
      kind: "existing-item",
      venueId: "cafe",
      zoneId: "stock",
      itemName: "legacy timber",
      cost: "Use the stored timber",
      prerequisite: "Obtain the controller's handoff",
    });
    response = "legacy-handoff";
    const handoff = await sendVenueTurn({
      sessionId: visit.id,
      message: "Receive legacy timber",
      mode: "chat",
      targetId: "chef",
      submissionId: "legacy-handoff",
    });
    response = "ordinary";
    await mutateVillageState((current) => {
      const legacy = current.projects.find((project) => project.id === "legacy-project")!;
      legacy.status = "active";
      legacy.plan!.agreedAt = stamp;
    });
    const legacySource = (await readVillageState()).projects.find((project) => project.id === "legacy-project")!.plan!
      .sources[0]!;
    await acquireBuildSource("legacy-project", {
      sourceId: legacySource.id,
      sessionId: visit.id,
      submissionId: "legacy-handoff",
      lineId: handoff.session.lines.at(-1)!.id,
    });
    state = await readVillageState();
    assert.equal(resolveVenueZone(state.venues[0]!, "stock")!.state.items.includes("legacy timber"), false);
    assert.ok(
      resolveVenueZone(state.venues[0]!, "gathering")!.state.items.includes("legacy timber"),
      "legacy Project debits do not remove another zone's identically named item",
    );
    await endVenueSession(visit.id);
    await assert.rejects(
      () => enterVenue("cafe", undefined, "", undefined, "stock"),
      /invitation/,
      "the old visit grant expires",
    );
    assert.equal(
      (await buildVillageSnapshot()).settings.venues[0]!.zones!.find((entry) => entry.id === "stock")!.seen,
      true,
      "discovery does not imply entry permission",
    );
    visit = await greetVenue((await enterVenue("cafe", undefined, "", undefined, "gathering")).id);
    response = "invite-later";
    await sendVenueTurn({
      sessionId: visit.id,
      message: "Can I visit later?",
      mode: "chat",
      targetId: "chef",
      submissionId: "later",
    });
    response = "ordinary";
    await endVenueSession(visit.id);
    const future = await enterVenue("cafe", undefined, "", undefined, "stock");
    assert.ok(future.grantedZoneIds?.includes("stock"));
    await endVenueSession(future.id);
    const recoveringMove = await greetVenue((await enterVenue("cafe", undefined, "", undefined, "gathering")).id);
    await mutateVillageState((current) => {
      current.venues
        .find((entry) => entry.id === "cafe")!
        .playerInvitations!.push({
          residentId: "chef",
          scope: "shared",
          zoneId: "stock",
          ownerId: "",
          recordedAt: stamp,
          sourceLineId: "movement-crash",
        });
    });
    failMovementCommit = true;
    await assert.rejects(
      () => moveVenueZone(recoveringMove.id, "stock", recoveringMove.sceneRevision),
      /movement commit interrupted/,
    );
    failMovementCommit = false;
    assert.ok((await readVillageState()).venues[0]!.usedInvitationIds!.includes("movement-crash"));
    const callsBeforeMoveRecovery = paidCalls;
    await recoverVenueSceneWork();
    const recoveredMove = (await activeVenueSession())!;
    assert.equal(recoveredMove.zoneId, "stock", "saved invitation authorizes completing the interrupted scene commit");
    assert.equal(paidCalls, callsBeforeMoveRecovery, "movement recovery spends no model calls");
    assert.equal(recoveredMove.operation?.status, "complete");
    assert.equal(recoveredMove.submissions.filter((turn) => turn.movement).length, 1);
    const recoveredTransition = recoveredMove.submissions.at(-1)!.movement!;
    assert.equal(recoveredMove.lines.filter((line) => line.id === recoveredTransition.transitionLineId).length, 1);
    assert.deepEqual(recoveredMove.submissions.at(-1)!.activeIdsAfterTurn, recoveredMove.activeIds);
    const capturedAttendance = structuredClone(recoveredMove.sceneAttendance);
    const callsBeforeWrittenMove = paidCalls;
    let written = await sendVenueTurn({
      sessionId: recoveredMove.id,
      message: "I walk to Exterior",
      mode: "chat",
      targetId: "",
      submissionId: "written-exterior",
      expectedSceneRevision: recoveredMove.sceneRevision,
    });
    assert.equal(paidCalls, callsBeforeWrittenMove + 1, "Say / Do uses one local reply, not a movement operation");
    assert.equal(written.session.zoneId, "stock", "written movement cannot change Zone");
    assert.deepEqual(written.session.sceneAttendance, capturedAttendance);
    assert.equal(written.session.id, recoveredMove.id);
    assert.equal(written.session.submissions.at(-1)!.movement, undefined);
    const lineId = written.session.lines.at(-1)!.id;
    await sendVenueTurn({
      sessionId: written.session.id,
      message: "I walk to Exterior",
      mode: "chat",
      targetId: "",
      submissionId: "written-exterior",
    });
    assert.equal((await activeVenueSession())!.lines.filter((line) => line.id === lineId).length, 1);
    assert.equal(paidCalls, callsBeforeWrittenMove + 1, "written replay and refresh are free");
    const mixed = await sendVenueTurn({
      sessionId: written.session.id,
      message: "I walk to Common Space and say hello",
      mode: "chat",
      targetId: "",
      submissionId: "mixed-movement",
    });
    assert.equal(mixed.session.zoneId, "stock", "mixed prose also stays local");
    await discardVenueVisitDebug(written.session.id);
    let candidate = await greetVenue((await enterVenue("cafe", undefined, "", undefined, "exterior")).id);
    nominatedMovement = { zoneId: "gathering", quote: "I drift into Common Space" };
    const beforeNomination = paidCalls;
    written = await sendVenueTurn({
      sessionId: candidate.id,
      message: nominatedMovement.quote,
      mode: "chat",
      targetId: "",
      submissionId: "nominated-movement",
    });
    assert.equal(paidCalls - beforeNomination, 1, "less direct movement uses the existing Narration request only");
    assert.equal(written.session.zoneId, "exterior", "model movement nominations cannot move the player");
    assert.equal(written.session.submissions.at(-1)!.movement, undefined);
    nominatedMovement = null;
    candidate = written.session;
    await endVenueSession(candidate.id);
    await sendVenueTurn({
      sessionId: visit.id,
      message: "Can I visit later?",
      mode: "chat",
      targetId: "chef",
      submissionId: "later",
    });
    await assert.rejects(() => enterVenue("cafe", undefined, "", undefined, "stock"), /invitation/);
    state = await readVillageState();
    const upgrade = state.venues[0]!.improvements![0]!;
    await createRenovationProject("cafe", {
      title: "Improve kitchen",
      detail: "Improve the existing stockroom",
      slot: 0,
      improvement: {
        ...upgrade,
        zones: [
          {
            id: "stock",
            name: "Stockroom",
            description: "New shelving in the same room.",
            kind: "staff",
            venueClass: "workplace",
          },
        ],
      },
    });
    state = await readVillageState();
    project = state.projects.find((entry) => entry.kind === "renovation" && entry.lifecycle?.phase !== "complete")!;
    await mutateVillageState((current) => {
      current.projects.find((entry) => entry.id === project.id)!.lifecycle!.phase = "construction";
    });
    state = await readVillageState();
    assert.equal(zoneClosed(state, state.venues[0]!, resolveVenueZone(state.venues[0]!, "stock")!), true);
    assert.equal(zoneClosed(state, state.venues[0]!, resolveVenueZone(state.venues[0]!, "gathering")!), false);
    await finishProject(project.id);
    state = await readVillageState();
    assert.equal(state.venues[0]!.improvements![0]!.id, upgrade.id);
    assert.ok(
      resolveVenueZone(state.venues[0]!, "stock")!.state.items.includes("cup"),
      "modifying preserves physical state",
    );
    state = await readVillageState();
    await assert.rejects(async () => {
      const copy = structuredClone(state);
      draftRenovationProject(copy, "cafe", {
        title: "Convert",
        detail: "Remove work",
        classes: ["gathering"],
        slot: 0,
        improvement: null,
      });
    }, /Workers must be unassigned/);
    // The drafted removal itself is blocked while workers depend on its Class.
    await mutateVillageState((current) => {
      current.venues[0]!.workerIds = [];
    });
    await createRenovationProject("cafe", {
      title: "Replace kitchen",
      detail: "Replace it with a public workshop",
      slot: 0,
      improvement: {
        title: "Workshop",
        description: "A public workshop",
        classContribution: "workplace",
        zones: [
          {
            name: "Workshop floor",
            kind: "public",
            venueClass: "workplace",
            description: "A workshop open to everyone.",
          },
        ],
      },
    });
    state = await readVillageState();
    project = state.projects.find((entry) => entry.kind === "renovation" && entry.lifecycle?.phase !== "complete")!;
    await finishProject(project.id);
    state = await readVillageState();
    assert.notEqual(state.venues[0]!.improvements![0]!.id, upgrade.id);
    assert.equal(resolveVenueZone(state.venues[0]!, "stock"), undefined);
    assert.ok(
      state.venues[0]!.archivedZones!.some(
        (entry) => entry.zone.id === "stock" && entry.zone.state.items.includes("cup"),
      ),
    );
    await createRenovationProject("cafe", {
      title: "Remove kitchen",
      detail: "Remove the kitchen",
      slot: 0,
      improvement: null,
    });
    state = await readVillageState();
    project = state.projects.find((entry) => entry.kind === "renovation" && entry.lifecycle?.phase !== "complete")!;
    await finishProject(project.id);
    state = await readVillageState();
    assert.equal(resolveVenueZone(state.venues[0]!, "stock"), undefined);
    assert.ok(
      state.venues[0]!.archivedZones!.some(
        (entry) => entry.zone.id === "stock" && entry.zone.state.items.includes("cup"),
      ),
    );
    assert.deepEqual(state.venues[0]!.classes, ["gathering"]);
    assert.equal(await activeVenueSession(), null);
    const privateVisit = await enterVenue("home", undefined, "", undefined, "private:resident");
    const afterPrivateEntry = await readVillageState();
    assert.equal(
      resolveVenueZone(
        afterPrivateEntry.venues.find((entry) => entry.id === "home")!,
        "residence",
      )!.seen,
      false,
      "private entry does not discover a different shared zone",
    );
    await endVenueSession(privateVisit.id);
    console.log(
      "Villages Zones: migration, Classes, proposals, access, invitations, presence, hearing, state isolation and archives ok",
    );
  } finally {
    release();
  }
}
void main();
