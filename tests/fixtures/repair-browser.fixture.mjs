import assert from "node:assert/strict";

import { build } from "../../scripts/esbuild.mjs";
import { expect, fulfill, mockEngineLookups } from "./browser-diagnostics.mjs";
const code = await build({
  stdin: {
    loader: "tsx",
    resolveDir: process.cwd(),
    contents: `import {syncVillagesStyles} from './packages/villages/src/client/entry/styles.js';syncVillagesStyles();import {createRoot} from 'react-dom/client';import {useRepairController} from './packages/villages/src/client/features/repair/useRepairController.js';import {RepairPage} from './packages/villages/src/client/features/repair/RepairPage.js';function App(){const c=useRepairController(true,async(kind)=>{window.appliedKind=kind;return window.repairRefresh ? await window.repairRefresh : null;});window.c=c;return <RepairPage controller={c} jobs={window.fixtureJobs||[]} onRetryWork={async job=>{window.retryJobs.push(job.id)}} onBack={()=>{window.leftRepair=true}}/>}createRoot(document.getElementById('root')).render(<App/>);`,
  },
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
});
const people = [
  { id: "player", name: "Your Persona" },
  { id: "nora", name: "Nora", hasAgenda: true },
  { id: "ellis", name: "Ellis", hasAgenda: true },
  { id: "guest", name: "Visitor", visitor: true },
  { id: "npc", name: "Shopkeeper", npc: true },
];
const home = {
  id: JSON.stringify(["home", "nora"]),
  topic: "places",
  title: "Nora home assignment",
  summary: "Residence",
  fields: [
    {
      key: "homeId",
      label: "Home",
      type: "choice",
      value: "house",
      options: [
        { value: "", label: "No home" },
        { value: "house", label: "Willow House" },
        { value: "inn", label: "Inn" },
      ],
    },
    {
      key: "sleepZoneId",
      label: "Sleeping Zone",
      type: "choice",
      value: "bedroom",
      dependsOn: "homeId",
      options: [
        { value: "", label: "Choose a sleeping Zone" },
        { value: "bedroom", label: "Bedroom", parent: "house" },
        { value: "upstairs", label: "Upstairs", parent: "inn" },
      ],
    },
  ],
  source: [],
  actions: [{ id: "correct", label: "Modify" }],
  related: [],
  token: "home",
};
const work = {
  ...home,
  id: JSON.stringify(["work", "nora", "house"]),
  topic: "people",
  title: "Work",
  fields: [
    { ...home.fields[0], key: "venueId", label: "Location" },
    { ...home.fields[1], key: "zoneId", label: "Zone", dependsOn: "venueId" },
    { key: "activity", label: "Work", type: "text", multiline: false, value: "Bind books" },
    { key: "inviteGuests", label: "May invite guests", type: "boolean", value: true },
    {
      key: "days",
      label: "Days",
      type: "days",
      value: "Monday,Thursday,Friday,Saturday,Sunday",
      options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((value) => ({
        value,
        label: value.slice(0, 3),
      })),
    },
    { key: "start", label: "Start", type: "clock", value: "09:00" },
    { key: "end", label: "End", type: "clock", value: "17:00" },
  ],
  actions: [
    { id: "correct", label: "Modify" },
    { id: "cancel", label: "Remove" },
  ],
};
const memories = ["nora", "ellis"].map((person) => ({
  id: JSON.stringify(["memory", person]),
  topic: "memories",
  title: person === "nora" ? "The workshop key" : "A quiet afternoon",
  summary: "information",
  fields: [
    {
      key: "text",
      label: "Memory",
      type: "text",
      value: person === "nora" ? "Ellis lent me the workshop key." : "We read in the garden.",
    },
  ],
  people: [
    {
      id: person,
      name: person === "nora" ? "Nora" : "Ellis",
      text: person === "nora" ? "Ellis lent me the workshop key." : "We read in the garden.",
    },
  ],
  source: ["Ellis: You can borrow my workshop key until Friday."],
  actions: [
    { id: "correct", label: "Modify" },
    { id: "forget", label: "Forget" },
    { id: "teach", label: "Add person" },
  ],
  recipients: [{ id: "player", name: "Your Persona" }],
  related: [],
  token: person,
}));
const detail = {
  id: JSON.stringify(["zone-details", "hall", "dining"]),
  topic: "places",
  title: "Dining room",
  summary: "Zone details",
  fields: [
    { key: "name", label: "Name", type: "text", value: "Dining room" },
    {
      key: "kind",
      label: "Zone kind",
      type: "choice",
      value: "public",
      options: [{ value: "public", label: "Public" }],
    },
    { key: "purpose", label: "Used for", type: "text", value: "Shared meals." },
  ],
  source: [],
  actions: [{ id: "correct", label: "Modify" }],
  related: [],
  token: "zone",
};
const directory = [
  {
    id: "venues",
    title: "Venues",
    icon: "venue",
    children: [
      {
        id: "location-hall",
        title: "Hearth Alms Rooms",
        icon: "venue",
        mapId: "village",
        mapName: "Village",
        children: [
          {
            id: "zone-dining",
            title: "Dining room",
            icon: "zone",
            children: [{ id: detail.id, title: "Zone details", icon: "details" }],
          },
        ],
      },
    ],
  },
  { id: "places", title: "Locations", icon: "places", children: [] },
];
export async function repairBrowserFixture(browser, width = 1440, height = 900, options = {}) {
  const page = await browser.newPage({ viewport: { width, height } });
  await mockEngineLookups(page);
  const calls = [],
    reviews = new Map(),
    gates = new Map();
  let version = 0;
  const world = {
    id: '["world"]',
    topic: "world",
    title: "Village setting",
    summary: "Willowmere",
    fields: [
      { key: "name", label: "Village name", type: "text", multiline: false, value: "Willowmere" },
      { key: "setting", label: "Place description", type: "text", value: "A village by the river." },
    ],
    source: [],
    actions: [{ id: "correct", label: "Modify" }],
    related: [],
    token: "world",
  };
  const letter = {
    id: '["letter-font","nora"]',
    topic: "people",
    title: "Letter style",
    summary: "Letter style",
    fields: [
      {
        key: "letterFontId",
        label: "Letter style",
        type: "choice",
        value: "assistant",
        options: [
          { value: "assistant", label: "Assistant" },
          { value: "lora", label: "Lora" },
        ],
      },
    ],
    source: [],
    actions: [{ id: "correct", label: "Modify" }],
    related: [],
    token: "font",
  };
  const visitor = {
    id: '["visitor","guest"]',
    topic: "people",
    title: "Visits",
    summary: "Visits on",
    fields: [{ key: "visitsEnabled", label: "Visits enabled", type: "boolean", value: true }],
    source: [],
    actions: [{ id: "correct", label: "Modify" }],
    related: [],
    token: "visitor",
  };
  const localMemories = structuredClone(memories);
  for (let index = 0; index < (options.extraMemories ?? 0); index++)
    localMemories.push({
      ...structuredClone(localMemories[0]),
      id: JSON.stringify(["memory", "remote-" + index]),
      title: "Remote memory " + index,
      fields: [{ key: "text", label: "Memory", type: "text", value: "Remote memory " + index }],
      people: [{ id: "nora", name: "Nora", text: "Remote memory " + index }],
      token: "remote-" + index,
    });
  let checkpoints = Array.from({ length: options.checkpoints ?? 0 }, (_, index) => ({
    id: "snapshot-" + index,
    title: "Snapshot " + index,
    at: "2026-11-25T12:00:00.000Z",
    records: 4,
    token: "snapshot-" + index,
    mode: "manual",
  }));
  let history = Array.from({ length: options.history ?? 0 }, (_, index) => ({
    id: "history-" + index,
    title: "Repair " + index,
    at: "2026-11-25T12:00:00.000Z",
    changes: [{ label: "Home", before: "Old home", after: "Willow House" }],
    affected: ["Nora"],
    undone: false,
    canUndo: true,
    action: "Updated",
  }));
  const agenda = Array.from({ length: 7 }, (_, index) => ({
    id: JSON.stringify(["agenda", "nora", "2026-11-" + (24 + index)]),
    topic: "people",
    token: "day-" + index,
    title: "Agenda",
    agendaDay: "Tuesday, November " + (24 + index),
    agenda: {
      residentId: "nora",
      date: "2026-11-" + (24 + index),
      weekday: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"][index],
      venues: [
        { value: "house", label: "Willow House", zones: [{ value: "bedroom", label: "Bedroom" }] },
        { value: "inn", label: "Inn", zones: [{ value: "upstairs", label: "Upstairs" }] },
      ],
      blocks: [
        { startMinute: 540, endMinute: 600, activity: "Reading", place: "Willow House", repairIndex: 0 },
        {
          startMinute: 900,
          endMinute: 960,
          activity: "Meet Ellis",
          place: "Village green",
          source: "agreed",
          repairRecordId: '["appointment","nora","plan"]',
        },
      ],
    },
    fields: [
      { key: "activity:0", label: "Activity", type: "text", multiline: false, value: "Reading" },
      { key: "start:0", label: "Start", type: "clock", value: "09:00" },
      { key: "end:0", label: "End", type: "clock", value: "10:00" },
      { key: "venue:0", label: "Venue", type: "choice", value: "house" },
      { key: "zone:0", label: "Zone", type: "choice", value: "bedroom" },
      { key: "activity:new", label: "Activity", type: "text", multiline: false, value: "" },
      { key: "start:new", label: "Start", type: "clock", value: "" },
      { key: "end:new", label: "End", type: "clock", value: "" },
      { key: "venue:new", label: "Venue", type: "choice", value: "" },
      { key: "zone:new", label: "Zone", type: "choice", value: "" },
    ],
    source: [],
    actions: [
      { id: "correct", label: "Modify" },
      { id: "add-activity", label: "Add activity" },
    ],
    related: [],
  }));
  const appointment = {
    ...structuredClone(agenda[0]),
    id: '["appointment","nora","plan"]',
    agendaDay: undefined,
    agenda: undefined,
    title: "Meet Ellis",
    fields: [
      { key: "activity", label: "Activity", type: "text", multiline: false, value: "Meet Ellis" },
      { key: "start", label: "Start", type: "clock", value: "15:00" },
      { key: "end", label: "End", type: "clock", value: "16:00" },
    ],
    actions: [
      { id: "correct", label: "Modify" },
      { id: "cancel", label: "Remove" },
    ],
  };
  const recordFor = (id, person) => {
    const found = [world, letter, visitor, detail, appointment, ...agenda, ...localMemories].find(
      (record) => record.id === id,
    );
    if (id?.startsWith('["work",')) return { ...structuredClone(work), id };
    if (id?.startsWith('["home",'))
      return { ...structuredClone(home), id, title: person + " home assignment", token: "home-" + person };
    if (id?.startsWith('["new-memory",'))
      return {
        id,
        topic: "memories",
        title: "Add memory",
        summary: "",
        fields: [{ key: "text", label: "Memory", type: "text", value: "" }],
        source: [],
        people: people.filter((entry) => entry.id === person),
        creating: true,
        actions: [{ id: "correct", label: "Modify" }],
        related: [],
        token: "new-" + person,
      };
    if (!found) throw Error("Missing fixture record " + id);
    const result = structuredClone(found);
    if (result.topic === "memories") {
      const account = result.people.find((entry) => entry.id === person) ?? result.people[0];
      result.fields[0].value = account.text;
      result.actions = account.forgotten
        ? [{ id: "remember", label: "Restore memory" }]
        : [
            { id: "correct", label: "Modify" },
            { id: "forget", label: "Forget" },
            { id: "teach", label: "Add person" },
          ];
    }
    return result;
  };
  const answer = async (route, key, json) => {
    const gate = gates.get(key);
    if (gate) {
      gates.delete(key);
      gate.started.resolve();
      await gate.release.promise;
    }
    return fulfill(route, { json });
  };
  await page.route("http://repair.test/", (route) =>
    fulfill(route, {
      contentType: "text/html",
      body: '<style>html,body{margin:0;height:100%;width:100%}#root{display:block;margin-top:52px;height:calc(100% - 52px);width:100%}</style><marinara-capability-villages id="root"></marinara-capability-villages>',
    }),
  );
  await page.route("**/api/villages/repair**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/") return route.fallback();
    const person = url.searchParams.get("personId"),
      path = url.pathname,
      body = route.request().postDataJSON();
    calls.push({ path, url: url.toString(), body });
    if (path.endsWith("/records")) {
      if (url.searchParams.get("topic") === "places")
        return answer(route, "places", { records: [], total: 0, directory });
      const section = url.searchParams.get("section"),
        topic = url.searchParams.get("topic");
      let records =
        topic === "world"
          ? [world]
          : topic === "all"
            ? [world, ...localMemories]
            : section === "agenda"
              ? agenda
              : section === "details"
                ? [person === "guest" ? visitor : letter]
                : section === "home"
                  ? [
                      recordFor(JSON.stringify(["home", person]), person),
                      recordFor(JSON.stringify(["work", person, "house"]), person),
                    ]
                  : localMemories.filter((record) => record.people.some((entry) => entry.id === person));
      const query = (url.searchParams.get("query") ?? "").toLowerCase();
      records = records.filter((record) => JSON.stringify(record).toLowerCase().includes(query));
      const state = url.searchParams.get("memoryState");
      if (section === "memories" && state)
        records = records.filter(
          (record) => (state === "forgotten") === !!record.people.find((entry) => entry.id === person)?.forgotten,
        );
      const offset = Number(url.searchParams.get("offset") ?? 0);
      return answer(route, "records:" + person, {
        records: records.slice(offset, offset + 50),
        total: records.length,
        creation: section === "memories" ? recordFor(JSON.stringify(["new-memory", person]), person) : undefined,
      });
    }
    if (path.endsWith("/record"))
      return answer(route, "record:" + url.searchParams.get("id"), recordFor(url.searchParams.get("id"), person));
    if (path.endsWith("/cancel")) return fulfill(route, { json: {} });
    if (path.endsWith("/review")) {
      const record = recordFor(body.recordId, body.personId),
        values = Object.entries(body.values).filter(([key, value]) =>
          record.fields.some((field) => field.key === key && field.value !== value),
        );
      const review = {
        id: body.operationId,
        token: "review-" + body.operationId,
        kind: "repair",
        title: record.title,
        changes: values.length
          ? values.map(([key, value]) => ({
              label: record.fields.find((field) => field.key === key)?.label ?? key,
              before: String(record.fields.find((field) => field.key === key)?.value ?? ""),
              after: String(value),
            }))
          : [{ label: "Action", before: "Current", after: body.action }],
        affected: [record.title],
        related: [],
        checkpoint: false,
        undoAvailable: true,
      };
      reviews.set(review.id, { review, body });
      return answer(route, "review", review);
    }
    if (path.endsWith("/apply")) {
      const pending = reviews.get(body.id);
      assert(pending);
      if (pending.body) {
        const edit = pending.body,
          record = localMemories.find((record) => record.id === edit.recordId);
        if (record) {
          const account = record.people.find((person) => person.id === edit.personId) ?? record.people[0];
          if (edit.action === "correct") {
            account.text = edit.values.text;
            record.fields[0].value = account.text;
          }
          if (edit.action === "forget") account.forgotten = true;
          if (edit.action === "remember") account.forgotten = false;
          record.token = "saved-" + ++version;
        } else if (edit.recordId === '["world"]') {
          for (const field of world.fields)
            if (edit.values[field.key] !== undefined) field.value = edit.values[field.key];
        }
      }
      history.unshift({
        id: body.id,
        title: pending.review.title,
        at: new Date().toISOString(),
        changes: pending.review.changes,
        affected: pending.review.affected,
        undone: false,
        canUndo: false,
        action: "Updated",
      });
      return fulfill(route, { json: {} });
    }
    if (path.endsWith("/restore")) {
      const review = {
        id: body.operationId,
        token: "restore",
        kind: "restore",
        title: "Restore Village",
        changes: [{ label: "Village progress", before: "Current", after: "Selected snapshot" }],
        affected: ["Current time and spending stay current."],
        related: [],
        checkpoint: true,
        undoAvailable: false,
      };
      reviews.set(review.id, { review });
      return fulfill(route, { json: review });
    }
    if (path.endsWith("/checkpoints")) {
      if (route.request().method() === "DELETE") checkpoints = checkpoints.filter((entry) => entry.id !== body.id);
      else
        checkpoints.unshift({
          id: body.operationId,
          title: body.title || "Snapshot",
          at: new Date().toISOString(),
          records: 4,
          token: body.operationId,
          mode: "manual",
        });
      return fulfill(route, { json: {} });
    }
    const historyOffset = Number(url.searchParams.get("historyOffset") ?? 0),
      checkpointOffset = Number(url.searchParams.get("checkpointOffset") ?? 0);
    return answer(route, "index", {
      seed: "world",
      identity: "world",
      villageName: "Willowmere",
      people,
      records: [],
      history: history.slice(historyOffset, historyOffset + 50),
      historyOffset,
      historyTotal: history.length,
      checkpoints: checkpoints.slice(checkpointOffset, checkpointOffset + 50),
      checkpointOffset,
      checkpointTotal: checkpoints.length,
      sceneOpen: false,
    });
  });
  await page.goto("http://repair.test/");
  await page.evaluate((jobs) => {
    window.fixtureJobs = jobs;
    window.retryJobs = [];
  }, options.jobs ?? []);
  await page.addScriptTag({ content: code.outputFiles[0].text });
  await expect(page.getByRole("button", { name: "Repair Nora", exact: true })).toBeVisible();
  return {
    page,
    calls,
    root: page.locator(".villages-repair"),
    async area(value) {
      if (width > 700)
        await page
          .getByRole("button", {
            name: {
              people: "People",
              places: "Locations",
              world: "World",
              progress: "Recover work",
              history: "Repair history",
            }[value],
            exact: true,
          })
          .click();
      else await page.getByRole("combobox", { name: "REPAIR area" }).selectOption(value);
    },
    async section(value) {
      if (width > 700)
        await page
          .getByRole("button", {
            name: {
              memories: "Memories",
              home: "Home & work",
              agenda: "Agenda",
              details: "Character",
              wishes: "Wishes",
              relationships: "Relationships",
            }[value],
            exact: true,
          })
          .click();
      else await page.getByRole("combobox", { name: "Person repairs" }).selectOption(value);
    },
    hold(key) {
      const gate = { started: Promise.withResolvers(), release: Promise.withResolvers() };
      gates.set(key, gate);
      return { started: gate.started.promise, release: () => gate.release.resolve() };
    },
  };
}
export async function noRepairScroll(page) {
  const issues = await page.evaluate(() =>
    [...document.querySelectorAll(".villages-repair,.repair-card,.repair-directory,textarea")].flatMap((element) => {
      const box = element.getBoundingClientRect();
      const footer = document.querySelector(".repair-footer").getBoundingClientRect();
      const limit = element.matches(".villages-repair") ? innerHeight : footer.top;
      return box.bottom > limit + 1 || box.right > innerWidth + 1 || element.scrollHeight > element.clientHeight + 2
        ? [
            {
              tag: element.tagName,
              class: element.className,
              bottom: box.bottom,
              scroll: element.scrollHeight,
              client: element.clientHeight,
            },
          ]
        : [];
    }),
  );
  assert.deepEqual(issues, []);
}
export { expect };
