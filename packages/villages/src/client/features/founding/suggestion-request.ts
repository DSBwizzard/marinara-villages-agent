import { request, VillageApiError } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { SetupDraftData } from "./draft-model.js";
import type { StartingVenueSuggestion } from "./quick-start-drafts.js";
import type { FoundingState } from "./useFoundingState.js";

type Options = { quickStart?: boolean; venueId?: string };
type Result = { venues: StartingVenueSuggestion[] };
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
  setupWorkspace?: FoundingState["setupWorkspace"];
  setSetupWorkspace?: FoundingState["setSetupWorkspace"];
  persistSetupDraft?: (data: SetupDraftData) => Promise<void>;
  setupDraftData?: SetupDraftData;
};

/** POST admits one attempt; status checks only read the saved receipt. */
export async function requestFoundingSuggestions(
  ports: Ports,
  options: Options | undefined,
  input: object,
): Promise<Result> {
  const { signal } = ports;
  signal?.throwIfAborted();
  const { setupWorkspace, setSetupWorkspace, persistSetupDraft, setupDraftData } = ports;
  // Older embedders without a persisted founding workspace retain the synchronous API.
  if (!setupWorkspace || !setSetupWorkspace || !persistSetupDraft || !setupDraftData)
    return request<Result>("/setup/venues/suggest", { method: "POST", body: JSON.stringify(input) });
  const existing = setupWorkspace.suggestionRequest;
  const pending = existing ?? {
    id: createVillagesClientId(),
    sourceKey: ports.setupBeginningSourceKey,
    quickStart: !!options?.quickStart,
    venueId: options?.venueId,
  };
  // Recovery must use the original merge mode and target, regardless of which button was tapped.
  if (options) {
    options.quickStart = pending.quickStart;
    options.venueId = pending.venueId;
  }
  const clear = () =>
    setSetupWorkspace((state) =>
      state.suggestionRequest?.id === pending.id ? { ...state, suggestionRequest: undefined } : state,
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
  try {
    let receipt = existing
      ? await request<Receipt>(`/setup/venues/suggestions/${encodeURIComponent(pending.id)}`)
      : await request<Receipt>("/setup/venues/suggest", {
          method: "POST",
          body: JSON.stringify({ ...input, actionId: pending.id, sourceKey: pending.sourceKey }),
        });
    for (let poll = 0; ; poll++) {
      signal?.throwIfAborted();
      if (receipt.id !== pending.id || receipt.sourceKey !== pending.sourceKey)
        throw new Error("The saved suggestion attempt does not match this draft. Check suggestions again.");
      if (receipt.status !== "running") {
        terminal = true;
        clear();
        if (receipt.status !== "complete" || !receipt.result)
          throw new Error(
            receipt.error || "Suggestions stopped without a saved result. Generate again only when you choose.",
          );
        if (receipt.sourceKey !== ports.setupBeginningSourceKey)
          throw new Error(
            "Founding choices changed since these suggestions were requested. Your draft is kept; generate fresh suggestions when ready.",
          );
        return receipt.result;
      }
      if (poll >= 60) throw new Error("Suggestions are still being prepared.");
      signal?.throwIfAborted();
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
      signal?.throwIfAborted();
      receipt = await request<Receipt>(`/setup/venues/suggestions/${encodeURIComponent(pending.id)}`, { signal });
    }
  } catch (error) {
    // A definite refusal permits a new explicit attempt; connection loss keeps the ID for GET recovery.
    if (error instanceof VillageApiError && error.status >= 400 && error.status < 500) {
      clear();
      terminal = true;
    }
    if (terminal) throw error;
    const detail =
      error instanceof VillageApiError && error.status === 0
        ? "The connection dropped before suggestions arrived. Your draft is kept."
        : error instanceof Error
          ? error.message
          : "Suggestion status is unavailable.";
    throw new Error(`${detail} Use Check suggestions to retrieve this attempt without generating again.`);
  }
}
