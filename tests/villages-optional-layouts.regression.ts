import assert from "node:assert/strict";
import { proposePlayerMove } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-mailbox.js";
import { privatePreparationKey } from "../packages/villages/src/engine/packages/server/src/services/villages/private-space-preparation.js";
import {
  coerceVillageState,
  defaultVillageState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  parsePlace,
  completeVillageResidence,
  proposeVillageResidence,
  decideVillageResidence,
  villageSettings,
  removeVillager,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";
import {
  defaultVenueSpace,
  venueCapacity,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.js";
import {
  chooseAgendaZone,
  canOccupyZone,
  synchronizeVenueZones,
  legacyZoneId,
} from "../packages/villages/src/engine/packages/server/src/services/villages/venue-zones.js";
import {
  draftRenovationProject,
  createRenovationProject,
  createNewVenueProject,
  placeNewVenueProject,
  openFinishedProject,
} from "../packages/villages/src/engine/packages/server/src/services/villages/project-lifecycle.js";
import { assertResidencePrivateDestination } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-layout.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import type { VillageVenue } from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";

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
        ? [defaultVenueSpace(role as "residence", "An unfurnished Common Space.")]
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
              controllerIds: role === "other" || role === "gathering" ? ["a"] : [],
            },
          ]
        : [],
  };
}
function place(layout: string, role = "residence", owner = "a"): VillageVenue {
  return coerceVillageState({ wishSystemVersion: 3, venues: [parsePlace(draft(layout, role, owner), true)] })
    .venues[0]!;
}
for (const layout of ["exterior", "common", "private", "both"]) {
  for (const role of ["residence", "workplace", "gathering", "other"]) {
    const venue = place(layout, role, role === "residence" ? "a" : "");
    const expected =
      1 + Number(layout === "common" || layout === "both") + Number(layout === "private" || layout === "both");
    assert.equal(venue.zones!.length, expected, `${role} ${layout} creates only selected Zones`);
    let saved = coerceVillageState({ wishSystemVersion: 3, venues: [venue] });
    for (let pass = 0; pass < 3; pass++) {
      const before = structuredClone(saved);
      saved = coerceVillageState(saved);
      assert.deepEqual(saved.venues, before.venues, "explicit absence survives repeated loading");
      synchronizeVenueZones(saved.venues[0]!, structuredClone(saved.venues[0]!));
      assert.equal(saved.venues[0]!.zones!.length, expected);
    }
  }
}
assert.throws(() => parsePlace({ ...draft("exterior"), layout: undefined }, true), /Choose the venue layout/);
assert.throws(() => parsePlace({ ...draft("exterior"), layoutVersion: undefined }, true), /Choose the venue layout/);
assert.throws(() => parsePlace({ ...draft("both"), spaces: [] }, true), /matching its selected layout/);
assert.throws(
  () => parsePlace({ ...draft("common"), spaces: [defaultVenueSpace("residence")] }, true),
  /Describe the Common Space/,
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
  vacant.zones!.find((zone) => zone.kind === "private-residence")!.preparation,
  undefined,
  "vacant rooms do not spend generation requests",
);
assert.equal(canOccupyZone(vacant, vacant.zones![1]!, "a"), false);
const initial = defaultVillageState();
initial.venues = [privateOnly, place("exterior", "residence", "b"), vacant];
initial.venues[0]!.zones![1]!.description = "A secret journal and old furnishings.";
initial.venues[0]!.zones![1]!.state.items = ["Fixed hammock"];
initial.venues[0]!.zones![1]!.state.publicFacts = ["A personal secret"];
initial.villagers = coerceVillageState({
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
const state = coerceVillageState(initial);
assertResidencePrivateDestination(state, vacant, "b", "personal");
assert.throws(() => assertResidencePrivateDestination(state, privateOnly, "b", "personal"), /no longer vacant/);
const legacy = structuredClone(privateOnly);
delete legacy.layoutVersion;
const preserved = coerceVillageState({ wishSystemVersion: 3, venues: [legacy] }).venues[0]!;
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
    documents: {
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
    },
  },
} as Parameters<typeof configureVillagesRuntime>[0]);
async function finish(id: string, body: unknown = {}) {
  await mutateVillageState((state) => {
    const project = state.projects.find((project) => project.id === id)!;
    project.lifecycle!.phase = "finishing";
    const task = state.progressTasks.find((task) => task.definition.owner.id === id)!;
    task.phaseIndex = task.definition.phases.findIndex((phase) => phase.id === "finishing");
    project.status = "finishing";
  });
  await openFinishedProject(id, body);
}
async function main() {
  try {
    await proposeVillageResidence("b", vacant.id, "player", "", "personal");
    await decideVillageResidence("b", true, "villager");
    await completeVillageResidence("b", true, new Date(), false);
    let current = await readVillageState();
    let destination = current.venues.find((venue) => venue.id === vacant.id)!;
    assert.equal(destination.zones!.find((zone) => zone.id === "personal")!.ownerId, "b");
    assert.equal(destination.zones!.length, 2, "move assigns the existing physical area without adding rooms");
    // Move to an exterior-only home; archive personal history while leaving its room vacant.
    const outside = current.venues.find((venue) => venue.id === initial.venues[1]!.id)!;
    await proposeVillageResidence("a", outside.id, "player", "", "");
    await decideVillageResidence("a", true, "villager");
    await completeVillageResidence("a", true, new Date(), false);
    current = await readVillageState();
    const old = current.venues.find((venue) => venue.id === privateOnly.id)!;
    assert.equal(old.zones!.find((zone) => zone.id === "personal")!.ownerId, undefined);
    assert.deepEqual(old.zones!.find((zone) => zone.id === "personal")!.state.items, ["Fixed hammock"]);
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
    current = await readVillageState();
    let project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState();
    assert.equal(venueCapacity(current.venues.find((venue) => venue.id === outside.id)!), 2);
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 1);
    // Add and remove a base Common Space through reviewed structural terms.
    await createRenovationProject(outside.id, {
      title: "Add shelter",
      detail: "A communal shelter",
      baseZones: [
        {
          id: "common:shelter",
          name: "Common Space",
          kind: "shared-residence",
          venueClass: "residence",
          description: "A shared canvas shelter",
        },
      ],
    });
    current = await readVillageState();
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await assert.rejects(finish(project.id, { baseZones: [] }), /Reviewed structural terms/);
    await finish(project.id);
    current = await readVillageState();
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 2);
    await createRenovationProject(outside.id, {
      title: "Remove shelter",
      detail: "Return to open-air camping",
      baseZones: [],
    });
    current = await readVillageState();
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState();
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
      baseZones: target.zones!.filter((zone) => zone.kind !== "exterior").map((zone) => ({ ...zone, description: "" })),
    });
    assert.equal(proposal.lifecycle!.change!.baseZones![0]!.description, "");
    assert.equal(proposal.lifecycle!.change!.baseZones![0]!.preserveDescription, true);
    assert.equal(
      villageSettings(proposalState, { name: "Player", personaAvailable: false } as never, null).venues.find(
        (venue) => venue.id === target.id,
      )!.zones![1]!.description,
      "",
    );
    await createRenovationProject(outside.id, {
      title: "Base sleeping nook",
      detail: "Add an assigned residential Private Space",
      baseZones: [
        {
          id: "private:nook",
          name: "Sleeping nook",
          kind: "private-residence",
          venueClass: "residence",
          ownerId: "a",
          description: "",
          purpose: "A partitioned sleeping area",
        },
      ],
    });
    current = await readVillageState();
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState();
    assert.equal(
      current.venues.find((venue) => venue.id === outside.id)!.zones!.find((zone) => zone.id === "private:nook")!
        .ownerId,
      "a",
    );
    await createRenovationProject(outside.id, {
      title: "Remove nook",
      detail: "Restore exterior-only residence",
      baseZones: [],
    });
    current = await readVillageState();
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState();
    assert.equal(current.venues.find((venue) => venue.id === outside.id)!.zones!.length, 1);
    assert.ok(
      current.venues
        .find((venue) => venue.id === outside.id)!
        .archivedZones!.some((entry) => entry.zone.id === "private:nook"),
    );
    // Upgrade zones can add more physical rooms without adding residential slots.
    await createRenovationProject(outside.id, {
      title: "Extra tent chamber",
      detail: "Add a vacant Private Space",
      slot: 0,
      improvement: {
        title: "Side tent",
        description: "A separate canvas chamber",
        extraBeds: 0,
        zones: [
          {
            name: "Vacant chamber",
            description: "",
            purpose: "Sleeping chamber",
            kind: "private-residence",
            venueClass: "residence",
          },
        ],
      },
    });
    current = await readVillageState();
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState();
    const expanded = current.venues.find((venue) => venue.id === outside.id)!;
    const chamber = expanded.zones!.find((zone) => zone.kind === "private-residence")!;
    assert.ok(chamber.upgradeId);
    assert.equal(chamber.ownerId, undefined);
    assert.equal(chamber.preparation, undefined);
    assert.equal(venueCapacity(expanded), 2);
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
    // Player moves use the same physical assignment and survive the mail roundtrip.
    await proposePlayerMove(privateOnly.id, "personal");
    current = await readVillageState();
    assert.equal(current.venues.find((venue) => venue.id === privateOnly.id)!.zones![1]!.ownerId, "player");
    assert.equal(
      current.venues.find((venue) => venue.id === privateOnly.id)!.zones![1]!.state.items[0],
      "Fixed hammock",
    );
    await proposePlayerMove(outside.id, chamber.id);
    current = await readVillageState();
    assert.equal(current.venueMail.at(-1)!.proposedPrivateZoneId, chamber.id);
    assert.equal(current.venueMail.at(-1)!.status, "awaiting-villagers");
    assert.equal(
      current.venues.find((venue) => venue.id === outside.id)!.zones!.find((zone) => zone.id === chamber.id)!.ownerId,
      undefined,
    );
    // Removing an Upgrade archives its vacant room rather than resurrecting it on load.
    await createRenovationProject(outside.id, {
      title: "Remove chamber",
      detail: "Remove the side tent",
      slot: 0,
      improvement: null,
    });
    current = await readVillageState();
    project = current.projects.find(
      (project) => project.kind === "renovation" && project.lifecycle?.phase !== "complete",
    )!;
    await finish(project.id);
    current = await readVillageState();
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
      current = await readVillageState();
      project = current.projects.find(
        (project) => project.kind === "new-venue" && project.lifecycle?.phase !== "complete",
      )!;
      await placeNewVenueProject(project.id, {
        x: 0.4 + ["exterior", "common", "private", "both"].indexOf(layout) * 0.12,
        y: 0.5,
      });
      current = await readVillageState();
      project = current.projects.find((entry) => entry.id === project.id)!;
      const opening = draft(layout, "residence", "");
      await assert.rejects(
        finish(project.id, {
          form: "Tent",
          exteriorDescription: opening.description,
          interiorDescription: "An invented interior",
        }),
        /Choose the venue layout/,
      );
      await finish(project.id, {
        ...opening,
        form: "Tent",
        exteriorDescription: opening.description,
        exteriorImage: null,
        interiorImage: null,
      });
      current = await readVillageState();
      destination = current.venues.find((venue) => venue.id === project.venueId)!;
      assert.equal(
        destination.zones!.length,
        1 + Number(layout === "common" || layout === "both") + Number(layout === "private" || layout === "both"),
      );
    }
    await removeVillager("b");
    current = await readVillageState();
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
