import { memoryRequire, memoryString } from "./memory-integrity.js";

export type SceneEffectResult = {
  id: string;
  independent?: true;
  requires: string[];
  failure?: string;
};

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
