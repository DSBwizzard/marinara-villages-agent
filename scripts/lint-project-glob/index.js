import { globSync as findPaths, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { Minimatch } from "minimatch";

// typescript-estree uses these two exports to resolve parserOptions.project.
export const isDynamicPattern = (pattern) =>
  new Minimatch(pattern, { magicalBraces: true, windowsPathsNoEscape: process.platform === "win32" }).hasMagic();

export const globSync = (pattern, { cwd, ignore }) =>
  findPaths(pattern, { cwd, exclude: ignore, withFileTypes: true })
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((path) => statSync(resolve(cwd, path), { throwIfNoEntry: false })?.isFile());
