import { execFileSync } from "node:child_process";
import { platformSensitive } from "./change-scope.mjs";

export function validationProfile(environment = process.env) {
  return environment.GITHUB_BASE_REF === "main" ||
    environment.GITHUB_REF === "refs/heads/main" ||
    environment.VILLAGES_CI_MODE === "full"
    ? "qualification"
    : "staging";
}

export function candidateChanges(root, environment = process.env) {
  const base = environment.VILLAGES_CI_BASE;
  if (!/^[a-f0-9]{40}$/.test(base ?? "")) return null;
  try {
    return execFileSync("git", ["diff", "--name-only", "-z", base, "HEAD", "--"], { cwd: root, encoding: "utf8" })
      .split("\0")
      .filter(Boolean);
  } catch {
    return null;
  } // Unknown integration history broadens Windows coverage.
}

export function platformSpecs(blueprint, platform) {
  const profile = blueprint.validationProfile ?? "qualification";
  if (!["staging", "qualification"].includes(profile)) throw Error("Unknown validation profile");
  const changes = blueprint.changedPaths;
  const broad =
    profile === "qualification" ||
    !Array.isArray(changes) ||
    changes.some(
      (path) =>
        platformSensitive(path) ||
        /^(?:package(?:-lock)?\.json$|\.github\/|scripts\/(?:ci-|check-inputs|validation-inputs|run-tests|test-|checkout-operation)|tests\/fixtures\/|packages\/villages\/src\/client\/entry\/styles\.tsx$)/.test(
          path,
        ),
    );
  if (platform !== "win32" || broad) return blueprint.specs;
  const deferred = new Set(blueprint.platformPolicy?.deferredWindowsBrowserSuites ?? []);
  return blueprint.specs.filter(
    (spec) =>
      spec.kind !== "test" || spec.group !== "browser" || !deferred.has(spec.path) || changes.includes(spec.path),
  );
}

export function requireValidationProfile(actual, required = "qualification") {
  if (!["staging", "qualification"].includes(required) || !["staging", "qualification"].includes(actual))
    throw Error("Unknown validation profile");
  if (required === "qualification" && actual !== "qualification")
    throw Error("Release requires full Linux/Windows qualification; staging coverage is insufficient");
}
