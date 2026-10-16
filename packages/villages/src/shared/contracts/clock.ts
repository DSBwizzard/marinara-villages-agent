export type VillageClockRecovery = { frozenAt: string; expectedAt: string; observedAt: string; differenceMs: number };
export type VillageClockRecord = {
  revision: number;
  trustedAt: string;
  recovery: VillageClockRecovery | null;
  replayUntilDate: string;
  shiftTotalMs?: number;
};
export type VillageClockView = {
  revision: number;
  timeZone: string;
  paused: boolean;
  canCheck?: boolean;
  recovery: VillageClockRecovery | null;
};
