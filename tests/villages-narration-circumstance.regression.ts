// Test cases: narration-circumstance/native, narration-circumstance/finite-authority, narration-circumstance/consequence, narration-circumstance/race, narration-circumstance/recovery, narration-circumstance/context, narration-circumstance/strict-boundary, narration-circumstance/request-clock, narration-circumstance/protected-update, narration-circumstance/inherited-knowers, narration-circumstance/sibling-condition, narration-circumstance/corrected-active-condition, narration-circumstance/room-damage, narration-circumstance/room-damage-holds
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readNarrativeState } from "../packages/villages/src/server/domain/decoding/narrative-codec.js";
import { ensureNarrative, admitNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { synchronizeVenueZones } from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import {
  narrationCircumstancePrompt,
  sceneRepairOffers,
} from "../packages/villages/src/server/domain/rules/narration-circumstance.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import { assertContinuityRetention } from "../packages/villages/src/server/domain/rules/continuity-retention.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { activityDate, reserveEventAttempt } from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityViews,
  continuityHolderKey,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import {
  initializeRoomContinuity,
  retainNativeFact,
} from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { venueDraftFixture } from "./helpers/venues.fixture.js";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import {
  continuityCircumstances,
  continuityPreparationContext,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
const at = "2026-11-10T12:00:00.000Z";
function fixture(interior = false) {
  const state = {
      ...defaultVillageState(),
      seed: "circumstance-world",
      setupAt: at,
      foundedAt: at,
      timeZone: "UTC",
    },
    venue = venueDraftFixture(
      { id: "hall", name: "Hall", description: "A quiet hall with a wooden sign.", category: "public" },
      null,
    );
  synchronizeVenueZones(venue);
  initializeVenueAccess(venue);
  state.venues = [venue];
  ensureNarrative(state, at);
  if (interior && admitNarrative(state, at, "selection")!.targets[0]!.exterior) state.seed += "a";
  const target = admitNarrative(state, at, "selection")!.targets[0]!;
  if (interior) {
    assert(!target.exterior);
    const room = venue.zones!.find((zone) => zone.id === target.zoneId)!;
    room.description = "An intact window.\n\nA woven rug.";
    initializeRoomContinuity(state, venue.id, room.id, room.description, "authored-room", at);
  }
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "circumstance-scene",
      villageSeed: state.seed,
      sceneRevision: 1,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: target.zoneId,
      status: "active",
      startedAt: at,
      lastActivityAt: at,
      activeIds: [],
      participants: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
    }),
    venue,
  );
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(at));
  const context = narrationContinuityContext(state, scene, venue, "circumstance-operation", "What happens?", at),
    readset = fittedNarrationReadset(
      state,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    );
  assert(readset.circumstance);
  const raw: any = {
    segments: [{ id: "event", kind: "narration", text: "A gust rattles a loose sign.", requires: ["event"] }],
    commands: [
      {
        id: "event",
        type: "circumstance",
        at: "event",
        situation: { title: "Loose sign", summary: "A sign is rattling in the gusts." },
        conditions: [
          {
            observation: "The loose sign rattles.",
            restriction: "none",
            remedy: "Secure its bracket.",
            durationMinutes: 60,
          },
        ],
        source: [{ segment: "event", perceive: { kind: "seen", by: ["player"] } }],
      },
    ],
  };
  const publication = () => ({ raw, readset, responseDigest: memoryHash(raw) }),
    accept = (acceptedAt = at) => acceptNarration(state, publication(), "circumstance-turn", acceptedAt);
  return { state, venue, scene, context, readset, raw, publication, accept };
}

function roomDamage() {
  const f = fixture(true);
  const room = f.readset.admission.room!;
  const [window, rug] = currentRoomViews(f.state.continuity, f.state.episodes, room, at);
  f.raw.segments[0].text =
    "A falling branch cracks the window and leaves glass across the floor. The room closes for repairs.";
  f.raw.commands[0].situation = { title: "Broken window", summary: "Glass must be cleared and the window repaired." };
  f.raw.commands[0].conditions = [
    {
      observation: "The window is cracked and glass litters the floor.",
      restriction: "ordinary-use",
      remedy: "Repair the window and clear the glass.",
      roomKeeps: ["window", "glass"],
    },
  ];
  f.raw.keep = [
    { id: "window", for: "room", replace: window.id, text: "A cracked window.", source: f.raw.commands[0].source },
    { id: "glass", for: "room", text: "Glass shards litter the floor.", source: f.raw.commands[0].source },
  ];
  return { ...f, room, window, rug };
}

await runCase("narration-circumstance/room-damage", () => {
  for (const first of [true, false]) {
    const competing = roomDamage();
    const optional = { ...competing.raw.keep[0], id: "optional", text: "A newly painted window.", independent: true };
    competing.raw.keep.splice(first ? 0 : competing.raw.keep.length, 0, optional);
    const result = competing.accept();
    assert.equal(result.held, false, JSON.stringify(result.rejected));
    assert.deepEqual(
      result.rejected.map((row) => row.id),
      ["optional"],
    );
    assert(
      currentRoomViews(competing.state.continuity, competing.state.episodes, competing.room, at).some(
        (row) => row.version.text === "A cracked window.",
      ),
    );
  }
  const f = roomDamage();
  const { roomDamage: recipe, ...facts } = narrationCircumstancePrompt(f.readset.circumstance)!;
  assert.match(recipe ?? "", /roomKeeps/);
  assert.deepEqual(narrationCircumstancePrompt(f.readset.circumstance, false), facts);
  assert.equal(narrationCircumstancePrompt(null), null);
  f.raw.keep.push({
    id: "unrelated",
    for: ["missing"],
    text: "An unrelated detail",
    independent: true,
    source: f.raw.commands[0].source,
  });
  const result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.deepEqual(
    result.rejected.map((row) => row.id),
    ["unrelated"],
  );
  const conditions = f.state.narrative!.conditions;
  const views = () => currentRoomViews(f.state.continuity, f.state.episodes, f.room, at);
  const glass = views().find((row) => row.version.text === "Glass shards litter the floor.")!;
  assert.deepEqual(conditions[0].repairEntries, [f.window.id, glass.id]);
  assert.deepEqual(result.episode!.commandReceipts[0].conditionDamage, [
    { conditionId: conditions[0].id, entries: conditions[0].repairEntries },
  ]);
  assert(!result.episode!.commandReceipts[0].text.includes(glass.id), "repair links are outside the witnessed prose");
  assert.equal(views().find((row) => row.id === f.rug.id)?.version.id, f.rug.version.id);
  const before = memoryHash(f.state);
  assert(f.accept().replayed);
  assert.equal(memoryHash(f.state), before);

  const badHistory = structuredClone(f.state.episodes);
  badHistory.records.at(-1)!.commandReceipts[0].conditionDamage![0].entries[0] = f.rug.id;
  assert.throws(() => assertContinuityRetention(f.state.continuity, badHistory), /lost its exact enduring Room entry/);
  const unchanged = structuredClone(f.state.continuity);
  unchanged.versions.find((row) => row.rootId === f.window.id && row.id !== f.window.version.id)!.text =
    f.window.version.text;
  assert.throws(
    () => assertContinuityRetention(unchanged, f.state.episodes),
    /did not change its exact prior Room meaning/,
  );
  const encoded = encodeContinuityPages(
    {
      continuity: f.state.continuity,
      episodes: f.state.episodes,
      worldPlaces: f.state.worldPlaces,
      mailbox: f.state.mailbox,
    },
    "a".repeat(32),
  );
  Object.assign(
    f.state,
    decodeContinuityPagesSync(encoded.manifest, "a".repeat(32), f.state.seed, (id) => encoded.pages.get(id) ?? null)
      .value,
  );
  assert(f.accept().replayed);

  const repairAt = "2026-11-10T12:06:00.000Z";
  const venue = f.state.venues[0];
  const repairScene = zoneEventScene(
    coerceSession({ ...structuredClone(f.scene), id: "repair-scene", startedAt: repairAt, lastActivityAt: repairAt }),
    venue,
  );
  repairScene.continuity = captureSceneContinuity(f.state, repairScene, Date.parse(repairAt));
  const context = narrationContinuityContext(
    f.state,
    repairScene,
    venue,
    "repair",
    "I fix the window and clear the floor.",
    repairAt,
  );
  const readset = fittedNarrationReadset(
    f.state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  assert.deepEqual(readset.repairs[0].entries, conditions[0].repairEntries);
  const source = [{ segment: "work", perceive: { kind: "seen", by: ["player"] } }];
  const raw = {
    segments: [
      {
        id: "work",
        kind: "narration",
        text: "You replace the glass and sweep away every shard. The room can reopen.",
        requires: ["repair"],
      },
    ],
    commands: [
      {
        id: "repair",
        type: "circumstance",
        at: "work",
        source,
        requires: ["window", "glass"],
        conditions: [{ id: conditions[0].id, clear: true }],
      },
    ],
    keep: [
      { id: "window", for: "room", replace: f.window.id, text: "An intact window fitted with a new pane.", source },
      { id: "glass", for: "room", replace: glass.id, text: null, source },
    ],
  };
  const repair = () =>
    acceptNarration(f.state, { raw, readset, responseDigest: memoryHash(raw) }, "repair-turn", repairAt);
  const entries = conditions[0].repairEntries!;
  conditions[0].repairEntries = [f.rug.id];
  assert.equal(
    sceneRepairOffers(f.state, repairScene, f.room, repairAt).length,
    1,
    "the retained Scene snapshot still offers its exact original roots",
  );
  const fresh = { ...repairScene, continuity: captureSceneContinuity(f.state, repairScene, Date.parse(repairAt)) };
  assert.deepEqual(
    sceneRepairOffers(f.state, fresh, f.room, repairAt),
    [],
    "wrong live roots cannot become a new offer",
  );
  assert(repair().held, "live altered roots cannot authorize repair from a previously fitted offer");
  conditions[0].repairEntries = entries;
  const authority = f.state.narrative!;
  for (const variant of ["missing", "changed"] as const) {
    const damaged = structuredClone(authority);
    if (variant === "missing") damaged.receipts = [];
    else damaged.receipts[0].after.conditions[0].repairEntries = [f.rug.id];
    f.state.narrative = readNarrativeState(damaged);
    assert.deepEqual(sceneRepairOffers(f.state, repairScene, f.room, repairAt), [], variant);
    assert(repair().held, variant);
  }
  f.state.narrative = authority;
  const missing = raw.keep.pop()!;
  assert(repair().held, "repair cannot reopen while one linked entry remains unresolved");
  raw.keep.push(missing);
  const repaired = repair();
  assert.equal(repaired.held, false, JSON.stringify(repaired.rejected));
  assert.equal(f.state.narrative!.conditions[0].clearedAt, repairAt);
  assert.equal(f.state.eventAttempts.attempts.length, 1, "repair consumes no new circumstance opportunity");
  assert.deepEqual(
    views().map(({ version }) => version.text),
    ["An intact window fitted with a new pane.", "A woven rug."],
  );
  assert(repair().replayed);
});

await runCase("narration-circumstance/room-damage-holds", () => {
  for (const variant of [
    "missing",
    "timed",
    "concealed",
    "expires",
    "unrelated-segment",
    "unchanged",
    "retired",
    "independent",
    "shared",
    "stale",
  ] as const) {
    const f = roomDamage(),
      command = f.raw.commands[0],
      [window, glass] = f.raw.keep;
    if (variant === "missing") f.raw.keep.pop();
    if (variant === "timed") command.conditions[0].durationMinutes = 60;
    if (variant === "concealed") glass.visibility = "concealed";
    if (variant === "expires") glass.expiresInMinutes = 10;
    if (variant === "unrelated-segment") {
      f.raw.segments.push({ id: "different", kind: "narration", text: "The rug lies quietly." });
      glass.source = [{ segment: "different", perceive: { kind: "seen", by: ["player"] } }];
    }
    if (variant === "unchanged") window.text = f.window.version.text;
    if (variant === "retired") window.text = null;
    if (variant === "independent") {
      f.raw.segments[0].requires = [];
      command.independent = true;
    }
    if (variant === "shared") command.conditions.push({ ...command.conditions[0], roomKeeps: ["window"] });
    if (variant === "stale") {
      const key = continuityHolderKey(f.room);
      retainNativeFact(
        f.state,
        {
          id: "changed-window",
          kind: "room",
          targetId: JSON.stringify([f.room.placeId, f.room.zoneId]),
          revision: 1,
          text: "An open window.",
          witnesses: [],
        },
        at,
        {
          room: f.room,
          roomChange: {
            target: {
              id: f.window.id,
              recordRevision: f.window.recordRevision,
              heads: { [key]: f.window.headRevision },
            },
          },
        },
      );
    }
    const before = memoryHash(f.state);
    assert(f.accept().held, variant);
    assert.equal(memoryHash(f.state), before, variant);
  }
});
await runCase("narration-circumstance/native", () => {
  const f = fixture(),
    before = memoryHash(f.venue),
    result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(memoryHash(f.venue), before, "circumstances do not patch room description, layout or artwork");
  assert.equal(f.state.eventAttempts.attempts.length, 1);
  assert.equal(f.state.eventAttempts.attempts[0].origin, "scene");
  assert.deepEqual(f.state.narrative!.claims, []);
  const condition = f.state.narrative!.conditions[0];
  assert.equal(condition.endsAt, "2026-11-10T13:00:00.000Z");
  assert.equal(condition.restriction, "none");
  const receipt = result.episode!.commandReceipts[0],
    view = continuityViews(f.state.continuity, continuityActor(f.state, "player")!, at, new Set())[0];
  assert.equal(view.version.text, receipt.text);
  assert.equal(view.current, false);
  assert(view.version.text.includes("Secure its bracket."));
  assert(view.version.text.includes(condition.endsAt!));
  assert.equal(result.episode!.continuityVersionIds.length, 1);
});
await runCase("narration-circumstance/finite-authority", () => {
  for (const variant of ["missing", "wrong-zone", "unseen", "unknown-condition", "duplicate", "summary-only"]) {
    const f = fixture();
    if (variant === "missing") f.readset.circumstance = null;
    if (variant === "wrong-zone") f.readset.circumstance!.targets[0].zoneId = "elsewhere";
    if (variant === "unseen") f.raw.commands[0].source = [{ input: "What happens?", ground: { kind: "private" } }];
    if (variant === "unknown-condition") f.raw.commands[0].conditions[0].id = "unoffered";
    if (variant === "duplicate") f.raw.commands.push({ ...f.raw.commands[0], id: "another" });
    if (variant === "summary-only") f.raw.commands[0].conditions = [];
    const before = memoryHash(f.state),
      result = f.accept();
    assert(result.held, variant);
    assert.equal(memoryHash(f.state), before, variant);
  }
});
await runCase("narration-circumstance/consequence", () => {
  const f = fixture();
  f.raw.commands[0].severity = "dramatic";
  const before = memoryHash(f.state);
  assert(f.accept().held);
  assert.equal(memoryHash(f.state), before);
  const quiet = fixture();
  quiet.raw.commands = [];
  quiet.raw.segments = [{ kind: "narration", text: "The conversation stays quiet." }];
  assert.equal(quiet.accept().held, false);
  assert.equal(quiet.state.eventAttempts?.attempts.length ?? 0, 0);
  assert.equal(quiet.state.continuity.records.length, 0, "an unused offer creates no facts or extra processing");
});
await runCase("narration-circumstance/race", () => {
  for (const variant of ["budget", "setting", "zone", "consequence"]) {
    const f = fixture();
    if (variant === "budget")
      reserveEventAttempt(
        f.state,
        "other-opportunity",
        activityDate(f.state, new Date(at)),
        Date.parse(at),
        undefined,
        "world",
      );
    if (variant === "setting") f.state.setting = "A changed setting.";
    if (variant === "zone") {
      const zone = f.venue.zones!.find((zone) => zone.id === f.scene.zoneId)!;
      initializeRoomContinuity(f.state, f.venue.id, zone.id, zone.description, "concurrent-room", at);
    }
    if (variant === "consequence") {
      f.readset.circumstance!.consequence = "dramatic";
      f.raw.commands[0].severity = "dramatic";
    }
    const before = memoryHash(f.state);
    assert(f.accept().held, variant);
    assert.equal(memoryHash(f.state), before, variant);
  }
});
await runCase("narration-circumstance/recovery", () => {
  const f = fixture(),
    result = f.accept("2026-11-10T12:09:00.000Z");
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const encoded = encodeContinuityPages(
      {
        continuity: f.state.continuity,
        episodes: f.state.episodes,
        worldPlaces: f.state.worldPlaces,
        mailbox: f.state.mailbox,
      },
      "a".repeat(32),
    ),
    cold = decodeContinuityPagesSync(
      encoded.manifest,
      "a".repeat(32),
      f.state.seed,
      (id) => encoded.pages.get(id) ?? null,
    ).value;
  Object.assign(f.state, cold);
  f.state.setting = "Later setting.";
  assert(f.accept().replayed);
  assert.equal(f.state.eventAttempts.attempts.length, 1);
  assert.equal(f.state.narrative!.conditions[0].endsAt, "2026-11-10T13:00:00.000Z");
  const changed = structuredClone(result.episode!);
  changed.commandReceipts[0].circumstance!.summary = "Forged separate meaning";
  assert.throws(() => readAcceptedEpisode(changed, f.state.seed), /native meaning/);
});
await runCase("narration-circumstance/context", () => {
  const f = fixture(),
    result = f.accept();
  assert.equal(result.held, false);
  const context = narrationContinuityContext(f.state, f.scene, f.venue, "next", "Why is the sign rattling?", at),
    text = context.parts.map((part) => part.block.text).join("\n");
  assert(text.includes("Secure its bracket."));
  assert(text.includes("13:00:00"));
  assert(
    continuityCircumstances(f.state, "player", at).some((text) => text.includes("Secure its bracket.")),
    "resident preparation reads the same current native fact as Scenes",
  );
  const prompt = JSON.stringify(narrationCircumstancePrompt(f.readset.circumstance));
  assert(!prompt.includes("quiet hall"));
  assert(!prompt.includes("description"));
  assert(!prompt.includes("facts"));
  const holder = continuityActor(f.state, "player")!,
    root = f.state.continuity.records[0],
    key = continuityHolderKey(holder);
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [holder],
    "forget",
    at,
    { forget: true },
  );
  const forgotten = narrationContinuityContext(f.state, f.scene, f.venue, "forgotten", "Why?", at);
  assert(
    !forgotten.parts.some((part) => part.block.text.includes("Secure its bracket.")),
    "native context cannot bypass scoped Forget",
  );
});
await runCase("narration-circumstance/strict-boundary", () => {
  for (const [field, value] of Object.entries({
    room: [],
    weather: { description: "A storm." },
    clock: "tomorrow",
    edits: [],
    append: "A new wall.",
    dayNight: "night",
  })) {
    const f = fixture();
    f.raw.commands[0][field] = value;
    const before = memoryHash(f.state);
    assert(f.accept().held, field);
    assert.equal(memoryHash(f.state), before);
  }
  for (const duration of [0, 1.5, 10081]) {
    const f = fixture();
    f.raw.commands[0].conditions[0].durationMinutes = duration;
    assert(f.accept().held);
  }
});
await runCase("narration-circumstance/request-clock", () => {
  const f = fixture(),
    admittedAt = "2026-11-10T12:30:00.000Z",
    context = narrationContinuityContext(f.state, f.scene, f.venue, "later-request", "What happens?", admittedAt),
    readset = fittedNarrationReadset(
      f.state,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    );
  assert.equal(f.scene.continuity!.capturedAt, at);
  assert.equal(readset.circumstance!.at, admittedAt);
  const result = acceptNarration(
    f.state,
    { raw: f.raw, readset, responseDigest: memoryHash(f.raw) },
    "later-request",
    "2026-11-10T12:39:00.000Z",
  );
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(f.state.narrative!.conditions[0].endsAt, "2026-11-10T13:30:00.000Z");
});
await runCase("narration-circumstance/protected-update", () => {
  for (const correction of [{ forget: true as const }, { text: "An administrative corrected account." }]) {
    const f = fixture();
    f.raw.commands[0].conditions[0] = {
      observation: "SECRET OBSERVATION",
      restriction: "none",
      remedy: "SECRET REMEDY",
      durationMinutes: 10080,
    };
    assert.equal(f.accept().held, false);
    const holder = continuityActor(f.state, "player")!,
      root = f.state.continuity.records[0],
      key = continuityHolderKey(holder);
    f.state.continuity = protectContinuity(
      f.state.continuity,
      { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
      [holder],
      "protect",
      at,
      correction,
    );
    let day = 1;
    const zoneCount = f.venue.zones!.filter((zone) => zone.description.trim()).length;
    assert(zoneCount < 6, "fixture update remains within its seven-day condition");
    for (let index = 1; index < zoneCount; index++) {
      const now = new Date(Date.parse(at) + day++ * 86400000);
      reserveEventAttempt(
        f.state,
        "other-world-" + index,
        activityDate(f.state, now),
        now.getTime(),
        undefined,
        "world",
      );
    }
    const residentAt = new Date(Date.parse(at) + day++ * 86400000);
    reserveEventAttempt(
      f.state,
      "resident-opportunity",
      activityDate(f.state, residentAt),
      residentAt.getTime(),
      undefined,
      "resident",
    );
    const nextAt = new Date(Date.parse(at) + day * 86400000).toISOString(),
      selected = admitNarrative(f.state, nextAt, "selection")!.targets[0]!;
    assert.equal(selected.zoneId, f.scene.zoneId);
    const scene = zoneEventScene(
      coerceSession({ ...structuredClone(f.scene), id: "update-scene", startedAt: nextAt, lastActivityAt: nextAt }),
      f.venue,
    );
    scene.continuity = captureSceneContinuity(f.state, scene, Date.parse(nextAt));
    const context = narrationContinuityContext(f.state, scene, f.venue, "update-operation", "What happens?", nextAt),
      readset = fittedNarrationReadset(
        f.state,
        context,
        context.parts.map((part) => part.block.evidenceId!),
      );
    assert(readset.circumstance);
    assert(!context.parts.some((part) => part.block.text.includes("SECRET")));
    const old = f.state.narrative!.conditions[0],
      raw = {
        segments: [{ id: "clear", kind: "narration", text: "The restriction lifts.", requires: ["clear"] }],
        commands: [
          {
            id: "clear",
            type: "circumstance",
            at: "clear",
            situation: { id: old.situationId, title: "Open again", summary: "The restriction has lifted." },
            conditions: [{ id: old.id, clear: true }],
            source: [{ segment: "clear", perceive: { kind: "seen", by: ["player"] } }],
          },
        ],
      };
    const result = acceptNarration(f.state, { raw, readset, responseDigest: memoryHash(raw) }, "clear", nextAt);
    assert.equal(result.held, false, JSON.stringify(result.rejected));
    assert.equal(f.state.narrative!.conditions[0].clearedAt, nextAt);
    assert.deepEqual(
      result.episode!.commandReceipts[0].witnesses,
      ["player"],
      "the new public transition remains learnable without inherited protected prose",
    );
    assert(!result.episode!.commandReceipts[0].text.includes("SECRET"));
    assert.equal(f.state.continuity.records.length, 2);
    const encoded = encodeContinuityPages(
        {
          continuity: f.state.continuity,
          episodes: f.state.episodes,
          worldPlaces: f.state.worldPlaces,
          mailbox: f.state.mailbox,
        },
        "a".repeat(32),
      ),
      cold = decodeContinuityPagesSync(
        encoded.manifest,
        "a".repeat(32),
        f.state.seed,
        (id) => encoded.pages.get(id) ?? null,
      ).value;
    Object.assign(f.state, cold);
    const after = narrationContinuityContext(f.state, scene, f.venue, "after-update", "Why?", nextAt);
    assert(
      !after.parts.some((part) => part.block.text.includes("SECRET")),
      "cold current circumstance fallback preserves inherited native protection",
    );
    assert(!JSON.stringify(continuityViews(f.state.continuity, holder, nextAt, new Set())).includes("SECRET"));
  }
});
function nextLocal(f: ReturnType<typeof fixture>, operation: string) {
  const zones = f.venue.zones!.filter((zone) => zone.description.trim()).length,
    count = f.state.eventAttempts!.attempts.filter((row) => row.origin === "world" || row.origin === "scene").length,
    needed = (zones - (count % zones)) % zones;
  let stamp = Date.parse(f.state.eventAttempts!.lastAttemptAt) + 86400000;
  for (let index = 0; index < needed; index++) {
    const now = new Date(stamp);
    reserveEventAttempt(f.state, operation + "-world-" + index, activityDate(f.state, now), stamp, undefined, "world");
    stamp += 3600000;
  }
  const now = new Date(stamp);
  reserveEventAttempt(f.state, operation + "-resident", activityDate(f.state, now), stamp, undefined, "resident");
  stamp += 3600000;
  const capturedAt = new Date(stamp).toISOString(),
    scene = zoneEventScene(
      coerceSession({ ...structuredClone(f.scene), id: operation, startedAt: capturedAt, lastActivityAt: capturedAt }),
      f.venue,
    );
  scene.continuity = captureSceneContinuity(f.state, scene, stamp);
  const context = narrationContinuityContext(f.state, scene, f.venue, operation, "What happens?", capturedAt),
    readset = fittedNarrationReadset(
      f.state,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    );
  assert(readset.circumstance);
  assert.equal(readset.circumstance.targets[0].zoneId, f.scene.zoneId);
  return { readset, capturedAt };
}
await runCase("narration-circumstance/inherited-knowers", () => {
  for (const replacement of [false, true]) {
    const f = fixture(),
      resident = structuredClone(projectFixture().state().villagers[0]);
    resident.incarnation = "old-resident";
    f.state.villagers = [resident];
    const person = { characterId: resident.characterId, name: "Mara", doing: "Watching" };
    f.scene.activeIds = [person.characterId];
    f.scene.participants = [person];
    f.scene.sceneAttendance!.occupants = [{ ...person, zoneId: f.scene.zoneId! }];
    f.scene.contactGeneration = zoneEventScene(f.scene, f.venue).contactGeneration;
    f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at));
    f.raw.commands[0].conditions[0] = {
      observation: "SECRET OBSERVATION",
      restriction: "none",
      remedy: "SECRET REMEDY",
      durationMinutes: 10080,
    };
    f.raw.commands[0].source[0].perceive.by.push(person.characterId);
    const initial = narrationContinuityContext(f.state, f.scene, f.venue, "initial-resident", "What happens?", at),
      readset = fittedNarrationReadset(
        f.state,
        initial,
        initial.parts.map((part) => part.block.evidenceId!),
      );
    assert.equal(
      acceptNarration(f.state, { raw: f.raw, readset, responseDigest: memoryHash(f.raw) }, "initial", at).held,
      false,
    );
    if (replacement) f.state.villagers[0].incarnation = "new-resident";
    else {
      const player = continuityActor(f.state, "player")!,
        key = continuityHolderKey(player),
        root = f.state.continuity.records[0];
      f.state.continuity = protectContinuity(
        f.state.continuity,
        { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
        [player],
        "forget-player",
        at,
        { forget: true },
      );
    }
    const update = (operation: string, withResident: boolean, clear: boolean) => {
      const next = nextLocal(f, operation),
        condition = f.state.narrative!.conditions[0],
        raw = {
          segments: [
            {
              id: "update",
              kind: "narration",
              text: clear ? "The condition clears." : "The condition's timing changes.",
              requires: ["update"],
            },
          ],
          commands: [
            {
              id: "update",
              type: "circumstance",
              at: "update",
              situation: {
                id: condition.situationId,
                title: "Changed condition",
                summary: clear ? "The condition has cleared." : "The condition has new timing.",
              },
              conditions: [{ id: condition.id, ...(clear ? { clear: true } : { durationMinutes: 10080 }) }],
              source: [
                {
                  segment: "update",
                  perceive: { kind: "seen", by: ["player", ...(withResident ? [person.characterId] : [])] },
                },
              ],
            },
          ],
        };
      const result = acceptNarration(
        f.state,
        { raw, readset: next.readset, responseDigest: memoryHash(raw) },
        operation,
        next.capturedAt,
      );
      assert.equal(result.held, false, JSON.stringify(result.rejected));
      return { result, at: next.capturedAt };
    };
    if (!replacement) {
      const middle = update("player-only-update", false, false);
      assert.deepEqual(middle.result.episode!.commandReceipts[0].witnesses, ["player"]);
      assert(!middle.result.episode!.commandReceipts[0].text.includes("SECRET"));
    }
    const final = update("resident-update", true, true),
      witnesses = final.result.episode!.commandReceipts[0].witnesses;
    assert.equal(
      witnesses.includes(person.characterId),
      true,
      "current witnesses learn the new public transition, without old private prose",
    );
    assert(!final.result.episode!.commandReceipts[0].text.includes("SECRET"));
    const encoded = encodeContinuityPages(
        {
          continuity: f.state.continuity,
          episodes: f.state.episodes,
          worldPlaces: f.state.worldPlaces,
          mailbox: f.state.mailbox,
        },
        "a".repeat(32),
      ),
      cold = decodeContinuityPagesSync(
        encoded.manifest,
        "a".repeat(32),
        f.state.seed,
        (id) => encoded.pages.get(id) ?? null,
      ).value;
    const views = continuityViews(cold.continuity, continuityActor(f.state, person.characterId)!, final.at, new Set());
    assert.equal(JSON.stringify(views).includes("SECRET REMEDY"), !replacement);
  }
});
await runCase("narration-circumstance/sibling-condition", () => {
  const f = fixture();
  f.raw.commands[0].conditions[0].durationMinutes = 10080;
  f.raw.commands[0].conditions.push({
    observation: "A second local condition.",
    restriction: "none",
    remedy: "SIBLING REMEDY",
    durationMinutes: 10080,
  });
  assert.equal(f.accept().held, false);
  const next = nextLocal(f, "one-condition-update"),
    condition = f.state.narrative!.conditions[0],
    raw = {
      segments: [{ id: "update", kind: "narration", text: "The first condition changes.", requires: ["update"] }],
      commands: [
        {
          id: "update",
          type: "circumstance",
          at: "update",
          situation: {
            id: condition.situationId,
            title: "First condition changed",
            summary: "The first condition has changed.",
          },
          conditions: [
            {
              id: condition.id,
              observation: "A changed first condition.",
              restriction: "none",
              remedy: "A new first remedy.",
            },
          ],
          source: [{ segment: "update", perceive: { kind: "seen", by: ["player"] } }],
        },
      ],
    };
  const result = acceptNarration(
    f.state,
    { raw, readset: next.readset, responseDigest: memoryHash(raw) },
    "one-condition-update",
    next.capturedAt,
  );
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const context = narrationContinuityContext(f.state, f.scene, f.venue, "sibling-context", "Why?", next.capturedAt);
  assert(
    context.parts.some((part) => part.block.text.includes("SIBLING REMEDY")),
    "updating one condition keeps the holder's other active condition knowledge fitted",
  );
});
await runCase("narration-circumstance/corrected-active-condition", () => {
  const f = fixture();
  f.raw.commands[0].conditions[0].durationMinutes = 10080;
  assert.equal(f.accept().held, false);
  const holder = continuityActor(f.state, "player")!,
    key = continuityHolderKey(holder),
    root = f.state.continuity.records[0],
    corrected = "I remember the sign as carefully secured.";
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [holder],
    "correct-active",
    at,
    { text: corrected },
  );
  const next = nextLocal(f, "timing-update"),
    condition = f.state.narrative!.conditions[0],
    raw = {
      segments: [{ id: "update", kind: "narration", text: "The timing changes.", requires: ["update"] }],
      commands: [
        {
          id: "update",
          type: "circumstance",
          at: "update",
          situation: { id: condition.situationId, title: "Timing changed", summary: "The condition has new timing." },
          conditions: [{ id: condition.id, durationMinutes: 10080 }],
          source: [{ segment: "update", perceive: { kind: "seen", by: ["player"] } }],
        },
      ],
    };
  const result = acceptNarration(
    f.state,
    { raw, readset: next.readset, responseDigest: memoryHash(raw) },
    "timing-update",
    next.capturedAt,
  );
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const context = narrationContinuityContext(
      f.state,
      f.scene,
      f.venue,
      "unrelated-query",
      "Nice weather today.",
      next.capturedAt,
    ),
    parts = context.parts.filter((part) => part.block.text.includes(corrected));
  assert.equal(parts.length, 1);
  assert(
    !parts[0].block.optional,
    "eligible corrected active-condition meaning stays required even without query overlap",
  );
  assert(!context.parts.some((part) => part.block.text.includes("Secure its bracket.")));
  const preparation = continuityPreparationContext(f.state, "player", next.capturedAt);
  assert(preparation.circumstances.includes(corrected));
  assert(!preparation.circumstances.some((text) => text.includes("Secure its bracket.")));
  assert(preparation.sources.includes(f.state.continuity.records[0].heads[key].versionId));
});
