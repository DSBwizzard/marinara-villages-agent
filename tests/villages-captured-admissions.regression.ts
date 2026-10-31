import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { AsyncResource } from "node:async_hooks";
import { mock } from "node:test";
import { createCapturedAdmissions } from "../packages/villages/src/server/adapters/storage/captured-admission-store.js";
import {
  capturedJobOwners,
  capturedWorldOwners,
  validateCapturedOwners,
} from "../packages/villages/src/server/adapters/storage/captured-admissions.js";
import { encodeWishHistory } from "../packages/villages/src/server/adapters/storage/wish-history.js";
import {
  relationshipWorldKey,
  relationshipPayloadStore,
} from "../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { fixtureWish, wishTime } from "./helpers/social-wishes-fixture.js";
import { withRepairWork } from "../packages/villages/src/server/adapters/storage/repair-gate.js";
import { socialContextState } from "../packages/villages/src/server/domain/rules/social-context.js";
import { createRelationshipSocial } from "../packages/villages/src/server/features/residents/relationship-social-service.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { createVillageStateService } from "../packages/villages/src/server/features/world/village-state-service.js";
import { capturedPublicationOwners } from "../packages/villages/src/server/adapters/storage/captured-admission-owners.js";
import { createBackgroundWork } from "../packages/villages/src/server/jobs/background-service.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { collectRetainedStorage } from "../packages/villages/src/server/features/repair/retained-storage-cleanup.js";
import { createRepairService } from "../packages/villages/src/server/features/repair/repair-service.js";
import {
  createRepairStorage,
  repairStorageId,
} from "../packages/villages/src/server/features/repair/repair-storage.js";
import { returnCaptureRevision } from "../packages/villages/src/server/domain/rules/return-capture-revision.js";
import { sameReturnResident } from "../packages/villages/src/server/domain/rules/return-catchup-authority.js";
import { repairId } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { venue } from "./fixtures/villages-projects.fixture.js";
import { wishHistoryStore } from "../packages/villages/src/server/adapters/storage/wish-history.js";
import {
  captureResidentActivity,
  copySocialOutboxEntry,
} from "../packages/villages/src/server/domain/rules/world-context-copy.js";

const scope = { seed: "captured-admissions", setupAt: wishTime() };
const head = encodeWishHistory([fixtureWish({ wish: "Preserve exact café 東京 evidence" })], {
  ...scope,
  actorId: "ada",
}).head;
const relationship = (digit: string) => ({
  id: "villages-relationship-history-" + relationshipWorldKey(scope) + "-" + digit.repeat(64),
  digest: digit.repeat(64),
});
const original = relationship("1"),
  review = relationship("2"),
  sender = relationship("3");
const frame = (capturedAt = "first-incarnation") => ({
  admissionFormat: 1,
  ...scope,
  villagers: [{ characterId: "ada", cardSnapshot: { name: "Ada", capturedAt }, wishHead: head }],
});
const planning = (capturedAt = "first-incarnation") => ({
  admitted: frame(capturedAt),
  opportunity: { actorIds: ["ada"] },
  actorIncarnations: { ada: capturedAt },
  context: { residents: [{ characterId: "ada", capturedAt }], social: { head: original } },
});
const job = {
  responseStorage: 4,
  seed: scope.seed,
  kind: "resident-planning",
  input: planning(),
  replacement: { seed: scope.seed, kind: "resident-planning", input: planning("replacement-incarnation") },
};
const declared = capturedJobOwners(job);
assert.deepEqual(
  declared.wishes.map((owner) => owner.capturedAt),
  ["first-incarnation", "replacement-incarnation"],
);
assert.equal(declared.relationships.length, 2);

const recovery = capturedJobOwners({
  responseStorage: 4,
  seed: scope.seed,
  kind: "social-recovery",
  input: {
    entry: { seed: scope.seed, admitted: frame(), relationshipHead: original, opportunity: { actorIds: ["ada"] } },
    socialHead: review,
  },
});
assert.deepEqual(
  recovery.relationships.map((owner) => owner.head),
  [original, review],
  "frozen and review projections remain distinct",
);
// Current-job CAS and World publication share the existing authority lock through acknowledgement.
{
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  const context = createBackgroundContext(),
    foreign = new AsyncResource("background-replacement-race");
  let writeRequested: (() => void) | undefined;
  const background = createBackgroundWork({
    withCurrentJobWrite(work) {
      writeRequested?.();
      return repository.withAuthorityLock(work);
    },
    villagesDocuments: () => f.gate.documents,
    villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
    readVillageState: (options) => repository.readAuthority(options),
    async mutateVillageState(update, options) {
      await repository.mutateAuthority(update, options);
      return repository.readAuthority();
    },
    withUsagePurpose: (_purpose, work) => work(),
    measurePipeline: (_name, _tags, work) => work(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    handlers: [
      [
        "agenda",
        {
          valid: () => true,
          generate: async () => {
            throw Error("Hold without purchasing");
          },
          apply() {},
        },
      ],
    ],
  });
  const stop = background.startBackgroundWork();
  let release: (() => void) | undefined;
  const update = f.documents.update;
  try {
    await repository.mutateAuthority((state) => {
      state.seed = "job-lock";
    });
    const work = {
      kind: "agenda" as const,
      subjectId: "same",
      seed: "job-lock",
      revision: "first",
      finite: true,
      label: "Held",
      input: {},
    };
    await background.queueBackgroundJob(work);
    await background.settleBackgroundWork();
    const current = [...f.rows.values()].find((row) => row.kind === "background-work")!;
    const sourceJobs = [
      { slot: current.id, id: current.data.id, instanceId: current.data.instanceId, attempt: current.data.attempt },
    ];
    let entered!: () => void, requested!: () => void;
    const atWorldCAS = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const atJobCAS = new Promise<void>((resolve) => {
      requested = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const order: string[] = [];
    f.documents.update = async (input) => {
      if (input.id === "villages-village") {
        entered();
        await held;
        order.push("World");
      } else if (input.id === current.id) order.push("job");
      return update(input);
    };
    const publication = repository.mutateAuthority(
      (state) => {
        state.setting = "Old job applied before replacement";
      },
      { sourceJobs },
    );
    await atWorldCAS;
    writeRequested = requested;
    const replacement = foreign.runInAsyncScope(() => background.queueBackgroundJob({ ...work, revision: "second" }));
    await atJobCAS;
    assert.equal(
      f.rows.get(current.id).data.instanceId,
      current.data.instanceId,
      "A replacement waits until the admitted World CAS acknowledges",
    );
    release();
    await Promise.all([publication, replacement]);
    await background.settleBackgroundWork();
    assert.deepEqual(order.slice(0, 2), ["World", "job"]);
    assert.notEqual(f.rows.get(current.id).data.instanceId, current.data.instanceId);
    const revision = f.rows.get("villages-village").revision;
    await assert.rejects(
      repository.mutateAuthority(
        (state) => {
          state.setting = "Late obsolete effect";
        },
        { sourceJobs },
      ),
      /source job changed/,
    );
    assert.equal(f.rows.get("villages-village").revision, revision);
  } finally {
    release?.();
    stop();
    await background.settleBackgroundWork();
    f.documents.update = update;
    foreign.emitDestroy();
    f.release();
    f.gate.dispose();
  }
}
// A foreign authority writer waits for selected settlement, including through the real repair simulation.
{
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents),
    store = createCapturedAdmissions(f.gate.documents),
    foreign = new AsyncResource("foreign-capture-reset");
  try {
    const source = (world: ReturnType<typeof defaultVillageState>) => ({
      id: "protected-source",
      seed: world.seed,
      at: wishTime(),
      candidates: [],
      proposal: {},
      opportunity: {
        id: "routine",
        kind: "routine" as const,
        actorIds: ["ada"],
        venueId: "",
        startsAt: wishTime(),
        endsAt: wishTime(),
        facts: [],
      },
      admitted: captureResidentActivity(world),
      relationshipSnapshot: defaultRelationshipState(world.seed),
    });
    await repository.mutateAuthority((state) => {
      Object.assign(state, scope);
      state.villagers = [
        {
          characterId: "ada",
          cardSnapshot: { id: "ada", revision: 1, sourceStatus: "available", name: "Ada", capturedAt: wishTime() },
          wishes: [],
        },
      ] as any;
      state.socialOutbox = [source(state)];
    });
    const village = createVillageStateService(repository, () => ({
      readRelationshipState: async (seed) => defaultRelationshipState(seed),
      reconcileRelationships() {},
      persistRelationshipAuthority: async () => {},
      processSocialOutbox: async () => false,
      projectSocialActivities() {},
      reconcileSocialPlans() {},
    }));
    let resume!: () => void,
      started!: () => void,
      paused = true;
    const held = new Promise<void>((resolve) => {
        resume = resolve;
      }),
      waiting = new Promise<void>((resolve) => {
        started = resolve;
      });
    const selected: string[] = [];
    const service = createRelationshipSocial({
      withVillageSceneAcceptance: (work, options) =>
        f.gate.work(() => village.withVillageSceneAcceptance(work, options)),
      readSocialEntry: async (value, seed) => {
        selected.push(value.id);
        if (paused) {
          started();
          await held;
          throw new Error("Missing selected history");
        }
        return store.readSocialEntry(value, seed);
      },
      socialIdentity: store.socialIdentity,
      mutateVillageState: village.mutateVillageState,
      mutateRelationships: async (seed, update) => {
        const social = defaultRelationshipState(seed);
        await update(social);
        return social;
      },
    });
    const pending = service.processSocialOutbox(await village.readVillageSnapshot());
    await waiting;
    let resetApplied = false;
    const resetting = foreign.runInAsyncScope(() =>
      repository.mutateAuthority(
        (state) => {
          resetApplied = true;
          state.seed = "reset-world";
          state.setupAt = wishTime(1);
          state.socialOutbox = [source(state)];
        },
        { memories: true, wishes: true },
      ),
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
    const wasBlocked = !resetApplied;
    resume();
    await Promise.all([pending, resetting]);
    assert(wasBlocked, "A foreign authority writer waits for selected settlement to release its actual lock.");
    const current = await village.readVillageSnapshot();
    assert.equal(current.seed, "reset-world");
    assert.equal(current.socialOutbox![0].error, undefined, "The reset's new source never receives the old failure.");
    paused = false;
    const staleHint = { ...current, socialOutbox: [{ ...source(current), id: "old-never-saved" }] };
    const staged = await f.gate.simulate(() => service.processSocialOutbox(staleHint));
    assert.equal(staged.value, true);
    assert.deepEqual(
      selected,
      ["protected-source", "protected-source"],
      "Settlement selects fresh authority rather than the caller's stale outbox array.",
    );
    assert.equal(
      (await repository.readAuthority()).socialOutbox!.length,
      1,
      "Simulation does not publish the staged settlement.",
    );
    await f.gate.commit("captured-settlement", staged.transaction);
    assert.equal((await repository.readAuthority()).socialOutbox?.[0]?.error, undefined);
    assert.equal(
      (await repository.readAuthority()).socialOutbox!.length,
      0,
      "The admitted staged owner publishes on commit.",
    );
  } finally {
    foreign.emitDestroy();
    f.release();
    f.gate.dispose();
  }
}

const world = {
  version: 13,
  ...scope,
  socialOutbox: [
    { seed: scope.seed, admitted: frame(), relationshipHead: original, opportunity: { actorIds: ["ada"] } },
  ],
  socialMailOutbox: [
    {
      input: {
        seed: scope.seed,
        residentId: "ada",
        incarnation: "first-incarnation",
        admitted: { ...frame(), relationshipHead: sender },
      },
    },
  ],
};
assert.deepEqual(
  capturedWorldOwners(world).relationships.map((owner) => owner.head),
  [original, sender],
);
assert.equal(capturedWorldOwners(world).wishes.length, 2);

for (const change of [
  (value: any) => {
    delete value.input.admitted;
  },
  (value: any) => {
    delete value.input.context;
  },
  (value: any) => {
    delete value.input.context.residents;
  },
  (value: any) => {
    delete value.input.context.social.head;
  },
  (value: any) => {
    delete value.input.actorIncarnations.ada;
  },
  (value: any) => {
    value.input.actorIncarnations.ada = "foreign";
  },
  (value: any) => {
    value.input.opportunity.actorIds = ["missing"];
  },
  (value: any) => {
    value.input.context.residents = [];
  },
  (value: any) => {
    delete value.input.admitted.setupAt;
  },
  (value: any) => {
    delete value.input.admitted.admissionFormat;
  },
  (value: any) => {
    delete value.input.admitted.villagers[0].wishHead;
  },
  (value: any) => {
    value.input.admitted.villagers[0].wishes = [];
  },
  (value: any) => {
    value.input.admitted.villagers[0].cardSnapshot.capturedAt = "other";
  },
  (value: any) => {
    value.input.admitted.villagers.push(structuredClone(value.input.admitted.villagers[0]));
  },
  (value: any) => {
    value.input.admitted.seed = "foreign";
  },
  (value: any) => {
    value.input.admitted.setupAt = "foreign";
  },
  (value: any) => {
    value.input.context.residents[0].wishes = [];
  },
  (value: any) => {
    value.input.context.social.state = {};
  },
  (value: any) => {
    value.replacement.input.context.residents[0].capturedAt = "first-incarnation";
  },
  (value: any) => {
    value.responseStorage = 2;
  },
]) {
  const invalid = structuredClone(job);
  change(invalid);
  assert.throws(() => capturedJobOwners(invalid));
}

// Publish and reload exact typed roles using the real immutable page stores.
{
  const f = sceneHistoryFixture(),
    store = createCapturedAdmissions(f.gate.documents),
    none = { wishes: [], relationships: [] };
  try {
    const wish = {
      ...fixtureWish({ wish: "A lasting shared experience" }),
      history: Array.from({ length: 25_000 }, (_, index) => ({
        id: "event:" + index,
        at: wishTime(),
        kind: "progress" as const,
        text: "Exact private café 東京 history " + index + " evidence.".repeat(8),
        sourceId: "source:" + index,
        lineIds: ["line:" + index],
      })),
    };
    assert(Buffer.byteLength(JSON.stringify(wish)) > 4 * 1024 * 1024);
    const logicalFrame = {
      ...scope,
      villagers: [
        { characterId: "ada", cardSnapshot: { name: "Ada", capturedAt: "first-incarnation" }, wishes: [wish] },
      ],
    };
    function social(label: string) {
      const state = defaultRelationshipState(scope.seed);
      state.edges[JSON.stringify(["ada", "player"])] = {
        fromId: "ada",
        toId: "player",
        revision: 1,
        connection: "Neighbor",
        stance: label,
        expectations: [],
        concerns: [],
        experiences: [],
        updatedAt: wishTime(),
        records: {
          boundary: {
            id: "boundary",
            revision: 1,
            kind: "boundary",
            text: "Exact private agreement " + label,
            participants: ["ada", "player"],
            status: "stated",
            knownBy: ["ada"],
            evidenceIds: ["exact:line"],
          },
        },
      };
      return state;
    }
    const projectionSource = social("projection"),
      edgeId = JSON.stringify(["ada", "player"]);
    projectionSource.edges[edgeId].experiences = Array.from(
      { length: 25_000 },
      (_, index) => "Historical private experience " + index,
    );
    projectionSource.edges[edgeId].records.history = {
      ...projectionSource.edges[edgeId].records.boundary,
      id: "history",
      kind: "history",
      text: "A remembered past event",
    };
    const clone = structuredClone;
    let clonedBytes = 0;
    const cloneSpy = mock.method(globalThis, "structuredClone", (value: any) => {
      clonedBytes += Buffer.byteLength(JSON.stringify(value));
      return clone(value);
    });
    let projected;
    try {
      projected = socialContextState(projectionSource, ["ada"])!;
    } finally {
      cloneSpy.mock.restore();
    }
    assert(clonedBytes < 4096, "A request projection does not clone discarded relationship history.");
    assert.deepEqual(projected.edges[edgeId].experiences, []);
    assert.equal(projected.edges[edgeId].records.history, undefined);
    assert.deepEqual(projected.edges[edgeId].records.boundary, projectionSource.edges[edgeId].records.boundary);
    projected.edges[edgeId].expectations.push("Temporary request detail");
    assert.deepEqual(projectionSource.edges[edgeId].expectations, []);
    assert.equal(projectionSource.edges[edgeId].experiences.length, 25_000);

    const input = {
      ...planning(),
      admitted: logicalFrame,
      context: {
        residents: [{ characterId: "ada", capturedAt: "first-incarnation", wishes: [wish] }],
        social: { state: social("original") },
      },
    };
    const native = await withRepairWork(async () => {
      const prepared = await store.prepareInput("resident-planning", input, scope.seed, none);
      await f.gate.documents.create({
        id: "captured-job",
        packageId: "villages",
        kind: "background-work",
        name: "Capture",
        description: "",
        data: { ...job, replacement: undefined, input: prepared },
        createdAt: wishTime(),
        updatedAt: wishTime(),
      });
      return prepared;
    });
    assert.equal(native.context.residents[0].wishes, undefined);
    assert.equal(native.admitted.villagers[0].wishes, undefined);
    assert.equal(native.context.social.state, undefined);
    assert(Buffer.byteLength(JSON.stringify(native)) < 5000);
    const decoded = await store.readInput("resident-planning", structuredClone(native), scope.seed);
    const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
    assert.equal(digest(decoded.admitted.villagers[0].wishes[0]), digest(wish));
    assert.deepEqual(decoded.context.social.state, input.context.social.state);
    assert.notEqual(decoded.context.residents[0].wishes, decoded.admitted.villagers[0].wishes);
    assert.throws(() => {
      decoded.admitted.villagers[0].wishes[0].history[10_000].text = "Caller rewrite";
    }, TypeError);
    decoded.context.residents[0].wishes.pop();
    assert.equal(
      decoded.admitted.villagers[0].wishes.length,
      1,
      "Context views do not share mutable collection arrays.",
    );
    const restarted = createCapturedAdmissions(f.documents),
      restored = await restarted.readInput("resident-planning", native, scope.seed);
    assert.equal(
      digest(restored.admitted.villagers[0].wishes[0]),
      digest(wish),
      "Cold input loading preserves exact evidence.",
    );

    const stringify = JSON.stringify;
    const socialMetadata = {
      id: "captured-source",
      seed: scope.seed,
      at: wishTime(),
      opportunity: { actorIds: ["ada"] },
      candidates: [],
      proposal: {},
    };
    const comparison = {
        ...socialMetadata,
        admitted: restored.admitted,
        relationshipSnapshot: restored.context.social.state,
      },
      nativeComparison = { ...socialMetadata, admitted: native.admitted, relationshipHead: native.context.social.head };
    let serialized = 0,
      interior = false,
      maxSerialized = 0,
      maxRead = 0,
      maxWritten = 0;
    const spy = mock.method(JSON, "stringify", (...args: unknown[]) => {
      const text = Reflect.apply(stringify, JSON, args);
      if (typeof text === "string") {
        serialized += Buffer.byteLength(text);
        interior ||= text.includes("Exact private café 東京 history 10000");
      }
      return text;
    });
    try {
      for (let index = 0; index < 20; index++) {
        f.reset();
        serialized = 0;
        await withRepairWork(async () => {
          assert.equal(
            restarted.socialIdentity(comparison as any, scope),
            restarted.socialIdentity(nativeComparison as any, scope),
          );
          const owner = await f.gate.documents.getById("villages", "captured-job");
          const prepared = await restarted.prepareInput(
            "resident-planning",
            restored,
            scope.seed,
            capturedJobOwners(owner!.data),
          );
          await f.gate.documents.update({
            id: owner!.id,
            packageId: "villages",
            expectedRevision: owner!.revision,
            name: "Capture",
            description: "",
            data: { ...owner!.data, input: prepared, checkpoint: index },
            updatedAt: wishTime(),
          });
        });
        const io = f.metrics();
        maxRead = Math.max(maxRead, io.readBytes);
        maxWritten = Math.max(maxWritten, io.writtenBytes);
        maxSerialized = Math.max(maxSerialized, serialized);
      }
    } finally {
      spy.mock.restore();
    }
    assert.equal(interior, false, "Repeated job metadata publication never serializes retained interior history.");
    assert(
      maxRead < 64_000 && maxWritten < 64_000 && maxSerialized < 128_000,
      JSON.stringify({ maxRead, maxWritten, maxSerialized }),
    );
    console.log(
      JSON.stringify({
        workload: "captured-background-input",
        events: 25_000,
        updates: 20,
        maxRead,
        maxWritten,
        maxSerialized,
      }),
    );

    const socialInput = {
      entry: {
        seed: scope.seed,
        opportunity: { actorIds: ["ada"] },
        admitted: restored.admitted,
        relationshipSnapshot: social("original"),
      },
      social: social("review"),
    };
    const encodedSocial = await withRepairWork(() =>
      store.prepareInput("social-recovery", socialInput, scope.seed, none),
    );
    assert.notDeepEqual(encodedSocial.entry.relationshipHead, encodedSocial.socialHead);
    const socialRead = await store.readInput("social-recovery", encodedSocial, scope.seed);
    assert.deepEqual(socialRead.entry.relationshipSnapshot, socialInput.entry.relationshipSnapshot);
    assert.deepEqual(socialRead.social, socialInput.social);
    assert.equal(store.socialIdentity(socialRead.entry, scope), store.socialIdentity(encodedSocial.entry, scope));
    const unknownSource = {
      ...socialInput.entry,
      admitted: { ...logicalFrame, villagers: logicalFrame.villagers.map((row) => ({ ...row, wishes: [] })) },
      relationshipSnapshot: undefined,
    };
    const unknownWorld = await withRepairWork(() =>
      store.prepareWorld({ version: 13, ...scope, socialOutbox: [unknownSource] }, none),
    );
    const unknownEntry = await store.readSocialEntry(unknownWorld.socialOutbox[0], scope.seed);
    assert.equal(unknownEntry.relationshipSnapshot, undefined);
    const republishedUnknown = await withRepairWork(() =>
      store.prepareWorld(
        {
          version: 13,
          ...scope,
          socialOutbox: [copySocialOutboxEntry(unknownEntry)],
        },
        capturedWorldOwners({ version: 13, ...scope, ...unknownWorld }),
      ),
    );
    assert.equal(
      republishedUnknown.socialOutbox[0].relationshipHead,
      null,
      "Copying and publishing unknown context cannot manufacture a known-empty baseline.",
    );
    const mailInput = {
      seed: scope.seed,
      residentId: "ada",
      incarnation: "first-incarnation",
      admitted: { ...restored.admitted, relationshipContext: social("sender") },
    };
    const encodedMail = await withRepairWork(() => store.prepareInput("personal-mail", mailInput, scope.seed, none));
    const mailRead = await store.readInput("personal-mail", encodedMail, scope.seed);
    assert.deepEqual(mailRead.admitted.relationshipContext, mailInput.admitted.relationshipContext);
    const unknown = await withRepairWork(() =>
      store.prepareInput(
        "personal-mail",
        {
          ...mailInput,
          admitted: { ...restored.admitted, relationshipContext: undefined },
        },
        scope.seed,
        none,
      ),
    );
    const knownEmpty = await withRepairWork(() =>
      store.prepareInput(
        "personal-mail",
        {
          ...mailInput,
          admitted: { ...restored.admitted, relationshipContext: defaultRelationshipState(scope.seed) },
        },
        scope.seed,
        none,
      ),
    );
    assert.equal(unknown.admitted.relationshipHead, null);
    assert(knownEmpty.admitted.relationshipHead);

    const outboxes = await withRepairWork(() =>
      store.prepareWorld(
        {
          version: 13,
          ...scope,
          socialOutbox: [socialInput.entry],
          socialMailOutbox: [{ input: mailInput }],
        },
        none,
      ),
    );
    assert.equal(capturedWorldOwners({ version: 13, ...scope, ...outboxes }).wishes.length, 2);
    for (const action of ["prepare", "read"] as const) {
      let resume!: () => void, started!: () => void;
      const held = new Promise<void>((resolve) => {
          resume = resolve;
        }),
        waiting = new Promise<void>((resolve) => {
          started = resolve;
        });
      let paused = false;
      const documents = new Proxy(f.gate.documents, {
        get(target, key) {
          if (key === "getById")
            return async (pkg: string, id: string) => {
              if (!paused && id === native.admitted.villagers[0].wishHead.root.id) {
                paused = true;
                started();
                await held;
              }
              return target.getById(pkg, id);
            };
          const value = Reflect.get(target, key);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
      const caller = structuredClone(native),
        racing = createCapturedAdmissions(documents);
      const pending =
        action === "prepare"
          ? withRepairWork(() => racing.prepareInput("resident-planning", caller, scope.seed, none))
          : racing.readInput("resident-planning", caller, scope.seed);
      await waiting;
      caller.admitted.villagers[0].wishHead = encodeWishHistory([fixtureWish({ wish: "Unpublished swapped value" })], {
        ...scope,
        actorId: "ada",
      }).head;
      caller.context.social.head = relationship("9");
      resume();
      const captured = await pending;
      if (action === "prepare") {
        assert.deepEqual(captured.admitted.villagers[0].wishHead, native.admitted.villagers[0].wishHead);
        assert.deepEqual(captured.context.social.head, native.context.social.head);
      } else {
        assert.equal(digest(captured.admitted.villagers[0].wishes[0]), digest(wish));
        assert.deepEqual(captured.context.social.state, input.context.social.state);
      }
    }
    const savedChild = [...f.rows.values()].find(
      (row) => row.kind === "memory-page" && JSON.stringify(row.data).includes("Exact private café 東京 history 10000"),
    );
    assert(savedChild);
    f.rows.delete(savedChild.id);
    const before = structuredClone(f.rows);
    await assert.rejects(withRepairWork(() => store.prepareInput("resident-planning", native, scope.seed, none)));
    assert.deepEqual(
      f.rows,
      before,
      "Warm decoded data cannot republish a native reference with a missing dependency.",
    );
  } finally {
    f.release();
    f.gate.dispose();
  }
}

// The real settlement service loads only its selected eight entries, including native input failure handling.
{
  const f = sceneHistoryFixture(),
    store = createCapturedAdmissions(f.gate.documents);
  try {
    const world = defaultVillageState();
    Object.assign(world, scope);
    const person = { characterId: "ada", cardSnapshot: { name: "Ada", capturedAt: "first-incarnation" }, wishes: [] };
    world.villagers = [person] as any;
    const social = defaultRelationshipState(scope.seed);
    const source = {
      id: "selected:0",
      seed: scope.seed,
      at: wishTime(),
      candidates: [],
      proposal: {},
      opportunity: {
        id: "routine",
        kind: "routine",
        actorIds: ["ada"],
        venueId: "",
        startsAt: wishTime(),
        endsAt: wishTime(),
        facts: [],
      },
      admitted: { ...scope, villagers: [person] },
      relationshipSnapshot: social,
    };
    const outboxes = await withRepairWork(() =>
      store.prepareWorld({ version: 13, ...scope, socialOutbox: [source] }, { wishes: [], relationships: [] }),
    );
    world.socialOutbox = Array.from({ length: 9 }, (_, index) => ({
      ...structuredClone(outboxes.socialOutbox[0]),
      id: "selected:" + index,
    }));
    const last = world.socialOutbox[8] as any;
    last.admitted.villagers[0].wishHead = encodeWishHistory([fixtureWish({ wish: "Missing unselected history" })], {
      ...scope,
      actorId: "ada",
    }).head;
    const loaded: string[] = [];
    let authorityReads = 0;
    const service = createRelationshipSocial({
      withVillageSceneAcceptance: async (work) => {
        authorityReads++;
        return work(world);
      },
      readSocialEntry: (value, seed) => {
        loaded.push(value.id);
        return store.readSocialEntry(value, seed);
      },
      socialIdentity: store.socialIdentity,
      mutateVillageState: async (update) => {
        await update(world);
        return world;
      },
      mutateRelationships: async (_seed, update) => {
        await update(social);
        return social;
      },
    });
    assert.equal(await service.processSocialOutbox(world), true);
    assert.deepEqual(
      loaded,
      Array.from({ length: 8 }, (_, index) => "selected:" + index),
    );
    assert.equal(world.socialOutbox.length, 1);
    assert.equal(world.socialOutbox[0].id, "selected:8");
    assert.equal(world.socialOutbox[0].error, undefined, "An unselected body is not read or replaced.");
    await service.processSocialOutbox(world);
    assert.equal(world.socialOutbox.length, 1, "A missing selected history remains held for recovery.");
    assert.match(world.socialOutbox[0].error!, /history page is missing/);
    assert.deepEqual(
      loaded,
      Array.from({ length: 9 }, (_, index) => "selected:" + index),
    );
    assert.equal(social.socialEncounters.length, 0);
    const beforeIdle = authorityReads;
    assert.equal(await service.processSocialOutbox(world), false);
    assert.equal(authorityReads, beforeIdle, "Held work does not add an ordinary authority read.");
    world.socialOutbox = [];
    assert.equal(await service.processSocialOutbox(world), false);
    assert.equal(authorityReads, beforeIdle, "An empty outbox does not add an ordinary authority read.");
    for (const change of [
      (value: any) => {
        delete value.relationshipHead;
      },
      (value: any) => {
        delete value.admitted.admissionFormat;
      },
      (value: any) => {
        value.admitted.villagers[0].wishes = [];
      },
    ]) {
      const invalid = structuredClone(outboxes.socialOutbox[0]);
      change(invalid);
      await assert.rejects(store.readSocialEntry(invalid, scope.seed));
      assert.throws(() => store.socialIdentity(invalid, scope));
      world.socialOutbox = [invalid];
      await service.processSocialOutbox(world);
      assert.equal(world.socialOutbox.length, 1, "Malformed captured roles cannot fall through to live authority.");
      assert.equal(world.socialOutbox[0].processed, undefined);
      assert.equal(social.socialEncounters.length, 0);
    }
    const mail = await withRepairWork(() =>
      store.prepareInput(
        "personal-mail",
        {
          seed: scope.seed,
          residentId: "ada",
          incarnation: "first-incarnation",
          admitted: { ...defaultVillageState(), ...scope, villagers: [person], relationshipContext: social },
        },
        scope.seed,
        { wishes: [], relationships: [] },
      ),
    );
    for (const change of [
      (value: any) => {
        delete value.admitted.admissionFormat;
      },
      (value: any) => {
        delete value.admitted.relationshipHead;
      },
      (value: any) => {
        delete value.admitted.admissionFormat;
        delete value.admitted.relationshipHead;
        delete value.admitted.villagers[0].wishHead;
      },
    ]) {
      const invalid = structuredClone(mail);
      change(invalid);
      await assert.rejects(store.readMailInput(invalid, scope.seed));
    }
    for (const reset of [false, true]) {
      const old = structuredClone(outboxes.socialOutbox[0]);
      world.seed = scope.seed;
      world.setupAt = scope.setupAt;
      world.socialOutbox = [old];
      let resume!: () => void, started!: () => void;
      const held = new Promise<void>((resolve) => {
          resume = resolve;
        }),
        waiting = new Promise<void>((resolve) => {
          started = resolve;
        });
      const racing = createRelationshipSocial({
        withVillageSceneAcceptance: async (work) => work(world),
        readSocialEntry: async () => {
          started();
          await held;
          throw new Error("Missing selected history");
        },
        socialIdentity: store.socialIdentity,
        mutateVillageState: async (update) => {
          await update(world);
          return world;
        },
        mutateRelationships: async () => {
          throw new Error("An obsolete source must not apply relationships.");
        },
      });
      const pending = racing.processSocialOutbox(world);
      await waiting;
      const replacement = structuredClone(old);
      replacement.proposal = { encounter: { lines: ["New source"] } };
      if (reset) {
        world.seed = replacement.seed = replacement.admitted.seed = "new-world";
        world.setupAt = replacement.admitted.setupAt = wishTime(1);
        replacement.relationshipHead = null;
      }
      world.socialOutbox = [replacement];
      resume();
      await pending;
      assert.equal(replacement.error, undefined, "An old hydration failure cannot mark a newer source as failed.");
      assert.equal(replacement.reinterpretRequired, undefined);
    }
    world.seed = scope.seed;
    world.setupAt = scope.setupAt;
    world.relationshipContext = social;
    const older = structuredClone(outboxes.socialOutbox[0]);
    older.error = "Saved interpretation needs review";
    older.reinterpretRequired = true;
    older.proposal = { encounter: { lines: [{ speakerId: "ada", text: "Exact old source" }] } };
    world.socialOutbox = [older];
    let resumeRetry!: () => void,
      retryStarted!: () => void,
      interpretations = 0;
    const heldRetry = new Promise<void>((resolve) => {
        resumeRetry = resolve;
      }),
      retryWaiting = new Promise<void>((resolve) => {
        retryStarted = resolve;
      });
    const retry = createRelationshipSocial({
      withVillageSceneAcceptance: async (work) => work(world),
      readVillageSnapshot: async () => structuredClone(world),
      readSocialEntry: async (value, seed) => {
        retryStarted();
        await heldRetry;
        return store.readSocialEntry(value, seed);
      },
      socialIdentity: store.socialIdentity,
      mutateVillageState: async (update) => {
        await update(world);
        return world;
      },
      mutateRelationships: async () => social,
      interpretSocialSource: async () => {
        interpretations++;
        return {};
      },
      queueBackgroundJob: async (work) => {
        if (!retry.handler.valid(world, work.input)) return;
        const result = await retry.handler.generate(work.input);
        retry.handler.apply(world, work.input, result, { retrying: false });
      },
    });
    const recovering = retry.recover(older.id, { requestId: "stale-normal-recovery", reinterpret: true });
    await retryWaiting;
    const newer = structuredClone(older);
    newer.admitted.villagers[0].cardSnapshot.name = "Newly captured Ada";
    newer.proposal = { encounter: { lines: [{ speakerId: "ada", text: "Exact newer source" }] } };
    world.socialOutbox = [newer];
    resumeRetry();
    await recovering;
    assert.equal(interpretations, 0, "A delayed normal Retry cannot purchase interpretation of a replaced source.");
    assert.equal(world.socialOutbox[0].admitted!.villagers[0].cardSnapshot.name, "Newly captured Ada");

    let calls = 0;
    const generation = createRelationshipSocial({
      withVillageSceneAcceptance: async (work) => work(world),
      readSocialEntry: store.readSocialEntry,
      socialIdentity: store.socialIdentity,
      mutateVillageState: async () => world,
      mutateRelationships: async () => social,
      interpretSocialSource: async () => {
        calls++;
        throw new Error("Unexpected model work");
      },
    });
    await assert.rejects(
      () =>
        generation.handler.generate({
          entry: source,
          social: undefined,
          seed: scope.seed,
          admittedAt: wishTime(),
          memory: undefined,
        }),
      /captured relationship review context is unavailable/,
    );
    assert.equal(calls, 0);
  } finally {
    f.release();
    f.gate.dispose();
  }
}
for (const change of [
  (value: any) => {
    delete value.socialOutbox[0].admitted;
  },
  (value: any) => {
    delete value.socialOutbox[0].relationshipHead;
  },
  (value: any) => {
    value.socialOutbox[0].opportunity.actorIds = ["missing"];
  },
  (value: any) => {
    value.socialMailOutbox[0].input.residentId = "missing";
  },
  (value: any) => {
    value.socialMailOutbox[0].input.incarnation = "foreign";
  },
  (value: any) => {
    delete value.socialMailOutbox[0].input.admitted.relationshipHead;
  },
  (value: any) => {
    value.socialOutbox = {};
  },
  (value: any) => {
    value.socialMailOutbox = null;
  },
  (value: any) => {
    value.socialOutbox[0].relationshipSnapshot = {};
  },
  (value: any) => {
    value.socialMailOutbox[0].input.admitted.relationshipContext = {};
  },
  (value: any) => {
    value.socialMailOutbox[0].input.seed = "foreign";
  },
  (value: any) => {
    value.version = 12;
  },
]) {
  const invalid = structuredClone(world);
  change(invalid);
  assert.throws(() => capturedWorldOwners(invalid), "invalid native owners cannot disappear through coercion");
}
const empty = frame();
empty.villagers[0].wishHead = null;
assert.equal(
  capturedJobOwners({ ...job, input: { ...planning(), admitted: empty }, replacement: undefined }).wishes[0].head,
  null,
);
assert.deepEqual(
  capturedJobOwners({ ...job, kind: "agenda", input: { prose: JSON.stringify(world) }, replacement: undefined }),
  {
    wishes: [],
    relationships: [],
  },
);
for (const kind of ["resident-planning", "personal-mail", "social-recovery"])
  for (const input of [undefined, null, false, 0, [], "captured prose", {}])
    assert.throws(() => capturedJobOwners({ ...job, kind, input, replacement: undefined }));
const mail = { ...job, kind: "personal-mail", input: world.socialMailOutbox[0].input, replacement: undefined };
assert.equal(capturedJobOwners(mail).wishes.length, 1);
for (const input of [
  { ...mail.input, residentId: "missing" },
  { ...mail.input, incarnation: "foreign" },
  { ...mail.input, admitted: undefined },
])
  assert.throws(() => capturedJobOwners({ ...mail, input }));
const closed = { ...job, status: "completed", input: null, steps: [], hasResult: false, replacement: undefined };
assert.deepEqual(capturedJobOwners(closed), { wishes: [], relationships: [] });
for (const patch of [
  { status: "failed" },
  { steps: [{}] },
  { hasResult: true },
  { result: {} },
  { partialResult: true },
  { optionalAttempts: { review: { status: "unknown" } } },
])
  assert.throws(() => capturedJobOwners({ ...closed, ...patch }));

// Declared owners alone cannot establish that an immutable dependency still exists.
{
  const f = sceneHistoryFixture();
  try {
    const encoded = encodeWishHistory([fixtureWish({ wish: "Exact retained café 東京 value" })], {
      ...scope,
      actorId: "ada",
    });
    for (const [id, data] of encoded.pages)
      await f.gate.documents.create({
        id,
        packageId: "villages",
        kind: "memory-page",
        name: "History",
        description: "",
        data,
        createdAt: wishTime(),
        updatedAt: wishTime(),
      });
    const state = defaultRelationshipState(scope.seed);
    const head = await relationshipPayloadStore(f.gate.documents).prepare(state, scope);
    const native = planning();
    native.admitted.villagers[0].wishHead = encoded.head;
    native.context.social.head = head;
    const owners = capturedJobOwners({ ...job, input: native, replacement: undefined });
    const retained = await validateCapturedOwners(f.gate.documents, owners);
    assert(retained.has(encoded.head!.root.id));
    assert(retained.has(head.id));
    const child = [...encoded.pages.keys()].find((id) => id !== encoded.head!.root.id)!;
    assert(child);
    f.rows.delete(child);
    await assert.rejects(validateCapturedOwners(f.gate.documents, owners));
  } finally {
    f.release();
    f.gate.dispose();
  }
}

// Exercise the actual publishers and retained owners, rather than only the capture codec.
{
  const f = sceneHistoryFixture(),
    repository = createVillageRepository(() => f.gate.documents);
  const context = createBackgroundContext();
  const wishes = wishHistoryStore(f.gate.documents);
  const identify = (rows: any, owner: any) => wishes.fingerprint(rows, owner);
  const wish = {
    ...fixtureWish({ wish: "Keep exact native publication evidence" }),
    history: Array.from({ length: 25_000 }, (_, index) => ({
      id: "native-event:" + index,
      at: wishTime(),
      kind: "progress" as const,
      text: "Exact native private café 東京 history " + index + " evidence.".repeat(8),
      sourceId: "native-source:" + index,
      lineIds: ["native-line:" + index],
    })),
  };
  const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const expected = hash(wish);
  let admission: any, measured: any;
  const background = createBackgroundWork({
    withCurrentJobWrite: (work) => repository.withAuthorityLock(work),
    villagesDocuments: () => f.gate.documents,
    villagesLogger: () => ({ debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} }),
    readVillageState: (options) => repository.readAuthority(options),
    mutateVillageState: async (update, options) => {
      await repository.mutateAuthority(update, options);
      return repository.readAuthority();
    },
    withUsagePurpose: (_purpose, work) => work(),
    measurePipeline: (_name, _tags, work) => work(),
    runtimeDebug() {},
    backgroundCalls: context.backgroundCalls,
    withRepairWork,
    handlers: [
      [
        "resident-planning",
        {
          valid: () => true,
          generate: async (input) => {
            admission = input;
            assert.equal(hash(input.admitted.villagers[0].wishes[0]), expected);
            const stringify = JSON.stringify;
            let maxRead = 0,
              maxWrite = 0,
              maxJSON = 0,
              bytes = 0,
              interior = false;
            const spy = mock.method(JSON, "stringify", (...args: any[]) => {
              const result = Reflect.apply(stringify, JSON, args);
              if (typeof result === "string") {
                bytes += Buffer.byteLength(result);
                interior ||= result.includes("Exact native private");
              }
              return result;
            });
            try {
              const captured = { at: wishTime(), memoryRevision: 0, world: input.admitted };
              for (let index = 0; index < 20; index++) {
                f.reset();
                bytes = 0;
                await context.backgroundSetting("setting:" + index, () => index);
                returnCaptureRevision(captured, () => "known-relationships", identify);
                assert(
                  sameReturnResident(
                    input.admitted.villagers[0],
                    input.admitted.villagers[0],
                    new Date(wishTime()),
                    input.admitted,
                    identify,
                  ),
                );
                const io = f.metrics();
                maxRead = Math.max(maxRead, io.readBytes);
                maxWrite = Math.max(maxWrite, io.writtenBytes);
                maxJSON = Math.max(maxJSON, bytes);
              }
            } finally {
              spy.mock.restore();
            }
            assert(
              !interior,
              "Actual background metadata saves and catch-up comparisons never serialize interior history",
            );
            measured = { maxRead, maxWrite, maxJSON };
            assert(maxRead < 128_000 && maxWrite < 64_000 && maxJSON < 256_000, stringify(measured));
            throw Error("Hold this provider-free capture for recovery");
          },
          apply() {
            throw Error("The deliberately held job cannot apply");
          },
        },
      ],
    ],
  });
  const stop = background.startBackgroundWork();
  try {
    await background.recoverBackgroundWork();
    await repository.mutateAuthority((state) => {
      Object.assign(state, scope);
      state.venues = [venue()];
      state.villagers = [
        {
          characterId: "ada",
          cardSnapshot: { id: "ada", revision: 1, sourceStatus: "available", name: "Ada", capturedAt: wishTime() },
          wishes: [],
        },
      ] as any;
    });
    const live = await repository.readAuthority({ wishes: true });
    const admitted = captureResidentActivity(live);
    admitted.villagers[0].wishes = [wish];
    await background.queueBackgroundJob({
      kind: "resident-planning",
      subjectId: "native-capture",
      seed: scope.seed,
      revision: "native-source",
      finite: true,
      label: "Native capture",
      input: {
        admitted,
        opportunity: { actorIds: ["ada"] },
        actorIncarnations: { ada: wishTime() },
        context: {
          residents: [{ characterId: "ada", capturedAt: wishTime(), wishes: [wish] }],
          social: { state: defaultRelationshipState(scope.seed) },
        },
      },
    });
    await background.settleBackgroundWork();
    assert(measured, "The real executor loaded the selected admission");
    const current = [...f.rows.values()].find((row) => row.kind === "background-work")!;
    assert.equal(current.data.status, "failed");
    assert.equal(current.data.input.admitted.villagers[0].wishes, undefined);
    const protectedJob = [
      { slot: current.id, id: current.data.id, instanceId: current.data.instanceId, attempt: current.data.attempt },
    ];
    const root = f.rows.get("villages-village");
    for (const bad of [
      { ...root, kind: "unrelated" },
      { ...root, id: "another-world" },
      { ...root, packageId: "another-package" },
    ])
      await assert.rejects(capturedPublicationOwners(f.gate.documents, bad), /World owner identity/);
    const wrongRow = { ...f.gate.documents, getById: async () => ({ ...current, id: "foreign-slot" }) };
    await assert.rejects(
      capturedPublicationOwners(wrongRow, undefined, protectedJob),
      /source job is missing or changed/,
    );
    const revision = root.revision;
    for (const mismatch of [
      { ...protectedJob[0], instanceId: "00000000-0000-4000-8000-000000000000" },
      { ...protectedJob[0], attempt: current.data.attempt + 1 },
    ]) {
      await assert.rejects(
        repository.mutateAuthority(
          (state) => {
            state.setting = "must not publish without an outbox either";
          },
          { sourceJobs: [mismatch] },
        ),
        /source job changed/,
      );
      assert.equal(f.rows.get(root.id).revision, revision);
    }
    await assert.rejects(
      repository.mutateAuthority(
        (state) => {
          state.setting = "must not publish";
          state.socialOutbox = [
            { seed: scope.seed, admitted: admission.admitted, opportunity: { actorIds: ["ada"] } },
          ] as any;
        },
        { sourceJobs: [{ ...protectedJob[0], attempt: current.data.attempt + 1 }] },
      ),
      /source job changed/,
    );
    assert.equal(f.rows.get(root.id).revision, revision);
    f.rows.set(root.id, { ...root, kind: "unrelated" });
    const rejected = structuredClone(f.rows);
    await assert.rejects(
      background.queueBackgroundJob({
        kind: "resident-planning",
        subjectId: "native-capture",
        seed: scope.seed,
        revision: "rejected-owner",
        finite: true,
        label: "Rejected source",
        input: admission,
      }),
      /World owner identity/,
    );
    assert.deepEqual(f.rows, rejected, "Invalid physical World ownership cannot publish even an orphan preparation");
    f.rows.set(root.id, root);

    const entry = {
      id: "native-social",
      seed: scope.seed,
      at: wishTime(),
      opportunity: { actorIds: ["ada"] },
      candidates: [],
      proposal: {},
      admitted: admission.admitted,
      relationshipSnapshot: admission.context.social.state,
    };
    const mail = {
      seed: scope.seed,
      residentId: "ada",
      incarnation: wishTime(),
      admitted: { ...admission.admitted, relationshipContext: admission.context.social.state },
    };
    await repository.mutateAuthority(
      (state) => {
        state.socialOutbox = [entry] as any;
        state.socialMailOutbox = [{ id: "native-mail", input: mail, result: {} }] as any;
      },
      { sourceJobs: protectedJob },
    );
    const source = ({ id, kind, name, description, data }: any) =>
      structuredClone({ id, kind, name, description, data });
    const before = source(f.rows.get(root.id));
    const api = createRepairService({
      gate: f.gate,
      repository,
      resumeProject: async () => {},
      cancelProject: async () => {},
      replaySaved: async () => {},
      continueSaved: async () => {},
    });
    const checkpoint = await api.createCheckpoint("Keep captured sources", "captured-sources");
    const corrected = await api.inspect(repairId("zone", "cafe", "common"));
    await repository.mutateAuthority((state) => {
      state.socialOutbox = [];
      state.socialMailOutbox = [];
      state.venues[0].zones!.find((zone) => zone.id === "common")!.description = "Temporary corrected room";
    });
    const after = source(f.rows.get(root.id));
    const repair = createRepairStorage(f.gate.documents, f.gate.documents);
    await repair.saveHistory(
      {
        id: "captured-undo",
        ...scope,
        title: "Capture removal",
        at: wishTime(),
        changes: [],
        affected: [],
        undone: false,
        canUndo: true,
        guard: "guard",
        record: corrected,
        request: {
          recordId: corrected.id,
          action: "correct",
          knowers: [],
          values: { description: "Temporary corrected room" },
        },
        undoWrites: [{ before, after }],
      } as any,
      [],
    );
    const undo = f.rows.get(repairStorageId("repair-history", "captured-undo"));
    f.rows.set(current.id, {
      ...current,
      data: {
        ...current.data,
        input: null,
        status: "completed",
        steps: [],
        optionalAttempts: {},
        hasResult: false,
        result: undefined,
      },
    });
    await collectRetainedStorage(f.gate);
    const savedEntry = before.data.socialOutbox[0];
    const head = savedEntry.admitted.villagers[0].wishHead.root.id;
    assert(f.rows.has(head), "Checkpoint and Undo own captured Wishes after live and current-job release");
    const missing = f.rows.get(head);
    f.rows.delete(head);
    const inventory = structuredClone(f.rows);
    await assert.rejects(collectRetainedStorage(f.gate), /missing/);
    assert.deepEqual(f.rows, inventory, "A missing captured dependency holds cleanup before any deletion");
    f.rows.set(head, missing);
    await api.deleteCheckpoint(checkpoint.id, checkpoint.token);
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(head), "Available Undo retains capture dependencies independently of checkpoints");
    await repair.readHistory(undo);
    const restored = await createCapturedAdmissions({ ...f.documents }).readSocialEntry(savedEntry, scope.seed);
    assert.equal(
      hash(restored.admitted!.villagers[0].wishes[0]),
      expected,
      "Cold loading preserves exact captured evidence after cleanup",
    );
    const reviewedUndo = await api.undo("captured-undo", "apply-captured-undo");
    await collectRetainedStorage(f.gate);
    assert(f.rows.has(head), "A prepared Undo owns proposed capture dependencies before publication");
    await api.apply(reviewedUndo.id, reviewedUndo.token);
    const restoredWorld = await createVillageRepository(() => ({ ...f.documents })).readAuthority();
    const applied = await createCapturedAdmissions({ ...f.documents }).readSocialEntry(
      restoredWorld.socialOutbox![0],
      scope.seed,
    );
    assert.equal(
      hash(applied.admitted!.villagers[0].wishes[0]),
      expected,
      "Actual Undo apply restores native captures across restart",
    );
    assert.equal(f.rows.get(undo.id).data.canUndo, false);
    await repository.mutateAuthority((state) => {
      state.socialOutbox = [];
      state.socialMailOutbox = [];
    });
    await collectRetainedStorage(f.gate);
    assert(!f.rows.has(head), "Explicitly released final owners permit unused capture pages to be reclaimed");
    for (const failure of ["before", "after"] as const) {
      const update = f.documents.update;
      let release!: () => void, entered!: () => void;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      const atWrite = new Promise<void>((resolve) => {
        entered = resolve;
      });
      f.documents.update = async (input: any) => {
        if (input.id !== root.id) return update(input);
        if (failure === "after") await update(input);
        entered();
        await held;
        throw Error("Interrupted " + failure + " capture publication");
      };
      const publication = repository.mutateAuthority((state) => {
        state.socialOutbox = [entry] as any;
      });
      const failed = assert.rejects(publication, new RegExp("Interrupted " + failure));
      try {
        await atWrite;
        const retained = structuredClone(f.rows);
        await assert.rejects(collectRetainedStorage(f.gate), /work is active/);
        assert.deepEqual(f.rows, retained, "Cleanup cannot enter before the actual capture owner CAS acknowledges");
      } finally {
        release();
        await failed;
        f.documents.update = update;
      }
      await collectRetainedStorage(f.gate);
      const restarted = createVillageRepository(() => ({ ...f.documents }));
      const saved = await restarted.readAuthority();
      if (failure === "before") assert.equal(saved.socialOutbox?.length, 0);
      else {
        const loaded = await createCapturedAdmissions({ ...f.documents }).readSocialEntry(
          saved.socialOutbox![0],
          scope.seed,
        );
        assert.equal(
          hash(loaded.admitted!.villagers[0].wishes[0]),
          expected,
          "Lost capture acknowledgement remains recoverable across restart and cleanup",
        );
      }
    }
    console.log(JSON.stringify({ workload: "native-capture-publication", events: 25_000, updates: 20, ...measured }));
  } finally {
    stop();
    await background.settleBackgroundWork();
    f.release();
    f.gate.dispose();
  }
}
