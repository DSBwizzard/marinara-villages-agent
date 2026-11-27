// Test cases: embedding-recall/selection-switch, embedding-recall/preparing-and-canceled
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { runCase } from "../scripts/test-cases.mjs";
import { createEmbeddingRecall } from "../packages/villages/src/server/features/scenes/embedding-recall-service.js";

async function waitFor(check: () => boolean) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (check()) return;
    await delay(10);
  }
  assert(check(), "background embedding did not finish");
}

await runCase("embedding-recall/selection-switch", async () => {
  const ids: (string | null)[] = [];
  const calls: { text: string[]; mode?: string }[] = [];
  let space = "hosted:one";
  let rejected = false;
  const recall = createEmbeddingRecall(async (id) => {
    ids.push(id);
    return {
      spaceId: space,
      label: "fixture",
      embed: async (text, _signal, mode) => {
        calls.push({ text, mode });
        return rejected ? null : text.map(() => [1, 0, 0]);
      },
    };
  });
  const text = "The astrolabe needs a bronze hinge.";
  assert.equal(await recall.ranking("that instrument", "world"), undefined);
  assert.deepEqual(ids, []);
  recall.select("connection:chosen");
  await waitFor(() => recall.select("connection:chosen") === "ready");
  assert.equal(calls.length, 0, "opening settings does not dispatch a provider request");
  const first = await recall.ranking("that instrument", "world");
  assert.equal(first?.([text]).size, 0);
  await waitFor(() => calls.length === 1);
  assert.deepEqual(calls[0], { text: [text], mode: "document" });
  const warm = await recall.ranking("that instrument", "world");
  assert.equal(warm?.([text]).get(0), 1);
  assert.deepEqual(calls[1], { text: ["that instrument"], mode: "query" });
  assert(ids.every((id) => id === "chosen"));
  space = "hosted:two";
  const changed = await recall.ranking("that instrument", "world");
  assert.equal(changed?.([text]).size, 0);
  assert.equal(calls.length, 2);
  rejected = true;
  await waitFor(() => recall.select("connection:chosen") === "unavailable");
  assert.equal(await recall.ranking("that instrument", "world"), undefined);
  recall.dispose();
});

await runCase("embedding-recall/preparing-and-canceled", async () => {
  const attempts: (string | null)[] = [];
  const recall = createEmbeddingRecall(async (id) => {
    attempts.push(id);
    return { spaceId: "local:fixture", label: "fixture", embed: () => new Promise(() => {}) };
  });
  assert.equal(recall.select("local"), "preparing");
  assert.equal(await recall.ranking("callback", "world"), undefined);
  assert.deepEqual(attempts, [null]);
  assert.equal(recall.select("off"), undefined);
  assert.equal(await recall.ranking("callback", "world"), undefined);
  const calls: string[][] = [];
  const remote = createEmbeddingRecall(async () => ({
    spaceId: "hosted:fixture",
    label: "fixture",
    embed: async (texts) => {
      calls.push(texts);
      return [[1]];
    },
  }));
  remote.select("connection:chosen");
  await waitFor(() => remote.select("connection:chosen") === "ready");
  const controller = new AbortController();
  (await remote.ranking("callback", "world", controller.signal))?.(["queued memory"]);
  controller.abort();
  await delay(40);
  assert.deepEqual(calls, [], "a canceled queued batch sends no text");
  remote.dispose();
});
