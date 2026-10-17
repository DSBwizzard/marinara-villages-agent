import { mkdir, readFile, writeFile, rename, lstat } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { checkBlueprint, fingerprint } from "./ci-checks.mjs";
import { validationInputs } from "./validation-inputs.mjs";

/** Local feedback only. CI never imports these unauthenticated receipts. */
export async function feedbackProof(root, tests, environment = process.env) {
  const before = await validationInputs(root);
  const blueprint = await checkBlueprint(root, { snapshot: before, inventory: tests });
  const catalog = new Map(blueprint.catalog);
  const directory = join(root, ".build-tmp/feedback-proof");
  await mkdir(directory, { recursive: true });
  const specs = new Map(blueprint.specs.filter((s) => s.kind === "test").map((spec) => [spec.path, spec]));
  const key = (test, cases) => {
    const spec = specs.get(test.path);
    return fingerprint({
      schema: 1,
      policy: blueprint.policyDigest,
      node: process.version,
      platform: process.platform,
      test: test.path,
      cases,
      scope: spec.scopeDigest,
      inputs: spec.inputs.map((p) => [p, catalog.get(p) ?? "missing"]),
      environment: Object.fromEntries(
        Object.entries(environment)
          .filter(([name]) => /^(?:VILLAGES_|PLAYWRIGHT_)/.test(name))
          .filter(
            ([name]) =>
              !/^(?:VILLAGES_CHECKOUT_OPERATION|VILLAGES_OPERATION_|VILLAGES_CI_|VILLAGES_(?:FEEDBACK_SCREENSHOTS|TEST_CASE_REPORT|TEST_PROGRESS_FILE))/.test(
                name,
              ),
          )
          .sort(([a], [b]) => a.localeCompare(b)),
      ),
    });
  };
  return {
    inputDigest: before.digest,
    async read(test, cases) {
      const id = key(test, cases),
        path = join(directory, id + ".json");
      try {
        if (!(await lstat(path)).isFile() || (await lstat(path)).isSymbolicLink()) return null;
        const receipt = JSON.parse(await readFile(path, "utf8"));
        if (
          receipt.schemaVersion !== 1 ||
          receipt.key !== id ||
          receipt.scope !== "local-feedback" ||
          receipt.result.code !== 0 ||
          receipt.result.signal ||
          receipt.result.skipped ||
          receipt.result.timedOut
        )
          return null;
        return { ...receipt.result, reused: true, durationMs: 0, originalDurationMs: receipt.result.durationMs };
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
    },
    async write(test, cases, result) {
      if (result.code !== 0 || result.signal || result.skipped || result.timedOut) return;
      const id = key(test, cases),
        path = join(directory, id + ".json"),
        temporary = path + "." + randomUUID();
      await writeFile(
        temporary,
        JSON.stringify({
          schemaVersion: 1,
          scope: "local-feedback",
          key: id,
          result,
          createdAt: new Date().toISOString(),
        }) + "\n",
        { flag: "wx" },
      );
      await rename(temporary, path);
    },
    async unchanged() {
      if ((await validationInputs(root)).digest !== before.digest)
        throw Error("Source changed during feedback checks; no reusable proof can be claimed");
    },
  };
}
