import { memoryRequire, memoryString } from "./memory-integrity.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";

export type SceneEffectResult = {
  id: string;
  independent?: true;
  requires: string[];
  failure?: string;
};

/** A dropped provisional command must not lend authority to the surviving fiction. */
export function resolveNarrationEffects<
  T extends {
    result: { held: boolean; rejected: { id: string; reason: string }[]; usableIds?: string[] };
    provisional: { effect: SceneEffectResult; sources: ContinuityEvidence[] }[];
  },
>(prepare: (excluded: Map<string, string>) => T): T {
  const excluded = new Map<string, string>(),
    visited = new Set<string>();
  for (;;) {
    const key = JSON.stringify([...excluded.keys()].toSorted());
    memoryRequire(!visited.has(key), "native proposals have incompatible authority dependencies");
    visited.add(key);
    const prepared = prepare(excluded),
      result = prepared.result;
    let restored = false;
    for (const id of excluded.keys()) {
      const retryExclusions = new Map(excluded);
      retryExclusions.delete(id);
      if (prepare(retryExclusions).result.usableIds?.includes(id)) {
        excluded.delete(id);
        restored = true;
        break;
      }
    }
    if (restored) continue;
    const dropped = prepared.provisional
      .filter(
        ({ effect }) =>
          effect.independent && result.rejected.some((row) => row.id === effect.id) && !excluded.has(effect.id),
      )
      .toSorted(
        (a, b) =>
          Math.max(-1, ...a.sources.map((source) => source.moment?.index ?? -1)) -
          Math.max(-1, ...b.sources.map((source) => source.moment?.index ?? -1)),
      )[0];
    if (dropped) {
      excluded.set(
        dropped.effect.id,
        result.rejected.find((row) => row.id === dropped.effect.id)?.reason ?? "Native effect was not selected.",
      );
      continue;
    }
    return prepared;
  }
}

/** Select a coherent subset before the existing Village CAS; no domain is inherently optional. */
export function selectSceneEffects(effects: SceneEffectResult[], assertedDependencies: string[]) {
  memoryRequire(effects.length <= 48, "too many Scene effects");
  const byId = new Map<string, SceneEffectResult>();
  for (const effect of effects) {
    memoryString(effect.id, 48);
    memoryRequire(!byId.has(effect.id), "duplicate Scene effect identity");
    memoryRequire(effect.requires.length <= 8, "too many Scene effect dependencies");
    byId.set(effect.id, effect);
  }
  const visiting = new Set<string>(),
    resolved = new Map<string, boolean>(),
    failures = new Map<string, string>();
  function usable(id: string): boolean {
    if (resolved.has(id)) return resolved.get(id)!;
    const effect = byId.get(id);
    if (!effect) {
      failures.set(id, "The required effect is missing.");
      return false;
    }
    if (visiting.has(id)) {
      failures.set(id, "The effect has circular dependencies.");
      return false;
    }
    visiting.add(id);
    const dependency = effect.requires.find((required) => !usable(required));
    visiting.delete(id);
    const ok = !effect.failure && dependency === undefined;
    if (!ok) failures.set(id, effect.failure ?? "Required effect " + dependency + " did not validate.");
    resolved.set(id, ok);
    return ok;
  }
  for (const effect of effects) usable(effect.id);
  const assertionFailed = assertedDependencies.some((id) => !usable(id));
  const held = assertionFailed || effects.some((effect) => !effect.independent && !resolved.get(effect.id));
  return {
    held,
    usableIds: effects.filter((effect) => resolved.get(effect.id)).map((effect) => effect.id),
    acceptedIds: held ? [] : effects.filter((effect) => resolved.get(effect.id)).map((effect) => effect.id),
    rejected: [...failures].map(([id, reason]) => ({ id, reason })),
  };
}
