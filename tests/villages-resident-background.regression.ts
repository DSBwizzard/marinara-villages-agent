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
  residentHistoryForOrigin,
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
let outputLimit: number | null = null;
let contextLimit: number | undefined;
let completion = {
  content: "Mara arrived three weeks ago, following a lead about her brother. She is staying while she investigates.",
  finishReason: "stop",
};
const requests: { tokens: number; options: any; reply: typeof completion }[] = [];
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
      maxOutputTokens: outputLimit,
      fitContext: (messages: unknown[], options: { maxTokens: number }) => ({
        messages,
        maxTokens: Math.min(options.maxTokens, contextLimit ?? options.maxTokens),
      }),
    }),
  }),
  villagesConnectionIdFor: async () => "system-test",
  async completeWithRoom(_model: unknown, input: unknown, tokens: number, options: any) {
    calls++;
    messages.push(JSON.stringify(input));
    if (gate) await gate;
    if (fail) throw new Error("provider unavailable");
    requests.push({ tokens, options, reply: structuredClone(completion) });
    return structuredClone(completion);
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

assert.equal(requests[0]!.tokens, 4096, "reasoning and paragraph share a bounded output budget");
assert.equal(requests[0]!.options.reasoningEffort, undefined, "preserve connection thinking settings");
assert.equal(requests[0]!.options.savedRequest.retry, false);
assert.equal(requests[0]!.options.savedRequest.valid(requests[0]!.reply), true);
outputLimit = 1024;
await service.draftResidentBackground({ ...input, actionId: "background-configured-limit" });
assert.equal(requests.at(-1)!.tokens, 1024, "honor a smaller configured output limit");
outputLimit = 16000;
contextLimit = 1800;
await service.draftResidentBackground({ ...input, actionId: "background-context-limit" });
assert.equal(requests.at(-1)!.tokens, 1800, "honor remaining context room");
contextLimit = undefined;
await service.draftResidentBackground({ ...input, actionId: "background-bounded-limit" });
assert.equal(requests.at(-1)!.tokens, 4096, "bound the request even on a larger connection");
const good = completion;
const invalidReplies = [
  { content: "Mara arrived", finishReason: "length", usage: { completionTokens: 800, completionReasoningTokens: 777 } },
  { content: "Mara arrived", finishReason: "max_tokens" },
  { content: " ", finishReason: "stop" },
  { content: "x".repeat(1201), finishReason: "stop" },
];
const receiptKeys = new Set<string>();
for (const [index, reply] of invalidReplies.entries()) {
  completion = reply;
  const request = { ...input, actionId: "background-invalid-" + index };
  const before = calls;
  await assert.rejects(service.draftResidentBackground(request), /incomplete or too long/);
  assert.equal(calls, before + 1, "invalid paid output never triggers a replacement");
  const saved = requests.at(-1)!.options.savedRequest;
  assert.equal(saved.retry, false);
  assert.equal(saved.valid(reply), false, "retain rejected output without accepting it");
  assert.equal(receiptKeys.has(saved.key), false, "explicit retries have independent receipts");
  receiptKeys.add(saved.key);
  await assert.rejects(service.draftResidentBackground({ ...request, retrieveOnly: true }), /incomplete or too long/);
  await assert.rejects(service.draftResidentBackground(request), /incomplete or too long/);
  assert.equal(calls, before + 1, "retrieving or replaying failure never spends again");
}
completion = good;

const sameWorldContext = {
  ...DEFAULT_RESIDENT_FOUNDING_CONTEXT,
  historyMode: residentHistoryForOrigin(DEFAULT_RESIDENT_FOUNDING_CONTEXT, "same-world"),
  integration: {
    text: "Mara grew up beside this observatory.",
    direction: "",
    accepted: true,
    worldOrigin: "same-world" as const,
  },
};
assert.match(renderResidentFoundingContext("Mara", sameWorldContext), /except for changes explicitly described below/);
assert.match(
  renderResidentFoundingContext("Mara", sameWorldContext),
  /later established developments take precedence/i,
);
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
  preparedSpriteManager: async (id, revision) => {
    assert.equal(id, "mara");
    assert.equal(revision, 7, "accepted background and prepared sprite revision travel together");
    return null;
  },
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
  roster.addVillager("mara", undefined, { ...context, integration: { ...context.integration, accepted: false } }),
  /valid background/,
);
assert.equal(village.villagers.length, 0);
village.setting = "A changed premise";
await assert.rejects(roster.addVillager("mara", undefined, context), /premise changed/);
village.setting = "A harbor town";
await roster.addVillager("mara", 7, context);
assert.equal(agendas, 1);
await roster.addVillager("mara", 7, context);
assert.equal(agendas, 1);
assert.equal(village.villagers.length, 1);
assert.deepEqual(coerceVillageState(village).villagers[0]!.foundingContext, context);
const view = projectVillager(village.villagers[0]!, "Mara", "Guard", [], "", "", null);
assert.equal("foundingContext" in view, false, "private background is absent from ordinary snapshots");
assert.equal(village.venues.length, 0, "background does not create a workplace or residence");
const batchService = createResidentBackgrounds(ports);
const batchInput = {
  foundingCast: true,
  actionId: "cast-request-001",
  foundingCharacterIds: ["mara", "ellis"],
  playerPersonaId: "draft-player",
  playerBackground: "I came here to study.",
  setting: "The observatory",
  premise: "Travelers meet here.",
  worldOrigin: "different-worlds",
  foundingResidentContexts: {
    mara: {
      ...DEFAULT_RESIDENT_FOUNDING_CONTEXT,
      historyMode: "village",
      villageBackstory: "Mara has always lived at the observatory.",
    },
  },
};
completion = {
  content: JSON.stringify({
    player: "I came here to study the observatory.",
    residents: {
      mara: "Mara helps visitors at her childhood observatory.",
      ellis: "Ellis arrived to study the stars.",
    },
  }),
  finishReason: "stop",
};
const beforeBatch = calls;
const batch = await batchService.draftResidentBackground(batchInput);
assert.equal(calls, beforeBatch + 1, "one request proposes the whole cast");
assert.equal(requests.at(-1)!.tokens, 8192);
assert.match(messages.at(-1)!, /Draft player/);
assert.match(messages.at(-1)!, /Ellis/);
assert.match(messages.at(-1)!, /authoritative personal past/);
assert.match(messages.at(-1)!, /not a checklist to summarize/);
const recoveredInput = {
  ...batchInput,
  retrieveOnly: true,
  foundingCharacterIds: ["ellis", "mara"],
  foundingResidentContexts: {
    mara: {
      ...batchInput.foundingResidentContexts.mara,
      integration: { text: "", direction: "", accepted: false, actionId: batchInput.actionId, proposalReceived: false },
    },
  },
};
assert.deepEqual(
  await createResidentBackgrounds(ports).draftResidentBackground(recoveredInput),
  batch,
  "metadata and selection order do not break durable retrieval",
);
assert.equal(calls, beforeBatch + 1);
gate = new Promise<void>((resolve) => {
  release = resolve;
});
const concurrentBatch = batchService.draftResidentBackground({ ...batchInput, actionId: "cast-request-pending" });
while (calls < beforeBatch + 2) await new Promise((resolve) => setTimeout(resolve, 0));
await assert.rejects(
  batchService.draftResidentBackground({ ...input, actionId: "individual-during-cast" }),
  /already being proposed/,
);
await assert.rejects(
  batchService.draftResidentBackground({ ...batchInput, foundingCharacterIds: ["ellis"], actionId: "cast-disjoint" }),
  /already being proposed/,
);
release!();
await concurrentBatch;
gate = undefined;
completion = {
  content: JSON.stringify({ player: "A visitor.", residents: { mara: "Only one entry." } }),
  finishReason: "stop",
};
await assert.rejects(
  batchService.draftResidentBackground({ ...batchInput, actionId: "cast-incomplete" }),
  /incomplete/,
);
const afterInvalid = calls;
await assert.rejects(
  batchService.draftResidentBackground({ ...batchInput, actionId: "cast-incomplete", retrieveOnly: true }),
  /incomplete/,
);
assert.equal(calls, afterInvalid, "incomplete cast cannot trigger an automatic replacement");
batchService.stop();
service.stop();
overlapping.stop();
await assert.rejects(service.draftResidentBackground({ ...input, actionId: "background-stopped" }), /restarting/);
console.log(
  "Resident backgrounds: persisted replay, explicit retries, concurrent admission, accepted continuity, privacy and stale premise checks passed.",
);
