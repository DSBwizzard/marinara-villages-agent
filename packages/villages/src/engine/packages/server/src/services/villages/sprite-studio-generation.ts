// Engine generates individual sprites; preserve its returned image before local formatting.
import { studioBatchSize } from "./generation-budgets.js";
import { createHash } from "node:crypto";
import { badRequest } from "./errors.js";
import { studioConnection, studioEngineJson } from "./sprite-studio-engine.js";
import { villageEngineBaseUrl } from "./engine-loopback.js";
import { asRecord, asString } from "./coerce.js";
import { decodeVillageImageDataUrl } from "./image-generation.js";
import { generatedMime } from "./resident-sprites.js";
import { compileStudioPrompt, resolveStudioStyle } from "./sprite-studio-styles.js";
import type { StudioIdentity, StudioRequestedExpression } from "./sprite-studio-model.js";
import {
  studioPrompt,
  STUDIO_NEGATIVE_PROMPT,
  type StudioBatch,
  type StudioPlan,
  type StudioSource,
} from "./sprite-studio-model.js";

type Expression = StudioRequestedExpression;
type Identity = StudioIdentity;
type Connection = Awaited<ReturnType<typeof studioConnection>>;
export const STUDIO_PIPELINE_VERSION = 7;
const PATH = "/api/sprites/generate-sheet";
const digest = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");

/** Engine owns the selected connection defaults and any configured fallback. */
export async function studioImageConnection(connectionId: string): Promise<Connection> {
  return studioConnection(connectionId);
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
  reference: string[],
  batch: StudioBatch,
  prompt: string,
  negativePrompt = STUDIO_NEGATIVE_PROMPT,
  expressions: Expression[] = [],
) {
  const labels = expressions.map((entry) => entry.label);
  const id = `sprite:full-body:expression:${labels[0]}`;
  return {
    connectionId,
    appearance: `${identity.name}. ${identity.appearance}`.slice(0, 2000),
    expressions: labels,
    cols: batch.cols,
    rows: batch.rows,
    spriteType: "full-body",
    fullBodyExpressionMode: true,
    noBackground: true,
    nativeTransparentPng: false,
    neutralFullBodyReference: identity.references?.[0]?.role.startsWith("accepted neutral") ? reference[0] : undefined,
    referenceImages: identity.references?.[0]?.role.startsWith("accepted neutral") ? reference.slice(1) : reference,
    styleProfileId: "off",
    promptOverrides: [{ id, prompt, negativePrompt }],
  };
}

async function preview(body: ReturnType<typeof requestBody>) {
  const answer = asRecord(await studioEngineJson<unknown>(PATH + "/preview", { body }));
  const items = Array.isArray(answer.items) ? answer.items.map(asRecord) : [];
  const item = items[0];
  if (items.length !== 1 || !item || item.id !== body.promptOverrides[0]!.id)
    throw badRequest(
      "This image model cannot preview one individual sprite request. Choose a different image connection.",
    );
  const width = Number(item.width),
    height = Number(item.height);
  if (![width, height].every((v) => Number.isInteger(v) && v > 0 && v <= 4096) || width * height > 16_000_000)
    throw badRequest("The image connection did not report a usable sprite request.");
  if (!asString(item.prompt)) throw badRequest("Engine could not preview the sprite prompt.");
  return { width, height, prompt: asString(item.prompt), negativePrompt: asString(item.negativePrompt) };
}

function fingerprint(connection: Connection, body: ReturnType<typeof requestBody>, matteHex: string) {
  return digest(JSON.stringify({ pipelineVersion: STUDIO_PIPELINE_VERSION, connection, matteHex, body }));
}

export async function planVillageStudioSheets(
  connectionId: string,
  identity: Identity,
  expressions: Expression[],
  _individual: boolean,
): Promise<StudioPlan> {
  const connection = await studioImageConnection(connectionId);
  const resolvedStyle = identity.settings
    ? await resolveStudioStyle(identity.settings, connection)
    : identity.resolvedStyle;
  const roles = identity.references?.map((r) => r.role) ?? [];
  const reference = await Promise.all(
    (identity.references?.map((r) => r.url) ?? (identity.referenceUrl ? [identity.referenceUrl] : [])).map(
      readReference,
    ),
  );
  if (reference.length > 4) throw badRequest("This Engine supports at most four Studio references.");
  const matteHex = selectStudioMatte(identity.name + " " + identity.appearance);
  const batches: StudioBatch[] = [];
  for (let offset = 0; offset < expressions.length;) {
    const count = studioBatchSize(true);
    const cols = 1,
      rows = 1;
    const chosen = expressions.slice(offset, offset + count);
    let target: StudioBatch = { cols, rows, count, width: cols * 512, height: rows * 768 };
    // A provider may constrain the requested dimensions. Compile the layout at
    // that actual size and require it to settle before displaying the plan.
    for (let pass = 0; pass < 3; pass++) {
      const draftPrompt = studioPrompt({
        ...identity,
        expressions: chosen,
        batch: target,
        matteHex,
        referenceRoles: roles,
      });
      const override = resolvedStyle
        ? compileStudioPrompt(draftPrompt, STUDIO_NEGATIVE_PROMPT, resolvedStyle, connection)
        : { prompt: draftPrompt, negativePrompt: STUDIO_NEGATIVE_PROMPT };
      const body = requestBody(
        connectionId,
        identity,
        reference,
        target,
        override.prompt,
        override.negativePrompt,
        chosen,
      );
      const compiled = await preview(body);
      if (compiled.width !== target.width || compiled.height !== target.height) {
        target = { ...target, width: compiled.width, height: compiled.height };
        continue;
      }
      target.request = {
        resolvedStyle,
        promptId: body.promptOverrides[0].id,
        overridePrompt: override.prompt,
        overrideNegativePrompt: override.negativePrompt,
        pipelineVersion: STUDIO_PIPELINE_VERSION,
        matteHex,
        draftPrompt,
        prompt: compiled.prompt,
        negativePrompt: compiled.negativePrompt,
        fingerprint: digest(
          JSON.stringify([fingerprint(connection, body, matteHex), resolvedStyle?.fingerprint, compiled]),
        ),
        connection,
        referenceHashes: reference.map((r) =>
          digest(decodeVillageImageDataUrl(r, { label: "reference", maxBase64Length: 16000000 }).bytes),
        ),
        referenceRoles: roles,
      };
      break;
    }
    if (!target.request) throw badRequest("The image size changed during planning. Refresh the request summary.");
    batches.push(target);
    offset += count;
  }
  return {
    protocol: 7,
    connection,
    batches,
    estimatedCost: null,
    localWorkflow: /comfy|swarm|runpod|local/i.test(connection.source),
    providerResolution: "unknown",
    exportDimensions: { width: 512, height: 768 },
    capabilities: {
      resolution: Object.keys(asRecord(connection.defaults.customParameters)).some((k) =>
        /size|width|height|aspect|resolution/i.test(k),
      )
        ? "configured"
        : "unknown",
      references: "configured",
      editing: "unknown",
    },
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
}): Promise<{ image: string; source: StudioSource; cells: Array<{ expression: string; image: string }> }> {
  const { connectionId, expectedModel, identity, expressions, batch, onSubmit } = input;
  const connection = await studioImageConnection(connectionId);
  if (connection.model !== expectedModel)
    throw badRequest("The image model changed. Review the generation plan again.");
  const request = batch.request;
  if (!request || request.pipelineVersion !== STUDIO_PIPELINE_VERSION)
    throw badRequest("The generation plan changed. Refresh the request summary.");
  const reference = await Promise.all(
    (identity.references?.map((r) => r.url) ?? (identity.referenceUrl ? [identity.referenceUrl] : [])).map(
      readReference,
    ),
  );
  const prompt = studioPrompt({
    ...identity,
    expressions,
    batch,
    matteHex: request.matteHex,
    referenceRoles: identity.references?.map((r) => r.role) ?? [],
  });
  const resolvedStyle = identity.settings
    ? await resolveStudioStyle(identity.settings, connection)
    : identity.resolvedStyle;
  const override = resolvedStyle
    ? compileStudioPrompt(prompt, STUDIO_NEGATIVE_PROMPT, resolvedStyle, connection)
    : { prompt, negativePrompt: STUDIO_NEGATIVE_PROMPT };
  const body = requestBody(
    connectionId,
    identity,
    reference,
    batch,
    override.prompt,
    override.negativePrompt,
    expressions,
  );
  const compiled = await preview(body);
  if (
    expressions.length !== batch.count ||
    request.matteHex !== selectStudioMatte(identity.name + " " + identity.appearance) ||
    request.draftPrompt !== prompt ||
    request.resolvedStyle?.fingerprint !== resolvedStyle?.fingerprint ||
    request.prompt !== compiled.prompt ||
    request.negativePrompt !== compiled.negativePrompt ||
    compiled.width !== batch.width ||
    compiled.height !== batch.height ||
    digest(JSON.stringify([fingerprint(connection, body, request.matteHex), resolvedStyle?.fingerprint, compiled])) !==
      request.fingerprint
  )
    throw badRequest("The generation plan changed. Refresh the request summary before generating.");
  await onSubmit();
  const answer = asRecord(await studioEngineJson<unknown>(PATH, { body }));
  const returned = (Array.isArray(answer.cells) ? answer.cells : []).map(asRecord);
  if (returned.length !== 1 || returned[0].expression !== expressions[0]?.label || !asString(returned[0].base64))
    throw badRequest("Engine returned no usable individual sprite. Its outcome may be unknown; retry explicitly.");
  const bytes = Buffer.from(asString(returned[0].base64), "base64");
  const image = `data:${generatedMime(bytes)};base64,${bytes.toString("base64")}`;
  const source = studioImageSource(image, "generated-raw", batch);
  // The caller saves the paid original before validating or processing crops.
  const cells = (Array.isArray(answer.cells) ? answer.cells : []).map(asRecord).map((cell) => ({
    expression: asString(cell.expression),
    image: `data:image/png;base64,${asString(cell.base64)}`,
  }));
  return { image, source, cells };
}
