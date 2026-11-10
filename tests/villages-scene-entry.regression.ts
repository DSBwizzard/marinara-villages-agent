// Test cases: scene-entry/native-escort, scene-entry/invalid-permission, scene-entry/policy-escort, scene-entry/escort-route
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { applyAccessCommand, evaluateZoneAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  sceneAccessContext,
  sceneMoveAccompanying,
  contactCanEnter,
} from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-11-10T12:00:00.000Z";
function fixture() {
  const venue = venueFixture({
    id: "mill",
    zones: [
      {
        ...defaultVenueSpace("other"),
        id: "workshop",
        name: "Workshop",
        kind: "restricted",
        connectedTo: ["exterior"],
        access: {
          mode: "permission-required",
          managerIds: ["jim"],
          memberIds: ["jim"],
          memberRoles: [],
          inviterIds: ["jim"],
          visitorHours: "always",
          accompanied: false,
        },
      },
    ],
  });
  const scene = coerceSession({
    version: 5,
    id: "current-visit",
    villageSeed: "entry-test",
    startedAt: at,
    placeId: venue.id,
    zoneId: "exterior",
    status: "active",
    accompanying: [{ characterId: "jim", zoneId: "exterior" }],
  });
  const zone = venue.zones!.find((zone) => zone.id === "workshop")!;
  applyAccessCommand(
    venue,
    {
      action: "invite",
      operationId: "spoken-invitation",
      expectedRevision: venue.access!.revision,
      zoneId: zone.id,
      visitorId: "player",
      duration: "visit",
      sceneId: scene.id,
      accompanied: true,
      outsideHours: false,
    },
    "jim",
    at,
    ["jim", "player"],
    ["actual-spoken-line"],
  );
  const state = defaultVillageState();
  state.seed = scene.villageSeed!;
  state.venues = [venue];
  return { state, venue, zone, scene, grant: venue.access!.permissions[0] };
}

await runCase("scene-entry/native-escort", () => {
  const { state, venue, zone, scene } = fixture(),
    before = JSON.stringify({ venue, scene });
  assert.equal(evaluateZoneAccess(venue, zone, "player", sceneAccessContext(scene)).reason, "accompaniment-required");
  const accompanying = sceneMoveAccompanying(scene, venue, zone, state);
  assert.deepEqual(accompanying, [{ characterId: "jim", zoneId: zone.id }]);
  assert(evaluateZoneAccess(venue, zone, "player", sceneAccessContext({ ...scene, accompanying })).allowed);
  assert.equal(
    JSON.stringify({ venue, scene }),
    before,
    "previewing entry changes neither positions nor native authority",
  );
});

await runCase("scene-entry/invalid-permission", () => {
  for (const invalid of [
    "revoked",
    "different-visit",
    "different-visitor",
    "different-zone",
    "departed",
    "elsewhere",
    "lost-authority",
    "banned",
    "refused",
    "outside-hours",
  ]) {
    const { state, venue, zone, scene, grant } = fixture();
    if (invalid === "revoked") grant.revoked = true;
    if (invalid === "different-visit") grant.sceneId = "another-visit";
    if (invalid === "different-visitor") grant.visitorId = "another-visitor";
    if (invalid === "different-zone") grant.zoneId = "another-zone";
    if (invalid === "departed") scene.departedIds = ["jim"];
    if (invalid === "elsewhere") scene.accompanying![0].zoneId = "another-zone";
    if (invalid === "lost-authority") {
      zone.access!.managerIds = [];
      zone.access!.inviterIds = [];
      venue.access!.managerIds = [];
    }
    if (invalid === "banned")
      venue.access!.bans.push({
        id: "ban",
        zoneId: zone.id,
        visitorId: "player",
        issuerId: "jim",
        active: true,
        issuedAt: at,
        sourceLineIds: ["ban-line"],
      });
    if (invalid === "refused")
      venue.access!.visitDenials.push({ zoneId: zone.id, visitorId: "player", sceneId: scene.id, issuerId: "jim" });
    if (invalid === "outside-hours") zone.access!.visitorHours = [{ days: ["Monday"], start: "18:00", end: "19:00" }];
    const accompanying = sceneMoveAccompanying(scene, venue, zone, state);
    assert.deepEqual(accompanying, scene.accompanying, invalid + " cannot project an escort");
    assert(!evaluateZoneAccess(venue, zone, "player", sceneAccessContext({ ...scene, accompanying })).allowed, invalid);
  }
});

await runCase("scene-entry/policy-escort", () => {
  const { state, venue, zone, scene, grant } = fixture();
  grant.accompaniedBy = null;
  zone.access!.accompanied = true;
  grant.sceneId = null;
  const accompanying = sceneMoveAccompanying(scene, venue, zone, state);
  assert.deepEqual(accompanying, [{ characterId: "jim", zoneId: zone.id }]);
  assert(
    evaluateZoneAccess(venue, zone, "player", { ...sceneAccessContext({ ...scene, accompanying }), accepting: true })
      .allowed,
    "the existing native policy also applies when deliberately claiming a future visit permission",
  );
  grant.accompaniedBy = "absent-escort";
  assert.deepEqual(
    sceneMoveAccompanying(scene, venue, zone, state),
    scene.accompanying,
    "an explicit named escort cannot be replaced by the issuer",
  );
});

await runCase("scene-entry/escort-route", () => {
  for (const invalid of ["ban", "refusal", "restricted", "unavailable"]) {
    const { state, venue, zone, scene } = fixture();
    zone.connectedTo = ["hall"];
    venue.zones!.find((zone) => zone.id === "exterior")!.connectedTo = ["hall"];
    const hall = {
      ...defaultVenueSpace("other"),
      id: "hall",
      name: "Hall",
      kind: "public" as const,
      connectedTo: ["exterior", zone.id],
      access: {
        mode: "public" as const,
        managerIds: ["player"],
        memberIds: [],
        memberRoles: [],
        inviterIds: ["player"],
        visitorHours: "always" as const,
        accompanied: false,
      },
    };
    venue.zones!.push(hall);
    if (invalid === "ban")
      venue.access!.bans.push({
        id: "escort-ban",
        zoneId: hall.id,
        visitorId: "jim",
        issuerId: "player",
        active: true,
        issuedAt: at,
        sourceLineIds: ["ban-line"],
      });
    if (invalid === "refusal")
      venue.access!.visitDenials.push({ zoneId: hall.id, visitorId: "jim", sceneId: scene.id, issuerId: "player" });
    if (invalid === "restricted") {
      zone.access!.managerIds = ["player"];
      state.narrative = {
        version: 1,
        revision: 1,
        weatherRevision: 0,
        weather: null,
        situations: [],
        receipts: [],
        conditions: [
          {
            id: "restriction",
            revision: 1,
            situationId: "flood",
            venueId: venue.id,
            zoneId: zone.id,
            observation: "The workshop is flooded.",
            restriction: "ordinary-use",
            remedy: "Drain it.",
            startsAt: at,
            endsAt: null,
            clearedAt: null,
          },
        ],
      };
    }
    if (invalid === "unavailable") hall.preparation = { status: "pending" } as any;
    if (invalid !== "unavailable")
      assert(
        contactCanEnter(state, venue, hall.id, "player", scene),
        "the escort's restriction is independent of Player access",
      );
    assert.deepEqual(
      sceneMoveAccompanying(scene, venue, zone, state),
      scene.accompanying,
      invalid + " blocks the escort's own route or target",
    );
  }
});
