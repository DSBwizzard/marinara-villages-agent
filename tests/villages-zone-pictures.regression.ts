import { ensureNarrative } from "../packages/villages/src/server/domain/rules/narrative-development.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import {
  createLiveScenes,
  type LiveScenePorts,
} from "../packages/villages/src/server/features/scenes/live-session-service.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  configureVillageClock,
  type VillageClockAuthority,
} from "../packages/villages/src/server/adapters/time/clock-gate.js";
import {
  captureZoneObservation,
  zoneObservationKey,
} from "../packages/villages/src/server/domain/rules/zone-observation.js";
import { applyZoneDayNightDefault } from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { imageEditSupport } from "../packages/villages/src/server/domain/rules/image-edit-support.js";
import { applyVenueSceneChange } from "../packages/villages/src/server/domain/rules/venue-scene-state.js";
import {
  createLocationImages,
  type LocationImagePorts,
} from "../packages/villages/src/server/features/media/location-image-service.js";
import { createVenueCommands } from "../packages/villages/src/server/features/venues/venue-service.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
const image = (id: string) => ({ id, ref: "global-gallery:" + id, url: "/api/global-gallery/file/" + id + ".png" });
function fixture() {
  let state = coerceVillageState({
    ...defaultVillageState(),

    wishSystemVersion: 3,
    seed: "pictures",
    setupAt: "2026-10-29T10:00:00Z",
    foundedAt: "2026-10-29T10:00:00Z",
    venues: [
      venueFixture({
        residentIds: [null].filter((id) => typeof id === "string" && !!id),
        id: "home",
        name: "Hall",
        classes: ["community"],
        layoutVersion: 1,
        zones: [
          {
            ...defaultVenueSpace("community", "White walls. A rust sofa with a cream blanket."),
            id: "living",
            name: "Hall",
            kind: "public",
            seen: true,
            dayNight: false,
            dayNightManual: false,
            image: image("original"),
          },
        ],
      }),
    ],
  });
  let stamp = Date.parse("2026-10-29T12:00:00Z"),
    supported = true,
    fail = false,
    during: (() => Promise<void> | void) | undefined;
  let present = true;
  const calls: Record<string, unknown>[] = [];
  const zone = (id = "living") => state.venues[0].zones!.find((row) => row.id === id)!;
  const ports = {
    canGenerateZonePicture: async (
      _venueId: string,
      zoneId: string,
      guard?: (snapshot: typeof state) => boolean,
      fromObservation = false,
    ) =>
      (present || fromObservation) &&
      (fromObservation ? !!zone(zoneId).observed : zone(zoneId).seen) &&
      (!guard || guard(state)),
    decodeImageDataUrl: () => ({ bytes: new Uint8Array([1]), mime: "image/png" }),
    pictureNow: () => new Date(stamp),
    readVillageState: async () => structuredClone(state),
    mutateVillageState: async (update) => {
      update(state);
      state = coerceVillageState(state);
      return structuredClone(state);
    },
    resolveVillageImageEditing: async () =>
      supported ? { connectionId: "images", multiple: true, signature: "same" } : null,
    resolveVillageImageConnectionId: async () => "images",
    readZonePictureReference: async (source) => ({ dataUrl: "reference:" + source.id, width: 1200, height: 800 }),
    generateVillageImage: async (input) => {
      await input.beforeDispatch?.();
      calls.push(input);
      await during?.();
      if (fail) throw Error("Synthetic image failure");
      return { bytes: new Uint8Array([1]), mime: "image/png", dataUrl: "synthetic" };
    },
    uploadVillageGalleryImage: async () => image("render-" + calls.length),
    assertVenueImageAccess: async () => {},
    readVillageImageLore: async () => "",
    buildVillageSnapshot: async () => ({
      settings: villageSettings(
        state,
        { name: "Player", description: "", personaId: "", missing: false },
        { placeId: "home", zoneId: "living", area: "public", privateOwnerId: "" },
      ),
    }),
    villagesLogger: () => ({ warn() {} }),
  } as unknown as LocationImagePorts;
  const commands = createVenueCommands({
    withSceneNavigation: (work) => work(),
    readVillageState: ports.readVillageState,
    mutateVillageState: ports.mutateVillageState,
    buildVillageSnapshot: ports.buildVillageSnapshot!,
    sceneQueries: () => ({ activeVenueSession: async () => null }),
  });
  ports.setVillageVenueImage = commands.setVillageVenueImage;
  ports.assertVenueImageAccess = commands.assertVenueImageAccess;
  const service = createLocationImages(ports);
  return {
    zone,
    calls,
    service,
    ports,
    world: () => state,
    present: (value: boolean) => {
      present = value;
    },
    advance: (ms: number) => {
      stamp += ms;
    },
    support: (value: boolean) => {
      supported = value;
    },
    fail: (value: boolean) => {
      fail = value;
    },
    during: (work?: typeof during) => {
      during = work;
    },
    dirty: (text: string, id = "living") => {
      zone(id).description += "\n" + text;
      zone(id).picture!.dirty = true;
      if (present) zone(id).observed = captureZoneObservation(state.venues[0], zone(id));
    },
    enter: (id = "living") => {
      if (present && zone(id).seen) zone(id).observed = captureZoneObservation(state.venues[0], zone(id));
      return service.requestZonePicture("home", id);
    },
  };
}
const connection = (imageService: string, model = "") => ({
  id: "images",
  provider: "image_generation",
  imageService,
  model,
});
{
  const f = fixture();
  f.zone().kind = "private-residence";
  f.zone().ownerId = "resident";
  let admissions = 0;
  f.ports.canGenerateZonePicture = async () => {
    admissions++;
    return false;
  };
  const before = structuredClone(f.world());
  await f.service.requestZonePicture("home", "resident");
  assert.equal(admissions, 0, "an owner ID cannot stand in for the exact artwork Zone");
  assert.deepEqual(f.world(), before);
  assert.equal(f.calls.length, 0);
}

{
  const f = fixture();
  const reference = {
    path: "/api/lorebooks/entry-images/11111111-1111-1111-1111-111111111111.png",
    caption: "Blue arches",
  };
  f.ports.readVillageImageLore = async (_ids, _context, _length, _budget, inspect) => {
    inspect?.({
      purpose: "Image",
      stage: "selection",
      budget: 1600,
      omittedDiagnostics: 0,
      entries: [
        { id: "arches", bookId: "world", name: "Arches", match: "setting", status: "included", images: [reference] },
      ],
    });
    return "Arches: Blue arches";
  };
  await f.enter();
  f.dirty("A brass lamp.");
  await f.enter();
  assert.deepEqual(
    f.calls[0].loreImages,
    [reference],
    "Zone editing forwards retained Lorebook images alongside its base picture",
  );
  assert.doesNotMatch(JSON.stringify(f.zone().image?.lore), /entry-images|caption/);
}
for (const replacement of [false, true]) {
  const f = fixture();
  await f.enter();
  f.dirty("A brass lamp.");
  if (replacement) f.support(false);
  const generate = f.ports.generateVillageImage;
  f.ports.generateVillageImage = async (input) => {
    f.zone().freezePicture = true;
    f.zone().pictureRevision!++;
    return generate(input);
  };
  await f.enter();
  assert.equal(
    f.calls.length,
    0,
    "A claim invalidated during reference loading cannot purchase an edit or replacement",
  );
}
{
  const f = fixture();
  await f.enter();
  f.dirty("A new lamp.");
  const entered = Promise.withResolvers<void>(),
    gate = Promise.withResolvers<void>();
  f.ports.readVillageImageLore = async () => {
    entered.resolve();
    await gate.promise;
    return "";
  };
  const pending = f.enter();
  await entered.promise;
  f.zone().freezePicture = true;
  f.zone().pictureRevision!++;
  gate.resolve();
  await pending;
  assert.equal(f.calls.length, 0, "A slow lore read cannot purchase an invalidated artwork edit");
  assert.equal(f.zone().image!.id, "original");
}
{
  const f = fixture();
  await f.enter();
  const before = f.zone().description;
  f.world().venues[0].form = "A restored glass-roofed mall";
  f.zone().picture!.dirty = true;
  await f.enter();
  assert.equal(f.calls.length, 1, "A changed building form updates existing artwork even when Zone prose is unchanged");
  assert.match(String(f.calls[0].prompt), /restored glass-roofed mall/);
  assert.equal(f.zone().description, before);
  assert.equal(f.zone().picture!.dirty, false);
  await f.enter();
  assert.equal(f.calls.length, 1, "The saved architectural image context prevents repeat work");
}
{
  const f = fixture();
  f.dirty("A brass lamp.");
  f.during(() => {
    f.world().venues[0].form = "A different building structure";
    f.zone().picture!.dirty = true;
  });
  await f.enter();
  assert.equal(f.zone().image!.id, "original", "An image admitted before a form change cannot publish afterward");
  assert.equal(f.zone().picture!.dirty, true);
  f.during();
  f.advance(5 * 60_000);
  await f.enter();
  assert.equal(f.calls.length, 2);
  assert.equal(f.zone().image!.id, "render-2");
}
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

{
  const f = fixture();
  await f.enter();
  f.zone().description = "The same white walls and rust sofa, described differently.";
  f.world().sceneryArtStyle = "New style";
  f.world().personalizeVenueImagesByDefault = true;
  await f.enter();
  assert.equal(
    f.calls.length,
    0,
    "legacy artwork, prose edits and style/personality settings do not trigger automatic spending",
  );
  f.zone().state.recent = {
    text: "Cups after tea",
    occurredAt: "2026-10-29T12:00:00Z",
    expiresAt: "2026-10-30T12:00:00Z",
  };
  await f.enter();
  assert.equal(f.calls.length, 0);
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 1, "manual Update can apply a deliberate correction");
  assert.doesNotMatch(String(f.calls[0].prompt), /Cups after tea|New style/);
  assert.deepEqual(f.calls[0].referenceImages, ["reference:original"]);
  await f.enter();
  assert.equal(f.calls.length, 1);
}
{
  const f = fixture();
  const act = (text: string, appearanceChanged: boolean) =>
    applyVenueSceneChange(
      f.world(),
      "home",
      { narration: "The work is done.", expectedRevision: f.zone().state.revision, append: text, appearanceChanged },
      "scene",
      "2026-10-29T12:00:00Z",
      "community",
      "public",
      "",
      "living",
      { actorIds: ["player"], witnessIds: [], consentIds: [], positions: { player: "living" } },
    );
  act("A small incidental scratch.", false);
  await f.enter();
  assert.equal(f.calls.length, 0);
  act("An oak bookcase is installed.", true);
  await f.enter();
  assert.equal(f.calls.length, 1);
  assert.match(String(f.calls[0].prompt), /oak bookcase/);
  assert.equal(f.zone().picture?.dirty, false);
  f.dirty("The wall is now blue.");
  await f.enter();
  assert.equal(f.calls.length, 1, "same-Scene actions retain pending work during the per-Zone pause");
  assert.match(f.zone().picture!.problem!, /limit/);
  f.advance(5 * 60_000);
  await f.enter();
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.calls[1].referenceImages, ["reference:render-1", "reference:original"]);
}
{
  const f = fixture();
  f.dirty("A new lamp.");
  f.support(false);
  await f.enter();
  assert.equal(f.calls.length, 0);
  assert.equal(f.world().zonePictureBudget?.used, 0);
  assert.match(f.zone().picture!.problem!, /connection/);
  f.support(true);
  await f.enter();
  assert.equal(f.calls.length, 1, "support becoming available does not lose the pending update");
  for (let n = 0; n < 5; n++) {
    const room = structuredClone(f.zone());
    room.id = "room-" + n;
    room.image = image(room.id);
    room.picture = { base: room.image, dirty: true, baseline: JSON.stringify({ description: "Empty" }) };
    f.world().venues[0].zones!.push(room);
    await f.enter(room.id);
  }
  assert.equal(f.calls.length, 6);
  assert.equal(f.world().zonePictureBudget?.used, 6);
  f.advance(5 * 60_000);
  f.dirty("A second lamp.");
  await f.enter();
  assert.match(f.zone().picture!.problem!, /limit/);
  f.advance(60 * 60_000);
  await f.enter();
  assert.equal(f.calls.length, 7);
}
{
  const f = fixture();
  f.dirty("A blue rug.");
  f.fail(true);
  await f.enter();
  assert.equal(f.zone().image!.id, "original");
  assert.equal(f.zone().picture?.failed, true);
  f.fail(false);
  f.dirty("A plant.");
  await f.enter();
  assert.equal(f.calls.length, 1, "failed requests require deliberate retry even with further changes");
  f.world().automaticZonePictures = false;
  f.zone().freezePicture = true;
  await f.service.retryZonePicture("home", "living");
  assert.equal(f.calls.length, 2, "manual retry is independent of automatic controls");
  assert.equal(f.zone().freezePicture, true);
  f.zone().picture!.claim = "interrupted";
  f.zone().picture!.dirty = true;
  f.zone().description += " A chair.";
  f.zone().freezePicture = false;
  f.world().automaticZonePictures = true;
  await f.enter();
  assert.equal(f.calls.length, 2);
  assert.equal(f.zone().picture?.failed, true);
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 3);
}
{
  const f = fixture();
  f.zone().image = null;
  f.zone().picture = { base: null };
  f.zone().seen = false;
  await f.enter();
  assert.equal(f.calls.length, 0, "browsing is not an automatic trigger");
  f.zone().seen = true;
  await f.enter();
  assert.equal(f.calls.length, 1, "public Zones use the same initial creation path");
  assert.ok(f.zone().initialImageAttemptedAt);
  await f.enter();
  assert.equal(f.calls.length, 1);
  await f.ports.setVillageVenueImage("home", "living", null, false);
  f.advance(60 * 60_000);
  await f.enter();
  assert.equal(f.calls.length, 1, "automatic work respects explicit removal");
  f.world().automaticZonePictures = false;
  f.zone().freezePicture = true;
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 2, "manual creation is available while frozen or automatic work is disabled");
}
{
  const f = fixture();
  f.zone().image = null;
  f.zone().picture = { base: null };
  f.fail(true);
  await f.enter();
  assert.equal(f.calls.length, 1);
  f.fail(false);
  await f.enter();
  assert.equal(f.calls.length, 1);
  await f.service.retryZonePicture("home", "living");
  assert.equal(f.calls.length, 2, "initial-image failures use the ordinary retry path");
}
{
  const f = fixture();
  f.zone().picture!.context = JSON.stringify({ description: "a".repeat(4000) });
  f.zone().description = "b".repeat(4000);
  f.zone().picture!.dirty = true;
  await f.enter();
  assert.equal(f.calls.length, 0);
  assert.match(f.zone().picture!.problem!, /too long/);
}
{
  const f = fixture();
  f.dirty("A lamp.");
  f.during(() => {
    f.zone().freezePicture = true;
    f.zone().pictureRevision!++;
  });
  await f.enter();
  assert.equal(f.zone().image!.id, "original", "a late result cannot overwrite a freeze");
  assert.equal(f.world().zonePictureBudget!.used, 1, "dispatched requests remain charged to the operational allowance");
}
{
  const f = fixture();
  const other = structuredClone(f.zone());
  other.id = "den";
  f.world().venues[0].zones!.push(other);
  let release!: () => void, started!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const dispatched = new Promise<void>((resolve) => {
    started = resolve;
  });
  f.dirty("A lamp.");
  f.during(async () => {
    started();
    await gate;
  });
  const first = f.enter();
  await dispatched;
  f.dirty("A blue wall.", "den");
  const pending = f.enter("den");
  f.dirty("An oak desk.", "den");
  const joined = f.enter("den");
  f.during();
  release();
  await Promise.all([first, pending, joined]);
  assert.equal(f.calls.length, 2, "queued changes coalesce into one latest target per Zone");
  assert.match(String(f.calls[1].prompt), /blue wall/);
  assert.match(String(f.calls[1].prompt), /oak desk/);
}
{
  for (const replacement of [false, true]) {
    const f = fixture();
    if (!replacement) {
      f.zone().image = null;
      f.zone().picture = { base: null };
    }
    const mutate = f.ports.mutateVillageState;
    let reset = false;
    f.ports.mutateVillageState = async (change) => {
      const result = await mutate(change);
      if (!reset && f.zone().picture?.claim) {
        reset = true;
        f.world().seed = "replacement-world";
        f.world().zonePictureEpoch = 20;
        f.zone().picture = { base: f.zone().image, problem: "New world marker" };
      }
      return result;
    };
    if (replacement)
      await assert.rejects(f.service.generateVillageLocationImage("home", "living", undefined), /scenery changed/);
    else await f.enter();
    assert.equal(f.calls.length, 0, "reset after admission fences fresh creation and Replace before dispatch");
    assert.equal(f.zone().picture?.problem, "New world marker");
  }
}
{
  const f = fixture();
  f.dirty("A blue rug.");
  const mutate = f.ports.mutateVillageState;
  f.ports.mutateVillageState = async (change) => {
    // A losing CAS attempt may execute the pure updater before its successful retry.
    change(structuredClone(f.world()));
    return mutate(change);
  };
  await f.enter();
  assert.equal(f.calls.length, 1);
  assert.equal(f.world().zonePictureBudget?.used, 1, "CAS replay reserves only the committed allowance");
}
{
  const f = fixture();
  f.zone().picture!.context = "malformed saved metadata";
  await f.ports.buildVillageSnapshot!();
  f.dirty("A blue rug.");
  await f.enter();
  assert.equal(f.calls.length, 0);
  assert.match(f.zone().picture!.problem!, /baseline/);
  await f.service.generateVillageLocationImage("home", "living", undefined);
  assert.equal(f.calls.length, 1, "Replace recovers malformed metadata without breaking snapshots");
}
{
  const f = fixture();
  f.zone().picture = {
    base: f.zone().image,
    context: JSON.stringify({ description: f.zone().description }),
    failed: true,
    dirty: true,
    claim: "interrupted",
    problem: "Artwork needs a deliberate retry.",
  };
  await f.enter();
  assert.equal(f.calls.length, 0);
  assert.equal(f.zone().picture?.failed, false, "returning to the pictured state clears a redundant failure");
  assert.equal(f.zone().picture?.claim, undefined);
  assert.equal(f.zone().picture?.problem, undefined);
}
{
  const f = fixture();
  f.fail(true);
  await assert.rejects(f.service.generateVillageLocationImage("home", "living", undefined));
  f.fail(false);
  await f.service.retryZonePicture("home", "living");
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1].referenceImages, undefined, "Retry repeats a failed Replace as fresh generation");
}

{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  assert.equal(f.calls.length, 0, "pairing preference does not purchase images");
  assert.equal(f.zone().picture?.daylight, false, "old artwork is not assumed to depict daytime");
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 2);
  assert.equal(f.zone().image?.id, "render-1");
  assert.equal(f.zone().picture?.base?.id, "original");
  assert.deepEqual(f.calls[1].referenceImages, ["reference:render-1"], "night derives only from the new day image");
  assert.equal(f.zone().picture?.night?.sourceId, "render-1");
  await f.service.setZonePictureFrozen("home", "living", true);
  const frozen = await f.ports.buildVillageSnapshot!();
  assert.equal(
    frozen.settings.venues[0].zones!.find((z) => z.id === "living")?.nightImage?.id,
    "render-2",
    "Freeze does not invalidate a completed pair",
  );
  await f.service.setZonePictureFrozen("home", "living", false);
  f.dirty("An oak desk replaces the sofa.");
  await f.enter();
  assert.equal(f.calls.length, 4);
  assert.equal(f.zone().picture?.night?.sourceId, "render-3", "a physical update derives a new companion");
  const pending = await f.ports.buildVillageSnapshot!();
  assert.equal(pending.settings.venues[0].zones!.find((z) => z.id === "living")?.nightImage?.id, "render-4");
  await f.enter();
  assert.equal(f.calls.length, 4, "a completed pair is reused");
  f.advance(5 * 60_000);
  await createLocationImages(f.ports).requestZonePicture("home", "living");
  assert.equal(f.calls.length, 4, "the pending night stage survives a service restart");
  assert.deepEqual(f.calls[3].referenceImages, ["reference:render-3"]);
  assert.equal(f.world().zonePictureBudget?.used, 2, "each automatic image consumes its own allowance");
}
{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  f.during(() => {
    if (f.calls.length === 2) f.fail(true);
  });
  await assert.rejects(f.service.updateZonePicture("home", "living"));
  assert.equal(f.zone().image?.id, "render-1", "a night failure retains the successful physical edit");
  assert.equal(f.zone().picture?.operation, "night");
  await f.enter();
  assert.equal(f.calls.length, 2, "automatic work does not retry a failed night generation");
  f.fail(false);
  f.during();
  await createLocationImages(f.ports).retryZonePicture("home", "living");
  assert.equal(f.calls.length, 3, "Retry purchases only night, never the completed day edit");
  assert.deepEqual(f.calls[2].referenceImages, ["reference:render-1"]);
}
{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  f.during(() => {
    if (f.calls.length === 2) f.dirty("A new blue wall.");
  });
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.zone().picture?.night, undefined, "a changed physical account fences a late night result");
}
{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  await f.service.updateZonePicture("home", "living");
  await f.ports.setVillageVenueImage("home", "living", image("uploaded"), false);
  assert.equal(f.zone().dayNight, true, "artwork replacement does not change automatic lighting behavior");
  assert.equal(f.zone().picture?.night, undefined);
  assert.equal(f.calls.length, 2);
}

{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  f.during(() => {
    if (f.calls.length === 1) {
      f.zone().freezePicture = true;
      f.zone().pictureRevision!++;
    }
  });
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 1, "Freeze during the day edit cannot purchase a companion after discarding it");
}
{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  await f.service.updateZonePicture("home", "living");
  f.zone().picture!.night = undefined;
  f.zone().observed!.night = undefined;
  f.during(() => {
    f.zone().freezePicture = true;
    f.zone().pictureRevision!++;
  });
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 3, "a discarded night result must not dispatch a second night request");
  assert.equal(f.zone().picture?.night, undefined);
}
console.log(
  "Zone artwork: material changes, coalescing, operational budgets, generic creation, update/retry, opt-outs and stale-result fences passed.",
);

{
  const f = fixture();
  f.zone().dayNight = false;
  f.zone().dayNightManual = false;
  const update = (dayNight: boolean, append = "A new skylight admits daylight.") =>
    applyVenueSceneChange(
      f.world(),
      "home",
      {
        narration: "The supported work is complete.",
        expectedRevision: f.zone().state.revision,
        append,
        appearanceChanged: true,
        dayNight,
      },
      "scene",
      "2026-10-29T12:00:00Z",
      "community",
      "public",
      "",
      "living",
      { actorIds: ["player"], witnessIds: [], consentIds: [], positions: { player: "living" } },
    );
  update(true);
  assert.equal(
    f.zone().dayNight,
    true,
    "existing physical update carries its daylight decision without another request",
  );
  assert.equal(f.zone().dayNightManual, false);
  assert.equal(f.calls.length, 0, "classification itself never buys artwork");
  assert.equal(coerceVillageState(f.world()).venues[0].zones!.find((z) => z.id === "living")!.dayNightManual, false);
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  assert.equal(f.zone().dayNightManual, false, "lighting has no manual override");
  update(false, "The skylight is covered permanently.");
  assert.equal(f.zone().dayNight, false, "lighting follows the complete revised physical account");
  assert.throws(() => update("yes" as unknown as boolean), /physical change could not be recorded/);
}
{
  const f = fixture();
  f.zone().dayNightManual = false;
  f.zone().picture!.claim = "old-in-flight-image";
  const revision = f.zone().pictureRevision ?? 0;
  applyZoneDayNightDefault(f.zone(), true);
  assert.equal(f.zone().picture!.claim, undefined);
  assert.equal(f.zone().pictureRevision, revision + 1, "an inferred mode change fences outstanding artwork");
  for (const dayNight of [false, true]) {
    const saved = structuredClone(f.world());
    const old = saved.venues[0].zones!.find((z) => z.id === "living")!;
    old.dayNight = dayNight;
    delete old.dayNightManual;
    const restored = coerceVillageState(saved).venues[0].zones!.find((z) => z.id === "living")!;
    applyZoneDayNightDefault(restored, !dayNight);
    assert.equal(restored.dayNight, !dayNight, "old manual preferences no longer pin lighting");
    assert.equal(restored.dayNightManual, false);
  }
}
{
  const f = fixture();
  f.dirty("The wall is newly painted yellow.");
  await f.service.updateZonePicture("home", "living");
  assert.match(String(f.calls[0].prompt), /stable daytime lighting/);
  assert.match(String(f.calls[0].prompt), /Ignore the current clock/);
  assert.equal(f.calls.length, 1, "unpaired image updates remain one operation");
  assert.equal(f.zone().picture!.daylight, true);
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 2, "enabling pairing after a daytime edit buys only its night companion");
  assert.deepEqual(f.calls[1].referenceImages, ["reference:render-1"]);
}

{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  f.present(false);
  const oldImage = f.zone().image!.id;
  await f.service.storeVillageVenueImage("home", "living", "data:image/png;base64,AA==");
  assert.equal(f.zone().image!.id, oldImage, "an upload never becomes a backdrop");
  assert.equal(f.zone().picture?.reference?.id, "render-0");
  assert.equal(f.calls.length, 0, "saving a reference is model-free");
  await f.enter();
  await f.service.generateVillageLocationImage("home", "living", undefined);
  assert.equal(f.calls.length, 2, "Generate new can use the observed account after leaving");
  f.present(true);
  await f.enter();
  assert.equal(f.calls.length, 2, "a visit creates the canonical day and its night companion");
  assert.deepEqual(f.calls[0].referenceImages, ["reference:render-0"]);
  assert.match(String(f.calls[0].prompt), /artistic reference only/);
  assert.match(String(f.calls[0].prompt), /White walls/);
  assert.deepEqual(
    f.calls[1].referenceImages,
    ["reference:render-1"],
    "night never relights the uploaded reference directly",
  );
  assert.equal(f.zone().picture?.referenceAppliedId, "render-0");
  assert.equal(
    coerceVillageState(f.world()).venues[0].zones!.find((z) => z.id === "living")!.picture?.reference?.id,
    "render-0",
  );
}
{
  const f = fixture();
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  f.during(() => f.present(false));
  await f.service.generateVillageLocationImage("home", "living", undefined);
  assert.equal(f.calls.length, 2, "an observed manual pair can finish after departure");
  assert.equal(f.zone().image?.id, "render-1", "the admitted result remains reusable after departure");
  assert.equal(f.zone().picture?.night?.sourceId, "render-1");
}
{
  const f = fixture();
  f.dirty("A green wall.");
  f.ports.readVillageImageLore = async () => {
    f.present(false);
    return "";
  };
  await f.enter();
  assert.equal(f.calls.length, 0, "departure while loading references/lore is checked before dispatch");
}
{
  const f = fixture();
  f.present(false);
  const before = f.zone().observed!;
  f.zone().description = "UNSEEN_SECRET furniture";
  f.zone().roomSpecification = "UNSEEN_SECRET room";
  f.zone().purpose = "UNSEEN_SECRET purpose";
  f.zone().state = { revision: 9, updatedAt: "2026-11-05T00:00:00Z", recent: null };
  f.zone().picture!.dirty = true;
  const entrance = f.zone("exterior");
  entrance.description = "UNSEEN_SECRET entrance";
  f.world().venues[0].description = entrance.description;
  f.world().venues[0].form = "UNSEEN_SECRET architecture";
  f.world().venues[0].presentation.image = image("UNSEEN_SECRET-image");
  const projected = (await f.ports.buildVillageSnapshot!()).settings.venues[0];
  assert.doesNotMatch(JSON.stringify(projected), /UNSEEN_SECRET/);
  assert.equal(projected.spaces![0].description, before.description);
  assert.equal(projected.zones!.find((z) => z.id === "living")!.pictureGenerateAvailable, true);
  const restored = coerceVillageState(JSON.parse(JSON.stringify(f.world())));
  assert.deepEqual(
    restored.venues[0].zones!.find((z) => z.id === "living")!.observed,
    before,
    "observations survive saved-world roundtrips",
  );
}
{
  const f = fixture();
  const scene = coerceSession({
    version: 4,
    id: "visit",
    villageSeed: f.world().seed,
    placeId: "home",
    zoneId: "living",
    status: "active",
    area: "public",
    startedAt: "2026-11-05T12:00:00Z",
  });
  let moveDuringRead = false;
  const live = createLiveScenes({
    readActive: async () => ({ sessionId: "visit", placeId: "home" }),
    readSession: async () => structuredClone(scene),
    readVillageState: async () => {
      if (moveDuringRead) scene.zoneId = "exterior";
      return structuredClone(f.world());
    },
  } as LiveScenePorts);
  assert.equal(await live.canGenerateZonePicture("home", "living"), true);
  const entrance = f.zone("exterior"),
    ledger = f.world().venues[0].access;
  entrance.observed = captureZoneObservation(f.world().venues[0], entrance);
  scene.zoneId = "exterior";
  assert.equal(await live.canGenerateZonePicture("home", "exterior"), true);
  delete f.world().venues[0].access;
  for (const zoneId of ["living", "exterior"]) {
    scene.zoneId = zoneId;
    assert.equal(
      await live.canGenerateZonePicture("home", zoneId),
      false,
      "egress does not authorize an artwork purchase without native authority",
    );
  }
  f.world().venues[0].access = ledger;
  scene.zoneId = "living";
  scene.operation = { status: "running" } as typeof scene.operation;
  assert.equal(
    await live.canGenerateZonePicture("home", "living"),
    false,
    "running Scene work cannot purchase artwork",
  );
  scene.operation = { status: "complete" } as typeof scene.operation;
  assert.equal(await live.canGenerateZonePicture("home", "living"), true);
  scene.operation = { status: "interrupted" } as typeof scene.operation;
  assert.equal(
    await live.canGenerateZonePicture("home", "living"),
    false,
    "cancelled/held work cannot purchase artwork",
  );
  scene.operation = undefined;
  assert.equal(await live.canGenerateZonePicture("home", "exterior"), false);
  moveDuringRead = true;
  assert.equal(await live.canGenerateZonePicture("home", "living"), false, "movement in the same Scene is rechecked");
  moveDuringRead = false;
  scene.zoneId = "living";
  scene.status = "closed";
  assert.equal(await live.canGenerateZonePicture("home", "living"), false);
  assert.equal(
    await live.canGenerateZonePicture("home", "living", undefined, true),
    true,
    "a closed visit still has a valid remembered account",
  );
  f.zone().seen = false;
  assert.equal(await live.canGenerateZonePicture("home", "living", undefined, true), true);
  assert.equal(await live.canGenerateZonePicture("home", "living", () => false, true), false);
  f.zone().seen = true;
  scene.status = "active";
  f.zone().description += " Unobserved physical change.";
  assert.equal(
    await live.canGenerateZonePicture("home", "living"),
    false,
    "a held observation cannot buy current hidden facts",
  );
  f.zone().observed = captureZoneObservation(f.world().venues[0], f.zone());
  const clockFailure = new Error("Clock authority could not be read");
  const release = configureVillageClock({
    observe: async () => {
      throw clockFailure;
    },
  } as VillageClockAuthority);
  try {
    await assert.rejects(live.canGenerateZonePicture("home", "living"), (error) => error === clockFailure);
    await assert.rejects(
      live.canGenerateZonePicture("home", "living", undefined, true),
      (error) => error === clockFailure,
      "Historical artwork also requires clock observation",
    );
  } finally {
    release();
  }
}

{
  const f = fixture();
  f.zone().dayNight = false;
  f.zone().dayNightManual = true;
  f.zone().picture!.night = { sourceId: f.zone().image!.id, image: image("old-night") };
  delete f.zone().observed;
  const scene = coerceSession({
    version: 4,
    id: "archived",
    villageSeed: f.world().seed,
    placeId: "home",
    zoneId: "living",
    status: "closed",
    startedAt: "2026-11-05T20:00:00Z",
  });
  scene.continuity = captureSceneContinuity(f.world(), scene, Date.parse(scene.startedAt));
  const restored = coerceSession(JSON.parse(JSON.stringify(scene)));
  const captured = restored.continuity!.facts.venues[0].zones!.find((zone) => zone.id === "living")!;
  assert.equal(captured.dayNight, false, "closed Scene lighting retains its captured manual-Off contract");
  assert.equal(captured.observed?.dayNight, false);
  assert.equal(
    coerceVillageState(f.world()).venues[0].zones!.find((zone) => zone.id === "living")!.dayNight,
    true,
    "only the live world adopts standard pairing",
  );
}

{
  const f = fixture();
  const venue = f.world().venues[0];
  venue.form = "A known brick cottage";
  f.zone().dayNight = true;
  f.zone().observed = captureZoneObservation(venue, f.zone());
  const known = structuredClone(f.zone().observed!);
  const key = zoneObservationKey(known);
  f.present(false);
  Object.assign(f.zone(), {
    description: "SECRET_NEW_FURNITURE",
    name: "SECRET_NEW_NAME",
    purpose: "SECRET_NEW_USE",
    roomSpecification: "SECRET_NEW_SPEC",
    dayNight: false,
    closed: true,
    preparation: { status: "failed" },
    image: image("SECRET_NEW_PHOTO"),
  });
  venue.form = "SECRET_NEW_ARCHITECTURE";
  venue.description = "SECRET_NEW_APPROACH";
  venue.venueType = "SECRET_NEW_TYPE";
  f.zone().picture = {
    base: image("SECRET_NEW_ANCHOR"),
    context: JSON.stringify({ description: "SECRET_NEW_ACCOUNT" }),
    reference: image("player-reference"),
    dirty: true,
  };
  ensureNarrative(f.world(), "2026-11-05T12:00:00.000Z").situations.push({
    id: "secret",
    revision: 0,
    title: "A changed room",
    summary: "SECRET_NEW_CIRCUMSTANCE",
    status: "active",
    scope: "zone",
    targets: [{ venueId: "home", zoneId: "living" }],
    updatedAt: "2026-11-05T12:00:00.000Z",
  });
  f.ports.readVillageImageLore = async () => {
    throw Error("Observed generation must not expand live Lore");
  };
  const result = await createLocationImages(f.ports).generateVillageLocationImage("home", "living", undefined);
  assert.equal(f.calls.length, 2, "an absent player can explicitly regenerate the remembered day/night pair");
  assert.doesNotMatch(JSON.stringify(f.calls), /SECRET_NEW/);
  assert.match(String(f.calls[0].prompt), /White walls|known brick cottage/);
  assert.deepEqual(f.calls[0].referenceImages, ["reference:player-reference"]);
  assert.deepEqual(f.calls[1].referenceImages, ["reference:render-1"]);
  assert.equal(
    zoneObservationKey(f.zone().observed!),
    key,
    "manual rendering changes no observation facts or lighting",
  );
  assert.equal(f.zone().description, "SECRET_NEW_FURNITURE");
  assert.equal(f.zone().dayNight, false);
  assert.equal(f.zone().picture?.context, known.context);
  assert.equal(f.zone().picture?.dirty, true, "unseen physical changes remain pending");
  const shown = result.settings.venues[0].zones!.find((zone) => zone.id === "living")!;
  assert.equal(shown.description, known.description);
  assert.equal(shown.name, known.name);
  assert.equal(shown.roomSpecification, known.roomSpecification);
  assert.equal(shown.dayNight, true);
  assert.equal(shown.pictureGenerateAvailable, true);
  f.ports.readVillageImageLore = async () => "";
  f.zone().preparation = undefined;
  f.zone().closed = false;
  f.present(true);
  f.advance(60 * 60_000);
  await f.enter();
  assert.equal(f.calls.length, 3, "a later visit updates the still-dirty live room with its constant lighting");
  assert.match(String(f.calls[2].prompt), /SECRET_NEW_FURNITURE/);
  assert.equal(f.zone().picture?.dirty, false);
}
{
  const f = fixture();
  f.present(false);
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  f.during(() => {
    if (f.calls.length === 2) f.fail(true);
  });
  await assert.rejects(f.service.generateVillageLocationImage("home", "living", undefined));
  assert.equal(f.zone().image?.id, "render-1");
  f.fail(false);
  f.during();
  f.zone().description = "SECRET_LATER_ROOM";
  await f.service.retryZonePicture("home", "living");
  assert.equal(f.calls.length, 3, "off-screen Retry purchases only the unfinished observed night");
  assert.deepEqual(f.calls[2].referenceImages, ["reference:render-1"]);
  assert.doesNotMatch(String(f.calls[2].prompt), /SECRET_LATER_ROOM/);
}
{
  const f = fixture();
  f.present(false);
  f.during(() => {
    f.zone().observed!.purpose = "A newly observed purpose";
  });
  await assert.rejects(f.service.generateVillageLocationImage("home", "living", undefined), /changed/);
  assert.equal(f.calls.length, 1);
  assert.equal(
    f.zone().image?.id,
    "original",
    "a newer observation fences a late manual result even with the same description",
  );
}
{
  const f = fixture();
  f.present(false);
  f.zone().dayNight = true;
  f.zone().observed!.dayNight = true;
  const save = f.ports.setVillageVenueImage;
  f.ports.setVillageVenueImage = async (...args) => {
    const saved = await save(...args);
    f.zone().observed!.purpose = "A newer observation after day completed";
    return saved;
  };
  await createLocationImages(f.ports).generateVillageLocationImage("home", "living", undefined);
  assert.equal(f.calls.length, 1, "the night continuation is bound to the committed day's observation");
}
{
  const f = fixture();
  f.present(false);
  f.zone().seen = false;
  const known = structuredClone(f.zone().observed!);
  f.zone().description = "SECRET new couch";
  f.zone().purpose = "SECRET current purpose";
  f.zone().roomSpecification = "SECRET current specification";
  f.world().venues[0].form = "SECRET new architecture";
  f.zone().state = { revision: 2, updatedAt: "2026-11-05T12:00:00Z", recent: null };
  const physical = f.zone().description;
  await f.service.generateVillageLocationImage("home", "living", undefined);
  assert.equal(f.calls.length, 1, "an unvisited Zone can render its authored appearance");
  assert.ok(String(f.calls[0].prompt).includes(known.description));
  assert.doesNotMatch(JSON.stringify(f.calls), /SECRET/);
  assert.equal(f.zone().seen, false, "artwork does not record a visit");
  assert.equal(f.zone().description, physical, "artwork does not change physical facts");
  const projected = (await f.ports.buildVillageSnapshot!()).settings.venues[0].zones!.find((z) => z.id === "living")!;
  assert.equal(projected.image?.id, "render-1");
  assert.equal(projected.pictureGenerateAvailable, true);
  assert.doesNotMatch(JSON.stringify(projected), /SECRET/);
  f.zone().closed = true;
  f.zone().preparation = { status: "pending" };
  f.zone().dayNight = true;
  await f.service.storeVillageVenueImage("home", "living", "synthetic-reference");
  assert.equal(f.zone().picture?.reference?.id, "render-1");
  await f.ports.setVillageVenueImage("home", "living", null, false, undefined, false, undefined, true);
  assert.equal(f.zone().observed!.image, null, "Remove remains cosmetic while a Zone is unavailable");
  assert.equal(f.zone().observed!.dayNight, false, "Remove does not reveal unseen lighting changes");
  assert.equal(f.zone().seen, false);
  assert.equal(f.zone().description, physical);
}
{
  const f = fixture();
  const raw = structuredClone(f.world());
  const venue = raw.venues[0],
    zone = venue.zones!.find((z) => z.id === "living")!;
  zone.seen = false;
  delete zone.observed;
  zone.picture = {
    base: zone.image,
    context: JSON.stringify({ description: "Original Founding sofa.", form: "Original house." }),
    daylight: true,
    dirty: true,
  };
  venue.form = "SECRET renovated form";
  zone.description = "SECRET new couch";
  zone.purpose = "SECRET purpose";
  zone.roomSpecification = "SECRET room specification";
  zone.state = { revision: 3, updatedAt: "2026-11-05T12:00:00Z", recent: null };
  const restored = coerceVillageState(raw);
  const known = restored.venues[0].zones!.find((z) => z.id === "living")!;
  assert.equal(known.observed!.description, "Original Founding sofa.");
  assert.equal(known.observed!.form, "Original house.");
  assert.equal(known.observed!.image?.id, "original");
  assert.equal(known.seen, false);
  assert.doesNotMatch(JSON.stringify(known.observed), /SECRET/);
  assert.deepEqual(
    coerceVillageState(restored).venues[0].zones!.find((z) => z.id === "living")!.observed,
    known.observed,
  );
  delete zone.picture;
  const unknown = coerceVillageState(raw).venues[0].zones!.find((z) => z.id === "living")!;
  assert.equal(unknown.observed!.description, "", "a synthesized live baseline cannot establish known facts");
  assert.equal(unknown.observed!.image, null);
  assert.doesNotMatch(JSON.stringify(unknown.observed), /SECRET/);
  await f.ports.mutateVillageState((state) => Object.assign(state, coerceVillageState(raw)));
  f.present(false);
  await f.service.generateVillageLocationImage("home", "living", undefined);
  assert.ok(f.calls.length > 0, "public Zone identity permits manual artwork without a historical account");
  assert.doesNotMatch(JSON.stringify(f.calls), /SECRET/);
  assert.equal(f.zone().seen, false);
}

{
  const f = fixture();
  f.present(false);
  f.zone().observed!.dayNight = true;
  f.zone().observed!.daylight = true;
  f.zone().observed!.pictureContext = f.zone().observed!.context;
  f.zone().observed!.night = undefined;
  const day = f.zone().observed!.image!;
  f.zone().image = image("SECRET-B");
  f.zone().description = "SECRET-B room";
  const prior = {
    base: f.zone().image,
    context: JSON.stringify({ description: f.zone().description }),
    daylight: true,
    night: { sourceId: "SECRET-B", image: image("SECRET-B-night") },
    failed: true,
    operation: "night" as const,
  };
  f.zone().picture = structuredClone(prior);
  const result = await f.service.retryZonePicture("home", "living");
  assert.equal(f.calls.length, 1);
  assert.deepEqual(f.calls[0].referenceImages, ["reference:" + day.id]);
  assert.doesNotMatch(JSON.stringify(f.calls), /SECRET-B/);
  assert.equal(
    f.zone().observed!.image?.id,
    day.id,
    "night-only completion never copies a newer live day into history",
  );
  assert.equal(f.zone().observed!.night?.sourceId, day.id);
  assert.equal(f.zone().image?.id, "SECRET-B");
  assert.equal(f.zone().picture?.night?.image.id, "SECRET-B-night", "the unseen live pair remains intact");
  assert.equal(f.zone().picture?.failed, true, "a historical retry does not clear another image's held failure");
  const shown = result.settings.venues[0].zones!.find((zone) => zone.id === "living")!;
  assert.equal(shown.image?.id, day.id);
  assert.equal(shown.nightImage?.id, "render-1");
  assert.equal(shown.pictureRetryAvailable, false);
}
for (const failed of [false, true]) {
  const f = fixture();
  f.present(false);
  f.zone().observed!.dayNight = true;
  f.zone().observed!.daylight = true;
  f.zone().observed!.pictureContext = f.zone().observed!.context;
  f.zone().image = image("SECRET-B");
  f.zone().picture = {
    base: f.zone().image,
    context: f.zone().observed!.context,
    daylight: true,
    dirty: false,
    failed: true,
    operation: "night",
  };
  f.fail(failed);
  f.during(() => f.dirty("SECRET-C added during historical night"));
  const request = f.service.retryZonePicture("home", "living");
  if (failed) await assert.rejects(request, /Synthetic image failure/);
  else await request;
  assert.equal(f.calls.length, 1);
  assert.equal(f.zone().image?.id, "SECRET-B");
  assert.equal(f.zone().picture?.dirty, true, "historical night restoration retains concurrent physical changes");
  assert.equal(f.zone().observed!.night?.image.id, failed ? undefined : "render-1");
  assert.doesNotMatch(JSON.stringify(f.zone().observed), /SECRET-B|SECRET-C/);
}
{
  const f = fixture();
  f.present(false);
  f.zone().observed!.dayNight = true;
  f.zone().observed!.daylight = true;
  delete f.zone().observed!.pictureContext;
  f.zone().picture = {
    base: f.zone().image,
    context: f.zone().observed!.context,
    daylight: true,
    operation: "night",
    failed: true,
  };
  await f.ports.mutateVillageState(() => {});
  assert.equal(
    f.zone().observed!.pictureContext,
    f.zone().picture?.context,
    "legacy context is recovered only for the same saved image",
  );
  await f.service.retryZonePicture("home", "living");
  assert.equal(f.calls.length, 1, "a retained legacy failed-night save does not buy another day");
  assert.deepEqual(f.calls[0].referenceImages, ["reference:original"]);
}

{
  const f = fixture();
  f.present(false);
  const startedA = Promise.withResolvers<void>(),
    releaseA = Promise.withResolvers<void>();
  const startedB = Promise.withResolvers<void>(),
    releaseB = Promise.withResolvers<void>();
  f.during(async () => {
    if (f.calls.length === 1) {
      startedA.resolve();
      await releaseA.promise;
    } else {
      startedB.resolve();
      await releaseB.promise;
    }
  });
  const first = f.service.generateVillageLocationImage("home", "living", undefined);
  const rejected = assert.rejects(first, /changed/);
  await startedA.promise;
  f.zone().observed!.purpose = "Newly observed use";
  const second = createLocationImages(f.ports).generateVillageLocationImage("home", "living", undefined);
  await startedB.promise;
  const claim = f.zone().picture!.claim;
  releaseA.resolve();
  await rejected;
  assert.equal(f.zone().picture!.claim, claim, "stale observation work cannot clear another activation's newer claim");
  assert.equal(f.zone().picture!.failed, false);
  releaseB.resolve();
  await second;
  assert.equal(f.zone().image?.id, "render-2");
}
