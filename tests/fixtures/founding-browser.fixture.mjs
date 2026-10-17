import { build } from "esbuild";
export async function foundingFixture() {
  const result = await build({
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    minify: true,
    entryPoints: ["tests/fixtures/founding-entry.tsx"],
  });
  return result.outputFiles[0].text;
}
