import { createActivationBinding } from "../engine/activation-scope.js";
import type { VillageClockView } from "../../../shared/contracts/clock.js";
export interface VillageClockAuthority {
  observe(): Promise<VillageClockView>;
  now(): Date;
  shiftMs?(): number;
  commit?<T>(work: () => Promise<T>, revision?: number): Promise<T>;
  resolve(revision: number, choice: "accept" | "check"): Promise<VillageClockView>;
}
const binding = createActivationBinding<VillageClockAuthority>("Village clock is not configured.");
export function configureVillageClock(authority: VillageClockAuthority) {
  return binding.configure(authority);
}
export function villageNow(): Date {
  return binding.maybe()?.now() ?? new Date();
}
export async function observeVillageClock() {
  return binding.maybe()?.observe();
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
