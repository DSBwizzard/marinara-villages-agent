import { createActivationBinding } from "../engine/activation-scope.js";
import type { VillageClockView, VillageTimeAdvance } from "../../../shared/contracts/clock.js";
export interface VillageClockAuthority {
  observe(): Promise<VillageClockView>;
  now(advanceMs?: number): Date;
  shiftMs?(): number;
  commit?<T>(work: () => Promise<T>, revision?: number): Promise<T>;
  resolve(revision: number, choice: "accept" | "check"): Promise<VillageClockView>;
  advance?(request: VillageTimeAdvance): Promise<VillageClockView>;
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
export function advanceVillageClock(request: VillageTimeAdvance) {
  const clock = binding.get();
  if (!clock.advance) throw new Error("Time advancement is unavailable.");
  return clock.advance(request);
}
export function onVillageClockAdvance(listener: () => void): () => void {
  return binding.maybe()?.onAdvance?.(listener) ?? (() => {});
}
export function villageTimeAdvanceSettled(): void {
  binding.maybe()?.advanceSettled?.();
}
// Compatibility adapters for callers built around the former blocking recovery gate.
// Time changes no longer invalidate work, provider responses or storage commits.
export function clockAdministration<T>(callback: () => T): T {
  return callback();
}
export async function assertVillageClockWrite() {}
export async function withVillageClockWork<T>(callback: () => Promise<T>, _readOnly = false): Promise<T> {
  await observeVillageClock();
  return callback();
}
export async function guardedClockGeneration<T>(callback: () => Promise<T>): Promise<T> {
  return callback();
}
export async function resolveVillageClock(revision: number, choice: "accept" | "check") {
  return binding.get().resolve(revision, choice);
}
export async function withVillageClockCommit<T>(callback: () => Promise<T>): Promise<T> {
  return callback();
}
export function isVillageClockError(_error: unknown): boolean {
  return false;
}
export function villageClockShiftMs(): number {
  return binding.maybe()?.shiftMs?.() ?? 0;
}
