import assert from "node:assert/strict";
import { createResidentBackgrounds } from "../packages/villages/src/server/features/residents/resident-background-service.js";
import { createResidentRoster } from "../packages/villages/src/server/features/residents/resident-roster-service.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  readResidentFoundingContext,
  renderResidentFoundingContext,
  residentBackgroundSourceKey,
} from "../packages/villages/src/shared/helpers/resident-founding-context.js";
import { projectVillager } from "../packages/villages/src/server/domain/rules/world-snapshot.js";

const village = defaultVillageState();
village.setting = "A harbor town";
village.foundingDetails = "Travelers settle here through a public portal.";
village.worldOrigin = "different-worlds";
const card = readVillagerCard({
  id: "mara",
  data: {
    name: "Mara",
    description: "Former royal guard",
    extensions: { backstory: "Looking for her brother", personality: "Patient" },
  },
} as any);
const documents = {};
const records = new Map<string, any>();
let calls = 0,
  fail = false,
  release: (() => void) | undefined;
let gate: Promise<void> | undefined;
const messages: string[] = [];
const ports: any = {
  villagesDocuments: () => documents,
  async mutateDocument(id: string, slot: any, change: any) {
    const state = slot.coerce(records.get(id));
    const changed = change(state);
    assert.equal(changed instanceof Promise, false);
    if (changed !== false) records.set(id, structuredClone(state));
  },
  async readVillageState() {
    return structuredClone(village);
  },
  async findVillagerCard(id: string) {
    return id === "ellis" ? { ...card, id: "ellis", name: "Ellis" } : card;
  },
  async readLinkedPersona(id: string) {
    return { id, name: "Draft player", identity: "A scholar" };
  },
  async readVillageLore() {
    return [];
  },
  villagesLanguageModels: () => ({
    resolveForRequest: async () => ({
      maxOutputTokens: 800,
      fitContext: (messages: unknown[]) => ({ messages, maxTokens: 800 }),
    }),
  }),
  villagesConnectionIdFor: async () => "system-test",
  async completeWithRoom(_model: unknown, input: unknown) {
    calls++;
    messages.push(JSON.stringify(input));
    if (gate) await gate;
    if (fail) throw new Error("provider unavailable");
    return {
      content:
        "Mara arrived three weeks ago, following a lead about her brother. She is staying while she investigates.",
      finishReason: "stop",
    };
  },
};
const service = createResidentBackgrounds(ports);
const input = { characterId: "mara", actionId: "background-0001" };
const first = await service.draftResidentBackground(input);
assert.equal(calls, 1);
assert.deepEqual(await service.draftResidentBackground(input), first);
assert.equal(calls, 1, "saved replay does not call provider");
await assert.rejects(service.draftResidentBackground({ ...input, direction: "Different reason" }), /inputs changed/);
assert.equal(calls, 1);
assert.match(messages[0]!, /different-worlds/);
assert.match(messages[0]!, /Looking for her brother/);
assert.match(messages[0]!, /Never invent player actions/);
await service.draftResidentBackground({ ...input, actionId: "background-same", worldOrigin: "same-world" });
assert.match(messages.at(-1)!, /same-world/);

gate = new Promise<void>((resolve) => {
  release = resolve;
});
const concurrent = service.draftResidentBackground({ ...input, actionId: "background-0002" });
while (calls < 3) await new Promise((resolve) => setTimeout(resolve, 0));
const replay = service.draftResidentBackground({ ...input, actionId: "background-0002" });
await assert.rejects(
  service.draftResidentBackground({ ...input, actionId: "background-0002", direction: "Changed" }),
  /inputs changed/,
);
await assert.rejects(
  service.draftResidentBackground({ ...input, actionId: "background-0003" }),
  /already being proposed/,
);
const overlapping = createResidentBackgrounds(ports);
await assert.rejects(
  overlapping.draftResidentBackground({ ...input, actionId: "background-0003" }),
  /already being proposed/,
);
release!();
assert.deepEqual(await concurrent, await replay);
gate = undefined;
assert.equal(calls, 3);

fail = true;
await assert.rejects(
  service.draftResidentBackground({ ...input, actionId: "background-failure" }),
  /provider unavailable/,
);
await assert.rejects(
  service.draftResidentBackground({ ...input, actionId: "background-failure" }),
  /provider unavailable/,
);
assert.equal(calls, 4, "failed replay does not spend again");
fail = false;
await service.draftResidentBackground({ ...input, actionId: "background-explicit-retry" });
assert.equal(calls, 5);

const restarted = createResidentBackgrounds(ports);
assert.deepEqual(
  await restarted.draftResidentBackground({ ...input, actionId: "background-0001", retrieveOnly: true }),
  first,
);
assert.equal(calls, 5, "a restarted service reuses completed work");
await assert.rejects(
  restarted.draftResidentBackground({ ...input, actionId: "background-never-sent", retrieveOnly: true }),
  /No saved/,
);
assert.equal(calls, 5, "retrieval of a missing request never dispatches");
await service.draftResidentBackground({
  ...input,
  actionId: "background-founding",
  founding: true,
  setting: "The draft setting",
  premise: "A shared observatory",
  playerPersonaId: "draft-player",
  foundingCharacterIds: ["mara", "ellis"],
});
assert.match(messages.at(-1)!, /Draft player/);
assert.match(messages.at(-1)!, /Ellis/);
assert.match(messages.at(-1)!, /The draft setting/);
const entry = [...records.entries()].at(-1)!;
records.set(entry[0], { attempt: { ...entry[1].attempt, status: "running" } });
await assert.rejects(
  restarted.draftResidentBackground({
    ...input,
    actionId: "background-founding",
    founding: true,
    setting: "The draft setting",
    premise: "A shared observatory",
    playerPersonaId: "draft-player",
    foundingCharacterIds: ["mara", "ellis"],
    retrieveOnly: true,
  }),
  /running or was interrupted/,
);
assert.equal(calls, 6, "ambiguous interrupted calls are never automatically repeated");
restarted.stop();

await service.draftResidentBackground({
  ...input,
  actionId: "background-legacy",
  existingContext: {
    ...DEFAULT_RESIDENT_FOUNDING_CONTEXT,
    historyMode: "village",
    villageBackstory: "Mara was born in this harbor and has never served the royal guard.",
  },
});
assert.match(messages.at(-1)!, /never served the royal guard/);
assert.match(messages.at(-1)!, /authoritative personal past/);

const context = {
  ...DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  integration: {
    text: first.text,
    direction: "",
    accepted: true,
    sourceKey: residentBackgroundSourceKey(village.setting, village.foundingDetails, village.worldOrigin),
  },
};
assert.deepEqual(readResidentFoundingContext(context), context);
assert.equal(
  readResidentFoundingContext({ ...context, integration: { ...context.integration, accepted: false } }),
  null,
);
assert.equal(
  readResidentFoundingContext({ ...context, integration: { ...context.integration, text: "x".repeat(1201) } }),
  null,
);
assert.match(renderResidentFoundingContext("Mara", context), /following a lead/);
assert.match(renderResidentFoundingContext("Mara", context), /not resident knowledge/);
assert.equal(coerceVillageState({ ...village, worldOrigin: "garbage" }).worldOrigin, null);
assert.equal(coerceVillageState(village).worldOrigin, "different-worlds");
let agendas = 0;
const roster = createResidentRoster({
  readVillageState: async () => structuredClone(village),
  mutateVillageState: async (change) => {
    change(village);
    return village;
  },
  findVillagerCard: async () => card,
  queueVillagerAgenda: async () => {
    agendas++;
    assert.deepEqual(village.villagers[0]?.foundingContext, context);
  },
  retireBackgroundResident: () => {},
});
await assert.rejects(
  roster.addVillager("mara", { ...context, integration: { ...context.integration, accepted: false } }),
  /valid background/,
);
assert.equal(village.villagers.length, 0);
village.setting = "A changed premise";
await assert.rejects(roster.addVillager("mara", context), /premise changed/);
village.setting = "A harbor town";
await roster.addVillager("mara", context);
assert.equal(agendas, 1);
await roster.addVillager("mara", context);
assert.equal(agendas, 1);
assert.equal(village.villagers.length, 1);
assert.deepEqual(coerceVillageState(village).villagers[0]!.foundingContext, context);
const view = projectVillager(village.villagers[0]!, "Mara", "Guard", [], "", "", null);
assert.equal("foundingContext" in view, false, "private background is absent from ordinary snapshots");
assert.equal(village.venues.length, 0, "background does not create a workplace or residence");
service.stop();
overlapping.stop();
await assert.rejects(service.draftResidentBackground({ ...input, actionId: "background-stopped" }), /restarting/);
console.log(
  "Resident backgrounds: persisted replay, explicit retries, concurrent admission, accepted continuity, privacy and stale premise checks passed.",
);
