import { memoryProposal } from "./helpers/memories-fixture.js";
import { applyVillageMemory } from "../packages/villages/src/server/domain/rules/village-memories.js";
import { normalizeVillageMutation } from "../packages/villages/src/server/domain/rules/world-mutation.js";
import { housingAvailableAt } from "../packages/villages/src/server/domain/rules/development-housing.js";
import assert from "node:assert/strict";
import { developmentFixture, elapsed, START, moveProposal } from "./fixtures/villages-development.fixture.js";
import {
  initializeDevelopment,
  developmentReview,
  developmentReviewValid,
  applyDevelopmentReview,
  observeHousing,
  finishDevelopmentMove,
  knownDevelopment,
} from "../packages/villages/src/server/domain/rules/resident-development.js";
import {
  readDevelopment,
  readDevelopmentProposal,
} from "../packages/villages/src/server/domain/rules/development-codec.js";
import { completeResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  readDevelopmentSceneChanges,
  bindDevelopmentChanges,
  applyDevelopmentScene,
} from "../packages/villages/src/server/domain/rules/development-scene.js";
import type {
  VenueScene,
  VenueReplyLine,
  VenueSubmission,
} from "../packages/villages/src/server/domain/models/scene-model.js";
import { venueResidentIds } from "../packages/villages/src/server/domain/rules/venue-model.js";

const home = (state: ReturnType<typeof developmentFixture>, id = "a") =>
  state.venues.find((v) => venueResidentIds(v).includes(id))?.id;
function shareWithConsent(
  order: "disclose-first" | "consent-first",
  destination = "Bram's home",
  spoken = "I want to move to Bram's home.",
  ending = false,
) {
  const state = developmentFixture(),
    at = elapsed(1.25),
    input = developmentReview(state, at)!;
  applyDevelopmentReview(state, input, moveProposal(at, "refuse"), at);
  state.venues[1]!.name = destination;
  const r = state.development!.residents.a!,
    p = r.pursuits[0]!;
  const lines = [
    { id: "disclosure", kind: "dialogue", speakerId: "a", content: spoken, heardBy: ["a", "b"] },
    { id: "consent", kind: "dialogue", speakerId: "b", content: "I agree to share with Ada.", heardBy: ["a", "b"] },
  ];
  const changes = [
    {
      pursuitId: p.id,
      characterId: "a",
      actorId: "a",
      expectedRevision: r.revision,
      kind: "disclose",
      citations: [{ segment: 0, quote: spoken }],
      lineIds: ["disclosure"],
    },
    {
      pursuitId: p.id,
      characterId: "a",
      actorId: "b",
      expectedRevision: r.revision,
      kind: "consent",
      decision: "agree",
      citations: [{ segment: 1, quote: lines[1]!.content }],
      lineIds: ["consent"],
    },
  ];
  const scene = { id: "same-scene", villageSeed: state.seed, lines, submissions: [] } as unknown as VenueScene;
  if (ending) {
    Object.assign(changes[1]!, {
      actorId: "a",
      kind: "end",
      decision: undefined,
      citations: [{ segment: 1, quote: "I have decided against this move." }],
    });
    lines[1]!.speakerId = "a";
    lines[1]!.content = "I have decided against this move.";
  }
  const submission = {
    id: "same-turn",
    semanticProvenance: { version: 2, developmentVersion: 1 },
    developmentChanges: order === "consent-first" ? [...changes].reverse() : changes,
  } as unknown as VenueSubmission;
  applyDevelopmentScene(state, scene, submission, elapsed(1.3));
  return { status: p.status, consents: p.consents, known: knownDevelopment(state, "a") };
}
{
  const known = shareWithConsent("disclose-first");
  assert.deepEqual(
    shareWithConsent("consent-first"),
    known,
    "Same heard speech has the same journal history regardless of model row order.",
  );
  assert.equal(known.consents.b.decision, "agree");
  const ended = shareWithConsent("disclose-first", "Bram's home", "I had wanted to move to Bram's home.", true);
  assert.equal(ended.status, "ended");
  assert.deepEqual(
    shareWithConsent("consent-first", "Bram's home", "I had wanted to move to Bram's home.", true),
    ended,
    "A heard disclosure and ending have the same result in either proposal order.",
  );
  assert.deepEqual(known.known, [], "Mechanical speech receipts do not create unscreened knowledge.");
}
function apply(days: number, decision: "agree" | "refuse" | "conditional" = "agree") {
  const state = developmentFixture(),
    at = elapsed(days),
    input = developmentReview(state, at)!;
  assert.ok(input);
  applyDevelopmentReview(state, input, readDevelopmentProposal(moveProposal(at, decision)), at);
  return { state, input };
}
{
  const state = developmentFixture();
  assert.equal(developmentReview(state, START), null);
  assert.equal(developmentReview(state, elapsed(0.999)), null);
  assert.equal(developmentReview(state, elapsed(1))!.residentIds.length, 3);
  initializeDevelopment(state, false, elapsed(2));
  assert.equal(developmentReview(state, elapsed(30)), null);
  initializeDevelopment(state, true, elapsed(30));
  assert.equal(developmentReview(state, elapsed(30)), null, "No invented history from time before activation.");
  assert.equal(state.development!.residents.a!.reviewedThrough, elapsed(30));
}
{
  const { state } = apply(4);
  assert.equal(home(state), "home-b");
  assert.deepEqual(venueResidentIds(state.venues[0]!), []);
  assert.deepEqual(venueResidentIds(state.venues[1]!), ["b", "a"]);
  assert.equal(state.residences[0]!.status, "current");
  assert.equal(state.development!.residents.a!.pursuits[0]!.status, "completed");
  assert.equal(knownDevelopment(state, "a").length, 0, "Private progress does not reveal itself to the player.");
  assert.equal(
    state.memories.records.find((m) => m.committedEffect?.id.endsWith(":completed"))!.occurredAt,
    new Date(Date.parse(elapsed(2)) + 3000).toISOString(),
  );
  assert.deepEqual(
    readDevelopment(JSON.parse(JSON.stringify(state.development))),
    state.development,
    "The autonomy record survives saving and reload.",
  );
  assert.equal(state.development!.residents.c!.pursuits.length, 0, "Quiet life is a valid outcome.");
}
{
  const { state } = apply(1.25);
  assert.equal(home(state), "home-a");
  assert.equal(state.residences[0]!.status, "moving");
  assert.equal(completeResidenceMove(state, "a", false, new Date(elapsed(1.99))), false);
  completeResidenceMove(state, "a", false, new Date(elapsed(2.01)));
  finishDevelopmentMove(state, "a", elapsed(2.01));
  assert.equal(home(state), "home-b");
  const before = state.memories.records.length;
  finishDevelopmentMove(state, "a", elapsed(10));
  assert.equal(state.memories.records.length, before, "Completion memory is idempotent.");
}
for (const decision of ["refuse", "conditional"] as const) {
  const { state } = apply(4, decision);
  assert.equal(home(state), "home-a");
  assert.equal(state.development!.residents.a!.pursuits[0]!.status, "stalled");
  assert.match(state.development!.log.find((r) => r.outcome === "Rejected")!.reason, /has not agreed/);
}
{
  const state = developmentFixture(),
    input = developmentReview(state, elapsed(4))!;
  state.venues[1]!.access!.managerIds = ["player"];
  assert.equal(developmentReviewValid(state, input), false, "Authority revisions retire stale proposals.");
  const next = developmentReview(state, elapsed(4))!;
  applyDevelopmentReview(state, next, moveProposal(elapsed(4)), elapsed(4));
  assert.equal(home(state), "home-a", "Resident review cannot impersonate the player's permission.");
}
{
  const state = developmentFixture(),
    input = developmentReview(state, elapsed(4))!;
  observeHousing(state, elapsed(3));
  assert.equal(
    developmentReviewValid(state, input),
    true,
    "Observation does not waste a compatible saved decision review.",
  );
  applyDevelopmentReview(state, input, moveProposal(elapsed(4)), elapsed(4.1));
  assert.equal(home(state), "home-b");
  const memory = state.memories.records.find((m) => m.committedEffect?.id.endsWith(":completed"))!;
  assert.equal(memory.occurredAt, elapsed(4.1), "A move cannot be backdated across a current housing observation.");
  assert.equal(state.development!.log.find((l) => l.outcome === "Moved")!.effectiveAt, elapsed(4.1));
}
{
  const state = developmentFixture(),
    input = developmentReview(state, elapsed(4))!,
    proposal = moveProposal(elapsed(4));
  proposal.steps[0]!.targetVenueId = "missing";
  applyDevelopmentReview(state, input, proposal, elapsed(4));
  assert.equal(state.residences.length, 0);
  assert.equal(
    state.development!.log.filter((l) => l.outcome === "Rejected").length,
    4,
    "A rejected prerequisite rejects dependent milestones.",
  );
  assert.throws(() => applyDevelopmentReview(state, input, proposal, elapsed(4)), /inputs changed/);
  assert.equal(developmentReview(state, elapsed(4)), null, "Repeated visits do not farm more eligible reviews.");
}
{
  for (const absentDays of [7, 14, 30]) {
    const frequent = apply(1.25).state;
    completeResidenceMove(frequent, "a", false, new Date(elapsed(2.25)));
    finishDevelopmentMove(frequent, "a", elapsed(2.25));
    const absent = apply(absentDays).state;
    assert.equal(home(frequent), home(absent));
    assert.deepEqual(
      frequent.development!.residents.a!.pursuits[0]!.consents,
      absent.development!.residents.a!.pursuits[0]!.consents,
    );
    assert.equal(
      frequent.memories.records.find((m) => m.committedEffect?.id.endsWith(":completed"))!.occurredAt,
      absent.memories.records.find((m) => m.committedEffect?.id.endsWith(":completed"))!.occurredAt,
      "The same scripted choices have the same causal timing whether opened daily or after a long absence.",
    );
  }
}
{
  const { state } = apply(1.25, "refuse");
  const r = state.development!.residents.a!;
  const lines: VenueReplyLine[] = [
    {
      kind: "dialogue",
      speakerId: "a",
      content: "I am considering moving in with Bram, but he has refused.",
      heardBy: ["a"],
    },
  ];
  const changes = readDevelopmentSceneChanges(
    [
      {
        pursuitId: "ada-move",
        characterId: "a",
        expectedRevision: r.revision,
        kind: "disclose",
        actorId: "a",
        citations: [{ segment: 0, quote: "I am considering moving in with Bram" }],
      },
    ],
    state,
    lines,
  );
  const scene = {
    id: "scene",
    villageSeed: state.seed,
    startedAt: elapsed(1.25),
    sceneAttendance: { capturedAt: elapsed(1.25) },
    lines: [{ ...lines[0], id: "line-1" }],
    submissions: [],
  } as unknown as VenueScene;
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(elapsed(1.25)));
  const submission = {
    id: "turn",
    semanticProvenance: { version: 2, developmentVersion: 1 },
    developmentChanges: bindDevelopmentChanges(changes, ["line-1"]),
  } as VenueSubmission;
  scene.submissions = [submission];
  applyDevelopmentScene(state, scene, submission, elapsed(1.3));
  assert.equal(knownDevelopment(state, "a").length, 0, "Mechanical disclosure receipt alone does not teach.");
  const memory = memoryProposal(state.memories, {
    audience: ["player", "a"],
    text: "I am considering moving in with Bram",
    patch: { kind: "information", domainRef: { kind: "pursuit", id: "ada-move", characterId: "a" } },
  });
  for (const learner of Object.values(memory.proposal.learners)) learner.disclosed = { status: "considering" };
  applyVillageMemory(state, memory.proposal, memory.context);
  assert.equal(knownDevelopment(state, "a").length, 1);
  assert.equal(
    knownDevelopment(state, "a")[0]!.title,
    undefined,
    "A broad disclosure does not reveal an unspoken private destination.",
  );
  assert.equal(
    knownDevelopment(state, "a")[0]!.status,
    "considering",
    "A disclosure does not copy an unspoken private milestone.",
  );
  assert.deepEqual(
    knownDevelopment(state, "a")[0]!.agreements,
    [],
    "Private stored consents are not automatically shared.",
  );
  assert.equal(knownDevelopment(state, "a")[0]!.facts![0]!.text, "I am considering moving in with Bram");
  assert.deepEqual(
    readDevelopment(JSON.parse(JSON.stringify(state.development))),
    state.development,
    "Witnessed pursuit history survives save/reload.",
  );
  const known = knownDevelopment(state, "a")[0]!.text;
  r.pursuits[0]!.reason = "A later private change.";
  assert.equal(
    knownDevelopment(state, "a")[0]!.text,
    known,
    "Private changes do not overwrite last-known information.",
  );
  assert.equal(
    sceneContinuityView(state, scene).development!.residents.a!.pursuits[0]!.reason,
    "Ada wants company nearer her workshop.",
    "The captured Scene sees its exact receipt, not later private state.",
  );
  const receipts = Object.keys(state.exchangeReceipts).length;
  applyDevelopmentScene(state, scene, submission, elapsed(9));
  assert.equal(Object.keys(state.exchangeReceipts).length, receipts);
  const hidden = [{ ...lines[0]!, contactHidden: true }];
  assert.throws(() => readDevelopmentSceneChanges(changes, state, hidden), /exact witnessed/);
  const before = JSON.stringify(state.development!.observations);
  sceneContinuityView(state, scene);
  assert.equal(
    JSON.stringify(state.development!.observations),
    before,
    "Resuming a historical Scene never observes current housing.",
  );
}

{
  const { state } = apply(1.25);
  state.venues[1]!.access!.managerIds.push("c");
  assert.throws(
    () => completeResidenceMove(state, "a", false, new Date(elapsed(3))),
    /current household and controllers/,
  );
  assert.equal(home(state), "home-a", "A newly controlling resident must consent before completion.");
}
{
  const state = developmentFixture(),
    input = developmentReview(state, elapsed(1.25))!;
  observeHousing(state, elapsed(3));
  applyDevelopmentReview(state, input, moveProposal(elapsed(1.25)), elapsed(4));
  assert.equal(
    state.memories.records.find((m) => m.committedEffect?.id.endsWith(":completed"))!.occurredAt,
    elapsed(4),
    "Delayed replay rebases even when completion was beyond the original review window.",
  );
}
{
  const { state } = apply(1.25, "refuse"),
    r = state.development!.residents.a!;
  const change = {
    pursuitId: "ada-move",
    characterId: "a",
    expectedRevision: r.revision,
    kind: "disclose",
    actorId: "a",
    citations: [{ segment: 0, quote: "I may move." }],
  };
  const whispered = {
    kind: "dialogue",
    delivery: "whisper",
    targetId: "b",
    speakerId: "a",
    content: "I may move.",
    heardBy: ["a", "b"],
  } as VenueReplyLine;
  assert.throws(() => readDevelopmentSceneChanges([change], state, [whispered]), /exact witnessed/);
  const fakePlayer = { ...change, kind: "consent", actorId: "player", decision: "agree" };
  assert.throws(
    () =>
      readDevelopmentSceneChanges([fakePlayer], state, [
        { kind: "dialogue", speakerId: "player", content: "I may move.", heardBy: ["a"] },
      ]),
    /exact witnessed/,
  );
}

{
  const { state } = apply(4);
  const r = state.development!.residents.a!;
  r.nextReviewAt = elapsed(5);
  const input = developmentReview(state, elapsed(12))!;
  const proposal = moveProposal(elapsed(12));
  proposal.reviews = proposal.reviews.filter((review) => input.residentIds.includes(review.characterId));
  for (const step of proposal.steps) {
    step.pursuitId = "second-move";
    step.at = new Date(Date.parse(elapsed(6)) + proposal.steps.indexOf(step) * 1000).toISOString();
    if (step.targetVenueId) step.targetVenueId = "home-c";
    if (step.actorId === "b") step.actorId = "c";
  }
  applyDevelopmentReview(state, input, proposal, elapsed(12));
  assert.equal(home(state), "home-c");
  assert.equal(
    r.reviewedThrough,
    new Date(Date.parse(elapsed(2)) + 3000).toISOString(),
    "The captured prior copy is not mutated by later atomic decisions.",
  );
  assert.equal(
    state.development!.residents.a!.reviewedThrough,
    new Date(Date.parse(elapsed(7)) + 3000).toISOString(),
    "The second completed move advances to its own completion, never the first move.",
  );
}

{
  const state = developmentFixture();
  const scene = {
    id: "old",
    villageSeed: state.seed,
    startedAt: elapsed(0),
    sceneAttendance: { capturedAt: elapsed(0) },
    lines: [],
    submissions: [],
  } as unknown as VenueScene;
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(elapsed(0)));
  delete scene.continuity.facts.development;
  const input = developmentReview(state, elapsed(4))!;
  applyDevelopmentReview(state, input, moveProposal(elapsed(4)), elapsed(4));
  assert.equal(
    sceneContinuityView(state, scene).development,
    undefined,
    "A Scene from before activation cannot import later private intentions.",
  );
}

{
  const state = developmentFixture();
  state.venues[1]!.residenceCapacity = 3;
  const input = developmentReview(state, elapsed(14))!;
  applyDevelopmentReview(state, input, moveProposal(elapsed(14)), elapsed(14));
  assert.equal(
    home(state),
    "home-a",
    "Present availability cannot establish that a changed bed was available earlier.",
  );
}
{
  const state = developmentFixture(),
    input = developmentReview(state, elapsed(4))!,
    proposal = moveProposal(elapsed(4));
  const names = new Map(proposal.steps.map((step, index) => [step.id, String(index).repeat(240)]));
  for (const step of proposal.steps) {
    step.id = names.get(step.id)!;
    step.pursuitId = "p".repeat(240);
    step.dependsOn = step.dependsOn.map((id) => names.get(id)!);
  }
  applyDevelopmentReview(state, input, readDevelopmentProposal(proposal), elapsed(4));
  assert.deepEqual(
    readDevelopment(JSON.parse(JSON.stringify(state.development))),
    state.development,
    "Maximum valid provider IDs cannot make the saved world unreadable.",
  );
}

{
  const state = developmentFixture();
  normalizeVillageMutation(state, state.seed, () => {}, {
    now: () => new Date(elapsed(0)),
    seed: () => "normalization",
  });
  const input = developmentReview(state, elapsed(14))!;
  normalizeVillageMutation(
    state,
    state.seed,
    (state) => applyDevelopmentReview(state, input, moveProposal(elapsed(14)), elapsed(14)),
    { now: () => new Date(elapsed(14)), seed: () => "normalization" },
  );
  assert.equal(home(state), "home-b");
  assert.equal(
    housingAvailableAt(state, elapsed(14))["home-b"],
    new Date(Date.parse(elapsed(2)) + 3000).toISOString(),
    "Normalizing occupancy/access must preserve the accepted historical availability floor.",
  );
  assert.deepEqual(readDevelopment(JSON.parse(JSON.stringify(state.development))), state.development);
}
assert.throws(() => readDevelopmentProposal({ version: 1, steps: [], reviews: [] }), /invalid review/);
assert.throws(() => readDevelopment({ version: 2 }), /invalid/);
console.log(
  "Resident development: elapsed time, real occupancy, refusal, conditional consent, observations, privacy, recovery and historical Scene tests passed.",
);
