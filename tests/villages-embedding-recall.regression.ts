// Test cases: embedding-recall/selection-switch, embedding-recall/preparing-and-canceled, embedding-recall/engine-local-selection
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { runCase } from "../scripts/test-cases.mjs";
import { villageEmbeddingHost } from "../packages/villages/src/server/adapters/engine/embedding-connections.js";
import type { villageEngineJson } from "../packages/villages/src/server/adapters/engine/engine-transport.js";
import { createEmbeddingRecall } from "../packages/villages/src/server/features/scenes/embedding-recall-service.js";

async function waitFor(check: () => boolean) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (check()) return;
    await delay(10);
  }
  assert(check(), "background embedding did not finish");
}

await runCase("embedding-recall/selection-switch", async () => {
  const choices: string[] = [];
  const calls: { text: string[]; mode?: string }[] = [];
  let space = "hosted:one";
  let rejected = false;
  const recall = createEmbeddingRecall(async (choice) => {
    choices.push(choice);
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
  assert.deepEqual(choices, []);
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
  assert(choices.every((choice) => choice === "connection:chosen"));
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
  const attempts: string[] = [];
  const recall = createEmbeddingRecall(async (choice) => {
    attempts.push(choice);
    return "preparing";
  });
  assert.equal(recall.select("local"), "preparing");
  assert.equal(await recall.ranking("callback", "world"), undefined);
  assert.deepEqual(attempts, ["local"]);
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

await runCase("embedding-recall/engine-local-selection", async () => {
  const models = [
    { id: "first", label: "First", sha256: "first-sha", dimensions: 2 },
    { id: "second", label: "Second", sha256: "second-sha", dimensions: 3 },
  ];
  let activeModelId: string | null = null;
  let download: object | null = null;
  let runtimeInstalled = false;
  let switchDuringEmbedding = false;
  const posts: string[][] = [];
  const paths: string[] = [];
  const resolve = villageEmbeddingHost(
    { embeddingsFor: async () => assert.fail("Engine local selection must never use a default or named capability") },
    async <T>(path: string, init?: Parameters<typeof villageEngineJson>[1]) => {
      paths.push(path);
      if (path === "/api/builtin-embedding/status") {
        return { supported: true, runtimeInstalled, activeModelId, models, download } as T;
      }
      assert.equal(path, "/api/generate/raw/embeddings");
      assert.equal(init?.method, "POST");
      const body = init?.body as { connectionId: string; input: string[] };
      assert.equal(body.connectionId, "__builtin_embedding__");
      posts.push(body.input);
      const embedding = activeModelId === "first" ? [1, 0] : [0, 1, 0];
      if (switchDuringEmbedding) activeModelId = "second";
      return { data: body.input.map((_: string, index: number) => ({ index, embedding })) } as T;
    },
  );
  const signal = new AbortController().signal;
  assert.equal(await resolve("local", signal), null);
  download = { modelId: "first" };
  assert.equal(await resolve("local", signal), "preparing");
  assert.equal(posts.length, 0);
  download = null;
  activeModelId = "first";
  assert.equal(await resolve("local", signal), null, "an installed file still needs the Engine runtime");
  runtimeInstalled = true;
  const first = await resolve("local", signal);
  assert(first && first !== "preparing");
  assert.equal(first.label, "First");

  const recall = createEmbeddingRecall(resolve);
  recall.select("local");
  await waitFor(() => recall.select("local") === "ready");
  const record = "The astrolabe needs a bronze hinge.";
  const query = "That instrument we fixed";
  assert.deepEqual(posts, [], "checking availability does not load or download anything");
  const cold = await recall.ranking(query, "world");
  assert.equal(cold?.([record]).size, 0);
  await waitFor(() => posts.length === 1);
  assert.equal((await recall.ranking(query, "world"))?.([record]).get(0), 1);
  assert.deepEqual(posts, [[record], [query]]);

  activeModelId = "second";
  const switched = await recall.ranking(query, "world");
  assert.equal(switched?.([record]).size, 0, "switching models drops the old vectors before ranking");
  await waitFor(() => posts.length === 3);
  assert.equal((await recall.ranking(query, "world"))?.([record]).get(0), 1);
  const second = await resolve("local", signal);
  assert(second && second !== "preparing");
  assert.notEqual(first.spaceId, second.spaceId);
  assert.equal(second.label, "Second");

  activeModelId = "first";
  switchDuringEmbedding = true;
  assert.equal(await first.embed([query], signal), null, "a mid-request model switch discards the response");
  assert(paths.every((path) => path === "/api/builtin-embedding/status" || path === "/api/generate/raw/embeddings"));
  recall.dispose();
});
