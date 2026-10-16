/** Keep complete browser validation on the primary OS; broaden portability when its inputs change. */
export function fullPlatformValidation(paths, { release = false } = {}) {
  return release || paths.some(platformSensitive);
}
export const platformTests = [
  "tests/villages-test-scheduler.regression.mjs",
  "tests/villages-pipeline.regression.mjs",
  "tests/villages-checkout-operation.regression.mjs",
  "tests/villages-package-verifier.regression.mjs",
];
import { platformSensitive } from "./change-scope.mjs";
import { isDocumentation } from "./change-scope.mjs";
export function pipelineOnlyChanges(paths) {
  return (
    paths.length > 0 &&
    paths.every(
      (path) =>
        isDocumentation(path) ||
        path === ".github/workflows/ci.yml" ||
        /^scripts\/ci-(?:validation|reuse|policy|evidence)\.mjs$/.test(path) ||
        path === "scripts/release.mjs" ||
        /^tests\/fixtures\/(?:release-driver|ci-validation)\.mjs$/.test(path) ||
        /^scripts\/(?:select-tests|test-dependencies)\.mjs$/.test(path) ||
        path === "tests/villages-pipeline.regression.mjs",
    )
  );
}
import { selectAffectedTests } from "./select-tests.mjs";
export function ciTestPlan(
  paths,
  inventory,
  consumers = new Map(),
  { release = false, forceFull = false, secondary = false } = {},
) {
  const available = inventory.filter((test) => test.group !== "engine");
  const documentationOnly = !forceFull && paths.every(isDocumentation);
  const pipelineOnly = !forceFull && !documentationOnly && pipelineOnlyChanges(paths);
  let tests = documentationOnly
    ? []
    : pipelineOnly
      ? available.filter((test) => platformTests.includes(test.path)).map((test) => test.path)
      : selectAffectedTests(paths, available, consumers);
  const unknown =
    !documentationOnly &&
    (!tests.length ||
      tests.length === available.length ||
      paths.some((path) => !isDocumentation(path) && !selectAffectedTests([path], available, consumers).length));
  const full =
    forceFull || (!documentationOnly && !pipelineOnly && (release || paths.some(platformSensitive) || unknown));
  if (full) tests = available.map((test) => test.path);
  else if (secondary && !documentationOnly) {
    const changedTests = paths.filter((path) => available.some((test) => test.path === path));
    tests = available
      .filter((test) => platformTests.includes(test.path) || changedTests.includes(test.path))
      .map((test) => test.path);
  }
  return {
    full,
    documentationOnly,
    pipelineOnly,
    tests,
    browser: available.some((test) => tests.includes(test.path) && test.group === "browser"),
    reason: documentationOnly
      ? "documentation"
      : pipelineOnly
        ? "pipeline"
        : release || forceFull
          ? "explicit integration/release"
          : full
            ? "broad or unknown impact"
            : secondary
              ? "portability and changed tests"
              : "affected owners/consumers",
  };
}
export const needsBrowserPreparation = ({ full, browser = full, reused, prepared }) =>
  browser && !reused && prepared !== "true";
