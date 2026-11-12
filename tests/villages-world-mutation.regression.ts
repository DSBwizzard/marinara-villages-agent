// Test cases: world-mutation/identity, world-mutation/capacity, world-mutation/native-ledger
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { venueFixture } from "./helpers/venues.fixture.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { normalizeVillageMutation } from "../packages/villages/src/server/domain/rules/world-mutation.js";

const at = "2026-11-10T12:00:00.000Z";
const venue = (index: number) =>
  venueFixture({ id: "venue-" + index, name: "Venue " + index, classes: ["residence"], description: "A usable room." });

await runCase("world-mutation/identity", () => {
  const world = defaultVillageState(),
    events: string[] = [],
    sources = {
      now() {
        events.push("clock");
        return new Date(at);
      },
      seed() {
        events.push("seed");
        return "stable-world-seed";
      },
    };
  normalizeVillageMutation(
    world,
    (state) => {
      events.push("mutation");
      state.name = "Founded village";
    },
    sources,
  );
  assert.equal(events[0], "mutation", "the admitted change precedes generated identities");
  assert.equal(world.name, "Founded village");
  assert.equal(world.foundedAt, at);
  assert.equal(world.seed, "stable-world-seed");
  normalizeVillageMutation(
    world,
    (state) => {
      state.name = "Renamed village";
    },
    sources,
  );
  assert.equal(world.foundedAt, at, "ordinary edits preserve founding time");
  assert.equal(world.seed, "stable-world-seed");
  assert.equal(events.filter((event) => event === "seed").length, 1, "ordinary edits never regenerate world identity");
});

await runCase("world-mutation/capacity", () => {
  const world = defaultVillageState();
  world.foundedAt = at;
  world.seed = "at-capacity";
  world.venues = Array.from({ length: 16 }, (_, index) => venue(index));
  normalizeVillageMutation(world, (state) => {
    state.name = "At the current Venue limit";
  });
  assert.equal(world.name, "At the current Venue limit");
  let generated = 0;
  assert.throws(
    () =>
      normalizeVillageMutation(
        world,
        (state) => {
          state.venues.push(venue(16));
        },
        {
          now() {
            generated++;
            return new Date(at);
          },
          seed() {
            generated++;
            return "unexpected";
          },
        },
      ),
    /maximum 16 total/,
  );
  assert.equal(generated, 0, "rejected capacity growth generates no time or identity effects");
});

await runCase("world-mutation/native-ledger", () => {
  const world = defaultVillageState(),
    fresh = venue(0);
  delete fresh.access;
  normalizeVillageMutation(world, (state) => {
    state.venues.push(fresh);
  });
  assert(world.venues[0].access, "newly authored Venues receive native policy");
  const missing = structuredClone(world);
  delete missing.venues[0].access;
  const before = structuredClone(missing);
  assert.throws(() => normalizeVillageMutation(missing, () => {}), /native access ledger/);
  assert.deepEqual(missing, before, "a damaged current ledger is rejected without reconstructing authority");
  const ledger = structuredClone(world.venues[0].access);
  normalizeVillageMutation(world, (state) => {
    state.name = "Renamed native village";
  });
  assert.deepEqual(world.venues[0].access, ledger, "unrelated edits preserve access evidence and receipts");
});
