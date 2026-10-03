import {
  VILLAGES_PACKAGE_ID,
  villagesDocuments,
  villagesDebugAgentsEnabled,
  villagesLogger,
} from "./package-runtime.js";
import { mutateDocument } from "./village-store.js";
import { badRequest } from "./errors.js";
import { venueDebugContext } from "./venue-coordinator.js";
export type RuntimeDebugView = {
  verbose: boolean;
  effective: boolean;
  engineEnabled: boolean;
  showUsageMeter: boolean;
};
let verbose = false;
let showUsageMeter = true;
let loaded = false;
export function resetRuntimeDebug(): void {
  verbose = false;
  showUsageMeter = true;
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
  return { verbose, effective: verbose || enabled, engineEnabled: enabled, showUsageMeter };
}
export async function readRuntimeDebug(): Promise<RuntimeDebugView> {
  if (!loaded) {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-debug");
    verbose = (record?.data as { verbose?: unknown } | undefined)?.verbose === true;
    showUsageMeter = (record?.data as { showUsageMeter?: unknown } | undefined)?.showUsageMeter !== false;
    loaded = true;
  }
  return view();
}
export async function saveRuntimeDebug(value: unknown, meter?: unknown): Promise<RuntimeDebugView> {
  await readRuntimeDebug();
  if (value !== undefined && typeof value !== "boolean")
    throw badRequest("Verbose runtime logging must be true or false.");
  if (meter !== undefined && typeof meter !== "boolean") throw badRequest("Show AI usage meter must be true or false.");
  if (value === undefined && meter === undefined) throw badRequest("Choose a runtime setting.");
  await mutateDocument(
    "villages-debug",
    {
      kind: "settings",
      name: "Runtime debugging",
      description: "Villages terminal logging preferences.",
      coerce: (raw: unknown) => ({
        verbose: (raw as { verbose?: unknown } | null)?.verbose === true,
        showUsageMeter: (raw as { showUsageMeter?: unknown } | null)?.showUsageMeter !== false,
      }),
      label: () => "Runtime debugging",
    },
    (state) => {
      if (typeof value === "boolean") state.verbose = value;
      if (typeof meter === "boolean") state.showUsageMeter = meter;
    },
  );
  if (typeof value === "boolean") verbose = value;
  if (typeof meter === "boolean") showUsageMeter = meter;
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
