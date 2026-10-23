import assert from "node:assert/strict";
import { semanticHash } from "../packages/villages/src/server/domain/rules/semantic-contract.js";
import { publicSceneResponse } from "../packages/villages/src/server/domain/rules/scene-public.js";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  initialOpening,
  readOpeningProposal,
  openingView,
  openingSceneDirection,
  applyOpeningExchange,
  reconcileOpening,
  OPENING_WORK_MS,
} from "../packages/villages/src/server/domain/rules/opening-project.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../packages/villages/src/server/features/projects/project-drafts.js";
import {
  createProjectLifecycle,
  type ProjectLifecyclePorts,
} from "../packages/villages/src/server/features/projects/project-lifecycle-service.js";
import { reconcileProjectLifecycles } from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import type { OpeningProposal } from "../packages/villages/src/shared/contracts/opening.js";
import type { VenueScene, VenueSubmission } from "../packages/villages/src/server/domain/models/scene-model.js";

const proposal = (residentId: string, established = false): OpeningProposal => ({
  residentId,
  name: established ? "Old Theatre" : "Sky Terrace",
  description: established
    ? "A working theatre already named in the setting."
    : "A small shared terrace for watching the skies.",
  venueClass: "community",
  established,
  provenance: "Private preparation source",
  work: "Coordinate a shared gathering and its practical arrangements.",
  firstUse: "Watch a performance together.",
});
// Lists of supporting facts normalize to the same saved text contract.
{
  const facts = ["  The pavilion is open to the park. ", "Benches already stand under its roof."];
  const parsed = readOpeningProposal({ ...proposal("a"), provenance: facts }, "a");
  assert.equal(parsed.provenance, facts.map((fact) => fact.trim()).join("\n"));
  assert.deepEqual(readOpeningProposal(parsed, "a"), parsed, "saved canonical text round-trips unchanged");
  for (const invalid of [undefined, "", [], ["valid", 1], ["valid", ""], { fact: "a" }])
    assert.throws(
      () => readOpeningProposal({ ...proposal("a"), provenance: invalid }, "a"),
      /missing its supporting setting facts/,
    );
  assert.throws(
    () => readOpeningProposal({ ...proposal("a"), provenance: ["x".repeat(1000), "y"] }, "a"),
    /too much text/,
  );
}
function world(count = 3, established = false) {
  const state = defaultVillageState();
  state.seed = "opening-world";
  state.setupAt = "2026-10-17T12:00:00.000Z";
  state.villagers = ["a", "b", "c"].slice(0, count).map((id) => ({
    characterId: id,
    cardSnapshot: { id, name: id, tags: [] },
    agenda: unwrittenVillageAgenda([], id),
    completedWishes: [],
  })) as any;
  state.opening = initialOpening(
    state.villagers.map((resident) => resident.characterId),
    "community",
    "test-opening",
  );
  state.opening.proposals = state.opening.residentIds.map((id, index) => ({
    ...proposal(id, established),
    name: index ? `${proposal(id).name} ${id}` : proposal(id, established).name,
  }));
  state.opening.stage = "conversations";
  return state;
}
function pitch(state: ReturnType<typeof world>, residentId: string) {
  const idea = state.opening!.proposals.find((entry) => entry.residentId === residentId)!;
  const quote = `I would like us to arrange ${idea.name} for our shared evenings.`;
  const scene = {
    id: `scene-${residentId}`,
    villageSeed: state.seed,
    zoneId: "common",
    activeIds: [residentId],
    participants: [{ characterId: residentId, name: residentId, doing: "talking" }],
    lines: [
      {
        id: `line-${residentId}`,
        role: "assistant",
        kind: "dialogue",
        speakerId: residentId,
        content: quote,
        heardBy: [residentId],
        zoneId: "common",
      },
    ],
    submissions: [],
  } as unknown as VenueScene;
  const turn = {
    id: `turn-${residentId}`,
    mode: "chat",
    message: "What would you like to do here?",
    activeIdsAtTurn: [residentId],
    replyLineIds: [`line-${residentId}`],
    zoneIdAtTurn: "common",
    openingContext: { stage: "conversations", projectId: "" },
    openingSignal: { kind: "pitch", residentId, quote, playerQuote: "" },
  } as VenueSubmission;
  return { scene, turn };
}

// System can recognize the same prepared idea without requiring its full authored title in one quote.
{
  const state = world();
  const idea = state.opening!.proposals[0];
  idea.name = "Aqua's Perch Landing Rail";
  const { scene, turn } = pitch(state, "a");
  const quote = "I call it the Perch Landing Rail. It gives flying visitors a safe place to land.";
  scene.lines[0].content = quote;
  turn.openingSignal!.quote = quote;
  const fingerprint = semanticHash([
    idea.residentId,
    idea.name,
    idea.description,
    idea.situation ?? "",
    idea.venueClass,
    idea.established,
    idea.provenance,
    idea.work,
    idea.firstUse,
  ]);
  (turn.openingContext as any).proposalFingerprint = fingerprint;
  turn.semanticProvenance = { version: 2, pipelineVersion: 3, sourceHash: "f".repeat(64) };
  turn.semanticReady = true;
  applyOpeningExchange(state, scene, turn);
  assert.equal(
    state.opening!.reveals.length,
    1,
    "A witnessed System-bound pitch must advance despite a natural shortened title",
  );
  applyOpeningExchange(state, scene, turn);
  assert.equal(state.opening!.reveals.length, 1, "The reveal remains once-only");
  const saved = coerceSession({ ...scene, submissions: [turn] });
  assert.equal((saved.submissions[0].openingContext as any).proposalFingerprint, fingerprint);
  assert.equal(
    JSON.stringify(publicSceneResponse(saved)).includes(fingerprint),
    false,
    "Private proposal binding is never public",
  );
  assert.equal(
    publicSceneResponse(saved).submissions[0].openingContext?.stage,
    "conversations",
    "Public proof test retains the visible turn",
  );
  for (const mutate of [
    (s: typeof state, _t: VenueSubmission) => {
      s.opening!.proposals[0].work = "Different work under the same title";
    },
    (_s: typeof state, t: VenueSubmission) => {
      delete t.semanticProvenance;
    },
    (_s: typeof state, t: VenueSubmission) => {
      delete t.semanticProvenance!.pipelineVersion;
    },
    (_s: typeof state, t: VenueSubmission) => {
      t.semanticProvenance!.sourceHash = "invalid";
    },
    (_s: typeof state, t: VenueSubmission) => {
      (t.openingContext as any).proposalFingerprint = "";
    },
    (_s: typeof state, t: VenueSubmission) => {
      (t.openingContext as any).proposalFingerprint = 3;
    },
    (_s: typeof state, t: VenueSubmission) => {
      t.activeIdsAtTurn = ["a", "b"];
    },
  ]) {
    const next = structuredClone(state),
      nextTurn = structuredClone(turn);
    next.opening!.reveals = [];
    mutate(next, nextTurn);
    applyOpeningExchange(next, scene, nextTurn);
    assert.equal(next.opening!.reveals.length, 0, "Unbound, stale or ineligible semantic proof fails closed");
  }
  const invalid = structuredClone(turn),
    fullScene = structuredClone(scene),
    invalidState = structuredClone(state);
  invalidState.opening!.reveals = [];
  invalid.openingSignal!.quote = "I propose Aqua's Perch Landing Rail for arriving neighbors.";
  fullScene.lines[0].content = invalid.openingSignal!.quote;
  (invalid.openingContext as any).proposalFingerprint = 3;
  const invalidSaved = coerceSession({ ...fullScene, submissions: [invalid] });
  assert(
    Object.hasOwn(invalidSaved.submissions[0].openingContext!, "proposalFingerprint"),
    "Malformed supplied metadata cannot disappear into legacy fallback",
  );
  applyOpeningExchange(invalidState, invalidSaved, invalidSaved.submissions[0]);
  assert.equal(invalidState.opening!.reveals.length, 0, "A complete title cannot rescue malformed System binding");
  const legacy = structuredClone(turn);
  delete (legacy.openingContext as any).proposalFingerprint;
  const old = structuredClone(state);
  old.opening!.reveals = [];
  applyOpeningExchange(old, scene, legacy);
  assert.equal(old.opening!.reveals.length, 0, "Legacy abbreviated quotes retain their original rule");
}

// Player knowledge, exact witnesses, replay identity, and the whole founding roster.
for (const count of [1, 2, 3]) {
  const state = world(count);
  assert.equal(openingView(state)!.proposals.length, 0);
  for (const residentId of state.opening!.residentIds) {
    const { scene, turn } = pitch(state, residentId);
    const multi = { ...turn, activeIdsAtTurn: [residentId, "other"] };
    applyOpeningExchange(state, scene, multi);
    assert.ok(!state.opening!.reveals.some((proof) => proof.residentId === residentId));
    applyOpeningExchange(state, { ...scene, villageSeed: "other-world" }, turn);
    assert.ok(!state.opening!.reveals.some((proof) => proof.residentId === residentId));
    applyOpeningExchange(state, scene, { ...turn, openingContext: { stage: "gathering", projectId: "" } });
    assert.ok(!state.opening!.reveals.some((proof) => proof.residentId === residentId));
    applyOpeningExchange(state, scene, turn);
    applyOpeningExchange(state, scene, turn);
    assert.equal(state.opening!.reveals.filter((proof) => proof.residentId === residentId).length, 1);
  }
  assert.equal(openingView(state)!.proposals.length, count);
  assert.ok(openingView(state)!.proposals.every((entry) => entry.provenance === ""));
  assert.deepEqual(coerceVillageState(state).opening, state.opening);
}
{
  const state = world();
  const { scene, turn } = pitch(state, "a");
  scene.lines[0].content = "Hello there. How are you?";
  turn.openingSignal!.quote = scene.lines[0].content;
  applyOpeningExchange(state, scene, turn);
  assert.equal(state.opening!.reveals.length, 0, "a greeting cannot reveal a proposal");
  assert.ok(!openingSceneDirection(state, scene).includes("Sky Terrace b"), "other residents' briefs stay private");
  scene.lines[0].contactHidden = true;
  applyOpeningExchange(state, scene, turn);
  assert.equal(state.opening!.reveals.length, 0);
}

// Both place histories use the same actual gates, with no supplied builder consent.
for (const established of [false, true]) {
  let state = world(2, established);
  const ports = {
    mutateVillageState: async (mutate: (value: typeof state) => void) => {
      const next = structuredClone(state);
      mutate(next);
      reconcileOpening(next);
      state = next;
      return state;
    },
    draftNewVenueProject,
    draftRenovationProject,
    outsideVenueOperation: () => {},
    preparePrivateSpaces: async () => {},
    villagesDebugAgentsEnabled: () => false,
    loadProjectWishProgress: async () => ({ processProjectWishOutbox: async () => {} }),
  } as unknown as ProjectLifecyclePorts;
  const service = createProjectLifecycle(ports);
  await assert.rejects(
    service.createNewVenueProject({ name: "Bypass", description: "Bypass", venueClass: "community" }),
    /Finish or skip/,
  );
  await assert.rejects(
    service.decideOpeningProposal({ openingId: state.opening!.id, action: "accept", residentId: "a" }),
    /Hear/,
  );
  for (const id of ["b", "a"]) {
    const { scene, turn } = pitch(state, id);
    applyOpeningExchange(state, scene, turn);
  }
  await service.decideOpeningProposal({
    openingId: state.opening!.id,
    action: "accept",
    residentId: "a",
    name: "Forged change",
  });
  await service.decideOpeningProposal({ openingId: state.opening!.id, action: "accept", residentId: "a" });
  assert.equal(state.projects.length, 1);
  await assert.rejects(service.decideOpeningProposal({ openingId: "old-opening", action: "skip" }), /opening changed/);
  state.foundingPreparation = { status: "pending", completedIds: [], currentId: "", error: "" };
  await assert.rejects(service.decideOpeningProposal({ openingId: state.opening!.id, action: "skip" }), /preparation/);
  state.foundingPreparation = null;
  const id = state.opening!.projectId;
  assert.equal(state.projects[0].title, proposal("a", established).name);
  assert.equal(state.projects[0].opening!.durationMs, OPENING_WORK_MS);
  await service.placeNewVenueProject(id, { x: 0.4, y: 0.4 });
  await service.saveProjectPlan(id, {
    layoutVersion: 1,
    layout: "common",
    form: "A gathering place",
    exteriorDescription: "An entrance",
    spaces: [
      {
        id: state.venues.find((venue) => venue.id === state.projects[0].venueId)!.spaces?.[0]?.id ?? "common:base",
        venueClass: "community",
        name: "Common Space",
        purpose: "Shared evenings",
        description: "An open shared space",
      },
    ],
    privateSpaces: [],
  });
  assert.equal(state.projects[0].lifecycle!.phase, "builder");
  await assert.rejects(service.lockProjectBuilder(id, { residentId: "a" }), /has not agreed/);
  state.projects[0].lifecycle!.candidates.push({
    residentId: "a",
    evidenceId: "agreement",
    at: new Date().toISOString(),
  });
  state.projects[0].lifecycle!.spokenProofs.push({
    lineId: "agreement",
    sessionId: "agreement-scene",
    submissionId: "agreement-turn",
    speakerId: "a",
    venueId: "community",
    quote: "I agree to handle the work for this Project.",
    at: new Date().toISOString(),
  });
  await service.lockProjectBuilder(id, { residentId: "a" });
  const flow = state.projects[0].lifecycle!;
  flow.requirements = (["structure", "equipment", "finish"] as const).map((category) => ({
    id: category,
    category,
    title: "None needed",
    needed: false,
    carriedAt: "",
    deliveredAt: "",
  }));
  flow.requirementsEvidenceId = "plan";
  flow.spokenProofs.push({
    lineId: "plan",
    sessionId: "plan-scene",
    submissionId: "plan-turn",
    speakerId: "a",
    venueId: "community",
    quote: "No structural materials, equipment or finishing supplies are needed for this coordination.",
    at: new Date().toISOString(),
  });
  await service.acceptProjectRequirements(id);
  const now = new Date();
  await service.startProjectConstruction(id, now);
  assert.equal(Date.parse(state.projects[0].lifecycle!.workOrder!.completesAt) - now.getTime(), OPENING_WORK_MS);
  reconcileProjectLifecycles(state, new Date(now.getTime() + OPENING_WORK_MS - 1));
  assert.equal(state.projects[0].status, "building");
  reconcileProjectLifecycles(state, new Date(now.getTime() + OPENING_WORK_MS));
  assert.equal(state.projects[0].lifecycle!.phase, "complete");
  const site = state.venues.find((venue) => venue.id === state.projects[0].venueId)!;
  const commonId = site.spaces![0].id;
  site.spaces![0].state.items.push("A borrowed chair");
  site.spaces![0].state.publicFacts.push("The first arrangement was discussed here.");
  await service.openFinishedProject(id, {
    layoutVersion: 1,
    layout: "common",
    form: "A gathering place",
    exteriorDescription: "An entrance",
    interiorDescription: "An open shared space",
    spaces: [
      {
        id: commonId,
        venueClass: "community",
        name: "Common Space",
        purpose: "Shared evenings",
        description: "An open shared space",
      },
    ],
    privateSpaces: [],
  });
  assert.equal(state.projects[0].status, "complete");
  if (established) {
    assert.ok(state.venues[0].spaces![0].state.items.includes("A borrowed chair"));
    assert.ok(state.venues[0].spaces![0].state.publicFacts.includes("The first arrangement was discussed here."));
    assert.equal(state.venues[0].state.condition, proposal("a", true).description);
  }
  assert.equal(state.opening!.stage, "first-use", "configuration alone does not complete guidance");
  const { scene, turn } = pitch(state, "a");
  scene.placeId = state.projects[0].venueId;
  turn.openingContext = { stage: "first-use", projectId: id };
  turn.message = "I take a seat and watch the performance.";
  scene.lines[0].content = "The performance begins as you watch together.";
  turn.openingSignal = { kind: "first-use", residentId: "", quote: scene.lines[0].content, playerQuote: turn.message };
  turn.physicalOutcomeVersion = 1;
  applyOpeningExchange(state, scene, turn);
  assert.equal(state.opening!.stage, "first-use", "unverified physical claims cannot complete guidance");
  delete turn.physicalOutcomeVersion;
  applyOpeningExchange(state, scene, {
    ...turn,
    message: "Hello!",
    openingSignal: { ...turn.openingSignal, playerQuote: "Hello!" },
  });
  assert.equal(state.opening!.stage, "first-use", "a greeting cannot complete intended use");
  const saved = coerceSession({ ...scene, submissions: [turn] });
  assert.deepEqual(saved.submissions[0].openingSignal, turn.openingSignal);
  applyOpeningExchange(state, scene, turn);
  assert.equal(state.opening!.stage, "complete");
  applyOpeningExchange(state, scene, turn);
  assert.equal(state.projects.length, 1);
  assert.ok(state.opening!.firstUseEvidence);
}
{
  const state = world();
  state.villagers = state.villagers.filter((entry) => entry.characterId !== "c");
  assert.deepEqual(openingView(state)!.residentIds, ["a", "b"]);
  state.opening!.declinedIds = ["a", "b"];
  reconcileOpening(state);
  assert.equal(state.opening!.stage, "ended");
  assert.equal(coerceVillageState(defaultVillageState()).opening, undefined, "existing villages do not adopt guidance");
}
console.log(
  "Opening Project regression passed: knowledge, roster, replay, shared pipeline, twelve-hour work and first-use evidence.",
);
