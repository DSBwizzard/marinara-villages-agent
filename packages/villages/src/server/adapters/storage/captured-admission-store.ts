import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { BackgroundKind } from "../../domain/models/background-model.js";
import type { SocialMailInput, CapturedSocialMailInput } from "../../domain/models/social-mail.js";
import type {
  CapturedSocialOutboxEntry,
  SocialOutboxEntry,
  WorldSocialOutboxEntry,
} from "../../domain/models/social-outbox-model.js";
import { cloneWorldContext, copySocialOutboxEntry } from "../../domain/rules/world-context-copy.js";
import { memoryHash, memoryObject, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { copySocialWishes } from "../../domain/rules/social-wishes.js";
import {
  capturedInputOwners,
  capturedSocialOwners,
  capturedWorldOwners,
  validateCapturedOwners,
  type CapturedAdmissionOwners,
} from "./captured-admissions.js";
import {
  relationshipPayloadStore,
  relationshipWorldKey,
  readRelationshipHead,
  assertRelationshipWorld,
  type RelationshipHead,
  type RelationshipScope,
} from "./relationship-payload-store.js";
import { wishHistoryFingerprint, wishHistoryStore, type WishHistoryScope } from "./wish-history.js";
import { withRepairWork } from "./repair-gate.js";

const owns = (value: object, key: string) => Object.hasOwn(value, key);
const emptyOwners = (): CapturedAdmissionOwners => ({ wishes: [], relationships: [] });
const nativeAdmission = (raw: any) =>
  raw &&
  (owns(raw, "admissionFormat") ||
    owns(raw, "relationshipHead") ||
    (Array.isArray(raw.villagers) && raw.villagers.some((row: any) => row && owns(row, "wishHead"))));
const nativeSocial = (raw: WorldSocialOutboxEntry): raw is CapturedSocialOutboxEntry =>
  owns(raw, "relationshipHead") || nativeAdmission(raw.admitted);
const nativeMail = (raw: SocialMailInput | CapturedSocialMailInput): raw is CapturedSocialMailInput =>
  nativeAdmission(raw.admitted);
function requireLogicalAdmission(raw: any) {
  memoryRequire(
    raw && Array.isArray(raw.villagers) && raw.villagers.every((row: any) => Array.isArray(row.wishes)),
    "captured Wish context is unavailable",
  );
}
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
  function relationshipIdentity(raw: any, key: string, body: string, scope: RelationshipScope) {
    if (owns(raw, key)) {
      if (raw[key] === null) return "relationships-unavailable:" + relationshipWorldKey(scope);
      const head = readRelationshipHead(raw[key]);
      assertRelationshipWorld(head, scope);
      return head.id;
    }
    return relationships.fingerprint(raw[body], scope);
  }
  function admissionIdentity(raw: any, scope: RelationshipScope): string {
    if (!raw) return memoryHash(null);
    memoryRequire(
      raw.seed === scope.seed && raw.setupAt === scope.setupAt,
      "captured admission belongs to another World",
    );
    const {
      admissionFormat: _format,
      villagers,
      relationshipContext: _relationships,
      relationshipHead: _head,
      ...facts
    } = raw;
    return memoryHash({
      ...facts,
      villagers: villagers.map((row: any) => {
        const { wishes: rows, wishHead: head, ...facts } = row,
          owner = { ...scope, actorId: row.characterId };
        return {
          ...facts,
          wishes: owns(row, "wishHead") ? wishHistoryFingerprint(head, owner) : wishes.fingerprint(rows, owner),
        };
      }),
      relationships: relationshipIdentity(raw, "relationshipHead", "relationshipContext", scope),
    });
  }
  function socialIdentity(raw: WorldSocialOutboxEntry, scope: RelationshipScope): string {
    memoryRequire(raw.seed === scope.seed, "captured social source belongs to another World");
    if (nativeSocial(raw)) capturedSocialOwners(raw, scope.seed);
    const { admitted, relationshipHead: _head, relationshipSnapshot: _body, ...facts } = raw;
    return memoryHash({
      ...facts,
      admitted: admissionIdentity(admitted, scope),
      relationships: relationshipIdentity(raw, "relationshipHead", "relationshipSnapshot", scope),
    });
  }

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

  async function prepareEntry(
    raw: WorldSocialOutboxEntry,
    seed: string,
    encode: Parameters<Parameters<typeof prepare>[0]>[0],
  ): Promise<CapturedSocialOutboxEntry> {
    memoryObject(raw);
    if (nativeSocial(raw)) {
      capturedSocialOwners(raw, seed);
      return raw;
    }
    const admitted = await encode.admission(raw.admitted, seed),
      { relationshipSnapshot, relationshipHead: _head, ...facts } = raw;
    const head: RelationshipHead | null = await encode.relationship(relationshipSnapshot, admitted);
    const value: CapturedSocialOutboxEntry = {
      ...facts,
      admitted,
      relationshipHead: head,
    };
    return value;
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
  async function decodeEntry(raw: any) {
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
          entry: await decodeEntry(raw.entry),
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
  async function readSocialEntry(raw: WorldSocialOutboxEntry, seed: string): Promise<SocialOutboxEntry> {
    memoryRequire(raw.seed === seed, "captured social source belongs to another World");
    if (!nativeSocial(raw)) {
      requireLogicalAdmission(raw.admitted);
      return copySocialOutboxEntry(raw);
    }
    const snapshot = structuredClone(raw);
    return withRepairWork(async () => {
      capturedSocialOwners(snapshot, seed);
      return decodeEntry(snapshot);
    });
  }
  async function readMailInput(raw: SocialMailInput | CapturedSocialMailInput, seed: string): Promise<SocialMailInput> {
    memoryRequire(raw.seed === seed, "captured mail source belongs to another World");
    if (!nativeMail(raw)) {
      requireLogicalAdmission(raw.admitted);
      return { ...structuredClone({ ...raw, admitted: undefined }), admitted: cloneWorldContext(raw.admitted) };
    }
    return readInput("personal-mail", raw, seed);
  }
  return { prepareInput, prepareWorld, readInput, readSocialEntry, readMailInput, socialIdentity };
}
export type CapturedAdmissionStore = ReturnType<typeof createCapturedAdmissions>;
