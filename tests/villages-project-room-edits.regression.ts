// Test cases: project-room-edits/scoped-completion, project-room-edits/stale-and-reapproval, project-room-edits/preflight, project-room-edits/physical-establishment
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture, renovation, seedObservedProjectRoom } from "./fixtures/villages-projects.fixture.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import { continuityHolderKey, protectContinuity } from "../packages/villages/src/server/domain/rules/continuity.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { projectRoomEntries } from "../packages/villages/src/server/domain/rules/project-room-edits.js";
import { captureZoneObservation } from "../packages/villages/src/server/domain/rules/zone-observation.js";
import { observableRoomDescription } from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { projectDesignKey } from "../packages/villages/src/server/domain/rules/project-terms.js";
import {
  PROJECT_DURATION_MS,
  reconcileProjectLifecycles,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";

const now = new Date("2026-10-24T00:00:00Z"),
  at = now.toISOString();
const due = new Date(now.getTime() + PROJECT_DURATION_MS);
const room = { kind: "room" as const, placeId: "cafe", zoneId: "common" };
const key = continuityHolderKey(room);
const view = (state: VillageState) => currentRoomViews(state.continuity, state.episodes, room, at);
const entries = (state: VillageState) => projectRoomEntries(state, state.venues[0], room.zoneId, at);

function replace(state: VillageState, id: string, text: string, observed = false, witnesses: string[] = []) {
  const current = view(state).find((row) => row.id === id)!;
  retainNativeFact(
    state,
    {
      id: "fixture-change:" + id,
      kind: "structure",
      targetId: JSON.stringify([room.placeId, room.zoneId]),
      revision: 1,
      text,
      witnesses,
      observedBy: witnesses,
    },
    at,
    {
      room,
      roomChange: { target: { id, recordRevision: current.recordRevision, heads: { [key]: current.headRevision } } },
    },
  );
  if (observed) {
    const venue = state.venues[0],
      zone = venue.zones!.find((row) => row.id === room.zoneId)!;
    zone.observed = captureZoneObservation(venue, zone, observableRoomDescription(state, venue.id, zone.id, at));
  }
}

async function authored() {
  const f = fixture();
  await f.mutate((state) =>
    seedObservedProjectRoom(state, state.venues[0], room.zoneId, "A rough bench.\n\nA brass lamp.\n\nWorn curtains."),
  );
  return f;
}

await runCase("project-room-edits/scoped-completion", async () => {
  const f = await authored();
  const first = entries(f.state())![0];
  await f.mutate((state) => replace(state, first.id, first.text, true, ["b"]));
  const [bench, lamp, curtains] = entries(f.state())!;
  const planned = [
    { zoneId: room.zoneId, entryId: bench.id, version: bench.version, text: "A padded bench." },
    { zoneId: room.zoneId, entryId: curtains.id, version: curtains.version, text: null },
    { zoneId: room.zoneId, text: "A painted stool." },
  ];
  const id = await renovation(f, { roomEdits: planned });
  assert.deepEqual(f.get(id).lifecycle!.changedZoneIds, [room.zoneId]);
  assert(f.get(id).lifecycle!.roomBasis?.every((value) => /^[a-f0-9]{64}$/u.test(value)));
  assert(f.get(id).lifecycle!.change!.roomEdits?.every((row) => !Object.hasOwn(row, "version")));
  await f.agree(id);
  await f.mutate((state) => {
    replace(state, lamp.id, "A glass lantern.");
    const resident = continuityActor(state, "b")!,
      actorKey = continuityHolderKey(resident);
    const record = state.continuity.records.find((row) => row.id === bench.id)!;
    state.continuity = protectContinuity(
      state.continuity,
      { id: record.id, recordRevision: record.revision, heads: { [actorKey]: record.heads[actorKey].revision } },
      [resident],
      "forget-resident-sight",
      at,
      { forget: true },
    );
  });
  assert.equal(entries(f.state()), null, "an unobserved update never crosses the Room authoring read boundary");
  const unrelated = view(f.state()).find((row) => row.id === lamp.id);
  await f.service.startProjectConstruction(id, f.body(id), now);
  await f.mutate((state) => reconcileProjectLifecycles(state, due));
  assert.equal(f.get(id).status, "complete", f.get(id).lifecycle!.blockedReason);
  assert.deepEqual(
    view(f.state()).map((row) => row.version.text),
    ["A padded bench.", "A glass lantern.", "A painted stool."],
  );
  assert.deepEqual(
    view(f.state()).find((row) => row.id === lamp.id),
    unrelated,
  );
  assert.equal(view(f.state())[0].id, bench.id);
  assert.equal(
    f.state().venues[0].zones![1].observed?.description,
    "A rough bench.\n\nA brass lamp.\n\nWorn curtains.",
  );
  assert(!f.state().venues[0].zones![1].picture?.dirty);
  const saved = structuredClone(f.state().episodes);
  await f.mutate((state) => reconcileProjectLifecycles(state, due));
  assert.deepEqual(f.state().episodes, saved);
});

await runCase("project-room-edits/stale-and-reapproval", async () => {
  const f = await authored();
  const [bench] = entries(f.state())!;
  const proposal = { zoneId: room.zoneId, entryId: bench.id, version: bench.version, text: "A padded bench." };
  const id = await renovation(f, { roomEdits: [proposal] });
  await f.agree(id);
  await f.mutate((state) => replace(state, bench.id, "An oak sofa.", true));
  await assert.rejects(f.service.startProjectConstruction(id, f.body(id), now), /planned Room changed/);
  const saved = f.get(id).lifecycle!.change!;
  await f.service.reviseRenovationProject(
    id,
    f.body(id, {
      ...saved,
      roomEdits: [{ ...proposal, version: entries(f.state())![0].version }],
    }),
  );
  assert.equal(f.get(id).lifecycle!.approvals.length, 0);
  assert.equal(f.get(id).lifecycle!.candidates.length, 0);
  await f.agree(id);
  await f.service.startProjectConstruction(id, f.body(id), now);
  await f.mutate((state) => {
    const current = view(state)[0];
    state.continuity = protectContinuity(
      state.continuity,
      { id: current.id, recordRevision: current.recordRevision, heads: { [key]: current.headRevision } },
      [room],
      "forget-before-completion",
      at,
      { forget: true },
    );
    reconcileProjectLifecycles(state, due);
  });
  assert.equal(f.get(id).status, "paused");
  assert.match(f.get(id).lifecycle!.blockedReason, /planned Room changed/);
  assert(!view(f.state()).some((row) => row.version.text === proposal.text));
});

await runCase("project-room-edits/preflight", async () => {
  const f = await authored();
  const id = await renovation(f, { roomEdits: [{ zoneId: room.zoneId, text: "A brass lamp." }] });
  await f.agree(id);
  const before = structuredClone(f.state());
  await assert.rejects(f.service.startProjectConstruction(id, f.body(id), now), /duplicate current room description/);
  assert.deepEqual(f.state(), before, "preflight cannot start work or publish a trial receipt");
  const bad = structuredClone(f.state());
  bad.projects[0].lifecycle!.changedZoneIds = [];
  await assert.rejects(
    f.mutate((state) => Object.assign(state, bad)),
    /Invalid Project Room basis/,
  );
});

await runCase("project-room-edits/physical-establishment", async () => {
  const f = fixture();
  const placeId = "place:shed";
  await f.mutate((state) => {
    const place = establishPlace(
      state,
      {
        name: "Shed",
        description: "A bare approach.",
        zones: [{ id: "room", name: "Room", kind: "public", description: "A bare floor." }],
      },
      placeId,
      "map-projects",
      "authored-shed",
      state.setupAt,
      true,
    );
    place.location.presentation.x = 0.7;
    place.location.presentation.y = 0.7;
    seedObservedProjectRoom(state, place.location, "room", "A bare floor.\n\nA lattice window.");
  });
  const venue = f.state().worldPlaces.places[placeId].location;
  const [floor] = projectRoomEntries(f.state(), venue, "room", at)!;
  await f.service.createEstablishmentProject(placeId, {
    requestId: "repair-shed",
    classes: ["community"],
    detail: "Prepare a workshop",
    roomEdits: [{ zoneId: "room", entryId: floor.id, version: floor.version, text: "A level plank floor." }],
    establishment: { goal: "Shared workshop", physical: true, zoneIds: ["exterior", "room"], objectives: [] },
  });
  const id = f.state().projects[0].id;
  await f.mutate((state) => {
    const project = state.projects[0];
    project.lifecycle!.builderId = "a";
    project.lifecycle!.candidates.push({
      residentId: "a",
      incarnation: state.villagers[0].incarnation,
      at,
      scope: projectDesignKey(project),
      evidenceId: "spoken:repair-shed",
    });
  });
  await f.service.startProjectConstruction(id, f.body(id), now);
  await f.mutate((state) => reconcileProjectLifecycles(state, due));
  assert.equal(f.get(id).status, "complete", f.get(id).lifecycle!.blockedReason);
  assert(f.state().venues.some((row) => row.id === placeId));
  const result = currentRoomViews(
    f.state().continuity,
    f.state().episodes,
    { kind: "room", placeId, zoneId: "room" },
    at,
  );
  assert.deepEqual(
    result.map((row) => row.version.text),
    ["A level plank floor.", "A lattice window."],
  );
  assert.equal(result[0].id, floor.id, "promotion and the exact physical edit preserve Room identity");
});
