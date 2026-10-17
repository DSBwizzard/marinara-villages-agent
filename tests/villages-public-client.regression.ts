import assert from "node:assert/strict";
import ts from "typescript";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function inspect(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (/\.(?:tsx?|mjs)$/.test(entry.name)) {
      const source = await readFile(path, "utf8");
      if (entry.name.endsWith(".tsx")) {
        const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        function visit(node: ts.Node): void {
          if (
            (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
            ["input", "textarea", "form"].includes(node.tagName.getText(ast))
          ) {
            const autocomplete = node.attributes.properties.find(
              (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(ast) === "autoComplete",
            );
            assert.ok(
              autocomplete &&
                ts.isJsxAttribute(autocomplete) &&
                autocomplete.initializer &&
                ts.isStringLiteral(autocomplete.initializer) &&
                autocomplete.initializer.text === "off",
              `${path}: browser form history must be disabled on every control`,
            );
          }
          ts.forEachChild(node, visit);
        }
        visit(ast);
      }
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
