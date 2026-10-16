import { villageNow } from "../../adapters/time/clock-gate.js";
import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import type { CapabilityDocumentStore, CapabilityRuntimeLogger } from "@marinara-engine/shared";
import type { DocumentSlot, createDocumentMutator } from "../../adapters/storage/document-store.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, notFound, safeFailureMessage } from "../../domain/rules/errors.js";
import type { suggestStartingVenues } from "./founding-drafts.js";

const DOCUMENT = "villages-founding-suggestions";
// Reloads can briefly overlap in one host. A live owner cannot be declared interrupted by its successor.
const liveOwners = new WeakMap<CapabilityDocumentStore, Set<string>>();
type SuggestionInput = Parameters<typeof suggestStartingVenues>[0];
export type FoundingSuggestions = {
  id: string;
  sourceKey: string;
  startedAt: string;
  status: "running" | "complete" | "failed" | "interrupted";
  error: string;
  result: Awaited<ReturnType<typeof suggestStartingVenues>> | null;
};
type State = { request: FoundingSuggestions | null; retiredIds: string[] };
const slot: DocumentSlot<State> = {
  kind: "founding-suggestions",
  name: "Requested founding suggestions",
  description: "One saved Venue suggestion attempt and its result, separate from the founded Village.",
  label: () => "Requested founding suggestions",
  coerce(value) {
    const raw = asRecord(asRecord(value).request);
    const retiredIds = Array.isArray(asRecord(value).retiredIds)
      ? (asRecord(value).retiredIds as unknown[]).filter((id): id is string => typeof id === "string")
      : [];
    if (!raw.id || !["running", "complete", "failed", "interrupted"].includes(String(raw.status)))
      return { request: null, retiredIds };
    return { request: structuredClone(raw) as FoundingSuggestions, retiredIds };
  },
};

export interface FoundingSuggestionsPorts {
  villagesDocuments(): CapabilityDocumentStore;
  mutateDocument: ReturnType<typeof createDocumentMutator>;
  suggestStartingVenues: typeof suggestStartingVenues;
  villagesLogger(): CapabilityRuntimeLogger;
}
/** Each application owns its admission queue and the lifetime of its suggestion attempts. */
export function createFoundingSuggestions(ports: FoundingSuggestionsPorts) {
  const { villagesDocuments, mutateDocument, suggestStartingVenues, villagesLogger } = ports;
  const documents = villagesDocuments();
  let owners = liveOwners.get(documents);
  if (!owners) liveOwners.set(documents, (owners = new Set()));
  let admission: Promise<unknown> = Promise.resolve();
  let activeId = "";
  let lifecycle = 0;
  let enabled = true;
  function stop(): void {
    lifecycle++;
    enabled = false;
    activeId = "";
  }
  function serialized<T>(operation: () => Promise<T>): Promise<T> {
    const work = admission.then(operation);
    admission = work.catch(() => undefined);
    return work;
  }
  function actionId(value: unknown): string {
    const id = asTrimmedString(value);
    if (!/^[a-zA-Z0-9_-]{8,128}$/.test(id)) throw badRequest("A Venue suggestion request ID is required.");
    return id;
  }
  async function read(): Promise<FoundingSuggestions | null> {
    return slot.coerce((await documents.getById(VILLAGES_PACKAGE_ID, DOCUMENT))?.data).request;
  }
  async function recover(request: FoundingSuggestions | null): Promise<FoundingSuggestions | null> {
    if (request?.status !== "running" || activeId === request.id || owners!.has(request.id)) return request;
    await mutateDocument(DOCUMENT, slot, (state) => {
      if (state.request?.id !== request.id || state.request.status !== "running") return false;
      state.request.status = "interrupted";
      state.request.error =
        "The Venue suggestion request stopped before its result was saved. This attempt may have been billed. Generate again only when you choose.";
      request = state.request;
    });
    return request;
  }

  /** Admission returns promptly. Replaying an ID or opening another tab never generates again. */
  function requestFoundingSuggestions(value: unknown): Promise<FoundingSuggestions> {
    const token = lifecycle;
    const input = asRecord(value);
    const id = actionId(input.actionId);
    const sourceKey = asTrimmedString(input.sourceKey);
    if (!sourceKey || sourceKey.length > 20_000)
      throw badRequest("The Venue suggestion request inputs are missing or too long.");
    return serialized(async () => {
      if (!enabled || token !== lifecycle)
        throw badRequest("Venue suggestion generation is restarting. Check status before trying again.");
      const previous = await recover(await read());
      if (previous?.id === id) return previous;
      if (previous?.status === "running")
        throw badRequest("Another Venue suggestion attempt is still running. Check it before generating again.");
      const request: FoundingSuggestions = {
        id,
        sourceKey,
        startedAt: villageNow().toISOString(),
        status: "running",
        error: "",
        result: null,
      };
      // A claim is saved before dispatch. A restart does not authorize another request.
      if (owners!.has(id)) throw badRequest("This suggestion attempt is being admitted. Check its status shortly.");
      owners!.add(id);
      try {
        await mutateDocument(DOCUMENT, slot, (state) => {
          if (!enabled || token !== lifecycle)
            throw badRequest("Venue suggestion generation is restarting. Check status before trying again.");
          if (state.retiredIds.includes(id))
            throw badRequest(
              "This Venue suggestion request was already used. Its result was replaced by a newer attempt.",
            );
          if (state.request?.id === id)
            throw badRequest(
              "This Venue suggestion request was already admitted. Check its status before trying again.",
            );
          if (state.request?.status === "running")
            throw badRequest("Another Venue suggestion attempt is still running. Check it before generating again.");
          if (state.request) state.retiredIds.push(state.request.id);
          state.request = request;
        });
      } catch (error) {
        owners!.delete(id);
        throw error;
      }
      if (!enabled || token !== lifecycle) {
        owners!.delete(id);
        return request;
      }
      activeId = id;
      void generate(id, structuredClone(input) as SuggestionInput, token);
      return request;
    });
  }
  async function generate(id: string, input: SuggestionInput, token: number): Promise<void> {
    let result: FoundingSuggestions["result"] = null;
    let error = "";
    try {
      result = await suggestStartingVenues(input);
    } catch (cause) {
      error = safeFailureMessage(cause);
    }
    if (token !== lifecycle) {
      owners!.delete(id);
      return;
    }
    try {
      await mutateDocument(DOCUMENT, slot, (state) => {
        if (token !== lifecycle || state.request?.id !== id || state.request.status !== "running") return false;
        state.request.result = result;
        state.request.error = error;
        state.request.status = result ? "complete" : "failed";
      });
    } catch (cause) {
      villagesLogger().error(cause, "[villages] saving the requested Venue suggestions failed");
    } finally {
      owners!.delete(id);
      if (token === lifecycle && activeId === id) activeId = "";
    }
  }

  /** Retrieving a saved result or error makes zero model requests. */
  function readFoundingSuggestions(value: unknown): Promise<FoundingSuggestions> {
    const id = actionId(value);
    return serialized(async () => {
      const request = await recover(await read());
      if (request?.id !== id)
        throw notFound(
          "This Venue suggestion attempt is no longer available. It may not have started, or a newer attempt replaced it. Generate again only when you choose.",
        );
      return request;
    });
  }

  return { stop, requestFoundingSuggestions, readFoundingSuggestions };
}
export type FoundingSuggestionsService = ReturnType<typeof createFoundingSuggestions>;
