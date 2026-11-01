import { createHash } from "node:crypto";
import { z } from "zod";
import type {
  RelationshipEvidenceLine,
  RelationshipReview,
  RelationshipUpdate,
  SocialRecord,
  SocialIntention,
  RelationshipState,
} from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { relationshipFor } from "./relationship-rules.js";
import { canInviteToZone, canRevokeZonePermission, resolveVenueZone } from "./venue-zones.js";

export const emptyRelationshipReview = (): RelationshipReview => ({
  changes: [],
  permissions: [],
  disclosures: [],
  intentions: [],
});
export const RELATIONSHIP_PERMISSION_INSTRUCTION =
  'Permissions use {controllerId,visitorId,venueId,zoneId,action:"grant|revoke",lineIds:[]}. Require explicit controller communication granting standing permission for this exact visitor and Zone. A visit is not standing permission; guest access conveys no authority.';
export const RELATIONSHIP_REVIEW_INSTRUCTION = `Return relationshipReview:{changes:[],permissions:[],disclosures:[],intentions:[]}, at most 16 total entries. Interpret meaning, never scores, thresholds or automatic decay. An empty result is valid. Never invent player feelings, intentions, actions or consent. Within relationshipReview, player is never a perspective/disclosure fromId or an intention actorId, even to record their explicit words. Those words are evidence for a witnessing resident's perspective; they may also leave it unchanged. Only resident IDs own perspectives, disclosures and intentions. Other domains may record the player's exact witnessed consent under their own contracts.
Changes use {fromId,toId,expectedRevision,sceneAfter,liveAfter,reason,lineIds:[]}. fromId is a resident who witnessed ALL citations. One change per directional pair. Each after projection is {connection:"short label, max400",stance:"private perspective, max600",expectations:["max400 each"],concerns:["max400 each"],records:[]}. Records are upserts {id:"existing ID or empty for new",expectedRevision:0,kind:"history|declaration|boundary|agreement|commitment",text:"max400",participants:[],status:"stated|proposed|accepted|fulfilled|cancelled|overdue",dueAt?:"explicit agreed ISO real-time deadline"}. Server supplies evidence IDs.
Keep authored history distinct from beliefs, unilateral declarations/boundaries, mutual agreements and concrete commitments. History has status stated and never a deadline. Acceptance requires explicit assent by all participants; an existing authored partnership is history, not invented consent. Either resident may refuse, withdraw or end a bond. Reconciliation is possible, never automatic. Claims/promises are not fulfilled physical deeds. Silence, elapsed time or an unaccepted invitation creates no obligation.
Preserve meaningful changes in a resident's trust, expectations or concerns from what they witnessed, including when they ask for clarification or defer a decision about the bond. Uncertainty about someone's motive does not by itself mean the resident's private perspective stayed unchanged. Keep that uncertainty in the perspective; do not force a bond ending or reconciliation.
sceneAfter continues the captured Scene plus its settled events ONLY. liveAfter interprets this SAME event against the supplied current live revision; preserve later history, endings, boundaries and active terms. Do not replay intervening time, resurrect an ended partnership or introduce a retroactive appointment. Leave incompatible terms unresolved and request clarification in dialogue. No arithmetic rebasing.
Disclosures use {fromId,toId,text,kind:"explanation|preference|boundary|routine|history|connection|home|work",lineIds:[]}. Only explicitly communicated information heard by the player belongs in their notebook; attribute claims. No private stance or intention leaks. A connection disclosure is the speaker's expressed relationship, not the player's feelings. Independently record newly heard relationship information even when no perspective changes and that fact already exists in private history. fromId is the speaker; toId is the person they describe, not automatically the listener. Use home or work only for an explicit current claim by the speaker about their own home or workplace, with toId equal to fromId. Attribute the claim; never infer it from private context, a visit, schedule, intention, access permission, hypothetical or past location. Keep text at most 240 characters. For long cited lines, additionally supply excerpts:["one or two exact supporting quotes, each <=320 UTF-8 bytes"] for native Memory evidence. Do not duplicate already learned information or emit this same disclosure in memoryChanges; disclosures are published into native Memories by code.
Intentions use {actorId,expectedRevision,lineIds:[],sceneItems:[],items:[{id:"existing ID or empty",targetIds:[],text:"max400",reason:"max400",status:"active|retired|attempted"}]}. sceneItems continues the captured Scene; items settles the same event against current live intentions. Replace only that resident's intentions, at most three active; preserve meaningful unattempted intentions, retire or revise as appropriate. They may seek contact, offer opportunities, repair or refuse. Do not create a quest system. ${RELATIONSHIP_PERMISSION_INSTRUCTION}`;

export function socialReceiptId(sourceId: string, parts: unknown[]): string {
  return sourceId + ":relationship:" + createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 24);
}
const text = (max: number) => z.string().trim().min(1).max(max);
const updateSchema = z.object({
  connection: z.string().max(400),
  stance: z.string().max(600),
  expectations: z.array(text(400)).max(8),
  concerns: z.array(text(400)).max(8),
  records: z
    .array(
      z.object({
        id: z.string(),
        kind: z.enum(["history", "declaration", "boundary", "agreement", "commitment"]),
        text: text(400),
        participants: z.array(text(200)).min(1).max(16),
        status: z.enum(["stated", "proposed", "accepted", "fulfilled", "cancelled", "overdue"]),
        expectedRevision: z.number().int().min(0),
        dueAt: z.string().datetime({ offset: true }).optional(),
      }),
    )
    .max(16),
});
/** Schema/source/identity validation. The model owns social interpretation. */
export function parseRelationshipReview(
  value: unknown,
  sourceId: string,
  lines: readonly RelationshipEvidenceLine[],
  village: VillageState,
  _semantic = false,
  sceneState?: RelationshipState,
  liveTimeline = false,
): RelationshipReview {
  const raw = asRecord(value),
    result = emptyRelationshipReview();
  if (!Array.isArray(raw.changes) || !Array.isArray(raw.permissions) || !Array.isArray(raw.disclosures))
    throw new Error("The social interpretation is incomplete.");
  const ids = new Set(["player", ...village.villagers.map((person) => person.characterId)]);
  const byId = new Map(lines.map((line) => [line.id, line]));
  const evidenceFor = (row: Record<string, unknown>, actorId: string) => {
    if (!Array.isArray(row.lineIds) || !row.lineIds.length) throw new Error("Social evidence is missing.");
    const evidence = [...new Set(row.lineIds)].map((id) => (typeof id === "string" ? byId.get(id) : undefined));
    if (evidence.some((line) => !line || !line.heardBy.includes(actorId)))
      throw new Error("Social evidence has a missing source or wrong audience.");
    return evidence as RelationshipEvidenceLine[];
  };
  const actor = (id: unknown, player = false): string => {
    if (typeof id !== "string" || !ids.has(id) || (!player && id === "player"))
      throw new Error("Invalid social actor.");
    return id;
  };
  for (const value of raw.changes) {
    const row = asRecord(value),
      fromId = actor(row.fromId),
      toId = actor(row.toId, true);
    if (fromId === toId || !Number.isInteger(row.expectedRevision) || Number(row.expectedRevision) < 0)
      throw new Error("Invalid social pair or revision.");
    const evidence = evidenceFor(row, fromId),
      lineIds = evidence.map((line) => line.id).sort();
    const id = socialReceiptId(sourceId, ["perspective", fromId, toId, lineIds]);
    if (liveTimeline && village.relationshipContext?.applied[id]) continue;
    const projection = (value: unknown, baseline = village.relationshipContext): RelationshipUpdate => {
      const parsed = updateSchema.parse(value);
      return {
        connection: parsed.connection!,
        stance: parsed.stance!,
        expectations: parsed.expectations!,
        concerns: parsed.concerns!,
        records: parsed.records.map((record) => {
          if (record.participants.some((id) => !ids.has(id)) || !record.participants.includes(fromId))
            throw new Error("Invalid participants in social record.");
          if (record.kind === "history" && (record.status !== "stated" || record.dueAt))
            throw new Error("History cannot become an obligation.");
          if (record.kind !== "commitment" && record.dueAt)
            throw new Error("Only a concrete commitment has a deadline.");
          const existing =
            baseline?.sharedRecords[record.id] ?? relationshipFor(baseline, fromId, toId).records[record.id];
          const sameTerms =
            existing &&
            existing.kind === record.kind &&
            existing.text === record.text &&
            existing.dueAt === record.dueAt &&
            JSON.stringify([...existing.participants].sort()) === JSON.stringify([...record.participants].sort());
          if (record.id && !existing) throw new Error("Unknown social record ID; use an empty ID for a new record.");
          if (existing && !sameTerms)
            throw new Error("Existing social terms are immutable; propose a new record to change them.");
          if ((existing?.revision ?? 0) !== record.expectedRevision) throw new Error("Social record revision changed.");
          if (
            record.status === "accepted" &&
            (!sameTerms || existing?.status !== "accepted") &&
            record.participants.some(
              (participant) =>
                !evidence.some((line) => line.speakerId === participant && line.kind !== "narration") ||
                evidence.some((line) =>
                  participant === "player" ? line.playerHeard === false : !line.heardBy.includes(participant),
                ),
            )
          )
            throw new Error("Mutual terms need each participant's explicit communication.");
          return {
            ...record,
            revision: record.expectedRevision + 1,
            id:
              record.id ||
              socialReceiptId(sourceId, ["record", record.kind, record.text, [...record.participants].sort()]),
            evidenceIds: lineIds,
          } as SocialRecord;
        }),
      };
    };
    result.changes.push({
      id,
      fromId,
      toId,
      expectedRevision: Number(row.expectedRevision),
      sceneAfter: projection(liveTimeline ? row.liveAfter : row.sceneAfter, sceneState),
      liveAfter: projection(row.liveAfter),
      reason: text(400).parse(row.reason),
      lineIds,
      evidence: evidence.map((line) => ({
        id: line.id,
        sourceId,
        speakerId: line.speakerId,
        content: line.content,
        heardBy: [...line.heardBy],
        hash: createHash("sha256").update(line.content).digest("hex"),
      })),
    });
  }
  for (const value of raw.permissions) {
    const row = asRecord(value),
      controllerId = actor(row.controllerId, true),
      visitorId = actor(row.visitorId, true);
    const venue = village.venues.find((place) => place.id === row.venueId),
      zone = venue && resolveVenueZone(venue, String(row.zoneId));
    if (
      controllerId === visitorId ||
      !venue ||
      !zone ||
      !["grant", "revoke"].includes(String(row.action)) ||
      !(row.action === "revoke"
        ? canRevokeZonePermission(venue, zone, controllerId)
        : canInviteToZone(venue, zone, controllerId))
    )
      throw new Error("Standing permission has no current controller or Zone.");
    const evidence = evidenceFor(row, controllerId),
      lineIds = evidence.map((line) => line.id).sort();
    if (!evidence.some((line) => line.speakerId === controllerId && line.kind !== "narration"))
      throw new Error("Standing permission requires controller communication.");
    result.permissions.push({
      id: socialReceiptId(sourceId, ["permission", controllerId, visitorId, venue.id, zone.id, row.action, lineIds]),
      controllerId,
      visitorId,
      venueId: venue.id,
      zoneId: zone.id,
      action: row.action as "grant" | "revoke",
      lineIds,
    });
  }
  for (const value of raw.disclosures) {
    const row = asRecord(value),
      fromId = actor(row.fromId),
      toId = actor(row.toId, true);
    const evidence = evidenceFor(row, fromId);
    if (
      evidence.some((line) => line.playerHeard === false) ||
      !evidence.some((line) => line.speakerId === fromId && line.kind !== "narration")
    )
      throw new Error("Notebook information requires the resident's own communication heard by the player.");
    const kind = z
      .enum(["explanation", "preference", "boundary", "routine", "history", "connection", "home", "work"])
      .parse(row.kind);
    if ((kind === "home" || kind === "work") && fromId !== toId)
      throw new Error("Home and work disclosures must describe the speaker.");
    const lineIds = evidence.map((line) => line.id).sort();
    result.disclosures.push({
      id: socialReceiptId(sourceId, ["disclosure", fromId, toId, kind, lineIds]),
      fromId,
      toId,
      kind,
      text: text(240).parse(row.text),
      lineIds,
      ...(Array.isArray(row.excerpts)
        ? { excerpts: row.excerpts.filter((quote): quote is string => typeof quote === "string") }
        : {}),
    });
  }
  if (raw.intentions !== undefined && !Array.isArray(raw.intentions)) throw new Error("Invalid social intentions.");
  for (const value of Array.isArray(raw.intentions) ? raw.intentions : []) {
    const row = asRecord(value),
      actorId = actor(row.actorId),
      evidence = evidenceFor(row, actorId);
    if (!Number.isInteger(row.expectedRevision) || Number(row.expectedRevision) < 0)
      throw new Error("Missing intention revision.");
    if (liveTimeline && village.relationshipContext?.applied[sourceId + ":intentions:" + actorId]) continue;
    const items = z
      .array(
        z.object({
          id: z.string(),
          targetIds: z.array(z.string()).max(16),
          text: text(400),
          reason: text(400),
          status: z.enum(["active", "retired", "attempted"]),
        }),
      )
      .max(3)
      .parse(row.items);
    if (items.some((item) => item.targetIds.some((id) => !ids.has(id)))) throw new Error("Invalid intention target.");
    result.intentions!.push({
      actorId,
      expectedRevision: Number(row.expectedRevision),
      evidence: evidence.map((line) => ({
        id: line.id,
        sourceId,
        speakerId: line.speakerId,
        content: line.content,
        heardBy: line.heardBy,
        hash: createHash("sha256").update(line.content).digest("hex"),
      })),
      sceneItems: [],
      items: items.map(
        (item) =>
          ({
            ...item,
            actorId,
            id: item.id || socialReceiptId(sourceId, ["intention", actorId, item.text]),
            evidenceIds: evidence.map((line) => line.id),
          }) as SocialIntention,
      ),
    });
    if (!liveTimeline && !Array.isArray(row.sceneItems))
      throw new Error("Missing captured Scene intention projection.");
    const sceneRaw = liveTimeline ? row.items : row.sceneItems;
    const liveItems = result.intentions!.at(-1)!.items;
    if (JSON.stringify(sceneRaw) === JSON.stringify(row.items))
      result.intentions!.at(-1)!.sceneItems = structuredClone(liveItems);
    else {
      const parsedScene = parseRelationshipReview(
        { ...emptyRelationshipReview(), intentions: [{ ...row, items: sceneRaw, sceneItems: sceneRaw }] },
        sourceId,
        lines,
        village,
        _semantic,
      );
      result.intentions!.at(-1)!.sceneItems = parsedScene.intentions![0]!.items;
    }
  }
  return result;
}
export type RelationshipProposalRejection = {
  kind: "changes" | "permissions" | "disclosures" | "intentions";
  index: number;
  reason: string;
};
/** Independent rows retain their own rejection evidence; authority publication still waits for settlement. */
export function parseRelationshipProposals(
  value: unknown,
  sourceId: string,
  lines: readonly RelationshipEvidenceLine[],
  village: VillageState,
  bind: (row: Record<string, unknown>, kind: RelationshipProposalRejection["kind"]) => Record<string, unknown> = (
    row,
  ) => row,
  semantic = false,
  sceneState?: RelationshipState,
  liveTimeline = false,
) {
  const raw = asRecord(value),
    review = emptyRelationshipReview(),
    rejections: RelationshipProposalRejection[] = [],
    seen = new Set<string>();
  const total = ["changes", "permissions", "disclosures", "intentions"].reduce(
    (n, key) => n + (Array.isArray(raw[key]) ? raw[key].length : 0),
    0,
  );
  if (total > 16) throw new Error("A social exchange exceeds 16 changes.");
  for (const kind of ["changes", "permissions", "disclosures", "intentions"] as const) {
    const rows = raw[kind] ?? (kind === "intentions" ? [] : undefined);
    if (!Array.isArray(rows)) throw new Error("Social proposals missing or incomplete.");
    rows.forEach((value, index) => {
      try {
        const parsed = parseRelationshipReview(
          { ...emptyRelationshipReview(), [kind]: [bind(asRecord(value), kind)] },
          sourceId,
          lines,
          village,
          semantic,
          sceneState,
          liveTimeline,
        );
        if ((kind === "changes" && !parsed.changes.length) || (kind === "intentions" && !parsed.intentions?.length))
          return;
        const key =
          kind === "intentions"
            ? parsed.intentions![0]!.actorId
            : kind === "changes"
              ? JSON.stringify([parsed.changes[0]!.fromId, parsed.changes[0]!.toId])
              : parsed[kind][0]!.id;
        if (seen.has(kind + key)) throw new Error("Repeated social proposal.");
        seen.add(kind + key);
        if (kind === "changes") review.changes.push(...parsed.changes);
        else if (kind === "permissions") review.permissions.push(...parsed.permissions);
        else if (kind === "disclosures") review.disclosures.push(...parsed.disclosures);
        else review.intentions!.push(...parsed.intentions!);
      } catch (error) {
        rejections.push({ kind, index, reason: String(error).replace(/^Error: /u, "") });
      }
    });
  }
  return { review, rejections };
}
