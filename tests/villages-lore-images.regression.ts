import assert from "node:assert/strict";
import {
  readVillageImageLoreEntries,
  readVillageLore,
} from "../packages/villages/src/server/adapters/engine/lorebooks.js";
import {
  readLoreEntryImages,
  readLoreImageReferences,
} from "../packages/villages/src/server/adapters/engine/lore-image-references.js";
import { fittedLoreUse, inspectedLoreImages } from "../packages/villages/src/server/domain/rules/lore-context.js";
import { createImageGeneration } from "../packages/villages/src/server/features/media/image-generation-service.js";
import { createTownMapImage } from "../packages/villages/src/server/features/media/town-map-image-service.js";
import type { LoreInspection } from "../packages/villages/src/shared/contracts/lore.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../packages/villages/src/server/domain/rules/image-limits.js";

const path = "/api/lorebooks/entry-images/11111111-1111-1111-1111-111111111111.png";
const attachment = { path, caption: "Blue stone arches" };
const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
const dataUrl = `data:image/png;base64,${png}`;
const entry = (id: string, patch = {}) => ({
  id,
  name: id,
  content: "A quiet harbor.",
  enabled: true,
  folderId: null,
  keys: ["harbor"],
  images: [attachment],
  ...patch,
});
const entries = [
  entry("matched"),
  entry("unmatched", { keys: ["mountain"] }),
  entry("disabled", { enabled: false }),
  entry("blank", { content: "" }),
  entry("oversized", { content: "z".repeat(10000) }),
];
const originalFetch = globalThis.fetch;
let mode = "valid",
  downloads = 0,
  cancelled = false;
let downloadEffect = () => {};
globalThis.fetch = async (url, init) => {
  const route = new URL(String(url)).pathname;
  if (route === "/api/lorebooks")
    return Response.json([{ id: "world", name: "World", enabled: true, imagePath: "/private-cover.png" }]);
  if (route.endsWith("/entries")) return Response.json(entries);
  if (route.endsWith("/folders")) return Response.json([]);
  if (route === "/api/image-metadata/inspect") return Response.json({ width: 1, height: 1 });
  assert.equal(route, path, "Only a validated Engine entry image is fetched");
  assert.equal(init?.redirect, "error");
  downloads++;
  downloadEffect();
  if (mode === "missing") return new Response(null, { status: 404 });
  if (mode === "redirect") throw new TypeError("Redirect forbidden");
  if (mode === "mime") return new Response("private data", { headers: { "content-type": "text/html" } });
  if (mode === "large")
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(Math.floor((MAX_LOCATION_IMAGE_BASE64_LENGTH * 3) / 4) + 1));
        },
        cancel() {
          cancelled = true;
        },
      }),
      { headers: { "content-type": "image/png" } },
    );
  return new Response(Buffer.from(png, "base64"), { headers: { "content-type": "image/png" } });
};
try {
  let report: LoreInspection | undefined;
  const selected = await readVillageImageLoreEntries(["world"], "harbor", 900, 1600, (value) => {
    report = value;
  });
  assert.equal(
    selected.length,
    2,
    "Artwork accepts image-only entries, but not disabled, unmatched or over-budget entries",
  );
  assert.match(selected.join("\n"), /Blue stone arches/);
  const used = fittedLoreUse(report, selected, [selected[0]!], "Image");
  assert.deepEqual(inspectedLoreImages(report, used), [attachment], "Final prompt omissions also omit their images");
  assert.deepEqual(inspectedLoreImages(report, []), []);
  assert.equal((await readVillageLore(["world"], "harbor")).length, 1, "Text requests retain their existing selection");
  assert.equal(downloads, 0, "Selection never downloads images or spends");
  const service = createTownMapImage({
    readVillageImageLoreEntries,
    generateVillageImage: async (input) => {
      assert.deepEqual(input.loreImages, [attachment, attachment]);
      return { dataUrl, mime: "image/png", bytes: new Uint8Array() };
    },
    inspectVillageImage: async () => ({ width: 1, height: 1 }),
  });
  const map = await service.generateVillageTownMap({ setting: "harbor", selectedLorebookIds: ["world"] });
  assert.doesNotMatch(
    JSON.stringify(map.lore),
    /entry-images|arches|caption/,
    "Public attribution never exposes image paths or captions",
  );
  assert.deepEqual(await readLoreImageReferences([attachment]), [dataUrl]);
  for (const invalid of [
    "https://example.com/private.png",
    "//example.com/x",
    "/api/lorebooks/entry-images/../secret.png",
    "/api/global-gallery/file/image.png",
    path + "?x=1",
  ]) {
    const before = downloads;
    await assert.rejects(readLoreImageReferences([{ ...attachment, path: invalid }]), /Invalid Lorebook/);
    assert.equal(downloads, before);
  }
  assert.throws(() => readLoreEntryImages([{ ...attachment, caption: "x".repeat(501) }]));
  for (const failure of ["missing", "redirect", "mime", "large"]) {
    mode = failure;
    await assert.rejects(readLoreImageReferences([attachment]));
  }
  assert.equal(cancelled, true, "An oversized stream is cancelled");
  mode = "valid";
  const calls: any[] = [];
  let connections: any[] = [
    { id: "image", provider: "image_generation", imageService: "openai", model: "gpt-image-1" },
  ];
  let enabled = true;
  const generator = createImageGeneration({
    villageEngineJson: async (route, init) => {
      if (route === "/api/connections") return connections as any;
      assert.equal(route, "/api/characters/avatar-generation");
      calls.push(init?.body);
      return { image: dataUrl } as any;
    },
    villagesImageConnectionChoice: async () => ({ enabled, connectionId: "image" }),
    readLoreImageReferences,
    decodeVillageImageDataUrl: () => ({ dataUrl, mime: "image/png", bytes: new Uint8Array() }),
  });
  const input = {
    name: "Test map",
    prompt: "Empty harbor",
    width: 64,
    height: 64,
    maxBase64Length: 1000,
    loreImages: [attachment, attachment],
  };
  await generator.generateVillageImage(input);
  assert.deepEqual(calls[0].referenceImages, [dataUrl], "Duplicate entry attachments are sent once");
  await generator.generateVillageImage({ ...input, referenceImages: ["existing-zone"] });
  assert.deepEqual(
    calls[1].referenceImages,
    ["existing-zone", dataUrl],
    "Editing preserves the existing Zone reference first",
  );
  const before = calls.length;
  await assert.rejects(
    generator.generateVillageImage({ ...input, referenceImages: ["a", "b", "c", "d"] }),
    /at most 4/,
  );
  mode = "missing";
  await assert.rejects(generator.generateVillageImage(input), /unavailable/);
  mode = "valid";
  connections.push({ ...connections[0], id: "fallback", fallbackForAgents: true, imageService: "pollinations" });
  await assert.rejects(generator.generateVillageImage(input), /fallback cannot use/);
  connections = [{ ...connections[0], imageService: "automatic1111" }];
  await assert.rejects(generator.generateVillageImage({ ...input, referenceImages: ["zone"] }), /fallback cannot use/);
  connections = [
    { ...connections[0], imageService: "comfyui", comfyuiWorkflow: "%reference_image% %reference_image_02%" },
  ];
  await assert.rejects(
    generator.generateVillageImage({ ...input, referenceImages: ["zone", "base"] }),
    /fallback cannot use/,
  );
  connections = [{ ...connections[0], imageService: "openai" }];
  downloadEffect = () => {
    connections[0].imageService = "pollinations";
  };
  await assert.rejects(generator.generateVillageImage(input), /connection changed/);
  downloadEffect = () => {};
  connections[0].imageService = "openai";
  await assert.rejects(
    generator.generateVillageImage({
      ...input,
      beforeDispatch: async () => {
        throw Error("Claim expired");
      },
    }),
    /Claim expired/,
  );
  assert.equal(calls.length, before, "Invalid references and unsupported providers never dispatch");
  enabled = false;
  connections = [{ ...connections[0], imageService: "openai" }];
  await generator.generateVillageImage({ ...input, connectionId: "image" });
  assert.equal(
    calls.length,
    before + 1,
    "Explicit founding connection selection remains independent of Village automatic-image settings",
  );
} finally {
  globalThis.fetch = originalFetch;
}
console.log(
  "Lorebook image selection, captions, final inclusion, private loading, limits and provider dispatch passed; synthetic provider only.",
);
