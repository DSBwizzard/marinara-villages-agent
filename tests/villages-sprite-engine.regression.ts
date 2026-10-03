import assert from "node:assert/strict";
import { defaultStudioState } from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts";
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
let profileText = "Watercolor";
const composition = "\nMandatory full-body composition: entire character from head to feet.";
globalThis.fetch = async (url, init) => {
  const path = new URL(String(url)).pathname,
    body = init?.body ? JSON.parse(String(init.body)) : undefined;
  transport.push({ path, method: init?.method, body });
  if (path === "/api/connections") return Response.json(rows);
  if (path === "/api/app-settings/ui")
    return Response.json({
      value: JSON.stringify({
        imageStyleProfiles: {
          defaultProfileId: "paint",
          profiles: [{ id: "paint", name: "Paint", baseStyle: "custom", styleText: profileText }],
        },
      }),
    });
  if (path === "/api/sprites/generate-sheet/preview")
    return Response.json({
      items: [
        {
          id: body.promptOverrides[0].id,
          width: 1024,
          height: 1536,
          prompt: body.promptOverrides[0].prompt + composition,
          negativePrompt: body.promptOverrides[0].negativePrompt,
        },
      ],
    });
  if (path === "/api/sprites/generate-sheet") {
    paid++;
    return failure
      ? Response.json({ error: "Outcome unknown" }, { status: 504 })
      : Response.json({
          sheetBase64: png.split(",")[1],
          cells: body.expressions.map((expression: string) => ({ expression, base64: png.split(",")[1] })),
        });
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
    const body = transport.find((t) => t.path === "/api/sprites/generate-sheet").body;
    assert.equal(body.connectionId, "source");
    assert.deepEqual(body.referenceImages, [png]);
    assert.equal(body.fullBodyExpressionMode, true);
    assert.equal(body.noBackground, true);
    assert.equal(body.nativeTransparentPng, false);
    assert.equal(body.promptOverrides[0].prompt + composition, plan.batches[0]!.request!.prompt);
    assert.equal(plan.batches[0]!.width, 1024);
    assert.equal(plan.batches[0]!.height, 1536);
    assert.match(body.promptOverrides[0].prompt, /ONE complete full-body character/);
    assert.equal(body.promptOverrides[0].prompt.includes(composition), false, "Engine adds its contract once");
    assert.deepEqual(
      rows,
      original,
      "generation creates no connections and does not change Engine settings or fallbacks",
    );
    assert.ok(transport.every((t) => !t.path.includes("/duplicate") && t.method !== "PATCH" && t.method !== "PUT"));
    assert.ok(!JSON.stringify(plan).includes("SECRET"));
    const editableIdentity = {
      ...identity,
      settings: { ...defaultStudioState().settings, styleSelection: { kind: "studio" as const } },
      facingPrompt: "Full right-facing profile.",
      view: "side" as const,
    };
    const editablePlan = await planVillageStudioSheets("source", editableIdentity, expressions, false);
    assert.match(editablePlan.batches[0]!.request!.prompt, /Full right-facing profile/);
    assert.doesNotMatch(editablePlan.batches[0]!.request!.prompt, /cheating out/);
    assert.equal(
      editablePlan.batches[0]!.request!.prompt.startsWith("VILLAGES SPRITE INSTRUCTIONS:"),
      true,
      "Off profile adds no inferred subject tags from instructions",
    );
    await assert.rejects(
      () =>
        generateVillageStudioSheet({
          connectionId: "source",
          expectedModel: conn.model,
          identity: { ...editableIdentity, facingPrompt: "" },
          expressions,
          batch: editablePlan.batches[0]!,
          onSubmit: async () => {
            submitted++;
          },
        }),
      /plan changed/,
    );
    assert.equal(paid, 1, "changing facing invalidates the reviewed plan before spending");
    failure = true;
    await assert.rejects(generate, /504/);
    assert.equal(paid, 2, "Studio does not resubmit an uncertain Engine generation");
    const styledIdentity = {
      ...identity,
      settings: { ...defaultStudioState().settings, styleSelection: { kind: "default" as const } },
      style: "",
    };
    const styledPlan = await planVillageStudioSheets("source", styledIdentity, expressions, false);
    profileText = "Changed profile";
    await assert.rejects(
      generateVillageStudioSheet({
        connectionId: "source",
        expectedModel: conn.model,
        identity: styledIdentity,
        expressions,
        batch: styledPlan.batches[0]!,
        onSubmit: async () => {
          submitted++;
        },
      }),
      /plan changed/,
    );
    assert.equal(paid, 2, "a changed profile cannot submit an old plan");
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
