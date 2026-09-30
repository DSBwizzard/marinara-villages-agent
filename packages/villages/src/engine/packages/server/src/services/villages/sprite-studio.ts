import { createHash, randomUUID } from "node:crypto";
import { badRequest, notFound } from "./errors.js";
import { villageEngineJson, villageEngineBaseUrl, deleteVillageSpriteFile } from "./engine-loopback.js";
import { villagesDocuments, VILLAGES_PACKAGE_ID, villagesLogger } from "./package-runtime.js";
import { mutateDocument, mutateVillageState, readVillageState } from "./village-store.js";
import { readSpriteExpression, readSpriteView, removeResidentSprite } from "./resident-sprites.js";
import { resolveVillageImageConnectionId, inspectVillageImage } from "./image-generation.js";
import { captureSpriteReference, saveStudioImage } from "./sprite-reference.js";
import { asRecord, asString } from "./coerce.js";
import {
  defaultStudioState,
  validateStudioCell,
  SPRITE_STYLES,
  STUDIO_MEANINGS,
  type StudioExpression,
  type StudioAssignment,
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
    return (record.version === 1 || record.version === 2) && Array.isArray(record.jobs) && record.settings
      ? ({ ...defaultStudioState(), ...structuredClone(record), version: 2 } as unknown as StudioState)
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

const imageUrl = (
  sprite: NonNullable<Awaited<ReturnType<typeof owner>>["sprite"]>,
  entry: (typeof sprite.expressions)[number],
) =>
  `/api/sprites/${entry.assetId ?? (entry.view === "side" ? sprite.sideAssetId : sprite.assetId)}/file/${entry.filename}`;
const fileStem = (url: string) =>
  url
    .split("?")[0]!
    .split("/")
    .at(-1)!
    .replace(/\.[^.]+$/, "");
const cellFingerprint = (cell: StudioCell) => {
  const { rendered: _rendered, pending: _pending, status: _status, ...drawing } = cell;
  return hash(JSON.stringify(drawing));
};
function definition(label: string, pose = "", id = "e-" + hash(label).slice(0, 24)): StudioExpression {
  return {
    id,
    label,
    name: label.replaceAll("_", " "),
    pose,
    useWhen: STUDIO_MEANINGS[label] ?? pose,
    aliases: [label],
  };
}
function retainFile(state: StudioState, assetId: string, expression: string, url: string) {
  const prior = state.files.find((file) => file.assetId === assetId && file.expression === expression);
  if (prior) prior.url = url;
  else state.files.push({ assetId, expression, url });
}
/** Migration uses only recorded artwork paths. Historical orphan directories are never scanned. */
async function ensureLibrary(characterId: string, id: string) {
  const resident = await owner(characterId);
  const current = await read(id);
  const needs =
    current.jobs.some((job) =>
      job.sheets.some((sheet) => sheet.cells.some((cell) => !cell.expressionId || cell.pending === undefined)),
    ) ||
    (resident.sprite?.expressions.some((entry) => !entry.expressionId || !entry.cutoutId) ?? false);
  if (!needs) return;
  const legacySizes = new Map<string, { width: number; height: number }>();
  for (const entry of resident.sprite?.expressions ?? []) {
    if (entry.cutoutId) continue;
    const url = imageUrl(resident.sprite!, entry);
    if (legacySizes.has(url)) continue;
    try {
      const response = await fetch(villageEngineBaseUrl() + url);
      if (!response.ok || Number(response.headers.get("content-length")) > 12_000_000) continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 12_000_000) continue;
      const mime = response.headers.get("content-type")?.split(";")[0] || "image/png";
      legacySizes.set(url, await inspectVillageImage(`data:${mime};base64,${bytes.toString("base64")}`));
    } catch {
      /* Keep the recorded art and assignments even if old files cannot currently be read. */
    }
  }
  await mutate(id, (state) => {
    const add = (label: string, pose: string) => {
      let slot = state.expressions.find((item) => item.label === label || item.aliases.includes(label));
      if (!slot) {
        slot = definition(label, pose);
        state.expressions.push(slot);
      }
      return slot;
    };
    for (const job of state.jobs)
      for (const sheet of job.sheets) {
        retainFile(state, sheet.assetId, fileStem(sheet.url), sheet.url);
        for (const cell of sheet.cells) {
          cell.expressionId ??= add(cell.label, cell.pose).id;
          cell.pending ??= cell.status === "candidate";
        }
      }
    for (const entry of resident.sprite?.expressions ?? []) {
      const slot = add(entry.label, entry.pose ?? "");
      const url = imageUrl(resident.sprite!, entry);
      const cellId = entry.cutoutId ?? "c-" + hash(url).slice(0, 24);
      if (state.jobs.some((job) => job.sheets.some((sheet) => sheet.cells.some((cell) => cell.id === cellId))))
        continue;
      const assetId =
        entry.assetId ?? (entry.view === "side" ? resident.sprite!.sideAssetId! : resident.sprite!.assetId);
      const cell: StudioCell = {
        id: cellId,
        expressionId: entry.expressionId ?? slot.id,
        label: entry.label,
        pose: entry.pose ?? "",
        view: entry.view,
        x: 0,
        y: 0,
        width: legacySizes.get(url)?.width ?? 512,
        height: legacySizes.get(url)?.height ?? 768,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        status: "approved",
        pending: false,
      };
      cell.rendered = { assetId, filename: entry.filename, url, fingerprint: cellFingerprint(cell) };
      let job = state.jobs.find((item) => item.id === "legacy");
      if (!job) {
        job = {
          id: "legacy",
          fingerprint: "",
          createdAt: resident.addedAt,
          status: "ready",
          error: "",
          planned: 0,
          attempted: 0,
          sheets: [],
          view: entry.view,
          connectionId: "",
          model: "Existing artwork",
          style: "Existing artwork",
        };
        state.jobs.unshift(job);
      }
      job.sheets.push({
        assetId,
        url,
        width: cell.width,
        height: cell.height,
        attempts: 0,
        usage: null,
        cells: [cell],
        baseScale: Math.min(512 / cell.width, 768 / cell.height),
      });
      retainFile(state, assetId, fileStem(url), url);
    }
  });
  const library = await read(id);
  await mutateVillageState((state) => {
    const sprite = state.villagers.find((item) => item.characterId === characterId)?.sprite;
    if (!sprite) return;
    for (const entry of sprite.expressions) {
      const slot = library.expressions.find((item) => item.label === entry.label || item.aliases.includes(entry.label));
      if (!slot) continue;
      entry.expressionId ??= slot.id;
      entry.cutoutId ??= "c-" + hash(imageUrl(sprite, entry)).slice(0, 24);
      entry.name ||= slot.name;
      entry.useWhen ||= slot.useWhen;
      entry.pose ||= slot.pose;
      if (!entry.aliases?.length) entry.aliases = slot.aliases;
    }
    sprite.defaultExpressionId ??=
      sprite.expressions.find((entry) => entry.label === "neutral")?.expressionId ??
      sprite.expressions[0]?.expressionId;
  });
}

export async function readSpriteStudio(characterId: string) {
  const { id } = await scope(characterId);
  await ensureLibrary(characterId, id);
  const resident = await owner(characterId);
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
  const assignments: StudioAssignment[] = (resident.sprite?.expressions ?? []).flatMap((entry) =>
    entry.expressionId && entry.cutoutId
      ? [{ expressionId: entry.expressionId, view: entry.view, cellId: entry.cutoutId }]
      : [],
  );
  return {
    ...state,
    assignments,
    defaultExpressionId: resident.sprite?.defaultExpressionId,
    connections,
    reference: resident.cardSnapshot.spriteReference ?? null,
  };
}

export async function saveSpriteStudioSettings(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  const settings = readSettings(raw);
  await mutate(id, (state) => {
    state.settings = settings;
  });
  return readSpriteStudio(characterId);
}
function readSettings(raw: unknown): StudioSettings {
  const body = asRecord(raw);
  const style = body.style;
  const prompts = asRecord(body.prompts);
  if (typeof style !== "string" || !Object.hasOwn(SPRITE_STYLES, style)) throw badRequest("Choose a studio style.");
  for (const key of Object.keys(SPRITE_STYLES))
    if (typeof prompts[key] !== "string" || (prompts[key] as string).length > 6000)
      throw badRequest("Each style prompt must be at most 6,000 characters.");
  const connectionId = asString(body.connectionId);
  if (connectionId.length > 200) throw badRequest("Invalid connection.");
  return {
    style,
    prompts: { PAPERCRAFT: prompts.PAPERCRAFT, BATTLEHIGHWAY: prompts.BATTLEHIGHWAY, Custom: prompts.Custom },
    connectionId,
  } as StudioSettings;
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
    return { label: readSpriteExpression(entry.label), pose, expressionId: asString(entry.expressionId) || undefined };
  });
  if (!expressions.length || new Set(expressions.map((item) => item.label)).size !== expressions.length)
    throw badRequest("Choose at least one distinct expression.");
  return { view, expressions, individual: body.individual === true };
}
async function prepare(characterId: string, raw: unknown) {
  const { id, resident } = await scope(characterId);
  await ensureLibrary(characterId, id);
  const state = await read(id);
  if (asRecord(raw).settings) state.settings = readSettings(asRecord(raw).settings);
  const input = selection(raw);
  for (const entry of input.expressions) {
    const slot = entry.expressionId
      ? state.expressions.find((item) => item.id === entry.expressionId)
      : state.expressions.find((item) => item.label === entry.label);
    if (entry.expressionId && !slot) throw badRequest("That expression slot no longer exists.");
    entry.expressionId = slot?.id ?? definition(entry.label, entry.pose).id;
  }
  const referenceUrl = resident.cardSnapshot.spriteReference?.url;
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
  expressions: Array<{ label: string; pose: string; expressionId?: string }>,
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
      pending: true,
      cleanup: true,
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
    throw badRequest("The generation plan changed. Refresh the request summary before generating.");
  let claimed = false;
  if (active.has(id + ":" + jobId)) return readSpriteStudio(characterId);
  active.add(id + ":" + jobId);
  try {
    await mutate(id, (next) => {
      claimed = false;
      if (next.jobs.some((job) => job.id === jobId)) return;
      if (next.jobs.some((job) => job.status === "running"))
        throw badRequest("This villager already has a generation running.");
      next.settings = prepared.state.settings;
      for (const entry of input.expressions) {
        const slot = next.expressions.find((item) => item.id === entry.expressionId);
        if (!slot) next.expressions.push(definition(entry.label, entry.pose, entry.expressionId));
        else if (!slot.pose && entry.pose) {
          slot.pose = entry.pose;
          if (!slot.useWhen) slot.useWhen = STUDIO_MEANINGS[slot.label] ?? entry.pose;
        }
      }
      next.jobs.push({
        requestedExpressions: input.expressions,
        individual: input.individual,
        style: prepared.state.settings.style,
        stylePrompt: prepared.state.settings.prompts[prepared.state.settings.style],
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
              retainFile(next, assetId, "original", `/api/sprites/${assetId}/file/original.png`);
              job.attempted += 1;
            }),
        });
        // Persist the untouched output before interpreting crops or approvals.
        const output = await saveStudioImage(image, "original", assetId);
        await mutate(id, (next) => {
          retainFile(next, assetId, fileStem(output.url), output.url);
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
export const importStudioSheet = (characterId: string, raw: unknown) =>
  serializeCells(characterId, () => importStudioSheetUnlocked(characterId, raw));
async function importStudioSheetUnlocked(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  const body = asRecord(raw);
  const image = asString(body.image);
  const size = await inspectVillageImage(image);
  const supplied = Array.isArray(body.cells) ? body.cells : [];
  if (!supplied.length) throw badRequest("Import at least one sprite cell.");
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
  const importAssetId = `villages-${randomUUID()}`;
  await mutate(id, (state) =>
    retainFile(state, importAssetId, "original", `/api/sprites/${importAssetId}/file/original.png`),
  );
  const saved = await saveStudioImage(image, "original", importAssetId);
  await mutate(id, (state) => {
    retainFile(state, saved.assetId, fileStem(saved.url), saved.url);
    for (const cell of cells) {
      let slot = state.expressions.find((item) => item.label === cell.label);
      if (!slot) {
        slot = definition(cell.label, cell.pose);
        state.expressions.push(slot);
      }
      cell.expressionId = slot.id;
      cell.pending = true;
    }
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
      style: "Imported",
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
  const adjustedCellId = randomUUID();
  await mutate(id, (state) => {
    const { cell, sheet } = findCell(state, asString(body.id));
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
    // Adjustments create another saved option, keeping the prior artwork and cache.
    const changed = { ...next, id: adjustedCellId, pending: true, status: "candidate" as const };
    delete changed.rendered;
    sheet.cells.push(changed);
  });
  return { ...(await readSpriteStudio(characterId)), adjustedCellId };
}
export const approveStudioCells = (characterId: string, raw: unknown) => assignStudioCells(characterId, raw);
export const assignStudioCells = (characterId: string, raw: unknown) =>
  serializeCells(characterId, () => assignStudioCellsUnlocked(characterId, raw));
async function assignStudioCellsUnlocked(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  await ensureLibrary(characterId, id);
  const body = asRecord(raw);
  const entries = (Array.isArray(body.cells) ? body.cells : []).map(asRecord);
  if (!entries.length) throw badRequest("Choose cutouts to assign.");
  const state = await read(id);
  const batch = body.batchId ? state.jobs.find((job) => job.id === body.batchId) : undefined;
  if (body.batchId && (!batch || batch.status === "running"))
    throw badRequest("Wait for this batch to finish before using it.");
  const selected = entries.map((entry) => ({
    ...findCell(state, asString(entry.id)),
    image: asString(entry.image),
    expected: entry.expected,
    expressionId: asString(entry.expressionId) || findCell(state, asString(entry.id)).cell.expressionId!,
  }));
  if (batch && selected.some((item) => item.job.id !== batch.id)) throw badRequest("Choose artwork from this batch.");
  const unique = new Set<string>();
  for (const { cell, sheet, image, expected, expressionId } of selected) {
    if (expected !== undefined && cellFingerprint(expected as StudioCell) !== cellFingerprint(cell))
      throw badRequest("This cutout changed. Refresh Review before assigning.");
    if (!state.expressions.some((item) => item.id === expressionId))
      throw badRequest("Choose an existing expression slot.");
    validateStudioCell(cell, sheet);
    const key = cell.view + ":" + expressionId;
    if (unique.has(key)) throw badRequest("Choose one cutout per expression and view.");
    unique.add(key);
    if (cell.rendered?.fingerprint === cellFingerprint(cell)) continue;
    if (expected === undefined || cellFingerprint(expected as StudioCell) !== cellFingerprint(cell))
      throw badRequest("Refresh the cutout before saving its image.");
    const size = await inspectVillageImage(image);
    if (size.width !== 512 || size.height !== 768) throw badRequest("Cutouts must use the shared 512 by 768 canvas.");
  }
  // Save every image and its ownership receipt before publishing ANY assignment.
  // A failed image or Village write leaves the prior scene collection untouched.
  for (const { cell, sheet, image } of selected) {
    if (cell.rendered?.fingerprint === cellFingerprint(cell)) continue;
    const expression = "s-" + randomUUID().replaceAll("-", "");
    await mutate(id, (next) =>
      retainFile(next, sheet.assetId, expression, `/api/sprites/${sheet.assetId}/file/${expression}.png`),
    );
    const output = await saveStudioImage(image, expression, sheet.assetId);
    cell.rendered = {
      assetId: output.assetId,
      filename: output.filename,
      url: output.url,
      fingerprint: cellFingerprint(cell),
    };
    await mutate(id, (next) => {
      findCell(next, cell.id).cell.rendered = cell.rendered;
      const file = next.files.find((item) => item.assetId === output.assetId && item.expression === expression)!;
      file.url = output.url;
    });
  }
  await mutate(id, (next) => {
    for (const { cell, job, expressionId } of selected) {
      const current = findCell(next, cell.id);
      current.cell.pending = false;
      current.cell.status = "approved";
      const batch = next.jobs.find((item) => item.id === job.id)!;
      batch.assignments = [
        ...(batch.assignments ?? []).filter((item) => item.expressionId !== expressionId || item.view !== cell.view),
        { expressionId, view: cell.view, cellId: cell.id },
      ];
    }
  });
  await mutateVillageState((village) => {
    const resident = village.villagers.find((item) => item.characterId === characterId);
    if (!resident) throw notFound("That resident no longer lives here.");
    const prior = resident.sprite;
    const expressions = [...(prior?.expressions ?? [])];
    for (const { cell, expressionId } of selected) {
      const slot = state.expressions.find((item) => item.id === expressionId)!;
      const index = expressions.findIndex((item) => item.view === cell.view && item.expressionId === expressionId);
      const entry = {
        view: cell.view,
        expressionId,
        label: slot.label,
        name: slot.name,
        pose: cell.pose,
        useWhen: slot.useWhen,
        aliases: slot.aliases,
        cutoutId: cell.id,
        filename: cell.rendered!.filename,
        assetId: cell.rendered!.assetId,
      };
      if (index >= 0) expressions[index] = entry;
      else expressions.push(entry);
    }
    resident.sprite = {
      assetId: prior?.assetId ?? selected[0]!.cell.rendered!.assetId,
      expressions,
      framing: prior?.framing ?? { mode: "full", cropPercent: 58 },
      defaultExpressionId: expressions.some((item) => item.expressionId === prior?.defaultExpressionId)
        ? prior!.defaultExpressionId
        : (expressions.find((item) => item.label === "neutral")?.expressionId ?? expressions[0]?.expressionId),
    };
  });
  return { studio: await readSpriteStudio(characterId), snapshot: await buildVillageSnapshot() };
}
export const discardStudioCell = (characterId: string, raw: unknown) =>
  serializeCells(characterId, () => discardStudioCellUnlocked(characterId, raw));
async function discardStudioCellUnlocked(characterId: string, raw: unknown) {
  const { id } = await scope(characterId);
  await mutate(id, (state) => {
    const found = findCell(state, asString(asRecord(raw).id));
    found.cell.pending = false;
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

export const saveStudioExpression = (characterId: string, raw: unknown) =>
  serializeCells(characterId, async () => {
    const { id } = await scope(characterId);
    await ensureLibrary(characterId, id);
    const body = asRecord(raw);
    const resident = await owner(characterId);
    if (body.removeId) {
      const expressionId = asString(body.removeId);
      if (resident.sprite?.expressions.some((entry) => entry.expressionId === expressionId))
        throw badRequest("Remove this expression's scene assignments before removing the slot.");
      await mutate(id, (state) => {
        state.expressions = state.expressions.filter((item) => item.id !== expressionId);
      });
    } else if (body.defaultId) {
      const expressionId = asString(body.defaultId);
      if (!resident.sprite?.expressions.some((entry) => entry.expressionId === expressionId))
        throw badRequest("Choose a filled expression as the default.");
      await mutateVillageState((state) => {
        const sprite = state.villagers.find((item) => item.characterId === characterId)?.sprite;
        if (sprite) sprite.defaultExpressionId = expressionId;
      });
    } else {
      const label = readSpriteExpression(body.label ?? body.name);
      const name = asString(body.name).trim() || label.replaceAll("_", " ");
      const pose = asString(body.pose),
        useWhen = asString(body.useWhen);
      if (name.length > 100 || pose.length > 500 || useWhen.length > 1000)
        throw badRequest("Keep names within 100 characters, poses within 500, and Use when within 1,000.");
      let saved: StudioExpression;
      await mutate(id, (state) => {
        const prior = body.id
          ? state.expressions.find((item) => item.id === body.id)
          : state.expressions.find((item) => item.label === label);
        if (body.id && !prior) throw notFound("That expression slot no longer exists.");
        if (state.expressions.some((item) => item.label === label && item.id !== prior?.id))
          throw badRequest("Choose a distinct expression name.");
        saved = {
          ...definition(label, pose, prior?.id),
          name,
          useWhen: body.useWhen === undefined ? (STUDIO_MEANINGS[label] ?? pose) : useWhen,
          aliases: [...new Set([...(prior?.aliases ?? []), label])],
        };
        if (prior) Object.assign(prior, saved);
        else state.expressions.push(saved);
      });
      await mutateVillageState((state) => {
        for (const entry of state.villagers.find((item) => item.characterId === characterId)?.sprite?.expressions ?? [])
          if (entry.expressionId === saved!.id)
            Object.assign(entry, {
              label: saved!.label,
              name: saved!.name,
              useWhen: saved!.useWhen,
              aliases: saved!.aliases,
            });
      });
    }
    return { studio: await readSpriteStudio(characterId), snapshot: await buildVillageSnapshot() };
  });

export const clearStudioReview = (characterId: string) =>
  serializeCells(characterId, async () => {
    const { id } = await scope(characterId);
    await ensureLibrary(characterId, id);
    await mutate(id, (state) => {
      for (const job of state.jobs)
        for (const sheet of job.sheets) for (const cell of sheet.cells) cell.pending = false;
    });
    return readSpriteStudio(characterId);
  });

function retainedUrls(state: StudioState, resident: Awaited<ReturnType<typeof owner>>) {
  const keep = new Set<string>();
  const reference = resident.cardSnapshot.spriteReference?.url;
  if (reference) keep.add(reference.split("?")[0]!);
  for (const entry of resident.sprite?.expressions ?? []) keep.add(imageUrl(resident.sprite!, entry));
  for (const job of state.jobs) {
    if (job.pendingAssetId) keep.add(`/api/sprites/${job.pendingAssetId}/file/original.png`);
    for (const sheet of job.sheets)
      if (sheet.cells.length) {
        keep.add(sheet.url.split("?")[0]!);
        for (const cell of sheet.cells) if (cell.rendered) keep.add(cell.rendered.url);
      }
  }
  return keep;
}
async function cleanUnusedFiles(characterId: string, id: string) {
  const state = await read(id),
    resident = await owner(characterId);
  const keep = retainedUrls(state, resident);
  for (const other of (await readVillageState()).villagers) {
    if (other.cardSnapshot.spriteReference) keep.add(other.cardSnapshot.spriteReference.url.split("?")[0]!);
    for (const entry of other.sprite?.expressions ?? []) keep.add(imageUrl(other.sprite!, entry));
  }
  const failures: Array<{ url: string; error: string }> = [];
  let deleted = 0;
  for (const file of state.files) {
    if (keep.has(file.url)) continue;
    try {
      await deleteVillageSpriteFile(file.assetId, file.expression);
      await mutate(id, (next) => {
        next.files = next.files.filter((item) => item.assetId !== file.assetId || item.expression !== file.expression);
      });
      deleted++;
    } catch (error) {
      const detail = safeMessage(error);
      failures.push({ url: file.url, error: detail });
      await mutate(id, (next) => {
        const record = next.files.find((item) => item.assetId === file.assetId && item.expression === file.expression);
        if (record) record.error = detail;
      });
    }
  }
  return { studio: await readSpriteStudio(characterId), deleted, failures };
}
export const deleteUnusedStudioFiles = (characterId: string) =>
  serializeCells(characterId, async () => {
    const { id } = await scope(characterId);
    await ensureLibrary(characterId, id);
    return cleanUnusedFiles(characterId, id);
  });
export const deleteStudioArtwork = (characterId: string, raw: unknown) =>
  serializeCells(characterId, async () => {
    const { id } = await scope(characterId);
    await ensureLibrary(characterId, id);
    const body = asRecord(raw);
    if (body.confirmed !== true) throw badRequest("Confirm deletion of the selected saved artwork.");
    const state = await read(id),
      resident = await owner(characterId);
    const job = body.batchId ? state.jobs.find((item) => item.id === body.batchId) : undefined;
    if (body.batchId && !job) throw notFound("That batch no longer exists.");
    if (job?.status === "running") throw badRequest("Wait for this batch to finish before deleting it.");
    const ids = new Set(
      job
        ? job.sheets.flatMap((sheet) => sheet.cells.map((cell) => cell.id))
        : Array.isArray(body.ids)
          ? body.ids.filter((item): item is string => typeof item === "string")
          : [],
    );
    if (!ids.size && !job) throw badRequest("Select saved cutouts to delete.");
    for (const cellId of ids) findCell(state, cellId);
    if (resident.sprite?.expressions.some((item) => item.cutoutId && ids.has(item.cutoutId)))
      throw badRequest("This artwork is in use. Remove or replace its assignments before deleting it.");
    const protectedReference = resident.cardSnapshot.spriteReference?.url.split("?")[0];
    if (
      protectedReference &&
      state.jobs.some((item) =>
        item.sheets.some((sheet) =>
          sheet.cells.some((cell) => ids.has(cell.id) && cell.rendered?.url === protectedReference),
        ),
      )
    )
      throw badRequest("The captured identity reference is protected.");
    await mutate(id, (next) => {
      for (const item of next.jobs) {
        for (const sheet of item.sheets) sheet.cells = sheet.cells.filter((cell) => !ids.has(cell.id));
        item.assignments = item.assignments?.filter((entry) => !ids.has(entry.cellId));
        item.sheets = item.sheets.filter((sheet) => sheet.cells.length > 0);
      }
      next.jobs = next.jobs.filter(
        (item) =>
          item.id !== job?.id &&
          (item.sheets.length || item.status === "running" || item.pendingAssetId || item.status === "interrupted"),
      );
    });
    return body.deleteFiles === true
      ? cleanUnusedFiles(characterId, id)
      : { studio: await readSpriteStudio(characterId), deleted: 0, failures: [] };
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
    retainFile(next, job.pendingAssetId!, fileStem(original.url), original.url.split("?")[0]!);
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
