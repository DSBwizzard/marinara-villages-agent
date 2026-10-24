export type VillageClockRecovery = { frozenAt: string; expectedAt: string; observedAt: string; differenceMs: number };
export type VillageClockRecord = {
  revision: number;
  trustedAt: string;
  recovery: VillageClockRecovery | null;
  replayUntilDate: string;
  shiftTotalMs?: number;
  advanceMs?: number;
  lastAdvance?: { actionId: string; milliseconds: number };
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
};
export type VillageTimeAdvance = { worldId: string; revision: number; actionId: string; milliseconds: number };
