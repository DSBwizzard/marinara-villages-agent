// Test cases: narration-movement/player, narration-movement/resident, narration-movement/authority, narration-movement/capacity, narration-movement/independent, narration-movement/recovery, narration-movement/private-destination, narration-movement/two-turns, narration-movement/group-request, narration-movement/departure, narration-movement/calendar-allow, narration-movement/calendar-deny, narration-movement/calendar-group, narration-movement/calendar-replay, narration-movement/calendar-context, narration-movement/calendar-operations
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { applyAcceptedSceneDelta } from "../packages/villages/src/server/domain/rules/scene-delta.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { actorEpisodeView } from "../packages/villages/src/server/domain/rules/episodes.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import type { VenueAccessState } from "../packages/villages/src/shared/helpers/venue-access.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { VILLAGE_WEEKDAYS } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  sceneAccessContext,
  sceneMoveAccompanying,
} from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { accessExits } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
const at = "2026-11-09T21:00:00.000Z",
  input = "I walk to the garden.";
function fixture(full = false, message = input, configure?: (state: VillageState) => string | void) {
  const state = projectFixture().state(),
    venue = state.venues[0];
  if (full)
    for (const id of ["d", "e", "f"])
      state.villagers.push({
        ...structuredClone(state.villagers[2]),
        characterId: id,
        incarnation: "incarnation-" + id,
        cardSnapshot: { ...structuredClone(state.villagers[2].cardSnapshot), id, name: id },
      });
  const common = venue.zones!.find((zone) => zone.id === "common")!;
  common.connectedTo!.push("garden");
  venue.zones!.push({
    ...defaultVenueSpace("community"),
    id: "garden",
    name: "Garden",
    kind: "public",
    connectedTo: ["common"],
    description: "A flower garden.",
    seen: true,
  });
  initializeVenueAccess(venue);
  const capturedAt = configure?.(state) || at;
  const participants = state.villagers.map((actor) => ({
    characterId: actor.characterId,
    name: actor.characterId,
    doing: "Talking",
  }));
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "movement-scene",
      sceneRevision: 1,
      villageSeed: state.seed,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: "common",
      status: "active",
      startedAt: capturedAt,
      lastActivityAt: capturedAt,
      activeIds: ["a", "b"],
      participants,
      sceneAttendance: {
        capturedAt,
        layout: captureSceneLayout(venue),
        occupants: participants.map((row) => ({
          ...row,
          zoneId: ["a", "b"].includes(row.characterId) ? "common" : "garden",
        })),
      },
    }),
    venue,
  );
  scene.contactGeneration!.actorIds = participants.map((row) => row.characterId);
  const context = narrationContinuityContext(state, scene, venue, "movement-operation", message, capturedAt),
    readset = fittedNarrationReadset(
      state,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    );
  const cross = { segment: "cross", perceive: { kind: "seen", by: ["player"] } };
  const raw: any = {
    segments: [
      { id: "before", kind: "dialogue", speakerId: "a", text: "The old conversation is private to this room." },
      { id: "cross", kind: "narration", text: "You walk into the garden.", requires: ["move"] },
      { id: "after", kind: "dialogue", speakerId: "c", text: "Hello in the garden." },
    ],
    commands: [
      {
        id: "move",
        type: "move",
        who: "player",
        to: "garden",
        at: "cross",
        source: [{ input: message, ground: { kind: "visible-action", to: ["a", "b"], at: "start" } }, cross],
      },
    ],
  };
  return {
    state,
    venue,
    scene,
    readset,
    raw,
    cross,
    accept: () =>
      acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, "movement-turn", capturedAt),
  };
}
function timedFixture({
  hours,
  viaBridge = false,
  instant = at,
  message = input,
}: {
  hours: NonNullable<VenueAccessState["visitorHours"]>;
  viaBridge?: boolean;
  instant?: string;
  message?: string;
}) {
  return fixture(false, message, (state) => {
    state.timeZone = "America/Los_Angeles";
    const venue = state.venues[0],
      garden = venue.zones!.find((zone) => zone.id === "garden")!;
    if (viaBridge) {
      venue.zones!.find((zone) => zone.id === "common")!.connectedTo = ["exterior", "bridge"];
      garden.connectedTo = ["bridge"];
      venue.zones!.push({
        ...defaultVenueSpace("community"),
        id: "bridge",
        name: "Passage",
        kind: "public",
        connectedTo: ["common", "garden"],
        seen: true,
      });
      initializeVenueAccess(venue);
    }
    venue.access!.managerIds = ["c"];
    venue.access!.permissions = [];
    const target = viaBridge ? venue.zones!.find((zone) => zone.id === "bridge")! : garden;
    target.access = {
      ...target.access!,
      mode: "public",
      managerIds: ["c"],
      memberIds: [],
      memberRoles: [],
      inviterIds: [],
      visitorHours: structuredClone(hours),
    };
    return instant;
  });
}
async function inUtcHost(work: () => unknown) {
  const previous = process.env.TZ;
  try {
    process.env.TZ = "UTC";
    assert.equal(new Date(at).getHours(), 21, "The host-local counterexample must actually run in UTC");
    await work();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}
await runCase("narration-movement/calendar-allow", () =>
  inUtcHost(() => {
    for (const viaBridge of [false, true])
      for (const overnight of [false, true]) {
        const f = timedFixture({
          viaBridge,
          instant: overnight ? "2026-11-10T07:00:00.000Z" : at,
          hours: [{ days: ["Monday"], start: overnight ? "22:00" : "12:00", end: overnight ? "02:00" : "14:00" }],
        });
        assert.equal(f.readset.calendar.timeZone, "America/Los_Angeles");
        const result = f.accept();
        assert.equal(result.held, false, JSON.stringify(result.rejected));
        assert.deepEqual(
          result.episode!.commandReceipts[0].movement!.path,
          viaBridge ? ["common", "bridge", "garden"] : ["common", "garden"],
        );
      }
  }),
);
await runCase("narration-movement/calendar-deny", () =>
  inUtcHost(() => {
    for (const viaBridge of [false, true])
      for (const overnight of [false, true]) {
        const f = timedFixture({
            viaBridge,
            instant: overnight ? "2026-11-10T07:00:00.000Z" : at,
            hours: [
              {
                days: [overnight ? "Tuesday" : "Monday"],
                start: overnight ? "06:00" : "20:00",
                end: overnight ? "08:00" : "22:00",
              },
            ],
          }),
          before = memoryHash(f.state);
        assert.equal(f.accept().held, true, "Host-local opening hours cannot authorize this Village crossing");
        assert.equal(memoryHash(f.state), before);
      }
  }),
);
await runCase("narration-movement/calendar-group", () =>
  inUtcHost(() => {
    for (const open of [false, true])
      for (const viaBridge of [false, true]) {
        const message = "Would you both come to the garden?",
          f = timedFixture({
            message,
            viaBridge,
            hours: [{ days: ["Monday"], start: open ? "12:00" : "20:00", end: open ? "14:00" : "22:00" }],
          });
        f.raw.segments = [
          { id: "answer", kind: "dialogue", speakerId: "a", text: "Let us consider that.", requires: ["request"] },
        ];
        f.raw.commands = [
          {
            id: "request",
            type: "move.request",
            to: "garden",
            actors: ["a", "b"],
            at: "answer",
            source: [{ input: message, ground: { kind: "spoken", to: ["a", "b"] } }],
          },
        ];
        const before = memoryHash(f.state),
          result = f.accept();
        assert.equal(result.held, !open, JSON.stringify(result.rejected));
        if (open) assert.equal(result.episode!.commandReceipts[0].kind, "movement-request");
        else assert.equal(memoryHash(f.state), before);
      }
  }),
);
await runCase("narration-movement/calendar-replay", () =>
  inUtcHost(async () => {
    const f = timedFixture({ viaBridge: true, hours: [{ days: ["Monday"], start: "12:00", end: "14:00" }] }),
      storage = sceneHistoryFixture();
    try {
      const repository = createVillageRepository(() => storage.gate.documents),
        publication = JSON.parse(JSON.stringify({ raw: f.raw, readset: f.readset, responseDigest: memoryHash(f.raw) }));
      await repository.mutateAuthority((state) => Object.assign(state, f.state), { memories: true });
      await repository.mutateAuthority((state) => {
        state.timeZone = "Asia/Tokyo";
      });
      const cold = createVillageRepository(() => ({ ...storage.gate.documents }));
      let accepted: ReturnType<typeof acceptNarration> | undefined;
      await cold.mutateAuthority(
        (state) => {
          accepted = acceptNarration(state, publication, "movement-turn", "2026-11-12T20:00:00.000Z");
          assert.equal(accepted.held, false, JSON.stringify(accepted.rejected));
        },
        { memories: true },
      );
      const saved = await cold.readAuthority({ memories: true });
      assert.equal(saved.timeZone, "Asia/Tokyo");
      assert.deepEqual(saved.episodes.records[0].commandReceipts[0].movement!.path, ["common", "bridge", "garden"]);
      assert.equal(publication.readset.calendar.time, "13:00");
      assert.equal(saved.episodes.records.length, 1);
      assert(accepted?.episode);
    } finally {
      storage.release();
    }
  }),
);
await runCase("narration-movement/calendar-context", () =>
  inUtcHost(() => {
    for (const open of [false, true])
      for (const laterContext of [false, true]) {
        const hours: NonNullable<VenueAccessState["visitorHours"]> = [
            { days: ["Monday"], start: open ? "12:00" : "20:00", end: open ? "14:00" : "22:00" },
          ],
          f = timedFixture({ hours }),
          garden = f.venue.zones!.find((zone) => zone.id === "garden")!,
          common = f.venue.zones!.find((zone) => zone.id === "common")!;
        garden.access!.mode = "permission-required";
        common.access = {
          ...common.access!,
          mode: "public",
          managerIds: ["c"],
          memberIds: [],
          memberRoles: [],
          visitorHours: structuredClone(hours),
        };
        f.venue.access!.permissions.push({
          id: "escort-visit",
          zoneId: "garden",
          visitorId: "player",
          issuerId: "c",
          duration: "visit",
          sceneId: null,
          accompaniedBy: "c",
          outsideHours: false,
          revoked: false,
          issuedAt: at,
          sourceLineIds: [],
        });
        f.scene.accompanying = [{ characterId: "c", zoneId: "common" }];
        f.scene.sceneAttendance!.layout = captureSceneLayout(f.venue);
        if (laterContext) {
          f.scene.continuity = captureSceneContinuity(f.state, f.scene, Date.parse(at) + 8 * 60 * 60_000);
          f.state.timeZone = "Asia/Tokyo";
        }
        const context = sceneAccessContext(f.scene, undefined, f.state.timeZone);
        assert.equal(context.at!.toISOString(), at, "Applying a timezone cannot advance the admitted access instant");
        assert.equal(context.at!.getHours(), 13);
        assert.equal(
          sceneMoveAccompanying(f.scene, f.venue, garden, f.state)!.find((row) => row.characterId === "c")!.zoneId,
          open ? "garden" : "common",
        );
        assert.equal(
          accessExits(f.scene, f.state, f.venue).some((exit) => exit.actor === "player"),
          !open,
          "Missing or later context cannot reinterpret native admission hours",
        );
      }
  }),
);
await runCase("narration-movement/calendar-operations", () =>
  inUtcHost(async () => {
    const clock = (minutes: number) => {
      const value = (minutes + 1440) % 1440;
      return String(Math.floor(value / 60)).padStart(2, "0") + ":" + String(value % 60).padStart(2, "0");
    };
    for (const kind of ["entry", "move", "escort", "live"] as const)
      for (const open of [false, true]) {
        const host = await packagedSceneServer({
          configure(world, now) {
            world.timeZone = "America/Los_Angeles";
            const venue = world.venues[0],
              zone = venue.zones!.find((zone) => zone.id === "common")!,
              local = new ZonedDate(now, open ? world.timeZone : "UTC"),
              minute = local.getHours() * 60 + local.getMinutes();
            venue.access!.managerIds = ["mara"];
            venue.access!.permissions = [];
            zone.access = {
              ...zone.access!,
              mode: kind === "escort" ? "permission-required" : "public",
              managerIds: ["mara"],
              memberIds: [],
              memberRoles: [],
              inviterIds: [],
              visitorHours: [{ days: [...VILLAGE_WEEKDAYS], start: clock(minute - 10), end: clock(minute + 10) }],
            };
            if (kind === "escort")
              venue.access!.permissions.push({
                id: "calendar-visit",
                zoneId: zone.id,
                visitorId: "player",
                issuerId: "mara",
                duration: "visit",
                sceneId: null,
                accompaniedBy: "mara",
                outsideHours: false,
                revoked: false,
                issuedAt: now,
                sourceLineIds: [],
              });
            world.villagers[0].agenda = agendaFixture({
              day: [
                {
                  startMinute: 0,
                  endMinute: 1440,
                  venueId: venue.id,
                  zoneId: kind === "escort" ? "exterior" : "common",
                  activity: "Waiting",
                },
              ],
            });
          },
          configureScene(scene) {
            scene.zoneId = kind === "live" ? "common" : "exterior";
            scene.activeIds = kind === "escort" || kind === "live" ? ["mara"] : [];
            const zoneId = kind === "escort" ? "exterior" : "common";
            scene.accompanying = [{ characterId: "mara", zoneId }];
            scene.sceneAttendance!.occupants[0].zoneId = zoneId;
            if (kind === "entry") {
              scene.status = "closed";
              scene.endedAt = scene.startedAt;
              scene.endReason = "player";
            }
          },
        });
        try {
          if (kind === "entry") {
            const pointer = host.records.get("villages-active-venue");
            pointer.data = { sessionId: "", placeId: "" };
            pointer.revision++;
            const answer = await host.app.inject({
              method: "POST",
              url: "/api/villages/rooms",
              payload: { venueId: "mill", zoneId: "common" },
            });
            assert.equal(answer.statusCode, open ? 200 : 409, answer.body);
            if (open) assert.equal(answer.json().session.zoneId, "common");
          } else {
            const active = await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" });
            assert.equal(active.statusCode, 200, active.body);
            const scene = active.json().session;
            assert(scene);
            if (kind === "live") assert.equal(scene.zoneId, open ? "common" : "exterior");
            else {
              const answer = await host.app.inject({
                method: "POST",
                url: "/api/villages/rooms/zone",
                payload: {
                  sessionId: scene.id,
                  zoneId: "common",
                  expectedSceneRevision: scene.sceneRevision,
                  operationId: "calendar-move",
                },
              });
              assert.equal(answer.statusCode, open ? 200 : 409, answer.body);
              assert.equal(host.scene().zoneId, open ? "common" : "exterior");
              if (kind === "escort") {
                const state = fixtureVillageState(host.records.get("villages-village").data, host.records);
                assert.equal(state.venues[0].access!.permissions[0].sceneId, open ? scene.id : null);
                if (open)
                  assert.equal(host.scene().accompanying!.find((row) => row.characterId === "mara")!.zoneId, "common");
              }
            }
          }
          assert.equal(host.calls(), 0, "Entry, movement and current access refresh purchase no model work");
        } finally {
          await host.stop();
        }
      }
  }),
);
await runCase("narration-movement/player", () => {
  const f = fixture(),
    result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const episode = result.episode!;
  assert(!episode.segments[0].heardBy.includes("c"));
  assert(episode.segments[2].heardBy.includes("player"));
  assert(!episode.segments[2].heardBy.includes("b"));
  assert.equal(episode.commandReceipts[0].movement!.from, "common");
  assert.equal(episode.commandReceipts[0].movement!.zoneId, "garden");
  const scene = structuredClone(f.scene);
  applyAcceptedSceneDelta(scene, episode);
  assert.equal(scene.id, f.scene.id);
  assert.equal(scene.zoneId, "garden");
  assert.deepEqual(scene.activeIds, ["c"]);
  assert.equal(scene.enteredFromZoneId, "common");
  assert.equal(scene.navigationReceipts!.length, 1);
  const cold = readAcceptedEpisode(JSON.parse(JSON.stringify(episode)), f.state.seed);
  assert.deepEqual(cold.sceneDelta, episode.sceneDelta);
  const bad = JSON.parse(JSON.stringify(episode));
  bad.commandReceipts[0].movement.from = "garden";
  assert.throws(() => readAcceptedEpisode(bad, f.state.seed), /movement/);
});
await runCase("narration-movement/resident", () => {
  const f = fixture();
  f.raw.segments = [
    { id: "cross", kind: "narration", text: "Mara leaves this room for the garden.", requires: ["move"] },
    { id: "away", kind: "dialogue", speakerId: "a", text: "A private remark in the garden." },
  ];
  f.raw.commands = [{ id: "move", type: "move", who: "a", to: "garden", at: "cross", source: [f.cross] }];
  const result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert(!result.episode!.segments[1].heardBy.includes("player"));
  assert(result.episode!.segments[1].soundOnly?.player);
  const scene = structuredClone(f.scene);
  applyAcceptedSceneDelta(scene, result.episode!);
  assert.equal(scene.zoneId, "common");
  assert.equal(scene.accompanying!.find((row) => row.characterId === "a")!.zoneId, "garden");
  assert(!scene.activeIds.includes("a"));
});
await runCase("narration-movement/authority", () => {
  for (const kind of ["private", "no-crossing", "unknown", "unanchored", "layout", "denied", "noop"]) {
    const f = fixture();
    if (kind === "private") f.raw.commands[0].source[0].ground = { kind: "private", at: "start" };
    if (kind === "no-crossing") f.raw.commands[0].source.pop();
    if (kind === "unknown") f.raw.commands[0].to = "unknown";
    if (kind === "unanchored") delete f.raw.commands[0].source[0].ground.at;
    if (kind === "layout") f.venue.zones!.find((zone) => zone.id === "common")!.connectedTo = [];
    if (kind === "denied")
      f.venue.zones!.find((zone) => zone.id === "garden")!.access = {
        mode: "permission-required",
        managerIds: ["c"],
        memberIds: ["c"],
        memberRoles: [],
        inviterIds: ["c"],
        visitorHours: "always",
        accompanied: false,
      };
    if (kind === "noop") f.raw.commands[0].to = "common";
    const before = memoryHash(f.state);
    assert.equal(f.accept().held, true, kind);
    assert.equal(memoryHash(f.state), before);
  }
});
await runCase("narration-movement/capacity", () => {
  for (const swap of [false, true]) {
    const f = fixture(true);
    f.raw.segments = [
      {
        id: "cross",
        kind: "narration",
        text: "The residents change rooms.",
        requires: swap ? ["move", "return"] : ["move"],
      },
    ];
    f.raw.commands = [{ id: "move", type: "move", who: "a", to: "garden", at: "cross", source: [f.cross] }];
    if (swap)
      f.raw.commands.push({ id: "return", type: "move", who: "c", to: "common", at: "cross", source: [f.cross] });
    const before = memoryHash(f.state),
      result = f.accept();
    assert.equal(result.held, !swap);
    if (!swap) assert.equal(memoryHash(f.state), before);
    else
      assert.equal(
        result.episode!.commandReceipts.length,
        2,
        "capacity is checked after simultaneous departures and arrivals",
      );
  }
});
await runCase("narration-movement/independent", () => {
  const f = fixture();
  f.raw.segments = [{ id: "cross", kind: "narration", text: "You look toward an unfamiliar passage." }];
  f.raw.commands[0].to = "unknown";
  f.raw.commands[0].independent = true;
  const result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(result.episode!.commandReceipts.length, 0);
  assert(!result.episode!.sceneDelta);
  for (const reason of ["private", "denied"]) {
    const g = fixture();
    g.raw.segments = [
      { id: "cross", kind: "narration", text: "You look toward the garden." },
      {
        id: "whisper",
        kind: "dialogue",
        speakerId: "a",
        text: "I am speaking privately here.",
        delivery: "whisper",
        targetId: "player",
      },
    ];
    g.raw.commands[0].independent = true;
    if (reason === "private") g.raw.commands[0].source[0].ground = { kind: "private", at: "start" };
    else
      g.venue.zones!.find((zone) => zone.id === "garden")!.access = {
        mode: "permission-required",
        managerIds: ["c"],
        memberIds: ["c"],
        memberRoles: [],
        inviterIds: ["c"],
        visitorHours: "always",
        accompanied: false,
      };
    const accepted = g.accept();
    assert.equal(accepted.held, false, reason);
    assert.equal(accepted.episode!.commandReceipts.length, 0);
    assert(!accepted.episode!.sceneDelta);
    assert(
      accepted.episode!.segments[1].heardBy.includes("player"),
      "dropping an invalid optional move restores the actual local whisper routing",
    );
  }
  const partial = fixture();
  partial.raw.segments = [
    { id: "cross", kind: "narration", text: "You consider the garden." },
    {
      id: "whisper",
      kind: "dialogue",
      speakerId: "a",
      text: "We are talking quietly here.",
      delivery: "whisper",
      targetId: "player",
    },
  ];
  partial.raw.commands[0].independent = true;
  partial.raw.commands[0].source[0].ground = { kind: "private", at: "start" };
  partial.raw.commands.push({
    id: "resident",
    type: "move",
    who: "a",
    to: "garden",
    at: "cross",
    source: [partial.cross],
    independent: true,
  });
  const accepted = partial.accept();
  assert.equal(accepted.held, false);
  assert.equal(accepted.episode!.commandReceipts.length, 0);
  assert(!accepted.episode!.sceneDelta);
  assert(
    accepted.episode!.segments[1].heardBy.includes("player"),
    "failed planned movement is selected before routing a partially validated timeline",
  );
});
await runCase("narration-movement/private-destination", () => {
  const f = fixture(),
    target = f.venue.zones!.find((zone) => zone.id === "garden")!;
  target.name = "Private archive";
  target.kind = "restricted";
  target.seen = false;
  target.access = {
    mode: "permission-required",
    managerIds: ["a"],
    memberIds: ["a"],
    memberRoles: [],
    inviterIds: [],
    visitorHours: "always",
    accompanied: false,
  };
  f.scene.sceneAttendance!.layout = captureSceneLayout(f.venue);
  Object.assign(f.scene, zoneEventScene(f.scene, f.venue));
  const context = narrationContinuityContext(f.state, f.scene, f.venue, "movement-operation", input, at);
  Object.assign(
    f.readset,
    fittedNarrationReadset(
      f.state,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    ),
  );
  f.raw.segments = [{ id: "cross", kind: "narration", text: "Mara steps out of the room.", requires: ["move"] }];
  f.raw.commands = [{ id: "move", type: "move", who: "a", to: "garden", at: "cross", source: [f.cross] }];
  f.raw.keep = [
    {
      id: "unseen-destination",
      for: ["player"],
      text: "Mara went to the Private archive.",
      class: "information",
      source: ["native:move"],
      independent: true,
    },
  ];
  const result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert(result.rejected.some((row) => row.id === "unseen-destination"));
  assert.deepEqual(result.episode!.commandReceipts[0].witnesses, ["a"]);
  const cold = readAcceptedEpisode(JSON.parse(JSON.stringify(result.episode)), f.state.seed),
    view = actorEpisodeView(cold, f.state.continuity, continuityActor(f.state, "player")!, {
      ...f.state.episodes,
      records: [cold],
    });
  assert(!JSON.stringify(view).includes("Private archive"));
});
await runCase("narration-movement/two-turns", async () => {
  const f = fixture();
  f.raw.segments = [{ id: "cross", kind: "narration", text: "Mara leaves for the garden.", requires: ["move"] }];
  f.raw.commands = [{ id: "move", type: "move", who: "a", to: "garden", at: "cross", source: [f.cross] }];
  const first = f.accept();
  assert.equal(first.held, false, JSON.stringify(first.rejected));
  const scene = structuredClone(f.scene);
  applyAcceptedSceneDelta(scene, first.episode!);
  const storage = sceneHistoryFixture();
  try {
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority((state) => Object.assign(state, f.state), { memories: true });
    const state = await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true });
    const context = narrationContinuityContext(state, scene, state.venues[0], "return-operation", "Welcome back.", at),
      readset = fittedNarrationReadset(
        state,
        context,
        context.parts.map((part) => part.block.evidenceId!),
      );
    const raw = {
      segments: [
        { id: "back", kind: "narration", text: "Mara comes back into the common room.", requires: ["return"] },
      ],
      commands: [
        {
          id: "return",
          type: "move",
          who: "a",
          to: "common",
          at: "back",
          source: [{ segment: "back", perceive: { kind: "seen", by: ["player"] } }],
        },
      ],
    };
    const result = acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, "return-turn", at);
    assert.equal(result.held, false, JSON.stringify(result.rejected));
    assert.equal(result.episode!.actors.find((actor) => actor.id === "a")!.zoneId, "garden");
    applyAcceptedSceneDelta(scene, readAcceptedEpisode(JSON.parse(JSON.stringify(result.episode)), state.seed));
    assert.equal(scene.accompanying!.find((row) => row.characterId === "a")!.zoneId, "common");
    assert(scene.activeIds.includes("a"));
    assert.equal(state.episodes.records.length, 2);
  } finally {
    storage.release();
  }
});
await runCase("narration-movement/group-request", () => {
  function request(full = false) {
    const message = "Would you both come to the garden?",
      f = fixture(full, message);
    f.raw.segments = [
      { id: "a-answer", kind: "dialogue", speakerId: "a", text: "I can come with you." },
      { id: "b-answer", kind: "dialogue", speakerId: "b", text: "I would rather stay here.", requires: ["request"] },
    ];
    f.raw.commands = [
      {
        id: "request",
        type: "move.request",
        to: "garden",
        actors: ["a", "b"],
        at: "b-answer",
        source: [{ input: message, ground: { kind: "spoken", to: ["a", "b"] } }],
      },
    ];
    return f;
  }
  const f = request(),
    result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(result.episode!.commandReceipts[0].kind, "movement-request");
  assert(!result.episode!.sceneDelta);
  assert.equal(f.scene.zoneId, "common");
  assert.equal(f.state.episodes.records.length, 1);
  assert(!f.scene.accompanying?.length, "the ask and individual answers never move or consent for the group");
  for (const reason of ["unrelated-proof", "unheard", "offstage", "capacity"]) {
    const g = request(reason === "capacity");
    if (reason === "unrelated-proof") g.raw.commands[0].source.push({ segment: "a-answer" });
    if (reason === "unheard")
      g.raw.commands[0].source[0].ground = { kind: "spoken", to: ["a"], delivery: "whisper", targetId: "a" };
    if (reason === "offstage") g.raw.commands[0].actors = ["a", "c"];
    const before = memoryHash(g.state);
    assert.equal(g.accept().held, true, reason);
    assert.equal(memoryHash(g.state), before);
  }
  const silent = request();
  silent.raw.segments = [
    { id: "a-answer", kind: "narration", text: "Mara nods. Bob stays quiet.", requires: ["request"] },
  ];
  silent.raw.commands[0].at = "a-answer";
  const silence = silent.accept();
  assert.equal(silence.held, false);
  assert(!silence.episode!.sceneDelta);
  assert(!silence.episode!.commandReceipts[0].text.includes("responded"));
  assert(silence.episode!.commandReceipts[0].text.includes("no movement or consent"));
  const later = request();
  later.raw.commands[0].source[0].ground.at = { after: "a-answer" };
  const laterResult = later.accept();
  assert.equal(
    laterResult.held,
    false,
    "earlier resident speech is retained as prose, never bound as an answer to a later Player request",
  );
  assert(!laterResult.episode!.sceneDelta);
  const arrived = request();
  arrived.raw.segments = [
    { id: "arrival", kind: "narration", text: "Chris joins the common room.", requires: ["arrival", "request"] },
  ];
  arrived.raw.commands = [
    {
      id: "arrival",
      type: "move",
      who: "c",
      to: "common",
      at: "arrival",
      source: [{ segment: "arrival", perceive: { kind: "seen", by: ["player"] } }],
    },
    {
      id: "request",
      type: "move.request",
      to: "garden",
      actors: ["a", "c"],
      at: "arrival",
      source: [
        {
          input: "Would you both come to the garden?",
          ground: { kind: "spoken", to: ["a", "c"], at: { after: "arrival" } },
        },
      ],
      requires: ["arrival"],
    },
  ];
  const afterArrival = arrived.accept();
  assert.equal(afterArrival.held, false, JSON.stringify(afterArrival.rejected));
  assert.equal(
    afterArrival.episode!.commandReceipts.length,
    2,
    "the group's locality follows the actual request moment after arrival",
  );
});
await runCase("narration-movement/recovery", () => {
  const f = fixture(),
    result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const episode = result.episode!,
    saved = structuredClone(f.scene);
  f.state.villagers = [];
  f.state.venues = [];
  const before = memoryHash(f.state);
  assert.equal(f.accept().held, false);
  assert.equal(memoryHash(f.state), before);
  assert.equal(f.state.episodes.records.length, 1);
  saved.sceneRevision++;
  assert.throws(() => applyAcceptedSceneDelta(saved, episode), /admitted revision/);
  assert.equal(saved.zoneId, "common");
  saved.sceneRevision--;
  applyAcceptedSceneDelta(saved, readAcceptedEpisode(JSON.parse(JSON.stringify(episode)), f.state.seed));
  assert.equal(
    saved.zoneId,
    "garden",
    "lost Scene acknowledgement uses the original retained result after world authority changes",
  );
});
await runCase("narration-movement/departure", () => {
  function departure() {
    const f = fixture();
    f.raw.segments = [
      {
        id: "cross",
        kind: "narration",
        text: "Mara leaves the conversation to handle her own affairs.",
        requires: ["leave"],
      },
      { id: "after", kind: "dialogue", speakerId: "b", text: "Now that Mara has gone, I want to speak privately." },
    ];
    f.raw.commands = [{ id: "leave", type: "depart", who: "a", at: "cross", source: [f.cross] }];
    return f;
  }
  const f = departure(),
    agendas = memoryHash(f.state.villagers.map((actor) => actor.agenda)),
    result = f.accept();
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert(!result.episode!.segments[1].heardBy.includes("a"));
  assert(!result.episode!.segments[1].soundOnly?.characterIds.includes("a"));
  assert.equal(
    memoryHash(f.state.villagers.map((actor) => actor.agenda)),
    agendas,
    "Scene departure never changes a native Agenda or invents travel",
  );
  const cold = readAcceptedEpisode(JSON.parse(JSON.stringify(result.episode)), f.state.seed),
    scene = structuredClone(f.scene);
  applyAcceptedSceneDelta(scene, cold);
  assert.deepEqual(scene.departedIds, ["a"]);
  assert.equal(scene.status, "active");
  assert.equal(scene.zoneId, "common");
  assert(!scene.activeIds.includes("a"));
  assert(!scene.accompanying?.some((row) => row.characterId === "a"));
  assert(!cold.commandReceipts[0].text.includes("garden"));
  for (const reason of ["player", "offstage", "promise", "route", "duplicate"]) {
    const g = departure();
    if (reason === "player") g.raw.commands[0].who = "player";
    if (reason === "offstage") g.raw.commands[0].who = "c";
    if (reason === "promise") {
      g.raw.segments[0] = {
        id: "cross",
        kind: "dialogue",
        speakerId: "a",
        text: "I will leave later.",
        requires: ["leave"],
      };
      g.raw.commands[0].source = [{ segment: "cross" }];
    }
    if (reason === "route") g.venue.zones!.find((zone) => zone.id === "common")!.connectedTo = [];
    if (reason === "duplicate") g.raw.commands.push({ ...g.raw.commands[0], id: "second" });
    const before = memoryHash(g.state);
    assert.equal(g.accept().held, true, reason);
    assert.equal(memoryHash(g.state), before);
  }
  const bad = JSON.parse(JSON.stringify(cold));
  bad.commandReceipts[0].departure.path = ["common", "garden"];
  assert.throws(() => readAcceptedEpisode(bad, f.state.seed), /departure/);
  f.state.villagers = [];
  const before = memoryHash(f.state);
  assert.equal(f.accept().held, false);
  assert.equal(memoryHash(f.state), before);
});
