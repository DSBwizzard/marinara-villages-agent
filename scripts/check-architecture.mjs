import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { transform } from "esbuild";
import ts from "typescript";
import {
  clientFeatureInterfaces as defaultClientFeatureInterfaces,
  serverFeatureInterfaces,
} from "./feature-interfaces.mjs";

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
const featureOwner = (path) => {
  const match = /^(client|server)\/features\/([^/]+)\//.exec(path);
  return match && `${match[1]}/${match[2]}`;
};

function imports(source) {
  const found = [];
  function visit(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
      found.push({ specifier: node.moduleSpecifier, request: node });
    if (ts.isImportTypeNode(node))
      found.push({ specifier: ts.isLiteralTypeNode(node.argument) ? node.argument.literal : undefined, request: node });
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      found.push({ specifier: node.arguments[0], request: node });
    if (
      ts.isImportEqualsDeclaration(node) ||
      (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "require")
    )
      found.push({ request: node, unsupported: true });
    ts.forEachChild(node, visit);
  }
  visit(source);
  return found;
}

function bindingNames(binding) {
  if (!ts.isObjectBindingPattern(binding)) return null;
  const names = [];
  for (const element of binding.elements) {
    if (element.dotDotDotToken) return null;
    const name = element.propertyName ?? element.name;
    if (!ts.isIdentifier(name) && !ts.isStringLiteralLike(name)) return null;
    names.push(name.text);
  }
  return names.length ? names : null;
}

function finiteTypeKeys(node) {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteralLike(node.literal)) return [node.literal.text];
  if (!ts.isUnionTypeNode(node)) return null;
  const keys = node.types.map(finiteTypeKeys);
  return keys.every(Boolean) ? keys.flat() : null;
}

function enclosingExpression(node) {
  while (ts.isParenthesizedExpression(node.parent)) node = node.parent;
  return node;
}

/** Identify requested source names without admitting an unrestricted module namespace. */
function featureNames(request, shadowedPick) {
  if (ts.isImportDeclaration(request)) {
    const clause = request.importClause;
    if (clause?.name || !clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) return null;
    return clause.namedBindings.elements.map((binding) => (binding.propertyName ?? binding.name).text);
  }
  if (ts.isExportDeclaration(request)) {
    if (!request.exportClause || !ts.isNamedExports(request.exportClause)) return null;
    return request.exportClause.elements.map((binding) => (binding.propertyName ?? binding.name).text);
  }
  if (ts.isImportTypeNode(request)) {
    if (request.qualifier) {
      let name = request.qualifier;
      while (ts.isQualifiedName(name)) name = name.left;
      return [name.text];
    }
    const parent = request.parent;
    if (
      request.isTypeOf &&
      !shadowedPick &&
      ts.isTypeReferenceNode(parent) &&
      ts.isIdentifier(parent.typeName) &&
      parent.typeName.text === "Pick" &&
      parent.typeArguments?.length === 2 &&
      parent.typeArguments[0] === request
    )
      return finiteTypeKeys(parent.typeArguments[1]);
    return null;
  }
  if (ts.isCallExpression(request)) {
    let expression = enclosingExpression(request);
    const awaited = ts.isAwaitExpression(expression.parent);
    if (awaited) expression = enclosingExpression(expression.parent);
    const parent = expression.parent;
    if (ts.isVariableDeclaration(parent) && parent.initializer === expression) return bindingNames(parent.name);
    if (ts.isPropertyAccessExpression(parent) && parent.expression === expression) {
      if (parent.name.text !== "then" || awaited) return [parent.name.text];
      const call = parent.parent;
      const callback =
        ts.isCallExpression(call) && call.expression === parent && call.arguments.length === 1
          ? call.arguments[0]
          : null;
      if (
        callback &&
        ts.isArrowFunction(callback) &&
        callback.parameters.length === 1 &&
        !callback.parameters[0].dotDotDotToken &&
        !callback.parameters[0].initializer
      )
        return bindingNames(callback.parameters[0].name);
    }
  }
  return null;
}

function declaresPick(source) {
  let found = false;
  function visit(node) {
    if (
      (ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isTypeParameterDeclaration(node) ||
        ts.isImportSpecifier(node) ||
        ts.isNamespaceImport(node) ||
        ts.isImportClause(node)) &&
      node.name?.text === "Pick"
    )
      found = true;
    ts.forEachChild(node, visit);
  }
  visit(source);
  return found;
}

/** Check all maintained modules, including code currently unreachable from packaged entry points. */
export async function analyzeArchitecture({
  sourceRoot,
  compilerOptions = {},
  featureInterfaces = serverFeatureInterfaces,
  clientFeatureInterfaces = defaultClientFeatureInterfaces,
}) {
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
    const shadowedPick = declaresPick(syntax);
    for (const { specifier: node, request, unsupported } of imports(syntax)) {
      if (unsupported) {
        failures.push(`${from}: import-equals and require are unsupported; use explicit ESM imports`);
        continue;
      }
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
      const owner = featureOwner(destination);
      const clientFeature = destination.startsWith("client/features/");
      const assembly = clientFeature
        ? from.startsWith("client/entry/") || from.startsWith("client/shell/")
        : destination.startsWith("server/features/") && from.startsWith("server/entry/");
      if (owner && !assembly && featureOwner(from) !== owner) {
        const interfaces = clientFeature ? clientFeatureInterfaces : featureInterfaces;
        const allowed = interfaces[destination.split("/").slice(2).join("/")];
        const requested = featureNames(request, shadowedPick);
        if (!allowed)
          failures.push(
            `${from}: private feature implementation ${destination} must be connected by entry or its owning feature`,
          );
        else if (!requested?.length)
          failures.push(`${from}: ${destination} requires named feature contracts; module namespaces are private`);
        else
          for (const name of requested)
            if (!allowed.includes(name)) failures.push(`${from}: private feature export ${destination}#${name}`);
      }
      if (from.startsWith("client/") && destination.startsWith("server/"))
        failures.push(`${from}: client cannot import server-owned code or records`);
      if (from.startsWith("server/") && destination.startsWith("client/"))
        failures.push(`${from}: server cannot import client implementation`);
      if (from.startsWith("client/shared/") && (clientFeature || destination.startsWith("client/shell/")))
        failures.push(`${from}: shared client support cannot import feature or shell implementation`);
      if (from.startsWith("client/features/") && destination.startsWith("client/shell/"))
        failures.push(`${from}: client features cannot import shell assembly`);
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
      for (const node of imports(emitted)
        .map(({ specifier }) => specifier)
        .filter((node) => node && ts.isStringLiteralLike(node))) {
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
        .map(({ specifier }) => specifier)
        .filter((node) => node && ts.isStringLiteralLike(node))
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
