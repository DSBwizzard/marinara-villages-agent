import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageSnapshot, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
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
  console.log(
    "Venue service ports, overlapping independent stores, binding ownership, Scene timing and retry fences passed.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
