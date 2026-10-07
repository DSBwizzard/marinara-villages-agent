import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { transform } from "esbuild";
import ts from "typescript";

async function sourceFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Source links are unsupported: ${path}`);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) files.push(path);
  }
  return files;
}
const canonical = (path) => resolve(path).replaceAll("\\", "/");
const featureOwner = (path) => /^server\/features\/([^/]+)\//.exec(path)?.[1];

function imports(source) {
  const found = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
      found.push(node.moduleSpecifier);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) found.push(node.argument.literal);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      found.push(node.arguments[0]);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return found;
}

/** Check all maintained modules, including code currently unreachable from packaged entry points. */
export async function analyzeArchitecture({ sourceRoot, compilerOptions = {} }) {
  const root = canonical(sourceRoot);
  const files = await sourceFiles(root);
  const names = new Set(files.map(canonical));
  const failures = [];
  const graph = new Map();
  const options = { moduleResolution: ts.ModuleResolutionKind.Bundler, ...compilerOptions };
  function target(file, specifier) {
    const resolved = ts.resolveModuleName(specifier, file, options, ts.sys).resolvedModule?.resolvedFileName;
    return resolved && canonical(resolved);
  }
  function label(path) {
    return relative(root, path).replaceAll("\\", "/");
  }
  for (const file of files) {
    const from = label(file);
    const source = await readFile(file, "utf8");
    const syntax = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    for (const node of imports(syntax)) {
      if (!node || !ts.isStringLiteralLike(node)) {
        if (from !== "server/adapters/engine/decisions-adapter.ts")
          failures.push(`${from}: computed module imports hide dependencies`);
        continue;
      }
      const to = target(file, node.text);
      if (!to || !names.has(to)) {
        if (node.text.startsWith("."))
          failures.push(`${from}: relative import escapes maintained source or is missing: ${node.text}`);
        continue;
      }
      const destination = label(to);
      // Feature factories are assembled at entry or used inside their owner.
      // Public feature bindings carry collaboration contracts instead.
      if (
        featureOwner(destination) &&
        /-service\.(?:ts|tsx|js|mjs)$/.test(destination) &&
        !from.startsWith("server/entry/") &&
        featureOwner(from) !== featureOwner(destination)
      )
        failures.push(
          `${from}: private service implementation ${destination} must be connected by entry or its owning feature`,
        );
      if (from.startsWith("client/") && destination.startsWith("server/"))
        failures.push(`${from}: client cannot import server-owned code or records`);
      if (from.startsWith("server/") && destination.startsWith("client/"))
        failures.push(`${from}: server cannot import client implementation`);
      if (from.startsWith("shared/") && !destination.startsWith("shared/"))
        failures.push(`${from}: shared contracts/helpers cannot import application implementation`);
      if (
        from.startsWith("server/domain/") &&
        !destination.startsWith("server/domain/") &&
        !destination.startsWith("shared/")
      )
        failures.push(`${from}: domain depends on ${destination}`);
      if (
        from.startsWith("server/adapters/") &&
        !destination.startsWith("server/adapters/") &&
        !destination.startsWith("server/domain/") &&
        !destination.startsWith("shared/")
      )
        failures.push(`${from}: connector calls application implementation ${destination}`);
    }
    if (from.startsWith("server/domain/") || from.startsWith("shared/")) {
      const effects = new Set(["fetch", "setTimeout", "setInterval", "clearTimeout", "clearInterval"]);
      function check(node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && effects.has(node.expression.text))
          failures.push(`${from}: rules/contracts cannot access network or timers directly`);
        const qualified = ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node);
        if (
          qualified &&
          ts.isIdentifier(node.expression) &&
          ["globalThis", "global", "window", "self"].includes(node.expression.text)
        ) {
          const name = ts.isPropertyAccessExpression(node)
            ? node.name.text
            : ts.isStringLiteralLike(node.argumentExpression)
              ? node.argumentExpression.text
              : null;
          if (name === null || effects.has(name))
            failures.push(`${from}: rules/contracts cannot access network or timers through globals`);
        }
        ts.forEachChild(node, check);
      }
      check(syntax);
    }
    // Transform each module separately so type-only imports are erased without
    // hiding cycles in currently unused modules through bundle tree shaking.
    const output = await transform(source, {
      loader: file.endsWith(".tsx") ? "tsx" : "ts",
      jsx: "automatic",
      format: "esm",
    });
    const emitted = ts.createSourceFile(file, output.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    if (from.startsWith("server/domain/") || from.startsWith("shared/")) {
      for (const node of imports(emitted).filter(ts.isStringLiteralLike)) {
        if (
          !node.text.startsWith(".") &&
          !names.has(target(file, node.text)) &&
          !["zod", "node:crypto"].includes(node.text)
        )
          failures.push(`${from}: rules/contracts cannot import effectful external dependency ${node.text}`);
      }
    }
    graph.set(
      canonical(file),
      imports(emitted)
        .filter(ts.isStringLiteralLike)
        .map((node) => target(file, node.text))
        .filter((path) => names.has(path)),
    );
  }
  const visited = new Set(),
    active = new Set(),
    stack = [];
  function visit(file) {
    if (active.has(file)) {
      failures.push("Circular dependency: " + [...stack.slice(stack.indexOf(file)), file].map(label).join(" → "));
      return;
    }
    if (visited.has(file)) return;
    active.add(file);
    stack.push(file);
    for (const dependency of graph.get(file) ?? []) visit(dependency);
    stack.pop();
    active.delete(file);
    visited.add(file);
  }
  for (const file of graph.keys()) visit(file);
  return { modules: files.length, failures: [...new Set(failures)].sort() };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(import.meta.filename), "..");
  const config = ts.parseJsonConfigFileContent(
    ts.readConfigFile(join(root, "tsconfig.package.json"), ts.sys.readFile).config,
    ts.sys,
    root,
  );
  const result = await analyzeArchitecture({
    sourceRoot: join(root, "packages/villages/src"),
    compilerOptions: config.options,
  });
  if (result.failures.length) throw new Error(result.failures.join("\n"));
  console.log(`Architecture boundaries and runtime dependencies passed for all ${result.modules} maintained modules.`);
}
