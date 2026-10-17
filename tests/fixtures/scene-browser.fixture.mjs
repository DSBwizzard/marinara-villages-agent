import { build } from "esbuild";
export async function sceneFixture() {
  const result = await build({
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    minify: true,
    entryPoints: ["tests/fixtures/scene-entry.tsx"],
  });
  return result.outputFiles[0].text;
}
