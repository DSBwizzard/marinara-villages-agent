import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.ts";
import {
  studioConnection,
  studioIsolatedConnection,
  studioParameters,
  resetStudioConnectionProfile,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-engine.ts";
import {
  planVillageStudioSheets,
  generateVillageStudioSheet,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-generation.ts";
import { encodeStudioPng } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-processing.ts";
const docs = new Map<string, any>();
const release = configureVillagesRuntime({
  persistence: {
    documents: {
      async getById(_pkg: string, id: string) {
        return structuredClone(docs.get(id) ?? null);
      },
      async create(input: any) {
        const row = { ...structuredClone(input), revision: 1 };
        docs.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const prev = docs.get(input.id);
        if (!prev || prev.revision !== input.expectedRevision) return null;
        const row = { ...structuredClone(input), revision: prev.revision + 1 };
        docs.set(input.id, row);
        return row;
      },
    },
  },
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
} as any);
const original = {
  id: "source",
  name: "Gemini via selected host",
  model: "gemini-image",
  provider: "image_generation",
  baseUrl: "https://host.example/v1",
  imageService: "gemini",
  imageGenerationQuality: "high",
  defaultParameters: JSON.stringify({
    customParameters: { seed: 3 },
    imageGeneration: { version: 1, service: "api", seed: 7 },
  }),
  isDefault: "true",
  apiKey: "MASKED_CREDENTIAL",
  apiKeyEncrypted: "ENGINE_ONLY",
};
const rows: any[] = [structuredClone(original)];
const transport: any[] = [];
let dupes = 0,
  paid = 0,
  failDuplicate = false,
  failure = false;
const savedFetch = globalThis.fetch;
const png = encodeStudioPng({
  width: 2,
  height: 2,
  data: new Uint8ClampedArray([10, 20, 30, 255, 20, 30, 40, 255, 30, 40, 50, 255, 40, 50, 60, 255]),
});
globalThis.fetch = async (url, init) => {
  const path = new URL(String(url)).pathname,
    body = init?.body ? JSON.parse(String(init.body)) : undefined;
  transport.push({ path, method: init?.method, body });
  if (path === "/api/connections") return Response.json(rows);
  const duplicate = path.match(/^\/api\/connections\/([^/]+)\/duplicate$/);
  if (duplicate) {
    dupes++;
    if (failDuplicate) return Response.json({ error: "Interrupted" }, { status: 504 });
    const row = { ...structuredClone(rows.find((r) => r.id === duplicate[1])), id: "copy-" + dupes };
    rows.push(row);
    return Response.json(row);
  }
  const parameters = path.match(/^\/api\/connections\/([^/]+)\/default-parameters$/);
  if (parameters) {
    rows.find((r) => r.id === parameters[1]).defaultParameters = JSON.stringify(body);
    return Response.json({ success: true });
  }
  const patch = path.match(/^\/api\/connections\/([^/]+)$/);
  if (patch) {
    Object.assign(
      rows.find((r) => r.id === patch[1]),
      body,
    );
    return Response.json({ success: true });
  }
  if (path === "/api/characters/avatar-generation/preview")
    return Response.json({ items: [{ id: body.promptOverrides[0].id, width: body.width, height: body.height }] });
  if (path === "/api/characters/avatar-generation") {
    paid++;
    if (failure) return Response.json({ error: "Outcome unknown" }, { status: 504 });
    return Response.json({ image: png });
  }
  throw Error("Unexpected API " + path);
};
async function main() {
  try {
    for (const unsafe of [
      { model: "other" },
      { messages: [] },
      { referenceImages: [] },
      { promptOverrides: [] },
      { nested: { apiKey: "secret" } },
      { custom: { input: "override" } },
    ])
      assert.throws(() => studioParameters(unsafe));
    const conn = await studioConnection("source");
    assert.equal(conn.host, original.baseUrl);
    assert.ok(!JSON.stringify(conn).includes("ENGINE_ONLY"));
    assert.ok(!JSON.stringify(conn).includes("MASKED_CREDENTIAL"));
    const custom = { size: "1024x1536", seed: 42 };
    const copies = await Promise.all([
      studioIsolatedConnection("source", custom),
      studioIsolatedConnection("source", custom),
    ]);
    assert.equal(dupes, 1, "concurrent profile setup duplicates once");
    assert.equal(copies[0].id, copies[1].id);
    assert.deepEqual(rows[0], original, "source and its defaults/fallbacks are preserved");
    assert.equal(rows[1].isDefault, false);
    assert.equal(rows[1].fallbackForAgents, false);
    assert.match(rows[1].name, /Sprite Studio/);
    assert.deepEqual(copies[0].defaults, {
      customParameters: custom,
      imageGeneration: { version: 1, service: "api", seed: 7 },
    });
    assert.equal(
      (await studioIsolatedConnection(copies[0].id, custom)).id,
      copies[0].id,
      "reapplying the selected copy reuses it",
    );
    assert.equal(dupes, 1);
    const identity = {
      name: "Roxie",
      appearance: "Bird in jacket",
      style: "Papercraft",
      view: "front" as const,
      referenceUrl: png,
      references: [
        { url: png, role: "original character identity" },
        { url: png, role: "approved front design" },
        { url: png, role: "approved right-facing side design" },
      ],
    };
    const expressions = [{ label: "happy", pose: "small wave" }];
    const plan = await planVillageStudioSheets(copies[0].id, identity, expressions, true);
    assert.equal(plan.providerResolution, "unknown");
    assert.equal(plan.capabilities?.references, "configured");
    assert.deepEqual(
      plan.batches[0].request?.referenceRoles,
      identity.references.map((r) => r.role),
    );
    assert.equal(plan.batches[0].request?.referenceHashes?.length, 3);
    let submitted = 0;
    const generate = () =>
      generateVillageStudioSheet({
        connectionId: copies[0].id,
        expectedModel: conn.model,
        identity,
        expressions,
        batch: plan.batches[0],
        onSubmit: async () => {
          submitted++;
        },
      });
    rows[1].baseUrl = "https://changed.example/v1";
    await assert.rejects(generate, /plan changed/);
    assert.equal(paid, 0);
    rows[1].baseUrl = original.baseUrl;
    rows[1].defaultParameters = JSON.stringify({ ...copies[0].defaults, customParameters: { ...custom, seed: 43 } });
    await assert.rejects(generate, /plan changed/);
    assert.equal(submitted, 0);
    rows[1].defaultParameters = JSON.stringify(copies[0].defaults);
    await generate();
    assert.equal(paid, 1);
    const body = transport.find((t) => t.path === "/api/characters/avatar-generation").body;
    assert.equal(body.connectionId, copies[0].id);
    assert.deepEqual(body.referenceImages, [png, png, png]);
    assert.equal(body.promptOverrides[0].prompt, plan.batches[0].request?.prompt);
    failure = true;
    await assert.rejects(generate, /504/);
    assert.equal(paid, 2, "uncertain transport is never automatically retried");
    failure = false;
    rows.push({ ...original, id: "fallback", fallbackForAgents: true });
    await assert.rejects(() => studioConnection(copies[0].id), /automatic fallback/);
    rows.pop();
    rows[1].baseUrl = "https://changed.example/v1";
    await assert.rejects(() => studioIsolatedConnection("source", custom), /copy changed/);
    rows[1].baseUrl = original.baseUrl;
    failDuplicate = true;
    await assert.rejects(() => studioIsolatedConnection("source", { seed: 99 }), /504/);
    const count = dupes;
    await assert.rejects(() => studioIsolatedConnection("source", { seed: 99 }), /uncertain outcome/);
    assert.equal(dupes, count);
    failDuplicate = false;
    await resetStudioConnectionProfile("source");
    await studioIsolatedConnection("source", custom);
    assert.equal(dupes, count + 1, "explicit reset permits a deliberate replacement");
    assert.ok(!JSON.stringify([...docs.values()]).includes("ENGINE_ONLY"));
    assert.ok(!JSON.stringify([...docs.values()]).includes("MASKED_CREDENTIAL"));
    assert.ok(!JSON.stringify(transport.filter((t) => t.body)).includes("ENGINE_ONLY"));
    console.log(
      "Engine boundary checks passed: selected host/model, frozen defaults, named references, isolated-copy reuse, source preservation, fallback detection, credential exclusion and uncertain outcomes.",
    );
  } finally {
    globalThis.fetch = savedFetch;
    release();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
