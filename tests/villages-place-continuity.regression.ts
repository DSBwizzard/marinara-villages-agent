// Test cases: places/patches, places/expiry, places/authority, places/source-evidence, places/scene-replay, places/project-baseline, places/artwork-budget, places/access
import assert from "node:assert/strict";
import { sceneryPrompt } from "../packages/villages/src/server/domain/rules/scenery-context.js";
import {
  MAX_IMAGE_PROMPT_LENGTH,
  readPrompt,
} from "../packages/villages/src/server/domain/rules/image-generation-rules.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { semanticPhysicalContext } from "../packages/villages/src/server/domain/rules/semantic-timeline.js";
import { applyVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import { venueDesignHash } from "../packages/villages/src/server/domain/rules/project-structure.js";
import { venue } from "./fixtures/villages-projects.fixture.js";
import { runCase } from "../scripts/test-cases.mjs";
import {
  applyPlaceUpdate,
  assertPlaceAuthority,
  readPlaceContinuity,
} from "../packages/villages/src/server/domain/rules/zone-continuity.js";
import { emptyPlaceContinuity, recentPlaceText } from "../packages/villages/src/shared/helpers/place-continuity.js";
const at = "2026-10-28T10:00:00.000Z";
const sceneFixture = () => {
  const state = defaultVillageState();
  state.seed = "places";
  state.venues = [venue()];
  const scene = coerceSession({
    version: 3,
    id: "s",
    villageSeed: state.seed,
    placeId: "cafe",
    zoneId: "common",
    area: "public",
    startedAt: at,
    status: "active",
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [],
  });
  return { state, scene };
};
const room = () => ({ description: "White walls. Two windows. An oak table.", state: emptyPlaceContinuity() });
await runCase("places/patches", () => {
  const before = room();
  const after = applyPlaceUpdate(
    before,
    { narration: "Shelves installed.", expectedRevision: 0, append: "Shelves on the north wall." },
    at,
  );
  assert.equal(after.description, before.description + "\nShelves on the north wall.");
  assert.equal(
    applyPlaceUpdate(
      { ...before, description: "White walls.  " },
      { narration: "Added.", expectedRevision: 0, append: "Shelves." },
      at,
    ).description,
    "White walls.  \nShelves.",
  );
  assert.equal(before.state.revision, 0);
  assert.equal(after.state.revision, 1);
  const blue = applyPlaceUpdate(
    after,
    { narration: "Repainted.", expectedRevision: 1, edits: [{ before: "White", after: "Blue" }] },
    at,
  );
  assert.match(blue.description, /Two windows\. An oak table/);
  for (const edits of [
    [{ before: "missing", after: "new" }],
    [{ before: "", after: "new" }],
    [
      { before: "White walls", after: "Blue" },
      { before: "walls", after: "paint" },
    ],
  ])
    assert.throws(() => applyPlaceUpdate(before, { narration: "Changed.", expectedRevision: 0, edits }, at));
  assert.throws(() =>
    applyPlaceUpdate(
      { ...before, description: "wall wall" },
      { narration: "Changed.", expectedRevision: 0, edits: [{ before: "wall", after: "floor" }] },
      at,
    ),
  );
  assert.throws(() => applyPlaceUpdate(before, { narration: "Changed.", expectedRevision: 1, append: "New" }, at));
  assert.throws(() =>
    applyPlaceUpdate(before, { narration: "Changed.", expectedRevision: 0, append: "x".repeat(4001) }, at),
  );
  assert.throws(() =>
    applyPlaceUpdate(before, { narration: "Changed.", expectedRevision: 0, featureId: "invented" }, at),
  );
});
await runCase("places/expiry", () => {
  assert.equal(
    applyPlaceUpdate(
      { description: "", state: emptyPlaceContinuity() },
      { narration: "Tea laid out.", expectedRevision: 0, recent: { text: "Cups after tea." } },
      at,
    ).description,
    "",
    "temporary continuity does not require invented enduring prose",
  );
  const one = applyPlaceUpdate(
    room(),
    { narration: "Tea laid out.", expectedRevision: 0, recent: { text: "Tea laid out." } },
    at,
  );
  const two = applyPlaceUpdate(
    one,
    { narration: "Chairs moved.", expectedRevision: 1, recent: { text: "Tea and chairs." } },
    "2026-10-28T20:00:00.000Z",
  );
  assert.equal(two.state.recent!.expiresAt, "2026-10-29T10:00:00.000Z");
  assert.equal(recentPlaceText(two.state, "2026-10-29T10:00:00.000Z"), "");
  const renewed = applyPlaceUpdate(
    two,
    {
      narration: "Arrangement maintained.",
      expectedRevision: 2,
      recent: { text: "Fresh tea and chairs.", renew: true },
    },
    "2026-10-28T21:00:00.000Z",
  );
  assert.equal(renewed.state.recent!.expiresAt, "2026-10-29T21:00:00.000Z");
  assert.deepEqual(readPlaceContinuity(JSON.parse(JSON.stringify(renewed.state))), renewed.state);
  assert.throws(() => readPlaceContinuity({ ...renewed.state, recent: { ...renewed.state.recent, expiresAt: at } }));
});
await runCase("places/authority", () => {
  const evidence = { actorIds: ["player"], witnessIds: ["owner"], consentIds: [] as string[] };
  assert.throws(() => assertPlaceAuthority(evidence, ["owner"], ["owner"]));
  assert.doesNotThrow(() => assertPlaceAuthority({ ...evidence, consentIds: ["owner"] }, ["owner"], ["owner"]));
  assert.throws(() => assertPlaceAuthority({ ...evidence, consentIds: ["other"] }, ["owner"], ["owner"]));
  assert.throws(() =>
    assertPlaceAuthority({ actorIds: ["owner"], witnessIds: [], consentIds: [] }, ["owner"], ["owner"]),
  );
  assert.throws(() => assertPlaceAuthority(undefined, [], []));
  assert.doesNotThrow(() =>
    assertPlaceAuthority({ actorIds: ["owner"], witnessIds: ["owner"], consentIds: [] }, ["owner"], ["owner"]),
  );
  assert.throws(() =>
    assertPlaceAuthority({ actorIds: ["owner"], witnessIds: ["owner"], consentIds: [] }, ["player"], ["owner"]),
  );
});
await runCase("places/source-evidence", () => {
  const { scene } = sceneFixture();
  const lines: any[] = [
    { kind: "dialogue", speakerId: "owner", content: "Please install them.", heardBy: ["owner"], zoneId: "common" },
    { kind: "narration", content: "Shelves installed.", heardBy: ["owner"], zoneId: "common" },
  ];
  const action = { segment: 1, actorIds: ["player"], consent: [{ actorId: "owner", segment: 0 }] };
  assert.deepEqual(semanticPhysicalContext(action, lines, scene).consentIds, ["owner"]);
  scene.lines.push({ ...lines[0], id: "accepted-agreement", role: "assistant", at } as any);
  assert.deepEqual(
    semanticPhysicalContext({ ...action, consent: [{ actorId: "owner", lineId: "accepted-agreement" }] }, lines, scene)
      .consentIds,
    ["owner"],
  );
  assert.throws(() =>
    semanticPhysicalContext({ ...action, consent: [{ actorId: "owner", lineId: "missing" }] }, lines, scene),
  );
  assert.throws(() => semanticPhysicalContext({ ...action, actorIds: ["remote"] }, lines, scene));
  assert.throws(() =>
    semanticPhysicalContext({ ...action, consent: [{ actorId: "other", segment: 0 }] }, lines, scene),
  );
  assert.throws(() => semanticPhysicalContext(action, [lines[0], { ...lines[1], contactHidden: true }], scene));
  assert.throws(() => semanticPhysicalContext(action, [lines[0], { ...lines[1], zoneId: "secret" }], scene));
  assert.throws(() =>
    semanticPhysicalContext(
      { ...action, consent: [{ actorId: "player", segment: "player", quote: "yes" }] },
      lines,
      scene,
      "no",
    ),
  );
});
await runCase("places/scene-replay", () => {
  const { state, scene } = sceneFixture();
  state.venues[0].access!.managerIds = ["player"];
  const zone = state.venues[0].zones!.find((z) => z.id === "common")!;
  zone.description = room().description;
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(at));
  const action = { narration: "Shelves installed.", expectedRevision: 0, append: "Shelves on the wall." };
  const after = applyVenueSceneChange(state, "cafe", action, "turn", at, undefined, "public", "", "common", {
    actorIds: ["player"],
    witnessIds: [],
    consentIds: [],
    positions: { player: "common" },
  });
  const id = "venue-chat:s:turn";
  const event: any = {
    id,
    venueId: "cafe",
    zoneId: "common",
    venueName: "Cafe",
    text: action.narration,
    at,
    actionReceipt: { ...action, happened: true, submissionId: "turn", after },
  };
  state.venueEvents = [event];
  state.exchangeReceipts[id] = {
    id,
    sceneId: "s",
    submissionId: "turn",
    domain: "physical",
    at,
    committedAt: at,
    status: "applied",
    reason: "Saved",
    evidenceIds: [],
    physicalOutcome: structuredClone(event),
  };
  assert.ok(coerceVillageState(structuredClone(state)).exchangeReceipts[id].physicalOutcome);
  const rejected = structuredClone(state);
  rejected.exchangeReceipts[id].status = "rejected";
  delete rejected.exchangeReceipts[id].physicalOutcome;
  assert.equal(
    coerceVillageState(rejected).exchangeReceipts[id].status,
    "rejected",
    "legitimate authority rejection reloads",
  );
  const invalid = structuredClone(state);
  invalid.exchangeReceipts[id].physicalOutcome!.actionReceipt!.after.state.revision = 99;
  assert.throws(() => coerceVillageState(invalid), /physical outcome/);
  assert.equal(
    invalid.exchangeReceipts[id].physicalOutcome!.actionReceipt!.after.state.revision,
    99,
    "decoder never modifies rejected bytes",
  );
  scene.submissions.push({ id: "turn" } as any);
  zone.description = "Unrelated later renovation.";
  zone.state.revision++;
  const before = structuredClone(state);
  const view = sceneContinuityView(state, coerceSession(JSON.parse(JSON.stringify(scene))));
  assert.deepEqual(view.venues[0].zones!.find((z) => z.id === "common")!.state, after.state);
  assert.equal(view.venues[0].zones!.find((z) => z.id === "common")!.description, after.description);
  assert.deepEqual(state, before);
  assert.throws(() =>
    applyVenueSceneChange(state, "cafe", action, "stale", at, undefined, "public", "", "common", {
      actorIds: ["player"],
      witnessIds: [],
      consentIds: [],
      positions: { player: "common" },
    }),
  );
  assert.throws(() => coerceVillageState({ ...state, version: 6 }));
  zone.description = "x".repeat(3988) + "FINAL DETAIL";
  assert.equal(
    coerceVillageState(JSON.parse(JSON.stringify(state))).venues[0].zones!.find((z) => z.id === "common")!.description,
    zone.description,
  );
  zone.description += "x";
  assert.throws(() => coerceVillageState(state));
  zone.description = before.venues[0].zones!.find((z) => z.id === "common")!.description;
  assert.throws(() => coerceSession({ ...scene, version: 2 }));
  assert.deepEqual(coerceVillageState(JSON.parse(JSON.stringify(state))).venueEvents[0].actionReceipt!.after, after);
});
await runCase("places/project-baseline", () => {
  const target = venue();
  const zone = target.zones!.find((z) => z.id === "common")!;
  const before = venueDesignHash(target, [zone.id]);
  const change: any = { zones: [{ ...zone, description: "Replacement", preserveDescription: false }] };
  const baseline = venueDesignHash(target, [zone.id], change);
  zone.state.revision++;
  zone.state.recent = { text: "Tea.", occurredAt: at, expiresAt: "2026-10-29T10:00:00.000Z" };
  assert.equal(
    venueDesignHash(target, [zone.id], change),
    baseline,
    "temporary activity does not invalidate replacement design",
  );
  zone.description += "\nShelves.";
  assert.equal(venueDesignHash(target, [zone.id]), before);
  assert.notEqual(venueDesignHash(target, [zone.id], change), baseline);
  assert.equal(venueDesignHash(target, [zone.id], { zones: [{ ...zone, preserveDescription: true }] } as any), before);
});
await runCase("places/artwork-budget", () => {
  const description = "x".repeat(3988) + "FINAL DETAIL";
  const prompt = sceneryPrompt(["A single room, no people."], [], "Watercolor", ["Physical account: " + description]);
  assert.ok(prompt.includes(description));
  assert.ok(prompt.length < MAX_IMAGE_PROMPT_LENGTH);
  assert.equal(readPrompt("x".repeat(MAX_IMAGE_PROMPT_LENGTH)).length, MAX_IMAGE_PROMPT_LENGTH);
  assert.throws(() => readPrompt("x".repeat(MAX_IMAGE_PROMPT_LENGTH + 1)), /at most/);
});
await runCase("places/access", () => {
  const { state, scene } = sceneFixture();
  const zone = state.venues[0].zones!.find((z) => z.id === "common")!;
  const evidence = { actorIds: ["player"], witnessIds: [], consentIds: [], positions: { player: "common" } };
  const tea = { narration: "Tea laid out.", expectedRevision: 0, recent: { text: "Cups after tea." } };
  // A public visitor can leave an ordinary temporary arrangement without manager consent.
  const after = applyVenueSceneChange(state, "cafe", tea, scene.id, at, undefined, "public", "", "common", evidence);
  assert.equal(after.description, zone.description);
  assert.throws(() =>
    applyVenueSceneChange(
      state,
      "cafe",
      { narration: "Shelves installed.", expectedRevision: 1, append: "Shelves." },
      scene.id,
      at,
      undefined,
      "public",
      "",
      "common",
      evidence,
    ),
  );
  state.venues[0].access!.bans.push({
    id: "ban",
    zoneId: "common",
    visitorId: "player",
    issuerId: "a",
    active: true,
    issuedAt: at,
    sourceLineIds: [],
  });
  assert.throws(() =>
    applyVenueSceneChange(
      state,
      "cafe",
      { ...tea, expectedRevision: 1, recent: { text: "New tea." } },
      scene.id,
      at,
      undefined,
      "public",
      "",
      "common",
      evidence,
    ),
  );
  assert.equal(zone.state.revision, 1, "rejected access cannot change physical state");
  state.venues[0].access!.bans = [];
  state.timeZone = "Asia/Tokyo";
  state.venues[0].access!.visitorHours = [{ days: ["Wednesday"], start: "09:00", end: "17:00" }];
  zone.access!.visitorHours = "inherit";
  assert.doesNotThrow(() =>
    applyVenueSceneChange(
      state,
      "cafe",
      { ...tea, expectedRevision: 1, recent: { text: "Morning tea." } },
      scene.id,
      "2026-10-28T01:00:00.000Z",
      undefined,
      "public",
      "",
      "common",
      evidence,
    ),
  );
  assert.throws(() =>
    applyVenueSceneChange(
      state,
      "cafe",
      { ...tea, expectedRevision: 1 },
      scene.id,
      at,
      undefined,
      "public",
      "",
      "common",
      { ...evidence, positions: { player: "exterior" } },
    ),
  );
});
