// Villages owns the sheet and all derivatives. The raw image endpoint performs
// one image submission and never applies the Engine's sprite matte cleanup.
import { createHash } from "node:crypto";
import { badRequest } from "./errors.js";
import { villageEngineJson, villageEngineBaseUrl } from "./engine-loopback.js";
import { asRecord, asString } from "./coerce.js";
import { decodeVillageImageDataUrl, imagePromptId } from "./image-generation.js";
import {
  studioPrompt,
  STUDIO_NEGATIVE_PROMPT,
  type StudioBatch,
  type StudioPlan,
  type StudioView,
  type StudioSource,
} from "./sprite-studio-model.js";

type Expression = { label: string; pose: string };
type Identity = { name: string; appearance: string; style: string; view: StudioView; referenceUrl: string };
type Connection = { id: string; name: string; model: string; source: string };
export const STUDIO_PIPELINE_VERSION = 2;
const PATH = "/api/characters/avatar-generation";
const digest = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const enabled = (value: unknown) => value === true || value === "true";
const layouts: Record<number, [number, number]> = { 1: [1, 1], 2: [2, 1], 3: [2, 2], 4: [2, 2], 5: [3, 2], 6: [3, 2] };

/** A separate configured fallback would let the host switch providers after a failure. */
export async function studioImageConnection(connectionId: string): Promise<Connection> {
  const rows = await villageEngineJson<unknown>("/api/connections");
  const images = (Array.isArray(rows) ? rows : [])
    .map(asRecord)
    .filter((row) => row.provider === "image_generation" && !enabled(row.profileImportReviewRequired));
  const chosen = images.find((row) => row.id === connectionId);
  if (!chosen) throw badRequest("The selected image connection is missing. Choose another in Sprite Studio.");
  const fallback = images.find((row) => enabled(row.fallbackForAgents));
  if (fallback && fallback.id !== connectionId)
    throw badRequest(
      "This image connection has a different automatic fallback in Marinara. Choose that fallback connection directly, or turn off image fallback before drawing in Sprite Studio.",
    );
  return {
    id: connectionId,
    name: asString(chosen.name) || connectionId,
    model: asString(chosen.model),
    source: asString(chosen.imageGenerationSource || chosen.imageService || chosen.model),
  };
}

export function selectStudioMatte(appearance: string): string {
  const candidates: Array<[string, RegExp]> = [
    ["#FF00FF", /\b(?:pink|magenta|fuchsia|purple|violet|lavender|rose|mauve)\b/gi],
    [
      "#00FF00",
      /\b(?:green|lime|emerald|olive|mint|chartreuse|blue|cyan|aqua|teal|turquoise|azure|cobalt|navy|indigo)\b/gi,
    ],
    ["#00FFFF", /\b(?:blue|cyan|aqua|turquoise|teal|navy|azure|cobalt|indigo|green|lime|emerald|mint)\b/gi],
  ];
  return candidates
    .map(([hex, pattern]) => ({ hex, conflicts: [...appearance.matchAll(pattern)].length }))
    .sort((a, b) => a.conflicts - b.conflicts)[0]!.hex;
}

async function readReference(url: string): Promise<string> {
  if (url.startsWith("data:")) {
    const decoded = decodeVillageImageDataUrl(url, { label: "identity reference", maxBase64Length: 16_000_000 });
    return `data:${decoded.mime};base64,${Buffer.from(decoded.bytes).toString("base64")}`;
  }
  if (!/^\/api\/sprites\/villages-[a-f0-9-]{36}\/file\/[a-z0-9_-]+\.(png|jpeg|jpg|webp)(\?[^#]*)?$/i.test(url))
    throw badRequest("The captured identity reference is unavailable. Capture it again.");
  const response = await fetch(villageEngineBaseUrl() + url);
  if (!response.ok) throw badRequest("The captured identity reference could not be read.");
  if (Number(response.headers.get("content-length")) > 12_000_000)
    throw badRequest("The identity reference is too large.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 12_000_000) throw badRequest("The identity reference is too large.");
  const mime = response.headers.get("content-type")?.split(";")[0] || "image/png";
  return readReference(`data:${mime};base64,${bytes.toString("base64")}`);
}

function requestBody(
  connectionId: string,
  identity: Identity,
  reference: string,
  batch: StudioBatch,
  prompt: string,
  negativePrompt = STUDIO_NEGATIVE_PROMPT,
) {
  return {
    connectionId,
    name: identity.name,
    appearance: `${identity.name}. ${identity.appearance}`.slice(0, 2000),
    purpose: "character-sheet",
    width: batch.width,
    height: batch.height,
    referenceImages: [reference],
    promptOverrides: [{ id: imagePromptId(identity.name, "character-sheet"), prompt, negativePrompt }],
  };
}

async function preview(body: ReturnType<typeof requestBody>) {
  const answer = asRecord(await villageEngineJson<unknown>(PATH + "/preview", { body }));
  const items = Array.isArray(answer.items) ? answer.items.map(asRecord) : [];
  const item = items[0];
  if (items.length !== 1 || !item || item.id !== body.promptOverrides[0]!.id)
    throw badRequest("This image model cannot preview one sheet request. Choose a different image connection.");
  const width = Number(item.width),
    height = Number(item.height);
  if (![width, height].every((v) => Number.isInteger(v) && v > 0 && v <= 4096) || width * height > 16_000_000)
    throw badRequest("The image connection did not report a usable sprite request.");
  // Character-sheet previews ignore overrides and return a generic design-sheet
  // prompt. Only their dimensions describe our request; Villages owns its text.
  return { width, height };
}

function fingerprint(connection: Connection, body: ReturnType<typeof requestBody>, matteHex: string) {
  return digest(JSON.stringify({ pipelineVersion: STUDIO_PIPELINE_VERSION, connection, matteHex, body }));
}

export async function planVillageStudioSheets(
  connectionId: string,
  identity: Identity,
  expressions: Expression[],
  individual: boolean,
): Promise<StudioPlan> {
  const connection = await studioImageConnection(connectionId);
  const reference = await readReference(identity.referenceUrl);
  const matteHex = selectStudioMatte(identity.name + " " + identity.appearance);
  const batches: StudioBatch[] = [];
  for (let offset = 0; offset < expressions.length;) {
    const count = Math.min(individual ? 1 : 6, expressions.length - offset);
    const [cols, rows] = layouts[count]!;
    const chosen = expressions.slice(offset, offset + count);
    let target: StudioBatch = { cols, rows, count, width: cols * 512, height: rows * 768 };
    // A provider may constrain the requested dimensions. Compile the layout at
    // that actual size and require it to settle before displaying the plan.
    for (let pass = 0; pass < 3; pass++) {
      const draftPrompt = studioPrompt({ ...identity, expressions: chosen, batch: target, matteHex });
      const compiled = await preview(requestBody(connectionId, identity, reference, target, draftPrompt));
      if (compiled.width !== target.width || compiled.height !== target.height) {
        target = { ...target, width: compiled.width, height: compiled.height };
        continue;
      }
      const body = requestBody(connectionId, identity, reference, target, draftPrompt);
      target.request = {
        pipelineVersion: STUDIO_PIPELINE_VERSION,
        matteHex,
        draftPrompt,
        prompt: draftPrompt,
        negativePrompt: STUDIO_NEGATIVE_PROMPT,
        fingerprint: fingerprint(connection, body, matteHex),
      };
      break;
    }
    if (!target.request) throw badRequest("The image size changed during planning. Refresh the request summary.");
    batches.push(target);
    offset += count;
  }
  return {
    protocol: 3,
    connection,
    batches,
    estimatedCost: null,
    localWorkflow: /comfy|swarm|runpod|local/i.test(connection.source),
  };
}

export function studioImageSource(image: string, kind: StudioSource["kind"], batch?: StudioBatch): StudioSource {
  const decoded = decodeVillageImageDataUrl(image, { label: "sprite source", maxBase64Length: 16_000_000 });
  return {
    kind,
    sha256: digest(decoded.bytes),
    ...(batch?.request ? { matteHex: batch.request.matteHex, pipelineVersion: batch.request.pipelineVersion } : {}),
  };
}

export async function generateVillageStudioSheet(input: {
  connectionId: string;
  expectedModel: string;
  identity: Identity;
  expressions: Expression[];
  batch: StudioBatch;
  onSubmit: () => Promise<void>;
}): Promise<{ image: string; source: StudioSource }> {
  const { connectionId, expectedModel, identity, expressions, batch, onSubmit } = input;
  const connection = await studioImageConnection(connectionId);
  if (connection.model !== expectedModel)
    throw badRequest("The image model changed. Review the generation plan again.");
  const request = batch.request;
  if (!request || request.pipelineVersion !== STUDIO_PIPELINE_VERSION)
    throw badRequest("The generation plan changed. Refresh the request summary.");
  const reference = await readReference(identity.referenceUrl);
  const prompt = studioPrompt({ ...identity, expressions, batch, matteHex: request.matteHex });
  const body = requestBody(connectionId, identity, reference, batch, prompt);
  const compiled = await preview(body);
  if (
    expressions.length !== batch.count ||
    request.matteHex !== selectStudioMatte(identity.name + " " + identity.appearance) ||
    request.draftPrompt !== prompt ||
    request.prompt !== prompt ||
    request.negativePrompt !== STUDIO_NEGATIVE_PROMPT ||
    compiled.width !== batch.width ||
    compiled.height !== batch.height ||
    fingerprint(connection, body, request.matteHex) !== request.fingerprint
  )
    throw badRequest("The generation plan changed. Refresh the request summary before generating.");
  await onSubmit();
  const answer = asRecord(await villageEngineJson<unknown>(PATH, { body }));
  const image = asString(answer.image);
  const source = studioImageSource(image, "generated-raw", batch);
  return { image, source };
}
