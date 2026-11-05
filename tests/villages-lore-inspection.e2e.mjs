// Test cases: lore/inspection
import assert from "node:assert/strict";
import { chromium, fulfill, withBrowser } from "./fixtures/browser-diagnostics.mjs";
import { expect } from "./fixtures/fast-browser-expect.mjs";
import { build } from "../scripts/esbuild.mjs";
import { runCase } from "../scripts/test-cases.mjs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const bundle = await build({
  stdin: {
    contents: `import {createRoot} from 'react-dom/client';
import {LoreActivity} from './packages/villages/src/client/shared/LoreActivity.js';
import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';
const tag=document.createElement('marinara-capability-villages');tag.style.display="none";document.body.appendChild(tag);syncVillagesStyles();
createRoot(document.getElementById('root')).render(<LoreActivity><main style={{padding:'24px',height:'100%',background:'#10172c',color:'#d8dfed'}}><h2>Forging the Village</h2><p>Setting  People  <b>Venues and Map</b>  Review</p><div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'20px',height:'75%'}}><section style={{border:'1px solid #46516f',borderRadius:'12px',padding:'20px'}}><h3>Starting venues</h3><p>Meridian Consolidated Holdings</p><p>Gidget’s Lube & Loft</p><p>The Glitterdome Atrium</p></section><section style={{border:'1px solid #46516f',borderRadius:'12px',padding:'20px',background:'linear-gradient(140deg,#293f3a,#27304e)'}}><h3>Village map</h3></section></div></main></LoreActivity>);`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const first = "00000000-0000-4000-8000-000000000001",
  second = "00000000-0000-4000-8000-000000000002";
const entry = (id, name, inspectionId, target = "Image") => ({
  id,
  bookId: "world",
  bookName: "World of Othiras",
  name,
  targets: [target],
  inspections: [{ target, id: inspectionId }],
});
const records = [
  {
    id: "map",
    at: "2026-11-05T00:36:00Z",
    purpose: "Map artwork",
    revision: 2,
    entries: [entry("gidget", "Gidget’s Workshop", second), entry("world", "Othiras", second)],
  },
  {
    id: "venues",
    at: "2026-11-05T00:35:00Z",
    purpose: "Starting venues",
    revision: 1,
    entries: [
      entry("gidget", "Gidget’s Workshop", first, "Venue draft"),
      entry("solenne", "Solenne", first, "Venue draft"),
      entry("world", "Othiras", first, "Venue draft"),
    ],
  },
];
const browser = await chromium.launch({ headless: true });
await withBrowser(browser, async () => {
  for (const width of [1440, 390])
    await runCase("lore/inspection/" + width, async () => {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      let scope = "village-a",
        revision = 2,
        pendingList,
        pendingDetail,
        holdList = false,
        holdDetail = false;
      const calls = [];
      await page.route("http://lore-inspection.test/", (route) =>
        fulfill(route, {
          status: 200,
          contentType: "text/html",
          body: '<style>body{margin:0;background:#10172c;font-family:system-ui}#root{height:100vh}</style><div id="root"></div>',
        }),
      );
      await page.route("**/api/villages/**", async (route) => {
        const body =
          route.request().method() === "GET"
            ? { action: new URL(route.request().url()).searchParams.get("activity") }
            : route.request().postDataJSON();
        calls.push(body);
        assert(new URL(route.request().url()).pathname.endsWith("/debug/lore"));
        if (body.action === "summary") return fulfill(route, { status: 200, json: { scope, revision, records: [] } });
        if (body.action === "activity") {
          if (holdList) {
            pendingList = route;
            return;
          }
          return fulfill(route, {
            status: 200,
            json: { scope, revision, records: scope === "village-a" ? records : [] },
          });
        }
        assert(body.inspectionId && body.entryId && body.bookId);
        if (holdDetail) {
          pendingDetail = route;
          return;
        }
        const constant = body.entryId === "world";
        return fulfill(route, {
          status: 200,
          json: {
            at: "2026-11-05T00:36:00Z",
            purpose: "Map artwork",
            requestContext: "An enclosed shopping plaza, with Othiras residents and a shared atrium.",
            trigger: constant
              ? { constant: true, match: "constant", caseSensitive: false, matchWholeWords: false }
              : {
                  constant: false,
                  match: "setting",
                  key: "Gidget",
                  caseSensitive: false,
                  matchWholeWords: false,
                  context: {
                    text: "The selected residents are Ella, Gidget, and Solenne. Their homes share the atrium.",
                    start: 33,
                    end: 39,
                    source: "Setting / generation context",
                  },
                  secondary: { logic: "and_any", matched: 1, total: 4 },
                  secondaryMatches: [
                    { key: "home", text: "Their homes share the atrium.", source: "Setting / generation context" },
                  ],
                },
          },
        });
      });
      await page.goto("http://lore-inspection.test/");
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const launch = page.getByRole("button", { name: "Lore activity · New activity", exact: true });
      await expect(launch).toBeVisible();
      assert(
        calls.every((call) => call.action === "summary"),
        "Closed inspector fetches metadata only",
      );
      await launch.click();
      const dialog = page.getByRole("dialog", { name: "Lore activity", exact: true });
      await expect(dialog).toBeVisible();
      const list = dialog.getByRole("region", { name: "Lore entries" });
      await expect(list.getByRole("button")).toHaveCount(3);
      await expect(dialog.locator("details,select")).toHaveCount(0);
      await list.getByRole("button", { name: /Gidget/ }).click();
      const detail = dialog.getByRole("region", { name: "Lore explanation" });
      await expect(detail).toContainText("“Gidget” matched the generation context.");
      await expect(detail).toContainText("Prompt prepared");
      await expect(detail).toContainText("2026");
      await expect(detail).toContainText("Their homes share the atrium.");
      await expect(detail.locator("mark")).toHaveText("Gidget");
      await expect(detail.getByRole("button", { name: /Map artwork/ })).toBeVisible();
      await expect(detail.getByRole("button", { name: /Starting venues/ })).toBeVisible();
      if (process.env.VILLAGES_SCREENSHOT_DIR) {
        await mkdir(process.env.VILLAGES_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({
          path: resolve(process.env.VILLAGES_SCREENSHOT_DIR, "lore-activity-" + width + ".png"),
          fullPage: true,
        });
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Lore activity", exact: true })).toBeFocused();
      revision = 3;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(launch).toBeVisible();
      holdList = true;
      await launch.click();
      await expect.poll(() => !!pendingList).toBe(true);
      revision = 4;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await fulfill(pendingList, { status: 200, json: { scope: "village-a", revision: 3, records } });
      holdList = false;
      await expect(dialog.getByRole("button", { name: "New activity", exact: true })).toBeVisible();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("villages:lore-seen:village-a")),
        "3",
        "An arrival newer than the displayed revision stays unread",
      );
      await dialog.getByRole("button", { name: "New activity", exact: true }).click();
      await expect(dialog.getByRole("button", { name: "New activity", exact: true })).toHaveCount(0);
      await dialog.getByRole("button", { name: "Starting venues", exact: true }).click();
      await dialog.getByRole("searchbox", { name: "Search Lore entries" }).fill("Othiras");
      await dialog
        .getByRole("region", { name: "Lore entries" })
        .getByRole("button", { name: /Othiras World/ })
        .click();
      await expect(detail).toContainText("Always eligible — no keyword required.");
      await expect(detail).toContainText("Request context");
      if (width === 390) {
        await detail.getByRole("button", { name: "← Entries", exact: true }).click();
        await expect(list).toBeVisible();
      }
      await page.keyboard.press("Escape");
      pendingDetail = undefined;
      holdDetail = true;
      await page.getByRole("button", { name: "Lore activity", exact: true }).click();
      await dialog.getByRole("button", { name: "All", exact: true }).click();
      await dialog
        .getByRole("region", { name: "Lore entries" })
        .getByRole("button", { name: /Gidget/ })
        .click();
      await expect.poll(() => !!pendingDetail).toBe(true);
      await page.keyboard.press("Escape");
      await fulfill(pendingDetail, { status: 200, json: { trigger: null } });
      await expect(dialog).toHaveCount(0);
      holdDetail = false;
      await page.evaluate(() => {
        const get = Storage.prototype.getItem,
          set = Storage.prototype.setItem;
        Storage.prototype.getItem = () => {
          throw Error("Blocked storage");
        };
        Storage.prototype.setItem = () => {
          throw Error("Blocked storage");
        };
        window.restoreLoreStorage = () => {
          Storage.prototype.getItem = get;
          Storage.prototype.setItem = set;
        };
      });
      revision = 5;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(launch).toBeVisible();
      await launch.click();
      await expect(dialog.getByRole("region", { name: "Lore entries" })).toBeVisible();
      await page.keyboard.press("Escape");
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(page.getByRole("button", { name: "Lore activity", exact: true })).toBeVisible();
      await page.evaluate(() => window.restoreLoreStorage());
      pendingDetail = undefined;
      holdDetail = true;
      await page.getByRole("button", { name: "Lore activity", exact: true }).click();
      await expect.poll(() => !!pendingDetail).toBe(true);
      scope = "village-b";
      revision = 0;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await expect(dialog).toHaveCount(0);
      await fulfill(pendingDetail, { status: 200, json: { trigger: null } });
      holdDetail = false;
      await page.getByRole("button", { name: "Lore activity", exact: true }).click();
      await expect(dialog).toContainText("No Lore activity yet");
      await expect(dialog).not.toContainText("Gidget");
      await page.keyboard.press("Escape");
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
      assert(
        calls.every((call) => call.action || call.inspectionId),
        "Inspection never calls a generation endpoint",
      );
      await page.close();
    });
  await runCase("lore/inspection/first-load", async () => {
    const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
    const pendingSummaries = [];
    let listRoute;
    await page.route("http://lore-first.test/", (route) =>
      fulfill(route, {
        status: 200,
        contentType: "text/html",
        body: '<style>body{margin:0}#root{height:100vh}</style><div id="root"></div>',
      }),
    );
    await page.route("**/api/villages/**", (route) => {
      const body =
        route.request().method() === "GET"
          ? { action: new URL(route.request().url()).searchParams.get("activity") }
          : route.request().postDataJSON();
      if (body.action === "summary") pendingSummaries.push(route);
      else if (body.action === "activity") listRoute = route;
      else return fulfill(route, { status: 200, json: { trigger: null } });
    });
    await page.goto("http://lore-first.test/");
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.getByRole("button", { name: "Lore activity", exact: true }).click();
    await expect.poll(() => !!listRoute).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect.poll(() => pendingSummaries.length >= 2).toBe(true);
    for (const route of pendingSummaries)
      await fulfill(route, { status: 200, json: { scope: "first-world", revision: 2, records: [] } });
    await fulfill(listRoute, { status: 200, json: { scope: "first-world", revision: 2, records } });
    await expect(
      page.getByRole("dialog", { name: "Lore activity" }).getByRole("region", { name: "Lore entries" }),
    ).toBeVisible();
    assert.equal(
      await page.evaluate(() => localStorage.getItem("villages:lore-seen:first-world")),
      "2",
      "A slow first list still opens after its metadata establishes the same scope",
    );
    await page.close();
  });
});
