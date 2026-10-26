import { addMemory } from "./helpers/memories-fixture.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import assert from "node:assert/strict";
import { developmentFixture, elapsed, moveProposal } from "./fixtures/villages-development.fixture.js";
import {
  createDevelopment,
  type DevelopmentPorts,
} from "../packages/villages/src/server/features/world/development-service.js";
import { developmentReview } from "../packages/villages/src/server/domain/rules/resident-development.js";
const state = developmentFixture();
const queued: any[] = [];
let previous: any = null,
  calls = 0,
  trim = false,
  bad = false,
  retries = 0;
const ports: DevelopmentPorts = {
  async readVillageState() {
    return structuredClone(state);
  },
  async mutateVillageState(change) {
    const next = structuredClone(state);
    change(next);
    Object.assign(state, next);
    return next;
  },
  async backgroundJobSnapshot() {
    return previous;
  },
  async retryBackgroundJob(id) {
    assert.match(id, /^villages-background-[a-f0-9]{64}$/);
    retries++;
  },
  async queueBackgroundJob(job) {
    queued.push(job);
  },
  villagesLanguageModels() {
    return {
      async resolveForRequest() {
        return {
          maxOutputTokens: 16000,
          fitContext(messages: any, options: any) {
            return { messages: trim ? messages.slice(1) : messages, ...options };
          },
        };
      },
    } as any;
  },
  async villagesConnectionIdFor() {
    return "configured-system";
  },
  async completeWithRoom(_model, _messages, maxTokens, options) {
    calls++;
    assert.match(
      String(_messages.find((message) => message.role === "system")?.content),
      /\bjson\b/i,
      "DeepSeek JSON mode requires JSON to be named explicitly in the prompt.",
    );
    assert.ok(maxTokens <= 4096);
    assert.equal(options.retryEmpty, false);
    return { content: bad ? "{}" : JSON.stringify(moveProposal(elapsed(4))) } as any;
  },
};
const service = createDevelopment(ports);
await service.reconcileDevelopment(new Date(elapsed(0.5)));
assert.equal(queued.length, 0);
await service.reconcileDevelopment(new Date(elapsed(4)));
assert.equal(queued.length, 1);
const first = queued[0];
assert.equal(first.kind, "development");
assert.equal(first.subjectId, "village");
assert.equal(first.finite, false);
previous = { id: "pending-job", seed: state.seed, status: "interrupted", attempt: 1, requests: 1, input: first.input };
await service.reconcileDevelopment(new Date(elapsed(5)));
assert.equal(queued.length, 1);
state.venues[2]!.access!.revision++;
await service.reconcileDevelopment(new Date(elapsed(6)));
assert.equal(queued.length, 1, "An unrelated housing change cannot replace an unknown paid request.");
previous.status = "failed";
await service.reconcileDevelopment(new Date(elapsed(6)));
assert.equal(queued.length, 1);
await service.reconcileDevelopment(new Date(elapsed(6)), "manual-reconsider");
assert.equal(queued.length, 2, "A changed failed interval needs a deliberate review.");
assert.equal(queued[1].retryActionId, "manual-reconsider");
assert.equal(queued[1].expectedAttempt, 1);
assert.equal(calls, 0);
const input = { review: developmentReview(state, elapsed(4))!, context: queued[1].input.context };
await service.handler.generate(input);
assert.equal(calls, 1);
trim = true;
await assert.rejects(service.handler.generate(input), /does not fit/);
assert.equal(calls, 1, "Essential context cannot be silently trimmed before buying a decision.");
trim = false;
bad = true;
await assert.rejects(service.handler.generate(input), /invalid review/);
assert.equal(calls, 2, "Invalid output is rejected without automatic paid repair.");
assert.ok(queued[1].input.context.residents.every((r: any) => Array.isArray(r.pursuits)));

const slotId = "villages-background-" + backgroundRevision(["development", "village"]);
state.backgroundReceipts[slotId] = previous.id;
previous.status = "failed";
await service.reconcileDevelopment(new Date(elapsed(8)));
previous.attempt++;
await service.reconcileDevelopment(new Date(elapsed(8)));
assert.equal(retries, 2, "Successive failed acknowledgements remain recoverable from the committed receipt.");
assert.equal(calls, 2, "Receipt acknowledgements never dispatch a provider request.");
delete state.backgroundReceipts[slotId];
previous = { ...previous, status: "completed" };
state.memories = addMemory(state.memories, {
  audience: ["a"],
  text: "Ada promised the player to discuss any move first.",
  sourceId: "commitment",
});
const commitment = state.memories.records[0].id;
for (let index = 0; index < 11; index++)
  state.memories = addMemory(state.memories, { audience: ["a"], text: "An older weather fact." });
await service.reconcileDevelopment(new Date(elapsed(8)));
assert.ok(
  queued
    .at(-1)
    .input.context.residents.find((resident: any) => resident.characterId === "a")
    .memories.some((memory: any) => memory.id === commitment),
  "The most recent player commitment survives a larger memory history.",
);
console.log(
  "Resident development service: bounded generation, durable failure holds, explicit recovery and essential context passed.",
);
