import { createHash, randomUUID } from "node:crypto";
import { badRequest, notFound } from "./errors.js";
import { villageEngineJson } from "./engine-loopback.js";
import { villagesDocuments, VILLAGES_PACKAGE_ID, villagesLogger } from "./package-runtime.js";
import { mutateDocument, mutateVillageState, readVillageState } from "./village-store.js";
import {
  approveResidentSprite,
  readSpriteExpression,
  readSpriteView,
  removeResidentSprite,
} from "./resident-sprites.js";
import { resolveVillageImageConnectionId, inspectVillageImage } from "./image-generation.js";
import { captureSpriteReference, saveStudioImage } from "./sprite-reference.js";
import { asRecord, asString } from "./coerce.js";
import {
  defaultStudioState,
  validateStudioCell,
  SPRITE_STYLES,
  type StudioState,
  type StudioPlan,
  type StudioCell,
  type StudioSettings,
} from "./sprite-studio-model.js";
import { planVillageStudioSheets, generateVillageStudioSheet } from "./sprite-studio-generation.js";
import { buildVillageSnapshot } from "./village.js";

const active = new Set<string>();
const cellWrites = new Map<string, Promise<unknown>>();
function serializeCells<T>(characterId: string, action: () => Promise<T>): Promise<T> {
  const prior = cellWrites.get(characterId) ?? Promise.resolve();
  const task = prior.catch(() => undefined).then(action);
  cellWrites.set(characterId, task);
  return task.finally(() => {
    if (cellWrites.get(characterId) === task) cellWrites.delete(characterId);
  });
}
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const slot = {
  kind: "sprite-studio",
  name: "Sprite Studio",
  description: "Persistent sprite settings and reviewed generation jobs.",
  label: () => "Sprite Studio",
  coerce: (raw: unknown): StudioState => {
    const record = asRecord(raw);
    return record.version === 1 && Array.isArray(record.jobs) && record.settings
      ? (structuredClone(record) as unknown as StudioState)
      : defaultStudioState();
  },
};
async function owner(characterId: string) {
  const state = await readVillageState();
  const resident = state.villagers.find((entry) => entry.characterId === characterId);
  if (!resident) throw notFound("That resident no longer lives here.");
  return resident;
}
async function scope(characterId: string) {
  const resident = await owner(characterId);
  return { resident, id: `sprite-studio-${hash(characterId + ":" + resident.addedAt)}` };
}
async function read(id: string) {
  return slot.coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, id))?.data);
}
async function mutate(id: string, change: (state: StudioState) => void) {
  await mutateDocument(id, slot, change);
}
const safeMessage = (error: unknown) => (error instanceof Error ? error.message : "Sprite work could not be saved.");

export async function readSpriteStudio(characterId: string) {
  const { id, resident } = await scope(characterId);
  let state = await read(id);
  // Process-local ownership is evidence of activity; persisted running jobs alone are not.
  for (const job of state.jobs.filter((item) => item.status === "running" && !active.has(id + ":" + item.id))) {
    await mutate(id, (next) => {
      const found = next.jobs.find((item) => item.id === job.id);
      if (found) {
        found.status = "interrupted";
        found.error = "The generation was interrupted. Its outcome may be unknown. No automatic retry was made.";
      }
    });
  }
  state = await read(id);
  let connections: Array<{ id: string; name: string; model: string }> = [];
  try {
    const rows = await villageEngineJson<unknown>("/api/connections");
    connections = (Array.isArray(rows) ? rows : [])
      .map(asRecord)
      .filter((row) => row.provider === "image_generation")
      .map((row) => ({ id: asString(row.id), name: asString(row.name), model: asString(row.model) }));
  } catch {
    /* Import and review work without a generation connection. */
  }
  return { ...state, connections, reference: resident.cardSnapshot.spriteReference ?? null };
}

export async function saveSpriteStudioSettings(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  const body = asRecord(raw);
  const style = body.style;
  const prompts = asRecord(body.prompts);
  if (typeof style !== "string" || !Object.hasOwn(SPRITE_STYLES, style)) throw badRequest("Choose a studio style.");
  for (const key of Object.keys(SPRITE_STYLES))
    if (typeof prompts[key] !== "string" || (prompts[key] as string).length > 6000)
      throw badRequest("Each style prompt must be at most 6,000 characters.");
  const connectionId = asString(body.connectionId);
  if (connectionId.length > 200) throw badRequest("Invalid connection.");
  await mutate(id, (state) => {
    state.settings = {
      style,
      prompts: { PAPERCRAFT: prompts.PAPERCRAFT, BATTLEHIGHWAY: prompts.BATTLEHIGHWAY, Custom: prompts.Custom },
      connectionId,
    } as StudioSettings;
  });
  return readSpriteStudio(characterId);
}
export async function captureStudioReference(characterId: string, raw: unknown) {
  const resident = await owner(characterId);
  const body = asRecord(raw);
  if (resident.cardSnapshot.spriteReference) throw badRequest("This snapshot already has a captured reference.");
  const reference = await captureSpriteReference(
    characterId,
    body.image ? "upload" : "current-card",
    body.image ? asString(body.image) : undefined,
  );
  if (!reference) throw badRequest("The current character card has no avatar. Upload a reference.");
  await mutateVillageState((state) => {
    const current = state.villagers.find((item) => item.characterId === characterId);
    if (current && !current.cardSnapshot.spriteReference) current.cardSnapshot.spriteReference = reference;
  });
  return readSpriteStudio(characterId);
}
function selection(raw: unknown) {
  const body = asRecord(raw);
  const view = readSpriteView(body.view);
  const expressions = (Array.isArray(body.expressions) ? body.expressions : []).map((item) => {
    const entry = asRecord(item);
    const pose = asString(entry.pose);
    if (pose.length > 500) throw badRequest("Pose instructions must be at most 500 characters.");
    return { label: readSpriteExpression(entry.label), pose };
  });
  if (
    !expressions.length ||
    expressions.length > 24 ||
    new Set(expressions.map((item) => item.label)).size !== expressions.length
  )
    throw badRequest("Choose 1–24 distinct expressions.");
  return { view, expressions, individual: body.individual === true };
}
async function prepare(characterId: string, raw: unknown) {
  const { id, resident } = await scope(characterId);
  const state = await read(id);
  const input = selection(raw);
  const approved = resident.sprite?.expressions ?? [];
  const front = approved.find((item) => item.view === "front" && item.label === "neutral");
  const neutral = approved.find((item) => item.view === input.view && item.label === "neutral");
  if (input.view === "side" && !front) throw badRequest("Approve a front neutral first.");
  if (input.expressions.some((item) => item.label !== "neutral") && !neutral)
    throw badRequest("Approve this view’s neutral before generating expressions.");
  const labels = new Set(approved.filter((item) => item.view === input.view).map((item) => item.label));
  input.expressions.forEach((item) => labels.add(item.label));
  if (labels.size > 24) throw badRequest("Each view supports 24 expressions.");
  const neutralOnly = input.expressions.length === 1 && input.expressions[0]!.label === "neutral";
  const reference = input.view === "side" && (neutralOnly || !neutral) ? front : neutral;
  const assetId =
    input.view === "side" && reference === neutral ? resident.sprite?.sideAssetId : resident.sprite?.assetId;
  const referenceUrl =
    neutralOnly && input.view === "front" && resident.cardSnapshot.spriteReference
      ? resident.cardSnapshot.spriteReference.url
      : reference && assetId
        ? `/api/sprites/${assetId}/file/${reference.filename}`
        : resident.cardSnapshot.spriteReference?.url;
  if (!referenceUrl) throw badRequest("Capture or upload this villager’s identity reference first.");
  const connectionId = await resolveVillageImageConnectionId(state.settings.connectionId);
  const identity = {
    name: resident.cardSnapshot.name,
    appearance: (resident.cardSnapshot.appearance || resident.cardSnapshot.description).slice(0, 2000),
    style: state.settings.prompts[state.settings.style],
    view: input.view,
    referenceUrl,
  };
  let plan: StudioPlan;
  try {
    plan = await planVillageStudioSheets(connectionId, identity, input.expressions, input.individual);
  } catch (error) {
    if (safeMessage(error).includes("(404)"))
      throw badRequest("This Marinara version cannot preview sprite requests. Import and review remain available.");
    throw error;
  }
  plan.reviewToken = hash(
    JSON.stringify({ input, settings: state.settings, referenceUrl, model: plan.connection.model }),
  );
  return { id, state, input, identity, connectionId, plan };
}
export async function planSpriteStudio(characterId: string, raw: unknown) {
  const prepared = await prepare(characterId, raw);
  return prepared.plan;
}
function cellsFor(
  jobId: string,
  batchIndex: number,
  view: "front" | "side",
  expressions: Array<{ label: string; pose: string }>,
  cols: number,
  rows: number,
  width: number,
  height: number,
): StudioCell[] {
  return expressions.map((entry, index) => {
    const x = Math.floor(((index % cols) * width) / cols),
      y = Math.floor((Math.floor(index / cols) * height) / rows);
    return {
      ...entry,
      id: `${jobId}-${batchIndex}-${index}`,
      view,
      x,
      y,
      width: Math.floor((((index % cols) + 1) * width) / cols) - x,
      height: Math.floor(((Math.floor(index / cols) + 1) * height) / rows) - y,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      status: "candidate",
    };
  });
}
export async function startSpriteStudioJob(characterId: string, raw: unknown) {
  const body = asRecord(raw);
  const jobId = asString(body.submissionId);
  if (!/^[a-f0-9-]{36}$/i.test(jobId)) throw badRequest("A generation needs a valid submission id.");
  const { id } = await scope(characterId);
  const fingerprint = hash(JSON.stringify(selection(raw)));
  const prior = (await read(id)).jobs.find((job) => job.id === jobId);
  if (prior) {
    if (prior.fingerprint !== fingerprint) throw badRequest("This submission id belongs to a different selection.");
    return readSpriteStudio(characterId);
  }
  const prepared = await prepare(characterId, raw);
  const { plan, input, identity, connectionId } = prepared;
  // Confirm the exact displayed plan, including connection and request count.
  if (JSON.stringify(body.plan) !== JSON.stringify(plan))
    throw badRequest("The generation plan changed. Review it again before generating.");
  let claimed = false;
  if (active.has(id + ":" + jobId)) return readSpriteStudio(characterId);
  active.add(id + ":" + jobId);
  try {
    await mutate(id, (next) => {
      claimed = false;
      if (next.jobs.some((job) => job.id === jobId)) return;
      if (next.jobs.some((job) => job.status === "running"))
        throw badRequest("This villager already has a generation running.");
      next.jobs.push({
        id: jobId,
        fingerprint,
        createdAt: new Date().toISOString(),
        status: "running",
        error: "",
        planned: plan.batches.length,
        attempted: 0,
        sheets: [],
        view: input.view,
        connectionId,
        model: plan.connection.model,
      });
      claimed = true;
    });
  } catch (error) {
    active.delete(id + ":" + jobId);
    throw error;
  }
  if (!claimed) {
    active.delete(id + ":" + jobId);
    return readSpriteStudio(characterId);
  }
  void (async () => {
    let offset = 0;
    try {
      for (const [index, batch] of plan.batches.entries()) {
        const expressions = input.expressions.slice(offset, offset + batch.count);
        offset += batch.count;
        const assetId = `villages-${randomUUID()}`;
        const image = await generateVillageStudioSheet({
          connectionId,
          expectedModel: plan.connection.model,
          identity,
          expressions,
          batch,
          onSubmit: () =>
            mutate(id, (next) => {
              const job = next.jobs.find((item) => item.id === jobId)!;
              job.pendingAssetId = assetId;
              job.pendingBatch = batch;
              job.pendingExpressions = expressions;
              job.attempted += 1;
            }),
        });
        // Persist the untouched output before interpreting crops or approvals.
        const output = await saveStudioImage(image, "original", assetId);
        await mutate(id, (next) => {
          const job = next.jobs.find((item) => item.id === jobId)!;
          job.sheets.push({
            ...output,
            attempts: 1,
            usage: null,
            baseScale: Math.min(512 / (output.width / batch.cols), 768 / (output.height / batch.rows)),
            cells: cellsFor(jobId, index, input.view, expressions, batch.cols, batch.rows, output.width, output.height),
          });
          delete job.pendingAssetId;
          delete job.pendingBatch;
          delete job.pendingExpressions;
        });
      }
      await mutate(id, (next) => {
        next.jobs.find((item) => item.id === jobId)!.status = "ready";
      });
    } catch (error) {
      villagesLogger().warn("Sprite studio job interrupted", { error: safeMessage(error) });
      await mutate(id, (next) => {
        const job = next.jobs.find((item) => item.id === jobId)!;
        job.status = "interrupted";
        job.error = safeMessage(error) + " No automatic retry was made.";
      });
    } finally {
      active.delete(id + ":" + jobId);
    }
  })().catch((error) => villagesLogger().error(error, "Could not persist sprite job status"));
  return readSpriteStudio(characterId);
}
export async function importStudioSheet(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  const body = asRecord(raw);
  const image = asString(body.image);
  const size = await inspectVillageImage(image);
  const supplied = Array.isArray(body.cells) ? body.cells : [];
  if (!supplied.length || supplied.length > 48) throw badRequest("Import between 1 and 48 sprite cells.");
  const jobId = randomUUID();
  const cells = supplied.map((rawCell, index): StudioCell => {
    const cell = asRecord(rawCell);
    const result = {
      id: `${jobId}-0-${index}`,
      view: readSpriteView(cell.view),
      label: readSpriteExpression(cell.label ?? cell.expression),
      pose: asString(cell.pose),
      x: Number(cell.x),
      y: Number(cell.y),
      width: Number(cell.width),
      height: Number(cell.height),
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      status: "candidate" as const,
    };
    validateStudioCell(result, size);
    return result;
  });
  const saved = await saveStudioImage(image);
  await mutate(id, (state) => {
    state.jobs.push({
      id: jobId,
      fingerprint: "",
      createdAt: new Date().toISOString(),
      status: "ready",
      error: "",
      planned: 0,
      attempted: 0,
      sheets: [
        {
          ...saved,
          baseScale: Math.min(
            512 / Math.max(...cells.map((cell) => cell.width)),
            768 / Math.max(...cells.map((cell) => cell.height)),
          ),
          attempts: 0,
          usage: null,
          cells,
        },
      ],
      view: cells[0]!.view,
      connectionId: "",
      model: "Imported",
    });
  });
  return readSpriteStudio(characterId);
}
function findCell(state: StudioState, cellId: string) {
  for (const job of state.jobs)
    for (const sheet of job.sheets) {
      const cell = sheet.cells.find((item) => item.id === cellId);
      if (cell) return { job, sheet, cell };
    }
  throw notFound("That sprite candidate no longer exists.");
}
export const editStudioCell = (characterId: string, raw: unknown) =>
  serializeCells(characterId, () => editStudioCellUnlocked(characterId, raw));
async function editStudioCellUnlocked(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  const body = asRecord(raw);
  await mutate(id, (state) => {
    const { cell, sheet } = findCell(state, asString(body.id));
    if (cell.status !== "candidate") throw badRequest("Only unapproved candidates can be edited.");
    const patch = asRecord(body.cell);
    const next = {
      ...cell,
      label: readSpriteExpression(patch.label),
      view: readSpriteView(patch.view),
      pose: asString(patch.pose),
      x: Number(patch.x),
      y: Number(patch.y),
      width: Number(patch.width),
      height: Number(patch.height),
      cleanup: patch.cleanup === true,
      scale: Number(patch.scale),
      offsetX: Number(patch.offsetX),
      offsetY: Number(patch.offsetY),
    };
    validateStudioCell(next, sheet);
    Object.assign(cell, next);
  });
  return readSpriteStudio(characterId);
}
export const approveStudioCells = (characterId: string, raw: unknown) =>
  serializeCells(characterId, () => approveStudioCellsUnlocked(characterId, raw));
async function approveStudioCellsUnlocked(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  const body = asRecord(raw);
  const entries = (Array.isArray(body.cells) ? body.cells : []).map(asRecord);
  if (!entries.length || entries.length > 48) throw badRequest("Choose sprites to approve.");
  const state = await read(id);
  const selected = entries.map((entry) => ({
    ...findCell(state, asString(entry.id)),
    image: asString(entry.image),
    expected: entry.expected,
  }));
  // Neutral bases precede expressions, and front precedes side.
  selected.sort(
    (a, b) =>
      (a.cell.view === "side" ? 2 : 0) +
      (a.cell.label === "neutral" ? 0 : 1) -
      ((b.cell.view === "side" ? 2 : 0) + (b.cell.label === "neutral" ? 0 : 1)),
  );
  const unique = new Set<string>();
  for (const { cell, sheet, image, expected } of selected) {
    if (cell.status !== "approved" && JSON.stringify(expected) !== JSON.stringify(cell))
      throw badRequest("This candidate changed. Refresh Review before approving.");
    if (cell.status === "discarded") throw badRequest("A discarded cell cannot be approved.");
    validateStudioCell(cell, sheet);
    const key = cell.view + ":" + cell.label;
    if (unique.has(key)) throw badRequest("Choose only one candidate for each expression and view.");
    unique.add(key);
    const size = await inspectVillageImage(image);
    if (size.width !== 512 || size.height !== 768)
      throw badRequest("Approved cells must use the shared 512 by 768 canvas.");
  }
  for (const { cell, image } of selected) {
    if (cell.status === "approved") continue;
    await approveResidentSprite(characterId, { view: cell.view, expression: cell.label, image });
    await mutate(id, (next) => {
      findCell(next, cell.id).cell.status = "approved";
    });
  }
  return { studio: await readSpriteStudio(characterId), snapshot: await buildVillageSnapshot() };
}
export const discardStudioCell = (characterId: string, raw: unknown) =>
  serializeCells(characterId, () => discardStudioCellUnlocked(characterId, raw));
async function discardStudioCellUnlocked(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  await mutate(id, (state) => {
    const found = findCell(state, asString(asRecord(raw).id));
    if (found.cell.status === "approved") throw badRequest("Approved art remains in use.");
    found.cell.status = "discarded";
  });
  return readSpriteStudio(characterId);
}
export const removeStudioApprovedSprite = (characterId: string, raw: unknown) =>
  serializeCells(characterId, async () => {
    const body = asRecord(raw);
    const snapshot = await removeResidentSprite(characterId, {
      view: body.view,
      expression: body.label,
      expectedUrl: body.url,
    });
    return { studio: await readSpriteStudio(characterId), snapshot };
  });
export async function recoverStudioJob(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  const job = (await read(id)).jobs.find((item) => item.id === asString(asRecord(raw).id));
  if (!job?.pendingAssetId || !job.pendingBatch || !job.pendingExpressions || active.has(id + ":" + job.id))
    throw badRequest("This job has no interrupted image to recover.");
  const files = await villageEngineJson<Array<{ url: string; expression: string }>>(
    `/api/sprites/${job.pendingAssetId}`,
  );
  const original = files.find((file) => file.expression === "original");
  if (!original) throw badRequest("No saved original is available yet. Recovery made no image-generation call.");
  const image = await import("./engine-loopback.js").then(async ({ villageEngineBaseUrl }) => {
    const response = await fetch(villageEngineBaseUrl() + original.url);
    if (!response.ok) throw badRequest("The saved original could not be read.");
    return `data:${response.headers.get("content-type")?.split(";")[0] || "image/png"};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
  });
  const size = await inspectVillageImage(image);
  await mutate(id, (next) => {
    const current = next.jobs.find((item) => item.id === job.id)!;
    if (current.pendingAssetId !== job.pendingAssetId) return;
    const batch = job.pendingBatch!;
    current.sheets.push({
      assetId: job.pendingAssetId!,
      url: original.url.split("?")[0]!,
      ...size,
      attempts: 1,
      usage: null,
      baseScale: Math.min(512 / (size.width / batch.cols), 768 / (size.height / batch.rows)),
      cells: cellsFor(
        job.id,
        current.sheets.length,
        job.view,
        job.pendingExpressions!,
        batch.cols,
        batch.rows,
        size.width,
        size.height,
      ),
    });
    delete current.pendingAssetId;
    delete current.pendingBatch;
    delete current.pendingExpressions;
    current.status = "ready";
    current.error = "Recovered saved artwork. Unsubmitted sheets were not generated.";
  });
  return readSpriteStudio(characterId);
}
