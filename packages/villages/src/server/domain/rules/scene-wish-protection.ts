import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageWish } from "../models/world.js";
import { wishFingerprint } from "./wish-interpretation-rules.js";
import { wishExpired } from "./wish-definition.js";
import { unfinishedExchange } from "../decoding/exchange-codec.js";
import { pendingProgressTurns } from "./scene-record.js";
import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";

export type SceneWishProtection = {
  seed: string;
  wishes: { actorId: string; wishId: string; fingerprint: string }[];
};

export function readSceneWishProtections(value: unknown): Record<string, SceneWishProtection> {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw conflict("Saved Scene Wish protection is invalid. Recover it before advancing the Village.");
  const raw = asRecord(value);
  return Object.fromEntries(
    Object.entries(raw).map(([id, value]) => {
      const row = asRecord(value);
      if (
        !id ||
        typeof row.seed !== "string" ||
        !Array.isArray(row.wishes) ||
        row.wishes.some((value) => {
          const wish = asRecord(value);
          return ["actorId", "wishId", "fingerprint"].some((key) => typeof wish[key] !== "string" || !wish[key]);
        })
      )
        throw conflict("Saved Scene Wish protection is invalid. Recover it before advancing the Village.");
      return [id, structuredClone(row) as SceneWishProtection];
    }),
  );
}

/** Register under Village mutation before the first captured-context model request. */
export function protectSceneWishes(state: VillageState, scene: VenueScene, now: number): void {
  if (state.seed !== scene.villageSeed || scene.status === "closed") return;
  const protections = (state.sceneWishProtections ??= {});
  if (protections[scene.id]) return;
  const actors = new Set(scene.sceneAttendance?.occupants.map((row) => row.characterId) ?? scene.activeIds);
  protections[scene.id] = {
    seed: state.seed,
    wishes: state.villagers
      .filter((row) => actors.has(row.characterId))
      .flatMap((resident) =>
        (resident.agenda?.wishes ?? [])
          .filter((wish) => !wishExpired(wish, now))
          .map((wish) => ({
            actorId: resident.characterId,
            wishId: wish.id,
            fingerprint: wishFingerprint(wish),
          })),
      ),
  };
}

/** Expiry-only exception. Identity, retirement, evidence and stock still govern the outcome. */
export function sceneWishProtected(state: VillageState, actorId: string, wish: VillageWish, sceneId?: string): boolean {
  return Object.entries(state.sceneWishProtections ?? {}).some(
    ([id, protection]) =>
      (!sceneId || id === sceneId) &&
      protection.seed === state.seed &&
      protection.wishes.some(
        (row) => row.actorId === actorId && row.wishId === wish.id && row.fingerprint === wishFingerprint(wish),
      ),
  );
}

export function sceneWishProtectionFinished(scene: VenueScene, foundedAt: string): boolean {
  return (
    scene.status === "closed" &&
    !scene.submissions.some((turn) => turn.processing && unfinishedExchange(turn.processing)) &&
    !pendingProgressTurns(scene, foundedAt).some((turn) => !turn.processing)
  );
}

export function releaseSceneWishes(state: VillageState, scene: VenueScene): void {
  if (state.seed === scene.villageSeed && sceneWishProtectionFinished(scene, state.foundedAt))
    delete state.sceneWishProtections?.[scene.id];
}
