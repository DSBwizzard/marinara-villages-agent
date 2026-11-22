import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { establishPlace } from "./helpers/places.fixture.js";
import { admitLocation } from "../packages/villages/src/server/domain/rules/place-admission.js";

const host = await packagedSceneServer({
  configure(world, now) {
    world.maps = ["map", "elsewhere"].map((id) => ({
      id,
      name: id,
      revision: 0,
      width: 100,
      height: 100,
      artwork: { id: "map-art", ref: "global-gallery:map-art", url: "/api/global-gallery/file/map-art.png" },
    }));
    for (const venue of world.venues) venue.presentation.mapId = "map";
    for (const [id, name, known, mapId] of [
      ["outside", "Distant ruin", false, "map"],
      ...Array.from({ length: 9 }, (_, i) => ["filler-" + i, "Known corner " + i, true, "map"]),
      ["known", "Atrium", true, "map"],
      ["hidden", "Glass Garden", false, "map"],
      ["by-name", "Ruined Arch", false, "map"],
      ["race", "Signal Alcove", false, "map"],
      ["promoted", "Relay Shelter", false, "map"],
      ["disabled", "Closed Keep", false, "map"],
      ["other-map", "Far Garden", true, "elsewhere"],
    ] as [string, string, boolean, string][]) {
      const place = establishPlace(
        world,
        {
          name,
          description: "An existing location.",
          classes: ["other"],
          people: [{ ref: "keeper", name: "Keeper of " + name, characterization: "A careful local keeper." }],
        },
        id,
        mapId,
        "authored",
        now,
        true,
      );
      place.knownBy = known ? ["player"] : ["mara"];
    }
  },
});
const state = () => fixtureVillageState(host.records.get("villages-village").data, host.records);
const repository = createVillageRepository(() => host.documents as never);
const mutate = (change: (world: ReturnType<typeof state>) => void) =>
  repository.mutateAuthority(change, { memories: true });
let calls = 0;
let reply: (input: any) => unknown | Promise<unknown> = () => ({ place: null });
host.model.chatComplete = async (messages: any[]) => {
  calls++;
  const packet = JSON.parse(messages[1].content);
  assert.equal(packet.task, "explore");
  assert(packet.knownPeople.some((person: any) => person.kind === "resident"));
  assert(packet.knownPeople.filter((person: any) => person.kind === "npc").length <= 4);
  assert(
    packet.knownPeople.every(
      (person: any) =>
        typeof person.id === "string" &&
        typeof person.name === "string" &&
        Object.keys(person).sort().join(",") === "id,kind,name",
    ),
  );
  assert(
    packet.relatedPlaces.every(
      (place: any) => typeof place.knownToPlayer === "boolean" && !place.zones && !place.access,
    ),
  );
  return { content: JSON.stringify(await reply(packet)), finishReason: "stop" } as any;
};
try {
  const snapshot = (await host.app.inject({ method: "GET", url: "/api/villages/" })).json();
  const explore = (requestId: string) =>
    host.app.inject({
      method: "POST",
      url: "/api/villages/places/explore",
      payload: { worldScope: snapshot.worldScope, mapId: "map", requestId },
    });
  const npcs = structuredClone(state().worldPlaces.npcs);
  const empty = async (requestId: string, answer: unknown) => {
    reply = () => answer;
    const before = calls,
      records = structuredClone(state().worldPlaces.places);
    const result = await explore(requestId);
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(result.json().status, "ready", result.body);
    assert.equal(result.json().placeId, "");
    assert.equal(calls, before + 1, "A known result settles empty without buying another attempt");
    assert.deepEqual(state().worldPlaces.places, records);
    assert.deepEqual(state().worldPlaces.npcs, npcs);
  };
  await empty("known-id", { existingId: "known" });
  await empty("venue-id", { existingId: "mill" });
  await empty("known-name", {
    place: {
      name: "  ATRIUM  ",
      description: "A different claimed layout.",
    },
  });
  await empty("venue-name", { place: { name: "The Mill", description: "A duplicate of the map Venue." } });
  await empty("outside-packet", { place: { name: "Distant ruin", description: "Not a supplied identity." } });

  const hiddenBefore = structuredClone(state().worldPlaces.places.hidden);
  reply = () => ({ existingId: "hidden" });
  const discovered = await explore("unknown-id");
  assert.equal(discovered.json().placeId, "hidden", discovered.body);
  hiddenBefore.knownBy.push("player");
  hiddenBefore.revision++;
  assert.deepEqual(
    state().worldPlaces.places.hidden,
    hiddenBefore,
    "A discovery preserves the existing location and identity",
  );
  const beforeReplay = calls;
  assert.equal(
    (await explore("unknown-id")).json().placeId,
    "hidden",
    "Lost-response replay retains its original discovery",
  );
  assert.equal(calls, beforeReplay);
  await empty("already-discovered", { existingId: "hidden" });

  const archBefore = structuredClone(state().worldPlaces.places["by-name"]);
  reply = () => ({
    place: {
      name: "ruined   arch",
      description: "An invented replacement.",
    },
  });
  const arch = await explore("unknown-name");
  assert.equal(arch.json().placeId, "by-name", arch.body);
  archBefore.knownBy.push("player");
  archBefore.revision++;
  assert.deepEqual(state().worldPlaces.places["by-name"], archBefore);
  assert.deepEqual(state().worldPlaces.npcs, npcs, "Name reuse never creates or replaces supporting characters");

  for (const id of ["race", "promoted", "disabled"]) {
    const entered = Promise.withResolvers<void>(),
      release = Promise.withResolvers<void>();
    reply = async () => {
      entered.resolve();
      await release.promise;
      return { existingId: id };
    };
    const before = calls,
      pending = explore("race-" + id);
    await entered.promise;
    await mutate((world) => {
      const place = world.worldPlaces.places[id];
      if (id === "disabled") place.disabled = true;
      else place.knownBy.push("player");
      place.revision++;
      world.worldPlaces.revision++;
      if (id === "promoted") {
        place.visited = true;
        admitLocation(world, id);
      }
    });
    release.resolve();
    const result = await pending;
    assert.equal(result.json().status, "ready", result.body);
    assert.equal(
      result.json().placeId,
      "",
      "A concurrently learned, admitted or disabled Place is not a new discovery",
    );
    assert.equal(calls, before + 1);
  }

  reply = () => ({ existingId: "not-supplied" });
  const beforeInvalid = calls,
    invalid = await explore("hallucinated-id");
  assert.equal(invalid.json().status, "failed", invalid.body);
  assert.equal(calls, beforeInvalid + 2, "Unsupplied IDs remain invalid under the existing two-attempt budget");

  reply = () => ({
    place: {
      name: "Invented keeper's lookout",
      description: "An unfamiliar lookout.",
      people: [{ ref: "keeper", name: "Invented keeper", characterization: "A new person." }],
    },
  });
  const beforePerson = calls,
    invalidPerson = await explore("invented-person");
  assert.equal(invalidPerson.json().status, "failed", invalidPerson.body);
  assert.equal(calls, beforePerson + 2);
  assert.deepEqual(state().worldPlaces.npcs, npcs, "Discovery cannot invent an NPC");

  let arrivals = 0;
  const together = Promise.withResolvers<void>();
  reply = async () => {
    if (++arrivals === 2) together.resolve();
    await together.promise;
    return { place: { name: "Shared Lookout", description: "An unfamiliar lookout." } };
  };
  const simultaneous = await Promise.all([explore("same-new-a"), explore("same-new-b")]);
  assert.equal(
    simultaneous.filter((row) => row.json().placeId).length,
    1,
    "Concurrent same-map discoveries create one location",
  );
  assert.equal(
    Object.values(state().worldPlaces.places).filter((place) => place.location.name === "Shared Lookout").length,
    1,
  );

  reply = () => ({ place: { name: "Far Garden", description: "An unfamiliar garden on this map." } });
  const elsewhere = await explore("different-map");
  assert(elsewhere.json().placeId, elsewhere.body);
  assert.notEqual(elsewhere.json().placeId, "other-map", "Identical names on different maps remain distinct locations");
  assert.equal(state().worldPlaces.places[elsewhere.json().placeId].location.presentation.mapId, "map");
  assert.deepEqual(state().worldPlaces.npcs, npcs);
} finally {
  await host.stop();
}
