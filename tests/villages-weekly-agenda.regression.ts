// Test cases: weekly-agenda/visibility, weekly-agenda/agreement
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  agendaSpeechOptions,
  agendaWeek,
  dueAppointment,
} from "../packages/villages/src/server/domain/rules/agenda-overview.js";
import {
  activityMoments,
  recordCompletedActivity,
} from "../packages/villages/src/server/domain/rules/activity-followup.js";
import { agendaBlocksFor } from "../packages/villages/src/server/domain/rules/agenda-week.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";

const at = "2026-11-10T08:00:00.000Z";
const later = "2026-11-10T08:01:00.000Z";
const tomorrow = "2026-11-11";
const when = new Date(at);
const time = { date: tomorrow, startMinute: 720, endMinute: 780, venueId: "mill", zoneId: "exterior" };

function fixture() {
  const world = { ...defaultVillageState(), seed: "agenda", setupAt: at, foundedAt: at, timeZone: "UTC" };
  const venue = venueFixture({ id: "mill", name: "The Mill", category: "public" });
  world.venues.push(venue);
  const resident = {
    characterId: "mara",
    incarnation: "mara-one",
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: {
      id: "mara",
      name: "Mara",
      revision: 1 as const,
      capturedAt: at,
      sourceStatus: "available" as const,
      tags: [],
    },
    wishes: [],
    agenda: agendaFixture({
      day: [
        { startMinute: 0, endMinute: 360, venueId: "", activity: "Sleep", essential: true },
        { startMinute: 540, endMinute: 660, venueId: venue.id, zoneId: "exterior", activity: "Sort maps" },
      ],
    }),
  };
  world.villagers.push(resident);
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "scene",
      placeId: venue.id,
      placeName: venue.name,
      zoneId: "exterior",
      villageSeed: world.seed,
      sceneRevision: 1,
      startedAt: at,
      lastActivityAt: at,
      status: "active",
      activeIds: ["mara"],
      participants: [{ characterId: "mara", name: "Mara", doing: "Talking" }],
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(venue),
        occupants: [{ characterId: "mara", name: "Mara", doing: "Talking", zoneId: "exterior" }],
      },
    }),
    venue,
  );
  function publish(
    raw: Record<string, unknown>,
    operation: string,
    input: string,
    authority = world,
    source = scene,
    instant = at,
  ) {
    const context = narrationContinuityContext(authority, source, venue, operation, input, instant);
    const readset = fittedNarrationReadset(
      authority,
      context,
      context.parts.flatMap(({ block }) => (block.evidenceId ? [block.evidenceId] : [])),
    );
    return acceptNarration(
      authority,
      {
        raw,
        responseDigest: memoryHash(raw),
        readset: {
          ...readset,
          agendaOptions: agendaSpeechOptions(world, ["mara"], when, false),
          agendaVenues: [{ id: venue.id, zones: ["exterior"] }],
        },
      },
      operation,
      instant === at ? later : instant,
    );
  }
  return { world, resident, publish, scene };
}

await runCase("weekly-agenda/visibility", () => {
  const { world, publish } = fixture();
  const view = (inspect = false) => agendaWeek(world, "mara", when, inspect);
  assert.equal(view().days.length, 7);
  assert.deepEqual(
    view().days.flatMap((day) => day.blocks),
    [],
  );
  const inspected = view(true);
  assert.equal(inspected.visibility, "inspect");
  assert.ok(inspected.days[0].blocks.some((block) => block.activity === "Sleep"));
  assert.ok(inspected.days[0].blocks.some((block) => block.activity === "Sort maps"));
  assert.ok(!JSON.stringify(inspected).includes("Taking care of their own affairs"));
  const said = {
    segments: [
      {
        id: "said",
        kind: "dialogue",
        speakerId: "mara",
        text: "I sort maps here from nine until eleven this morning.",
      },
    ],
    keep: [
      {
        for: ["player"],
        about: ["mara"],
        class: "information",
        text: "Mara sorts maps here today from nine until eleven.",
        source: ["said"],
        agenda: {
          actorId: "mara",
          kind: "told",
          time: { ...time, date: "2026-11-10", startMinute: 540, endMinute: 660 },
        },
      },
    ],
  };
  const invalid = structuredClone(said);
  invalid.keep[0].agenda.time.startMinute = 541;
  assert.equal(publish(invalid, "invalid", "What are you doing today?").held, true);
  const result = publish(said, "tell", "What are you doing today?");
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.deepEqual(
    view().days[0].blocks.map(({ activity, source }) => [activity, source]),
    [["Sort maps", "told"]],
  );
  const state = coerceVillageState(JSON.parse(JSON.stringify(world)));
  assert.deepEqual(agendaWeek(state, "mara", when, false), view());
  const actor = continuityActor(world, "mara")!;
  const player = continuityActor(world, "player")!;
  world.continuity = {
    ...world.continuity,
    records: [...world.continuity.records, { id: "warmth", owner: actor, revision: 1, heads: {}, protection: {} }],
    versions: [
      ...world.continuity.versions,
      {
        ...world.continuity.versions[0],
        id: "warmth-version",
        rootId: "warmth",
        createdRevision: world.continuity.revision + 1,
        about: [player],
        relationshipScore: 60,
      },
    ],
  };
  assert.equal(view().visibility, "shared");
  assert.ok(view().days[0].blocks.some((block) => block.activity === "Sleep"));
  world.continuity.versions.at(-1)!.relationshipScore = 59;
  assert.equal(view().visibility, "known");
  assert.ok(
    !view()
      .days.flatMap((day) => day.blocks)
      .some((block) => block.activity === "Sleep"),
  );
});

await runCase("weekly-agenda/agreement", () => {
  const { world, publish, scene } = fixture();
  const propose = "Let's look through maps here tomorrow from noon to one.";
  const raw = {
    segments: [
      { id: "yes", kind: "dialogue", speakerId: "mara", text: "Yes, I'll meet you here tomorrow at noon until one." },
    ],
    keep: [
      {
        id: "meet",
        for: ["player", "mara"],
        about: ["mara"],
        class: "commitment",
        text: "Meet at The Mill tomorrow at noon until one to look through maps.",
        source: [
          { input: propose, ground: { kind: "spoken", to: ["mara"] }, act: "offer" },
          { segment: "yes", act: "accept" },
        ],
        offer: { proposer: "player", participants: ["player", "mara"] },
        agenda: { actorId: "mara", kind: "offer", time, activity: "Look through maps" },
      },
    ],
  };
  const pending = structuredClone(raw);
  pending.keep[0].source.pop();
  pending.segments[0].text = "I'll think about it.";
  assert.equal(publish(pending, "offer-only", propose).held, false);
  assert.equal(world.residentPlans.appointments, undefined);
  const counter = structuredClone(raw);
  counter.segments[0].text = "Yes, but Saturday at noon instead.";
  assert.equal(publish(counter, "counter", propose).held, true);
  assert.equal(world.residentPlans.appointments, undefined);
  const result = publish(raw, "agreement", propose);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const state = coerceVillageState(JSON.parse(JSON.stringify(world)));
  assert.equal(state.residentPlans.appointments?.length, 1);
  assert.ok(
    agendaBlocksFor(state.villagers[0].agenda!, new Date(tomorrow + "T12:15:00Z")).some(
      (block) => block.commitmentId === state.residentPlans.appointments![0].id && block.venueId === "mill",
    ),
  );
  const shared = agendaWeek(state, "mara", when, false).days[1].blocks;
  assert.deepEqual(
    shared.map(({ activity, source }) => [activity, source]),
    [["Look through maps", "agreed"]],
  );
  const conflict = publish(raw, "another-appointment", propose);
  assert.equal(conflict.held, true);
  assert.equal(world.residentPlans.appointments?.length, 1);
  const appointment = state.residentPlans.appointments![0];
  const due = new Date(tomorrow + "T12:15:00Z");
  assert.equal(dueAppointment(state, appointment.id, when), undefined);
  assert.equal(dueAppointment(state, appointment.id, due), appointment);
  assert.equal(agendaWeek(state, "mara", due, false).days[0].blocks[0].join?.id, appointment.id);

  const meetup = { ...scene, id: "joined-meetup", startedAt: due.toISOString() };
  const text = "I marked the old footbridge on this map.";
  const resultAtMeetup = publish(
    { segments: [{ id: "map", kind: "dialogue", speakerId: "mara", text }] },
    "meetup-turn",
    "A private thought",
    state,
    meetup,
    due.toISOString(),
  );
  assert.equal(resultAtMeetup.held, false, JSON.stringify(resultAtMeetup.rejected));
  const episode = resultAtMeetup.episode!;
  const closed = coerceSession({
    ...meetup,
    activity: appointment,
    status: "closed",
    endReason: "player",
    endedAt: due.toISOString(),
  });
  assert.equal(closed.activity?.id, appointment.id);
  const noExchange = structuredClone(state);
  recordCompletedActivity(noExchange, closed);
  assert.equal(noExchange.residentPlans.activities?.[appointment.id].outcome, "quiet");
  closed.submissions = [
    {
      id: "meetup-turn",
      at: due.toISOString(),
      message: "A private thought",
      mode: "chat",
      targetId: "",
      requestFingerprint: "",
      acceptance: { status: "applied", rejected: [] },
      episodeId: episode.id,
    },
  ];
  recordCompletedActivity(state, closed);
  recordCompletedActivity(state, closed);
  const activity = state.residentPlans.activities?.[appointment.id];
  assert.equal(activity?.outcome, "pending");
  assert.deepEqual(
    activityMoments(state, activity!).map((row) => row.text),
    [text],
  );
  assert.equal(dueAppointment(state, appointment.id, due), undefined);
  assert.deepEqual(
    coerceVillageState(JSON.parse(JSON.stringify(state))).residentPlans.activities,
    state.residentPlans.activities,
  );
});
