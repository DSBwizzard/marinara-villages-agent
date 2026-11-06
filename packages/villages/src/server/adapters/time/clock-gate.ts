import { createActivationBinding } from "../engine/activation-scope.js";
import { withRepairWork, assertRepairGeneration } from "../storage/repair-gate.js";
import type { VillageClockView, VillageTimeAdvance } from "../../../shared/contracts/clock.js";
import type { VillageState } from "../../domain/models/world.js";
export type ClockAdvanceEffect = (state: VillageState, from: Date, until: Date) => void;
export interface VillageClockAuthority {
  observe(): Promise<VillageClockView>;
  now(advanceMs?: number): Date;
  shiftMs?(): number;
  resolve(revision: number, choice: "accept" | "check"): Promise<VillageClockView>;
  advance?(request: VillageTimeAdvance, effect?: ClockAdvanceEffect): Promise<VillageClockView>;
  onAdvance?(listener: () => void): () => void;
  advanceSettled?(): void;
}
const binding = createActivationBinding<VillageClockAuthority>("Village clock is not configured.");
export function configureVillageClock(authority: VillageClockAuthority) {
  return binding.configure(authority);
}
export function villageNow(advanceMs?: number): Date {
  return binding.maybe()?.now(advanceMs) ?? new Date(Date.now() + (advanceMs ?? 0));
}
export async function observeVillageClock() {
  return binding.maybe()?.observe();
}
export function advanceVillageClock(request: VillageTimeAdvance, effect?: ClockAdvanceEffect) {
  const clock = binding.get();
  if (!clock.advance) throw new Error("Time advancement is unavailable.");
  return clock.advance(request, effect);
}
export function onVillageClockAdvance(listener: () => void): () => void {
  return binding.maybe()?.onAdvance?.(listener) ?? (() => {});
}
export function villageTimeAdvanceSettled(): void {
  binding.maybe()?.advanceSettled?.();
}
export async function withVillageClockWork<T>(callback: () => Promise<T>): Promise<T> {
  return withRepairWork(async () => {
    await observeVillageClock();
    return callback();
  });
}
export async function guardedClockGeneration<T>(callback: () => Promise<T>): Promise<T> {
  assertRepairGeneration();
  return withRepairWork(callback);
}
export async function resolveVillageClock(revision: number, choice: "accept" | "check") {
  return binding.get().resolve(revision, choice);
}
export function villageClockShiftMs(): number {
  return binding.maybe()?.shiftMs?.() ?? 0;
}
