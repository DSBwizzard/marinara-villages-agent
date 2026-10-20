import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

assert.ok(process.env.MARINARA_ENGINE_ROOT, "Supply an existing built Engine runtime; this test never builds Engine.");
process.env.DATA_DIR = await mkdtemp(join(tmpdir(), "villages-sprite-vision-"));
process.env.PROVIDER_LOCAL_URLS_ENABLED = "true";
await mkdir(process.env.DATA_DIR, { recursive: true });
const requests = [];
let hold = false;
const server = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  requests.push(JSON.parse(Buffer.concat(chunks).toString()));
  if (hold) return;
  response.setHeader("content-type", "application/json");
  response.end(
    JSON.stringify({
      id: "fixture",
      model: "sprite-vision-fixture",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: '{"name":"Relaxed","direction":"left"}' },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
    }),
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const root = join(process.env.MARINARA_ENGINE_ROOT, "packages/server/dist");
  const { createCapabilityLanguageModelHost } = await import(
    pathToFileURL(join(root, "services/capability-packages/capability-language-model.service.js")).href
  );
  const { apiConnections } = await import(pathToFileURL(join(root, "db/schema/index.js")).href);
  const connection = {
    id: "vision-fixture",
    provider: "openai",
    baseUrl: `http://127.0.0.1:${server.address().port}/v1`,
    model: "sprite-vision-fixture",
    apiKeyEncrypted: "",
    maxContext: 8192,
    maxTokensOverride: 400,
    treatAsLocalEndpoint: "true",
    defaultParameters: "{}",
  };
  // Every storage query is synthetic; no Engine database, credentials or user data are opened.
  const database = {
    select: () => ({ from: (table) => ({ where: async () => (table === apiConnections ? [connection] : []) }) }),
  };
  const model = await createCapabilityLanguageModelHost(database).resolve(connection.id);
  const image =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
  const messages = [
    { role: "system", content: "Describe the sprite." },
    { role: "user", content: "Analyze artwork.", images: [image] },
  ];
  const result = await model.chatComplete(messages, { maxTokens: 400, responseFormat: { type: "json_object" } });
  assert.equal(JSON.parse(result.content).direction, "left");
  assert.equal(requests.length, 1);
  assert.ok(
    requests[0].messages.some(
      (message) =>
        Array.isArray(message.content) &&
        message.content.some((part) => part.type === "image_url" && part.image_url.url === image),
    ),
    "Engine capability and provider must forward the actual image to the wire",
  );
  hold = true;
  const controller = new AbortController();
  const pending = model.chatComplete(messages, { signal: controller.signal, maxTokens: 400 });
  setTimeout(() => controller.abort(), 100);
  await assert.rejects(pending);
  console.log(
    "Existing Engine runtime: image forwarding, structured output and cancellation passed against a synthetic loopback provider.",
  );
} finally {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
