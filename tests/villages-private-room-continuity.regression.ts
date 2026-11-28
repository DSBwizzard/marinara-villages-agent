import assert from "node:assert/strict";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { initializeVenueAccess } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { initializeRoomContinuity } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { capturePrivateInterior } from "../packages/villages/src/server/domain/rules/private-interior.js";
import { protectContinuity } from "../packages/villages/src/server/domain/rules/continuity.js";
import { observableRoomDescription } from "../packages/villages/src/server/domain/rules/zone-picture.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import type { VillageState, VillageVenueZone } from "../packages/villages/src/server/domain/models/world.js";
import { createModelCompletions } from "../packages/villages/src/server/features/generation/completion-service.js";
import { draftRenovationProject } from "../packages/villages/src/server/features/projects/project-drafts.js";
import { createPrivateSpacePreparation } from "../packages/villages/src/server/jobs/private-space-service.js";
import { fixture } from "./fixtures/villages-projects.fixture.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";

const zoneId = "staff:work";
const at = new Date().toISOString();
const room = (state: VillageState) => state.venues[0].zones!.find((zone) => zone.id === zoneId)!;
const view = (state: VillageState) => observableRoomDescription(state, state.venues[0].id, zoneId, at);
const settings = (state: VillageState) =>
  villageSettings(state, { name: "Player", description: "", personaId: "", missing: false }, null);
const settingsRoom = (state: VillageState) => settings(state).venues[0].zones!.find((zone) => zone.id === zoneId)!;

async function withRoom(check: (test: Awaited<ReturnType<typeof setup>>) => Promise<void>) {
  const test = await setup();
  try {
    await check(test);
  } finally {
    test.storage.release();
    test.storage.gate.dispose();
  }
}

async function setup() {
  const storage = sceneHistoryFixture();
  const repo = () => createVillageRepository(() => storage.gate.documents);
  const writer = repo();
  const world = fixture().state();
  const venue = world.venues[0];
  const exterior = venue.zones!.find((zone) => zone.kind === "exterior")!;
  exterior.name = "Hidden outside name";
  exterior.description = "Hidden exterior description";
  exterior.connectedTo = [...(exterior.connectedTo ?? []), zoneId];
  venue.zones!.push({
    ...defaultVenueSpace("community"),
    id: zoneId,
    kind: "restricted",
    name: "Private work area",
    purpose: "Repair tools",
    connectedTo: [exterior.id],
    controllerIds: ["a"],
    preparation: { status: "pending" },
    roomSpecification: "Furnish this work room",
  } satisfies VillageVenueZone);
  initializeVenueAccess(venue);
  initializeRoomContinuity(world, venue.id, exterior.id, exterior.description, "fresh-exterior", at);
  await writer.mutateAuthority((state) => Object.assign(state, world), { memories: true });
  const control = {
    resolve: true,
    trim: false,
    beforeDispatch: async () => {},
    saving: async () => {},
    reply: { description: "A walnut cabinet.\n\nA tall window." } as Record<string, unknown>,
  };
  const prompts: string[] = [];
  const loreReads: string[] = [];
  const read = () => repo().readAuthority({ memories: true });
  const worker = () => {
    const app = repo();
    const model = {
      model: "synthetic",
      connectionId: "synthetic",
      fitContext: (messages: any[]) => {
        if (control.trim) messages.pop();
        return { messages, maxTokens: 1024 };
      },
      chatComplete: async (messages: any[]) => {
        prompts.push(messages[1].content);
        return {
          content: JSON.stringify({
            rooms: [{ venueId: venue.id, id: zoneId, name: "Clockwork Vault", ...control.reply }],
          }),
          finishReason: "stop",
        };
      },
    };
    const logger = () => ({ debug() {}, warn() {} });
    const { completeWithRoom } = createModelCompletions({
      mutateDocument: storage.mutateDocument,
      readRuntimeDebug: async () => {},
      runtimeDebug() {},
      backgroundCalls: { getStore: () => undefined },
      coordinatedCompletion: async (_key: string, work: any, beforeDispatch?: () => Promise<void>) => {
        await control.beforeDispatch();
        await beforeDispatch?.();
        return work();
      },
      withUsagePurpose: async (_purpose: string, work: any) => work(),
      inferredPurpose: () => "background",
      villagesLogger: logger,
      bindCallback: (callback: any) => callback,
    } as any);
    return createPrivateSpacePreparation({
      mutateDocument: storage.mutateDocument,
      readVillageLore: async (_ids, text, _signal, _budget, { inspect }) => {
        loreReads.push(text);
        inspect({
          purpose: "synthetic",
          stage: "selection",
          budget: 256,
          entries: [
            {
              id: "fixture-lore",
              bookId: "fixture",
              name: "Unobserved work room lore",
              match: "current",
              status: "included",
            },
          ],
          omittedDiagnostics: 0,
        });
        return ["Room construction reference"];
      },
      villagesLogger: logger,
      villagesLanguageModels: () => ({
        resolveForRequest: async () => {
          assert(control.resolve, "No connection lookup is needed for a saved outcome");
          return model;
        },
      }),
      reportFoundingProgress: async (_seed, { stage }) => {
        if (stage === "saving") await control.saving();
      },
      completeWithRoom,
      villagesConnectionIdFor: async () => "synthetic",
      mutateVillageState: async (
        update: Parameters<typeof app.mutateAuthority>[0],
        options: { memories?: boolean },
      ) => {
        await app.mutateAuthority(update, options);
        return app.readAuthority();
      },
      readVillageState: app.readAuthority,
    } as any);
  };
  return { storage, writer, worker, read, control, prompts, loreReads };
}

for (const renovating of [false, true]) {
  await withRoom(async ({ writer, read, worker, control, prompts, loreReads }) => {
    await writer.mutateAuthority(
      (state) => {
        const venue = state.venues[0],
          target = room(state);
        target.roomSpecification = "A room with a copper workbench.";
        if (renovating) {
          target.description = "An established oak writing desk.";
          initializeRoomContinuity(state, venue.id, zoneId, target.description, "before-renovation", at);
          const project = draftRenovationProject(state, venue.id, { detail: "Rebuild the work room." });
          project.status = "complete";
          project.lifecycle!.phase = "complete";
          project.lifecycle!.changedZoneIds = [zoneId];
          state.projects.push(project);
          target.preparation = { status: "failed", mode: "renovation", attempt: 1 };
        } else {
          venue.buildProjectId = "saved-build";
          venue.constructionStatus = "complete";
          target.preparation = {
            status: "pending",
            claimId: "old-claim",
            basis: "a".repeat(64),
            startedAt: at,
            attempt: 1,
          };
        }
      },
      { memories: true },
    );
    control.resolve = false;
    await worker().preparePrivateSpaces();
    const result = await read();
    const text = renovating ? "An established oak writing desk." : "A room with a copper workbench.";
    assert.equal(room(result).preparation?.status, "ready");
    assert.equal(view(result), text);
    assert.equal(room(result).observed, undefined);
    assert.equal(settingsRoom(result).description, "", "reopening the room does not reveal its interior");
    assert.deepEqual(prompts, []);
    assert.deepEqual(loreReads, []);
    await worker().preparePrivateSpaces();
    assert.deepEqual((await read()).continuity, result.continuity);
  });
}

await withRoom(async ({ writer, read, worker, control, prompts }) => {
  control.beforeDispatch = () =>
    writer.mutateAuthority((state) => {
      state.venues[0].buildProjectId = "finished-during-preparation";
    });
  const preparation = worker();
  await assert.rejects(preparation.preparePrivateSpaces(), /Room changed before preparation could start/);
  await preparation.preparePrivateSpaces();
  assert.equal(room(await read()).preparation?.status, "ready");
  assert.deepEqual(prompts, [], "a Project room cannot dispatch even when ownership changes after the claim");
});

await withRoom(async ({ read, worker, control, prompts, loreReads }) => {
  control.saving = async () => {
    throw new Error("Synthetic save interruption");
  };
  await assert.rejects(worker().preparePrivateSpaces(), /Synthetic save interruption/);
  const failed = await read();
  assert.equal(room(failed).preparation?.status, "failed");
  assert.deepEqual(settingsRoom(failed).preparation, { status: "failed", error: "Room preparation failed." });
  assert.equal(view(failed), "");
  assert.match(prompts[0], /Furnish this work room/);
  assert.doesNotMatch(prompts[0] + loreReads[0], /Hidden exterior description|Hidden outside name/);

  control.resolve = false;
  control.saving = async () => {};
  await worker().retryPrivateSpaces();
  const ready = await read();
  assert.equal(prompts.length, 1);
  assert.equal(loreReads.length, 1);
  assert.equal(view(ready), "A walnut cabinet.\n\nA tall window.");
  assert.equal(room(ready).description, "");
  assert.equal(room(ready).name, "Clockwork Vault");
  assert.equal(settingsRoom(ready).name, "Clockwork Vault");
  assert.equal(room(ready).preparation?.lore?.[0]?.id, "fixture-lore");
  assert.doesNotMatch(JSON.stringify(settings(ready)), /A walnut cabinet|A tall window|Unobserved work room lore/);
  assert.equal(room(ready).observed, undefined);
  const scope = capturePrivateInterior(ready, ready.venues[0], room(ready), at);
  assert.equal(scope.entries.length, 2);
  assert(scope.entries.every(({ version }) => version.sources.every((source) => source.perceptions.length === 0)));
});

await withRoom(async ({ writer, read, worker, control, prompts }) => {
  await worker().preparePrivateSpaces();
  let live = await read();
  const cabinet = capturePrivateInterior(live, live.venues[0], room(live), at).entries[0].id;
  await writer.mutateAuthority((state) => {
    const target = room(state);
    target.roomSpecification = "Repaint the cabinet";
    target.preparation = { status: "pending", mode: "renovation" };
  });
  control.reply = { edits: [{ text: "A tall window." }] };
  await assert.rejects(worker().preparePrivateSpaces(), /did not provide valid Room changes/);
  control.reply = {
    edits: [
      { replace: cabinet, text: "The walnut cabinet is now red." },
      { text: "A matching red tray sits on the cabinet." },
    ],
  };
  await worker().retryPrivateSpaces();
  assert.equal(prompts.length, 3, "Only an explicitly retried rejection buys a replacement");
  live = await read();
  assert.equal(
    view(live),
    "The walnut cabinet is now red.\n\nA tall window.\n\nA matching red tray sits on the cabinet.",
  );
  const scope = capturePrivateInterior(live, live.venues[0], room(live), at);
  const entry = scope.entries.find(({ id }) => id === cabinet)!;
  await writer.mutateAuthority(
    (state) => {
      state.continuity = protectContinuity(
        state.continuity,
        {
          id: entry.id,
          recordRevision: entry.recordRevision,
          heads: { [scope.key]: entry.headRevision },
        },
        [scope.room],
        "forget-cabinet",
        at,
        { forget: true },
      );
    },
    { memories: true },
  );
  live = await read();
  assert.equal(view(live), "A tall window.");
});

await withRoom(async ({ writer, read, worker, control, prompts }) => {
  control.saving = () =>
    writer.mutateAuthority((state) => {
      room(state).roomSpecification = "A newer plan";
    });
  await assert.rejects(worker().preparePrivateSpaces(), /changed during preparation/);
  await assert.rejects(worker().retryPrivateSpaces(), /changed since preparation was saved/);
  assert.equal(prompts.length, 1);
  const live = await read();
  assert.equal(view(live), "");
  assert.equal(room(live).roomSpecification, "A newer plan");
});

await withRoom(async ({ storage, read, worker, control, prompts }) => {
  control.trim = true;
  await assert.rejects(worker().preparePrivateSpaces(), /does not fit/);
  assert.equal(room(await read()).preparation?.claimId, undefined);
  const raw = storage.rows.get("villages-village").data.venues[0].zones.find((zone: any) => zone.id === zoneId);
  raw.preparation = { status: "pending", claimId: 123, basis: "a".repeat(64), startedAt: at, attempt: 1 };
  await assert.rejects(worker().preparePrivateSpaces(), /Invalid saved private Room preparation scope/);
  assert.equal(prompts.length, 0);
});
