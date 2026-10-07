import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  createVenueZoneEdits,
  type VenueZoneEditPorts,
} from "../packages/villages/src/server/features/venues/zone-edit-service.js";
import {
  createVenueCommands,
  type VenueCommandPorts,
} from "../packages/villages/src/server/features/venues/venue-service.js";
import { configureVenueCommands, venueCommands } from "../packages/villages/src/server/features/venues/services.js";

// Synthetic independent stores; no Engine runtime, host bindings or providers.
function fixture(name: string) {
  const state = defaultVillageState();
  const venue = venueDraft({ name, description: "A quiet meeting place.", classes: ["gathering"] }, null);
  venue.id = "venue";
  initializeVenueAccess(venue);
  state.venues = [venue];
  const events: string[] = [];
  const result = { name } as VillageSnapshot;
  const ports: VenueCommandPorts = {
    async readVillageState() {
      events.push("read");
      return structuredClone(state);
    },
    async mutateVillageState(update) {
      events.push("mutate");
      update(state);
      return state;
    },
    async buildVillageSnapshot() {
      events.push("snapshot");
      return result;
    },
    sceneQueries() {
      events.push("queries");
      return {
        async activeVenueSession() {
          events.push("scene");
          return null;
        },
      };
    },
  };
  return { state, events, result, ports };
}

async function main() {
  const first = fixture("First"),
    second = fixture("Second");
  let resume!: () => void;
  let entered!: () => void;
  const paused = new Promise<void>((resolve) => {
    resume = resolve;
  });
  const entry = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const firstMutate = first.ports.mutateVillageState;
  first.ports.mutateVillageState = async (update) => {
    entered();
    await paused;
    return firstMutate(update);
  };
  const firstCommands = createVenueCommands(first.ports);
  const secondCommands = createVenueCommands(second.ports);
  const pending = firstCommands.updateVillageVenue("venue", { name: "First revised" });
  await entry;
  assert.equal(await secondCommands.updateVillageVenue("venue", { name: "Second revised" }), second.result);
  assert.equal(first.state.venues[0].name, "First");
  resume();
  assert.equal(await pending, first.result);
  assert.equal(first.state.venues[0].name, "First revised");
  assert.equal(second.state.venues[0].name, "Second revised", "overlapping commands retain their constructor ports");

  const releaseFirst = configureVenueCommands(firstCommands);
  const releaseSecond = configureVenueCommands(secondCommands);
  releaseFirst();
  assert.equal(venueCommands(), secondCommands, "an older binding cannot clear its replacement");
  releaseSecond();
  assert.throws(venueCommands, /not configured/);

  const access = fixture("Access");
  const accessCommands = createVenueCommands(access.ports);
  await accessCommands.changeVenueAccess("venue", {
    action: "destinations",
    operationId: "destinations",
    expectedRevision: 0,
    zoneId: null,
    visitorId: "player",
  });
  assert.deepEqual(
    access.events,
    ["queries", "scene", "mutate", "scene", "snapshot"],
    "effectful Scene reconciliation stays before and after the write",
  );
  assert.equal(access.state.venues[0].access!.revision, 1);

  const deletion = fixture("Deletion");
  deletion.ports.sceneQueries = () => ({
    activeVenueSession: async () => {
      deletion.events.push("scene");
      return { id: "scene", placeId: "venue" };
    },
  });
  await assert.rejects(
    () => createVenueCommands(deletion.ports).deleteVillageVenue("venue", true),
    /End the active Scene/,
  );
  assert.deepEqual(
    deletion.events,
    ["read", "scene"],
    "preview retains read ordering and active-Scene rejection performs no write",
  );
  assert.equal(deletion.state.venues.length, 1);

  const retry = fixture("Retry");
  const oldImage = { id: "old", ref: "old", url: "old" };
  const newImage = { id: "new", ref: "new", url: "new" };
  retry.state.venues[0].presentation.image = oldImage;
  const posted = structuredClone(retry.state.venues);
  let attempts = 0;
  retry.ports.mutateVillageState = async (update: (state: VillageState) => void) => {
    attempts++;
    update(structuredClone(retry.state)); // Discard the conflicted attempt.
    retry.state.venues[0].presentation.image = newImage;
    attempts++;
    update(retry.state);
    return retry.state;
  };
  await createVenueCommands(retry.ports).setVillageVenues(posted);
  assert.equal(attempts, 2);
  assert.deepEqual(
    retry.state.venues[0].presentation.image,
    newImage,
    "a retry preserves an image that arrived after the settings pre-read",
  );
  await assert.rejects(
    () =>
      createVenueCommands(retry.ports).setVillageVenueImage(
        "venue",
        null,
        undefined,
        "",
        false,
        undefined,
        "stale-context",
      ),
    /scenery changed/,
  );
  assert.deepEqual(retry.state.venues[0].presentation.image, newImage);
  const edits = fixture("Edits");
  const editVenue = edits.state.venues[0];
  editVenue.layoutVersion = 1;
  editVenue.workerIds = ["resident"];
  editVenue.access = undefined; // Legacy access still requires the recorded controller grant.
  editVenue.zones = [
    {
      ...defaultVenueSpace("gathering", "Original workspace."),
      id: "staff",
      kind: "staff",
      name: "Workroom",
      controllerIds: ["resident"],
      seen: true,
      image: newImage,
    },
  ];
  const editPorts: VenueZoneEditPorts = {
    ...edits.ports,
    sceneQueries: () => {
      edits.events.push("queries");
      return {
        activeVenueSession: async () => {
          edits.events.push("scene");
          return {
            id: "scene",
            placeId: "venue",
            zoneId: "staff",
            area: "public",
            privateOwnerId: "",
            startedAt: "2026-10-01T12:00:00.000Z",
            zoneGrants: [{ zoneId: "staff", controllerId: "resident" }],
          };
        },
      };
    },
  };
  const zoneEdits = createVenueZoneEdits(editPorts);
  await zoneEdits.updateVillageZone("venue", "staff", { description: "Proposed workspace." });
  assert.deepEqual(edits.events, ["read", "queries", "scene", "mutate", "snapshot"]);
  assert.equal(
    editVenue.zones[0].description,
    "Original workspace.",
    "resident-controlled edits remain proposals until approval",
  );
  const proposal = editVenue.editProposals![0];
  const result = await zoneEdits.applyResidenceEditApproval("venue", proposal.id, "resident", true);
  assert.equal(result, undefined, "approval preserves its void contract and does not build a snapshot");
  assert.equal(editVenue.zones[0].description, "Proposed workspace.");
  assert.deepEqual(editVenue.zones[0].image, newImage);
  assert.equal(edits.events.at(-1), "mutate");
  assert.equal(editVenue.editProposals!.length, 0);

  await zoneEdits.proposeResidenceSpaceEdit("venue", { zoneId: "staff", description: "Obsolete proposal." });
  const staleProposal = editVenue.editProposals![0];
  editVenue.zones[0].state.updatedAt = "2026-10-02T12:00:00.000Z";
  await zoneEdits.applyResidenceEditApproval("venue", staleProposal.id, "resident", true);
  assert.equal(staleProposal.declined, true);
  assert.equal(editVenue.zones[0].description, "Proposed workspace.", "stale approval cannot replace newer Zone state");
  console.log(
    "Venue service ports, overlapping independent stores, binding ownership, Scene timing and retry fences passed.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
