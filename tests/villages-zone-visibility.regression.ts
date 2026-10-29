import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import {
  initializeVenueAccess,
  evaluateZoneAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import { createVenueCommands } from "../packages/villages/src/server/features/venues/venue-service.js";

const at = "2026-10-29T12:00:00.000Z";
const source = defaultVillageState();
const home = venueDraft({ name: "Home", description: "A blue door", classes: ["residence"] }, null);
home.id = "home";
home.layoutVersion = 1;
home.residentIds = ["resident"];
home.zones = [
  {
    ...defaultVenueSpace("residence", "A blue door"),
    id: "exterior",
    name: "Entrance",
    kind: "exterior",
    connectedTo: ["room"],
  },
  {
    ...defaultVenueSpace("residence", "An oak desk beside a green bed."),
    id: "room",
    name: "Bedroom",
    kind: "private-residence",
    ownerId: "resident",
    seen: false,
    connectedTo: ["exterior"],
    preparation: { status: "ready" },
    freezePicture: true,
    image: { id: "room-art", ref: "global-gallery:room-art", url: "/api/global-gallery/file/room-art.webp" },
  },
];
initializeVenueAccess(home);
source.venues = [home];
// A saved pre-change observation must neither mask current details nor require conversion.
const legacy = {
  ...home.zones[1],
  lastObserved: { description: "Old remembered room", state: home.zones[1].state, observedAt: at },
  imageInteriorKey: "old-image-key",
};
source.venues[0].zones![1] = legacy;
let state = coerceVillageState(source);
const room = () => state.venues[0].zones!.find((zone) => zone.id === "room")!;
const player = { name: "Player", description: "", personaId: "", missing: false };
const access = () =>
  evaluateZoneAccess(state.venues[0], room(), "player", { at: new Date(at), sceneId: "test", positions: {} });
assert.equal(access().allowed, false);
const before = JSON.stringify(state);
const view = villageSettings(state, player, null, undefined, new Date(at));
const shown = view.venues[0].zones!.find((zone) => zone.id === "room")!;
assert.equal(shown.description, "An oak desk beside a green bed.");
assert.equal(shown.image?.id, "room-art");
assert.equal(shown.seen, false);
assert.equal(shown.accessView!.decision.allowed, false);
assert.equal(JSON.stringify(state), before, "reading a Zone neither visits nor changes it");
assert.doesNotMatch(JSON.stringify(view), /Old remembered room|old-image-key|lastObserved|imageInteriorKey/);

let sceneReads = 0;
const commands = createVenueCommands({
  withSceneNavigation: (operation) => operation(),
  readVillageState: async () => structuredClone(state),
  mutateVillageState: async (update) => {
    update(state);
    return state;
  },
  buildVillageSnapshot: async () => ({ settings: villageSettings(state, player, null) }) as never,
  sceneQueries: () => ({
    activeVenueSession: async () => {
      sceneReads++;
      return null;
    },
  }),
});
await commands.setVillageVenueImage(
  "home",
  { id: "replacement", ref: "global-gallery:replacement", url: "/replacement.webp" },
  undefined,
  "",
  false,
  "room",
);
assert.equal(room().image?.id, "replacement", "artwork can be replaced without visiting or receiving entry permission");
assert.equal(room().seen, false);
assert.equal(room().freezePicture, true);
assert.equal(access().allowed, false, "editing art grants no gameplay access");
assert.equal(sceneReads, 0, "artwork does not require or reconcile a private Scene");
await commands.setVillageVenueImage("home", null, undefined, "", false, "room");
state = coerceVillageState(JSON.parse(JSON.stringify(state)));
assert.equal(room().image, null);
assert.equal(room().picture?.removed, true, "explicit removal survives saved-world reload");
assert.equal(room().description, "An oak desk beside a green bed.");
console.log(
  "Zone visibility: unvisited interiors, retired observation compatibility, read purity and independent entry access passed.",
);
