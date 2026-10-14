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
export const needsBrowserPreparation = ({ full, reused, prepared }) => full && !reused && prepared !== "true";
