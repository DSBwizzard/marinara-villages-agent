import type { BackgroundInput } from "../models/background-model.js";
import type { ReturnCatchupCapture, VillageState } from "../models/world.js";

export function copyExchangeReceipts(receipts: VillageState["exchangeReceipts"]): VillageState["exchangeReceipts"] {
  return structuredClone(receipts);
}

/** Detached native facts for historical projection and asynchronous admission. */
export function cloneWorldContext<T>(value: T): T {
  return structuredClone(value);
}
export function cloneReturnCapture(capture: ReturnCatchupCapture): ReturnCatchupCapture {
  return structuredClone(capture);
}
export function cloneVillageContext(value: VillageState): VillageState {
  return structuredClone(value);
}
export function copyBackgroundWork(work: BackgroundInput): BackgroundInput {
  return structuredClone(work);
}
