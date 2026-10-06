import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { villagesDefinition as feature } from "../packages/villages/package-definition.mjs";
import { assertPackagePrivateImportBoundary } from "./package-engine-boundary.mjs";
import { createDeterministicZip } from "./deterministic-zip.mjs";
import { withPackageActivationGuidance } from "./catalog-package-guidance.mjs";
import { writeEnglishPackageLocale } from "./package-locales.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(root, "packages/villages");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const boundary = await assertPackagePrivateImportBoundary({
  sourceRoot: join(packageRoot, "src/engine"),
  boundaryPath: join(packageRoot, "engine-boundary.json"),
  displayName: "Villages",
  capabilityApi: feature.capabilityApi,
});
const common = {
  absWorkingDir: root,
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2020",
  metafile: true,
  alias: { "@marinara-engine/shared": join(root, "sources/package-shared.ts") },
  logLevel: "warning",
};
const server = await build({
  ...common,
  stdin: {
    contents: `export { activate, selfCheck } from ${JSON.stringify(`./${feature.serverImport}`)};`,
    resolveDir: packageRoot,
    sourcefile: "villages-server-entry.mjs",
  },
  platform: "node",
  target: "node22",
  outfile: join(packageRoot, "server.mjs"),
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
  external: ["@huggingface/transformers", "onnxruntime-node", "onnxruntime-web", "sharp", "pino", "pino-pretty"],
});
await build({
  ...common,
  entryPoints: [join(packageRoot, feature.clientImport)],
  platform: "browser",
  outfile: join(packageRoot, "client.js"),
  jsx: "automatic",
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.DEV": "false",
    "import.meta.env.PROD": "true",
    "import.meta.env.MODE": '"production"',
  },
});
if (
  Object.keys(server.metafile.inputs).some((input) =>
    /services\/(?:decision\/|storage\/(?:connections|app-settings)\.storage\.)/.test(input),
  )
) {
  throw new Error("Private Engine Decisions implementations cannot be bundled.");
}
const description = withPackageActivationGuidance(feature.id, feature.description);
const agents = [
  {
    id: feature.id,
    name: feature.name,
    description: feature.agent?.description ?? feature.description,
    author: "Pasta Devs",
    phase: feature.agent?.phase ?? "pre_generation",
    enabledByDefault: false,
    category: feature.category ?? "misc",
    runtimeDisabled: feature.agent?.runtimeDisabled ?? true,
    ...(feature.agent?.defaultInjectAsSection === undefined
      ? {}
      : { defaultInjectAsSection: feature.agent.defaultInjectAsSection }),
    modeAllowlist: feature.modes,
    defaultTools: [],
    defaultSettings: feature.agent?.defaultSettings ?? {},
    defaultPromptTemplate: feature.agent?.defaultPromptTemplate ?? "",
    execution: feature.agent?.execution ?? "feature",
  },
];
await writeFile(join(packageRoot, "agents.json"), `${JSON.stringify(agents, null, 2)}\n`);
const payloads = await Promise.all(
  ["agents.json", "server.mjs", "client.js", ...(feature.assetPaths ?? [])].map(async (path) => {
    if (
      path.startsWith("/") ||
      path.includes("\\") ||
      path.split("/").some((part) => !part || part === "." || part === "..")
    )
      throw new Error(`Unsafe package path: ${path}`);
    return { name: path, data: await readFile(join(packageRoot, path)) };
  }),
);
const manifest = {
  schemaVersion: 2,
  capabilityApi: boundary.capabilityApi,
  builtAgainst: boundary.builtAgainst,
  id: feature.id,
  name: feature.name,
  version: feature.version,
  description,
  engine: { min: feature.minEngineVersion, maxExclusive: feature.maxEngineExclusive },
  kind: feature.kind,
  entrypoints: { agents: "agents.json", server: "server.mjs", client: "client.js" },
  ...(feature.contributions ? { contributions: feature.contributions } : {}),
  files: payloads.map(({ name, data }) => ({ path: name, sha256: sha256(data), bytes: data.byteLength })),
  permissions: feature.permissions,
  restartRequired: true,
};
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(join(packageRoot, "manifest.json"), manifestBytes);
await writeEnglishPackageLocale(packageRoot, manifest, agents);
await mkdir(join(root, "artifacts"), { recursive: true });
const archive = createDeterministicZip([{ name: "manifest.json", data: manifestBytes }, ...payloads]);
const archivePath = join(root, "artifacts", `villages-${feature.version}.zip`);
await writeFile(archivePath, archive);
await mkdir(join(root, ".build-tmp"), { recursive: true });
await writeFile(
  join(root, ".build-tmp/package-build.json"),
  `${JSON.stringify({ version: feature.version, archivePath, sha256: sha256(archive), serverInputs: Object.keys(server.metafile.inputs).sort() }, null, 2)}\n`,
);
console.log(`Built Villages ${feature.version}; archive SHA-256 ${sha256(archive)}`);
