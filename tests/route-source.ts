import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Structural regressions read maintained feature route code after extraction. */
export function villageRouteSource() {
  const server = resolve(dirname(fileURLToPath(import.meta.url)), "../packages/villages/src/server");
  const features = join(server, "features");
  return [
    readFileSync(join(server, "entry/routes.ts"), "utf8"),
    ...readdirSync(features, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((entry) => {
        const directory = join(features, entry.name);
        return readdirSync(directory).includes("routes.ts") ? [readFileSync(join(directory, "routes.ts"), "utf8")] : [];
      }),
  ].join("\n");
}
