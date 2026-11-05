import assert from "node:assert/strict";
import { build } from "../scripts/esbuild.mjs";
import { chromium, expect, withBrowser, fulfill } from "./fixtures/browser-diagnostics.mjs";
import { mapImage } from "./fixtures/villages-scene-browser.fixture.mjs";

const bundle = await build({
  stdin: {
    contents: `
    import { createRoot } from 'react-dom/client';
    import { useLayoutEffect, useState } from 'react';
    import { MapStage } from './packages/villages/src/client/features/exploration/MapStage.js';
    import { useVillageLighting } from './packages/villages/src/client/shared/useVillageLighting.js';
    import { venuePictureOf } from './packages/villages/src/client/shared/presentation.js';
    function VillageMap({clock}) {
      const lighting=useVillageLighting(clock, clock.paused);
      useLayoutEffect(() => {
        const map=document.querySelector('[data-lighting]');
        (window.initialLighting??=[]).push({ phase:map.dataset.lighting, filter:map.querySelector('img').style.filter });
      }, []);
      const image=venuePictureOf([{ id:'hall', zones:[{id:'exterior',image:{url:'day'},nightImage:{url:'night'}}]}], {placeId:'hall',zoneId:'exterior',lighting:lighting==='night'?'night':'day'});
      return <><output id='scene'>{image}</output><MapStage lighting={lighting} src={window.mapImage} alt='Village map' pins={[]} placing={false} view={{fit:'contain',zoom:1,x:0,y:0}} shape={null} /></>;
    }
    function Harness() {
      const [clock, setClock] = useState({ instant:'2026-11-05T03:59:59Z', timeZone:'America/Los_Angeles', paused:false });
      const [visible,setVisible]=useState(true);
      window.setVillageClock=setClock;
      window.setMapVisible=setVisible;
      return visible ? <VillageMap clock={clock}/> : <div>Menu</div>;
    }
    createRoot(document.getElementById('root')).render(<Harness/>);
  `,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1366, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId: "Asia/Tokyo" });
    await page.clock.install({ time: new Date("2030-01-01T12:00:00Z") });
    await page.route("http://lighting.test/", (route) =>
      fulfill(route, {
        contentType: "text/html",
        body: '<style>html,body,#root{height:100%;margin:0}</style><div id="root"></div>',
      }),
    );
    await page.goto("http://lighting.test/");
    await page.evaluate((value) => {
      window.mapImage = value;
    }, mapImage);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const map = page.locator("[data-lighting]");
    await expect(map).toHaveAttribute("data-lighting", "evening");
    assert.equal(
      await page.evaluate(() => window.initialLighting[0].phase),
      "evening",
      "the initial map commit already uses Village lighting",
    );
    await expect(page.locator("#scene")).toHaveText("day");
    await page.clock.fastForward(2000);
    await expect(map).toHaveAttribute("data-lighting", "night");
    await expect(page.locator("#scene")).toHaveText("night");
    await page.evaluate(() =>
      window.setVillageClock({ instant: "2026-11-05T03:59:59Z", timeZone: "America/Los_Angeles", paused: true }),
    );
    await expect(map).toHaveAttribute("data-lighting", "evening");
    await page.clock.fastForward(60_000);
    await expect(map).toHaveAttribute("data-lighting", "evening");
    await page.evaluate(() =>
      window.setVillageClock({ instant: "2026-11-05T04:00:00Z", timeZone: "Asia/Tokyo", paused: false }),
    );
    await expect(map).toHaveAttribute("data-lighting", "day");
    assert.equal(await page.locator("img").evaluate((image) => image.style.filter), "none");
    await page.evaluate(() => window.setMapVisible(false));
    await expect(map).toHaveCount(0);
    await page.evaluate(() =>
      window.setVillageClock({ instant: "2026-11-05T04:00:00Z", timeZone: "America/Los_Angeles", paused: true }),
    );
    for (let visit = 0; visit < 2; visit++) {
      await page.evaluate(() => window.setMapVisible(true));
      await expect(map).toHaveAttribute("data-lighting", "night");
      const initial = await page.evaluate(() => window.initialLighting.at(-1));
      assert.equal(initial.phase, "night", "returning from a menu never commits a daytime map");
      assert.equal(initial.filter, await page.locator("img").evaluate((image) => image.style.filter));
      assert.equal(
        await page.locator("img").evaluate((image) => image.getAnimations().length),
        0,
        "menu return does not animate a transition from daylight",
      );
      await page.evaluate(() => window.setMapVisible(false));
      await expect(map).toHaveCount(0);
    }
    await page.close();
  }
});
console.log(
  "Village lighting: server time, timezone, boundary switching and paused clocks passed on desktop and phone.",
);
