import { readdir } from "node:fs/promises";

/** Portable test inventory shared by CI and local candidate tooling. */
export async function testInventory(root = new URL("../", import.meta.url)) {
  const names = (await readdir(new URL("tests/", root))).sort();
  return names
    .filter((name) => /\.(?:regression\.ts|regression\.mjs|e2e\.mjs)$/.test(name))
    .map((name) => ({
      path: `tests/${name}`,
      group: ["villages-decision-transport.regression.ts", "villages-engine-shell.e2e.mjs"].includes(name)
        ? "engine"
        : name.endsWith(".e2e.mjs")
          ? "browser"
          : "regression",
      execution:
        name === "villages-engine-shell.e2e.mjs"
          ? "live-shell-mocked-package"
          : name.endsWith(".e2e.mjs")
            ? "mocked-browser"
            : "provider-free",
      ...(name === "villages-decision-transport.regression.ts"
        ? { requirements: "Existing compatible Engine runtime; synthetic local provider" }
        : {}),
      ...(name === "villages-engine-shell.e2e.mjs"
        ? { requirements: "VILLAGES_ENGINE_URL pointing to an isolated running Engine; package APIs mocked" }
        : {}),
    }));
}
