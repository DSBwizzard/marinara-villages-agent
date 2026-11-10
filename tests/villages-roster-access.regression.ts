// Test cases: roster-access/venue-grant, roster-access/venue-ban, roster-access/venue-refusal, roster-access/place-grant, roster-access/place-ban, roster-access/place-refusal, roster-access/unloaded-npcs, roster-access/pending-place
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { createResidentRoster } from "../packages/villages/src/server/features/residents/resident-roster-service.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { applyAccessCommand, evaluateZoneAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { placeRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import { villageWorldScope } from "../packages/villages/src/server/domain/rules/village-identity.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";

function configure(world: VillageState, now: string) {
  world.maps = structuredClone(projectFixture().state().maps);
  world.venues[0].presentation.mapId = world.maps[0].id;
  world.venues[0].access!.managerIds = ["player"];
  const place = establishPlace(
    world,
    {
      name: "Quiet place",
      description: "A small building beside a path.",
      controllers: ["player"],
      zones: ["grant", "ban", "refusal"].map((id) => ({
        id,
        name: id,
        kind: "public",
        description: "A room with a bench.",
        controllers: ["player"],
        connectedTo: ["exterior"],
      })),
      people: ["grant-person", "ban-person", "refusal-person", "manager"].map((ref) => ({
        ref,
        name: ref,
        characterization: "A local person.",
        role: "Visitor",
      })),
    },
    "quiet-place",
    world.maps[0].id,
    "native-roster-fixture",
    now,
    true,
  );
  for (const zone of place.location.zones!)
    initializeRoomContinuity(world, place.id, zone.id, zone.description, "roster-place", now);
  world.venues[0].zones!.find((zone) => zone.id === "common")!.connectedTo!.push("grant", "ban", "refusal");
  world.venues[0].zones!.push(
    ...["grant", "ban", "refusal"].map((id) => ({
      ...defaultVenueSpace("other"),
      id,
      name: id,
      kind: "public" as const,
      description: "A room with a bench.",
      connectedTo: ["common"],
    })),
  );
  const known = ["player", "mara", ...Object.keys(world.worldPlaces.npcs)];
  for (const venue of [world.venues[0], place.location]) {
    for (const zone of venue.zones!.filter((zone) => ["grant", "ban", "refusal"].includes(zone.id)))
      zone.access = {
        mode: zone.id === "grant" ? "permission-required" : "public",
        managerIds: ["player", "npc:quiet-place:manager"],
        memberIds: ["player"],
        memberRoles: [],
        inviterIds: ["player"],
        visitorHours: "always",
        accompanied: false,
      };
    for (const visitor of ["mara", "npc:quiet-place:grant-person"])
      applyAccessCommand(
        venue,
        {
          action: "invite",
          operationId: venue.id + ":grant:" + visitor,
          expectedRevision: venue.access!.revision,
          zoneId: "grant",
          visitorId: visitor,
          duration: "standing",
          accompanied: false,
          outsideHours: false,
        },
        "player",
        now,
        known,
      );
    for (const visitor of ["mara", "npc:quiet-place:ban-person"])
      applyAccessCommand(
        venue,
        {
          action: "ban",
          operationId: venue.id + ":ban:" + visitor,
          expectedRevision: venue.access!.revision,
          zoneId: "ban",
          visitorId: visitor,
        },
        "player",
        now,
        known,
      );
    for (const visitor of ["mara", "npc:quiet-place:refusal-person"])
      applyAccessCommand(
        venue,
        {
          action: "refuse-entry",
          operationId: venue.id + ":refusal:" + visitor,
          expectedRevision: venue.access!.revision,
          zoneId: "refusal",
          visitorId: visitor,
          sceneId: "browser",
        },
        "player",
        now,
        known,
      );
  }
}
const location = (world: VillageState, kind: string) =>
  kind === "venue" ? world.venues[0] : world.worldPlaces.places["quiet-place"].location;

async function readmit(host: Awaited<ReturnType<typeof packagedSceneServer>>, before: VillageState) {
  const repository = createVillageRepository(() => host.documents as any),
    service = createVillageStateService(repository),
    roster = createResidentRoster({
      readVillageState: service.readVillageState,
      mutateVillageState: (update) => service.mutateVillageState(update, { memories: true }),
      findVillagerCard: async () => before.villagers[0].cardSnapshot as any,
      queueVillagerAgenda: async () => {},
      retireBackgroundResident: () => {},
    });
  await roster.addVillager("mara");
  return repository.readAuthority({ memories: true });
}

for (const kind of ["venue", "place"])
  for (const decision of ["grant", "ban", "refusal"])
    await runCase("roster-access/" + kind + "-" + decision, async () => {
      const host = await packagedSceneServer({ configure });
      try {
        const before = fixtureVillageState(host.records.get("villages-village").data, host.records),
          prior = location(before, kind),
          epoch = before.villagers[0].incarnation,
          revision = prior.access!.revision;
        const removed = await host.app.inject({ method: "DELETE", url: "/api/villages/villagers/mara" });
        assert.equal(removed.statusCode, 200, removed.body);
        const world = await readmit(host, before),
          venue = location(world, kind),
          zone = venue.zones!.find((zone) => zone.id === decision)!;
        assert.notEqual(world.villagers[0].incarnation, epoch, "a new roster admission has a distinct identity");
        const answer = evaluateZoneAccess(venue, zone, "mara", { sceneId: "browser" });
        if (decision === "grant") {
          assert.equal(answer.allowed, false, "a new identity must not inherit standing permission");
          assert(venue.access!.permissions.find((row) => row.visitorId === "mara")!.revoked);
        } else if (decision === "ban") {
          assert.equal(answer.allowed, true, "a new identity must not inherit the old person's ban");
          assert.equal(venue.access!.bans.find((row) => row.visitorId === "mara")!.active, false);
        } else {
          assert.equal(answer.allowed, true, "a new identity must not inherit a prior Scene refusal");
          assert(!venue.access!.visitDenials.some((row) => row.visitorId === "mara"));
        }
        assert(venue.access!.revision > revision, "identity-driven access changes invalidate stale native proposals");
        assert(venue.access!.receipts[prior.id + ":grant:mara"], "historical receipts remain retained");
        assert.equal(host.calls(), 0, "roster reconciliation does not purchase narration");
      } finally {
        await host.stop();
      }
    });

await runCase("roster-access/pending-place", async () => {
  const host = await packagedSceneServer({
    configure(world, now) {
      configure(world, now);
      const place = world.worldPlaces.places["quiet-place"];
      place.prepared = false;
      place.location.access!.managerIds.push("mara");
    },
  });
  const entered = Promise.withResolvers<void>(),
    release = Promise.withResolvers<void>();
  let calls = 0,
    pending: Promise<any> | undefined;
  host.model.chatComplete = async () => {
    calls++;
    entered.resolve();
    await release.promise;
    return {
      content: JSON.stringify({
        place: {
          name: "Quiet place",
          description: "A small building beside a path.",
          controllers: ["mara"],
          zones: ["grant", "ban", "refusal"].map((id) => ({
            id,
            name: id,
            kind: "public",
            description: "A room with a bench.",
            controllers: ["mara"],
            connectedTo: ["exterior"],
          })),
        },
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  };
  try {
    const before = fixtureVillageState(host.records.get("villages-village").data, host.records),
      place = before.worldPlaces.places["quiet-place"];
    pending = host.app.inject({
      method: "POST",
      url: "/api/villages/places/quiet-place/prepare",
      payload: {
        worldScope: villageWorldScope(before),
        requestId: "old-preparation",
        mapId: place.location.presentation.mapId,
        expectedRevision: place.revision,
      },
    });
    await entered.promise;
    const removed = await host.app.inject({ method: "DELETE", url: "/api/villages/villagers/mara" });
    assert.equal(removed.statusCode, 200, removed.body);
    const current = await readmit(host, before);
    assert.notEqual(current.villagers[0].incarnation, before.villagers[0].incarnation);
    release.resolve();
    const result = await pending;
    assert.equal(result.statusCode, 200, result.body);
    assert.equal(
      result.json().status,
      "failed",
      "pre-removal preparation cannot reinstall old authority on a new identity",
    );
    const after = fixtureVillageState(host.records.get("villages-village").data, host.records),
      saved = after.worldPlaces.places[place.id];
    assert.equal(saved.prepared, false);
    assert(!saved.location.access!.managerIds.includes("mara"));
    assert(saved.revision > place.revision);
    assert(after.worldPlaces.revision > before.worldPlaces.revision);
    assert.match(after.worldPlaces.operations["old-preparation"].error!, /Place changed during preparation/);
    assert.equal(calls, 1, "stale acceptance does not purchase a replacement response");
  } finally {
    release.resolve();
    await pending;
    await host.stop();
  }
});

await runCase("roster-access/unloaded-npcs", async () => {
  const host = await packagedSceneServer({ configure });
  try {
    const initial = fixtureVillageState(host.records.get("villages-village").data, host.records),
      store = sceneHistoryFixture(),
      repository = createVillageRepository(() => store.gate.documents),
      service = createVillageStateService(repository);
    await repository.mutateAuthority((state) => Object.assign(state, initial), { memories: true });
    const before = JSON.stringify(store.rows.get("villages-village").data.memoryHead);
    await service.mutateVillageState((state) => {
      assert.equal(
        placeRegistry(state),
        undefined,
        "ordinary metadata mutations intentionally leave the registry unloaded",
      );
      assert.throws(() => state.worldPlaces);
      state.name = "A new village name";
    });
    assert.equal(
      JSON.stringify(store.rows.get("villages-village").data.memoryHead),
      before,
      "ordinary metadata changes do not republish common history",
    );
    const world = await repository.readAuthority({ memories: true }),
      venue = world.venues[0];
    assert(venue.zones!.find((zone) => zone.id === "grant")!.access!.managerIds!.includes("npc:quiet-place:manager"));
    assert(!venue.access!.permissions.find((row) => row.visitorId === "npc:quiet-place:grant-person")!.revoked);
    assert(venue.access!.bans.find((row) => row.visitorId === "npc:quiet-place:ban-person")!.active);
    assert(venue.access!.visitDenials.some((row) => row.visitorId === "npc:quiet-place:refusal-person"));
    assert.equal(host.calls(), 0);
  } finally {
    await host.stop();
  }
});
