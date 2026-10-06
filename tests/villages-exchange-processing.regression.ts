import assert from "node:assert/strict";
import {
  createExchangeProcessing,
  coerceExchangeProcessing,
  dispatchExchange,
  unfinishedExchange,
} from "../packages/villages/src/server/features/scenes/exchange-processing.js";

const exchange = () =>
  createExchangeProcessing({
    seed: "village",
    sceneId: "scene",
    submissionId: "turn",
    order: 0,
    lineIds: ["player", "reply"],
    actionReceiptIds: [],
  });
async function main() {
  // Faults before/after domain commits and before/after Scene bookkeeping must not block another domain.
  for (const faultDomain of ["projects", "wishes", "memories", "relationships"])
    for (const fault of ["before-effect", "after-effect", "before-status", "after-status", "none"]) {
      let saved = exchange();
      const receipts = new Set<string>();
      const effects: string[] = [];
      let failed = false;
      const handlers = Object.fromEntries(
        ["projects", "wishes", "memories", "relationships"].map((domain) => [
          domain,
          async () => {
            if (domain === faultDomain && !failed && fault === "before-effect") {
              failed = true;
              throw new Error("required transfer receipt absent");
            }
            if (!receipts.has(domain)) {
              receipts.add(domain);
              effects.push(domain);
            }
            if (domain === faultDomain && !failed && fault === "after-effect") {
              failed = true;
              throw new Error("interrupted after commit");
            }
            return { receiptIds: [domain] };
          },
        ]),
      );
      const save = async (domain: string, result: any) => {
        if (domain === faultDomain && !failed && fault === "before-status") {
          failed = true;
          throw new Error("status write interrupted");
        }
        saved.domains[domain] = structuredClone(result);
        if (domain === faultDomain && !failed && fault === "after-status") {
          failed = true;
          throw new Error("acknowledgement lost");
        }
      };
      await dispatchExchange(structuredClone(saved), handlers, save).catch(() => {});
      for (const domain of ["projects", "wishes", "memories", "relationships"].filter(
        (domain) => domain !== faultDomain,
      ))
        assert.ok(receipts.has(domain), `${faultDomain} ${fault}: independent ${domain} commit`);
      if (fault === "before-effect" || fault === "after-effect")
        assert.equal(saved.domains[faultDomain].status, "failed");
      saved = coerceExchangeProcessing(saved)!; // restart from stored data
      await dispatchExchange(structuredClone(saved), handlers, save);
      await dispatchExchange(structuredClone(saved), handlers, save); // duplicate submission/tab
      assert.deepEqual(effects.sort(), ["memories", "projects", "relationships", "wishes"]);
      assert.equal(unfinishedExchange(saved), false);
      assert.equal(saved.domains[faultDomain].status, "applied");
    }
  const rejected = exchange();
  await dispatchExchange(
    rejected,
    { projects: async () => ({ status: "rejected", reason: "Village identity changed" }) },
    async () => {},
  );
  assert.equal(rejected.domains.projects.status, "rejected");
  assert.equal(coerceExchangeProcessing({ version: 99 }), undefined);
  console.log(
    "Saved exchange dispatcher: independent domains, commit/status interruption, restart and duplicates passed (no model requests).",
  );
}
void main();
