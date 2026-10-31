import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { BackgroundKind } from "../../domain/models/background-model.js";
import { memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { copySocialWishes } from "../../domain/rules/social-wishes.js";
import {
  capturedInputOwners,
  capturedWorldOwners,
  validateCapturedOwners,
  type CapturedAdmissionOwners,
} from "./captured-admissions.js";
import {
  relationshipPayloadStore,
  type RelationshipHead,
  type RelationshipScope,
} from "./relationship-payload-store.js";
import { wishHistoryFingerprint, wishHistoryStore, type WishHistoryScope } from "./wish-history.js";
import { withRepairWork } from "./repair-gate.js";

const owns = (value: object, key: string) => Object.hasOwn(value, key);
const emptyOwners = (): CapturedAdmissionOwners => ({ wishes: [], relationships: [] });
const sameScope = (a: RelationshipScope, b: RelationshipScope) => a.seed === b.seed && a.setupAt === b.setupAt;
const sameWish = (a: CapturedAdmissionOwners["wishes"][number], b: CapturedAdmissionOwners["wishes"][number]) =>
  sameScope(a.scope, b.scope) &&
  a.scope.actorId === b.scope.actorId &&
  a.capturedAt === b.capturedAt &&
  wishHistoryFingerprint(a.head, a.scope) === wishHistoryFingerprint(b.head, b.scope);

/** The caller keeps full repair admission from preparation through the actual owner CAS acknowledgement. */
export function createCapturedAdmissions(documents: CapabilityDocumentStore) {
  const wishes = wishHistoryStore(documents),
    relationships = relationshipPayloadStore(documents);

  async function prepare(
    work: (state: {
      admission(raw: any, seed: string, mail?: boolean): Promise<any>;
      relationship(value: any, scope: RelationshipScope): Promise<RelationshipHead | null>;
    }) => Promise<{ value: any; owners: CapturedAdmissionOwners }>,
    protectedOwners: CapturedAdmissionOwners,
  ) {
    const published = emptyOwners();
    async function relationship(value: any, scope: RelationshipScope): Promise<RelationshipHead | null> {
      if (value === undefined) return null;
      const token = relationships.fingerprint(value, scope),
        existing = protectedOwners.relationships.find(
          (owner) => sameScope(owner.scope, scope) && owner.head.id === token,
        );
      if (existing) return existing.head;
      const head = await relationships.prepare(value, scope);
      published.relationships.push({ scope, head });
      return head;
    }
    async function admission(raw: any, seed: string, mail = false): Promise<any> {
      memoryObject(raw);
      if (owns(raw, "admissionFormat")) return raw;
      memoryRequire(
        raw.seed === seed && typeof raw.setupAt === "string" && Array.isArray(raw.villagers),
        "captured admission has no World identity",
      );
      const scope = { seed, setupAt: raw.setupAt },
        villagers = [],
        ids = new Set<string>();
      for (const row of raw.villagers) {
        memoryObject(row);
        memoryObject(row.cardSnapshot);
        memoryRequire(
          typeof row.characterId === "string" &&
            row.characterId.length > 0 &&
            !ids.has(row.characterId) &&
            typeof row.cardSnapshot.capturedAt === "string" &&
            row.cardSnapshot.capturedAt.length > 0 &&
            Array.isArray(row.wishes) &&
            !owns(row, "wishHead"),
          "invalid captured resident",
        );
        ids.add(row.characterId);
        const ownerScope: WishHistoryScope = { ...scope, actorId: row.characterId },
          candidates = protectedOwners.wishes.filter(
            (owner) =>
              sameScope(owner.scope, scope) &&
              owner.scope.actorId === row.characterId &&
              owner.capturedAt === row.cardSnapshot.capturedAt,
          ),
          token = wishes.fingerprint(row.wishes, ownerScope),
          existing = candidates.find((owner) => wishHistoryFingerprint(owner.head, ownerScope) === token),
          head = existing
            ? existing.head
            : (await wishes.prepare(row.wishes, ownerScope, candidates[0]?.head ?? null)).head;
        if (!existing) published.wishes.push({ scope: ownerScope, capturedAt: row.cardSnapshot.capturedAt, head });
        villagers.push(
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => (key === "wishes" ? ["wishHead", head] : [key, value])),
          ),
        );
      }
      const { relationshipContext, ...facts } = raw;
      return {
        ...facts,
        admissionFormat: 1,
        villagers,
        ...(mail || owns(raw, "relationshipContext")
          ? { relationshipHead: await relationship(relationshipContext, scope) }
          : {}),
      };
    }
    const result = await work({ admission, relationship }),
      protectedWishes = [...protectedOwners.wishes, ...published.wishes],
      protectedRelationships = [...protectedOwners.relationships, ...published.relationships];
    // Only actual owners and successful publishers protect pages. A decoded cache cannot adopt an unowned reference.
    await validateCapturedOwners(documents, {
      wishes: result.owners.wishes.filter((owner) => !protectedWishes.some((known) => sameWish(owner, known))),
      relationships: result.owners.relationships.filter(
        (owner) =>
          !protectedRelationships.some(
            (known) => sameScope(owner.scope, known.scope) && owner.head.id === known.head.id,
          ),
      ),
    });
    return result.value;
  }

  async function prepareInput(
    kind: BackgroundKind,
    raw: any,
    seed: string,
    protectedOwners: CapturedAdmissionOwners,
  ): Promise<any> {
    if (!["resident-planning", "personal-mail", "social-recovery"].includes(kind)) return structuredClone(raw);
    return prepare(async (encode) => {
      memoryObject(raw);
      let value: any;
      if (kind === "personal-mail") value = { ...raw, admitted: await encode.admission(raw.admitted, seed, true) };
      else if (kind === "social-recovery") {
        const entry = await prepareEntry(raw.entry, seed, encode),
          { social, ...facts } = raw;
        value = {
          ...facts,
          entry,
          socialHead: owns(raw, "social") ? await encode.relationship(social, entry.admitted) : raw.socialHead,
        };
      } else {
        const admitted = await encode.admission(raw.admitted, seed);
        memoryObject(raw.context);
        memoryObject(raw.context.social);
        memoryRequire(Array.isArray(raw.context.residents), "invalid captured resident view");
        const residents = raw.context.residents.map((row: any) => {
          memoryObject(row);
          const owner = admitted.villagers.find((person: any) => person.characterId === row.characterId);
          memoryRequire(
            owner && row.capturedAt === owner.cardSnapshot.capturedAt,
            "captured resident view changed incarnation",
          );
          if (owns(row, "wishes"))
            memoryRequire(
              Array.isArray(row.wishes) &&
                wishes.fingerprint(row.wishes, { ...admitted, actorId: row.characterId }) ===
                  wishHistoryFingerprint(owner.wishHead, { ...admitted, actorId: row.characterId }),
              "captured resident view changed Wishes",
            );
          const { wishes: _wishes, ...facts } = row;
          return facts;
        });
        const { state, ...social } = raw.context.social;
        value = {
          ...raw,
          admitted,
          context: {
            ...raw.context,
            residents,
            social: {
              ...social,
              head: owns(raw.context.social, "state")
                ? await encode.relationship(state, admitted)
                : raw.context.social.head,
            },
          },
        };
      }
      const snapshot = structuredClone(value);
      return { value: snapshot, owners: capturedInputOwners(kind, snapshot, seed) };
    }, protectedOwners);
  }

  async function prepareEntry(raw: any, seed: string, encode: Parameters<Parameters<typeof prepare>[0]>[0]) {
    memoryObject(raw);
    const admitted = await encode.admission(raw.admitted, seed),
      { relationshipSnapshot, ...facts } = raw;
    return {
      ...facts,
      admitted,
      relationshipHead: owns(raw, "relationshipSnapshot")
        ? await encode.relationship(relationshipSnapshot, admitted)
        : raw.relationshipHead,
    };
  }
  async function prepareWorld(raw: any, protectedOwners: CapturedAdmissionOwners) {
    return prepare(async (encode) => {
      const value = {
        version: raw.version,
        seed: raw.seed,
        setupAt: raw.setupAt,
        ...(raw.socialOutbox === undefined
          ? {}
          : {
              socialOutbox: await Promise.all(raw.socialOutbox.map((row: any) => prepareEntry(row, raw.seed, encode))),
            }),
        ...(raw.socialMailOutbox === undefined
          ? {}
          : {
              socialMailOutbox: await Promise.all(
                raw.socialMailOutbox.map(async (row: any) => ({
                  ...row,
                  input: { ...row.input, admitted: await encode.admission(row.input.admitted, raw.seed, true) },
                })),
              ),
            }),
      };
      const snapshot = structuredClone(value),
        owners = capturedWorldOwners(snapshot);
      const { version: _version, seed: _seed, setupAt: _setupAt, ...outboxes } = snapshot;
      return { value: outboxes, owners };
    }, protectedOwners);
  }

  async function readAdmission(raw: any) {
    const villagers = await Promise.all(
      raw.villagers.map(async (row: any) => {
        const rows = copySocialWishes(await wishes.read(row.wishHead, { ...raw, actorId: row.characterId }));
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => (key === "wishHead" ? ["wishes", rows] : [key, value])),
        );
      }),
    );
    const { admissionFormat: _format, relationshipHead, ...facts } = raw;
    return {
      ...structuredClone(facts),
      villagers,
      ...(owns(raw, "relationshipHead")
        ? {
            relationshipContext: relationshipHead ? await relationships.readSnapshot(relationshipHead, raw) : undefined,
          }
        : {}),
    };
  }
  async function readEntry(raw: any) {
    const { relationshipHead, ...facts } = raw;
    return {
      ...structuredClone(facts),
      admitted: await readAdmission(raw.admitted),
      relationshipSnapshot: relationshipHead
        ? await relationships.readSnapshot(relationshipHead, raw.admitted)
        : undefined,
    };
  }
  async function readInput(kind: BackgroundKind, raw: any, seed: string): Promise<any> {
    raw = structuredClone(raw);
    return withRepairWork(async () => {
      capturedInputOwners(kind, raw, seed);
      if (kind === "personal-mail") return { ...structuredClone(raw), admitted: await readAdmission(raw.admitted) };
      if (kind === "social-recovery") {
        const { socialHead, ...facts } = raw;
        return {
          ...structuredClone(facts),
          entry: await readEntry(raw.entry),
          social: socialHead ? await relationships.readSnapshot(socialHead, raw.entry.admitted) : undefined,
        };
      }
      if (kind !== "resident-planning") return structuredClone(raw);
      const admitted = await readAdmission(raw.admitted),
        { head, ...social } = raw.context.social;
      return {
        ...structuredClone(raw),
        admitted,
        context: {
          ...structuredClone(raw.context),
          residents: raw.context.residents.map((row: any) => ({
            ...structuredClone(row),
            wishes: copySocialWishes(
              admitted.villagers.find((person: any) => person.characterId === row.characterId).wishes,
            ),
          })),
          social: {
            ...structuredClone(social),
            state: head ? await relationships.readSnapshot(head, admitted) : undefined,
          },
        },
      };
    });
  }
  return { prepareInput, prepareWorld, readInput };
}
