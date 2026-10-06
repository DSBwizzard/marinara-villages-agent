import assert from "node:assert/strict";
import {
  DEFAULT_RESIDENT_FOUNDING_CONTEXT as defaults,
  RESIDENT_HISTORY_MODES,
  RESIDENT_STORY_ROLES,
  readResidentFoundingContext,
  renderResidentFoundingContext,
} from "../packages/villages/src/engine/packages/shared/src/villages/resident-founding-context.js";
import { readFoundingResidentContexts } from "../packages/villages/src/engine/packages/server/src/services/villages/resident-founding-context.js";
import {
  readVillagerCard,
  readEffectiveVillagerCard,
} from "../packages/villages/src/engine/packages/server/src/services/villages/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  fitVenueWritingMessages,
  venueCardProfile,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-writing.js";
import { proposeStartingTies } from "../packages/villages/src/engine/packages/server/src/services/villages/relationships.js";
import { defaultRelationshipState } from "../packages/villages/src/engine/packages/server/src/services/villages/relationship-store.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { runVillageSetup } from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";
import { suggestStartingVenues } from "../packages/villages/src/engine/packages/server/src/services/villages/founding-drafts.js";
import {
  sceneryCharacterContext,
  sceneryImageKey,
} from "../packages/villages/src/engine/packages/server/src/services/villages/scenery-context.js";

const context = {
  ...defaults,
  background:
    "Aqua remembers Mecca and her former bar. Station Fields is elsewhere; its relationship to Othiras and her current work remain undecided.",
};
for (const historyMode of Object.keys(RESIDENT_HISTORY_MODES))
  for (const storyRole of Object.keys(RESIDENT_STORY_ROLES)) {
    const value = {
      ...context,
      historyMode,
      storyRole,
      customDescription: storyRole === "custom" ? "Guardian bound to the station's foundations." : "",
    };
    assert.deepEqual(readResidentFoundingContext(value), value);
    const rendered = renderResidentFoundingContext("Aqua", value as any);
    assert.match(rendered, /Mecca/);
    assert.match(rendered, /never relocate the Village/);
    assert.match(rendered, /narrator-only truths are not resident knowledge/);
    assert.match(rendered, /Later verified developments take precedence/);
  }
assert.match(
  renderResidentFoundingContext("Aqua", { ...defaults, historyMode: "new" }),
  /reference material, not factual memories/,
);
assert.match(
  renderResidentFoundingContext("Aqua", { ...defaults, historyMode: "adapt" }),
  /Preserve card history and authored memory limits/,
);
assert.equal(renderResidentFoundingContext("Legacy"), "");
assert.equal(readResidentFoundingContext(undefined), null);
for (const value of [
  { ...defaults, historyMode: "invalid" },
  { ...defaults, storyRole: "invalid" },
  { ...defaults, storyRole: "custom" },
  { ...defaults, customDescription: "x".repeat(241) },
  { ...defaults, background: " ".repeat(1201) },
  { ...defaults, background: 42 },
])
  assert.equal(readResidentFoundingContext(value), null);
assert.deepEqual({ ...readFoundingResidentContexts(undefined, ["aqua"]).aqua }, defaults);
assert.throws(() => readFoundingResidentContexts({ stranger: defaults }, ["aqua"]), /selected/);
assert.throws(() => readFoundingResidentContexts({ aqua: { ...defaults, storyRole: "custom" } }, ["aqua"]), /Custom/);

const card = readVillagerCard({
  id: "aqua",
  data: {
    name: "Aqua",
    personality: "Curious",
    description: "Aqua is best friends with Alex",
    extensions: { backstory: "Ran Aqua's Place in Mecca.", appearance: "Blue feathers" },
    post_history_instructions: "Speak softly.",
  },
} as any);
const state = defaultVillageState();
state.playerName = "Alex";
state.villagers = [
  {
    characterId: "aqua",
    cardSnapshot: { ...card, capturedAt: new Date().toISOString(), revision: 1, sourceStatus: "available" },
    foundingContext: context,
    addedAt: new Date().toISOString(),
    agenda: null,
    completedWishes: [],
  },
] as any;
const reloaded = coerceVillageState(state);
assert.deepEqual(reloaded.villagers[0].foundingContext, context);
assert.equal(reloaded.villagers[0].cardSnapshot.backstory, card.backstory);
const profile = venueCardProfile(readEffectiveVillagerCard(reloaded.villagers[0]));
assert.match(profile, /Ran Aqua's Place in Mecca/);
assert.match(profile, /Station Fields is elsewhere/);
assert.match(profile, /Speak softly/);
delete state.villagers[0].foundingContext;
assert.equal(coerceVillageState(state).villagers[0].foundingContext, undefined);
for (const mode of ["adapt", "new"] as const) {
  state.villagers[0].foundingContext = { ...context, historyMode: mode };
  const ties = proposeStartingTies(state, defaultRelationshipState(state.seed), ["Aqua is best friends with Alex"]);
  assert.ok(
    ties.every((tie) => !tie.established),
    "excluded card/lore ties are not imported",
  );
}
state.villagers[0].foundingContext = { ...defaults, historyMode: "adapt" };
assert.ok(
  proposeStartingTies(state, defaultRelationshipState(state.seed), []).some((tie) => tie.established),
  "blank Adapt preserves history",
);
state.villagers[0].foundingContext = { ...defaults, historyMode: "new" };
state.chronicle = [{ memoryCategory: "relationship", text: "Aqua is best friends with Alex" }] as any;
assert.ok(
  proposeStartingTies(state, defaultRelationshipState(state.seed), []).some((tie) => tie.established),
  "verified history survives continuity filtering",
);
let dispatches = 0;
const model: any = { fitContext: () => ({ messages: [] }), chatComplete: () => dispatches++ };
assert.throws(() => fitVenueWritingMessages(model, [{ text: profile }], "Hello", 1000), /No reply was requested/);
assert.equal(dispatches, 0);
console.log(
  "Resident continuity: choices, limits, legacy saves, full identity, relationship exclusions and required context verified.",
);

async function setupPersistence() {
  const docs = new Map<string, any>();
  docs.set("villages-connections", {
    data: {
      systemConnectionId: "fixture",
      narrationConnectionId: "fixture",
      imageConnectionId: "__villages_image_disabled__",
    },
  });
  let requests = 0;
  let suggesting = false;
  let loseContext = false;
  let responseMode = "valid";
  let outputLimit = 8000;
  const queued: VoidFunction[] = [];
  const originalFetch = globalThis.fetch;
  const originalQueue = globalThis.queueMicrotask;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /\/api\/connections$/);
    return Response.json([{ id: "fixture", provider: "openai" }]);
  };
  // Preparation dispatch is exercised by the founding-preparation regression.
  globalThis.queueMicrotask = (callback) => {
    if (String(callback).includes("prepareFoundedVillage")) queued.push(callback);
    else originalQueue(callback);
  };
  const release = configureVillagesRuntime({
    logger: { debug() {}, info() {}, warn() {}, error() {} },
    getAgentConfig: async () => ({ connectionId: "fixture" }),
    resources: {
      listCharacters: async () => [
        { id: "aqua", data: { name: "Aqua", extensions: { backstory: "Mecca remains in the full card." } } },
      ],
      listPersonas: async () => [{ id: "alex", data: { name: "Alex", description: "Explorer" } }],
      listLorebooks: async () => [],
    },
    persistence: {
      documents: {
        getById: async (_package: string, id: string) => structuredClone(docs.get(id) ?? null),
        list: async () => [],
        create: async (input: any) => {
          const row = { ...structuredClone(input), revision: 1 };
          docs.set(input.id, row);
          return row;
        },
        update: async (input: any) => {
          const prior = docs.get(input.id);
          assert.equal(input.expectedRevision, prior.revision);
          const row = { ...structuredClone(input), revision: prior.revision + 1 };
          docs.set(input.id, row);
          return row;
        },
      },
    },
    languageModels: {
      resolveForRequest: async () => {
        assert.ok(suggesting, "setup persistence must not request a model");
        return {
          model: "fixture",
          maxOutputTokens: outputLimit,
          fitContext: (messages: any[], options: any) => ({ ...options, messages: loseContext ? [] : messages }),
          chatComplete: async (messages: any[], options: any) => {
            requests++;
            assert.match(messages[0].content, /Mecca remains in the full card/);
            assert.match(messages[0].content, /Station Fields is elsewhere/);
            assert.match(messages[0].content, /narrator-only truths are not resident knowledge/);
            assert.equal(options.reasoningEffort, "none", "drafting leaves output room for the Venue list");
            assert.equal(options.maxTokens, Math.min(outputLimit, 4000));
            const input = JSON.parse(messages.at(-1).content);
            assert.deepEqual(
              input.responseTemplate.venues.map((venue: any) => venue.id),
              input.venues.map((venue: any) => venue.id),
            );
            if (responseMode === "blank") return { content: "", finishReason: "stop" };
            if (responseMode === "malformed") return { content: '{"venues":[', finishReason: "stop" };
            if (responseMode === "truncated") return { content: '{"venues":[', finishReason: "length" };
            if (responseMode === "max_tokens") return { content: '{"venues":[', finishReason: "max_tokens" };
            assert.match(input.setting, /orbital observatory/);
            return {
              content: JSON.stringify({
                venues: input.venues.map((venue: any) => ({
                  ...venue,
                  layout: "exterior",
                  name: venue.id + " space",
                  form: "Room",
                  description: "A doorway.",
                })),
              }),
              finishReason: "stop",
            };
          },
        };
      },
    },
  } as any);
  const input = {
    name: "Station Fields",
    setting: "An orbital observatory in an undecided world.",
    foundingReason: "none",
    foundingDetails: "We are neighbors beginning life at the observatory.",
    playerPersonaId: "alex",
    foundingCharacterIds: ["aqua"],
    venues: ["player", "aqua", "hall"].map((id, index) => ({
      id,
      name: id + " space",
      form: "Room in the observatory",
      description: "A corridor doorway.",
      category: id === "hall" ? "public-center" : "house",
      classes: [id === "hall" ? "gathering" : "residence"],
      layoutVersion: 1,
      layout: "exterior",
      spaces: [],
      privateSpaces: [],
      occupancy: { playerHome: id === "player", residentCharacterId: id === "aqua" ? id : null, homeKind: null },
      presentation: { x: 0.2 + index * 0.2, y: 0.5 },
    })),
  };
  try {
    const suggestionInput = {
      ...input,
      foundingResidentContexts: { aqua: context },
      venues: input.venues.map((venue) => ({
        ...venue,
        venueClass: venue.id === "hall" ? "gathering" : "residence",
        residentCharacterId: venue.occupancy.residentCharacterId ?? "",
      })),
    };
    suggesting = true;
    loseContext = true;
    await assert.rejects(suggestStartingVenues(suggestionInput), /No reply was requested/);
    assert.equal(requests, 0);
    loseContext = false;
    assert.equal((await suggestStartingVenues(suggestionInput)).venues.length, 3);
    assert.equal(requests, 1, "resident context uses the existing suggestion request");
    for (const [mode, error] of [
      ["blank", /readable Venue suggestions/],
      ["malformed", /readable Venue suggestions/],
      ["truncated", /ran out of output room/],
      ["max_tokens", /ran out of output room/],
    ] as const) {
      responseMode = mode;
      const before = requests;
      const saved = structuredClone([...docs].filter(([id]) => id !== "villages-ai-usage"));
      const draft = structuredClone(suggestionInput);
      await assert.rejects(suggestStartingVenues(suggestionInput), error);
      assert.equal(requests, before + 1, "failed drafting makes only one model request");
      assert.deepEqual(
        [...docs].filter(([id]) => id !== "villages-ai-usage"),
        saved,
        "failed drafting cannot change the saved world",
      );
      assert.deepEqual(suggestionInput, draft, "failed drafting cannot change the founding draft");
    }
    responseMode = "valid";
    outputLimit = 1024;
    assert.equal(
      (await suggestStartingVenues(suggestionInput)).venues.length,
      3,
      "the connection's lower output limit is honored",
    );
    suggesting = false;
    requests = 0;
    for (const invalid of [{ stranger: context }, { aqua: { ...defaults, storyRole: "custom" } }]) {
      await assert.rejects(
        runVillageSetup({ ...input, foundingResidentContexts: invalid }),
        (error: any) => error.statusCode === 400,
      );
      assert.equal(docs.get("villages-village")?.data.setupAt ?? "", "");
    }
    const snapshot = await runVillageSetup({ ...input, foundingResidentContexts: { aqua: context } });
    assert.deepEqual(snapshot.villagers[0].foundingContext, context);
    const saved = coerceVillageState(docs.get("villages-village").data);
    assert.deepEqual(saved.villagers[0].foundingContext, context);
    assert.equal(saved.villagers[0].cardSnapshot.backstory, "Mecca remains in the full card.");
    const home = saved.venues.find((venue) => venue.id === "aqua")!;
    home.imageContext = { ...home.imageContext, useAssignedVillagerContext: true };
    assert.match(sceneryCharacterContext(saved, home), /Station Fields is elsewhere/);
    const imageKey = sceneryImageKey(saved, home);
    saved.villagers[0].foundingContext = { ...context, background: "A different starting background." };
    assert.notEqual(sceneryImageKey(saved, home), imageKey);
    home.imageContext.useAssignedVillagerContext = false;
    assert.equal(sceneryCharacterContext(saved, home), "", "image opt-out excludes resident background");
    assert.equal(requests, 0);
    assert.equal(queued.length, 1, "only the existing preparation job is queued");
    console.log("Production setup validates and persists resident context separately from the captured card.");
  } finally {
    release();
    globalThis.fetch = originalFetch;
    globalThis.queueMicrotask = originalQueue;
  }
}
void setupPersistence().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
