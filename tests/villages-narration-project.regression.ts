// Test cases: narration-project/approval-and-lead, narration-project/controller, narration-project/captured-terms, narration-project/current-witness, narration-project/withdrawal, narration-project/pending-withdrawal, narration-project/selected-lead, narration-project/new-venue-terms
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { EMPTY_RESIDENT_ADMISSION } from "../packages/villages/src/shared/helpers/resident-admission.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../packages/villages/src/server/features/projects/project-drafts.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { narrationLines } from "../packages/villages/src/server/domain/rules/narration-lines.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { bindNarrationSource } from "../packages/villages/src/server/domain/rules/narration-sources.js";
import { applyNarrationProject } from "../packages/villages/src/server/domain/rules/narration-project.js";
import {
  projectSpeechContext,
  projectSpeechPrompt,
} from "../packages/villages/src/server/domain/rules/project-interpretation.js";

function fixture(speakerId = "a", whisper = false) {
  const state = defaultVillageState(),
    at = new Date().toISOString();
  state.seed = "world";
  state.setupAt = state.foundedAt = at;
  state.villagers = ["a", "b"].map((id) => ({
    incarnation: "founding-" + id,
    characterId: id,
    admission: EMPTY_RESIDENT_ADMISSION,
    letterFontId: "caveat",
    wishes: [],
    addedAt: at,
    agenda: null,
    cardSnapshot: {
      id,
      name: id,
      revision: 1,
      sourceStatus: "available",
      capturedAt: at,
      comment: "",
      summary: "",
      tags: [],
      systemPrompt: "",
      description: "A resident.",
      personality: "",
      scenario: "",
      backstory: "",
      appearance: "",
      exampleDialogue: "",
    },
  }));
  const venue = venueFixture({
    id: "house",
    name: "House",
    classes: ["residence"],
    residentIds: ["a"],
    residenceCapacity: 2,
    zones: [
      {
        ...defaultVenueSpace("residence"),
        id: "exterior",
        name: "Entrance",
        kind: "exterior",
        seen: true,
        connectedTo: ["common"],
      },
      {
        ...defaultVenueSpace("residence"),
        id: "common",
        name: "Common room",
        kind: "shared-residence",
        seen: true,
        connectedTo: ["exterior"],
      },
    ],
  });
  initializeVenueAccess(venue);
  venue.access!.managerIds = ["a"];
  state.venues = [venue];
  const project = draftRenovationProject(
    state,
    venue.id,
    {
      title: "Covered entrance",
      detail: "Build a covered entrance.",
      exteriorDescription: "A covered entrance with a wooden roof.",
    },
    "project",
  );
  const participants = ["a", "b"].map((characterId) => ({
    characterId,
    name: "Public name " + characterId,
    doing: "Talking",
  }));
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "scene",
      sceneRevision: 1,
      villageSeed: state.seed,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: "common",
      activeIds: ["a", "b"],
      participants,
      startedAt: at,
      lastActivityAt: at,
      status: "active",
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(venue),
        occupants: participants.map((person) => ({ ...person, zoneId: "common" })),
      },
    }),
    venue,
  );
  function speech(text: string, operationId = "operation") {
    const prepared = narrationContinuityContext(state, scene, venue, operationId, "Would you agree?", at);
    const readset = fittedNarrationReadset(
      state,
      prepared,
      prepared.parts.flatMap((part) => (part.block.evidenceId ? [part.block.evidenceId] : [])),
    );
    const reply = readNarrationReply(
      {
        segments: [
          {
            kind: "dialogue",
            id: "decision",
            speakerId,
            text,
            ...(whisper ? { delivery: "whisper", targetId: speakerId === "a" ? "b" : "a" } : {}),
          },
        ],
      },
      ["a", "b"],
    );
    const routed = narrationLines(reply, scene, prepared.episodeId, at, []);
    const context = { ...readset.source, ...routed, native: {}, moves: [] };
    const sources = [bindNarrationSource({ segment: "decision" }, context)];
    const baseline = projectSpeechContext(state, project, Object.keys(readset.projects[0].agreements));
    return { readset, context, sources, baseline };
  }
  const evidence = speech("I approve the covered entrance exactly as planned, and I willingly offer to lead the work.");
  const request = (decision: "approval" | "builder" | "withdrawal") => ({
    projectId: project.id,
    decision,
    receiptId: "receipt-" + decision,
    submissionId: "submission",
    at,
  });
  return { state, project, evidence, request, speech };
}

await runCase("narration-project/approval-and-lead", () => {
  const f = fixture(),
    { readset, context, sources, baseline } = f.evidence;
  assert(readset.projects.some((row) => row.projectId === f.project.id));
  const approval = applyNarrationProject(f.state, f.request("approval"), readset, context, sources, baseline);
  const lead = applyNarrationProject(f.state, f.request("builder"), readset, context, sources, baseline);
  assert.equal(f.project.lifecycle!.approvals[0].residentId, "a");
  assert.equal(f.project.lifecycle!.candidates[0].residentId, "a");
  assert.equal(f.project.lifecycle!.spokenProofs.length, 1, "one utterance supporting two decisions is retained once");
  assert.equal(f.project.status, "planning");
  assert.equal(f.project.lifecycle!.workOrder, null, "conversation never starts or completes physical work");
  assert(approval.witnesses.includes("player") && lead.witnesses.includes("a"));
  assert.match(approval.text, /^Public name a approved/);
  assert.throws(
    () => applyNarrationProject(f.state, f.request("approval"), readset, context, sources, baseline),
    /already retained/,
  );
});

await runCase("narration-project/controller", () => {
  const f = fixture("b"),
    before = structuredClone(f.state),
    { readset, context, sources, baseline } = f.evidence;
  assert.throws(
    () => applyNarrationProject(f.state, f.request("approval"), readset, context, sources, baseline),
    /cannot approve/,
  );
  assert.deepEqual(f.state, before);
  applyNarrationProject(f.state, f.request("builder"), readset, context, sources, baseline);
  assert.equal(
    f.project.lifecycle!.candidates[0].residentId,
    "b",
    "a willing Villager may volunteer without becoming a controller",
  );
});

await runCase("narration-project/captured-terms", () => {
  const complete = fixture();
  const rendered = projectSpeechPrompt(complete.state, complete.evidence.readset.projects);
  assert(
    rendered.includes(JSON.stringify(complete.project.lifecycle!.change)),
    "every proposed structural field is supplied intact",
  );
  for (const change of ["missing", "revision", "incarnation"] as const) {
    const f = fixture(),
      { readset, context, sources, baseline } = f.evidence;
    if (change === "missing") readset.projects = [];
    if (change === "revision") f.project.lifecycle!.revision++;
    if (change === "incarnation") f.state.villagers[0].incarnation = "readmitted-a";
    const before = structuredClone(f.state);
    assert.throws(() => applyNarrationProject(f.state, f.request("approval"), readset, context, sources, baseline));
    assert.deepEqual(f.state, before);
  }
});

await runCase("narration-project/current-witness", () => {
  const whispered = fixture("a", true);
  assert.throws(
    () =>
      applyNarrationProject(
        whispered.state,
        whispered.request("approval"),
        whispered.evidence.readset,
        whispered.evidence.context,
        whispered.evidence.sources,
        whispered.evidence.baseline,
      ),
    /witnessed by the player/,
  );
  const f = fixture(),
    { readset, context, sources, baseline } = f.evidence;
  for (const forged of [
    { ...sources[0], episodeId: "an-earlier-Scene" },
    { ...sources[0], actorId: "b" },
    { ...sources[0], fingerprint: "0".repeat(64) },
    { ...sources[0], positions: { ...sources[0].positions, a: "exterior" } },
    { ...sources[0], positions: { ...sources[0].positions, a: "exterior", player: "exterior" } },
  ])
    assert.throws(
      () => applyNarrationProject(f.state, f.request("builder"), readset, context, [forged], baseline),
      /complete current speech/,
    );
  assert.deepEqual(f.project.lifecycle!.evidenceIds, []);
});

await runCase("narration-project/withdrawal", () => {
  const f = fixture(),
    { readset, context, sources, baseline } = f.evidence;
  applyNarrationProject(f.state, f.request("approval"), readset, context, sources, baseline);
  applyNarrationProject(f.state, f.request("builder"), readset, context, sources, baseline);
  const withdrawal = f.speech("I withdraw my approval and my offer to lead this work.", "withdrawal");
  applyNarrationProject(
    f.state,
    f.request("withdrawal"),
    withdrawal.readset,
    withdrawal.context,
    withdrawal.sources,
    withdrawal.baseline,
  );
  assert.deepEqual(f.project.lifecycle!.approvals, []);
  assert.deepEqual(f.project.lifecycle!.candidates, []);
  assert.equal(f.project.lifecycle!.spokenProofs.length, 2);
});

await runCase("narration-project/pending-withdrawal", () => {
  for (const existing of [false, true]) {
    const f = fixture();
    if (existing) {
      const e = f.evidence;
      applyNarrationProject(f.state, f.request("approval"), e.readset, e.context, e.sources, e.baseline);
    }
    const pending = f.speech("I approve the covered entrance exactly as planned.", "pending");
    const withdrawal = f.speech("I withdraw my approval and offer to lead.", "withdrawal");
    applyNarrationProject(
      f.state,
      f.request("withdrawal"),
      withdrawal.readset,
      withdrawal.context,
      withdrawal.sources,
      withdrawal.baseline,
    );
    const before = projectSpeechContext(f.state, f.project, ["a", "b"]);
    const unchanged = structuredClone(f.project);
    for (const decision of ["approval", "builder"] as const)
      assert.throws(
        () =>
          applyNarrationProject(
            f.state,
            { ...f.request(decision), receiptId: "late-" + decision },
            pending.readset,
            pending.context,
            pending.sources,
            before,
          ),
        /agreement authority changed/,
      );
    assert.deepEqual(f.project, unchanged);
  }
});

await runCase("narration-project/selected-lead", () => {
  for (const status of ["working", "paused"] as const) {
    const f = fixture(),
      flow = f.project.lifecycle!;
    const at = f.request("approval").at;
    flow.builderId = "a";
    f.project.status = flow.phase = status;
    flow.workOrder = {
      startsAt: at,
      completesAt: new Date(Date.parse(at) + 86_400_000).toISOString(),
      pausedAt: status === "paused" ? at : "",
      remainingMs: 86_400_000,
    };
    const e = f.speech("I withdraw my offer to lead this work.", "withdrawal");
    applyNarrationProject(f.state, f.request("withdrawal"), e.readset, e.context, e.sources, e.baseline);
    assert.equal(flow.builderId, "", "withdrawn lead cannot keep another Project reserved");
    assert.equal(f.project.status, "paused");
    assert(flow.workOrder.pausedAt);
  }
});

await runCase("narration-project/new-venue-terms", () => {
  const f = fixture();
  const project = draftNewVenueProject(
    f.state,
    { name: "Orchard", classes: ["workplace"], description: "An apple orchard beside the river." },
    "a",
    "orchard",
  );
  project.venueDraft!.position = { x: 15, y: 23 };
  project.plan = {
    capacity: 2,
    form: "Open orchard",
    venueType: "Orchard",
    exteriorDescription: "Rows of apple trees.",
    layoutVersion: 1,
    layout: "exterior",
    spaces: [],
    privateSpaces: [],
    exteriorImage: null,
  };
  const context = projectSpeechContext(f.state, project, ["a"]);
  assert.deepEqual(context.terms.proposal, { draft: project.venueDraft, plan: project.plan });
  const prompt = projectSpeechPrompt(f.state, [context]);
  assert(prompt.includes(JSON.stringify(project.venueDraft)) && prompt.includes(JSON.stringify(project.plan)));
  project.venueDraft!.classes = ["leisure"];
  assert.notDeepEqual(
    projectSpeechContext(f.state, project, ["a"]).terms,
    context.terms,
    "a saved plan cannot hide a later change in official classes or site terms",
  );
});
