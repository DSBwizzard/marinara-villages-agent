import { extractModelJsonObject, modelJsonWithinBounds } from "./json-reply.js";
import { normalizeSceneJson, parseSceneObject } from "./scene-json-syntax.js";

/** Recover syntax only; complete Scene validation remains the caller's responsibility. */
export function extractSceneReply(content: string, finishReason?: string): Record<string, unknown> | null {
  if (!modelJsonWithinBounds(content)) return null;
  const complete = extractModelJsonObject({ content, finishReason });
  if (complete) return complete;
  // One candidate only. Never choose between competing objects or unwrap a JSON array.
  const start = content.indexOf("{");
  if (start < 0 || /[\[\]}]/u.test(content.slice(0, start))) return null;
  const text = content.slice(start);
  const stack = ["}"];
  let quoted = false,
    escaped = false;
  let saved: Record<string, unknown> | null = null;
  let tailStart = 0;
  for (let index = 1; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{" || char === "[") stack.push(char === "{" ? "}" : "]");
    else if (char === "}" || char === "]") {
      if (stack.pop() !== char) return null;
      if (!stack.length) {
        if (/[{}\[\],:"]/u.test(text.slice(index + 1))) return null;
        const candidate = text.slice(0, index + 1);
        return parseSceneObject(candidate) ?? parseSceneObject(normalizeSceneJson(candidate));
      }
    } else if (char === "," && stack.length === 1) {
      // Existing narrow truncation recovery: only fully parsed, unmodified prefix fields.
      saved = parseSceneObject(text.slice(0, index) + "}");
      tailStart = index + 1;
    }
  }
  const tailKey = /^\s*("(?:[^"\\]|\\.)*")\s*:/u.exec(text.slice(tailStart));
  const tail = tailKey ? parseSceneObject("{" + tailKey[1] + ":null}") : null;
  if (!tail || !saved || Object.keys(tail).some((key) => Object.hasOwn(saved, key))) return null;
  return saved && Array.isArray(saved.segments) ? saved : null;
}
