import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
  responseStorage: 3,
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
  responseStorage: 3,
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
