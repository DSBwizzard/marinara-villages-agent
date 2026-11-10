// Test cases: narration-residence/request, narration-residence/decisions, narration-residence/authority, narration-residence/stale, narration-residence/venue-request, narration-residence/replay, narration-residence/same-response, narration-residence/private-room
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture as projectFixture, venue as homeFixture } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { narrationResidencePrompt } from "../packages/villages/src/server/domain/rules/narration-residence.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { requestResidenceMove } from "../packages/villages/src/server/domain/rules/residence-move.js";
import { createVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot-service.js";
const at = "2026-11-09T18:00:00.000Z";
function fixture() {
  const state = projectFixture().state(),
    venue = state.venues[0],
    home = homeFixture("home", "residence");
  for (const actor of state.villagers)
    Object.assign(actor.cardSnapshot, {
      description: "A resident.",
      personality: "",
      systemPrompt: "",
      scenario: "",
      backstory: "",
      appearance: "",
      exampleDialogue: "",
      comment: "",
    });
  home.zones!.find((zone) => zone.id === "common")!.description = "PRIVATE BEDROOM CONTENTS MUST NOT BE IN PROMPT";
  state.venues.push(home);
  const participants = state.villagers.map((actor) => ({
    characterId: actor.characterId,
    name: actor.characterId,
    doing: "Talking",
  }));
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "housing-scene",
      villageSeed: state.seed,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: "common",
      sceneRevision: 1,
      status: "active",
      startedAt: at,
      lastActivityAt: at,
      activeIds: participants.map((row) => row.characterId),
      participants,
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(venue),
        occupants: participants.map((row) => ({ ...row, zoneId: "common" })),
      },
    }),
    venue,
  );
  function prepare(command: Record<string, unknown>, speaker = "b", operation = "request") {
    const context = narrationContinuityContext(state, scene, venue, operation, "Please discuss the request.", at);
    const readset = fittedNarrationReadset(
      state,
      context,
      context.parts.map((part) => part.block.evidenceId!),
    );
    assert(!narrationResidencePrompt(readset.residence).includes("PRIVATE BEDROOM"));
    const raw: any = {
      segments: [
        {
          id: "said",
          kind: "dialogue",
          speakerId: speaker,
          text: "I make this exact native request or decision.",
          requires: ["act"],
        },
      ],
      commands: [{ ...command, id: "act", at: "said", source: [{ segment: "said" }] }],
    };
    return {
      raw,
      readset,
      accept: () => acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, operation + "-turn", at),
    };
  }
  function pending() {
    requestResidenceMove(state, "b", "home", "villager", "", "move-request", new Date(at));
  }
  return { state, home, prepare, pending };
}
await runCase("narration-residence/request", () => {
  const f = fixture(),
    turn = f.prepare({ type: "residence.request", by: "b", venue: "home" });
  assert.equal(turn.accept().held, false);
  const move = f.state.residences.find((move) => move.characterId === "b")!;
  assert.equal(move.status, "pending");
  assert.deepEqual(move.agreement!.approvals, { b: true });
  assert(!f.state.venues.find((venue) => venue.id === "home")!.residentIds!.includes("b"));
  assert.equal(f.state.episodes.records[0].commandReceipts[0].kind, "residence");
});
await runCase("narration-residence/decisions", () => {
  const f = fixture();
  f.pending();
  assert.equal(
    f.prepare({ type: "residence.decide", by: "a", person: "b", venue: "home", approved: true }, "a").accept().held,
    false,
  );
  const move = f.state.residences.find((move) => move.characterId === "b")!;
  assert.equal(move.status, "moving");
  assert.equal(Date.parse(move.completesAt!) - Date.parse(at), 86_400_000);
  assert(!f.state.venues.find((venue) => venue.id === "home")!.residentIds!.includes("b"));
  const g = fixture();
  g.pending();
  assert.equal(
    g.prepare({ type: "residence.decide", by: "b", person: "b", venue: "home", approved: false }).accept().held,
    false,
  );
  assert.equal(g.state.residences.length, 0, "refusal unilaterally cancels the move");
});
await runCase("narration-residence/authority", () => {
  for (const kind of ["outsider", "speaker", "private", "unknown", "unapproved"]) {
    const f = fixture();
    f.pending();
    const by = kind === "outsider" ? "c" : "a",
      turn = f.prepare(
        { type: "residence.decide", by, person: "b", venue: kind === "unknown" ? "unknown" : "home", approved: true },
        kind === "speaker" ? "b" : by,
      );
    if (kind === "private")
      turn.raw.commands[0].source = [{ input: "Please discuss the request.", ground: { kind: "private" } }];
    if (kind === "unapproved") delete turn.raw.commands[0].approved;
    const before = memoryHash(f.state);
    assert.equal(turn.accept().held, true, kind);
    assert.equal(memoryHash(f.state), before);
  }
});
await runCase("narration-residence/stale", () => {
  for (const kind of ["request", "capacity", "ban"]) {
    const f = fixture();
    f.pending();
    const turn = f.prepare({ type: "residence.decide", by: "a", person: "b", venue: "home", approved: true }, "a");
    if (kind === "request") f.state.residences[0].agreement!.requestId = "replacement-request";
    if (kind === "capacity") f.home.residenceCapacity = 1;
    if (kind === "ban")
      f.home.access!.bans.push({
        id: "ban",
        visitorId: "b",
        zoneId: null,
        issuerId: "a",
        active: true,
        createdAt: at,
        sourceLineIds: [],
      } as any);
    const before = memoryHash(f.state);
    assert.equal(turn.accept().held, true, kind);
    assert.equal(memoryHash(f.state), before);
  }
  const f = fixture(),
    turn = f.prepare({ type: "residence.request", by: "b", venue: "home" });
  f.home.residenceCapacity = 1;
  assert.equal(turn.accept().held, true, "a captured vacancy cannot survive a capacity change");
});
await runCase("narration-residence/venue-request", async () => {
  const f = fixture(),
    turn = f.prepare({ type: "venue.request", by: "b", name: "Tea workshop", classes: ["workplace"] });
  assert.equal(turn.accept().held, false);
  assert.equal(f.state.pendingDecisions.length, 1);
  assert.equal(f.state.pendingDecisions[0].requesterCharacterId, "b");
  assert(
    !f.state.venues.some((venue) => venue.name === "Tea workshop"),
    "a request does not establish a Venue or service",
  );
  const duplicate = f.prepare(
    { type: "venue.request", by: "b", name: "Tea workshop", classes: ["workplace"] },
    "b",
    "duplicate",
  );
  duplicate.raw.commands[0].independent = true;
  delete duplicate.raw.segments[0].requires;
  const result = duplicate.accept();
  assert.equal(result.held, false);
  assert.equal(result.episode!.commandReceipts.length, 0);
  assert.equal(f.state.pendingDecisions.length, 1);
  for (const classes of [["invented-service"], ["workplace", "workplace"]]) {
    const g = fixture();
    assert.equal(g.prepare({ type: "venue.request", by: "b", name: "Tea workshop", classes }).accept().held, true);
    assert.equal(g.state.pendingDecisions.length, 0);
  }
  const g = fixture(),
    privateTurn = g.prepare({ type: "venue.request", by: "b", name: "Secret teahouse", classes: ["workplace"] });
  privateTurn.raw.segments[0].text = "PRIVATE ONLY: I ask for the secret teahouse.";
  privateTurn.raw.segments[0].delivery = "whisper";
  privateTurn.raw.segments[0].targetId = "a";
  assert.equal(privateTurn.accept().held, true);
  assert.equal(g.state.pendingDecisions.length, 0);
  privateTurn.raw.commands[0].independent = true;
  delete privateTurn.raw.segments[0].requires;
  assert.equal(privateTurn.accept().held, false);
  const snapshot = await createVillageSnapshot({
    readVillageState: async () => g.state,
    listVillagerCards: async () => g.state.villagers.map((row) => row.cardSnapshot),
    rollActiveAgendas: async () => false,
    sceneQueries: () => ({ activeVenueSession: async () => null }),
    backgroundWorkSummaries: async () => [],
    privatePreparationRooms: () => [],
  } as any).buildVillageSnapshot(new Date(at));
  assert.deepEqual(snapshot.venueRequests, []);
  assert(
    !JSON.stringify(snapshot).includes("PRIVATE ONLY"),
    "an unheard whisper never reaches ordinary Venue Requests",
  );
});
await runCase("narration-residence/replay", () => {
  const f = fixture();
  f.pending();
  const turn = f.prepare({ type: "residence.decide", by: "a", person: "b", venue: "home", approved: true }, "a");
  assert.equal(turn.accept().held, false);
  const completedAt = f.state.residences[0].completesAt;
  f.state.villagers = [];
  f.state.venues = [];
  const before = memoryHash(f.state);
  assert.equal(turn.accept().held, false);
  assert.equal(memoryHash(f.state), before);
  assert.equal(f.state.residences[0].completesAt, completedAt);
  assert.equal(f.state.episodes.records.length, 1);
});
await runCase("narration-residence/same-response", () => {
  function turn() {
    const f = fixture(),
      request = f.prepare({ type: "residence.request", by: "b", venue: "home" });
    request.raw.segments.push({
      id: "agreed",
      kind: "dialogue",
      speakerId: "a",
      text: "I agree to your request for our shared sleeping room.",
      requires: ["approval"],
    });
    request.raw.commands.push({
      id: "approval",
      type: "residence.decide",
      by: "a",
      person: "b",
      venue: "home",
      approved: true,
      at: "agreed",
      source: [{ segment: "agreed" }],
      requires: ["act"],
    });
    return { ...f, ...request };
  }
  const f = turn(),
    result = f.accept();
  assert.equal(result.held, false);
  assert.equal(f.state.residences[0].status, "moving");
  assert.equal(result.episode!.commandReceipts.length, 2);
  const missing = turn();
  delete missing.raw.commands[1].requires;
  assert.equal(missing.accept().held, true);
  assert.equal(missing.state.residences.length, 0);
  const unheard = turn();
  unheard.raw.segments[0].delivery = "whisper";
  unheard.raw.segments[0].targetId = "player";
  assert.equal(unheard.accept().held, true, "a cannot approve a request she did not hear");
  assert.equal(unheard.state.residences.length, 0);
  const dropped = turn();
  dropped.raw.commands[0].venue = "missing";
  for (const command of dropped.raw.commands) command.independent = true;
  for (const segment of dropped.raw.segments) delete segment.requires;
  const accepted = dropped.accept();
  assert.equal(accepted.held, false);
  assert.equal(accepted.episode!.commandReceipts.length, 0);
  assert.equal(dropped.state.residences.length, 0, "a dropped request cannot leak a dependent approval");
});
await runCase("narration-residence/private-room", () => {
  const f = fixture(),
    common = f.home.zones!.find((zone) => zone.id === "common")!;
  common.connectedTo = [...common.connectedTo!, "blue", "green"];
  for (const id of ["blue", "green"])
    f.home.zones!.push({
      ...structuredClone(common),
      id,
      name: id + " bedroom",
      kind: "private-residence",
      connectedTo: ["common"],
      description: "PRIVATE ROOM CONTENTS " + id,
    });
  requestResidenceMove(f.state, "b", "home", "villager", "blue", "private-request", new Date(at));
  const turn = f.prepare({ type: "residence.decide", by: "a", person: "b", venue: "home", approved: true }, "a");
  const prompt = narrationResidencePrompt(turn.readset.residence);
  assert(prompt.includes("blue bedroom"));
  assert(prompt.includes("private-residence"));
  assert(!prompt.includes("green bedroom"));
  assert(!prompt.includes("PRIVATE ROOM CONTENTS"));
  assert.deepEqual(turn.readset.residence.requests[0].householdIds, ["a"]);
  assert.equal(turn.accept().held, false);
  assert.equal(f.state.residences[0].agreement!.sleepZoneId, "blue");
});
