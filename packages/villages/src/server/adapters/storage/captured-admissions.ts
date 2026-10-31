import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { BackgroundKind } from "../../domain/models/background-model.js";
import { wishResidentOwners, type WishHistoryHead, type WishHistoryScope } from "./wish-history.js";
import {
  assertRelationshipWorld,
  readRelationshipHead,
  type RelationshipHistoryOwner,
  type RelationshipScope,
} from "./relationship-payload-store.js";

export type CapturedAdmissionOwners = {
  wishes: { scope: WishHistoryScope; head: WishHistoryHead | null; capturedAt: string }[];
  relationships: RelationshipHistoryOwner[];
};
const emptyOwners = (): CapturedAdmissionOwners => ({ wishes: [], relationships: [] });
const owns = (value: object, key: string) => Object.hasOwn(value, key);

function relationship(raw: Record<string, any>, key: string, scope: RelationshipScope, into: CapturedAdmissionOwners) {
  if (!owns(raw, key)) return;
  if (raw[key] === null) return; // Unknown context is distinct from an encoded, known-empty relationship state.
  const head = readRelationshipHead(raw[key]);
  assertRelationshipWorld(head, scope);
  into.relationships.push({ scope, head });
}

function admission(raw: unknown, seed: string, into: CapturedAdmissionOwners): RelationshipScope {
  memoryObject(raw);
  memoryRequire(
    raw.admissionFormat === 1 &&
      raw.seed === seed &&
      typeof raw.setupAt === "string" &&
      !owns(raw, "relationshipContext"),
    "unsupported captured admission; start a fresh Village",
  );
  const scope = { seed, setupAt: raw.setupAt };
  for (const [index, owner] of wishResidentOwners(raw.villagers, scope).entries()) {
    const row = raw.villagers[index];
    memoryRequire(
      owns(row, "wishHead") && typeof row.cardSnapshot.capturedAt === "string",
      "invalid admitted Wish owner",
    );
    into.wishes.push({ scope: owner.scope, head: owner.head, capturedAt: row.cardSnapshot.capturedAt });
  }
  relationship(raw, "relationshipHead", scope, into);
  return scope;
}

function socialEntry(raw: unknown, seed: string, into: CapturedAdmissionOwners): RelationshipScope {
  memoryObject(raw);
  memoryRequire(raw.seed === seed && !owns(raw, "relationshipSnapshot"), "invalid captured social source");
  const scope = admission(raw.admitted, seed, into);
  relationship(raw, "relationshipHead", scope, into);
  return scope;
}

function input(kind: BackgroundKind, raw: unknown, seed: string, into: CapturedAdmissionOwners) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const value = raw as Record<string, any>,
    firstOwner = into.wishes.length;
  memoryRequire(!owns(value, "seed") || value.seed === seed, "captured input belongs to another World");
  if (owns(value, "admitted")) admission(value.admitted, seed, into);
  if (kind === "resident-planning" && value.context) {
    memoryObject(value.context);
    if (owns(value.context, "residents")) {
      memoryRequire(Array.isArray(value.context.residents), "invalid admitted resident view");
      const ids = new Set<string>(),
        directory = new Map(into.wishes.slice(firstOwner).map((owner) => [owner.scope.actorId, owner]));
      for (const row of value.context.residents) {
        memoryObject(row);
        const owner = directory.get(row.characterId);
        memoryRequire(
          !owns(row, "wishes") && !ids.has(row.characterId) && owner && row.capturedAt === owner.capturedAt,
          "admitted resident view changed incarnation",
        );
        ids.add(row.characterId);
      }
    }
    if (owns(value.context, "social")) {
      memoryObject(value.context.social);
      memoryRequire(
        !owns(value.context.social, "state") && owns(value.context.social, "head"),
        "inline captured social state",
      );
      memoryObject(value.admitted);
      relationship(value.context.social, "head", { seed, setupAt: value.admitted.setupAt }, into);
    }
  }
  if (kind === "social-recovery" && owns(value, "entry")) {
    const scope = socialEntry(value.entry, seed, into);
    memoryRequire(!owns(value, "social") && owns(value, "socialHead"), "inline social recovery baseline");
    relationship(value, "socialHead", scope, into);
  }
}

/** Closed paths only: prose and arbitrary saved objects cannot create history ownership. */
export function capturedJobOwners(raw: unknown): CapturedAdmissionOwners {
  memoryObject(raw);
  memoryRequire(raw.responseStorage === 3 && typeof raw.seed === "string", "unsupported captured background format");
  const into = emptyOwners();
  input(raw.kind, raw.input, raw.seed, into);
  if (owns(raw, "replacement") && raw.replacement !== undefined) {
    memoryObject(raw.replacement);
    memoryRequire(typeof raw.replacement.seed === "string", "invalid replacement capture scope");
    input(raw.replacement.kind, raw.replacement.input, raw.replacement.seed, into);
  }
  return into;
}

export function capturedWorldOwners(raw: unknown): CapturedAdmissionOwners {
  memoryObject(raw);
  memoryRequire(
    raw.version === 13 && typeof raw.seed === "string" && typeof raw.setupAt === "string",
    "unsupported captured World format",
  );
  const into = emptyOwners();
  if (owns(raw, "socialOutbox")) {
    memoryRequire(Array.isArray(raw.socialOutbox), "invalid captured social outbox");
    for (const row of raw.socialOutbox) {
      const scope = socialEntry(row, raw.seed, into);
      memoryRequire(scope.setupAt === raw.setupAt, "social capture belongs to another World setup");
    }
  }
  if (owns(raw, "socialMailOutbox")) {
    memoryRequire(Array.isArray(raw.socialMailOutbox), "invalid captured mail outbox");
    for (const row of raw.socialMailOutbox) {
      memoryObject(row);
      memoryObject(row.input);
      memoryRequire(row.input.seed === raw.seed, "captured mail belongs to another World");
      const scope = admission(row.input.admitted, raw.seed, into);
      memoryRequire(scope.setupAt === raw.setupAt, "mail capture belongs to another World setup");
    }
  }
  return into;
}
