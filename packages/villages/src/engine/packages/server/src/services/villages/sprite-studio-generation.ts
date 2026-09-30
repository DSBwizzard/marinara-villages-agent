// The Villages studio uses the Engine's existing public sprite endpoint. One
// full-body sheet request is one image submission; the Engine's optional
// fullBodyExpressionMode is deliberately false because that mode loops over cells.
import { badRequest } from "./errors.js";
import { villageEngineJson } from "./engine-loopback.js";
import { asRecord, asString } from "./coerce.js";
import { generatedMime } from "./resident-sprites.js";
import { studioPrompt, type StudioBatch, type StudioPlan, type StudioView } from "./sprite-studio-model.js";

type Expression = { label: string; pose: string };
type Identity = { name: string; appearance: string; style: string; view: StudioView; referenceUrl: string };
type Connection = { id: string; name: string; model: string; source: string };

const enabled = (value: unknown) => value === true || value === "true";
const layouts: Record<number, Array<[number, number]>> = {
  1: [[1, 1]],
  2: [
    [2, 1],
    [1, 2],
  ],
  3: [
    [3, 1],
    [1, 3],
    [2, 2],
  ],
  4: [
    [2, 2],
    [4, 1],
  ],
  5: [
    [3, 2],
    [2, 3],
  ],
  6: [
    [3, 2],
    [2, 3],
  ],
};

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

function overrideId(cols: number, rows: number, expressions: Expression[]) {
  const label = `${cols}x${rows}-${expressions.map((item) => item.label).join(",")}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9,_-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
  return `sprite:full-body:sheet:${label || "request"}`;
}

function requestBody(connectionId: string, identity: Identity, expressions: Expression[], batch: StudioBatch) {
  return {
    connectionId,
    appearance: `${identity.name}. ${identity.appearance}`.slice(0, 2000),
    referenceImage: identity.referenceUrl,
    expressions: expressions.map((item) => item.label),
    cols: batch.cols,
    rows: batch.rows,
    spriteType: "full-body",
    fullBodyExpressionMode: false,
    noBackground: true,
    nativeTransparentPng: true,
    promptOverrides: [
      {
        id: overrideId(batch.cols, batch.rows, expressions),
        prompt: studioPrompt({
          name: identity.name,
          appearance: identity.appearance,
          style: identity.style,
          view: identity.view,
          expressions,
          batch,
        }),
      },
    ],
  };
}

async function preview(
  connectionId: string,
  identity: Identity,
  expressions: Expression[],
  cols: number,
  rows: number,
) {
  const target = { cols, rows, count: expressions.length, width: cols * 512, height: rows * 768 };
  const body = requestBody(connectionId, identity, expressions, target);
  const answer = asRecord(await villageEngineJson<unknown>("/api/sprites/generate-sheet/preview", { body }));
  const items = Array.isArray(answer.items) ? answer.items.map(asRecord) : [];
  const item = items[0];
  if (items.length !== 1 || !item || item.id !== body.promptOverrides[0]!.id)
    throw badRequest(
      "This image model cannot provide a one-request sprite sheet. Choose a different image connection.",
    );
  const width = Number(item.width),
    height = Number(item.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1)
    throw badRequest("The image connection did not report a usable sprite size.");
  return { cols, rows, count: expressions.length, width, height };
}

export async function planVillageStudioSheets(
  connectionId: string,
  identity: Identity,
  expressions: Expression[],
  individual: boolean,
): Promise<StudioPlan> {
  const connection = await studioImageConnection(connectionId);
  const batches: StudioBatch[] = [];
  for (let offset = 0; offset < expressions.length;) {
    const count = Math.min(individual ? 1 : 6, expressions.length - offset);
    const [cols, rows] = count === 3 ? [2, 2] : layouts[count]![0]!;
    const chosen = await preview(connectionId, identity, expressions.slice(offset, offset + count), cols!, rows!);
    batches.push(chosen);
    offset += chosen.count;
  }
  return {
    protocol: 2,
    connection,
    batches,
    estimatedCost: null,
    localWorkflow: /comfy|swarm|runpod|local/i.test(connection.source),
  };
}

export async function generateVillageStudioSheet(input: {
  connectionId: string;
  expectedModel: string;
  identity: Identity;
  expressions: Expression[];
  batch: StudioBatch;
  onSubmit: () => Promise<void>;
}): Promise<string> {
  const { connectionId, expectedModel, identity, expressions, batch, onSubmit } = input;
  const connection = await studioImageConnection(connectionId);
  if (connection.model !== expectedModel)
    throw badRequest("The image model changed. Review the generation plan again.");
  const current = await preview(connectionId, identity, expressions, batch.cols, batch.rows);
  if (current.width !== batch.width || current.height !== batch.height || current.count !== batch.count)
    throw badRequest("The image size changed. Review the generation plan again.");
  await onSubmit();
  const answer = asRecord(
    await villageEngineJson<unknown>("/api/sprites/generate-sheet", {
      body: requestBody(connectionId, identity, expressions, batch),
    }),
  );
  const base64 = asString(answer.sheetBase64);
  if (!base64 || !Array.isArray(answer.cells) || answer.cells.length !== expressions.length)
    throw new Error("The image connection did not return one complete sheet. No other generation was attempted.");
  return `data:${generatedMime(Buffer.from(base64, "base64"))};base64,${base64}`;
}
