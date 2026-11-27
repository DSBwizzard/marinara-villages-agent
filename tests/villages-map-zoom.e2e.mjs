// Test cases: maps/zoom-stability
import assert from "node:assert/strict";
import sharp from "sharp";
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
exploration navigationSlider navigationView={view} onNavigationView={setView} lighting={lighting}/>;}
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
        const slider = page.getByRole("slider", { name: "Map zoom", exact: true });
        await expect(stage).toHaveAttribute("data-picture-width", /\d/);
        for (const action of ["20", "40", "30", "0", "50", "30"]) {
          await slider.fill(action);
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
        const bounds = await stage.boundingBox();
        const control = await slider.boundingBox();
        assert.equal(control.x + control.width, bounds.x + bounds.width - 16);
        assert.equal(control.y + control.height, bounds.y + bounds.height - 16);
        if (width === 1366 && animatedAccent) {
          await page.addStyleTag({
            content:
              'input[type="range"]::-webkit-slider-thumb{width:15px;height:15px;background:#f5f5f7;border-radius:9999px}',
          });
          await slider.fill("45");
          const { data, info } = await sharp(await slider.screenshot())
            .removeAlpha()
            .raw()
            .toBuffer({
              resolveWithObject: true,
            });
          let handleRows = 0;
          for (let y = Math.floor(info.height / 3); y < (2 * info.height) / 3; y++) {
            let handlePixels = 0;
            for (let x = 0; x < info.width; x++) {
              const i = (y * info.width + x) * info.channels;
              if (data[i] === 197 && data[i + 1] === 170 && data[i + 2] === 255) handlePixels++;
            }
            if (handlePixels >= 20) handleRows++;
          }
          assert.ok(handleRows >= 5, "The rectangular handle remains visible over Engine range styles");
        }
        await slider.press("Home");
        await expect(slider).toHaveAttribute("aria-valuetext", "Full map");
        await expect(stage).toHaveAttribute("data-navigation-zoom", "1");
        const fit = await image.boundingBox();
        assert.ok(fit.width <= bounds.width + 0.5 && fit.height <= bounds.height + 0.5);
        if (width === 1366 && !animatedAccent) {
          const x = control.x + control.width / 2;
          const y = control.y + control.height / 2;
          await page.mouse.click(x, y);
          await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(35);
          const beforeSliderDrag = Number(await slider.inputValue());
          await page.mouse.move(x, y);
          await page.mouse.down();
          await page.mouse.move(x, y - 28, { steps: 4 });
          await page.mouse.up();
          await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(beforeSliderDrag);

          const point = { x: bounds.x + bounds.width / 2 - 90, y: bounds.y + bounds.height / 2 - 50 };
          await page.mouse.move(point.x, point.y);
          const beforePan = await image.boundingBox();
          const zoomBeforePan = await stage.getAttribute("data-navigation-zoom");
          await page.mouse.wheel(35, 45);
          await expect.poll(async () => (await image.boundingBox()).x).toBeCloseTo(beforePan.x - 35, 0);
          await expect.poll(async () => (await image.boundingBox()).y).toBeCloseTo(beforePan.y - 45, 0);
          await expect(stage).toHaveAttribute("data-navigation-zoom", zoomBeforePan);

          const beforePinch = await image.boundingBox();
          const sliderBeforePinch = Number(await slider.inputValue());
          const cdp = await page.context().newCDPSession(page);
          await cdp.send("Input.synthesizePinchGesture", {
            ...point,
            scaleFactor: 1.25,
            gestureSourceType: "mouse",
          });
          await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(sliderBeforePinch);
          const afterPinch = await image.boundingBox();
          assert.ok(afterPinch.width > beforePinch.width);
          assert.ok(
            Math.abs((point.x - afterPinch.x) / afterPinch.width - (point.x - beforePinch.x) / beforePinch.width) <
              0.002,
          );
          assert.ok(
            Math.abs((point.y - afterPinch.y) / afterPinch.height - (point.y - beforePinch.y) / beforePinch.height) <
              0.002,
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
