import assert from "node:assert/strict";
import Fastify from "fastify";
import type { VillageSettings } from "../packages/villages/src/shared/contracts/village.js";
import type { VillageVenueZone } from "../packages/villages/src/server/domain/models/world.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { venueDraftFixture as venueDraft } from "./helpers/venues.fixture.js";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot-service.js";
import { configureVillageSnapshot } from "../packages/villages/src/server/features/world/snapshot.js";
import { registerSnapshotCatalogRoutes } from "../packages/villages/src/server/features/world/routes.js";
import { createVillageSettings } from "../packages/villages/src/server/features/settings/village-settings-service.js";
import { configureVillageSettings } from "../packages/villages/src/server/features/settings/village-settings.js";
import { registerVillageSettingsRoutes } from "../packages/villages/src/server/features/settings/routes.js";

const state = defaultVillageState();
state.playerPersonaId = "persona";
state.playerPersonaName = "Robin Hale";
state.playerPersonaIdentity = "PRIVATE-PERSONA-IDENTITY";
state.zonePictureEpoch = 73;
const venue = venueDraft({ name: "Hall", description: "A public hall", classes: ["community"] }, null);
venue.access = {
  version: 1,
  revision: 1,
  managerIds: ["resident"],
  visitorHours: null,
  permissions: [],
  bans: [],
  exceptions: [],
  changes: [],
  visitDenials: [],
  receipts: { "private-operation": { fingerprint: "PRIVATE-ACCESS-RECEIPT", revision: 1 } },
};
const visible: VillageVenueZone = {
  ...defaultVenueSpace("community", "A visible room"),
  id: "public",
  name: "Common Space",
  kind: "public" as const,
  seen: true,
  picture: { base: null, claim: "PRIVATE-PICTURE-CLAIM", failed: true },
  pictureRevision: 12,
  preparation: { status: "ready" as const, claimId: "PRIVATE-PREPARATION-CLAIM", attempt: 2 },
};
const hidden: VillageVenueZone = {
  ...defaultVenueSpace("residence", "A resident room before the first visit"),
  id: "private",
  name: "Private room",
  kind: "private-residence" as const,
  ownerId: "resident",
  seen: false,
  image: { ref: "global-gallery:hidden", url: "/hidden.png", id: "hidden" },
  preparation: { status: "pending" as const, claimId: "PRIVATE-PREPARATION-CLAIM" },
};
venue.zones = [visible, hidden];
state.venues = [venue];

async function mutateVillageState(update: (world: typeof state) => void) {
  update(state);
  return state;
}
const snapshot = createVillageSnapshot({
  readVillageState: async () => state,
  listVillagerCards: async () => [],
  rollActiveAgendas: async () => false,
  sceneQueries: () => ({ activeVenueSession: async () => null }),
  backgroundWorkSummaries: async () => [],
  privatePreparationRooms: () => [],
});
const settings = createVillageSettings({
  mutateVillageState,
  buildVillageSnapshot: snapshot.buildVillageSnapshot,
  readLinkedPersona: async () => {
    throw new Error("No Persona lookup requested");
  },
  runVillageBootstrap: async () => {
    throw new Error("No bootstrap requested");
  },
  villagesLogger: () => ({ warn() {} }),
});
const scope = createActivationScope();
const releaseSnapshot = scope.run(() => configureVillageSnapshot(snapshot));
const releaseSettings = scope.run(() => configureVillageSettings(settings));

const app = scope.run(() => Fastify());

// The public HTTP surface is explicit: adding a saved-world field must not expose it.
const publicFields = [
  "automaticZonePictures",
  "characterSpeechColors",
  "defaultHomeBuilding",
  "homeBuildingNames",
  "homeBuildings",
  "loreTokenBudget",
  "loreTokenBudgetMax",
  "loreTokenBudgetMin",
  "maxPlaces",
  "maxVenueImageBytes",
  "maxVenueImageIdLength",
  "maxVenueImageUrlLength",
  "maxVenueNameLength",
  "maxVenueNoteLength",
  "personalizeVenueImagesByDefault",
  "playerBackground",
  "playerPersonaId",
  "playerPersonaMissing",
  "playerPersonaName",
  "communityVenueId",
  "circumstances",
  "sceneryArtStyle",
  "sceneryStyleProfileId",
  "selectedLorebookIds",
  "sendOnEnter",
  "setting",
  "settingMaxLength",
  "setupHomeCount",
  "setupMaxVillagerCount",
  "setupMinVillagerCount",
  "setupPlaceCount",
  "spriteCardFlipEnabled",
  "spriteVariantsEnabled",
  "backgroundPace",
  "backgroundPaces",
  "narrativeConsequence",
  "maps",
  "townMapExpectedHeight",
  "townMapExpectedWidth",
  "townMapGenerationHeight",
  "townMapGenerationWidth",
  "townMapImageMaxLength",
  "townMapLayoutPrompt",
  "townMapNegativePrompt",
  "townMapZoomMax",
  "townMapZoomMin",
  "townMapZoomStep",
  "foundingLore",
  "venues",
  "villageGalleryFolderName",
  "villageNameMaxLength",
  "worldRules",
  "worldName",
] satisfies (keyof VillageSettings)[];

async function request(method: "GET" | "PATCH", payload?: Record<string, unknown>) {
  const response = await app.inject({ method, url: method === "GET" ? "/" : "/settings", payload });
  assert.equal(response.statusCode, 200, response.body);
  assert.match(response.headers["content-type"]!, /application\/json/);
  const result = JSON.parse(response.body).settings as VillageSettings;
  assert.deepEqual(Object.keys(result).sort(), [...publicFields].sort());
  for (const privateField of ["zonePictureEpoch", "playerPersonaIdentity", "playerName", "playerDescription"])
    assert.equal(Object.hasOwn(result, privateField), false, privateField);
  assert.equal(JSON.stringify(result).includes("PRIVATE-"), false, "Private state must not reach HTTP settings");
  return result;
}

try {
  scope.run(() => registerSnapshotCatalogRoutes(app));
  scope.run(() => registerVillageSettingsRoutes(app));
  const initial = await scope.run(() => request("GET"));
  assert.equal(initial.worldName, "");
  assert.equal(initial.playerBackground, "");
  assert.equal(initial.communityVenueId, "");
  assert.equal(initial.sceneryStyleProfileId, null);
  assert.equal(initial.narrativeConsequence, "gentle");
  assert.equal(initial.playerPersonaName, "Robin Hale");
  assert.equal(initial.townMapExpectedWidth, 2560);
  assert.equal(initial.townMapExpectedHeight, 1440);
  for (const field of ["automaticZonePictures", "personalizeVenueImagesByDefault"] as const)
    assert.equal(typeof initial[field], "boolean", field);
  assert.equal(typeof initial.sceneryArtStyle, "string");
  const projected = initial.venues[0];
  assert.equal(Object.hasOwn(projected, "access"), false);
  assert.equal(projected.accessView?.canManage, false);
  const publicZone = projected.zones!.find((zone) => zone.id === "public")!;
  assert.equal(publicZone.description, "A visible room");
  assert.equal(publicZone.pictureRetryAvailable, false);
  assert.deepEqual(publicZone.preparation, { status: "ready" }, "authoring retains preparation status");
  for (const field of ["lastObserved", "picture", "pictureRevision", "imageInteriorKey", "access", "controllerIds"])
    assert.equal(Object.hasOwn(publicZone, field), false, field);
  const privateZone = projected.zones!.find((zone) => zone.id === "private")!;
  assert.equal(privateZone.description, hidden.description);
  assert.equal(privateZone.image?.id, "hidden");
  assert.deepEqual(privateZone.state, hidden.state);

  // Older stored data can lack these fields; explicit response fallbacks remain present.
  scope.run(() => Reflect.deleteProperty(state, "worldName"));
  state.playerBackground = null;
  scope.run(() => Reflect.deleteProperty(state, "sceneryStyleProfileId"));
  scope.run(() => Reflect.deleteProperty(state, "automaticZonePictures"));
  state.playerPersonaMissing = true;
  const legacy = await scope.run(() => request("GET"));
  assert.equal(legacy.worldName, null);
  assert.equal(legacy.playerBackground, null);
  assert.equal(legacy.sceneryStyleProfileId, null);
  assert.equal(legacy.automaticZonePictures, true);
  assert.equal(legacy.playerPersonaName, "Robin Hale");
  assert.equal(legacy.playerPersonaMissing, true);

  state.playerBackground = "A cartographer";
  state.worldRules = "Standing rules";
  visible.preparation = { status: "failed", error: "Drawing unavailable", claimId: "PRIVATE-FAILED-CLAIM", attempt: 3 };
  const updated = await scope.run(() =>
    request("PATCH", {
      worldName: "Harbor",
      sendOnEnter: false,
      backgroundPace: "quiet",
      sceneryArtStyle: "Watercolor",
      sceneryStyleProfileId: "watercolor",
      automaticZonePictures: false,
      personalizeVenueImagesByDefault: false,
      useVisualLoreByDefault: false,
    }),
  );
  assert.equal(updated.worldName, "Harbor");
  assert.equal(updated.sendOnEnter, false);
  assert.equal(updated.backgroundPace, "quiet");
  assert.equal(updated.sceneryArtStyle, "Watercolor");
  assert.equal(updated.sceneryStyleProfileId, "watercolor");
  assert.equal(updated.automaticZonePictures, false);
  assert.equal(updated.personalizeVenueImagesByDefault, false);
  assert.equal(Object.hasOwn(updated, "useVisualLoreByDefault"), false, "Retired image Lorebook preference is ignored");
  assert.equal(updated.playerBackground, "A cartographer");
  assert.equal(updated.worldRules, state.worldRules);
  assert.deepEqual(
    updated.venues[0].zones!.find((zone) => zone.id === "public")!.preparation,
    { status: "failed", error: "Drawing unavailable" },
    "Present optional error is serialized without internal claims",
  );
  assert.equal(state.playerPersonaIdentity, "PRIVATE-PERSONA-IDENTITY");
  assert.equal(state.zonePictureEpoch > 0, true, "Internal picture generation state remains persisted");
} finally {
  await app.close();
  scope.run(() => releaseSettings());
  scope.run(() => releaseSnapshot());

  scope.dispose();
}
console.log("Settings HTTP contract: serialized values, nullability, optional fields and privacy passed");
