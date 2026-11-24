// Test cases: maps/zoom-stability
import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { chromium, expect, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const bundle = await build({
  stdin: {
    resolveDir: process.cwd(),
    loader: "tsx",
    contents: `import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
import {MapStage,defaultView} from './packages/villages/src/client/features/exploration/MapStage.js';
syncVillagesStyles();
function Harness(){const [view,setView]=useState(null),[lighting,setLighting]=useState('day');
window.setLighting=setLighting;
return <MapStage src={window.mapImage} alt="Map" pins={[]} placing={false} view={defaultView('contain')}
shape={{width:1376,height:768}} compact={false} fitToRoom={false} mobile={window.phone}
exploration navigationFit="contain" navigationControlsOnMobile navigationView={view} onNavigationView={setView} lighting={lighting}/>;}
createRoot(document.getElementById('root')).render(<Harness/>);`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await runCase("maps/zoom-stability", () =>
  withBrowser(browser, async () => {
    for (const width of [1366, 390]) {
      for (const animatedAccent of [false, true]) {
        const page = await browser.newPage({ viewport: { width, height: 800 }, hasTouch: width < 600 });
        await page.setContent(`<style>html,body{margin:0}marinara-capability-villages,#root{display:block;height:600px}
/* Engine 61ec07274ac0, globals.css: animated accent override installed on 8500. */
html[data-marinara-accent-animation] *,html[data-marinara-accent-animation] *::before,html[data-marinara-accent-animation] *::after {
transition-property:opacity,transform,translate,scale,rotate,width,height,max-width,max-height,grid-template-rows!important;
}</style><marinara-capability-villages><div id="root"></div></marinara-capability-villages>`);
        await page.evaluate(
          ({ image, phone, animated }) => {
            window.mapImage = image;
            window.phone = phone;
            document.documentElement.toggleAttribute("data-marinara-accent-animation", animated);
          },
          { image: mapImage, phone: width < 600, animated: animatedAccent },
        );
        await page.addScriptTag({ content: bundle.outputFiles[0].text });
        const stage = page.locator("[data-navigation-zoom]");
        const image = page.getByRole("img", { name: "Map", exact: true });
        await expect(stage).toHaveAttribute("data-picture-width", /\d/);
        for (const action of ["Zoom in", "Zoom in", "Zoom out", "Reset map view", "Zoom in", "Zoom out"]) {
          await page.getByRole("button", { name: action, exact: true }).click();
          const result = await stage.evaluate(async (element) => {
            const image = element.querySelector("img");
            const samples = [];
            for (let frame = 0; frame < 20; frame++) {
              await new Promise(requestAnimationFrame);
              const box = image.getBoundingClientRect();
              samples.push({ width: box.width, height: box.height, x: box.x, y: box.y });
            }
            return {
              samples,
              width: Number(element.dataset.pictureWidth),
              height: Number(element.dataset.pictureHeight),
              animations: image.getAnimations().map((animation) => animation.transitionProperty),
            };
          });
          for (const dimension of ["width", "height"]) {
            assert.ok(
              result.samples.every((sample) => Math.abs(sample[dimension] - result[dimension]) < 0.5),
              `${action}: ${dimension} reaches its target immediately, width=${width}, accent=${animatedAccent}`,
            );
          }
          for (const dimension of ["width", "height", "x", "y"]) {
            const values = result.samples.map((sample) => sample[dimension]);
            assert.ok(
              Math.max(...values) - Math.min(...values) < 0.5,
              `${action}: ${dimension} never flows after zoom, width=${width}, accent=${animatedAccent}`,
            );
          }
          assert.ok(
            result.animations.every((property) => property === "filter"),
            "Only lighting may animate the map image",
          );
        }
        await page.evaluate(() => window.setLighting("night"));
        await expect(stage).toHaveAttribute("data-lighting", "night");
        assert.equal(await image.evaluate((node) => getComputedStyle(node).transitionProperty), "filter");
        assert.ok(
          await image.evaluate((node) =>
            node.getAnimations().some((animation) => animation.transitionProperty === "filter"),
          ),
          "Lighting retains its intended transition",
        );
        await page.close();
      }
    }
  }),
);
