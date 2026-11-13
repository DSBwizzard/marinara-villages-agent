// Test cases: narration-place/discovery, narration-place/existing, narration-place/evidence, narration-place/limits, narration-place/objective, narration-place/replay, narration-place/complete-witness
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { establishPlace, projectPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { readPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import { draftEstablishmentProject } from "../packages/villages/src/server/features/projects/project-drafts.js";
import { continuityViews } from "../packages/villages/src/server/domain/rules/continuity.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import { readContinuity } from "../packages/villages/src/server/domain/decoding/continuity-codec.js";
import { readEpisodes } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { assertContinuityRetention } from "../packages/villages/src/server/domain/rules/continuity-retention.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
const at = "2026-11-09T20:00:00.000Z";
const gardenParagraphs = ["Rows of old apple trees.", "Hidden paths lead to a private shed."];
const draft = {
  name: "Orchard",
  description: "An old orchard beside the river.",
  zones: [
    {
      id: "garden",
      name: "Garden",
      kind: "public",
      description: gardenParagraphs.join("\n\n"),
    },
  ],
};
function fixture() {
  const state = projectFixture().state(),
    venue = state.venues[0],
    participants = state.villagers.map((actor) => ({
      characterId: actor.characterId,
      name: actor.characterId,
      doing: "Talking",
    }));
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "place-scene",
      sceneRevision: 1,
      villageSeed: state.seed,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: "common",
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
  function prepare(command: Record<string, unknown>, operation = "discovery") {
    const input =
      command.type === "place.establish"
        ? "Tell me about the establishment project " + command.project + "."
        : "Tell me about the nearby orchard.";
    const context = narrationContinuityContext(state, scene, venue, operation, input, at),
      readset = fittedNarrationReadset(
        state,
        context,
        context.parts.map((part) => part.block.evidenceId!),
      );
    const raw: any = {
      segments: [
        {
          id: "seen",
          kind: "narration",
          text: "The host unfolds an accurate map and shows the nearby orchard.",
          requires: ["place"],
        },
      ],
      commands: [
        {
          ...command,
          id: "place",
          at: "seen",
          source: [{ segment: "seen", perceive: { kind: "seen", by: ["player", "a"] } }],
        },
      ],
    };
    return {
      raw,
      readset,
      accept: () => acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, operation + "-turn", at),
    };
  }
  function existing() {
    return establishPlace(state, draft, "orchard", state.maps[0].id, "prepared", at, true);
  }
  return { state, venue, scene, prepare, existing };
}
await runCase("narration-place/discovery", () => {
  const f = fixture(),
    before = memoryHash(f.venue),
    result = f.prepare({ type: "place.discover", place: draft }).accept();
  assert.equal(result.held, false);
  const receipt = result.episode!.commandReceipts[0],
    place = f.state.worldPlaces.places[receipt.targetId];
  assert.equal(receipt.kind, "discovery");
  assert.deepEqual(place.knownBy, ["player", "a"]);
  assert.equal(place.prepared, false);
  assert.deepEqual(place.location.classes, ["other"]);
  assert.equal(f.state.venues.length, 1);
  assert.equal(memoryHash(f.state.venues[0]), before, "discovery never constructs or edits the current Venue");
  for (const zone of place.location.zones!) {
    const views = currentRoomViews(
      f.state.continuity,
      f.state.episodes,
      { kind: "room", placeId: place.id, zoneId: zone.id },
      at,
    );
    assert.deepEqual(
      views.map((row) => row.version.text),
      zone.id === "garden" ? gardenParagraphs : [zone.description],
    );
  }
  assert.equal(
    projectPlace(f.state, place).zones!.find((zone) => zone.id === "garden")!.description,
    "",
    "unvisited remote room contents stay private",
  );
  const stored = JSON.parse(JSON.stringify(f.state.worldPlaces));
  assert.deepEqual(readPlaceRegistry(stored).places[place.id], stored.places[place.id]);
  for (const field of ["state", "exteriorState", "zone"]) {
    const malformed = structuredClone(stored);
    const location = malformed.places[place.id].location;
    if (field === "zone") location.zones[1].state = { recent: { text: "PRIVATE" } };
    else location[field] = { recent: { text: "PRIVATE" } };
    assert.throws(() => readPlaceRegistry(malformed), /Invalid saved Place/);
  }
});
await runCase("narration-place/existing", () => {
  const f = fixture(),
    place = f.existing();
  place.knownBy = ["a"];
  const turn = f.prepare({ type: "place.discover", existingId: place.id });
  assert.equal(turn.accept().held, false);
  assert.equal(Object.keys(f.state.worldPlaces.places).length, 1);
  assert(f.state.worldPlaces.places[place.id].knownBy.includes("player"));
  const stale = fixture(),
    target = stale.existing(),
    pending = stale.prepare({ type: "place.discover", existingId: target.id });
  target.revision++;
  const before = memoryHash(stale.state);
  assert.equal(pending.accept().held, true);
  assert.equal(memoryHash(stale.state), before);
});
await runCase("narration-place/evidence", () => {
  for (const kind of ["private", "sound", "historical", "unknown", "both", "service"]) {
    const f = fixture(),
      turn = f.prepare({ type: "place.discover", place: structuredClone(draft) });
    if (kind === "private")
      turn.raw.commands[0].source = [{ input: "Tell me about the nearby orchard.", ground: { kind: "private" } }];
    if (kind === "sound")
      turn.raw.commands[0].source = [{ segment: "seen", perceive: { kind: "sound-only", by: ["player"] } }];
    if (kind === "historical") turn.raw.commands[0].source = ["h:invented"];
    if (kind === "unknown") {
      delete turn.raw.commands[0].place;
      turn.raw.commands[0].existingId = "missing";
    }
    if (kind === "both") turn.raw.commands[0].existingId = "orchard";
    if (kind === "service") turn.raw.commands[0].place.classes = ["workplace"];
    const before = memoryHash(f.state);
    assert.equal(turn.accept().held, true, kind);
    assert.equal(memoryHash(f.state), before);
  }
});
await runCase("narration-place/limits", () => {
  for (const independent of [false, true]) {
    const f = fixture(),
      turn = f.prepare({ type: "place.discover", place: draft });
    for (let index = 1; index < 3; index++) {
      turn.raw.segments.push({
        id: "seen" + index,
        kind: "narration",
        text: "Another nearby Place is shown.",
        ...(index === 2 && independent ? {} : { requires: ["place" + index] }),
      });
      turn.raw.commands.push({
        id: "place" + index,
        type: "place.discover",
        place: { ...draft, name: "Orchard " + index },
        at: "seen" + index,
        source: [{ segment: "seen" + index, perceive: { kind: "seen", by: ["player"] } }],
        ...(index === 2 && independent ? { independent: true } : {}),
      });
    }
    const result = turn.accept();
    assert.equal(result.held, !independent);
    assert.equal(Object.keys(f.state.worldPlaces.places).length, independent ? 2 : 0);
    if (independent) assert.equal(result.episode!.commandReceipts.length, 2);
  }
});
await runCase("narration-place/objective", () => {
  function ready() {
    const f = fixture(),
      place = f.existing();
    place.location.presentation.x = 0.7;
    place.location.presentation.y = 0.7;
    const project = draftEstablishmentProject(
      f.state,
      place.id,
      {
        classes: ["community"],
        establishment: {
          goal: "Share the orchard with the village",
          physical: false,
          zoneIds: ["garden"],
          objectives: ["The host welcomes visitors to the orchard."],
        },
      },
      "orchard-project",
    );
    const turn = f.prepare({
      type: "place.establish",
      project: project.id,
      objective: "objective:0",
      quote: "The host welcomes visitors.",
      met: true,
    });
    turn.raw.segments[0].text = "The host welcomes visitors.";
    return { ...f, ...turn, project };
  }
  const f = ready(),
    result = f.accept();
  assert.equal(result.held, false);
  const project = f.state.projects[0];
  assert.equal(project.establishment!.objectives[0].met, true);
  assert.equal(f.accept().held, false);
  assert.equal(f.state.projects[0].establishment!.objectives[0].evidence.length, 1);
  assert.equal(project.status, "planning");
  assert.equal(project.lifecycle!.workOrder, null, "objective evidence never starts or completes the Project");
  assert.equal(f.state.venues.length, 1);
  for (const kind of ["stale", "quote", "private", "empty"]) {
    const g = ready();
    if (kind === "stale") g.project.lifecycle!.revision++;
    if (kind === "quote") g.raw.commands[0].quote = "A future promise that did not occur.";
    if (kind === "empty") g.raw.commands[0].quote = " \n ";
    if (kind === "private") g.raw.commands[0].source = [{ input: g.readset.source.input, ground: { kind: "private" } }];
    const before = memoryHash(g.state);
    assert.equal(g.accept().held, true, kind);
    assert.equal(memoryHash(g.state), before);
  }
});
await runCase("narration-place/replay", () => {
  const f = fixture(),
    turn = f.prepare({ type: "place.discover", place: draft });
  assert.equal(turn.accept().held, false);
  const count = f.state.episodes.records.length;
  f.state.villagers = [];
  f.state.maps = [];
  const before = memoryHash(f.state);
  assert.equal(turn.accept().held, false);
  assert.equal(memoryHash(f.state), before);
  assert.equal(f.state.episodes.records.length, count);
  assert.equal(Object.keys(f.state.worldPlaces.places).length, 1);
});
await runCase("narration-place/complete-witness", () => {
  const f = fixture(),
    turn = f.prepare({
      type: "place.discover",
      place: { ...draft, description: "The orchard is reached through a SECRET RIVER PATH." },
    });
  turn.raw.segments[0].text = "The Player alone sees the detailed map.";
  delete turn.raw.segments[0].requires;
  turn.raw.segments.push({
    id: "mention",
    kind: "dialogue",
    speakerId: "a",
    text: "There is an orchard nearby.",
    requires: ["place"],
  });
  turn.raw.commands[0].at = "mention";
  turn.raw.commands[0].source = [
    { segment: "seen", perceive: { kind: "seen", by: ["player"] } },
    { segment: "mention" },
  ];
  turn.raw.keep = [
    {
      id: "learn-player",
      for: ["player"],
      text: "The orchard is reached through a SECRET RIVER PATH.",
      source: ["native:place"],
      class: "information",
    },
    {
      id: "leak-a",
      for: ["a"],
      text: "The orchard is reached through a SECRET RIVER PATH.",
      source: ["native:place"],
      class: "information",
      independent: true,
    },
  ];
  const result = turn.accept();
  assert.equal(result.held, false);
  assert(result.rejected.some((row) => row.id === "leak-a"));
  const receipt = result.episode!.commandReceipts[0];
  assert.deepEqual(receipt.witnesses, ["player"]);
  assert.deepEqual(f.state.worldPlaces.places[receipt.targetId].knownBy, ["player"]);
  const continuity = readContinuity(JSON.parse(JSON.stringify(f.state.continuity)), f.state.seed),
    episodes = readEpisodes(JSON.parse(JSON.stringify(f.state.episodes)), f.state.seed);
  assertContinuityRetention(continuity, episodes);
  const player = continuityViews(continuity, continuityActor(f.state, "player")!, at, new Set()),
    a = continuityViews(continuity, continuityActor(f.state, "a")!, at, new Set());
  assert(player.some((view) => view.version.text.includes("SECRET RIVER PATH")));
  assert(!a.some((view) => view.version.text.includes("SECRET RIVER PATH")));
  assert.deepEqual(
    episodes.records.find((episode) => episode.id === result.episode!.id)!.commandReceipts[0].witnesses,
    ["player"],
    "cold native receipt keeps the complete-outcome audience",
  );
});
