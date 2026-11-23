// Test cases: undertakings/manual-draft, undertakings/opening, undertakings/round-trip, undertakings/agreements, undertakings/reservations, undertakings/protected-time, undertakings/rollover, undertakings/identity, undertakings/native-life, undertakings/claims, undertakings/stale-progress, undertakings/withdrawal, undertakings/ordered-batch, undertakings/proposal-privacy, undertakings/controller-change, undertakings/physical-work, undertakings/parent-cancel
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  lifecycle,
  beginProject,
  finishConstruction,
  projectFor,
  reconcileProjectLifecycles,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { projectDesignKey } from "../packages/villages/src/server/domain/rules/project-terms.js";
import { projectAgendaReservations } from "../packages/villages/src/server/domain/rules/project-focus.js";
import { agendaWeek } from "../packages/villages/src/server/domain/rules/agenda-overview.js";
import { ZonedDate } from "../packages/villages/src/shared/helpers/zoned-date.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import type { VillageProject, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { createVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot-service.js";
import { refreshProjectAgreements } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { renovation } from "./fixtures/villages-projects.fixture.js";
import { draftRenovationProject } from "../packages/villages/src/server/features/projects/project-drafts.js";

const now = new ZonedDate("2026-11-23T02:00:00Z", "America/Los_Angeles");
async function snapshotOf(state: VillageState) {
  return createVillageSnapshot({
    readVillageState: async () => state,
    listVillagerCards: async () => [],
    rollActiveAgendas: async () => false,
    sceneQueries: () => ({ activeVenueSession: async () => null }),
    backgroundWorkSummaries: async () => [],
    privatePreparationRooms: () => [],
  } as any).buildVillageSnapshot(now);
}
function shared(agreed = true) {
  const state = fixture().state();
  state.timeZone = "America/Los_Angeles";
  state.clock = { revision: 1, trustedAt: now.toISOString(), replayUntilDate: "2026-11-22" };
  const project: VillageProject = {
    id: "supper",
    kind: "undertaking",
    title: "Sunday supper",
    venueId: "cafe",
    participantIds: ["a", "b"],
    status: "planning",
    progress: 0,
    updatedAt: now.toISOString(),
    lifecycle: lifecycle("cafe"),
    undertaking: {
      plan: {
        goal: "Cook and share a meal together.",
        zoneId: "common",
        roles: [
          { actorId: "a", role: "Host" },
          { actorId: "b", role: "Bring bread" },
        ],
        milestones: [
          { id: "prepare", title: "Prepare the table together", kind: "preparation" },
          { id: "meal", title: "Share the first supper", kind: "first-use" },
        ],
        schedule: { firstDate: "2026-11-22", startMinute: 1140, endMinute: 1200, weekly: true },
      },
      completed: [],
    },
  };
  state.projects.push(project);
  project.lifecycle!.affectedIds = ["a", "b"];
  if (agreed)
    for (const id of ["a", "b"])
      project.lifecycle!.approvals.push({
        residentId: id,
        incarnation: state.villagers.find((row) => row.characterId === id)!.incarnation,
        source: "conversation",
        scope: projectDesignKey(project),
        evidenceId: "spoken-" + id,
        at: now.toISOString(),
      });
  return { state, project };
}
function publication(
  state: VillageState,
  raw: unknown,
  input = "Let's work on Sunday supper.",
  operation = "turn",
  placeId = state.venues[0].id,
  zoneId = "common",
) {
  const venue = state.venues.find((v) => v.id === placeId)!;
  const participants = ["a", "b"].map((characterId) => ({ characterId, name: characterId, doing: "Taking part" }));
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "shared-scene",
      sceneRevision: 1,
      villageSeed: state.seed,
      placeId: venue.id,
      placeName: venue.name,
      zoneId,
      activeIds: ["a", "b"],
      participants,
      startedAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      status: "active",
      sceneAttendance: {
        capturedAt: now.toISOString(),
        layout: captureSceneLayout(venue),
        occupants: participants.map((actor) => ({ ...actor, zoneId })),
      },
    }),
    venue,
  );
  const prepared = narrationContinuityContext(state, scene, venue, operation, input, now.toISOString());
  const readset = fittedNarrationReadset(
    state,
    prepared,
    prepared.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
  );
  return { raw, readset, responseDigest: memoryHash(raw) };
}
function deed(project: string, step: string, speech = false) {
  return {
    segments: [
      {
        id: "deed",
        kind: speech ? "dialogue" : "narration",
        ...(speech ? { speakerId: "a" } : {}),
        text: speech
          ? "We already prepared the table yesterday."
          : "You and a set out the plates and finish laying the supper table.",
        requires: ["advance"],
      },
    ],
    commands: [
      {
        id: "advance",
        type: "project.advance",
        project,
        step,
        at: "deed",
        source: [{ segment: "deed", perceive: { kind: speech ? "heard" : "seen", by: ["player", "a", "b"] } }],
      },
    ],
  };
}

await runCase("undertakings/round-trip", () => {
  const { state, project } = shared();
  beginProject(state, projectFor(state, project.id), {}, false, now);
  const copy = coerceVillageState(state);
  assert.equal(copy.version, state.version);
  assert.equal(copy.projects[0].lifecycle!.workOrder, null);
  assert.deepEqual(copy.projects[0].undertaking, project.undertaking);
  reconcileProjectLifecycles(copy, new ZonedDate("2026-12-01T02:00:00Z", state.timeZone));
  assert.equal(copy.projects[0].status, "working", "elapsed time cannot complete shared work");
});
await runCase("undertakings/agreements", () => {
  const { state, project } = shared(false);
  assert.throws(() => beginProject(state, projectFor(state, project.id), {}, false, now), /agree/);
  assert.equal(project.status, "planning");
});
await runCase("undertakings/reservations", () => {
  const { state, project } = shared();
  beginProject(state, projectFor(state, project.id), {}, false, now);
  for (const actor of ["a", "b"]) {
    assert.equal(
      state.villagers
        .find((row) => row.characterId === actor)!
        .agenda!.reservations!.filter((row) => row.id.startsWith("undertaking:")).length,
      1,
    );
    assert.ok(
      agendaWeek(state, actor, now, false).days[0].blocks.some(
        (row) => row.activity === project.title && row.source === "agreed",
      ),
    );
  }
  assert.deepEqual(state.villagers[0].agenda?.plannedDays, undefined, "an unwritten weekly cache is sufficient");
});
await runCase("undertakings/protected-time", () => {
  for (const rest of [false, true]) {
    const { state, project } = shared();
    const agenda = state.villagers[1].agenda!;
    agenda.activeDay = {
      dateKey: "2026-11-22",
      weekday: "Sunday",
      scheduleInformed: false,
      blocks: [
        {
          startMinute: 0,
          endMinute: 1440,
          venueId: "",
          activity: rest ? "Sleeping" : "Essential rest",
          essential: !rest,
          flexible: rest,
        },
      ],
    };
    beginProject(state, projectFor(state, project.id), {}, false, now);
    for (const actor of state.villagers)
      assert.equal(
        actor.agenda?.reservations?.filter((row) => row.dateKey === "2026-11-22" && row.id.startsWith("undertaking:"))
          .length,
        0,
        "one protected actor prevents a split gathering",
      );
  }
});
await runCase("undertakings/rollover", () => {
  const { state, project } = shared();
  project.status = project.lifecycle!.phase = "complete";
  project.undertaking!.completed = project.undertaking!.plan.milestones.map((step) => ({
    milestoneId: step.id,
    at: now.toISOString(),
    episodeId: "setup",
    evidenceId: "setup-" + step.id,
  }));
  const nextWeek = new ZonedDate("2026-11-30T02:00:00Z", state.timeZone);
  projectAgendaReservations(state, nextWeek);
  assert.ok(
    agendaWeek(state, "a", nextWeek, false).days.some(
      (day) => day.date === "2026-11-29" && day.blocks.some((block) => block.activity === project.title),
    ),
  );
  assert.equal(state.episodes.records.length, 0, "a schedule invents no experiences or Wish fulfillment");
});
await runCase("undertakings/identity", () => {
  const { state, project } = shared();
  beginProject(state, projectFor(state, project.id), {}, false, now);
  state.villagers[1].incarnation = "new-person";
  projectAgendaReservations(state, now);
  assert.equal(state.villagers[0].agenda?.reservations?.filter((row) => row.id.startsWith("undertaking:")).length, 0);
});
await runCase("undertakings/native-life", () => {
  const { state } = shared(false);
  state.projects = [];
  const input = "Let's start a shared supper Project here. I'll help set the table and join the first meal.";
  const plan = shared().project.undertaking!.plan;
  const raw = {
    segments: [
      {
        id: "proposal",
        kind: "narration",
        text: "You jot down the supper idea for everyone to review.",
        requires: ["proposal"],
      },
    ],
    commands: [
      {
        id: "proposal",
        type: "project.propose",
        title: "A new shared supper",
        plan,
        at: "proposal",
        source: [{ input, ground: { kind: "spoken", to: ["a", "b"] } }],
      },
    ],
  };
  const proposal = publication(state, raw, input, "proposal-operation");
  assert.equal(
    acceptNarration(structuredClone(state), proposal, "new-manual", now.toISOString()).held,
    true,
    "New requests cannot create Projects from dialogue",
  );
  delete proposal.readset.manualProjectCreation;
  for (const partial of [{ roles: [] }, { zoneId: "" }]) {
    const invalid = structuredClone(proposal);
    Object.assign((invalid.raw as typeof raw).commands[0].plan, partial);
    invalid.responseDigest = memoryHash(invalid.raw);
    assert.equal(
      acceptNarration(structuredClone(state), invalid, "incomplete-old", now.toISOString()).held,
      true,
      "Retained proposals keep their original complete-plan contract",
    );
  }
  const result = acceptNarration(state, proposal, "proposal-turn", now.toISOString());
  assert.equal(result.held, false, JSON.stringify(result));
  assert.equal(state.projects.length, 1);
  const project = state.projects[0];
  assert.equal(project.lifecycle?.approvals.length, 0, "a conversational draft grants no consent");
  assert.equal(acceptNarration(state, proposal, "proposal-turn", now.toISOString()).held, false);
  assert.equal(state.projects.length, 1, "retained replay does not duplicate the new Project");
  for (const actor of ["a", "b"]) {
    const agreement = {
      segments: [
        {
          id: "yes",
          kind: "dialogue",
          speakerId: actor,
          text: "I agree to my role in the complete saved supper plan, including Sundays at seven each week.",
          requires: ["yes"],
        },
      ],
      commands: [
        {
          id: "yes",
          type: "project.decide",
          by: actor,
          project: project.id,
          decision: "approval",
          at: "yes",
          source: [{ segment: "yes" }],
        },
      ],
    };
    const accepted = acceptNarration(
      state,
      publication(state, agreement, "Do you agree to A new shared supper?", "agree-" + actor),
      "agree-" + actor,
      now.toISOString(),
    );
    assert.equal(accepted.held, false, JSON.stringify(accepted));
  }
  beginProject(state, projectFor(state, project.id), {}, false, now);
  for (const step of ["prepare", "meal"]) {
    const response = publication(state, deed(project.id, step), "Let's carry out A new shared supper.", "work-" + step);
    const accepted = acceptNarration(state, response, "work-" + step, now.toISOString());
    assert.equal(accepted.held, false, JSON.stringify(accepted));
  }
  assert.equal(state.projects[0].status, "complete");
  assert.equal(coerceVillageState(state).projects[0].progress, 100);
});
await runCase("undertakings/claims", () => {
  const { state, project } = shared();
  beginProject(state, projectFor(state, project.id), {}, false, now);
  const result = acceptNarration(
    state,
    publication(state, deed(project.id, "prepare", true)),
    "claim",
    now.toISOString(),
  );
  assert.equal(result.held, true);
  assert.equal(state.projects[0].undertaking!.completed.length, 0);
});
await runCase("undertakings/stale-progress", () => {
  const { state, project } = shared();
  beginProject(state, projectFor(state, project.id), {}, false, now);
  const response = publication(state, deed(project.id, "prepare"));
  project.lifecycle!.revision++;
  const result = acceptNarration(state, response, "stale", now.toISOString());
  assert.equal(result.held, true);
  assert.equal(state.projects[0].undertaking!.completed.length, 0);
});
await runCase("undertakings/withdrawal", () => {
  const { state, project } = shared();
  project.status = project.lifecycle!.phase = "complete";
  project.undertaking!.completed = project.undertaking!.plan.milestones.map((step) => ({
    milestoneId: step.id,
    at: now.toISOString(),
    episodeId: "setup",
    evidenceId: "setup-" + step.id,
  }));
  const raw = {
    segments: [
      {
        id: "leave",
        kind: "dialogue",
        speakerId: "a",
        text: "I am withdrawing from Sunday supper and its weekly arrangement.",
        requires: ["leave"],
      },
    ],
    commands: [
      {
        id: "leave",
        type: "project.decide",
        by: "a",
        project: project.id,
        decision: "withdrawal",
        at: "leave",
        source: [{ segment: "leave" }],
      },
    ],
  };
  const accepted = acceptNarration(
    state,
    publication(state, raw, "What about Sunday supper?"),
    "leave",
    now.toISOString(),
  );
  assert.equal(accepted.held, false, JSON.stringify(accepted));
  assert.equal(state.projects[0].status, "complete");
  assert.equal(
    agendaWeek(state, "b", now, false)
      .days.flatMap((day) => day.blocks)
      .filter((block) => block.activity === project.title).length,
    0,
  );
});
await runCase("undertakings/ordered-batch", () => {
  const { state, project } = shared();
  beginProject(state, projectFor(state, project.id), {}, false, now);
  const raw = {
    segments: [
      { id: "table", kind: "narration", text: "You, a and b finish laying the table together.", requires: ["table"] },
      {
        id: "meal",
        kind: "narration",
        text: "You, a and b sit down, eat supper and enjoy an unhurried conversation together.",
        requires: ["meal"],
      },
    ],
    commands: ["prepare", "meal"].map((step, index) => ({
      id: index ? "meal" : "table",
      type: "project.advance",
      project: project.id,
      step,
      at: index ? "meal" : "table",
      source: [{ segment: index ? "meal" : "table", perceive: { kind: "seen", by: ["player", "a", "b"] } }],
    })),
  };
  const response = publication(state, raw);
  const accepted = acceptNarration(state, response, "batch", now.toISOString());
  assert.equal(accepted.held, false, JSON.stringify(accepted));
  assert.equal(state.projects[0].status, "complete");
  assert.equal(state.projects[0].undertaking!.completed.length, 2);
  assert.equal(acceptNarration(state, response, "batch", now.toISOString()).held, false);
  assert.equal(state.projects[0].undertaking!.completed.length, 2);
});
await runCase("undertakings/proposal-privacy", () => {
  for (const privateIntent of [false, true]) {
    const { state } = shared(false);
    state.projects = [];
    const input = "Let's plan a new supper together here.";
    const plan = structuredClone(shared().project.undertaking!.plan);
    if (!privateIntent) plan.zoneId = "unseen-room";
    const raw = {
      segments: [{ id: "draft", kind: "narration", text: "A new plan is written.", requires: ["draft"] }],
      commands: [
        {
          id: "draft",
          type: "project.propose",
          title: "New supper",
          plan,
          at: "draft",
          source: [{ input, ground: privateIntent ? { kind: "private" } : { kind: "spoken", to: ["a", "b"] } }],
        },
      ],
    };
    const retained = publication(state, raw, input);
    delete retained.readset.manualProjectCreation;
    assert.equal(acceptNarration(state, retained, "privacy", now.toISOString()).held, true);
    assert.equal(state.projects.length, 0);
  }
});
await runCase("undertakings/controller-change", () => {
  const { state, project } = shared();
  project.status = project.lifecycle!.phase = "complete";
  project.undertaking!.completed = project.undertaking!.plan.milestones.map((step) => ({
    milestoneId: step.id,
    at: now.toISOString(),
    episodeId: "setup",
    evidenceId: "setup-" + step.id,
  }));
  state.venues[0].access!.managerIds = ["c"];
  refreshProjectAgreements(state);
  assert.ok(project.lifecycle!.affectedIds.includes("c"));
  assert.equal(project.status, "complete");
  assert.equal(
    agendaWeek(state, "a", now, false)
      .days.flatMap((day) => day.blocks)
      .filter((block) => block.activity === project.title).length,
    0,
  );
});
await runCase("undertakings/physical-work", () => {
  const { state, project } = shared();
  const work = draftRenovationProject(state, "cafe", { detail: "Restore the roof", form: "A repaired roof" });
  project.undertaking!.plan.constructionId = work.id;
  project.undertaking!.plan.milestones = [project.undertaking!.plan.milestones[1]];
  for (const approval of project.lifecycle!.approvals) approval.scope = projectDesignKey(project);
  beginProject(state, projectFor(state, project.id), {}, false, now);
  assert.equal(
    acceptNarration(state, publication(state, deed(project.id, "meal")), "unfinished", now.toISOString()).held,
    true,
  );
  assert.equal(state.projects[0].undertaking!.completed.length, 0);
  work.status = work.lifecycle!.phase = "complete";
  assert.equal(
    acceptNarration(
      state,
      publication(state, deed(project.id, "meal"), "Enjoy Sunday supper", "finished"),
      "finished",
      now.toISOString(),
    ).held,
    false,
  );
});
await runCase("undertakings/parent-cancel", async () => {
  const f = fixture();
  const workId = await renovation(f, { form: "A restored hall" });
  await f.agree(workId);
  await f.service.startProjectConstruction(workId, f.body(workId), now);
  await f.mutate((state) => {
    const parent = shared().project;
    parent.undertaking!.plan.constructionId = workId;
    parent.status = parent.lifecycle!.phase = "working";
    for (const approval of parent.lifecycle!.approvals) approval.scope = projectDesignKey(parent);
    state.projects.push(parent);
  });
  await f.service.cancelProject("supper", f.body("supper"), now);
  assert.equal(f.get("supper").status, "cancelled");
  assert.equal(f.get(workId).status, "cancelled");
  assert.deepEqual(f.get(workId).lifecycle!.workOrder?.focus?.periods, []);
});
await runCase("undertakings/manual-draft", async () => {
  const f = fixture(),
    request = { requestId: "manual-gathering", title: "Story night" };
  await f.service.createUndertaking(request);
  await f.service.createUndertaking(request);
  assert.equal(f.state().projects.length, 1, "Saving the same idea twice replays its request");
  const p = f.state().projects[0];
  assert.equal(p.venueId, "");
  assert.deepEqual(p.undertaking!.plan.roles, []);
  assert.deepEqual(coerceVillageState(f.state()).projects[0].undertaking, p.undertaking);
  await assert.rejects(() => f.service.startProjectConstruction(p.id, f.body(p.id), now), /invite|place|Venue/i);
  await f.service.reviseUndertaking(
    p.id,
    f.body(p.id, {
      title: p.title,
      venueId: "cafe",
      plan: { ...p.undertaking!.plan, zoneId: "common", roles: [{ actorId: "a", role: "Taking part" }] },
    }),
  );
  await assert.rejects(() => f.service.startProjectConstruction(p.id, f.body(p.id), now), /agree/i);
  assert.equal(f.get(p.id).lifecycle!.approvals.length, 0, "Choosing someone to ask is not agreement");
  await f.service.createNewVenueProject({
    requestId: "manual-place",
    name: "Arcade",
    description: "Somewhere to play",
    classes: ["community"],
    firstUse: true,
  });
  assert.equal(f.state().projects.at(-1)!.firstUse?.goal, "Enjoy the first visit together");
  const improvement = await renovation(f, { firstUse: true });
  assert.equal(f.get(improvement).firstUse?.goal, "Try the improved place together");
  assert.deepEqual(f.get(improvement).lifecycle!.changedZoneIds, []);
  await f.agree(improvement);
  const view = await snapshotOf(f.state());
  assert.equal(
    view.projects.find((row) => row.id === improvement)!.lifecycle!.designReady,
    true,
    "A capacity-only improvement is ready to start",
  );
  await f.service.startProjectConstruction(improvement, f.body(improvement), now);
  assert.equal(f.get(improvement).status, "working");
});
await runCase("undertakings/opening", async () => {
  const f = fixture(),
    id = await f.newProject("Arcade");
  await f.mutate((state) => {
    state.projects.find((p) => p.id === id)!.firstUse = { goal: "Enjoy the first visit together" };
  });
  await f.service.startProjectConstruction(id, f.body(id), now);
  const state = f.state();
  assert.equal(
    acceptNarration(state, publication(state, deed(id, "first-use"), "Try Arcade"), "too-early", now.toISOString())
      .held,
    true,
  );
  const unfinished = publication(
    state,
    deed(id, "first-use"),
    "Try Arcade",
    "unfinished",
    state.projects.find((p) => p.id === id)!.venueId,
    "exterior",
  );
  finishConstruction(state, projectFor(state, id), now.toISOString());
  const p = state.projects.find((row) => row.id === id)!;
  assert.equal(p.status, "complete");
  assert(!p.firstUse!.completed);
  assert.equal(
    acceptNarration(structuredClone(state), unfinished, "delayed", new Date(now.getTime() + 3600000).toISOString())
      .held,
    true,
    "A delayed reply admitted during construction cannot open the completed place",
  );
  const raw = deed(id, "first-use");
  raw.segments[0].text = "You and a try the first arcade game together.";
  const exchange = publication(state, raw, "Enjoy Arcade together", "opening", p.venueId, "work");
  assert(
    exchange.readset.projects.some((row) => row.projectId === id),
    "The opening is supplied after construction finishes",
  );
  const earlier = structuredClone(exchange);
  earlier.readset.capturedAt = new Date(now.getTime() - 1).toISOString();
  assert.equal(
    acceptNarration(structuredClone(state), earlier, "earlier", now.toISOString()).held,
    true,
    "Admission must follow structural completion",
  );
  const stale = structuredClone(state);
  stale.projects.find((row) => row.id === id)!.lifecycle!.revision++;
  assert.equal(acceptNarration(stale, exchange, "stale-opening", now.toISOString()).held, true);
  const claim = publication(state, deed(id, "first-use", true), "Enjoy Arcade together", "claim", p.venueId, "work");
  assert.equal(
    acceptNarration(structuredClone(state), claim, "claim", now.toISOString()).held,
    true,
    "A claim cannot open the place",
  );
  const alone = structuredClone(raw);
  alone.commands[0].source[0].perceive.by = ["player"];
  assert.equal(
    acceptNarration(
      structuredClone(state),
      publication(state, alone, "Try Arcade", "alone", p.venueId, "work"),
      "alone",
      now.toISOString(),
    ).held,
    true,
    "A resident must witness the shared use",
  );
  assert.equal(
    acceptNarration(
      structuredClone(state),
      publication(state, raw, "Try Arcade", "outside", p.venueId, "exterior"),
      "outside",
      now.toISOString(),
    ).held,
    true,
    "Standing outside an interior place is not first use",
  );
  const replaced = structuredClone(state);
  replaced.villagers.find((v) => v.characterId === "a")!.incarnation = "later-incarnation";
  replaced.villagers.find((v) => v.characterId === "b")!.incarnation = "later-incarnation";
  assert.throws(
    () => acceptNarration(replaced, exchange, "replaced", now.toISOString()),
    /incarnation changed/,
    "Later incarnations cannot inherit the old witnesses",
  );
  assert.equal(acceptNarration(state, exchange, "opening", now.toISOString()).held, false);
  assert.equal(acceptNarration(state, exchange, "opening", now.toISOString()).held, false);
  assert.equal(p.lifecycle!.completedAt, now.toISOString(), "Structural completion keeps its own timestamp");
  assert.equal(state.projects.find((row) => row.id === id)!.firstUse?.completed?.zoneId, "work");
  assert.equal(
    coerceVillageState(state).projects.find((row) => row.id === id)!.firstUse?.completed?.episodeId,
    exchange.readset.source.episodeId,
  );
  const visible = (await snapshotOf(state)).projects.find((row) => row.id === id)!.firstUse!;
  assert.deepEqual(
    Object.keys(visible).sort(),
    ["completedAt", "goal"],
    "Private first-use evidence is excluded from the snapshot",
  );
});
console.log("Shared Project creation, witnessed life, recurrence, privacy and saved-state checks passed.");
