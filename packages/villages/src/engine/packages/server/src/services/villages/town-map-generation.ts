import { asRecord, asTrimmedString } from "./coerce.js";
import { type DocumentSlot, mutateDocument } from "./document-store.js";
import { badRequest, notFound, safeFailureMessage } from "./errors.js";
import { VILLAGES_PACKAGE_ID, villagesDocuments, villagesLogger } from "./runtime-host.js";
import { generateVillageTownMap } from "./town-map-image.js";

const DOCUMENT = "villages-town-map-generation";
type MapInput = Parameters<typeof generateVillageTownMap>[0];
export type TownMapGeneration = {
  id: string;
  sourceKey: string;
  startedAt: string;
  status: "running" | "complete" | "failed" | "interrupted";
  error: string;
  result: Awaited<ReturnType<typeof generateVillageTownMap>> | null;
};
type State = { request: TownMapGeneration | null; retiredIds: string[] };
const slot: DocumentSlot<State> = {
  kind: "map-generation",
  name: "Requested map artwork",
  description: "One saved map attempt and its result, separate from the founded Village.",
  label: () => "Requested map artwork",
  coerce(value) {
    const raw = asRecord(asRecord(value).request);
    const retiredIds = Array.isArray(asRecord(value).retiredIds)
      ? (asRecord(value).retiredIds as unknown[]).filter((id): id is string => typeof id === "string")
      : [];
    if (!raw.id || !["running", "complete", "failed", "interrupted"].includes(String(raw.status)))
      return { request: null, retiredIds };
    return { request: structuredClone(raw) as TownMapGeneration, retiredIds };
  },
};
let admission: Promise<unknown> = Promise.resolve();
let activeId = "";
let lifecycle = 0;
let enabled = false;
export function startTownMapGeneration(): () => void {
  lifecycle++;
  enabled = true;
  activeId = "";
  admission = Promise.resolve();
  return () => {
    lifecycle++;
    enabled = false;
    activeId = "";
  };
}
function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const work = admission.then(operation);
  admission = work.catch(() => undefined);
  return work;
}
function actionId(value: unknown): string {
  const id = asTrimmedString(value);
  if (!/^[a-zA-Z0-9_-]{8,128}$/.test(id)) throw badRequest("A map request ID is required.");
  return id;
}
async function read(): Promise<TownMapGeneration | null> {
  return slot.coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, DOCUMENT))?.data).request;
}
async function recover(request: TownMapGeneration | null): Promise<TownMapGeneration | null> {
  if (request?.status !== "running" || activeId === request.id) return request;
  await mutateDocument(DOCUMENT, slot, (state) => {
    if (state.request?.id !== request.id || state.request.status !== "running") return false;
    state.request.status = "interrupted";
    state.request.error =
      "The map request stopped before its result was saved. This attempt may have been billed. Generate again only when you choose.";
    request = state.request;
  });
  return request;
}

/** Admission returns promptly. Replaying an ID or opening another tab never draws again. */
export function requestTownMapGeneration(value: unknown): Promise<TownMapGeneration> {
  const token = lifecycle;
  const input = asRecord(value);
  const id = actionId(input.actionId);
  const sourceKey = asTrimmedString(input.sourceKey);
  if (!sourceKey || sourceKey.length > 20_000) throw badRequest("The map request inputs are missing or too long.");
  return serialized(async () => {
    if (!enabled || token !== lifecycle)
      throw badRequest("Map generation is restarting. Check status before trying again.");
    const previous = await recover(await read());
    if (previous?.id === id || previous?.status === "running") return previous;
    const request: TownMapGeneration = {
      id,
      sourceKey,
      startedAt: new Date().toISOString(),
      status: "running",
      error: "",
      result: null,
    };
    // A claim is saved before dispatch. A restart does not authorize another request.
    await mutateDocument(DOCUMENT, slot, (state) => {
      if (!enabled || token !== lifecycle)
        throw badRequest("Map generation is restarting. Check status before trying again.");
      if (state.retiredIds.includes(id))
        throw badRequest("This map request was already used. Its result was replaced by a newer attempt.");
      if (state.request) state.retiredIds.push(state.request.id);
      state.request = request;
    });
    if (!enabled || token !== lifecycle) return request;
    activeId = id;
    void draw(id, structuredClone(input) as MapInput, token);
    return request;
  });
}
async function draw(id: string, input: MapInput, token: number): Promise<void> {
  let result: TownMapGeneration["result"] = null;
  let error = "";
  try {
    result = await generateVillageTownMap(input);
  } catch (cause) {
    error = safeFailureMessage(cause);
  }
  if (token !== lifecycle) return;
  try {
    await mutateDocument(DOCUMENT, slot, (state) => {
      if (token !== lifecycle || state.request?.id !== id || state.request.status !== "running") return false;
      state.request.result = result;
      state.request.error = error;
      state.request.status = result ? "complete" : "failed";
    });
  } catch (cause) {
    villagesLogger().error(cause, "[villages] saving the requested map failed");
  } finally {
    if (token === lifecycle && activeId === id) activeId = "";
  }
}

/** Retrieving a saved result or error makes zero image requests. */
export function readTownMapGeneration(value: unknown): Promise<TownMapGeneration> {
  const id = actionId(value);
  return serialized(async () => {
    const request = await recover(await read());
    if (request?.id !== id)
      throw notFound(
        "This map attempt is no longer available. It may not have started, or a newer attempt replaced it. Generate again only when you choose.",
      );
    return request;
  });
}
