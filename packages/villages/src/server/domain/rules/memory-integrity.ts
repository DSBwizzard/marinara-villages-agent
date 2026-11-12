import { createHash } from "node:crypto";

const immutableValues = new WeakSet<object>();
export const isImmutableMemoryValue = (value: unknown): value is object =>
  !!value && typeof value === "object" && immutableValues.has(value);
/** Detached JSON containers share only already-immutable values. No mutable input is memoized. */
export function immutableMemoryValue<T>(value: T): T {
  const copying = new WeakMap<object, unknown>();
  const copy = (item: unknown): unknown => {
    if (!item || typeof item !== "object" || immutableValues.has(item)) return item;
    if (copying.has(item)) return copying.get(item);
    memoryRequire(Array.isArray(item) || Object.getPrototypeOf(item) === Object.prototype, "non-JSON memory value");
    const result: any = Array.isArray(item) ? [] : {};
    copying.set(item, result);
    for (const [key, child] of Object.entries(item))
      Object.defineProperty(result, key, { value: copy(child), enumerable: true, configurable: true, writable: true });
    Object.freeze(result);
    immutableValues.add(result);
    return result;
  };
  return copy(value) as T;
}
export const MEMORY_TEXT_LIMIT = 600;
export const memoryHash = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => JSON.stringify(key) + ":" + stable(value[key]))
        .join(",") +
      "}"
    );
  return JSON.stringify(value) ?? "null";
}
export function memoryRequire(condition: unknown, reason: string): asserts condition {
  if (!condition) throw new Error("Memory: " + reason);
}
export function memoryObject(value: unknown, keys?: string[]): asserts value is Record<string, any> {
  memoryRequire(
    !!value && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype,
    "invalid object",
  );
  memoryRequire(!keys || Object.keys(value).every((key) => keys.includes(key)), "unknown field");
}
export function memoryString(value: unknown, max = MEMORY_TEXT_LIMIT): asserts value is string {
  memoryRequire(
    typeof value === "string" && value.trim().length > 0 && Buffer.byteLength(value, "utf8") <= max,
    "invalid string",
  );
}
export function memoryKnowerId(value: unknown): asserts value is string {
  memoryString(value, 160);
  memoryRequire(!Object.hasOwn(Object.prototype, value), "reserved knower identity");
}
export function memoryTimestamp(value: unknown) {
  memoryString(value, 32);
  memoryRequire(Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, "invalid time");
}
