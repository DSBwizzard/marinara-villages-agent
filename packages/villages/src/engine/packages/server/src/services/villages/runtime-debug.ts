import {
  VILLAGES_PACKAGE_ID,
  villagesDocuments,
  villagesDebugAgentsEnabled,
  villagesLogger,
} from "./package-runtime.js";
import { mutateDocument } from "./village-store.js";
import { badRequest } from "./errors.js";
import { venueDebugContext } from "./venue-coordinator.js";
export type RuntimeDebugView = { verbose: boolean; effective: boolean; engineEnabled: boolean };
let verbose = false;
let loaded = false;
export function resetRuntimeDebug(): void {
  verbose = false;
  loaded = false;
}
function engineEnabled(): boolean {
  try {
    return villagesDebugAgentsEnabled();
  } catch {
    return false;
  }
}
function view(): RuntimeDebugView {
  const enabled = engineEnabled();
  return { verbose, effective: verbose || enabled, engineEnabled: enabled };
}
export async function readRuntimeDebug(): Promise<RuntimeDebugView> {
  if (!loaded) {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-debug");
    verbose = (record?.data as { verbose?: unknown } | undefined)?.verbose === true;
    loaded = true;
  }
  return view();
}
export async function saveRuntimeDebug(value: unknown): Promise<RuntimeDebugView> {
  if (typeof value !== "boolean") throw badRequest("Verbose runtime logging must be true or false.");
  await mutateDocument(
    "villages-debug",
    {
      kind: "settings",
      name: "Runtime debugging",
      description: "Villages terminal logging preferences.",
      coerce: (raw: unknown) => ({ verbose: (raw as { verbose?: unknown } | null)?.verbose === true }),
      label: () => "Runtime debugging",
    },
    (state) => {
      state.verbose = value;
    },
  );
  verbose = value;
  loaded = true;
  runtimeDebug("logging settings", view());
  return view();
}
/** Logging cannot replace an operation's result; never log connection config or transport headers. */
export function runtimeDebug(event: string, detail: unknown): void {
  if (!view().effective) return;
  try {
    const text = JSON.stringify({ ...venueDebugContext(), event, detail }, (key, value) => {
      if (/^(?:api[_-]?key|authorization|access[_-]?token|secret)$/iu.test(key)) return "[redacted]";
      if (typeof value !== "string") return value;
      return value
        .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+/giu, "$1[redacted]")
        .replace(/([?&](?:api[_-]?key|access[_-]?token|token|key)=)[^&\s]+/giu, "$1[redacted]")
        .replace(/(["']?(?:api[_-]?key|access[_-]?token|secret)["']?\s*[:=]\s*["']?)[^\s"',;&}]+/giu, "$1[redacted]");
    });
    villagesLogger().debugOverride(true, "[villages/debug] %s", text);
  } catch {
    /* Diagnostic output must never fail a request. */
  }
}
