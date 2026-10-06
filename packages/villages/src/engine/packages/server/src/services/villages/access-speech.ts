import { asRecord } from "./coerce.js";
import type { InterpretationCheck } from "./system-interpretation.js";
import type { VillageState } from "./types.js";
import { managesAccess, readAccessCommand, zoneManagers } from "./venue-access.js";
import type { VenueLine } from "./venue-session.js";
import { createHash } from "node:crypto";

/** Exact metadata proposes a change. Current authorized speech and a grounded judge must confirm every field. */
export function accessManagementChecks(
  village: VillageState,
  draft: Pick<VenueLine, "speakerId" | "content" | "kind" | "heardBy">[],
  events: unknown,
  key: string,
): InterpretationCheck[] {
  return (Array.isArray(events) ? events.slice(0, 4) : []).flatMap((raw, index) => {
    const row = asRecord(raw),
      candidate = asRecord(row.command);
    if (
      row.kind !== "manage-access" ||
      !["venue-policy", "zone-policy", "lift-ban", "exception", "revoke", "destinations", "recover-managers"].includes(
        String(candidate.action),
      )
    )
      return [];
    const venue = village.venues.find((venue) => venue.id === row.venueId);
    if (!venue?.access || typeof row.actorId !== "string" || row.actorId === "player") return [];
    const recoverZone =
      candidate.action === "recover-managers" &&
      venue.zones?.find((zone) => zone.id === candidate.zoneId && zone.kind !== "exterior");
    const knownActors = ["player", ...village.villagers.map((person) => person.characterId)];
    if (
      candidate.action === "recover-managers"
        ? !recoverZone ||
          !managesAccess(venue, null, row.actorId) ||
          zoneManagers(venue, recoverZone).some((id) => knownActors.includes(id))
        : !managesAccess(venue, candidate.zoneId as string | null, row.actorId)
    )
      return [];
    if (!Array.isArray(row.evidence) || !row.evidence.length || row.evidence.length > 4) return [];
    const evidence = row.evidence.flatMap((segment) => {
      const line = Number.isInteger(segment) && draft[segment];
      return line &&
        line.speakerId === row.actorId &&
        line.kind !== "narration" &&
        line.kind !== "whisper" &&
        line.kind !== "side"
        ? [
            {
              id: `draft:${segment}`,
              speakerId: row.actorId,
              name: row.actorId,
              content: line.content,
              kind: line.kind,
              current: true,
            },
          ]
        : [];
    });
    if (evidence.length !== row.evidence.length) return [];
    const operationId = "access-speech:" + createHash("sha256").update(`${key}:${index}`).digest("hex");
    try {
      const command = readAccessCommand({ ...candidate, operationId, expectedRevision: venue.access.revision });
      return [
        {
          id: operationId,
          domain: "room" as const,
          question: "Did the authorized speaker explicitly establish this exact access-management change?",
          evidence,
          decisionEligible: false,
          decisionReason: "Exact policy changes require grounded field-by-field speech validation.",
          systemInstruction:
            "The command is a proposal, never evidence. Approve only if this speaker's current witnessed speech explicitly establishes EVERY changed rule, named person, scope, duration, ban or invitation reference. Compare against current policy. Silence and entry permission imply no management consent. Preserve omitted rules. Reject invented IDs, wider scope, relationship assumptions, hypothetical speech and stale references. Do not reveal the command or policy in your reason; return only a generic approval/rejection reason.",
          outcomes: [
            {
              id: "access-management",
              statement: "Current authorized speech establishes the exact proposed command and every changed field.",
            },
          ],
          // Only this actor's own managed scope is included; no contents or attendance.
          ...{
            facts: {
              actorId: row.actorId,
              venueId: venue.id,
              zoneId: command.zoneId,
              accessRevision: venue.access.revision,
              accessCommand: command,
              currentPolicy: command.zoneId
                ? venue.zones?.find((zone) => zone.id === command.zoneId)?.access
                : { managerIds: venue.access.managerIds, visitorHours: venue.access.visitorHours },
              references: {
                bans: venue.access.bans.filter(
                  (ban) =>
                    ban.zoneId === command.zoneId &&
                    (("banId" in command && command.banId === ban.id) ||
                      ("banIds" in command && command.banIds.includes(ban.id))),
                ),
                invitations: venue.access.permissions.filter(
                  (grant) => "permissionId" in command && command.permissionId === grant.id,
                ),
              },
            },
          },
        },
      ];
    } catch {
      return [];
    }
  });
}

/** Server-only writing context contains authority and policy, never hidden physical contents or positions. */
export function accessManagementPrompt(village: VillageState, actors: string[], venueId?: string): string {
  const scopes = village.venues
    .filter((venue) => venue.access && (!venueId || venue.id === venueId))
    .flatMap((venue) =>
      actors
        .filter((actor) => actor !== "player")
        .flatMap((actor) => {
          const venueManager = managesAccess(venue, null, actor);
          const zones =
            venue.zones
              ?.filter((zone) => zone.kind !== "exterior" && managesAccess(venue, zone.id, actor))
              .map((zone) => ({ id: zone.id, name: zone.name, policy: zone.access })) ?? [];
          if (!venueManager && !zones.length) return [];
          return [
            {
              actorId: actor,
              venueId: venue.id,
              venueName: venue.name,
              ...(venueManager
                ? { venuePolicy: { managerIds: venue.access!.managerIds, visitorHours: venue.access!.visitorHours } }
                : {}),
              zones,
              ...(venueManager
                ? {
                    recoverableZones:
                      venue.zones
                        ?.filter(
                          (zone) =>
                            zone.kind !== "exterior" &&
                            !zoneManagers(venue, zone).some((id) =>
                              ["player", ...village.villagers.map((person) => person.characterId)].includes(id),
                            ),
                        )
                        .map((zone) => ({ id: zone.id, name: zone.name })) ?? [],
                  }
                : {}),
              bans: venue.access!.bans.filter(
                (ban) =>
                  ban.active && (ban.zoneId === null ? venueManager : zones.some((zone) => zone.id === ban.zoneId)),
              ),
              invitations: venue.access!.permissions.filter(
                (grant) =>
                  !grant.revoked &&
                  (zones.some((zone) => zone.id === grant.zoneId) ||
                    (venueManager &&
                      venue.access!.bans.some(
                        (ban) => ban.active && ban.zoneId === null && ban.visitorId === grant.visitorId,
                      ))),
              ),
            },
          ];
        }),
    );
  return scopes.length
    ? `Access management available to current speakers (server-only): ${JSON.stringify(scopes)}. Emit a manage-access roomEvent only when actual current speech explicitly changes these rules. Use exact existing IDs. Never infer a policy change from admitting a guest, friendship or employment. Entrance is always Unrestricted.`
    : "";
}
