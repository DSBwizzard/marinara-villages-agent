import assert from "node:assert/strict";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";

const fixture = await packagedSceneServer({
  configure(world, now) {
    world.maps = ["shore", "ice"].map((id) => ({
      id,
      name: id,
      revision: 0,
      width: 100,
      height: 100,
      artwork: { id: "art", ref: "global-gallery:art", url: "/api/global-gallery/file/art.png" },
    }));
    for (const venue of world.venues) venue.presentation.mapId = "shore";
    for (let n = 0; n < 65; n++)
      establishPlace(
        world,
        { name: "Archive " + String(n).padStart(2, "0"), description: "A known archive." },
        "archive:" + n,
        n % 2 ? "ice" : "shore",
        "fixture:" + n,
        now,
        true,
      );
    establishPlace(
      world,
      { name: "Private archive", description: "Private." },
      "private",
      "shore",
      "fixture:private",
      now,
      false,
    ).knownBy = [];
    const disabled = establishPlace(
      world,
      { name: "Disabled archive", description: "Disabled." },
      "disabled",
      "shore",
      "fixture:disabled",
      now,
      true,
    );
    disabled.disabled = true;
  },
});
try {
  const read = async (params: Record<string, string> = {}) => {
    const response = await fixture.app.inject({
      method: "GET",
      url: "/api/villages/places?" + new URLSearchParams(params),
    });
    assert.equal(response.statusCode, 200, response.body);
    return response.json();
  };
  const all = await read();
  assert.equal(all.items.length, 50);
  assert.equal(all.counts.other, 65, "Unknown and disabled locations are excluded from counts");
  assert.equal(all.total, 65 + all.counts.venues);
  assert(
    all.items.slice(0, all.counts.venues).every((row: any) => row.venue),
    "All groups Venues before other locations",
  );
  assert.equal(all.items[all.counts.venues].name, "Archive 00");
  const first = await read({ kind: "other" });
  assert.deepEqual(
    first.items.map((row: any) => row.name),
    Array.from({ length: 50 }, (_, n) => "Archive " + String(n).padStart(2, "0")),
  );
  const second = await read({ kind: "other", cursor: first.nextCursor });
  assert.equal(second.offset, 50);
  assert.equal(second.items.length, 15);
  assert.equal(second.previousCursor, "0");
  assert.equal(second.nextCursor, null);
  assert.equal(
    new Set([...first.items, ...second.items].map((row) => row.id)).size,
    65,
    "Pages do not repeat or omit a location",
  );
  const found = await read({ query: "  ARCHIVE 64  " });
  assert.deepEqual(
    found.items.map((row: any) => row.id),
    ["archive:64"],
    "Search reaches beyond the first page",
  );
  const ice = await read({ mapId: "ice", kind: "other" });
  assert.equal(ice.total, 32);
  assert.equal(ice.counts.venues, 0);
  assert(ice.items.every((row: any) => row.mapId === "ice"));
  const combined = await read({ query: "Archive 6", mapId: "shore", kind: "other" });
  assert.deepEqual(
    combined.items.map((row: any) => row.id),
    ["archive:60", "archive:62", "archive:64"],
  );
  const venues = await read({ kind: "venues" });
  assert(venues.items.every((row: any) => row.venue));
  assert.equal(venues.counts.other, 65, "Category counts precede the category filter");
  const empty = await read({ query: "not found", kind: "other" });
  assert.equal(empty.total, 0);
  assert.deepEqual(empty.counts, { all: 0, venues: 0, other: 0 });
  assert.equal(empty.offset, 0);
  const clamped = await read({ kind: "other", cursor: "999" });
  assert.equal(clamped.offset, 50);
  assert.equal(clamped.items.length, 15);
  for (const params of [
    { cursor: "-1" },
    { cursor: "1.5" },
    { cursor: "Infinity" },
    { limit: "0" },
    { limit: "101" },
    { kind: "private" },
  ]) {
    const response = await fixture.app.inject({
      method: "GET",
      url: "/api/villages/places?" + new URLSearchParams(params),
    });
    assert.equal(response.statusCode, 400, response.body);
  }
  assert.equal(fixture.calls(), 0, "Search, filtering, counts and paging never generate");
} finally {
  await fixture.stop();
}
