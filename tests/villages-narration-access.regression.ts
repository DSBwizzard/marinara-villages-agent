// Test cases: narration-access/away-home, narration-access/stale-authority, narration-access/communication, narration-access/standing-withdrawal, narration-access/native-management, narration-access/empty-withdrawal, narration-access/current-outside-hours, narration-native/atomic, narration-native/held-rollback, narration-native/independent-subset, narration-native/replay, narration-native/disjoint-scopes, narration-native/decision-order, narration-native/closed-project, narration-native/provisional-authority, narration-access/book-without-keep, narration-access/spoken-visit, narration-access/spoken-visit-uncertain, narration-access/spoken-visit-authority
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { narrationLines } from "../packages/villages/src/server/domain/rules/narration-lines.js";
import {
  bindNarrationSource,
  narrationCommunication,
} from "../packages/villages/src/server/domain/rules/narration-sources.js";
import { evaluateZoneAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { playerAccess } from "../packages/villages/src/server/domain/rules/player-access.js";
import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityRelationships,
  inspectContinuityMemory,
  changeContinuityMemory,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { draftEstablishmentProject } from "../packages/villages/src/server/features/projects/project-drafts.js";
import {
  applyNarrationAccess,
  narrationAccessScopes,
  type NarrationAccessDecision,
} from "../packages/villages/src/server/domain/rules/narration-access.js";
const at = "2026-11-09T12:00:00.000Z";
function fixture(resident = false) {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at, foundedAt: at };
  const cafe = establishPlace(
    state,
    {
      name: "Cafe",
      description: "A cafe.",
      controllers: ["mara"],
      people: [{ ref: "mara", name: "Mara", characterization: "A reserved host." }],
      zones: [{ id: "parlor", name: "Parlor", kind: "public", description: "Tables." }],
    },
    "cafe",
    "map",
    "request:cafe",
    at,
    true,
  );
  const actorId = Object.keys(state.worldPlaces.npcs)[0];
  if (resident)
    state.villagers = [
      {
        characterId: actorId,
        incarnation: continuityActor(state, actorId)!.incarnation,
        cardSnapshot: { name: "Mara" },
      },
    ] as typeof state.villagers;
  const home = establishPlace(
    state,
    {
      name: "Mara's house",
      description: "PRIVATE EXTERIOR",
      controllers: [actorId],
      zones: [
        {
          id: "library",
          name: "Library",
          kind: "restricted",
          description: "PRIVATE ROOM CONTENTS",
          controllers: [actorId],
        },
        { id: "study", name: "Study", kind: "restricted", description: "PRIVATE STUDY", controllers: [actorId] },
      ],
    },
    "home",
    "map",
    "request:home",
    at,
    true,
  );
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "scene",
      sceneRevision: 1,
      placeId: cafe.id,
      placeName: "Cafe",
      zoneId: "parlor",
      villageSeed: state.seed,
      startedAt: at,
      lastActivityAt: at,
      status: "active",
      activeIds: [actorId],
      participants: [{ characterId: actorId, name: "Mara", doing: "Talking" }],
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(cafe.location),
        occupants: [{ characterId: actorId, name: "Mara", doing: "Talking", zoneId: "parlor" }],
      },
    }),
    cafe.location,
  );
  const prepared = narrationContinuityContext(
    state,
    scene,
    cafe.location,
    "operation",
    "May I visit your library?",
    at,
  );
  const scopes = narrationAccessScopes(state, ["player", actorId]);
  const readset = {
    ...fittedNarrationReadset(
      state,
      prepared,
      prepared.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    ),
    access: scopes,
  };
  const reply = readNarrationReply(
    {
      segments: [
        { kind: "dialogue", id: "grant", speakerId: actorId, text: "You may visit my library whenever you like." },
      ],
    },
    [actorId],
  );
  const context = {
    ...readset.source,
    ...narrationLines(reply, scene, prepared.episodeId, at, []),
    native: {},
    moves: [],
  };
  const sources = [bindNarrationSource({ segment: "grant" }, context)];
  const decision: NarrationAccessDecision = {
    type: "permission.grant",
    by: actorId,
    visitor: "player",
    venue: home.id,
    zone: "library",
  };
  const before = scopes.find((scope) => scope.venueId === home.id)!;
  const apply = (value = decision, receipt = "receipt", proof = sources) =>
    applyNarrationAccess(state, value, readset, narrationCommunication(context), proof, before, receipt, at);
  const publication = (commands: unknown[], keep: unknown[] = [], requires: string[] = []) => {
    const raw = {
      segments: [
        {
          kind: "dialogue",
          id: "grant",
          speakerId: actorId,
          text: "You may visit my library whenever you like.",
          requires,
        },
      ],
      commands,
      keep,
    };
    return { readset, raw, responseDigest: memoryHash(raw) };
  };
  const command = { ...decision, id: "grant-access", at: "grant", source: [{ segment: "grant" }] };
  return { state, actorId, home, cafe, readset, context, sources, decision, before, apply, publication, command };
}

function cottageInvitation(
  setup?: (cottage: VillageVenue, actorId: string) => void,
  input = "May I stay here tonight?",
) {
  const f = fixture(true);
  const cottage = { ...structuredClone(f.home.location), id: "cottage", name: "Mara's cottage" };
  cottage.zones = cottage.zones!.map((zone) =>
    zone.id === "library"
      ? { ...zone, id: "living", name: "Living Room", kind: "shared-residence", seen: true, connectedTo: ["exterior"] }
      : zone.id === "study"
        ? { ...zone, name: "Bedroom", kind: "private-residence", connectedTo: ["living"] }
        : { ...zone, connectedTo: [] },
  );
  setup?.(cottage, f.actorId);
  f.state.venues.push(cottage);
  const scene = zoneEventScene(
    {
      ...f.context.scene,
      placeId: cottage.id,
      placeName: cottage.name,
      zoneId: "exterior",
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(cottage),
        occupants: [{ characterId: f.actorId, name: "Mara", doing: "Talking", zoneId: "exterior" }],
      },
    },
    cottage,
  );
  const prepared = narrationContinuityContext(f.state, scene, cottage, "invite", input, at);
  const readset = {
    ...fittedNarrationReadset(
      f.state,
      prepared,
      prepared.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    ),
    access: narrationAccessScopes(f.state, ["player", f.actorId]),
  };
  const publication = (texts: string[], commands: unknown[] = []) => {
    const raw = {
      segments: texts.map((text, index) => ({ kind: "dialogue", id: "line-" + index, speakerId: f.actorId, text })),
      commands,
    };
    return { readset, raw, responseDigest: memoryHash(raw) };
  };
  return { state: f.state, scene, actorId: f.actorId, publication, cottage: () => f.state.venues[0] };
}

await runCase("narration-access/spoken-visit", () => {
  for (const words of [
    "Come in.",
    "Come in and look at the living room.",
    "Come in out of the rain and look at it first. Then you tell me if that works.",
  ]) {
    const f = cottageInvitation();
    const publication = f.publication(["The bedroom is off limits. I can show you the couch.", words]);
    const result = acceptNarration(f.state, publication, "submission", at);
    assert.equal(result.held, false);
    assert.deepEqual(result.rejected, []);
    assert.deepEqual(
      result.episode?.commandReceipts.map(({ kind }) => kind),
      ["access"],
    );
    assert.deepEqual(
      result.episode?.playerAccessChanges?.map(({ action, entry }) => [
        action,
        entry.room,
        entry.kind,
        entry.thisVisit,
      ]),
      [["added", "Living Room", "visit", true]],
    );
    const cottage = f.cottage();
    const [grant] = cottage.access!.permissions;
    assert.equal(grant.issuerId, f.actorId);
    assert.deepEqual(grant.sourceLineIds, [result.episode!.segments[1].id]);
    assert.equal(evaluateZoneAccess(cottage, cottage.zones![1], "player", { sceneId: f.scene.id }).allowed, true);
    assert.equal(evaluateZoneAccess(cottage, cottage.zones![1], "player", { sceneId: "later" }).allowed, false);
    assert.equal(evaluateZoneAccess(cottage, cottage.zones![2], "player", { sceneId: f.scene.id }).allowed, false);
    assert.equal(acceptNarration(f.state, publication, "submission", at).replayed, true);
    assert.equal(f.cottage().access!.permissions.length, 1);
  }
  const f = cottageInvitation(undefined, '"Thanks. Can I actually come inside? Could we talk?"');
  const result = acceptNarration(
    f.state,
    f.publication([
      "Yes — come in, come in, it's warmer than it looks. Boots off by the mat if you don't mind, the floor gets slippery.",
      "What did you want to talk about?",
    ]),
    "submission",
    at,
  );
  assert.equal(result.held, false);
  assert.equal(result.episode?.playerAccessChanges?.[0].entry.room, "Living Room");
  assert.deepEqual(f.cottage().access!.permissions[0].sourceLineIds, [result.episode!.segments[0].id]);
});

await runCase("narration-access/spoken-visit-uncertain", () => {
  for (const texts of [
    ["Come in if my housemate agrees."],
    ["You said ‘come in’ when we arrived."],
    ["“Come in,” is what I would say."],
    ["Come in and look at the bedroom."],
    ["Come in. Wait outside until I get back."],
    ["Come in.", "Wait outside. I need to ask first."],
    ["Yes — come in if my housemate agrees.", "Anyway, let's talk."],
    ["Yes — come in, come in, it's warmer once the landlord says yes.", "Anyway, let's talk."],
    ["“Yes — come in.” That's what I would have said.", "Anyway, let's talk."],
    ["Yes — come in.", "How have you been?", "On second thought, wait outside."],
    ["Yes — come in. Only once I've asked my housemate.", "How have you been?"],
    ["Yes — come in.", "When my housemate gets back."],
  ]) {
    const f = cottageInvitation(undefined, "Can I actually come inside?");
    assert.equal(acceptNarration(f.state, f.publication(texts), "submission", at).held, false);
    assert.deepEqual(f.cottage().access!.permissions, [], texts.join(" "));
  }
});

await runCase("narration-access/spoken-visit-authority", () => {
  const setups: ((cottage: VillageVenue, actorId: string) => void)[] = [
    (cottage) => Object.assign(cottage.zones![2], { kind: "shared-residence", connectedTo: ["exterior", "living"] }),
    (cottage) => Object.assign(cottage.zones![1].access!, { managerIds: ["player"], inviterIds: [] }),
    (cottage) => {
      cottage.zones![1].access!.accompanied = true;
    },
    (cottage) => {
      cottage.access!.visitorHours = [{ days: ["Monday"], start: "00:00", end: "00:01" }];
    },
    (cottage, issuerId) =>
      cottage.access!.visitDenials.push({ zoneId: "living", visitorId: "player", sceneId: "scene", issuerId }),
  ];
  for (const setup of setups) {
    const f = cottageInvitation(setup);
    assert.equal(acceptNarration(f.state, f.publication(["Come in!"]), "submission", at).held, false);
    assert.deepEqual(f.cottage().access!.permissions, []);
  }
  const f = cottageInvitation();
  const command = {
    type: "access.decide",
    at: "line-0",
    source: [{ segment: "line-0" }],
    by: f.actorId,
    venue: f.cottage().id,
    zone: "living",
    decision: { outcome: "invite-now", visitor: "player" },
  };
  const result = acceptNarration(f.state, f.publication(["Come in!"], [command]), "submission", at);
  assert.equal(result.held, false);
  assert.equal(f.cottage().access!.permissions.length, 1);
});
await runCase("narration-access/away-home", () => {
  const f = fixture();
  assert(!JSON.stringify(f.readset.access).includes("PRIVATE"), "native authority never captures remote appearance");
  const receipt = f.apply();
  const grant = f.home.location.access!.permissions[0];
  assert.equal(grant.zoneId, "library");
  assert.equal(grant.issuerId, f.actorId);
  assert.equal(grant.duration, "standing");
  assert.equal(grant.sceneId, null, "an away-home grant is not claimed by the cafe Scene");
  assert.deepEqual(receipt.witnesses.toSorted(), ["player", f.actorId].toSorted());
  assert.deepEqual(f.cafe.location.access!.permissions, []);
});
await runCase("narration-access/stale-authority", () => {
  const f = fixture();
  f.home.location.access!.managerIds = ["player"];
  f.home.location.access!.revision++;
  const before = narrationAccessScopes(f.state, [f.actorId]).find((scope) => scope.venueId === f.home.id)!;
  assert.throws(
    () =>
      applyNarrationAccess(
        f.state,
        f.decision,
        f.readset,
        narrationCommunication(f.context),
        f.sources,
        before,
        "receipt",
        at,
      ),
    /authority changed/,
  );
  assert.deepEqual(f.home.location.access!.permissions, []);
  const hidden = fixture();
  hidden.readset.access = hidden.readset.access.filter((scope) => scope.venueId !== hidden.home.id);
  assert.throws(() => hidden.apply(), /not supplied/);
});
await runCase("narration-access/communication", () => {
  const f = fixture();
  for (const proof of [
    { ...f.sources[0], kind: "private" as const },
    { ...f.sources[0], episodeId: "old" },
    { ...f.sources[0], fingerprint: "forged" },
    { ...f.sources[0], perceptions: [] },
    { ...f.sources[0], positions: { player: "library", [f.actorId]: "library" } },
  ])
    assert.throws(() => f.apply(f.decision, "invalid", [proof]));
  assert.deepEqual(f.home.location.access!.permissions, []);
  const player = { ...f.decision, by: "player" };
  assert.throws(() => f.apply(player), /authority changed|not supplied/);
});
await runCase("narration-access/standing-withdrawal", () => {
  const f = fixture();
  f.apply();
  f.apply({ ...f.decision, type: "permission.revoke" }, "withdrawal");
  assert(f.home.location.access!.permissions[0].revoked);
  assert.equal(f.home.location.access!.revision, 2);
});
await runCase("narration-access/native-management", () => {
  const f = fixture();
  const decision: NarrationAccessDecision = {
    type: "access.decide",
    outcome: "access-management",
    by: f.actorId,
    venue: f.home.id,
    zone: null,
    management: { action: "venue-policy", managerIds: [f.actorId], visitorHours: null },
  };
  f.apply(decision);
  assert.equal(f.home.location.access!.revision, 1);
  for (const management of [
    { action: "venue-policy", managerIds: [], visitorHours: null },
    { action: "venue-policy", managerIds: [f.actorId], visitorHours: null, extra: true },
    { action: "venue-policy", managerIds: [f.actorId], visitorHours: null, expectedRevision: 0 },
  ])
    assert.throws(() => f.apply({ ...decision, management }, "invalid"));
  assert.equal(f.home.location.access!.revision, 1);
});

await runCase("narration-access/empty-withdrawal", () => {
  const f = fixture();
  f.apply({ ...f.decision, type: "permission.revoke" }, "withdrawal");
  assert.equal(f.home.location.access!.revision, 1);
  assert(f.home.location.access!.receipts.withdrawal);
  const before = narrationAccessScopes(f.state, [f.actorId]).find((scope) => scope.venueId === f.home.id)!;
  assert.throws(
    () =>
      applyNarrationAccess(
        f.state,
        f.decision,
        f.readset,
        narrationCommunication(f.context),
        f.sources,
        before,
        "late-grant",
        at,
      ),
    /authority changed/,
  );
  assert.deepEqual(f.home.location.access!.permissions, []);
});

await runCase("narration-access/current-outside-hours", () => {
  const later = fixture();
  const invitation = later.apply({ ...later.decision, type: "access.decide", outcome: "invite-later" });
  assert.match(invitation.text, /for one visit/);
  assert.doesNotMatch(invitation.text, /for this visit/);
  assert.equal(later.home.location.access!.permissions[0].sceneId, null);
  const f = fixture(),
    venue = f.cafe.location,
    zone = venue.zones!.find((zone) => zone.id === "parlor")!;
  venue.access!.visitorHours = [{ days: ["Monday"], start: "18:00", end: "19:00" }];
  const access = narrationAccessScopes(f.state, [f.actorId]);
  const readset = { ...f.readset, access },
    before = access.find((scope) => scope.venueId === venue.id)!;
  const check = (sceneId: string) =>
    evaluateZoneAccess(venue, zone, "player", { sceneId, at: new Date(at), accepting: false });
  assert.equal(check("scene").allowed, false);
  applyNarrationAccess(
    f.state,
    {
      type: "access.decide",
      by: f.actorId,
      visitor: "player",
      venue: venue.id,
      zone: zone.id,
      outcome: "invite-outside-hours",
    },
    readset,
    narrationCommunication(f.context),
    f.sources,
    before,
    "late-stay",
    at,
  );
  assert.equal(check("scene").allowed, true);
  assert.equal(check("another-scene").allowed, false);
});

await runCase("narration-access/book-without-keep", () => {
  const f = fixture(true),
    publication = f.publication([f.command], [], ["grant-access"]);
  f.home.location.zones!.find((zone) => zone.id === "library")!.seen = true;
  const result = acceptNarration(f.state, publication, "submission", at);
  assert.equal(result.held, false);
  const scope = "a".repeat(32),
    encoded = encodeContinuityPages(
      {
        continuity: f.state.continuity,
        episodes: f.state.episodes,
        worldPlaces: f.state.worldPlaces,
        mailbox: f.state.mailbox,
      },
      scope,
    );
  Object.assign(
    f.state,
    decodeContinuityPagesSync(encoded.manifest, scope, f.state.seed, (id) => encoded.pages.get(id) ?? null).value,
  );
  assert.equal(
    continuityRelationships(f.state, at)[0].access[0]?.zoneId,
    "library",
    "actual accepted native permission needs no model keep to appear",
  );
  const record = f.state.continuity.records.find((record) =>
    f.state.continuity.versions.some(
      (version) => version.rootId === record.id && version.sources.some((source) => source.kind === "native"),
    ),
  )!;
  const inspected = inspectContinuityMemory(f.state, record.id, "player", true, at);
  assert.match(inspected.entry.text, /standing permission/);
  assert.match(inspected.entry.text, /during visitor hours/);
  f.state.continuity = changeContinuityMemory(
    f.state,
    record.id,
    { seed: f.state.seed, operationId: "forget-access", target: inspected.target!, knowers: ["player"] },
    "forget",
    at,
  );
  assert.deepEqual(continuityRelationships(f.state, at)[0].access, []);
  assert.equal(
    f.state.worldPlaces.places.home.location.access!.permissions.length,
    1,
    "Forget does not revoke native authority",
  );
  assert.equal(acceptNarration(f.state, publication, "submission", at).held, false);
  assert.deepEqual(
    continuityRelationships(f.state, at)[0].access,
    [],
    "saved response replay cannot restore forgotten learning",
  );
});

await runCase("narration-native/atomic", () => {
  const f = fixture();
  const keep = {
    id: "remember",
    for: [f.actorId],
    text: "Mara gave the player standing permission to visit the library.",
    source: ["native:grant-access"],
  };
  const result = acceptNarration(
    f.state,
    f.publication([f.command], [keep], ["grant-access", "remember"]),
    "submission",
    at,
  );
  assert.equal(result.held, false);
  assert.equal(f.state.worldPlaces.places.home.location.access!.permissions.length, 1);
  assert.equal(
    f.state.continuity.versions.length,
    3,
    "explicit personal meaning and both witnessed native accounts publish together",
  );
  assert.equal(f.state.episodes.records.length, 1);
  assert.equal(result.episode!.commandReceipts.length, 1);
  assert.deepEqual(
    result.episode!.playerAccessChanges?.map(({ action, entry }) => [action, entry.kind, entry.room]),
    [["added", "standing", "Restricted Zone"]],
  );
  const home = f.state.worldPlaces.places.home;
  assert.equal(playerAccess(f.state, new Date(at))[0].room, "Restricted Zone");
  home.knownBy = [f.actorId];
  assert.deepEqual(playerAccess(f.state, new Date(at)), [], "an unknown Place is not disclosed by a projected grant");
});

await runCase("narration-native/held-rollback", () => {
  const f = fixture(),
    before = structuredClone(f.state);
  const keep = { id: "remember", for: [f.actorId], text: "Important promised retention.", source: ["h:missing"] };
  const result = acceptNarration(
    f.state,
    f.publication([f.command], [keep], ["remember", "grant-access"]),
    "submission",
    at,
  );
  assert.equal(result.held, true);
  assert.deepEqual(f.state, before, "no native authority publishes while asserted retention is held");
});

await runCase("narration-native/independent-subset", () => {
  const f = fixture();
  const independent = { ...f.command, id: "optional", independent: true, requires: ["missing"] };
  const result = acceptNarration(f.state, f.publication([independent]), "submission", at);
  assert.equal(result.held, false);
  assert.equal(
    f.state.worldPlaces.places.home.location.access!.permissions.length,
    0,
    "a validated native candidate dropped by dependency selection must not leak into authority",
  );
  assert.equal(result.episode!.commandReceipts.length, 0);
});

await runCase("narration-native/replay", () => {
  const f = fixture(),
    publication = f.publication([f.command], [], ["grant-access"]);
  assert.equal(acceptNarration(f.state, publication, "submission", at).held, false);
  f.state.worldPlaces.npcs[f.actorId].disabled = true;
  f.state.worldPlaces.places.home.location.access!.managerIds = ["player"];
  const before = structuredClone(f.state);
  const replay = acceptNarration(f.state, publication, "submission", at);
  assert.equal(replay.held, false);
  assert("replayed" in replay && replay.replayed);
  assert.deepEqual(f.state, before, "lost acknowledgement never revalidates consent or overwrites later authority");
});

await runCase("narration-native/disjoint-scopes", () => {
  const f = fixture();
  const optional = { ...f.command, id: "optional", independent: true, requires: ["missing"] };
  const essential = { ...f.command, id: "study-access", zone: "study" };
  const publication = f.publication([optional, essential], [], ["study-access"]);
  publication.raw.segments[0].text = "You may visit the library and the study whenever you like.";
  const result = acceptNarration(f.state, publication, "submission", at);
  assert.equal(result.held, false);
  const access = f.state.worldPlaces.places.home.location.access!;
  assert.deepEqual(
    access.permissions.map((grant) => grant.zoneId),
    ["study"],
  );
  assert.equal(access.revision, 1);
  assert.equal(result.episode!.commandReceipts[0].revision, 1, "receipt revision belongs to the selected batch");
});

await runCase("narration-native/decision-order", () => {
  for (const mislabelled of [false, true]) {
    const f = fixture();
    const withdrawal = {
      ...f.command,
      type: "permission.revoke",
      id: "withdrawal",
      at: "withdraw",
      source: [{ segment: "withdraw" }],
    };
    const grant = { ...f.command, ...(mislabelled ? { at: "withdraw" } : {}) };
    const publication = f.publication([withdrawal, grant], [], ["grant-access", "withdrawal"]);
    publication.raw.segments.push({
      kind: "dialogue",
      id: "withdraw",
      speakerId: f.actorId,
      text: "I withdraw that standing permission.",
      requires: ["withdrawal"],
    });
    const before = structuredClone(f.state);
    const result = acceptNarration(f.state, publication, "submission", at);
    assert.equal(result.held, mislabelled);
    if (mislabelled) assert.deepEqual(f.state, before, "an older utterance cannot be delayed past later withdrawal");
    else
      assert(
        f.state.worldPlaces.places.home.location.access!.permissions.every((grant) => grant.revoked),
        "actual speech order governs effects even when the model reverses the command array",
      );
  }
});

await runCase("narration-native/closed-project", () => {
  const f = fixture();
  const project = draftEstablishmentProject(
    f.state,
    f.home.id,
    {
      establishment: {
        goal: "A reading club",
        physical: false,
        zoneIds: ["library"],
        objectives: ["Agree on the club's ongoing use."],
      },
    },
    "club",
  );
  project.status = project.lifecycle!.phase = "complete";
  f.home.location.zones = f.home.location.zones!.filter((zone) => zone.id !== "library");
  const publication = f.publication([]);
  publication.raw.segments[0].text = "Good morning.";
  const result = acceptNarration(f.state, publication, "submission", at);
  assert.equal(result.held, false, "a closed historical Project cannot block an unrelated ordinary exchange");
});

await runCase("narration-native/provisional-authority", () => {
  for (const sameMoment of [false, true]) {
    for (const downstreamIndependent of [false, true]) {
      const f = fixture(),
        zone = f.home.location.zones!.find((zone) => zone.id === "library")!;
      const optional = {
        id: "optional",
        at: "grant",
        source: [{ segment: "grant" }],
        independent: true,
        requires: ["missing"],
        type: "access.decide",
        by: f.actorId,
        venue: f.home.id,
        zone: zone.id,
        decision: {
          outcome: "access-management",
          management: {
            action: "zone-policy",
            policy: {
              ...zone.access,
              managerIds: ["player"],
              inviterIds: [],
            },
          },
        },
      };
      const grant = {
        ...f.command,
        at: sameMoment ? "grant" : "later",
        source: [{ segment: sameMoment ? "grant" : "later" }],
      };
      const downstream = {
        ...grant,
        id: "study",
        zone: "study",
        requires: ["grant-access"],
        ...(downstreamIndependent ? { independent: true } : {}),
      };
      const publication = f.publication([downstream, optional, grant], [], ["grant-access"]);
      publication.raw.segments.push({
        kind: "dialogue",
        id: "later",
        speakerId: f.actorId,
        text: "You may visit the library and the study whenever you like.",
        requires: ["grant-access"],
      });
      const result = acceptNarration(f.state, publication, "submission", at);
      assert.equal(result.held, false, "a discarded optional candidate cannot leave a false authority failure behind");
      const access = f.state.worldPlaces.places.home.location.access!;
      assert.deepEqual(access.permissions.map((grant) => grant.zoneId).toSorted(), ["library", "study"]);
      assert.equal(access.revision, 2);
      assert(!access.changes.some((change) => change.action === "zone-policy"));
    }
  }
});
