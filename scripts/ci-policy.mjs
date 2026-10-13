/** Keep complete browser validation on the primary OS; broaden portability when its inputs change. */
export function fullPlatformValidation(paths, { release = false } = {}) {
  return (
    release ||
    paths.some((path) => /^(scripts\/|sources\/|\.github\/|package(?:-lock)?\.json$|engine-boundary\.json$)/.test(path))
  );
}
export const platformTests = [
  "tests/villages-test-scheduler.regression.mjs",
  "tests/villages-pipeline.regression.mjs",
  "tests/villages-checkout-operation.regression.mjs",
  "tests/villages-package-verifier.regression.mjs",
];
