import { build } from "esbuild";
import ts from "typescript";
import { readFile } from "node:fs/promises";
import { resolve, relative, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const portable = (path) => path.replaceAll("\\", "/");

/** Bundler inputs plus fixture reads; unresolved dependencies widen the input set. */
export async function checkInputGraph(entries, catalog, root = process.cwd()) {
  const paths = new Set(catalog.map((row) => row.path));
  const sources = new Map();
  const analyses = new Map();
  const generated = {
    "packages/villages/client.js": "clientImport",
    "packages/villages/server.mjs": "serverImport",
  };
  const definition = await readFile(resolve(root, "packages/villages/package-definition.mjs"), "utf8").catch(() => "");
  const entry = (field) => definition.match(new RegExp(field + ":\\s*[\"']([^\"']+)[\"']"))?.[1];
  const payloadRoots = Object.fromEntries(
    Object.entries(generated).map(([path, field]) => {
      const value = entry(field);
      return [path, value ? portable(relative(root, resolve(root, "packages/villages", value))) : null];
    }),
  );
  const graph = new Map();
  const source = async (path) => {
    if (!sources.has(path)) sources.set(path, await readFile(resolve(root, path), "utf8"));
    return sources.get(path);
  };
  async function imports(path) {
    if (graph.has(path)) return graph.get(path);
    let result;
    try {
      const bundle = await build({
        absWorkingDir: root,
        entryPoints: [path],
        bundle: true,
        write: false,
        metafile: true,
        platform: "node",
        format: "esm",
        target: "node24",
        packages: "external",
        logLevel: "silent",
        jsx: "automatic",
        alias: { "@marinara-engine/shared": resolve(root, "sources/package-shared.ts") },
        external: Object.keys(generated).map((path) => resolve(root, path)),
        plugins: [
          {
            name: "prepared-payload",
            setup(bundle) {
              bundle.onResolve({ filter: /(?:client\.js|server\.mjs)$/ }, (args) => {
                const target = portable(relative(root, resolve(args.resolveDir, args.path)));
                if (generated[target]) return { path: resolve(root, target), external: true };
              });
            },
          },
        ],
        define: {
          "import.meta.env.DEV": "false",
          "import.meta.env.PROD": "true",
          "import.meta.env.MODE": '"production"',
        },
      });
      result = new Set(
        Object.keys(bundle.metafile.inputs)
          .map(portable)
          .filter((path) => paths.has(path)),
      );
      result.add(path);
    } catch {
      result = null;
    }
    graph.set(path, result);
    return result;
  }
  const broad = [...paths];
  const results = new Map();
  async function inspect(path) {
    const found = await imports(path);
    if (!found) return { inputs: new Set([path, ...broad]), opaque: true, payload: false, resolved: null };
    const inputs = new Set(found);
    let opaque = false,
      payload = false;
    const pending = [...found],
      queued = new Set(pending);
    for (const file of pending) {
      if (!/\.(?:[cm]?js|tsx?)$/.test(file)) continue;
      if (!analyses.has(file)) {
        let uncertain = false;
        const text = await source(file);
        const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const bindings = new Map();
        const pathFunctions = new Map();
        const ioNames = new Set(),
          ioNamespaces = new Set(),
          processNames = new Set(),
          processNamespaces = new Set(),
          bundlerNames = new Set();
        function lexicalScope(node, parameter = false) {
          let scope = node.parent;
          while (
            scope &&
            !ts.isSourceFile(scope) &&
            !ts.isBlock(scope) &&
            !ts.isForStatement(scope) &&
            !ts.isForOfStatement(scope) &&
            !ts.isForInStatement(scope) &&
            !(parameter && ts.isFunctionLike(scope))
          )
            scope = scope.parent;
          return scope;
        }
        function declarations(node) {
          if ((ts.isVariableDeclaration(node) || ts.isParameter(node)) && ts.isIdentifier(node.name)) {
            const name = node.name.text;
            const list = bindings.get(name) ?? [];
            list.push({
              scope: lexicalScope(node, ts.isParameter(node)),
              value: !ts.isParameter(node) && node.parent.flags & ts.NodeFlags.Const ? node.initializer : null,
            });
            bindings.set(name, list);
          }
          if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
            const module = node.moduleSpecifier.text;
            if (/^(?:node:)?(?:path|url)$/.test(module)) {
              const named = node.importClause?.namedBindings;
              if (named && ts.isNamedImports(named))
                for (const item of named.elements)
                  pathFunctions.set(item.name.text, (item.propertyName ?? item.name).text);
            }
            const names = /^(?:node:)?fs(?:\/promises)?$/.test(module)
              ? ioNames
              : /^(?:node:)?child_process$/.test(module)
                ? processNames
                : module === "esbuild"
                  ? bundlerNames
                  : null;
            const namespaces = names === ioNames ? ioNamespaces : processNamespaces;
            if (names) {
              if (node.importClause?.name) namespaces.add(node.importClause.name.text);
              const named = node.importClause?.namedBindings;
              if (named && ts.isNamespaceImport(named)) namespaces.add(named.name.text);
              else if (named && ts.isNamedImports(named)) for (const item of named.elements) names.add(item.name.text);
            }
          }
          ts.forEachChild(node, declarations);
        }
        declarations(sf);
        function value(node, seen = new Set()) {
          if (!node) return null;
          if (ts.isStringLiteralLike(node)) return node.text;
          if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node))
            return value(node.expression, seen);
          if (ts.isIdentifier(node)) {
            if (seen.has(node.text)) return null;
            let scope = node.parent;
            while (scope) {
              const matches = (bindings.get(node.text) ?? []).filter((binding) => binding.scope === scope);
              if (matches.length)
                return matches.length === 1 ? value(matches[0].value, new Set([...seen, node.text])) : null;
              scope = scope.parent;
            }
            return null;
          }
          if (ts.isPropertyAccessExpression(node) && node.getText(sf) === "import.meta.url")
            return pathToFileURL(resolve(root, file)).href;
          if (ts.isNewExpression(node) && node.expression.getText(sf) === "URL") {
            const name = value(node.arguments?.[0], seen),
              base = value(node.arguments?.[1], seen);
            try {
              return name && base ? new URL(name, base).href : null;
            } catch {
              return null;
            }
          }
          if (ts.isCallExpression(node)) {
            if (node.expression.getText(sf) === "process.cwd") return root;
            if (!ts.isIdentifier(node.expression) || bindings.has(node.expression.text)) return null;
            const name = pathFunctions.get(node.expression.text);
            const args = node.arguments.map((arg) => value(arg, seen));
            if (name === "fileURLToPath" && args[0]) {
              try {
                return fileURLToPath(args[0]);
              } catch {
                return null;
              }
            }
            if (name === "dirname" && args[0]) return dirname(args[0]);
            if (name === "resolve" && args.every((arg) => arg !== null)) return resolve(root, ...args);
            if (name === "join" && args.every((arg) => arg !== null)) return join(...args);
          }
          return null;
        }
        const extra = new Set();
        function visit(node) {
          if (ts.isCallExpression(node)) {
            const name = node.expression.getText(sf).split(".").pop();
            const identifier = ts.isIdentifier(node.expression) ? node.expression.text : null;
            const namespace = ts.isPropertyAccessExpression(node.expression)
              ? node.expression.expression.getText(sf)
              : null;
            if ((identifier && ioNames.has(identifier)) || (namespace && ioNamespaces.has(namespace))) {
              const target = value(node.arguments[0]);
              if (target) {
                const rel = portable(
                  relative(root, target.startsWith("file:") ? fileURLToPath(target) : resolve(root, target)),
                );
                if (paths.has(rel) || generated[rel]) extra.add(rel);
                else if (!/^(?:\.build-tmp|artifacts|node_modules)\//.test(rel)) uncertain = true;
              } else uncertain = true;
            }
            if (
              (identifier && processNames.has(identifier)) ||
              (namespace && processNamespaces.has(namespace)) ||
              ["glob", "globSync", "require", "createRequire", "eval"].includes(name) ||
              (identifier && bundlerNames.has(identifier))
            )
              uncertain = true;
            if (node.expression.kind === ts.SyntaxKind.ImportKeyword && !ts.isStringLiteralLike(node.arguments[0]))
              uncertain = true;
          }
          if (
            ts.isIdentifier(node) &&
            (ioNames.has(node.text) || ioNamespaces.has(node.text)) &&
            !ts.isImportSpecifier(node.parent) &&
            !ts.isImportClause(node.parent) &&
            !ts.isNamespaceImport(node.parent)
          ) {
            const parent = node.parent;
            const direct = ts.isCallExpression(parent) && parent.expression === node;
            const member =
              ts.isPropertyAccessExpression(parent) &&
              parent.expression === node &&
              ts.isCallExpression(parent.parent) &&
              parent.parent.expression === parent;
            if (!direct && !member) uncertain = true;
          }
          ts.forEachChild(node, visit);
        }
        visit(sf);
        for (const match of text.matchAll(
          /["']((?:\.{1,2}\/|packages\/|sources\/|tests\/)[^"'\s]+\.(?:mjs|[jt]sx?|json|css|svg|png|webp|wasm))["']/g,
        )) {
          for (const absolute of [resolve(dirname(resolve(root, file)), match[1]), resolve(root, match[1])]) {
            const rel = portable(relative(root, absolute));
            if (paths.has(rel) || generated[rel]) extra.add(rel);
          }
        }
        analyses.set(file, { extra, opaque: uncertain });
      }
      const info = analyses.get(file);
      const extra = info.extra;
      if (info.opaque) {
        opaque = true;
        break;
      }
      for (const extraPath of extra) {
        if (generated[extraPath]) {
          payload = true;
          const payloadRoot = payloadRoots[extraPath];
          const payloadInputs = payloadRoot ? await imports(payloadRoot) : null;
          if (payloadInputs) for (const input of payloadInputs) inputs.add(input);
          else opaque = true;
        } else {
          inputs.add(extraPath);
          if (/\.(?:mjs|[jt]sx?)$/.test(extraPath)) {
            const dependencies = await imports(extraPath);
            if (dependencies) for (const input of dependencies) inputs.add(input);
            else opaque = true;
          }
        }
      }
      for (const input of inputs)
        if (!queued.has(input)) {
          queued.add(input);
          pending.push(input);
        }
    }
    if (opaque) for (const path of broad) inputs.add(path);
    return { inputs, opaque, payload, resolved: [...found] };
  }
  for (let index = 0; index < entries.length; index += 4) {
    const settled = await Promise.all(entries.slice(index, index + 4).map(async (path) => [path, await inspect(path)]));
    for (const [path, result] of settled) results.set(path, result);
  }
  return results;
}

export function definitionBehavior(source) {
  const sf = ts.createSourceFile("definition.mjs", source, ts.ScriptTarget.Latest, true);
  let result = source;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === "villagesDefinition" && node.initializer) {
      let value = node.initializer;
      while (ts.isAsExpression(value) || ts.isSatisfiesExpression(value) || ts.isParenthesizedExpression(value))
        value = value.expression;
      if (ts.isObjectLiteralExpression(value)) {
        const property = value.properties.find(
          (property) => ts.isPropertyAssignment(property) && property.name.getText(sf) === "version",
        );
        if (property && ts.isStringLiteralLike(property.initializer))
          result =
            source.slice(0, property.initializer.getStart(sf)) +
            '"release-version"' +
            source.slice(property.initializer.end);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return result;
}
