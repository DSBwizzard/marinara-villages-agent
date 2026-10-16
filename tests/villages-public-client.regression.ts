import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function inspect(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (/\.(?:tsx?|mjs)$/.test(entry.name)) {
      const source = await readFile(path, "utf8");
      assert.doesNotMatch(
        source,
        /VillagesUsageMeter|VillagesBurstPreview|showUsageMeter|villages-usage-visibility|Cost Estimator|\/usage(?:["/?])/,
        path,
      );
    }
  }
}
await inspect("packages/villages/src/client");
console.log("Public client excludes the private estimator and its re-enablement paths.");
