import assert from "node:assert/strict";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../packages/villages/src/server/features/projects/project-drafts.js";
import { createVenueMailbox } from "../packages/villages/src/server/features/venues/venue-mailbox-service.js";
import { createVenueMailRules } from "../packages/villages/src/server/features/venues/venue-mail-rules-service.js";
import { queueVillageVenueRequest } from "../packages/villages/src/server/domain/rules/venue-request-state.js";
import type { VillageVillager } from "../packages/villages/src/server/domain/models/world.js";

const at = "2026-10-07T12:00:00.000Z";
let world = defaultVillageState();
world.seed = "draft-capacity";
world.setupAt = world.foundedAt = at;
world.villagers.push({
  characterId: "resident",
  cardSnapshot: { id: "resident", name: "Resident", capturedAt: at },
  addedAt: at,
  agenda: null,
  completedWishes: [],
} as VillageVillager);
queueVillageVenueRequest(world, { name: "Garden", classes: ["community"] }, "resident", "chat", "request", at);
const rules = createVenueMailRules({ draftNewVenueProject, draftRenovationProject });
rules.queueVenueCounteroffer(
  world,
  world.pendingDecisions[0]!.id,
  { name: "Garden", classes: ["community"] },
  "A garden.",
  new Date(at),
);
for (let index = 0; index < 6; index++)
  draftNewVenueProject(
    world,
    { name: `Draft ${index}`, classes: ["community"], description: "A place." },
    "",
    `draft:${index}`,
  );

const mail = structuredClone(world.venueMail[0]!);
const input = {
  due: mail,
  now: at,
  villageName: world.name,
  villagers: [{ characterId: "resident", capturedAt: at, cardSnapshot: { name: "Resident" } }],
};
const decisions = [{ characterId: "resident", accepted: true, reply: "Yes." }];
const rows = new Map<string, any>();
const documents: any = {
  getById: async (_pkg: string, id: string) => structuredClone(rows.get(id) ?? null),
  list: async (_pkg: string, kind: string) => structuredClone([...rows.values()].filter((row) => row.kind === kind)),
  create: async (row: any) => {
    const next = { ...structuredClone(row), revision: 1 };
    rows.set(row.id, next);
    return next;
  },
  update: async (row: any) => {
    const prior = rows.get(row.id);
    if (prior?.revision !== row.expectedRevision) return null;
    const next = { ...prior, ...structuredClone(row), revision: prior.revision + 1 };
    rows.set(row.id, next);
    return next;
  },
  remove: async (_pkg: string, id: string) => rows.delete(id),
};
const readVillageState = async () => structuredClone(world);
const mutateVillageState = async (mutate: (state: typeof world) => void) => {
  const next = structuredClone(world);
  await mutate(next);
  world = next;
  return world;
};
const mailbox = createVenueMailbox({
  readVillageState,
  mutateVillageState,
  queueBackgroundJob: async () => {},
  villagesConnectionIdFor: async () => "unused",
  villagesLanguageModels: () =>
    ({
      resolveForRequest: async () => {
        throw Error("unexpected provider");
      },
    }) as never,
  completeWithRoom: async () => {
    throw Error("unexpected provider");
  },
  createRenovationProject: async () => {},
  draftNewVenueProject,
  draftRenovationProject,
} as never);
let generations = 0;
const context = createBackgroundContext();
function service() {
  return createBackgroundWork({
    villagesDocuments: () => documents,
    villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
    readVillageState,
    mutateVillageState,
    withUsagePurpose: (_purpose, work) => work(),
    measurePipeline: (_name, _tags, work) => work(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: [
      [
        "mail",
        {
          ...mailbox.mailBackgroundHandler,
          generate: async () => {
            generations++;
            return decisions;
          },
        },
      ],
    ],
  });
}
let worker = service();
let stop = worker.startBackgroundWork({ now: () => 0 });
try {
  await worker.queueBackgroundJob({
    kind: "mail",
    subjectId: mail.id,
    seed: world.seed,
    revision: rules.mailRevision(mail),
    finite: true,
    label: mail.title,
    input,
  });
  await worker.settleBackgroundWork();
  const failed = (await worker.backgroundWorkSummaries())[0]!;
  const saved = [...rows.values()].find((row) => row.kind === "background-work").data;
  assert.equal(failed.status, "failed");
  assert.equal(saved.hasResult, true, "the accepted response is retained");
  assert.equal(saved.failure.cause, "storage_application");
  assert.match(saved.error, /Six Project drafts maximum/u);
  assert.equal(world.venueMail[0]!.status, "awaiting-villagers");
  assert.equal(world.pendingDecisions[0]!.status, "countered");
  assert.equal(generations, 1);
  stop();
  worker = service();
  stop = worker.startBackgroundWork({ now: () => 0 });
  await worker.recoverBackgroundWork();
  world.projects[0]!.status = "working";
  await worker.retryBackgroundJob(failed.id, failed.attempt, "retry-saved-mail");
  await worker.settleBackgroundWork();
  assert.equal(world.venueMail[0]!.status, "approved");
  assert.equal(world.pendingDecisions[0]!.status, "approved");
  assert.equal(world.projects.filter((project) => project.id === `request:${world.pendingDecisions[0]!.id}`).length, 1);
  assert.equal(generations, 1, "retry applies the saved response without generating again");
} finally {
  stop();
}
console.log("Project draft capacity preserves accepted Mailbox replies across restart and retry.");
