import assert from "node:assert/strict";
import { readZonePictureReference } from "../packages/villages/src/server/adapters/engine/zone-picture-reference.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageVenueImage } from "../packages/villages/src/server/domain/models/world.js";
import { imageEditSupport } from "../packages/villages/src/server/domain/rules/image-edit-support.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import {
  claimZonePictureEntry,
  zonePictureContext,
} from "../packages/villages/src/server/domain/rules/zone-picture.js";
import {
  createImageGeneration,
  type ImageGenerationPorts,
} from "../packages/villages/src/server/features/media/image-generation-service.js";
import {
  createLocationImages,
  type LocationImagePorts,
} from "../packages/villages/src/server/features/media/location-image-service.js";
import { createVenueCommands } from "../packages/villages/src/server/features/venues/venue-service.js";

const picture = (id: string): VillageVenueImage => ({
  id,
  ref: `global-gallery:${id}`,
  url: `/api/global-gallery/file/${id}.png`,
});
const image = picture("original");
function fixture() {
  return coerceVillageState({
    version: 7,
    ...defaultVillageState(),
    wishSystemVersion: 3,
    venues: [
      {
        id: "home",
        name: "Home",
        form: "House",
        classes: ["residence"],
        layoutVersion: 1,
        zones: [
          { ...defaultVenueSpace("other"), id: "exterior", name: "Exterior", kind: "exterior", seen: true, image },
          {
            ...defaultVenueSpace("residence"),
            id: "living",
            name: "Living Room",
            kind: "shared-residence",
            seen: true,
            image,
            description: "Two windows, hardwood floor. A rust linen sofa with a cream knitted blanket on its left arm.",
          },
        ],
      },
    ],
  });
}
const connection = (imageService: string, model = "") => ({
  id: "images",
  provider: "image_generation",
  imageService,
  model,
});
assert.equal(imageEditSupport(connection("openai", "gpt-image-1")).status, "supported");
assert.equal(imageEditSupport(connection("openai", "dall-e-3")).status, "unknown");
assert.equal(imageEditSupport(connection("gemini_image", "gemini-2.5-flash-image")).multiple, true);
assert.equal(imageEditSupport(connection("automatic1111")).multiple, false);
assert.equal(imageEditSupport(connection("drawthings")).status, "supported");
assert.equal(imageEditSupport(connection("custom")).status, "unknown");
assert.equal(imageEditSupport(connection("pollinations")).status, "unsupported");
assert.equal(imageEditSupport(connection("comfyui")).status, "unknown");
assert.equal(
  imageEditSupport({ ...connection("comfyui"), comfyuiWorkflow: '{"image":"%reference_image_name%"}' }).status,
  "supported",
);
assert.equal(
  imageEditSupport({ ...connection("runpod_comfyui"), comfyuiWorkflow: "%reference_image% %reference_image_02%" })
    .multiple,
  true,
);

const scene = coerceSession({ version: 3, id: "scene", placeId: "home" });
assert.equal(claimZonePictureEntry(scene, "exterior"), true);
assert.equal(claimZonePictureEntry(scene, "living"), true);
assert.equal(claimZonePictureEntry(scene, "exterior"), false);
assert.equal(claimZonePictureEntry(coerceSession(JSON.parse(JSON.stringify(scene))), "living"), false);
assert.equal(claimZonePictureEntry(coerceSession({ version: 3, id: "next" }), "exterior"), true);

const calls: Record<string, unknown>[] = [];
let state = fixture(),
  supported = true,
  fail = false;
let duringGeneration: (() => void) | undefined;
const imagePorts = {
  readVillageState: async () => structuredClone(state),
  mutateVillageState: async (update) => {
    update(state);
    state = coerceVillageState(state);
    return structuredClone(state);
  },
  resolveVillageImageEditing: async () =>
    supported ? { connectionId: "images", multiple: true, signature: "known" } : null,
  readZonePictureReference: async (source) => ({ dataUrl: `reference:${source.id}`, width: 1200, height: 800 }),
  generateVillageImage: async (input) => {
    calls.push(input);
    duringGeneration?.();
    if (fail) throw new Error("synthetic failure");
    return { bytes: new Uint8Array([1]), mime: "image/png", dataUrl: "synthetic" };
  },
  uploadVillageGalleryImage: async () => picture(`edited-${calls.length}`),
  assertVenueImageAccess: async () => {},
  readVillageVisualLore: async () => "",
  buildVillageSnapshot: async () => ({}),
  villagesLogger: () => ({ warn() {} }),
} as unknown as LocationImagePorts;
const service = createLocationImages(imagePorts);
const zone = () => state.venues[0]!.zones!.find((row) => row.id === "living")!;
const enter = () =>
  service.personalizeZoneOnEntry("home", "living", zonePictureContext(state, state.venues[0]!, zone()));
zone().picture = {
  base: image,
  baseline: JSON.stringify({
    ...JSON.parse(zonePictureContext(state, state.venues[0]!, zone())),
    description: "Two windows, hardwood floor.",
  }),
};
await enter();
assert.equal(calls.length, 1);
assert.equal(zone().picture?.base?.id, "original");
assert.equal(zone().image?.id, "edited-1");
assert.deepEqual(calls[0]!.referenceImages, ["reference:original"]);
await enter();
assert.equal(calls.length, 1, "unchanged next Scene reuses the picture");
zone().description += "\nA brass lamp beside the sofa.";
await enter();
assert.deepEqual(calls[1]!.referenceImages, ["reference:edited-1", "reference:original"]);
assert.match(String(calls[1]!.prompt), /cream knitted blanket/);
assert.equal(zone().picture?.base?.id, "original");

zone().description = "Two windows, hardwood floor. A brass lamp.";
supported = false;
await enter();
assert.equal(calls.length, 2);
supported = true;
state.automaticZonePictures = false;
await enter();
assert.equal(calls.length, 2);
state.automaticZonePictures = true;
zone().freezePicture = true;
await enter();
assert.equal(calls.length, 2);
zone().freezePicture = false;
fail = true;
await enter();
assert.equal(calls.length, 3);
await enter();
assert.equal(calls.length, 3, "identical failed input is not automatically retried");
assert.equal(zone().image?.id, "edited-2");
fail = false;
zone().description += "\nA new rug.";
duringGeneration = () => {
  zone().freezePicture = true;
  zone().pictureRevision = (zone().pictureRevision ?? 0) + 1;
};
await enter();
assert.equal(zone().image?.id, "edited-2", "freeze discards a pending result");
duringGeneration = undefined;
zone().freezePicture = false;
zone().image = picture("replacement");
zone().picture = { base: zone().image };
zone().pictureRevision!++;
await enter();
assert.equal(zone().picture?.base?.id, "replacement");
zone().image = null;
zone().picture = { base: null, removed: true };
await enter();
assert.equal(zone().image, null, "removal is not undone by personalization");
const restored = coerceVillageState(JSON.parse(JSON.stringify(state)));
assert.equal(restored.venues[0]!.zones!.find((row) => row.id === "living")!.picture?.removed, true);

const rows: Record<string, unknown>[] = [connection("openai", "gpt-image-1")];
const generator = createImageGeneration({
  villagesImageConnectionChoice: async () => ({ enabled: true, connectionId: "images" }),
  villageEngineJson: async () => rows,
} as unknown as ImageGenerationPorts);
assert.ok(await generator.resolveVillageImageEditing());
rows.push({ ...connection("pollinations"), id: "backup", fallbackForAgents: "true" });
assert.equal(await generator.resolveVillageImageEditing(), null);
rows[1] = { ...connection("automatic1111"), id: "backup", fallbackForAgents: "true" };
assert.equal((await generator.resolveVillageImageEditing())?.multiple, false);
assert.equal(
  imageEditSupport({ ...connection("comfyui"), comfyuiWorkflow: "%reference_image_name_01%" }).status,
  "supported",
);
const hidden = fixture();
hidden.automaticZonePictures = false;
const privateZone = hidden.venues[0]!.zones![1]!;
privateZone.seen = false;
privateZone.picture = {
  base: picture("secret-base"),
  context: "secret-room-record",
  attempted: "secret-attempt",
  failed: true,
};
const projected = villageSettings(hidden, { name: "Player", description: "", personaId: "", missing: false }, null);
assert.equal(projected.automaticZonePictures, false);
assert.doesNotMatch(JSON.stringify(projected), /secret-base|secret-room-record|secret-attempt/);
assert.equal(projected.venues[0]!.zones![1]!.image?.id, image.id, "unvisited artwork is visible");
assert.equal((projected.venues[0]!.zones![1] as { pictureRetryAvailable?: boolean }).pictureRetryAvailable, true);
await assert.rejects(readZonePictureReference({ ...image, url: "https://example.invalid/private.png" }));

state = fixture();
zone().picture = {
  base: image,
  baseline: JSON.stringify({
    ...JSON.parse(zonePictureContext(state, state.venues[0]!, zone())),
    description: "Two windows, hardwood floor.",
  }),
};
const beforeEpoch = calls.length;
duringGeneration = () => {
  state.zonePictureEpoch = (state.zonePictureEpoch ?? 0) + 2;
};
await enter();
assert.equal(calls.length, beforeEpoch + 1);
assert.equal(zone().image?.id, "original", "disable/re-enable epoch invalidates in-flight work");
duringGeneration = undefined;
zone().state.recent = {
  text: "Cups after tea.",
  occurredAt: "2026-10-28T10:00:00Z",
  expiresAt: "2026-10-29T10:00:00Z",
};
assert.doesNotMatch(zonePictureContext(state, state.venues[0]!, zone()), /Cups after tea/);
zone().description += "\nA repaired oak desk with ink on the desktop.";
await enter();
assert.match(String(calls.at(-1)!.prompt), /repaired oak desk/);
assert.match(String(calls.at(-1)!.prompt), /ink on the desktop/);

state = fixture();
const migratedBaseline = zone().picture!.baseline;
assert.ok(migratedBaseline, "saved artwork has a physical baseline before later gameplay");
zone().description += "\nA copper kettle added after loading.";
await enter();
assert.match(String(calls.at(-1)!.prompt), /copper kettle added after loading/);
assert.equal(zone().picture!.baseline, migratedBaseline);
zone().description += "\nBlue cushions.";
fail = true;
await enter();
fail = false;
const beforeRetry = calls.length;
assert.equal(zone().picture?.failed, true);
await service.retryZonePicture("home", "living");
assert.equal(calls.length, beforeRetry + 1);
zone().description += "\nA small plant.";
await service.retryZonePicture("home", "living");
assert.equal(calls.length, beforeRetry + 1, "stale retry cannot dispatch without a failed attempt");
fail = true;
await enter();
fail = false;
zone().picture!.failed = false; // Emulate a saved request interrupted before its completion was recorded.
const beforeRecovery = calls.length;
await enter();
assert.equal(calls.length, beforeRecovery, "interrupted requests never automatically repeat spending");
assert.equal(zone().picture!.failed, true, "the interrupted request becomes explicitly retryable");
await service.retryZonePicture("home", "living");
assert.equal(calls.length, beforeRecovery + 1);
state = fixture();
zone().picture!.context = JSON.stringify({ description: "a".repeat(4000), resident: "" });
zone().description = "b".repeat(4000);
const beforeLong = calls.length;
await enter();
assert.equal(calls.length, beforeLong, "overlong deltas do not spend or lose later changes");
assert.equal(zone().picture?.context, JSON.stringify({ description: "a".repeat(4000), resident: "" }));
assert.equal(zone().picture?.claim, undefined, "budget deferral creates no pending image claim");

state = fixture();
zone().kind = "staff";
zone().controllerIds = ["player"];
zone().image = null;
zone().picture = { base: null };
zone().initialImageAttemptedAt = "";
const venueCommands = createVenueCommands({
  withSceneNavigation: (operation) => operation(),
  readVillageState: imagePorts.readVillageState,
  mutateVillageState: imagePorts.mutateVillageState,
  buildVillageSnapshot: imagePorts.buildVillageSnapshot!,
  sceneQueries: () => ({ activeVenueSession: async () => null }),
});
imagePorts.setVillageVenueImage = venueCommands.setVillageVenueImage;
const beforeInitial = calls.length;
duringGeneration = () => {
  state.zonePictureEpoch = (state.zonePictureEpoch ?? 0) + 2;
};
await service.generateFirstPrivateSpaceImage("home", "living");
assert.equal(calls.length, beforeInitial + 1);
assert.equal(zone().image, null, "initial private generation also rejects disable/re-enable races");
duringGeneration = undefined;
// Owner aliases must use the same exact Zone for access, prompt and save.
{
  const privateWorld = fixture(),
    home = privateWorld.venues[0];
  home.residentIds = ["owner"];
  home.destinations = { owner: { sleep: "bedroom" } };
  privateWorld.villagers = coerceVillageState({
    ...defaultVillageState(),
    villagers: [
      {
        characterId: "owner",
        addedAt: new Date().toISOString(),
        cardSnapshot: {
          id: "owner",
          name: "Owner",
          revision: 1,
          sourceStatus: "available",
          capturedAt: new Date().toISOString(),
        },
      },
    ],
  }).villagers;
  const study = {
    ...defaultVenueSpace("residence", "UNSEEN PRIVATE STUDY CONTENTS"),
    id: "study",
    name: "Study",
    kind: "private-residence" as const,
    ownerId: "owner",
    seen: false,
  };
  const bedroom = {
    ...defaultVenueSpace("residence", "Previously observed bedroom."),
    id: "bedroom",
    name: "Bedroom",
    kind: "private-residence" as const,
    ownerId: "owner",
    seen: true,
  };
  home.zones!.push(study, bedroom);
  home.privateSpaces = [study, bedroom];
  const { initializeVenueAccess } = await import("../packages/villages/src/server/domain/rules/venue-access.js");
  initializeVenueAccess(home);
  const commands = createVenueCommands({
    readVillageState: async () => structuredClone(privateWorld),
    mutateVillageState: async () => {
      throw Error("unexpected write");
    },
    buildVillageSnapshot: async () => ({}) as any,
    sceneQueries: () => ({
      activeVenueSession: async () => ({
        id: "bedroom-visit",
        placeId: "home",
        zoneId: "bedroom",
        zoneGrants: [{ zoneId: "bedroom", controllerId: "owner" }],
      }),
    }),
  });
  let prompt = "",
    savedId = "";
  const exact = createLocationImages({
    ...imagePorts,
    readVillageState: async () => structuredClone(privateWorld),
    assertVenueImageAccess: commands.assertVenueImageAccess,
    generateVillageImage: async (input) => {
      prompt = input.prompt;
      return { bytes: new Uint8Array([1]), mime: "image/png", dataUrl: "synthetic" };
    },
    uploadVillageGalleryImage: async () => picture("bedroom-picture"),
    setVillageVenueImage: async (_venue, _image, _class, _owner, _onlyIfEmpty, zoneId) => {
      savedId = zoneId!;
      return {} as any;
    },
  });
  await exact.generateVillageLocationImage("home", undefined, "residence", "owner");
  assert.match(prompt, /Previously observed bedroom/);
  assert.doesNotMatch(prompt, /UNSEEN PRIVATE STUDY/);
  assert.equal(savedId, "bedroom");
}
process.stdout.write("Zone picture continuity, entry claims, opt-outs, failures and fallback checks passed.\n");
