import assert from "node:assert/strict";
import {
  capturedJobOwners,
  capturedWorldOwners,
} from "../packages/villages/src/server/adapters/storage/captured-admissions.js";
import { encodeWishHistory } from "../packages/villages/src/server/adapters/storage/wish-history.js";
import { relationshipWorldKey } from "../packages/villages/src/server/adapters/storage/relationship-payload-store.js";
import { fixtureWish, wishTime } from "./helpers/social-wishes-fixture.js";

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
  input: { entry: { seed: scope.seed, admitted: frame(), relationshipHead: original }, socialHead: review },
});
assert.deepEqual(
  recovery.relationships.map((owner) => owner.head),
  [original, review],
  "frozen and review projections remain distinct",
);
const world = {
  version: 13,
  ...scope,
  socialOutbox: [{ seed: scope.seed, admitted: frame(), relationshipHead: original }],
  socialMailOutbox: [{ input: { seed: scope.seed, admitted: { ...frame(), relationshipHead: sender } } }],
};
assert.deepEqual(
  capturedWorldOwners(world).relationships.map((owner) => owner.head),
  [original, sender],
);
assert.equal(capturedWorldOwners(world).wishes.length, 2);

for (const change of [
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
for (const change of [
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
assert.equal(capturedJobOwners({ ...job, input: { admitted: empty }, replacement: undefined }).wishes[0].head, null);
assert.deepEqual(capturedJobOwners({ ...job, input: { prose: JSON.stringify(world) }, replacement: undefined }), {
  wishes: [],
  relationships: [],
});
