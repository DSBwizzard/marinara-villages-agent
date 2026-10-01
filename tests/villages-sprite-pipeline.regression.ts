import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import {
  generateVillageStudioSheet,
  planVillageStudioSheets,
  selectStudioMatte,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-generation.ts";
import {
  SPRITE_STYLES,
  STUDIO_NEGATIVE_PROMPT,
} from "../packages/villages/src/engine/packages/server/src/services/villages/sprite-studio-model.ts";
import { createStudioRenderCache } from "../packages/villages/src/engine/packages/client/src/villages-sprite-render-cache.ts";

// Real RGBA PNG fixture includes an opaque feather, half alpha, and native
// transparency. Source tests must not rely on a fake image or strip its alpha.
function chunk(type: string, data: Buffer) {
  const body = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const length = Buffer.alloc(4),
    checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, body, checksum]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(2);
header.writeUInt32BE(2, 4);
header[8] = 8;
header[9] = 6;
const bytes = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", header),
  chunk(
    "IDAT",
    deflateSync(Buffer.from([0, 35, 226, 244, 255, 50, 100, 180, 128, 0, 255, 0, 255, 0, 20, 30, 35, 255])),
  ),
  chunk("IEND", Buffer.alloc(0)),
]);
const png = `data:image/png;base64,${bytes.toString("base64")}`;
const originalFetch = globalThis.fetch;
let model = "test-image",
  revision = "first",
  reference = png,
  constrained = false,
  fail = false;
let submissions = 0,
  generated = 0;
const previews: any[] = [],
  requests: any[] = [];
globalThis.fetch = async (url, init) => {
  const path = new URL(String(url)).pathname;
  const body = init?.body ? JSON.parse(String(init.body)) : {};
  if (path === "/api/connections")
    return Response.json([{ id: "image", name: "Test", model, provider: "image_generation" }]);
  if (path.endsWith("/reference.png"))
    return new Response(Buffer.from(reference.split(",")[1]!, "base64"), { headers: { "content-type": "image/png" } });
  if (path === "/api/characters/avatar-generation/preview") {
    previews.push(body);
    return Response.json({
      items: [
        {
          id: body.promptOverrides[0].id,
          prompt: "Generic character reference sheet, hero view, turnarounds and palette. Host " + revision,
          negativePrompt: "no labels " + revision,
          width: constrained ? 1024 : body.width,
          height: constrained ? 1024 : body.height,
        },
      ],
    });
  }
  assert.equal(path, "/api/characters/avatar-generation", "Studio never calls the sprite cleanup endpoint");
  generated++;
  requests.push(body);
  if (fail) return Response.json({ error: "Unknown provider timeout" }, { status: 504 });
  return Response.json({ image: png, prompt: body.promptOverrides[0].prompt });
};
async function main() {
  try {
    assert.equal(selectStudioMatte("Aqua blue cyan feathers"), "#FF00FF");
    assert.equal(selectStudioMatte("lavender purple coat"), "#00FF00");
    assert.equal(selectStudioMatte("pink purple coat olive hair"), "#00FFFF");
    const identity = {
      name: "Aqua",
      appearance: "Cyan feathers and brown trousers",
      style: "Custom art with no outline",
      view: "front" as const,
      referenceUrl: "/api/sprites/villages-12345678-1234-1234-1234-123456789abc/file/reference.png",
    };
    const expressions = Array.from({ length: 13 }, (_, i) => ({ label: "e_" + i, pose: "Pose " + i }));
    constrained = true;
    const plan = await planVillageStudioSheets("image", identity, expressions, false);
    assert.equal(plan.protocol, 3);
    assert.deepEqual(
      plan.batches.map((b) => b.count),
      [6, 6, 1],
    );
    assert.equal(generated, 0, "planning never submits images");
    assert.ok(plan.batches.every((b) => b.width === 1024 && b.height === 1024));
    for (let offset = 0, i = 0; i < plan.batches.length; i++) {
      const batch = plan.batches[i]!;
      const result = await generateVillageStudioSheet({
        connectionId: "image",
        expectedModel: model,
        identity,
        expressions: expressions.slice(offset, offset + batch.count),
        batch,
        onSubmit: async () => {
          submissions++;
        },
      });
      offset += batch.count;
      assert.equal(result.image, png, "the returned bytes and native alpha remain untouched");
      assert.equal(result.source.sha256, createHash("sha256").update(bytes).digest("hex"));
      assert.equal(result.source.kind, "generated-raw");
      const body = requests[i];
      assert.deepEqual(body.referenceImages, [png]);
      assert.equal(body.purpose, "character-sheet");
      assert.equal(body.promptOverrides[0].prompt, batch.request!.prompt);
      assert.equal(body.promptOverrides[0].negativePrompt, batch.request!.negativePrompt);
      assert.equal(body.promptOverrides[0].negativePrompt, STUDIO_NEGATIVE_PROMPT);
      assert.match(body.promptOverrides[0].prompt, /Custom art with no outline/);
      assert.match(body.promptOverrides[0].prompt, /Front view/);
      assert.match(body.promptOverrides[0].prompt, /1024 by 1024/);
      assert.ok(
        body.promptOverrides[0].prompt.includes("exactly " + batch.cols + " columns and " + batch.rows + " rows"),
      );
      assert.match(body.promptOverrides[0].prompt, /shared character scale and foot baseline/);
      assert.match(body.promptOverrides[0].prompt, /gutters and margins/);
      for (let cell = 0; cell < batch.count; cell++) {
        const expression = expressions[offset - batch.count + cell]!;
        assert.ok(
          body.promptOverrides[0].prompt.includes(
            "Cell " + (cell + 1) + ": " + expression.label.replace(/_/g, " ") + ". " + expression.pose,
          ),
        );
      }
      assert.doesNotMatch(body.promptOverrides[0].prompt, /hero view|turnarounds|palette|Host/);
      assert.match(body.promptOverrides[0].prompt, /#FF00FF/);
      assert.doesNotMatch(body.promptOverrides[0].prompt, /transparent background/i);
      assert.equal(body.width, batch.width);
      assert.equal(body.height, batch.height);
      assert.equal(body.noBackground, undefined);
      assert.equal(body.nativeTransparentPng, undefined);
    }
    assert.equal(generated, 3);
    assert.equal(submissions, 3);
    const run = () =>
      generateVillageStudioSheet({
        connectionId: "image",
        expectedModel: "test-image",
        identity,
        expressions: expressions.slice(0, 6),
        batch: plan.batches[0]!,
        onSubmit: async () => {
          submissions++;
        },
      });
    revision = "changed"; // Generic Engine wording does not control Studio submissions.
    model = "changed";
    await assert.rejects(run, /model changed/);
    model = "test-image";
    constrained = false; // Force changed dimensions, without a new provider call.
    const oldWidth = plan.batches[0]!.width;
    plan.batches[0]!.width = 512;
    await assert.rejects(run, /plan changed/);
    plan.batches[0]!.width = oldWidth;
    constrained = true;
    reference = `data:image/png;base64,${Buffer.concat([bytes, Buffer.from("changed")]).toString("base64")}`;
    await assert.rejects(run, /plan changed/);
    reference = png;
    plan.batches[0]!.request!.pipelineVersion = 1;
    await assert.rejects(run, /plan changed/);
    plan.batches[0]!.request!.pipelineVersion = 2;
    const frozen = plan.batches[0]!.request!;
    const originalPrompt = frozen.prompt;
    frozen.prompt = "Generic character reference sheet";
    await assert.rejects(run, /plan changed/);
    frozen.prompt = originalPrompt;
    const originalNegative = frozen.negativePrompt;
    frozen.negativePrompt = "Host style";
    await assert.rejects(run, /plan changed/);
    frozen.negativePrompt = originalNegative;
    const originalStyle = identity.style;
    identity.style = SPRITE_STYLES.BATTLEHIGHWAY;
    await assert.rejects(run, /plan changed/);
    identity.style = originalStyle;
    const originalPose = expressions[0]!.pose;
    expressions[0]!.pose = "Different pose";
    await assert.rejects(run, /plan changed/);
    expressions[0]!.pose = originalPose;
    assert.equal(generated, 3);
    assert.equal(submissions, 3, "stale plans never increment attempted requests");
    fail = true;
    await assert.rejects(run, /504/);
    assert.equal(generated, 4);
    assert.equal(submissions, 4, "a timeout gets no automatic paid retry");
    await assert.rejects(
      () =>
        planVillageStudioSheets(
          "image",
          { ...identity, referenceUrl: "https://invalid.test/reference.png" },
          expressions,
          false,
        ),
      /reference is unavailable/,
    );
    fail = false;
    const individual = await planVillageStudioSheets("image", identity, expressions.slice(0, 3), true);
    assert.equal(individual.batches.length, 3);
    assert.ok(individual.batches.every((b) => b.cols === 1 && b.rows === 1));
    for (const style of [SPRITE_STYLES.PAPERCRAFT, SPRITE_STYLES.BATTLEHIGHWAY, "Custom watercolor ink"]) {
      const styled = { ...identity, style, view: "side" as const };
      const chosen = [
        { label: "happy", pose: "Running with arms raised" },
        { label: "thinking", pose: "Hand on chin" },
      ];
      const styledPlan = await planVillageStudioSheets("image", styled, chosen, false);
      await generateVillageStudioSheet({
        connectionId: "image",
        expectedModel: model,
        identity: styled,
        expressions: chosen,
        batch: styledPlan.batches[0]!,
        onSubmit: async () => {
          submissions++;
        },
      });
      const submitted = requests.at(-1).promptOverrides[0];
      assert.ok(submitted.prompt.includes(style));
      assert.match(submitted.prompt, /OFF-CANVAS TO THE RIGHT/);
      assert.match(submitted.prompt, /Cell 1: happy\. Running with arms raised/);
      assert.match(submitted.prompt, /Cell 2: thinking\. Hand on chin/);
      assert.equal(submitted.prompt, styledPlan.batches[0]!.request!.prompt);
      assert.equal(submitted.negativePrompt, STUDIO_NEGATIVE_PROMPT);
      assert.doesNotMatch(submitted.prompt, /hero view|turnarounds|palette|Host/);
    }
    for (let count = 1; count <= 6; count++) {
      const sized = await planVillageStudioSheets("image", identity, expressions.slice(0, count), false);
      assert.equal(sized.batches[0]!.count, count);
      assert.equal(sized.batches.length, 1);
      assert.equal(sized.batches[0]!.request!.pipelineVersion, 2);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  const cache = createStudioRenderCache<number>();
  const releases: Array<() => void> = [];
  let active = 0,
    maxActive = 0,
    calls = 0;
  const work = async () => {
    calls++;
    active++;
    maxActive = Math.max(maxActive, active);
    await new Promise<void>((resolve) => releases.push(resolve));
    active--;
    return calls;
  };
  const a = cache.get("a", work),
    duplicate = cache.get("a", work),
    b = cache.get("b", work),
    c = cache.get("c", work);
  assert.equal(a, duplicate, "pending work is shared");
  await Promise.resolve();
  assert.equal(calls, 2);
  releases.splice(0).forEach((release) => release());
  await Promise.all([a, b]);
  await new Promise((resolve) => setTimeout(resolve, 0));
  releases.splice(0).forEach((release) => release());
  await c;
  assert.equal(maxActive, 2, "only two render tasks can run");
  await cache.get("a", async () => {
    throw Error("cache missed");
  });
  for (let i = 0; i < 12; i++) await cache.get("new-" + i, async () => i);
  let evicted = false;
  await cache.get("a", async () => {
    evicted = true;
    return 0;
  });
  assert.equal(evicted, true, "ready cache holds at most 12 cutouts");
  cache.dispose();
  await assert.rejects(() => cache.get("a", async () => 0), /closed/);
  const retry = createStudioRenderCache<number>();
  let attempts = 0;
  await assert.rejects(
    () =>
      retry.get("bad", async () => {
        attempts++;
        throw Error("failed");
      }),
    /failed/,
  );
  await retry.get("bad", async () => {
    attempts++;
    return 1;
  });
  assert.equal(attempts, 2, "failed work can be explicitly retried");
  retry.dispose();
  const closing = createStudioRenderCache<number>();
  let releaseOne: (() => void) | undefined;
  const held = closing.get("held", async () => {
    await new Promise<void>((resolve) => {
      releaseOne = resolve;
    });
    return 1;
  });
  const heldTwo = closing.get("heldTwo", async () => {
    await held;
    return 2;
  });
  const queued = closing.get("queued", async () => {
    throw Error("queued work should never run after closing");
  });
  await Promise.resolve();
  closing.dispose();
  await assert.rejects(() => queued, /closed/);
  releaseOne!();
  await Promise.all([held, heldTwo]);
  console.log(
    "Raw Studio pipeline passed: reviewed request parity, source alpha/bytes, references, matte selection, stale plans, batching, no retries and bounded render ownership.",
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
