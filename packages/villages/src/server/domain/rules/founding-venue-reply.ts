import { extractModelJsonObject, modelJsonWithinBounds } from "./json-reply.js";
/** Format wrappers are supported, but duplicate keys, partial rows and competing answers are not. */
export function extractFoundingVenueReply(content: string, finishReason = "stop"): Record<string, unknown> | null {
  if (!modelJsonWithinBounds(content) || ["length", "max_tokens"].includes(finishReason)) return null;
  let text = content.trim();
  while (/^<(think|analysis)>/u.test(text)) {
    const tag = text.startsWith("<think>") ? "think" : "analysis";
    const end = text.indexOf(`</${tag}>`);
    if (end < 0) return null;
    text = text.slice(end + tag.length + 3).trimStart();
  }
  text = text
    .replace(/^```(?:json)?\s*\n?/u, "")
    .replace(/\n?```\s*$/u, "")
    .trim();
  // Retain the existing double-encoded JSON wrapper, with a fixed unwrap bound.
  for (let depth = 0; depth < 2 && text.startsWith('"'); depth++) {
    try {
      const value: unknown = JSON.parse(text);
      if (typeof value !== "string") return null;
      text = value.trim();
    } catch {
      return null;
    }
    if (!modelJsonWithinBounds(text)) return null;
  }
  if (text.startsWith("[")) {
    if (!closedArray(text)) return null;
    const wrapped = extractModelJsonObject({ content: '{"venues":' + text + "}", finishReason });
    const rows = wrapped?.venues;
    return Array.isArray(rows) &&
      rows.length &&
      rows.every((row) => row && typeof row === "object" && !Array.isArray(row) && typeof row.id === "string")
      ? wrapped
      : null;
  }
  const value = extractModelJsonObject({ content: text, finishReason });
  return value && Object.hasOwn(value, "venues") ? value : null;
}

function closedArray(text: string): boolean {
  const stack: string[] = [];
  let quoted = false,
    escaped = false;
  for (const char of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "[" || char === "{") stack.push(char);
    else if (char === "]" || char === "}") {
      if (stack.pop() !== (char === "]" ? "[" : "{")) return false;
    }
  }
  return !quoted && !stack.length && text.endsWith("]");
}
