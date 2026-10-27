import { build } from "../../scripts/esbuild.mjs";
import { mockEngineLookups, fulfill } from "./browser-diagnostics.mjs";
import { snapshot as base } from "./villages-scene-browser.fixture.mjs";
const source = `
import {createRoot} from "react-dom/client";
import {useState} from "react";
import {ProjectsPanel} from "./packages/villages/src/client/features/projects/ProjectsPanel.js";
import {useProjectsController} from "./packages/villages/src/client/features/projects/useProjectsController.js";
import {syncVillagesStyles} from "./packages/villages/src/client/entry/styles.js";
syncVillagesStyles();
function Harness(){
 const [snapshot,setSnapshot]=useState(window.initialSnapshot);
 const controller=useProjectsController({snapshot,onSnapshot:setSnapshot,focusProjectId:"",focusProjectRequest:0});
 window.projectsHarness={replace:setSnapshot,unmount:()=>root.unmount()};
 return <div className="marinara-capability-villages-root marinara-capability-villages-project-root"><ProjectsPanel snapshot={snapshot} controller={controller} room={null} mobile={innerWidth<700} siteProjectId=""
  debugEnabled onReturn={()=>{}} onMap={()=>{}} onVenue={id=>window.lastVisit=id}
  onPeople={()=>window.peopleOpened=true} onPlaceOnMap={id=>window.lastPlacement=id}/></div>;
}
const root=createRoot(document.getElementById("root"));root.render(<Harness/>);
`;
let bundle;
export function currentProject(id, kind = "new-venue") {
  return {
    id,
    kind,
    title: id === "canvas" ? "Canvas Tent" : "Workshop",
    venueId: kind === "renovation" ? "mill" : "",
    status: "planning",
    progress: 0,
    participantIds: [],
    updatedAt: "2026-10-23T12:00:00Z",
    ...(kind === "new-venue"
      ? {
          venueDraft: {
            name: "Canvas Tent",
            description: "A shared art pavilion.",
            classes: ["community"],
            position: { x: 0.7, y: 0.7 },
          },
          plan: {
            form: "A canvas pavilion",
            exteriorDescription: "An open approach.",
            exteriorImage: null,
            capacity: 2,
            layoutVersion: 1,
            layout: "common",
            spaces: [
              {
                id: "art",
                name: "Art room",
                description: "A bright shared room.",
                venueClass: "community",
                connectedTo: ["exterior"],
              },
            ],
            privateSpaces: [],
          },
        }
      : {}),
    lifecycle: {
      revision: 1,
      phase: "planning",
      targetVenueId: kind === "renovation" ? "mill" : "",
      change:
        kind === "renovation"
          ? {
              classes: ["community", "workplace"],
              capacity: 3,
              detail: "Create a bright workshop.",
              zones: [
                {
                  id: "work",
                  name: "Work room",
                  kind: "public",
                  venueClass: "workplace",
                  description: "A new workbench room.",
                  connectedTo: ["exterior"],
                },
              ],
            }
          : null,
      affectedIds: [],
      approvals: [],
      candidates: [{ residentId: "mara" }],
      builderId: "mara",
      workOrder: null,
      blockedReason: "",
      completedAt: "",
    },
  };
}
export function projectSnapshot() {
  const snapshot = structuredClone(base);
  delete snapshot.opening;
  snapshot.projects = [currentProject("canvas"), currentProject("workshop", "renovation")];
  const venue = snapshot.settings.venues[0];
  venue.classes = ["workplace"];
  venue.residenceCapacity = 2;
  venue.layoutVersion = 1;
  venue.zones = [
    {
      id: "exterior",
      name: "Entrance",
      kind: "exterior",
      venueClass: "workplace",
      description: "An approach.",
      seen: true,
      connectedTo: ["work"],
    },
    {
      id: "work",
      name: "Work room",
      kind: "public",
      venueClass: "workplace",
      description: "A workbench room.",
      seen: true,
      connectedTo: ["exterior"],
    },
  ];
  venue.spaces = [venue.zones[1]];
  venue.privateSpaces = [];
  return snapshot;
}
export async function openProjectPage(browser, width, snapshot = projectSnapshot(), mutate) {
  bundle ??= await build({
    stdin: { contents: source, resolveDir: process.cwd(), loader: "tsx" },
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
  });
  const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 700 });
  await mockEngineLookups(page);
  const calls = [];
  await page.route("http://projects.test/", (route) =>
    fulfill(route, {
      status: 200,
      contentType: "text/html",
      body: '<style>:root{font-size:18px;--background:#171b25;--foreground:#f4f0e8;--popover:#252b38;--border:#78859a;--primary:#a7c7ff;--muted-foreground:#c4cbd7}html,body{height:100%;margin:0;background:#101a30;color:#f4f0e8;font-family:Arial}marinara-capability-villages{display:block;height:100%}#root{height:100%}</style><marinara-capability-villages><div id="root"></div></marinara-capability-villages>',
    }),
  );
  await page.route("**/api/villages/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^.*\/api\/villages/, ""),
      body = route.request().postDataJSON();
    calls.push({ path, body });
    if (mutate) await mutate(path, body, snapshot, route);
    await fulfill(route, { status: 200, contentType: "application/json", body: JSON.stringify(snapshot) });
  });
  await page.goto("http://projects.test/");
  await page.evaluate((value) => (window.initialSnapshot = value), snapshot);
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  return {
    page,
    calls,
    snapshot,
    update: async () => page.evaluate((value) => window.projectsHarness.replace(value), structuredClone(snapshot)),
  };
}
