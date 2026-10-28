import assert from "node:assert/strict";
import { createFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts-service.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { parseFoundingVenueSuggestions } from "../packages/villages/src/server/domain/rules/founding-draft-rules.js";
import { arrangeQuickStartVenues } from "../packages/villages/src/client/features/founding/quick-start-placement.js";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { calculateSetupBeginningSourceKey } from "../packages/villages/src/client/features/founding/calculations.js";
import {
  quickStartTemplates,
  replaceQuickStartVenue,
} from "../packages/villages/src/client/features/founding/quick-start-drafts.js";
import { addFoundingZone } from "../packages/villages/src/client/features/founding/founding-template.js";
import { foundingZoneProblem } from "../packages/villages/src/client/features/founding/villages-founding-zones.js";
import { foundingVenueIssues } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { extractFoundingVenueReply } from "../packages/villages/src/server/domain/rules/founding-venue-reply.js";

const rows = [
  { id: "player", venueClass: "residence", residentCharacterId: "", form: "Stolen hearse" },
  { id: "buster", venueClass: "residence", residentCharacterId: "buster", form: "Dumpster" },
  { id: "community", venueClass: "community", residentCharacterId: "", form: "Covered market" },
];
const suggestions = rows.map((row) => ({
  id: row.id,
  name: `${row.id} refuge`,
  venueType: row.venueClass,
  form: row.form,
  description: "A sheltered entrance off the dock.",
  layout: row.venueClass === "community" ? "common" : "both",
  connections:
    row.venueClass === "community"
      ? [["exterior", "common:base"]]
      : [
          ["exterior", "common:base"],
          ["common:base", "private:base"],
        ],
  commonName: "Meeting nook",
  commonPurpose: "Welcoming company",
  commonDescription: "A bench beside the opening.",
  privateName: row.venueClass === "community" ? "" : "Resting nook",
  privatePurpose: row.venueClass === "community" ? "" : "Resting and storing belongings",
  privateDescription: row.id === "player" ? "A berth behind a curtain." : "Secret must never leave the server",
}));
const parsed = parseFoundingVenueSuggestions(
  { venues: suggestions },
  rows.map((row) => row.id),
  rows,
  true,
);
assert.equal(parsed[0].privateDescription, "A berth behind a curtain.");
const draft = newSetupVenue("player", "residence", 0.2, 0.3, true);
draft.name = "Authored name";
draft.form = "Authored form";
draft.spaces![0].name = "My authored cabin";
draft.spaces![0].image = { id: "photo", ref: "global-gallery:photo", url: "/photo.webp" };
draft.spaces!.push({ ...draft.spaces![0], id: "extra", name: "Extra" });
draft.destinations = { player: { sleep: "extra" } };
draft.zoneLayout = { exterior: { x: 0, y: 0 }, extra: { x: 3, y: 0 } };
const before = structuredClone(draft);
const fresh = quickStartTemplates([draft])[0];
const complete = replaceQuickStartVenue(fresh, parsed[0]);
assert.deepEqual(draft, before, "preparing fresh inputs never mutates the draft");
assert.equal(complete.name, parsed[0].name);
assert.equal(complete.form, parsed[0].form);
assert.equal(complete.spaces![0].name, parsed[0].commonName);
assert.equal(complete.spaces!.length, 1);
assert.equal(complete.privateSpaces!.length, 1);
assert.equal(complete.spaces![0].image, null);
assert.equal(complete.destinations, undefined);
assert.equal(complete.zoneLayout, undefined);
assert.deepEqual(foundingVenueIssues([complete]), []);
assert.doesNotThrow(() => parsePlace(complete, true));
for (const personal of [false, true]) {
  const added = addFoundingZone(complete, personal, "zone:new");
  assert.match(foundingZoneProblem(added), /describe what it is used for/);
  const zone = (personal ? added.privateSpaces! : added.spaces!).at(-1)!;
  assert.equal(zone.purpose, "");
  assert.equal(zone.description, "");
  assert.throws(() => parsePlace(added, true), /name and purpose/);
  zone.purpose = "Authored purpose";
  zone.description = "Authored appearance";
  assert.equal(foundingZoneProblem(added), "");
  assert.doesNotThrow(() => parsePlace(added, true));
}
const templates = quickStartTemplates([
  draft,
  { ...draft, id: "npc", occupancy: { ...draft.occupancy, playerHome: false, residentCharacterId: "buster" } },
  newSetupVenue("community", "community", 0.5, 0.5),
]);
assert.deepEqual(
  templates.map((row) => [row.spaces!.length, row.privateSpaces!.length]),
  [
    [1, 1],
    [1, 1],
    [1, 0],
  ],
);
assert.equal(templates[1].privateSpaces![0].ownerId, "buster");
assert.equal(replaceQuickStartVenue(templates[1], parsed[1]).privateSpaces![0].description, "");
assert.equal(templates[2].category, "public-center");
assert.equal(Object.hasOwn(parsed[1], "privateDescription"), false, "villager interior is not returned to the client");
for (const layout of ["common", "private", "exterior"])
  assert.throws(
    () =>
      parseFoundingVenueSuggestions(
        { venues: [{ ...suggestions[0], layout }, ...suggestions.slice(1)] },
        rows.map((row) => row.id),
        rows,
        true,
      ),
    /both Common Space and Private Space/,
  );
assert.throws(
  () =>
    parseFoundingVenueSuggestions(
      { venues: suggestions.map((row) => (row.id === "community" ? { ...row, layout: "both" } : row)) },
      rows.map((row) => row.id),
      rows,
      true,
    ),
  /Common only/,
);
assert.throws(
  () =>
    parseFoundingVenueSuggestions(
      { venues: suggestions.map((row) => (row.id === "player" ? { ...row, privateDescription: "" } : row)) },
      rows.map((row) => row.id),
      rows,
      true,
    ),
  /privateDescription/,
);
assert.throws(
  () =>
    parseFoundingVenueSuggestions(
      { venues: suggestions.slice(1) },
      rows.map((row) => row.id),
      rows,
      true,
    ),
  /exactly once/,
);
assert.doesNotThrow(
  () =>
    parseFoundingVenueSuggestions(
      { venues: [{ ...suggestions[0], layout: "common", connections: [["exterior", "common:base"]] }] },
      ["player"],
      [rows[0]],
    ),
  "Advanced keeps optional space layouts",
);

let input: any;
let system = "";
let loreQuery = "";
let calls = 0;
const replyState: { override?: unknown; content?: string; finishReason?: string } = {};
const model = {
  maxOutputTokens: 4000,
  fitContext: (messages: unknown[], options: any) => ({ messages, maxTokens: options.maxTokens }),
};
const service = createFoundingDrafts({
  findVillagerCard: async (id) =>
    readVillagerCard({
      id,
      comment: "",
      data: { name: "Buster", description: "Makes a home in discarded shelters", personality: "Resourceful" },
    }),
  readLinkedPersona: async () => ({ name: "Driver", identity: "Sleeps in a stolen hearse" }),
  readVillageLore: async (_ids, query) => {
    loreQuery = query;
    return ["The old market stands at the waterfront."];
  },
  villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
  villagesConnectionIdFor: async () => "synthetic-system",
  completeWithRoom: async (_model, messages) => {
    calls++;
    system = String(messages[0].content);
    input = JSON.parse(String(messages[1].content));
    return {
      content:
        replyState.content ??
        JSON.stringify(
          replyState.override ?? {
            venues: suggestions.filter((row) =>
              input.responseTemplate.venues.some((requested: any) => requested.id === row.id),
            ),
          },
        ),
      finishReason: replyState.finishReason ?? "stop",
    };
  },
} as any);
const request = {
  mode: "quick-start",
  villageName: "Tidebreak",
  setting: "A coastal settlement made of salvaged shelters",
  worldFacts: ["The tide floods the lower street"],
  scenarioImprint: {
    origin: "Dockside shelter",
    worldFacts: ["The railway is abandoned"],
    openingConditions: [],
    visualCues: [],
  },
  playerPersonaId: "driver",
  selectedLorebookIds: ["coast"],
  loreTokenBudget: 1600,
  venues: rows,
};
const generated = await service.suggestStartingVenues(request);
assert.deepEqual(generated.venues, parsed);
assert.equal(calls, 1, "one explicit generation makes one model request");
assert.match(system, /EVERY Residence MUST have layout both/);
assert.match(system, /dumpster.*train car.*stolen hearse/);
assert.match(system, /Sleeps in a stolen hearse/);
assert.match(system, /discarded shelters/);
assert.match(system, /old market/);
assert.deepEqual(input.worldFacts, request.worldFacts);
assert.deepEqual(input.scenario, request.scenarioImprint);
assert.equal(input.villageName, "Tidebreak");
assert.match(loreQuery, /tide floods/);
assert.match(loreQuery, /railway is abandoned/);
assert.deepEqual(
  input.responseTemplate.venues.map((row: any) => row.layout),
  ["both", "both", "common"],
);
const single = await service.suggestStartingVenues({ ...request, targetVenueId: "buster" });
assert.deepEqual(
  single.venues.map((row) => row.id),
  ["buster"],
  "regeneration requests only the chosen Venue",
);
assert.equal(input.venues.length, 3, "other venues remain contextual inputs");
assert.equal(input.responseTemplate.venues.length, 1);
await assert.rejects(
  service.suggestStartingVenues({ ...request, targetVenueId: "outsider" }),
  /required starting Venue/,
);
await assert.rejects(service.suggestStartingVenues({ ...request, mode: "automatic" }), /valid Venue suggestion mode/);
assert.equal(calls, 2, "invalid requests never reach the model");
replyState.override = { venues: suggestions.map((row) => (row.id === "buster" ? { ...row, layout: "private" } : row)) };
await assert.rejects(service.suggestStartingVenues(request), /both Common Space and Private Space/);
assert.equal(calls, 3, "invalid model output is rejected without an automatic paid retry");

// Recover complete values locally; formatting never authorizes another model request.
const reply = JSON.stringify({ venues: suggestions });
const formattedReplies = [
  reply,
  `\uFEFF${reply}`,
  `Here are the suggestions:\n\x60\x60\x60json\n${reply}\n\x60\x60\x60`,
  `Use {name} as a label.\n${reply}\nDone {end}.`,
  `<think>Example: {"venues":[]}\nDo not use this example.</think>\n${reply}`,
  `<analysis>Not the answer: {"venues":[]}</analysis>\n\x60\x60\x60json\n${reply}\n\x60\x60\x60`,
  JSON.stringify(suggestions),
  JSON.stringify(reply),
  `{"venues":[${suggestions.map((row) => JSON.stringify(row).replace(/}$/, ",}")).join(",")},],}`,
];
for (const content of formattedReplies) {
  assert.deepEqual(extractFoundingVenueReply(content), { venues: suggestions });
  replyState.content = content;
  const before = calls;
  assert.deepEqual(await service.suggestStartingVenues(request), { venues: parsed });
  assert.equal(calls, before + 1, "format recovery uses exactly the already-returned reply");
}
const punctuation = {
  venues: [
    { ...suggestions[0], description: 'A {curved} doorway with a sign reading "Come in",] and a path C:\\dock.' },
  ],
};
assert.deepEqual(
  extractFoundingVenueReply(`Here it is:\n${JSON.stringify(punctuation)}\nEnd {note}.`),
  punctuation,
  "quoted braces, escapes and comma-close text survive verbatim",
);
for (const content of [
  "This is a lovely village.",
  "<html>Connection unavailable</html>",
  reply.slice(0, -1),
  `{"venues":[${JSON.stringify(suggestions[0])},`,
  `<think>Unfinished reasoning ${reply}`,
  `${reply}\n${reply}`,
  `Example {"venues":[]}\nFinal ${reply}`,
  `{"venues":[${JSON.stringify(suggestions[0])},,]}`,
  "{'venues':[]}",
  `${reply}, action: null`,
  `{true} ${reply}`,
  `${reply} {null}`,
  `${reply} {false}`,
]) {
  assert.equal(
    extractFoundingVenueReply(content),
    null,
    "never invent missing values or choose between alternative answers",
  );
  replyState.content = content;
  const before = calls;
  await assert.rejects(service.suggestStartingVenues(request), (error: Error) => {
    assert.match(error.message, /one complete, readable set/);
    assert.ok(
      !error.message.includes("supporting JSON responses"),
      "malformed output is not proof of unsupported JSON mode",
    );
    return true;
  });
  assert.equal(calls, before + 1, "invalid output has no automatic retry");
}
replyState.content = JSON.stringify({ venues: suggestions.slice(1) });
await assert.rejects(
  service.suggestStartingVenues(request),
  /every starting Venue exactly once/,
  "format recovery retains complete-roster validation",
);
replyState.content = JSON.stringify({
  venues: suggestions.map((row) => (row.id === "player" ? { ...row, form: "" } : row)),
});
await assert.rejects(
  service.suggestStartingVenues(request),
  /form/,
  "format recovery retains required text validation",
);
replyState.content = reply;
replyState.finishReason = "length";
const beforeTruncation = calls;
await assert.rejects(
  service.suggestStartingVenues(request),
  /ran out of output room/,
  "an output-limit finish is never recovered as a complete answer",
);
assert.equal(calls, beforeTruncation + 1);
delete replyState.content;
delete replyState.finishReason;

for (const count of [3, 4, 5]) {
  const venues = Array.from({ length: count }, (_, index) => {
    const venue = newSetupVenue(String(index), index === count - 1 ? "community" : "residence", 0.2, 0.3, index === 0);
    venue.presentation.x = index === 0 ? 0.22 : null;
    venue.presentation.y = index === 0 ? 0.28 : null;
    return venue;
  });
  const arranged = arrangeQuickStartVenues(venues);
  assert.equal(arranged[0], venues[0], "existing authored position is preserved");
  assert.equal(new Set(arranged.map((row) => `${row.presentation.x}:${row.presentation.y}`)).size, count);
  assert.ok(arranged.every((row) => row.presentation.x !== null && row.presentation.y !== null));
  assert.deepEqual(arrangeQuickStartVenues(arranged), arranged, "retry does not move existing pins");
}
const context: any = {
  personaDraft: "driver",
  setupSetting: request.setting,
  setupLorebookDraft: [],
  selectedResidentAdmissions: {},
  setupWorldFacts: request.worldFacts,
  setupName: "Tidebreak",
};
const key = calculateSetupBeginningSourceKey(context);
for (const patch of [
  { setupWorldFacts: ["Changed fact"] },
  { setupName: "Changed name" },
  { setupSetting: "A thriving farm" },
  { setupWorldName: "Othiras" },
])
  assert.notEqual(
    calculateSetupBeginningSourceKey({ ...context, ...patch }),
    key,
    "changed context fences old suggestions",
  );
console.log(
  "Quick Start: fresh replacement, template defaults, hidden villager interiors and one-call generation pass (synthetic model).",
);
