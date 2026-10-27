import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { parsePlace } from "../packages/villages/src/server/domain/rules/founding-record.js";
import {
  finishConstruction,
  projectFor,
} from "../packages/villages/src/server/domain/rules/project-lifecycle-rules.js";
import { approvalScope, projectDesignKey } from "../packages/villages/src/server/domain/rules/project-terms.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  assertResidencePrivateDestination,
  readBaseVenueLayout,
} from "../packages/villages/src/server/domain/rules/venue-layout.js";
import { defaultVenueSpace, venueCapacity } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  canOccupyZone,
  chooseAgendaZone,
  legacyZoneId,
  synchronizeVenueZones,
} from "../packages/villages/src/server/domain/rules/venue-zones.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import {
  createNewVenueProject as createNewVenueProjectRaw,
  createRenovationProject as createRenovationProjectRaw,
  draftRenovationProject,
  placeNewVenueProject as placeNewVenueProjectRaw,
  saveProjectPlan,
  startProjectConstruction,
} from "../packages/villages/src/server/features/projects/project-lifecycle.js";
import { removeVillager } from "../packages/villages/src/server/features/residents/resident-roster.js";
import {
  completeVillageResidence,
  decideVillageResidence,
  movePlayerToResidence,
  proposeVillageResidence,
} from "../packages/villages/src/server/features/venues/residences.js";
import { mutateVillageState, readVillageState } from "../packages/villages/src/server/features/world/village-store.js";
import { privatePreparationKey } from "../packages/villages/src/server/jobs/private-space-preparation.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";

import type { VillageVenue } from "../packages/villages/src/server/domain/models/world.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";

function draft(layout: string, role = "residence", owner = "a") {
  return {
    id: "venue:" + layout + ":" + role + ":" + owner,
    layoutVersion: 1,
    layout,
    name: "Venue " + layout,
    form: "A tent or sleeping mat under a tree",
    classes: [role],
    description: "An approachable spot under a tree.",
    presentation: { image: null, x: 0.2, y: 0.3 },
    occupancy: {
      playerHome: owner === "player",
      residentCharacterId: owner === "player" ? null : owner || null,
      homeKind: null,
    },
    spaces:
      layout === "common" || layout === "both"
        ? [
            {
              ...defaultVenueSpace(role as "residence", "An unfurnished Common Space."),
              name: "Common Space",
              purpose: "Everyday activities",
            },
          ]
        : [],
    privateSpaces:
      layout === "private" || layout === "both"
        ? [
            {
              ...defaultVenueSpace(role as "residence"),
              id: "personal",
              ownerId: owner,
              name: "Private Space",
              purpose: "A sleeping chamber occupying the selected interior",
              controllerIds: role === "other" || role === "community" ? ["a"] : [],
            },
          ]
        : [],
  };
}
function place(layout: string, role = "residence", owner = "a"): VillageVenue {
  const source = draft(layout, role, owner);
  const zones = readBaseVenueLayout(source, [role as "residence"], owner, () => null);
  const parsed = { ...parsePlace(source, false), zones };
  initializeVenueAccess(parsed);
  return coerceVillageState({ ...defaultVillageState(), version: 6, wishSystemVersion: 3, venues: [parsed] })
    .venues[0]!;
}
for (const layout of ["exterior", "common", "private", "both"]) {
  for (const role of ["residence", "workplace", "community", "other"]) {
    const venue = place(layout, role, role === "residence" ? "a" : "");
    const expected =
      1 + Number(layout === "common" || layout === "both") + Number(layout === "private" || layout === "both");
    assert.equal(venue.zones!.length, expected, `${role} ${layout} creates only selected Zones`);
    let saved = coerceVillageState({ ...defaultVillageState(), version: 6, wishSystemVersion: 3, venues: [venue] });
    for (let pass = 0; pass < 3; pass++) {
      const before = structuredClone(saved);
      saved = coerceVillageState(saved);
      assert.deepEqual(saved.venues, before.venues, "explicit absence survives repeated loading");
      synchronizeVenueZones(saved.venues[0]!, structuredClone(saved.venues[0]!));
      assert.equal(saved.venues[0]!.zones!.length, expected);
    }
  }
}
assert.throws(() => parsePlace({ ...draft("common"), layout: undefined }, true), /Choose the venue layout/);
assert.throws(() => parsePlace({ ...draft("exterior"), layoutVersion: undefined }, true), /Choose the venue layout/);
assert.throws(() => parsePlace({ ...draft("both"), spaces: [] }, true), /matching its selected layout/);
assert.throws(
  () =>
    parsePlace(
      { ...draft("common"), spaces: [{ ...defaultVenueSpace("residence"), name: "Room", purpose: "Meals" }] },
      true,
    ),
  /visible Zone/,
);
assert.throws(
  () =>
    parsePlace(
      { ...draft("private"), privateSpaces: [...draft("private").privateSpaces, ...draft("private").privateSpaces] },
      true,
    ),
  /distinct ID/,
);
const privateOnly = place("private");
assert.equal(chooseAgendaZone(privateOnly, "a", "Sleep").id, "personal");
assert.equal(legacyZoneId(privateOnly, "private", "residence", "a"), "personal");
assert.equal(
  canOccupyZone(
    privateOnly,
    privateOnly.zones!.find((zone) => zone.id === "personal")!,
    "b",
  ),
  false,
);
assert.equal(chooseAgendaZone(place("exterior"), "a", "Sleep").id, "exterior");
assert.equal(chooseAgendaZone(place("common"), "a", "Sleep").kind, "shared-residence");
const vacant = place("private", "residence", "");
assert.equal(
  vacant.zones!.find((zone) => zone.kind === "private-residence")!.preparation?.status,
  "pending",
  "vacant rooms prepare neutral interiors",
);
assert.equal(canOccupyZone(vacant, vacant.zones![1]!, "a"), false);
const initial = defaultVillageState();
initial.foundedAt = initial.setupAt = new Date().toISOString();
initial.maps = [
  {
    id: "map-house",
    name: "QA Village",
    artwork: { id: "map-art", ref: "global-gallery:map-art", url: "/map.png" },
    width: 1500,
    height: 1000,
    view: { fit: "cover", focusX: 50, focusY: 50, zoom: 1 },
    revision: 1,
  },
];
initial.venues = [privateOnly, place("exterior", "residence", "b"), vacant];
initial.venues[0]!.zones![1]!.description = "A secret journal and old furnishings.";
initial.venues[0]!.zones![1]!.state.items = ["Personal hammock"];
initial.venues[0]!.zones![1]!.state.condition = "Fixed hammock hooks remain anchored to the beams.";
initial.venues[0]!.zones![1]!.state.publicFacts = ["A personal secret"];
initial.villagers = coerceVillageState({
  ...defaultVillageState(),
  version: 6,
  wishSystemVersion: 3,
  villagers: [
    {
      characterId: "a",
      cardSnapshot: {
        id: "a",
        name: "Ada",
        revision: 1,
        sourceStatus: "available",
        capturedAt: new Date().toISOString(),
      },
    },
    {
      characterId: "b",
      cardSnapshot: {
        id: "b",
        name: "Bram",
        revision: 1,
        sourceStatus: "available",
        capturedAt: new Date().toISOString(),
      },
    },
  ],
}).villagers;
// Neutral preparation is a separate model job; this fixture completes it before testing moves.
assert.throws(() => assertResidencePrivateDestination(initial, vacant, "b", "personal"), /no longer vacant/);
vacant.zones!.find((zone) => zone.id === "personal")!.preparation!.status = "ready";
const state = coerceVillageState(initial);
assertResidencePrivateDestination(state, vacant, "b", "personal");
assert.throws(() => assertResidencePrivateDestination(state, privateOnly, "b", "personal"), /no longer vacant/);
const legacy = structuredClone(privateOnly);
delete legacy.layoutVersion;
const preserved = coerceVillageState({ ...defaultVillageState(), version: 6, wishSystemVersion: 3, venues: [legacy] })
  .venues[0]!;
assert.equal(preserved.zones!.find((zone) => zone.id === "personal")!.description, privateOnly.zones![1]!.description);
const records = new Map<string, any>();
records.set("villages-village", { id: "villages-village", kind: "village", data: state, revision: 1 });
const release = configureVillagesRuntime({
  projectId: "layout-fixture",
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: {
    async listCharacters() {
      return [];
    },
  },
  persistence: {
    documents: villageFixtureDocuments({
      async getById(_p: string, id: string) {
        return records.get(id) ?? null;
      },
      async list(_p: string, kind: string) {
        return [...records.values()].filter((row) => row.kind === kind);
      },
      async create(input: any) {
        const row = { ...input, revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const old = records.get(input.id);
        if (!old || old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...input, revision: old.revision + 1 };
        records.set(input.id, row);
        return row;
      },
    }),
  },
} as Parameters<typeof configureVillagesRuntime>[0]);
async function createRenovationProject(venueId: string, value: any) {
  return createRenovationProjectRaw(venueId, { ...value, requestId: crypto.randomUUID() });
}
async function createNewVenueProject(value: any) {
  return createNewVenueProjectRaw({ ...value, requestId: crypto.randomUUID() });
}
async function placeNewVenueProject(id: string, value: any) {
  const project = (await readVillageState({ memories: true })).projects.find((project) => project.id === id)!;
  return placeNewVenueProjectRaw(id, {
    ...value,
    requestId: crypto.randomUUID(),
    expectedRevision: project.lifecycle!.revision,
    mapId: initial.maps[0].id,
    expectedMapRevision: (await readVillageState({ memories: true })).maps[0].revision,
  });
}
async function finish(id: string, body: any = {}) {
  let project = (await readVillageState({ memories: true })).projects.find((project) => project.id === id)!;
  if (project.kind === "new-venue")
    await saveProjectPlan(id, {
      ...body,
      requestId: crypto.randomUUID(),
      expectedRevision: project.lifecycle!.revision,
    });
  await mutateVillageState((state) => {
    const project = state.projects.find((project) => project.id === id)!,
      flow = project.lifecycle!;
    flow.candidates.push({
      residentId: "a",
      evidenceId: "fixture-lead",
      scope: projectDesignKey(project),
      at: new Date().toISOString(),
    });
    flow.builderId = "a";
    if (flow.change) {
      const venue = state.venues.find((venue) => venue.id === project.venueId)!;
      flow.approvals = flow.affectedIds.map((residentId) => ({
        residentId,
        source: "conversation",
        evidenceId: "fixture-consent",
        scope: approvalScope(venue, flow.change!, residentId, flow.changedZoneIds),
        at: new Date().toISOString(),
      }));
    }
  });
  project = (await readVillageState({ memories: true })).projects.find((project) => project.id === id)!;
  await startProjectConstruction(id, { requestId: crypto.randomUUID(), expectedRevision: project.lifecycle!.revision });
  await mutateVillageState((state) => finishConstruction(state, projectFor(state, id), new Date().toISOString()), {
    memories: true,
  });
  assert.equal(
    (await readVillageState({ memories: true })).projects.find((project) => project.id === id)!.status,
    "complete",
  );
}
async function main() {
  try {
    await proposeVillageResidence("b", vacant.id, "player", "", "personal");
    await decideVillageResidence("b", true, "villager");
    await completeVillageResidence("b", true, new Date(), false);
    let current = await readVillageState({ memories: true });
    let destination = current.venues.find((venue) => venue.id === vacant.id)!;
    assert.equal(destination.zones!.find((zone) => zone.id === "personal")!.ownerId, "b");
    assert.equal(destination.zones!.length, 2, "move assigns the existing physical area without adding rooms");
    // Move to an exterior-only home; archive personal history while leaving its room vacant.
    const outside = current.venues.find((venue) => venue.id === initial.venues[1]!.id)!;
    await proposeVillageResidence("a", outside.id, "player", "", "");
    await decideVillageResidence("a", true, "villager");
    await completeVillageResidence("a", true, new Date(), false);
    current = await readVillageState({ memories: true });
    const old = current.venues.find((venue) => venue.id === privateOnly.id)!;
    assert.equal(old.zones!.find((zone) => zone.id === "personal")!.ownerId, undefined);
    assert.deepEqual(old.zones!.find((zone) => zone.id === "personal")!.state.items, []);
    assert.equal(
      old.zones!.find((zone) => zone.id === "personal")!.state.condition,
      "Fixed hammock hooks remain anchored to the beams.",
    );
    assert.deepEqual(old.archivedPrivateSpaces![0]!.space.state.items, ["Personal hammock"]);
    assert.match(old.archivedPrivateSpaces![0]!.space.description, /secret journal/);
    assert.deepEqual(
      current.venues.find((venue) => venue.id === outside.id)!.zones!.map((zone) => zone.kind),
      ["exterior"],
    );
    assert.equal(venueCapacity(outside), 1);
    // A reviewed capacity change needs no new room.
    await createRenovationProject(outside.id, {
      title: "Another mat",
      detail: "Room for two sleeping mats outside",
      capacity: 2,
    });
    current = await readVillageState({ memories: true });
    let project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState({ memories: true });
    assert.equal(venueCapacity(current.venues.find((venue) => venue.id === outside.id)!), 2);
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 1);
    // Add and remove a base Common Space through reviewed structural terms.
    await createRenovationProject(outside.id, {
      title: "Add shelter",
      detail: "A communal shelter",
      zones: [
        {
          id: "common:shelter",
          connectedTo: ["exterior"],
          name: "Common Space",
          kind: "shared-residence",
          venueClass: "residence",
          description: "A shared canvas shelter",
        },
      ],
    });
    current = await readVillageState({ memories: true });
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState({ memories: true });
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 2);
    await createRenovationProject(outside.id, {
      title: "Remove shelter",
      detail: "Return to open-air camping",
      zones: [],
    });
    current = await readVillageState({ memories: true });
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState({ memories: true });
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 1);
    assert.ok(
      current.venues
        .find((venue) => venue.id === outside.id)!
        .archivedZones!.some((entry) => entry.zone.id === "common:shelter"),
    );
    // Preserve undiscovered text without placing it into a public project draft.
    const proposalState = structuredClone(current);
    const target = proposalState.venues.find((venue) => venue.id === vacant.id)!;
    target.zones![1]!.description = "Unseen personal secret";
    const proposal = draftRenovationProject(proposalState, target.id, {
      detail: "Improve structure",
      zones: target.zones!.filter((zone) => zone.kind !== "exterior").map((zone) => ({ ...zone, description: "" })),
    });
    assert.equal(proposal.lifecycle!.change!.zones![0]!.description, "");
    assert.equal(proposal.lifecycle!.change!.zones![0]!.preserveDescription, true);
    assert.equal(
      villageSettings(proposalState, { name: "Player", personaAvailable: false } as never, null).venues.find(
        (venue) => venue.id === target.id,
      )!.zones![1]!.description,
      "",
    );
    await createRenovationProject(outside.id, {
      title: "Base sleeping nook",
      detail: "Add an assigned residential Private Space",
      zones: [
        {
          id: "private:nook",
          connectedTo: ["exterior"],
          name: "Sleeping nook",
          kind: "private-residence",
          venueClass: "residence",
          ownerId: "a",
          description: "",
          purpose: "A partitioned sleeping area",
        },
      ],
    });
    current = await readVillageState({ memories: true });
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState({ memories: true });
    assert.equal(
      current.venues.find((venue) => venue.id === outside.id)!.zones!.find((zone) => zone.id === "private:nook")!
        .ownerId,
      "a",
    );
    await assert.rejects(
      createRenovationProject(outside.id, { title: "Occupied nook", detail: "Remove the occupied room", zones: [] }),
      /Move residents/,
    );
    // Simulate the completed departure already covered by the move assertions above.
    await mutateVillageState((record) => {
      delete record.venues.find((venue) => venue.id === outside.id)!.zones!.find((zone) => zone.id === "private:nook")!
        .ownerId;
    });
    await createRenovationProject(outside.id, {
      title: "Remove nook",
      detail: "Restore exterior-only residence",
      zones: [],
    });
    current = await readVillageState({ memories: true });
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState({ memories: true });
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 1);
    assert.ok(
      current.venues
        .find((venue) => venue.id === outside.id)!
        .archivedZones!.some((entry) => entry.zone.id === "private:nook"),
    );
    await createRenovationProject(outside.id, {
      title: "Extra tent chamber",
      detail: "Add a vacant Private Space",
      zones: [
        {
          id: "chamber",
          name: "Vacant chamber",
          connectedTo: ["exterior"],
          description: "",
          purpose: "Sleeping chamber",
          kind: "private-residence",
          venueClass: "residence",
        },
      ],
    });
    current = await readVillageState({ memories: true });
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState({ memories: true });
    const expanded = current.venues.find((venue) => venue.id === outside.id)!;
    const chamber = expanded.zones!.find((zone) => zone.kind === "private-residence")!;
    assert.equal(chamber.ownerId, undefined);
    assert.equal(chamber.preparation?.status, "pending");
    assert.equal(venueCapacity(expanded), 2);
    // The room stays closed during neutral preparation; later checks use a completed synthetic job.
    assert.throws(() => assertResidencePrivateDestination(current, expanded, "player", chamber.id), /no longer vacant/);
    chamber.preparation!.status = "ready";
    await mutateVillageState((record) => {
      for (const venue of record.venues)
        for (const zone of venue.zones ?? [])
          if (zone.preparation?.status === "pending") zone.preparation.status = "ready";
    });
    assert.equal(
      canOccupyZone(expanded, chamber, "a"),
      false,
      "Residence alone does not give management of a vacant personal Zone.",
    );
    assert.equal(canOccupyZone(expanded, chamber, expanded.access!.managerIds[0]), true);
    const reserved = structuredClone(current);
    reserved.residences.push({
      characterId: "b",
      venueId: vacant.id,
      proposedVenueId: outside.id,
      proposedPrivateZoneId: chamber.id,
      status: "moving",
    } as never);
    assert.throws(() => assertResidencePrivateDestination(reserved, expanded, "player", chamber.id), /reserved/);
    const changedLayout = structuredClone(expanded);
    changedLayout.zones!.push({ ...chamber, id: "another", ownerId: undefined });
    assert.notEqual(privatePreparationKey(expanded, chamber), privatePreparationKey(changedLayout, chamber));
    // An unoccupied Residence can be assigned directly.
    await movePlayerToResidence(privateOnly.id, "personal");
    current = await readVillageState({ memories: true });
    assert.equal(current.venues.find((venue) => venue.id === privateOnly.id)!.zones![1]!.ownerId, "player");
    assert.equal(
      current.venues.find((venue) => venue.id === privateOnly.id)!.zones![1]!.state.condition,
      "Fixed hammock hooks remain anchored to the beams.",
    );
    await assert.rejects(movePlayerToResidence(outside.id, chamber.id), /shared Residence/);
    current = await readVillageState({ memories: true });
    assert.equal(
      current.venues.find((venue) => venue.id === outside.id)!.zones!.find((zone) => zone.id === chamber.id)!.ownerId,
      undefined,
    );
    // Removing a vacant room archives the current room.
    await createRenovationProject(outside.id, {
      title: "Remove chamber",
      detail: "Remove the side tent",
      zones: [],
    });
    current = await readVillageState({ memories: true });
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState({ memories: true });
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 1);
    assert.ok(
      current.venues
        .find((venue) => venue.id === outside.id)!
        .archivedZones!.some((entry) => entry.zone.id === chamber.id),
    );
    await assert.rejects(proposeVillageResidence("b", outside.id, "player", "", chamber.id), /no longer vacant/);
    for (const layout of ["exterior", "common", "private", "both"]) {
      await createNewVenueProject({
        name: "New " + layout,
        venueClass: "residence",
        description: "A small camping place",
      });
      current = await readVillageState({ memories: true });
      project = current.projects.find(
        (project) => project.kind === "new-venue" && project.lifecycle?.phase !== "complete",
      )!;
      await placeNewVenueProject(project.id, {
        x: 0.4 + ["exterior", "common", "private", "both"].indexOf(layout) * 0.12,
        y: 0.5,
      });
      current = await readVillageState({ memories: true });
      project = current.projects.find((entry) => entry.id === project.id)!;
      const opening = draft(layout, "residence", "");
      await assert.rejects(
        finish(project.id, {
          form: "Tent",
          exteriorDescription: opening.description,
          interiorDescription: "An invented interior",
        }),
        /Define the Physical design, layout and Entrance/,
      );
      await finish(project.id, {
        ...opening,
        form: "Tent",
        exteriorDescription: opening.description,
        exteriorImage: null,
        interiorImage: null,
      });
      current = await readVillageState({ memories: true });
      project = current.projects.find((entry) => entry.id === project.id)!;
      destination = current.venues.find((venue) => venue.id === project.venueId)!;
      assert.equal(
        destination.zones!.length,
        1 + Number(layout === "common" || layout === "both") + Number(layout === "private" || layout === "both"),
      );
    }
    await removeVillager("b");
    current = await readVillageState({ memories: true });
    const departedHome = current.venues.find((venue) => venue.id === vacant.id)!;
    assert.equal(departedHome.occupancy.residentCharacterId, null);
    assert.equal(departedHome.zones!.find((zone) => zone.id === "personal")!.ownerId, undefined);
    assert.equal(departedHome.zones!.find((zone) => zone.id === "personal")!.preparation, undefined);
    assert.ok(departedHome.archivedPrivateSpaces!.some((entry) => entry.ownerId === "b"));
    console.log(
      "Villages optional layouts: founding, repeat loading, role access, capacity, moves, renovation removal, privacy, and new-venue opening passed.",
    );
  } finally {
    release();
  }
}
void main();
