import { request, VillageApiError } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { SetupDraftData } from "./draft-model.js";
import type { FoundingSuggestionsResult } from "../../../shared/contracts/founding.js";
import type { FoundingState } from "./useFoundingState.js";

export type FoundingSuggestionOptions = {
  quickStart?: boolean;
  separateHomes?: boolean;
  venueId?: string;
  fullVenue?: boolean;
  draftEntranceImage?: boolean;
};
type Result = FoundingSuggestionsResult;
type Receipt = {
  id: string;
  sourceKey: string;
  status: "running" | "complete" | "failed" | "interrupted";
  result: Result | null;
  error: string;
};
type Ports = {
  signal?: AbortSignal;
  setupBeginningSourceKey: string;
  setupWorkspace: FoundingState["setupWorkspace"];
  setSetupWorkspace: FoundingState["setSetupWorkspace"];
  persistSetupDraft: (data: SetupDraftData) => Promise<void>;
  setupDraftData: SetupDraftData;
};

/** POST admits one attempt; status checks only read the saved receipt. */
export async function requestFoundingSuggestions(
  ports: Ports,
  options: FoundingSuggestionOptions | undefined,
  input: object,
): Promise<Result> {
  const { signal } = ports;
  signal?.throwIfAborted();
  const { setupWorkspace, setSetupWorkspace, persistSetupDraft, setupDraftData } = ports;
  const existing = setupWorkspace.suggestionRequest?.failure ? undefined : setupWorkspace.suggestionRequest;
  const pending = existing ?? {
    id: createVillagesClientId(),
    sourceKey: ports.setupBeginningSourceKey,
    quickStart: !!options?.quickStart,
    ...(options?.separateHomes ? { separateHomes: true, sourceVenues: JSON.stringify(setupDraftData.venues) } : {}),
    venueId: options?.venueId,
    ...(options?.fullVenue ? { fullVenue: true, draftEntranceImage: !!options.draftEntranceImage } : {}),
    ...((!options?.quickStart && options?.venueId) || options?.separateHomes
      ? { sourceInputs: JSON.stringify(input) }
      : {}),
  };
  // Recovery must use the original merge mode and target, regardless of which button was tapped.
  if (options) {
    options.quickStart = pending.quickStart;
    if (pending.separateHomes) options.separateHomes = true;
    else delete options.separateHomes;
    options.venueId = pending.venueId;
    if (pending.fullVenue) {
      options.fullVenue = true;
      options.draftEntranceImage = pending.draftEntranceImage;
    } else {
      delete options.fullVenue;
      delete options.draftEntranceImage;
    }
  }
  const clear = () =>
    setSetupWorkspace((state) =>
      state.suggestionRequest?.id === pending.id ? { ...state, suggestionRequest: undefined } : state,
    );
  const failed = (message: string) =>
    setSetupWorkspace((state) =>
      state.suggestionRequest?.id === pending.id
        ? { ...state, suggestionRequest: { ...pending, failure: message } }
        : state,
    );
  if (!existing) {
    const workspace = { ...setupWorkspace, suggestionRequest: pending };
    // Fail closed if device-local persistence is unavailable: no model request has left yet.
    setSetupWorkspace((state) => ({ ...state, suggestionRequest: pending }));
    try {
      await persistSetupDraft({ ...setupDraftData, workspace });
    } catch (error) {
      clear();
      throw error;
    }
  }
  let terminal = false;
  let admitting = !existing;
  try {
    let receipt = existing
      ? await request<Receipt>(`/setup/venues/suggestions/${encodeURIComponent(pending.id)}`, { signal })
      : await request<Receipt>("/setup/venues/suggest", {
          method: "POST",
          signal,
          body: JSON.stringify({ ...input, actionId: pending.id, sourceKey: pending.sourceKey }),
        });
    admitting = false;
    for (let poll = 0; ; poll++) {
      signal?.throwIfAborted();
      if (receipt.id !== pending.id || receipt.sourceKey !== pending.sourceKey)
        throw new Error("The saved suggestion attempt does not match this draft.");
      if (receipt.status === "failed" || receipt.status === "interrupted") {
        terminal = true;
        const message = receipt.error || "Suggestions stopped without a saved result.";
        failed(message);
        throw new Error(message);
      }
      if (receipt.status === "complete" && receipt.result) {
        terminal = true;
        clear();
        if (receipt.sourceKey !== ports.setupBeginningSourceKey)
          throw new Error(
            "Founding choices changed since these suggestions were requested. Your draft is kept; generate fresh suggestions when ready.",
          );
        if (
          (pending.sourceInputs !== undefined && pending.sourceInputs !== JSON.stringify(input)) ||
          (pending.sourceVenues !== undefined && pending.sourceVenues !== JSON.stringify(setupDraftData.venues))
        )
          throw new Error(
            "Founding choices changed since these suggestions were requested. Your draft is kept; request fresh suggestions when ready.",
          );
        return receipt.result;
      }
      if (receipt.status !== "running") throw new Error("Suggestion status is unavailable.");
      if (poll >= 60) throw new Error("Suggestions are still being prepared.");
      signal?.throwIfAborted();
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
      signal?.throwIfAborted();
      receipt = await request<Receipt>(`/setup/venues/suggestions/${encodeURIComponent(pending.id)}`, { signal });
    }
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === "AbortError")) throw error;
    // A definite refusal permits a new explicit attempt; connection loss keeps the ID for GET recovery.
    if (admitting && error instanceof VillageApiError && error.status >= 400 && error.status < 500) {
      failed(error.message);
      terminal = true;
    }
    if (terminal) throw error;
    const detail =
      error instanceof VillageApiError && error.status === 0
        ? "The connection dropped before suggestions arrived. Your draft is kept."
        : error instanceof Error
          ? error.message
          : "Suggestion status is unavailable.";
    throw new Error(`${detail} Reconnecting…`);
  }
}
