import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Bundle the actual entry module, replacing only its application boundary.
// No copied lifecycle logic, product test hooks, Engine runtime, or providers.
const entry = fileURLToPath(new URL("../packages/villages/src/server/entry/index.ts", import.meta.url));
const bundled = await build({
  stdin: {
    contents: `export { activate, selfCheck } from ${JSON.stringify(entry)}; export { useNext } from "fixture:application";`,
    resolveDir: process.cwd(),
  },
  write: false,
  bundle: true,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "mocked-application-boundary",
      setup(builder) {
        builder.onResolve({ filter: /^fixture:application$/ }, () => ({ path: "application", namespace: "fixture" }));
        builder.onResolve({ filter: /^\.\/application\.js$/ }, (args) => {
          if (args.importer === entry) return { path: "application", namespace: "fixture" };
        });
        builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents: `let next; export function useNext(value) { next = value; } export async function startVillagesApplication() { return await next; }`,
        }));
      },
    },
  ],
});
const { activate, selfCheck, useNext } = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].contents).toString("base64")}`
);
function application() {
  const observed = { checks: 0, stops: 0 };
  return {
    observed,
    async selfCheck() {
      observed.checks++;
    },
    async stop() {
      observed.stops++;
    },
  };
}
await assert.rejects(selfCheck(), /did not activate/);
const first = application(),
  second = application();
useNext(first);
const disposeFirst = await activate({});
useNext(second);
const disposeSecond = await activate({});
await disposeFirst();
await selfCheck();
assert.deepEqual(first.observed, { checks: 0, stops: 1 });
assert.deepEqual(second.observed, { checks: 1, stops: 0 });
await disposeSecond();
await assert.rejects(selfCheck(), /did not activate/);

const retained = application();
useNext(retained);
const disposeRetained = await activate({});
const admissionError = new Error("fixture replacement failed");
useNext(Promise.reject(admissionError));
await assert.rejects(activate({}), (error) => error === admissionError);
await selfCheck();
assert.equal(retained.observed.checks, 1, "failed replacement preserves the existing self-check owner");
await disposeRetained();
await assert.rejects(selfCheck(), /did not activate/);
console.log(
  "Actual entry ownership passed: old disposer preserves replacement and failed replacement preserves current application (mocked application boundary).",
);
