import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../packages/villages/src/client");
/** Structural assertions follow the actual maintained import graph. Browser tests exercise its behavior. */
export function clientImplementation() {
  const seen = new Set<string>();
  const sources: string[] = [];
  function visit(file: string) {
    if (seen.has(file)) return;
    seen.add(file);
    const text = readFileSync(file, "utf8");
    sources.push(text);
    const parsed = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function scan(node: ts.Node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text.startsWith(".")
      ) {
        const absolute = resolve(dirname(file), node.moduleSpecifier.text);
        const base = extname(absolute) ? absolute.slice(0, -extname(absolute).length) : absolute;
        const target = [absolute, base + ".ts", base + ".tsx", base + ".mjs"].find(existsSync);
        if (!target) throw new Error("Missing client import: " + absolute);
        visit(target);
      }
      ts.forEachChild(node, scan);
    }
    scan(parsed);
  }
  visit(resolve(root, "entry/index.tsx"));
  return sources.join("\n");
}
