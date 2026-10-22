import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  initialOpening,
  openingView,
  ordinaryProjectsLocked,
  applyOpeningExchange,
  reconcileOpening,
  openingProposalFingerprint,
} from "../packages/villages/src/server/domain/rules/opening-project.js";
import { openingPresence } from "../packages/villages/src/server/domain/rules/opening-presence.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import { openingSemanticContext } from "../packages/villages/src/server/domain/rules/opening-context.js";
import {
  bindOpeningRenovation,
  openingRenovationDraft,
} from "../packages/villages/src/server/domain/rules/opening-renovation.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  draftNewVenueProject,
  draftRenovationProject,
} from "../packages/villages/src/server/features/projects/project-drafts.js";
import {
  createProjectLifecycle,
  type ProjectLifecyclePorts,
} from "../packages/villages/src/server/features/projects/project-lifecycle-service.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
import { socialPlanCandidates } from "../packages/villages/src/server/domain/rules/social-rules.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import type { OpeningProposal } from "../packages/villages/src/shared/contracts/opening.js";

function world(count = 3) {
  const state = defaultVillageState();
  state.seed = "guided-opening";
  state.setupAt = "2026-10-21T12:00:00.000Z";
  state.villagers = ["a", "b", "c"].slice(0, count).map((id) => ({
    characterId: id,
    cardSnapshot: { id, name: id, tags: [] },
    agenda: unwrittenVillageAgenda([], id),
    completedWishes: [],
  })) as any;
  const venue = (id: string, resident: string | null, classes = ["residence"]) => ({
    id,
    name: id,
    form: "An existing place",
    classes,
    layoutVersion: 1,
    zones: [
      {
        ...defaultVenueSpace(classes[0] as any, "An accessible entrance"),
        id: "exterior",
        kind: "exterior",
        name: "Entrance",
      },
      {
        ...defaultVenueSpace(classes[0] as any, "The existing room"),
        id: "room",
        kind: resident ? "shared-residence" : "public",
        name: "Room",
        seen: !resident,
      },
    ],
    occupancy: { playerHome: false, residentCharacterId: resident },
    residentIds: resident ? [resident] : [],
    improvements: [null, null],
    presentation: { x: 0.2, y: 0.2, image: null },
    state: { condition: "Established", publicFacts: [], upgrades: [], furniture: [], updatedAt: "" },
  });
  state.venues = [
    venue("community", null, ["community"]),
    ...state.villagers.map((r) => venue("home-" + r.characterId, r.characterId)),
  ] as any;
  state.opening = initialOpening(
    state.villagers.map((r) => r.characterId),
    "community",
    "opening",
    2,
  );
  state.opening.stage = "conversations";
  state.opening.proposals = state.villagers.map((r): OpeningProposal => ({
    kind: "new-venue",
    residentId: r.characterId,
    name: "Lookout " + r.characterId,
    description: "A place to watch the stars",
    venueClass: "community",
    established: false,
    provenance: "Private preparation",
    work: "Prepare seating and a clear view",
    firstUse: "Watch the stars",
  }));
  return state;
}

for (const count of [1, 2, 3]) {
  const state = world(count);
  const before = JSON.stringify(state.villagers.map((r) => r.agenda));
  for (const r of [...state.villagers].reverse()) {
    const position = openingPresence(state, r.characterId)!;
    assert.equal(position.venueId, "home-" + r.characterId);
    const attendance = captureSceneAttendance(state, position.venueId, new Date("2026-10-22T01:00:00Z"));
    assert.deepEqual(
      attendance.occupants.map((p) => p.characterId),
      [r.characterId],
    );
    assert.equal(attendance.occupants[0].zoneId, "exterior");
    assert.equal(attendance.occupants[0].doing, position.activity);
    const idea = state.opening!.proposals.find((p) => p.residentId === r.characterId)!;
    const quote = `My idea is ${idea.name}. ${idea.description}. ${idea.work}.`;
    const scene = coerceSession({
      id: "intro-" + r.characterId,
      processingVersion: 1,
      villageSeed: state.seed,
      placeId: position.venueId,
      zoneId: "exterior",
      activeIds: [r.characterId],
      openingIntroductionResidentId: r.characterId,
      sceneAttendance: attendance,
      participants: attendance.occupants,
      status: "active",
      lines: [
        {
          id: "pitch",
          role: "assistant",
          kind: "dialogue",
          speakerId: r.characterId,
          content: quote,
          zoneId: "exterior",
          heardBy: [r.characterId],
        },
      ],
    });
    assert.equal(openingSemanticContext(state, scene)?.requiredPitch, true);
    const turn = {
      id: "greeting",
      mode: "chat",
      message: "",
      zoneIdAtTurn: "exterior",
      activeIdsAtTurn: [r.characterId],
      replyLineIds: ["pitch"],
      openingContext: { stage: "conversations", projectId: "", proposalFingerprint: openingProposalFingerprint(idea) },
      openingSignal: { kind: "pitch", residentId: r.characterId, quote: idea.name, playerQuote: "" },
      semanticProvenance: { version: 2, pipelineVersion: 3, sourceHash: "a".repeat(64) },
    } as any;
    applyOpeningExchange(state, scene, turn);
    applyOpeningExchange(state, scene, turn);
    assert.equal(
      state.opening!.reveals.filter((proof) => proof.residentId === r.characterId).length,
      1,
      "The saved greeting must reveal its matching proposal once",
    );
    assert.equal(openingPresence(state, r.characterId), undefined);
    assert.equal(
      scene.sceneAttendance!.occupants[0].zoneId,
      "exterior",
      "revealing never rewrites captured attendance",
    );
    assert.equal(openingSemanticContext(state, scene)?.requiredPitch, undefined, "no forced repeat pitch");
  }
  assert.equal(openingView(state)!.heardIds.length, count);
  assert.equal(JSON.stringify(state.villagers.map((r) => r.agenda)), before);
  assert.equal(ordinaryProjectsLocked(state), true, "hearing all proposals is not accepting work");
  assert.equal(coerceVillageState(state).opening!.version, 2);
}

{
  const state = world(2);
  state.venues.find((v) => v.id === "home-b")!.residentIds = ["a", "b"];
  state.venues = state.venues.filter((v) => v.id !== "home-a");
  assert.equal(
    captureSceneAttendance(state, "home-b", new Date()).occupants.length,
    2,
    "shared housing cannot hide a bystander",
  );
  state.opening!.stage = "ended";
  assert.equal(openingPresence(state, "a"), undefined);
  assert.equal(ordinaryProjectsLocked(state), false);
  state.opening!.stage = "conversations";
  state.opening!.version = 1;
  assert.equal(openingPresence(state, "a"), undefined, "legacy openings never acquire staged positions");
}

{
  const state = world();
  state.relationshipContext = defaultRelationshipState(state.seed);
  assert.deepEqual(socialPlanCandidates(state), [], "held founders cannot be scheduled elsewhere");
  const reader = coerceSession({ id: "gathering", openingReader: true, startedAt: "2020-01-01T00:00:00Z" });
  assert.equal(coerceSession(reader).openingReader, true);
}

{
  let state = world(1);
  const proposal = bindOpeningRenovation(
    {
      ...state.opening!.proposals[0],
      kind: "renovation",
      name: "Reading corner",
      renovation: {
        venueId: "community",
        spaceId: "room",
        slot: 0,
        title: "Reading corner",
        description: "Add a small reading corner",
      },
    },
    state.venues,
  );
  state.opening!.proposals = [proposal];
  state.opening!.reveals = [
    { residentId: "a", sceneId: "intro", submissionId: "greeting", lineId: "pitch", quote: "The reading corner" },
  ];
  const before = JSON.stringify(state.venues);
  const service = createProjectLifecycle({
    mutateVillageState: async (change) => {
      const next = structuredClone(state);
      change(next);
      state = next;
      return state;
    },
    draftNewVenueProject,
    draftRenovationProject,
    outsideVenueOperation: () => {},
    preparePrivateSpaces: async () => {},
    villagesDebugAgentsEnabled: () => false,
    loadProjectWishProgress: async () => ({ processProjectWishOutbox: async () => {} }),
  } as ProjectLifecyclePorts);
  await service.decideOpeningProposal({ openingId: "opening", action: "accept", residentId: "a" });
  await service.decideOpeningProposal({ openingId: "opening", action: "accept", residentId: "a" });
  assert.equal(state.projects.length, 1);
  assert.equal(state.projects[0].kind, "renovation");
  assert.equal(state.projects[0].requesterCharacterId, "a");
  assert.equal(state.projects[0].opening!.durationMs, 43_200_000);
  assert.equal(JSON.stringify(state.venues), before, "acceptance creates no physical change");
  assert.equal(state.projects[0].lifecycle!.change!.improvement!.extraBeds, 0);
  assert.equal(ordinaryProjectsLocked(state), true);
  const changed = structuredClone(state.venues);
  changed[0].zones![1].state.updatedAt = new Date().toISOString();
  assert.ok(openingRenovationDraft(proposal, changed), "timestamp churn is not a structural change");
  changed[0].improvements = [{ title: "Occupied slot" } as any, null];
  assert.throws(() => openingRenovationDraft(proposal, changed), /no longer available|changed/);
  assert.equal(JSON.stringify(openingView(state)).includes("sourceFingerprint"), false);
  state.projects[0].lifecycle!.workOrder = {
    startsAt: new Date().toISOString(),
    completesAt: new Date().toISOString(),
    pausedAt: "",
    remainingMs: 0,
  };
  reconcileOpening(state);
  assert.equal(ordinaryProjectsLocked(state), false);
  delete state.projects[0].lifecycle!.workOrder;
  state.projects[0].status = "blocked";
  reconcileOpening(state);
  assert.equal(ordinaryProjectsLocked(state), false, "builder loss cannot re-lock ordinary Projects");
  assert.equal(coerceVillageState(state).opening!.ordinaryProjectsUnlocked, true);
}

console.log(
  "Guided opening: staged solitude, witnessed greetings, compatibility, modest renovation and persistent unlock passed.",
);
