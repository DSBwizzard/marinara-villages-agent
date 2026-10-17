import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { checkInputGraph, definitionBehavior } from "./check-inputs.mjs";
import { validationInputs } from "./validation-inputs.mjs";
import { testInventory } from "./test-inventory.mjs";
import { platformSpecs } from "./ci-validation-profile.mjs";

export const fingerprint = (value) =>
  createHash("sha256")
    .update(typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value))
    .digest("hex");
export const supportedPlatforms = ["linux", "win32"];
export const staticScripts = ["format:check", "lint", "typecheck", "check:engine-types", "check:architecture"];
export function policyKey(snapshot) {
  return fingerprint(
    snapshot.inputs.filter(
      (input) =>
        /^scripts\/(?:ci-[^/]+|change-scope|check-inputs|validation-inputs)\.(?:mjs|json)$/.test(input.path) ||
        input.path === ".github/workflows/ci.yml",
    ),
  );
}

export async function checkBlueprint(
  root = process.cwd(),
  { snapshot, inventory, validationProfile = "qualification", changedPaths = null } = {},
) {
  snapshot ??= await validationInputs(root);
  inventory ??= (await testInventory(pathToFileURL(resolve(root) + "/"))).filter((test) => test.group !== "engine");
  const catalog = new Map(snapshot.inputs.map((input) => [input.path, input.sha256]));
  const paths = [...catalog.keys()];
  const common = paths.filter((path) => /^(package(?:-lock)?\.json$|tsconfig\.|\.npmrc$|\.gitattributes$)/.test(path));
  const harness = paths.filter((path) =>
    /^scripts\/(?:run-tests|test-(?:scheduler|costs|inventory|resources|cases)|checkout-operation|check-inputs|ci-checks)\.mjs$/.test(
      path,
    ),
  );
  const scripts = paths.filter((path) => /^scripts\//.test(path));
  const engine = paths.filter((path) =>
    /^(sources\/engine-public\/|sources\/package-shared\.ts|packages\/villages\/engine-boundary\.json)/.test(path),
  );
  const maintained = paths.filter((path) =>
    /^(packages\/.*\/src\/|sources\/|scripts\/|tests\/|\.prettier|eslint\.|tsconfig\.|packages\/villages\/[^/]+\.mjs)/.test(
      path,
    ),
  );
  const graph = await checkInputGraph(
    [...inventory.map((test) => test.path), "scripts/build-villages.mjs"].filter((path) => catalog.has(path)),
    snapshot.inputs,
    root,
  );
  const specs = [];
  const add = (id, kind, inputs, extra = {}) =>
    specs.push({ id, kind, inputs: [...new Set([...common, ...inputs])].sort(), ...extra });
  for (const script of staticScripts) {
    const inputs =
      script === "check:engine-types"
        ? [...engine, ...scripts]
        : script === "typecheck"
          ? paths.filter((path) => /^(packages\/.*\/src\/|sources\/|tsconfig\.)/.test(path))
          : script === "check:architecture"
            ? [...paths.filter((path) => /^packages\/.*\/src\//.test(path)), ...scripts]
            : maintained;
    add("static:" + script, "static", inputs, { script });
  }
  const buildGraph = graph.get("scripts/build-villages.mjs");
  const buildInputs = buildGraph?.resolved ?? paths.filter((path) => !path.startsWith("tests/"));
  // Builders read their entry definitions/assets dynamically. Actual package source/assets are conservative build inputs.
  const packageInputs = paths.filter((path) => /^(packages\/|sources\/)/.test(path));
  add("build", "build", [
    ...buildInputs,
    ...packageInputs,
    ...scripts.filter((path) => /build-|deterministic-|package-|catalog-package/.test(path)),
  ]);
  add("package", "package", [
    ...specs.find((spec) => spec.id === "build").inputs,
    ...scripts.filter((path) => /verify-package|package-/.test(path)),
  ]);
  add("reproducibility", "reproducibility", [
    ...specs.find((spec) => spec.id === "build").inputs,
    "scripts/verify-build.mjs",
  ]);
  for (const test of inventory) {
    const dependencies = graph.get(test.path);
    let inputs = [...harness, ...(dependencies?.inputs ?? paths)];
    if (dependencies?.payload && !dependencies.opaque) {
      // Payload consumers depend on builder behavior, but a version-only manifest edit does not change JS payloads.
      inputs.push(...scripts.filter((path) => /build-|deterministic-|package-|catalog-package/.test(path)));
      if (!inputs.includes("packages/villages/package-definition.mjs")) inputs.push("$definition-behavior");
    }
    add("test:" + test.path, "test", inputs, {
      path: test.path,
      group: test.group,
      opaque: dependencies?.opaque ?? true,
      reasons: dependencies?.reasons ?? ["unresolved dependency graph"],
      scopeDigest: fingerprint(dependencies?.declarations ?? []),
    });
  }
  const definition = await readFile(resolve(root, "packages/villages/package-definition.mjs"), "utf8").catch(() => "");
  catalog.set("$definition-behavior", fingerprint(definitionBehavior(definition)));
  const policyDigest = policyKey(snapshot);
  const toolchain = JSON.parse(await readFile(resolve(root, "scripts/ci-toolchain.json"), "utf8"));
  const platformPolicy = JSON.parse(
    await readFile(resolve(root, "scripts/ci-platform-policy.json"), "utf8").catch((error) => {
      if (error.code === "ENOENT") return "{}";
      throw error;
    }),
  );
  return {
    schemaVersion: 1,
    inputDigest: snapshot.digest,
    catalog: [...catalog],
    policyDigest,
    specs,
    toolchain,
    validationProfile,
    changedPaths,
    platformPolicy,
  };
}

export function checkKeys(blueprint, environment) {
  if (
    !supportedPlatforms.includes(environment.platform) ||
    environment.node !== "v" + blueprint.toolchain.node ||
    environment.arch !== blueprint.toolchain.arch ||
    environment.runner !== blueprint.toolchain.runners[environment.platform]
  )
    throw Error("Incompatible validation toolchain/platform");
  const catalog = new Map(blueprint.catalog);
  return platformSpecs(blueprint, environment.platform).map((spec) => ({
    ...spec,
    key: fingerprint({
      schema: 3,
      policy: blueprint.policyDigest,
      id: spec.id,
      scopeDigest: spec.scopeDigest,
      environment,
      inputs: spec.inputs.map((path) => [path, catalog.get(path) ?? "missing"]),
    }),
  }));
}

export function assembleChecks(specs, proofs, { fresh = false } = {}) {
  const matches = new Map();
  if (!fresh)
    for (const proof of proofs) {
      if (proof.passed === true && proof.code === 0 && !proof.skipped && !proof.signal && !matches.has(proof.id)) {
        const spec = specs.find((spec) => spec.id === proof.id);
        if (spec && spec.key === proof.key) matches.set(proof.id, proof);
      }
    }
  return {
    reused: [...matches.values()],
    pending: specs.filter((spec) => !matches.has(spec.id)),
    required: specs.map((spec) => spec.id),
  };
}

export function assertCoverage(receipt, blueprint) {
  if ((receipt.validationProfile ?? "qualification") !== (blueprint.validationProfile ?? "qualification"))
    throw Error("Coverage validation profile does not match");
  if (
    receipt.schemaVersion !== 3 ||
    receipt.policyDigest !== blueprint.policyDigest ||
    receipt.inputsUnchanged !== true ||
    receipt.inputDigest !== blueprint.inputDigest
  )
    throw Error("Coverage policy or source snapshot does not match");
  const specs = checkKeys(blueprint, receipt.environment);
  for (const proof of receipt.checks) {
    assertProofOrigin(proof, receipt.environment);
    if (
      proof.executed &&
      (receipt.executor.platform !== receipt.environment.platform || receipt.executor.node !== receipt.environment.node)
    )
      throw Error("Evidence executed on the wrong platform/toolchain");
  }
  const result = assembleChecks(specs, receipt.checks);
  if (result.pending.length || receipt.coverageComplete !== true)
    throw Error("Incomplete candidate coverage: " + result.pending.map((spec) => spec.id).join(", "));
  return result;
}

export function assertProofOrigin(proof, environment) {
  const origin = proof.origin;
  if (
    !origin ||
    !/^[1-9]\d*$/.test(String(origin.runId)) ||
    !Number.isSafeInteger(origin.attempt) ||
    origin.attempt < 1 ||
    ![
      environment.platform === "linux" ? "validate" : "validate-windows",
      `browser-${environment.platform}-1`,
      `browser-${environment.platform}-2`,
    ].includes(origin.job) ||
    !/^[a-f0-9]{40}$/.test(origin.sourceRevision ?? "") ||
    origin.platform !== environment.platform ||
    origin.node !== environment.node ||
    origin.environmentDigest !== fingerprint(environment)
  )
    throw Error("Invalid check execution origin");
}

export function environmentFor(toolchain, platform = process.platform, variables = process.env) {
  return {
    platform,
    node: "v" + toolchain.node,
    arch: toolchain.arch,
    runner: toolchain.runners[platform],
    image: variables.ImageVersion ?? variables.IMAGE_VERSION ?? "local",
  };
}
