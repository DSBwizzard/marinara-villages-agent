import { build } from "esbuild";
import ts from "typescript";
import { builtinModules } from "node:module";
import { readFile } from "node:fs/promises";
import { resolve, relative, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const portable = (path) => path.replaceAll("\\", "/");
const builtins = new Set(builtinModules.map((name) => name.replace(/^node:/, "")));
// Standard in-memory test libraries; filesystem, compiler, archive and builder APIs remain inspected or opaque.
const inputLibraries = new Set([
  "@playwright/test",
  "pngjs",
  "zod",
  "react",
  "react-dom",
  "react-dom/client",
  "react-dom/server",
  "esbuild",
  "fastify",
]);
const unknownRuntimeInput = (module) =>
  /^(?:node:)?(?:child_process|module|vm|worker_threads)$/.test(module) ||
  (!module.startsWith(".") &&
    !module.startsWith("/") &&
    module !== "@marinara-engine/shared" &&
    !inputLibraries.has(module) &&
    !builtins.has(module.replace(/^node:/, "")));

/** Bundler inputs plus fixture reads; unresolved dependencies widen the input set. */
export async function checkInputGraph(entries, catalog, root = process.cwd()) {
  const paths = new Set(catalog.map((row) => row.path));
  const catalogHashes = new Map(catalog.map((row) => [row.path, row.sha256]));
  const contracts = catalogHashes.has("scripts/test-inputs.json")
    ? JSON.parse(await readFile(resolve(root, "scripts/test-inputs.json"), "utf8"))
    : {};
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
    const reasons = new Set(),
      declaredInputs = new Set();
    const pending = [...found],
      queued = new Set(pending);
    for (const file of pending) {
      if (!/\.(?:[cm]?js|tsx?)$/.test(file)) continue;
      if (!analyses.has(file)) {
        let uncertain = false;
        const reasons = new Set();
        const unknown = (reason) => {
          uncertain = true;
          reasons.add(file + ": " + reason);
        };
        const text = await source(file);
        const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
        const bindings = new Map();
        const pathFunctions = new Map();
        const ioNames = new Set(),
          ioNamespaces = new Set(),
          processNames = new Set(),
          processNamespaces = new Set(),
          bundlerNames = new Set(),
          ioMethods = new Map(),
          builderMethods = new Map();
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
            if (unknownRuntimeInput(module)) unknown("runtime loader " + module);
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
              else if (named && ts.isNamedImports(named))
                for (const item of named.elements) {
                  names.add(item.name.text);
                  if (names === ioNames) ioMethods.set(item.name.text, (item.propertyName ?? item.name).text);
                  if (names === bundlerNames) builderMethods.set(item.name.text, (item.propertyName ?? item.name).text);
                }
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
        const extra = new Set(),
          inlineModules = [];
        const outputIO = new Set([
          "mkdir",
          "mkdirSync",
          "mkdtemp",
          "mkdtempSync",
          "writeFile",
          "writeFileSync",
          "appendFile",
          "appendFileSync",
          "unlink",
          "unlinkSync",
          "rm",
          "rmSync",
          "rmdir",
          "rmdirSync",
        ]);
        function literalBuild(node) {
          const options = node.arguments[0];
          if (
            !options ||
            !ts.isObjectLiteralExpression(options) ||
            options.properties.some((p) => !ts.isPropertyAssignment(p))
          )
            return false;
          const property = (object, key) => object.properties.find((p) => p.name?.getText(sf) === key)?.initializer;
          const allowed = new Set([
            "stdin",
            "entryPoints",
            "bundle",
            "write",
            "platform",
            "format",
            "jsx",
            "target",
            "metafile",
            "logLevel",
            "minify",
            "sourcemap",
            "packages",
          ]);
          const constant = (node) =>
            ts.isStringLiteralLike(node) ||
            node.kind === ts.SyntaxKind.TrueKeyword ||
            node.kind === ts.SyntaxKind.FalseKeyword ||
            ts.isNumericLiteral(node) ||
            (ts.isArrayLiteralExpression(node) && node.elements.every(constant));
          if (
            options.properties.some(
              (p) =>
                !allowed.has(p.name.getText(sf)) ||
                (!["stdin", "entryPoints"].includes(p.name.getText(sf)) && !constant(p.initializer)),
            )
          )
            return false;
          const stdin = property(options, "stdin");
          const entries = property(options, "entryPoints");
          if (stdin && entries) return false;
          if (
            stdin &&
            ts.isObjectLiteralExpression(stdin) &&
            stdin.properties.every(
              (p) =>
                ts.isPropertyAssignment(p) &&
                ["contents", "resolveDir", "loader", "sourcefile"].includes(p.name.getText(sf)),
            )
          ) {
            if (
              ["loader", "sourcefile"].some(
                (key) => property(stdin, key) && !ts.isStringLiteralLike(property(stdin, key)),
              )
            )
              return false;
            const contents = value(property(stdin, "contents"));
            const resolveDir = property(stdin, "resolveDir");
            if (contents === null || (resolveDir && value(resolveDir) !== root)) return false;
            // Literal import strings are scanned below. Runtime imports remain unknown.
            if (/\b(?:import\s*\(|require\s*\(|readFile|fetch\s*\()/.test(contents)) return false;
            for (const match of contents.matchAll(/(?:from\s*|import\s*)["']([^"']+)["']/g))
              if (
                unknownRuntimeInput(match[1]) ||
                /^(?:node:)?fs(?:\/promises)?$/.test(match[1]) ||
                match[1] === "esbuild"
              )
                return false;
            inlineModules.push(contents);
            return true;
          }
          if (!entries || !ts.isArrayLiteralExpression(entries)) return false;
          for (const entry of entries.elements) {
            const path = value(entry);
            if (!path) return false;
            const rel = portable(relative(root, resolve(root, path)));
            if (!paths.has(rel) && !generated[rel]) return false;
            extra.add(rel);
          }
          return true;
        }
        function visit(node) {
          if (
            ts.isExportDeclaration(node) &&
            node.moduleSpecifier &&
            ts.isStringLiteralLike(node.moduleSpecifier) &&
            unknownRuntimeInput(node.moduleSpecifier.text)
          )
            uncertain = true;
          if (ts.isCallExpression(node)) {
            const name = node.expression.getText(sf).split(".").pop();
            const identifier = ts.isIdentifier(node.expression) ? node.expression.text : null;
            const namespace = ts.isPropertyAccessExpression(node.expression)
              ? node.expression.expression.getText(sf)
              : null;
            if (
              ((identifier && ioNames.has(identifier)) || (namespace && ioNamespaces.has(namespace))) &&
              !outputIO.has(ioMethods.get(identifier) ?? name)
            ) {
              const target = value(node.arguments[0]);
              if (target) {
                const rel = portable(
                  relative(root, target.startsWith("file:") ? fileURLToPath(target) : resolve(root, target)),
                );
                if (paths.has(rel) || generated[rel]) extra.add(rel);
                else if (
                  !/^(?:\.build-tmp|artifacts|node_modules)\//.test(rel) &&
                  !(
                    (ioMethods.get(identifier) ?? name) === "existsSync" &&
                    /Google[\\/]Chrome[\\/]Application[\\/]chrome\.exe$/.test(target)
                  )
                )
                  unknown("untracked file " + rel);
              } else unknown("dynamic filesystem " + (ioMethods.get(identifier) ?? name));
            }
            if (
              (identifier && processNames.has(identifier)) ||
              (namespace && processNamespaces.has(namespace)) ||
              ["glob", "globSync", "require", "createRequire", "eval"].includes(name) ||
              (identifier &&
                bundlerNames.has(identifier) &&
                (!["build", "buildSync"].includes(builderMethods.get(identifier)) || !literalBuild(node)))
            )
              unknown("dynamic loader " + name);
            if (
              node.expression.kind === ts.SyntaxKind.ImportKeyword &&
              (!ts.isStringLiteralLike(node.arguments[0]) || unknownRuntimeInput(node.arguments[0].text))
            )
              uncertain = true;
          }
          if (
            ts.isIdentifier(node) &&
            (ioNames.has(node.text) ||
              ioNamespaces.has(node.text) ||
              bundlerNames.has(node.text) ||
              processNamespaces.has(node.text)) &&
            !ts.isImportSpecifier(node.parent) &&
            !ts.isImportClause(node.parent) &&
            !ts.isNamespaceImport(node.parent)
          ) {
            const parent = node.parent;
            const direct = ts.isCallExpression(parent) && parent.expression === node;
            const member =
              (ioNamespaces.has(node.text) || processNamespaces.has(node.text)) &&
              ts.isPropertyAccessExpression(parent) &&
              parent.expression === node &&
              ts.isCallExpression(parent.parent) &&
              parent.parent.expression === parent;
            if (!direct && !member) unknown("escaped input API " + node.text);
          }
          ts.forEachChild(node, visit);
        }
        visit(sf);
        for (const contents of inlineModules) {
          try {
            const bundled = await build({
              absWorkingDir: root,
              stdin: { contents, resolveDir: root, loader: "tsx" },
              bundle: true,
              write: false,
              metafile: true,
              platform: "node",
              format: "esm",
              packages: "external",
              logLevel: "silent",
              jsx: "automatic",
              alias: { "@marinara-engine/shared": resolve(root, "sources/package-shared.ts") },
              define: {
                "import.meta.env.DEV": "false",
                "import.meta.env.PROD": "true",
                "import.meta.env.MODE": '"production"',
              },
            });
            for (const input of Object.keys(bundled.metafile.inputs).map(portable))
              if (paths.has(input)) extra.add(input);
          } catch {
            unknown("unresolved inline bundle");
          }
        }
        for (const match of text.matchAll(
          /["']((?:\.{1,2}\/|packages\/|sources\/|tests\/)[^"'\s]+\.(?:mjs|[jt]sx?|json|css|svg|png|webp|wasm))["']/g,
        )) {
          for (const absolute of [resolve(dirname(resolve(root, file)), match[1]), resolve(root, match[1])]) {
            const rel = portable(relative(root, absolute));
            if (paths.has(rel) || generated[rel]) extra.add(rel);
          }
        }
        if (uncertain && !reasons.size) reasons.add(file + ": unresolved runtime input");
        analyses.set(file, { extra, opaque: uncertain, reasons: [...reasons] });
      }
      const info = analyses.get(file);
      const extra = info.extra;
      const contract = contracts[file];
      const reviewed =
        contract &&
        contract.sha256 === catalogHashes.get(file) &&
        Array.isArray(contract.inputs) &&
        contract.inputs.every(
          (path) =>
            typeof path === "string" &&
            /^(?:packages|sources|scripts|tests)\//.test(path) &&
            !path.split("/").includes(".."),
        );
      if (reviewed) {
        inputs.add("scripts/test-inputs.json");
        for (const path of paths)
          if (contract.inputs.some((scope) => path === scope || (scope.endsWith("/") && path.startsWith(scope)))) {
            inputs.add(path);
            declaredInputs.add(path);
          }
      }
      if (info.opaque && !reviewed) {
        for (const reason of info.reasons) reasons.add(reason);
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
        if (!queued.has(input) && (!declaredInputs.has(input) || found.has(input) || extra.has(input))) {
          queued.add(input);
          pending.push(input);
        }
    }
    if (opaque) for (const path of broad) inputs.add(path);
    return { inputs, opaque, payload, reasons: [...reasons], resolved: [...found] };
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
