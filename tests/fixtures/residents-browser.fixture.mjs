import { build } from "esbuild";
export async function residentsFixture() {
  const result = await build({
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    minify: true,
    entryPoints: ["tests/fixtures/residents-entry.tsx"],
  });
  return result.outputFiles[0].text;
}
