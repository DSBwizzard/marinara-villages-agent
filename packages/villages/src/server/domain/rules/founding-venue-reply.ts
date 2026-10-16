/** Format recovery only. Required IDs, fields, layouts and privacy still use the founding validator. */
export function extractFoundingVenueReply(content: string): Record<string, unknown> | null {
  let text = content.trim();
  // Some providers include completed reasoning in content despite a separate JSON request.
  // Only strip leading, explicitly closed blocks; never alter tags inside a JSON string.
  while (/^<(think|analysis)>/u.test(text)) {
    const tag = text.startsWith("<think>") ? "think" : "analysis";
    const end = text.indexOf(`</${tag}>`);
    if (end < 0) return null;
    text = text.slice(end + tag.length + 3).trimStart();
  }
  const direct = decode(text);
  const whole = payload(typeof direct === "string" ? decode(direct) : direct);
  if (whole) return whole;
  const candidates: Record<string, unknown>[] = [];
  for (let start = 0; start < text.length; start++) {
    if (text[start] !== "{" && text[start] !== "[") continue;
    const end = balancedEnd(text, start);
    // Do not salvage nested rows out of a cut-off or malformed enclosing reply.
    if (end < 0) return null;
    const candidate = payload(decode(text.slice(start, end + 1)));
    if (candidate) candidates.push(candidate);
    start = end;
  }
  // Multiple alternative Venue answers are ambiguous, even when one looks more complete.
  return candidates.length === 1 ? candidates[0] : null;
}

function payload(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    return value.length &&
      value.every((row) => row && typeof row === "object" && !Array.isArray(row) && typeof row.id === "string")
      ? { venues: value }
      : null;
  }
  return value && typeof value === "object" && Object.hasOwn(value, "venues")
    ? (value as Record<string, unknown>)
    : null;
}

function balancedEnd(text: string, start: number): number {
  const stack: string[] = [];
  let quoted = false,
    escaped = false;
  for (let index = start; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{" || char === "[") stack.push(char);
    else if (char === "}" || char === "]") {
      if (stack.pop() !== (char === "}" ? "{" : "[")) return -1;
      if (!stack.length) return index;
    }
  }
  return -1;
}

function decode(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    /* Try only the value-preserving trailing-comma normalization below. */
  }
  let normalized = "",
    quoted = false,
    escaped = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      let next = index + 1;
      while (/\s/u.test(text[next] ?? "") && next < text.length) next++;
      if (text[next] === "}" || text[next] === "]") continue;
    }
    normalized += char;
  }
  try {
    return JSON.parse(normalized);
  } catch {
    return null;
  }
}
