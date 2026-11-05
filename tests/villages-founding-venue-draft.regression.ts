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
import {
  assignFoundingPrivateZone,
  assignFoundingHome,
  reconcileFoundingRoster,
} from "../packages/villages/src/client/features/founding/founding-homes.js";

let homes = reconcileFoundingRoster(
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
home = assignFoundingPrivateZone(addFoundingZone(home, true, "ada-room"), "ada-room", "ada");
home.spaces![0].image = { id: "kept", ref: "global-gallery:kept", url: "/kept.webp" };
home.spaces![0].state = { revision: 5, updatedAt: "2026-11-03T12:00:00.000Z", recent: null };
const now = new Date("2026-11-03T14:00:00.000Z");
const original = structuredClone(home);
const source = readFoundingVenueDraftSource(foundingVenueDraftSource(home));
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
const plan = parseFoundingVenueDraft({ venues: [raw] }, source, ["new-kitchen"], false, now);
const drafted = applyFoundingVenueDraft(home, plan);
assert.deepEqual(home, original);
assert.equal(drafted.dayNight, true);
assert.equal(drafted.dayNightManual, false);
assert.equal(drafted.spaces!.at(-1)!.dayNight, false);
const persisted = readFoundingVenueDraftSource(drafted);
assert.equal(persisted.zones!.find((z) => z.id === "exterior")!.dayNightManual, false);
assert.equal(persisted.zones!.find((z) => z.id === "new-kitchen")!.dayNight, false);
const manual = structuredClone(home);
manual.dayNight = false;
manual.dayNightManual = true;
manual.spaces![0].dayNight = false;
manual.spaces![0].dayNightManual = true;
const held = applyFoundingVenueDraft(manual, plan);
assert.equal(held.dayNight, false);
assert.equal(held.spaces![0].dayNight, false);
const same = applyFoundingVenueDraft(drafted, {
  ...plan,
  dayNight: false,
  zones: plan.zones!.map((z) => ({ ...z, dayNight: !z.dayNight })),
});
assert.equal(same.dayNight, drafted.dayNight, "unchanged Entrance prose keeps its existing automatic choice");
assert.equal(same.spaces![0].dayNight, drafted.spaces![0].dayNight, "unchanged Zone prose keeps its automatic choice");
assert.throws(
  () => parseFoundingVenueDraft({ venues: [{ ...raw, dayNight: "yes" }] }, source, ["new-kitchen"], false, now),
  /daylight decision/,
);

for (const key of ["residentIds", "occupancy", "residenceCapacity", "destinations", "presentation"] as const)
  assert.deepEqual(drafted[key], home[key], key);
for (const old of [...home.spaces!, ...home.privateSpaces!]) {
  const next = [...drafted.spaces!, ...drafted.privateSpaces!].find((zone) => zone.id === old.id)!;
  for (const key of ["access", "ownerId", "image", "state"] as const)
    assert.deepEqual(next[key], old[key], key + " survives drafting");
}
assert.equal(drafted.spaces!.at(-1)!.name, "Kitchen");
const disconnected = structuredClone(home);
[...disconnected.spaces!, ...disconnected.privateSpaces!].forEach((zone) => (zone.connectedTo = []));
assert.doesNotThrow(
  () =>
    parseFoundingVenueDraft({ venues: [raw] }, readFoundingVenueDraftSource(disconnected), ["new-kitchen"], false, now),
  "Drafting repairs a disconnected source",
);
const mixed = { ...home, classes: ["workplace", "residence"] as ("workplace" | "residence")[] };
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
  false,
  now,
);
assert.equal(
  applyFoundingVenueDraft(mixed, mixedPlan).privateSpaces!.find((zone) => zone.id === "new-bedroom")!.venueClass,
  "residence",
);
assert.deepEqual(
  foundingVenueDraftSource({ ...home, presentation: { ...home.presentation, x: 0.9, y: 0.8 } }),
  foundingVenueDraftSource(home),
  "Map movement does not invalidate a Venue writing source",
);
const bad = (change: (row: typeof raw) => void, pattern: RegExp) => {
  const row = structuredClone(raw);
  change(row);
  assert.throws(() => parseFoundingVenueDraft({ venues: [row] }, source, ["new-kitchen"], false, now), pattern);
};
bad((row) => {
  row.zones.pop();
  row.zones.pop();
}, /every existing Zone/);
bad((row) => {
  row.zones[1].ownerId = "player";
}, /ownership/);
bad((row) => {
  row.zones.at(-1)!.id = "foreign-zone";
}, /ownership/);
bad((row) => {
  row.zones[0].connectedTo = ["ada-room"];
  row.zones[1].connectedTo = ["exterior"];
}, /accessible sleeping/);
bad((row) => {
  row.zones.forEach((zone) => (zone.connectedTo = []));
}, /Unreachable/);
bad((row) => {
  row.zones.push(row.zones[0]);
}, /exactly once/);
assert.throws(() => readFoundingZoneIds(["common:base"], source), /distinct/);

let textCalls = 0;
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
  completeWithRoom: async () => {
    textCalls++;
    return { content: JSON.stringify({ venues: [raw] }), finishReason: "stop" };
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
  communityVenueId: "community",
  context: { rules: "", circumstances: [] },
  venues: [
    {
      id: home.id,
      name: home.name,
      form: home.form,
      description: home.description,
      venueClass: "residence",
      residentIds: ["ada"],
      playerHome: true,
    },
    {
      id: "community",
      name: "Meeting place",
      form: "Courtyard",
      description: "A public courtyard",
      venueClass: "other",
      residentIds: [],
      playerHome: false,
    },
  ],
};
await assert.rejects(writer.suggestStartingVenues({ ...input, actionId: undefined }), /saved suggestion attempt/);
assert.equal(textCalls, 0);
assert.deepEqual((await writer.suggestStartingVenues(input)).venues[0].zones, plan.zones);
assert.equal(textCalls, 1);

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
      assert.equal(venues[0].presentation.image!.id, "saved-image");
      assert.equal(venues[0].spaces!.find((zone) => zone.id === admitted.newZoneIds[0])!.name, "Kitchen");
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
