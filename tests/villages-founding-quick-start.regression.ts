import assert from "node:assert/strict";
import { createFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts-service.js";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { parseFoundingVenueSuggestions } from "../packages/villages/src/server/domain/rules/founding-draft-rules.js";
import { arrangeQuickStartVenues } from "../packages/villages/src/client/features/founding/quick-start-placement.js";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { calculateSetupBeginningSourceKey } from "../packages/villages/src/client/features/founding/calculations.js";
import {
  quickStartTemplates,
  separateFoundingTemplates,
  replaceQuickStartVenue,
} from "../packages/villages/src/client/features/founding/quick-start-drafts.js";
import { addFoundingZone } from "../packages/villages/src/client/features/founding/founding-template.js";
import { foundingZoneProblem } from "../packages/villages/src/client/features/founding/villages-founding-zones.js";
import { foundingVenueIssues } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state.js";
import { parsePlace, parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";
import { extractFoundingVenueReply } from "../packages/villages/src/server/domain/rules/founding-venue-reply.js";

const rows = [
  {
    id: "player",
    residentIds: [],
    playerHome: true,
    residentCharacterId: "",
    form: "Stolen hearse",
  },
  {
    id: "buster",
    residentIds: ["buster"],
    playerHome: false,
    residentCharacterId: "buster",
    form: "Dumpster",
  },
  {
    id: "community",
    residentIds: [],
    playerHome: false,
    residentCharacterId: "",
    form: "Covered market",
  },
];
const suggestions = rows.map((row) => ({
  id: row.id,
  name: `${row.id} refuge`,
  venueType: row.playerHome || row.residentIds?.length ? "Home" : "Gathering place",
  form: row.form,
  description: "A sheltered entrance off the dock.",
  layout: !(row.playerHome || !!row.residentIds?.length) ? "common" : "both",
  connections: !(row.playerHome || !!row.residentIds?.length)
    ? [["exterior", "common:base"]]
    : [
        ["exterior", "common:base"],
        ["common:base", "private:base"],
      ],
  commonName: "Meeting nook",
  commonPurpose: "Welcoming company",
  commonDescription: "A bench beside the opening.",
  privateName: !(row.playerHome || !!row.residentIds?.length) ? "" : "Resting nook",
  privatePurpose: !(row.playerHome || !!row.residentIds?.length) ? "" : "Resting and storing belongings",
  privateDescription: row.id === "player" ? "A berth behind a curtain." : "A resident berth with a blue blanket.",
}));
const parsed = parseFoundingVenueSuggestions(
  { venues: suggestions },
  rows.map((row) => row.id),
  rows,
  true,
);
assert.equal(parsed[0].privateDescription, "A berth behind a curtain.");
const draft = newSetupVenue("player", 0.2, 0.3, true);
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
{
  const image = { id: "uploaded", ref: "global-gallery:uploaded", url: "/uploaded.png" };
  const uploaded = parsePlace(
    {
      ...complete,
      freezePicture: true,
      presentation: { ...complete.presentation, image },
      zones: [{ id: "exterior", name: "Front door", kind: "exterior" }],
      spaces: complete.spaces?.map((space) => ({ ...space, image, freezePicture: true })),
    },
    true,
  );
  assert.equal(uploaded.zones![0].name, "Front door");
  assert.deepEqual(uploaded.zones![0].image, image);
  assert.equal(uploaded.zones![0].freezePicture, true);
  for (const space of uploaded.zones!.filter((zone) => zone.kind === "public")) {
    assert.deepEqual(space.image, image);
    assert.equal(space.freezePicture, true, "Founding preserves direct uploaded art and pinning");
  }
}
for (const personal of [false, true]) {
  const added = addFoundingZone(complete, personal, "zone:new");
  assert.equal(foundingZoneProblem(added), "", "New Zones have usable, editable defaults");
  const zone = (personal ? added.privateSpaces! : added.spaces!).at(-1)!;
  assert.ok(zone.purpose);
  assert.ok(zone.description);
  assert.doesNotThrow(() => parsePlace(added, true));
  zone.purpose = "";
  assert.match(foundingZoneProblem(added), /describe what it is used for/);
  assert.throws(() => parsePlace(added, true), /name and purpose/);
  zone.purpose = "Authored purpose";
  zone.description = "Authored appearance";
  assert.equal(foundingZoneProblem(added), "");
  assert.doesNotThrow(() => parsePlace(added, true));
}
const templates = quickStartTemplates([
  draft,
  {
    ...draft,
    id: "npc",
    residentIds: ["buster"],
    occupancy: { ...draft.occupancy, playerHome: false, residentCharacterId: "buster" },
  },
  { ...newSetupVenue("community", 0.5, 0.5), category: "public-center" },
]);
assert.deepEqual(
  templates.map((row) => [row.spaces!.length, row.privateSpaces!.length]),
  [
    [1, 1],
    [1, 1],
    [2, 0],
  ],
);
assert.equal(templates[1].privateSpaces![0].ownerId, "buster");
assert.equal(
  replaceQuickStartVenue(templates[1], parsed[1]).privateSpaces![0].description,
  "A resident berth with a blue blanket.",
);
assert.equal(templates[2].category, "public-center");
assert.equal(parsed[1].privateDescription, "A resident berth with a blue blanket.");
const standardCommunity = replaceQuickStartVenue(templates[2], parsed[2]);
assert.equal(standardCommunity.spaces!.length, 2);
assert.deepEqual(
  standardCommunity.spaces!.map((zone) => zone.connectedTo),
  [["exterior"], ["exterior"]],
);
assert.ok(standardCommunity.spaces!.every((zone) => zone.access?.mode === "public" && !zone.ownerId));
assert.equal(standardCommunity.privateSpaces!.length, 0);
assert.deepEqual(foundingVenueIssues([standardCommunity]), []);
assert.doesNotThrow(() => parsePlace(standardCommunity, true));
for (const layout of ["common", "private"]) {
  const suggestion = {
    ...suggestions[0],
    layout,
    connections: layout === "common" ? [["exterior", "common:base"]] : [["exterior", "private:base"]],
  };
  assert.equal(
    parseFoundingVenueSuggestions(
      { venues: [suggestion, ...suggestions.slice(1)] },
      rows.map((row) => row.id),
      rows,
      true,
    )[0].layout,
    layout,
    "a private sleeping room is optional",
  );
  const fixed = replaceQuickStartVenue(fresh, suggestion as any);
  assert.equal(fixed.layout, "both", "Older generated layouts fill the standard template");
  assert.equal(fixed.spaces!.length, 1);
  assert.equal(fixed.privateSpaces!.length, 1);
  assert.deepEqual(foundingVenueIssues([fixed]), []);
}
assert.throws(
  () =>
    parseFoundingVenueSuggestions(
      { venues: [{ ...suggestions[0], layout: "exterior" }, ...suggestions.slice(1)] },
      rows.map((row) => row.id),
      rows,
      true,
    ),
  /Common or Private/,
);
assert.throws(
  () =>
    parseFoundingVenueSuggestions(
      { venues: suggestions.map((row) => (row.id === "community" ? { ...row, layout: "both" } : row)) },
      rows.map((row) => row.id),
      rows,
      true,
    ),
  /Unreachable Zones/,
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
    input = JSON.parse(String(messages.at(-1)!.content));
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
  openingVenueId: "community",
  context: {
    rules: "The tide floods the lower street",
    circumstances: [{ scope: "village", summary: "The railway is abandoned" }],
  },
  playerPersonaId: "driver",
  selectedLorebookIds: ["coast"],
  loreTokenBudget: 1600,
  venues: rows,
};
const generated = await service.suggestStartingVenues(request);
assert.deepEqual(generated.venues, parsed);
assert.equal(calls, 1, "one explicit generation makes one model request");
assert.match(system, /Every Residence, including the player's/);
assert.match(system, /dumpster.*train car.*stolen hearse/);
assert.match(system, /Sleeps in a stolen hearse/);
assert.match(system, /discarded shelters/);
assert.doesNotMatch(system, /old market/, "Lorebook data is separate from instructions");
assert.equal(input.worldRules, request.context.rules);
assert.deepEqual(input.currentCircumstances, ["The railway is abandoned"]);
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
const scoped = await service.suggestStartingVenues({ ...request, mode: undefined, targetVenueId: "buster" });
assert.deepEqual(
  scoped.venues.map((venue) => venue.id),
  ["buster"],
  "Ordinary selected-Venue details require one response row",
);
assert.match(system, /keeps all existing Zones/);
const beforeInvalidModel = calls;
replyState.override = {
  venues: suggestions.map((row) => (row.id === "buster" ? { ...row, layout: "exterior" } : row)),
};
await assert.rejects(service.suggestStartingVenues(request), /Common or Private/);
assert.equal(calls, beforeInvalidModel + 1, "invalid model output is rejected without an automatic paid retry");

{
  replyState.override = undefined;
  const selectedPlace = {
    ...request,
    mode: undefined,
    venues: rows.map((row) => (row.id === "community" ? { ...row } : row)),
  };
  await service.suggestStartingVenues(selectedPlace);
  assert.equal(input.openingVenueId, "community");
  assert.equal(
    input.responseTemplate.venues.find((row: any) => row.id === "community").layout,
    "exterior|common|private|both",
    "Opening location does not impose a Venue class or layout",
  );
  replyState.override = {
    venues: suggestions.map((row) =>
      row.id === "community"
        ? {
            ...row,
            layout: "private",
            commonName: "",
            commonPurpose: "",
            commonDescription: "",
            privateName: "Closed room",
            privatePurpose: "Private use",
            privateDescription: "An enclosed room",
            connections: [["exterior", "private:base"]],
          }
        : row,
    ),
  };
  const ordinary = await service.suggestStartingVenues(selectedPlace);
  assert.equal(ordinary.venues.find((row) => row.id === "community")!.layout, "private");
  replyState.override = undefined;
}

{
  const priorCommunity = suggestions.find((row) => row.id === "community")!;
  replyState.override = {
    venues: [
      ...suggestions.map((row) =>
        row.id === "community"
          ? {
              ...row,
              layout: "both",
              privateName: "Archive",
              privatePurpose: "Storage",
              privateDescription: "A quiet archive",
              connections: [
                ["exterior", "common:base"],
                ["common:base", "private:base"],
              ],
            }
          : row,
      ),
      { ...priorCommunity, id: "courtyard", name: "New courtyard" },
    ],
  };
  const moved = {
    ...request,
    openingVenueId: "courtyard",
    venues: [...rows, { ...rows.find((row) => row.id === "community")!, id: "courtyard" }],
  };
  const result = await service.suggestStartingVenues(moved);
  assert.equal(
    result.venues.find((row) => row.id === "community")!.layout,
    "both",
    "A former Community Venue can have an ordinary layout",
  );
  assert.equal(result.venues.find((row) => row.id === "courtyard")!.layout, "common");
  replyState.override = undefined;
}

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

for (const count of [3, 4, 5, 16]) {
  const venues = Array.from({ length: count }, (_, index) => {
    const venue = newSetupVenue(String(index), 0.2, 0.3, index === 0);
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
  setupContext: request.context,
  setupName: "Tidebreak",
};
const key = calculateSetupBeginningSourceKey(context);
for (const patch of [
  { setupContext: { ...request.context, rules: "Changed rule" } },
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
  "Quick Start: fresh replacement, template defaults, visible villager interiors and one-call generation pass (synthetic model).",
);

{
  let paid = 0;
  const drafts = createFoundingDrafts({
    villagesLanguageModels: () => {
      paid++;
      throw Error("Unexpected model lookup");
    },
  } as any);
  await assert.rejects(
    drafts.suggestStartingVenues({
      setting: "A local community",
      context: {},
      venues: Array.from({ length: 17 }, (_, i) => ({ id: String(i) })),
    }),
    /sixteen/,
  );
  assert.equal(paid, 0, "Capacity rejects before any generation");
}

{
  const separate = arrangeQuickStartVenues(
    separateFoundingTemplates(["a", "b", "c"], "community").map((row) => ({
      ...row,
      layout: row.occupancy.playerHome || !!row.residentIds?.length ? "both" : "common",
    })),
  );
  const collision = separateFoundingTemplates(["a"], "founding-home:a");
  assert.equal(new Set(collision.map((row) => row.id)).size, 4, "Opening IDs never collide with replacement homes");
  assert.equal(separate.length, 6);
  const stored = parsePlaces(separate, new Set(["a", "b", "c"]), true);
  assert.ok(
    stored
      .filter((row) => row.occupancy.playerHome || !!row.residentIds?.length)
      .every((row) => row.residentIds!.length + Number(row.occupancy.playerHome) === 1),
  );
  assert.throws(() =>
    parsePlaces(
      separate.map((row) =>
        row.id === "founding-home:a" ? { ...row, residentIds: ["a", "b"], residenceCapacity: 2 } : row,
      ),
      new Set(["a", "b", "c"]),
      true,
    ),
  );
  for (const ordinary of [
    [...separate, newSetupVenue("extra", 0.5, 0.5)],
    separate.map((row) => (row.id === "founding-home:a" ? { ...row, workerIds: ["a"] } : row)),
    separate.map((row) =>
      row.id === "community" ? { ...row, spaces: row.spaces?.map((zone) => ({ ...zone })) } : row,
    ),
  ])
    assert.doesNotThrow(() => parsePlaces(ordinary, new Set(["a", "b", "c"]), true));
  for (const opening of ["founding-garden", "founding-home:a"]) {
    const replacement = separateFoundingTemplates(["a"], opening);
    assert.equal(new Set(replacement.map((row) => row.id)).size, replacement.length);
    assert.equal(replacement.filter((row) => !(row.occupancy.playerHome || !!row.residentIds?.length)).length, 2);
  }
  const { calculateSetupMapSrc } = await import("../packages/villages/src/client/features/founding/calculations.js");
  assert.equal(
    calculateSetupMapSrc({
      setupMapSource: "simple",
      setupMapImage: "",
      setupMapImageSource: "upload",
      townMapImage: "",
    }),
    null,
    "The grid placeholder never counts as submitted artwork",
  );
  assert.equal(
    calculateSetupMapSrc({
      setupMapSource: "upload",
      setupMapImage: "uploaded",
      setupMapImageSource: "upload",
      townMapImage: "",
    }),
    "uploaded",
  );
}
