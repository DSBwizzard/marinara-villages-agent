import assert from "node:assert/strict";
import { studioConnection } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-engine.ts";
import {
  planVillageStudioSheets,
  generateVillageStudioSheet,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-generation.ts";
import { encodeStudioPng } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-processing.ts";
const rows: any[] = [
  {
    id: "source",
    name: "Engine image host",
    model: "gemini-image",
    provider: "image_generation",
    baseUrl: "https://user:secret@host.example/v1?api_key=SECRET",
    imageService: "gemini",
    apiKey: "ENGINE_CREDENTIAL",
    defaultParameters: JSON.stringify({
      customParameters: { seed: 3, model: "engine-default", authorization: "SECRET", token: "SECRET" },
      imageGeneration: { version: 1, service: "api", seed: 7 },
    }),
  },
  { id: "fallback", provider: "image_generation", fallbackForAgents: true, model: "backup" },
];
const original = structuredClone(rows),
  transport: any[] = [];
const png = encodeStudioPng({
  width: 2,
  height: 2,
  data: new Uint8ClampedArray([10, 20, 30, 255, 20, 30, 40, 255, 30, 40, 50, 255, 40, 50, 60, 255]),
});
const savedFetch = globalThis.fetch;
let paid = 0,
  failure = false;
globalThis.fetch = async (url, init) => {
  const path = new URL(String(url)).pathname,
    body = init?.body ? JSON.parse(String(init.body)) : undefined;
  transport.push({ path, method: init?.method, body });
  if (path === "/api/connections") return Response.json(rows);
  if (path === "/api/characters/avatar-generation/preview")
    return Response.json({ items: [{ id: body.promptOverrides[0].id, width: body.width, height: body.height }] });
  if (path === "/api/characters/avatar-generation") {
    paid++;
    return failure ? Response.json({ error: "Outcome unknown" }, { status: 504 }) : Response.json({ image: png });
  }
  throw Error("Unexpected Engine request " + path);
};
async function main() {
  try {
    const conn = await studioConnection("source");
    assert.equal(conn.host, "https://host.example/v1");
    assert.ok(!JSON.stringify(conn).includes("SECRET"));
    assert.ok(!JSON.stringify(conn).includes("ENGINE_CREDENTIAL"));
    assert.equal(
      (conn.defaults.customParameters as any).model,
      "engine-default",
      "Engine defaults are accepted without Studio-specific vetoes",
    );
    const identity = {
      name: "Bird",
      appearance: "Bird in jacket",
      style: "Papercraft",
      view: "front" as const,
      referenceUrl: png,
    };
    const expressions = [{ label: "happy", pose: "wave" }];
    const plan = await planVillageStudioSheets("source", identity, expressions, false);
    let submitted = 0;
    const generate = () =>
      generateVillageStudioSheet({
        connectionId: "source",
        expectedModel: conn.model,
        identity,
        expressions,
        batch: plan.batches[0]!,
        onSubmit: async () => {
          submitted++;
        },
      });
    rows[0].defaultParameters = JSON.stringify({ customParameters: { seed: 42 } });
    await assert.rejects(generate, /plan changed/);
    assert.equal(paid, 0);
    rows[0].defaultParameters = original[0].defaultParameters;
    await generate();
    assert.equal(paid, 1);
    assert.equal(submitted, 1);
    const body = transport.find((t) => t.path === "/api/characters/avatar-generation").body;
    assert.equal(body.connectionId, "source");
    assert.deepEqual(body.referenceImages, [png]);
    assert.equal(body.promptOverrides[0].prompt, plan.batches[0]!.request!.prompt);
    assert.deepEqual(
      rows,
      original,
      "generation creates no connections and does not change Engine settings or fallbacks",
    );
    assert.ok(transport.every((t) => !t.path.includes("/duplicate") && t.method !== "PATCH" && t.method !== "PUT"));
    assert.ok(!JSON.stringify(plan).includes("SECRET"));
    failure = true;
    await assert.rejects(generate, /504/);
    assert.equal(paid, 2, "Studio does not resubmit an uncertain Engine generation");
    console.log(
      "Engine sprite checks passed: configured defaults and fallback, credential-free receipts, no copies, and no automatic resubmission.",
    );
  } finally {
    globalThis.fetch = savedFetch;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
