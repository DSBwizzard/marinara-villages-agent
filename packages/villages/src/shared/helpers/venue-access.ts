/** Shared definitions only. The server is authoritative for every access decision. */
export type ZoneAccessMode = "public" | "permission-required";
export type VisitorHours = { days: string[]; start: string; end: string }[];
export type ZoneVisitorHours = "inherit" | "always" | VisitorHours;
export type ZoneAccessPolicy = {
  mode: ZoneAccessMode;
  /** null inherits the Venue managers; an explicit list has independent authority. */
  managerIds: string[] | null;
  memberIds: string[];
  memberRoles: ("residents" | "workers")[];
  inviterIds: string[];
  visitorHours: ZoneVisitorHours;
  accompanied: boolean;
};
export type AccessPermission = {
  id: string;
  zoneId: string;
  visitorId: string;
  issuerId: string;
  duration: "visit" | "standing" | "lodging";
  expiresAt?: string;
  /** Unclaimed future invitations bind to exactly one Scene on acceptance. */
  sceneId: string | null;
  excludedSceneId?: string;
  accompaniedBy: string | null;
  outsideHours: boolean;
  revoked: boolean;
  issuedAt: string;
  sourceLineIds: string[];
};
export type AccessBan = {
  id: string;
  zoneId: string | null;
  visitorId: string;
  issuerId: string;
  active: boolean;
  issuedAt: string;
  sourceLineIds: string[];
};
export type AccessException = {
  id: string;
  banIds: string[];
  permissionId: string;
  issuerId: string;
  issuedAt: string;
};
export type AccessChange = {
  id: string;
  revision: number;
  actorId: string;
  zoneId: string | null;
  action: string;
  at: string;
  sourceLineIds: string[];
};
export type VenueAccessState = {
  work?: import("./venue-work.js").VenueWork[];
  workOffers?: import("./venue-work.js").WorkOffer[];
  version: 1;
  revision: number;
  managerIds: string[];
  visitorHours: VisitorHours | null;
  permissions: AccessPermission[];
  bans: AccessBan[];
  exceptions: AccessException[];
  changes: AccessChange[];
  visitDenials: { zoneId: string; visitorId: string; sceneId: string; issuerId: string }[];
  receipts: Record<string, { fingerprint: string; revision: number; outcome?: "rejected" }>;
};
export type AccessReason =
  | "entrance"
  | "unavailable"
  | "banned"
  | "refused"
  | "outside-hours"
  | "member"
  | "public"
  | "invitation"
  | "accompaniment-required"
  | "permission-required";
export type TrespassReason = "permission-required" | "outside-hours" | "accompaniment-required";
export function isTrespassReason(reason: unknown): reason is TrespassReason {
  return reason === "permission-required" || reason === "outside-hours" || reason === "accompaniment-required";
}
export type ZoneAccessDecision = {
  allowed: boolean;
  available: boolean;
  mode: "unrestricted" | ZoneAccessMode;
  reason: AccessReason;
  explanation: string;
  canManage: boolean;
  canInvite: boolean;
  canRecover?: boolean;
  permissionId?: string;
  accompaniedBy?: string;
};
/** Explicit player projections. Never serialize the authoritative ledger. */
export type ZoneAccessView = {
  reachable?: boolean;
  routeBlocked?: boolean;
  accessNeededVia?: string;
  canTrespass?: boolean;
  companions?: { id: string; name: string; staying?: true; trespass?: true }[];
  nextOpening?: string;
  visitorHours?: Exclude<ZoneVisitorHours, "inherit">;
  canAllowAfterHours?: boolean;
  invitation?: {
    issuerId: string;
    duration: AccessPermission["duration"];
    future: boolean;
    accompanied: boolean;
    outsideHours: boolean;
  };
  decision: ZoneAccessDecision;
  policy?: ZoneAccessPolicy;
  permissions?: AccessPermission[];
  bans?: AccessBan[];
  changes?: AccessChange[];
};
export type VenueAccessView = {
  work?: import("./venue-work.js").VenueWork[];
  workOffers?: import("./venue-work.js").WorkOfferView[];
  revision: number;
  canManage: boolean;
  canRecover?: boolean;
  runnerIds?: string[];
  managerIds?: string[];
  visitorHours?: VisitorHours | null;
  bans?: AccessBan[];
  changes?: AccessChange[];
  exceptionInvitations?: Pick<AccessPermission, "id" | "zoneId" | "visitorId" | "duration">[];
};
export type AccessCommand = {
  operationId: string;
  expectedRevision: number;
  zoneId: string | null;
} & (
  | { action: "work-propose"; characterId: string; terms: import("./venue-work.js").VenueWork | null }
  | { action: "work-decide"; offerId: string; accept: boolean }
  | { action: "recover-managers"; managerIds: string[] }
  | { action: "venue-policy"; managerIds: string[]; visitorHours?: VisitorHours | null }
  | { action: "zone-policy"; policy: ZoneAccessPolicy }
  | {
      action: "invite";
      visitorId: string;
      duration: "visit" | "standing";
      accompanied: boolean;
      outsideHours: boolean;
      visitTiming?: "this" | "next";
      sceneId?: string;
    }
  | { action: "revoke"; permissionId: string }
  | { action: "refuse-entry" | "leave-now"; visitorId: string; sceneId?: string }
  | { action: "destinations"; visitorId: string; home?: string; sleep?: string; work?: string }
  | { action: "ban"; visitorId: string }
  | { action: "lift-ban"; banId: string }
  | { action: "exception"; permissionId: string; banIds: string[] }
);

/** Explicit schedules count only when their combined intervals cover every day. */
export function alwaysOpenVisitorHours(hours: VisitorHours | null): boolean {
  if (hours === null) return true;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const minute = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3));
  return days.every((day, index) => {
    const intervals: number[][] = [];
    for (const row of hours) {
      const start = minute(row.start),
        end = minute(row.end);
      if (row.days.includes(day)) intervals.push(start === end ? [0, 1440] : [start, start < end ? end : 1440]);
      if (start > end && row.days.includes(days[(index + 6) % 7]!)) intervals.push([0, end]);
    }
    let through = 0;
    for (const [start, end] of intervals.sort((a, b) => a[0]! - b[0]!)) {
      if (start! > through) return false;
      through = Math.max(through, end!);
    }
    return through === 1440;
  });
}

/** Older saved Zones retain their effective schedule when the editor removes inheritance. */
export function zoneVisitingHours(
  hours: ZoneVisitorHours | undefined,
  previousDefault: VisitorHours | null = null,
): Exclude<ZoneVisitorHours, "inherit"> {
  return hours === "inherit" ? (previousDefault ?? "always") : (hours ?? "always");
}
export function visitorHoursLabel(hours: ZoneVisitorHours | undefined): string {
  if (!Array.isArray(hours)) return "Any time";
  if (!hours.length) return "Closed";
  return hours
    .map((row) => {
      const names =
        row.days.length === 7
          ? "Every day"
          : row.days.length === 5 &&
              ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].every((day) => row.days.includes(day))
            ? "Weekdays"
            : row.days.map((day) => day.slice(0, 3)).join(", ");
      return names + ", " + row.start + "–" + row.end;
    })
    .join("; ");
}
