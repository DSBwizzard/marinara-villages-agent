import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Bind the reviewed test and local fixture code; source changes fail closed. */
export async function isolationHash(path, root = fileURLToPath(new URL("../", import.meta.url)), cache = new Map()) {
  const load = (path) => {
    if (!cache.has(path)) cache.set(path, readFile(path, "utf8"));
    return cache.get(path);
  };
  const files = new Map();
  async function visit(path) {
    path = resolve(path);
    const name = relative(root, path).replaceAll("\\", "/");
    if (name.startsWith("../") || files.has(name)) return;
    let source;
    try {
      try {
        source = await load(path);
      } catch (error) {
        if (error.code !== "ENOENT" || !path.endsWith(".js")) throw error;
        path = path.slice(0, -3) + ".ts";
        try {
          source = await load(path);
        } catch (next) {
          if (next.code !== "ENOENT") throw next;
          path += "x";
          source = await load(path);
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      // Source-extraction tests contain synthetic imports inside string fixtures.
      files.set(name, "missing");
      return;
    }
    files.set(name, source);
    for (const match of source.matchAll(/(?:from\s*|import\s*(?:\(\s*)?|require\(\s*)['"](\.[^'"]+)['"]/g)) {
      const imported = resolve(dirname(path), match[1]);
      if (/\.(?:mjs|ts|tsx|js)$/.test(imported)) await visit(imported);
    }
  }
  files.set("package-lock.json", await load(join(root, "package-lock.json")));
  await visit(resolve(root, path));
  return createHash("sha256")
    .update(JSON.stringify([...files].sort(([a], [b]) => a.localeCompare(b))))
    .digest("hex");
}
