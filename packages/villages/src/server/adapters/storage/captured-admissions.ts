import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { BackgroundKind } from "../../domain/models/background-model.js";
import { isBackgroundKind } from "../../domain/rules/work-recovery.js";
import {
  createWishHistoryTracer,
  wishResidentOwners,
  type WishHistoryHead,
  type WishHistoryScope,
} from "./wish-history.js";
import { MEMORY_PAGE_KIND, type MemoryPageData } from "./memory-pages.js";
import {
  assertRelationshipWorld,
  readRelationshipHead,
  validateRelationshipHistory,
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
      owns(row, "wishHead") &&
        typeof row.cardSnapshot.capturedAt === "string" &&
        row.cardSnapshot.capturedAt.length > 0,
      "invalid admitted Wish owner",
    );
    into.wishes.push({ scope: owner.scope, head: owner.head, capturedAt: row.cardSnapshot.capturedAt });
  }
  relationship(raw, "relationshipHead", scope, into);
  return scope;
}

function directory(raw: Record<string, any>): Map<string, string> {
  return new Map(raw.villagers.map((row: any) => [row.characterId, row.cardSnapshot.capturedAt]));
}
function actors(opportunity: unknown, stamps: Map<string, string>): string[] {
  memoryObject(opportunity);
  memoryRequire(
    Array.isArray(opportunity.actorIds) &&
      opportunity.actorIds.length > 0 &&
      new Set(opportunity.actorIds).size === opportunity.actorIds.length &&
      opportunity.actorIds.every((id: unknown) => typeof id === "string" && stamps.has(id)),
    "captured opportunity actor is unavailable",
  );
  return opportunity.actorIds;
}
function mail(raw: unknown, seed: string, into: CapturedAdmissionOwners): RelationshipScope {
  memoryObject(raw);
  memoryRequire(raw.seed === seed, "captured mail belongs to another World");
  const scope = admission(raw.admitted, seed, into),
    stamps = directory(raw.admitted);
  memoryRequire(
    typeof raw.residentId === "string" &&
      typeof raw.incarnation === "string" &&
      stamps.get(raw.residentId) === raw.incarnation &&
      owns(raw.admitted, "relationshipHead"),
    "captured mail recipient changed incarnation",
  );
  return scope;
}

function socialEntry(raw: unknown, seed: string, into: CapturedAdmissionOwners): RelationshipScope {
  memoryObject(raw);
  memoryRequire(
    raw.seed === seed && !owns(raw, "relationshipSnapshot") && owns(raw, "relationshipHead"),
    "invalid captured social source",
  );
  const scope = admission(raw.admitted, seed, into);
  actors(raw.opportunity, directory(raw.admitted));
  relationship(raw, "relationshipHead", scope, into);
  return scope;
}
export function capturedSocialOwners(raw: unknown, seed: string): CapturedAdmissionOwners {
  const into = emptyOwners();
  socialEntry(raw, seed, into);
  return into;
}

function input(kind: BackgroundKind, raw: unknown, seed: string, into: CapturedAdmissionOwners) {
  if (!["resident-planning", "personal-mail", "social-recovery"].includes(kind)) return;
  memoryObject(raw);
  const value = raw as Record<string, any>,
    firstOwner = into.wishes.length;
  memoryRequire(!owns(value, "seed") || value.seed === seed, "captured input belongs to another World");
  if (kind === "personal-mail") {
    mail(value, seed, into);
    return;
  }
  if (kind === "resident-planning") {
    admission(value.admitted, seed, into);
    memoryObject(value.context);
    memoryObject(value.actorIncarnations);
    const stamps = directory(value.admitted),
      active = actors(value.opportunity, stamps);
    memoryRequire(
      Object.entries(value.actorIncarnations).every(([id, stamp]) => stamps.get(id) === stamp) &&
        active.every((id) => owns(value.actorIncarnations, id)),
      "captured activity actor changed incarnation",
    );
    {
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
      memoryRequire(
        active.every((id) => ids.has(id)),
        "captured activity actor has no context",
      );
    }
    {
      memoryObject(value.context.social);
      memoryRequire(
        !owns(value.context.social, "state") && owns(value.context.social, "head"),
        "inline captured social state",
      );
      memoryObject(value.admitted);
      relationship(value.context.social, "head", { seed, setupAt: value.admitted.setupAt }, into);
    }
  }
  if (kind === "social-recovery") {
    const scope = socialEntry(value.entry, seed, into);
    memoryRequire(!owns(value, "social") && owns(value, "socialHead"), "inline social recovery baseline");
    relationship(value, "socialHead", scope, into);
  }
}
export function capturedInputOwners(kind: BackgroundKind, raw: unknown, seed: string): CapturedAdmissionOwners {
  const into = emptyOwners();
  input(kind, raw, seed, into);
  return into;
}

/** Closed paths only: prose and arbitrary saved objects cannot create history ownership. */
export function capturedJobOwners(raw: unknown): CapturedAdmissionOwners {
  memoryObject(raw);
  memoryRequire(
    raw.responseStorage === 3 && typeof raw.seed === "string" && isBackgroundKind(raw.kind),
    "unsupported captured background format",
  );
  const into = emptyOwners();
  if (raw.input === null) {
    memoryRequire(
      ["completed", "obsolete"].includes(raw.status) &&
        Array.isArray(raw.steps) &&
        raw.steps.length === 0 &&
        raw.hasResult === false &&
        raw.result === undefined &&
        !raw.partialResult &&
        (raw.optionalAttempts === undefined ||
          (typeof raw.optionalAttempts === "object" &&
            raw.optionalAttempts !== null &&
            !Array.isArray(raw.optionalAttempts) &&
            Object.keys(raw.optionalAttempts).length === 0)),
      "unfinished background capture was released",
    );
  } else input(raw.kind, raw.input, raw.seed, into);
  if (owns(raw, "replacement") && raw.replacement !== undefined) {
    memoryObject(raw.replacement);
    memoryRequire(
      typeof raw.replacement.seed === "string" && isBackgroundKind(raw.replacement.kind),
      "invalid replacement capture scope",
    );
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
      const scope = mail(row.input, raw.seed, into);
      memoryRequire(scope.setupAt === raw.setupAt, "mail capture belongs to another World setup");
    }
  }
  return into;
}
import type { CapabilityDocumentStore } from "@marinara-engine/shared";

/** Validate the complete declared graph before adopting references or releasing unowned storage. */
export async function validateCapturedOwners(
  documents: Pick<CapabilityDocumentStore, "getById">,
  owners: CapturedAdmissionOwners,
): Promise<Set<string>> {
  const retained = new Set<string>();
  const get: CapabilityDocumentStore["getById"] = async (packageId, id) => {
    const row = await documents.getById(packageId, id);
    if (row) retained.add(row.id);
    return row;
  };
  const wishes = createWishHistoryTracer(async (id) => {
    const row = await get("villages", id);
    memoryRequire(
      row?.id === id && row.packageId === "villages" && row.kind === MEMORY_PAGE_KIND && row.revision === 1,
      "captured Wish history is missing or changed",
    );
    return row.data as MemoryPageData;
  });
  for (const owner of owners.wishes) await wishes.trace(owner.head, owner.scope);
  await validateRelationshipHistory({ getById: get }, owners.relationships);
  return retained;
}
