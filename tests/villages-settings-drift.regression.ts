import assert from "node:assert/strict";
import Fastify from "fastify";
import type { VillageSettings } from "../packages/villages/src/shared/contracts/village.js";
import type { VillageVenueZone } from "../packages/villages/src/server/domain/models/world.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
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
  imageInteriorKey: "PRIVATE-IMAGE-KEY",
  preparation: { status: "ready" as const, claimId: "PRIVATE-PREPARATION-CLAIM", attempt: 2 },
};
const hidden: VillageVenueZone = {
  ...defaultVenueSpace("residence", "PRIVATE-UNSEEN-DESCRIPTION"),
  id: "private",
  name: "Private room",
  kind: "private-residence" as const,
  ownerId: "resident",
  seen: false,
  image: { ref: "global-gallery:hidden", url: "/hidden.png", id: "hidden" },
  lastObserved: {
    description: "PRIVATE-OBSERVATION",
    state: defaultVenueSpace("residence").state,
    observedAt: "2026-10-20T12:00:00.000Z",
  },
  preparation: { status: "pending" as const, claimId: "PRIVATE-PREPARATION-CLAIM" },
};
hidden.state.items = ["PRIVATE-UNSEEN-ITEM"];
venue.zones = [visible, hidden];
state.venues = [venue];

async function mutateVillageState(update: (world: typeof state) => void) {
  update(state);
  return state;
}
const snapshot = createVillageSnapshot({
  readVillageState: async () => state,
  mutateVillageState,
  listVillagerCards: async () => [],
  captureMissingVillagerCardColors: () => {
    throw new Error("No resident cards in this fixture");
  },
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
const clear = installDefaultActivation(scope, () => {});
const app = Fastify();

// The public HTTP surface is explicit: adding a saved-world field must not expose it.
const publicFields = [
  "automaticZonePictures",
  "characterSpeechColors",
  "defaultHomeBuilding",
  "defaultPromptKnowledge",
  "foundingDetails",
  "foundingDetailsMaxLength",
  "foundingGuidance",
  "foundingGuidanceMaxLength",
  "foundingReason",
  "homeBuildingNames",
  "homeBuildings",
  "loreTokenBudget",
  "loreTokenBudgetMax",
  "loreTokenBudgetMin",
  "macros",
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
  "promptBoxMaxLength",
  "promptKnowledge",
  "scenarioImprint",
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
  "useVisualLoreByDefault",
  "venues",
  "villageGalleryFolderName",
  "villageNameMaxLength",
  "worldFacts",
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
  registerSnapshotCatalogRoutes(app);
  registerVillageSettingsRoutes(app);
  const initial = await request("GET");
  assert.equal(initial.worldName, "");
  assert.equal(initial.playerBackground, "");
  assert.equal(initial.scenarioImprint, null);
  assert.equal(initial.sceneryStyleProfileId, null);
  assert.equal(initial.playerPersonaName, "Robin Hale");
  assert.equal(initial.townMapExpectedWidth, 2560);
  assert.equal(initial.townMapExpectedHeight, 1440);
  for (const field of ["automaticZonePictures", "personalizeVenueImagesByDefault", "useVisualLoreByDefault"] as const)
    assert.equal(typeof initial[field], "boolean", field);
  assert.equal(typeof initial.sceneryArtStyle, "string");
  const projected = initial.venues[0];
  assert.equal(Object.hasOwn(projected, "access"), false);
  assert.equal(projected.accessView?.canManage, false);
  const publicZone = projected.zones!.find((zone) => zone.id === "public")!;
  assert.equal(publicZone.description, "A visible room");
  assert.equal(publicZone.pictureRetryAvailable, true);
  assert.deepEqual(publicZone.preparation, { status: "ready" }, "Undefined optional error is omitted");
  for (const field of ["lastObserved", "picture", "pictureRevision", "imageInteriorKey", "access", "controllerIds"])
    assert.equal(Object.hasOwn(publicZone, field), false, field);
  const privateZone = projected.zones!.find((zone) => zone.id === "private")!;
  assert.equal(privateZone.description, "");
  assert.equal(privateZone.image, null);
  assert.deepEqual(privateZone.state.items, []);

  // Older stored data can lack these fields; explicit response fallbacks remain present.
  Reflect.deleteProperty(state, "worldName");
  state.playerBackground = null;
  Reflect.deleteProperty(state, "sceneryStyleProfileId");
  Reflect.deleteProperty(state, "automaticZonePictures");
  state.playerPersonaMissing = true;
  const legacy = await request("GET");
  assert.equal(legacy.worldName, null);
  assert.equal(legacy.playerBackground, null);
  assert.equal(legacy.sceneryStyleProfileId, null);
  assert.equal(legacy.automaticZonePictures, true);
  assert.equal(legacy.playerPersonaName, "Robin Hale");
  assert.equal(legacy.playerPersonaMissing, true);

  state.playerBackground = "A cartographer";
  state.scenarioImprint = {
    origin: "Arrived by boat",
    worldFacts: ["An island"],
    openingConditions: ["A storm"],
    visualCues: ["A lighthouse"],
  };
  visible.preparation = { status: "failed", error: "Drawing unavailable", claimId: "PRIVATE-FAILED-CLAIM", attempt: 3 };
  const updated = await request("PATCH", {
    worldName: "Harbor",
    sendOnEnter: false,
    backgroundPace: "quiet",
    sceneryArtStyle: "Watercolor",
    sceneryStyleProfileId: "watercolor",
    automaticZonePictures: false,
    personalizeVenueImagesByDefault: false,
    useVisualLoreByDefault: false,
  });
  assert.equal(updated.worldName, "Harbor");
  assert.equal(updated.sendOnEnter, false);
  assert.equal(updated.backgroundPace, "quiet");
  assert.equal(updated.sceneryArtStyle, "Watercolor");
  assert.equal(updated.sceneryStyleProfileId, "watercolor");
  assert.equal(updated.automaticZonePictures, false);
  assert.equal(updated.personalizeVenueImagesByDefault, false);
  assert.equal(updated.useVisualLoreByDefault, false);
  assert.equal(updated.playerBackground, "A cartographer");
  assert.deepEqual(updated.scenarioImprint, state.scenarioImprint);
  assert.deepEqual(
    updated.venues[0].zones!.find((zone) => zone.id === "public")!.preparation,
    { status: "failed", error: "Drawing unavailable" },
    "Present optional error is serialized without internal claims",
  );
  assert.equal(state.playerPersonaIdentity, "PRIVATE-PERSONA-IDENTITY");
  assert.equal(state.zonePictureEpoch > 0, true, "Internal picture generation state remains persisted");
} finally {
  await app.close();
  releaseSettings();
  releaseSnapshot();
  clear();
  scope.dispose();
}
console.log("Settings HTTP contract: serialized values, nullability, optional fields and privacy passed");
