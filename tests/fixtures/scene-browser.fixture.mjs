import { build } from "../../scripts/esbuild.mjs";
let playbackFixtures;
export async function scenePlaybackFixtures() {
  if (!playbackFixtures)
    playbackFixtures = (async () => {
      const result = await build({
        bundle: true,
        write: false,
        platform: "node",
        format: "esm",
        entryPoints: ["tests/helpers/scene-playback.fixture.ts"],
      });
      return import("data:text/javascript;base64," + Buffer.from(result.outputFiles[0].text).toString("base64"));
    })();
  return playbackFixtures;
}
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
