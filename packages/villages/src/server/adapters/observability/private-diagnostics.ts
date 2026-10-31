import type { mutateDocument } from "../storage/document-store.js";
import { memoryObject, memoryRequire, memoryTimestamp } from "../../domain/rules/memory-integrity.js";
import { boundedRejectedText, REJECTED_RESPONSE_TEXT_LIMIT } from "../../domain/rules/rejected-response.js";

export const PRIVATE_DIAGNOSTICS_ID = "villages-private-diagnostics";
const SOURCES = ["scene", "space", "json-repair", "generation"] as const;
type Source = (typeof SOURCES)[number];
type Entry = Record<string, unknown> & { source: Source; capturedAt: string; content: string };
type Log = { format: 1; entries: Entry[] };
const PREFIX = "diagnostic:";
function validateEntry(value: unknown): asserts value is Entry {
  memoryObject(value);
  memoryRequire(
    SOURCES.includes(value.source) &&
      typeof value.content === "string" &&
      value.content.length <= REJECTED_RESPONSE_TEXT_LIMIT,
    "invalid diagnostic entry",
  );
  memoryTimestamp(value.capturedAt);
}
export function readPrivateDiagnostics(raw: unknown): Log {
  if (raw === undefined) return { format: 1, entries: [] };
  memoryObject(raw, ["format", "payload"]);
  memoryRequire(
    raw.format === 1 && typeof raw.payload === "string" && raw.payload.startsWith(PREFIX),
    "invalid diagnostic log",
  );
  const entries: unknown = JSON.parse(raw.payload.slice(PREFIX.length));
  memoryRequire(Array.isArray(entries) && entries.length <= 100, "invalid diagnostic entries");
  entries.forEach(validateEntry);
  return { format: 1, entries: entries as Entry[] };
}

/** Ordinary diagnostics never own responses, effects or replay authority. */
export async function retainPrivateDiagnostic(
  mutate: typeof mutateDocument,
  source: Source,
  entry: Record<string, unknown> & { capturedAt: string; content: string },
) {
  memoryRequire(typeof entry.content === "string", "invalid diagnostic content");
  const captured = { ...entry, source, content: boundedRejectedText(entry.content) };
  validateEntry(captured);
  await mutate<Log>(
    PRIVATE_DIAGNOSTICS_ID,
    {
      kind: "private-diagnostics",
      name: "Recent private diagnostics",
      description: "The 100 most recently published ordinary diagnostics; not recovery authority.",
      label: () => "Recent private diagnostics",
      coerce: readPrivateDiagnostics,
      // Diagnostic strings are prose, including metadata; none owns Gallery media.
      encode: (value) => ({ format: 1, payload: PREFIX + JSON.stringify(value.entries) }),
    },
    (state) => {
      state.entries = [...state.entries, captured].slice(-100);
    },
  );
}
