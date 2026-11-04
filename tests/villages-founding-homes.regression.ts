import assert from "node:assert/strict";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { addFoundingZone } from "../packages/villages/src/client/features/founding/founding-template.js";
import {
  assignFoundingHome,
  assignFoundingPrivateZone,
  foundingSleepZones,
  reconcileFoundingHome,
  reconcileFoundingRoster,
} from "../packages/villages/src/client/features/founding/founding-homes.js";
import { parsePlace, parsePlaces } from "../packages/villages/src/server/domain/rules/founding-record.js";

const actors = [
  { id: "player", name: "Your" },
  { id: "a", name: "Ada" },
  { id: "b", name: "Bryn" },
];
{
  let reused = reconcileFoundingRoster(
    [],
    actors,
    actors.map((actor) => actor.id),
    "community",
  );
  reused = assignFoundingHome(reused, "founding-home:player", "a", true);
  reused = assignFoundingHome(reused, "founding-home:a", "b", true);
  reused = reused.map((home) =>
    home.id === "founding-home:a" ? reconcileFoundingHome({ ...home, foundingCapacity: 1 }) : home,
  );
  reused = reconcileFoundingRoster(
    reused,
    actors.filter((actor) => actor.id !== "a"),
    [],
    "community",
  );
  const restoredRoster = reconcileFoundingRoster(reused, actors, ["a"], "community");
  assert.deepEqual(restoredRoster.find((home) => home.id === "founding-home:a")!.residentIds, ["b"]);
  assert.ok(
    restoredRoster.every((home) => !home.residentIds?.includes("a")),
    "Re-adding someone never displaces an occupied full home or crashes setup",
  );
}
let rows = reconcileFoundingRoster(
  [],
  actors,
  actors.map((row) => row.id),
  "community",
);
assert.ok(rows.filter((row) => row.classes?.includes("residence")).every((row) => row.privateSpaces?.length === 0));
assert.ok(
  rows
    .filter((row) => row.classes?.includes("residence"))
    .every((row) => row.destinations && Object.keys(row.destinations).length === 1),
);
rows = assignFoundingHome(rows, "founding-home:player", "a", true);
assert.equal(rows[0].residenceCapacity, 2);
assert.equal(rows[0].destinations!.a.sleep, rows[0].spaces![0].id);
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
assert.equal(rows[0].residenceCapacity, 1, "Automatic capacity shrinks with the household");
rows[0] = reconcileFoundingHome({ ...rows[0], foundingCapacity: 3 });
rows = assignFoundingHome(rows, rows[0].id, "a", true);
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
assert.equal(rows[0].residenceCapacity, 3, "A deliberately chosen capacity survives moves");
rows[0] = reconcileFoundingHome({ ...rows[0], foundingCapacity: 1 });
const before = JSON.stringify(rows);
assert.throws(() => assignFoundingHome(rows, rows[0].id, "a", true), /full/);
assert.equal(JSON.stringify(rows), before, "A full fixed home does not evict or partly move anyone");
rows[0] = reconcileFoundingHome({ ...rows[0], foundingCapacity: null });
rows = assignFoundingHome(rows, rows[0].id, "a", true);
rows[0] = assignFoundingPrivateZone(addFoundingZone(rows[0], true, "ada-room"), "ada-room", "a");
assert.equal(rows[0].destinations!.a.sleep, "ada-room");
assert.ok(
  !foundingSleepZones(rows[0], "player").some((row) => row.id === "ada-room"),
  "Another person's room cannot be a sleeping choice",
);
assert.equal(rows[0].privateSpaces![0].access!.managerIds![0], "a");
rows[0].privateSpaces![0].description = "Ada's blue quilt";
rows = assignFoundingHome(rows, "founding-home:a", "a", true);
assert.equal(rows[0].privateSpaces![0].description, "Ada's blue quilt");
assert.equal(rows[0].privateSpaces![0].ownerId, "");
assert.ok(
  !foundingSleepZones(rows[0], "player").some((row) => row.id === "ada-room"),
  "A vacated private room is not silently reassigned",
);
rows = assignFoundingHome(rows, rows[0].id, "a", true);
assert.equal(rows[0].destinations!.a.sleep, "common:base");
rows[0] = assignFoundingPrivateZone(rows[0], "ada-room", "a");
assert.equal(rows[0].destinations!.a.sleep, "ada-room");
const restored = JSON.parse(JSON.stringify(rows));
assert.equal(restored[0].foundingCapacity, null);
assert.throws(() => parsePlaces(restored, new Set(["a", "b"]), true, "community"), /separate Residences/);
const saved = restored.map((row: any, index: number) =>
  parsePlace({
    ...row,
    presentation: { ...row.presentation, x: 0.1 + index * 0.2, y: 0.5 },
  }),
);
assert.equal(saved[0].destinations!.a.sleep, "ada-room");
assert.equal(saved[0].residenceCapacity, 2);
assert.equal("foundingCapacity" in saved[0], false, "Setup choices do not leak into the saved-world contract");
const retained = { ...newSetupVenue("existing", "residence", 0.1, 0.1, true), residenceCapacity: 3 };
const vacant = newSetupVenue("vacant", "residence", 0.4, 0.4);
const { draftZonePolicy } =
  await import("../packages/villages/src/client/features/founding/villages-founding-zones.js");
vacant.spaces![0].access = { ...draftZonePolicy(vacant, vacant.spaces![0]), mode: "permission-required" };
assert.equal(
  reconcileFoundingHome({ ...vacant, name: "Authored vacant house" }).spaces![0].access!.mode,
  "permission-required",
  "Unrelated edits preserve explicit access in an already-vacant home",
);
delete retained.foundingCapacity;
const { quickStartTemplates } = await import("../packages/villages/src/client/features/founding/quick-start-drafts.js");
assert.equal(
  quickStartTemplates([retained])[0].foundingCapacity,
  undefined,
  "Recovering an admitted template preserves an existing draft's fixed capacity semantics",
);
assert.equal(quickStartTemplates([{ ...retained, foundingCapacity: 3 }])[0].foundingCapacity, 3);
assert.equal(
  reconcileFoundingHome(retained).residenceCapacity,
  3,
  "An existing draft retains an unknown capacity choice until explicitly set to Automatic",
);
console.log(
  "Founding homes: shared defaults, automatic/fixed capacity, private ownership, sleeping and draft/founding persistence passed.",
);
