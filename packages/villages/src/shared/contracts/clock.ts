export type VillageClockRecovery = { frozenAt: string; expectedAt: string; observedAt: string; differenceMs: number };
export type VillageClockRecord = {
  revision: number;
  trustedAt: string;
  recovery: VillageClockRecovery | null;
  replayUntilDate: string;
  shiftTotalMs?: number;
  advanceMs?: number;
  lastAdvance?: { actionId: string; milliseconds: number };
  /** Durable development-clock action identities, retained for replay protection. */
  advanceReceipts?: { actionId: string; milliseconds: number }[];
};
export type VillageClockView = {
  revision: number;
  timeZone: string;
  paused: boolean;
  canCheck?: boolean;
  recovery: VillageClockRecovery | null;
  instant?: string;
  advanceMs?: number;
  worldId?: string;
  lastAdvanceActionId?: string;
  /** Receipt for the action explicitly requested by a client after an uncertain response. */
  advanceReceipt?: { actionId: string; milliseconds: number };
};
export type VillageTimeAdvance = { worldId: string; revision: number; actionId: string; milliseconds: number };
