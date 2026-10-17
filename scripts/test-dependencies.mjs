export const dependencySchema = 2;
const graphs = new Map();
/** Feedback selection is deliberately cheap and incomplete; only complete input graphs may cache proof. */
export async function testConsumers(inventory, root = process.cwd(), options = {}) {
  if (!options.complete) return feedbackConsumers(inventory, root, options);
  const { checkInputGraph } = await import("./check-inputs.mjs");
  const { validationInputs } = await import("./validation-inputs.mjs");
  const snapshot = await validationInputs(root);
  const entries = inventory.filter((test) => test.group !== "engine").map((test) => test.path);
  const key = JSON.stringify([root, snapshot.digest, entries]);
  if (!graphs.has(key)) graphs.set(key, checkInputGraph(entries, snapshot.inputs, root));
  const result = new Map();
  const scopes = new Map();
  Object.defineProperty(result, "scopes", { value: scopes });
  for (const [test, info] of await graphs.get(key)) {
    scopes.set(test, info.declarations ?? []);
    for (const path of info.inputs) {
      if (!result.has(path)) result.set(path, []);
      result.get(path).push(test);
    }
  }
  return result;
}
import { readFile, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

/** Follow literal imports and source-extraction fixtures, including inline esbuild entries. */
async function feedbackConsumers(inventory, root = process.cwd(), { expandBundles = true } = {}) {
  const edges = new Map();
  const find = async (path) => {
    for (const candidate of [
      path,
      ...(path.endsWith(".js") ? [path.slice(0, -3) + ".ts", path.slice(0, -3) + ".tsx"] : []),
    ])
      try {
        if ((await stat(candidate)).isFile()) return candidate;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    return null;
  };
  const imports = (path) => {
    if (!edges.has(path))
      edges.set(
        path,
        (async () => {
          const source = await readFile(path, "utf8"),
            next = [],
            bundles = new Set();
          for (const match of source.matchAll(
            /["']((?:\.{1,2}\/|packages\/|sources\/)[^"'\s]+\.(?:mjs|[jt]sx?|json|css))["']/g,
          )) {
            const name = match[1];
            const requested = [resolve(dirname(path), name), resolve(root, name)];
            for (const kind of ["client", "server"])
              if (
                requested.includes(resolve(root, "packages/villages", kind === "client" ? "client.js" : "server.mjs"))
              )
                bundles.add(kind);
            if (
              bundles.size &&
              requested.some((file) => /packages[\\/]villages[\\/](?:client\.js|server\.mjs)$/.test(file))
            )
              continue;
            const candidate =
              (await find(
                resolve(name.startsWith("packages/") || name.startsWith("sources/") ? root : dirname(path), name),
              )) ?? (await find(resolve(root, name)));
            if (candidate && !relative(root, candidate).startsWith("..")) next.push(candidate);
          }
          if (source.includes("@marinara-engine/shared")) next.push(resolve(root, "sources/package-shared.ts"));
          if (bundles.size && expandBundles) {
            const definition = await readFile(join(root, "packages/villages/package-definition.mjs"), "utf8");
            for (const match of definition.matchAll(/(?:clientImport|serverImport):\s*["']([^"']+)["']/g)) {
              if (!bundles.has(match[0].startsWith("client") ? "client" : "server")) continue;
              const candidate = await find(resolve(root, "packages/villages", match[1]));
              if (candidate) next.push(candidate);
            }
          }
          return next;
        })(),
      );
    return edges.get(path);
  };
  const result = new Map();
  for (const test of inventory.filter((test) => test.group !== "engine")) {
    const seen = new Set();
    async function visit(path) {
      if (seen.has(path)) return;
      seen.add(path);
      if (!/\.(?:mjs|[jt]sx?)$/.test(path)) return;
      for (const next of await imports(path)) await visit(next);
    }
    await visit(resolve(root, test.path));
    for (const path of seen) {
      const name = relative(root, path).replaceAll("\\", "/");
      if (!result.has(name)) result.set(name, []);
      result.get(name).push(test.path);
    }
  }
  return result;
}
