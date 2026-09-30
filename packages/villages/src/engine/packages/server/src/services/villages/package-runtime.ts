import { createHash } from "node:crypto";
// Villages — the handle on the Engine services this package is allowed to use.
//
// `activate` receives the runtime host on its context, hands it here, and the
// routes read it back through these accessors. Holding it in a module slot
// instead of threading it through every route keeps the route file readable and
// matches how the other first-party packages do it.
import { coordinatedCompletion } from "./venue-coordinator.js";
import { backgroundCalls } from "./background-context.js";
import type {
  CapabilityDocumentStore,
  CapabilityLanguageModelCompletion,
  CapabilityLanguageModelHost,
  CapabilityLanguageModelMessage,
  CapabilityPersistenceHost,
  CapabilityResolvedLanguageModel,
  CapabilityResourceHost,
  CapabilityRuntimeHost,
  CapabilityRuntimeLogger,
} from "@marinara-engine/shared";

/** Also the `packageId` every village document is written under. */
export const VILLAGES_PACKAGE_ID = "villages";

let host: CapabilityRuntimeHost | null = null;
let registration = 0;

/** Called from `activate`; the returned function releases the slot on deactivate. */
export function configureVillagesRuntime(next: CapabilityRuntimeHost): () => void {
  const token = ++registration;
  host = next;
  return () => {
    if (registration === token) host = null;
  };
}

function requireHost(): CapabilityRuntimeHost {
  if (!host) throw new Error("The Villages package runtime is not configured.");
  return host;
}

/**
 * The Engine's package-owned document store. It is the only persistence surface
 * the runtime host exposes without a chat permission check, which is exactly
 * what a village needs: its records are the package's own, not a chat's.
 */
export function villagesDocuments(): CapabilityDocumentStore {
  const documents = requireHost().persistence?.documents;
  if (!documents) {
    throw new Error(
      "This Engine version did not provide the package document store, so Villages cannot remember anything.",
    );
  }
  return documents;
}

/** Read-only access to the character library — the pool the picker draws from. */
export function villagesResources(): CapabilityResourceHost {
  const resources = requireHost().resources;
  if (!resources) {
    throw new Error("This Engine version did not provide the character library to packages.");
  }
  return resources;
}

/**
 * The Engine's chat persistence session, used when creating and reading
 * a Villages spin-off chat.
 */
export function villagesPersistence(): CapabilityPersistenceHost {
  const persistence = requireHost().persistence;
  if (!persistence) {
    throw new Error("This Engine version did not provide chat persistence to packages.");
  }
  return persistence;
}

export function villagesLanguageModels(): CapabilityLanguageModelHost {
  const languageModels = requireHost().languageModels;
  if (!languageModels) {
    throw new Error("This Engine version did not provide a language model to packages.");
  }
  return languageModels;
}

/**
 * Logging must never be able to fail. Failures are reported *by* logging them,
 * so a logger that throws would replace a readable error with an opaque
 * "Internal Server Error" whenever a request lands after teardown.
 */
const fallbackLogger: CapabilityRuntimeLogger = {
  debug: (message, ...args) => console.debug(message, ...args),
  info: (message, ...args) => console.info(message, ...args),
  warn: (message, ...args) => console.warn(message, ...args),
  error: (error, message, ...args) => console.error(message, ...args, error),
  debugOverride: (enabled, message, ...args) => {
    if (enabled) console.debug(message, ...args);
  },
};

export function villagesLogger(): CapabilityRuntimeLogger {
  return host?.logger ?? fallbackLogger;
}

export function villagesDebugAgentsEnabled(): boolean {
  return requireHost().isDebugAgentsEnabled() === true;
}

/**
 * The floor and the ceiling on a second attempt at the same question.
 *
 * The floor is above the smallest cap this package asks with on its first try,
 * because the whole reason a retry happens is that the first cap was spent before
 * the model got to the answer. The ceiling has to sit above the LARGEST first
 * cap, or the retry is silently dead: at a first cap of 4_096 the doubling below
 * clamps back to 4_000, `roomier <= maxTokens` is true, and the second attempt
 * never happens. 8_192 is twice the narration cap and reaches the same doubling
 * the old numbers did for a 700-token reply.
 */
const RETRY_FLOOR = 1_600;
const RETRY_CEILING = 8_192;

/** Whether a completion actually contains an answer. Whitespace is not an answer. */
function answered(completion: CapabilityLanguageModelCompletion): boolean {
  return (completion.content ?? "").trim().length > 0;
}

/**
 * The generation settings a narration turn asks for.
 *
 * The three optional ones are optional in the honest sense: `null` means the
 * preset switched that setting off, and the field is then left out of the request
 * rather than sent as a default. Temperature is a number-or-null rather than an
 * optional because a turn without one is a real and intended state.
 *
 * The unions are written out rather than imported from `narration-preset.ts`,
 * and that is deliberate: that module imports the logger from this one, so an
 * import back the other way would close a cycle between two files that both need
 * to be loadable first.
 */
export type VillageCompletionOptions = {
  temperature: number | null;
  reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh" | "max" | null;
  verbosity?: "low" | "medium" | "high" | null;
  debugMode: boolean;
  signal?: AbortSignal;
  onAttempt?: (completion: CapabilityLanguageModelCompletion, elapsedMs: number, maxTokens: number) => void;
  /** Scene turns own their two-attempt repair budget; other callers keep the blank retry. */
  retryEmpty?: boolean;
};

/**
 * One villager's question to the model, with the two things this package was
 * getting wrong about it fixed in one place.
 *
 * 1. ROOM FOR THINKING. Every cap in this package was written as if the answer
 *    were the only thing the model spends output tokens on, and on a model that
 *    reasons before it speaks that is false — the reasoning comes out of the
 *    same budget, so a budget sized for one short answer buys thinking and no
 *    answer at all. A greeting asked for 160 tokens came back empty on a live
 *    connection while a reply asked for 700 came back in full sentences: same
 *    model, same prompt, same minute, different number. Nothing in the Engine's
 *    provider chain adds reasoning room to a package call — no admission
 *    wrapper, no connection defaults, no thinking parameter for a proxied
 *    endpoint — so the number the caller passes here is exactly what the model
 *    gets. The constants at the call sites are now sized for a model that thinks.
 * 2. A BLANK ANSWER IS NOT AN ANSWER. When one comes back anyway, ask once more
 *    with substantially more room before believing it. The second call is worth
 *    its price because the first produced nothing to pay for, and because a
 *    greeting is written into the transcript permanently: one unlucky call must
 *    not leave a player's room holding a placeholder forever.
 *
 * `ponytail:` two attempts, not a loop. A model that answers nothing twice in a
 * row will not be argued into it by a third number, and a loop here would look
 * to the player exactly like a hang.
 */
export async function completeWithRoom(
  model: CapabilityResolvedLanguageModel,
  messages: CapabilityLanguageModelMessage[],
  maxTokens: number,
  options: VillageCompletionOptions,
): Promise<CapabilityLanguageModelCompletion> {
  const background = backgroundCalls.getStore();
  if (background) return background(model, messages, maxTokens, options);
  const ask = async (tokens: number) => {
    options.signal?.throwIfAborted();
    const started = performance.now();
    const completion = await coordinatedCompletion(
      createHash("sha256")
        .update(
          JSON.stringify([
            model.connectionId,
            model.model,
            messages,
            tokens,
            options.temperature,
            options.reasoningEffort,
            options.verbosity,
          ]),
        )
        .digest("hex"),
      (operationSignal) =>
        model.chatComplete(messages, {
          // Left off entirely when the caller has no temperature to ask for, which is
          // what a preset with temperature switched off means. Sending a number here
          // would be the package overruling a switch it had already read.
          ...(typeof options.temperature === "number" ? { temperature: options.temperature } : {}),
          ...(options.reasoningEffort ? { reasoningEffort: options.reasoningEffort } : {}),
          ...(options.verbosity ? { verbosity: options.verbosity } : {}),
          maxTokens: tokens,
          debugMode: options.debugMode,
          signal:
            operationSignal && options.signal
              ? AbortSignal.any([operationSignal, options.signal])
              : (operationSignal ?? options.signal),
        }),
    );
    options.onAttempt?.(completion, performance.now() - started, tokens);
    return completion;
  };

  const first = await ask(maxTokens);
  if (answered(first) || options.retryEmpty === false) return first;

  const ceiling = model.maxOutputTokens ?? RETRY_CEILING;
  const roomier = Math.min(Math.max(maxTokens * 2, RETRY_FLOOR), ceiling);
  if (roomier <= maxTokens) return first;

  // The messages were fitted against the SMALLER number, so this knowingly asks
  // for more output room than the fit reserved. On a context too small to hold
  // both, the provider says so and the caller reports that — which is still a
  // better outcome for the player than an empty room and no explanation.
  villagesLogger().debug(
    "[villages] %s answered nothing at %d tokens (finish reason %s); asking again with %d",
    model.model,
    maxTokens,
    first.finishReason,
    roomier,
  );
  return ask(roomier);
}

/** A bounded, actionable failure record without logging response text or prompts. */
export function completionFailure(
  task: string,
  completion: CapabilityLanguageModelCompletion,
  outputLimit: number,
): string {
  const length = (completion.content ?? "").trim().length;
  const reason = completion.finishReason ?? "unknown";
  const advice =
    reason === "length"
      ? " Increase the System connection's max output tokens or choose another model."
      : " Check the System connection and retry.";
  return `${task} returned no usable JSON (${length} characters; finish reason ${reason}; output limit ${outputLimit} tokens).${advice}`;
}

/**
 * The connection the player assigned to this agent. `resolveForRequest` falls
 * back to the agent default and then the engine default when this is null, so
 * the chain is agent-assigned → agent default → engine default.
 */
export async function villagesAgentConnectionId(): Promise<string | null> {
  try {
    const config = await requireHost().getAgentConfig();
    return config?.connectionId ?? null;
  } catch {
    // An unreadable agent config is not fatal: the model host still has the
    // agent and engine defaults to fall through to.
    return null;
  }
}

/**
 * The connection the player assigned to this agent for PICTURES.
 *
 * Deliberately not `connectionId`. An agent talks with one connection and draws
 * with another, so the Engine keeps the image choice in its own settings field,
 * and an agent that draws with a local Stable Diffusion endpoint while it talks
 * with a hosted model is the ordinary case rather than a strange one. Reading
 * it from the same `getAgentConfig` is what lets the villages image picker
 * default to whatever the agent already draws with instead of to nothing.
 */
export async function villagesAgentImageConnectionId(): Promise<string | null> {
  try {
    const config = await requireHost().getAgentConfig();
    const value = config?.settings?.imageConnectionId;
    return typeof value === "string" && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}
