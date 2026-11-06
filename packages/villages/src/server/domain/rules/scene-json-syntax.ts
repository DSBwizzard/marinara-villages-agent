/** Reject duplicate keys rather than resolving an ambiguous repaired object by last-key wins. */
export function parseSceneObject(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const stack: Array<Set<string> | null> = [];
    const tokens = text.match(/"(?:[^"\\]|\\.)*"|[{}\[\]:]/gu) ?? [];
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index]!;
      if (token === "{") stack.push(new Set());
      else if (token === "[") stack.push(null);
      else if (token === "}" || token === "]") stack.pop();
      else if (token.startsWith('"') && tokens[index + 1] === ":") {
        const keys = stack.at(-1);
        const key = JSON.parse(token) as string;
        if (!keys || keys.has(key)) return null;
        keys.add(key);
      }
    }
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}
