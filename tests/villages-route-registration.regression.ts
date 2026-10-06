import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { villagesRoutes } from "../packages/villages/src/server/entry/routes.js";
import type { FastifyInstance } from "fastify";

async function main() {
  const routes: Array<{ method: string; path: string; bodyLimit?: number }> = [];
  const collector = Object.fromEntries(
    ["get", "post", "put", "patch", "delete"].map((method) => [
      method,
      function (this: unknown, path: string, options: unknown, handler?: unknown) {
        assert.equal(
          typeof (typeof options === "function" ? options : handler),
          "function",
          `${method} ${path} has an actual handler`,
        );
        routes.push({
          method,
          path,
          ...(typeof options === "object" && options
            ? { bodyLimit: (options as { bodyLimit?: number }).bodyLimit }
            : {}),
        });
        return this;
      },
    ]),
  );
  await villagesRoutes(collector as unknown as FastifyInstance);
  const baseline = JSON.parse(
    readFileSync(new URL("./fixtures/villages-route-contract.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(routes)),
    baseline.routes,
    "host collector methods, paths, body limits and order preserve the validated baseline",
  );
  assert.equal(routes.length, 146);
  console.log(
    "Villages route registration regression: all 146 host collector definitions and limits preserved; handler behaviors have separate suites.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
