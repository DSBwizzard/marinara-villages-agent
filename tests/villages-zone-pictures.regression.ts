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
import { captureZoneObservation } from "../packages/villages/src/server/domain/rules/zone-observation.js";
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
    canGenerateZonePicture: async (_venueId: string, zoneId: string) => present && zone(zoneId).seen,
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
  ports.setVillageVenueImage = createVenueCommands({
    withSceneNavigation: (work) => work(),
    readVillageState: ports.readVillageState,
    mutateVillageState: ports.mutateVillageState,
    buildVillageSnapshot: ports.buildVillageSnapshot!,
    sceneQueries: () => ({ activeVenueSession: async () => null }),
  }).setVillageVenueImage;
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
    enter: (id = "living") => service.requestZonePicture("home", id),
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
  await f.ports.setVillageVenueImage("home", null, undefined, "", false, "living");
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
      await assert.rejects(
        f.service.generateVillageLocationImage("home", undefined, undefined, "", false, "living"),
        /scenery changed/,
      );
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
  await f.service.generateVillageLocationImage("home", undefined, undefined, "", false, "living");
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
  await assert.rejects(f.service.generateVillageLocationImage("home", undefined, undefined, "", false, "living"));
  f.fail(false);
  await f.service.retryZonePicture("home", "living");
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1].referenceImages, undefined, "Retry repeats a failed Replace as fresh generation");
}

{
  const f = fixture();
  f.zone().dayNight = true;
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
  f.during(() => {
    if (f.calls.length === 2) f.dirty("A new blue wall.");
  });
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.zone().picture?.night, undefined, "a changed physical account fences a late night result");
}
{
  const f = fixture();
  f.zone().dayNight = true;
  await f.service.updateZonePicture("home", "living");
  await f.ports.setVillageVenueImage("home", image("uploaded"), undefined, "", false, "living");
  assert.equal(f.zone().dayNight, true, "artwork replacement does not change automatic lighting behavior");
  assert.equal(f.zone().picture?.night, undefined);
  assert.equal(f.calls.length, 2);
}

{
  const f = fixture();
  f.zone().dayNight = true;
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
  await f.service.updateZonePicture("home", "living");
  f.zone().picture!.night = undefined;
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
  await f.service.updateZonePicture("home", "living");
  assert.equal(f.calls.length, 2, "enabling pairing after a daytime edit buys only its night companion");
  assert.deepEqual(f.calls[1].referenceImages, ["reference:render-1"]);
}

{
  const f = fixture();
  f.zone().dayNight = true;
  f.present(false);
  const oldImage = f.zone().image!.id;
  await f.service.storeVillageVenueImage("home", "data:image/png;base64,AA==", undefined, "", "living");
  assert.equal(f.zone().image!.id, oldImage, "an upload never becomes a backdrop");
  assert.equal(f.zone().picture?.reference?.id, "render-0");
  assert.equal(f.calls.length, 0, "saving a reference is model-free");
  await f.enter();
  await assert.rejects(
    f.service.generateVillageLocationImage("home", undefined, undefined, "", false, "living"),
    /Visit this Zone/,
  );
  assert.equal(f.calls.length, 0, "browsing and Generate new cannot reveal an absent Zone");
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
  f.during(() => f.present(false));
  await f.service.generateVillageLocationImage("home", undefined, undefined, "", false, "living");
  assert.equal(f.calls.length, 1, "leaving after day completes prevents a night purchase");
  assert.equal(f.zone().image?.id, "render-1", "the admitted result remains reusable after departure");
  assert.equal(f.zone().picture?.night, undefined);
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
  assert.equal(projected.zones!.find((z) => z.id === "living")!.pictureGenerateAvailable, false);
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
    version: 3,
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
  scene.status = "active";
  f.zone().description += " Unobserved physical change.";
  assert.equal(
    await live.canGenerateZonePicture("home", "living"),
    false,
    "a held observation cannot buy current hidden facts",
  );
  f.zone().observed = captureZoneObservation(f.world().venues[0], f.zone());
  const release = configureVillageClock({ observe: async () => ({ paused: true }) } as VillageClockAuthority);
  try {
    assert.equal(await live.canGenerateZonePicture("home", "living"), false, "paused Scenes cannot dispatch imagery");
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
    version: 3,
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
