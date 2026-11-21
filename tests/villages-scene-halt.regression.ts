// Test cases: scene-halt/captured-calendar, scene-halt/calendar, scene-halt/evidence, scene-halt/world, scene-halt/authority-order, scene-halt/explanation, scene-halt/unsupported-outcomes, scene-halt/playable-outcomes, scene-halt/private-explanation, scene-halt/protection-race
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  capturedSceneCalendar,
  readSceneCalendar,
  sceneAppointment,
} from "../packages/villages/src/server/domain/rules/scene-calendar.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { protectContinuity } from "../packages/villages/src/server/domain/rules/continuity.js";
const at = "2026-10-15T20:00:00.000Z",
  zone = "America/Los_Angeles";
function fixture(
  when: object = { dayOffset: 1 },
  minute: number | undefined = 15 * 60,
  capturedAt = at,
  input = "I would like to meet.",
) {
  const state = { ...defaultVillageState(), seed: "calendar-world", setupAt: at, foundedAt: at, timeZone: zone };
  const place = establishPlace(
    state,
    {
      name: "Cafe",
      description: "A cafe.",
      people: [{ ref: "mara", name: "Mara", characterization: "A host." }],
      zones: [{ id: "parlor", name: "Parlor", kind: "public", description: "Tables." }],
    },
    "cafe",
    "map",
    "found",
    at,
    true,
  );
  const actor = Object.keys(state.worldPlaces.npcs)[0];
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "calendar-scene",
      placeId: place.id,
      placeName: "Cafe",
      villageSeed: state.seed,
      zoneId: "parlor",
      sceneRevision: 1,
      status: "active",
      startedAt: at,
      lastActivityAt: at,
      activeIds: [actor],
      participants: [{ characterId: actor, name: "Mara", doing: "Talking" }],
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(place.location),
        occupants: [{ characterId: actor, name: "Mara", doing: "Talking", zoneId: "parlor" }],
      },
    }),
    place.location,
  );
  const context = narrationContinuityContext(state, scene, place.location, "calendar-operation", input, capturedAt);
  const readset = fittedNarrationReadset(
    state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  const raw: any = {
    segments: [
      {
        id: "promise",
        kind: "dialogue",
        speakerId: actor,
        text: "I will meet you at the agreed time.",
        requires: ["date"],
      },
    ],
    commands: [
      {
        id: "date",
        type: "appointment",
        by: actor,
        at: "promise",
        when,
        ...(minute === undefined ? {} : { minute }),
        source: [{ segment: "promise" }],
      },
    ],
  };
  const publication = () => ({ raw, readset, responseDigest: memoryHash(raw) });
  return {
    state,
    actor,
    scene,
    readset,
    raw,
    publication,
    accept: (acceptedAt = capturedAt) => acceptNarration(state, publication(), "calendar-turn", acceptedAt),
  };
}
await runCase("scene-halt/captured-calendar", () => {
  const scene = { startedAt: "2026-10-19T14:00:00.000Z" };
  assert.deepEqual(capturedSceneCalendar(scene, zone), {
    instant: scene.startedAt,
    date: "2026-10-19",
    weekday: "Monday",
    time: "07:00",
    timeZone: zone,
  });
  for (const instant of ["2026-11-01T08:30:00.000Z", "2026-11-01T09:30:00.000Z"]) {
    const value = capturedSceneCalendar({ startedAt: instant }, zone);
    assert.equal(value.time, "01:30");
    assert.equal(value.weekday, "Sunday");
    assert.deepEqual(readSceneCalendar(value), value);
  }
  assert.equal(capturedSceneCalendar({ startedAt: "2027-01-01T07:30:00.000Z" }, zone).date, "2026-12-31");
  assert.throws(() => capturedSceneCalendar({ startedAt: "invalid" }, zone), /calendar/);
  const captured = capturedSceneCalendar(scene, zone);
  assert.throws(() => readSceneCalendar({ ...captured, date: "2026-10-20" }), /identity/);
  const f = fixture();
  assert.deepEqual(f.readset.calendar, capturedSceneCalendar({ startedAt: at }, zone));
});
await runCase("scene-halt/calendar", () => {
  for (const [when, date] of [
    [{ dayOffset: 1 }, "2026-10-16"],
    [{ weekday: "Thursday", afterToday: true }, "2026-10-22"],
    [{ date: "2026-10-20" }, "2026-10-20"],
  ] as const) {
    const f = fixture(when),
      before = memoryHash(f.state.clock),
      result = f.accept();
    assert.equal(result.held, false);
    const receipt = result.episode!.commandReceipts[0];
    assert.equal(receipt.kind, "appointment");
    assert(receipt.text.includes(date + " 15:00"));
    assert.equal(memoryHash(f.state.clock), before, "binding a date never advances Village time");
  }
  const dateOnly = fixture({ dayOffset: 0 }, undefined);
  assert.equal(dateOnly.accept().held, false);
  assert.equal(
    sceneAppointment({ when: { weekday: "Thursday" } }, capturedSceneCalendar({ startedAt: at }, zone)).date,
    "2026-10-15",
  );
  for (const [when, minute] of [
    [{ dayOffset: -1 }, 900],
    [{ dayOffset: 0 }, 12 * 60],
    [{ date: "2026-02-30" }, 900],
    [{ dayOffset: 1, date: "2026-10-20" }, 900],
    [{ dayOffset: 1 }, 1440],
  ] as const) {
    const f = fixture(when, minute);
    const before = memoryHash(f.state);
    assert.equal(f.accept().held, true);
    assert.equal(memoryHash(f.state), before);
  }
});
await runCase("scene-halt/evidence", () => {
  for (const source of [[{ input: "I would like to meet.", ground: { kind: "private" } }], ["self"], ["h:invented"]]) {
    const f = fixture();
    f.raw.commands[0].source = source;
    assert.equal(f.accept().held, true);
    assert.equal(f.state.episodes.records.length, 0);
  }
  const other = fixture();
  other.raw.commands[0].by = "player";
  assert.equal(other.accept().held, true, "another speaker cannot bind the Player's appointment");
  const f = fixture();
  f.raw.commands[0].clock = { advanceMs: 1000 };
  assert.equal(f.accept().held, true, "undeclared time mutation fields are rejected");
});
await runCase("scene-halt/world", () => {
  const gap = fixture({ date: "2027-03-14" }, 150);
  assert.equal(gap.accept().held, true, "a skipped 02:30 cannot silently become 03:30");
  const fold = fixture({ dayOffset: 0 }, 90, "2026-11-01T09:15:00.000Z");
  const repeated = fold.accept();
  assert.equal(repeated.held, false, "the second 01:30 is still in the future of the second 01:15");
  assert(repeated.episode!.commandReceipts[0].text.includes("2026-11-01T09:30:00.000Z"));
  const first = fixture({ dayOffset: 0 }, 90, "2026-11-01T08:15:00.000Z");
  assert(first.accept().episode!.commandReceipts[0].text.includes("2026-11-01T08:30:00.000Z"));
  const changed = fixture();
  changed.state.timeZone = "UTC";
  const shifted = changed.accept();
  assert.equal(shifted.held, false);
  assert(
    shifted.episode!.commandReceipts[0].text.includes("America/Los_Angeles"),
    "a settings change cannot reinterpret the admitted appointment timezone",
  );
  const late = fixture();
  assert.equal(
    late.accept("2026-10-17T20:00:00.000Z").held,
    false,
    "delayed saved recovery retains the original Scene calendar without rescheduling or buying another interpretation",
  );
  const changedActor = fixture();
  changedActor.state.worldPlaces.npcs[changedActor.actor].disabled = true;
  assert.throws(() => changedActor.accept(), /incarnation changed/);
  assert.equal(changedActor.state.episodes.records.length, 0);
});
const halt = (source: unknown[]) => ({ segments: [], halt: { reason: "time", source } });
const timeNotice = /^HALT · Village time/;
await runCase("scene-halt/explanation", () => {
  const f = fixture(),
    before = memoryHash(f.state);
  f.raw.segments = [];
  delete f.raw.commands;
  f.raw.halt = { ...halt([{ input: f.readset.source.input }]).halt, message: "A legacy model-written explanation." };
  for (let replay = 0; replay < 2; replay++)
    assert.throws(
      () => f.accept(),
      (error) =>
        error instanceof Error &&
        timeNotice.test(error.message) &&
        (error as { statusCode?: number }).statusCode === 409,
    );
  assert.equal(memoryHash(f.state), before);
  for (const source of ["h:missing", "native:missing", "self", { input: "Words never supplied in this request." }]) {
    f.raw.halt.source = [source];
    assert.throws(
      () => f.accept(),
      (error) => error instanceof Error && !error.message.startsWith("HALT"),
    );
    assert.equal(memoryHash(f.state), before, "invalid halt evidence publishes no state or public HALT notice");
  }
});

await runCase("scene-halt/unsupported-outcomes", () => {
  for (const [reason, input, notice] of [
    ["condition", "I die permanently here.", /permanent change to a character/],
    ["condition", "Mara dies and cannot return.", /permanent change to a character/],
    ["condition", "Mara returns from the dead, fully alive.", /permanent change to a character/],
    ["condition", "Mara can never wake or act again.", /permanent change to a character/],
    ["time", "I travel ten years into the future and arrive.", /Village time/],
    ["time", "I reset the Village clock to yesterday.", /Village time/],
    ["activity", "We sleep six hours and wake up here.", /begin the activity/],
    ["world", "The entire Village is destroyed. Nothing remains.", /playable Village/],
    ["structure", "A new floor is now part of this Venue.", /need a Project/],
    ["authority", "Mara agrees and gives me permanent access to her private room.", /needs permission or a choice/],
  ] as const) {
    const f = fixture(undefined, undefined, at, input);
    const before = memoryHash(f.state);
    delete f.raw.commands;
    f.raw.segments = [];
    f.raw.halt = { reason, source: [{ input }] };
    assert.throws(
      () => f.accept(),
      (error) =>
        error instanceof Error &&
        (error as { statusCode?: number }).statusCode === 409 &&
        error.message.startsWith("HALT") &&
        notice.test(error.message),
      input,
    );
    assert.equal(memoryHash(f.state), before, input);
  }
});

await runCase("scene-halt/playable-outcomes", () => {
  for (const [input, text] of [
    ["I lie down to rest.", "Mara draws the curtains while the room settles."],
    ["I try to turn the clock back.", "Mara watches the clock face and waits for an explanation."],
    ["I threaten to tear down the whole Village.", "Mara steps back. Her hand stays on the door."],
    ['I quote the story: "Mara died a hundred years ago."', "Mara asks where that version of the story came from."],
    ["What would happen if we could travel through time?", "Mara considers how much she would miss."],
    ["I knock the cup off the counter.", "The cup cracks on the floor."],
    ["May I go into your private room?", "Mara shakes her head and stays where she is."],
  ]) {
    const f = fixture(undefined, undefined, at, input);
    delete f.raw.commands;
    f.raw.segments = [{ kind: "narration", text }];
    const result = f.accept();
    assert.equal(result.held, false, input);
    assert.equal(result.episode!.segments[0].content, text);
  }
});

await runCase("scene-halt/private-explanation", () => {
  const f = fixture();
  const privateFact = "Mara privately knows the key is under the tea tin.";
  retainNativeFact(
    f.state,
    {
      id: "private-key",
      kind: "initialization",
      targetId: f.actor,
      revision: 1,
      text: privateFact,
      witnesses: [f.actor],
    },
    at,
    { class: "information", current: true },
  );
  const context = narrationContinuityContext(
    f.state,
    f.scene,
    f.state.worldPlaces.places.cafe.location,
    "halt-private",
    "I declare that I may enter the private room.",
    at,
  );
  const readset = fittedNarrationReadset(
    f.state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  const privateSource = Object.entries(readset.source.historical).find(
    ([, source]) => source.excerpt === privateFact && !source.perceptions.some(({ actorId }) => actorId === "player"),
  );
  assert(privateSource);
  const raw = {
    segments: [],
    halt: { reason: "authority", source: [privateSource[0]], message: privateFact },
  };
  assert.throws(
    () => acceptNarration(f.state, { raw, readset, responseDigest: memoryHash(raw) }, "halt-private", at),
    (error) =>
      error instanceof Error &&
      /^HALT · That outcome needs permission/.test(error.message) &&
      !error.message.includes(privateFact),
  );
});

await runCase("scene-halt/protection-race", () => {
  for (const forget of [false, true]) {
    const f = fixture(),
      holder = continuityActor(f.state, f.actor)!;
    retainNativeFact(
      f.state,
      {
        id: "past",
        kind: "initialization",
        targetId: f.actor,
        revision: 1,
        text: "Mara remembers an earlier meeting.",
        witnesses: [f.actor],
      },
      at,
      { class: "information", current: true },
    );
    const location = f.state.worldPlaces.places.cafe.location,
      context = narrationContinuityContext(
        f.state,
        f.scene,
        location,
        "halt-race",
        "Tell me about the earlier meeting.",
        at,
      ),
      readset = fittedNarrationReadset(
        f.state,
        context,
        context.parts.map((part) => part.block.evidenceId!),
      ),
      root = f.state.continuity.records[0],
      target = readset.admission.supplied.find((row) => row.id === root.id);
    assert(target, "the corrected meaning was actually fitted before the reply");
    f.state.continuity = protectContinuity(
      f.state.continuity,
      target,
      [holder],
      "repair-race",
      at,
      forget ? { forget: true } : { text: "Mara remembers a different earlier meeting." },
    );
    const raw = halt([{ input: readset.source.input }]),
      before = memoryHash(f.state);
    assert.throws(
      () => acceptNarration(f.state, { raw, readset, responseDigest: memoryHash(raw) }, "halt-race", at),
      /protection changed/,
    );
    assert.equal(memoryHash(f.state), before);
  }
});

await runCase("scene-halt/authority-order", () => {
  const f = fixture();
  const accepted = f.accept();
  assert.equal(accepted.held, false);
  const before = memoryHash(f.state);
  f.state.worldPlaces.npcs[f.actor].disabled = true;
  f.state.timeZone = "UTC";
  const changed = memoryHash(f.state),
    replay = f.accept("2026-10-30T20:00:00.000Z");
  assert.equal(replay.held, false);
  assert.equal(memoryHash(f.state), changed);
  assert.equal(f.state.episodes.records.length, 1);
  assert.notEqual(before, changed);
  const optional = fixture({ dayOffset: -1 });
  optional.raw.commands[0].independent = true;
  delete optional.raw.segments[0].requires;
  const result = optional.accept();
  assert.equal(result.held, false);
  assert.equal(result.episode!.commandReceipts.length, 0);
  assert.equal(result.episode!.segments.length, 1);
});
