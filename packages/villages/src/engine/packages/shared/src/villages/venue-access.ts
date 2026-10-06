/** Shared definitions only. The server is authoritative for every access decision. */
export type ZoneAccessMode = "public" | "permission-required";
export type VisitorHours = { days: string[]; start: string; end: string }[];
export type ZoneVisitorHours = "inherit" | "always" | VisitorHours;
export type RegularVisitorRule = {
  inviterId: string;
  relationship: "friend" | "close";
  accompanied: boolean;
};
export type ZoneAccessPolicy = {
  mode: ZoneAccessMode;
  /** null inherits the Venue managers; an explicit list has independent authority. */
  managerIds: string[] | null;
  memberIds: string[];
  memberRoles: ("residents" | "workers")[];
  inviterIds: string[];
  regularVisitors: RegularVisitorRule[];
  visitorHours: ZoneVisitorHours;
  accompanied: boolean;
};
export type AccessPermission = {
  id: string;
  zoneId: string;
  visitorId: string;
  issuerId: string;
  duration: "visit" | "standing";
  /** Unclaimed future invitations bind to exactly one Scene on acceptance. */
  sceneId: string | null;
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
  version: 1;
  revision: number;
  managerIds: string[];
  visitorHours: VisitorHours | null;
  permissions: AccessPermission[];
  bans: AccessBan[];
  exceptions: AccessException[];
  changes: AccessChange[];
  visitDenials: { zoneId: string; visitorId: string; sceneId: string; issuerId: string }[];
  receipts: Record<string, { fingerprint: string; revision: number; outcome?: "applied" | "rejected" }>;
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
  | "regular-visitor"
  | "accompaniment-required"
  | "permission-required";
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
  decision: ZoneAccessDecision;
  policy?: ZoneAccessPolicy;
  permissions?: AccessPermission[];
  bans?: AccessBan[];
  changes?: AccessChange[];
};
export type VenueAccessView = {
  revision: number;
  canManage: boolean;
  canRecover?: boolean;
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
  | { action: "recover-managers"; managerIds: string[] }
  | { action: "venue-policy"; managerIds: string[]; visitorHours: VisitorHours | null }
  | { action: "zone-policy"; policy: ZoneAccessPolicy }
  | {
      action: "invite";
      visitorId: string;
      duration: "visit" | "standing";
      accompanied: boolean;
      outsideHours: boolean;
      sceneId?: string;
    }
  | { action: "revoke"; permissionId: string }
  | { action: "refuse-entry" | "leave-now"; visitorId: string; sceneId?: string }
  | { action: "destinations"; visitorId: string; home?: string; sleep?: string; work?: string }
  | { action: "ban"; visitorId: string }
  | { action: "lift-ban"; banId: string }
  | { action: "exception"; permissionId: string; banIds: string[] }
);
