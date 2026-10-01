import { extractJsonObject } from "./village-bootstrap.js";

/** Keep complete narration when only trailing metadata was cut off. Never invent or repair JSON values. */
export function extractSceneReply(content: string): Record<string, unknown> | null {
  const complete = extractJsonObject(content);
  if (complete) return complete;
  const text = content.trim().replace(/^\x60\x60\x60(?:json)?\s*/u, "");
  if (!text.startsWith("{")) return null;
  let depth = 1,
    quoted = false,
    escaped = false;
  let saved: Record<string, unknown> | null = null;
  for (let index = 1; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{" || char === "[") depth++;
    else if (char === "}" || char === "]") {
      depth--;
      if (depth === 0) return null; // A complete malformed object is not a truncation.
    } else if (char === "," && depth === 1) {
      try {
        saved = JSON.parse(text.slice(0, index) + "}");
      } catch {
        return null;
      }
    }
  }
  return saved && Array.isArray(saved.heardPlayerBy) && Array.isArray(saved.segments) ? saved : null;
}
