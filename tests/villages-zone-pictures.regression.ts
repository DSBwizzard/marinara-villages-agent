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
    version: 8,
    wishSystemVersion: 3,
    seed: "pictures",
    foundedAt: "2026-10-29T10:00:00Z",
    venues: [
      {
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
            image: image("original"),
          },
        ],
      },
    ],
  });
  let stamp = Date.parse("2026-10-29T12:00:00Z"),
    supported = true,
    fail = false,
    during: (() => Promise<void> | void) | undefined;
  const calls: Record<string, unknown>[] = [];
  const zone = (id = "living") => state.venues[0].zones!.find((row) => row.id === id)!;
  const ports = {
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
      calls.push(input);
      await during?.();
      if (fail) throw Error("Synthetic image failure");
      return { bytes: new Uint8Array([1]), mime: "image/png", dataUrl: "synthetic" };
    },
    uploadVillageGalleryImage: async () => image("render-" + calls.length),
    assertVenueImageAccess: async () => {},
    readVillageVisualLore: async () => "",
    buildVillageSnapshot: async () => ({
      settings: villageSettings(state, { name: "Player", description: "", personaId: "", missing: false }, null),
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
console.log(
  "Zone artwork: material changes, coalescing, operational budgets, generic creation, update/retry, opt-outs and stale-result fences passed.",
);
