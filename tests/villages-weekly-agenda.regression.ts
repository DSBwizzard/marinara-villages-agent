// Test cases: weekly-agenda/visibility, weekly-agenda/agreement, weekly-agenda/shared-scene, weekly-agenda/opening-offer-echo, weekly-agenda/scene-scheduling, weekly-agenda/compact-context
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mock } from "node:test";
import { runCase } from "../scripts/test-cases.mjs";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  confirmAgendaAppointment,
  sceneAgendaContext,
  agendaWeek,
} from "../packages/villages/src/server/domain/rules/agenda-overview.js";
import {
  activityMoments,
  keepsakeAvailable,
  recordSceneFollowup,
} from "../packages/villages/src/server/domain/rules/activity-followup.js";
import {
  agendaChangeSources,
  recordAgendaChanges,
} from "../packages/villages/src/server/domain/rules/agenda-changes.js";
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
          agendaOptions: sceneAgendaContext(
            world,
            [{ characterId: "mara", doing: "Talking" }],
            when,
            "schedule",
            venue.id,
          ).agendaOptions,
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
  const { world, publish } = fixture();
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
  const offerOnly = structuredClone(raw);
  offerOnly.keep[0].source.pop();
  offerOnly.segments[0].text = "I'll think about it.";
  assert.equal(publish(offerOnly, "offer-only", propose).held, false);
  assert.equal(world.residentPlans.appointments, undefined);
  const counter = structuredClone(raw);
  counter.segments[0].text = "No, I cannot meet you tomorrow at noon.";
  assert.equal(publish(counter, "counter", propose).held, false);
  assert.equal(world.residentPlans.appointments, undefined, "A model label cannot authorize a calendar write.");
  assert.equal(agendaWeek(world, "mara", when, false).pending, undefined);
  const explicit = structuredClone(raw);
  Object.assign(explicit.segments[0], { offerAppointment: true });
  const result = publish(explicit, "agreement", propose);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  const pending = agendaWeek(world, "mara", when, false).pending!;
  assert.equal(pending.length, 1);
  assert.equal(world.residentPlans.appointments, undefined);
  assert.throws(() => confirmAgendaAppointment(world, "mara", "stale", when), /changed/);
  assert(confirmAgendaAppointment(world, "mara", pending.at(-1)!.token, when));
  assert(!confirmAgendaAppointment(world, "mara", pending.at(-1)!.token, when), "Replay cannot book twice.");
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
  assert.equal(world.residentPlans.appointments?.length, 1);
  const due = new Date(tomorrow + "T12:15:00Z");
  assert.equal(agendaWeek(state, "mara", due, false).days[0].blocks[0].source, "agreed");
  assert.equal(Object.hasOwn(agendaWeek(state, "mara", due, false).days[0].blocks[0], "join"), false);
});

await runCase("weekly-agenda/compact-context", () => {
  const { world, resident } = fixture();
  const agenda = Object.assign(resident.agenda, { calendarVersion: 1 as const });
  const day = [
    { startMinute: 0, endMinute: 720, venueId: "mill", activity: "Morning errand" },
    { startMinute: 720, endMinute: 900, venueId: "mill", activity: "Mend nets" },
    { startMinute: 900, endMinute: 1440, venueId: "mill", activity: "Staff the desk" },
  ];
  agenda.plannedDays = { [tomorrow]: day };
  const before = agendaChangeSources(world);
  agenda.plannedDays[tomorrow] = [
    day[0]!,
    { ...day[1]!, endMinute: 780 },
    { ...day[1]!, startMinute: 780, activity: "Fill in at the library" },
    day[2]!,
  ];
  recordAgendaChanges(world, before, when);
  const cast = [{ characterId: "mara", doing: "Talking with the player" }];
  const ordinary = sceneAgendaContext(world, cast, when, "", "mill");
  assert.deepEqual(ordinary.activities, [{ actorId: "mara", doing: "Talking with the player" }]);
  assert(ordinary.agendaOptions.some((row) => row.time.date === tomorrow));
  assert.equal(ordinary.recentChange, undefined);
  const asked = sceneAgendaContext(world, cast, when, "Are you free tomorrow afternoon?", "mill");
  assert.equal(asked.agendaOptions[0]?.time.date, tomorrow);
  assert(asked.agendaOptions[0]!.time.startMinute >= 720);
  assert(asked.agendaOptions.length <= 16);
  assert.equal(asked.available?.[0]?.free, false);
  const changed = sceneAgendaContext(world, cast, when, "Why did your plans change tomorrow afternoon?", "mill");
  assert.deepEqual(changed.recentChange, {
    actorId: "mara",
    date: tomorrow,
    startMinute: 780,
    endMinute: 900,
    previous: "Mend nets",
    replacement: "Fill in at the library",
  });
  assert.equal(
    sceneAgendaContext(world, [], when, "Why did the plan change tomorrow?", "mill").recentChange,
    undefined,
  );
  const afterWindow = new Date("2026-11-12T08:00:00.000Z");
  assert.equal(
    sceneAgendaContext(world, cast, afterWindow, "Why did your plan change yesterday?", "mill").recentChange,
    undefined,
  );
  assert(!JSON.stringify(agendaWeek(world, "mara", when, true)).includes("recentChanges"));
});

await runCase("weekly-agenda/scene-scheduling", async () => {
  const previousTimeZone = process.env.TZ;
  try {
    process.env.TZ = "UTC";
    mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-10T10:00:00.000Z") });
    const host = await packagedSceneServer({
      configure(world, now) {
        const block = { startMinute: 540, endMinute: 660, venueId: "mill", zoneId: "common", activity: "Sort maps" };
        world.villagers[0].agenda = agendaFixture({
          day: [block],
          generatedAt: now,
          activeDay: { dateKey: now.slice(0, 10), weekday: "Tuesday", scheduleInformed: false, blocks: [block] },
        });
      },
    });
    let calls = 0;
    const offer = "Let's look through maps here tomorrow from noon to one.";
    host.model.chatComplete = async (messages: { content: string }[]) => {
      const agenda = messages
        .flatMap(({ content }) => content.split("\n"))
        .find((line) => line.startsWith('{"agendaOptions":'));
      assert(agenda, `turn ${calls + 1} uses fitted schedule evidence`);
      const packet = JSON.parse(agenda);
      const schedule = { ...time, zoneId: "common" };
      if (calls > 0) {
        assert(packet.agendaOptions.some((slot: { time: { date: string } }) => slot.time.date === tomorrow));
        assert(packet.agendaVenues.some((venue: { id: string }) => venue.id === "mill"));
        const valid = ++calls === 2;
        return {
          content:
            "[mara] [appointment]: " +
            JSON.stringify({
              activity: "Look through maps",
              time: valid
                ? schedule
                : calls === 3
                  ? { ...schedule, zoneId: "unfitted-zone" }
                  : { ...schedule, startMinute: 600, endMinute: 630 },
            }) +
            (valid
              ? "\nNarration: A breeze lifts a page.\n[keep]: " +
                JSON.stringify({
                  id: "another-time",
                  for: ["mara", "player"],
                  about: ["mara"],
                  class: "commitment",
                  text: "Mara offers another appointment two hours later.",
                  offer: { proposer: "mara", participants: ["mara", "player"] },
                  agenda: {
                    actorId: "mara",
                    kind: "offer",
                    activity: "Look through maps",
                    time: {
                      ...schedule,
                      startMinute: schedule.startMinute + 120,
                      endMinute: schedule.endMinute + 120,
                    },
                  },
                  source: [{ segment: 1, act: "offer" }],
                })
              : ""),
          finishReason: "stop",
        };
      }
      calls++;
      const reply = {
        segments: [{ kind: "dialogue", speakerId: "mara", text: "I sort maps here from nine until eleven." }],
        keep: [
          {
            for: ["player"],
            about: ["mara"],
            class: "information",
            text: "Mara sorts maps here today from nine until eleven.",
            source: [{ segment: 1 }],
            agenda: {
              actorId: "mara",
              kind: "told",
              time: { ...schedule, date: "2026-11-10", startMinute: 540, endMinute: 660 },
            },
          },
        ],
      };
      assert(packet.agendaOptions.some((slot: { activity: string }) => slot.activity === "Sort maps"));
      assert(packet.agendaVenues.some((venue: { id: string }) => venue.id === "mill"));
      return { content: JSON.stringify(reply), finishReason: "stop" };
    };
    try {
      assert.equal((await host.app.inject({ method: "GET", url: "/api/villages/rooms/active" })).statusCode, 200);
      for (const message of ["How are you today? I am reading a book.", offer]) {
        const result = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/turn",
          payload: {
            sessionId: "browser",
            submissionId: randomUUID(),
            message,
            mode: "chat",
            targetId: "",
            expectedSceneRevision: host.scene().sceneRevision,
          },
        });
        assert.equal(result.statusCode, 200, result.body);
        const { acceptance } = host.scene().submissions.at(-1)!;
        assert.equal(acceptance.status, "applied");
        assert.deepEqual(
          acceptance.rejected.map(({ id }) => id),
          calls === 2 ? ["another-time"] : [],
        );
      }
      const state = fixtureVillageState(host.records.get("villages-village").data, host.records);
      const returned = agendaWeek(state, "mara", new Date(), false);
      assert.equal(returned.days[1].blocks.length, 0);
      assert.deepEqual(
        returned.pending?.map(({ time }) => time.startMinute),
        [time.startMinute],
      );
      const confirmation = await host.app.inject({
        method: "POST",
        url: "/api/villages/agendas/mara/appointments",
        payload: { token: returned.pending![0].token },
      });
      assert.equal(confirmation.statusCode, 200, confirmation.body);
      const [today, next] = confirmation.json().days;
      assert.deepEqual(
        today.blocks.map(({ activity, source }: { activity: string; source: string }) => [activity, source]),
        [["Sort maps", "told"]],
      );
      assert.deepEqual(
        next.blocks.map(({ activity, source }: { activity: string; source: string }) => [activity, source]),
        [["Look through maps", "agreed"]],
      );
      const cancelToken = confirmation.json().confirmed[0].token;
      const cancelled = await host.app.inject({
        method: "POST",
        url: "/api/villages/agendas/mara/appointments",
        payload: { token: cancelToken, cancel: true },
      });
      assert.equal(cancelled.statusCode, 200, cancelled.body);
      assert.equal(cancelled.json().confirmed, undefined);
      assert.equal(cancelled.json().pending, undefined);
      assert.equal(cancelled.json().days[1].blocks.length, 0);
      for (const payload of [{ token: returned.pending![0].token }, { token: cancelToken, cancel: true }]) {
        const stale = await host.app.inject({
          method: "POST",
          url: "/api/villages/agendas/mara/appointments",
          payload,
        });
        assert.equal(stale.statusCode, 409, stale.body);
      }
      for (const message of [
        "Could we move tomorrow's meeting elsewhere?",
        "Could we meet here tomorrow from ten until ten thirty?",
      ]) {
        const unavailable = await host.app.inject({
          method: "POST",
          url: "/api/villages/rooms/turn",
          payload: {
            sessionId: "browser",
            submissionId: randomUUID(),
            message,
            mode: "chat",
            targetId: "",
            expectedSceneRevision: host.scene().sceneRevision,
          },
        });
        assert.equal(unavailable.statusCode, 200, unavailable.body);
        assert(
          unavailable
            .json()
            .session.lines.some(
              ({ content }: { content: string }) => content === "The appointment is still unsettled.",
            ),
        );
        const current = fixtureVillageState(host.records.get("villages-village").data, host.records);
        assert.equal(agendaWeek(current, "mara", new Date(), false).pending, undefined);
      }
      assert.equal(calls, 4);
    } finally {
      await host.stop();
    }
  } finally {
    mock.timers.reset();
    if (previousTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimeZone;
  }
});

await runCase("weekly-agenda/shared-scene", () => {
  const { world: state, publish, scene } = fixture();
  const due = new Date(tomorrow + "T12:15:00Z");
  const meetup = { ...scene, id: "impromptu-meetup", startedAt: due.toISOString() };
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
    status: "closed",
    endReason: "player",
    endedAt: due.toISOString(),
  });
  const noExchange = structuredClone(state);
  recordSceneFollowup(noExchange, closed);
  assert.equal(noExchange.residentPlans.activities, undefined);
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
  recordSceneFollowup(state, closed);
  recordSceneFollowup(state, closed);
  assert.equal(Object.keys(state.residentPlans.activities!).length, 1);
  const [activity] = Object.values(state.residentPlans.activities!);
  assert.equal(activity?.outcome, "pending");
  assert.deepEqual(
    activityMoments(state, activity!).map((row) => row.text),
    [text],
  );
  assert.deepEqual(
    coerceVillageState(JSON.parse(JSON.stringify(state))).residentPlans.activities,
    state.residentPlans.activities,
  );
  const giftAt = due.toISOString();
  const legacyId = "old-appointment";
  const legacy = coerceVillageState(
    JSON.parse(
      JSON.stringify({
        ...state,
        residentPlans: {
          ...state.residentPlans,
          activities: {
            [legacyId]: {
              appointment: {
                id: legacyId,
                resident: activity.resident,
                playerIncarnation: activity.playerIncarnation,
                time,
                activity: "Tea at the Mill",
              },
              sceneId: "old-scene",
              endedAt: giftAt,
              outcome: "letter",
              keepsake: { letterId: "old-letter", caption: "A paper boat", moment: "boat" },
            },
          },
        },
      }),
    ),
  );
  assert.equal(legacy.residentPlans.activities?.[legacyId].id, legacyId);
  assert.equal(legacy.residentPlans.activities?.[legacyId].keepsake?.letterId, "old-letter");
  assert.equal(keepsakeAvailable(state, activity, giftAt), true);
  legacy.mailbox = {
    ...legacy.mailbox,
    messages: {
      "old-letter": {
        at: giftAt,
        status: "delivered",
      } as (typeof state.mailbox.messages)[string],
    },
  };
  assert.equal(keepsakeAvailable(legacy, activity, "2026-11-12T12:15:00.000Z"), false);
  assert.equal(keepsakeAvailable(legacy, activity, "2026-11-14T12:15:00.000Z"), true);
});

await runCase("weekly-agenda/opening-offer-echo", () => {
  const { world, publish } = fixture();
  const keep = {
    id: "unfounded-plan",
    class: "commitment",
    for: ["mara", "player"],
    text: "Lunch tomorrow",
    state: "offered",
    offer: { proposer: "mara", participants: ["mara", "player"], contributions: [{ by: "mara", act: "offer" }] },
  };
  const segment = { id: "hello", kind: "dialogue", speakerId: "mara", text: "It's good to see you." };
  const dependent = publish({ segments: [{ ...segment, requires: [keep.id] }], keep: [keep] }, "greeting", "");
  assert.equal(dependent.held, true);
  const opening = publish({ segments: [segment], keep: [keep] }, "greeting", "");
  assert.equal(opening.held, false, JSON.stringify(opening.rejected));
  assert.equal(opening.episode?.segments[0].content, segment.text);
  assert.equal(opening.episode?.continuityVersionIds.length, 0);
  assert.equal(world.residentPlans.appointments, undefined);
});
