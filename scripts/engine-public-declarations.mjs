import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { resolve, relative, dirname, join, sep } from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
const output = resolve("sources/engine-public");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const args = process.argv.slice(2);
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
      ),
    )
  ).flat();
}
if (!args.includes("--refresh") && !args.includes("--check")) {
  const pin = JSON.parse(await readFile(join(output, "pin.json"), "utf8"));
  for (const file of pin.files)
    if (hash(await readFile(join(output, file.path))) !== file.sha256)
      throw Error("Pinned public declaration changed: " + file.path);
  const program = ts.createProgram(
    pin.files.map((f) => join(output, f.path)),
    {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      skipLibCheck: false,
      types: ["node"],
      lib: ["lib.esnext.d.ts", "lib.dom.d.ts"],
    },
  );
  const diagnostics = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...pin.files.flatMap((f) => {
      const source = program.getSourceFile(join(output, f.path));
      return [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)];
    }),
  ];
  if (diagnostics.length)
    throw Error(
      ts.formatDiagnostics(diagnostics, {
        getCurrentDirectory: () => process.cwd(),
        getCanonicalFileName: (f) => f,
        getNewLine: () => "\n",
      }),
    );
  console.log(`Verified hashes and complete type resolution for ${pin.files.length} pinned public declaration files.`);
} else {
  const from = resolve(args[args.indexOf("--from") + 1] ?? "");
  if (from === output)
    throw Error("Use the full pinned upstream declarations as regeneration input, never the trimmed output.");
  const revision = args.includes("--revision") ? args[args.indexOf("--revision") + 1] : undefined;
  if (args.includes("--refresh") && !/^[a-f0-9]{40}$/.test(revision ?? ""))
    throw Error("Refreshing requires --revision with the exact upstream commit.");
  if (!args.includes("--from"))
    throw Error("--refresh requires --from with a read-only upstream declaration directory");
  const oldPin = JSON.parse(await readFile(join(output, "pin.json"), "utf8"));
  const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const engineVersion = option("--engine-version") ?? (revision === oldPin.revision ? oldPin.engineVersion : undefined);
  const capabilityApi = option("--capability-api") ?? (revision === oldPin.revision ? oldPin.capabilityApi : undefined);
  if (args.includes("--refresh") && (!engineVersion || !capabilityApi))
    throw Error("A new upstream revision requires --engine-version and --capability-api to keep provenance accurate.");
  const paths = (await files(from)).filter((f) => f.endsWith(".d.ts"));
  const program = ts.createProgram(paths, {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      skipLibCheck: true,
    }),
    checker = program.getTypeChecker();
  const retained = new Map(),
    usedImports = new Map();
  const within = (file) =>
    relative(from, file) !== ".." &&
    !relative(from, file).startsWith(".." + sep) &&
    !relative(from, file).startsWith("node_modules" + sep);
  function enqueue(symbol) {
    if (!symbol) return;
    if (symbol.flags & ts.SymbolFlags.Alias) {
      for (const d of symbol.declarations ?? []) {
        if (ts.isImportSpecifier(d)) {
          const imp = d.parent.parent.parent;
          usedImports.set(imp, new Set([...(usedImports.get(imp) ?? []), d]));
        } else if (ts.isImportClause(d) || ts.isNamespaceImport(d))
          throw Error("Unsupported declaration import; review generator: " + d.getText());
      }
      symbol = checker.getAliasedSymbol(symbol);
    }
    for (const d of symbol.declarations ?? []) {
      const sf = d.getSourceFile();
      if (!within(sf.fileName)) continue;
      let n = d;
      while (n.parent && !ts.isSourceFile(n.parent)) n = n.parent;
      if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) continue;
      const nodes = retained.get(sf) ?? new Set();
      if (nodes.has(n)) continue;
      nodes.add(n);
      retained.set(sf, nodes);
      function visit(x) {
        if (ts.isIdentifier(x)) enqueue(checker.getSymbolAtLocation(x));
        ts.forEachChild(x, visit);
      }
      visit(n);
    }
  }
  const cap = program.getSourceFile(join(from, "types/capability-runtime.d.ts"));
  if (!cap) throw Error("Missing upstream capability-runtime.d.ts");
  const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(cap));
  const facade = await readFile("sources/package-shared.ts", "utf8");
  const names = [...facade.matchAll(/export type \{([^}]+)\}/g)].flatMap((m) => m[1].split(",").map((s) => s.trim()));
  for (const name of names) {
    const symbol = exported.find((s) => s.name === name);
    if (!symbol) throw Error("Unknown public root: " + name);
    enqueue(symbol);
  }
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }),
    outputs = [];
  for (const [sf, nodes] of retained) {
    let emitted = "";
    for (const node of sf.statements) {
      if (ts.isImportDeclaration(node) && usedImports.has(node)) {
        const selected = node.importClause.namedBindings.elements.filter((e) => usedImports.get(node).has(e));
        const update = ts.factory.updateImportDeclaration(
          node,
          node.modifiers,
          ts.factory.updateImportClause(
            node.importClause,
            node.importClause.isTypeOnly,
            undefined,
            ts.factory.updateNamedImports(node.importClause.namedBindings, selected),
          ),
          node.moduleSpecifier,
          node.attributes,
        );
        emitted += printer.printNode(ts.EmitHint.Unspecified, update, sf) + "\n";
      } else if (nodes.has(node)) emitted += node.getFullText(sf) + "\n";
    }
    const filename = relative(from, sf.fileName).split(sep).join("/");
    outputs.push({
      path: filename,
      content: emitted,
      sourceSha256: hash(sf.text),
      symbols: [...nodes]
        .map(
          (n) =>
            n.name?.text ??
            n.declarationList?.declarations.map((d) => d.name.getText(sf)).join(",") ??
            ts.SyntaxKind[n.kind],
        )
        .sort(),
    });
  }
  if (args.includes("--check")) {
    const pin = JSON.parse(await readFile(join(output, "pin.json"), "utf8"));
    if (outputs.length !== pin.files.length) throw Error("Public declaration closure differs from the recorded pin.");
    for (const file of outputs) {
      const pinned = pin.files.find((f) => f.path === file.path);
      if (!pinned || pinned.sourceSha256 !== file.sourceSha256 || pinned.sha256 !== hash(file.content))
        throw Error("Upstream declaration does not reproduce pin: " + file.path);
    }
    console.log("Upstream declarations reproduce the recorded public type closure.");
    process.exit(0);
  }
  const prior = (await files(output)).filter((f) => f.endsWith(".d.ts"));
  for (const f of prior) {
    const rel = relative(output, f).split(sep).join("/");
    if (!outputs.some((o) => o.path === rel)) {
      if (!resolve(f).startsWith(output + sep)) throw Error("Invalid output path");
      await unlink(f);
    }
  }
  for (const file of outputs) {
    await mkdir(dirname(join(output, file.path)), { recursive: true });
    await writeFile(join(output, file.path), file.content);
  }
  await writeFile(
    join(output, "pin.json"),
    JSON.stringify(
      {
        ...oldPin,
        revision,
        engineVersion,
        capabilityApi,
        roots: names,
        files: outputs
          .sort((a, b) => a.path.localeCompare(b.path))
          .map(({ content, ...f }) => ({ ...f, sha256: hash(content) })),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Retained ${outputs.length} public declaration files (${outputs.reduce((n, f) => n + f.content.split("\n").length, 0)} lines).`,
  );
}
