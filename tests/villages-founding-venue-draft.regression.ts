import { newFoundingPlanSources } from "../packages/villages/src/client/features/founding/quick-start-drafts.js";
import { manualHomesFixture } from "./helpers/founding-homes.fixture.js";
import { createFoundingWithSetupImage } from "../packages/villages/src/client/features/founding/image-controller.js";
import assert from "node:assert/strict";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import {
  createFoundingSuggestions,
  type FoundingSuggestionsPorts,
} from "../packages/villages/src/server/features/founding/founding-suggestions-service.js";
import { createFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts-service.js";
import { createFoundingSuggestSetupVenues } from "../packages/villages/src/client/features/founding/setup-controller.js";
import { emptyFoundingWorkspace } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  readFoundingVenueDraftSource,
  readFoundingZoneIds,
  parseFoundingVenueDraft,
} from "../packages/villages/src/server/domain/rules/founding-venue-draft.js";
import {
  applyFoundingVenueDraft,
  foundingVenueDraftSource,
} from "../packages/villages/src/shared/helpers/founding-venue-draft.js";
import { addFoundingZone } from "../packages/villages/src/client/features/founding/founding-template.js";
import { assignFoundingHome } from "../packages/villages/src/client/features/founding/founding-homes.js";

let homes = manualHomesFixture(
  [],
  [
    { id: "player", name: "You" },
    { id: "ada", name: "Ada" },
  ],
  ["player", "ada"],
  "community",
);
homes = assignFoundingHome(homes, "founding-home:player", "ada", true);
let home = homes.find((row) => row.id === "founding-home:player")!;
home = addFoundingZone(home, true, "ada-room");
home.privateSpaces!.find((row) => row.id === "ada-room")!.ownerId = "ada";
home.privateSpaces!.find((row) => row.id === "ada-room")!.access!.managerIds = ["ada"];
home.privateSpaces!.find((row) => row.id === "ada-room")!.access!.memberIds = ["ada"];
home.destinations!.ada.sleep = "ada-room";
home.spaces![0].image = { id: "kept", ref: "global-gallery:kept", url: "/kept.webp" };
home.spaces![0].state = { revision: 5, updatedAt: "2026-11-03T12:00:00.000Z", recent: null };
const now = new Date("2026-11-03T14:00:00.000Z");
const original = structuredClone(home);
const source = readFoundingVenueDraftSource(foundingVenueDraftSource(home));
assert.deepEqual(
  source.privateSpaces!.find((zone) => zone.id === "private:base")!.connectedTo,
  home.privateSpaces!.find((zone) => zone.id === "private:base")!.connectedTo,
  "Source context keeps actual passages, not validation placeholders",
);
const raw = {
  id: home.id,
  name: "The Tide House",
  venueType: "Home",
  form: "A reclaimed boathouse",
  description: "A weathered entrance faces the sea.",
  dayNight: true,
  zones: [
    ...[...(home.spaces ?? []), ...(home.privateSpaces ?? [])].map((zone) => ({
      id: zone.id,
      name: zone.name,
      purpose: zone.purpose,
      description: "A freshly drafted physical description.",
      dayNight: true,
      private: home.privateSpaces!.some((room) => room.id === zone.id),
      ownerId: zone.ownerId ?? "",
      connectedTo: ["exterior"],
    })),
    {
      id: "new-kitchen",
      name: "Kitchen",
      purpose: "Cooking",
      description: "A bright kitchen with a tiled stove.",
      dayNight: false,
      private: false,
      ownerId: "",
      connectedTo: ["common:base"],
    },
  ],
};
assert.deepEqual(readFoundingZoneIds(["new-kitchen"], source), ["new-kitchen"]);
const plan = parseFoundingVenueDraft({ venues: [raw] }, source, ["new-kitchen"], now);
const drafted = applyFoundingVenueDraft(home, plan);
assert.deepEqual(home, original);
assert.equal(drafted.dayNight, true);
assert.equal(drafted.spaces!.at(-1)!.dayNight, false);
const persisted = readFoundingVenueDraftSource(drafted);
assert.equal(persisted.zones!.find((z) => z.id === "exterior")!.dayNight, true);
assert.equal(persisted.zones!.find((z) => z.id === "new-kitchen")!.dayNight, false);
const previous = structuredClone(home);
previous.dayNight = false;
previous.spaces![0].dayNight = false;
const held = applyFoundingVenueDraft(previous, plan);
assert.equal(held.dayNight, true);
assert.equal(held.spaces![0].dayNight, true);
const same = applyFoundingVenueDraft(drafted, {
  ...plan,
  dayNight: false,
  zones: plan.zones!.map((z) => ({ ...z, dayNight: !z.dayNight })),
});
assert.equal(same.dayNight, false, "the reviewed Entrance lighting choice applies with unchanged prose");
assert.equal(same.spaces![0].dayNight, !drafted.spaces![0].dayNight, "Zone lighting follows the typed draft choice");
assert.throws(
  () => parseFoundingVenueDraft({ venues: [{ ...raw, dayNight: "yes" }] }, source, ["new-kitchen"], now),
  /daylight decision/,
);

for (const key of ["residentIds", "occupancy", "destinations", "presentation"] as const)
  assert.deepEqual(drafted[key], home[key], key);
for (const old of [...home.spaces!, ...home.privateSpaces!]) {
  const next = [...drafted.spaces!, ...drafted.privateSpaces!].find((zone) => zone.id === old.id)!;
  for (const key of ["access", "ownerId", "image", "state"] as const)
    assert.deepEqual(next[key], old[key], key + " survives drafting");
}
assert.equal(drafted.spaces!.at(-1)!.name, "Kitchen");
// Incomplete manual Work never blocks physical drafting or gains new authority.
const unfinished = structuredClone(home);
unfinished.workerIds = ["ada"];
unfinished.access = { work: [{ characterId: "ada", zoneId: "missing", accessZoneIds: [] }] } as any;
assert.doesNotThrow(() => readFoundingVenueDraftSource(unfinished));
const oldOwner = structuredClone(home);
delete oldOwner.privateSpaces![0].access;
assert.deepEqual(readFoundingVenueDraftSource(oldOwner).privateSpaces![0].access!.managerIds, ["player"]);
const disconnected = structuredClone(home);
[...disconnected.spaces!, ...disconnected.privateSpaces!].forEach((zone) => (zone.connectedTo = []));
assert.doesNotThrow(
  () => parseFoundingVenueDraft({ venues: [raw] }, readFoundingVenueDraftSource(disconnected), ["new-kitchen"], now),
  "Drafting repairs a disconnected source",
);
const mixed = { ...home };
const mixedReply = structuredClone(raw);
mixedReply.zones.push({
  id: "new-bedroom",
  name: "Your bedroom",
  purpose: "Sleeping",
  description: "A bedroom with a wide bed.",
  private: true,
  ownerId: "player",
  connectedTo: ["exterior"],
});
const mixedPlan = parseFoundingVenueDraft(
  { venues: [mixedReply] },
  readFoundingVenueDraftSource(mixed),
  ["new-kitchen", "new-bedroom"],
  now,
);
assert.equal(
  applyFoundingVenueDraft(mixed, mixedPlan).privateSpaces!.find((zone) => zone.id === "new-bedroom")!.ownerId,
  "",
  "A new bedroom stays unassigned until the player assigns a Home",
);
assert.deepEqual(
  foundingVenueDraftSource({ ...home, presentation: { ...home.presentation, x: 0.9, y: 0.8 } }),
  foundingVenueDraftSource(home),
  "Map movement does not invalidate a Venue writing source",
);
const bad = (change: (row: typeof raw) => void, pattern: RegExp) => {
  const row = structuredClone(raw);
  change(row);
  assert.throws(() => parseFoundingVenueDraft({ venues: [row] }, source, ["new-kitchen"], now), pattern);
};
bad((row) => {
  row.zones.pop();
  row.zones.pop();
}, /every existing Zone/);
const drift = structuredClone(raw);
Object.assign(
  drift.zones.find((zone) => zone.id === "ada-room")!,
  { ownerId: "player", private: false },
);
const retained = parseFoundingVenueDraft({ venues: [drift] }, source, ["new-kitchen"], now);
assert.equal(retained.zones!.find((zone) => zone.id === "ada-room")!.ownerId, "ada");
assert.equal(retained.zones!.find((zone) => zone.id === "ada-room")!.private, true);
const aliased = structuredClone(raw);
aliased.zones.at(-1)!.id = "kitchen-label";
const aliasedPlan = parseFoundingVenueDraft(
  {
    venues: [
      {
        ...aliased,
        people: {
          residentIds: ["ada"],
          playerHome: true,
          managerIds: [],
          work: [
            {
              characterId: "kitchen-label",
              activity: "Cooking",
              zoneId: "kitchen-label",
              accessZoneIds: ["common:base", "kitchen-label"],
              days: ["Monday"],
              startMinute: 540,
              endMinute: 1020,
            },
          ],
          destinations: { ...home.destinations, "kitchen-label": { work: "kitchen-label" } },
        },
      },
    ],
  },
  source,
  ["new-kitchen"],
  now,
  ["player", "ada", "kitchen-label"],
);
assert.equal(aliasedPlan.zones!.at(-1)!.id, "new-kitchen");
assert.equal("people" in aliasedPlan, false, "AI assignment data never enters the result");
assert.deepEqual(home, original);
assert.throws(() => parseFoundingVenueDraft({ venues: [aliased] }, source, [], now), /more Zones/);
// Existing passages survive Redraft even if the model omits them.
const noLinks = structuredClone(raw);
noLinks.zones.forEach((zone) => (zone.connectedTo = []));
noLinks.zones.at(-1).connectedTo = ["exterior"];
assert.doesNotThrow(() => parseFoundingVenueDraft({ venues: [noLinks] }, source, ["new-kitchen"], now));
bad((row) => {
  row.zones.push(row.zones[0]);
}, /distinct/);
assert.throws(() => readFoundingZoneIds(["common:base"], source), /distinct/);

let textCalls = 0;
let venueReply: unknown = { venues: [raw] };
let modelInput: any;
const writer = createFoundingDrafts({
  findVillagerCard: async (id: string) =>
    readVillagerCard({ id, comment: "", data: { name: "Ada", description: "A careful cook" } }),
  readLinkedPersona: async () => ({ name: "Player", identity: "An observer" }),
  readVillageLore: async () => [],
  villagesConnectionIdFor: async () => "synthetic",
  villagesLanguageModels: () => ({
    resolveForRequest: async () => ({
      maxOutputTokens: 4000,
      fitContext: (messages: unknown[], options: any) => ({ messages, maxTokens: options.maxTokens }),
    }),
  }),
  completeWithRoom: async (_model: unknown, messages: any[]) => {
    textCalls++;
    modelInput = JSON.parse(messages.at(-1).content);
    return { content: JSON.stringify(venueReply), finishReason: "stop" };
  },
} as any);
const input = {
  mode: "draft-venue",
  actionId: "full-venue-attempt",
  sourceKey: "setting:home",
  targetVenueId: home.id,
  targetVenue: foundingVenueDraftSource(home),
  newZoneIds: ["new-kitchen"],
  setting: "A coastal community",
  openingVenueId: "community",
  context: { rules: "", circumstances: [] },
  venues: [
    {
      id: home.id,
      name: home.name,
      form: home.form,
      description: home.description,
      residentIds: ["ada"],
      playerHome: true,
    },
    {
      id: "community",
      name: "Meeting place",
      form: "Courtyard",
      description: "A public courtyard",
      residentIds: [],
      playerHome: false,
    },
  ],
};
await assert.rejects(writer.suggestStartingVenues({ ...input, actionId: undefined }), /saved suggestion attempt/);
assert.equal(textCalls, 0);
assert.deepEqual((await writer.suggestStartingVenues(input)).venues[0].zones, plan.zones);
assert.equal(textCalls, 1);
assert.ok(!modelInput.targetVenue.zones.some((zone: any) => zone.id === "exterior"));
assert.equal("people" in modelInput.responseTemplate.venues[0], false);
assert.ok(modelInput.targetVenue.zones.every((zone: any) => !("ownerId" in zone)));

const slots = newFoundingPlanSources();
const incomplete = {
  ...input,
  mode: "draft-plan",
  targetVenueId: undefined,
  foundingCharacterIds: ["ada", "unhoused"],
  foundingResidentAdmissions: {
    ada: { homeworld: "", startingSituation: "" },
    unhoused: { homeworld: "", startingSituation: "" },
  },
  sourceVenues: slots.map(foundingVenueDraftSource),
  newZoneIdsByVenue: Object.fromEntries(slots.map((row) => [row.id, ["room"]])),
  venues: slots.map((row) => ({ id: row.id, name: "", form: "", description: "", residentIds: [], playerHome: false })),
};
venueReply = {
  venues: [0, 1, 2].map((index) => ({
    ...raw,
    name: "Venue " + index,
    zones: [
      {
        id: "bedroom",
        name: "Bedroom",
        purpose: "Rest",
        description: "A quiet room.",
        private: true,
        connectedTo: ["exterior"],
      },
    ],
  })),
};
const clean = await writer.suggestStartingVenues(incomplete);
assert.equal(clean.venues.length, 3);
assert.deepEqual(
  clean.venues.map((row) => row.id),
  slots.slice(0, 3).map((row) => row.id),
);
assert.ok(clean.venues.every((row) => !("people" in row) && row.zones.every((zone) => !zone.ownerId)));
assert.deepEqual(modelInput.foundingCharacterIds, ["ada", "unhoused"]);
assert.equal((await writer.suggestStartingVenues({ ...incomplete, foundingCharacterIds: undefined })).venues.length, 3);
const beforeInvalid = textCalls;
await assert.rejects(
  writer.suggestStartingVenues({ ...incomplete, foundingCharacterIds: ["ada"] }),
  /Starting situations/,
);
assert.equal(textCalls, beforeInvalid);
venueReply = { venues: [raw] };
await assert.rejects(writer.suggestStartingVenues(incomplete), /three or four/);
venueReply = { venues: [raw] };

const tick = () => new Promise<void>((done) => setImmediate(done));
function harness() {
  const records = new Map<string, any>();
  const documents = {
    async getById(_package: string, id: string) {
      return structuredClone(records.get(id) ?? null);
    },
    async create(value: any) {
      const next = { ...structuredClone(value), revision: 1 };
      records.set(value.id, next);
      return next;
    },
    async update(value: any) {
      const old = records.get(value.id);
      if (old?.revision !== value.expectedRevision) return null;
      const next = { ...old, ...structuredClone(value), revision: old.revision + 1 };
      records.set(value.id, next);
      return next;
    },
  } as unknown as CapabilityDocumentStore;
  const base = createDocumentMutator(() => documents);
  const state = {
    texts: 0,
    images: 0,
    writes: 0,
    beforeWrite: undefined as ((number: number) => void) | undefined,
    afterWrite: undefined as (() => void) | undefined,
    textBarrier: Promise.resolve(),
    imageBarrier: Promise.resolve(),
    imageFails: false,
  };
  const ports: FoundingSuggestionsPorts = {
    villagesDocuments: () => documents,
    mutateDocument: (async (...args: any[]) => {
      state.beforeWrite?.(++state.writes);
      const result = await (base as any)(...args);
      if (records.get("villages-founding-suggestions")?.data.request.imageRequested) state.afterWrite?.();
      return result;
    }) as typeof base,
    villagesLogger: () => ({
      debug() {},
      info() {},
      warn() {},
      error(error) {
        throw error;
      },
    }),
    suggestStartingVenues: async () => {
      state.texts++;
      await state.textBarrier;
      return { venues: [plan] };
    },
    generateFoundingVenueImage: async (value: any) => {
      assert.equal(value.area, "exterior");
      assert.equal(value.venue.id, home.id);
      state.images++;
      assert.equal(records.get("villages-founding-suggestions").data.request.imageRequested, true);
      await state.imageBarrier;
      if (state.imageFails) throw Error("Synthetic image failure");
      return { id: "art", ref: "global-gallery:art", url: "/art.webp" };
    },
  };
  const service = createFoundingSuggestions(ports);
  const settled = async (current = service) => {
    for (let i = 0; i < 100; i++) {
      await tick();
      const row = await current.readFoundingSuggestions(input.actionId);
      if (row.status !== "running") return row;
    }
    throw Error("Synthetic attempt did not settle");
  };
  return { ports, service, state, settled };
}
{
  const h = harness();
  await h.service.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  const result = await h.settled();
  assert.equal(result.result!.entranceImage!.id, "art");
  await h.service.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  await h.service.readFoundingSuggestions(input.actionId);
  assert.deepEqual([h.state.texts, h.state.images], [1, 1]);
  h.service.stop();
}
{
  const h = harness();
  h.state.imageFails = true;
  await h.service.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  const result = await h.settled();
  assert.equal(result.status, "complete");
  assert.deepEqual(result.result!.venues, [plan]);
  assert.match(result.result!.imageError!, /Synthetic image failure/);
  h.service.stop();
}
{
  const h = harness();
  h.state.afterWrite = () => {
    h.state.afterWrite = undefined;
    h.service.stop();
  };
  await h.service.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  await tick();
  await tick();
  const restarted = createFoundingSuggestions(h.ports);
  const result = await h.settled(restarted);
  assert.equal(result.status, "complete");
  assert.deepEqual(result.result!.venues, [plan]);
  assert.match(result.result!.imageError!, /interrupted/);
  assert.equal(h.state.images, 0);
  restarted.stop();
}
{
  const h = harness();
  h.state.beforeWrite = (number) => {
    if (number === 2) h.service.stop();
  };
  await h.service.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  await tick();
  await tick();
  const restarted = createFoundingSuggestions(h.ports);
  assert.equal((await h.settled(restarted)).status, "interrupted");
  assert.equal(h.state.images, 0);
  restarted.stop();
}
{
  const h = harness();
  let finish!: () => void;
  h.state.imageBarrier = new Promise((done) => (finish = done));
  await h.service.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  for (let i = 0; i < 50 && !h.state.images; i++) await tick();
  assert.equal(h.state.images, 1);
  h.service.stop();
  finish();
  await tick();
  await tick();
  const restarted = createFoundingSuggestions(h.ports);
  const result = await h.settled(restarted);
  assert.deepEqual(result.result!.venues, [plan]);
  assert.match(result.result!.imageError!, /interrupted/);
  await restarted.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  assert.deepEqual([h.state.texts, h.state.images], [1, 1]);
  restarted.stop();
}
{
  const h = harness();
  let finish!: () => void;
  h.state.textBarrier = new Promise((done) => (finish = done));
  await h.service.requestFoundingSuggestions({ ...input, draftEntranceImage: true });
  h.service.stop();
  finish();
  await tick();
  await tick();
  const restarted = createFoundingSuggestions(h.ports);
  assert.equal((await h.settled(restarted)).status, "interrupted");
  assert.equal(h.state.images, 0);
  restarted.stop();
}
const originalFetch = globalThis.fetch;
try {
  for (const edit of ["map", "zone", "remove", "setting"] as const) {
    let venues = [structuredClone(home)],
      workspace = emptyFoundingWorkspace(),
      saved: any,
      admitted: any,
      problem = "",
      posts = 0,
      gets = 0;
    let setting = "A coastal community";
    const claim = { current: false },
      reference = { current: venues };
    const setRows = (update: any) => {
      venues = typeof update === "function" ? update(venues) : update;
      reference.current = venues;
    };
    const setWorkspace = (update: any) => (workspace = typeof update === "function" ? update(workspace) : update);
    const controller = (signal?: AbortSignal) =>
      createFoundingSuggestSetupVenues({
        signal,
        setupWorkspace: workspace,
        setSetupWorkspace: setWorkspace,
        setupDraftData: { venues, workspace } as any,
        persistSetupDraft: async (data) => {
          saved = structuredClone(data);
        },
        personaDraft: "player",
        selectedResidentAdmissions: {},
        setSetupProblem: (value) => {
          problem = typeof value === "function" ? value(problem) : value;
        },
        setSetupSuggestionsBusy() {},
        setSetupSuggestionsKey() {},
        setSetupVenues: setRows,
        setupVenues: venues,
        setupVenuesRef: reference,
        setupAuthoredFieldsRef: { current: {} },
        setupBeginningSourceKey: "same-setting",
        setupBeginningSourceKeyRef: { current: "same-setting" },
        setupImageTargetRef: { current: null },
        setupLorebookDraft: [],
        setupLoreTokenBudgetDraft: 1600,
        setupSetting: setting,
        setupSuggestionsClaim: claim,
      });
    globalThis.fetch = async (_url, init) => {
      if (init?.method === "POST") {
        posts++;
        admitted = JSON.parse(String(init.body));
        assert.equal(saved.workspace.suggestionRequest.id, admitted.actionId, "Persist the attempt before dispatch");
        assert.equal(saved.workspace.suggestionRequest.draftEntranceImage, true);
        throw new TypeError("Synthetic lost POST reply");
      }
      gets++;
      const reply = structuredClone(plan);
      reply.zones!.find((zone) => zone.id === "new-kitchen")!.id = admitted.newZoneIds[0];
      return Response.json({
        id: admitted.actionId,
        sourceKey: admitted.sourceKey,
        status: "complete",
        result: {
          venues: [reply],
          entranceImage: { id: "saved-image", ref: "global-gallery:saved-image", url: "/saved-image.webp" },
        },
        error: "",
      });
    };
    const cancelled = new AbortController();
    cancelled.abort();
    await controller(cancelled.signal)({ venueId: home.id, fullVenue: true, draftEntranceImage: true });
    assert.equal(problem, "", "An already cancelled observer is not a generation error");
    assert.equal(posts, 0);
    assert.equal(workspace.suggestionRequest, undefined);
    await controller()({ venueId: home.id, fullVenue: true, draftEntranceImage: true });
    assert.match(problem, /Reconnecting/);
    workspace = structuredClone(saved.workspace);
    if (edit === "map")
      setRows(venues.map((row) => ({ ...row, presentation: { ...row.presentation, x: 0.87, y: 0.62 } })));
    else if (edit === "zone")
      setRows(
        venues.map((row) => ({
          ...row,
          spaces: row.spaces!.map((zone) => ({ ...zone, description: "An edit made after admission." })),
        })),
      );
    else if (edit === "remove") setRows([]);
    else setting = "";
    const before = structuredClone(venues);
    await controller()({ venueId: "another-venue", fullVenue: false, draftEntranceImage: false });
    assert.deepEqual([posts, gets], [1, 1], "Reload recovery only reads the original attempt");
    if (edit === "map") {
      assert.equal(venues[0].presentation.x, 0.87);
      assert.equal(workspace.venueReview!.venues[0].presentation.image!.id, "saved-image");
      assert.deepEqual(venues, before, "A saved result waits for explicit Use changes");
      assert.equal(
        workspace.venueReview!.venues[0].spaces!.find((zone) => zone.id === admitted.newZoneIds[0])!.name,
        "Kitchen",
      );
      assert.equal(problem, "");
    } else {
      assert.deepEqual(venues, before);
      assert.match(problem, /choices changed/i);
    }
  }
} finally {
  globalThis.fetch = originalFetch;
}
console.log(
  "Complete Venue drafts: stable Zones, privacy and sleep routes, optional Entrance artwork, durable text and no paid-stage replay passed.",
);

{
  const keep = createFoundingWithSetupImage();
  const generated = keep(drafted, "exterior", { id: "day", ref: "global-gallery:day", url: "/day.png" });
  const saved = readFoundingVenueDraftSource(generated).zones!.find((zone) => zone.id === "exterior")!;
  assert.equal(saved.picture?.daylight, true, "Founding-generated daytime artwork retains its provenance");
  assert.equal(saved.picture?.context, JSON.stringify({ description: drafted.description, form: drafted.form }));
  const edited = readFoundingVenueDraftSource({
    ...generated,
    description: generated.description + " A new doorway.",
  }).zones!.find((zone) => zone.id === "exterior")!;
  assert.equal(edited.picture?.context, saved.picture?.context, "later Founding edits do not relabel existing pixels");
  assert.equal(edited.picture?.dirty, true);
}
