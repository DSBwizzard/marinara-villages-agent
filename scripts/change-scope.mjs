export const isDocumentation = (path) =>
  /(?:^|\/)(?:README|AGENTS(?:\.override)?|DEVELOPMENT|CHANGELOG)\.(?:md|txt|rst)$/i.test(path) ||
  /(?:^|\/)(?:LICENSE|LICENCE|COPYING|NOTICE)(?:\.(?:md|txt))?$/i.test(path) ||
  /^docs\/.*\.(?:md|txt)$/.test(path);
export const isEngineBoundary = (path) =>
  path === "packages/villages/engine-boundary.json" ||
  path === "engine-boundary.json" ||
  path.startsWith("sources/engine-public/");
export const platformSensitive = (path) =>
  path === "scripts/unknown-base" ||
  /^(sources\/|package(?:-lock)?\.json$|\.github\/workflows\/)/.test(path) ||
  isEngineBoundary(path) ||
  /^scripts\/(?:build-|verify-|package-|deterministic-|zip-|run-tests|test-scheduler|test-resources|test-cases|checkout-operation|check-architecture|ci-)/.test(
    path,
  );
