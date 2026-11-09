import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { runSceneCostFixtures } from "../tests/fixtures/scene-cost.fixture.ts";
const args = process.argv.slice(2);
if (args.length > 1) throw Error("Use npm run bench:scene -- [output.json]");
const output = resolve(args[0] ?? ".build-tmp/scene-cost/provider-free.json");
const report = await runSceneCostFixtures();
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
console.log(
  `${report.results.length} archive-identical Scene fixtures passed; provider requests: 0. Report: ${output}`,
);
