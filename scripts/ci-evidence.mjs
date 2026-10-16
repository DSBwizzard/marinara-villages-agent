import { createHash } from "node:crypto";

export const evidenceDigest = (inputs) => createHash("sha256").update(JSON.stringify(inputs)).digest("hex");

/** Only known test-file edits may preserve a subset; product, harness and workflow edits invalidate it. */
export function reusableTests(receipt, current, inventory, consumers, { full = false } = {}) {
  if (full && receipt.full !== true) return [];
  if (!Array.isArray(receipt.inputs) || !Array.isArray(receipt.tests)) return [];
  if (evidenceDigest(receipt.inputs) !== receipt.inputDigest) return [];
  const previous = new Map(receipt.inputs.map((input) => [input.path, input.sha256]));
  const next = new Map(current.inputs.map((input) => [input.path, input.sha256]));
  const changed = [...new Set([...previous.keys(), ...next.keys()])].filter(
    (path) => previous.get(path) !== next.get(path),
  );
  const known = new Set(inventory.map((test) => test.path));
  if (changed.some((path) => !known.has(path) || !path.startsWith("tests/"))) return [];
  const affected = new Set(changed);
  for (const path of changed) {
    // A changed test may itself be imported by another suite.
    const dependents = consumers.get(path);
    if (!dependents?.includes(path)) return [];
    for (const test of dependents) affected.add(test);
  }
  return receipt.tests.filter(
    (test) => known.has(test.path) && !affected.has(test.path) && test.code === 0 && !test.skipped && !test.signal,
  );
}
